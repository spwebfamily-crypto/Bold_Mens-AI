import Anthropic from '@anthropic-ai/sdk';
import { detectLanguage } from '../utils/languageDetector';
import {
  formatAnalysisResponse,
  formatAnalyzingMessage,
  formatAskPhotoMessage,
  formatBookingMessage,
  formatErrorMessage,
  formatFollowUpMenu,
  formatWelcomeMessage,
} from '../utils/responseFormatter';
import { logger } from '../utils/logger';
import { downloadTwilioImage, DownloadError } from '../utils/imageDownloader';
import { generateRecommendations } from '../services/recommendation.service';
import { analyzeHairFromImage } from '../services/vision.service';
import {
  addMessageToHistory,
  checkAndResetExpiredSession,
  getOrCreateSession,
  saveAnalysis,
  updateSessionState,
} from '../services/session.service';
import { sendMessage, sendMultipleMessages } from '../services/whatsapp.service';
import { Haircut, Language, Product, TwilioWebhookBody } from '../types';

const perNumberRateLimit = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_PER_MINUTE = 20;

function extractText(content: unknown): string {
  if (!Array.isArray(content)) {
    return '';
  }

  return content
    .filter((item): item is { type: string; text?: string } => typeof item === 'object' && item !== null && 'type' in item)
    .filter((item) => item.type === 'text' && typeof item.text === 'string')
    .map((item) => item.text)
    .join('\n');
}

function isNumberRateLimited(phoneNumber: string): boolean {
  const now = Date.now();
  const entry = perNumberRateLimit.get(phoneNumber);

  if (!entry || entry.resetAt <= now) {
    perNumberRateLimit.set(phoneNumber, { count: 1, resetAt: now + 60_000 });
    return false;
  }

  entry.count += 1;
  return entry.count > RATE_LIMIT_PER_MINUTE;
}

async function sendTrackedMessage(phoneNumber: string, body: string): Promise<void> {
  await sendMessage(phoneNumber, body);
  await addMessageToHistory(phoneNumber, 'assistant', body);
}

async function sendTrackedMessages(phoneNumber: string, messages: string[]): Promise<void> {
  await sendMultipleMessages(phoneNumber, messages);
  for (const message of messages) {
    await addMessageToHistory(phoneNumber, 'assistant', message);
  }
}

function isMenuOption(text: string, options: string[]): boolean {
  return options.includes(text.trim().toLowerCase());
}

function formatHaircutDetails(haircuts: Haircut[], language: Language): string {
  const isEn = language === 'en';
  const lines = haircuts.map(
    (haircut, index) =>
      `${index + 1}. ${haircut.emoji} *${isEn ? haircut.nameEn : haircut.name}*\n${isEn ? haircut.descriptionEn : haircut.description}\n${isEn ? 'Maintenance' : 'Manutencao'}: ${haircut.maintenanceLevel}`,
  );

  return isEn
    ? `*Haircut details*\n\n${lines.join('\n\n')}`
    : `*Detalhes dos cortes*\n\n${lines.join('\n\n')}`;
}

function formatProductDetails(products: Product[], language: Language): string {
  const isEn = language === 'en';
  const lines = products.map(
    (product) =>
      `${product.emoji} *${product.name}*\n${isEn ? product.howToUse : product.howToUsePt}\n${isEn ? 'Price' : 'Preco'}: ${product.price}`,
  );

  return isEn
    ? `*Product details*\n\n${lines.join('\n\n')}`
    : `*Detalhes dos produtos*\n\n${lines.join('\n\n')}`;
}

async function getFollowUpClient(): Promise<Anthropic> {
  const { env } = await import('../config/env');
  return new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
}

async function generateFollowUpResponse(
  language: Language,
  question: string,
  sessionContext: string,
): Promise<string> {
  const client = await getFollowUpClient();
  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 500,
    system:
      language === 'en'
        ? 'You are a premium barber assistant for Bold Men\'s Salon. Answer briefly in English using the provided analysis and recommendation context only.'
        : 'Es um assistente premium de barbearia da Bold Men\'s Salon. Responde de forma breve em portugues europeu usando apenas o contexto fornecido de analise e recomendacoes.',
    messages: [
      {
        role: 'user',
        content: `Context:\n${sessionContext}\n\nQuestion:\n${question}`,
      },
    ],
  });

  return extractText(response.content);
}

