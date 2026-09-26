---
title: SOL Desktop POC — Estrutura e Integração
captured_at: "2026-08-22"
branch: "feat/gatilhos-execucao-reversivel-remediacao"
source: "E:/CentralDark/workspace/sol/sol-desktop-poc-source/apps/sol-desktop/"
---

# SOL Desktop POC — Voice-First Tauri App

## Arquitetura
- **Tauri v2** + React 19 + TypeScript + Vite
- Janela flutuante `alwaysOnTop`, `decorations: false`, 1180x760
- CSP: `connect-src 'self' http://127.0.0.1:* https://bridge.centralldark.com`
- Global shortcut: `Ctrl+Shift+Space` (push-to-talk)
- Temas: `overclock` | `crm`

## Núcleo (core/)
| Arquivo | Responsabilidade |
|---------|------------------|
| `state.ts` | State machine `SolState` (IDLE→LISTENING→TRANSCRIBING→THINKING→EXECUTING→SPEAKING→BLOCKED) + transições permitidas |
| `intent.ts` | Classificador determinístico local (STOP_ALL, STATUS_READONLY, OPEN_MODULE, CHAT, UNKNOWN) |
| `redaction.ts` | Redação de segredos em receipts |

## Libs (lib/)
| Arquivo | Responsabilidade |
|---------|------------------|
| `gateway.ts` | `askSol()` → POST para gateway configurado + `localFallback()` (demo read-only) |
| `settings.ts` | Load/save localStorage (gatewayUrl, gatewayKey, ttsUrl, ttsKey, theme) |
| `tauri.ts` | `installPushToTalkShortcut()` — atalho global nativo |
| `voice.ts` | Web Speech API: `createRecognition()`, `speak()`, `stopVoice()` |

## Fluxo de Execução
```
CHEFE (voz/texto)
  → classifyLocal() [determinístico]
  → askSol() → Gateway CentralDark (se configurado)
    → localFallback() se sem gateway (demo)
  → speak() TTS
  → receipt com redação
```

## Estado Atual (2026-08-22)
- ✅ `npm install` — 111 packages
- ✅ `npm run test` — 6/6 passing (state, intent, redaction)
- ✅ `npm run dev` — Vite em `http://localhost:1420` (frontend funcional)
- ⚠️ `npm run tauri dev` — Bloqueado por Windows App Control (WDAC) no `build-script-build` (os error 4551)
- ❌ Build Tauri — Requer política de assinatura ou certificado

## Integração na Stack CentralDark
| Componente | Status | Ação |
|------------|--------|------|
| `apps/modulos/sol-desktop/` | **Não existe no repo** | Criar a partir do POC |
| `centraldark-voice` (extension) | Existe em `apps/modulos/centraldark-voice/` | Diferente — é Chrome extension |
| `elite-gateway` | Existe | Proxy para `gatewayUrl` |
| `meta-lupa` | Existe | Validar receipts |
| `porta-de-entrada.yml` | Existe | Gate para PR do sol-desktop |

## Próximos Passos Naturais
1. **Criar `apps/modulos/sol-desktop/` no repo** a partir do POC (REUSE_BEFORE_CREATE)
2. **Ajustar tauri.conf.json** — CSP para produção, assinatura Windows
3. **Integrar com `elite-gateway`** — endpoint `/sol/ask` no gateway
4. **Adicionar testes E2E** — voice cycles + receipt validation
5. **Gate de promoção** — 20 voice cycles + no secret leakage (conforme manifesto SOL-VOICE-FIRST-LAB)