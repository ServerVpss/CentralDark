# 📨 Central de Notificações — CentralDark

> Fundação de projeção do ecossistema. Qualquer parte do sistema — VPS, bots, IAs, crons, site, Desktop, SOL, Hermes, Obsidian, webhooks e scripts — notifica pelo **mesmo contrato**, fica registrada no mesmo ledger de notificações e pode aparecer no Mega Painel e no Telegram.
>
> **Notificação é projeção, não autoridade.** `NOTIFIED != PROVED`, `DELIVERED != RUNTIME_PROVEN`, `UNKNOWN != PASS`.

---

## Owner e integração com o núcleo

```text
OWNER_CLIENT=src/lib/notifications-events.ts
OWNER_EDGE_HELPER=supabase/functions/_shared/notifications-events.ts
LOG=notifications_log
HUMAN_SURFACE=/mega-painel
KNOWLEDGE_HUB=docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/KNOWLEDGE-HUB.yml
CONTINUITY=docs/CONSCIENCIA/RANDOLF-CONTINUIDADE.md
```

A Central de Notificações **não é um segundo Hub** e não cria um segundo fluxo. Ela projeta eventos materiais que já possuem contexto do mesmo organismo:

```text
INTENÇÃO / GOAL
→ !CENTRALDARK
→ RANDOLF
→ HUB ÚNICO DE CONHECIMENTO
→ OWNER / EXECUÇÃO / REALITY JUDGE
→ EVENTO MATERIAL
→ CENTRAL DE NOTIFICAÇÕES
→ notifications_log
→ Mega Painel / Telegram / consumidor autorizado
```

## Linguagem humana canônica

Toda superfície de notificação deve preservar os gatilhos e termos canônicos, mas falar primeiro para uma pessoa comum. A ordem é obrigatória no owner central e recomendada para emissores legados até convergirem nele:

```text
GATILHO CANÔNICO
→ O QUE ACONTECEU, EM PORTUGUÊS SIMPLES
→ ESTADO HUMANO (🟢 / 🟡 / 🔴 / ❓)
→ TERMO TÉCNICO E ESCOPO
→ O QUE FOI FEITO
→ O QUE AINDA FALTA PROVAR
→ RASTRO TÉCNICO (owner / HEAD / SHA / runtime / sessão / cursor)
→ !CONTRAPROVA
→ ⚖️ REALIDADE É O JUIZ
```

Regras de escrita:

- não remover `!CENTRALDARK`, `!AURÉOLA CANÔNICA`, `!CONTRAPROVA`, `UNKNOWN`, `PASS`, `HEAD`, `SHA`, `runtime` ou outros termos necessários ao rastro;
- termo técnico nunca deve ser a única explicação quando houver equivalente humano simples;
- falar com o CHEFE em PT-BR natural, direto, com baianês leve e sem caricatura;
- `🟢` significa prova no escopo declarado, nunca verdade eterna;
- `🟡` significa que ainda há algo a conferir;
- `🔴` significa falha material localizada, não condenação global;
- `❓ UNKNOWN` permanece desconhecido e nunca vira PASS por narrativa;
- Bíblia/metáfora pode orientar a leitura, mas nunca substitui evidência;
- detalhes técnicos ficam abaixo da conclusão humana, preservando rastreabilidade.

Exemplo de leitura:

```text
⭕ !AURÉOLA CANÔNICA
📖 “Examinai tudo. Retende o bem.” — 1 Tessalonicenses 5:21

🔴 CHEFE, deu problema e o rastro abaixo mostra onde olhar.
👉 O que aconteceu: os 3 deploys anteriores falharam pela mesma causa.
⚖️ Estado: CAUSA RAIZ CONFIRMADA; CORREÇÃO AINDA NÃO PROVADA.

🔎 !CONTRAPROVA
❓ A correção só recebe verde depois do teste real. UNKNOWN != PASS.

⚖️ REALIDADE É O JUIZ.
```

## Contexto CentralDark preservado

Quando disponível, o envelope de notificação transporta os mesmos identificadores usados para reencontrar a passagem sem transformar nenhum deles em autoridade:

