import mongoose from 'mongoose';
import { app } from './app.js';
import { config } from './config/index.js';

async function startServer() {
  console.log('='.repeat(50));
  console.log('Initializing ChainForensics Server...');
  console.log('='.repeat(50));

  // Connect to MongoDB Atlas / Local MongoDB
  try {
    console.log(`Connecting to MongoDB at: ${config.mongoUri.replace(/:([^:@]{4,})@/, ':****@')}...`);
    await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 4000
    });
    console.log('MongoDB Atlas / Local Database connected successfully.');
  } catch (err: any) {
    console.warn('MongoDB connection failed or skipped. Running with In-Memory Storage Mode for seamless standalone execution.');
  }

  app.listen(config.port, '0.0.0.0', () => {
    console.log(`ChainForensics Server is listening on http://0.0.0.0:${config.port}`);
    console.log(`Health Check: http://localhost:${config.port}/api/health`);
    console.log(`AI Engine Target: ${config.aiServiceUrl}`);
    console.log(`Ethereum Provider: ${config.ethereumRpcUrl}`);
  });
}

startServer();
