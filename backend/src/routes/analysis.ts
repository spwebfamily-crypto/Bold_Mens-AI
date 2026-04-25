import { Router } from 'express';
import { createAnalysis, getAnalysis, listHistory } from '../controllers/analysisController.js';
import { auth } from '../middleware/auth.js';
import { planGuard } from '../middleware/planGuard.js';
import { upload } from '../middleware/upload.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const analysisRouter = Router();

analysisRouter.get('/', asyncHandler(auth), asyncHandler(listHistory));
analysisRouter.get('/:id', asyncHandler(auth), asyncHandler(getAnalysis));
analysisRouter.post(
  '/',
  asyncHandler(auth),
  asyncHandler(planGuard),
  upload.single('image'),
  asyncHandler(createAnalysis),
);
