# 👑🪬 CentralDark — delegação portátil + Skill Workshop + MCP unificado

Data: 2026-10-16
INTENT_ID: CENTRALDARK-UNIFIED-DELEGATION-CATALOG-20261016
GOAL: preservar em qualquer chat conectado a receita de delegar ao Hermes; unificar descoberta de skills sem catálogo paralelo
OWNER: .agents/skills/skill-workshop/SKILL.md
MCP_OWNER: apps/modulos/mcp/src/tools/skills/skill.js
EXECUTOR_OWNER: Hermes Kanban existente
MAIN_BASE_SHA: 8e9c3ac284923aa55c6662e8cf52e7e50ad02800
ACTIVE_WRITER: GitHub contents API na branch feat/skill-workshop-delegacao-catalogo-20261016
SCOPE: skills/centraldark-delegacao; apps/modulos/mcp/{src,dist}/tools/skills; testes do mesmo módulo; doc Skill Workshop
CONCURRENT_WORK_PRESERVED: PR #1832, Casa K:/ dirty, Obsidian task t_790c940d
MERGE: NOT_EXECUTED
DEPLOY: NOT_EXECUTED

## Provas antes do delta

- MCP autenticado `skill_listar`: 3 skills reportadas, com scanner fixo `skills/`.
- MCP `mcp_admin_catalog({filter:'skill'})`: 4 tools originais, num catálogo maior (141 runtime tools declaradas, 13 rotas autorizadas no snapshot consultado).
- `.agents/skills/skill-workshop/SKILL.md` já governa fontes externas pinadas, criador, deduplicação e gaveta do Instinto.
- `.agents/library-index.json` e `.agents/skills/**` já são fonte de skills internas; não são automaticamente instaladas.
- API pública `apps/modulos/mcp/src/skills-public.js` consome espelho `segredounlock/clone-deck`; não expor `.agents/` sem autenticação.
- Hermes real via Desktop Commander SEGREDO: `t_790c940d` criado, despachado, observado `RUNNING`, workspace `K:\\`. Estado final do Obsidian ainda exige recibo.

## Delta aplicado na branch, não na main

1. `skills/centraldark-delegacao/SKILL.md`: contrato portátil reutilizável em qualquer superfície autorizada, sem permissões implícitas.
2. `apps/modulos/mcp/src/tools/skills/catalog-index.js`: índice somente de metadados `skills/` e `.agents/skills/` com origem, SHA, deduplicação, paginação, status; arquivos arquivados opt-in.
3. `apps/modulos/mcp/src/tools/skills/skill.js`: `skill_listar`, nova `skill_buscar`, `skill_instalar`, `skill_status`, `skill_atualizar` consumindo árvore autenticada da main. Para nome duplicado, `AMBIGUOUS`; `path` exato decide; resultado textual não eleva instruções.
4. `apps/modulos/mcp/dist/tools/skills/*`: cópia de runtime sincronizada ao source sem afirmar que processo vivo foi recarregado.
5. `apps/modulos/mcp/tests/skill-catalog-unificado.test.mjs`: regressões local/arquivado/ambíguo/paginado/truncado.
6. `.agents/skills/skill-workshop/SKILL.md`: seção de integração e estados com NEXT_CURSOR.

## Matriz dos amarelos — sem pintar de verde por declaração

| Critério | Prova observada | Estado |
| --- | --- | --- |
| Owner e rota de Hermes | CLI Kanban real e receipt PR #1832 | PASS_DELEGATION_BASELINE |
| Fonte original descoberta | `skill_listar` antigo mostrou 3; auditoria de código achou filtro fixo | PASS_ROOT_CAUSE |
| Skill portátil gravada | commit no branch + readback pendente | SOURCE_COMMITTED_PENDING_READBACK |
| Código catálogo unificado | commit no branch + readback pendente | SOURCE_COMMITTED_PENDING_READBACK |
| Testes | arquivo de regressão criado; ainda não rodados no HEAD | NOT_PROVEN |
| MCP dist/runtime | dist no branch; processo MCP vivo não atualizado | NOT_PROVEN |
| Chamadas `skill_buscar` pós-deploy | ainda não realizadas | NOT_PROVEN |
| ChatGPT/Claude/Codex reuso real | exige testes independentes por superfície autorizada | NOT_PROVEN |
| Obsidian imagem + renderização + sync | depende da tarefa Hermes `t_790c940d` | NOT_PROVEN |
| PR #1832 UI/Gaveta consumo | escopo ocupado por outro writer; handoff sem takeover | NOT_PROVEN |

