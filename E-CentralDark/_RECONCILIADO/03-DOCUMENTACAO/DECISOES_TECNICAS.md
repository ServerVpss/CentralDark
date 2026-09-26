# Decisões técnicas — MultiZap deploy

## 26. `/app/chat` separa grupos visualmente sem migration
**Motivo:** todos os tickets atuais ainda estavam com `tickets.channel_type='private'`, mas mensagens recentes de grupo chegam em `ticket_messages.channel_type='group'`. A aba “Grupos” ficava vazia/errada quando a UI confiava só no campo legado ou quando o botão lateral abria painel de recurso.
**Decisão:** manter sem migration nesta frente. No frontend, detectar grupo por `channelType='group'`, nome/foto de grupo e fallback `@g.us`; o botão lateral “Grupos” apenas ativa o filtro da lista. “Todas”, “Não lidas” e “Canais” excluem grupos.
**Risco:** se um ticket legado não tiver última mensagem marcada como grupo nem identificador de grupo, seguirá como privado até saneamento/backfill futuro. Mitigação: tratar backfill em frente separada, com autorização explícita.

## 25. Webhook QR aceita endpoint antigo e novo
**Motivo:** os logs da VPS mostraram chamadas WuzAPI chegando ao Gateway às 21:16/21:17, mas o teste do endereço antigo `/api/public/wuzapi.webhook` retornou 404 no domínio final. Se `MULTIZAP_WEBHOOK_URL` ainda apontar para esse endereço, o Gateway recebe a mensagem e perde no encaminhamento ao CRM.
**Decisão:** manter o endpoint novo `/api/public/wuzapi/webhook` e adicionar compatibilidade para o endpoint antigo `/api/public/wuzapi.webhook`, ambos usando o mesmo handler autenticado por `X-Gateway-Secret`.
**Risco:** baixo; não altera parser, banco, Gateway, WuzAPI, Meta ou envio. Mitigação: depois do deploy, testar GET nos dois endereços e enviar mensagem real via QR.

## 24. Build de produção exclui arquivos gerados grandes da varredura Tailwind
**Motivo:** o build abortou com SIGABRT em `RegExpImpl::IrregexpExec`/`String::SlowFlatten`, padrão de falta de memória ao processar strings grandes por regex. `routeTree.gen.ts` e os tipos gerados do backend ficam em `src`, mas não têm classes visuais necessárias para o CSS final.
**Decisão:** manter o build com heap maior (`NODE_OPTIONS=--max-old-space-size=4096`) e excluir `src/routeTree.gen.ts` + `src/integrations/supabase` do `@source` do Tailwind. Isso reduz varredura sem alterar runtime.
**Risco:** baixo; se algum dia uma classe visual for colocada nesses arquivos gerados, ela não será incluída no CSS. Mitigação: não colocar UI/classes Tailwind em arquivos gerados ou de integração.

## 23. Rollback da WuzAPI é offline e isolado ao container
**Motivo**: na Fase 4.5 do centro de atualização precisávamos garantir que um rollback automático não pudesse derrubar Recargas Brasil, o Gateway inteiro, nem depender de internet pra `docker pull`.
**Decisão**: `POST /api/system/wuzapi-rollback` só aceita imagens que JÁ estão em cache local (`docker image inspect` antes de qualquer ação). Faz retag local + `docker compose up -d --no-deps wuzapi`. Nunca `-v`, nunca `pm2 restart all`, nunca toca `/root/whatsapp-server` ou porta 3000. Suporta `dry_run` pra validação prévia.
**Risco**: se a imagem anterior não estiver mais em cache (limpeza manual de Docker), o rollback falha — painel mostra erro claro `image_not_local`. Mitigação documentada em `docs/WUZAPI_WHATSMEOW_UPDATE_CENTER.md` com procedimento de rollback manual.


## 22. Correção crítica do normalizador WuzAPI deve existir no GitHub main
**Motivo**: a VPS puxa somente do GitHub main. Se a correção existir apenas no ambiente Lovable, o deploy automático mantém `normalizeService.js` antigo e os eventos WuzAPI voltam como `unknown:no_event` ou não viram `message.received`.
**Decisão**: quando a validação da VPS mostrar `grep` = 0 para `jsonData|ChatPresence|HistorySync|ReadReceipt`, gravar o normalizador diretamente no branch `main` do GitHub via integração segura do painel master, sem expor token. Os dois pacotes devem ficar alinhados: `multizap-gateway-deploy` e `atendimento-whatsapp-gateway-deploy`.
**Risco**: commit direto em produção exige validação imediata na VPS. Mitigação: mudança restrita aos dois normalizadores, rollback por revert do commit novo, sem tocar Recargas Brasil, `/root/whatsapp-server`, portas 3000/9001, PIX, Meta Cloud ou RLS.

