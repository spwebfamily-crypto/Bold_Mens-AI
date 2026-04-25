import express from 'express';
import { handleIncomingMessage } from '../controllers/messageController';
import { validateTwilioSignature } from '../middleware/twilioValidator';
import { logger } from '../utils/logger';

const router = express.Router();

router.post('/whatsapp', validateTwilioSignature, async (req, res) => {
  res.status(200).send('<Response></Response>');

  handleIncomingMessage(req.body).catch((error) => {
    logger.error('Error while processing incoming message', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  });
});

export default router;
