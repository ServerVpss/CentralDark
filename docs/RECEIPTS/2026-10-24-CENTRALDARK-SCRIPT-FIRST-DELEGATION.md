# RECEIPT — CENTRALDARK SCRIPT-FIRST / REPLAY SEM SUBAGENTE

Data: 2026-10-24
Intenção CHEFE: preservar scripts provados; repetição de varredura/fingerprint não despacha outra IA; Nemotron/Hermes delega a receita executável já cristalizada.
Owner preexistente: docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/PROVEN-DETERMINISTIC-LOCK.yml
Receita preexistente: docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/PROVEN-EXECUTABLE-RECIPE.yml
Loader preexistente e preservado: scripts/trigger-fabric/centraldark_full_trigger_boot.py

## Delta produzido
- scripts/trigger-fabric/proven_script_delegate.py — preflight SCRIPT_FIRST_NO_MODEL que consulta os subcomandos canônicos fingerprint/replay/replay-run; sem chamar LLM ou criar runner/registry.
- scripts/trigger-fabric/test_proven_script_delegate.py — testes isolados, positivos e negativos.
- PROVEN-EXECUTABLE-RECIPE.yml — binding subordinado ao mesmo lock, sem novo owner.

## Commits na main
- https://github.com/ServerVpss/CentralDark/commit/6d6d2e65f1e94055d30383a02378ae097ec4c87b
- https://github.com/ServerVpss/CentralDark/commit/17c79cb6df02f8db192ccfe24b90dca9e46f3e95

## Medição executada (sandbox isolado)
- \`python test_proven_script_delegate.py -v\`: 6 testes, 0 falhas, exit 0.
- \`python -m py_compile proven_script_delegate.py test_proven_script_delegate.py\`: exit 0.
- \`python proven_script_delegate.py --help\`: exit 0.
- SHA256 source (sandbox): \`39fcaa7ae8bdb59156498a876b5a58a9c51648e86b17b68b8dfd0f2754422623\`.
- SHA256 tests (sandbox): \`c37113ec545b9171535472c497618bf820ff1da1ad75c2f0242179d9e5b4b5a2\`.
- Readback de 3 arquivos na main via conexão GitHub: PASS (blob SHAs expostos).

## Contraprovas
- Fingerprint alterado: DELTA_REQUIRED; script não executado; model_calls=0, subagent_calls=0 no helper.
- Fingerprint ausente: DENY, nenhuma chamada ao loader.
- Loader ausente: UNKNOWN, não PASS.
- Replay canônico negado: REPLAY_FAILED, não afirma script executado.
- Fingerprint compatível sem \`--execute\`: SCRIPT_REPLAY_ELIGIBLE, não runtime PASS.
- Apenas replay-run com exit 0 e verdict REUSE_CRYSTAL permite declarar REUSE_CRYSTAL no helper.

## Fronteira de prova
- REPO_SCRIPT_PERSISTED: PASS
- SANDBOX_UNIT_TESTS: PASS (6/6)
- REPO_READBACK: PASS
- LIVE_HERMES_NEMOTRON_HOOK: UNKNOWN — não foi ligado/medido neste ciclo.
- LIVE_RECIPE_EXECUTION_CASA: UNKNOWN — sem execução local nesta rodada.
- CI_SAME_HEAD: NOT_RUN — não declarar PASS.
- #1562 COMMENT_RECEIPT: BLOCKED_403 — chamada de comentário ao GitHub foi recusada; nenhum comentário foi criado.

## Next cursor
Conectar o hook local já existente de Hermes/Nemotron a \`proven_script_delegate.py\`, sem recriar processo ou scheduler. Em uma tarefa com claim e fingerprint registrados, provar a cadeia \`SCRIPT_REPLAY_ELIGIBLE -> replay-run -> REUSE_CRYSTAL\` e contar chamadas LLM reais no runtime. Mudança de fingerprint abre só o cone afetado.

Regra: SCRIPT_EXECUTED != MODEL_CALL. MODEL_CALLS_HELPER_ZERO != GLOBAL_PROVIDER_CALLS_ZERO. REPO != RUNTIME. REALITY_IS_JUDGE.
