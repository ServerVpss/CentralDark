# Failure Mode Catalog por Domínio

Catálogo estruturado para guiar o **CRITIC checklist** a cada iteração do loop CoT-ReAct.

## Como Usar
A cada iteração, o CRITIC deve varrer esta lista mentalmente (ou via script) e marcar quais failure modes se aplicam ao `observe` da iteração atual.

---

## 1. Terminal / Command Execution

| Code | Failure Mode | Detecção | Ação CRITIC |
|------|--------------|----------|-------------|
| **FM-T1** | Stdout vazio | `observe.stdout.strip() == ""` | `TOOL_RESULT_INVALID = true` |
| **FM-T2** | Exit code 0 mas stderr crítico | `exit_code == 0 && stderr contains [ERROR|CRITICAL|FATAL|Traceback]` | `TOOL_RESULT_INVALID = true`, `FALSO_VERDE = true` |
| **FM-T3** | Hash/resultado errado | `expected_hash != actual_hash` | `TOOL_RESULT_INVALID = true`, `EVIDENCE_GAP = true` |
| **FM-T4** | Arquivo/path não existe | `stderr contains [No such file|File not found|path not found]` | `TOOL_RESULT_INVALID = true` |
| **FM-T5** | Timeout silencioso | `exit_code == -1` or `timeout` | `TOOL_RESULT_INVALID = true`, `UNVERIFIABLE` |
| **FM-T6** | CWD errado | Output inesperado / arquivo não encontrado onde deveria | `OUT_OF_SCOPE = true` ou `TOOL_RESULT_INVALID` |
| **FM-T7** | Output truncado | `stdout` truncado / `...` no meio | `EVIDENCE_GAP = true` |
| **FM-T8** | Encoding errado | Caracteres estranhos / mojibake no stdout | `TOOL_RESULT_INVALID = true` |

---

## 2. File Operations (Read/Write/JSON)

| Code | Failure Mode | Detecção | Ação CRITIC |
|------|--------------|----------|-------------|
| **FM-F1** | JSON malformado | `json.loads()` falha / `jq` error | `TOOL_RESULT_INVALID = true` |
| **FM-F2** | Campo esperado ausente | `key not in json` / `jq .field` vazio | `EVIDENCE_GAP = true` |
| **FM-F3** | Tipo errado (string vs number) | `typeof value != expected_type` | `EVIDENCE_GAP = true`, `EXPECTATION_RELAXED` |
| **FM-F4** | Arquivo sobrescrito | `mtime` mudou inesperadamente / backup não feito | `REGRESSION = true` |
| **FM-F5** | Encoding errado | `UnicodeDecodeError` / chars estranhos | `TOOL_RESULT_INVALID = true` |
| **FM-F6** | Arquivo vazio / 0 bytes | `size == 0` | `EVIDENCE_GAP = true` |
| **FM-F7** | Path traversal / security | `../` no path / fora do workspace | `OUT_OF_SCOPE = true`, `BLOCK` |

---

## 3. Web / Search / API

| Code | Failure Mode | Detecção | Ação CRITIC |
|------|--------------|----------|-------------|
| **FM-W1** | Resultado de cache/stale | `If-Modified-Since` / `ETag` não mudou mas conteúdo deveria | `EVIDENCE_GAP = true` |
| **FM-W2** | Fonte não confiável | Domínio não whitelisted / score de credibilidade baixo | `EVIDENCE_GAP = true`, `OUT_OF_SCOPE` |
| **FM-W3** | Parsing HTML quebrado | Seletor CSS/XPath não encontra elemento | `TOOL_RESULT_INVALID = true` |
| **FM-W4** | Rate limit / 429 | HTTP 429 / `Retry-After` header | `BLOCK` / `CONTINUE` com backoff |
| **FM-W5** | Conteúdo vazio / 204 | HTTP 200 mas body vazio | `EVIDENCE_GAP = true` |
| **FM-W6** | Redirect loop / 3xx excessivo | > 5 redirects | `TOOL_RESULT_INVALID = true` |

---

## 4. Code Execution / Scripts