| Campo | Papel |
| --- | --- |
| `event_key` | identidade estável do tipo de evento |
| `severity` | `info` \| `sucesso` \| `aviso` \| `erro` \| `critico` |
| `source_surface` | CHAT, VOICE, WEB, DESKTOP, SOL, HERMES, VPS, GITHUB etc. |
| `session_id` | proveniência da sessão observada; não é owner nem current state |
| `profile_id` | perfil humano projetado |
| `profile_display` | apresentação humana, padrão `😎 Orquestração SOL 🌞` quando aplicável |
| `intent_goal` | intenção/GOAL vigente ligada ao evento |
| `owner` | owner material resolvido |
| `head_sha` | SHA quando o evento é ligado a código/versionamento |
| `knowledge_event_id` | ligação com o evento candidato do Hub de conhecimento |
| `next_cursor` | próximo ponto de retomada do RANDOLF/CARACOL |
| `runtime` | runtime observado quando aplicável |

Regras:

```text
SESSION_ID != AUTHORITY
PROFILE != AUTHORITY
NOTIFICATION != EVIDENCE_BY_ITSELF
EVENT_KEY != VERDICT
SECRET_VALUE_IN_NOTIFICATION=FORBIDDEN
SAME_MATERIAL_EVENT_SHOULD_KEEP_SAME_CONTEXT=true
DEDUPE_BEFORE_FANOUT=true
```

---

## Visão geral

```text
VPS / Cron / Bot / Script / Site / Desktop / SOL / Hermes / Obsidian
                              │
                              │ evento material + contexto RANDOLF
                              ▼
                      notifications-events
                              │
                   ┌──────────┴──────────┐
                   ▼                     ▼
          notifications_log       notify-telegram
             (Supabase)               │
                   │                   ▼
                   │              Telegram API
                   ▼
             Realtime
                   │
                   ▼
             Mega Painel
```

A implementação não depende da Lovable como autoridade arquitetural. Integrações externas são consumidores/providers substituíveis; o contrato CentralDark permanece o mesmo.

## Componentes

| Componente | Onde vive | Função |
| --- | --- | --- |
| `notifications-events.ts` | `src/lib/` | cliente browser do envelope central |
| `notifications-events.ts` | `supabase/functions/_shared/` | helper server-side, catálogo, debounce, log e fanout |
| `notify-telegram` | Supabase Edge Function | autentica, grava log e envia Telegram |
| `notifications_log` | Tabela Postgres | histórico permanente + fonte do painel realtime |
| `/usr/local/bin/notify` | VPS (bash) | wrapper para scripts quando instalado no runtime |
| `notify.py` | VPS (Python) | wrapper Python quando instalado no runtime |
| `/mega-painel` | TelePainel | projeção visual da Central de Notificações |

`DOCUMENTED != INSTALLED`: wrappers de VPS ou superfícies web só recebem verde CURRENT após medição no runtime correspondente.

---

## Tabela `notifications_log`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `id` | uuid | PK |
| `created_at` | timestamptz | quando entrou |
| `origem` | text | quem mandou (`central`, `vps`, `bot`, `gateway`, `elite-mapper`...) |
| `tipo` | text | `info` \| `sucesso` \| `aviso` \| `erro` \| `critico` |
| `titulo` | text | título curto |
| `mensagem` | text | corpo humano |
| `metadata` | jsonb | contexto estruturado sem segredos |
| `telegram_message_id` | bigint | id da mensagem enviada, quando aplicável |
| `telegram_chat_id` | bigint | destino usado, quando aplicável |
| `sent_ok` | bool | entrega Telegram medida por essa integração |
| `send_error` | text | erro de transporte, quando houver |
| `dedupe_hash` | text | identidade anti-spam quando usada pelo owner |

RLS/admin e credenciais continuam sob os owners de Supabase/runtime. Service role nunca pertence ao frontend.

---

## Endpoint de transporte Telegram

```text
POST https://<supabase>/functions/v1/notify-telegram
Headers:
  X-Notify-Key: <NOTIFY_API_KEY>
  Content-Type: application/json
```

Credenciais reais pertencem ao secret store/runtime e **nunca** devem ser colocadas em commits, receipts, sessão, Hub ou notificação.

### Códigos de erro esperados

| HTTP | Classe | Causa típica |
| --- | --- | --- |
| 400 | entrada inválida | JSON/campos inválidos |
| 401 | não autorizado | chave ausente ou inválida |
| 405 | método inválido | rota chamada com método incorreto |
| 5xx | falha de serviço | persistência/transporte indisponível |