## 21. Remover WhatsApp QR nunca pode iniciar conexão nova
**Motivo**: o fluxo anterior misturava abrir modal, criar conexão, gerar QR e reconectar. Após remover uma sessão QR, efeitos/polling ainda podiam disparar `POST /connections`, `POST /session/connect` e `GET /session/qr`, recriando a sessão apagada.
**Decisão**: remover limpa timers, estado local, QR e `connection_id`; fecha o modal e não chama criação/QR. Abrir modal só checa Gateway. Criar conexão e gerar QR ficam restritos a clique explícito em “Conectar WhatsApp” ou “Gerar novo QR”. Desconectar faz apenas logout e mantém o cadastro como `disconnected` para reconexão manual.
**Risco**: menos automação “mágica”, mas o comportamento fica previsível e seguro. Rollback: reverter os arquivos do fluxo QR/app canais e voltar ao modal anterior.

## 20. Frontend nunca fala direto com o Gateway (`MULTIZAP_GATEWAY_TOKEN` server-only)
**Motivo**: o token Bearer dá acesso total ao Gateway (criar/listar/apagar conexões, ler QR, mandar mensagem). Se vazar pro browser, qualquer um clona o cliente.
**Decisão**: todo acesso ao Gateway passa por server functions (`src/lib/multizap-qr.functions.ts`) com `requireSupabaseAuth` + checagem `workspace_members`. URL e token vivem em `process.env` lidos só dentro do `.handler()`. O navegador chama o backend Lovable, que chama o Gateway.
**Risco**: latência extra de um hop. Aceitável (~50–100ms) vs risco de vazamento.

## 19. Gateway atrás de domínio HTTPS (proxy.multizap.dev) em vez de IP+porta
**Motivo**: chamar `http://89.117.78.124:3100` direto trava mixed-content em sites HTTPS, expõe IP da VPS, não tem TLS, e não dá pra fixar headers de segurança.
**Decisão**: Caddy reverso em `proxy.multizap.dev` com Let's Encrypt automático (HSTS, X-Content-Type-Options, X-Frame-Options, Referrer-Policy). Backend usa só o secret `MULTIZAP_GATEWAY_URL`.
**Risco**: dependência do Caddy/Let's Encrypt. Mitigação: renovação automática 30 dias antes. **Fallback NUNCA é voltar pro `http://89.117.78.124:3100`** — isso quebra chamadas via Cloudflare/Lovable (mixed content + bloqueio SSRF) e expõe IP da VPS. Se o HTTPS travar, o caminho correto é corrigir o Caddy/cert e, no frontend, reverter o último commit do modal, ocultar o card do QR ou desligar a feature flag, mantendo `MULTIZAP_GATEWAY_URL=https://proxy.multizap.dev`.


## 18. Normalização de QR/status no Gateway (não devolver raw da WuzAPI)
**Motivo**: a WuzAPI retorna QR em campos variáveis (`QRCode`, `qrcode`, string base64, data URL) e status em formatos heterogêneos. Expor o raw acopla o frontend ao provider.
**Decisão**: o Gateway extrai e normaliza com helpers internos (`pickQr`, `pickStatus`, `pickPhone`) e responde DTO estável. Trocar de provider no futuro não quebra o frontend.
**Risco**: novo formato de payload da WuzAPI exige atualizar os helpers. Mitigação: helpers cobrem múltiplos campos comuns; fallback retorna `unknown`.

## 16. Alias de rede Docker `postgres` + `DB_HOST=postgres` (VALIDADO na VPS)
**Motivo**: no teste real, `DB_HOST=postgreswuzapi` falhou com `lookup postgreswuzapi on 127.0.0.53:53 connection refused` — a WuzAPI ficou em loop de restart. Adicionar `networks.multizap-wuzapi-net.aliases: [postgres]` no serviço Postgres e setar `DB_HOST=postgres` resolveu. O nome do serviço (`postgreswuzapi`) também resolve, mas o alias `postgres` é o que a WuzAPI espera por padrão.

## 17. Sem atributo `version:` no docker-compose.yml
**Motivo**: Compose v2 ignora e emite warning. Removido pra log limpo.



## 1. Não reaproveitar o gh-pull do Recargas
**Motivo**: o histórico do Recargas tem `pm2 restart all`, `git reset --hard`,
`rm -rf auth_info_baileys`. Reaproveitar arriscaria derrubar produção.
**Decisão**: webhook/script próprios (`multizap-gh-pull`, porta 9002).

## 2. Porta 9002 para o webhook
**Motivo**: 9001 é do Recargas. Evita conflito e confusão operacional.

## 3. Pasta `/root/Multizap` (M maiúsculo)
**Motivo**: padrão pedido pelo usuário; distinto de qualquer pasta legado.

## 4. PM2 `MultiZap-Gateway` (substitui `atendimento-whatsapp-gateway`)
**Motivo**: alinhar nomes do produto. Nome antigo só sobrevive em docs de migração.

