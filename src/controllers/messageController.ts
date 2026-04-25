import { generateRecommendations } from '../services/recommendation.service';
import {
  addMessageToHistory,
  checkAndResetExpiredSession,
  getOrCreateSession,
  saveAnalysis,
  updateSessionState,
} from '../services/session.service';
import { sendMultipleMediaMessages, sendMultipleMessages, sendMessage } from '../services/whatsapp.service';
import { detectLanguage } from '../utils/languageDetector';
import {
  formatAnalysisResponse,
  formatBookingMessage,
  formatFollowUpMenu,
  formatHaircutReferenceCaption,
  formatWelcomeMessage,
} from '../utils/responseFormatter';
import { logger } from '../utils/logger';
import { HairAnalysis, HairTexture, Language, Product, QuizProfileDraft, TwilioWebhookBody, Haircut } from '../types';

const perNumberRateLimit = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_PER_MINUTE = 20;

const freeModeNotice = {
  pt: 'Modo gratuito ativo: em vez de analisar foto, vou recomendar pelo quiz rapido.',
  en: 'Free mode is active: instead of photo analysis, I will recommend via a quick quiz.',
};

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

async function sendTrackedMediaMessages(
  phoneNumber: string,
  messages: Array<{ body: string; mediaUrl: string }>,
): Promise<void> {
  await sendMultipleMediaMessages(phoneNumber, messages);
  for (const message of messages) {
    await addMessageToHistory(phoneNumber, 'assistant', `${message.body}\n[media] ${message.mediaUrl}`);
  }
}

function isMenuOption(text: string, options: string[]): boolean {
  return options.includes(text.trim().toLowerCase());
}

function normalizeText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim();
}

function getFaceShapeQuestion(language: Language): string {
  return language === 'en'
    ? '*Question 1/4* Which face shape fits you best?\n1. Oval\n2. Round\n3. Square\n4. Heart\n5. Diamond\n6. Long/Oblong\n7. Triangle'
    : '*Pergunta 1/4* Qual formato de rosto combina mais contigo?\n1. Oval\n2. Redondo\n3. Quadrado\n4. Coracao\n5. Diamante\n6. Alongado\n7. Triangular';
}

function getHairTextureQuestion(language: Language): string {
  return language === 'en'
    ? '*Question 2/4* What is your hair texture?\n1. Straight\n2. Wavy\n3. Curly\n4. Coily\n5. Afro'
    : '*Pergunta 2/4* Qual e a textura do teu cabelo?\n1. Liso\n2. Ondulado\n3. Encaracolado\n4. Crespo\n5. Afro';
}

function getLengthQuestion(language: Language): string {
  return language === 'en'
    ? '*Question 3/4* What is your current length?\n1. Buzz/Bald\n2. Short\n3. Medium\n4. Long'
    : '*Pergunta 3/4* Qual e o comprimento atual?\n1. Rapado/Buzz\n2. Curto\n3. Medio\n4. Comprido';
}

function getBeardQuestion(language: Language): string {
  return language === 'en'
    ? '*Question 4/4* Do you wear a beard?\n1. Yes\n2. No'
    : '*Pergunta 4/4* Usas barba?\n1. Sim\n2. Nao';
}

function getMaintenanceQuestion(language: Language): string {
  return language === 'en'
    ? '*Final question* What maintenance level do you want?\n1. Low\n2. Medium\n3. High'
    : '*Pergunta final* Que nivel de manutencao preferes?\n1. Baixa\n2. Media\n3. Alta';
}

function formatQuizIntro(language: Language): string {
  return language === 'en'
    ? `${freeModeNotice.en}\n\nI will ask 5 quick questions and then recommend cuts, products, and send visual references.`
    : `${freeModeNotice.pt}\n\nVou fazer 5 perguntas rapidas e depois recomendar cortes, produtos e referencias visuais.`;
}

