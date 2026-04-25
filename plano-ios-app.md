# ✂️ BoldMens AI — Plano de Implementação iOS App (Codex)

> App nativa iPhone — React Native + Expo
> Backend: Node.js + TypeScript + Anthropic Vision API
> Modelo: Interface tipo ChatGPT com sistema de planos e prompts diários
> Website: https://boldmens.co

---

## 🎯 CONCEITO DO PRODUTO

Uma app iOS para iPhone onde o utilizador:

1. Faz upload ou tira uma selfie
2. A IA analisa o formato do rosto, tipo de cabelo e condição capilar
3. Recebe recomendações personalizadas de cortes + tendências de moda atual
4. Tem X análises gratuitas por dia — para mais, paga o plano Plus
5. Interface familiar tipo ChatGPT — conversa fluida com histórico

---

## 💰 MODELO DE NEGÓCIO — PLANOS

```
┌─────────────────┬──────────────────┬───────────────────────┐
│                 │   FREE           │   PLUS (€9.99/mês)    │
├─────────────────┼──────────────────┼───────────────────────┤
│ Análises/dia    │ 3                │ Ilimitadas            │
│ Histórico       │ 7 dias           │ 1 ano                 │
│ Tendências      │ Básicas          │ Completas + semanais  │
│ Produtos        │ 3 sugestões      │ 10+ sugestões         │
│ Rotina diária   │ ❌               │ ✅                    │
│ Comparar cortes │ ❌               │ ✅                    │
│ Suporte         │ Email            │ Prioritário           │
│ Anúncios        │ ✅               │ ❌                    │
└─────────────────┴──────────────────┴───────────────────────┘
```

Pagamento via **Apple In-App Purchase (StoreKit 2)** — obrigatório para App Store.

---

## 🏗️ STACK TÉCNICA

### Frontend (iPhone)
- **React Native** com **Expo SDK 51+**
- **TypeScript** estrito
- **Expo Router** (navegação file-based)
- **NativeWind** (Tailwind para React Native)
- **Zustand** (gestão de estado global)
- **React Query / TanStack Query** (cache e sync de dados)
- **Expo Camera** (captura de selfie)
- **Expo Image Picker** (galeria)
- **Expo SecureStore** (guardar token JWT)
- **RevenueCat SDK** (gestão de subscriptions In-App Purchase)
- **Lottie** (animações)

### Backend (API)
- **Node.js 20 + TypeScript + Express**
- **Anthropic API** (`claude-sonnet-4-20250514`) com Vision
- **MongoDB + Mongoose** (utilizadores, análises, sessões)
- **Redis** (rate limiting, cache de resultados)
- **JWT** (autenticação)
- **Stripe** (pagamentos web — backup ao Apple IAP)
- **RevenueCat** (validação de subscriptions iOS)
- **Cloudinary** (armazenamento de imagens)
- **Deploy: Railway**

---

## 📁 ESTRUTURA DO PROJETO

