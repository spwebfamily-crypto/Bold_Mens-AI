import twilio from 'twilio';
import { env } from '../config/env';
import { logger } from '../utils/logger';

const client = twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN);

function sleep(delayMs: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, delayMs));
}

export async function sendMessage(to: string, body: string): Promise<void> {
  await client.messages.create({
    from: env.TWILIO_WHATSAPP_FROM,
    to,
    body,
  });

  logger.info('WhatsApp message sent', { to });
}

export async function sendMediaMessage(to: string, body: string, mediaUrl: string): Promise<void> {
  await client.messages.create({
    from: env.TWILIO_WHATSAPP_FROM,
    to,
    body,
    mediaUrl: [mediaUrl],
  });

  logger.info('WhatsApp media message sent', { to, mediaUrl });
}

export async function sendWithDelay(to: string, body: string, delayMs: number): Promise<void> {
  await sleep(delayMs);
  await sendMessage(to, body);
}

export async function sendMultipleMessages(to: string, messages: string[]): Promise<void> {
  for (const [index, message] of messages.entries()) {
    await sendWithDelay(to, message, index === 0 ? 0 : 650);
  }
}

export async function sendMultipleMediaMessages(
  to: string,
  messages: Array<{ body: string; mediaUrl: string }>,
): Promise<void> {
  for (const [index, message] of messages.entries()) {
    await sleep(index === 0 ? 0 : 650);
    await sendMediaMessage(to, message.body, message.mediaUrl);
  }
}