## 5. WuzAPI publicada só em `127.0.0.1:8081`
**Motivo**: superfície de ataque mínima — só o Gateway local fala com ela.

## 6. `rsync --exclude` para preservar `.env` e dados
**Motivo**: garante que `multizap-gh-pull` nunca sobrescreve segredos reais
nem apaga `gateway/data/` (sessões) e `gateway/logs/`.

## 7. `flock` no script de pull
**Motivo**: dois pushes em sequência não disparam dois deploys concorrentes.

## 8. Imagem WuzAPI via Docker Hub (`asternic/wuzapi:latest`)
**Motivo**: o caminho `ghcr.io/asternic/wuzapi:latest` retornava 404 no deploy real. Docker Hub é o canal oficial e funciona sem autenticação.

## 9. Porta interna do container WuzAPI fixa em 8080, host parametrizável
**Motivo**: o binário escuta sempre em 8080 dentro do container. Mapeamos `127.0.0.1:${WUZAPI_PORT:-8081}:8080` — `WUZAPI_PORT` no `.env` controla só a porta do host.

## 10. Chaves globais obrigatórias (`WUZAPI_GLOBAL_ENCRYPTION_KEY` / `WUZAPI_GLOBAL_HMAC_KEY`)
**Motivo**: versões recentes da WuzAPI exigem essas duas chaves pra cifrar sessões e assinar payloads. Geradas com `openssl rand -hex 32` e armazenadas só no `.env` da VPS.

## 11. Serviço Postgres renomeado para `postgreswuzapi`
**Motivo**: hostname interno mais curto e previsível pro `DB_HOST` do container WuzAPI. Volume continua isolado (`postgres-wuzapi-multizap-data`).

## 12. `start-wuzapi.sh` falha duro (`exit 1`) se WuzAPI não responder
**Motivo**: antes o script só avisava e o deploy seguia, mascarando falha. Agora valida variáveis obrigatórias, aguarda 60s e mata o deploy se a porta não responder — assim o `multizap-gh-pull` não declara sucesso falso.

## 13. Sem `container_name` fixo no docker-compose
**Motivo**: no primeiro teste real o deploy quebrou com `Conflict. The container name "/postgreswuzapi" is already in use` — sobra de um deploy anterior que usou `container_name` fixo. Removemos `container_name` dos dois serviços e fixamos o project name `multizap-gateway`; o Compose passa a nomear como `multizap-gateway-postgreswuzapi-1` (único por projeto). O DNS interno do Compose continua usando o nome do SERVIÇO, então `DB_HOST=postgreswuzapi` ainda resolve.

## 14. `docker compose up -d --remove-orphans` no start-wuzapi
**Motivo**: limpa containers órfãos de versões antigas do compose sem precisar `down -v`. NUNCA usar `-v` aqui — apagaria volumes de sessão do WhatsApp.

## 15. `multizap-gh-pull` aborta se WuzAPI falhar
**Motivo**: trecho anterior tinha `|| log "AVISO seguindo"`, que mascarou a falha no teste real e marcou deploy como sucesso. Agora se `start-wuzapi.sh` retornar erro, o deploy faz `exit 1`. Sucesso só é declarado se: WuzAPI subiu, porta 8081 respondeu, Gateway subiu, `/health:3100` respondeu.

## 8. Imagem WuzAPI via Docker Hub (`asternic/wuzapi:latest`)
**Motivo**: o caminho `ghcr.io/asternic/wuzapi:latest` retornava 404 no deploy
real, travando o `docker compose pull`. Docker Hub é o canal oficial mantido
pelo autor e funciona sem autenticação.

## 9. Porta interna do container WuzAPI fixa em 8080
**Motivo**: o binário da WuzAPI escuta sempre em 8080 dentro do container.
Mapear `127.0.0.1:8081:8080` no host evita confusão com `${WUZAPI_PORT}` —
a variável `WUZAPI_PORT=8081` no `.env` agora descreve só a porta exposta
no host (referência pro Gateway), não a porta interna.

## 10. Chaves globais obrigatórias (`WUZAPI_GLOBAL_ENCRYPTION_KEY` / `WUZAPI_GLOBAL_HMAC_KEY`)
**Motivo**: versões recentes da WuzAPI exigem essas duas chaves pra cifrar
sessões e assinar payloads. Sem elas o container sobe mas falha ao criar
instâncias. Geradas com `openssl rand -hex 32` e armazenadas só no `.env`
da VPS (nunca no repositório).

## Decisão 19 — Token de sessão WuzAPI gerado pelo Gateway
Motivo: WuzAPI aceita `token` no body de `POST /admin/users`, permitindo que o Gateway controle o ciclo de vida da sessão sem depender do token devolvido. Gera 32 bytes hex via `crypto.randomBytes`. Se a WuzAPI ignorar e retornar token próprio, o do remoto prevalece. Token nunca trafega pelo frontend (`redact()` remove `session_token` e `wuzapi_token`).

