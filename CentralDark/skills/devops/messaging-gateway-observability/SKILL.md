---
name: messaging-gateway-observability
description: "Use when gateway progress is invisible. Verify and prove it."
version: 1.0.0
license: internal
author: Hermes Agent
metadata:
  hermes:
    tags: [hermes, gateway, telegram, messaging, streaming, observability, progress]
    category: devops
---

# Messaging Gateway Observability

## When to Use

Use this skill when the user expects Telegram or another messaging surface to show what the agent is doing while a run is in progress, rather than only a typing indicator and a final answer.

## Always-on contract

- Show observable operational milestones, not private chain-of-thought: tool/agent name, action, target, result, and next stage.
- Keep updates short and causal; prefer `AGENTE → AÇÃO → ALVO → RESULTADO` over verbose narration.
- Treat the typing indicator as presence only. It is not proof that progress streaming or tool-progress delivery is enabled.
- Separate local display settings, gateway streaming settings, voice-mode state, TTS generation, media attachment delivery, and contact-directory access; treat each as a separate owner and verify the effective runtime binding.
- When checking Telegram capability, verify media sending/receiving and contact visibility independently: a working bot chat proves neither access to the account's contact list nor ability to message arbitrary contacts.
- Treat `streaming.enabled` as a possible runtime binding, not as the proven owner or root cause of Telegram tool progress unless documentation, live behavior, and a discriminating test establish that causal link.
- For `/voice on` requests, prove three claims separately: voice mode enabled for the chat, TTS generated a valid local audio file, and Telegram actually delivered or the user confirmed receipt.
- Do not claim live progress is fixed until the active gateway has reloaded the setting and a real messaging turn produces progressive updates.
- When the user says they are still speaking or observing, wait; do not append a generic invitation to continue.
- Never expose private reasoning as a substitute for status. Report execution evidence and blockers instead.

## Procedure

1. Read the live configuration and gateway state:
   ```bash
   hermes --version
   hermes config get display.streaming
   hermes config get display.tool_progress
   hermes config get streaming.enabled
   hermes gateway status
   ```
2. Reconcile the settings by owner. Check the documented Telegram/tool-progress keys first (`display.tool_progress`, grouping/preview/command options, and Telegram-specific overrides when present), then inspect display streaming and gateway streaming as separate bindings. If the CLI says a YAML key is unrecognized, record `CONFIG_PRESENT_RUNTIME_BINDING_UNKNOWN`; do not treat the file value as effective configuration.

   Telegram supports typing, tool-progress updates, and answer streaming as distinct behaviors. A visible operational trace is stronger evidence for tool-progress delivery than a changed streaming flag. Use a discriminating test—hold tool-progress settings constant while toggling only the suspected streaming binding, or compare a fresh reloaded process—to attribute causality.
3. Enable only the missing gateway capability:
   ```bash
   hermes config set streaming.enabled true
   ```
4. Reload the gateway from outside the running gateway process. A restart requested from a shell spawned inside that same gateway can be rejected to prevent self-termination; use an independent supervisor or terminal context.
5. Verify the fixed point. Read back the setting, confirm one active gateway, inspect a fresh startup log, and exercise a real messaging turn before reporting the change live. A config write, a successful scheduler command, or a typing indicator alone is not enough; require a new process/startup evidence when reload is required.

6. Preserve continuity claims separately from delivery claims. After a restart or crash, verify the persisted session identifier, interruption/resume marker, last confirmed turn, and recovery receipt. Report `complete`, `partial`, or `not recovered`; never infer that another chat has the same literal history merely because it shares the same function, profile, or canonical memory. Cross-surface continuity requires an explicit handoff or proven transport channel, while private histories remain isolated by default.
7. For `/voice on` or TTS verification, inspect the voice-mode state and generate a measurable audio file before claiming success. On Windows Hermes installs, prefer `.venv/Scripts/python.exe` for Hermes Agent imports; if using the Edge provider, install/repair `edge-tts` and `certifi`, then verify `certifi.where()` exists before generating audio. Treat a `media_tag` or file path as local generation proof only, not Telegram delivery proof.
8. Exercise the real Telegram path with truthful, compact milestones:
   ```text
   [Hermes] Recuperando intenção vigente
   [GitHub] Verificando contrato e estado atual
   [Ambiente] Medindo dependências
   [Executor] Aplicando mudança
   [Contraprova] Validando resultado
   [Hermes] Preparando resposta final
   ```
   Name a tool, agent, file, endpoint, or result only after it was actually invoked or measured.
9. If progress remains absent, collect an exact receipt containing platform, session, adapter capability, documented progress owner, effective streaming setting, gateway PID/state, reload/startup evidence, and the last relevant log event. Do not infer failure from one missing visual update; conversely, do not declare a causal fix from one successful visual trace.
10. For voice/TTS receipts, report `VOICE_MODE`, `TTS_PROVIDER`, `AUDIO_FILE`, `DURATION`, `SIZE`, `DEFAULT_TTS_PROVIDER`, and `TELEGRAM_DELIVERY` separately; mark unobserved delivery as `UNKNOWN`, never as PASS.

## Pitfalls

- Do not inspect only `display.streaming`; documented tool-progress ownership, local display preferences, gateway bindings, and platform delivery are separate layers.
- Do not promote a config key to canonical ownership merely because it exists in YAML; an unrecognized key is not proof of runtime consumption.
- Do not claim root cause from correlation between a config edit and a visible result; use a reload plus a discriminating test.
- Do not restart from inside the gateway; use an external process and verify the new startup.
- Do not report fixed after writing YAML; require gateway reload and end-to-end Telegram observation.
- Do not conflate auto-resume of an interrupted session with sharing one literal transcript across DM, groups, or channels; verify the session and handoff channel independently.
- Do not equate typing with execution visibility; Telegram can show typing while buffering the full answer.
- Do not equate local TTS generation with Telegram voice delivery; the file can exist while the platform attachment still fails or remains unconfirmed.
- Do not let `check_tts_requirements()` for the default provider override a successful forced-provider test; report the default as not green and the forced provider by name.
- Do not dump internal reasoning; transparency means work stages and evidence.
- Do not create a second orchestrator or progress protocol; reuse the existing gateway path.

## References

- `references/telegram-streaming.md` contains the capability matrix, decision table, and verification receipt.
- `references/telegram-voice-tts.md` contains the `/voice on` + TTS verification recipe and receipt fields.