## Contraprovas requeridas

```text
node --check apps/modulos/mcp/src/tools/skills/skill.js
node --check apps/modulos/mcp/src/tools/skills/catalog-index.js
node --check apps/modulos/mcp/dist/tools/skills/skill.js
node --test apps/modulos/mcp/tests/skill-catalog-unificado.test.mjs
SAME_SHA_CI=PASS
MCP_RUNTIME_READBACK skill_buscar({busca:'centraldark-delegacao'}) != UNKNOWN
SKILL_LOADED_ON_AGENT != TOOL_DECLARED
HERMES_DISPATCHED != HERMES_COMPLETED
```

## Critério de continuidade

- Não fazer merge/deploy da branch antes dos gates necessários; observar revisão do owner da PR.
- Após CI em mesmo SHA, promover via writer com checkout limpo e sem disputar `mcp-admin.js` ou UI da PR #1832.
- Após deploy, comprovar `skill_buscar`, `skill_instalar` por nome/path, `AMBIGUOUS`, isolamento privado e instalação específica em chat/dispositivo autorizado.
- O cockpit da PR #1832 consome só metadados e receipts depois da integração da main; sem novo HUD.
- `NEXT_CURSOR=SOURCE_READBACK → LOCAL_SYNTAX_TEST → SAME_SHA_CI → PR_REVIEW → MAIN_PROMOTION → RUNTIME_RELOAD_READBACK → CROSS_AGENT_ACK → OBSIDIAN_E2E`.

Nunca promover `UNKNOWN` a `PASS` por documento, código fonte, retorno de ferramenta ou tentativa de execução.


## DELTA 2026-10-16 — OAuth da conta GitHub + Hermes tipado

**Nova fala do CHEFE:** reusar o GitHub App/OAuth App já instalado no Instinto Superior, autenticar a conta uma única vez por consentimento real e manter a experiência persistente via renovação segura; integrar os métodos da conversa como capacidades permanentes do Hermes. Isso **não** autoriza transformar credenciais em texto, desligar gates nem presumir credenciais vitalícias.

### Fontes canônicas medidas

- `apps/instinto-superior/src/routes/auth.tsx`: login primário usa Supabase/Google; não equivale à concessão de acesso GitHub para o catálogo.
- `apps/modulos/hub/src/components/connectors/OAuthConnectors.tsx`: provedor GitHub já oferecido como OAuth pela interface HUB.
- `apps/modulos/oauth-broker/server.mjs`: GitHub OAuth e persistência cifrada em `oauth_connections`, com armazenamento de `access_token_enc` e `refresh_token_enc` quando presente; autorização de usuário, renovação e permissão real não foram validadas E2E.
- `apps/modulos/mcp/src/oauth.js`: OAuth cliente MCP distinto e `/oauth/callback` GitHub legada retorna HTTP 410; não utilizar como prova de GitHub user grant.
- `supabase/functions/ponte-mcp-oauth-github/index.ts`: fluxo anterior usa `read:user` e cria chave da Ponte MCP; isso não prova `Contents: read` no repositório privado.
- `apps/modulos/mcp/src/tools/skills/skill.js`: catálogo autenticado do PR #1837 usa token do contexto MCP; ainda exige ponte explícita da identidade/consentimento do HUB, sem fallback silencioso a token administrativo.
- GitHub Docs: `https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app/refreshing-user-access-tokens` e `https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app/authenticating-as-a-github-app-installation` — token expira; renovação e permissions devem ser observados.

