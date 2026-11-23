#!/usr/bin/env node
// 🔁 COMPATIBILITY ENTRYPOINT — CentralDark-Hermes
// Processo PM2 histórico preservado; execução real converge para HERMES-CORE.
// REUSE_BEFORE_CREATE=true · ONE_SYSTEM_ONLY=true · LEGACY_ENTRYPOINT_IS_NOT_SECOND_RUNTIME=true
process.env.CENTRALDARK_HERMES_ENTRYPOINT ||= 'legacy-compat-to-hermes-core';
await import('../../../../apps/modulos/HERMES-CORE/core/orchestrator.mjs');
