---
title: "Hermes Browser Sensor — navegador como satélite"
status: "CANDIDATO"
owner: "JARVIS / Expansão de Domínio"
authority: "SEGREDO/CHEFE"
---

# Hermes Browser Sensor

O navegador é **sensor e corpo**, não cérebro.

```text
FOREGROUND_CHROME_MCP ─┐
                       ├→ BROWSER_BRIDGE_V1 → UNIVERSAL_HANDLER → HERMES
BACKGROUND_ZENDRIVER ──┘
```

Retorno:

```text
HERMES
→ UNIVERSAL_HANDLER
→ BROWSER_BRIDGE_V1
→ PROVIDER
→ BROWSER
→ BROWSER_EVENT_V1
→ EVIDENCE_ENVELOPE
```

Aprendizado:

```text
BROWSER_EVENT_V1
→ ARTIFACT_CAPABILITY(BROWSER_OBSERVATION)
→ DREAM_REVIEW
→ CANDIDATE
```

Invariantes:

```text
BROWSER_IS_AUTHORITY=false
BROWSER_IS_WRITER=false
READ_ONLY_DEFAULT=true
SECRETS_STAY_IN_PROVIDER=true
INTERNAL_CHAT_API_IS_CONTRACT=false
UNKNOWN!=PASS
REALITY=JUDGE
```