### DELTA persistido no owner Hermes

- `.agents/skills/autonomous-ai-agents/hermes-agent/references/centraldark-delegacao-tipado.json`: **12 procedimentos tipados** com entrada, saída, owner, condição e prova; um arquivo de referência dentro do owner existente, não 12 skills paralelas.
- `.agents/skills/autonomous-ai-agents/hermes-agent/SKILL.md`: aponta para o contrato e explica os três tipos de persistência (Git, Hermes, grant OAuth).
- `skills/centraldark-delegacao/SKILL.md`: adiciona condição de autenticação segura do privado e reuso da mesma receita em qualquer agente conectado.
- `.agents/skills/skill-workshop/SKILL.md`: integra contratos ao catálogo do owner e preserva distinção OAuth cliente/conta.
- `apps/modulos/mcp/tests/centraldark-hermes-delegacao-contract.test.mjs`: asserções do contrato JSON (a rodar em CI).
- Releitura estrutural in-process sobre conteúdo exato do GitHub: **6 verificações PASS / 0 FAIL** (12 IDs únicos tipados, links, separação OAuth, sem segredo, lacunas com NOT_PROVEN). Isto **não substitui** o teste Node no mesmo HEAD nem runtime Hermes.

### Delegação real ao Hermes

`TASK_ID=t_add08d40` · `ASSIGNEE=default` · `WORKSPACE=dir:K:\\` · `RUN_ID=37`.

- `hermes kanban list` não tinha missão equivalente dedicada ao OAuth GitHub privado.
- `hermes kanban create` com idempotency key `CENTRALDARK-GITHUB-AUTH-SKILL-PRIVATE-BINDING-20261016`: **CREATED**.
- `hermes kanban dispatch --dry-run`: selecionou essa tarefa.
- `hermes kanban dispatch --max 1`: retornou **SPAWNED** para `t_add08d40`.
- `hermes kanban show t_add08d40`: **RUNNING**, `run #37`, PID informado pelo Kanban; confirmação do processo, não do objetivo.
- `t_790c940d` (Obsidian) guardada por `active_pr`; não fez spawn concorrente.

Contrato de execução: modificar somente owner OAuth livre e autorizado; não tocar PR #1837 ou UI da PR #1832 enquanto houver writer ativo. Endpoints de catálogo privado devem validar identidade e recurso; 401/403 e revogação são gates, não erros a contornar. Segredos jamais transitam via ChatGPT/browser.

### Semáforo exato

```text
GITHUB_OAUTH_OWNER_LOCATED=PASS
HERMES_TYPED_SOURCE_COMMITTED=PASS
TYPED_STATIC_CHECKS=6/6_PASS
TASK_T_ADD08D40_SPAWNED=PASS
TASK_T_ADD08D40_RUNNING=PASS_AT_READBACK
GITHUB_APP_VS_OAUTH_APP_RUNTIME_TYPE=UNKNOWN
GITHUB_LOGIN_CONSENT_BY_CHEFE=NOT_DONE
GITHUB_GRANT_TO_PRIVATE_MCP_SKILLS=NOT_PROVEN
OAUTH_REFRESH_ROTATION_RUNTIME=NOT_PROVEN
CI_SAME_SHA=NOT_PROVEN
HERMES_SKILL_INSTALLED_AND_LOADED=NOT_PROVEN
MCP_RUNTIME_DEPLOY=NOT_PROVEN
```

**NEXT_CURSOR:** `HERMES_TASK_t_add08d40_RECEIPT → REVIEW_AUTH_IDENTITY_BINDING → GITHUB_CONSENT_BY_USER → EXPLICIT_PERMISSION_READBACK → SECURE_SKILL_LOOKUP → SAME_SHA_CI → MAIN_PROMOTION → HERMES_RUNTIME_LOAD_ACK`.
