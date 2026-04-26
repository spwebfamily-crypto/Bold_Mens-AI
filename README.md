# BoldMens AI

BoldMens AI e uma aplicacao mobile iOS construida com Expo e React Native para analise de selfies, recomendacoes personalizadas de cortes de cabelo, produtos, tendencias e gestao de planos FREE/PLUS. O projeto inclui tambem uma API Node.js/Express em TypeScript responsavel por autenticacao, analise com IA, historico, subscricoes e integracoes externas.

## Visao Geral

- App mobile com Expo Router, NativeWind, Zustand e TanStack Query.
- Backend Express com TypeScript, MongoDB, Redis, JWT e middlewares de seguranca.
- Analise real de imagem com OpenAI Vision e streaming de resposta via Server-Sent Events.
- Upload e retencao de imagens com Cloudinary.
- Autenticacao por email/password e Sign in with Apple.
- Subscricoes PLUS com RevenueCat e webhook de sincronizacao.
- Planos com limites diarios, historico diferenciado e tendencias exclusivas.

## Stack Tecnica

### Mobile

- Expo 54
- React Native 0.81
- React 19
- Expo Router 6
- NativeWind + Tailwind CSS
- Zustand
- TanStack Query
- Axios
- RevenueCat Purchases
- Expo Camera, Image Picker, Notifications e Secure Store

### Backend

- Node.js
- Express 4
- TypeScript
- MongoDB + Mongoose
- Redis + ioredis
- JWT + refresh tokens
- Zod
- OpenAI Responses API para analise de selfie
- Anthropic SDK para tendencias opcionais
- Cloudinary
- RevenueCat
- Helmet, CORS, Compression e rate limiting

## Estrutura do Projeto

