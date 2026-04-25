import { getConditionLabel, getFaceShapeLabel, getHairTypeLabel, getScalpLabel } from '../services/hairAnalysis.service';
import { HairAnalysis, Haircut, Language, Recommendations, VisionError } from '../types';

const divider = '━━━━━━━━━━';

function splitMessage(message: string, limit = 1600): string[] {
  if (message.length <= limit) {
    return [message];
  }

  const sections = message.split(`\n\n${divider}\n\n`);
  const parts: string[] = [];
  let current = '';

  for (const section of sections) {
    const candidate = current
      ? `${current}\n\n${divider}\n\n${section}`
      : section;

    if (candidate.length <= limit) {
      current = candidate;
      continue;
    }

    if (current) {
      parts.push(current);
    }
    current = section;
  }

  if (current) {
    parts.push(current);
  }

  return parts;
}

function getFaceShapeGuidance(faceShape: HairAnalysis['faceShape'], language: Language): string {
  const guidance = {
    pt: {
      oval: 'O rosto oval aceita mais variedade, por isso priorizei cortes equilibrados e versateis.',
      round: 'Como o rosto e mais redondo, priorizei cortes com altura e laterais mais limpas para alongar.',
      square: 'Como o maxilar e forte, priorizei cortes que mantem estrutura e acabamento definido.',
      heart: 'Como a testa ganha mais destaque, priorizei cortes que equilibram topo e laterais.',
      diamond: 'Como as macas do rosto se destacam, priorizei cortes que suavizam e equilibram o contorno.',
      oblong: 'Como o rosto e mais alongado, priorizei cortes que evitam exagerar demasiada altura no topo.',
      triangle: 'Como a linha do maxilar e mais marcada, priorizei cortes que trazem equilibrio visual acima.',
      unknown: 'O formato do rosto nao ficou totalmente claro, por isso usei uma selecao mais segura e versatil.',
    },
    en: {
      oval: 'Your face shape is versatile, so I prioritized balanced cuts that work across different finishes.',
      round: 'Because your face is rounder, I prioritized cleaner sides and more height to elongate it.',
      square: 'Because your jawline is stronger, I prioritized cuts that keep structure and definition.',
      heart: 'Because the forehead stands out more, I prioritized styles that balance the top and sides.',
      diamond: 'Because the cheekbones stand out, I prioritized cuts that soften and balance the outline.',
      oblong: 'Because your face is longer, I prioritized cuts that avoid adding too much extra height.',
      triangle: 'Because the jawline is more pronounced, I prioritized styles that add visual balance above.',
      unknown: 'Your face shape was not fully clear, so I used a safer and more versatile cut selection.',
    },
  };

  return guidance[language][faceShape];
}

export function formatWelcomeMessage(language: Language, name?: string): string {
  if (language === 'en') {
    return `*Welcome to Bold Men's Salon AI*${name ? `, ${name}` : ''}\n\nI can analyze your hair from a photo and suggest cuts, products, and a daily routine.\n\nReply with your *name* to get started.`;
  }

  return `*Bem-vindo ao Bold Men's Salon AI*${name ? `, ${name}` : ''}\n\nPosso analisar o teu cabelo a partir de uma foto e sugerir cortes, produtos e uma rotina diária.\n\nResponde com o teu *nome* para começar.`;
}

export function formatAskPhotoMessage(language: Language): string {
  if (language === 'en') {
    return '*Next step:* send a clear face photo with your hair visible. Good lighting and a front angle help a lot.';
  }

  return '*Próximo passo:* envia uma foto nítida do rosto com o cabelo visível. Boa luz e um ângulo frontal ajudam bastante.';
}

export function formatAnalyzingMessage(language: Language): string {
  return language === 'en'
    ? '🔍 Analyzing your photo now. This can take a few seconds...'
    : '🔍 Estou a analisar a tua foto agora. Isto pode demorar alguns segundos...';
}

export function formatFollowUpMenu(language: Language): string {
  if (language === 'en') {
    return `*What would you like next?*\n1. More haircut details\n2. More product details\n3. Booking link\n4. New photo analysis\n\nType a number or ask a follow-up question.`;
  }

  return `*O que queres ver a seguir?*\n1. Mais detalhes dos cortes\n2. Mais detalhes dos produtos\n3. Link de agendamento\n4. Nova análise com outra foto\n\nEscreve um número ou faz uma pergunta.`;
}

