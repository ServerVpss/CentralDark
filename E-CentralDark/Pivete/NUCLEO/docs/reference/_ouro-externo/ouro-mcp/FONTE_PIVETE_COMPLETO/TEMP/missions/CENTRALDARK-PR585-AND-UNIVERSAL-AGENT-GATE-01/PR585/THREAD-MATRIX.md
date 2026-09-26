# THREAD-MATRIX — PR #585 (HEAD 8f5925f0abef0467f8204d327c97cebe152351d4)

Fonte: GraphQL `reviewThreads` (não REST), medido em 2026-08-01T19:20Z. Detalhe completo em `THREAD-MATRIX.json`.

**Achado de reconciliação:** o corpo do PR afirma "9 threads, todas fechadas". A medição real via GraphQL mostra **24 threads**: 9 resolvidos + 15 não resolvidos. Os 15 chegaram entre 18:19Z e 19:14Z de hoje — depois do último FINAL do ledger — via CodeRabbit, Codex e o próprio SEGREDO/CHEFE (`segredounlock`). `PR_BODY_MATCHES_REMOTE=false` até o corpo ser atualizado com o estado real.

## Resumo

| Classe | Qtde |
|---|---|
| RESOLVED (GitHub) | 9 |
| ALREADY_FIXED_UNRESOLVED (conteúdo já corrigido, thread não fechado) | 3 |
| VALID_CURRENT — P1 | 11 |
| VALID_CURRENT — P2 | 1 |
| **P0_OPEN** | **0** |

## ALREADY_FIXED_UNRESOLVED (só precisam de resposta + resolve, sem nova edição)

- `VpL3d` — AGENTS.md já não impõe mais o documento candidato como contrato obrigatório.
- `VpUPa` — `.coderabbit.yaml` MCP já está `usage: "disabled"` deny-by-default.
- `VqDnj` — `CAPTURE_DEGRADED` já está no enum de estados e no enum do receipt.

## VALID_CURRENT (exigem edição real, mapeados 1:1 aos itens da Seção 6 da missão)

| Thread | Item da missão | Arquivo | Achado |
|---|---|---|---|
| `VqLTk` + `VqUgK` | 3 | `.coderabbit.yaml` | falta `fail_commit_status: true` |
| `VqUgG` | 1 | JARVIS | ainda declara Pivete autoridade final (linhas 44–49, 304) |
| `VqUgI` | 2 | `LEIA-ME-IA.md` | `source_of_truth` mistura repo + evidência observada |
| `VqUgM` | 4 | novo validador | não existe validador do `OPERATION_RECEIPT` no repo |
| `VqW2I` | 5 | `.coderabbit.yaml` | `auto_enrich`/`auto_planning` ainda `true` |
| `VqW2P` | 6 | doc LOOP | linha 12 afirma "aprovado por CHEFE" sem receipt |
| `VqW2R` | 7 | doc LOOP | `origem` sem regra de normalização |
| `VqW2T` | 8 | doc LOOP | `SECRET_EXPOSURE` sem fail-closed explícito (assimétrico a `SANITIZE_FAILED`) |
| `VqW2U` | 9 | doc LOOP | schema permite `PASS` + `chief_decision: PENDING` |
| `VqW2V` | 10 | doc LOOP | `OPERATION_RECEIPT` sem campo `target` |
| `VqXNT` | 11 | `.coderabbit.yaml` | `path_instructions` aponta para diretório inexistente |

Todos os achados `VALID_CURRENT` foram confirmados por leitura direta do conteúdo atual do HEAD, não por confiança na alegação do comentário.
