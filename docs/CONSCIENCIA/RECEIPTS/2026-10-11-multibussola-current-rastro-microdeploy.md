# 🪬 MULTIBÚSSOLA — CURRENT audit, rastro e contraprovas · 2026-10-11

**INTENÇÃO HUMANA:** “REVISA ALL E CANETA NA MAO LUPA NA FRENTE MULTIBUSSLA NA OUTRTA MAO TOCOU TEM QUE SELAR”.
**Autoridade:** SEGREDO/CHEFE; **owner:** `docs/CONSCIENCIA/LEDGER-SURFACE-ANCHOR.md`; **estado:** PARCIAL (CI e VPS divergentes).

## CURRENT medido antes deste commit
- GitHub `main` foi observado em `659d7aac06abc3cb36afb85c507226bb95996a33`; PR #1792 Sentinel integrado. Quatro abertas: #1793, #1777, #1774, #1767. Esse SHA é snapshot, não promessa de HEAD futuro.
- VPS `/root/CentralDark`: HEAD `5344bd87074c334ddf3ac322ae7d6aaacecdf665`, com trabalho local não integrado. `deploy_status` reportou 154 commits de atraso e erro do sensor PM2 `SyntaxError: Unexpected end of JSON input`. **Sem reset/pull cego.**
- CI falha em [lupa-conformance](https://github.com/ServerVpss/CentralDark/actions/runs/38131145851): hash Meta-Lupa esperado `05b8664f…`, blob real `d6b55fc2…`; não atualizar o lock sem verificar origem. [Porta-de-entrada](https://github.com/ServerVpss/CentralDark/actions/runs/38131145559): um erro no `verify_repo_contract`, três falhas no adapter `.claude/rules/00-centraldark-boot-universal.md`, e acusação de validação mascarada em `.github/workflows/vps-exec-selfhosted.yml:93`. [Deploy self-hosted](https://github.com/ServerVpss/CentralDark/actions/runs/38131145557) falhou no gate de SHA; stages seguintes SKIPPED.
- **One writer:** PR #1774 já escreve `AUTOLUPA_CANONICAL_SHA` e adapter Claude; PR #1767 escreve `verify_repo_contract.py`; PR #1793 escreve Hermes orchestrator; não duplicar esses escopos.
- MCP dispatcher: 141 tools / 20 admin destrutivas / 13 rotas. Comparador de catálogo avaliou subconjunto de 86 e acusou faltantes; requer reconciliação de escopo, não prova de perda de 55 tools.
- Kylin/Triton: 30 nomes; 21 READY; OCR `ocr_ppocr` UNAVAILABLE. On-device Qwen integral ainda não provado. Tailscale bridge broker `fetch failed`. Obsidian T1 bidirecional não provado. Screenpipe retornou HTTP 404 na raiz e sem atribuição de owner; não extrapolar. Funil de logs: layout OK, última ingestão observada em 08:06:54Z com zero eventos.
- `centraldark_deploy_recipe_status` apontou `receipt_pr_1562`, em contradição com `PR_MOTHER_ROLE=RETIRED` / `RECEIPTS_OWNER=repository` do [owner canônico](https://github.com/ServerVpss/CentralDark/blob/main/docs/CONSCIENCIA/LEDGER-SURFACE-ANCHOR.md).

## Correção no menor owner
`README.md` e `docs/CONSCIENCIA/MICRO-DEPLOY/MAIN-PINNED-RUNTIME-FAST-PATH-FALLBACK.{json,yml,md}` deixam de mandar novo receipt à PR-mãe histórica. Fluxo honesto: `RECEIPT_LOCAL → RECONCILIAR_RECEIPT_VERSIONADO → READBACK`, e `PARTIAL` enquanto só local. Script executor **não foi modificado** e já cria arquivo local em `logs/receipts`; sem alegar commit automático.

## Gatilhos de contraprova
JSON deve parsear; `sequence` original permanece inalterada salvo último item; guardas `no_force_push`, `no_blind_reset` e `scratch_worktree.destructive_guard` preservados. YML/MD devem convergir no destino. Hash dos arquivos alterados deve ser relido na main; sincronização VPS é etapa separada.
**PENDENTE:** gates #1774/#1767 e prove de CI no mesmo HEAD, drift main/VPS e autenticação E2E dos demais módulos. `MERGED != DEPLOYED`, `DOCUMENTED != EXECUTED`, `UNKNOWN != PASS`.
**NEXT_CURSOR:** `RECONCILE_PR1774_PR1767_GATES_SAME_HEAD_THEN_VPS_DELTA_SAFE`.

## Readback físico pós-microcorreção (observado 2026-10-11T10:22–10:25Z)

- **Commit de origem:** [171bdf8](https://github.com/ServerVpss/CentralDark/commit/171bdf8a864e0b6ca5482dfe8d9233a66f4167b2), cinco arquivos versionados. Os quatro arquivos de contrato foram espelhados individualmente para a VPS após pré-condição de blob SHA exato e backup separado.
- **Hash igual main ↔ VPS:** `README.md=914d9ba9d4c520c431cfd9b52cecace66773700c`; `MAIN-PINNED-RUNTIME-FAST-PATH-FALLBACK.json=2b820259ff40c6322500a11ec7dfbda9a5655940`; `*.yml=8e635e6014c8f4137a1f3eab33ce92761a55b83f`; `*.md=fbd962b8585ca3a29bbc03ceecab96169af5e896`. `MICRODEPLOY_CONTRACT_CROSSCHECK=PASS` executado no shell VPS.
- **Consumer vivo:** `centraldark_deploy_recipe_status` passou a devolver último passo `receipt_local_then_reconcile_repository` e `CANONICAL_FALLBACK_RECIPE`. **Isso confirma leitura do contrato e não execução do microdeploy.**
- **VPS @ 10:24:48Z:** portas `25808,25810,3100,18435,8899,9100,25812` responderam HTTP 200 em `/health` ou `/`; Omni `8099` retornou `000`. `3030` respondeu `/ = 200`, `/health = 404` (endpoint inadequado para provar health). Containers `rakazo-web/api/worker/supervisor/postgres` apareceram `Up`, API/supervisor/postgres `healthy`.
- **Casa SEGREDO @ 10:24:22Z:** Desktop Commander executou PowerShell 7 autorizado. `9900` escuta por processo Python sob Hermes, `/health` reportou `ok`; `3030` escuta por `screenpipe-app`; `9222,8787,8788,8099,9119` não tinham listener local. Dez processos `Hermes` e cinco `AionUi` observados; múltiplos processos **não** equivalem a múltiplos executores independentes ou sessão E2E validada.
- **Correção de autocontagem:** um `ps -eo args | grep` produziu contagem contaminável por texto do próprio comando (`6/6`); contraprova `ps -eo comm=` com igualdade do nome identificou **4 `Runner.Listener` e 4 `Runner.Worker`** no instante observado. A contagem antiga fica como erro de instrumento, não vira evidência de concorrência.
- **Regra de prova:** este receipt + o readback 4/4 comprovam o **delta contratual**. Não afirmam `CI_GLOBAL=PASS`, `VPS_HEAD=main`, `OMNI_8099=PASS`, `RUNTIME_TAILSCALE_E2E=PASS` nem `HERMES_GOAL_COMPLETED`.

**Estado final do escopo:** `MAIN_CONTRACT=PASS`; `VPS_CONTRACT_FILES=PASS`; `RUNTIME_CONSUMER_READBACK=PASS`; `GLOBAL_DEPLOY=PARTIAL`; `CI=FAIL_OWNERS_ACTIVE`; `OMNI_8099=FAIL_PROBE`.
