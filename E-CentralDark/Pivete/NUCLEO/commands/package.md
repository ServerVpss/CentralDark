# COMANDO - package.json
**Origem:** E:\CentralDark\_MAPA_CASA\Nova pasta\.extracted_screenpipe-main.zip\screenpipe-main\apps\screenpipe-app-tauri\package.json
**SHA:** 2ca4840f98eecfb4
**Timestamp:** 2026-08-23T14:16:09.091545
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- "test:e2e:screen-recording-restart:macos": "SCREENPIPE_E2E_SEED=onboarding,no-recording bun run wdio run e2e/wdio.conf.ts --spec e2e/specs/screen-recording-restart.spec.ts",

### Ouro Bruto (primeiros 5000 chars)
```
{
  "name": "screenpipe",
  "private": true,
  "scripts": {
    "dev": "next dev -p 1420",
    "dev:web": "bun scripts/dev-web.ts mock",
    "dev:web:live": "bun scripts/dev-web.ts live",
    "dev:tauri": "bun scripts/native-build-queue.ts dev",
    "test": "bun run test:vitest && bun run test:bun",
    "test:vitest": "bun x vitest run --config vitest.config.ts",
    "test:automation-pipe-evals": "bun x vitest run lib/automation-pipe-evals.test.ts components/chat/summary-cards.test.tsx",
    "test:daily-summary-prompt-evals": "bun x vitest run lib/daily-summary-prompt-evals.test.ts lib/daily-summary-pi.test.ts components/rewind/timeline/daily-summary.test.tsx",
    "eval:daily-summary-agent": "bun scripts/eval-daily-summary-prompt.ts",
    "eval:chart-fence": "bun scripts/eval-chart-fence.ts",
    "eval:activity-episode-retrieval": "bun scripts/eval-activity-episode-retrieval.ts",
    "eval:daily-summary-prompt": "bun run eval:daily-summary-agent",
    "test:bun": "bun scripts/run-bun-tests.ts",
    "test:shortcut-overlay": "./scripts/test-shortcut-overlay.sh",
    "test:timeline": "./scripts/test-timeline.sh",
    "preview:timeline": "./scripts/preview-timeline.sh",
    "test:watch": "bun x vitest --config vitest.config.ts",
    "lint:effects": "ESLINT_USE_FLAT_CONFIG=true eslint --config eslint.effects.config.mjs \"lib/**/*.{ts,tsx}\" \"components/**/*.{ts,tsx}\" \"app/**/*.{ts,tsx}\"",
    "prepare-updater-manifest": "bun ./e2e/mock-updates/updater-harness.ts prepare-manifest",
    "updater-local:setup-keys": "bun ./e2e/mock-updates/updater-harness.ts setup-keys",
    "updater-local:build": "bun ./e2e/mock-updates/updater-harness.ts build",
    "updater-local:serve": "bun ./e2e/mock-updates/updater-harness.ts serve",
    "updater-local:stage-last": "bun ./e2e/mock-updates/updater-harness.ts stage-last",
    "mock-updates": "bun ./e2e/mock-updates/updater-harness.ts serve",
    "test:e2e:packaged-updater:macos": "bun ./e2e/mock-updates/packaged-update-restart.e2e.ts",
    "test:e2e": "bun run wdio run e2e/wdio.conf.ts",
    "test:e2e:local-ai-gateway:macos": "SCREENPIPE_E2E_LOCAL_AI_GATEWAY=true bun run wdio run e2e/wdio.conf.ts --spec e2e/specs/chat-local-ai-gateway.spec.ts --spec e2e/specs/pipe-local-ai-gateway.spec.ts",
    "test:e2e:first-run-ai-summary:macos": "SCREENPIPE_E2E_LOCAL_AI_GATEWAY=true SCREENPIPE_E2E_SEED=onboarding,no-recording SCREENPIPE_PORT=3050 bun run wdio run e2e/wdio.conf.ts --spec e2e/specs/first-run-ai-summary.spec.ts",
    "test:e2e:db-hard-fault": "SCREENPIPE_E2E_SEED=onboarding,no-recording,db-hard-fault SCREENPIPE_PORT=3043 bun run wdio run e2e/wdio.conf.ts --spec e2e/specs/db-hard-fault-fail-closed.spec.ts",
    "e2e:coverage": "bun e2e/scripts/generate-coverage-report.ts",
    "e2e:coverage:check": "bun e2e/scripts/generate-coverage-report.ts --check",
    "e2e:coverage:runtime": "bun e2e/scripts/generate-coverage-report.ts --results-dir e2e/results --out e2e/COVERAGE.runtime.md",
    "coverage:core": "bun ../../docs/coverage/scripts/generate-core-engine-coverage-report.ts",
    "coverage:core:check": "bun ../../docs/coverage/scripts/generate-core-engine-coverage-report.ts --check",
    "coverage:all": "bun run e2e:coverage && bun run coverage:core && bun ../../docs/coverage/scripts/generate-unified-coverage-report.ts",
    "coverage:all:check": "bun run e2e:coverage:check && bun run coverage:core:check && bun ../../docs/coverage/scripts/generate-unified-coverage-report.ts --check",
    "test:e2e:audio-fallback:macos": "SCREENPIPE_E2E_SEED=onboarding,no-recording,cloud-audio-fallback bun run wdio run e2e/wdio.conf.ts --spec e2e/specs/audio-fallback.spec.ts",
    "test:e2e:audio-fallback-reverify:macos": "SCREENPIPE_E2E_SEED=onboarding,no-recording,cloud-audio-fallback bun run wdio run e2e/wdio.conf.ts --spec e2e/specs/zz-audio-fallback-reverify.spec.ts",
    "test:e2e:meetings-only-audio": "SCREENPIPE_E2E_SEED=onboarding,meetings-only-audio SCREENPIPE_PORT=3042 bun run wdio run e2e/wdio.conf.ts --spec e2e/specs/meetings-only-audio-lifecycle.spec.ts",
    "test:e2e:capture-restart-devices": "SCREENPIPE_E2E_SEED=onboarding,capture-restart-devices SCREENPIPE_PORT=3049 bun run wdio run e2e/wdio.conf.ts --spec e2e/specs/capture-restart-device-recovery.spec.ts",
    "test:e2e:onboarding-redirect": "SCREENPIPE_E2E_SEED=no-recording bun run wdio run e2e/wdio.conf.ts --spec e2e/specs/onboarding-redirect.spec.ts",
    "test:e2e:first-run-learning-window": "SCREENPIPE_E2E_SEED=onboarding,no-recording SCREENPIPE_PORT=3048 bun run wdio run e2e/wdio.conf.ts --spec e2e/specs/first-run-learning-window.spec.ts",
    "test:e2e:onboarding-first-run": "SCREENPIPE_E2E_SEED=no-recording SCREENPIPE_PORT=3047 bun run wdio run e2e/wdio.conf.ts --spec e2e/specs/onboarding-first-run.spec.ts",
    "test:e2e:onboarding-h1-follow-up": "SCREENPIPE_E2E_SEED=onboarding,no-recording SCREENPIPE_PORT=3046 bun run wdio run e2e/wdio.conf.ts --spec e2e/specs/onboarding-h1-follow-up.spec.ts",
    "test:e2e:onboa
```

