# 👑🪬 GAP — Garimpo cleaner + VPS GPU pending

PR_MOTHER=#1562
MOTHER_BRANCH=sol/meta-lupa-corpo-operacional-20260917-current

## Admin/GPU

Busca no conteúdo canônico:
- docs/CONSCIENCIA/COCKPIT-AVANCO.json
- docs/PENDENCIAS.md

Resultado:
GPU_PENDING_EXISTING=false.
VPS_GPU_PENDING_EXISTING=false.

Logo a capacidade futura ainda não está visível para o CHEFE no painel.

## Garimpo

Owner canônico:
docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/GARIMPO-CHEFE.md

Referência existente:
.agents/skills/centraldark-operational-method/references/2026-09-02-garimpo-visual-runtime-reconciliation.md

Método já existente:
HASH → DEDUPE → CLASSIFY

Mas a busca não encontrou executor canônico específico para limpeza pós-cristalização do GARIMPO.

## Veredito

NEW_ARCHITECTURE=false.
NEW_ADMIN=false.
NEW_PENDING_SYSTEM=false.
NEW_GARIMPO_OWNER=false.

Gap real:
EXECUTABLE_POST_CRYSTAL_GC=MISSING.
VPS_GPU_FUTURE_PENDING=MISSING_FROM_ADMIN.

## Delta mínimo

1. Estender GARIMPO-CHEFE.md com política pós-cristalização.
2. Adicionar executor determinístico subordinado ao owner existente:
   - dry-run default;
   - only EMPTY / EXACT_DUPLICATE / REPRODUCIBLE_EXTRACTED;
   - secrets and unproved files fail closed.
3. Adicionar VPS GPU como pendência futura em docs/PENDENCIAS.md.
4. Espelhar a mesma pendência em COCKPIT-AVANCO.json para a aba AVANÇO.
5. Nenhum runtime atual será marcado como GPU.

## NEXT_CURSOR

Escolher writer vivo (#1590 candidato runtime/Admin) → patch mínimo → teste dry-run → receipt.