function formatQuizPhotoRedirect(language: Language): string {
  return language === 'en'
    ? `${freeModeNotice.en}\n\nPlease answer the quiz instead of sending a photo.`
    : `${freeModeNotice.pt}\n\nResponde ao quiz em vez de enviar foto.`;
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

function parseFaceShape(text: string): HairAnalysis['faceShape'] | null {
  const value = normalizeText(text);
  if (['1', 'oval'].includes(value)) return 'oval';
  if (['2', 'redondo', 'round'].includes(value)) return 'round';
  if (['3', 'quadrado', 'square'].includes(value)) return 'square';
  if (['4', 'coracao', 'heart'].includes(value)) return 'heart';
  if (['5', 'diamante', 'diamond'].includes(value)) return 'diamond';
  if (['6', 'alongado', 'oblong', 'long'].includes(value)) return 'oblong';
  if (['7', 'triangular', 'triangle'].includes(value)) return 'triangle';
  return null;
}

function parseHairTexture(text: string): HairTexture | null {
  const value = normalizeText(text);
  if (['1', 'liso', 'straight'].includes(value)) return 'straight';
  if (['2', 'ondulado', 'wavy'].includes(value)) return 'wavy';
  if (['3', 'encaracolado', 'cacheado', 'curly'].includes(value)) return 'curly';
  if (['4', 'crespo', 'coily'].includes(value)) return 'coily';
  if (['5', 'afro'].includes(value)) return 'afro';
  return null;
}

function parseLength(text: string): HairAnalysis['currentLength'] | null {
  const value = normalizeText(text);
  if (['1', 'buzz', 'rapado', 'bald'].includes(value)) return 'buzz';
  if (['2', 'curto', 'short'].includes(value)) return 'short';
  if (['3', 'medio', 'medium'].includes(value)) return 'medium';
  if (['4', 'comprido', 'longo', 'long'].includes(value)) return 'long';
  return null;
}

function parseBeard(text: string): boolean | null {
  const value = normalizeText(text);
  if (['1', 'sim', 'yes', 'y'].includes(value)) return true;
  if (['2', 'nao', 'não', 'no', 'n'].includes(value)) return false;
  return null;
}

function parseMaintenance(text: string): Haircut['maintenanceLevel'] | null {
  const value = normalizeText(text);
  if (['1', 'baixa', 'low'].includes(value)) return 'low';
  if (['2', 'media', 'medium'].includes(value)) return 'medium';
  if (['3', 'alta', 'high'].includes(value)) return 'high';
  return null;
}

function inferTypeCode(texture: HairTexture): HairAnalysis['hairType']['typeCode'] {
  switch (texture) {
    case 'straight':
      return '1B';
    case 'wavy':
      return '2B';
    case 'curly':
      return '3A';
    case 'coily':
      return '4A';
    case 'afro':
      return '4C';
  }
}

function buildAnalysisFromQuiz(quizDraft: QuizProfileDraft): HairAnalysis {
  const texture = quizDraft.hairTexture ?? 'wavy';
  const currentLength = quizDraft.currentLength ?? 'short';
  const beard = quizDraft.beard ?? false;

  return {
    faceShape: quizDraft.faceShape ?? 'unknown',
    hairType: {
      texture,
      typeCode: inferTypeCode(texture),
      density: texture === 'afro' || texture === 'coily' ? 'thick' : 'medium',
      porosity: texture === 'straight' ? 'normal' : 'high',
    },
    hairCondition: {
      moisture: texture === 'straight' ? 'normal' : 'dry',
      damage: 'mild',
      scalpCondition: 'normal',
    },
    currentLength,
    facialFeatures: {
      beard,
      beardStyle: beard ? 'short beard' : null,
      foreheadSize: 'medium',
      jawlineDefinition: quizDraft.faceShape === 'square' || quizDraft.faceShape === 'triangle' ? 'strong' : 'defined',
    },
    confidence: 0.74,
    additionalNotes:
      quizDraft.preferredMaintenance
        ? `Built from quiz answers with ${quizDraft.preferredMaintenance} maintenance preference.`
        : 'Built from quiz answers.',
  };
}

function buildFollowUpReply(text: string, language: Language): string {
  const value = normalizeText(text);
  if (value.includes('produto') || value.includes('product')) {
    return language === 'en'
      ? 'Type *2* and I will show the product details again.'
      : 'Escreve *2* e eu mostro novamente os detalhes dos produtos.';
  }
  if (value.includes('corte') || value.includes('haircut') || value.includes('cut')) {
    return language === 'en'
      ? 'Type *1* and I will show the haircut details again.'
      : 'Escreve *1* e eu mostro novamente os detalhes dos cortes.';
  }
  if (value.includes('marcar') || value.includes('book')) {
    return language === 'en'
      ? 'Type *3* and I will send the booking link.'
      : 'Escreve *3* e eu envio o link de agendamento.';
  }

  return language === 'en'
    ? 'I am in free quiz mode right now. Use the menu to review cuts, products, or booking.'
    : 'Estou em modo gratuito por quiz. Usa o menu para rever cortes, produtos ou agendamento.';
}

function requireQuizInput(language: Language, question: string): string {
  return language === 'en'
    ? `Please answer using one of the listed options.\n\n${question}`
    : `Responde usando uma das opcoes listadas.\n\n${question}`;
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

      await sendTrackedMessages(phoneNumber, [
        formatWelcomeMessage(language, body.ProfileName),
        formatQuizIntro(language),
      ]);
      await updateSessionState(phoneNumber, 'WAITING_NAME');
      return;
    }

    case 'WAITING_NAME': {
      if (!text) {
        await sendTrackedMessage(phoneNumber, session.language === 'en' ? 'Please send your name first.' : 'Envia primeiro o teu nome.');
        return;
      }

      session.name = text;
      session.quizDraft = {};
      session.lastInteraction = new Date();
      await session.save();

      await sendTrackedMessage(phoneNumber, getFaceShapeQuestion(session.language));
      await updateSessionState(phoneNumber, 'WAITING_FACE_SHAPE');
      return;
    }

    case 'WAITING_FACE_SHAPE': {
      if (hasImage) {
        await sendTrackedMessage(phoneNumber, formatQuizPhotoRedirect(session.language));
        await sendTrackedMessage(phoneNumber, getFaceShapeQuestion(session.language));
        return;
      }

      const faceShape = parseFaceShape(text);
      if (!faceShape) {
        await sendTrackedMessage(phoneNumber, requireQuizInput(session.language, getFaceShapeQuestion(session.language)));
        return;
      }

      session.quizDraft = { ...(session.quizDraft ?? {}), faceShape };
      await session.save();
      await sendTrackedMessage(phoneNumber, getHairTextureQuestion(session.language));
      await updateSessionState(phoneNumber, 'WAITING_HAIR_TEXTURE');
      return;
    }

    case 'WAITING_HAIR_TEXTURE': {
      if (hasImage) {
        await sendTrackedMessage(phoneNumber, formatQuizPhotoRedirect(session.language));
        await sendTrackedMessage(phoneNumber, getHairTextureQuestion(session.language));
        return;
      }

      const hairTexture = parseHairTexture(text);
      if (!hairTexture) {
        await sendTrackedMessage(phoneNumber, requireQuizInput(session.language, getHairTextureQuestion(session.language)));
        return;
      }

      session.quizDraft = { ...(session.quizDraft ?? {}), hairTexture };
      await session.save();
      await sendTrackedMessage(phoneNumber, getLengthQuestion(session.language));
      await updateSessionState(phoneNumber, 'WAITING_LENGTH');
      return;
    }

    case 'WAITING_LENGTH': {
      if (hasImage) {
        await sendTrackedMessage(phoneNumber, formatQuizPhotoRedirect(session.language));
        await sendTrackedMessage(phoneNumber, getLengthQuestion(session.language));
        return;
      }

      const currentLength = parseLength(text);
      if (!currentLength) {
        await sendTrackedMessage(phoneNumber, requireQuizInput(session.language, getLengthQuestion(session.language)));
        return;
      }

      session.quizDraft = { ...(session.quizDraft ?? {}), currentLength };
      await session.save();
      await sendTrackedMessage(phoneNumber, getBeardQuestion(session.language));
      await updateSessionState(phoneNumber, 'WAITING_BEARD');
      return;
    }

    case 'WAITING_BEARD': {
      if (hasImage) {
        await sendTrackedMessage(phoneNumber, formatQuizPhotoRedirect(session.language));
        await sendTrackedMessage(phoneNumber, getBeardQuestion(session.language));
        return;
      }

      const beard = parseBeard(text);
      if (beard === null) {
        await sendTrackedMessage(phoneNumber, requireQuizInput(session.language, getBeardQuestion(session.language)));
        return;
      }

      session.quizDraft = { ...(session.quizDraft ?? {}), beard };
      await session.save();
      await sendTrackedMessage(phoneNumber, getMaintenanceQuestion(session.language));
      await updateSessionState(phoneNumber, 'WAITING_MAINTENANCE');
      return;
    }

    case 'WAITING_MAINTENANCE': {
      if (hasImage) {
        await sendTrackedMessage(phoneNumber, formatQuizPhotoRedirect(session.language));
        await sendTrackedMessage(phoneNumber, getMaintenanceQuestion(session.language));
        return;
      }

      const preferredMaintenance = parseMaintenance(text);
      if (!preferredMaintenance) {
        await sendTrackedMessage(phoneNumber, requireQuizInput(session.language, getMaintenanceQuestion(session.language)));
        return;
      }

      session.quizDraft = { ...(session.quizDraft ?? {}), preferredMaintenance };
      session.lastInteraction = new Date();
      await session.save();

      const analysis = buildAnalysisFromQuiz(session.quizDraft ?? {});
      const recommendations = await generateRecommendations(analysis, session.language, session.quizDraft);
      await saveAnalysis(phoneNumber, analysis, recommendations);

      const resultMessages = formatAnalysisResponse(analysis, recommendations, session.language);
      await sendTrackedMessages(phoneNumber, resultMessages);

      const haircutMediaMessages = recommendations.haircuts
        .filter((haircut) => Boolean(haircut.imageUrl))
        .slice(0, 3)
        .map((haircut, index) => ({
          body: formatHaircutReferenceCaption(haircut, session.language, index + 1),
          mediaUrl: haircut.imageUrl as string,
        }));

      if (haircutMediaMessages.length > 0) {
        await sendTrackedMediaMessages(phoneNumber, haircutMediaMessages);
      }

      await sendTrackedMessage(phoneNumber, formatFollowUpMenu(session.language));
      await updateSessionState(phoneNumber, 'SHOWING_RESULTS');
      return;
    }

    case 'SHOWING_RESULTS': {
      const lastAnalysis = session.lastAnalysis;
      if (!lastAnalysis) {
        await sendTrackedMessage(phoneNumber, getFaceShapeQuestion(session.language));
        await updateSessionState(phoneNumber, 'WAITING_FACE_SHAPE');
        return;
      }

      if (text === '1') {
        await sendTrackedMessage(phoneNumber, formatHaircutDetails(lastAnalysis.recommendations.haircuts, session.language));
        await updateSessionState(phoneNumber, 'FOLLOW_UP');
        return;
      }

      if (text === '2') {
        await sendTrackedMessage(phoneNumber, formatProductDetails(lastAnalysis.recommendations.products, session.language));
        await updateSessionState(phoneNumber, 'FOLLOW_UP');
        return;
      }

      if (text === '3') {
        await sendTrackedMessage(phoneNumber, formatBookingMessage(session.language));
        await updateSessionState(phoneNumber, 'BOOKING');
        return;
      }

      if (text === '4') {
        session.quizDraft = {};
        await session.save();
        await sendTrackedMessage(phoneNumber, getFaceShapeQuestion(session.language));
        await updateSessionState(phoneNumber, 'WAITING_FACE_SHAPE');
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

      await sendTrackedMessage(phoneNumber, buildFollowUpReply(text, session.language));
      return;
    }

    case 'BOOKING': {
      if (isMenuOption(text, ['4', 'new', 'new analysis', 'nova', 'nova analise', 'foto', 'photo', 'quiz'])) {
        session.quizDraft = {};
        await session.save();
        await sendTrackedMessage(phoneNumber, getFaceShapeQuestion(session.language));
        await updateSessionState(phoneNumber, 'WAITING_FACE_SHAPE');
        return;
      }

      await sendTrackedMessage(phoneNumber, formatBookingMessage(session.language));
      return;
    }
  }
}
