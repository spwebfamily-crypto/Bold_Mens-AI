# 🤖 BoldMens WhatsApp AI — Plano de Implementação para Codex

> Repositório base: `spwebfamily-crypto/boldmens-salon`
> Website: https://boldmens.co
> Stack: Node.js 20 + TypeScript + Express + Anthropic Vision + Twilio + MongoDB

---

## 📋 VISÃO GERAL

Construir um sistema de IA que funciona via WhatsApp Business. O utilizador envia uma
foto do rosto, a IA analisa o tipo de cabelo e formato do rosto, e responde com:

- ✂️ Cortes de cabelo recomendados
- 🧴 Produtos capilares ideais
- 📅 Rotina de cuidado diário personalizada
- 🗓️ Link para agendar visita à Bold Men's Salon

---

## 🏗️ FASE 1 — ESTRUTURA DO PROJETO

### Tarefa 1.1 — Inicializar o projeto

```bash
mkdir boldmens-whatsapp-ai && cd boldmens-whatsapp-ai
npm init -y
npm install typescript ts-node @types/node --save-dev
npx tsc --init
```

Configurar `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### Tarefa 1.2 — Instalar todas as dependências

```bash
# Produção
npm install express @anthropic-ai/sdk twilio mongoose zod dotenv cors helmet
npm install express-rate-limit multer axios cloudinary winston

# Desenvolvimento
npm install -D @types/express @types/multer @types/cors @types/node
npm install -D vitest tsx nodemon
```

### Tarefa 1.3 — Criar estrutura de pastas

Criar exatamente esta estrutura (não omitir nenhuma pasta):

```
boldmens-whatsapp-ai/
├── src/
│   ├── server.ts
│   ├── app.ts
│   ├── routes/
│   │   ├── webhook.ts
│   │   └── health.ts
│   ├── controllers/
│   │   └── messageController.ts
│   ├── services/
│   │   ├── whatsapp.service.ts
│   │   ├── vision.service.ts
│   │   ├── hairAnalysis.service.ts
│   │   ├── recommendation.service.ts
│   │   └── session.service.ts
│   ├── models/
│   │   ├── Session.ts
│   │   └── Analysis.ts
│   ├── prompts/
│   │   ├── hairAnalysisPrompt.ts
│   │   └── recommendationPrompt.ts
│   ├── data/
│   │   ├── haircuts.ts
│   │   └── products.ts
│   ├── utils/
│   │   ├── imageDownloader.ts
│   │   ├── languageDetector.ts
│   │   ├── responseFormatter.ts
│   │   └── logger.ts
│   ├── middleware/
│   │   ├── twilioValidator.ts
│   │   └── errorHandler.ts
│   ├── config/
│   │   └── env.ts
│   └── types/
│       └── index.ts
├── tests/
│   ├── hairAnalysis.test.ts
│   ├── recommendation.test.ts
│   └── session.test.ts
├── .env
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
├── railway.json
└── README.md
```

---

## 🔧 FASE 2 — CONFIGURAÇÃO E TIPOS

### Tarefa 2.1 — Criar `.env.example`

```bash
# ─── Anthropic ───────────────────────────────────────────
ANTHROPIC_API_KEY=sk-ant-api03-...

# ─── Twilio ──────────────────────────────────────────────
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886

# ─── MongoDB ─────────────────────────────────────────────
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/boldmens

# ─── Cloudinary ──────────────────────────────────────────
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# ─── App ─────────────────────────────────────────────────
PORT=3000
NODE_ENV=development
BOLDMENS_WEBSITE=https://boldmens.co
LOG_LEVEL=info

# ─── Segurança ───────────────────────────────────────────
RATE_LIMIT_MAX=30
RATE_LIMIT_WINDOW_MINUTES=60
SESSION_EXPIRY_HOURS=24
MAX_IMAGE_SIZE_MB=5
```

### Tarefa 2.2 — Criar `src/config/env.ts`

Usar `zod` para validar TODAS as variáveis de ambiente na inicialização.
Se alguma variável estiver em falta, o servidor deve abortar com uma mensagem clara.

```typescript
import { z } from 'zod';
import dotenv from 'dotenv';
dotenv.config();

