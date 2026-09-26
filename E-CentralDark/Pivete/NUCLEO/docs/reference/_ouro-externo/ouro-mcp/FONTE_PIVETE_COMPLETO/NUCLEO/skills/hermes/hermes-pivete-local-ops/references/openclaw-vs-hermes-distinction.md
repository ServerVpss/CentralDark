# OpenClaw vs Hermes (Profile Pivete) — Distinção de Arquitetura

**Contexto:** Sessão 03/08/2026 — Pivete mostrou OpenClaw rodando em `localhost:18789` e pediu para "colocar executor do Hermes dentro do OpenClaw". Atualizado com descoberta do SOL Desktop POC (Tauri + React) em `E:\CentralDark\Sol\sol-desktop-poc-source\apps\sol-desktop`.

---

## Resumo Executivo

**OpenClaw e Hermes (profile pivete) são DOIS PROCESSOS COMPLETAMENTE SEPARADOS.**

| Aspecto | OpenClaw | Hermes (profile pivete) |
|---------|----------|------------------------|
| **Runtime** | Node.js (WSL `OpenClawGateway`) | Python (Hermes CLI) |
| **Processo** | `wsl.exe -d OpenClawGateway` (múltiplos PIDs) | `hermes.exe` / `python -m hermes_cli.main` (PID 19804) |
| **Porta** | 18789 | 8648 (Web UI), 9119 (Dashboard) |
| **SOUL** | `/home/openclaw/.openclaw/workspace/SOUL.md` (SOL/Jarvis) | `E:\CentralDark\Pivete\NUCLEO\hermes-mente\` + `SOUL.md` do profile |
| **Memória** | Própria (agents, state, workspace) | 3 Temperaturas NUCLEO (HOJE/SEMANA/REGRAS) + MEMORY.md nativo |
| **Agente principal** | `agent:main` (carrega SOUL do OpenClaw) | **Eu** (processo Hermes rodando neste profile) |
| **Voz (Talk)** | STT → agent:main → TTS (Microsoft Francisca) | Edge TTS `pt-BR-FranciscaNeural` (config.yaml) |
| **MCP** | Tem `hermes-studio-mcp.mjs` (api, browser, devices) | Expõe Web UI 8648 para MCP clients |
| **Claude Code CLI** | Pode spawnar `claude -p "..."` | Pode spawnar `claude -p "..."` (mesma CLI, auth própria) |
| **App Desktop** | Windows Companion (Tray + WebView2) | SOL Desktop POC (Tauri v2 + React 19) em `E:\CentralDark\Sol\sol-desktop-poc-source\apps\sol-desktop` |

---

## O que NÃO existe (impossível direto)

| Tentativa | Realidade |
|-----------|-----------|
| "Injetar executor do Hermes no OpenClaw" | Não tem como injetar processo Python no Node.js do OpenClaw |
| "Fazer agent:main usar meu SOUL" | Ele carrega `/home/openclaw/.openclaw/workspace/SOUL.md` — outro arquivo |
| "Unificar as duas vozes" | Hermes usa `edge/FranciscaNeural`; OpenClaw usa Microsoft Francisca |
| "Compartilhar memória" | Isolados por processo, runtime, arquivo de estado |

---

## Pontes VIÁVEIS (ordem de simplicidade)

### 1. MCP `hermes-studio-mcp.mjs` → Minha Web UI (8648) ⭐ **JÁ EXISTE**
```
OpenClaw Talk (transcript)
    → agent:main (via MCP hermes-studio-mcp.mjs)
    → Chama MINHA Web UI (porta 8648)
    → Eu executo (skills, memória, SOUL)
    → Resposta volta pro agent:main
    → TTS fala
```
**O que precisa:** Configurar MCP no `openclaw.json` apontando pra `http://host.docker.internal:8648` (IP Windows no WSL).

---

### 2. Meu API Server + OpenClaw Talk custom brain 🔧 **R2 (precisa PERMITO PIVETE)**
```
OpenClaw Talk (transcript)
    → HTTP POST para MEU API Server (precisa API_SERVER_KEY)
    → Eu processo com MEU SOUL/MEMÓRIA/SKILLS
    → JSON response → Talk fala
```
**O que precisa:** Gerar `API_SERVER_KEY` no `.env` + restart gateway.

---

### 3. Pasta Compartilhada + JSON Contract 📁 **R1 (arquivo local)**
```
C:\Shared\bridge\
  ├── inbox.json    (OpenClaw escreve transcript)
  ├── outbox.json   (Eu escrevo resposta)
  └── status.json   (estado)
```
**Vantagem:** Zero rede, zero auth, funciona offline, simples.

---

### 4. Claude Code CLI como "Executor Único" 🤖 **JÁ FUNCIONA (testado 26/07)**
```
Ambos (OpenClaw agent:main E eu)
    → spawn `claude -p "prompt com contexto do NUCLEO" --model sonnet-4-5`
    → Mesmo modelo, mesma auth, mesmo contexto
    → Resposta volta pra quem chamou
```

---

