# Verification loop — Pivete house workflow

## Purpose

Reusable procedure for tests, configuration changes, external research actions, and Telegram media delivery. This is a protocol for avoiding false success, not a claim that execution can never fail.

## Lupa zoom-in (input)

Before the main command:

- state the real intent;
- define scope and expected result;
- identify prerequisites and likely failure modes;
- choose the smallest toolset;
- define what evidence will prove success;
- separate fact, hypothesis, and unknown.

## Official five-step gate

For any relevant action that changes a file, state, configuration, or produced artifact, use:

```text
LER → PERGUNTAR → AGIR → PROVAR → REGISTRAR
```

- **LER:** inspect context, scope, prerequisites, protected areas, and expected evidence.
- **PERGUNTAR:** obtain explicit Pivete authorization; never infer permission.
- **AGIR:** dispatch a subagent first, then run the executor in the background when practical.
- **PROVAR:** compare execution, independent observation, artifact state, and external result.
- **REGISTRAR:** report evidence, interpretation, conclusion, uncertainty, and next action.

Read-only search/diagnosis may skip the gate, but never skips factual validation. `TRAVA`, `PARA`, or `!CALIBRA` stops the work immediately.

## Independent lanes

1. Dispatch a subagent first to review the method, prerequisites, and risks.
2. Run the executor in the background when practical.
3. Keep Hermes as the real-time observer of process status, logs, filesystem state, and external responses.
4. Dispatch a separate debugger/reviewer when output is missing, contradictory, or unexpected.
5. Compare executor and observer evidence before concluding.

The subagent's summary is not proof. Verify side effects directly.

## Audit and inventory legend

Use one uniform status per item: 🟢 OK / MANTER, 🟡 REVISAR, 🔴 CORRIGIR, ♻️ UNIFICAR, or 🧊 ARQUIVAR DEPOIS. Never use 🟢 without independent confirmation; incomplete evidence is 🟡 and confirmed divergence/breakage is 🔴.

## Failure handling

- Capture the exact exit code, exception, path, provider, and timestamp.
- Do not reinterpret a failure as success.
- Diagnose the narrowest cause.
- Apply the smallest fix.
- Retry the same operation.
- Re-run the complete verification, not only the failed sub-step.

## Windows path rule

Python processes on Windows need native paths such as `C:\\Users\\...`. MSYS paths such as `/c/Users/...` may work in Bash but fail when passed directly to Python's `open()` or a Windows executable. Normalize the path before execution and then verify the file with a native-aware read/stat check.

## Telegram audio rule

For a voice response:

- generate with the configured Edge PT-BR voice;
- confirm the TTS call returned success;
- confirm `voice_compatible: true`;
- verify the file exists and is valid OGG/Opus;
- deliver only after artifact verification;
- confirm the Telegram result separately when possible.

A generated local file is not proof that Telegram delivered a voice bubble.

## Lupa zoom-out (output)

Report four distinct fields:

- **Evidence:** what commands, logs, files, or external responses actually showed.
- **Interpretation:** what those facts imply.
- **Conclusion:** confirmed success, confirmed failure, or inconclusive.
- **Next action:** smallest repair or verification step.

Never use "funcionou" when only generation, a zero exit code, or a plausible response was observed.
