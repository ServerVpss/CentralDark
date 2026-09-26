# 🔌 Integrações — MultiZap Hub

> **Central modular de integrações.** Cada integração é independente,
> pode ser ativada/desativada e plugada em qualquer sistema da VPS.
>
> **Regra:** NÃO iniciar automaticamente. NÃO expor tokens. NÃO conectar sem autorização.

## Estrutura

```
integracoes/
├── telegram/          ← Bot Telegram completo (alertas + conversacional)
│   ├── bot.js         ← Módulo principal (init, start, stop)
│   ├── config.js      ← Configuração (tokens via env)
│   ├── handlers/      ← Handlers de comandos e mensagens
│   ├── services/      ← Serviços (envio, webhook, API)
│   └── menus/         ← Menus interativos dinâmicos
├── whatsapp/          ← WhatsApp via WuzAPI/Supabase
│   ├── bot.js
│   ├── config.js
│   ├── handlers/
│   └── services/
├── apis/              ← Clientes de API reutilizáveis
│   ├── wuzapi/        ← Cliente WuzAPI (server-only)
│   ├── supabase/      ← Cliente Supabase (service_role)
│   └── gateway/       ← Cliente Gateway MultiZap
├── ai/                ← Central de IA
│   ├── bot.js
│   ├── config.js
│   ├── services/
│   └── providers/     ← OpenAI, Anthropic, Gemini, custom
├── monitor/           ← Monitor de serviços
│   ├── bot.js
│   └── services/
├── payments/          ← Pagamentos PIX
│   ├── bot.js
│   └── services/
├── github/            ← GitHub Deploy
│   ├── bot.js
│   └── services/
├── skills/            ← Gerenciador de Skills
│   ├── manager.js     ← Core: listar, ativar, desativar
│   ├── skills.json    ← Estado das skills
│   ├── categorias/    ← Categorias de skills
│   └── modulos/       ← Skills individuais
├── hub/               ← Hub central de controle
│   └── hub.js         ← Orquestrador: conectar, desconectar, status
├── registry.js        ← Registro de todas as integrações
└── README.md          ← Este arquivo
```

## Como usar

```javascript
const hub = require('./integracoes/hub/hub');

// Listar integrações disponíveis
hub.list();

// Iniciar uma integração
await hub.start('telegram');

// Parar
await hub.stop('telegram');

// Status
hub.status();
```

## Interface padrão de cada integração

Toda integração exporta:

```javascript
module.exports = {
  name: 'telegram',
  version: '1.0.0',
  description: 'Bot Telegram completo',
  
  init(config) { },    // Configurar (não inicia)
  start() { },         // Iniciar
  stop() { },          // Parar
  status() { },        // Retornar estado atual
  healthCheck() { },   // Verificar saúde
};
```

## Regras

- ❌ NUNCA iniciar automaticamente
- ❌ NUNCA expor tokens no código
- ❌ NUNCA conectar sem autorização explícita
- ✅ Cada módulo é independente
- ✅ Configuração via .env da VPS
- ✅ Pode ser plugado em qualquer sistema