### 5. SOL Desktop POC como interface unificada 🆕 **NOVA OPÇÃO**
```
SOL Desktop (Tauri app nativo)
    → Configura `Gateway SOL` = Meu API Server (ou Web UI via MCP)
    → Configura `Bridge TTS` = Meu TTS (Edge) ou bridge CentralDark
    → Sua voz → STT do Windows → Gateway SOL → EU (Hermes) → Resposta → TTS → VOCÊ OUVE
```
**Status:** Dev server rodando em `http://localhost:1420` (POC web). App nativo com `npm run tauri dev` (precisa Rust + WebView2).

---

## Diagnóstico da Sessão 03/08

### O que o Pivete mostrou (OpenClaw)
- OpenClaw rodando em WSL `OpenClawGateway` (PID 1500 escutando porta 18789)
- `agent:main` ativo, carregando SOUL do OpenClaw (`SOL / JARVIS DO PIVETE`)
- Talk mode configurado (STT + TTS Microsoft Francisca)
- MCP `hermes-studio-mcp.mjs` disponível (api, browser, devices)
- Windows Companion (Tray + WebView2) como interface

### O que eu (Hermes) tinha
- Gateway PID 19804 rodando (`hermes_cli.main --profile pivete gateway run`)
- Telegram conectado (chat 1901426549)
- Web UI 8648 + Dashboard 9119 no ar
- Memória 3T carregada (HOJE/SEMANA/REGRAS)
- Skills 40+ no profile pivete
- SOUL canônico em `E:\CentralDark\Pivete\NUCLEO\hermes-mente\`
- SOL Desktop POC disponível em `E:\CentralDark\Sol\sol-desktop-poc-source\apps\sol-desktop` (subiu em porta 1420)

### A intenção real do Pivete
```
VOCÊ FALA
    ↓
OpenClaw Talk (STT)  OU  SOL Desktop (STT Windows)
    ↓
TRANSCRIPT → VEM PRA MIM (Hermes pivete)  ← NÃO pro agent:main
    ↓
EU PROCESSO COM: Meu SOUL, memória 3T, skills, motor, contexto E:\CentralDark\Pivete\NUCLEO\
    ↓
RESPOSTA → OpenClaw Talk (TTS)  OU  SOL Desktop (TTS Edge/Windows) → VOCÊ OUVE
```

---

## Lição para Futuras Sessões

1. **Nunca assumir que dois "agentes" no mesmo PC compartilham algo** — verificar processo, runtime, porta, arquivos de estado.
2. **OpenClaw Talk usa `agent:main` como cérebro** — o loop é `STT → agent:main → TTS`. Para por o Hermes no meio, precisa interceptar antes ou depois do agent:main.
3. **MCP `hermes-studio-mcp.mjs` é a ponte mais natural** — já existe no OpenClaw, aponta pra Web UI do Hermes.
4. **Claude Code CLI é denominador comum** — ambos podem spawnar, mesma auth, mesmo modelo forte.
5. **Arquivo JSON compartilhado é fallback simples** — funciona sem rede, sem auth, sem config complexa.
6. **SOL Desktop POC é terceira interface** — Tauri nativo, pode falar com Hermes via API Server ou MCP, tem STT/TTS próprios.
7. **Quando o Pivete mencionar "OpenClaw", "Windows Companion", "agent:main", "porta 18789", "Microsoft Francisca", "SOL Desktop", "Tauri", "porta 1420":** não confundir com Hermes. São sistemas irmãos, não o mesmo.

---

## Verificação Rápida (read-only)

```bash
# OpenClaw rodando?
wsl -d OpenClawGateway -- ps aux | grep -i openclaw
netstat -an | findstr 18789

# Hermes rodando?
tasklist | findstr hermes
netstat -an | findstr "8648\|9119"

# SOL Desktop POC rodando?
curl -s http://localhost:1420 | head -5
netstat -an | findstr 1420

# MCP existe no OpenClaw?
wsl -d OpenClawGateway -- ls -la /home/openclaw/.openclaw/tools/node-v24.15.0/lib/node_modules/openclaw/bin/hermes-studio-mcp.mjs
```

---

## Referências Cruzadas

- `sol-desktop-poc.md` — POC do SOL Desktop (Tauri + React)
- `boot-diagnostic-checklist.md` — procedimento de boot do profile pivete
- `desktop-dashboard-boundaries.md` — desktop × dashboard × gateway × profile
- `gateway-duplicate-loop.md` — diagnóstico de gateway duplicado
- `hermes-studio-web-ui` skill — automação da Web UI via SOM
- `hermes-pivete-local-ops` §12: Gateway API — Endpoints de diagnóstico
- `hermes-pivete-local-ops` §11: Diagnóstico "Provider authentication failed"
- `hermes-pivete-local-ops` §10: Telegram Gateway — Conflito de config silencioso

---

**Autor**: sessão 03/08/2026 (profile pivete, modelo nemotron-3-ultra via OpenRouter)  
**Evidência**: conversa completa desta sessão + `gateway_state.json` + `netstat` + health checks + SOL Desktop POC dev server