export async function handleIncomingMessage(body: TwilioWebhookBody): Promise<void> {
  const phoneNumber = body.From;
  const text = body.Body?.trim() ?? '';
  const hasImage = Number(body.NumMedia ?? '0') > 0;

  if (isNumberRateLimited(phoneNumber)) {
    await sendTrackedMessage(
      phoneNumber,
      'Too many messages in a short period. Please wait a moment and try again.',
    );
    return;
  }

  await addMessageToHistory(phoneNumber, 'user', text || '[image]', hasImage);

  let session = await getOrCreateSession(phoneNumber);
  session = await checkAndResetExpiredSession(session);

  logger.info('Incoming WhatsApp message', {
    phoneNumber,
    state: session.state,
    hasImage,
  });

  switch (session.state) {
    case 'INITIAL': {
      const language = detectLanguage(text || body.ProfileName || '');
      session.language = language;
      session.lastInteraction = new Date();
      await session.save();

      await sendTrackedMessage(phoneNumber, formatWelcomeMessage(language, body.ProfileName));
      await updateSessionState(phoneNumber, 'WAITING_NAME');
      return;
    }

    case 'WAITING_NAME': {
      if (!text) {
        await sendTrackedMessage(phoneNumber, session.language === 'en' ? 'Please send your name first.' : 'Envia primeiro o teu nome.');
        return;
      }

      session.name = text;
      session.lastInteraction = new Date();
      await session.save();

      const message = formatAskPhotoMessage(session.language);
      await sendTrackedMessage(phoneNumber, message);
      await updateSessionState(phoneNumber, 'WAITING_PHOTO');
      return;
    }

    case 'WAITING_PHOTO': {
      if (!hasImage || !body.MediaUrl0) {
        session.photoAttempts += 1;
        session.lastInteraction = new Date();
        await session.save();

        const reminders = [
          formatAskPhotoMessage(session.language),
          session.photoAttempts >= 3
            ? session.language === 'en'
              ? 'Tip: send a front-facing photo with your full hairline visible and decent light.'
              : 'Dica: envia uma foto frontal, com a linha do cabelo visivel e boa luz.'
            : '',
        ].filter(Boolean) as string[];

        await sendTrackedMessages(phoneNumber, reminders);
        return;
      }

      await updateSessionState(phoneNumber, 'ANALYZING');
      await sendTrackedMessage(phoneNumber, formatAnalyzingMessage(session.language));

      const startedAt = Date.now();

      try {
        const downloaded = await downloadTwilioImage(body.MediaUrl0);
        const visionResult = await analyzeHairFromImage(downloaded.base64, downloaded.mimeType);

        if ('error' in visionResult) {
          await sendTrackedMessage(phoneNumber, formatErrorMessage(visionResult.error, session.language));
          await updateSessionState(phoneNumber, 'WAITING_PHOTO');
          return;
        }

        const recommendations = await generateRecommendations(visionResult, session.language);
        await saveAnalysis(
          phoneNumber,
          visionResult,
          recommendations,
          downloaded.cloudinaryUrl,
          Date.now() - startedAt,
        );

        const resultMessages = formatAnalysisResponse(visionResult, recommendations, session.language);
        await sendTrackedMessages(phoneNumber, resultMessages);
        await sendTrackedMessage(phoneNumber, formatFollowUpMenu(session.language));
        await updateSessionState(phoneNumber, 'SHOWING_RESULTS');
      } catch (error) {
        if (error instanceof DownloadError) {
          await sendTrackedMessage(phoneNumber, formatErrorMessage(error.code, session.language));
        } else {
          await sendTrackedMessage(phoneNumber, formatErrorMessage('ANALYSIS_FAILED', session.language));
        }

        logger.error('Photo processing failed', {
          phoneNumber,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        await updateSessionState(phoneNumber, 'WAITING_PHOTO');
      }

      return;
    }

    case 'ANALYZING': {
      await sendTrackedMessage(phoneNumber, formatAnalyzingMessage(session.language));
      return;
    }

    case 'SHOWING_RESULTS': {
      const lastAnalysis = session.lastAnalysis;
      if (!lastAnalysis) {
        await sendTrackedMessage(phoneNumber, formatAskPhotoMessage(session.language));
        await updateSessionState(phoneNumber, 'WAITING_PHOTO');
        return;
      }

      if (text === '1') {
        await sendTrackedMessage(
          phoneNumber,
          formatHaircutDetails(lastAnalysis.recommendations.haircuts, session.language),
        );
        await updateSessionState(phoneNumber, 'FOLLOW_UP');
        return;
      }

      if (text === '2') {
        await sendTrackedMessage(
          phoneNumber,
          formatProductDetails(lastAnalysis.recommendations.products, session.language),
        );
        await updateSessionState(phoneNumber, 'FOLLOW_UP');
        return;
      }

      if (text === '3') {
        await sendTrackedMessage(phoneNumber, formatBookingMessage(session.language));
        await updateSessionState(phoneNumber, 'BOOKING');
        return;
      }

      if (text === '4') {
        await sendTrackedMessage(phoneNumber, formatAskPhotoMessage(session.language));
        await updateSessionState(phoneNumber, 'WAITING_PHOTO');
        return;
      }

      await sendTrackedMessage(phoneNumber, formatFollowUpMenu(session.language));
      return;
    }

    case 'FOLLOW_UP': {
      if (isMenuOption(text, ['menu', '0', 'voltar', 'back'])) {
        await sendTrackedMessage(phoneNumber, formatFollowUpMenu(session.language));
        await updateSessionState(phoneNumber, 'SHOWING_RESULTS');
        return;
      }

      if (!session.lastAnalysis) {
        await sendTrackedMessage(phoneNumber, formatAskPhotoMessage(session.language));
        await updateSessionState(phoneNumber, 'WAITING_PHOTO');
        return;
      }

      try {
        const history = session.conversationHistory
          .slice(-8)
          .map((item) => `${item.role}: ${item.content}`)
          .join('\n');
        const context = JSON.stringify(
          {
            analysis: session.lastAnalysis.hairAnalysis,
            recommendations: session.lastAnalysis.recommendations,
            history,
          },
          null,
          2,
        );

        const reply = await generateFollowUpResponse(session.language, text, context);
        await sendTrackedMessage(phoneNumber, reply || formatFollowUpMenu(session.language));
      } catch (error) {
        logger.error('Follow-up generation failed', {
          phoneNumber,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        await sendTrackedMessage(phoneNumber, formatFollowUpMenu(session.language));
      }

      return;
    }

    case 'BOOKING': {
      if (isMenuOption(text, ['4', 'new', 'new analysis', 'nova', 'nova analise', 'foto', 'photo'])) {
        await sendTrackedMessage(phoneNumber, formatAskPhotoMessage(session.language));
        await updateSessionState(phoneNumber, 'WAITING_PHOTO');
        return;
      }

      await sendTrackedMessage(phoneNumber, formatBookingMessage(session.language));
      return;
    }
  }
}
