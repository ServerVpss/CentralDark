# SOL Audit — HUD + Fable 5.1 + T1 — 2026-09-02

**Owner canônico:** `.agents/skills/centraldark-operational-method/SKILL.md`

```text
PR_MAE=#1381
ONE_SYSTEM_ONLY=true
REUSE_BEFORE_CREATE=true
ONE_WRITER_PER_SCOPE=true
AUDIT_ONLY_RECEIPT=true
NEW_OWNER=false
NEW_CLI=false
UNKNOWN != PASS
ACTION != PROOF
DOCUMENTED != EXECUTED
```

## 1. Alvo desta auditoria

Revalidar, depois da rodada que introduziu Fable 5.1 e a crônica/painel, o que realmente mudou no PR #1381 e corrigir o HUD do topo do PR quando o snapshot estiver stale.

T0 desta auditoria:

```text
HEAD=4c057bee36e2e50e2c00c931ae7597e7882bb2cb
STATE=OPEN
MERGED=false
MERGEABLE=false
BASE=main
BASE_HEAD=0542cee586e55be5334ba1e8d369d3b040ee1178
COMMITS=52
CHANGED_FILES=83
AHEAD_OF_MAIN=52
BEHIND_MAIN=58
CI_STATUSES=0
PR_WORKFLOW_RUNS=0
CI_SAME_HEAD=UNKNOWN
GLOBAL_FIXED_POINT=NOT_PROVEN
```

O body do PR ainda exibia snapshot histórico `49375ef4... / 43 commits / 76 arquivos`; portanto o HUD inicial estava materialmente stale e precisava ser atualizado sem alterar a intenção ou os gates.

## 2. Fable 5.1 — o que bateu

Runtime-source existente reutilizado:

```text
docs/CONSCIENCIA/DARKAI/darkai.sh
```

O repositório já documenta esse arquivo como fonte de instalação do comando `darkai` em `/usr/local/bin/darkai` na VPS/local. Portanto o arquivo é um owner de distribuição/runtime-source existente; a presença do commit no GitHub, porém, não prova que o binário/script materializado no alvo Casa/VPS já foi atualizado.

Commit que alterou a fonte:

```text
46c2fe1e490e00edac525375b7b38d795162c2f8
```

O código observado no HEAD T0 confirma:

```text
LEGACY_DARKAI_ROUTE_PRESERVED=true
FABLE51_ROUTE=OPT_IN
MODEL_IDS=claude-fable-5-1|anthropic/claude-fable-5-1
EFFORT_VALUES=low|medium|high|xhigh|max
DEFAULT_WHEN_AUTO_UNRESOLVED=high
PROMPT_AUDIT=READ_ONLY
RUNTIME_AUDIT=READ_ONLY
PROMPT_CACHE_SESSION_SUPPORT=ONE_SHOT_ONLY
AUTO_DELETE_GUARDRAILS=false
```

A documentação oficial atual do Claude Platform confirma que Claude Fable 5.1 existe, está ativo, usa `high` como effort padrão e recomenda testar `low|medium|high|xhigh|max` conforme workload. Também confirma que effort controla inteligência/latência/custo e que cache de prompt tem regras próprias; por isso o CLI não deve fingir cache persistente quando a conversa/sessão não o implementa.

Fontes oficiais consultadas nesta auditoria:

```text
https://platform.claude.com/docs/en/models/fable-5-1/overview
https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-fable-5-1
https://platform.claude.com/docs/en/build-with-claude/effort
https://platform.claude.com/docs/en/build-with-claude/prompt-caching
```

## 3. Contraprova da implementação

O encaixe arquitetural está correto: Fable 5.1 é engine opcional dentro do `darkai`; não substitui Hermes, SOL, CentralDark nem o caminho legado.

Mas três claims continuam limitados:

```text
FABLE_SOURCE_CODE_BINDING=PROVEN_IN_REPO
FABLE_INSTALLED_ON_LIVE_CASA=UNKNOWN
FABLE_INSTALLED_ON_LIVE_VPS=UNKNOWN
FABLE_REQUEST_END_TO_END=UNKNOWN
LEGACY_ROUTE_END_TO_END_AFTER_CHANGE=UNKNOWN
```

Risco observado, sem promover a defeito:

```text
DARKAI_MAX_TOKENS_DEFAULT=4096
XHIGH_MAX_LONG_OUTPUT_GUIDANCE=NEEDS_MORE_HEADROOM
CLASSIFICATION=CANDIDATE_RUNTIME_RISK_NOT_CONFIRMED_BUG
```

A documentação do Fable 5.1 recomenda deixar espaço de `max_tokens` para thinking + resposta em tarefas longas com `xhigh/max`. O default 4096 pode ser suficiente para tarefas curtas, mas não deve ser chamado de adequado globalmente sem eval/runtime.

## 4. Receipt anterior confirmado

O comentário do PR existe:

```text
COMMENT_ID=5512463959
HEAD_RECORDED=4c057bee36e2e50e2c00c931ae7597e7882bb2cb
COMMITS_RECORDED=52
CHANGED_FILES_RECORDED=83
AHEAD_RECORDED=52
BEHIND_RECORDED=58
CI_RECORDED=UNKNOWN
```

Ele está coerente com T0 desta auditoria.

## 5. API / MCP — limite desta auditoria

O script Fable aponta por default para:

```text
https://api.centralldark.com/v1/messages
```

A intenção vigente do CHEFE mantém CentralDark como uma API e um MCP com superfícies normal/admin no mesmo organismo. Nesta auditoria, a leitura HTTP externa direta de `api.centralldark.com`, `mcp.centralldark.com/mcp` e `mcp.centralldark.com/admin` não produziu resposta observável pelo fetch disponível; portanto:

```text
PUBLIC_API_RUNTIME_THIS_AUDIT=UNKNOWN
PUBLIC_MCP_RUNTIME_THIS_AUDIT=UNKNOWN
ROUTE_INTENT_PRESERVED=true
```

Não rebaixar nem promover essas rotas por ausência de observação desta ferramenta.

## 6. HUD correto após esta auditoria

Este arquivo avança o HEAD; por isso os números finais devem ser remeasureados depois do commit e usados no body do PR.

O HUD do topo do PR deve separar:

```text
REPO_BINDING
RUNTIME_BINDING
CI_SAME_HEAD
PR_MAIN_DIVERGENCE
MERGEABILITY
FIXED_POINT
NEXT_CURSOR
```

Sem congelar snapshot velho como se fosse autoridade permanente.

## 7. Próximo cursor

```text
COMMIT_AUDIT_RECEIPT
→ REMEASURE_NEW_HEAD
→ CI_SAME_HEAD
→ COMPARE_MAIN
→ UPDATE_PR_BODY_HUD
→ REREAD_PR_BODY_T1
→ FIXED_POINT remains NOT_PROVEN until runtime/reconciliation gates pass
```

## 8. Regra preservada

```text
PRESERVE_GREEN=true
FALSE_GREEN=false
ENGINE_OPTIMIZATION != NEW_IDENTITY
HERMES_CONTINUES_TO_EXIST=true
CENTRALDARK_CONTINUES_TO_EXIST=true
LEGACY_ROUTE_PRESERVED=true
PR_BODY_HUD_MUST_NOT_GOVERN_WHEN_STALE=true
LIVE_REMEASURE_OVERRIDES_STALE_HUD=true
```
