import { Analysis } from '../models/Analysis';
import { Session, ISession } from '../models/Session';
import { HairAnalysis, Recommendations, SessionState } from '../types';

function getSessionExpiryHours(): number {
  return Number(process.env.SESSION_EXPIRY_HOURS ?? 24);
}

export async function getOrCreateSession(phoneNumber: string): Promise<ISession> {
  const existing = await Session.findOne({ phoneNumber });
  if (existing) {
    existing.lastInteraction = new Date();
    await existing.save();
    return existing;
  }

  return Session.create({
    phoneNumber,
    state: 'INITIAL',
    language: 'pt',
    lastInteraction: new Date(),
  });
}

export async function updateSessionState(phoneNumber: string, state: SessionState): Promise<void> {
  await Session.updateOne(
    { phoneNumber },
    {
      $set: {
        state,
        lastInteraction: new Date(),
      },
    },
  );
}

export async function checkAndResetExpiredSession(session: ISession): Promise<ISession> {
  const expiryHours = getSessionExpiryHours();
  const elapsedMs = Date.now() - new Date(session.lastInteraction).getTime();
  const hasExpired = elapsedMs > expiryHours * 60 * 60 * 1000;

  if (!hasExpired) {
    return session;
  }

  session.state = 'INITIAL';
  session.lastAnalysis = undefined;
  session.photoAttempts = 0;
  session.conversationHistory = [];
  session.lastInteraction = new Date();
  await session.save();

  return session;
}

export async function addMessageToHistory(
  phoneNumber: string,
  role: 'user' | 'assistant',
  content: string,
  hasImage = false,
): Promise<void> {
  await Session.updateOne(
    { phoneNumber },
    {
      $push: {
        conversationHistory: {
          role,
          content,
          timestamp: new Date(),
          hasImage,
        },
      },
      $set: { lastInteraction: new Date() },
    },
  );

  const session = await Session.findOne({ phoneNumber });
  if (session && session.conversationHistory.length > 20) {
    session.conversationHistory = session.conversationHistory.slice(-20);
    await session.save();
  }
}

export async function saveAnalysis(
  phoneNumber: string,
  hairAnalysis: HairAnalysis,
  recommendations: Recommendations,
  imageUrl?: string,
  processingTimeMs = 0,
): Promise<void> {
  const session = await getOrCreateSession(phoneNumber);

  session.lastAnalysis = {
    hairAnalysis,
    recommendations,
    analyzedAt: new Date(),
    imageUrl,
  };
  session.totalAnalyses += 1;
  session.photoAttempts = 0;
  session.lastInteraction = new Date();
  await session.save();

  await Analysis.create({
    phoneNumber,
    sessionId: session.id,
    hairAnalysis,
    recommendations,
    imageUrl,
    processingTimeMs,
  });
}
