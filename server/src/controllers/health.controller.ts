import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { blockchainService } from '../services/blockchain.service.js';
import { aiService } from '../services/ai.service.js';

export async function getSystemHealth(req: Request, res: Response) {
  const [ethHealth, aiHealth] = await Promise.all([
    blockchainService.checkHealth(),
    aiService.checkHealth()
  ]);

  const mongoStateMap: Record<number, string> = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  const mongoStatus = mongoStateMap[mongoose.connection.readyState] || 'unknown';

  const overallHealthy = aiHealth.status === 'healthy';

  return res.json({
    status: overallHealthy ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    services: {
      backend: {
        status: 'healthy',
        uptimeSeconds: Math.floor(process.uptime()),
        nodeVersion: process.version
      },
      database: {
        status: mongoStatus === 'connected' ? 'healthy' : 'disconnected_in_memory_mode',
        connectionState: mongoStatus,
        host: mongoose.connection.host || 'local_fallback'
      },
      aiEngine: aiHealth,
      ethereumRpc: ethHealth
    }
  });
}
