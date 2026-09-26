# Segurança — Workspace & WhatsApp QR MultiZap

Documento que descreve a camada final de segurança para o fluxo de conexão
WhatsApp QR via MultiZap-Gateway (WuzAPI), e o isolamento por workspace.

## 1. Princípio

Remover uma conexão é ação **destrutiva e final**. Depois de remover, o sistema
**não pode**, sob nenhuma hipótese automática:

- chamar `POST /admin/users`
- chamar `POST /connections`
- chamar `POST /session/connect`
- chamar `GET /session/qr`
- reiniciar sessão / abrir QR / mostrar "WhatsApp conectado"
- manter `connection_id` ou QR antigo em estado

Só pode haver nova conexão se o usuário clicar **explicitamente** em
"Conectar novo canal" ou "Reconectar".

## 2. Camadas de proteção implementadas

### 2.1 Tombstone (`removed_qr_connections`)

Tabela com TTL de 7 dias que marca todo `connection_id` removido. Em QR,
`session_data.gateway_connection_id`, `baileys_session_id` e `phone_number_id`
são tratados como IDs equivalentes da mesma sessão; remover marca todos eles,
para nenhum sync trazer a conexão antiga de volta.
Consultada por:

- `getQrConnectionStatus` → devolve `disconnected`, não persiste
- `getQrCode` → bloqueia geração de QR
- `restartQrConnection` → bloqueia reconnect
- `syncQrConnectionsFromGateway` → ignora e loga `auto_create_blocked`

### 2.2 Guard `user_initiated`

`createQrConnection` exige `user_initiated: true` + `action`
(`connect_new_channel` | `reconnect`). Validação Zod rejeita qualquer
chamada server-side que não seja iniciada por clique do usuário.

### 2.3 Anti-duplicidade

Antes de criar, `createQrConnection` consulta o Gateway. Se já existir
conexão `connected | qr | waiting_scan` no workspace, **bloqueia** e
loga `qr_connection_create_blocked_duplicate`. O usuário deve usar a
existente, reconectar ou remover primeiro (override possível via
`allow_duplicate: true`, hoje não exposto na UI).

### 2.4 Anti-duplo-clique

Lock em memória de 3 s por workspace dentro de `createQrConnection`.

### 2.5 Isolamento por workspace

`assertWorkspaceMember` é chamado em todas as funções (create / status /
qr / restart / logout / delete / sync). Cross-workspace é impossível.

### 2.6 Frontend state machine

Estados do modal QR: `idle → checking_gateway → ready_to_connect →
creating_connection → qr_ready → waiting_scan → connected`. Ações
laterais: `disconnecting → disconnected`, `removing → removed`, `error`.

Regras:

- `idle` / `checking_gateway` / `ready_to_connect` **não** chamam create
- `removing` zera timers, dispara `isRemovingRef`, bloqueia respostas
  pendentes
- `removed` fecha modal, limpa estado, refetch da lista
- `disconnected` mantém card com botão "Reconectar"

## 3. Audit log

Ações registradas em `audit_log` (categoria `user` ou `security`):

| action                                  | quando |
|----------------------------------------|--------|
| `qr_connection_created`                | create explícito |
| `qr_connection_disconnected`           | logout no gateway |
| `qr_connection_reconnected`            | restart explícito |
| `qr_connection_removed`                | delete completo |
| `qr_generated`                         | QR retornado |
| `auto_create_blocked`                  | sync/status tentou recriar tombstoned |
| `auto_reconnect_blocked`               | restart tentou tombstoned |
| `qr_generation_blocked_removed`        | getQrCode em tombstoned |
| `qr_connection_create_blocked_duplicate` | duplo clique ou conexão ativa |

Nunca logamos tokens, secrets, QR base64, `WUZAPI_ADMIN_TOKEN`,
`MULTIZAP_GATEWAY_TOKEN` ou `session_token`.

## 4. Logs HTTP esperados

Após "Remover", os únicos logs aceitos no Gateway são:

```
POST /session/logout
DELETE /admin/users/...
DELETE /connections/...
GET  /connections?workspace_id=...
```

Logs **proibidos** após "Remover":

```
POST /admin/users
POST /connections
POST /session/connect
GET  /session/qr
GET  /connections/:id/qr
```

Aparecimento de qualquer um indica regressão.

## 5. Testes manuais

1. Remover conexão conectada → confirmar sem `POST /connections`
2. Remover conexão em QR → polling para, modal fecha, QR não volta
3. Desconectar → status `disconnected`, card permanece
4. Reconectar → só após clique explícito
5. Conectar novo canal → único caminho para `POST /connections`
6. Duplo clique em Conectar → segundo é bloqueado pelo lock
7. Mobile → modal fecha sem estado preso
8. Cross-workspace → 403 / "Sem permissão neste workspace"