```
boldmens-ai/
├── app/                          # React Native (Expo Router)
│   ├── (auth)/
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   └── forgot-password.tsx
│   ├── (tabs)/
│   │   ├── index.tsx             # Home — Chat principal
│   │   ├── history.tsx           # Histórico de análises
│   │   ├── trends.tsx            # Tendências de moda
│   │   └── profile.tsx           # Perfil e plano
│   ├── analysis/
│   │   ├── camera.tsx            # Ecrã de câmara
│   │   └── result.tsx            # Resultado da análise
│   ├── paywall.tsx               # Ecrã de upgrade Plus
│   └── _layout.tsx
│
├── components/
│   ├── chat/
│   │   ├── ChatBubble.tsx        # Bolha de mensagem
│   │   ├── ChatInput.tsx         # Input com botão câmara
│   │   ├── TypingIndicator.tsx   # "IA está a escrever..."
│   │   └── ImagePreview.tsx      # Preview da foto enviada
│   ├── analysis/
│   │   ├── HairTypeCard.tsx      # Card com tipo de cabelo
│   │   ├── HaircutCard.tsx       # Card de corte recomendado
│   │   ├── ProductCard.tsx       # Card de produto
│   │   └── TrendCard.tsx         # Card de tendência
│   ├── paywall/
│   │   ├── PlanCard.tsx          # Card FREE vs PLUS
│   │   └── FeatureList.tsx       # Lista de features
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Avatar.tsx
│   │   ├── Badge.tsx             # "FREE" / "PLUS"
│   │   ├── PromptCounter.tsx     # "2 de 3 análises restantes"
│   │   └── LoadingDots.tsx
│   └── navigation/
│       └── TabBar.tsx            # Tab bar customizada
│
├── hooks/
│   ├── useAnalysis.ts            # Lógica de análise de imagem
│   ├── useSubscription.ts        # Estado da subscription
│   ├── usePromptLimit.ts         # Controlo de prompts diários
│   ├── useAuth.ts                # Autenticação
│   └── useChat.ts                # Histórico de chat
│
├── stores/
│   ├── authStore.ts              # Zustand — utilizador e token
│   ├── chatStore.ts              # Zustand — mensagens
│   └── subscriptionStore.ts     # Zustand — plano atual
│
├── services/
│   ├── api.ts                    # Axios instance com interceptors
│   ├── auth.service.ts           # Login, registo, refresh token
│   ├── analysis.service.ts       # Upload foto + obter resultado
│   ├── subscription.service.ts   # RevenueCat + planos
│   └── trends.service.ts         # Tendências de moda
│
├── constants/
│   ├── colors.ts                 # Paleta BoldMens (preto, dourado, branco)
│   ├── plans.ts                  # Definição de planos FREE e PLUS
│   └── prompts.ts                # Limites de prompts por plano
│
├── types/
│   └── index.ts                  # Tipos TypeScript globais
│
├── utils/
│   ├── imageUtils.ts             # Resize e compressão de imagem
│   └── dateUtils.ts              # Reset diário de prompts
│
├── backend/                      # API (pode ser repo separado)
│   ├── src/
│   │   ├── server.ts
│   │   ├── routes/
│   │   │   ├── auth.ts
│   │   │   ├── analysis.ts
│   │   │   ├── subscription.ts
│   │   │   └── trends.ts
│   │   ├── controllers/
│   │   │   ├── authController.ts
│   │   │   ├── analysisController.ts
│   │   │   └── subscriptionController.ts
│   │   ├── services/
│   │   │   ├── vision.service.ts
│   │   │   ├── recommendation.service.ts
│   │   │   ├── revenuecat.service.ts
│   │   │   └── trends.service.ts
│   │   ├── models/
│   │   │   ├── User.ts
│   │   │   ├── Analysis.ts
│   │   │   └── DailyUsage.ts
│   │   ├── middleware/
│   │   │   ├── auth.ts           # Verificar JWT
│   │   │   ├── rateLimiter.ts    # Limite por plano
│   │   │   └── planGuard.ts      # Bloquear se FREE e sem prompts
│   │   └── config/
│   │       └── env.ts
│   └── package.json
│
├── app.json
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🎨 DESIGN — IDENTIDADE VISUAL

### Paleta de cores (baseada em boldmens.co)

```typescript
export const colors = {
  // Primárias
  black:      '#0A0A0A',    // Fundo principal
  darkGray:   '#1A1A1A',    // Cards e inputs
  gold:       '#C9A84C',    // Acentos, CTAs, badges PLUS
  goldLight:  '#E8C97A',    // Hover states
  white:      '#F5F5F5',    // Texto principal
  whiteDim:   '#A0A0A0',    // Texto secundário

  // Semânticas
  success:    '#1D9E75',
  error:      '#E85D5D',
  warning:    '#F0A500',

  // Chat
  bubbleAI:   '#1A1A1A',    // Bolha da IA (escuro)
  bubbleUser: '#C9A84C',    // Bolha do user (dourado)
};
```

### Tipografia
- **Font**: Inter (sistema) + Playfair Display (títulos premium)
- Tamanho base: 16px
- Hierarquia: H1 28px / H2 22px / Body 16px / Caption 13px

### Ícone da App
- Fundo preto
- Tesoura dourada estilizada
- Texto "BM" em gold

---

## 📱 FLUXO DE ECRÃS

### Onboarding (primeira vez)
```
Splash → Onboarding (3 slides) → Register/Login → Permissão câmara → Home
```

### Slides de Onboarding:
1. "Descobre o teu corte ideal" — ilustração de análise facial
2. "IA que conhece as tendências" — ilustração de moda
3. "3 análises gratuitas por dia" — ilustração de planos

### Fluxo principal (Chat):
```
Home (Chat) → Toca no ícone câmara → 
  ├── Câmara (selfie) → Preview → Confirmar → Analisando...
  └── Galeria → Selecionar → Preview → Confirmar → Analisando...
         ↓
    Resultado no Chat (streaming de texto)
         ↓
    Cards com: corte recomendado / tipo cabelo / produtos / tendências
         ↓
    [Se FREE e sem prompts] → Paywall
