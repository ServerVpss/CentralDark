# 🪬 RECEIPT — anti-fricção do consumo de aprendizado (14/10/2026)

INTENT_ID=CENTRALDARK_REPOWIDE_FRICTION_REDUCTION_20261014
SCOPE=DOCS_CONSCIENCIA_CONTRACT_ROUTING
WRITER=CODEX_HERMES_ROLE_WITH_CHEFE_AUTHORIZATION
OWNER=.agents/library-index.json
SOURCE_OF_TRUTH=ServerVpss/CentralDark@main
MAIN_BEFORE=cb7a8f499260f7d15f850d0f7024a90c04d91ad3
CHANGE_COMMIT=349b7ebb3fd37a7824884f80c0f875cdbd81a5f1
CHANGE_PATH=.agents/library-index.json
CHANGE_BLOB=f8194b559c9a6b001777714c1147fefc1f168d81
STATE=INCREMENTAL_DELTA_PROVED; GLOBAL_FIXED_POINT_NOT_CLAIMED

## GOLD preservado

- Script existente `scripts/centraldark/canonical-consumption-gate.mjs`, sem modificação.
- A leitura completa com `--learning ALL` continua disponível sob demanda.
- Índice completo, keys e owners fora do bloco `pre_response_gate` preservados.
- Checkout Casa com sparse-checkout Bolt preservado. Branch VPS e arquivos locais não rastreados intocados.
- PRs existentes, gates, runners, segurança e proteção de merge intocados.

## FRICTION removida

- Metadados antigos divergiam da implementação canônica e exigiam ALL_NUMBERED_LEARNINGS e fail_closed no preflight universal.
- Apenas em `.agents/library-index.json#pre_response_gate`:
  - fail_closed: true -> false;
  - learning_mode: ALL_NUMBERED_LEARNINGS -> PERTINENT_ONLY;
  - all_numbered_learnings_required: true -> false;
  - cli: --learning ALL -> --learning PERTINENT.
- Alinhado ao comportamento não bloqueante do script e ao modo pertinente de RULES/AGENTS/LEIA-ME-IA.

## Contraprova e fronteira

- JSON.parse(updated): PASS.
- Comparação estrutural profunda, permitindo somente as quatro propriedades citadas: PASS.
- GitHub Contents readback do commit: conteúdo byte-a-byte equivalente à escrita: PASS.
- Releitura da main após o commit: blob de index = f8194b559c9a6b001777714c1147fefc1f168d81: PASS.
- CI SAME_HEAD / branch protection geral: UNKNOWN; status commit isolado não prova sucesso.
- Runtime VPS do index revisado não recebeu deploy; DOCUMENTED != EXECUTED.
- Nenhum duplicate/dead removido sem medida de referência e uso.

## Ledger e rota

- #1562: CLOSED, MERGED=false, legado/proveniência preservado, DO_NOT_MERGE.
- #1757: CLOSED, aposentado e substituído pelo HUD como projeção.
- Receipts primários no repositório, conforme `docs/CONSCIENCIA/LEDGER-SURFACE-ANCHOR.md`; não escrever comentários como ledger.

NEXT_CURSOR=RECONCILE_BOOT_YAML_OLD_ALL_LEARNINGS_WITH_EXISTING_ACTIVE_WRITER_THEN_RUNTIME_SURFACES
PENDING=.agents/INTENT-DEPLOY-BINDING.json and CENTRALDARK_AI_BOOT.yaml contain historical descriptions requiring context-specific owner review.
UNKNOWN=full repo-wide runtime inventory, PR ownership handoff, CI same-SHA, production deployment.

## DELTA 2 — BOOT alinhado ao executor existente

BOOT_FIX_COMMIT=e855feb8f7a0fb3a74cc3d3bca655f66c9bd3940
BOOT_PATH=CENTRALDARK_AI_BOOT.yaml
BOOT_OLD_BLOB=5e54e602590486f3b70b8b41bafaac660b54fc81
BOOT_NEW_BLOB=2b79555cccc5882f0d13db90040574fab4fb12f2
BOOT_SCOPE=canonical_consumption_gate_ONLY

- GOLD preservado: `scripts/centraldark/canonical-consumption-gate.mjs`, `scripts/trigger-fabric/centraldark_full_trigger_boot.py`, e leitura de todos os aprendizados por `--learning ALL` sob demanda.
- FRICTION removida: sete valores documentais ajustados para consumo pertinente, consultivo e não bloqueante.
- PROVA: diff limitado a um bloco e GitHub readback byte a byte do commit.
- CI_SAME_HEAD: PENDING no momento da escrita; nenhum resultado pendente equivale a PASS.
- OWNER CONCORRENTE: PR #1774 ainda possui versão antiga do BOOT; qualquer integração posterior exige reconciliar para não reintroduzir fricção.
- NÃO ALTERADO: outros FAIL_CLOSED de segurança e integridade, runtime VPS, Casa, HUD, runners e PRs.
- UNKNOWN: eficácia E2E, produção, gates globais e fixed point repo-wide.

NEXT_CURSOR=CI_SAME_SHA_BOOT_E855FEB8_THEN_PR1774_PREVENT_REINTRODUCTION_AND_RUNTIME_BACKCHECK
