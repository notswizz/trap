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

    const { message, confirmationResponse, pendingAction } = req.body;

    // If this is a confirmation response, handle it
    if (confirmationResponse) {
      const isConfirmed = message === 'confirm';
      
      // Get the pending action from the request body or conversation
      const actionToExecute = pendingAction || conversation.pendingAction;

      if (!actionToExecute) {
        return res.status(200).json({
          message: "No pending action to confirm or cancel.",
          action: { type: 'None' }
        });
      }
      
      if (isConfirmed) {
        try {
          const { db } = await connectToDatabase();

          // Execute the action with the original pending action data
          const actionResult = await executeAction(
            actionToExecute.type,
            req.user._id.toString(),
            actionToExecute.data
          );

          // Clear the pending action
          await db.collection('conversations').updateOne(
            { _id: new ObjectId(conversationId) },
            { 
              $unset: { pendingAction: "" },
              $set: { updatedAt: new Date() }
            }
          );

          // Save the confirmation message
          await saveMessageToConversation(conversation._id, {
            role: 'system',
            content: `Action confirmed: ${actionToExecute.type}`,
            isAction: true,
            analysis: {
              action: {
                ...actionToExecute,
                status: 'completed'
              },
              actionExecuted: true,
              actionResult
            }
          });

          return res.status(200).json({
            message: "Action completed successfully. Is there anything else I can help you with?",
            action: {
              ...actionToExecute,
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
        const { db } = await connectToDatabase();
        await db.collection('conversations').updateOne(
          { _id: new ObjectId(conversationId) },
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
      content: { text: message.trim() },
      timestamp: new Date(),
      user: {
        username: req.user.username,
        displayName: req.user.displayName
      }
    });

    // Analyze with minimal context
    const analysis = await analyzeMessage(
      typeof message === 'object' ? message.text : message,
      {
        ...conversation,
        messages: conversation.messages.map(msg => ({
          ...msg,
          content: typeof msg.content === 'object' ? msg.content.text : msg.content
        })).slice(-5)
      },
      req.user
    );

    // Execute action if needed
    let actionResult = null;
    if (analysis?.action) {
      if (analysis.action.type !== 'None') {
        // Check if this is an immediate action (like fetchNotifications or fetchListings)
        const isImmediateAction = ['fetchNotifications', 'fetchListings'].includes(analysis.action.type);
        
        if (isImmediateAction) {
          // Execute immediate actions right away
          try {
            console.log('Executing immediate action:', analysis.action.type);
            actionResult = await executeAction(
              analysis.action.type,
              req.user._id.toString(),
              analysis.action.data
            );
            console.log('Action result:', actionResult);
            analysis.action.status = 'completed';

            // For notifications, update the chat response to include count
            if (analysis.action.type === 'fetchNotifications') {
              const notifications = actionResult?.notifications || [];
              analysis.chatResponse = notifications.length > 0 
                ? `Here are your recent transactions (${notifications.length} total):`
                : 'No transactions found';
            }
          } catch (error) {
            console.error('Immediate action execution error:', error);
            return res.status(400).json({ 
              message: error.message,
              error: true
            });
          }
        } else {
          // Set non-immediate actions as pending and ask for confirmation
          analysis.action = {
            ...analysis.action,
            status: 'pending'
          };

          // Save the pending action
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
        }
      }
    }

    // Save AI response with action result
    const aiMessage = {
      role: 'assistant',
      content: { 
        text: analysis.chatResponse,
        actionResult: actionResult
      },
      timestamp: new Date(),
      user: {
        username: req.user.username,
        displayName: req.user.displayName
      }
    };

    // Add analysis and notifications if they exist
    if (analysis.action) {
      aiMessage.analysis = {
        action: {
          ...analysis.action,
          status: actionResult ? 'completed' : analysis.action.status
        },
        actionExecuted: !!actionResult,
        actionResult: actionResult
      };
    }

    console.log('Saving AI message:', JSON.stringify(aiMessage, null, 2));
    await saveMessageToConversation(conversation._id, aiMessage);

    // Return response with action status and result
    const response = {
      message: analysis.chatResponse,
      action: analysis.action,
      actionResult,
      actionExecuted: !!actionResult,
      user: {
        username: req.user.username,
        displayName: req.user.displayName
      }
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ message: error.message });
  }
}); 