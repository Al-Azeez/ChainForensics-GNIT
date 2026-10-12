import { Router } from 'express';
import { getSystemHealth } from '../controllers/health.controller.js';

export const healthRouter = Router();

healthRouter.get('/', getSystemHealth);
