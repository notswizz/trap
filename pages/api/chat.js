import { withAuth } from '../../utils/authMiddleware';
import { saveMessageToConversation, getConversation, connectToDatabase } from '../../utils/mongodb';
import { analyzeMessage } from '../../utils/conversationAnalyzer';
import { executeAction } from '../../utils/actionHandlers';
import { ObjectId } from 'mongodb';

export default withAuth(async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { message, confirmationResponse, pendingAction } = req.body;
    const userId = req.user._id;

    // Get or create conversation
    const { db } = await connectToDatabase();
    let conversation = await db.collection('conversations')
      .findOne({ userId: new ObjectId(userId) }, { sort: { updatedAt: -1 } });

    if (!conversation) {
      conversation = {
        userId: new ObjectId(userId),
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      await db.collection('conversations').insertOne(conversation);
    }

    // If this is a confirmation response, handle it
    if (confirmationResponse) {
      const isConfirmed = message === 'confirm';
      
      if (!pendingAction) {
        return res.status(200).json({
          message: "No pending action to confirm or cancel.",
          action: { type: 'None' }
        });
      }
      
      if (isConfirmed) {
        try {
          // Execute the action with the original pending action data
          const actionResult = await executeAction(
            pendingAction.type,
            req.user._id.toString(),
            pendingAction.data
          );

          // Clear the pending action
          await db.collection('conversations').updateOne(
            { _id: conversation._id },
            { 
              $unset: { pendingAction: "" },
              $set: { updatedAt: new Date() }
            }
          );

          // Save the confirmation message
          await saveMessageToConversation(conversation._id, {
            role: 'system',
            content: `Action confirmed: ${pendingAction.type}`,
            isAction: true,
            analysis: {
              action: {
                ...pendingAction,
                status: 'completed'
              },
              actionExecuted: true,
              actionResult
            }
          });

          return res.status(200).json({
            message: "Action completed successfully. Is there anything else I can help you with?",
            action: {
              ...pendingAction,
              status: 'completed'
            },
            actionResult
          });
        } catch (error) {
          console.error('Action execution error:', error);
          
          // Save the error message
          await saveMessageToConversation(conversation._id, {
            role: 'system',
            content: `Error: ${error.message}`,
            isError: true
          });
          
          return res.status(400).json({ 
            message: error.message,
            error: true
          });
        }
      } else {
        // For cancellation, clear the pending action
        await db.collection('conversations').updateOne(
          { _id: conversation._id },
          { $unset: { pendingAction: "" } }
        );

        // Save cancellation message
        await saveMessageToConversation(conversation._id, {
          role: 'system',
          content: "Action cancelled",
          isAction: true
        });

        return res.status(200).json({
          message: "Action cancelled. Is there anything else I can help you with?",
          action: { type: 'None' }
        });
      }
    }

    // Save user message
    await saveMessageToConversation(conversation._id, {
      role: 'user',
      content: message.trim(),
      timestamp: new Date()
    });

    // Analyze with minimal context
    const analysis = await analyzeMessage(
      message,
      {
        ...conversation,
        messages: conversation.messages.slice(-5)
      },
      req.user
    );

    // Execute action if needed
    let actionResult = null;
    if (analysis?.action) {
      if (analysis.action.type !== 'None') {
        // Set action as pending and ask for confirmation
        analysis.action = {
          ...analysis.action,
          status: 'pending'
        };

        // Save the pending action
        await db.collection('conversations').updateOne(
          { _id: conversation._id },
          { 
            $set: { 
              pendingAction: analysis.action,
              updatedAt: new Date()
            }
          }
        );
      }
    }

    // Save AI response
    await saveMessageToConversation(conversation._id, {
      role: 'assistant',
      content: analysis.chatResponse,
      analysis: analysis.action ? {
        action: analysis.action,
        actionExecuted: !!actionResult,
        actionResult
      } : null
    });

    res.status(200).json({
      message: analysis.chatResponse,
      action: analysis.action,
      actionResult,
      user: req.user
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ message: error.message });
  }
}); 