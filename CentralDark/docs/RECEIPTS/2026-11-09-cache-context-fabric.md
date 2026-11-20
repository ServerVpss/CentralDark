---
title: "CentralDark cache/context fabric — recovery receipt"
status: "PARTIAL_FIXED_POINT"
date: 2026-11-09
category: "RECEIPT"
sensitivity: INTERNAL
owner: "ServerVpss/CentralDark@main"
writer: "HERMES"
source_rule: "SCRIPT_FIRST_AI_ON_VERIFIED_FAILURE_ONLY"
---

# Cache/context fabric recovery

## Current binding

```text
MAIN_SHA=f0a8ff880bbc8159a4998739944c51316eed0d69
HERMES_VERSION=0.22.7
HERMES_UPSTREAM_SHA=b200f5bc
HERMES_HOME=/data
HERMES_PROVIDER=openai-codex
HERMES_API_MODE=codex_responses
CENTRALDARK_NATIVE_EXTERNAL_DIR=/data/cache/scratch/CentralDark/.agents/skills
```

No local llama/llama.cpp/ollama/vLLM process or matching listener was observed.
The CentralDark `decisor.mjs` local llama path is therefore a fallback path, not a
currently proven active provider.

## Skill reconciliation

```text
AUTOSYNC_SKILLS=36
TARGETS=72
BEFORE_SYNC=SYNCED_36 / UNKNOWN_35 / ORACLE_REQUIRED_1
APPLY=PASS
INSTALLED_RUNTIME=35
AFTER_SYNC=SYNCED_71 / UNKNOWN_0 / ORACLE_REQUIRED_1
NATIVE_CATALOG_BINDING=CONFIGURED
HERMES_SKILLS_LIST=LOCAL_SKILLS_VISIBLE
ACTIVE_SKILL_CONSUMER=CATALOG_LOADED; SESSION_EXECUTION_SEPARATE
DIRTY_WORKTREE_PRESERVED=true
```

The existing `skill-sync-check.sh` owner was used. No second synchronizer was
created. The installed Hermes skill drift remains isolated to the canonical
`hermes-agent` runtime copy and was not overwritten because it requires oracle
review.

## Decision cache metrics

The existing cache in `apps/modulos/HERMES-CORE/core/decisor.mjs` now exposes a
deterministic metrics probe. It does not call a model.

```text
HIT=1
MISS=3
TTL_EXPIRED=1
INVALIDATED=2
EVICTED=0
LOOKUPS=4
HIT_RATE=0.25
TTL_MS=600000
LOOKUP_LATENCY_MS=0
MODEL_CALLS=0
SUBAGENT_CALLS=0
```

The cache invalidates expired entries and schema-invalid decisions. The existing
continuity key includes objective, HEAD, cursor and open-work fields, so context
drift changes the decision-cache key.

## Context and regression gates

```text
NODE_SYNTAX=PASS
CORE_TESTS=67/67 PASS
CONTINUITY_GUARD=PASS
UNKNOWN_COLLAPSE=PASS
ROUTING_STRATEGY=PASS
RUNTIME_ENVELOPE=PASS
STATE_NARRATION=PASS
GIT_DIFF_CHECK=PASS
```

## Prompt/KV cache status

```text
HERMES_USAGE_NORMALIZATION_SUPPORT=CODE_PRESENT
CODEX_CACHED_INPUT_FIELD_SUPPORT=CODE_PRESENT
LIVE_PROMPT_CACHE_HIT=UNKNOWN
LIVE_KV_CACHE_HIT=UNKNOWN
LIVE_CACHE_TTL=UNKNOWN
```

No model turn was generated only to manufacture a cache metric. A live provider
usage sample requires one authorized inference turn and must read the returned
usage fields. `CODE_PRESENT != RUNTIME_PROVED`.

## Security and persistence

```text
CACHE_SECRETS=NOT_FOUND_IN_RECEIPT
CACHE_STATE=IN_MEMORY_DECISOR_MAP
SKILL_BACKUPS=CREATED_BY_EXISTING_SYNC_OWNER
CONFIG_READBACK=PASS
REMOTE_WRITE_FROM_THIS_RECEIPT=NOT_YET
```

## NEXT_CURSOR

```text
REMEASURE_ONE_AUTHORIZED_CODEX_TURN_USAGE_FIELDS
VERIFY_PROMPT_CACHE_READ_AND_KV_CACHE_SEPARATELY
REVIEW_ORACLE_REQUIRED_HERMES_SKILL_DRIFT
THEN_UPDATE_RECEIPT_AND_CLOSE_FIXED_POINT
```