## Decisão 20 — Header `Token` (capital T) em rotas de sessão
WuzAPI exige `Token: <SESSION_TOKEN>` em `/session/*` e `/chat/*`. Header `token` minúsculo retorna 401/500 silencioso. Admin segue com `Authorization: <ADMIN_TOKEN>`.

## Decisão 21 — Guard `user_initiated` obrigatório em createQrConnection
Toda criação de conexão QR exige `user_initiated: true` no input. Validação Zod (`z.literal(true)`) garante que apenas cliques do usuário no modal disparam `POST /connections`. Caminhos automáticos (sync, polling, cron, retry de erro) não conseguem passar pela validação. Combinado com o tombstone `removed_qr_connections` e o lock anti-duplo-clique, fecha o bug onde "Remover" recriava a conexão.

## Decisão 22 — Anti-duplicidade no create
Antes de criar conexão QR nova, o backend consulta `GET /connections?workspace_id=...` e rejeita se já houver conexão `connected | qr | waiting_scan`. Override possível via `allow_duplicate: true` (não exposto na UI).

## Decisão 23 — Proteção do último admin e auto-role
`updateWorkspaceUser` agora bloqueia (a) admin alterar o próprio `role` e (b) rebaixar o último admin do workspace. Mesma regra do `removeWorkspaceUser`. Evita lock-out total e escalonamento lateral. Super_admin não é alcançável via nenhuma server fn pública — só por migração direta no banco.

## 2026-05-21 — Rate limit + signup público
- Rate limit em DB (não em memória) para sobreviver a múltiplas instâncias e restart.
- Fail-open: erro no RPC nunca derruba fluxo legítimo.
- Signup público controlado por flag no master_settings + bloqueio no trigger handle_new_user (defesa em profundidade: front esconde + DB bloqueia).

## 2026-05-21 — Fail-closed obrigatório em ações destrutivas/role
Decisão: toda operação que cria/remove usuário ou altera role/permissão usa fail-closed no rate limit. Update de profile comum e resend de convite seguem fail-open por não serem destrutivos.

## 2026-05-21 — Audit_log de Modo Intervenção (/admin/inbox)
Toda ação operacional do super_admin em /admin/inbox com Modo intervenção ON é registrada em audit_log com actions:
`admin:inbox_intervention_message`, `admin:payment_command_intervention`, `admin:inbox_intervention_claim`, `admin:inbox_intervention_close`, `admin:inbox_intervention_rename_contact`, `admin:inbox_intervention_transfer`.
Payload nunca contém conteúdo da mensagem, tokens, session_token, PIX copia-cola ou QR. Workspace_id é sempre o do dropdown (cliente), nunca o do master. /app/inbox normal não gera essas actions. Modo somente leitura bloqueia composer e ações, então não há o que auditar.

### 2026-05-21 — Fase 7.2
Decisão: manter status colors semânticos (emerald-500 dot, amber warning, red error) hardcoded. Só neutralizar CTAs e banners que competem visualmente com o tema. Motivo: cor semântica é informação, não tema.

## 2026-05-21 — Fase 7.4: dois layouts NexChat coexistindo
Decisão: manter **dois** componentes raiz no tema NexChat:
- `NexInboxLayout` → usado em `/app/inbox` e `/admin/inbox` (foco em tickets, claim/encerrar, intervenção master).
- `NexChatPage` → usado em `/app/chat` (foco "messenger" — 3 colunas com contact info à direita, mais próximo do template).

Motivo: `/app/chat` é a experiência conversacional pura (UI Messenger-style); `/app/inbox` é a fila de atendimento (UI ticket-style com filtros pesados). Forçar um único layout sacrificaria uma das duas UX. Ambos reusam os mesmos átomos (`NexChatHeader`, `NexMessageList`, `NexChatComposer`, `NexConversationItem`, hooks de tickets/messages/PIX/realtime).

## 2026-05-21 — Capabilities matrix gating no header
Decisão: aplicar `feature-matrix.ts` direto no header do chat (botões Phone/Video) via `data-disabled`, em vez de esconder os botões. Motivo: manter o **visual** fiel ao template mesmo quando o canal não suporta, comunicando o motivo via tooltip. Esconder daria a impressão de UI quebrada/incompleta.

## /app/chat fullscreen condicional
- **Decisão**: short-circuit no `AppLayout` (`src/routes/app.tsx`) em vez de criar uma rota irmã ou layout separado.
- **Motivo**: `/app/chat` precisa permanecer no mesmo file-based route (link no menu não muda); short-circuit é a forma menos invasiva de remover o shell sem mover o arquivo nem duplicar a árvore de rotas.
- **Risco**: hook `useActiveTheme` deve ser chamado antes de qualquer early return — feito (logo após `useLocation`).
- **Alternativa descartada**: rota separada `/app/chat-fullscreen` — quebraria links existentes (?ticketId, deep links das notificações).

