# COMANDO - RATE_LIMIT_BACKOFF_MULTIZAP.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\CentralDark\apps\clone-deck\apps\crm\docs\RATE_LIMIT_BACKOFF_MULTIZAP.md
**SHA:** d50fe028a15f4772
**Timestamp:** 2026-08-26T19:31:30.305513
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- Regra: qualquer operação que **crie usuário, remova usuário, altere

### Ouro Bruto (primeiros 5000 chars)
```
# Rate Limit & Backoff — MultiZap

Documento de referência sobre rate limiting aplicado nas operações sensíveis
do painel MultiZap. Implementado via tabela `rate_limits` + função SQL
`public.consume_rate_limit` (janela deslizante) e helper
`src/lib/rate-limit.server.ts`.

## 1. Modos

- **fail-open**: se a checagem (RPC) falhar por erro infra/timeout, a
  operação prossegue. Usado APENAS em fluxos não destrutivos.
- **fail-closed**: se a checagem falhar, a operação é **bloqueada** e
  retorna a mensagem segura:
  > "Não foi possível validar a segurança da operação agora. Tente novamente em instantes."
  Tudo é registrado em `audit_log` com `action = rate_limit_check_failed`,
  `fail_mode = "closed"`.

## 2. Operações críticas (FAIL-CLOSED) ✅

Confirmado no código (`rg failClosed src/lib/`):

| Operação            | Arquivo                              | Limite     | failClosed |
|---------------------|--------------------------------------|------------|------------|
| `user.create`       | `workspace-users.functions.ts:150`   | 10/h       | ✅ true    |
| `user.update.role`  | `workspace-users.functions.ts:232`   | 10/h       | ✅ true    |
| `user.remove`       | `workspace-users.functions.ts:315`   | 10/h       | ✅ true    |
| `invite.accept`     | `workspace-invites.functions.ts:295` | 20/h       | ✅ true    |

Regra: qualquer operação que **crie usuário, remova usuário, altere
permissão/role ou aceite convite** roda em fail-closed.

## 3. Operações não críticas (fail-open documentado)

| Operação          | Motivo                                                         |
|-------------------|----------------------------------------------------------------|
| `user.update`     | Edição de campos do profile sem mudança de role. Não destrutivo. |
| `invite.resend`   | Reenvio de convite — recriável, não cria nem altera permissão. |
| `workspace.signup`| Cadastro público — já protegido por flag `public_signup_enabled`. |

## 4. Auditoria

Eventos gravados em `audit_log` (category = `security`):

- `rate_limit_blocked` — limite estourado, com `retry_after_seconds`.
- `rate_limit_check_failed` — RPC falhou; `fail_mode` indica se a
  operação foi bloqueada (`closed`) ou liberada (`open`).

Visualização em `/admin/seguranca` (Super Admin), com filtros por tipo,
operação, workspace e período.

## 5. Como testar

1. Forçar 11 criações de usuário em 1h → 11ª deve retornar 429 amigável.
2. Derrubar/instabilizar RPC `consume_rate_limit` (renomeando
   temporariamente) → tentar criar usuário → deve retornar a mensagem
   segura E registrar `rate_limit_check_failed` com `fail_mode=closed`.
3. Para fluxos fail-open (ex. `user.update` sem role), mesmo cenário
   deve **permitir** a operação e logar `fail_mode=open`.

## 6. Rollback

Reverter `failClosed: true` para `failClosed: false` no helper
correspondente. Não exige migração SQL.

```