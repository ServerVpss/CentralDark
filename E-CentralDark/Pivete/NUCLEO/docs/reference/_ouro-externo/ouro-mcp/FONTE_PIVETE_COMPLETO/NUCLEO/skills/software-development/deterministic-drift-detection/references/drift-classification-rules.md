# Drift Classification Rules — Detailed Heuristics

## Error Class Definitions & Detection Patterns

### PROVIDER_RATE_LIMIT
**Trigger**: HTTP 429 with "rate limit" or "usage limit reached" in response
**Source**: Provider API response
**Retryable**: Yes (exponential backoff)
**Block Kind**: `transient`
**Detection**:
```python
if "429" in error or "rate limit" in error.lower() or "usage limit reached" in error.lower():
    return "PROVIDER_RATE_LIMIT"
```

### PROVIDER_CREDIT_OR_QUOTA
**Trigger**: HTTP 429 with "out of quota", "insufficient credits", "plan limit", "billing"
**Source**: Provider API response
**Retryable**: No (requires human action: upgrade plan, add credits)
**Block Kind**: `capability`
**Detection**:
```python
if any(kw in error.lower() for kw in ["out of quota", "insufficient credit", "plan limit", "billing", "upgrade"]):
    return "PROVIDER_CREDIT_OR_QUOTA"
```

### PROVIDER_ENDPOINT_UNREACHABLE
**Trigger**: Connection refused, timeout, DNS failure, host unreachable, network error
**Source**: Network layer
**Retryable**: Yes (transient network issue)
**Block Kind**: `transient`
**Detection**:
```python
if any(kw in error.lower() for kw in ["connection refused", "timeout", "host unreachable", "dns", "network error", "econnrefused", "enetunreach"]):
    return "PROVIDER_ENDPOINT_UNREACHABLE"
```

### PROVIDER_AUTH_MISSING
**Trigger**: HTTP 401, 403, "unauthorized", "authentication failed", "invalid token", "api key"
**Source**: Auth layer
**Retryable**: No (requires re-authentication)
**Block Kind**: `capability`
**Detection**:
```python
if any(kw in error.lower() for kw in ["401", "403", "unauthorized", "authentication failed", "invalid token", "api key"]):
    return "PROVIDER_AUTH_MISSING"
```

### SKILL_MISSING
**Trigger**: "Unknown skill(s):", "skill not found", "skill not loaded", "skill not available"
**Source**: Skill system
**Retryable**: Yes (install/enable skill)
**Block Kind**: `capability`
**Detection**:
```python
if any(kw in error.lower() for kw in ["unknown skill", "skill not found", "skill not loaded", "skill not available"]):
    return "SKILL_MISSING"
```

### WORKER_CRASH
**Trigger**: "pid not alive", "worker died", "process exited", "crash", "consecutive_failures", "gave_up" with crashed outcome
**Source**: Worker process / dispatcher
**Retryable**: Yes (dispatcher will retry up to failure_limit)
**Block Kind**: `transient`
**Detection**:
```python
if any(kw in error.lower() for kw in ["pid not alive", "worker died", "process exited", "crash", "consecutive_failures", "gave_up"]):
    # Check outcome
    if "crashed" in outcome or "crashed" in status:
        return "WORKER_CRASH"
```

### STALE_CLAIM
**Trigger**: "stale claim", "claim expired", "claim_lock timeout", "claim_lock" missing
**Source**: Dispatcher claim system
**Retryable**: Yes (dispatcher reclaims automatically)
**Block Kind**: `transient`
**Detection**:
```python
if any(kw in error.lower() for kw in ["stale claim", "claim expired", "claim_lock", "claim timeout"]):
    return "STALE_CLAIM"
```

### DEPENDENCY_OPEN
**Trigger**: "waiting for dependency", "blocked by parent", "dependency not met", block_kind = "dependency"
**Source**: Task dependency graph
**Retryable**: Yes (when parent completes)
**Block Kind**: `dependency`
**Detection**:
```python
if block_kind == "dependency" or any(kw in body.lower() for kw in ["waiting for dependency", "blocked by parent", "dependency not met"]):
    return "DEPENDENCY_OPEN"
```

### HUMAN_INPUT_REQUIRED
**Trigger**: "awaiting human input", "manual approval needed", "please review", block_kind = "needs_input"
**Source**: Human-in-the-loop requirement
**Retryable**: No (requires human action)
**Block Kind**: `needs_input`
**Detection**:
```python
if block_kind == "needs_input" or any(kw in body.lower() for kw in ["awaiting human", "manual approval", "please review", "human input"]):
    return "HUMAN_INPUT_REQUIRED"
```