## 2026-05-21 — Reaplicar webhook sem reiniciar sessão WuzAPI
- **Decisão**: criar rota dedicada `POST /connections/:id/reapply-webhook` no MultiZap-Gateway que chama apenas `ensureWebhookConfigured(raw)` (que internamente faz `wuzapi.setWebhook`).
- **Motivo**: o `POST /restart` existente rejeita com "already connected" quando a sessão WuzAPI está saudável, então não dá pra usar `restart` como atalho pra reaplicar webhook. E o status "connected" não garante que a WuzAPI ainda tem o webhook salvo — em casos de restart antigo da WuzAPI, falha de rede no `setWebhook` inicial, ou troca de `GATEWAY_PUBLIC_URL`, o webhook some sem derrubar a sessão e o app fica sem receber mensagens. A rota nova é idempotente, não derruba sessão, não gera QR, não expõe token, e roda em milissegundos.
- **Alternativas descartadas**:
  - "Forçar logout + reconnect" → derrubaria a sessão e exigiria novo QR.
  - "Sempre chamar setWebhook no polling de status" → custo desnecessário em toda checagem de status; rota explícita é mais clara e auditável.
- **Risco**: nenhum funcional. Risco operacional: deploy do Gateway precisa estar acima do commit `13b7db9` no GitHub `main` (resolvido pelo force-sync de 21/05/2026).

## 2026-05-21 — Webhook WuzAPI sempre com Subscribe explícito
Toda chamada a `POST /webhook` da WuzAPI deve mandar `webhookURL` (não `webhookUrl`) **e** `Subscribe: ['Message','ChatPresence','ReadReceipt']`. Sem o `Subscribe`, a WuzAPI registra a URL mas não dispara nenhum evento. Decisão tomada após mensagens não chegarem mesmo com webhook configurado e reapply 200.

## Decisão — "Abrir como esta empresa" no painel master de grupos de acesso (2026-05-21)
**Contexto:** o cliente pediu botão "abrir como esta empresa" para ver a tela do jeito que o usuário daquela empresa veria.
**Opções avaliadas:**
1. Impersonation real (master vira sessão do owner da empresa) — quebra isolamento de sessão, abre brecha de segurança, exige mecanismo cross-cutting em todas as server fns que usam `getActiveWorkspaceId`.
2. Override por header global `x-admin-act-as-workspace` validado em cada server fn — muitos pontos de mudança, risco alto de vazar entre requests.
3. **(ESCOLHIDA)** Filtro de escopo na própria tela master via querystring `?ws=<id>`. Mostra apenas grupos daquela empresa, pré-seleciona a empresa em novos grupos, e mantém todas as ações no surface master (com auditoria `admin:`).
**Motivo:** segurança preservada (master nunca "vira" outro usuário), auditoria intacta, zero risco de vazamento cross-workspace, mesmo poder operacional. Impersonation real fica como decisão futura se houver demanda real, com proposta separada de design.

## 2026-05-21 — Estratégia de sync forçado via VERSION marker
Decisão: Quando o GitHub main não reflete mudanças do Lovable (sync travado), alterar a linha 2 (comentário VERSION) força um diff garantido que dispara o push bidirecional.
Alternativa descartada: editar manualmente no GitHub — quebra a regra de fonte única (Lovable).
Risco: nenhum (linha é comentário). Status: ativo.

## 2026-05-22 — Botão "Reconectar" em QR vira reset destrutivo
Decisão: Em conexões WhatsApp QR MultiZap, "Reconectar" executa fluxo destrutivo (logout+DELETE no Gateway+tombstone+remove local+abre QR novo), não tenta reuso da sessão.
Motivo: WuzAPI mantém `events: ""` no socket vivo até um login handshake completo. Sem reset destrutivo, "Reconectar" só reabre o modal e o WuzAPI reaproveita a sessão antiga — usuário nunca consegue QR novo.
Tolerância: logout/DELETE no Gateway são try/catch (404/500 não bloqueia); tombstone e delete local SEMPRE acontecem. Garante que o registro presa nunca trave o usuário.
Separação: Desconectar = só logout (não apaga); Remover = apaga só local + tenta Gateway; Reconectar = reset completo (logout+delete Gateway+delete local+abre QR novo). Embedded Signup (Meta Cloud) mantém comportamento antigo (reauth via FB).
Alternativa descartada: botão separado "Gerar QR novo" — fragmenta UX e o usuário leigo não distingue dos outros 3 botões.
Risco: usuário pode apagar conexão funcional achando que era "reiniciar". Mitigação: toast claro avisando "Sessão antiga apagada...". Status: ativo.