---

# COMANDO - package.json
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.extracted_screenpipe-main.zip\screenpipe-main\apps\screenpipe-app-tauri\package.json
**SHA:** 2ca4840f98eecfb48b92168268a3bab97da44c078e48751745369cef8d4589dd
**Timestamp:** 2026-08-23T23:43:14.675800
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- "test:e2e:screen-recording-restart:macos": "SCREENPIPE_E2E_SEED=onboarding,no-recording bun run wdio run e2e/wdio.conf.ts --spec e2e/specs/screen-recording-restart.spec.ts",

### Ouro Bruto (primeiros 5000 chars)
```
{
  "name": "screenpipe",
  "private": true,
  "scripts": {
    "dev": "next dev -p 1420",
    "dev:web": "bun scripts/dev-web.ts mock",
    "dev:web:live": "bun scripts/dev-web.ts live",
    "dev:tauri": "bun scripts/native-build-queue.ts dev",
    "test": "bun run test:vitest && bun run test:bun",
    "test:vitest": "bun x vitest run --config vitest.config.ts",
    "test:automation-pipe-evals": "bun x vitest run lib/automation-pipe-evals.test.ts components/chat/summary-cards.test.tsx",
    "test:daily-summary-prompt-evals": "bun x vitest run lib/daily-summary-prompt-evals.test.ts lib/daily-summary-pi.test.ts components/rewind/timeline/daily-summary.test.tsx",
    "eval:daily-summary-agent": "bun scripts/eval-daily-summary-prompt.ts",
    "eval:chart-fence": "bun scripts/eval-chart-fence.ts",
    "eval:activity-episode-retrieval": "bun scripts/eval-activity-episode-retrieval.ts",
    "eval:daily-summary-prompt": "bun run eval:daily-summary-agent",
    "test:bun": "bun scripts/run-bun-tests.ts",
    "test:shortcut-overlay": "./scripts/test-shortcut-overlay.sh",
    "test:timeline": "./scripts/test-timeline.sh",
    "preview:timeline": "./scripts/preview-timeline.sh",
    "test:watch": "bun x vitest --config vitest.config.ts",
    "lint:effects": "ESLINT_USE_FLAT_CONFIG=true eslint --config eslint.effects.config.mjs \"lib/**/*.{ts,tsx}\" \"components/**/*.{ts,tsx}\" \"app/**/*.{ts,tsx}\"",
    "prepare-updater-manifest": "bun ./e2e/mock-updates/updater-harness.ts prepare-manifest",
    "updater-local:setup-keys": "bun ./e2e/mock-updates/updater-harness.ts setup-keys",
    "updater-local:build": "bun ./e2e/mock-updates/updater-harness.ts build",
    "updater-local:serve": "bun ./e2e/mock-updates/updater-harness.ts serve",
    "updater-local:stage-last": "bun ./e2e/mock-updates/updater-harness.ts stage-last",
    "mock-updates": "bun ./e2e/mock-updates/updater-harness.ts serve",
    "test:e2e:packaged-updater:macos": "bun ./e2e/mock-updates/packaged-update-restart.e2e.ts",
    "test:e2e": "bun run wdio run e2e/wdio.conf.ts",
    "test:e2e:local-ai-gateway:macos": "SCREENPIPE_E2E_LOCAL_AI_GATEWAY=true bun run wdio run e2e/wdio.conf.ts --spec e2e/specs/chat-local-ai-gateway.spec.ts --spec e2e/specs/pipe-local-ai-gateway.spec.ts",
    "test:e2e:first-run-ai-summary:macos": "SCREENPIPE_E2E_LOCAL_AI_GATEWAY=true SCREENPIPE_E2E_SEED=onboarding,no-recording SCREENPIPE_PORT=3050 bun run wdio run e2e/wdio.conf.ts --spec e2e/specs/first-run-ai-summary.spec.ts",
    "test:e2e:db-hard-fault": "SCREENPIPE_E2E_SEED=onboarding,no-recording,db-hard-fault SCREENPIPE_PORT=3043 bun run wdio run e2e/wdio.conf.ts --spec e2e/specs/db-hard-fault-fail-closed.spec.ts",
    "e2e:coverage": "bun e2e/scripts/generate-coverage-report.ts",
    "e2e:coverage:check": "bun e2e/scripts/generate-coverage-report.ts --check",
    "e2e:coverage:runtime": "bun e2e/scripts/generate-coverage-report.ts --results-dir e2e/results --out e2e/COVERAGE.runtime.md",
    "coverage:core": "bun ../../docs/coverage/scripts/generate-core-engine-coverage-report.ts",
    "coverage:core:check": "bun ../../docs/coverage/scripts/generate-core-engine-coverage-report.ts --check",
    "coverage:all": "bun run e2e:coverage && bun run coverage:core && bun ../../docs/coverage/scripts/generate-unified-coverage-report.ts",
    "coverage:all:check": "bun run e2e:coverage:check && bun run coverage:core:check && bun ../../docs/coverage/scripts/generate-unified-coverage-report.ts --check",
    "test:e2e:audio-fallback:macos": "SCREENPIPE_E2E_SEED=onboarding,no-recording,cloud-audio-fallback bun run wdio run e2e/wdio.conf.ts --spec e2e/specs/audio-fallback.spec.ts",
    "test:e2e:audio-fallback-reverify:macos": "SCREENPIPE_E2E_SEED=onboarding,no-recording,cloud-audio-fallback bun run wdio run e2e/wdio.conf.ts --spec e2e/specs/zz-audio-fallback-reverify.spec.ts",
    "test:e2e:meetings-only-audio": "SCREENPIPE_E2E_SEED=onboarding,meetings-only-audio SCREENPIPE_PORT=3042 bun run wdio run e2e/wdio.conf.ts --spec e2e/specs/meetings-only-audio-lifecycle.spec.ts",
    "test:e2e:capture-restart-devices": "SCREENPIPE_E2E_SEED=onboarding,capture-restart-devices SCREENPIPE_PORT=3049 bun run wdio run e2e/wdio.conf.ts --spec e2e/specs/capture-restart-device-recovery.spec.ts",
    "test:e2e:onboarding-redirect": "SCREENPIPE_E2E_SEED=no-recording bun run wdio run e2e/wdio.conf.ts --spec e2e/specs/onboarding-redirect.spec.ts",
    "test:e2e:first-run-learning-window": "SCREENPIPE_E2E_SEED=onboarding,no-recording SCREENPIPE_PORT=3048 bun run wdio run e2e/wdio.conf.ts --spec e2e/specs/first-run-learning-window.spec.ts",
    "test:e2e:onboarding-first-run": "SCREENPIPE_E2E_SEED=no-recording SCREENPIPE_PORT=3047 bun run wdio run e2e/wdio.conf.ts --spec e2e/specs/onboarding-first-run.spec.ts",
    "test:e2e:onboarding-h1-follow-up": "SCREENPIPE_E2E_SEED=onboarding,no-recording SCREENPIPE_PORT=3046 bun run wdio run e2e/wdio.conf.ts --spec e2e/specs/onboarding-h1-follow-up.spec.ts",
    "test:e2e:onboa
```