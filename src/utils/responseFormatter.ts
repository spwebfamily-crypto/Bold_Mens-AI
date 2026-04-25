import { getConditionLabel, getFaceShapeLabel, getHairTypeLabel, getScalpLabel } from '../services/hairAnalysis.service';
import { HairAnalysis, Haircut, Language, Recommendations, VisionError } from '../types';

const divider = '----------';

function splitMessage(message: string, limit = 1600): string[] {
  if (message.length <= limit) {
    return [message];
  }

  const sections = message.split(`\n\n${divider}\n\n`);
  const parts: string[] = [];
  let current = '';

  for (const section of sections) {
    const candidate = current ? `${current}\n\n${divider}\n\n${section}` : section;

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
    return `*Welcome to Bold Men's Salon AI*${name ? `, ${name}` : ''}\n\nI can recommend cuts, products, and a daily routine through a quick guided quiz.\n\nReply with your *name* to get started.`;
  }

  return `*Bem-vindo ao Bold Men's Salon AI*${name ? `, ${name}` : ''}\n\nPosso recomendar cortes, produtos e uma rotina diaria atraves de um quiz guiado rapido.\n\nResponde com o teu *nome* para comecar.`;
}

export function formatAskPhotoMessage(language: Language): string {
  return language === 'en'
    ? 'Free mode does not use photo analysis. Please answer the quiz.'
    : 'O modo gratuito nao usa analise por foto. Responde ao quiz.';
}

export function formatAnalyzingMessage(language: Language): string {
  return language === 'en'
    ? 'Building your recommendation from the quiz answers...'
    : 'Estou a montar a tua recomendacao a partir das respostas do quiz...';
}

export function formatFollowUpMenu(language: Language): string {
  if (language === 'en') {
    return `*What would you like next?*\n1. More haircut details\n2. More product details\n3. Booking link\n4. New quiz analysis\n\nType a number or ask a follow-up question.`;
  }

  return `*O que queres ver a seguir?*\n1. Mais detalhes dos cortes\n2. Mais detalhes dos produtos\n3. Link de agendamento\n4. Novo quiz de recomendacao\n\nEscreve um numero ou faz uma pergunta.`;
}

export function formatBookingMessage(language: Language): string {
  if (language === 'en') {
    return `*Book your visit*\n\nWebsite: https://boldmens.co\nBooking: https://boldmens.co\n\nIf you want, start another quiz for a new recommendation.`;
  }

  return `*Marca a tua visita*\n\nWebsite: https://boldmens.co\nAgendamento: https://boldmens.co\n\nSe quiseres, faz outro quiz para nova recomendacao.`;
}

export function formatErrorMessage(
  errorCode: VisionError['error'] | 'INVALID_FILE_TYPE' | 'FILE_TOO_LARGE' | 'DOWNLOAD_FAILED',
  language: Language,
): string {
  const messages = {
    pt: {
      IMAGE_QUALITY_TOO_LOW: 'A foto nao tem qualidade suficiente.',
      NO_FACE_DETECTED: 'Nao consegui detetar um rosto humano na imagem.',
      ANALYSIS_FAILED: 'A analise falhou desta vez.',
      INVALID_FILE_TYPE: 'O ficheiro enviado nao e suportado.',
      FILE_TOO_LARGE: 'A imagem e demasiado grande.',
      DOWNLOAD_FAILED: 'Nao consegui descarregar a imagem.',
    },
    en: {
      IMAGE_QUALITY_TOO_LOW: 'The photo quality is too low.',
      NO_FACE_DETECTED: 'I could not detect a human face in the image.',
      ANALYSIS_FAILED: 'The analysis failed this time.',
      INVALID_FILE_TYPE: 'Unsupported file type.',
      FILE_TOO_LARGE: 'The image is too large.',
      DOWNLOAD_FAILED: 'I could not download the image.',
    },
  };

  return `Warning: ${messages[language][errorCode]}`;
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
    `*${isEn ? "Your Bold Men's Analysis" : 'A tua analise Bold Men\'s'}*`,
    `_${recommendations.summary}_`,
    divider,
    `${isEn ? 'Face shape' : 'Formato do rosto'}: *${getFaceShapeLabel(analysis.faceShape, language)}*`,
    `${isEn ? 'Why it matters' : 'Porque isto importa'}: _${getFaceShapeGuidance(analysis.faceShape, language)}_`,
    `${isEn ? 'Hair type' : 'Tipo de cabelo'}: *${getHairTypeLabel(analysis, language)}*`,
    `${isEn ? 'Condition' : 'Condicao'}: *${getConditionLabel(analysis.hairCondition, language)}*`,
    `${isEn ? 'Scalp' : 'Couro cabeludo'}: *${getScalpLabel(analysis.hairCondition.scalpCondition, language)}*`,
    `${isEn ? 'Current length' : 'Comprimento atual'}: *${analysis.currentLength}*`,
    divider,
    `${isEn ? 'Recommended cuts' : 'Cortes recomendados'}\n${haircuts}`,
    divider,
    `${isEn ? 'Suggested products' : 'Produtos sugeridos'}\n${products}`,
    divider,
    `${isEn ? 'Daily routine' : 'Rotina diaria'}\n${routine}`,
  ].join('\n\n');

  return splitMessage(message);
}

export function formatHaircutReferenceCaption(haircut: Haircut, language: Language, position: number): string {
  if (language === 'en') {
    return `Reference ${position}: *${haircut.nameEn}*\n${haircut.descriptionEn}`;
  }

  return `Referencia ${position}: *${haircut.name}*\n${haircut.description}`;
}
