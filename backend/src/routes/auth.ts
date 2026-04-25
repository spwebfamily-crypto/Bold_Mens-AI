import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  login,
  logout,
  me,
  refresh,
  register,
  signInWithApple,
} from '../controllers/authController.js';

export const authRouter = Router();

authRouter.post('/register', asyncHandler(register));
authRouter.post('/login', asyncHandler(login));
authRouter.post('/refresh', asyncHandler(refresh));
authRouter.post('/apple', asyncHandler(signInWithApple));
authRouter.get('/me', asyncHandler(auth), asyncHandler(me));
authRouter.post('/logout', asyncHandler(auth), asyncHandler(logout));