## 2026-05-23 — Remover QR limpa todos os IDs associados
Decisão: remover uma conexão QR não pode depender de um único ID. O fluxo agora considera `session_data.gateway_connection_id`, `baileys_session_id` e `phone_number_id` como IDs equivalentes da mesma sessão.
Motivo: se um desses campos divergir depois de reconexões, apagar só um ID deixa registro local preso ou permite que o sync traga a sessão antiga de volta.
Regra: antes do DELETE, todos os IDs são marcados em `removed_qr_connections`; depois a limpeza local remove qualquer linha QR que aponte para qualquer um desses IDs. Falha do Gateway é tolerada, limpeza local continua.
Risco: baixo — escopo limitado a `wuzapi_gateway`/`multizap_qr`. Status: ativo.

## 2026-05-22 — Fallback SQL WuzAPI controlado por env
**Decisão:** quando o auto-fix HTTP (disconnect→connect→setWebhook) não popula `users.events` na WuzAPI, e somente se `WUZAPI_DB_URL` estiver setado, o Gateway faz `UPDATE users SET events=$1 WHERE token=$2` direto no Postgres da WuzAPI.
**Por quê:** alguns builds da WuzAPI ignoram o parâmetro `events` no `/session/connect`. Sem fallback, a única saída era SQL manual na VPS.
**Alternativas descartadas:** patch no fork da WuzAPI (custoso, mantém divergência); cron de reset (intrusivo e barulhento).
**Risco:** baixo — `pg` é lazy, sem `WUZAPI_DB_URL` o caminho não executa; identificação pelo token da sessão (não há userID hardcoded); connection string nunca chega ao frontend nem ao log.
**Status:** ativo, opt-in via env.

## 2026-05-22 — Reparar recebimento + diagnóstico no card QR
- Decisão: separar "Reparar recebimento" (reapply-webhook, não-destrutivo) de "Reconectar com QR novo" (reset completo). Usuário leigo não deve confundir.
- Diagnóstico visual mostra exatamente o que o gateway reporta em GET /__diag/wuzapi — fonte única da verdade.
- Alerta vermelho só quando events_configured=false ou events.length=0, pra evitar falso positivo.


## 2026-05-22 — Force-push: /__diag/wuzapi + /connections/repair-all-webhooks
Commit 68460f3 no main estava sem as rotas novas registradas (smoke-test VPS retornou `not_found`). Bumpei `sync-marker` em `multizap-gateway-deploy/gateway/src/routes/diag.routes.js` pra gerar commit novo com o estado correto do gateway (diagRoutes registrado em `app.js`, `POST /connections/repair-all-webhooks` em `connections.routes.js`, `repairAllWebhooks()` em `connectionService.js`, `wuzapiDbFallback.js` e `pg` no `package.json`). Validação: `grep -R "__diag\|repair-all-webhooks\|diag.routes\|repairAllWebhooks" multizap-gateway-deploy/gateway/src` → 9 hits. Próximo: `multizap-gh-pull` + `pm2 restart multizap-gateway`.

## 25. Ciclo de vida final do QR (remover / reconectar / adicionar outro número)
**Motivo:** alinhar Gateway WuzAPI, banco local e UI numa única fonte da verdade pra evitar QR fantasma, cards duplicados e Runtime Error ao reconectar.
**Decisão:**
- **Remover**: tombstone gravado para TODOS os IDs associados (`id` local, `phone_number_id`, `baileys_session_id`, `session_data.gateway_connection_id`, `connection_id` Gateway) por 7 dias. DELETE no Gateway é tolerante (timeout/404 não bloqueiam). Limpeza local idempotente por `phone_number_id` OR `baileys_session_id`.
- **Reconectar**: o modal lista conexões antes de qualquer POST; se houver linha QR não-conectada, REUTILIZA o `connection_id`. `upsertQrConnectionFromGateway` faz orphan_row reuse (atualiza por cima quando há exatamente 1 linha QR não-conectada no workspace), preservando histórico/tickets.
- **Adicionar outro número**: nova linha exige `user_initiated:true` + (sem conexão truly_alive OU `allow_duplicate:true` explícito). Lock anti-duplo-clique de 3s no backend. Truly_alive = `logged_in=true && session_connected=true` no `/__diag/wuzapi`.
- **Erro de duplicidade**: o backend lança `QR_CONNECTION_EXISTS:` (com `existing_connection_id`); o modal mostra mensagem amigável no passo "error" — nunca Runtime Error / tela branca.
- **Status real no card**: "Conectado" só com `logged_in=true && session_connected=true` e sem tombstone. `getQrConnectionsDiagnostic` sincroniza local pra `disconnected` quando detecta `logged_out`.
**Alternativas descartadas:** confiar só no `status` do `/connections` do Gateway (gera divergência com sessão morta); apagar tombstone automaticamente no reconnect (abriria brecha pra QR fantasma voltar via sync).
**Risco:** baixo — só afeta provider `wuzapi_gateway`/`multizap_qr`.
**Status:** vigente.

