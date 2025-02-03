import { connectToDatabase } from './mongodb';
import { ObjectId } from 'mongodb';

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

  const listing = {
    userId: new ObjectId(userId),
    title: data.title,
    price: data.price,
    description: data.description,
    status: 'active',
    createdAt: new Date(),
    // Add new fields
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
    transactions: [] // Will store future trades/sales
  };

  await db.collection('listings').insertOne(listing);
  return listing;
}

export async function handleListingTransfer(listingId, fromUserId, toUserId, price, reason = 'sale') {
  const { db } = await connectToDatabase();

  // Get the listing
  const listing = await db.collection('listings').findOne({
    _id: new ObjectId(listingId)
  });

  if (!listing) {
    throw new Error('Listing not found');
  }

  // Get both users' info
  const [fromUser, toUser] = await Promise.all([
    db.collection('users').findOne(
      { _id: new ObjectId(fromUserId) },
      { projection: { username: 1, displayName: 1 } }
    ),
    db.collection('users').findOne(
      { _id: new ObjectId(toUserId) },
      { projection: { username: 1, displayName: 1 } }
    )
  ]);

  if (!fromUser || !toUser) {
    throw new Error('One or both users not found');
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

  // Update the listing
  const result = await db.collection('listings').findOneAndUpdate(
    { 
      _id: new ObjectId(listingId),
      currentOwnerUsername: fromUser.username // Ensure current owner is seller
    },
    {
      $set: {
        currentOwnerUsername: toUser.username,
        currentOwnerDisplayName: toUser.displayName,
        userId: new ObjectId(toUserId), // Update owner ID
        price: price // Update current price
      },
      $push: {
        transactions: transaction,
        ownershipHistory: ownershipRecord
      }
    },
    { returnDocument: 'after' }
  );

  if (!result.value) {
    throw new Error('Failed to transfer listing ownership');
  }

  return result.value;
}

export async function handleFetchListings(userId, data) {
  const { db } = await connectToDatabase();
  
  try {
    let query = {};
    let listings = [];

    switch (data.type) {
      case 'my':
        // Get user's info first
        const user = await db.collection('users').findOne(
          { _id: new ObjectId(userId) },
          { projection: { username: 1 } }
        );
        if (!user) throw new Error('User not found');
        
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

      default:
        throw new Error('Invalid listing fetch type');
    }

    // Format listings for display
    const formattedListings = listings.map(listing => ({
      id: listing._id,
      title: listing.title,
      price: listing.price,
      description: listing.description,
      creator: listing.creatorUsername,
      owner: listing.currentOwnerUsername,
      status: listing.status,
      created: listing.createdAt
    }));

    return {
      type: data.type,
      count: formattedListings.length,
      listings: formattedListings
    };
  } catch (error) {
    console.error('Fetch listings error:', error);
    throw error;
  }
}

export async function executeAction(type, userId, data) {
  try {
    switch (type) {
      case 'updateBalance':
        return await handleUpdateBalance(userId, data);
      case 'createListing':
        return await handleCreateListing(userId, data);
      case 'transferListing':
        return await handleListingTransfer(data.listingId, userId, data.toUserId, data.price, data.reason);
      case 'fetchListings':
        return await handleFetchListings(userId, data);
      case 'None':
        return null;
      default:
        throw new Error(`Unknown action type: ${type}`);
    }
  } catch (error) {
    console.error('Action execution error:', error);
    throw error;
  }
} 