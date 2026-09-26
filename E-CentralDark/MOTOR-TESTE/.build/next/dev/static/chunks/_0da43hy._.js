(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/package.json.[json].mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
"use turbopack no side effects";
const __TURBOPACK__default__export__ = JSON.parse("{\"name\":\"omniroute\",\"version\":\"3.8.50\",\"description\":\"Unified AI router with 290 providers, RTK+Caveman compression, auto fallback, MCP/A2A, desktop, PWA, and OpenAI-compatible APIs.\",\"type\":\"module\",\"bin\":{\"omniroute\":\"bin/omniroute.mjs\",\"omniroute-reset-password\":\"bin/reset-password.mjs\"},\"files\":[\"bin/\",\"dist/\",\"@omniroute/\",\"open-sse/\",\"src/domain/\",\"src/lib/\",\"src/models/\",\"src/mitm/\",\"src/server/\",\"src/shared/\",\"src/sse/\",\"src/types/\",\".env.example\",\"scripts/build/postinstall.mjs\",\"scripts/build/fixTlsClientNodeBinary.mjs\",\"scripts/build/fixPlaywrightAndroid.mjs\",\"bin/cli/runtime/\",\"scripts/postinstall.mjs\",\"scripts/build/postinstallSupport.mjs\",\"scripts/build/runtime-env.mjs\",\"scripts/build/colocateOptionals.mjs\",\"scripts/build/sync-env.mjs\",\"scripts/dev/responses-ws-proxy.mjs\",\"scripts/dev/tls-options.mjs\",\"scripts/check/check-supported-node-runtime.ts\",\"scripts/dev/sync-env.mjs\",\"scripts/build/native-binary-compat.mjs\",\"scripts/build/build-next-isolated.mjs\",\"scripts/build/runtime-env.mjs\",\"README.md\",\"LICENSE\",\"!**/node_modules/**\",\"!**/__tests__/**\",\"!**/*.test.ts\",\"!**/*.test.tsx\",\"!**/*.test.js\",\"!**/*.test.mjs\",\"!**/*.spec.ts\",\"!**/*.spec.tsx\"],\"workspaces\":[\"open-sse\"],\"engines\":{\"node\":\">=22.22.2 <23 || >=24.0.0 <27\"},\"keywords\":[\"ai\",\"router\",\"proxy\",\"openai\",\"claude\",\"anthropic\",\"gemini\",\"fallback\",\"cursor\",\"cline\",\"codex\",\"llm\",\"auto-fallback\"],\"license\":\"MIT\",\"author\":\"diegosouzapw\",\"repository\":{\"type\":\"git\",\"url\":\"https://github.com/diegosouzapw/OmniRoute\"},\"homepage\":\"https://omniroute.online\",\"scripts\":{\"dev\":\"node --max-old-space-size=8192 scripts/dev/run-next.mjs dev\",\"prebuild:docs\":\"node scripts/docs/gen-openapi-module.mjs\",\"gen:provider-reference\":\"bun scripts/docs/gen-provider-reference.ts\",\"bench:compression\":\"bun scripts/compression/benchmark.ts\",\"bench:heap-body\":\"node --expose-gc --import tsx/esm scripts/perf/request-body-heap.ts\",\"eval:compression\":\"node --import tsx scripts/compression-eval/index.ts\",\"eval:router\":\"node --import tsx scripts/router-eval/index.ts\",\"eval:router:compare\":\"node --import tsx scripts/router-eval/compare.ts\",\"eval:router:patch-compare\":\"node --import tsx scripts/router-eval/patch-compare.ts\",\"eval:router:search\":\"node --import tsx scripts/router-eval/search.ts\",\"eval:router:trends\":\"node --import tsx scripts/router-eval/trends.ts\",\"release:sync-changelog-i18n\":\"node scripts/release/sync-changelog-i18n.mjs\",\"build\":\"node scripts/build/build-next-isolated.mjs\",\"build:secure\":\"OMNIROUTE_BUILD_PROFILE=minimal node scripts/build/build-next-isolated.mjs\",\"build:backend\":\"cross-env OMNIROUTE_BUILD_BACKEND_ONLY=1 node scripts/build/build-next-isolated.mjs\",\"build:cli\":\"node --import tsx scripts/build/prepublish.ts\",\"build:release\":\"rm -rf .build dist && OMNIROUTE_BUILD_SHA=$(git rev-parse --short HEAD) npm run build && npm run build:cli && node scripts/build/write-build-sha.mjs\",\"build:native:tproxy\":\"cd src/mitm/tproxy/native && npx --yes node-gyp rebuild\",\"start\":\"node scripts/dev/run-next.mjs start\",\"homolog\":\"node scripts/homolog/run.mjs\",\"lint\":\"eslint . --cache --cache-location .eslintcache --suppressions-location config/quality/eslint-suppressions.json\",\"lint:json\":\"node scripts/quality/run-eslint-json.mjs\",\"lint:md\":\"npx --yes markdownlint-cli2 \\\"docs/**/*.md\\\" \\\"*.md\\\" \\\"!docs/i18n\\\" \\\"!docs/research\\\"\",\"lint:prose\":\"vale docs\",\"electron:dev\":\"concurrently \\\"npm run dev\\\" \\\"wait-on http://localhost:20128 && cd electron && npm run dev\\\"\",\"electron:build\":\"npm run build && cd electron && npm run build\",\"electron:build:win\":\"npm run build && cd electron && npm run build:win\",\"electron:build:mac\":\"npm run build && cd electron && npm run build:mac\",\"electron:build:linux\":\"npm run build && cd electron && npm run build:linux\",\"electron:smoke:packaged\":\"node scripts/dev/smoke-electron-packaged.mjs\",\"test\":\"cross-env DISABLE_SQLITE_AUTO_BACKUP=true node --max-old-space-size=8192 --import tsx/esm --import ./open-sse/utils/setupPolyfill.ts --import ./tests/_setup/isolateDataDir.ts --test --test-concurrency=20 tests/unit/*.test.ts \\\"tests/unit/{api,auth,authz,build,cli,cli-helper,combo,compression,correctness,cors,db,db-adapters,docs,gamification,guardrails,lib,mcp,memory,runtime,security,services,settings,shared,ui,usage}/**/*.test.ts\\\" \\\"tests/unit/**/*.test.mjs\\\" && cross-env DISABLE_SQLITE_AUTO_BACKUP=true node --max-old-space-size=8192 --import tsx --import ./open-sse/utils/setupPolyfill.ts --import ./tests/_setup/isolateDataDir.ts --test --test-concurrency=20 \\\"tests/unit/dashboard/**/*.test.ts\\\"\",\"test:unit\":\"cross-env DISABLE_SQLITE_AUTO_BACKUP=true node --max-old-space-size=8192 --import tsx/esm --import ./open-sse/utils/setupPolyfill.ts --import ./tests/_setup/isolateDataDir.ts --test --test-force-exit --test-concurrency=20 tests/unit/*.test.ts \\\"tests/unit/{api,auth,authz,build,cli,cli-helper,combo,compression,correctness,cors,db,db-adapters,docs,gamification,guardrails,lib,mcp,memory,runtime,security,services,settings,shared,ui,usage}/**/*.test.ts\\\" \\\"tests/unit/**/*.test.mjs\\\" && cross-env DISABLE_SQLITE_AUTO_BACKUP=true node --max-old-space-size=8192 --import tsx --import ./open-sse/utils/setupPolyfill.ts --import ./tests/_setup/isolateDataDir.ts --test --test-force-exit --test-concurrency=20 \\\"tests/unit/dashboard/**/*.test.ts\\\" && npm run test:unit:serial\",\"test:unit:ci\":\"cross-env DISABLE_SQLITE_AUTO_BACKUP=true node --max-old-space-size=8192 --import tsx/esm --import ./open-sse/utils/setupPolyfill.ts --import ./tests/_setup/isolateDataDir.ts --test --test-force-exit --test-concurrency=4 tests/unit/*.test.ts \\\"tests/unit/{api,auth,authz,build,cli,cli-helper,combo,compression,correctness,cors,db,db-adapters,docs,gamification,guardrails,lib,mcp,memory,runtime,security,services,settings,shared,ui,usage}/**/*.test.ts\\\" \\\"tests/unit/**/*.test.mjs\\\" && cross-env DISABLE_SQLITE_AUTO_BACKUP=true node --max-old-space-size=8192 --import tsx --import ./open-sse/utils/setupPolyfill.ts --import ./tests/_setup/isolateDataDir.ts --test --test-force-exit --test-concurrency=4 \\\"tests/unit/dashboard/**/*.test.ts\\\" && npm run test:unit:serial\",\"test:unit:ci:shard\":\"cross-env DISABLE_SQLITE_AUTO_BACKUP=true node --max-old-space-size=4096 --import tsx/esm --import ./open-sse/utils/setupPolyfill.ts --import ./tests/_setup/isolateDataDir.ts --test --test-force-exit --test-concurrency=4 --test-shard=$TEST_SHARD tests/unit/*.test.ts \\\"tests/unit/{api,auth,authz,build,cli,cli-helper,combo,compression,correctness,cors,db,db-adapters,docs,gamification,guardrails,lib,mcp,memory,runtime,security,services,settings,shared,ui,usage}/**/*.test.ts\\\" \\\"tests/unit/**/*.test.mjs\\\" && cross-env DISABLE_SQLITE_AUTO_BACKUP=true node --max-old-space-size=4096 --import tsx --import ./open-sse/utils/setupPolyfill.ts --import ./tests/_setup/isolateDataDir.ts --test --test-force-exit --test-concurrency=4 --test-shard=$TEST_SHARD \\\"tests/unit/dashboard/**/*.test.ts\\\" && cross-env DISABLE_SQLITE_AUTO_BACKUP=true node --max-old-space-size=4096 --import tsx/esm --import ./open-sse/utils/setupPolyfill.ts --import ./tests/_setup/isolateDataDir.ts --test --test-force-exit --test-concurrency=1 --test-shard=$TEST_SHARD \\\"tests/unit/serial/**/*.test.ts\\\"\",\"test:unit:fast\":\"cross-env DISABLE_SQLITE_AUTO_BACKUP=true node --max-old-space-size=8192 --import tsx/esm --import ./open-sse/utils/setupPolyfill.ts --import ./tests/_setup/isolateDataDir.ts --test --test-force-exit --test-isolation=none tests/unit/*.test.ts \\\"tests/unit/{api,auth,authz,build,cli,cli-helper,combo,compression,correctness,cors,db,db-adapters,docs,gamification,guardrails,lib,mcp,memory,runtime,security,services,settings,shared,ui,usage}/**/*.test.ts\\\" \\\"tests/unit/**/*.test.mjs\\\" && cross-env DISABLE_SQLITE_AUTO_BACKUP=true node --max-old-space-size=8192 --import tsx --import ./open-sse/utils/setupPolyfill.ts --import ./tests/_setup/isolateDataDir.ts --test --test-force-exit --test-isolation=none \\\"tests/unit/dashboard/**/*.test.ts\\\" && npm run test:unit:serial\",\"test:scoped\":\"bash scripts/quality/test-scoped.sh\",\"test:scoped:staged\":\"bash scripts/quality/test-scoped.sh --staged\",\"test:unit:shard\":\"concurrently --kill-others-on-fail -n s1,s2 \\\"npm:test:unit:shard:1\\\" \\\"npm:test:unit:shard:2\\\"\",\"test:unit:shard:1\":\"cross-env DISABLE_SQLITE_AUTO_BACKUP=true node --max-old-space-size=8192 --import tsx/esm --import ./open-sse/utils/setupPolyfill.ts --import ./tests/_setup/isolateDataDir.ts --test --test-force-exit --test-concurrency=10 --test-shard=1/2 tests/unit/*.test.ts \\\"tests/unit/{api,auth,authz,build,cli,cli-helper,combo,compression,correctness,cors,db,db-adapters,docs,gamification,guardrails,lib,mcp,memory,runtime,security,services,settings,shared,ui,usage}/**/*.test.ts\\\" \\\"tests/unit/**/*.test.mjs\\\" && cross-env DISABLE_SQLITE_AUTO_BACKUP=true node --max-old-space-size=8192 --import tsx --import ./open-sse/utils/setupPolyfill.ts --import ./tests/_setup/isolateDataDir.ts --test --test-force-exit --test-concurrency=10 --test-shard=1/2 \\\"tests/unit/dashboard/**/*.test.ts\\\" && cross-env DISABLE_SQLITE_AUTO_BACKUP=true node --max-old-space-size=8192 --import tsx/esm --import ./open-sse/utils/setupPolyfill.ts --import ./tests/_setup/isolateDataDir.ts --test --test-force-exit --test-concurrency=1 --test-shard=1/2 \\\"tests/unit/serial/**/*.test.ts\\\"\",\"test:unit:shard:2\":\"cross-env DISABLE_SQLITE_AUTO_BACKUP=true node --max-old-space-size=8192 --import tsx/esm --import ./open-sse/utils/setupPolyfill.ts --import ./tests/_setup/isolateDataDir.ts --test --test-force-exit --test-concurrency=10 --test-shard=2/2 tests/unit/*.test.ts \\\"tests/unit/{api,auth,authz,build,cli,cli-helper,combo,compression,correctness,cors,db,db-adapters,docs,gamification,guardrails,lib,mcp,memory,runtime,security,services,settings,shared,ui,usage}/**/*.test.ts\\\" \\\"tests/unit/**/*.test.mjs\\\" && cross-env DISABLE_SQLITE_AUTO_BACKUP=true node --max-old-space-size=8192 --import tsx --import ./open-sse/utils/setupPolyfill.ts --import ./tests/_setup/isolateDataDir.ts --test --test-force-exit --test-concurrency=10 --test-shard=2/2 \\\"tests/unit/dashboard/**/*.test.ts\\\" && cross-env DISABLE_SQLITE_AUTO_BACKUP=true node --max-old-space-size=8192 --import tsx/esm --import ./open-sse/utils/setupPolyfill.ts --import ./tests/_setup/isolateDataDir.ts --test --test-force-exit --test-concurrency=1 --test-shard=2/2 \\\"tests/unit/serial/**/*.test.ts\\\"\",\"test:bun:db\":\"bun test tests/unit/db-adapters/bunSqliteAdapter.test.ts tests/unit/db-adapters/driverFactory.test.ts tests/unit/db-adapters/cliSqlite.test.mjs\",\"test:plan3\":\"cross-env DISABLE_SQLITE_AUTO_BACKUP=true node --import tsx/esm --import ./open-sse/utils/setupPolyfill.ts --import ./tests/_setup/isolateDataDir.ts --test tests/unit/plan3-p0.test.ts\",\"test:fixes\":\"cross-env DISABLE_SQLITE_AUTO_BACKUP=true node --import tsx/esm --import ./open-sse/utils/setupPolyfill.ts --import ./tests/_setup/isolateDataDir.ts --test tests/unit/fixes-p1.test.ts\",\"test:security\":\"cross-env DISABLE_SQLITE_AUTO_BACKUP=true node --import tsx/esm --import ./open-sse/utils/setupPolyfill.ts --import ./tests/_setup/isolateDataDir.ts --test tests/unit/security-fase01.test.ts\",\"test:property\":\"cross-env DISABLE_SQLITE_AUTO_BACKUP=true node --import tsx/esm --test --test-force-exit tests/unit/correctness/*.property.test.ts\",\"check:cycles\":\"node scripts/check/check-cycles.mjs\",\"check:route-validation:t06\":\"node scripts/check/check-route-validation.mjs\",\"check:any-budget:t11\":\"node scripts/check/check-t11-any-budget.mjs\",\"check:docs-sync\":\"node scripts/check/check-docs-sync.mjs\",\"check:env-doc-sync\":\"node scripts/check/check-env-doc-sync.mjs\",\"check:docs-counts\":\"node scripts/check/check-docs-counts-sync.mjs\",\"check:deprecated-versions\":\"node scripts/check/check-deprecated-versions.mjs\",\"check:compression-budget\":\"bun scripts/check/check-compression-budget.ts\",\"check:router-eval\":\"node --import tsx scripts/check/check-router-eval-regression.ts\",\"check:doc-links\":\"node scripts/check/check-doc-links.mjs\",\"check:fabricated-docs\":\"node scripts/check/check-fabricated-docs.mjs --strict\",\"check:docs-all\":\"npm run check:docs-sync && npm run check:docs-counts && npm run check:env-doc-sync && npm run check:deprecated-versions && npm run check:doc-links && npm run check:fabricated-docs\",\"docs:render-diagrams\":\"node scripts/docs/render-diagrams.mjs\",\"i18n:run\":\"node scripts/i18n/run-translation.mjs\",\"i18n:run:dry\":\"node scripts/i18n/run-translation.mjs --dry-run\",\"i18n:check\":\"node scripts/i18n/check-translation-drift.mjs\",\"i18n:sync-ui\":\"node scripts/i18n/sync-ui-keys.mjs\",\"i18n:sync-ui:dry\":\"node scripts/i18n/sync-ui-keys.mjs --dry-run\",\"i18n:check-ui-coverage\":\"node scripts/i18n/check-ui-keys-coverage.mjs\",\"i18n:check-value-drift\":\"node scripts/i18n/check-ui-value-drift.mjs\",\"i18n:check-value-drift:warn\":\"node scripts/i18n/check-ui-value-drift.mjs --warn\",\"i18n:check-glossary\":\"node scripts/i18n/check-glossary-consistency.mjs\",\"check:node-runtime\":\"node --import tsx scripts/check/check-supported-node-runtime.ts\",\"check:pack-artifact\":\"node --import tsx scripts/build/validate-pack-artifact.ts\",\"check:pack-boot\":\"node scripts/check/check-pack-boot.mjs\",\"check:install-upgrade\":\"node scripts/check/check-install-upgrade.mjs\",\"check:pack-policy\":\"node --import tsx scripts/build/validate-pack-artifact.ts --policy-only\",\"check:cli-i18n\":\"node scripts/check/check-cli-i18n.mjs\",\"check:openapi-coverage\":\"node scripts/check/check-openapi-coverage.mjs\",\"check:openapi-security-tiers\":\"node scripts/check/check-openapi-security-tiers.mjs\",\"check:provider-consistency\":\"bun scripts/check/check-provider-consistency.ts\",\"check:provider-assets\":\"node scripts/check/check-provider-assets.mjs\",\"check:nvidia-catalog-drift\":\"node --import tsx/esm scripts/check/check-nvidia-catalog-drift.ts\",\"check:fetch-targets\":\"node scripts/check/check-fetch-targets.mjs\",\"check:openapi-routes\":\"node scripts/check/check-openapi-routes.mjs\",\"check:api-docs-refs\":\"node scripts/check/check-api-docs-refs.mjs\",\"check:openapi-breaking\":\"node scripts/check/check-openapi-breaking.mjs\",\"check:deps\":\"node scripts/check/check-deps.mjs\",\"check:file-size\":\"node scripts/check/check-file-size.mjs\",\"check:duplication\":\"node scripts/check/check-duplication.mjs\",\"check:tracked-artifacts\":\"node scripts/check/check-tracked-artifacts.mjs\",\"check:test-masking\":\"node scripts/check/check-test-masking.mjs\",\"check:test-runner-api\":\"node scripts/check/check-test-runner-api.mjs\",\"check:changelog-integrity\":\"node scripts/check/check-changelog-integrity.mjs\",\"sweep:stale-fragments\":\"node scripts/release/sweep-stale-fragments.mjs\",\"changelog:aggregate\":\"node scripts/release/aggregate-changelog.mjs\",\"check:agent-skills-sync\":\"node --import tsx/esm scripts/skills/generate-agent-skills.mjs\",\"check:build-scope\":\"node scripts/check/check-build-scope.mjs\",\"check:error-helper\":\"node scripts/check/check-error-helper.mjs\",\"check:migration-numbering\":\"node scripts/check/check-migration-numbering.mjs\",\"check:public-creds\":\"node scripts/check/check-public-creds.mjs\",\"check:db-rules\":\"node scripts/check/check-db-rules.mjs\",\"check:docs-symbols\":\"node scripts/check/check-docs-symbols.mjs\",\"check:known-symbols\":\"bun scripts/check/check-known-symbols.ts\",\"check:route-guard-membership\":\"node --import tsx scripts/check/check-route-guard-membership.ts\",\"check:test-discovery\":\"node scripts/check/check-test-discovery.mjs\",\"check:mutation-test-coverage\":\"node scripts/check/check-mutation-test-coverage.mjs --strict\",\"check:complexity\":\"node scripts/check/check-complexity.mjs\",\"check:dead-code\":\"node scripts/check/check-dead-code.mjs\",\"check:cognitive-complexity\":\"node scripts/check/check-cognitive-complexity.mjs\",\"check:complexity-ratchets\":\"node scripts/check/check-complexity-ratchets.mjs\",\"check:release-green\":\"node scripts/quality/validate-release-green.mjs\",\"check:ratchet-bank\":\"node scripts/quality/verify-ratchet-bank.mjs\",\"check:type-coverage\":\"node scripts/check/check-type-coverage.mjs\",\"check:lockfile\":\"node scripts/check/check-lockfile.mjs\",\"check:bundle-size\":\"node scripts/check/check-bundle-size.mjs\",\"check:circular-deps\":\"node scripts/check/check-circular-deps.mjs\",\"check:mutation-ratchet\":\"node scripts/check/check-mutation-ratchet.mjs\",\"check:rtl-ratchet\":\"node scripts/check/check-rtl-ratchet.mjs\",\"check:licenses\":\"node scripts/check/check-licenses.mjs\",\"check:pr-evidence\":\"node scripts/check/check-pr-evidence.mjs\",\"check:vuln-ratchet\":\"node scripts/check/check-vuln-ratchet.mjs\",\"check:codeql-ratchet\":\"node scripts/check/check-codeql-ratchet.mjs\",\"check:secrets\":\"node scripts/check/check-secrets.mjs\",\"check:workflows\":\"node scripts/check/check-workflows.mjs\",\"quality:collect\":\"node scripts/quality/collect-metrics.mjs\",\"quality:ratchet\":\"node scripts/quality/check-quality-ratchet.mjs\",\"quality:gate\":\"npm run quality:collect && npm run quality:ratchet -- --allow-missing\",\"quality:scan\":\"node scripts/quality/run-all-gates.mjs\",\"quality:scan:fast\":\"node scripts/quality/run-all-gates.mjs --fast\",\"audit:deps\":\"npm audit --audit-level=critical && (npm audit --audit-level=high || echo '::warning::high-severity advisories present (non-blocking)') && npm run audit:electron\",\"audit:electron\":\"npm --prefix electron audit --audit-level=critical && (npm --prefix electron audit --audit-level=high || echo '::warning::electron high-severity advisories present (non-blocking)')\",\"typecheck:core\":\"tsc --pretty false -p tsconfig.typecheck-core.json\",\"typecheck:noimplicit:core\":\"tsc --pretty false -p tsconfig.typecheck-noimplicit-core.json\",\"check:dashboard-typecheck\":\"node scripts/check/check-dashboard-typecheck.mjs\",\"backfill-aggregation\":\"node --import tsx src/scripts/backfillAggregation.ts\",\"env:sync\":\"node scripts/dev/sync-env.mjs\",\"test:integration\":\"cross-env DISABLE_SQLITE_AUTO_BACKUP=true node --import tsx/esm --import ./open-sse/utils/setupPolyfill.ts --import ./tests/_setup/isolateDataDir.ts --test --test-force-exit --test-concurrency=1 tests/integration/*.test.ts \\\"tests/integration/combo-matrix/*.test.ts\\\"\",\"test:integration:ci\":\"cross-env DISABLE_SQLITE_AUTO_BACKUP=true node --import tsx/esm --import ./open-sse/utils/setupPolyfill.ts --import ./tests/_setup/isolateDataDir.ts --test --test-force-exit --test-concurrency=1 --test-shard=$TEST_SHARD tests/integration/*.test.ts \\\"tests/integration/combo-matrix/*.test.ts\\\"\",\"test:combo:matrix\":\"cross-env DISABLE_SQLITE_AUTO_BACKUP=true node --import tsx/esm --import ./open-sse/utils/setupPolyfill.ts --import ./tests/_setup/isolateDataDir.ts --test --test-force-exit --test-concurrency=1 \\\"tests/integration/combo-matrix/*.test.ts\\\"\",\"test:combo:live\":\"cross-env RUN_COMBO_LIVE=1 DISABLE_SQLITE_AUTO_BACKUP=true node --import tsx/esm --import ./open-sse/utils/setupPolyfill.ts --import ./tests/_setup/isolateDataDir.ts --test --test-force-exit --test-concurrency=1 \\\"tests/integration/combo-live/*.live.test.ts\\\"\",\"test:combo:live:vps\":\"node scripts/test/combo-live-vps.mjs\",\"test:combo:live:vps:failover\":\"node scripts/test/combo-live-vps.mjs --failover\",\"test:boundary:live\":\"cross-env RUN_BOUNDARY_LIVE=1 DISABLE_SQLITE_AUTO_BACKUP=true node --import tsx/esm --import ./open-sse/utils/setupPolyfill.ts --import ./tests/_setup/isolateDataDir.ts --test --test-force-exit --test-concurrency=1 \\\"tests/boundary/*.live.test.ts\\\"\",\"test:heap\":\"node --expose-gc --import tsx/esm --import ./open-sse/utils/setupPolyfill.ts --import ./tests/_setup/isolateDataDir.ts --test --test-force-exit tests/integration/heap-growth.test.ts\",\"test:chaos\":\"cross-env RUN_CHAOS_INT=1 node --import tsx/esm --import ./open-sse/utils/setupPolyfill.ts --import ./tests/_setup/isolateDataDir.ts --test --test-force-exit --test-concurrency=1 tests/integration/resilience-chaos.test.ts\",\"test:e2e\":\"node scripts/dev/run-playwright-tests.mjs test tests/e2e/*.spec.ts\",\"test:protocols:e2e\":\"node scripts/dev/run-protocol-clients-tests.mjs\",\"test:vitest\":\"vitest run --config vitest.mcp.config.ts\",\"test:vitest:ui\":\"vitest run --config vitest.config.ts tests/unit/ui\",\"test:mutation\":\"stryker run\",\"test:ecosystem\":\"node scripts/dev/run-ecosystem-tests.mjs\",\"test:system\":\"cross-env DISABLE_SQLITE_AUTO_BACKUP=true node --import tsx/esm --import ./open-sse/utils/setupPolyfill.ts --import ./tests/_setup/isolateDataDir.ts --test --test-force-exit --test-concurrency=1 tests/e2e/system-failover.test.ts\",\"test:coverage\":\"cross-env DISABLE_SQLITE_AUTO_BACKUP=true NODE_OPTIONS=--max-old-space-size=8192 c8 --merge-async --output-dir coverage --exclude=tests/** --exclude=**/*.test.* --reporter=text-summary --reporter=html --reporter=json-summary --reporter=lcov --check-coverage --statements 60 --lines 60 --functions 60 --branches 60 npm run test:coverage:runner\",\"test:coverage:legacy\":\"c8 --output-dir coverage --exclude=open-sse --check-coverage --lines 50 --functions 50 --branches 50 node --import tsx/esm --test tests/unit/*.test.ts\",\"coverage:report\":\"cross-env NODE_OPTIONS=--max-old-space-size=8192 c8 report --merge-async --output-dir coverage --exclude=tests/** --exclude=**/*.test.* --reporter=text --reporter=text-summary --reporter=html --reporter=json-summary --reporter=lcov\",\"coverage:summary\":\"node scripts/check/test-report-summary.mjs --input coverage/coverage-summary.json --output coverage/coverage-report.md\",\"check:pr-test-policy\":\"node scripts/check/check-pr-test-policy.mjs\",\"coverage:report:legacy\":\"c8 report --output-dir coverage --exclude=open-sse --reporter=text --reporter=text-summary\",\"test:all\":\"npm run test:unit && npm run test:vitest && npm run test:vitest:ui && npm run test:ecosystem && npm run test:e2e\",\"check\":\"npm run lint && npm run test\",\"prepublishOnly\":\"npm run build:cli-api && npm run build:cli && npm run check:pack-artifact\",\"postinstall\":\"node scripts/build/postinstall.mjs\",\"uninstall\":\"node scripts/build/uninstall.mjs\",\"uninstall:full\":\"node scripts/build/uninstall.mjs --full\",\"prepare\":\"husky\",\"system-info\":\"node scripts/dev/system-info.mjs\",\"build:cli-api\":\"node --import tsx/esm scripts/cli/generate-api-commands.mjs\",\"release:contributors\":\"node scripts/release/gen-contributors.mjs\",\"release:uncovered\":\"node scripts/release/list-uncovered-commits.mjs\",\"test:coverage:runner\":\"node --max-old-space-size=8192 --import tsx/esm --import ./open-sse/utils/setupPolyfill.ts --import ./tests/_setup/isolateDataDir.ts --test --test-force-exit --test-concurrency=8 tests/unit/*.test.ts \\\"tests/unit/{api,auth,authz,build,cli,cli-helper,combo,compression,correctness,cors,db,db-adapters,docs,gamification,guardrails,lib,mcp,memory,runtime,security,services,settings,shared,ui,usage}/**/*.test.ts\\\" \\\"tests/unit/**/*.test.mjs\\\" && cross-env DISABLE_SQLITE_AUTO_BACKUP=true NODE_OPTIONS=--max-old-space-size=8192 c8 --merge-async --output-dir coverage --exclude=tests/** --exclude=**/*.test.* --reporter=text-summary --reporter=html --reporter=json-summary --reporter=lcov --check-coverage --statements 60 --lines 60 --functions 60 --branches 60 node --max-old-space-size=8192 --import tsx --import ./open-sse/utils/setupPolyfill.ts --import ./tests/_setup/isolateDataDir.ts --test --test-force-exit --test-concurrency=8 \\\"tests/unit/dashboard/**/*.test.ts\\\" && npm run test:unit:serial\",\"test:unit:serial\":\"cross-env DISABLE_SQLITE_AUTO_BACKUP=true node --max-old-space-size=4096 --import tsx/esm --import ./open-sse/utils/setupPolyfill.ts --import ./tests/_setup/isolateDataDir.ts --test --test-force-exit --test-concurrency=1 \\\"tests/unit/serial/**/*.test.ts\\\"\"},\"dependencies\":{\"@aws-sdk/client-bedrock-runtime\":\"^3.1073.0\",\"@dnd-kit/core\":\"^6.3.1\",\"@dnd-kit/sortable\":\"^10.0.0\",\"@dnd-kit/utilities\":\"^3.2.2\",\"@lobehub/icons\":\"^5.8.0\",\"@modelcontextprotocol/sdk\":\"^1.29.0\",\"@monaco-editor/react\":\"^4.7.0\",\"@ngrok/ngrok\":\"^1.7.0\",\"@swc/helpers\":\"0.5.23\",\"@toon-format/toon\":\"^4.1.0\",\"@types/mdx\":\"^2.0.13\",\"@xyflow/react\":\"^12.11.1\",\"axios\":\"^1.16.1\",\"bcryptjs\":\"^3.0.3\",\"bottleneck\":\"^2.19.5\",\"clsx\":\"^2.1.1\",\"commander\":\"^15.0.0\",\"csv-stringify\":\"^6.7.0\",\"dompurify\":\"^3.4.12\",\"express\":\"^5.2.1\",\"fetch-socks\":\"^1.3.3\",\"fflate\":\"^0.8.3\",\"fumadocs-core\":\"^16.10.5\",\"fumadocs-ui\":\"^16.10.5\",\"http-proxy-middleware\":\"^4.0.0\",\"https-proxy-agent\":\"^9.0.0\",\"ink\":\"^7.0.3\",\"ink-spinner\":\"^5.0.0\",\"ink-text-input\":\"^6.0.0\",\"ioredis\":\"^5.10.1\",\"jose\":\"^6.2.3\",\"js-yaml\":\"^5.2.2\",\"jsonc-parser\":\"^3.3.1\",\"lowdb\":\"^7.0.1\",\"lucide-react\":\"^1.21.0\",\"marked\":\"^18.0.4\",\"marked-terminal\":\"^7.3.0\",\"material-symbols\":\"^0.45.2\",\"mermaid\":\"^11.15.0\",\"monaco-editor\":\"^0.56.0\",\"next\":\"^16.2.11\",\"next-intl\":\"^4.12.0\",\"next-themes\":\"^0.4.6\",\"node-machine-id\":\"^1.1.12\",\"omniglyph\":\"^1.0.2\",\"open\":\"^11.0.0\",\"ora\":\"^9.4.1\",\"parse5\":\"^8.0.1\",\"pino\":\"^10.3.1\",\"pino-abstract-transport\":\"^3.0.0\",\"pino-pretty\":\"^13.1.3\",\"playwright\":\"1.62.0\",\"react\":\"19.2.8\",\"react-dom\":\"19.2.8\",\"react-is\":\"^19.2.6\",\"react-markdown\":\"^10.1.0\",\"react-reconciler\":\"^0.33.0\",\"recharts\":\"^3.8.1\",\"safe-regex\":\"^2.1.1\",\"selfsigned\":\"^5.5.0\",\"smol-toml\":\"1.7.1\",\"socks\":\"^2.8.7\",\"sql.js\":\"^1.14.1\",\"sqlite-vec\":\"^0.1.9\",\"tailwind-merge\":\"^3.6.0\",\"tsx\":\"^4.23.0\",\"undici\":\"^8.3.0\",\"update-notifier\":\"^7.3.1\",\"uuid\":\"^14.0.0\",\"ws\":\"^8.18.0\",\"xxhash-wasm\":\"^1.1.0\",\"yazl\":\"^3.3.1\",\"zod\":\"^4.4.3\",\"zustand\":\"^5.0.13\"},\"optionalDependencies\":{\"@atjsh/llmlingua-2\":\"2.0.3\",\"@huggingface/transformers\":\"3.5.2\",\"@tensorflow/tfjs\":\"4.22.0\",\"better-sqlite3\":\"^13.0.2\",\"js-tiktoken\":\"^1.0.20\",\"keytar\":\"^7.9.0\",\"tls-client-node\":\"^0.2.0\",\"wreq-js\":\"^2.3.1\"},\"devDependencies\":{\"@axe-core/playwright\":\"^4.11.3\",\"@cyclonedx/cyclonedx-npm\":\"6.0.0\",\"@playwright/test\":\"^1.60.0\",\"@size-limit/file\":\"^12.1.0\",\"@stryker-mutator/core\":\"^9.6.1\",\"@stryker-mutator/tap-runner\":\"^9.6.1\",\"@tailwindcss/postcss\":\"^4.3.0\",\"@testing-library/jest-dom\":\"^6.9.1\",\"@testing-library/react\":\"^16.3.2\",\"@types/better-sqlite3\":\"^7.6.13\",\"@types/bun\":\"latest\",\"@types/node\":\"^26.1.0\",\"@types/react\":\"^19.2.15\",\"@types/react-dom\":\"^19.2.3\",\"@types/safe-regex\":\"^1.1.6\",\"@types/ws\":\"^8.18.0\",\"@vitejs/plugin-react\":\"^6.0.2\",\"bun\":\"1.3.14\",\"c8\":\"^12.0.0\",\"concurrently\":\"^10.0.3\",\"cross-env\":\"^10.1.0\",\"ctrf\":\"^0.2.1\",\"dpdm\":\"^4.2.0\",\"eslint\":\"^9.39.4\",\"eslint-config-next\":\"16.2.10\",\"eslint-plugin-sonarjs\":\"^4.1.0\",\"fast-check\":\"^4.8.0\",\"fumadocs-mdx\":\"^15.0.7\",\"glob\":\"^13.0.6\",\"httpyac\":\"^6.16.7\",\"husky\":\"^9.1.7\",\"jscpd\":\"^4.2.5\",\"jsdom\":\"^29.1.1\",\"junit-to-ctrf\":\"^0.0.14\",\"knip\":\"^6.18.0\",\"license-checker-rseidelsohn\":\"^5.0.1\",\"lint-staged\":\"^17.0.8\",\"lockfile-lint\":\"^5.0.0\",\"node-loader\":\"^2.1.0\",\"playwright-ctrf-json-reporter\":\"^0.0.29\",\"prettier\":\"^3.8.3\",\"promptfoo\":\"^0.121.18\",\"size-limit\":\"^12.1.0\",\"tailwindcss\":\"^4.3.0\",\"type-coverage\":\"^2.29.7\",\"typescript\":\"^6.0.3\",\"typescript-eslint\":\"^8.59.4\",\"vitest\":\"^4.1.7\",\"wait-on\":\"^9.0.10\",\"wtfnode\":\"^0.10.1\"},\"lint-staged\":{\"*.{js,jsx,ts,tsx,mjs}\":[\"prettier --write\",\"eslint --fix --no-error-on-unmatched-pattern --no-warn-ignored --suppressions-location config/quality/eslint-suppressions.json\"],\"*.{json,md,yml,yaml,css}\":[\"prettier --write\"]},\"pnpm\":{\"onlyBuiltDependencies\":[\"@parcel/watcher\",\"@swc/core\",\"better-sqlite3\",\"esbuild\",\"omniroute\",\"sharp\"]},\"allowScripts\":{\"better-sqlite3\":true,\"esbuild\":true,\"@swc/core\":true,\"@parcel/watcher\":true,\"keytar\":true,\"protobufjs\":true,\"unrs-resolver\":true},\"overrides\":{\"dompurify\":\"^3.4.12\",\"fast-xml-parser\":\"^5.10.1\",\"sharp\":\"^0.35.0\",\"postcss\":\"^8.5.18\",\"ip-address\":\"^10.3.1\",\"qs\":\"^6.15.2\",\"uuid\":\"^14.0.0\",\"form-data\":\"^4.0.6\",\"vite\":\"^8.0.16\",\"protobufjs\":\"^7.6.5\",\"@babel/core\":\"^7.29.6\",\"hono\":\"^4.12.34\",\"@hono/node-server\":\"^2.0.5\",\"fast-uri\":\"^3.1.5\",\"body-parser\":\"^2.3.0\",\"@yarnpkg/parsers\":{\"js-yaml\":\"^4.2.0\"},\"jsdom\":{\"undici\":\"^7.29.0\"},\"node-gyp\":{\"undici\":\"^6.28.0\"},\"concurrently\":{\"shell-quote\":\"^1.9.0\"},\"adm-zip\":\"^0.6.0\",\"promptfoo\":{\"js-yaml\":\"^5.2.2\",\"@apidevtools/json-schema-ref-parser\":{\"js-yaml\":\"^4.2.0\"},\"undici\":\"^7.29.0\"},\"socket.io-parser\":\"^4.2.7\",\"tar\":\"^7.5.21\"}}");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/shared/constants/appConfig.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "APP_CONFIG",
    ()=>APP_CONFIG,
    "THEME_CONFIG",
    ()=>THEME_CONFIG
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$package$2e$json$2e5b$json$5d2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/package.json.[json].mjs [app-client] (ecmascript)");
;
const APP_CONFIG = {
    name: "OmniRoute",
    description: "AI Gateway for Multi-Provider LLMs",
    version: __TURBOPACK__imported__module__$5b$project$5d2f$package$2e$json$2e5b$json$5d2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].version
};
const THEME_CONFIG = {
    storageKey: "theme",
    defaultTheme: "system"
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/store/themeStore.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "COLOR_THEMES",
    ()=>COLOR_THEMES,
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/zustand/esm/react.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$middleware$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/zustand/esm/middleware.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$appConfig$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/appConfig.ts [app-client] (ecmascript)");
"use client";
;
;
;
const useThemeStore = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["create"])()((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$middleware$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["persist"])((set, get)=>({
        theme: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$appConfig$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["THEME_CONFIG"].defaultTheme,
        colorTheme: "coral",
        customColor: "#3b82f6",
        setTheme: (theme)=>{
            set({
                theme
            });
            applyTheme(theme);
        },
        setColorTheme: (colorTheme)=>{
            set({
                colorTheme
            });
            applyColorTheme(colorTheme, get().customColor);
        },
        setCustomColorTheme: (color)=>{
            const normalized = normalizeHexColor(color);
            set({
                colorTheme: "custom",
                customColor: normalized
            });
            applyColorTheme("custom", normalized);
        },
        toggleTheme: ()=>{
            const currentTheme = get().theme;
            const newTheme = currentTheme === "dark" ? "light" : "dark";
            set({
                theme: newTheme
            });
            applyTheme(newTheme);
        },
        initTheme: ()=>{
            const { theme, colorTheme, customColor } = get();
            applyTheme(theme);
            applyColorTheme(colorTheme, customColor);
        }
    }), {
    name: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$appConfig$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["THEME_CONFIG"].storageKey
}));
const COLOR_THEMES = {
    coral: "#e54d5e",
    blue: "#3b82f6",
    red: "#ef4444",
    green: "#22c55e",
    violet: "#8b5cf6",
    orange: "#f97316",
    cyan: "#06b6d4"
};
// Apply light/dark theme to document
function applyTheme(theme) {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    const root = document.documentElement;
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    const effectiveTheme = theme === "system" ? systemTheme : theme;
    if (effectiveTheme === "dark") {
        root.classList.add("dark");
    } else {
        root.classList.remove("dark");
    }
}
function applyColorTheme(colorTheme, customColor) {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    const root = document.documentElement;
    const baseColor = colorTheme === "custom" ? normalizeHexColor(customColor) : COLOR_THEMES[colorTheme] || COLOR_THEMES.coral;
    const hoverColor = shadeHexColor(baseColor, -0.14);
    root.style.setProperty("--color-primary", baseColor);
    root.style.setProperty("--color-primary-hover", hoverColor);
}
function normalizeHexColor(color) {
    const value = (color || "").trim();
    const hex = value.startsWith("#") ? value : `#${value}`;
    const valid = /^#([0-9a-fA-F]{6})$/.test(hex);
    return valid ? hex.toLowerCase() : "#3b82f6";
}
function shadeHexColor(hex, percent) {
    const normalized = normalizeHexColor(hex).slice(1);
    const r = parseInt(normalized.slice(0, 2), 16);
    const g = parseInt(normalized.slice(2, 4), 16);
    const b = parseInt(normalized.slice(4, 6), 16);
    const shade = (channel)=>{
        const target = percent < 0 ? 0 : 255;
        const amount = Math.round((target - channel) * Math.abs(percent));
        const next = percent < 0 ? channel - amount : channel + amount;
        return Math.max(0, Math.min(255, next));
    };
    const toHex = (channel)=>channel.toString(16).padStart(2, "0");
    return `#${toHex(shade(r))}${toHex(shade(g))}${toHex(shade(b))}`;
}
const __TURBOPACK__default__export__ = useThemeStore;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/shared/components/ThemeProvider.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ThemeProvider",
    ()=>ThemeProvider
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$themeStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/store/themeStore.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
function ThemeProvider({ children }) {
    _s();
    const { initTheme } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$themeStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ThemeProvider.useEffect": ()=>{
            initTheme();
        }
    }["ThemeProvider.useEffect"], [
        initTheme
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: children
    }, void 0, false);
}
_s(ThemeProvider, "pCNPqH0OS5LNPOttqN6cW9eF+ug=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$themeStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]
    ];
});
_c = ThemeProvider;
var _c;
__turbopack_context__.k.register(_c, "ThemeProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/shared/components/PwaRegister.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "PwaRegister",
    ()=>PwaRegister
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
"use client";
;
function PwaRegister() {
    _s();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "PwaRegister.useEffect": ()=>{
            if (("TURBOPACK compile-time value", "object") === "undefined" || !("serviceWorker" in navigator)) {
                return;
            }
            // Disable service worker in development to avoid chunk loading / HMR conflicts
            if ("TURBOPACK compile-time truthy", 1) {
                return;
            }
            //TURBOPACK unreachable
            ;
        }
    }["PwaRegister.useEffect"], []);
    return null;
}
_s(PwaRegister, "OD7bBpZva5O2jO+Puf00hKivP7c=");
_c = PwaRegister;
var _c;
__turbopack_context__.k.register(_c, "PwaRegister");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/config/i18n.json.[json].mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
"use turbopack no side effects";
const __TURBOPACK__default__export__ = {
    "$schema": "./i18n-schema.json",
    "default": "en",
    "rtl": [
        "ar",
        "fa",
        "he",
        "ur"
    ],
    "uiOnly": [
        "en"
    ],
    "docsExcluded": [
        "en"
    ],
    "locales": [
        {
            "code": "ar",
            "label": "AR",
            "name": "العربية",
            "native": "العربية",
            "english": "Arabic",
            "flag": "🇸🇦"
        },
        {
            "code": "az",
            "label": "AZ",
            "name": "Azərbaycan dili",
            "native": "Azərbaycan dili",
            "english": "Azerbaijani",
            "flag": "🇦🇿"
        },
        {
            "code": "bg",
            "label": "BG",
            "name": "Български",
            "native": "Български",
            "english": "Bulgarian",
            "flag": "🇧🇬"
        },
        {
            "code": "bn",
            "label": "BN",
            "name": "বাংলা",
            "native": "বাংলা",
            "english": "Bengali",
            "flag": "🇧🇩"
        },
        {
            "code": "cs",
            "label": "CS",
            "name": "Čeština",
            "native": "Čeština",
            "english": "Czech",
            "flag": "🇨🇿"
        },
        {
            "code": "da",
            "label": "DA",
            "name": "Dansk",
            "native": "Dansk",
            "english": "Danish",
            "flag": "🇩🇰"
        },
        {
            "code": "de",
            "label": "DE",
            "name": "Deutsch",
            "native": "Deutsch",
            "english": "German",
            "flag": "🇩🇪"
        },
        {
            "code": "en",
            "label": "EN",
            "name": "English",
            "native": "English",
            "english": "English",
            "flag": "🇺🇸"
        },
        {
            "code": "es",
            "label": "ES",
            "name": "Español",
            "native": "Español",
            "english": "Spanish",
            "flag": "🇪🇸"
        },
        {
            "code": "fa",
            "label": "FA",
            "name": "فارسی",
            "native": "فارسی",
            "english": "Persian",
            "flag": "🇮🇷"
        },
        {
            "code": "fi",
            "label": "FI",
            "name": "Suomi",
            "native": "Suomi",
            "english": "Finnish",
            "flag": "🇫🇮"
        },
        {
            "code": "fr",
            "label": "FR",
            "name": "Français",
            "native": "Français",
            "english": "French",
            "flag": "🇫🇷"
        },
        {
            "code": "gu",
            "label": "GU",
            "name": "ગુજરાતી",
            "native": "ગુજરાતી",
            "english": "Gujarati",
            "flag": "🇮🇳"
        },
        {
            "code": "he",
            "label": "HE",
            "name": "עברית",
            "native": "עברית",
            "english": "Hebrew",
            "flag": "🇮🇱"
        },
        {
            "code": "hi",
            "label": "HI",
            "name": "हिन्दी",
            "native": "हिन्दी",
            "english": "Hindi",
            "flag": "🇮🇳"
        },
        {
            "code": "hu",
            "label": "HU",
            "name": "Magyar",
            "native": "Magyar",
            "english": "Hungarian",
            "flag": "🇭🇺"
        },
        {
            "code": "id",
            "label": "ID",
            "name": "Bahasa Indonesia",
            "native": "Bahasa Indonesia",
            "english": "Indonesian",
            "flag": "🇮🇩"
        },
        {
            "code": "in",
            "label": "IN",
            "name": "Bahasa Indonesia (Alt)",
            "native": "Bahasa Indonesia (Alt)",
            "english": "Indonesian (Legacy)",
            "flag": "🇮🇩"
        },
        {
            "code": "it",
            "label": "IT",
            "name": "Italiano",
            "native": "Italiano",
            "english": "Italian",
            "flag": "🇮🇹"
        },
        {
            "code": "ja",
            "label": "JA",
            "name": "日本語",
            "native": "日本語",
            "english": "Japanese",
            "flag": "🇯🇵"
        },
        {
            "code": "ko",
            "label": "KO",
            "name": "한국어",
            "native": "한국어",
            "english": "Korean",
            "flag": "🇰🇷"
        },
        {
            "code": "mr",
            "label": "MR",
            "name": "मराठी",
            "native": "मराठी",
            "english": "Marathi",
            "flag": "🇮🇳"
        },
        {
            "code": "ms",
            "label": "MS",
            "name": "Bahasa Melayu",
            "native": "Bahasa Melayu",
            "english": "Malay",
            "flag": "🇲🇾"
        },
        {
            "code": "nl",
            "label": "NL",
            "name": "Nederlands",
            "native": "Nederlands",
            "english": "Dutch",
            "flag": "🇳🇱"
        },
        {
            "code": "no",
            "label": "NO",
            "name": "Norsk",
            "native": "Norsk",
            "english": "Norwegian",
            "flag": "🇳🇴"
        },
        {
            "code": "phi",
            "label": "PHI",
            "name": "Filipino",
            "native": "Filipino",
            "english": "Filipino",
            "flag": "🇵🇭"
        },
        {
            "code": "pl",
            "label": "PL",
            "name": "Polski",
            "native": "Polski",
            "english": "Polish",
            "flag": "🇵🇱"
        },
        {
            "code": "pt",
            "label": "PT",
            "name": "Português (Portugal)",
            "native": "Português (Portugal)",
            "english": "Portuguese (Portugal)",
            "flag": "🇵🇹"
        },
        {
            "code": "pt-BR",
            "label": "PT-BR",
            "name": "Português (Brasil)",
            "native": "Português (Brasil)",
            "english": "Portuguese (Brazil)",
            "flag": "🇧🇷"
        },
        {
            "code": "ro",
            "label": "RO",
            "name": "Română",
            "native": "Română",
            "english": "Romanian",
            "flag": "🇷🇴"
        },
        {
            "code": "ru",
            "label": "RU",
            "name": "Русский",
            "native": "Русский",
            "english": "Russian",
            "flag": "🇷🇺"
        },
        {
            "code": "sk",
            "label": "SK",
            "name": "Slovenčina",
            "native": "Slovenčina",
            "english": "Slovak",
            "flag": "🇸🇰"
        },
        {
            "code": "sv",
            "label": "SV",
            "name": "Svenska",
            "native": "Svenska",
            "english": "Swedish",
            "flag": "🇸🇪"
        },
        {
            "code": "sw",
            "label": "SW",
            "name": "Kiswahili",
            "native": "Kiswahili",
            "english": "Swahili",
            "flag": "🇰🇪"
        },
        {
            "code": "ta",
            "label": "TA",
            "name": "தமிழ்",
            "native": "தமிழ்",
            "english": "Tamil",
            "flag": "🇮🇳"
        },
        {
            "code": "te",
            "label": "TE",
            "name": "తెలుగు",
            "native": "తెలుగు",
            "english": "Telugu",
            "flag": "🇮🇳"
        },
        {
            "code": "th",
            "label": "TH",
            "name": "ไทย",
            "native": "ไทย",
            "english": "Thai",
            "flag": "🇹🇭"
        },
        {
            "code": "tr",
            "label": "TR",
            "name": "Türkçe",
            "native": "Türkçe",
            "english": "Turkish",
            "flag": "🇹🇷"
        },
        {
            "code": "uk-UA",
            "label": "UK-UA",
            "name": "Українська",
            "native": "Українська",
            "english": "Ukrainian",
            "flag": "🇺🇦"
        },
        {
            "code": "ur",
            "label": "UR",
            "name": "اردو",
            "native": "اردو",
            "english": "Urdu",
            "flag": "🇵🇰"
        },
        {
            "code": "vi",
            "label": "VI",
            "name": "Tiếng Việt",
            "native": "Tiếng Việt",
            "english": "Vietnamese",
            "flag": "🇻🇳"
        },
        {
            "code": "zh-CN",
            "label": "ZH-CN",
            "name": "中文 (简体)",
            "native": "中文 (简体)",
            "english": "Chinese (Simplified)",
            "flag": "🇨🇳"
        },
        {
            "code": "zh-TW",
            "label": "ZH-TW",
            "name": "中文 (繁體)",
            "native": "中文 (繁體)",
            "english": "Chinese (Traditional)",
            "flag": "🇹🇼"
        }
    ]
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/i18n/config.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DEFAULT_LOCALE",
    ()=>DEFAULT_LOCALE,
    "LANGUAGES",
    ()=>LANGUAGES,
    "LOCALES",
    ()=>LOCALES,
    "LOCALE_COOKIE",
    ()=>LOCALE_COOKIE,
    "RTL_LOCALES",
    ()=>RTL_LOCALES
]);
// SOURCE OF TRUTH: `config/i18n.json` (also consumed by the docs translation
// pipeline in `scripts/i18n/run-translation.mjs`). Keep this file as a thin
// typed adapter — do NOT add hand-maintained locale lists here.
var __TURBOPACK__imported__module__$5b$project$5d2f$config$2f$i18n$2e$json$2e5b$json$5d2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/config/i18n.json.[json].mjs [app-client] (ecmascript)");
;
const config = __TURBOPACK__imported__module__$5b$project$5d2f$config$2f$i18n$2e$json$2e5b$json$5d2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"];
const LOCALES = config.locales.map(_c = (l)=>l.code);
_c1 = LOCALES;
const DEFAULT_LOCALE = config.default;
const LANGUAGES = config.locales.map(_c2 = (entry)=>({
        code: entry.code,
        label: entry.label,
        name: entry.name,
        native: entry.native ?? entry.name,
        english: entry.english ?? entry.name,
        flag: entry.flag
    }));
