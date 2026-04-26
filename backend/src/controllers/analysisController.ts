import type { Request, Response } from 'express';
import { Analysis } from '../models/Analysis.js';
import { User } from '../models/User.js';
import { analyzeSelfie } from '../services/vision.service.js';
import { uploadAnalysisImage } from '../services/cloudinary.service.js';
import { getImageDeleteAt } from '../utils/dateUtils.js';

function sendEvent(res: Response, event: string, data: unknown) {
  res.write(`event: ${event}\n`);
  res.write(`data: ${JSON.stringify(data)}\n\n`);
}

export async function createAnalysis(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({ error: 'AUTH_REQUIRED' });
  }

  if (!req.file) {
    return res.status(400).json({ error: 'IMAGE_REQUIRED' });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  try {
    sendEvent(res, 'status', { step: 'uploading_image' });

    const imageUrl = await uploadAnalysisImage({
      buffer: req.file.buffer,
      mimetype: req.file.mimetype,
      userId: req.user._id.toString(),
    });

    sendEvent(res, 'status', { step: 'analyzing_selfie' });

    const structured = await analyzeSelfie({
      imageBase64: req.file.buffer.toString('base64'),
      mimeType: req.file.mimetype,
      plan: req.user.plan,
      onText: (chunk) => sendEvent(res, 'delta', { text: chunk }),
    });

    const assistantText = structured.recommendations.haircut.reason;
    const analysis = await Analysis.create({
      userId: req.user._id,
      imageUrl,
      imageDeleteAt: getImageDeleteAt(),
      faceShape: structured.faceShape,
      faceAnalysis: structured.faceAnalysis,
      hairType: structured.hairType,
      hairCondition: structured.hairCondition,
      recommendations: structured.recommendations,
      trends: structured.trends,
      references: structured.references,
      chatMessages: [
        {
          role: 'user',
          content: 'Selfie enviada para analise.',
          createdAt: new Date(),
        },
        {
          role: 'assistant',
          content: assistantText,
          createdAt: new Date(),
        },
      ],
    });

    await User.updateOne({ _id: req.user._id }, { $inc: { totalAnalyses: 1 } });

    sendEvent(res, 'final', {
      analysisId: analysis._id.toString(),
      imageUrl,
      ...structured,
    });
  } catch (error) {
    sendEvent(res, 'error', {
      message: error instanceof Error ? error.message : 'Analysis failed',
    });
  } finally {
    res.end();
  }
}

export async function listHistory(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({ error: 'AUTH_REQUIRED' });
  }

  const days = req.user.plan === 'plus' ? 365 : 7;
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const analyses = await Analysis.find({
    userId: req.user._id,
    createdAt: { $gte: since },
  })
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();

  return res.json({ analyses, retentionDays: days });
}

export async function getAnalysis(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({ error: 'AUTH_REQUIRED' });
  }

  const analysis = await Analysis.findOne({
    _id: req.params.id,
    userId: req.user._id,
  }).lean();

  if (!analysis) {
    return res.status(404).json({ error: 'ANALYSIS_NOT_FOUND' });
  }

  return res.json({ analysis });
}
