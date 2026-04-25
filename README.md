<p align="center">
  <img src="./assets/logo-boldmens.svg" alt="Bold Men's AI" width="220" />
</p>

<h1 align="center">Bold Men's AI</h1>

<p align="center">
  Assistente de recomendacao capilar via WhatsApp para a Bold Men's, com recomendacoes personalizadas,
  fluxo guiado e estrutura pronta para deploy na Railway.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/node-20%2B-43853d" alt="Node 20+" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6" alt="TypeScript 5.x" />
  <img src="https://img.shields.io/badge/Twilio-WhatsApp-E11D48" alt="Twilio WhatsApp" />
  <img src="https://img.shields.io/badge/Railway-ready-111111" alt="Railway ready" />
</p>

## Visao geral

O `Bold_Mens-AI` e um backend em `Node.js + TypeScript` que recebe mensagens do WhatsApp via Twilio, gere sessoes por utilizador e devolve recomendacoes de cortes, produtos e rotina capilar.

Hoje, o fluxo ativo funciona em **modo quiz guiado**: o utilizador responde a algumas perguntas rapidas e o sistema gera sugestoes com base nesse perfil. A base do projeto continua preparada para evoluir para analise por imagem, mas o comportamento atual prioriza o quiz.

> Estado atual: se o utilizador enviar foto, o bot redireciona para o quiz em vez de processar a imagem diretamente.

## O que o projeto entrega

- Atendimento automatico em portugues e ingles.
- Sessao por numero de WhatsApp com historico, expiracao e continuidade de contexto.
- Recomendacao ranqueada de cortes com base em formato de rosto, textura, comprimento e manutencao desejada.
- Sugestao de produtos e rotina diaria compativeis com o perfil informado.
- Envio de referencias visuais de cortes pelo WhatsApp.
- Menu de follow-up para rever cortes, produtos, link de agendamento ou iniciar nova analise.
- Endpoints de saude e protecao basica com `helmet`, `cors` e `express-rate-limit`.

## Fluxo atual da conversa

```text
Utilizador no WhatsApp
        |
        v
Twilio WhatsApp Webhook
        |
        v
Express API
        |
        +--> Message Controller
               |
               +--> Session Service + MongoDB
               +--> Recommendation Service
               +--> WhatsApp Service (resposta ao utilizador)
```

Fluxo do utilizador:

1. Envia a primeira mensagem.
2. O bot identifica o idioma e pede o nome.
3. O bot faz 5 perguntas rapidas sobre rosto, textura, comprimento, barba e manutencao.
4. O motor de recomendacao seleciona cortes, produtos e rotina.
5. O utilizador recebe o resumo, referencias visuais e um menu com proximos passos.

## Stack

- `Express` para a API e webhooks.
- `Twilio` para entrada e saida via WhatsApp.
- `MongoDB + Mongoose` para sessoes e historico.
- `TypeScript` para tipagem e manutencao.
- `Vitest` para testes.
- `Railway` como alvo de deploy.

## Estrutura do projeto

```text
src/
  config/        validacao de ambiente
  controllers/   orquestracao da conversa
  data/          catalogo de cortes e produtos
  middleware/    validacao Twilio e tratamento de erros
  models/        modelos MongoDB
  routes/        healthcheck e webhook
  services/      recomendacao, sessao, WhatsApp e visao
  utils/         formatacao, logs e helpers
tests/           testes automatizados
```

## Configuracao rapida

### Requisitos

- `Node.js 20+`
- `npm 10+`
- `MongoDB` local ou Atlas
- Conta `Twilio` com WhatsApp Sandbox
- Conta `Cloudinary`

### Instalacao

1. Instala as dependencias:

   ```bash
   npm install
   ```

2. Cria o ficheiro de ambiente:

   ```bash
   Copy-Item .env.example .env
   ```

3. Preenche as credenciais no `.env`.

4. Inicia o servidor em desenvolvimento:

   ```bash
   npm run dev
   ```

## Scripts disponiveis

```bash
npm run dev
npm run build
npm run start
npm run test
npm run test:run
```

## Variaveis de ambiente

| Variavel | Obrigatoria | Descricao |
| --- | --- | --- |
| `OPENAI_API_KEY` | Nao | Chave OpenAI. No fluxo atual de quiz, nao e o elemento principal. |
| `TWILIO_ACCOUNT_SID` | Sim | SID da conta Twilio. |
| `TWILIO_AUTH_TOKEN` | Sim | Token de autenticacao da Twilio. |
| `TWILIO_WHATSAPP_FROM` | Sim | Numero remetente do WhatsApp, normalmente o sandbox. |
| `MONGODB_URI` | Sim | String de ligacao ao MongoDB. |
| `CLOUDINARY_CLOUD_NAME` | Sim | Nome da cloud no Cloudinary. |
| `CLOUDINARY_API_KEY` | Sim | API key do Cloudinary. |
| `CLOUDINARY_API_SECRET` | Sim | API secret do Cloudinary. |
| `PORT` | Nao | Porta HTTP da aplicacao. O default e `3000`. |
| `NODE_ENV` | Nao | `development`, `production` ou `test`. |
| `BOLDMENS_WEBSITE` | Nao | Origem permitida no CORS e site de booking. |
| `LOG_LEVEL` | Nao | Nivel de logs: `error`, `warn`, `info` ou `debug`. |
| `RATE_LIMIT_MAX` | Nao | Maximo de pedidos por janela no webhook. |
| `RATE_LIMIT_WINDOW_MINUTES` | Nao | Janela do rate limit em minutos. |
| `SESSION_EXPIRY_HOURS` | Nao | Tempo de expiracao da sessao. |
| `MAX_IMAGE_SIZE_MB` | Nao | Tamanho maximo de imagem aceite pelo sistema. |

## Endpoints

| Metodo | Rota | Descricao |
| --- | --- | --- |
| `POST` | `/webhook/whatsapp` | Recebe eventos do Twilio WhatsApp. |
| `GET` | `/health` | Healthcheck principal. |
| `GET` | `/health/detailed` | Healthcheck detalhado em `development`. |

## Twilio WhatsApp Sandbox

1. Ativa o WhatsApp Sandbox na consola da Twilio.
2. Envia o codigo `join <codigo-do-sandbox>` para `whatsapp:+14155238886`.
3. Publica o backend localmente com `ngrok http 3000` ou outra URL publica.
4. Define o webhook como `https://sua-url/webhook/whatsapp`.

## Exemplo de conversa

```text
Utilizador: Ola
Bot: Bem-vindo a Bold Men's. Responde com o teu nome.
Utilizador: Rodrigo
Bot: Pergunta 1/4. Qual formato de rosto combina mais contigo?
Utilizador: 2
Bot: Pergunta 2/4. Qual e a textura do teu cabelo?
...
Bot: Aqui tens os cortes recomendados, produtos e rotina.
Bot: 1. Detalhes dos cortes / 2. Detalhes dos produtos / 3. Agendamento / 4. Nova analise
```

## Deploy na Railway

1. Faz push do repositorio para o GitHub.
2. Cria um projeto novo na Railway.
3. Liga o repositorio.
4. Adiciona as variaveis do `.env.example`.
5. Usa `npm run build` no build e `npm run start` no start.
6. Configura `/health` como endpoint de healthcheck.

## Proximos passos recomendados

- Reativar a analise real por foto com o fluxo de visao.
- Ligar o agendamento a um sistema real de booking.
- Adicionar painel interno para rever conversas e recomendacoes.
- Medir conversao de quiz para agendamento.

## Licenca

MIT