_c3 = LANGUAGES;
const RTL_LOCALES = config.rtl;
const LOCALE_COOKIE = "NEXT_LOCALE";
var _c, _c1, _c2, _c3;
__turbopack_context__.k.register(_c, "LOCALES$config.locales.map");
__turbopack_context__.k.register(_c1, "LOCALES");
__turbopack_context__.k.register(_c2, "LANGUAGES$config.locales.map");
__turbopack_context__.k.register(_c3, "LANGUAGES");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/i18n/detectBrowserLocale.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Pure browser-language detector used to pick an initial locale on first
 * visit, before the user has made an explicit selection (no cookie set).
 *
 * Matching order:
 *  1. Exact match against `navigator.languages` entries (case-insensitive).
 *  2. `zh-HK` / `zh-MO` are treated as `zh-TW` (Traditional Chinese) since
 *     OmniRoute does not ship a dedicated Hong-Kong/Macau locale.
 *  3. Language-prefix match — e.g. `en-US` matches a supported `en` locale.
 *  4. No match → `null` (caller should keep the existing default).
 *
 * Kept dependency-free (no DOM/`navigator` access) so it is trivially unit
 * testable and reusable from both client components and future server code.
 */ __turbopack_context__.s([
    "detectBrowserLocale",
    ()=>detectBrowserLocale
]);
function detectBrowserLocale(languages, locales) {
    if (!languages || languages.length === 0 || !locales || locales.length === 0) {
        return null;
    }
    const normalizedLocales = locales.map((locale)=>locale.toLowerCase());
    for (const rawLanguage of languages){
        if (!rawLanguage) continue;
        const language = rawLanguage.toLowerCase();
        // 1. Exact match.
        const exactIndex = normalizedLocales.indexOf(language);
        if (exactIndex !== -1) {
            return locales[exactIndex];
        }
        // 2. zh-HK / zh-MO fold to zh-TW when zh-TW is supported.
        if (language === "zh-hk" || language === "zh-mo") {
            const zhTwIndex = normalizedLocales.indexOf("zh-tw");
            if (zhTwIndex !== -1) {
                return locales[zhTwIndex];
            }
        }
        // 3. Language-prefix match (e.g. "en-US" -> "en").
        const prefix = language.split("-")[0];
        const prefixIndex = normalizedLocales.indexOf(prefix);
        if (prefixIndex !== -1) {
            return locales[prefixIndex];
        }
    }
    return null;
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/shared/lib/persistLocale.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "persistLocale",
    ()=>persistLocale
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$i18n$2f$config$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/i18n/config.ts [app-client] (ecmascript)");
;
function persistLocale(code) {
    document.cookie = `${__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$i18n$2f$config$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LOCALE_COOKIE"]}=${code};path=/;max-age=${365 * 24 * 60 * 60};samesite=lax`;
    try {
        localStorage.setItem(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$i18n$2f$config$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LOCALE_COOKIE"], code);
    } catch  {
    // Ignore (e.g. storage disabled/full)
    }
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/shared/components/LocaleAutoDetect.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "LocaleAutoDetect",
    ()=>LocaleAutoDetect
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$i18n$2f$config$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/i18n/config.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$i18n$2f$detectBrowserLocale$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/i18n/detectBrowserLocale.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$lib$2f$persistLocale$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/lib/persistLocale.ts [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
function hasLocaleCookie() {
    return document.cookie.split(";").some((entry)=>entry.trim().startsWith(`${__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$i18n$2f$config$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LOCALE_COOKIE"]}=`));
}
function LocaleAutoDetect() {
    _s();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "LocaleAutoDetect.useEffect": ()=>{
            if (typeof navigator === "undefined" || hasLocaleCookie()) return;
            const detected = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$i18n$2f$detectBrowserLocale$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["detectBrowserLocale"])(navigator.languages ?? [
                navigator.language
            ], __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$i18n$2f$config$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LOCALES"]);
            if (!detected) return;
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$lib$2f$persistLocale$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["persistLocale"])(detected);
            // Only refresh when the detected locale DIFFERS from the one the server
            // just rendered (<html lang>): refreshing on every first visit re-navigated
            // the page mid-interaction (flaky e2e "execution context destroyed" + a
            // visible flash for every new visitor whose browser already matches).
            const renderedLocale = document.documentElement.lang || null;
            if (renderedLocale === detected) return;
            router.refresh();
        // Run once on mount only — this is a first-visit detection, not a
        // reactive effect that should re-run on router identity changes.
        // eslint-disable-next-line react-hooks/exhaustive-deps
        }
    }["LocaleAutoDetect.useEffect"], []);
    return null;
}
_s(LocaleAutoDetect, "vQduR7x+OPXj6PSmJyFnf+hU7bg=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"]
    ];
});
_c = LocaleAutoDetect;
var _c;
__turbopack_context__.k.register(_c, "LocaleAutoDetect");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/shared/utils/basePath.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Client/server helpers for Next.js `basePath` / `OMNIROUTE_BASE_PATH` deploys.
 *
 * Next.js rewrites Link/router automatically, but absolute browser calls like
 * `fetch("/api/...")` and `new EventSource("/api/...")` do not get the prefix.
 * Under a reverse-proxy subpath those hit the domain root instead of the app.
 */ /** Normalize to leading slash, no trailing slash. Empty / root → `""`. */ __turbopack_context__.s([
    "getDeployBasePath",
    ()=>getDeployBasePath,
    "normalizeBasePath",
    ()=>normalizeBasePath,
    "withBasePath",
    ()=>withBasePath
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
function normalizeBasePath(value) {
    const trimmed = value?.trim() ?? "";
    if (!trimmed || trimmed === "/") return "";
    const withSlash = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
    return withSlash.replace(/\/+$/, "");
}
function getDeployBasePath(env = typeof __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"] !== "undefined" ? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env : {}) {
    return normalizeBasePath(env.NEXT_PUBLIC_OMNIROUTE_BASE_PATH || env.OMNIROUTE_BASE_PATH || "");
}
function withBasePath(input, basePath = getDeployBasePath(), origin) {
    if (!basePath) return input;
    if (!input) return input;
    // Protocol-relative or non-path forms
    if (input.startsWith("//")) return input;
    // Absolute path on this origin
    if (input.startsWith("/")) {
        if (input === basePath || input.startsWith(`${basePath}/`)) return input;
        return `${basePath}${input}`;
    }
    // Absolute URL — only rewrite same-origin
    try {
        const baseOrigin = origin || (("TURBOPACK compile-time truthy", 1) ? window.location.origin : "TURBOPACK unreachable");
        const url = new URL(input, baseOrigin);
        const currentOrigin = new URL(baseOrigin).origin;
        if (url.origin !== currentOrigin) return input;
        if (url.pathname === basePath || url.pathname.startsWith(`${basePath}/`)) {
            return url.toString();
        }
        url.pathname = `${basePath}${url.pathname.startsWith("/") ? url.pathname : `/${url.pathname}`}`;
        return url.toString();
    } catch  {
        return input;
    }
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/shared/utils/basePathFetch.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "__resetBasePathFetchForTests",
    ()=>__resetBasePathFetchForTests,
    "installBasePathFetch",
    ()=>installBasePathFetch
]);
/**
 * Install a same-origin fetch + EventSource rewrite for Next.js basePath deploys.
 *
 * Pattern mirrors `installDashboardCsrfFetch` (ref-counted global wrap).
 * Only activates when `NEXT_PUBLIC_OMNIROUTE_BASE_PATH` / `OMNIROUTE_BASE_PATH` is set.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$basePath$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/basePath.ts [app-client] (ecmascript)");
;
let originalFetch = null;
let originalEventSource = null;
let installCount = 0;
function __resetBasePathFetchForTests() {
    if (originalFetch) {
        globalThis.fetch = originalFetch;
        originalFetch = null;
    }
    if (originalEventSource && ("TURBOPACK compile-time value", "object") !== "undefined") {
        window.EventSource = originalEventSource;
        originalEventSource = null;
    }
    installCount = 0;
}
function rewriteInput(input, basePath) {
    if (typeof input === "string") {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$basePath$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["withBasePath"])(input, basePath);
    }
    if (typeof URL !== "undefined" && input instanceof URL) {
        return new URL((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$basePath$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["withBasePath"])(input.href, basePath));
    }
    if (typeof Request !== "undefined" && input instanceof Request) {
        const rewritten = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$basePath$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["withBasePath"])(input.url, basePath);
        if (rewritten === input.url) return input;
        return new Request(rewritten, input);
    }
    return input;
}
function installBasePathFetch(basePath = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$basePath$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDeployBasePath"])()) {
    if (!basePath) return ()=>{};
    if (typeof globalThis.fetch !== "function") return ()=>{};
    if (installCount === 0) {
        originalFetch = globalThis.fetch.bind(globalThis);
        globalThis.fetch = (input, init)=>{
            if (!originalFetch) return fetch(input, init);
            return originalFetch(rewriteInput(input, basePath), init);
        };
        if (("TURBOPACK compile-time value", "object") !== "undefined" && typeof window.EventSource === "function") {
            originalEventSource = window.EventSource;
            const BaseES = originalEventSource;
            // Subclass so `instanceof EventSource` and prototype methods keep working.
            class BasePathEventSource extends BaseES {
                constructor(url, eventSourceInitDict){
                    const raw = typeof url === "string" ? url : url.toString();
                    super((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$basePath$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["withBasePath"])(raw, basePath), eventSourceInitDict);
                }
            }
            window.EventSource = BasePathEventSource;
        }
    }
    installCount++;
    let active = true;
    return ()=>{
        if (!active) return;
        active = false;
        installCount = Math.max(0, installCount - 1);
        if (installCount === 0) {
            if (originalFetch) {
                globalThis.fetch = originalFetch;
                originalFetch = null;
            }
            if (originalEventSource && ("TURBOPACK compile-time value", "object") !== "undefined") {
                window.EventSource = originalEventSource;
                originalEventSource = null;
            }
        }
    };
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/shared/components/BasePathNetworkProvider.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BasePathNetworkProvider",
    ()=>BasePathNetworkProvider
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$basePathFetch$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/basePathFetch.ts [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
"use client";
;
;
function BasePathNetworkProvider({ children }) {
    _s();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useInsertionEffect"])({
        "BasePathNetworkProvider.useInsertionEffect": ()=>{
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$basePathFetch$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["installBasePathFetch"])();
        }
    }["BasePathNetworkProvider.useInsertionEffect"], []);
    return children;
}
_s(BasePathNetworkProvider, "KP04oOqX3NbUYDsTwGwlE3GUn5Y=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useInsertionEffect"]
    ];
});
_c = BasePathNetworkProvider;
var _c;
__turbopack_context__.k.register(_c, "BasePathNetworkProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=_0da43hy._.js.map