```

### Fluxo de Paywall:
```
Paywall → Comparação FREE vs PLUS → 
  ├── "Continuar Grátis" → volta ao Home
  └── "Começar PLUS €9.99/mês" → Apple IAP → Confirmação → Home desbloqueado
```

---

## 🧠 FASE 1 — BACKEND

### Tarefa 1.1 — Modelos de Base de Dados

**User.ts:**
```typescript
interface IUser {
  email: string;
  passwordHash: string;
  name: string;
  plan: 'free' | 'plus';
  revenueCatUserId: string;
  subscriptionExpiresAt?: Date;
  totalAnalyses: number;
  createdAt: Date;
}
```

**DailyUsage.ts:**
```typescript
interface IDailyUsage {
  userId: ObjectId;
  date: string;           // formato: "2026-04-25"
  analysisCount: number;  // incrementa a cada análise
  resetAt: Date;          // meia-noite do dia seguinte
}
```

**Analysis.ts:**
```typescript
interface IAnalysis {
  userId: ObjectId;
  imageUrl: string;
  faceShape: string;
  hairType: HairType;
  hairCondition: HairCondition;
  recommendations: Recommendations;
  trends: Trend[];
  chatMessages: ChatMessage[];  // conversa completa sobre esta análise
  createdAt: Date;
}
```

### Tarefa 1.2 — Middleware de Limite de Prompts

```typescript
// middleware/planGuard.ts
export async function planGuard(req, res, next) {
  const user = req.user;
  const today = new Date().toISOString().split('T')[0];

  // Buscar uso do dia
  const usage = await DailyUsage.findOne({
    userId: user._id,
    date: today
  });

  const count = usage?.analysisCount ?? 0;
  const limit = user.plan === 'plus' ? Infinity : 3; // FREE = 3/dia

  if (count >= limit) {
    return res.status(429).json({
      error: 'DAILY_LIMIT_REACHED',
      limit,
      used: count,
      plan: user.plan,
      resetAt: getNextMidnight(),
      upgradeRequired: user.plan === 'free',
    });
  }

  // Incrementar contador
  await DailyUsage.findOneAndUpdate(
    { userId: user._id, date: today },
    { $inc: { analysisCount: 1 } },
    { upsert: true, new: true }
  );

  next();
}
```

### Tarefa 1.3 — Endpoint de Análise com Streaming

```typescript
// POST /api/analysis
// Suporta Server-Sent Events (SSE) para streaming tipo ChatGPT

router.post('/', auth, planGuard, upload.single('image'), async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  // 1. Upload imagem para Cloudinary
  // 2. Análise com Anthropic Vision (claude-sonnet-4-20250514)
  // 3. Stream da resposta para o cliente
  // 4. Guardar resultado na DB
  // 5. Enviar evento final com dados estruturados
});
```

### Tarefa 1.4 — Integração RevenueCat (Subscriptions)

```typescript
// POST /api/subscription/validate
// Recebe o purchase token do iOS e valida via RevenueCat API