const envSchema = z.object({
  ANTHROPIC_API_KEY: z.string().min(1, 'ANTHROPIC_API_KEY is required'),
  TWILIO_ACCOUNT_SID: z.string().min(1, 'TWILIO_ACCOUNT_SID is required'),
  TWILIO_AUTH_TOKEN: z.string().min(1, 'TWILIO_AUTH_TOKEN is required'),
  TWILIO_WHATSAPP_FROM: z.string().min(1, 'TWILIO_WHATSAPP_FROM is required'),
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
  CLOUDINARY_CLOUD_NAME: z.string().min(1),
  CLOUDINARY_API_KEY: z.string().min(1),
  CLOUDINARY_API_SECRET: z.string().min(1),
  PORT: z.string().default('3000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  BOLDMENS_WEBSITE: z.string().url().default('https://boldmens.co'),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  RATE_LIMIT_MAX: z.string().default('30'),
  RATE_LIMIT_WINDOW_MINUTES: z.string().default('60'),
  SESSION_EXPIRY_HOURS: z.string().default('24'),
  MAX_IMAGE_SIZE_MB: z.string().default('5'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Variáveis de ambiente inválidas:');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
```

### Tarefa 2.3 — Criar `src/types/index.ts`

Definir TODOS os tipos TypeScript do projeto:

```typescript
// ─── Tipos de Análise de Cabelo ───────────────────────────────────────

export type FaceShape =
  | 'oval' | 'round' | 'square' | 'heart'
  | 'diamond' | 'oblong' | 'triangle' | 'unknown';

export type HairTexture = 'straight' | 'wavy' | 'curly' | 'coily' | 'afro';

export type HairTypeCode =
  | '1A' | '1B' | '1C'
  | '2A' | '2B' | '2C'
  | '3A' | '3B' | '3C'
  | '4A' | '4B' | '4C'
  | 'unknown';

export interface HairType {
  texture: HairTexture;
  typeCode: HairTypeCode;
  density: 'fine' | 'medium' | 'thick';
  porosity: 'low' | 'normal' | 'high';
}

export interface HairCondition {
  moisture: 'dry' | 'normal' | 'oily';
  damage: 'none' | 'mild' | 'moderate' | 'severe';
  scalpCondition: 'normal' | 'dry' | 'oily' | 'dandruff_visible';
}

export interface FacialFeatures {
  beard: boolean;
  beardStyle?: string;
  foreheadSize: 'small' | 'medium' | 'large';
  jawlineDefinition: 'soft' | 'defined' | 'strong';
}

export interface HairAnalysis {
  faceShape: FaceShape;
  hairType: HairType;
  hairCondition: HairCondition;
  currentLength: 'bald' | 'buzz' | 'short' | 'medium' | 'long';
  facialFeatures: FacialFeatures;
  confidence: number;
  additionalNotes: string;
}

export interface VisionError {
  error: 'IMAGE_QUALITY_TOO_LOW' | 'NO_FACE_DETECTED' | 'ANALYSIS_FAILED';
  reason: string;
}

export type VisionResult = HairAnalysis | VisionError;

// ─── Tipos de Dados ───────────────────────────────────────────────────

export interface Haircut {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  suitableFaceShapes: FaceShape[];
  suitableHairTypes: string[];
  avoidForHairTypes: string[];
  maintenanceLevel: 'low' | 'medium' | 'high';
  lengthCategory: 'short' | 'medium' | 'long';
  popularityScore: number;
  boldMensSpecialty: boolean;
  emoji: string;
}

export type ProductCategory =
  | 'shampoo' | 'conditioner' | 'leave_in'
  | 'styling_cream' | 'pomade' | 'wax'
  | 'gel' | 'oil' | 'serum' | 'treatment'
  | 'beard_oil' | 'beard_balm' | 'beard_shampoo';

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: ProductCategory;
  suitableFor: string[];
  hairConditions: string[];
  dailyUse: boolean;
  howToUse: string;
  howToUsePt: string;
  price: string;
  whereToFind: string;
  emoji: string;
}

// ─── Tipos de Sessão ──────────────────────────────────────────────────

export type SessionState =
  | 'INITIAL'
  | 'WAITING_NAME'
  | 'WAITING_PHOTO'
  | 'ANALYZING'
  | 'SHOWING_RESULTS'
  | 'FOLLOW_UP'
  | 'BOOKING';

export type Language = 'pt' | 'en';

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  hasImage: boolean;
}

export interface LastAnalysis {
  hairAnalysis: HairAnalysis;
  recommendations: Recommendations;
  analyzedAt: Date;
  imageUrl?: string;
}

// ─── Tipos de Recomendação ────────────────────────────────────────────

export interface Recommendations {
  haircuts: Haircut[];
  products: Product[];
  routine: string[];
  summary: string;
}

// ─── Tipos do Webhook Twilio ──────────────────────────────────────────

export interface TwilioWebhookBody {
  MessageSid: string;
  From: string;
  To: string;
  Body: string;
  NumMedia: string;
  MediaUrl0?: string;
  MediaContentType0?: string;
  ProfileName?: string;
  WaId?: string;
}
```

---

## 💬 FASE 3 — MODELOS DE BASE DE DADOS

### Tarefa 3.1 — Criar `src/models/Session.ts`

```typescript
import mongoose, { Schema, Document } from 'mongoose';
import { SessionState, Language, ConversationMessage, LastAnalysis } from '../types';

export interface ISession extends Document {
  phoneNumber: string;
  name?: string;
  state: SessionState;
  language: Language;
  lastAnalysis?: LastAnalysis;
  conversationHistory: ConversationMessage[];
  totalAnalyses: number;
  photoAttempts: number;
  createdAt: Date;
  lastInteraction: Date;
}

const ConversationMessageSchema = new Schema({
  role: { type: String, enum: ['user', 'assistant'], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  hasImage: { type: Boolean, default: false },
});

const SessionSchema = new Schema<ISession>(
  {
    phoneNumber: { type: String, required: true, unique: true, index: true },
    name: { type: String },
    state: {
      type: String,
      enum: ['INITIAL', 'WAITING_NAME', 'WAITING_PHOTO', 'ANALYZING', 'SHOWING_RESULTS', 'FOLLOW_UP', 'BOOKING'],
      default: 'INITIAL',
    },
    language: { type: String, enum: ['pt', 'en'], default: 'pt' },
    lastAnalysis: { type: Schema.Types.Mixed },
    conversationHistory: {
      type: [ConversationMessageSchema],
      default: [],
    },
    totalAnalyses: { type: Number, default: 0 },
    photoAttempts: { type: Number, default: 0 },
    lastInteraction: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Índice TTL: remove sessões sem atividade após 7 dias
SessionSchema.index({ lastInteraction: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 7 });

// Manter apenas as últimas 20 mensagens no histórico
SessionSchema.pre('save', function (next) {
  if (this.conversationHistory.length > 20) {
    this.conversationHistory = this.conversationHistory.slice(-20);
  }
  next();
});

export const Session = mongoose.model<ISession>('Session', SessionSchema);
```

### Tarefa 3.2 — Criar `src/models/Analysis.ts`

```typescript
import mongoose, { Schema, Document } from 'mongoose';
import { HairAnalysis, Recommendations } from '../types';

export interface IAnalysis extends Document {
  phoneNumber: string;
  sessionId: string;
  hairAnalysis: HairAnalysis;
  recommendations: Recommendations;
  imageUrl?: string;
  processingTimeMs: number;
  createdAt: Date;
}

const AnalysisSchema = new Schema<IAnalysis>(
  {
    phoneNumber: { type: String, required: true, index: true },
    sessionId: { type: String, required: true },
    hairAnalysis: { type: Schema.Types.Mixed, required: true },
    recommendations: { type: Schema.Types.Mixed, required: true },
    imageUrl: { type: String },
    processingTimeMs: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Analysis = mongoose.model<IAnalysis>('Analysis', AnalysisSchema);
```

---

## 🧠 FASE 4 — PROMPTS DE IA

### Tarefa 4.1 — Criar `src/prompts/hairAnalysisPrompt.ts`

```typescript
export const HAIR_ANALYSIS_SYSTEM_PROMPT = `
You are a professional hair and facial analysis AI for Bold Men's Salon, a premium
barbershop based in Portugal. Your sole function is to analyze photos of men's faces
and hair.

CRITICAL RULES — follow these without exception:

1. You MUST respond ONLY with a valid JSON object. No text before or after the JSON.
   No markdown code fences. No explanations. Pure JSON only.

2. If the image quality is insufficient (blurry, too dark, face obscured, no face
   visible), respond with:
   {"error":"IMAGE_QUALITY_TOO_LOW","reason":"<brief English description of the issue>"}

3. If no human face is detected, respond with:
   {"error":"NO_FACE_DETECTED","reason":"<brief English description>"}

4. Do NOT make assumptions or judgments based on ethnicity or race.
   Focus exclusively on visible hair and facial structure properties.

5. Hair type classification follows the Andre Walker Hair Typing System (1A through 4C).

6. Be precise but conservative — if unsure between two values, choose the safer one
   and lower the confidence score accordingly.

ANALYSIS SCHEMA — return exactly this structure when a face is detected:
{
  "faceShape": "oval"|"round"|"square"|"heart"|"diamond"|"oblong"|"triangle"|"unknown",
  "hairType": {
    "texture": "straight"|"wavy"|"curly"|"coily"|"afro",
    "typeCode": "1A"|"1B"|"1C"|"2A"|"2B"|"2C"|"3A"|"3B"|"3C"|"4A"|"4B"|"4C"|"unknown",
    "density": "fine"|"medium"|"thick",
    "porosity": "low"|"normal"|"high"
  },
  "hairCondition": {
    "moisture": "dry"|"normal"|"oily",
    "damage": "none"|"mild"|"moderate"|"severe",
    "scalpCondition": "normal"|"dry"|"oily"|"dandruff_visible"
  },
  "currentLength": "bald"|"buzz"|"short"|"medium"|"long",
  "facialFeatures": {
    "beard": true|false,
    "beardStyle": "<style description or null>",
    "foreheadSize": "small"|"medium"|"large",
    "jawlineDefinition": "soft"|"defined"|"strong"
  },
  "confidence": <number between 0.0 and 1.0>,
  "additionalNotes": "<any relevant observations in English>"
}
`.trim();

export const buildHairAnalysisUserPrompt = (language: 'pt' | 'en'): string =>
  `Please analyze the hair and face in this image. Return only the JSON object as specified.`;
```

### Tarefa 4.2 — Criar `src/prompts/recommendationPrompt.ts`

```typescript
export const buildRecommendationSystemPrompt = (language: 'pt' | 'en'): string => `
You are a professional barber and hair specialist at Bold Men's Salon (boldmens.co),
a premium barbershop in Portugal. You speak ${language === 'pt' ? 'European Portuguese' : 'English'}.

Based on a hair and face analysis JSON you receive, you will be given a list of
available haircuts and products. Your job is to select the best matches and create
a personalized daily care routine.

RESPONSE FORMAT — return ONLY valid JSON, no markdown:
{
  "selectedHaircutIds": ["id1", "id2", "id3"],
  "selectedProductIds": ["id1", "id2", "id3", "id4"],
  "routine": [
    "Passo 1: ...",
    "Passo 2: ...",
    "Passo 3: ...",
    "Passo 4: ...",
    "Passo 5: ..."
  ],
  "summary": "<2-3 sentence personalized summary in ${language === 'pt' ? 'Portuguese' : 'English'}>"
}

SELECTION RULES:
- Select exactly 3 haircuts ordered by best fit (most suitable first).
- Select 3-5 products (must include at least one shampoo and one styler).
- The routine must have exactly 5 steps, practical and specific.
- If beard is present, include at least one beard product.
- Prioritize products marked as dailyUse: true for the routine.
- For hair types 3A-4C, always prioritize moisture-focused products.
- Never recommend a haircut that is in the avoidForHairTypes list for the user's type.
`.trim();
```

---

## 📊 FASE 5 — BASE DE DADOS LOCAL (CORTES E PRODUTOS)

### Tarefa 5.1 — Criar `src/data/haircuts.ts`

Criar um array com 22 cortes. Cada corte deve ter todos os campos do tipo `Haircut`.
Incluir obrigatoriamente estes estilos:

1. Fade Alto com Textura (`fade-alto-textura`)
2. Fade Médio Clássico (`fade-medio-classico`)
3. Fade Baixo com Risco (`fade-baixo-risco`)
4. Skin Fade (`skin-fade`)
5. Pompadour Moderno (`pompadour-moderno`)
6. Crew Cut (`crew-cut`)
7. Buzz Cut (`buzz-cut`)
8. Undercut Texturizado (`undercut-texturizado`)
9. Textured Crop (`textured-crop`)
10. Caesar Cut (`caesar-cut`)
11. Quiff (`quiff`)
12. Slick Back (`slick-back`)
13. Corte Afro Clássico (`afro-classico`)
14. Afro Fade (`afro-fade`)
15. Twist Out Style (`twist-out`)
16. Defined Curls Cut (`defined-curls`)
17. Wavy Fringe (`wavy-fringe`)
18. French Crop (`french-crop`)
19. Ivy League (`ivy-league`)
20. Side Part Classic (`side-part`)
21. Taper Cut (`taper-cut`)
22. Bald Fade + Beard Combo (`bald-fade-beard`)

Para cada corte, preencher corretamente:
- `suitableFaceShapes`: máximo 4 formatos compatíveis
- `suitableHairTypes`: códigos de tipo (ex: `['1A','1B','2A']`)
- `avoidForHairTypes`: tipos onde este corte não fica bem
- `boldMensSpecialty: true` para os 5 cortes mais icónicos da barbearia

### Tarefa 5.2 — Criar `src/data/products.ts`

Criar um array com 25 produtos reais (marcas reais existentes no mercado).
Incluir obrigatoriamente:

**Shampoos (4):**
- American Crew Daily Shampoo
- Nizoral Anti-Dandruff
- SheaMoisture Jamaican Black Castor Oil (para cabelos tipo 3/4)
- Redken Brews Daily Shampoo

**Condicionadores / Leave-in (5):**
- Cantu Shea Butter Leave-In Conditioner
- American Crew Daily Conditioner
- SheaMoisture Curl Enhancing Smoothie
- Aussie 3 Minute Miracle
- Mielle Organics Pomegranate & Honey

**Estilizantes (7):**
- American Crew Fiber
- Layrite Original Pomade
- Baxter of California Clay Pomade
- Cantu Coconut Curling Cream
- Shea Moisture Curl Enhancing Smoothie
- Got2b Phenomenal Curl Defining Cream
- Muk Hard Muk Styling Mud

**Tratamentos (4):**
- Moroccanoil Treatment Oil
- OGX Argan Oil of Morocco Serum
- Kérastase Resistance Bain Force Architecte
- Philip Kingsley Elasticizer

**Barba (5):**
- Beardbrand Tree Ranger Beard Oil
- Bulldog Original Beard Balm
- American Crew Beard Serum
- Proraso Beard Wash
- The Art of Shaving Beard Creme

---

## 🔌 FASE 6 — SERVIÇOS

### Tarefa 6.1 — Criar `src/utils/logger.ts`

Usar `winston` para logging estruturado:
- Nível `info` para eventos normais (mensagem recebida, análise concluída)
- Nível `error` para falhas (API timeout, MongoDB error)
- Nível `debug` para desenvolvimento (payload do Twilio, resposta raw da IA)
- Formato JSON em produção, formato colorido em desenvolvimento
- Incluir `timestamp`, `level`, `message`, e campos extras como `phoneNumber` e `state`

### Tarefa 6.2 — Criar `src/utils/imageDownloader.ts`

```typescript
// Descarregar imagem de URL do Twilio com autenticação Basic
// Validar tipo MIME (aceitar: image/jpeg, image/png, image/webp)
// Validar tamanho máximo (MAX_IMAGE_SIZE_MB do .env)
// Converter para base64 para enviar à Anthropic API
// Upload para Cloudinary para armazenar permanentemente
// Retornar: { base64: string, mimeType: string, cloudinaryUrl: string }
// Lançar erros tipados: 'INVALID_FILE_TYPE' | 'FILE_TOO_LARGE' | 'DOWNLOAD_FAILED'
```

### Tarefa 6.3 — Criar `src/utils/languageDetector.ts`

```typescript
// Detetar idioma com base no texto recebido
// Palavras PT: olá, oi, obrigado, bom, como, quero, foto, cabelo, corte
// Palavras EN: hello, hi, thanks, good, how, want, photo, hair, cut
// Default: 'pt' (público maioritariamente português)
// Persistir na sessão após primeira deteção
export function detectLanguage(text: string): 'pt' | 'en'
```

### Tarefa 6.4 — Criar `src/utils/responseFormatter.ts`

Implementar a função `formatAnalysisResponse` que converte os dados da análise
num texto formatado para WhatsApp. Usar:
- `*texto*` para negrito
- `_texto_` para itálico
- `━━━━━━━━━━` como separador de secções
- Emojis relevantes para tornar a resposta visual e apelativa
- Máximo de 1600 caracteres por mensagem (limite do WhatsApp)
- Se ultrapassar, dividir em 2 mensagens

Implementar também:
- `formatWelcomeMessage(language, name?)`
- `formatAskPhotoMessage(language)`
- `formatAnalyzingMessage(language)`
- `formatFollowUpMenu(language)`
- `formatErrorMessage(errorCode, language)`
- `formatBookingMessage(language)`

### Tarefa 6.5 — Criar `src/services/vision.service.ts`

```typescript
import Anthropic from '@anthropic-ai/sdk';
import { env } from '../config/env';
import { VisionResult } from '../types';
import { HAIR_ANALYSIS_SYSTEM_PROMPT } from '../prompts/hairAnalysisPrompt';

const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });

export async function analyzeHairFromImage(
  imageBase64: string,
  mimeType: 'image/jpeg' | 'image/png' | 'image/webp'
): Promise<VisionResult> {
  // 1. Chamar claude-sonnet-4-20250514 com vision
  // 2. Passar imagem como base64 no formato correto da Anthropic API
  // 3. Fazer parse do JSON retornado
  // 4. Validar com zod que o JSON tem a estrutura correta
  // 5. Retornar HairAnalysis ou VisionError
  // 6. Timeout de 45 segundos
  // 7. Log do tempo de processamento
}
```

**Importante**: usar o modelo `claude-sonnet-4-20250514`. Passar a imagem como:
```typescript
{
  type: 'image',
  source: {
    type: 'base64',
    media_type: mimeType,
    data: imageBase64,
  }
}
```

### Tarefa 6.6 — Criar `src/services/hairAnalysis.service.ts`

```typescript
// Recebe HairAnalysis e devolve labels em PT e EN
export function getHairTypeLabel(analysis: HairAnalysis, lang: Language): string
export function getFaceShapeLabel(shape: FaceShape, lang: Language): string
export function getConditionLabel(condition: HairCondition, lang: Language): string
export function getScalpLabel(scalp: string, lang: Language): string

// Mapa completo de labels para cada enum value
// Exemplo:
// faceShape 'oval' → PT: 'Oval' | EN: 'Oval'
// faceShape 'round' → PT: 'Redondo' | EN: 'Round'
// hairType 'wavy' → PT: 'Ondulado' | EN: 'Wavy'
// etc.
```

### Tarefa 6.7 — Criar `src/services/recommendation.service.ts`

```typescript
// Importar dados de haircuts.ts e products.ts
// Pré-filtrar cortes e produtos compatíveis com o tipo de cabelo do utilizador
// Chamar Anthropic API com o prompt de recomendação + dados filtrados
// Fazer parse do JSON de resposta
// Retornar Recommendations completo com objetos expandidos (não apenas IDs)

export async function generateRecommendations(
  analysis: HairAnalysis,
  language: Language
): Promise<Recommendations>
```

### Tarefa 6.8 — Criar `src/services/session.service.ts`

```typescript
// Criar ou obter sessão por phoneNumber
export async function getOrCreateSession(phoneNumber: string): Promise<ISession>

// Atualizar estado da sessão
export async function updateSessionState(phoneNumber: string, state: SessionState): Promise<void>

// Verificar se sessão expirou (lastInteraction > SESSION_EXPIRY_HOURS)
// Se expirou, resetar para estado INITIAL mas manter nome do utilizador
export async function checkAndResetExpiredSession(session: ISession): Promise<ISession>

// Adicionar mensagem ao histórico
export async function addMessageToHistory(
  phoneNumber: string,
  role: 'user' | 'assistant',
  content: string,
  hasImage?: boolean
): Promise<void>

// Guardar análise na sessão e na coleção Analysis
export async function saveAnalysis(
  phoneNumber: string,
  hairAnalysis: HairAnalysis,
  recommendations: Recommendations,
  imageUrl?: string,
  processingTimeMs?: number
): Promise<void>
```

### Tarefa 6.9 — Criar `src/services/whatsapp.service.ts`

```typescript
import twilio from 'twilio';
import { env } from '../config/env';

const client = twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN);

// Enviar mensagem de texto simples
export async function sendMessage(to: string, body: string): Promise<void>

// Enviar mensagem com pausa (para simular "a escrever...")
export async function sendWithDelay(to: string, body: string, delayMs: number): Promise<void>

// Enviar múltiplas mensagens em sequência com delay entre elas
export async function sendMultipleMessages(to: string, messages: string[]): Promise<void>
```

---

## 🎮 FASE 7 — CONTROLLER E ROTAS

### Tarefa 7.1 — Criar `src/controllers/messageController.ts`

Este é o orquestrador central. Implementar a máquina de estados completa:

```typescript
export async function handleIncomingMessage(body: TwilioWebhookBody): Promise<void>
```

Lógica por estado:

**INITIAL:**
- Detetar idioma
- Enviar mensagem de boas-vindas com menu
- Atualizar estado para WAITING_NAME

**WAITING_NAME:**
- Guardar nome na sessão
- Enviar instruções para foto
- Atualizar estado para WAITING_PHOTO

**WAITING_PHOTO:**
- Se recebeu imagem (NumMedia > 0): processar
- Se recebeu texto: lembrar que precisa de foto
- Incrementar photoAttempts; se >= 3: enviar mensagem de ajuda

**ANALYZING:**
- Estado transitório — não deve receber mensagens
- Se receber, enviar "Aguarda, estou a analisar a tua foto..."

**SHOWING_RESULTS:**
- Processar escolha do menu (1, 2, 3, 4)
- 1 → detalhes dos cortes → FOLLOW_UP
- 2 → detalhes dos produtos → FOLLOW_UP
- 3 → link de agendamento → BOOKING
- 4 → voltar a WAITING_PHOTO

**FOLLOW_UP:**
- Usar histórico de conversa + última análise para responder
- Chamar Anthropic com contexto completo
- Opção para voltar ao menu

**BOOKING:**
- Mostrar link e info de contacto
- Opção para nova análise

### Tarefa 7.2 — Criar `src/routes/webhook.ts`

```typescript
import express from 'express';
import { validateTwilioSignature } from '../middleware/twilioValidator';
import { handleIncomingMessage } from '../controllers/messageController';

const router = express.Router();

// POST /webhook/whatsapp
router.post('/whatsapp', validateTwilioSignature, async (req, res) => {
  // Responder imediatamente com 200 (Twilio exige resposta rápida)
  res.status(200).send('<Response></Response>');
  
  // Processar de forma assíncrona
  handleIncomingMessage(req.body).catch(err => {
    logger.error('Erro no processamento de mensagem', { error: err.message });
  });
});

export default router;
```

### Tarefa 7.3 — Criar `src/routes/health.ts`

```typescript
// GET /health → { status: 'ok', version, uptime, mongoStatus }
// GET /health/detailed → info completa para debugging (apenas NODE_ENV=development)
```

---

## 🛡️ FASE 8 — MIDDLEWARE

### Tarefa 8.1 — Criar `src/middleware/twilioValidator.ts`

```typescript
import twilio from 'twilio';
import { env } from '../config/env';

// Usar twilio.validateRequest() para verificar a assinatura X-Twilio-Signature
// Em NODE_ENV=development, fazer log do aviso mas não bloquear (para testes)
// Em NODE_ENV=production, bloquear com 403 se assinatura inválida
export function validateTwilioSignature(req, res, next): void
```

### Tarefa 8.2 — Criar `src/middleware/errorHandler.ts`

```typescript
// Middleware global de erros do Express
// Fazer log do erro com winston
// Em produção: retornar resposta genérica
// Em desenvolvimento: retornar stack trace
// Tipos de erro especiais:
//   - MongooseError → 503
//   - AnthropicError → 502
//   - ValidationError (zod) → 400
//   - Default → 500
```

---

## 🚀 FASE 9 — SERVIDOR E APP

### Tarefa 9.1 — Criar `src/app.ts`

```typescript
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import webhookRoutes from './routes/webhook';
import healthRoutes from './routes/health';
import { errorHandler } from './middleware/errorHandler';
import { env } from './config/env';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({ origin: env.BOLDMENS_WEBSITE }));

// Rate limiting por IP
const limiter = rateLimit({
  windowMs: parseInt(env.RATE_LIMIT_WINDOW_MINUTES) * 60 * 1000,
  max: parseInt(env.RATE_LIMIT_MAX),
  message: 'Too many requests from this IP',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/webhook', limiter);

// Body parsing
app.use(express.urlencoded({ extended: false })); // Twilio envia URLencoded
app.use(express.json());

// Rotas
app.use('/webhook', webhookRoutes);
app.use('/health', healthRoutes);

// Error handler
app.use(errorHandler);

export default app;
```

### Tarefa 9.2 — Criar `src/server.ts`

```typescript
import mongoose from 'mongoose';
import app from './app';
import { env } from './config/env';
import { logger } from './utils/logger';

async function bootstrap() {
  try {
    await mongoose.connect(env.MONGODB_URI);
    logger.info('✅ MongoDB conectado');

    app.listen(parseInt(env.PORT), () => {
      logger.info(`🚀 BoldMens WhatsApp AI a correr na porta ${env.PORT}`);
      logger.info(`🌍 Ambiente: ${env.NODE_ENV}`);
      logger.info(`📱 Webhook: POST /webhook/whatsapp`);
    });
  } catch (error) {
    logger.error('❌ Erro ao iniciar servidor', { error });
    process.exit(1);
  }
}

bootstrap();
```

---

## 🧪 FASE 10 — TESTES

### Tarefa 10.1 — Criar `tests/hairAnalysis.test.ts`

Testar com `vitest`:
- `detectLanguage()` com textos PT e EN
- `getHairTypeLabel()` para todos os tipos
- `getFaceShapeLabel()` para todos os formatos
- `formatAnalysisResponse()` com dados mockados
- Verificar que o output nunca excede 1600 caracteres

### Tarefa 10.2 — Criar `tests/recommendation.test.ts`

Testar:
- Filtragem de cortes por tipo de cabelo
- Filtragem de produtos por condição do cabelo
- Que cortes em `avoidForHairTypes` nunca são recomendados
- Que sempre há pelo menos 1 shampoo nas recomendações

### Tarefa 10.3 — Criar `tests/session.test.ts`

Testar (com MongoDB em memória via `mongodb-memory-server`):
- `getOrCreateSession()` cria sessão nova
- `getOrCreateSession()` retorna sessão existente
- `checkAndResetExpiredSession()` reseta estado mas mantém nome
- Histórico não ultrapassa 20 mensagens

Adicionar ao `package.json`:
```json
{
  "scripts": {
    "dev": "nodemon --exec tsx src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "test": "vitest",
    "test:run": "vitest run"
  }
}
```

---

## ☁️ FASE 11 — DEPLOY

### Tarefa 11.1 — Criar `railway.json`

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm run build"
  },
  "deploy": {
    "startCommand": "npm run start",
    "healthcheckPath": "/health",
    "healthcheckTimeout": 30,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 3
  }
}
```

### Tarefa 11.2 — Criar `.gitignore`

```
node_modules/
dist/
.env
*.log
.DS_Store
coverage/
```

### Tarefa 11.3 — Criar `README.md` completo

Incluir obrigatoriamente:
1. Badges: Node version, TypeScript, Railway deploy status
2. Descrição do projeto com link para boldmens.co
3. Diagrama de arquitetura em texto (ASCII)
4. Pré-requisitos e versões mínimas
5. Setup local passo a passo (clone → env → mongodb → run)
6. Como configurar o Twilio WhatsApp Sandbox
7. Como usar ngrok para desenvolvimento local: `ngrok http 3000`
8. URL do webhook a configurar no Twilio: `https://seu-dominio/webhook/whatsapp`
9. Como fazer deploy no Railway (passo a passo)
10. Exemplo de conversa completa (fluxo INITIAL → SHOWING_RESULTS)
11. Variáveis de ambiente com descrições
12. Troubleshooting: erros mais comuns e soluções
13. Roadmap: funcionalidades futuras planeadas
14. Licença MIT

---

## ✅ CHECKLIST FINAL DE VALIDAÇÃO

Antes de considerar o projeto concluído, verificar:

- [ ] `npm run build` completa sem erros TypeScript
- [ ] `npm run test:run` passa todos os testes
- [ ] `npm run dev` inicia o servidor sem erros
- [ ] Endpoint `GET /health` responde `200 OK`
- [ ] Webhook aceita payload simulado do Twilio sem erros
- [ ] Variáveis em falta no `.env` causam `process.exit(1)` com mensagem clara
- [ ] Imagem com rosto real é analisada corretamente pela Vision API
- [ ] Resposta formatada não ultrapassa 1600 caracteres por mensagem
- [ ] Sessão é criada no MongoDB e persiste entre pedidos
- [ ] `railway.json` configurado para deploy automático
- [ ] `.env.example` tem todas as variáveis necessárias documentadas
- [ ] `README.md` tem instruções suficientes para um dev novo configurar em < 30 min

---

## 📌 NOTAS IMPORTANTES PARA O CODEX

1. **Modelo de IA a usar**: sempre `claude-sonnet-4-20250514` — não usar modelos mais antigos.
2. **Twilio Sandbox**: durante desenvolvimento, usar o sandbox gratuito do Twilio.
   O número sandbox é `whatsapp:+14155238886`. O utilizador junta-se enviando
   `join <código>` para esse número.
3. **Formato de resposta Twilio**: o Twilio envia os dados como `application/x-www-form-urlencoded`,
   não como JSON. Usar `express.urlencoded()` e NÃO `express.json()` na rota do webhook.
4. **Resposta imediata ao Twilio**: o Twilio exige resposta HTTP 200 em menos de 5 segundos.
   Responder imediatamente com `<Response></Response>` vazio e processar de forma assíncrona.
5. **Imagens do Twilio**: as imagens chegam com autenticação Basic Auth no URL.
   Usar as credenciais do Twilio para fazer download com `axios` e headers de autorização.
6. **Rate limiting por número**: além do rate limiting por IP, implementar também
   um limite por número de WhatsApp para evitar spam.
7. **Não guardar chaves no código**: todas as credenciais vêm exclusivamente do `.env`.

---

*BoldMens WhatsApp AI — by spwebfamily-crypto | boldmens.co*
