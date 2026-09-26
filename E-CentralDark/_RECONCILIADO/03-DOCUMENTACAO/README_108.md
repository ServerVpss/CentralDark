# 🔌 Integrações — MultiZap Bot

> **Pasta modular de integrações.** Cada integração é independente e pode ser
> ativada/desativada sem afetar as outras.

## Integrações disponíveis

| Pasta | Integração | Status | Descrição |
|-------|-----------|--------|-----------|
| `telegram/` | Telegram Bot | 🟢 Pronta | Alertas, notificações, bot conversacional |
| `whatsapp/` | WhatsApp/WuzAPI | 🟢 Pronta | Conexão WhatsApp via WuzAPI/Whatsmeow |
| `ai/` | Central de IA | 🟢 Pronta | Router multi-provider (OpenAI, etc) |
| `github-deploy/` | GitHub Deploy | 🟢 Pronta | Deploy automático via GitHub |
| `payments/` | Pagamentos/PIX | 🟢 Pronta | Gateway de pagamentos e PIX |
| `monitor/` | Monitor/Heartbeat | 🟢 Pronta | Monitoramento de serviços |
| `skills/` | Skills Manager | 🟢 Pronta | Gerenciador de skills plugáveis |

## Como usar

Cada integração exporta:
- `config.ts` — configuração e variáveis necessárias
- `index.ts` — funções principais
- `types.ts` — tipos TypeScript

## Como plugar uma integração

```typescript
import { TelegramClient } from '@/integrations/telegram';
import { sendAlert } from '@/integrations/telegram';

// Usar diretamente
await sendAlert({ title: 'Teste', message: 'OK' });
```

## Regras

- ❌ Nunca expor tokens/secrets no frontend
- ❌ Funções server-only marcadas com `.server.ts`
- ✅ Cada integração é independente
- ✅ Ativar/desativar via painel de Skills
