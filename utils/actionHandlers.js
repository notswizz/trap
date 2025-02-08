import { connectToDatabase } from './mongodb';
import { ObjectId } from 'mongodb';
import { generateImage } from './venice';
import { uploadImageToS3 } from './s3';

export async function handleUpdateBalance(userId, data) {
  const { db } = await connectToDatabase();
  
  try {
    console.log('Updating balance for user:', userId);
    console.log('Update data:', data);

    // Ensure userId is valid
    if (!userId || !ObjectId.isValid(userId)) {
      throw new Error('Invalid user ID');
    }

    const userObjectId = new ObjectId(userId);

    // First, get the current user
    const currentUser = await db.collection('users').findOne(
      { _id: userObjectId },
      { projection: { password: 0 } }
    );

    if (!currentUser) {
      throw new Error('User not found');
    }

    console.log('Current user state:', currentUser);

    // Calculate new balance
    const amount = parseInt(data.amount);
    if (isNaN(amount)) {
      throw new Error('Invalid amount');
    }

    const newBalance = (currentUser.balance || 0) + amount;

    // Perform the update using updateOne instead of findOneAndUpdate
    const updateResult = await db.collection('users').updateOne(
      { _id: userObjectId },
      { 
        $set: { balance: newBalance },
        $push: {
          transactions: {
            amount: amount,
            reason: data.reason,
            timestamp: new Date(),
            previousBalance: currentUser.balance || 0,
            newBalance: newBalance
          }
        }
      }
    );

    if (updateResult.modifiedCount !== 1) {
      console.error('Update failed for user:', {
        userId: userObjectId,
        currentBalance: currentUser.balance,
        attemptedChange: amount,
        updateResult
      });
      throw new Error('Balance update failed');
    }

    // Create notification for balance update
    await createNotification(db, userId, {
      type: 'BALANCE_UPDATE',
      message: amount > 0 
        ? `Added ${amount} tokens to your balance. New balance: ${newBalance} tokens`
        : `Removed ${Math.abs(amount)} tokens from your balance. New balance: ${newBalance} tokens`,
      data: {
        amount,
        previousBalance: currentUser.balance || 0,
        newBalance,
        reason: data.reason
      }
    });

    // Fetch the updated user
    const updatedUser = await db.collection('users').findOne(
      { _id: userObjectId },
      { projection: { password: 0 } }
    );

    if (!updatedUser) {
      throw new Error('Failed to fetch updated user');
    }

    console.log('Balance updated successfully:', {
      userId: userObjectId,
      oldBalance: currentUser.balance,
      newBalance: updatedUser.balance,
      change: amount
    });

    return updatedUser;
  } catch (error) {
    console.error('Update balance error:', {
      userId,
      error: error.message,
      stack: error.stack
    });
    throw error;
  }
}