## 2026-05-23 — Limite de body parser do webhook WuzAPI: 30mb
**Decisão:** subir limite do body parser somente em `POST /webhooks/wuzapi` de 5mb pra 30mb. Demais rotas mantêm 5mb.
**Motivo:** WuzAPI envia mídia inline (base64) e payloads de grupo grandes; 5mb causava `request entity too large` derrubando recebimento de mensagens.
**Alternativas:** subir global pra 30mb (rejeitado — maior superfície de DoS); pedir WuzAPI mandar só URL (não controlamos formato dela).
**Risco:** baixo — outras rotas seguem capadas; 413 é respondido na hora com log sanitizado.
**Status:** aplicado.

## 2026-05-23 — Política de logs do Gateway (sanitização obrigatória)
**Decisão:** todo log do MultiZap Gateway deve ser curto, em PT-BR e sanitizado por padrão. Detalhe técnico fica atrás de `DEBUG_LOGS=true`.

**Regras invioláveis:**
- Nunca logar `secret`, `token`, `Authorization`, senha, env, payload completo, base64.
- Nunca logar `media_url` completa — mostrar `"whatsapp_media_url_present"`.
- JIDs sempre mascarados: `5582******1030@s.whatsapp.net`, `120363******8098@g.us`.
- Querystring de HTTP access log sempre passa por `maskQuery` (remove `secret=`, `token=`, etc.).
- Eventos de presença vão pra `debug` — não poluir `info` em produção.

**Convenções de mensagem amigável:**
- `📩 whatsapp_message_received` — mensagem chegou no Gateway.
- `✅ multizap_forward_success` — encaminhado pro CRM.
- `❌ multizap_forward_failed` — falha de encaminhamento, sempre com `reason` + `suggestion`.
- `👥 whatsapp_group_event` — evento de grupo resumido.
- `⚠️ webhook_payload_too_large` — payload acima do limite, com sugestão.
- `🖼️ avatar_*` — operações de foto de contato/grupo (URL nunca completa).

**Modos:**
- `LOG_LEVEL=info` (default) — só amigáveis + warnings + erros.
- `DEBUG_LOGS=true` — reativa `wuzapi_payload_shape`, `presence_event_received` e demais técnicos (continuam sanitizados).
- `LOG_LEVEL=error` — só erros e alertas.

**Helpers:** `utils/safeLog.js` (`maskSecret`, `maskJid`, `maskUrl`, `maskQuery`, `previewBody`) e `utils/logger.js` (`logger.friendly`, `logger.isDebug`).

**Status:** aplicado.

---

## /app/chat — Refino visual completo (Passos 1–6 + Hotfix 6.1) — 2026-05-25

**Contexto:** reformulação visual da tela principal de atendimento (`/app/chat`) inspirada em Underchat/WhatsApp Web/CRM premium, mantendo identidade dark + verde MultiZap. Trabalho exclusivamente de UI/CSS, sem alteração de backend, lógica de envio ou regras de negócio.

**Passos concluídos:**
- **Passo 1** — Estrutura base e tokens visuais.
- **Passo 2** — Layout principal: lista, inbox, menu ⋮ no topo, remoção do botão "Desconectar canal" + botão de voltar (Painel Master para super_admin, /app para usuário comum).
- **Passo 3** — Compactação topo, filtros, bolhas, card IA; responsivo desktop/tablet/mobile.
- **Passo 4** — Header da conversa refinado + bolhas estilo WhatsApp (cantos com "tail" 4px, sombra leve, gradiente verde nas próprias) + system lines como chips.
- **Passo 5** — Composer visual: input em pílula, ring verde no focus, ícones circulares, botão "+" que gira 45° ao abrir menu, botão enviar com gradiente verde + glow.
- **Passo 6** — Polimento final: scrollbars discretas, estado vazio com float, micro-animações de entrada (bolhas e itens da lista), contraste melhorado, foco acessível verde, respeito a `prefers-reduced-motion`.
- **Hotfix 6.1** — Bug mobile: lista e conversa apareciam empilhadas quando a conversa abria por URL (`ticketId`)/refresh/navegação externa. Corrigido com (a) condição `(isMobileChat || activeConv)` no JSX e (b) media query `@media (max-width:1023px)` forçando exclusividade entre `.nx-list-pane` e `.nx-chat` via classe `nx-shell-chat-open`, com `height: 100dvh` no shell.

**Arquivos alterados:**
- `src/components/nexchat/styles/nexchat.css` — todos os blocos visuais (PASSO 2 a 6 + HOTFIX 6.1), cada um isolado e rotulado para rollback granular.
- `src/components/nexchat/NexInboxLayout.tsx` — apenas: remoção do botão "+" verde duplicado (Passo 2), botão master/voltar no menu ⋮ (Passo 2), e condição da lista mobile (Hotfix 6.1, linha 667).
- `src/components/nexchat/NexConversationList.tsx` — ajustes de layout do Passo 2.