## 6. Rollback

```sql
DROP TABLE IF EXISTS public.removed_qr_connections;
```

E reverter:

- `src/lib/multizap-qr.functions.ts`
- `src/lib/whatsapp.functions.ts`
- `src/components/whatsapp/WhatsAppQrConnectionModal.tsx`
- `src/components/whatsapp/ConnectedChannelsSection.tsx`
- `src/components/whatsapp/WhatsAppQrProviderCard.tsx`
- `src/routes/app.canais.tsx`

Não há rollback necessário no Gateway, Recargas Brasil, WuzAPI compose,
Caddy, Docker ou Meta Cloud — nada foi tocado nesses sistemas.

---

## 7. Cadastro e gestão de usuários (auditoria 2026-05-21)

### Chaves e clientes

- `VITE_SUPABASE_PUBLISHABLE_KEY` (anon) — exposta no front, sempre filtrada por RLS.
- `SUPABASE_SERVICE_ROLE_KEY` — somente em `src/integrations/supabase/client.server.ts` via `process.env`. Nunca é lida no browser, nunca aparece em `VITE_*`, nunca em `localStorage`.

### Fluxos públicos encontrados

| Fluxo | Tipo | Status |
|------|------|--------|
| `/auth` — Login (email/senha) | público | mantido |
| `/auth` — Signup novo workspace (dono) | público | mantido (modelo SaaS) |
| `/convite/:token` — Aceitar convite | público | mantido, token assinado |
| Criação de usuário **dentro** de workspace existente | privado | só via `createWorkspaceUser` (admin autenticado) |

### `createWorkspaceUser` (server fn)

- Middleware `requireSupabaseAuth` (401 sem sessão).
- `workspace_id` é deduzido do usuário logado (`getActiveWorkspaceId`) — cliente NÃO consegue passar workspace alheio.
- `assertAdmin` (403 para não-admin).
- Zod restringe `role` a `["admin", "agent"]` — impossível promover a `super_admin` via API.
- Usa `supabaseAdmin.auth.admin.createUser` (service role server-side).
- Cria `profiles` + `workspace_members` em transação lógica.
- Loga `user.create` em `audit_log`.

### `updateWorkspaceUser` (reforçado)

- Bloqueia auto-alteração de role (`user_id === userId` + `role` definido).
- Bloqueia rebaixar o último admin do workspace.
- `assertTargetIsMember` antes de qualquer mutação (cross-workspace impossível).
- `new_password` só via service role no backend; nunca volta no DTO.

### `removeWorkspaceUser`

- Bloqueia auto-remoção.
- Bloqueia remover último admin.
- `assertTargetIsMember`.

### Convites (`workspace-invites.functions.ts`)

- Token gerado server-side, validado contra a tabela `workspace_invites`.
- `acceptInvite` cria auth user via service role e vincula ao workspace do convite.
- Aceite sem token válido = erro.

### RLS auditada

- `profiles`: leitura via `id = auth.uid()` ou via service role no backend.
- `workspace_members`: `is_workspace_member(workspace_id, auth.uid())`.
- `workspaces`: dono + membros.
- `user_roles`: leitura própria + `is_super_admin`.
- `audit_log`: leitura só por admin do workspace ou super_admin.
- Funções `SECURITY DEFINER` (`has_role`, `is_super_admin`, `is_workspace_member`, `is_workspace_admin`) evitam recursão.

### DTOs seguros

Nenhuma server fn retorna `access_token`, `refresh_token`, `password`, `session_token`, `service_role` ou QR base64. Todos os retornos são DTOs explícitos.

### O que ainda NÃO existe (assumido)

- Rate limit dedicado por IP/usuário para `createWorkspaceUser` (assumido: anti-duplo-clique no front + custo da operação dissuade abuso; pode ser endurecido depois com `pg_cron` + bucket).

---

## 8. Rate limit (2026-05-21)

Tabela `rate_limits` + função SQL `consume_rate_limit` (janela deslizante).
Helper `src/lib/rate-limit.server.ts` aplicado em:

| Ação              | Limite/janela            | Buckets         |
|-------------------|--------------------------|-----------------|
| user.create       | 10 / hora                | actor, workspace, IP |
| user.update       | 30 / hora                | actor, workspace |
| user.remove       | 10 / hora                | actor, workspace |
| invite.accept     | 20 / hora                | IP              |
| workspace.signup  | 5 / hora (reservado p/ futuro guard server-side) | IP |

