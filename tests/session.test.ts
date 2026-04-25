import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { Session } from '../src/models/Session';
import {
  addMessageToHistory,
  checkAndResetExpiredSession,
  getOrCreateSession,
} from '../src/services/session.service';

let mongoServer: MongoMemoryServer;

describe('session.service', () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
  });

  afterEach(async () => {
    await Session.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  it('creates a new session when none exists', async () => {
    const session = await getOrCreateSession('whatsapp:+351111111111');
    expect(session.phoneNumber).toBe('whatsapp:+351111111111');
    expect(session.state).toBe('INITIAL');
  });

  it('returns an existing session', async () => {
    const original = await getOrCreateSession('whatsapp:+351222222222');
    const again = await getOrCreateSession('whatsapp:+351222222222');
    expect(String(again._id)).toBe(String(original._id));
  });

  it('resets expired session but keeps name', async () => {
    const session = await getOrCreateSession('whatsapp:+351333333333');
    session.name = 'Rodrigo';
    session.state = 'FOLLOW_UP';
    session.lastInteraction = new Date(Date.now() - 48 * 60 * 60 * 1000);
    await session.save();

    const reset = await checkAndResetExpiredSession(session);
    expect(reset.state).toBe('INITIAL');
    expect(reset.name).toBe('Rodrigo');
  });

  it('keeps only the last 20 messages in history', async () => {
    const phoneNumber = 'whatsapp:+351444444444';
    await getOrCreateSession(phoneNumber);

    for (let index = 0; index < 25; index += 1) {
      await addMessageToHistory(phoneNumber, 'user', `message-${index}`);
    }

    const session = await Session.findOne({ phoneNumber });
    expect(session?.conversationHistory.length).toBe(20);
    expect(session?.conversationHistory[0]?.content).toBe('message-5');
  });
});