export async function validatePurchase(
  userId: string,
  receiptData: string
): Promise<{ valid: boolean; expiresAt: Date; plan: 'plus' }> {
  // Chamar RevenueCat REST API
  // Atualizar user.plan e user.subscriptionExpiresAt na DB
  // Retornar status
}
```

### Tarefa 1.5 — Endpoint de Tendências

```typescript
// GET /api/trends
// Retorna tendências de corte atuais
// Cache Redis por 24h para não chamar a IA repetidamente

// Para utilizadores FREE: top 3 tendências
// Para utilizadores PLUS: top 10 + análise detalhada + vídeos/fotos

// A IA gera tendências baseadas em:
// - Temporada atual (Primavera/Verão 2026)
// - Estilos em alta (baseado em conhecimento do modelo)
// - Combinação com o tipo de cabelo do utilizador (se tiver análise)
```

---

## 📱 FASE 2 — APP iOS

### Tarefa 2.1 — Autenticação

Implementar com **Expo SecureStore** para guardar JWT:

- Login com email + password
- Registo com nome + email + password
- **"Sign in with Apple"** (obrigatório pela App Store se tiver outros social logins)
- Refresh token automático com interceptor Axios
- Logout limpa SecureStore e Zustand

### Tarefa 2.2 — Ecrã Home (Chat)

Interface idêntica ao ChatGPT mas com tema BoldMens:

```typescript
// components/chat/ChatInput.tsx
// Input bar com:
// - Campo de texto: "Envia uma foto ou faz uma pergunta..."
// - Botão câmara (ícone) → abre ActionSheet: [Câmara / Galeria]
// - Botão enviar (ativa quando há texto ou imagem)
// - Se FREE: mostrar "2 análises restantes hoje" acima do input
// - Se sem prompts: input desativado + botão "Upgrade para PLUS"
```

### Tarefa 2.3 — Câmara e Processamento de Imagem

```typescript
// app/analysis/camera.tsx

// Usar expo-camera com:
// - Modo selfie (câmara frontal por defeito)
// - Guia oval sobreposto para posicionar o rosto
// - Instrução: "Posiciona o teu rosto dentro do oval"
// - Botão de captura
// - Opção de trocar para câmara traseira
// - Flash automático

// Antes de enviar:
// - Comprimir imagem para máx. 1MB (expo-image-manipulator)
// - Converter para base64
// - Mostrar preview com opção "Usar esta foto" ou "Tentar novamente"
```

### Tarefa 2.4 — Streaming da Resposta da IA

```typescript
// hooks/useAnalysis.ts

// Conectar ao SSE endpoint do backend
// Receber chunks de texto e adicionar à bolha da IA progressivamente
// Efeito de "digitação" em tempo real (igual ao ChatGPT)
// Quando streaming termina:
//   - Mostrar cards com dados estruturados abaixo do texto
//   - HaircutCard, HairTypeCard, ProductCard, TrendCard
//   - Animação de entrada (slide up) para cada card
```

### Tarefa 2.5 — Cards de Resultado

Cada card deve ter design premium (fundo escuro, bordas douradas):

**HaircutCard:**
```
┌─────────────────────────────┐
│ 💈 CORTE RECOMENDADO        │
│                             │
│ Fade Médio com Textura      │
│ ⭐⭐⭐⭐⭐ Perfeito para ti  │
│                             │
│ Rosto oval · Cabelo ondulado│
│ Manutenção: Média           │
└─────────────────────────────┘
```

**TrendCard (apenas PLUS completo):**
```
┌─────────────────────────────┐
│ 🔥 TENDÊNCIA 2026           │
│                             │
│ Textured Crop               │
│ Visto em: Milano FW 2026    │
│                             │
│ [Ver mais tendências →]     │
└─────────────────────────────┘
```

### Tarefa 2.6 — Ecrã de Paywall

Design premium tipo Apple Subscription:

```
┌──────────────────────────────────┐
│         ✂️ BoldMens PLUS         │
│   Desbloqueia o teu potencial    │
│                                  │
│  ✅ Análises ilimitadas          │
│  ✅ Tendências exclusivas        │
│  ✅ Rotina diária personalizada  │
│  ✅ 10+ produtos recomendados    │
│  ✅ Sem anúncios                 │
│  ✅ Histórico de 1 ano           │
│                                  │
│  ┌──────────────────────────┐   │
│  │   €9.99 / mês            │   │
│  │   Cancela quando quiseres│   │
│  │  [Começar PLUS]          │   │
│  └──────────────────────────┘   │
│                                  │
│  [Restaurar compra]              │
│  [Continuar grátis →]           │
└──────────────────────────────────┘
```

### Tarefa 2.7 — Ecrã de Tendências (tab)

```
Header: "Tendências Primavera 2026"
Subtítulo: "Atualizado semanalmente pela nossa IA"

