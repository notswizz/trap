import { getChatResponse } from './venice';

const ANALYSIS_PROMPT = `You are an AI that analyzes conversations to detect EXPLICIT actions that should be taken.
Output a JSON response that includes chat response and either an action to confirm or execute.

Possible actions:
- updateBalance: {amount: number, reason: string}
- createListing: {title: string, price: number, description: string}
- fetchListings: {type: "my"|"all"|"user"|"search", username?: string, query?: string}
- buyListing: {listingId: string, price: number}
- fetchNotifications: {unreadOnly?: boolean, markAsRead?: boolean, limit?: number}
- generateImage: {prompt: string} // For generating AI images
- confirmAction: {actionToConfirm: Object} // For confirming pending actions
- None: null

STRICT Guidelines:
- When user requests an action -> Ask for confirmation and set as pending
- Only execute action when user EXPLICITLY confirms
- For "confirm", "yes", "do it" -> Execute pending action
- For "cancel", "no", "nevermind" -> Clear pending action
- For casual conversation -> Use None
- For buy requests -> Verify listing ID and price before setting pending action
- For browse/show/see/view listings -> Execute fetchListings immediately (no confirmation needed)
- For browse/show all -> Use type: "all"
- For show my listings -> Use type: "my"
- For show user's listings -> Use type: "user" with username
- For search/find/look for specific listing -> Use type: "search" with query
- For show/check/view notifications -> Execute fetchNotifications immediately (no confirmation needed)
- For generate/create/make/draw image/picture -> Set generateImage action as pending and ask for confirmation
- For image generation, extract detailed prompt from user's request

Example flows:
User: "add 10 tokens"
AI: {chatResponse: "Would you like me to add 10 tokens to your balance? Please confirm.", action: {type: "updateBalance", data: {amount: 10}, status: "pending"}}
User: "yes"
AI: {chatResponse: "Balance updated!", action: {type: "confirmAction", data: {previousAction: "updateBalance", amount: 10}}}

User: "buy listing abc123 for 50 tokens"
AI: {chatResponse: "Would you like to purchase this listing for 50 tokens? Please confirm.", action: {type: "buyListing", data: {listingId: "abc123", price: 50}, status: "pending"}}
User: "yes"
AI: {chatResponse: "Processing your purchase!", action: {type: "confirmAction", data: {previousAction: "buyListing", listingId: "abc123", price: 50}}}

User: "show all listings"
AI: {chatResponse: "Here are all available listings:", action: {type: "fetchListings", data: {type: "all"}}}

User: "search for AI trading bot"
AI: {chatResponse: "Let me find that listing for you:", action: {type: "fetchListings", data: {type: "search", query: "AI trading bot"}}}

User: "find listing called neural network"
AI: {chatResponse: "Searching for 'neural network' listing:", action: {type: "fetchListings", data: {type: "search", query: "neural network"}}}

User: "show my notifications"
AI: {chatResponse: "Here are your notifications:", action: {type: "fetchNotifications", data: {markAsRead: true, limit: 20}}}

User: "check unread notifications"
AI: {chatResponse: "Here are your unread notifications:", action: {type: "fetchNotifications", data: {unreadOnly: true, markAsRead: true}}}

User: "generate an image of a sunset"
AI: {chatResponse: "Would you like me to generate an image of a sunset? Please confirm.", action: {type: "generateImage", data: {prompt: "a beautiful sunset with vibrant colors"}, status: "pending"}}

User: "create an image of a cyberpunk city"
AI: {chatResponse: "Would you like me to generate an image of a cyberpunk city? Please confirm.", action: {type: "generateImage", data: {prompt: "a detailed cyberpunk cityscape with neon lights and flying vehicles"}, status: "pending"}}

Examples:
✅ "add 10 coins" -> updateBalance (needs confirmation)
✅ "create listing for moon" -> createListing (needs confirmation)
✅ "show my listings" -> fetchListings (immediate)
✅ "browse all listings" -> fetchListings (immediate)
✅ "search for trading bot" -> fetchListings with search (immediate)
✅ "find neural network" -> fetchListings with search (immediate)
✅ "buy listing xyz" -> buyListing (needs confirmation)
❌ "thanks" -> None
❌ "cool" -> None
❌ "that's great" -> None

Response format:
{
  "chatResponse": "Your natural conversational response",
  "action": {
    "type": "updateBalance|createListing|fetchListings|buyListing|fetchNotifications|confirmAction|None",
    "data": {
      // action specific data
    },
    "status": "pending|confirmed" // Only for actions that need confirmation
  }
}`;

