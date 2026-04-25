import { Language } from '../types';

const portugueseHints = ['olá', 'ola', 'oi', 'obrigado', 'bom', 'como', 'quero', 'foto', 'cabelo', 'corte'];
const englishHints = ['hello', 'hi', 'thanks', 'good', 'how', 'want', 'photo', 'hair', 'cut'];

export function detectLanguage(text: string): Language {
  const normalized = text.toLowerCase();

  const ptScore = portugueseHints.reduce(
    (score, word) => score + (normalized.includes(word) ? 1 : 0),
    0,
  );
  const enScore = englishHints.reduce(
    (score, word) => score + (normalized.includes(word) ? 1 : 0),
    0,
  );

  if (enScore > ptScore) {
    return 'en';
  }

  return 'pt';
}
