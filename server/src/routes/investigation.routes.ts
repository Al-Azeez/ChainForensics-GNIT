import { Router } from 'express';
import {
  analyze,
  getAllInvestigations,
  getInvestigationById,
  updateInvestigation,
  deleteInvestigation,
  getDemoScenariosList
} from '../controllers/investigation.controller.js';
import { optionalAuthMiddleware } from '../middleware/auth.middleware.js';

export const investigationRouter = Router();

investigationRouter.use(optionalAuthMiddleware);

investigationRouter.post('/analyze', analyze);
investigationRouter.get('/demo-scenarios', getDemoScenariosList);
investigationRouter.get('/', getAllInvestigations);
investigationRouter.get('/:id', getInvestigationById);
investigationRouter.patch('/:id', updateInvestigation);
investigationRouter.delete('/:id', deleteInvestigation);
