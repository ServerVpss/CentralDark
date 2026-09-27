---
name: code-validation-sandbox
description: Safe code execution environment for validating snippets, testing algorithms, and verifying fixes before applying. Use when you need to run untrusted code safely or verify behavior before committing.
---

# Code Validation Sandbox

Safe, isolated code execution for validation and testing.

## Core Principles
- **Isolation**: Code runs in restricted environment (no network, no filesystem outside temp, limited CPU/memory)
- **Ephemeral**: State discarded after execution
- **Observable**: Capture stdout, stderr, return code, timing
- **Deterministic**: Same input → same output (when no external deps)

## Use Cases
- Validate algorithm logic before committing
- Test regex patterns against sample data
- Verify fix for reported bug
- Benchmark algorithm variants
- Test edge cases safely

## Sandbox Interface
```python
# Conceptual interface
result = sandbox.run(
    code="...",
    language="python",  # or javascript, bash, etc.
    timeout_ms=5000,
    memory_mb=128,
    stdin="input data"
)
# Returns: {stdout, stderr, exit_code, duration_ms, timed_out}
```

## Safety Rules
- No network access
- No filesystem access outside designated temp dir
- CPU time limit enforced
- Memory limit enforced
- No subprocess spawning
- No dynamic code loading (eval, import, require)

## Integration
- Use before committing algorithm changes
- Test regex/parsing logic
- Verify mathematical computations
- Regression test for reported bugs

## Output
Structured result → `knowledge-compiler` if pattern is reusable.
