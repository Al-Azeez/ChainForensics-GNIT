import dotenv from 'dotenv';
dotenv.config();

export interface AppConfig {
  port: number;
  nodeEnv: string;
  mongoUri: string;
  ethereumRpcUrl: string;
  aiServiceUrl: string;
  jwtSecret: string;
  corsOrigin: string;
}

export const config: AppConfig = {
  port: parseInt(process.env.PORT || '4321', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/chainforensics',
  ethereumRpcUrl: process.env.ETHEREUM_RPC_URL || 'https://ethereum.publicnode.com',
  aiServiceUrl: process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000',
  jwtSecret: process.env.JWT_SECRET || (
  process.env.NODE_ENV === 'production'
    ? (() => { throw new Error('JWT_SECRET is required in production'); })()
    : 'development_only_secret'
),
  corsOrigin: process.env.CORS_ORIGIN || '*'
};