```text
.
|-- app/                  # Rotas e telas da app Expo
|-- assets/               # Icones, splash screen e imagens nativas
|-- backend/              # API Express/TypeScript
|   |-- src/
|   |   |-- config/       # Ambiente, MongoDB e Redis
|   |   |-- controllers/  # Handlers HTTP
|   |   |-- middleware/   # Auth, limites, upload e erros
|   |   |-- models/       # Modelos Mongoose
|   |   |-- routes/       # Rotas da API
|   |   |-- services/     # IA, Cloudinary, RevenueCat e tendencias
|   |   `-- utils/        # Tokens, datas, limites e helpers
|   `-- tests/            # Testes unitarios do backend
|-- components/           # Componentes reutilizaveis da UI
|-- constants/            # Planos, cores e constantes da app
|-- hooks/                # Hooks de autenticacao, chat, analise e subscricao
|-- services/             # Cliente API e servicos mobile
|-- stores/               # Stores Zustand
|-- tests/                # Testes unitarios da app
|-- types/                # Tipos compartilhados do frontend
`-- utils/                # Utilitarios da app
```

## Pre-requisitos

- Node.js 20 ou superior
- npm
- Expo CLI via `npx expo`
- MongoDB disponivel localmente ou em cloud
- Redis disponivel localmente ou em cloud
- Conta OpenAI para analise real de imagem
- Conta Anthropic opcional para tendencias geradas por IA
- Conta Cloudinary para upload de imagens
- Conta RevenueCat para subscricoes iOS
- Xcode e simulador iOS para execucao nativa

## Configuracao

1. Instale as dependencias:

```bash
npm install
```

2. Crie o arquivo de ambiente:

```bash
cp .env.example .env
```

3. Preencha as variaveis necessarias:

```env
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-5.4-mini
MONGODB_URI=mongodb+srv://...
REDIS_URL=redis://...
JWT_SECRET=replace-with-strong-secret
JWT_REFRESH_SECRET=replace-with-strong-refresh-secret
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
REVENUECAT_API_KEY=...
REVENUECAT_WEBHOOK_AUTH=...
EXPO_PUBLIC_API_URL=http://localhost:3000/api
EXPO_PUBLIC_REVENUECAT_IOS_KEY=appl_...
EXPO_PUBLIC_FREE_DAILY_LIMIT=3
```

> O backend procura variaveis primeiro em `backend/.env` e depois no `.env` da raiz. Nunca versionar chaves reais, tokens ou credenciais.

## Execucao Local

### App Expo

```bash
npm run start
```

Para abrir diretamente em cada plataforma:

```bash
npm run ios
npm run android
npm run web
```

### Backend

```bash
npm run backend:dev
```

Por padrao, a API sobe em:

```text
http://localhost:3000
```

Healthcheck:

```text
GET /health
```

## Scripts

```bash
npm run start          # Inicia o Expo
npm run ios            # Executa a app iOS
npm run android        # Executa a app Android
npm run web            # Executa a app web via Expo
npm run lint           # Executa ESLint
npm run typecheck      # Valida TypeScript da app
npm run test           # Executa testes da app
npm run backend:dev    # Inicia a API em modo desenvolvimento
npm run backend:build  # Compila o backend
npm run backend:test   # Compila e executa testes do backend
```

## Rotas da API

### Autenticacao

```text
POST /api/auth/register
POST /api/auth/login
POST /api/auth/refresh
POST /api/auth/apple
GET  /api/auth/me
POST /api/auth/logout
```

### Analises

```text
GET  /api/analysis
GET  /api/analysis/:id
POST /api/analysis
```

O endpoint `POST /api/analysis` recebe uma imagem via `multipart/form-data`, aplica limite por plano e devolve eventos SSE:

```text
status -> progresso da analise
delta  -> texto parcial da IA
final  -> resultado estruturado
error  -> erro de processamento
```

### Subscricao

```text
GET  /api/subscription
POST /api/subscription/validate
POST /api/subscription/revenuecat/webhook
```

### Tendencias

```text
GET /api/trends
GET /api/trends?hairType=wavy
```

## Planos

| Plano | Limite de analises | Historico | Recursos |
| --- | --- | --- | --- |
| FREE | 3 por dia | 7 dias | Sugestoes essenciais, 3 produtos e tendencias basicas |
| PLUS | Ilimitado | 365 dias | Tendencias completas, rotina diaria, mais produtos e experiencia sem anuncios |

O limite diario e calculado por timezone do utilizador e pode ser ajustado por `FREE_DAILY_LIMIT` e `EXPO_PUBLIC_FREE_DAILY_LIMIT`.

## Fluxo de Analise

1. O utilizador captura ou escolhe uma selfie na app.
2. A imagem e comprimida no mobile antes do envio.
3. O backend valida autenticacao e limite do plano.
4. A imagem e enviada para Cloudinary.
5. A selfie e analisada com OpenAI Vision.
6. A resposta e transmitida para a app por SSE.
7. O resultado estruturado e guardado no MongoDB.
8. O historico fica disponivel conforme a retencao do plano.

## Qualidade e Testes

Antes de abrir um pull request ou gerar build, execute:

```bash
npm run typecheck
npm run test
npm run backend:test
```

Quando alterar regras de planos, limites ou retencao, valide tambem os testes do backend, especialmente `backend/tests/unit/planGuard.test.mjs`.

## Seguranca

- Tokens de acesso usam JWT de curta duracao.
- Refresh tokens sao armazenados com hash.
- Rotas protegidas exigem `Authorization: Bearer <token>`.
- CORS e configurado por `CORS_ORIGINS`.
- Uploads passam por `multer` em memoria.
- Helmet, compression e rate limiting sao aplicados globalmente.
- Webhooks RevenueCat podem exigir bearer token via `REVENUECAT_WEBHOOK_AUTH`.

## Integracoes Externas

| Servico | Uso |
| --- | --- |
| OpenAI Vision | Analise real de selfie e geracao de recomendacoes |
| Cloudinary | Upload e armazenamento temporario de imagens |
| MongoDB | Usuarios, analises e uso diario |
| Redis | Infra de cache/limites quando configurada |
| RevenueCat | Compras, restauracao e estado da subscricao |
| Apple | Sign in with Apple e validacao de identity token |

## Notas de Desenvolvimento

- Sem `OPENAI_API_KEY`, o backend recusa a analise em vez de devolver recomendacoes fixas. Para testes locais, define `ALLOW_MOCK_ANALYSIS=true` fora de producao.
- O produto PLUS esperado no app e `com.boldmens.plus.monthly`.
- O bundle identifier iOS configurado e `co.boldmens.ai`.
- A app usa tema escuro e copy em portugues europeu.
- O endpoint base da app vem de `EXPO_PUBLIC_API_URL` ou de `app.config.ts`.

## Licenca

Projeto privado. Todos os direitos reservados.
