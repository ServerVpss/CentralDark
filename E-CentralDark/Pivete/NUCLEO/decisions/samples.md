# DECISAO - samples.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\zoom\skills\team-chat\references\samples.md
**SHA:** 66e696492c6fa04e
**Timestamp:** 2026-08-26T18:42:52.205551
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- Consistent error handling pattern:

### Ouro Bruto (primeiros 5000 chars)
```
# Sample Applications Analysis

Analysis of official Zoom Team Chat sample applications, extracted patterns, and best practices.

## Sample Overview

| Sample | Language | Complexity | Best For |
|--------|----------|------------|----------|
| [chatbot-nodejs-quickstart](https://github.com/zoom/chatbot-nodejs-quickstart) | Node.js | ⭐ Beginner | **Start here** - Tutorial series |
| LLM chatbot pattern | Node.js | ⭐⭐ Intermediate | Provider-neutral LLM integration pattern |
| [unsplash-chatbot](https://github.com/zoom/unsplash-chatbot) | Node.js | ⭐⭐ Intermediate | API integration + database |
| [zoom-erp-chatbot-sample](https://github.com/zoom/zoom-erp-chatbot-sample) | Node.js | ⭐⭐⭐ Advanced | Enterprise integration |
| [task-manager-sample](https://github.com/zoom/task-manager-sample) | Node.js | ⭐⭐⭐ Advanced | Full CRUD application |
| [zoom-cohere-chatbot-sample](https://github.com/zoom/zoom-cohere-chatbot-sample) | Node.js | ⭐⭐ Intermediate | Cohere LLM integration |
| [zoom-cerebras-chatbot-sample](https://github.com/zoom/zoom-cerebras-chatbot-sample) | Node.js | ⭐⭐ Intermediate | Cerebras LLM integration |
| [zoom-team-chat-shortcut-sample](https://github.com/zoom/zoom-team-chat-shortcut-sample) | Node.js | ⭐⭐ Intermediate | Shortcuts and UI elements |
| [zoom-teams-chat-snowflake-sample](https://github.com/zoom/zoom-teams-chat-snowflake-sample) | Node.js | ⭐⭐⭐ Advanced | Snowflake data integration |
| [rivet-javascript-sample](https://github.com/zoom/rivet-javascript-sample) | Node.js | ⭐⭐ Intermediate | Rivet SDK usage |

## 1. chatbot-nodejs-quickstart

**Repository**: https://github.com/zoom/chatbot-nodejs-quickstart

**Description**: Official tutorial series covering 9 episodes from setup to advanced features.

**Key Features**:
- Setup & Send Messages
- Handle Events
- Slash Commands
- Markdown & Emojis
- Reactions & Interactive Messages
- Threaded Replies
- Search Messages via API
- Scheduling Messages
- Zoom Workplace App Integration

**Project Structure**:
```
chatbot-nodejs-quickstart/
├── routes/
│   ├── zoom-webhookHandler.js     # Webhook event handling
│   └── oauth-routes.js             # OAuth flow
├── utils/
│   ├── zoom-api.js                 # API helper functions
│   ├── zoom-chatbot-auth.js        # Token generation
│   └── validation.js               # Webhook signature verification
├── views/                          # EJS templates
├── server.js                       # Express app
└── .env.example                    # Environment variables
```

**Key Patterns**:

### Webhook Handler Pattern
```javascript
async function handleZoomWebhook(req, res) {
  verifyZoomWebhookSignature(req);

  const { event, payload } = req.body;

  switch (event) {
    case 'bot_notification':
      return handleBotNotification(payload, res);
    case 'interactive_message_actions':
      return handleButtonClick(payload, res);
    // ... more cases
  }
}
```

### Token Generation
```javascript
async function getChatbotToken() {
  const credentials = Buffer.from(
    `${CLIENT_ID}:${CLIENT_SECRET}`
  ).toString('base64');

  const response = await fetch('https://zoom.us/oauth/token', {
    method: 'POST',
    headers: { 'Authorization': `Basic ${credentials}` },
    body: 'grant_type=client_credentials'
  });

  return (await response.json()).access_token;
}
```

**Best Practices**:
- ✅ Signature verification on all webhooks
- ✅ Environment variables for credentials
- ✅ Modular route structure
- ✅ Error handling with try/catch
- ✅ Immediate webhook response (200 status)

**Recommended For**: First-time chatbot developers

## 2. LLM chatbot pattern

**Description**: AI-powered chatbot using an LLM provider for natural language responses.

**Key Features**:
- LLM API integration
- Conversation history tracking
- Streaming responses (optional)
- Context management

**LLM Integration Pattern**:
```javascript
case 'bot_notification': {
  const { toJid, cmd, accountId } = payload;

  // Call your LLM provider
  const response = await llmClient.responses.create({
    model: process.env.LLM_MODEL,
    max_tokens: 1024,
    messages: [{ role: 'user', content: cmd }]
  });

  const llmResponse = response.content[0].text;

  // Send back to Zoom
  await sendChatbotMessage(toJid, accountId, {
    body: [{ type: 'message', text: llmResponse }]
  });
}
```

**Conversation History Pattern**:
```javascript
const conversationHistory = new Map();

function addToHistory(userId, role, content) {
  if (!conversationHistory.has(userId)) {
    conversationHistory.set(userId, []);
  }
  conversationHistory.get(userId).push({ role, content });
}

// In bot_notification handler
const history = conversationHistory.get(userId) || [];
const response = await llmClient.responses.create({
  model: process.env.LLM_MODEL,
  messages: history
});
```

**Environment Variables**:
```bash
LLM_API_KEY=your_api_key_here
LLM_MODEL=your_model_here
ZOOM_CLIENT_ID=...
ZOOM_CLIENT_SECRET=...
ZOOM_BOT_JID=...
```

**Recommended For**: Building AI
```