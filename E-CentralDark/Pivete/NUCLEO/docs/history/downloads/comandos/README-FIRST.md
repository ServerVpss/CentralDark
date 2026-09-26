# CENTRALDARK — HERMES BROWSER SENSOR / USER ADAPTER

**Missão:** `CENTRALDARK-HERMES-BROWSER-ADAPTER-01`  
**Baseline live medido:** `main@dcf70053f2af1d95bd86867e6f043fb634e919d0`  
**Objetivo:** ligar navegador visível + motor Zendriver ao Hermes sem criar segundo Hermes, segundo MCP, segundo cérebro ou protocolo de verdade paralelo.

## Veredito live

```text
BROWSER_DOMAIN_CONTRACT                 = FOUND
CHROME_DEVTOOLS_MCP_INTEGRATION_DOC     = FOUND / CANDIDATE_INTEGRATION
ARTIFACT_BROWSER_OBSERVATION_ADAPTER    = FOUND
CAUSAL_EVIDENCE_ENVELOPE_BROWSER        = FOUND
CAUSAL_EVIDENCE_ENVELOPE_ZENDRIVER     = FOUND
ZENDRIVER_CODE                          = FOUND
ZENDRIVER_WS_GATEWAY                    = FOUND_BUT_INCOMPLETE_ECHO
ZENDRIVER_DOM_AUTOMATION                = FOUND_LEGACY_ONE_SHOT
HERMES_UNIVERSAL_HTTP_HANDLER           = FOUND
HERMES_NATIVE_BROWSER_TOOL              = NOT_FOUND
CANONICAL_BROWSER_BRIDGE                = NOT_FOUND
LIVE_LOCAL_CHROME_CONNECTION            = UNPROVEN
E2E_BROWSER_HERMES_BROWSER              = UNPROVEN
```

A ferida é pequena e precisa:

> **falta somente a costura canônica entre as superfícies de browser e o Hermes.**

## Arquitetura final

```text
                  ┌──────────────────────────────────────┐
                  │          NAVEGADOR DO CHEFE          │
                  │ Chrome vivo / aba atual / seleção    │
                  └───────────────────┬──────────────────┘
                                      │
                         FOREGROUND TRANSPORT
                                      │
                         Chrome DevTools MCP
                                      │
                                      ▼
┌───────────────────────┐    ┌────────────────────────────┐
│ BACKGROUND TRANSPORT  │───▶│ CENTRALDARK BROWSER BRIDGE │
│ Zendriver             │    │           V1               │
│ elite-gateway         │    │ normalize + policy + trace  │
└───────────────────────┘    └─────────────┬──────────────┘
                                           │ HTTP localhost
                                           ▼
                              Universal-Handler EXISTENTE
                                           │
                                           ▼
                                       HERMES CORE
                                           │
                         ┌─────────────────┴─────────────────┐
                         ▼                                   ▼
                 RESPOSTA IMEDIATA                   EVIDENCE ENVELOPE
                 para missão atual                  + agent-log / signals
                                                             │
                                                             ▼
                                                   ARTIFACT CAPABILITY
                                                             │
                                                             ▼
                                                        DREAM REVIEW
```

## Regra de ouro

```text
BROWSER = SENSOR + CORPO
HERMES = CÉREBRO OPERACIONAL
MCP/ZENDRIVER = TRANSPORTE
EVIDENCE_ENVELOPE = NORMALIZADOR
DREAM_REVIEW = CONSOLIDAÇÃO
REALITY = JUDGE
```

## Plug point

O plug principal NÃO deve nascer no `Executor` como uma implementação duplicada de CDP.

O Hermes já possui:

```text
Executor
→ ferramenta=handler
→ Universal-Handler
→ HTTP genérico
```

Portanto:

```text
HERMES
→ handler/http
→ http://127.0.0.1:<PORT>/v1/browser/*
→ Browser Bridge
→ transport foreground|background
```

Isso evita alterar o cérebro para cada tecnologia de navegador.

## Este pack NÃO faz

- não instala Chrome DevTools MCP;
- não liga Zendriver;
- não presume que a sessão local está conectada;
- não usa endpoint interno privado do ChatGPT como contrato;
- não inclui credenciais;
- não faz deploy;
- não altera `main`.

Ele deixa **contrato, arquitetura, schemas, paths e gates prontos para aplicação**.
