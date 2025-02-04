import { getChatResponse } from './venice';

const ANALYSIS_PROMPT = `You are an AI that analyzes conversations to detect EXPLICIT actions that should be taken.
Output a JSON response that includes chat response and either an action to confirm or execute.

Possible actions:
- updateBalance: {amount: number, reason: string}
- createListing: {title: string, price: number, description: string}
- fetchListings: {type: "my"|"all"|"user", username?: string}
- confirmAction: {actionToConfirm: Object} // For confirming pending actions
- None: null

STRICT Guidelines:
- When user requests an action -> Ask for confirmation and set as pending
- Only execute action when user EXPLICITLY confirms
- For "confirm", "yes", "do it" -> Execute pending action
- For "cancel", "no", "nevermind" -> Clear pending action
- For casual conversation -> Use None

Example flow:
User: "add 10 tokens"
AI: {chatResponse: "Would you like me to add 10 tokens to your balance? Please confirm.", action: {type: "updateBalance", data: {amount: 10}, status: "pending"}}
User: "yes"
AI: {chatResponse: "Balance updated!", action: {type: "confirmAction", data: {previousAction: "updateBalance", amount: 10}}}

Examples:
✅ "add 10 coins" -> updateBalance
✅ "create listing for moon" -> createListing
✅ "show my listings" -> fetchListings
❌ "thanks" -> None
❌ "cool" -> None
❌ "that's great" -> None

Response format:
{
  "chatResponse": "Your natural conversational response",
  "action": {
    "type": "updateBalance|createListing|fetchListings|confirmAction|None",
    "data": {
      // action specific data
    }
  }
}`;

export async function analyzeMessage(message, conversation, user) {
  try {
    // Check for pending action in conversation
    const pendingAction = conversation.pendingAction;
    const isConfirmation = /^(yes|confirm|sure|ok|okay|do it)\b/i.test(message.trim());
    
    // Only handle confirmations through text, cancellations only through button
    if (pendingAction && isConfirmation) {
      return {
        chatResponse: "Processing your confirmed action...",
        action: {
          type: "confirmAction",
          data: pendingAction
        }
      };
    }

    // For simple responses, just respond naturally
    const isSimpleResponse = /^(thanks|thank you|ok|okay|cool|great|nice|alright|sure|yep|yeah|no|nope)\b/i.test(message.trim());
    if (isSimpleResponse) {
      return {
        chatResponse: message.match(/^(thanks|thank you)/i)
          ? "You're welcome! Is there anything else I can help you with?"
          : message.match(/^(no|nope)/i)
          ? "Okay! Let me know if you need anything else."
          : "Is there anything else I can help you with?",
        action: { type: 'None' }
      };
    }

    // Get the last message and its action
    const lastMessage = conversation.messages[conversation.messages.length - 1];
    const lastAction = lastMessage?.analysis?.action;

    // If the last message was an action and current message is short/acknowledgment
    if (lastAction && isSimpleResponse) {
      return {
        chatResponse: "You're welcome! Is there anything else I can help you with?",
        action: { type: 'None' }
      };
    }

    // Optimize context by only including relevant information
    const recentActions = conversation.messages
      .filter(m => m.analysis?.actionExecuted)
      .slice(-3)
      .map(m => ({
        type: m.analysis.action.type,
        data: m.analysis.action.data,
        result: m.analysis.actionResult,
        timestamp: m.timestamp
      }));

    const systemContext = {
      user: {
        name: user.displayName,
        balance: user.balance || 0
      },
      recentActions
    };

    // Only include last 4-5 messages for context
    const recentMessages = conversation.messages
      .slice(-5)
      .map(m => ({
        role: m.role,
        content: m.content
      }));

    const response = await getChatResponse([
      {
        role: 'system',
        content: `${ANALYSIS_PROMPT}\nContext: ${JSON.stringify(systemContext)}`
      },
      ...recentMessages,
      {
        role: 'user',
        content: message.trim()
      }
    ], false);

    let analysis;
    try {
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    } catch (e) {
      console.error('Failed to parse AI response as JSON:', e);
      return {
        chatResponse: response.content,
        action: { type: 'None' }
      };
    }

    // Only validate that balance updates have valid amounts
    if (analysis?.action?.type === 'updateBalance') {
      const amount = Number(analysis.action.data?.amount);
      if (!Number.isInteger(amount) || amount <= 0) {
        return {
          chatResponse: analysis.chatResponse,
          action: { type: 'None' }
        };
      }
    }

    return analysis || {
      chatResponse: response.content,
      action: { type: 'None' }
    };
  } catch (error) {
    console.error('Analysis error:', error);
    return {
      chatResponse: "I apologize, but I encountered an error processing your request.",
      action: { type: 'None' }
    };
  }
} 