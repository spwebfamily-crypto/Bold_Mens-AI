import { Router } from 'express';
import {
  getSubscription,
  revenueCatWebhook,
  validateSubscription,
} from '../controllers/subscriptionController.js';
import { auth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const subscriptionRouter = Router();

subscriptionRouter.get('/', asyncHandler(auth), asyncHandler(getSubscription));
subscriptionRouter.post('/validate', asyncHandler(auth), asyncHandler(validateSubscription));
subscriptionRouter.post('/revenuecat/webhook', asyncHandler(revenueCatWebhook));