Falha do Telegram não prova falha da CentralDark inteira. O evento continua localizado na aresta de transporte; o CARACOL volta apenas pelo cone causal afetado.

---

## Tipos e selos

| Tipo | Selo | Quando usar |
| --- | --- | --- |
| `info` | ℹ️ | estado informativo |
| `sucesso` | ✅ | ação/prova realmente concluída no escopo declarado |
| `aviso` | ⚠️ | atenção ou evidência incompleta não bloqueante |
| `erro` | ❌ | falha material localizada |
| `critico` | 🚨 | falha crítica que exige reação |

O selo facilita leitura; não fabrica o veredito.

---

## Dedupe e fanout

Eventos repetidos devem ser deduplicados/agrupados antes do fanout quando o owner possuir chave de agrupamento. Isso evita inundação do painel/Telegram e mantém um único rastro causal.

```text
MESMO EVENTO MATERIAL
→ MESMO group_key/contexto
→ INCREMENTA/AGRUPA
→ NÃO CRIA SEGUNDA MISSÃO
```

---

## Como chamar

### Browser / app CentralDark

Use `notify()` de `src/lib/notifications-events.ts` e inclua o contexto disponível. Não chame Telegram diretamente do renderer/browser.

### Edge function

Use o helper compartilhado `supabase/functions/_shared/notifications-events.ts`; ele registra em `notifications_log` e usa o transporte configurado.

### VPS / scripts

Wrappers podem chamar o transporte configurado depois que sua instalação/runtime estiver provada. O fato de o script existir no repositório não prova instalação na VPS.

---

## Mega Painel

O Mega Painel é **HUD/projeção**:

- feed ao vivo por realtime quando a infraestrutura estiver ativa;
- filtros por tempo, tipo e origem;
- resumo de saúde e últimos eventos;
- contexto de superfície, perfil, sessão, GOAL, owner, SHA e próximo cursor quando fornecido.

```text
HUD != AUTHORITY
RED_ON_EDGE != GLOBAL_RED
GREEN_CARD != GLOBAL_FIXED_POINT
```

---

## Segurança

- credenciais somente em secrets/runtime;
- nenhuma chave/token em payload persistido;
- service role somente server-side;
- sanitização/limites de strings;
- contexto da sessão não deve carregar cookies, Authorization headers ou conteúdo secreto;
- `session_id` é proveniência, nunca permissão;
- fallback de transporte não pode ampliar autoridade;
- erro de sensor/transporte deve permanecer localizado.

---

## Prova de runtime

Para declarar a Central de Notificações viva no presente, o receipt mínimo é:

```text
SOURCE_EVENT
→ EVENT_KEY + CONTEXTO
→ notifications_log INSERT/UPDATE
→ realtime/painel OU transporte configurado
→ DELIVERY/RENDER RECEIPT
```

Se a claim for Telegram, é necessário provar a entrega Telegram. Se a claim for painel, é necessário provar o realtime/painel. Um não empresta verde ao outro.

---

## Estado de implementação e próximos passos

- [x] contrato de notificação único no repositório;
- [x] cliente browser e helper server-side;
- [x] contexto RANDOLF/Hub com sessão, perfil, GOAL, owner, SHA e next cursor;
- [x] integração conceitual com Mega Painel e Telegram pelos owners existentes;
- [ ] remedir runtime CURRENT do `notifications_log`/realtime;
- [ ] remedir transporte Telegram CURRENT;
- [ ] remedir instalação dos wrappers na VPS;
- [ ] provar end-to-end `VOICE/CHAT → !CENTRALDARK → RANDOLF/HUB → evento → Central de Notificações` no mesmo ciclo;
- [ ] promover somente claims cujo runtime/HEAD aplicável tenha receipt.

## Lei final

```text
UMA INTENÇÃO
→ UM HUB DE CONHECIMENTO
→ UM CONTEXTO RANDOLF
→ UMA CENTRAL DE NOTIFICAÇÕES
→ MUITAS SUPERFÍCIES
→ UM RASTRO CAUSAL
→ REALIDADE JULGA
```

## E-mail / Gmail — projeção pelo owner existente

```text
OWNER_ACCOUNT=apps/modulos/oauth-broker/server.mjs
SURFACE=Contas / Hub
PROVIDER=gmail
NEW_MAIL_HUB=false
NEW_NOTIFICATION_ARCHITECTURE=false
REUSE_BEFORE_CREATE=true
```

