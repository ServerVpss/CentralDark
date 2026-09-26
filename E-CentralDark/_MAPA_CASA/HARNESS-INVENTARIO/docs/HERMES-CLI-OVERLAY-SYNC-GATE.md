# ☿ HERMES CLI OVERLAY + CENTRALDARK SYNC GATE

## Missão
Preservar o Hermes upstream intacto e adicionar uma camada CentralDark reversível para idioma, UX, governança, sincronização e prova.

## Regra de composição
`HERMES_UPSTREAM → CENTRALDARK_CLI_OVERLAY → CENTRALDARK_SYNC_GATE → PROOF_LEDGER → REALITY_JUDGE`

- upstream não é forkado nem reescrito por tradução local.
- overlay traduz mensagens/TUI, não semântica de comandos.
- nomes técnicos permanecem canônicos: `HEAD`, `SHA`, `PR`, `branch`, `main`, `MCP`, `commit`, `hermes skills trust`.
- qualquer atualização upstream precisa sobreviver a compatibilidade + self-test + rollback.

## Idioma
- `DEFAULT_LANGUAGE=pt-BR`.
- `/language` abre seletor de idioma.
- `/lang pt-BR` e `/lang en-US` são aliases explícitos.
- fallback de tradução ausente = string upstream + status `LOCALE_MISS`, nunca texto inventado silenciosamente.

## UX de status
Rodapé alvo:
`☿ Hermes | 🇧🇷 pt-BR | main:<sync> | VPS:<clean|dirty> | skills:<loaded/total> | upstream:<state>`
## VPS Sync Gate
Toda mutação versionável detectada na VPS segue:
`DETECT → OWNER → DIFF → TEST → COUNTERPROOF → COMMIT → PUSH/PR → REMOTE_VERIFY → RECEIPT`.

Não promover automaticamente:
- `.env`, tokens, chaves, credenciais.
- cache, PID, socket, banco local e logs transitórios.
- artefato gerado sem owner/versionamento explícito.

## Update reconcile
`/updateBR` é alias de conveniência, não fork de updater:
`UPSTREAM_UPDATE → VERSION_DIFF → OVERLAY_COMPAT → LOCALE_TEST → COMMAND_TEST → SKILL_TEST → ROUTING_TEST → SYNC_GATE → RECEIPT → ROLLBACK_IF_FAIL`.

Melhoria arquitetural:
- usar instalação em staging antes de promoção.
- medir `upstream_version`, `overlay_version`, `compatibility_result`, `locale_coverage_pct`, `command_pass_pct`, `skill_pass_pct`.
- nenhuma atualização recebe `GREEN` sem teste de compatibilidade no mesmo build.

## Owners já existentes no repo
- `apps/modulos/HERMES-CORE/prompts/hermes-core.md` = prompt/governança do Hermes.
- `apps/modulos/HERMES-CORE/core/scope-lock-gate.mjs` = trava de escopo e last-good-state.
- `apps/modulos/HERMES-CORE/core/universal-method-contract.mjs` = contrato/método universal.
- `docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/TRIGGERS.yml` = receipt, learning delta, next cursor e promoção condicionada.

`LOCALE/OVERLAY_DIRECT_OWNER = OWNER_GAP` até owner executável ser medido/criado dentro de HERMES-CORE.