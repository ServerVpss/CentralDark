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