Gmail não cria um segundo sistema de notificações. A conta e a autorização ficam no **Contas / Hub** já existente (`oauth-broker`). O conteúdo humano continua seguindo o contrato desta Central de Notificações e, quando o GitHub envia e-mail por comentário de PR, a origem continua sendo o comentário do GitHub — não um novo serviço de e-mail da CentralDark.

Para comentários de PR que viram e-mail, a ordem humana deve ser:

```text
ESTADO DA MENSAGEM (CURRENT/HISTÓRICO/SNAPSHOT)
→ O QUE ACONTECEU
→ BLOQUEIA AGORA?
→ O QUE FALTA
→ PROVA/HEAD
→ DETALHES TÉCNICOS RECOLHIDOS
```

`UNKNOWN` de capability declarativa não vira `SUPPORT_REQUIRED` sozinho. Só `NAO` explícito para uma capability realmente requerida pode solicitar suporte automático.

## Despacho MCP unificado do Instinto Superior

**Um catálogo:** `apps/modulos/mcp/src/tools/core/mcp-admin.js`,
em paridade com `dist/tools/core/mcp-admin.js`. A lista de
`providerCapabilities` dá nome humano, responsabilidade, provedor,
autorização necessária e `runtimeState: UNKNOWN` para capacidades externas.
**CATALOGUED != AUTHORIZED != EXECUTABLE != PROVED**. Conectar um plugin
nesta conversa não transmite uma credencial à Casa ou à VPS.

**Uma central:** `notifications_log` é o ledger, `notification_routes`
o roteador de destinos Telegram já existente, e
`useNotificationsLog` projeta o feed autorizado no sininho e na aba
Admin → Notificações do Cockpit. O Realtime só recebe LIVE após
SUBSCRIBED. Sem leitura válida: UNKNOWN, não zero eventos comprovados.

**Despacho:** modos `single` e `parallel` são decisões do orquestrador,
com destinatários definidos por owner, permissão e recibo individual.
Telegram tem rota existente; envio para setores, especialistas e Hermes
requer adapters autorizados e confirmação de entrega/execução.
O registro do evento **nunca executa sozinho** uma skill, um modelo ou
um Harness. Contrato declarativo no arquivo existente
`MODULES/HUB/controls/notifications-and-sensors.json`.


<!-- CENTRALDARK_HERMES_SUPABASE_COCKPIT_REALTIME_20261018 -->
## Receipt 2026-10-18 — Hermes → Supabase Realtime → Instinto Superior (menor delta)