### CAPABILITY_MISSING
**Trigger**: "feature not implemented", "unsupported operation", "unknown provider", "unknown model", "unknown toolset", "not configured"
**Source**: Configuration / capability gap
**Retryable**: No (requires config change or feature implementation)
**Block Kind**: `capability`
**Detection**:
```python
if any(kw in error.lower() for kw in ["feature not implemented", "unsupported operation", "unknown provider", "unknown model", "unknown toolset", "not configured"]):
    return "CAPABILITY_MISSING"
```

### CIRCUIT_BREAKER_TRIPPED
**Trigger**: "failure_limit exceeded", "consecutive_failures >= limit", "gave_up" with effective_limit reached
**Source**: Dispatcher circuit breaker
**Retryable**: Yes (after human review / config change)
**Block Kind**: `transient`
**Detection**:
```python
if "failure_limit" in error or "consecutive_failures" in error or "effective_limit" in error:
    return "CIRCUIT_BREAKER_TRIPPED"
```

### UNKNOWN
**Trigger**: Any blockage reason not matching above
**Source**: Unclassified
**Retryable**: No (requires investigation)
**Block Kind**: None
**Detection**: Fallback when no other class matches

## Classification Priority Order

When multiple patterns match, use this priority (highest first):

1. `CIRCUIT_BREAKER_TRIPPED` — explicit limit reached
2. `WORKER_CRASH` — pid not alive, crashed outcome
3. `PROVIDER_AUTH_MISSING` — 401/403 explicit
4. `PROVIDER_CREDIT_OR_QUOTA` — quota/billing explicit
5. `PROVIDER_RATE_LIMIT` — 429 rate limit
6. `PROVIDER_ENDPOINT_UNREACHABLE` — network errors
7. `SKILL_MISSING` — unknown skill explicit
8. `CAPABILITY_MISSING` — unknown provider/model/toolset
9. `DEPENDENCY_OPEN` — block_kind=dependency
10. `HUMAN_INPUT_REQUIRED` — block_kind=needs_input
11. `STALE_CLAIM` — claim expired
12. `UNKNOWN` — everything else

## Multi-Class Cards

A card can have **primary** and **secondary** classes:
- Primary = root cause (what stopped the work)
- Secondary = contributing factor (what else is wrong)

Example from session:
- `t_6c3d5e16`: Primary=WORKER_CRASH (pid not alive), Secondary=PROVIDER_RATE_LIMIT (HTTP 429 in logs)
- `t_35432f15`: Primary=WORKER_CRASH (pid not alive), Secondary=CAPABILITY_MISSING (unknown provider)

## Block Kind Mapping

| Error Class | Suggested block_kind |
|-------------|---------------------|
| PROVIDER_RATE_LIMIT | transient |
| PROVIDER_CREDIT_OR_QUOTA | capability |
| PROVIDER_ENDPOINT_UNREACHABLE | transient |
| PROVIDER_AUTH_MISSING | capability |
| SKILL_MISSING | capability |
| WORKER_CRASH | transient |
| STALE_CLAIM | transient |
| DEPENDENCY_OPEN | dependency |
| HUMAN_INPUT_REQUIRED | needs_input |
| CAPABILITY_MISSING | capability |
| CIRCUIT_BREAKER_TRIPPED | transient |
| UNKNOWN | None |

## Retry Conditions by Class

| Class | Retryable | Retry Condition |
|-------|-----------|-----------------|
| PROVIDER_RATE_LIMIT | Yes | Wait `resets_in_seconds` + jitter, then retry |
| PROVIDER_CREDIT_OR_QUOTA | No | Human: upgrade plan / add credits |
| PROVIDER_ENDPOINT_UNREACHABLE | Yes | Exponential backoff (2s, 4s, 8s, max 60s) |
| PROVIDER_AUTH_MISSING | No | Human: re-authenticate / rotate key |
| SKILL_MISSING | Yes | Install/enable skill, then retry |
| WORKER_CRASH | Yes | Dispatcher retries up to failure_limit (2) |
| STALE_CLAIM | Yes | Dispatcher reclaims on next tick |
| DEPENDENCY_OPEN | Yes | Auto-unblock when parent completes |
| HUMAN_INPUT_REQUIRED | No | Human: provide input / approve |
| CAPABILITY_MISSING | No | Human: configure / implement capability |
| CIRCUIT_BREAKER_TRIPPED | Conditional | Human: review, then unblock or increase limit |
| UNKNOWN | No | Investigate first |