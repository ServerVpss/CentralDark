module.exports = [
"[project]/package.json.[json].mjs [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
"use turbopack no side effects";
const __TURBOPACK__default__export__ = JSON.parse("{\"name\":\"omniroute\",\"version\":\"3.8.50\",\"description\":\"Unified AI router with 290 providers, RTK+Caveman compression, auto fallback, MCP/A2A, desktop, PWA, and OpenAI-compatible APIs.\",\"type\":\"module\",\"bin\":{\"omniroute\":\"bin/omniroute.mjs\",\"omniroute-reset-password\":\"bin/reset-password.mjs\"},\"files\":[\"bin/\",\"dist/\",\"@omniroute/\",\"open-sse/\",\"src/domain/\",\"src/lib/\",\"src/models/\",\"src/mitm/\",\"src/server/\",\"src/shared/\",\"src/sse/\",\"src/types/\",\".env.example\",\"scripts/build/postinstall.mjs\",\"scripts/build/fixTlsClientNodeBinary.mjs\",\"scripts/build/fixPlaywrightAndroid.mjs\",\"bin/cli/runtime/\",\"scripts/postinstall.mjs\",\"scripts/build/postinstallSupport.mjs\",\"scripts/build/runtime-env.mjs\",\"scripts/build/colocateOptionals.mjs\",\"scripts/build/sync-env.mjs\",\"scripts/dev/responses-ws-proxy.mjs\",\"scripts/dev/tls-options.mjs\",\"scripts/check/check-supported-node-runtime.ts\",\"scripts/dev/sync-env.mjs\",\"scripts/build/native-binary-compat.mjs\",\"scripts/build/build-next-isolated.mjs\",\"scripts/build/runtime-env.mjs\",\"README.md\",\"LICENSE\",\"!**/node_modules/**\",\"!**/__tests__/**\",\"!**/*.test.ts\",\"!**/*.test.tsx\",\"!**/*.test.js\",\"!**/*.test.mjs\",\"!**/*.spec.ts\",\"!**/*.spec.tsx\"],\"workspaces\":[\"open-sse\"],\"engines\":{\"node\":\">=22.22.2 <23 || >=24.0.0 <27\"},\"keywords\":[\"ai\",\"router\",\"proxy\",\"openai\",\"claude\",\"anthropic\",\"gemini\",\"fallback\",\"cursor\",\"cline\",\"codex\",\"llm\",\"auto-fallback\"],\"license\":\"MIT\",\"author\":\"diegosouzapw\",\"repository\":{\"type\":\"git\",\"url\":\"https://github.com/diegosouzapw/OmniRoute\"},\"homepage\":\"https://omniroute.online\",\"scripts\":{\"dev\":\"node --max-old-space-size=8192 scripts/dev/run-next.mjs dev\",\"prebuild:docs\":\"node scripts/docs/gen-openapi-module.mjs\",\"gen:provider-reference\":\"bun scripts/docs/gen-provider-reference.ts\",\"bench:compression\":\"bun scripts/compression/benchmark.ts\",\"bench:heap-body\":\"node --expose-gc --import tsx/esm scripts/perf/request-body-heap.ts\",\"eval:compression\":\"node --import tsx scripts/compression-eval/index.ts\",\"eval:router\":\"node --import tsx scripts/router-eval/index.ts\",\"eval:router:compare\":\"node --import tsx scripts/router-eval/compare.ts\",\"eval:router:patch-compare\":\"node --import tsx scripts/router-eval/patch-compare.ts\",\"eval:router:search\":\"node --import tsx scripts/router-eval/search.ts\",\"eval:router:trends\":\"node --import tsx scripts/router-eval/trends.ts\",\"release:sync-changelog-i18n\":\"node scripts/release/sync-changelog-i18n.mjs\",\"build\":\"node scripts/build/build-next-isolated.mjs\",\"build:secure\":\"OMNIROUTE_BUILD_PROFILE=minimal node scripts/build/build-next-isolated.mjs\",\"build:backend\":\"cross-env OMNIROUTE_BUILD_BACKEND_ONLY=1 node scripts/build/build-next-isolated.mjs\",\"build:cli\":\"node --import tsx scripts/build/prepublish.ts\",\"build:release\":\"rm -rf .build dist && OMNIROUTE_BUILD_SHA=$(git rev-parse --short HEAD) npm run build && npm run build:cli && node scripts/build/write-build-sha.mjs\",\"build:native:tproxy\":\"cd src/mitm/tproxy/native && npx --yes node-gyp rebuild\",\"start\":\"node scripts/dev/run-next.mjs start\",\"homolog\":\"node scripts/homolog/run.mjs\",\"lint\":\"eslint . --cache --cache-location .eslintcache --suppressions-location config/quality/eslint-suppressions.json\",\"lint:json\":\"node scripts/quality/run-eslint-json.mjs\",\"lint:md\":\"npx --yes markdownlint-cli2 \\\"docs/**/*.md\\\" \\\"*.md\\\" \\\"!docs/i18n\\\" \\\"!docs/research\\\"\",\"lint:prose\":\"vale docs\",\"electron:dev\":\"concurrently \\\"npm run dev\\\" \\\"wait-on http://localhost:20128 && cd electron && npm run dev\\\"\",\"electron:build\":\"npm run build && cd electron && npm run build\",\"electron:build:win\":\"npm run build && cd electron && npm run build:win\",\"electron:build:mac\":\"npm run build && cd electron && npm run build:mac\",\"electron:build:linux\":\"npm run build && cd electron && npm run build:linux\",\"electron:smoke:packaged\":\"node scripts/dev/smoke-electron-packaged.mjs\",\"test\":\"cross-env DISABLE_SQLITE_AUTO_BACKUP=true node --max-old-space-size=8192 --import tsx/esm --import ./open-sse/utils/setupPolyfill.ts --import ./tests/_setup/isolateDataDir.ts --test --test-concurrency=20 tests/unit/*.test.ts \\\"tests/unit/{api,auth,authz,build,cli,cli-helper,combo,compression,correctness,cors,db,db-adapters,docs,gamification,guardrails,lib,mcp,memory,runtime,security,services,settings,shared,ui,usage}/**/*.test.ts\\\" \\\"tests/unit/**/*.test.mjs\\\" && cross-env DISABLE_SQLITE_AUTO_BACKUP=true node --max-old-space-size=8192 --import tsx --import ./open-sse/utils/setupPolyfill.ts --import ./tests/_setup/isolateDataDir.ts --test --test-concurrency=20 \\\"tests/unit/dashboard/**/*.test.ts\\\"\",\"test:unit\":\"cross-env DISABLE_SQLITE_AUTO_BACKUP=true node --max-old-space-size=8192 --import tsx/esm --import ./open-sse/utils/setupPolyfill.ts --import ./tests/_setup/isolateDataDir.ts --test --test-force-exit --test-concurrency=20 tests/unit/*.test.ts \\\"tests/unit/{api,auth,authz,build,cli,cli-helper,combo,compression,correctness,cors,db,db-adapters,docs,gamification,guardrails,lib,mcp,memory,runtime,security,services,settings,shared,ui,usage}/**/*.test.ts\\\" \\\"tests/unit/**/*.test.mjs\\\" && cross-env DISABLE_SQLITE_AUTO_BACKUP=true node --max-old-space-size=8192 --import tsx --import ./open-sse/utils/setupPolyfill.ts --import ./tests/_setup/isolateDataDir.ts --test --test-force-exit --test-concurrency=20 \\\"tests/unit/dashboard/**/*.test.ts\\\" && npm run test:unit:serial\",\"test:unit:ci\":\"cross-env DISABLE_SQLITE_AUTO_BACKUP=true node --max-old-space-size=8192 --import tsx/esm --import ./open-sse/utils/setupPolyfill.ts --import ./tests/_setup/isolateDataDir.ts --test --test-force-exit --test-concurrency=4 tests/unit/*.test.ts \\\"tests/unit/{api,auth,authz,build,cli,cli-helper,combo,compression,correctness,cors,db,db-adapters,docs,gamification,guardrails,lib,mcp,memory,runtime,security,services,settings,shared,ui,usage}/**/*.test.ts\\\" \\\"tests/unit/**/*.test.mjs\\\" && cross-env DISABLE_SQLITE_AUTO_BACKUP=true node --max-old-space-size=8192 --import tsx --import ./open-sse/utils/setupPolyfill.ts --import ./tests/_setup/isolateDataDir.ts --test --test-force-exit --test-concurrency=4 \\\"tests/unit/dashboard/**/*.test.ts\\\" && npm run test:unit:serial\",\"test:unit:ci:shard\":\"cross-env DISABLE_SQLITE_AUTO_BACKUP=true node --max-old-space-size=4096 --import tsx/esm --import ./open-sse/utils/setupPolyfill.ts --import ./tests/_setup/isolateDataDir.ts --test --test-force-exit --test-concurrency=4 --test-shard=$TEST_SHARD tests/unit/*.test.ts \\\"tests/unit/{api,auth,authz,build,cli,cli-helper,combo,compression,correctness,cors,db,db-adapters,docs,gamification,guardrails,lib,mcp,memory,runtime,security,services,settings,shared,ui,usage}/**/*.test.ts\\\" \\\"tests/unit/**/*.test.mjs\\\" && cross-env DISABLE_SQLITE_AUTO_BACKUP=true node --max-old-space-size=4096 --import tsx --import ./open-sse/utils/setupPolyfill.ts --import ./tests/_setup/isolateDataDir.ts --test --test-force-exit --test-concurrency=4 --test-shard=$TEST_SHARD \\\"tests/unit/dashboard/**/*.test.ts\\\" && cross-env DISABLE_SQLITE_AUTO_BACKUP=true node --max-old-space-size=4096 --import tsx/esm --import ./open-sse/utils/setupPolyfill.ts --import ./tests/_setup/isolateDataDir.ts --test --test-force-exit --test-concurrency=1 --test-shard=$TEST_SHARD \\\"tests/unit/serial/**/*.test.ts\\\"\",\"test:unit:fast\":\"cross-env DISABLE_SQLITE_AUTO_BACKUP=true node --max-old-space-size=8192 --import tsx/esm --import ./open-sse/utils/setupPolyfill.ts --import ./tests/_setup/isolateDataDir.ts --test --test-force-exit --test-isolation=none tests/unit/*.test.ts \\\"tests/unit/{api,auth,authz,build,cli,cli-helper,combo,compression,correctness,cors,db,db-adapters,docs,gamification,guardrails,lib,mcp,memory,runtime,security,services,settings,shared,ui,usage}/**/*.test.ts\\\" \\\"tests/unit/**/*.test.mjs\\\" && cross-env DISABLE_SQLITE_AUTO_BACKUP=true node --max-old-space-size=8192 --import tsx --import ./open-sse/utils/setupPolyfill.ts --import ./tests/_setup/isolateDataDir.ts --test --test-force-exit --test-isolation=none \\\"tests/unit/dashboard/**/*.test.ts\\\" && npm run test:unit:serial\",\"test:scoped\":\"bash scripts/quality/test-scoped.sh\",\"test:scoped:staged\":\"bash scripts/quality/test-scoped.sh --staged\",\"test:unit:shard\":\"concurrently --kill-others-on-fail -n s1,s2 \\\"npm:test:unit:shard:1\\\" \\\"npm:test:unit:shard:2\\\"\",\"test:unit:shard:1\":\"cross-env DISABLE_SQLITE_AUTO_BACKUP=true node --max-old-space-size=8192 --import tsx/esm --import ./open-sse/utils/setupPolyfill.ts --import ./tests/_setup/isolateDataDir.ts --test --test-force-exit --test-concurrency=10 --test-shard=1/2 tests/unit/*.test.ts \\\"tests/unit/{api,auth,authz,build,cli,cli-helper,combo,compression,correctness,cors,db,db-adapters,docs,gamification,guardrails,lib,mcp,memory,runtime,security,services,settings,shared,ui,usage}/**/*.test.ts\\\" \\\"tests/unit/**/*.test.mjs\\\" && cross-env DISABLE_SQLITE_AUTO_BACKUP=true node --max-old-space-size=8192 --import tsx --import ./open-sse/utils/setupPolyfill.ts --import ./tests/_setup/isolateDataDir.ts --test --test-force-exit --test-concurrency=10 --test-shard=1/2 \\\"tests/unit/dashboard/**/*.test.ts\\\" && cross-env DISABLE_SQLITE_AUTO_BACKUP=true node --max-old-space-size=8192 --import tsx/esm --import ./open-sse/utils/setupPolyfill.ts --import ./tests/_setup/isolateDataDir.ts --test --test-force-exit --test-concurrency=1 --test-shard=1/2 \\\"tests/unit/serial/**/*.test.ts\\\"\",\"test:unit:shard:2\":\"cross-env DISABLE_SQLITE_AUTO_BACKUP=true node --max-old-space-size=8192 --import tsx/esm --import ./open-sse/utils/setupPolyfill.ts --import ./tests/_setup/isolateDataDir.ts --test --test-force-exit --test-concurrency=10 --test-shard=2/2 tests/unit/*.test.ts \\\"tests/unit/{api,auth,authz,build,cli,cli-helper,combo,compression,correctness,cors,db,db-adapters,docs,gamification,guardrails,lib,mcp,memory,runtime,security,services,settings,shared,ui,usage}/**/*.test.ts\\\" \\\"tests/unit/**/*.test.mjs\\\" && cross-env DISABLE_SQLITE_AUTO_BACKUP=true node --max-old-space-size=8192 --import tsx --import ./open-sse/utils/setupPolyfill.ts --import ./tests/_setup/isolateDataDir.ts --test --test-force-exit --test-concurrency=10 --test-shard=2/2 \\\"tests/unit/dashboard/**/*.test.ts\\\" && cross-env DISABLE_SQLITE_AUTO_BACKUP=true node --max-old-space-size=8192 --import tsx/esm --import ./open-sse/utils/setupPolyfill.ts --import ./tests/_setup/isolateDataDir.ts --test --test-force-exit --test-concurrency=1 --test-shard=2/2 \\\"tests/unit/serial/**/*.test.ts\\\"\",\"test:bun:db\":\"bun test tests/unit/db-adapters/bunSqliteAdapter.test.ts tests/unit/db-adapters/driverFactory.test.ts tests/unit/db-adapters/cliSqlite.test.mjs\",\"test:plan3\":\"cross-env DISABLE_SQLITE_AUTO_BACKUP=true node --import tsx/esm --import ./open-sse/utils/setupPolyfill.ts --import ./tests/_setup/isolateDataDir.ts --test tests/unit/plan3-p0.test.ts\",\"test:fixes\":\"cross-env DISABLE_SQLITE_AUTO_BACKUP=true node --import tsx/esm --import ./open-sse/utils/setupPolyfill.ts --import ./tests/_setup/isolateDataDir.ts --test tests/unit/fixes-p1.test.ts\",\"test:security\":\"cross-env DISABLE_SQLITE_AUTO_BACKUP=true node --import tsx/esm --import ./open-sse/utils/setupPolyfill.ts --import ./tests/_setup/isolateDataDir.ts --test tests/unit/security-fase01.test.ts\",\"test:property\":\"cross-env DISABLE_SQLITE_AUTO_BACKUP=true node --import tsx/esm --test --test-force-exit tests/unit/correctness/*.property.test.ts\",\"check:cycles\":\"node scripts/check/check-cycles.mjs\",\"check:route-validation:t06\":\"node scripts/check/check-route-validation.mjs\",\"check:any-budget:t11\":\"node scripts/check/check-t11-any-budget.mjs\",\"check:docs-sync\":\"node scripts/check/check-docs-sync.mjs\",\"check:env-doc-sync\":\"node scripts/check/check-env-doc-sync.mjs\",\"check:docs-counts\":\"node scripts/check/check-docs-counts-sync.mjs\",\"check:deprecated-versions\":\"node scripts/check/check-deprecated-versions.mjs\",\"check:compression-budget\":\"bun scripts/check/check-compression-budget.ts\",\"check:router-eval\":\"node --import tsx scripts/check/check-router-eval-regression.ts\",\"check:doc-links\":\"node scripts/check/check-doc-links.mjs\",\"check:fabricated-docs\":\"node scripts/check/check-fabricated-docs.mjs --strict\",\"check:docs-all\":\"npm run check:docs-sync && npm run check:docs-counts && npm run check:env-doc-sync && npm run check:deprecated-versions && npm run check:doc-links && npm run check:fabricated-docs\",\"docs:render-diagrams\":\"node scripts/docs/render-diagrams.mjs\",\"i18n:run\":\"node scripts/i18n/run-translation.mjs\",\"i18n:run:dry\":\"node scripts/i18n/run-translation.mjs --dry-run\",\"i18n:check\":\"node scripts/i18n/check-translation-drift.mjs\",\"i18n:sync-ui\":\"node scripts/i18n/sync-ui-keys.mjs\",\"i18n:sync-ui:dry\":\"node scripts/i18n/sync-ui-keys.mjs --dry-run\",\"i18n:check-ui-coverage\":\"node scripts/i18n/check-ui-keys-coverage.mjs\",\"i18n:check-value-drift\":\"node scripts/i18n/check-ui-value-drift.mjs\",\"i18n:check-value-drift:warn\":\"node scripts/i18n/check-ui-value-drift.mjs --warn\",\"i18n:check-glossary\":\"node scripts/i18n/check-glossary-consistency.mjs\",\"check:node-runtime\":\"node --import tsx scripts/check/check-supported-node-runtime.ts\",\"check:pack-artifact\":\"node --import tsx scripts/build/validate-pack-artifact.ts\",\"check:pack-boot\":\"node scripts/check/check-pack-boot.mjs\",\"check:install-upgrade\":\"node scripts/check/check-install-upgrade.mjs\",\"check:pack-policy\":\"node --import tsx scripts/build/validate-pack-artifact.ts --policy-only\",\"check:cli-i18n\":\"node scripts/check/check-cli-i18n.mjs\",\"check:openapi-coverage\":\"node scripts/check/check-openapi-coverage.mjs\",\"check:openapi-security-tiers\":\"node scripts/check/check-openapi-security-tiers.mjs\",\"check:provider-consistency\":\"bun scripts/check/check-provider-consistency.ts\",\"check:provider-assets\":\"node scripts/check/check-provider-assets.mjs\",\"check:nvidia-catalog-drift\":\"node --import tsx/esm scripts/check/check-nvidia-catalog-drift.ts\",\"check:fetch-targets\":\"node scripts/check/check-fetch-targets.mjs\",\"check:openapi-routes\":\"node scripts/check/check-openapi-routes.mjs\",\"check:api-docs-refs\":\"node scripts/check/check-api-docs-refs.mjs\",\"check:openapi-breaking\":\"node scripts/check/check-openapi-breaking.mjs\",\"check:deps\":\"node scripts/check/check-deps.mjs\",\"check:file-size\":\"node scripts/check/check-file-size.mjs\",\"check:duplication\":\"node scripts/check/check-duplication.mjs\",\"check:tracked-artifacts\":\"node scripts/check/check-tracked-artifacts.mjs\",\"check:test-masking\":\"node scripts/check/check-test-masking.mjs\",\"check:test-runner-api\":\"node scripts/check/check-test-runner-api.mjs\",\"check:changelog-integrity\":\"node scripts/check/check-changelog-integrity.mjs\",\"sweep:stale-fragments\":\"node scripts/release/sweep-stale-fragments.mjs\",\"changelog:aggregate\":\"node scripts/release/aggregate-changelog.mjs\",\"check:agent-skills-sync\":\"node --import tsx/esm scripts/skills/generate-agent-skills.mjs\",\"check:build-scope\":\"node scripts/check/check-build-scope.mjs\",\"check:error-helper\":\"node scripts/check/check-error-helper.mjs\",\"check:migration-numbering\":\"node scripts/check/check-migration-numbering.mjs\",\"check:public-creds\":\"node scripts/check/check-public-creds.mjs\",\"check:db-rules\":\"node scripts/check/check-db-rules.mjs\",\"check:docs-symbols\":\"node scripts/check/check-docs-symbols.mjs\",\"check:known-symbols\":\"bun scripts/check/check-known-symbols.ts\",\"check:route-guard-membership\":\"node --import tsx scripts/check/check-route-guard-membership.ts\",\"check:test-discovery\":\"node scripts/check/check-test-discovery.mjs\",\"check:mutation-test-coverage\":\"node scripts/check/check-mutation-test-coverage.mjs --strict\",\"check:complexity\":\"node scripts/check/check-complexity.mjs\",\"check:dead-code\":\"node scripts/check/check-dead-code.mjs\",\"check:cognitive-complexity\":\"node scripts/check/check-cognitive-complexity.mjs\",\"check:complexity-ratchets\":\"node scripts/check/check-complexity-ratchets.mjs\",\"check:release-green\":\"node scripts/quality/validate-release-green.mjs\",\"check:ratchet-bank\":\"node scripts/quality/verify-ratchet-bank.mjs\",\"check:type-coverage\":\"node scripts/check/check-type-coverage.mjs\",\"check:lockfile\":\"node scripts/check/check-lockfile.mjs\",\"check:bundle-size\":\"node scripts/check/check-bundle-size.mjs\",\"check:circular-deps\":\"node scripts/check/check-circular-deps.mjs\",\"check:mutation-ratchet\":\"node scripts/check/check-mutation-ratchet.mjs\",\"check:rtl-ratchet\":\"node scripts/check/check-rtl-ratchet.mjs\",\"check:licenses\":\"node scripts/check/check-licenses.mjs\",\"check:pr-evidence\":\"node scripts/check/check-pr-evidence.mjs\",\"check:vuln-ratchet\":\"node scripts/check/check-vuln-ratchet.mjs\",\"check:codeql-ratchet\":\"node scripts/check/check-codeql-ratchet.mjs\",\"check:secrets\":\"node scripts/check/check-secrets.mjs\",\"check:workflows\":\"node scripts/check/check-workflows.mjs\",\"quality:collect\":\"node scripts/quality/collect-metrics.mjs\",\"quality:ratchet\":\"node scripts/quality/check-quality-ratchet.mjs\",\"quality:gate\":\"npm run quality:collect && npm run quality:ratchet -- --allow-missing\",\"quality:scan\":\"node scripts/quality/run-all-gates.mjs\",\"quality:scan:fast\":\"node scripts/quality/run-all-gates.mjs --fast\",\"audit:deps\":\"npm audit --audit-level=critical && (npm audit --audit-level=high || echo '::warning::high-severity advisories present (non-blocking)') && npm run audit:electron\",\"audit:electron\":\"npm --prefix electron audit --audit-level=critical && (npm --prefix electron audit --audit-level=high || echo '::warning::electron high-severity advisories present (non-blocking)')\",\"typecheck:core\":\"tsc --pretty false -p tsconfig.typecheck-core.json\",\"typecheck:noimplicit:core\":\"tsc --pretty false -p tsconfig.typecheck-noimplicit-core.json\",\"check:dashboard-typecheck\":\"node scripts/check/check-dashboard-typecheck.mjs\",\"backfill-aggregation\":\"node --import tsx src/scripts/backfillAggregation.ts\",\"env:sync\":\"node scripts/dev/sync-env.mjs\",\"test:integration\":\"cross-env DISABLE_SQLITE_AUTO_BACKUP=true node --import tsx/esm --import ./open-sse/utils/setupPolyfill.ts --import ./tests/_setup/isolateDataDir.ts --test --test-force-exit --test-concurrency=1 tests/integration/*.test.ts \\\"tests/integration/combo-matrix/*.test.ts\\\"\",\"test:integration:ci\":\"cross-env DISABLE_SQLITE_AUTO_BACKUP=true node --import tsx/esm --import ./open-sse/utils/setupPolyfill.ts --import ./tests/_setup/isolateDataDir.ts --test --test-force-exit --test-concurrency=1 --test-shard=$TEST_SHARD tests/integration/*.test.ts \\\"tests/integration/combo-matrix/*.test.ts\\\"\",\"test:combo:matrix\":\"cross-env DISABLE_SQLITE_AUTO_BACKUP=true node --import tsx/esm --import ./open-sse/utils/setupPolyfill.ts --import ./tests/_setup/isolateDataDir.ts --test --test-force-exit --test-concurrency=1 \\\"tests/integration/combo-matrix/*.test.ts\\\"\",\"test:combo:live\":\"cross-env RUN_COMBO_LIVE=1 DISABLE_SQLITE_AUTO_BACKUP=true node --import tsx/esm --import ./open-sse/utils/setupPolyfill.ts --import ./tests/_setup/isolateDataDir.ts --test --test-force-exit --test-concurrency=1 \\\"tests/integration/combo-live/*.live.test.ts\\\"\",\"test:combo:live:vps\":\"node scripts/test/combo-live-vps.mjs\",\"test:combo:live:vps:failover\":\"node scripts/test/combo-live-vps.mjs --failover\",\"test:boundary:live\":\"cross-env RUN_BOUNDARY_LIVE=1 DISABLE_SQLITE_AUTO_BACKUP=true node --import tsx/esm --import ./open-sse/utils/setupPolyfill.ts --import ./tests/_setup/isolateDataDir.ts --test --test-force-exit --test-concurrency=1 \\\"tests/boundary/*.live.test.ts\\\"\",\"test:heap\":\"node --expose-gc --import tsx/esm --import ./open-sse/utils/setupPolyfill.ts --import ./tests/_setup/isolateDataDir.ts --test --test-force-exit tests/integration/heap-growth.test.ts\",\"test:chaos\":\"cross-env RUN_CHAOS_INT=1 node --import tsx/esm --import ./open-sse/utils/setupPolyfill.ts --import ./tests/_setup/isolateDataDir.ts --test --test-force-exit --test-concurrency=1 tests/integration/resilience-chaos.test.ts\",\"test:e2e\":\"node scripts/dev/run-playwright-tests.mjs test tests/e2e/*.spec.ts\",\"test:protocols:e2e\":\"node scripts/dev/run-protocol-clients-tests.mjs\",\"test:vitest\":\"vitest run --config vitest.mcp.config.ts\",\"test:vitest:ui\":\"vitest run --config vitest.config.ts tests/unit/ui\",\"test:mutation\":\"stryker run\",\"test:ecosystem\":\"node scripts/dev/run-ecosystem-tests.mjs\",\"test:system\":\"cross-env DISABLE_SQLITE_AUTO_BACKUP=true node --import tsx/esm --import ./open-sse/utils/setupPolyfill.ts --import ./tests/_setup/isolateDataDir.ts --test --test-force-exit --test-concurrency=1 tests/e2e/system-failover.test.ts\",\"test:coverage\":\"cross-env DISABLE_SQLITE_AUTO_BACKUP=true NODE_OPTIONS=--max-old-space-size=8192 c8 --merge-async --output-dir coverage --exclude=tests/** --exclude=**/*.test.* --reporter=text-summary --reporter=html --reporter=json-summary --reporter=lcov --check-coverage --statements 60 --lines 60 --functions 60 --branches 60 npm run test:coverage:runner\",\"test:coverage:legacy\":\"c8 --output-dir coverage --exclude=open-sse --check-coverage --lines 50 --functions 50 --branches 50 node --import tsx/esm --test tests/unit/*.test.ts\",\"coverage:report\":\"cross-env NODE_OPTIONS=--max-old-space-size=8192 c8 report --merge-async --output-dir coverage --exclude=tests/** --exclude=**/*.test.* --reporter=text --reporter=text-summary --reporter=html --reporter=json-summary --reporter=lcov\",\"coverage:summary\":\"node scripts/check/test-report-summary.mjs --input coverage/coverage-summary.json --output coverage/coverage-report.md\",\"check:pr-test-policy\":\"node scripts/check/check-pr-test-policy.mjs\",\"coverage:report:legacy\":\"c8 report --output-dir coverage --exclude=open-sse --reporter=text --reporter=text-summary\",\"test:all\":\"npm run test:unit && npm run test:vitest && npm run test:vitest:ui && npm run test:ecosystem && npm run test:e2e\",\"check\":\"npm run lint && npm run test\",\"prepublishOnly\":\"npm run build:cli-api && npm run build:cli && npm run check:pack-artifact\",\"postinstall\":\"node scripts/build/postinstall.mjs\",\"uninstall\":\"node scripts/build/uninstall.mjs\",\"uninstall:full\":\"node scripts/build/uninstall.mjs --full\",\"prepare\":\"husky\",\"system-info\":\"node scripts/dev/system-info.mjs\",\"build:cli-api\":\"node --import tsx/esm scripts/cli/generate-api-commands.mjs\",\"release:contributors\":\"node scripts/release/gen-contributors.mjs\",\"release:uncovered\":\"node scripts/release/list-uncovered-commits.mjs\",\"test:coverage:runner\":\"node --max-old-space-size=8192 --import tsx/esm --import ./open-sse/utils/setupPolyfill.ts --import ./tests/_setup/isolateDataDir.ts --test --test-force-exit --test-concurrency=8 tests/unit/*.test.ts \\\"tests/unit/{api,auth,authz,build,cli,cli-helper,combo,compression,correctness,cors,db,db-adapters,docs,gamification,guardrails,lib,mcp,memory,runtime,security,services,settings,shared,ui,usage}/**/*.test.ts\\\" \\\"tests/unit/**/*.test.mjs\\\" && cross-env DISABLE_SQLITE_AUTO_BACKUP=true NODE_OPTIONS=--max-old-space-size=8192 c8 --merge-async --output-dir coverage --exclude=tests/** --exclude=**/*.test.* --reporter=text-summary --reporter=html --reporter=json-summary --reporter=lcov --check-coverage --statements 60 --lines 60 --functions 60 --branches 60 node --max-old-space-size=8192 --import tsx --import ./open-sse/utils/setupPolyfill.ts --import ./tests/_setup/isolateDataDir.ts --test --test-force-exit --test-concurrency=8 \\\"tests/unit/dashboard/**/*.test.ts\\\" && npm run test:unit:serial\",\"test:unit:serial\":\"cross-env DISABLE_SQLITE_AUTO_BACKUP=true node --max-old-space-size=4096 --import tsx/esm --import ./open-sse/utils/setupPolyfill.ts --import ./tests/_setup/isolateDataDir.ts --test --test-force-exit --test-concurrency=1 \\\"tests/unit/serial/**/*.test.ts\\\"\"},\"dependencies\":{\"@aws-sdk/client-bedrock-runtime\":\"^3.1073.0\",\"@dnd-kit/core\":\"^6.3.1\",\"@dnd-kit/sortable\":\"^10.0.0\",\"@dnd-kit/utilities\":\"^3.2.2\",\"@lobehub/icons\":\"^5.8.0\",\"@modelcontextprotocol/sdk\":\"^1.29.0\",\"@monaco-editor/react\":\"^4.7.0\",\"@ngrok/ngrok\":\"^1.7.0\",\"@swc/helpers\":\"0.5.23\",\"@toon-format/toon\":\"^4.1.0\",\"@types/mdx\":\"^2.0.13\",\"@xyflow/react\":\"^12.11.1\",\"axios\":\"^1.16.1\",\"bcryptjs\":\"^3.0.3\",\"bottleneck\":\"^2.19.5\",\"clsx\":\"^2.1.1\",\"commander\":\"^15.0.0\",\"csv-stringify\":\"^6.7.0\",\"dompurify\":\"^3.4.12\",\"express\":\"^5.2.1\",\"fetch-socks\":\"^1.3.3\",\"fflate\":\"^0.8.3\",\"fumadocs-core\":\"^16.10.5\",\"fumadocs-ui\":\"^16.10.5\",\"http-proxy-middleware\":\"^4.0.0\",\"https-proxy-agent\":\"^9.0.0\",\"ink\":\"^7.0.3\",\"ink-spinner\":\"^5.0.0\",\"ink-text-input\":\"^6.0.0\",\"ioredis\":\"^5.10.1\",\"jose\":\"^6.2.3\",\"js-yaml\":\"^5.2.2\",\"jsonc-parser\":\"^3.3.1\",\"lowdb\":\"^7.0.1\",\"lucide-react\":\"^1.21.0\",\"marked\":\"^18.0.4\",\"marked-terminal\":\"^7.3.0\",\"material-symbols\":\"^0.45.2\",\"mermaid\":\"^11.15.0\",\"monaco-editor\":\"^0.56.0\",\"next\":\"^16.2.11\",\"next-intl\":\"^4.12.0\",\"next-themes\":\"^0.4.6\",\"node-machine-id\":\"^1.1.12\",\"omniglyph\":\"^1.0.2\",\"open\":\"^11.0.0\",\"ora\":\"^9.4.1\",\"parse5\":\"^8.0.1\",\"pino\":\"^10.3.1\",\"pino-abstract-transport\":\"^3.0.0\",\"pino-pretty\":\"^13.1.3\",\"playwright\":\"1.62.0\",\"react\":\"19.2.8\",\"react-dom\":\"19.2.8\",\"react-is\":\"^19.2.6\",\"react-markdown\":\"^10.1.0\",\"react-reconciler\":\"^0.33.0\",\"recharts\":\"^3.8.1\",\"safe-regex\":\"^2.1.1\",\"selfsigned\":\"^5.5.0\",\"smol-toml\":\"1.7.1\",\"socks\":\"^2.8.7\",\"sql.js\":\"^1.14.1\",\"sqlite-vec\":\"^0.1.9\",\"tailwind-merge\":\"^3.6.0\",\"tsx\":\"^4.23.0\",\"undici\":\"^8.3.0\",\"update-notifier\":\"^7.3.1\",\"uuid\":\"^14.0.0\",\"ws\":\"^8.18.0\",\"xxhash-wasm\":\"^1.1.0\",\"yazl\":\"^3.3.1\",\"zod\":\"^4.4.3\",\"zustand\":\"^5.0.13\"},\"optionalDependencies\":{\"@atjsh/llmlingua-2\":\"2.0.3\",\"@huggingface/transformers\":\"3.5.2\",\"@tensorflow/tfjs\":\"4.22.0\",\"better-sqlite3\":\"^13.0.2\",\"js-tiktoken\":\"^1.0.20\",\"keytar\":\"^7.9.0\",\"tls-client-node\":\"^0.2.0\",\"wreq-js\":\"^2.3.1\"},\"devDependencies\":{\"@axe-core/playwright\":\"^4.11.3\",\"@cyclonedx/cyclonedx-npm\":\"6.0.0\",\"@playwright/test\":\"^1.60.0\",\"@size-limit/file\":\"^12.1.0\",\"@stryker-mutator/core\":\"^9.6.1\",\"@stryker-mutator/tap-runner\":\"^9.6.1\",\"@tailwindcss/postcss\":\"^4.3.0\",\"@testing-library/jest-dom\":\"^6.9.1\",\"@testing-library/react\":\"^16.3.2\",\"@types/better-sqlite3\":\"^7.6.13\",\"@types/bun\":\"latest\",\"@types/node\":\"^26.1.0\",\"@types/react\":\"^19.2.15\",\"@types/react-dom\":\"^19.2.3\",\"@types/safe-regex\":\"^1.1.6\",\"@types/ws\":\"^8.18.0\",\"@vitejs/plugin-react\":\"^6.0.2\",\"bun\":\"1.3.14\",\"c8\":\"^12.0.0\",\"concurrently\":\"^10.0.3\",\"cross-env\":\"^10.1.0\",\"ctrf\":\"^0.2.1\",\"dpdm\":\"^4.2.0\",\"eslint\":\"^9.39.4\",\"eslint-config-next\":\"16.2.10\",\"eslint-plugin-sonarjs\":\"^4.1.0\",\"fast-check\":\"^4.8.0\",\"fumadocs-mdx\":\"^15.0.7\",\"glob\":\"^13.0.6\",\"httpyac\":\"^6.16.7\",\"husky\":\"^9.1.7\",\"jscpd\":\"^4.2.5\",\"jsdom\":\"^29.1.1\",\"junit-to-ctrf\":\"^0.0.14\",\"knip\":\"^6.18.0\",\"license-checker-rseidelsohn\":\"^5.0.1\",\"lint-staged\":\"^17.0.8\",\"lockfile-lint\":\"^5.0.0\",\"node-loader\":\"^2.1.0\",\"playwright-ctrf-json-reporter\":\"^0.0.29\",\"prettier\":\"^3.8.3\",\"promptfoo\":\"^0.121.18\",\"size-limit\":\"^12.1.0\",\"tailwindcss\":\"^4.3.0\",\"type-coverage\":\"^2.29.7\",\"typescript\":\"^6.0.3\",\"typescript-eslint\":\"^8.59.4\",\"vitest\":\"^4.1.7\",\"wait-on\":\"^9.0.10\",\"wtfnode\":\"^0.10.1\"},\"lint-staged\":{\"*.{js,jsx,ts,tsx,mjs}\":[\"prettier --write\",\"eslint --fix --no-error-on-unmatched-pattern --no-warn-ignored --suppressions-location config/quality/eslint-suppressions.json\"],\"*.{json,md,yml,yaml,css}\":[\"prettier --write\"]},\"pnpm\":{\"onlyBuiltDependencies\":[\"@parcel/watcher\",\"@swc/core\",\"better-sqlite3\",\"esbuild\",\"omniroute\",\"sharp\"]},\"allowScripts\":{\"better-sqlite3\":true,\"esbuild\":true,\"@swc/core\":true,\"@parcel/watcher\":true,\"keytar\":true,\"protobufjs\":true,\"unrs-resolver\":true},\"overrides\":{\"dompurify\":\"^3.4.12\",\"fast-xml-parser\":\"^5.10.1\",\"sharp\":\"^0.35.0\",\"postcss\":\"^8.5.18\",\"ip-address\":\"^10.3.1\",\"qs\":\"^6.15.2\",\"uuid\":\"^14.0.0\",\"form-data\":\"^4.0.6\",\"vite\":\"^8.0.16\",\"protobufjs\":\"^7.6.5\",\"@babel/core\":\"^7.29.6\",\"hono\":\"^4.12.34\",\"@hono/node-server\":\"^2.0.5\",\"fast-uri\":\"^3.1.5\",\"body-parser\":\"^2.3.0\",\"@yarnpkg/parsers\":{\"js-yaml\":\"^4.2.0\"},\"jsdom\":{\"undici\":\"^7.29.0\"},\"node-gyp\":{\"undici\":\"^6.28.0\"},\"concurrently\":{\"shell-quote\":\"^1.9.0\"},\"adm-zip\":\"^0.6.0\",\"promptfoo\":{\"js-yaml\":\"^5.2.2\",\"@apidevtools/json-schema-ref-parser\":{\"js-yaml\":\"^4.2.0\"},\"undici\":\"^7.29.0\"},\"socket.io-parser\":\"^4.2.7\",\"tar\":\"^7.5.21\"}}");
}),
"[project]/scripts/dev/sync-env.mjs [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getEnvSyncPlan",
    ()=>getEnvSyncPlan,
    "parseEnvFile",
    ()=>parseEnvFile,
    "syncEnv",
    ()=>syncEnv
]);
/**
 * OmniRoute — Environment Sync
 *
 * Ensures .env exists and contains the selected keys from .env.example.
 * Runs on installs and can be executed manually via `npm run env:sync`.
 *
 * Rules:
 *   - Never overwrites existing values in .env
 *   - Auto-generates cryptographic secrets if blank in .env.example
 *   - Copies default values from .env.example for new keys
 *   - Skips commented lines from .env.example
 */ var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:fs [external] (node:fs, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$module__$5b$external$5d$__$28$node$3a$module$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:module [external] (node:module, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:path [external] (node:path, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$os__$5b$external$5d$__$28$node$3a$os$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:os [external] (node:os, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$url__$5b$external$5d$__$28$node$3a$url$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:url [external] (node:url, cjs)");
const __TURBOPACK__import$2e$meta__ = {
    get url () {
        return `file://${__turbopack_context__.P("scripts/dev/sync-env.mjs")}`;
    },
    get turbopackHot () {
        return __turbopack_context__.m.hot;
    }
};
;
;
;
;
;
;
/**
 * Resolve the repository/package root that holds `.env` / `.env.example`.
 *
 * When this module is statically bundled into a Next.js standalone route,
 * `import.meta.url` is frozen to the build-machine path
 * (`file:///home/runner/.../sync-env.mjs`) and `fileURLToPath` can throw at
 * runtime. Callers (e.g. the env-repair route) pass an explicit `rootDir`;
 * when they don't, fall back to `process.cwd()` instead of crashing. (#5006)
 */ function resolveRootDir(rootDir) {
    if (rootDir) return rootDir;
    try {
        return (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["dirname"])((0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["dirname"])((0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$url__$5b$external$5d$__$28$node$3a$url$2c$__cjs$29$__["fileURLToPath"])(__TURBOPACK__import$2e$meta__.url)));
    } catch  {
        return process.cwd();
    }
}
const CRYPTO_SECRETS = {
    JWT_SECRET: ()=>(0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomBytes"])(64).toString("hex"),
    API_KEY_SECRET: ()=>(0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomBytes"])(32).toString("hex"),
    // STORAGE_ENCRYPTION_KEY: Generated at server startup instead of postinstall.
    // Generated in bin/omniroute.mjs:ensureStorageEncryptionKey() and persisted to
    // ~/.omniroute/.env to survive across upgrades. This prevents credential loss
    // when upgrading OmniRoute (issue #1622).
    MACHINE_ID_SALT: ()=>`omniroute-${(0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomBytes"])(8).toString("hex")}`
};
/**
 * Keys that MUST NOT be regenerated when existing encrypted data exists in the DB.
 * Generating a new key would make all previously-encrypted credentials unrecoverable.
 *
 * Note: STORAGE_ENCRYPTION_KEY is no longer auto-generated in postinstall.
 * It's generated at server startup in bin/omniroute.mjs and persisted to
 * ~/.omniroute/.env to survive across upgrades.
 * @see https://github.com/diegosouzapw/OmniRoute/issues/1622
 */ const ENCRYPTION_BOUND_KEYS = new Set([]);
// ── Resolve DATA_DIR (mirrors bootstrap-env.mjs / dataPaths.ts) ─────────────
function resolveDataDir(env = process.env) {
    const configured = env.DATA_DIR?.trim();
    if (configured) return (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["resolve"])(configured);
    if ("TURBOPACK compile-time truthy", 1) {
        const appData = env.APPDATA || (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["join"])((0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$os__$5b$external$5d$__$28$node$3a$os$2c$__cjs$29$__["homedir"])(), "AppData", "Roaming");
        return (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["join"])(appData, "omniroute");
    }
    //TURBOPACK unreachable
    ;
    const xdg = undefined;
}
/**
 * Check whether the SQLite database already contains credentials encrypted
 * under a previous STORAGE_ENCRYPTION_KEY. If so, generating a new key would
 * make them permanently unrecoverable (AES-GCM auth-tag mismatch).
 */ function hasEncryptedCredentials(dataDir) {
    const dbPath = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["join"])(dataDir, "storage.sqlite");
    if (!(0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["existsSync"])(dbPath)) return false;
    try {
        // Resolve `require` lazily here (not at module top-level): when this file is
        // bundled into a standalone route, a top-level `createRequire(import.meta.url)`
        // throws during module evaluation and 500s the whole route (#5006). Inside this
        // guarded block, any failure simply returns false (the safe default below).
        const require = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$module__$5b$external$5d$__$28$node$3a$module$2c$__cjs$29$__["createRequire"])(__TURBOPACK__import$2e$meta__.url);
        const Database = __turbopack_context__.r("[externals]/better-sqlite3 [external] (better-sqlite3, cjs, [project]/node_modules/better-sqlite3)");
        const db = new Database(dbPath, {
            readonly: true,
            fileMustExist: true
        });
        try {
            const row = db.prepare(`SELECT 1
             FROM provider_connections
            WHERE access_token LIKE 'enc:v1:%'
               OR refresh_token LIKE 'enc:v1:%'
               OR api_key LIKE 'enc:v1:%'
               OR id_token LIKE 'enc:v1:%'
            LIMIT 1`).get();
            return !!row;
        } finally{
            db.close();
        }
    } catch  {
        // If we can't open the DB (e.g. missing better-sqlite3 during install),
        // err on the side of caution: don't block secret generation.
        return false;
    }
}
function parseEnvFile(filePath) {
    if (!(0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["existsSync"])(filePath)) return new Map();
    const content = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["readFileSync"])(filePath, "utf8");
    const entries = new Map();
    for (const line of content.split(/\r?\n/)){
        const parsed = parseEnvEntry(line);
        if (!parsed) continue;
        const [key, value] = parsed;
        entries.set(key, value);
    }
    return entries;
}
function parseEnvEntry(line) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return null;
    const eqIndex = trimmed.indexOf("=");
    if (eqIndex < 1) return null;
    const key = trimmed.slice(0, eqIndex).trim();
    const value = unquoteEnvValue(trimmed.slice(eqIndex + 1).trim());
    return [
        key,
        value
    ];
}
function unquoteEnvValue(value) {
    if (value.length < 2) return value;
    const quote = value[0];
    if (quote !== '"' && quote !== "'" || value[value.length - 1] !== quote) return value;
    return value.slice(1, -1);
}
function parseExampleEntries(content, scope = "full") {
    const entries = new Map();
    const lines = content.split(/\r?\n/);
    if (scope === "oauth") {
        let inOauthSection = false;
        for (const line of lines){
            const trimmed = line.trim();
            if (/OAUTH PROVIDER CREDENTIALS/i.test(trimmed)) {
                inOauthSection = true;
                continue;
            }
            if (!inOauthSection) continue;
            if (/Provider User-Agent Overrides/i.test(trimmed)) break;
            const parsed = parseEnvEntry(line);
            if (!parsed) continue;
            const [key, value] = parsed;
            entries.set(key, value);
        }
        return entries;
    }
    for (const line of lines){
        const parsed = parseEnvEntry(line);
        if (!parsed) continue;
        const [key, value] = parsed;
        entries.set(key, value);
    }
    return entries;
}
function getEnvSyncPlan({ rootDir, scope = "full" } = {}) {
    const root = resolveRootDir(rootDir);
    const envExamplePath = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["join"])(root, ".env.example");
    const envPath = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["join"])(root, ".env");
    if (!(0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["existsSync"])(envExamplePath)) {
        return {
            available: false,
            created: false,
            added: 0,
            missingEntries: []
        };
    }
    const exampleEntries = parseExampleEntries((0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["readFileSync"])(envExamplePath, "utf8"), scope);
    const currentEntries = parseEnvFile(envPath);
    const missingEntries = [];
    // Check once whether encrypted data exists — avoids repeated DB opens
    let _encryptedDataExists;
    function encryptedDataExists() {
        if (_encryptedDataExists === undefined) {
            try {
                _encryptedDataExists = hasEncryptedCredentials(resolveDataDir());
            } catch  {
                _encryptedDataExists = false;
            }
        }
        return _encryptedDataExists;
    }
    for (const [key, defaultValue] of exampleEntries){
        if (currentEntries.has(key)) continue;
        if (CRYPTO_SECRETS[key] && !defaultValue) {
            // Guard: never generate a new encryption key if the DB already has
            // credentials encrypted under the previous key (#1622)
            if (ENCRYPTION_BOUND_KEYS.has(key) && encryptedDataExists()) {
                missingEntries.push({
                    key,
                    value: "",
                    generated: false,
                    blocked: true
                });
                continue;
            }
            missingEntries.push({
                key,
                value: CRYPTO_SECRETS[key](),
                generated: true
            });
            continue;
        }
        missingEntries.push({
            key,
            value: defaultValue,
            generated: false
        });
    }
    return {
        available: true,
        created: !(0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["existsSync"])(envPath),
        added: missingEntries.length,
        missingEntries
    };
}
function replaceBlankSecret(content, key, value) {
    const pattern = new RegExp(`^${key}=\\s*$`, "m");
    return pattern.test(content) ? content.replace(pattern, `${key}=${value}`) : content;
}
function syncEnv({ rootDir, quiet = false, scope = "full" } = {}) {
    const log = quiet ? ()=>{} : (message)=>process.stderr.write(`[sync-env] ${message}\n`);
    const root = resolveRootDir(rootDir);
    const envExamplePath = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["join"])(root, ".env.example");
    const envPath = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["join"])(root, ".env");
    if (!(0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["existsSync"])(envExamplePath)) {
        log("⚠️  .env.example not found — skipping sync");
        return {
            created: false,
            added: 0
        };
    }
    const exampleEntries = parseExampleEntries((0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["readFileSync"])(envExamplePath, "utf8"), scope);
    if (!(0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["existsSync"])(envPath)) {
        if (scope === "full") {
            (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["copyFileSync"])(envExamplePath, envPath);
            let content = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["readFileSync"])(envPath, "utf8");
            let generated = 0;
            // Check once whether encrypted data exists — avoids repeated DB opens
            let dbHasEncrypted;
            try {
                dbHasEncrypted = hasEncryptedCredentials(resolveDataDir());
            } catch  {
                dbHasEncrypted = false;
            }
            for (const [key, generator] of Object.entries(CRYPTO_SECRETS)){
                // Guard: never generate a new encryption key if the DB already has
                // credentials encrypted under the previous key (#1622)
                if (ENCRYPTION_BOUND_KEYS.has(key) && dbHasEncrypted) {
                    log(`⚠️  ${key} NOT generated — encrypted credentials exist in DB. ` + `Restore your previous key via ~/.omniroute/server.env, ~/.omniroute/.env, ` + `or the STORAGE_ENCRYPTION_KEY environment variable.`);
                    continue;
                }
                const nextContent = replaceBlankSecret(content, key, generator());
                if (nextContent !== content) {
                    content = nextContent;
                    generated++;
                    log(`✨ ${key} auto-generated`);
                }
            }
            (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["writeFileSync"])(envPath, content, "utf8");
            log(`✨ Created .env from .env.example (${exampleEntries.size} keys, ${generated} secrets generated)`);
            return {
                created: true,
                added: exampleEntries.size
            };
        }
        const { missingEntries } = getEnvSyncPlan({
            rootDir: root,
            scope
        });
        const content = [
            "# ── Auto-added by sync-env (oauth defaults) ──",
            ...missingEntries.map((entry)=>`${entry.key}=${entry.value}`),
            ""
        ].join("\n");
        (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["writeFileSync"])(envPath, content, "utf8");
        log(`✨ Created .env with oauth defaults (${missingEntries.length} keys)`);
        return {
            created: true,
            added: missingEntries.length
        };
    }
    const { missingEntries } = getEnvSyncPlan({
        rootDir: root,
        scope
    });
    if (missingEntries.length === 0) {
        log("✅ .env is up to date (0 keys added)");
        return {
            created: false,
            added: 0
        };
    }
    const appendLines = [
        "",
        `# ── Auto-added by sync-env (${new Date().toISOString().slice(0, 10)}) ──`
    ];
    for (const entry of missingEntries){
        if (entry.blocked) {
            log(`⚠️  ${entry.key} NOT generated — encrypted credentials exist in DB. ` + `Restore your previous key via ~/.omniroute/server.env, ~/.omniroute/.env, ` + `or the STORAGE_ENCRYPTION_KEY environment variable.`);
            continue;
        }
        appendLines.push(`${entry.key}=${entry.value}`);
        log(`${entry.generated ? "✨" : "📦"} ${entry.key}${entry.generated ? " (auto-generated)" : ""}`);
    }
    appendLines.push("");
    const currentContent = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["readFileSync"])(envPath, "utf8");
    (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["writeFileSync"])(envPath, `${currentContent.trimEnd()}\n${appendLines.join("\n")}`, "utf8");
    log(`📦 Synced .env — added ${missingEntries.length} missing keys`);
    return {
        created: false,
        added: missingEntries.length
    };
}
if (process.argv[1]?.endsWith("sync-env.mjs")) {
    syncEnv({
        scope: process.argv.includes("--oauth-only") ? "oauth" : "full"
    });
}
}),
];

//# sourceMappingURL=_1wz8sjc._.js.map