export function formatBookingMessage(language: Language): string {
  if (language === 'en') {
    return `📅 *Book your visit*\n\nWebsite: https://boldmens.co\nBooking: https://boldmens.co\n\nIf you want, send another photo for a new analysis.`;
  }

  return `📅 *Marca a tua visita*\n\nWebsite: https://boldmens.co\nAgendamento: https://boldmens.co\n\nSe quiseres, envia outra foto para fazer nova análise.`;
}

export function formatErrorMessage(
  errorCode: VisionError['error'] | 'INVALID_FILE_TYPE' | 'FILE_TOO_LARGE' | 'DOWNLOAD_FAILED',
  language: Language,
): string {
  const messages = {
    pt: {
      IMAGE_QUALITY_TOO_LOW: 'A foto não tem qualidade suficiente. Tenta com mais luz e o rosto bem visível.',
      NO_FACE_DETECTED: 'Não consegui detetar um rosto humano na imagem. Envia uma foto frontal do teu rosto.',
      ANALYSIS_FAILED: 'A análise falhou desta vez. Envia a foto novamente.',
      INVALID_FILE_TYPE: 'O ficheiro enviado não é suportado. Usa JPEG, PNG ou WebP.',
      FILE_TOO_LARGE: 'A imagem é demasiado grande. Envia uma foto até 5 MB.',
      DOWNLOAD_FAILED: 'Não consegui descarregar a imagem do Twilio. Tenta outra vez.',
    },
    en: {
      IMAGE_QUALITY_TOO_LOW: 'The photo quality is too low. Try again with better lighting and a clear face shot.',
      NO_FACE_DETECTED: 'I could not detect a human face. Please send a clear front-facing photo.',
      ANALYSIS_FAILED: 'The analysis failed this time. Please send the photo again.',
      INVALID_FILE_TYPE: 'Unsupported file type. Please use JPEG, PNG, or WebP.',
      FILE_TOO_LARGE: 'The image is too large. Please send a photo up to 5 MB.',
      DOWNLOAD_FAILED: 'I could not download the Twilio image. Please try again.',
    },
  };

  return `⚠️ ${messages[language][errorCode]}`;
}

export function formatAnalysisResponse(
  analysis: HairAnalysis,
  recommendations: Recommendations,
  language: Language,
): string[] {
  const isEn = language === 'en';

  const haircuts = recommendations.haircuts
    .map((haircut, index) => `${index + 1}. ${haircut.emoji} *${isEn ? haircut.nameEn : haircut.name}*`)
    .join('\n');

  const products = recommendations.products
    .map((product) => `${product.emoji} *${product.name}*`)
    .join('\n');

  const routine = recommendations.routine.map((step, index) => `${index + 1}. ${step}`).join('\n');

  const message = [
    `💈 *${isEn ? "Your Bold Men's Analysis" : 'A tua análise Bold Men\'s'}*`,
    `_${recommendations.summary}_`,
    divider,
    `${isEn ? '🧠 Face shape' : '🧠 Formato do rosto'}: *${getFaceShapeLabel(analysis.faceShape, language)}*`,
    `${isEn ? 'Why it matters' : 'Porque isto importa'}: _${getFaceShapeGuidance(analysis.faceShape, language)}_`,
    `${isEn ? '🧴 Hair type' : '🧴 Tipo de cabelo'}: *${getHairTypeLabel(analysis, language)}*`,
    `${isEn ? '💧 Condition' : '💧 Condição'}: *${getConditionLabel(analysis.hairCondition, language)}*`,
    `${isEn ? '🫧 Scalp' : '🫧 Couro cabeludo'}: *${getScalpLabel(analysis.hairCondition.scalpCondition, language)}*`,
    `${isEn ? '📏 Current length' : '📏 Comprimento atual'}: *${analysis.currentLength}*`,
    divider,
    `${isEn ? '✂️ Recommended cuts' : '✂️ Cortes recomendados'}\n${haircuts}`,
    divider,
    `${isEn ? '🧴 Suggested products' : '🧴 Produtos sugeridos'}\n${products}`,
    divider,
    `${isEn ? '📅 Daily routine' : '📅 Rotina diária'}\n${routine}`,
  ].join('\n\n');

  return splitMessage(message);
}

export function formatHaircutReferenceCaption(haircut: Haircut, language: Language, position: number): string {
  if (language === 'en') {
    return `Reference ${position}: *${haircut.nameEn}*\n${haircut.descriptionEn}`;
  }

  return `Referencia ${position}: *${haircut.name}*\n${haircut.description}`;
}
