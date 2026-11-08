import mongoose from 'mongoose';
import { app } from './app.js';
import { config } from './config/index.js';

let isConnected = false;

async function connectDatabase() {
  if (isConnected) return;

  try {
    await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 10000
    });

    isConnected = true;
    console.log('MongoDB connected successfully.');
  } catch (error) {
    isConnected = false;
    console.error('MongoDB connection failed:', error);
    throw error;
  }
}

app.use(async (req, res, next) => {
  try {
    await connectDatabase();
    next();
  } catch (error) {
    res.status(503).json({
      error: 'Database connection unavailable'
    });
  }
});

export default app;