[FREE] → Mostra 3 tendências com blur/lock nas restantes
         + CTA "Ver todas com PLUS"

[PLUS] → Grid com 10+ tendências:
         - Nome do corte
         - "Em alta" badge
         - Descrição breve
         - Tipo de cabelo ideal
         - Nível de manutenção
```

### Tarefa 2.8 — Ecrã de Perfil

```
Avatar (inicial do nome)
Nome + email
Badge: [FREE] ou [PLUS ✨]

── O teu plano ──
FREE: "3 análises por dia"
      Progresso: ██░░░ 2/3 usadas
      [Upgrade para PLUS]

PLUS: "Análises ilimitadas"
      Renovação: 25 Maio 2026
      [Gerir subscrição]

── Histórico ──
[Ver todas as análises →]

── Conta ──
[Alterar password]
[Notificações]
[Termos e Privacidade]
[Apagar conta]
[Terminar sessão]
```

---

## 🔔 FASE 3 — NOTIFICAÇÕES PUSH

Usar **Expo Notifications**:

- **Lembrete diário** (opcional, opt-in): "Tens 3 análises gratuitas disponíveis hoje ✂️"
- **Novas tendências**: "Novas tendências de Maio adicionadas 🔥" (PLUS only)
- **Limite atingido**: "Chegaste ao limite diário. Upgrade para análises ilimitadas →"

---

## 💳 FASE 4 — IN-APP PURCHASE (APPLE)

### Configuração obrigatória:

1. **App Store Connect** → criar produto de subscrição:
   - Product ID: `com.boldmens.plus.monthly`
   - Preço: €9,99/mês (Tier 10 na Europa)
   - Período de trial: 7 dias grátis

2. **RevenueCat** (simplifica a gestão iOS + futuro Android):
   - SDK: `react-native-purchases`
   - Validação server-side via webhook RevenueCat → backend
   - Gestão de renewals, cancellations, grace periods automática

3. **Fluxo de compra:**
```typescript
// hooks/useSubscription.ts

async function purchasePlus() {
  // 1. Chamar RevenueCat SDK
  const { customerInfo } = await Purchases.purchasePackage(plusPackage);

  // 2. Validar no backend
  await api.post('/subscription/validate', {
    customerInfo
  });

  // 3. Atualizar estado local
  subscriptionStore.setPlan('plus');

  // 4. Mostrar animação de sucesso
  // 5. Navegar para Home
}
```

---

## 🌐 FASE 5 — VARIÁVEIS DE AMBIENTE

### Backend (.env):

```dotenv
# Anthropic
ANTHROPIC_API_KEY=sk-ant-...

# MongoDB
MONGODB_URI=mongodb+srv://boldmens:...@cluster0.mongodb.net/boldmens

# Redis
REDIS_URL=redis://...

# JWT
JWT_SECRET=...
JWT_REFRESH_SECRET=...
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=30d

# Cloudinary
CLOUDINARY_CLOUD_NAME=dcswmesvt
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# RevenueCat
REVENUECAT_API_KEY=...
REVENUECAT_WEBHOOK_AUTH=...

