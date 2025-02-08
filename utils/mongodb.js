import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';
import { ObjectId } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

if (!MONGODB_DB) {
  throw new Error('Please define the MONGODB_DB environment variable inside .env.local');
}

let cachedClient = null;
let cachedDb = null;

export async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const client = await MongoClient.connect(MONGODB_URI);
  const db = client.db(MONGODB_DB);

  // Ensure indexes exist
  await Promise.all([
    // Existing indexes
    db.collection('users').createIndex({ username: 1 }, { unique: true }),
    db.collection('users').createIndex({ email: 1 }, { unique: true }),
    db.collection('listings').createIndex({ status: 1 }),
    db.collection('listings').createIndex({ currentOwnerUsername: 1 }),
    db.collection('listings').createIndex({ creatorUsername: 1 }),
    db.collection('notifications').createIndex({ userId: 1 }),
    db.collection('conversations').createIndex({ userId: 1 }),
    
    // New index for images
    db.collection('images').createIndex({ shortUrl: 1 }, { unique: true }),
    db.collection('images').createIndex({ userId: 1 }),
    db.collection('images').createIndex({ createdAt: 1 })
  ]).catch(console.error);

  cachedClient = client;
  cachedDb = db;

  return { client, db };
}

// Auth utilities
export async function createUser({ username, email, password }) {
  const { db } = await connectToDatabase();
  
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error('Invalid email format');
  }

  // Validate password strength
  if (password.length < 8) {
    throw new Error('Password must be at least 8 characters long');
  }

  // Check if user already exists
  const existingUser = await db.collection('users').findOne({
    $or: [
      { email: email.toLowerCase() }, // Store emails in lowercase
      { username: username.toLowerCase() } // Store usernames in lowercase
    ]
  });

  if (existingUser) {
    if (existingUser.email === email.toLowerCase()) {
      throw new Error('Email already exists');
    }
    if (existingUser.username === username.toLowerCase()) {
      throw new Error('Username already taken');
    }
  }

  // Hash password with a strong salt
  const hashedPassword = await bcrypt.hash(password, 12);

  // Create user with sanitized data
  const newUser = {
    username: username.toLowerCase(),
    displayName: username, // Keep original case for display
    email: email.toLowerCase(),
    password: hashedPassword,
    createdAt: new Date(),
    balance: 0,
    lastLogin: new Date(),
  };

  const result = await db.collection('users').insertOne(newUser);
  
  // Return user without sensitive data
  const { password: _, ...userWithoutPassword } = newUser;
  return { ...userWithoutPassword, _id: result.insertedId };
}

export async function loginUser({ email, password }) {
  const { db } = await connectToDatabase();

  // Find user by lowercase email
  const user = await db.collection('users').findOne({ 
    email: email.toLowerCase() 
  });
  
  if (!user) {
    throw new Error('Invalid email or password');
  }

  // Verify password
  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    throw new Error('Invalid email or password');
  }

  // Update last login time
  await db.collection('users').updateOne(
    { _id: user._id },
    { $set: { lastLogin: new Date() } }
  );

  // Return user without password
  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

// Add this function to your existing mongodb.js
export async function saveMessage({ userId, role, content }) {
  const { db } = await connectToDatabase();
  
  const message = {
    userId,
    role,
    content,
    timestamp: new Date(),
  };

  await db.collection('messages').insertOne(message);
  return message;
}

export async function getUserMessages(userId) {
  const { db } = await connectToDatabase();
  
  const messages = await db.collection('messages')
    .find({ userId })
    .sort({ timestamp: 1 })
    .toArray();
    
  return messages;
}

// Add these new functions
export async function createConversation(userId) {
  const { db } = await connectToDatabase();
  
  // First get the user's info
  const user = await db.collection('users').findOne(
    { _id: new ObjectId(userId) },
    { projection: { password: 0 } } // Exclude password
  );

  if (!user) {
    throw new Error('User not found');
  }

  const conversation = {
    userId: new ObjectId(userId),
    createdAt: new Date(),
    updatedAt: new Date(),
    messages: [],
    // Add user context
    userContext: {
      username: user.username,
      displayName: user.displayName,
      balance: user.balance,
      createdAt: user.createdAt,
      totalTransactions: user.transactions?.length || 0,
      lastLogin: user.lastLogin
    },
    // Track conversation stats
    stats: {
      messageCount: 0,
      actionCount: 0,
      lastAction: null,
      balanceStart: user.balance,
      balanceCurrent: user.balance,
      totalBalanceChange: 0
    }
  };

  const result = await db.collection('conversations').insertOne(conversation);
  return { ...conversation, _id: result.insertedId };
}

export async function saveMessageToConversation(conversationId, message) {
  const { db } = await connectToDatabase();
  
  const update = {
    $push: { messages: { ...message, timestamp: new Date() } },
    $set: { updatedAt: new Date() }
  };

  // Handle pending actions
  if (message.analysis?.action?.status === 'pending') {
    update.$set.pendingAction = message.analysis.action;
  } else if (message.analysis?.action?.type === 'confirmAction') {
    update.$unset = { pendingAction: "" };
  }

  await db.collection('conversations').updateOne(
    { _id: new ObjectId(conversationId) },
    update
  );

  return message;
}

export async function getUserConversations(userId) {
  const { db } = await connectToDatabase();
  
  const conversations = await db.collection('conversations')
    .find({ userId })
    .sort({ updatedAt: -1 })
    .toArray();
    
  return conversations;
}

export async function getConversation(conversationId) {
  const { db } = await connectToDatabase();
  
  const conversation = await db.collection('conversations').findOne({
    _id: new ObjectId(conversationId)
  });
    
  return conversation;
}

export async function clearConversation(conversationId) {
  const { db } = await connectToDatabase();
  
  await db.collection('conversations').updateOne(
    { _id: new ObjectId(conversationId) },
    { 
      $set: { 
        messages: [],
        updatedAt: new Date()
      }
    }
  );
}

// Add this function to help with listing queries
export async function getListingWithHistory(listingId) {
  const { db } = await connectToDatabase();
  
  const listing = await db.collection('listings').findOne({
    _id: new ObjectId(listingId)
  });

  if (!listing) {
    return null;
  }

  // Add any additional user info needed
  const creator = await db.collection('users').findOne(
    { username: listing.creatorUsername },
    { projection: { displayName: 1, username: 1 } }
  );

  const currentOwner = await db.collection('users').findOne(
    { username: listing.currentOwnerUsername },
    { projection: { displayName: 1, username: 1 } }
  );

  return {
    ...listing,
    creator,
    currentOwner
  };
}

// Add function to get user's listings
export async function getUserListings(username) {
  const { db } = await connectToDatabase();
  
  return db.collection('listings').find({
    $or: [
      { creatorUsername: username },
      { currentOwnerUsername: username }
    ]
  }).toArray();
} 