export async function analyzeMessage(message, conversation, user) {
  try {
    // Check for pending action in conversation
    const pendingAction = conversation.pendingAction;
    const isConfirmation = /^(yes|confirm|sure|ok|okay|do it)\b/i.test(message.trim());
    
    // Only handle confirmations through text, cancellations only through button
    if (pendingAction && isConfirmation) {
      // For image generation, execute directly
      if (pendingAction.type === 'generateImage') {
        return {
          chatResponse: "Generating your image...",
          action: {
            type: "generateImage",
            data: {
              prompt: pendingAction.data.prompt,
              conversationId: conversation._id.toString()
            }
          }
        };
      }

      // For other actions, use confirmAction
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

    // Check for browse/show listings commands - these should execute immediately
    const isBrowseCommand = /^(browse|show|see|view)\s+(all\s+)?listings?$/i.test(message.trim());
    if (isBrowseCommand) {
      return {
        chatResponse: "Here are the available listings:",
        action: {
          type: "fetchListings",
          data: { type: "all" }
        }
      };
    }

    // Check for search/find listing commands
    const searchMatch = message.match(/^(?:search|find|look\s+for)\s+(?:listing\s+(?:called|named)\s+)?['""]?([^'""]+)['""]?$/i);
    if (searchMatch) {
      const query = searchMatch[1].trim();
      return {
        chatResponse: `Searching for '${query}' listing:`,
        action: {
          type: "fetchListings",
          data: { 
            type: "search",
            query: query
          }
        }
      };
    }

    // Check for notification requests - these should execute immediately
    const notificationMatch = /^(?:show|check|view|see|get)\s+(?:my\s+)?(?:unread\s+)?notifications?$/i.test(message.trim());
    if (notificationMatch) {
      const unreadOnly = /unread/.test(message);
      return {
        chatResponse: unreadOnly ? "Here are your unread notifications:" : "Here are your notifications:",
        action: {
          type: "fetchNotifications",
          data: {
            unreadOnly,
            markAsRead: true
          }
        }
      };
    }

    // Check for buy requests
    const buyMatch = message.match(/^(?:buy|purchase)\s+(?:the\s+)?(['"]([^'"]+)['"]|(\S+))(?:\s+for\s+(\d+)\s+tokens?)?$/i);
    if (buyMatch) {
      const [_, fullMatch, quotedItem, unquotedItem, priceStr] = buyMatch;
      const itemDescription = quotedItem || unquotedItem;
      const price = priceStr ? parseInt(priceStr) : null;

      // If price is specified, treat as a direct purchase request
      if (price) {
        return {
          chatResponse: `Would you like to purchase "${itemDescription}" for ${price} tokens? Please confirm.`,
          action: {
            type: "buyListing",
            data: {
              query: itemDescription,
              price: price
            },
            status: "pending"
          }
        };
      }
      
      // Otherwise, search for the item first
      return {
        chatResponse: `Let me find that item for you:`,
        action: {
          type: "fetchListings",
          data: {
            type: "search",
            query: itemDescription
          }
        }
      };
    }

    // Check for image generation requests
    const imageGenMatch = message.match(/^(?:generate|create|make|draw)\s+(?:an?\s+)?(?:image|picture)\s+of\s+(.+)$/i);
    if (imageGenMatch) {
      const prompt = imageGenMatch[1].trim();
      return {
        chatResponse: `Would you like me to generate an image of ${prompt}? Please confirm.`,
        action: {
          type: "generateImage",
          data: { 
            prompt,
            conversationId: conversation._id 
          },
          status: "pending"
        }
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

      // Format the chat response if it's JSON
      if (analysis && typeof analysis.chatResponse === 'string') {
        // Remove any JSON formatting artifacts
        analysis.chatResponse = analysis.chatResponse
          .replace(/^\{.*"chatResponse":\s*"|"\s*,\s*"action".*\}$/g, '')
          .replace(/\\n/g, '\n')
          .trim();
      }
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

    // Add this near where other action types are handled
    if (analysis?.action?.type === 'generateImage' && analysis?.action?.status === 'completed') {
      return {
        chatResponse: "Here's your generated image:",
        action: {
          type: 'generateImage',
          data: analysis.action.data,
          status: 'completed',
          result: {
            content: analysis.action.result.content,
            isImage: true,
            prompt: analysis.action.data.prompt
          }
        }
      };
    }

    if (analysis?.action?.type === 'createListing' && analysis?.action?.status === 'completed') {
      const listing = analysis.actionResult.listing;
      return {
        chatResponse: `✨ Successfully created listing "${listing.title}" for ${listing.price} tokens`,
        action: {
          type: 'createListing',
          status: 'completed',
          result: {
            listing: {
              ...listing,
              imageUrl: listing.imageUrl,
              imagePrompt: listing.imagePrompt
            }
          }
        }
      };
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