export async function handleCreateListing(userId, data) {
  const { db } = await connectToDatabase();
  
  // First get the creator's info
  const creator = await db.collection('users').findOne(
    { _id: new ObjectId(userId) },
    { projection: { username: 1, displayName: 1 } }
  );

  if (!creator) {
    throw new Error('Creator not found');
  }

  // Generate an image prompt based on title and description
  const imagePrompt = `${data.title} - ${data.description}`.slice(0, 200); // Limit prompt length
  console.log('Generating image for listing with prompt:', imagePrompt);
  
  // Generate the image
  const imageData = await generateImage(imagePrompt);
  
  // Generate a unique filename
  const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.png`;
  
  // Upload to S3
  const imageUrl = await uploadImageToS3(imageData, filename);

  const listing = {
    userId: new ObjectId(userId),
    title: data.title,
    price: data.price,
    description: data.description,
    status: 'active',
    createdAt: new Date(),
    // Add image fields
    imageUrl: imageUrl,
    imagePrompt: imagePrompt,
    // Existing fields
    creatorUsername: creator.username,
    creatorDisplayName: creator.displayName,
    currentOwnerUsername: creator.username,
    currentOwnerDisplayName: creator.displayName,
    ownershipHistory: [{
      username: creator.username,
      displayName: creator.displayName,
      acquiredAt: new Date(),
      price: data.price,
      type: 'created'
    }],
    transactions: []
  };

  await db.collection('listings').insertOne(listing);

  // Create notification for listing creation
  await createNotification(db, userId, {
    type: 'LISTING_CREATED',
    message: `Successfully created listing "${data.title}" for ${data.price} tokens`,
    data: {
      listingId: listing._id.toString(),
      title: data.title,
      price: data.price,
      description: data.description,
      imageUrl: imageUrl
    }
  });

  // Return formatted listing with image
  return {
    success: true,
    message: 'Listing created successfully',
    listing: {
      id: listing._id,
      title: listing.title,
      price: listing.price,
      description: listing.description,
      imageUrl: listing.imageUrl,
      imagePrompt: listing.imagePrompt,
      creatorUsername: listing.creatorUsername,
      creatorDisplayName: listing.creatorDisplayName,
      currentOwnerUsername: listing.currentOwnerUsername,
      currentOwnerDisplayName: listing.currentOwnerDisplayName,
      status: listing.status,
      created: listing.createdAt
    }
  };
}

export async function handleListingTransfer(listingId, fromUserId, toUserId, price, reason = 'sale', session = null) {
  const { db } = await connectToDatabase();
  const options = session ? { session } : {};

  // Convert string IDs to ObjectIds
  const listingObjectId = new ObjectId(listingId);
  const fromUserObjectId = new ObjectId(fromUserId);
  const toUserObjectId = new ObjectId(toUserId);

  // Get the listing with session
  const listing = await db.collection('listings').findOne(
    { 
      _id: listingObjectId,
      status: 'active'
    },
    options
  );

  if (!listing) {
    throw new Error('Listing not found or not active');
  }

  // Get both users' info with session
  const [fromUser, toUser] = await Promise.all([
    db.collection('users').findOne(
      { _id: fromUserObjectId },
      { ...options, projection: { username: 1, displayName: 1 } }
    ),
    db.collection('users').findOne(
      { _id: toUserObjectId },
      { ...options, projection: { username: 1, displayName: 1 } }
    )
  ]);

  if (!fromUser || !toUser) {
    throw new Error('One or both users not found');
  }

  // Log ownership details for debugging
  console.log('Transfer ownership check:', {
    listingId: listingObjectId.toString(),
    listingUserId: listing.userId.toString(),
    fromUserId: fromUserObjectId.toString(),
    fromUsername: fromUser.username,
    currentOwnerUsername: listing.currentOwnerUsername,
    status: listing.status
  });

  // Verify current ownership by comparing ObjectId values and username
  if (!listing.userId.equals(fromUserObjectId) || listing.currentOwnerUsername !== fromUser.username) {
    throw new Error(`Ownership verification failed. Current owner: ${listing.currentOwnerUsername}`);
  }

  const transaction = {
    fromUsername: fromUser.username,
    fromDisplayName: fromUser.displayName,
    toUsername: toUser.username,
    toDisplayName: toUser.displayName,
    price: price,
    timestamp: new Date(),
    reason: reason
  };

  const ownershipRecord = {
    username: toUser.username,
    displayName: toUser.displayName,
    acquiredAt: new Date(),
    price: price,
    type: reason,
    previousOwner: fromUser.username
  };

  // Update the listing with atomic operation
  const result = await db.collection('listings').findOneAndUpdate(
    { 
      _id: listingObjectId,
      userId: fromUserObjectId,
      status: 'active',
      currentOwnerUsername: fromUser.username
    },
    {
      $set: {
        userId: toUserObjectId,
        currentOwnerUsername: toUser.username,
        currentOwnerDisplayName: toUser.displayName,
        price: price,
        status: 'active',
        updatedAt: new Date()
      },
      $push: {
        transactions: transaction,
        ownershipHistory: ownershipRecord
      }
    },
    { 
      returnDocument: 'after'
    }
  );

  // Simpler check - if we got a result back, it worked
  if (!result) {
    console.error('Transfer failed:', {
      listingId: listingObjectId.toString(),
      fromUserId: fromUserObjectId.toString(),
      toUserId: toUserObjectId.toString(),
      currentOwner: listing.currentOwnerUsername
    });
    throw new Error('Transfer failed - listing may have been modified');
  }

  return result;
}

export async function handleFetchListings(userId, data) {
  const { db } = await connectToDatabase();
  
  try {
    let query = {};
    let listings = [];

    // Get user's info first
    const user = await db.collection('users').findOne(
      { _id: new ObjectId(userId) },
      { projection: { username: 1, displayName: 1 } }
    );
    if (!user) throw new Error('User not found');

    switch (data.type) {
      case 'my':
        listings = await db.collection('listings').find({
          $or: [
            { currentOwnerUsername: user.username },
            { creatorUsername: user.username }
          ]
        }).toArray();
        break;

      case 'all':
        listings = await db.collection('listings')
          .find({ status: 'active' })
          .sort({ createdAt: -1 })
          .limit(10)
          .toArray();
        break;

      case 'user':
        if (!data.username) throw new Error('Username required');
        listings = await db.collection('listings').find({
          currentOwnerUsername: data.username.toLowerCase(),
          status: 'active'
        }).toArray();
        break;

      case 'search':
        if (!data.query) throw new Error('Search query required');
        const bestMatch = await findBestMatchingListing(data.query, db);
        listings = bestMatch ? [bestMatch] : [];
        break;

      default:
        throw new Error('Invalid listing fetch type');
    }

    // Format listings for display
    const formattedListings = listings.map(listing => ({
      id: listing._id,
      title: listing.title,
      price: listing.price,
      description: listing.description,
      imageUrl: listing.imageUrl,
      imagePrompt: listing.imagePrompt,
      creatorUsername: listing.creatorUsername,
      creatorDisplayName: listing.creatorDisplayName,
      currentOwnerUsername: listing.currentOwnerUsername,
      currentOwnerDisplayName: listing.currentOwnerDisplayName,
      status: listing.status,
      created: listing.createdAt
    }));

    return {
      type: data.type,
      count: formattedListings.length,
      listings: formattedListings,
      user: {
        username: user.username,
        displayName: user.displayName
      }
    };
  } catch (error) {
    console.error('Fetch listings error:', error);
    throw error;
  }
}

async function findBestMatchingListing(searchQuery, db, session = null) {
  const options = session ? { session } : {};
  
  // First try exact ID match
  if (ObjectId.isValid(searchQuery)) {
    const exactMatch = await db.collection('listings').findOne({ 
      _id: new ObjectId(searchQuery),
      status: 'active'
    }, options);
    if (exactMatch) return exactMatch;
  }

  // Then try title/description search
  const listings = await db.collection('listings').find({
    status: 'active',
    $or: [
      { title: { $regex: searchQuery, $options: 'i' } },
      { description: { $regex: searchQuery, $options: 'i' } }
    ]
  }, options).toArray();

  if (listings.length === 0) {
    return null;
  }

  // Score matches based on similarity
  const scores = listings.map(listing => {
    const titleScore = (listing.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ? 2 : 0;
    const descScore = (listing.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ? 1 : 0;
    return {
      listing,
      score: titleScore + descScore
    };
  });

  // Return the best match
  scores.sort((a, b) => b.score - a.score);
  return scores[0].listing;
}

class InsufficientBalanceError extends Error {
  constructor(actualPrice, currentBalance) {
    const needed = actualPrice - currentBalance;
    super(JSON.stringify({
      type: 'INSUFFICIENT_BALANCE',
      message: `Insufficient balance for purchase`,
      details: {
        cost: actualPrice,
        balance: currentBalance,
        needed: needed
      }
    }));
    this.name = 'InsufficientBalanceError';
  }
}

async function createNotification(db, userId, data) {
  await db.collection('notifications').insertOne({
    userId: new ObjectId(userId),
    type: data.type,
    message: data.message,
    data: data.data,
    read: false,
    createdAt: new Date()
  });
}

export async function handleBuyListing(buyerId, listingIdOrQuery, price) {
  const { db, client } = await connectToDatabase();
  const session = await client.startSession();
  
  try {
    return await session.withTransaction(async () => {
      // Find best matching listing with session
      const listing = await findBestMatchingListing(listingIdOrQuery, db, session);

      if (!listing) {
        throw new Error('No matching active listing found. Please check the listing details and try again.');
      }

      // Verify price matches if specified
      if (price && listing.price !== price) {
        throw new Error(`Price mismatch. Listing price is ${listing.price} tokens.`);
      }

      const actualPrice = price || listing.price;
      const sellerId = listing.userId.toString();

      // Verify buyer isn't seller
      if (sellerId === buyerId) {
        throw new Error('You cannot buy your own listing');
      }

      // Get buyer info and verify sufficient balance
      const buyer = await db.collection('users').findOne(
        { _id: new ObjectId(buyerId) },
        { session }
      );

      if (!buyer) {
        throw new Error('Buyer account not found');
      }

      if ((buyer.balance || 0) < actualPrice) {
        throw new InsufficientBalanceError(actualPrice, buyer.balance || 0);
      }

      // Get seller info to verify they still exist
      const seller = await db.collection('users').findOne(
        { _id: new ObjectId(sellerId) },
        { session }
      );

      if (!seller) {
        throw new Error('Seller account not found');
      }

      // Verify listing ownership hasn't changed
      if (listing.currentOwnerUsername !== seller.username) {
        throw new Error('Listing ownership has changed since your request');
      }

      // Log transaction details for debugging
      console.log('Buy transaction:', {
        listingId: listing._id.toString(),
        buyerId,
        sellerId,
        price: actualPrice,
        buyerBalance: buyer.balance,
        sellerUsername: seller.username,
        currentOwner: listing.currentOwnerUsername
      });

      // 1. Update buyer's balance first (subtract)
      const buyerUpdate = await db.collection('users').updateOne(
        { _id: new ObjectId(buyerId) },
        { 
          $inc: { balance: -actualPrice },
          $push: {
            transactions: {
              amount: -actualPrice,
              reason: `Purchase of listing: ${listing.title}`,
              timestamp: new Date(),
              previousBalance: buyer.balance,
              newBalance: buyer.balance - actualPrice
            }
          }
        },
        { session }
      );

      if (buyerUpdate.modifiedCount !== 1) {
        throw new Error('Failed to update buyer balance');
      }

      // 2. Update seller's balance (add)
      const sellerUpdate = await db.collection('users').updateOne(
        { _id: new ObjectId(sellerId) },
        { 
          $inc: { balance: actualPrice },
          $push: {
            transactions: {
              amount: actualPrice,
              reason: `Sale of listing: ${listing.title}`,
              timestamp: new Date(),
              previousBalance: seller.balance,
              newBalance: seller.balance + actualPrice
            }
          }
        },
        { session }
      );

      if (sellerUpdate.modifiedCount !== 1) {
        throw new Error('Failed to update seller balance');
      }

      // 3. Transfer listing ownership last
      const transferResult = await handleListingTransfer(
        listing._id.toString(),
        sellerId,
        buyerId,
        actualPrice,
        'purchase',
        session
      );

      if (!transferResult) {
        throw new Error('Failed to transfer listing ownership');
      }

      // Create notification for seller
      await createNotification(db, sellerId, {
        type: 'LISTING_SOLD',
        message: `Your listing "${listing.title}" was purchased for ${actualPrice} tokens`,
        data: {
          listingId: listing._id.toString(),
          listingTitle: listing.title,
          price: actualPrice,
          buyerUsername: buyer.username,
          newBalance: seller.balance + actualPrice
        }
      });

      // Create notification for buyer
      await createNotification(db, buyerId, {
        type: 'LISTING_PURCHASED',
        message: `Successfully purchased "${listing.title}" for ${actualPrice} tokens`,
        data: {
          listingId: listing._id.toString(),
          listingTitle: listing.title,
          price: actualPrice,
          sellerUsername: seller.username,
          newBalance: buyer.balance - actualPrice
        }
      });

      return { 
        success: true, 
        message: 'Purchase completed successfully',
        listing: listing.title,
        price: actualPrice,
        seller: seller.username
      };
    }, {
      readConcern: { level: 'majority' },
      writeConcern: { w: 'majority' }
    });
  } catch (error) {
    if (error.name === 'InsufficientBalanceError') {
      // Pass through the structured error
      throw error;
    }
    console.error('Purchase error:', error);
    throw new Error('Unable to complete purchase. Please try again.');
  } finally {
    await session.endSession();
  }
}

export async function handleFetchNotifications(userId, data = {}) {
  const { db } = await connectToDatabase();
  
  try {
    console.log('Fetching notifications:', { userId, data });
    
    // Get user's transactions
    const user = await db.collection('users').findOne(
      { _id: new ObjectId(userId) }
    );

    if (!user || !user.transactions) {
      return {
        success: true,
        notifications: [],
        count: 0,
        message: 'No transactions found'
      };
    }

    // Convert transactions to notifications format
    const notifications = user.transactions.map(transaction => {
      // Handle MongoDB number format
      const amount = transaction.amount?.$numberInt || transaction.amount || 0;
      const previousBalance = transaction.previousBalance?.$numberInt || transaction.previousBalance || 0;
      const newBalance = transaction.newBalance?.$numberInt || transaction.newBalance || 0;
      
      // Determine transaction type
      const isSale = transaction.reason?.includes('Sale of');
      const isPurchase = transaction.reason?.includes('Purchase of');
      let type = 'BALANCE_UPDATE';
      
      if (isSale) type = 'LISTING_SOLD';
      if (isPurchase) type = 'LISTING_PURCHASED';

      // Extract item name if it's a sale or purchase
      let itemName = '';
      if (transaction.reason) {
        const match = transaction.reason.match(/(?:Sale|Purchase) of listing: (.+)$/);
        if (match) itemName = match[1];
      }

      return {
        _id: new ObjectId(),
        type,
        message: transaction.reason || 'Balance updated',
        data: {
          amount: Math.abs(amount),
          previousBalance,
          newBalance,
          itemName,
          timestamp: transaction.timestamp
        },
        createdAt: transaction.timestamp || new Date()
      };
    });

    // Sort by most recent first
    notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Limit to most recent if specified
    const limitedNotifications = data.limit ? notifications.slice(0, data.limit) : notifications;

    return {
      success: true,
      notifications: limitedNotifications,
      count: limitedNotifications.length,
      message: limitedNotifications.length > 0 
        ? `Found ${limitedNotifications.length} transaction${limitedNotifications.length === 1 ? '' : 's'}`
        : 'No transactions found'
    };
  } catch (error) {
    console.error('Fetch notifications error:', error);
    throw error;
  }
}

async function handleGenerateImage(userId, data) {
  const { db } = await connectToDatabase();
  
  try {
    console.log('Generating image with data:', data);
    const imageData = await generateImage(data.prompt);
    
    // Generate a unique filename
    const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.png`;
    
    // Upload to S3
    const s3Url = await uploadImageToS3(imageData, filename);
    
    // Create image document
    const imageDoc = {
      userId: new ObjectId(userId),
      url: s3Url,
      filename: filename,
      prompt: data.prompt,
      createdAt: new Date()
    };

    // Save image to images collection
    const imageResult = await db.collection('images').insertOne(imageDoc);
    console.log('Saved image to database:', imageResult.insertedId);
    
    if (!imageResult.insertedId) {
      throw new Error('Failed to save image to database');
    }

    // If we have a conversation ID, add a reference to the image
    if (data.conversationId) {
      try {
        const message = {
          role: 'assistant',
          content: s3Url,
          isImage: true,
          prompt: data.prompt,
          imageId: imageResult.insertedId,
          timestamp: new Date(),
          analysis: {
            action: {
              type: 'generateImage',
              status: 'completed',
              result: {
                content: s3Url,
                isImage: true,
                prompt: data.prompt
              }
            },
            actionExecuted: true,
            actionResult: {
              content: s3Url,
              isImage: true,
              prompt: data.prompt
            }
          }
        };

        const conversationResult = await db.collection('conversations').updateOne(
          { _id: new ObjectId(data.conversationId) },
          {
            $push: { messages: message },
            $set: { 
              updatedAt: new Date(),
              pendingAction: null
            }
          }
        );

        console.log('Updated conversation:', {
          conversationId: data.conversationId,
          modifiedCount: conversationResult.modifiedCount
        });

      } catch (convError) {
        console.error('Failed to update conversation but image was saved:', convError);
      }
    }

    return {
      success: true,
      imageUrl: s3Url,
      imageId: imageResult.insertedId,
      message: "Image generated successfully",
      content: s3Url,
      isImage: true,
      prompt: data.prompt
    };

  } catch (error) {
    console.error('Image generation error:', error);
    throw new Error(`Failed to generate image: ${error.message}`);
  }
}

export async function executeAction(type, userId, data) {
  try {
    switch (type) {
      case 'updateBalance':
        return await handleUpdateBalance(userId, data);
      case 'createListing':
        return await handleCreateListing(userId, data);
      case 'fetchListings':
        return await handleFetchListings(userId, data);
      case 'buyListing':
        return await handleBuyListing(userId, data);
      case 'fetchNotifications':
        return await handleFetchNotifications(userId, data);
      case 'generateImage':
        return await handleGenerateImage(userId, data);
      default:
        throw new Error(`Unknown action type: ${type}`);
    }
  } catch (error) {
    console.error('Action execution error:', error);
    throw error;
  }
}