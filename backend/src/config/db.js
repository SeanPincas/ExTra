// backend/src/config/db.js
// --------------------------------------------------
// PURPOSE:
// Central MongoDB connection logic

import mongoose from 'mongoose';
import { logInfo, logError } from '../utils/logger.js';

export const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI;

    // Safety check: crash early if URI is missing
    if (!uri) {
      throw new Error('MONGO_URI not defined in environment variables');
    }

    // Connect mongoose to MongoDB Atlas
    await mongoose.connect(uri);

    logInfo('MongoDB connected successfully');
  } catch (err) {
    logError('MongoDB connection failed:', err.message);

    // Exit so we don't run the API without DB
    process.exit(1);
  }
};