Quando o limite estoura: erro amigável "Muitas operações em pouco tempo. Tente novamente em N minutos." e audit `rate_limit_blocked` (categoria `security`). Fail-open se a RPC falhar (não derruba fluxo legítimo).

## 9. Signup público controlável

`master_settings.public_signup_enabled` (default `true`). Toggle em **/admin/configuracoes**. Quando off:

- Trigger `handle_new_user` rejeita criação de novo workspace com `42501`.
- `/auth` esconde aba "Criar conta" e mostra: "Cadastro público indisponível. Solicite um convite ao administrador."
- Login normal continua funcionando.
- Convite (`/convite/:token`) continua funcionando (usa `skip_default_workspace`).
- Admin criar usuário interno via `createWorkspaceUser` continua funcionando (usa service role + insere direto em workspace_members, não passa pelo branch bloqueado).

## Atualização 2026-05-21 — Estado real do rate limit

Verificado via `rg failClosed src/lib/`:
- `user.create`, `user.update.role`, `user.remove`, `invite.accept` → **fail-closed** confirmado.
- `user.update` (sem role), `invite.resend`, `workspace.signup` → fail-open documentado.
- Painel `/admin/seguranca` **já implementado** (rota `src/routes/admin.seguranca.tsx` + menu).

Ver `docs/RATE_LIMIT_BACKOFF_MULTIZAP.md`.

## Auditoria Frontend × Supabase (2026-05-21)

**O que continua no frontend (aceitável):**
- `VITE_SUPABASE_URL` — público por design.
- `VITE_SUPABASE_PUBLISHABLE_KEY` (anon key) — protegida por RLS.

**O que NUNCA aparece no frontend (confirmado):**
- `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_SECRET`
- `WUZAPI_ADMIN_TOKEN`, `WUZAPI_WEBHOOK_SECRET`
- `MULTIZAP_GATEWAY_TOKEN`, `MULTIZAP_WEBHOOK_SECRET`
- `session_token`, `credentials` jsonb, qualquer `access_token` de conexão WhatsApp
- `GITHUB_OAUTH_CLIENT_SECRET`, `CRON_SECRET`, `ONESIGNAL_REST_API_KEY`

**Regra de boundary aplicada:**
- Service-role só em `*.server.ts` ou em handler de `createServerFn` dentro de `*.functions.ts` (arquivo thin).
- Tokens de gateway só lidos via `process.env` dentro de `multizap-gateway.server.ts` ou webhooks `/api/public/*`.
- Rotas client (`.tsx` em `src/routes/`) só importam stubs RPC; nunca `client.server`.

**Operações sensíveis sempre via serverFn:**
- Criar/remover/atualizar usuário → `workspace-users.functions.ts`
- Aceitar convite → `workspace-invites.functions.ts`
- Criar conexão WA / gerar QR / reiniciar → serverFns com flag `user_initiated`
- Chamadas ao MultiZap-Gateway → `multizap-gateway.server.ts`
- PIX / pagamento / webhooks → server routes `/api/public/*` com HMAC

**Como testar no Chrome:**
1. DevTools → Sources → buscar (Cmd/Ctrl+Shift+F) por: `service_role`, `SERVICE_ROLE`, `WUZAPI_ADMIN`, `MULTIZAP_GATEWAY_TOKEN`, `WEBHOOK_SECRET`. Resultado esperado: nenhum match em chunks `.js`.
2. DevTools → Network → filtrar XHR/Fetch e inspecionar respostas: `whatsapp_connections`, `payment_gateways`, `master_settings` — nenhuma resposta deve trazer `access_token`, `app_secret`, `credentials`, `cron_secret`.
3. Console: `JSON.stringify(import.meta.env)` só mostra `VITE_*`.

## 2026-05-21 — Audit_log de Modo Intervenção (/admin/inbox)
Toda ação operacional do super_admin em /admin/inbox com Modo intervenção ON é registrada em audit_log com actions:
`admin:inbox_intervention_message`, `admin:payment_command_intervention`, `admin:inbox_intervention_claim`, `admin:inbox_intervention_close`, `admin:inbox_intervention_rename_contact`, `admin:inbox_intervention_transfer`.
Payload nunca contém conteúdo da mensagem, tokens, session_token, PIX copia-cola ou QR. Workspace_id é sempre o do dropdown (cliente), nunca o do master. /app/inbox normal não gera essas actions. Modo somente leitura bloqueia composer e ações, então não há o que auditar.