# App
PORT=3000
NODE_ENV=production
BOLDMENS_WEBSITE=https://boldmens.co
FREE_DAILY_LIMIT=3
```

### App (.env / app.config.ts):

```dotenv
EXPO_PUBLIC_API_URL=https://api.boldmens.co
EXPO_PUBLIC_REVENUECAT_IOS_KEY=appl_...
EXPO_PUBLIC_FREE_DAILY_LIMIT=3
```

---

## 🧪 FASE 6 — TESTES

### Unitários (Jest + React Native Testing Library):
- `usePromptLimit` — lógica de contagem e reset
- `useSubscription` — estados FREE/PLUS
- `planGuard` middleware — bloqueio correto
- `ChatBubble` — renderização de texto e imagem

### E2E (Detox):
- Fluxo completo: registo → análise → resultado
- Fluxo paywall: limite atingido → paywall → compra (mock)
- Histórico: análise guardada aparece no histórico

---

## 🚀 FASE 7 — DEPLOY E PUBLICAÇÃO

### Backend:
- Deploy no **Railway** (como já tens configurado)
- Domínio personalizado: `api.boldmens.co`
- SSL automático

### App iOS:
```bash
# Build para App Store
eas build --platform ios --profile production

# Submit para revisão Apple
eas submit --platform ios
```

### Configurar no App Store Connect:
- Nome: "BoldMens AI — Hair Advisor"
- Categoria: Lifestyle
- Idade: 4+
- Screenshots: iPhone 15 Pro (6.7") obrigatório
- Descrição em PT e EN
- Privacy Policy URL: https://boldmens.co/privacy
- Suporte URL: https://boldmens.co/support

---

## 📦 PACKAGE.JSON — DEPENDÊNCIAS PRINCIPAIS

```json
{
  "dependencies": {
    "expo": "~51.0.0",
    "expo-router": "~3.5.0",
    "expo-camera": "~15.0.0",
    "expo-image-picker": "~15.0.0",
    "expo-image-manipulator": "~12.0.0",
    "expo-secure-store": "~13.0.0",
    "expo-notifications": "~0.28.0",
    "react-native": "0.74.0",
    "react-native-purchases": "^7.0.0",
    "nativewind": "^4.0.0",
    "zustand": "^4.5.0",
    "@tanstack/react-query": "^5.0.0",
    "axios": "^1.6.0",
    "react-native-reanimated": "~3.10.0",
    "lottie-react-native": "^6.0.0"
  }
}
```

---

## ✅ CHECKLIST FINAL

### Backend:
- [ ] Autenticação JWT (login, registo, refresh)
- [ ] Middleware de limite diário por plano
- [ ] Endpoint de análise com streaming SSE
- [ ] Integração RevenueCat para validar purchases
- [ ] Endpoint de tendências com cache Redis
- [ ] Rate limiting global
- [ ] Deploy Railway + domínio api.boldmens.co

### App iOS:
- [ ] Onboarding (3 slides)
- [ ] Autenticação (email + Sign in with Apple)
- [ ] Ecrã de chat com streaming
- [ ] Câmara com guia de rosto oval
- [ ] Cards de resultado animados
- [ ] Contador de prompts diários visível
- [ ] Paywall com Apple IAP funcional
- [ ] Ecrã de tendências (FREE limitado / PLUS completo)
- [ ] Perfil com gestão de subscrição
- [ ] Notificações push
- [ ] Testes E2E passam
- [ ] Build EAS para App Store
- [ ] Submetido para revisão Apple

---

## 📌 NOTAS IMPORTANTES PARA O CODEX

1. **Modelo**: sempre `claude-sonnet-4-20250514` para análise de imagem
2. **Streaming**: usar Server-Sent Events (SSE) no backend, não WebSockets
3. **Apple IAP**: NUNCA processar pagamentos fora do StoreKit — a Apple rejeita a app
4. **RevenueCat**: usar esta lib para abstrair toda a complexidade do StoreKit 2
5. **Sign in with Apple**: obrigatório pela App Store quando há outros métodos de login social
6. **Reset diário**: os prompts resetam à meia-noite no fuso horário do utilizador
7. **Imagens**: nunca guardar base64 na DB — sempre Cloudinary URL
8. **PLUS trial**: oferecer 7 dias grátis para aumentar conversão
9. **Privacidade**: as selfies são processadas e depois apagadas do servidor em 24h (RGPD)
10. **Começar pelo backend**: ter a API funcional antes de construir a app

---

*BoldMens AI iOS App — by spwebfamily-crypto | boldmens.co*
