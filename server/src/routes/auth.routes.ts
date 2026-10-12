import { Router } from 'express';
import { register, login, loginDemo, getCurrentUser } from '../controllers/auth.controller.js';
import { requireAuthMiddleware } from '../middleware/auth.middleware.js';

export const authRouter = Router();

authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.post('/demo-login', loginDemo);
authRouter.get('/me', requireAuthMiddleware, getCurrentUser);