| Code | Failure Mode | Detecção | Ação CRITIC |
|------|--------------|----------|-------------|
| **FM-C1** | Syntax error | `SyntaxError` / `IndentationError` no stderr | `TOOL_RESULT_INVALID = true` |
| **FM-C2** | Logic error (off-by-one, edge case) | Output diverge do esperado em edge case | `EVIDENCE_GAP = true` (precisa teste específico) |
| **FM-C3** | Dependência não instalada | `ModuleNotFoundError` / `command not found` | `TOOL_RESULT_INVALID = true`, `BLOCK` |
| **FM-C4** | Variável de ambiente ausente | `KeyError` / `os.getenv` retorna None | `TOOL_RESULT_INVALID = true`, `BLOCK` |
| **FM-C5** | Race condition / timing | Resultado não-determinístico entre runs | `REGRESSION = true` (se antes passava) |
| **FM-C6** | Memory leak / OOM | `MemoryError` / processo killed | `TOOL_RESULT_INVALID = true`, `BLOCK` |
| **FM-C7** | Infinite loop / hang | Timeout sem output | `TOOL_RESULT_INVALID = true`, `UNVERIFIABLE` |

---

## 5. Kanban / Git / Versionamento

| Code | Failure Mode | Detecção | Ação CRITIC |
|------|--------------|----------|-------------|
| **FM-K1** | Card errado atualizado | `card_id` no comment ≠ target | `OUT_OF_SCOPE = true`, `REGRESSION = true` |
| **FM-K2** | Commit message vazia/inválida | `git log --oneline` mostra mensagem genérica | `EVIDENCE_GAP = true` |
| **FM-K3** | Branch errada | `git branch --show-current` ≠ expected | `OUT_OF_SCOPE = true`, `BLOCK` |
| **FM-K4** | Push sem autorização | `git push` sem `permito-pivete` label | `BLOCK`, `REGRESSION = true` |
| **FM-K5** | Merge conflict não resolvido | `git status` mostra `UU` / `both modified` | `BLOCK`, `TOOL_RESULT_INVALID = true` |
| **FM-K6** | Force push | `git push --force` / `--force-with-lease` | `BLOCK`, `REGRESSION = true` |

---

## 6. Meta / Lógica do Loop

| Code | Failure Mode | Detecção | Ação CRITIC |
|------|--------------|----------|-------------|
| **FM-L1** | Loop infinito / zumbi | `iter >= max_iter` sem `STOP` | `PONTO_FIXO`, `STOP` |
| **FM-L2** | Ponto fixo falso | `critic` não muda em 2+ iters mas `decide = CONTINUE` | `PONTO_FIXO = true`, `STOP` |
| **FM-L3** | Trade-off aceito | `held_in = true` mas `held_out = false` | `REFINE` obrigatório, `DECIDE ≠ STOP` |
| **FM-L4** | Success predicate vago | Não mensurável (hash, count, field) | `EVIDENCE_GAP = true`, `REFINE` brief |
| **FM-L5** | Non-counting outcomes não definidos | "parece ok" aceito como sucesso | `FALSO_VERDE = true` |
| **FM-L6** | CRITIC = PASS sem checklist | Checklist não executado / vazio | `FALSO_VERDE = true`, `GAP` |

---

## Matriz de Decisão Rápida (CRITIC → DECIDE)

| CRITIC Verdict | Checks Falhos | DECIDE |
|----------------|---------------|--------|
| **PASS** | (nenhum) | `STOP` (se goal) ou `CONTINUE` |
| **GAP** | `EVIDENCE_GAP`, `EXPECTATION_RELAXED` | `REFINE` + `CONTINUE` |
| **FAIL** | `TOOL_RESULT_INVALID`, `FALSO_VERDE`, `REGRESSION`, `OUT_OF_SCOPE` | `BLOCK` |
| **UNVERIFIABLE** | Timeout, evidence不可得 | `UNVERIFIABLE` → `BLOCK` ou human-in-the-loop |

---

## Uso no Script Executor

O script `cot_react_loop.py` já implementa detecção automática para:
- `FM-T1`, `FM-T2`, `FM-T3`, `FM-T4`, `FM-T5` (terminal)
- `FM-F1`, `FM-F2`, `FM-F6` (file/JSON)
- `FM-L1`, `FM-L5`, `FM-L6` (meta loop)

Para failure modes mais específicos (FM-C2, FM-K1, etc), o CRITIC mental do agente deve completar.