# BoldMens WhatsApp AI

![Node 20+](https://img.shields.io/badge/node-20%2B-43853d)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6)
![Railway](https://img.shields.io/badge/Railway-ready-111111)

WhatsApp AI assistant for [boldmens.co](https://boldmens.co). Users send a face photo on WhatsApp and receive haircut suggestions, product recommendations, a daily care routine, and a booking path to Bold Men's Salon.

## Architecture

```text
WhatsApp User
    |
    v
Twilio WhatsApp Webhook
    |
    v
Express API -> Controller -> Session Service -> MongoDB
                |              |
                |              -> Analysis history
                |
                -> Image Downloader -> Twilio Media URL
                -> Cloudinary
                -> Anthropic Vision + Recommendation
                -> Twilio outbound messages
```

## Prerequisites

- Node.js 20+
- npm 10+
- MongoDB Atlas or local MongoDB
- Twilio account with WhatsApp Sandbox
- Anthropic API key
- Cloudinary account

## Local Setup

1. Clone the repository.
2. Install dependencies with `npm install`.
3. Copy `.env.example` to `.env`.
4. Fill in Anthropic, Twilio, MongoDB, and Cloudinary credentials.
5. Start MongoDB if using a local instance.
6. Run `npm run dev`.

## Environment Variables

- `ANTHROPIC_API_KEY`: Claude API key.
- `TWILIO_ACCOUNT_SID`: Twilio account SID.
- `TWILIO_AUTH_TOKEN`: Twilio auth token.
- `TWILIO_WHATSAPP_FROM`: WhatsApp sender, usually `whatsapp:+14155238886` in sandbox.
- `MONGODB_URI`: MongoDB connection string.
- `CLOUDINARY_CLOUD_NAME`: Cloudinary cloud name.
- `CLOUDINARY_API_KEY`: Cloudinary API key.
- `CLOUDINARY_API_SECRET`: Cloudinary API secret.
- `PORT`: Express port.
- `NODE_ENV`: `development`, `production`, or `test`.
- `BOLDMENS_WEBSITE`: allowed CORS origin and booking site.
- `LOG_LEVEL`: `error`, `warn`, `info`, or `debug`.
- `RATE_LIMIT_MAX`: IP rate limit ceiling.
- `RATE_LIMIT_WINDOW_MINUTES`: IP rate limit window.
- `SESSION_EXPIRY_HOURS`: session reset threshold.
- `MAX_IMAGE_SIZE_MB`: maximum inbound image size.

## Twilio WhatsApp Sandbox

1. Open the Twilio Console.
2. Enable the WhatsApp Sandbox.
3. Join the sandbox by sending `join <code>` to `whatsapp:+14155238886`.
4. Configure the webhook URL as `https://your-domain/webhook/whatsapp`.
5. For local development, expose the server with `ngrok http 3000`.

## Usage Flow

1. User sends the first message.
2. Bot asks for the user's name.
3. Bot asks for a clear face photo.
4. Bot downloads the Twilio image, stores it in Cloudinary, and sends it to Anthropic.
5. Bot formats the results for WhatsApp and shows a follow-up menu.
6. User can ask for more haircut details, more product details, booking, or a new analysis.

## Health Endpoints

- `GET /health`
- `GET /health/detailed` in `development`

## Railway Deploy

1. Push the repository to GitHub.
2. Create a new Railway project.
3. Connect the repository.
4. Add all environment variables from `.env.example`.
5. Railway builds with `npm run build`.
6. Railway starts with `npm run start`.
7. Use `/health` as the healthcheck path.

## Example Conversation

```text
User: Ola
Bot: Bem-vindo ao Bold Men's Salon AI. Responde com o teu nome.
User: Rodrigo
Bot: Envia uma foto nitida do rosto com o cabelo visivel.
User: [photo]
Bot: Estou a analisar a tua foto agora...
Bot: Analise + cortes recomendados + produtos + rotina
Bot: 1. Mais detalhes dos cortes / 2. Mais detalhes dos produtos / 3. Link de agendamento / 4. Nova analise
```

## Troubleshooting

- Missing `.env` values: the server exits during startup with validation errors.
- Twilio 403 webhook: verify `X-Twilio-Signature`, public URL, and reverse proxy protocol.
- MongoDB connection errors: confirm `MONGODB_URI` and network allowlist.
- Anthropic request failures: confirm API key and request quotas.
- Cloudinary upload errors: confirm cloud name, key, and secret.

## Roadmap

- Multi-image analysis and profile evolution
- Richer booking integration
- CRM sync and retention metrics
- Admin dashboard for conversation review

## License

MIT
