# Central de Notificações do Master — Fase 5

## Visão geral

O Master tem uma central única pra decidir **quais eventos** do sistema disparam
notificação e **pra onde** elas vão (sino in-app do master e/ou bots Telegram).

Canais ativos hoje:
- **Sino in-app do master** (badge no topbar de `/admin/*`)
- **Telegram** (via bot próprio cadastrado pelo master)
- **audit_log** (sempre — independente de regra)

E-mail **não** está implementado nesta fase.

## Tabelas

| Tabela | Função |
|---|---|
| `notification_event_catalog` | Catálogo de eventos possíveis (auto-alimentado via `registerEvent`) |
| `notification_telegram_bots` | Bots cadastrados pelo master (token criptografado, nunca exposto) |
| `notification_telegram_destinations` | Chats/grupos detectados via `getUpdates` |
| `notification_rules` | Mapeamento evento → canais + severidade mínima + destinos |
| `notification_log` | Histórico de cada tentativa (sent/failed/skipped + erro humanizado) |
| `master_notifications` | Fila do sino in-app do master |

## UI

Tudo em **`/admin/notificacoes`** (4 abas):
- **Destinos** — cadastrar bot Telegram, detectar chats, testar envio
- **Eventos** — catálogo dinâmico, filtros, botão "Disparar teste"
- **Regras** — por evento, ligar/desligar canais e escolher destinos
- **Logs** — auditoria de envios com erros explicados

## Como disparar uma notificação no código

Sempre use os helpers de `src/lib/notifications-events.ts`. Eles são
**server-only** (usam `supabaseAdmin`).

```ts
import { notify, registerEvent } from '@/lib/notifications-events';

// 1. Registrar o evento (idempotente — pode chamar sempre)
await registerEvent({
  event_key: 'wuzapi.update.success',
  title: 'WuzAPI atualizado',
  description: 'Disparado quando a imagem do WuzAPI é atualizada com sucesso.',
  category: 'wuzapi',
  severity_default: 'info',
});

// 2. Disparar
await notify('wuzapi.update.success', {
  title: 'WuzAPI atualizado',
  body: 'Nova versão v1.2.3 instalada.',
  severity: 'info',
  payload: { version: 'v1.2.3' },
  link: '/admin/sistema/wuzapi',
});
```

### Regras importantes

- `notify()` **nunca lança exceção** — falha de notificação não quebra a operação que a disparou.
- A `severity` informada é comparada com `min_severity` da regra. Ex: regra com `min_severity=warning` ignora eventos `info`.
- Se não houver regra cadastrada pro evento, ele **só vai pro audit_log** (não dispara canais).
- O `workspace_id` é opcional — use quando o evento for de um workspace específico (aparece no log e ajuda o master a filtrar).

## Categorias usadas

| Categoria | Exemplos |
|---|---|
| `wuzapi` | update success/failure, health degradado, rollback |
| `gateway` | offline, deploy success/failure |
| `qr` | conexão caiu, reconexão, ban detectado |
| `security` | tentativa de burla 24h, workspace pausado |
| `system` | cron falhou, backup, manutenção iniciada/finalizada |
| `campaigns` | campanha finalizada, falha em massa |
| `billing` | trial expirando, pagamento falhou |

## Como adicionar um novo evento

1. Chamar `registerEvent({...})` em algum ponto de boot ou na própria
   server fn que vai disparar. Idempotente — não precisa migration.
2. Disparar via `notify('event_key', {...})`.
3. O evento aparece automaticamente em **Admin → Notificações → Eventos** e
   pode ser configurado pelo master sem deploy.

## Janela de manutenção

Eventos com `category='system'` durante uma janela de manutenção ativa
(ver `get_active_maintenance`) ainda são despachados normalmente — o banner em
`/app/chat` é a forma de avisar os atendentes, não silencia o master.
