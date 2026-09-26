# MTProto bidirecional — fluxo runtime sem duplicar cérebro

> Data: 2026-09-24  
> Escopo: Telegram Bot API + MTProto user bridge + VPS runtime  
> Regra: `ONE_SYSTEM_ONLY=true`, `REUSE_BEFORE_CREATE=true`, `REALITY_IS_JUDGE=true`

## Veredito

O fluxo correto não cria um cérebro por bot. O Telegram é superfície de entrada/saída; o MTProto é bridge de conta pessoal; SOL coordena; Hermes/MCP executa; Reality Judge valida.

```text
CHEFE fala com SOL
SOL entende intenção
Capability Router escolhe papel/agente
Hermes/MCP executa
Security/Telegram notifica e responde
MTProto entra somente quando precisar da conta pessoal
Reality Judge valida
SOL devolve ao CHEFE
```

O fluxo proibido é:

```text
cada bot vira um cérebro próprio
cada bot decide sozinho
cada bot cria regra própria
```

## Diagrama canônico

```mermaid
flowchart TD
  CHEFE[CHEFE / SEGREDO] --> SOL[SOL / Orquestrador]
  SOL --> ROUTER[Capability Router]

  ROUTER --> SECURITY[Security / Guardião<br/>Bot API]
  ROUTER --> GREG[Greg<br/>Auditoria determinística]
  ROUTER --> IAN[Ian<br/>Guardrails]
  ROUTER --> GEOFF[Geoff<br/>Loops]
  ROUTER --> DEX[Dex<br/>Deploy]
  ROUTER --> HERMES[Hermes / MCP<br/>Executor]
  ROUTER --> MTPROTO[MTProto user bridge<br/>scripts/telegram-mtproto/server.js]

  SECURITY --> NOTIFY[Notificação / conversa / painel]
  MTPROTO --> USERSESSION[Conta pessoal Telegram<br/>session.txt fora do Git]
  HERMES --> VPS[VPS Runtime]
  VPS --> HEALTH[/health :8790]
  HEALTH --> JUDGE[Reality Judge]
  JUDGE --> SOL
  SOL --> CHEFE

  JUDGE -. bloqueia .-> FALSEGREEN[Falso-verde]
  FALSEGREEN -. não promove .-> SOL
```

## Estado medido nesta cristalização

```text
MTPROTO_SOURCE = PASS
MTPROTO_PROCESS = ONLINE no perfil PM2 remoto medido
PORTA_8790 = PASS
HEALTH = PASS
CONFIG_TELEGRAM = CONFIG_BLOCKED até credenciais existirem
CONTA_PESSOAL = UNKNOWN até login MTProto ser confirmado
OWNER_CANONICO_PM2 = PENDENTE_RECONCILIAR
```

Payload vivo observado no `/health`:

```json
{
  "ok": true,
  "service": "telegram-mtproto",
  "transport": "TELEGRAM_MTPROTO_DIRECT",
  "configured": false,
  "status": "CONFIG_BLOCKED",
  "hasSession": false
}
```

## Patch lógico versionado

O `scripts/telegram-mtproto/server.js` não deve encerrar o processo quando `TELEGRAM_APP_API_ID` ou `TELEGRAM_APP_API_HASH` estiverem ausentes. A forma segura é subir em modo `CONFIG_BLOCKED`, responder `/health`, bloquear `/start` e `/confirm` com HTTP 503 e manter segredo fora do Git.

Esse comportamento preserva observabilidade sem fingir que a conta pessoal está conectada.

## Invariantes

- `CONFIG_BLOCKED != READY`
- `PROCESSO_ONLINE != CONTA_CONECTADA`
- `HEALTH_200 != LOGIN_PASS`
- `BOT_API != MTPROTO`
- `MTProto != cérebro novo`
- `Security/SOL/Greg/Ian/Geoff/Dex = papéis/superfícies`, não owners paralelos
- `session.txt` fica fora do Git
- `REALITY_IS_JUDGE`

## NEXT_CURSOR

```text
1. Reconciliar PM2 do perfil remoto com owner canônico sem matar processo vivo.
2. Confirmar variáveis TELEGRAM_APP_API_ID / TELEGRAM_APP_API_HASH fora do Git.
3. Testar /health :8790 depois da reconciliação.
4. Só então conectar conta pessoal via /start + /confirm.
5. Registrar receipt com HEAD, PID, PM2_HOME, health payload e decisão READY/CONFIG_BLOCKED.
```