**Intenção:** usar a central existente como *projeção de prova* no cockpit, distinguindo estado do canal, evento de verdade e execução do Hermes. \`REUSE_BEFORE_CREATE\`: nenhum banco, tabela, WebSocket, worker, HUD, PR-mãe ou executor paralelo foi criado.

### T0 e owner verificados

- Banco Supabase CentralDark \`lyoigsqluyktoclwdaft\`: \`public.notifications_log\` já pertence à publication \`supabase_realtime\`, com \`REPLICA IDENTITY FULL\` e RLS que permite \`SELECT\` somente a \`authenticated\` com papel \`admin\`. Dado de 2026-10-18, leitura do conector oficial Supabase.
- O feed e o sininho existentes são \`apps/instinto-superior/src/hooks/useNotificationsLog.ts\` e \`apps/instinto-superior/src/components/central/CentralNotificacoes.tsx\`; não substituem \`docs/NOTIFY\`, \`src/lib/notifications-events.ts\` ou as Edge Functions \`notify-event\`/\`notify-telegram\`.
- Baseline: \`notifications_log\` tinha 574 registros, último em 2026-07-04; \`hub_missions\` tinha 3.610 missões \`queued/pending\`, \`hub_mission_events\` e \`hub_evidence\` tinham 0. Nenhuma execução automática é inferida desses números.
- Kanban Hermes real \`t_619b0c7a\`, \`run_id=54\`: eventos \`created→claimed→spawned→crashed→gave_up\`; último estado \`blocked\`, código de saída 1, falha do provedor de modelo local. A tentativa não concluiu os cinco gates do microdeploy.

### T1 comprovado no Supabase — evento real, ingestão assistida

\`\`\`text
TABLE=public.notifications_log
RECEIPT_ID=17681f3a-4fdf-438e-930a-f1b4dc7ddc55
PROOF_ID=hermes-kanban:t_619b0c7a:run54:crashed
TASK_ID=t_619b0c7a
RUN_ID=54
PROOF_STATE=FAIL
EVENT_CREATED_AT=2026-10-18T04:45:32.962228Z
SOURCE=READBACK_HERMES_NATIVE_KANBAN_VIA_MCP
PUBLICATION_MODE=MANUAL_MEASURED_PROJECTION
NEXT_CURSOR=REPAIR_HERMES_LOCAL_MODEL_THEN_RETRY_AUTHORIZED_TASK
\`\`\`

A gravação do evento foi idempotente por \`metadata.proof_id\` no SQL executado pelo conector oficial; a leitura seguinte do mesmo registro retornou UUID, tipo \`erro\`, source, status, cursor e modo de publicação exatos. **Este recibo prova escrita e readback no banco, não prova canal de WebSocket em navegador, entrega automática do Hermes ou deploy frontend**. Nenhuma mensagem foi inventada como sucesso.

### Reforço incremental na main

- \`914891f679e184a3d952362ad5f32058b11695d3\` — hook existente recupera mensagens perdidas por \`SELECT\` RLS a cada 20 segundos, deduplica UUID, mantém janela temporal móvel e reconsulta ao conectar Realtime.
- \`f1e8af4ff616952581ad74c4b323086b5ed0ae67\` — UI existente distingue \`proof_state\`, \`publication_mode\` e \`source_surface\`; \`SUBSCRIBED\` é conexão, nunca recibo E2E.
- Contraprova de sintaxe: arquivos obtidos da \`main\` pelo GitHub autenticado, \`typescript.transpileModule\`, \`TSX_SYNTAX=PASS\` e **zero** erros nos dois filesets (não substitui lint/build E2E).
- CI observado após o commit: \`test.yml\` (Instinto), \`vps-exec-selfhosted.yml\` (deploy canônico), \`porta-de-entrada\` e CodeQL **PENDING** no SHA \`f1e8af4\`; \`PENDING != PASS\`.

### Lacunas honestas para promoção

1. **PRODUCER:** criar o vínculo faltante no owner de emissão já existente, após autenticação/autoridade e provas de emissão automática do Hermes. Não enviar credenciais à UI e não usar Edge pública sem verificar sua autorização efetiva. Evento gravado manualmente não prova producer automático.
2. **BROWSER:** autenticado como admin no cockpit, observar o mesmo \`receipt_id\` por leitura RLS, receber \`INSERT\` realmente novo por Realtime, desconectar/reconectar, comprovar dedupe e polling de recuperação. \`CHANNEL_SUBSCRIBED != EVENT_DELIVERED\`.
3. **DEPLOY:** VPS ainda em checkout \`fb7a00a60\` com alterações de outros escritores; não limpar, resetar, stashear, dar pull cego ou reiniciar serviços não relacionados. Porta local do app \`4175\` não escutava no teste de 2026-10-18; Caddy 80/443 respondia, sem prova do serviço interno. CI/deploy canônico pendentes. Microdeploy \`centraldark_deploy_micro_fallback\` continua sob quarentena por gates de compensação incompletos; não contornar o manifesto com shell alternativo.
4. **HERMES:** job \`t_619b0c7a\` blocked por modelo local indisponível; reparar binding do provedor e só então retomar o mesmo cartão autorizado, sem alterar as 3.610 missões pendentes.

\`\`\`text
MAIN_SOURCE=PASS
SQL_RECEIPT_READBACK=PASS
TSX_SYNTAX=PASS
AUTOMATIC_PRODUCER=UNKNOWN
WEB_SOCKET_BROWSER_E2E=UNKNOWN
CI_SAME_SHA=PENDING
COCKPIT_SITE_DEPLOY=BLOCKED
HERMES_TASK=BLOCKED
NEXT_CURSOR=REPAIR_AUTHORIZED_HERMES_PRODUCER_AND_DEPLOY_RUNNER_THEN_BROWSER_REALTIME_READBACK
\`\`\`

**Não mudar estes estados até haver nova contraprova material**. O HUD é projeção, o Supabase preserva o recibo, o executor real é Hermes e a realidade do deploy exige verificação independente.
<!-- /CENTRALDARK_HERMES_SUPABASE_COCKPIT_REALTIME_20261018 -->
