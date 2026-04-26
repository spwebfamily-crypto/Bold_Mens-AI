import { Router } from 'express';
import { createChatReply } from '../controllers/chatController.js';
import { auth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const chatRouter = Router();

chatRouter.post('/', asyncHandler(auth), asyncHandler(createChatReply));
