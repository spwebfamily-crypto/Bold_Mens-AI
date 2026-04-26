import type { Request, Response } from 'express';
import { z } from 'zod';
import { answerChatWithOpenAI } from '../services/openai.service.js';
import { defaultReferences } from '../services/recommendation.service.js';

const chatSchema = z.object({
  message: z.string().trim().min(1).max(1200),
});

function fallbackAnswer(message: string) {
  const wantsReference = /\b(foto|fotos|imagem|imagens|refer[eê]ncia|referencias|visual|exemplo)\b/i.test(message);

  return {
    answer:
      'Para uma recomendacao precisa, envia uma selfie com boa luz e cabelo visivel. Se quiseres uma direcao ja, pede pelo tipo de corte, rotina ou formato de rosto e eu devolvo opcoes praticas para mostrares ao barbeiro.',
    references: wantsReference ? defaultReferences(2) : [],
  };
}

export async function createChatReply(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({ error: 'AUTH_REQUIRED' });
  }

  const { message } = chatSchema.parse(req.body);

  try {
    const response = await answerChatWithOpenAI({
      message,
      plan: req.user.plan,
      userName: req.user.name,
    });
    return res.json(response);
  } catch (error) {
    console.warn('OpenAI chat failed, using fallback answer.', error);
    return res.json(fallbackAnswer(message));
  }
}
