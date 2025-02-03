import { withAuth } from '../../../utils/authMiddleware';
import { saveMessageToConversation, getConversation, connectToDatabase } from '../../../utils/mongodb';
import { analyzeMessage } from '../../../utils/conversationAnalyzer';
import { executeAction } from '../../../utils/actionHandlers';
import { ObjectId } from 'mongodb';

export default withAuth(async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { conversationId } = req.query;

  try {
    const conversation = await getConversation(conversationId);
    
    if (!conversation || conversation.userId.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    // Debug logging
    console.log('Current user:', {
      id: req.user._id,
      balance: req.user.balance
    });

    const { message, confirmationResponse } = req.body;

    // If this is a confirmation response, handle it differently
    if (confirmationResponse) {
      const isConfirmed = message === 'confirm';
      
      // Get the pending action from conversation
      const pendingAction = conversation.pendingAction;

      // Only handle confirmation/cancellation if there's actually a pending action
      if (!pendingAction) {
        return res.status(200).json({
          message: "No pending action to confirm or cancel.",
          action: { type: 'None' }
        });
      }
      
      if (isConfirmed) {
        try {
          const { db } = await connectToDatabase();
          const actionResult = await executeAction(
            pendingAction.type,
            req.user._id.toString(),
            pendingAction.data
          );

          // Clear the pending action
          await db.collection('conversations').updateOne(
            { _id: new ObjectId(conversationId) },
            { 
              $unset: { pendingAction: "" },
              $set: { updatedAt: new Date() }
            }
          );

          // Save only one message with the result
          await saveMessageToConversation(conversation._id, {
            role: 'system',
            content: `Confirmed: Balance updated from ${actionResult.balance - pendingAction.data.amount} to ${actionResult.balance} coins`,
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
            message: "Is there anything else I can help you with?",
            action: {
              ...pendingAction,
              status: 'completed'
            },
            actionResult
          });
        } catch (error) {
          console.error('Action execution error:', error);
          return res.status(400).json({ message: error.message });
        }
      } else {
        // For cancellation, also clear the pending action
        const { db } = await connectToDatabase();
        await db.collection('conversations').updateOne(
          { _id: new ObjectId(conversationId) },
          { $unset: { pendingAction: "" } }
        );

        // Handle cancellation
        await saveMessageToConversation(conversation._id, {
          role: 'assistant',
          content: "Action cancelled. Is there anything else I can help you with?",
          analysis: {
            action: { type: 'None' },
            actionExecuted: false,
            actionResult: null
          }
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

        // Save the pending action to the conversation document
        const { db } = await connectToDatabase();
        await db.collection('conversations').updateOne(
          { _id: new ObjectId(conversationId) },
          { 
            $set: { 
              pendingAction: analysis.action,
              updatedAt: new Date()
            }
          }
        );

        analysis.chatResponse = `Would you like me to ${
          analysis.action.type === 'updateBalance'
            ? `add ${analysis.action.data.amount} coins to your balance`
            : analysis.action.type === 'createListing'
            ? `create a listing for "${analysis.action.data.title}" at ${analysis.action.data.price} coins`
            : 'perform this action'
        }? Please confirm.`;
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

    // Return response with action status
    res.status(200).json({
      message: analysis.chatResponse,
      action: analysis.action,
      actionResult
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ message: error.message });
  }
}); 