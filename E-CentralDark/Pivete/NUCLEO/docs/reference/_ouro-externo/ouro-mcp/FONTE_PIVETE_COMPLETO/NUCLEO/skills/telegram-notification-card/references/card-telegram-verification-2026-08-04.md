# Verificação do Formato Card Telegram — Sessão 04/08/2026

## Contexto
Pivete confirmou que o formato card usado anteriormente era o `PADRAO-CARD-HERMES v1.2` (SHA `059c5891`, validado 04/07/2026: *"agora sim foi direto pro meu privado, esse sim tá lindo"*). O card **não é editado em tempo real no Telegram** — default é `sendMessage` criando mensagem nova. Edição (`editMessageText`) só se explicitamente ordenado.

## Formato Canônico (v1.2)
```html
<pre>┌────────────────────────────┐
│ HERMES                     │
└────────────────────────────┘

👑 CEO/default
🏠 profile: pivete
🤖 agente: hermes (executor)
🎯 missao: <id>
🧭 fase: <FASE>
⚙️ acao: <acao>
📊 progresso: <valor>
⭐ XP: <valor>
✅ evidencia: <valor>
⏭ proximo passo: <valor>
🛡️ travas: <valor>
🔄 fallback/orquestrador: <modelo>
⏱ horario: <timestamp></pre>
```

## Envio via Connector (NÃO notify-telegram)
```json
{
  "connection_id": "std_01kvw4jkcbekyr1t33vs4p5e9w",
  "connector_id": "telegram",
  "method": "POST",
  "path": "/sendMessage",
  "reason_for_call": "Notificar admin da acao X",
  "body": {
    "chat_id": 1901426549,
    "parse_mode": "HTML",
    "text": "<pre>...card inteiro...</pre>"
  }
}
```

## O que NÃO é default
- **Edição em tempo real** — isso seria `editMessageText`, não é o fluxo padrão
- **Dashboard Web UI (porta 8648)** — o badge "Pensando..." lá é frontend do dashboard, não Telegram
- **notify-telegram** — precisa `NOTIFY_API_KEY` e dá 401

## Teste Real desta Sessão
Tentativa de envio via API `/api/connectors/telegram/sendMessage` falhou com `Method Not Allowed` — o endpoint não existe na API v0.19.1. Os endpoints disponíveis são `/api/messaging/telegram/onboarding/*` e `/api/messaging/platforms`.

**Conclusão:** O envio de card via connector Telegram requer o gateway Telegram **habilitado e rodando** (o que não estava — seção faltando no config.yaml). Após fix do config + restart gateway, o connector deve funcionar.

## Referência Cruzada
- Skill `hermes-platform-config-diagnostics` → fix do telegram no config.yaml
- Spec canônico: `docs/CONSCIENCIA/PADRAO-CARD-HERMES.md` v1.2
- Skill `telegram-notification-card` → `scripts/render_card.py` valida display-width (38 colunas visuais)