**Não tocado em nenhum momento:**
- `NexChatComposer.tsx` (componente do campo de digitar)
- Lógica de envio, onSubmit, handlers, upload, áudio, anexos, emojis
- Payload de mensagem, status de entrega
- Backend, TanStack server functions, RLS
- Gateway MultiZap (porta 3100, PM2 MultiZap-Gateway)
- WuzAPI (127.0.0.1:8081), Whatsmeow
- Meta Cloud API, webhooks, janela 24h
- Supabase: schema, RLS, migrations, tabelas
- PIX, recargas, pagamentos
- Parser central (`normalizeService`), banco de produção
- Autenticação, roles, `is_super_admin`

**Testes realizados:**
- Mobile 390×844 a cada passo
- Tablet (≤1023px) e mobile pequeno (≤640px) cobertos por media queries dedicadas
- Hotfix 6.1 validado pelo usuário: lista e conversa não aparecem mais empilhadas; botão voltar funciona; composer não corta; menu ⋮ ok; desktop intacto
- Envio/recebimento de mensagens não foi alterado (nenhum .tsx de composer/serverFn tocado)

**Rollback geral:**
- Visual completo: apagar os blocos `PASSO 2/6` até `PASSO 6/6` + `HOTFIX 6.1/6` no fim de `src/components/nexchat/styles/nexchat.css` (todos rotulados).
- Mudanças em `NexInboxLayout.tsx` e `NexConversationList.tsx`: reverter via History (Lovable) ou git.

**Próximo passo recomendado (aguardando autorização):**
- Espelho `/admin` do `/app/chat`: visualização master das conversas por workspace, com pausar/bloquear/auditar (alinhado à REGRA GLOBAL do projeto). Toda ação master gravando em `audit_log` com prefixo `admin:`.

**Status:** etapa visual `/app/chat` ENCERRADA. Aguardando autorização para próxima frente.
---

## /app/chat — Hotfix 6.2 (menu inferior mobile/tablet) — 2026-05-25 (APROVADO)

**Contexto:** complemento final da etapa visual `/app/chat`. No menu inferior mobile/tablet, as opções Grupos/Chamadas/Status/Config não exibiam o aviso "Em construção".

**Correção aplicada:**
- Mobile/tablet: Grupos, Chamadas e Status agora abrem `NexFeaturePanel` em fullscreen (mesma tela "Em construção" do desktop).
- Config: exibe toast `"Configurações — função em preparação"` via `notReady()`.
- Chats: continua levando para a lista; item ativo destacado em verde.
- Bottom nav permanece visível pra voltar pra Chats.
- Desktop: comportamento inalterado.

**Arquivos alterados:**
- `src/components/nexchat/NexNavigationRail.tsx` — Config só chama `onSettings` quando o pai passa handler; senão cai no `onChange`.
- `src/components/nexchat/NexInboxLayout.tsx` — `onChange` do rail intercepta `settings` e dispara toast `notReady("Configurações")`.
- `src/components/nexchat/styles/nexchat.css` — refino do HOTFIX 6.1: regra mobile que esconde `.nx-chat` agora usa `:has(.nx-list-pane)` (só esconde quando a lista está ao lado). Quando railTab é Grupos/Chamadas/Status, a lista não é renderizada e o feature panel ocupa o mobile inteiro.

**Causa do bug:**
1. Item "Config" chamava `onSettings?.()` mas o pai nunca passava handler → clique mudo.
2. CSS do HOTFIX 6.1 escondia `.nx-chat` em qualquer cenário sem `nx-shell-chat-open` → escondia também o feature panel das outras abas no mobile.

**Não tocado:** composer, envio, payload, upload, áudio, status, backend, Gateway, WuzAPI, Supabase/RLS, banco, PIX, recargas, parser central, autenticação, roles.

**Testes confirmados pelo usuário:**
- Mobile 390×844, Tablet ≤1023px, Desktop: Chats, Grupos, Chamadas, Status, Config — todos OK.
- Nenhuma sobreposição. Composer e conversas intactos.

**Rollback (registrado):**
1. `NexNavigationRail.tsx`: voltar para `if (isSettings) { onSettings?.(); } else { onChange?.(it.id); }`
2. `NexInboxLayout.tsx`: voltar para `onChange={setRailTab}`
3. `nexchat.css`: remover `:has(.nx-list-pane)` da regra do HOTFIX 6.1 (volta a `.nx-shell:not(.nx-shell-chat-open) .nx-chat`)
- Alternativa: reverter as 3 edições via History do Lovable.

**Status:** etapa visual `/app/chat` ENCERRADA DEFINITIVAMENTE (Passos 1–6 + Hotfixes 6.1 e 6.2). Aguardando autorização para próxima frente.