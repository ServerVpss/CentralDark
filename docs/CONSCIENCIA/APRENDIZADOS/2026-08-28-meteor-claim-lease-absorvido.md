---
title: "2026 08 28 Meteor Claim Lease Absorvido"
date: 2026-08-28
tags: ["consciencia"]
updated: 2026-08-28
---

# 2026-08-28 — Meteor claim/lease: mecanismos absorvidos (não copiados)

> PROVENIENCE: swstegall/meteor-decomp (AGENTS.md + claim.yml + claim-pr.yml + claim.py + reconcile.yml)
> LICENÇA DO FONTE ORIGINAL: AGPL-3.0-or-later — NÃO copiado código cru, só comportamento abstraído.
> DECISÃO CHEFE: permito segredo implementação (2026-08-28). Alvo: absorver no PR bot / writer existente, NÃO criar segundo control plane.

## O que NÃO fazer (decisão fechada)
- NÃO criar branch `claims` + novo bot + novo ledger na CentralDark.
- NÃO copiar `claim.py` (AGPL) byte-identical.
- NÃO tratar `AGENTS.md` do Meteor como PR bot — ele é contrato de agente, 9/10.

## O que absorver (5 mecanismos → owners existentes)

### 1. WRITER LEASE POR ESCOPO
Writer + Writer-Scope → lease ativa → bloqueia segundo writer conflitante.
MAPA: já temos `ONE_WRITER_PER_SCOPE` + `writer-safe-push-main.sh`. Estender o lease para DURAR durante todo o ciclo, não só no push.

### 2. PR PIN
PR abriu no escopo → lease presa ao PR/HEAD → não expira em review.
MAPA: autonomia já marca `PERMITO-SEGREDO / GIT / AUTO / PR elegível`. Amarrar o Writer-Scope ao headRefName do PR.

### 3. RELEASE CORRETO (post-merge)
PR closed unmerged → libera lease.
PR merged → NÃO libera na hora.
merge → remeasure main → prova delta materializado → só então libera.
REGRA CENTRAL: `PR_MERGED != RESULT_DURABLY_RECONCILED`.
MAPA: o `reconcile.yml` do Meteor é o que o `writer-safe-push` sozinho não cobre (ele protege push, não pós-merge).

### 4. DECISION ENGINE PURA
`decideWriterLease(state, request, now) → GRANT | EXTEND | REJECT | RELEASE`
SEM git, SEM wall-clock implícito, SEM GitHub API dentro da função.
INPUT → LEDGER local → SRC local → NOW injetado → resultado determinístico.
MAPA: extrair pra `scripts/lupa/` como função testável (sem I/O externo).

### 5. CAS / REDECISION
estado mudou durante mutação → não repetir decisão velha → re-fetch → reavaliar → aplicar só se ainda válido.
EQUIVALE A: `STATE_CHANGED → INVALIDATE_OLD_DECISION → REMEASURE → REDECIDE`.
MAPA: GitHub Actions `concurrency` NÃO resolve 2 writers; usar Git como CAS (push aceito = venceu; non-fast-forward = refaz decisão).

## Segurança (reaproveitar postura)
- `pull_request_target` + SECRET + NÃO checkout PR HEAD + NÃO executar código de fork + ler só metadata/diff via API.
- Owner amarrado à identidade autenticada do GitHub, nunca username no corpo do comentário.
- Supply-chain: pinar ACTION por commit SHA, não tag (`@v6`/`@v5`).
- `CLAIMS_BOT_TOKEN` ausente: `FEATURE_OPTIONAL → SKIPPED_NOT_APPLICABLE`; `FEATURE_REQUIRED → BLOCKED/UNKNOWN` (nunca falso PASS).

## Critério de saída (do AGENTS.md deles, 9/10)
GREEN → commit. PARTIAL → NÃO commit. MISMATCH → NÃO commit.
Budget exhaust → reverte tentativa + post-mortem, não fabrica verde.

## Pendência real
- Meteor upstream: claim system NÃO bootstrapado (DESIGN+CODE presentes, LIVE=NOT_PROVEN).
- Casa: falta implementar a extensão do lease (1+2+3) no `writer-safe-push-main.sh` / autonomia. Este doc é o OURO; a carne é PR separado.

## FIXED_POINT deste doc
DOCUMENTADO=true, PROVENANCE=true, NO_NEW_SYSTEM=true, MECHANISMS_MAPPED=true.
IMPLEMENTATION_PENDING=true (fora do escopo deste commit).
