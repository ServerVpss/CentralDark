---
name: centraldark-casa-operational
category: operational-framework
description: "!CENTRALDARK SHARED. FIRST_WRITER_WINS."
version: 1.0
author: SOL / Casa CentralDark
license: internal
---
# CENTRALDARK — CASA OPERACIONAL (class-level)
Trigger: governança CENTRALDARK / SHARED / MULTI_READER / FIRST_WRITER_WINS.
Regra raiz: 1 MISSION_ID = 1 TRACE = 1 WRITER_PRIMARY. MULTI_READER (SCOUT/REVIEWER/COUNTERPROOF) autorizado; SERIALIZE_MUTATION; PARALLELIZE_PERCEPTION. Writer original fecha; HANDOFF só RECEIPT+RELEASE+ACQUIRE. NO_V2_V3_V4. REUSE_BEFORE_CREATE. ONE_SYSTEM_ONLY. ONE_WRITER_PER_SCOPE.
Alias curto: `!CENTRALDARK SHARED` / `centraldark shared`. BOOT canônico no references/centraldark-shared.md.
FIXED_POINT: RECEIPT com fingerprint (modelo atual, modelo global, disco, repo, o que NÃO foi feito — ex. browser não aberto, web_extract sem chave, state.db não corrigido). Nenhum commit sem repo; nenhum push sem writer único. HISTORICAL ≠ CURRENT. ACTION ≠ PROOF. UNKNOWN ≠ PASS.
Referência: `references/centraldark-shared.md` (sessão 2026-09-05 — pergaminho completo, DELTA-CONTINUO.md, FIXED-POINT-RECEIPT.md, BOOT, RESUME_EXISTING_MISSION, ACQUIRE_WRITER).
Pitfalls (corrigidos): `multibussoa-meta` é user-owned (não editável sem `hermes curator adopt`); `cua-driver` precisa elevação (WinError 740); `web_extract` precisa `FIRECRAWL_API_KEY`; `state.db` pode não estar no cwd; modelo = motor substituível (global nemotron + fallback hy3) — nunca papel/identidade; `fallback_providers: []` precisa população se quiser cadeia automática (interativo só).
