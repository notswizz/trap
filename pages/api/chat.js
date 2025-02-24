import { withAuth } from '../../utils/authMiddleware';
import { saveMessageToConversation, getConversation, connectToDatabase, closeDatabaseConnection } from '../../utils/mongodb';
import { analyzeMessage } from '../../utils/conversationAnalyzer';
import { executeAction } from '../../utils/actionHandlers';
import { ObjectId } from 'mongodb';

function logError(context, error) {
  const timestamp = new Date().toISOString();
  const red = "\x1b[31m";
  const reset = "\x1b[0m";
  const message = error && error.message ? error.message : String(error);
  console.error(`${red}[${timestamp}] [ERROR - ${context}] ${message}${reset}`);
  if (error && error.stack) {
    console.error(error.stack);
  }
}

export default withAuth(async function handler(req, res) {
  let client = null;
  
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ message: 'Method not allowed' });
    }

    const { message, confirmationResponse, pendingAction } = req.body;
    const userId = req.user._id;

    // Get database connection
    const { client: dbClient, db } = await connectToDatabase();
    client = dbClient;

    // Get or create conversation using a single database call with upsert
    const conversationResult = await db.collection('conversations').findOneAndUpdate(
      { userId: new ObjectId(userId) },
      {
        $set: { updatedAt: new Date() },
        $setOnInsert: { 
          userId: new ObjectId(userId), 
          messages: [], 
          createdAt: new Date(),
          userContext: {
            username: req.user.username,
            displayName: req.user.displayName,
            balance: req.user.balance,
            createdAt: req.user.createdAt
          }
        }
      },
      { 
        returnDocument: 'after', 
        upsert: true,
        maxTimeMS: 5000 // Set maximum execution time
      }
    );

    if (!conversationResult.value) {
      throw new Error('Failed to create or retrieve conversation');
    }

    const conversation = conversationResult.value;

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
          logError('ActionExecution', error);
          
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
    logError('Chat API', error);
    
    // Send appropriate error response
    const statusCode = error.name === 'MongoServerError' ? 503 : 500;
    const message = process.env.NODE_ENV === 'development' 
      ? error.message 
      : 'An error occurred processing your request';
      
    res.status(statusCode).json({ 
      error: true,
      message,
      code: error.code
    });
    
  } finally {
    // Only close connection in development to help debug
    if (process.env.NODE_ENV === 'development' && client) {
      await closeDatabaseConnection();
    }
  }
}); 