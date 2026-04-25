import { Router } from 'express';
import { getTrends } from '../controllers/trendsController.js';
import { auth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const trendsRouter = Router();

trendsRouter.get('/', asyncHandler(auth), asyncHandler(getTrends));
