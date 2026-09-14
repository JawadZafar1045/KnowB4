const mongoose = require('mongoose');
const config = require('./environment');

let mongod = null;

const connectDB = async () => {
  try {
    // Attempt standard connection first with a short timeout
    await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 2000
    });
    console.log(`[CyberAware DB] Connected to MongoDB: ${mongoose.connection.host}`);
  } catch (err) {
    console.warn(`[CyberAware DB] Standard MongoDB connection failed (${err.message}). Initializing embedded database fallback...`);
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongod = await MongoMemoryServer.create();
      const uri = mongod.getUri();
      await mongoose.connect(uri);
      console.log(`[CyberAware DB] Connected to In-Memory MongoDB at: ${uri}`);
      
      // Auto-trigger seeding if using embedded database so test data is immediately ready
      const { seedData } = require('../utils/seed');
      await seedData();
    } catch (fallbackErr) {
      console.error('[CyberAware DB] Fatal: Failed to initialize embedded database:', fallbackErr);
      process.exit(1);
    }
  }
};

const disconnectDB = async () => {
  await mongoose.disconnect();
  if (mongod) {
    await mongod.stop();
  }
};

module.exports = { connectDB, disconnectDB };
