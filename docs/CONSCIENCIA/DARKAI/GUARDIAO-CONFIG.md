---
title: "GUARDIÃO — Configurações (@Guardiaonotify_bot)"
date: 2026-07-14
tags: ["consciencia", "darkai", "seguranca", "config"]
updated: 2026-07-14
---

```
╔══════════════════════════════════════════╗
║  🛡️  GUARDIÃO · MAPA DE CONFIGURAÇÕES     ║
║      @Guardiaonotify_bot                   ║
╠══════════════════════════════════════════╣
║  Terminal Grok  ✅ real (grok CLI)         ║
║  Claude Code    ✅ CLI real (2 funções)    ║
║  Central Segur. ✅ botões pra leigo        ║
║  Skills         ✅ inventário + GitHub     ║
║  Login X/Grok   ✅ device-code (seguro)    ║
║  Áudio          🎙️ toggle (precisa key STT)║
║  Cards          ✅ monoespaçado (Hermes)   ║
╚══════════════════════════════════════════╝
```

> **Bot:** `@Guardiaonotify_bot` · **PM2:** `CentralDark-GuardiaoBot` (id 29)
> **Setor:** SEGURANÇA (Grok). Hermes `@srver1bot` é setor separado — não misturar.
> **Lema:** não quebrar nada, só melhorar.

---

## 📂 Onde fica cada coisa

| O quê | Caminho |
|---|---|
| Código do bot | `apps/bot-telegram/guardiao-security-bot.cjs` |
| Motor Grok terminal | `scripts/grok-tmp-file-bridge.mjs` (PM2 `CentralDark-GrokTmpBridge` id 33) |
| Secrets/env | `secrets/.env` e `secrets/telegram-alerts.env` |
| Auth da conta X/Grok | `/root/.grok/auth.json` |
| Memória própria do Grok | `--experimental-memory` + `/root/Grock/mem/` |
| Allowlist segurança | `secrets/guardiao-allowlist.json` |
| Sessão IA autorizada | `secrets/guardiao-auth-session.json` |

---

## 🎛️ Botões (tudo pelo Telegram, sem terminal)

- **🏠 /menu** — painel principal
- **🛡️ Central Segurança** (`/seg`) — Escudo (raio-x), Tentativas, Banir IP, Liberar, Blindagem SSH
- **🛡️ /escudo** — raio-x de segurança na hora
- **🧰 Skills** (`/skills`) — inventário + 📦 instalar do link do GitHub
- **🤖 Claude Code** (`/claude`) — 💬 Chat (ap7) e 🖥️ Code (CLI real que executa)
- **🟣 Grok terminal** — conversa normal, executa comando de verdade
- **🔐 X/Grok login** — entrar/sair da Plataforma X
- **🎙️ Áudio ON/OFF** — liga/desliga transcrição de voz

---

## 🔐 Login / Logout da Plataforma X (Grok)

Fluxo **device-code OAuth** (oficial x.ai, seguro — não captura senha):

1. Aperte **🔐 Entrar na X/Grok**.
2. O bot manda um **link + código**.
3. Abra o link no navegador, cole o código, autorize na X.
4. O bot avisa **✅ LOGADO**. Pronto — o terminal Grok usa esse acesso.

**Sair:** 🚪 Logout (pede confirmação, pois desconecta o terminal Grok até logar de novo).

CLI equivalente: `grok login --device-auth` / `grok logout`.

---

## 🎙️ Módulo de Áudio (opcional)

Liga/desliga pelo botão **🎙️ Áudio**. Quando ligado, você manda um áudio no Telegram e ele vira comando/conversa.

**Para funcionar de verdade, precisa de uma key de transcrição (STT).** Configure em `secrets/.env`:

```env
# STT compatível com OpenAI (/v1/audio/transcriptions)
AUDIO_STT_URL=https://api.tokenrouter.com/v1/audio/transcriptions
AUDIO_STT_KEY=<sua_key>
AUDIO_STT_MODEL=whisper-1
```

Depois: `pm2 restart CentralDark-GuardiaoBot --update-env`.

Sem essas variáveis, o áudio liga mas avisa que falta a key (não quebra nada).

---

## ⚙️ Variáveis de ambiente (secrets/.env)

| Variável | Pra quê | Default |
|---|---|---|
| `GUARDA_TELEGRAM_BOT_TOKEN` | token do @Guardiaonotify_bot | — |
| `GUARDA_TELEGRAM_CHAT_ID` | seu chat admin | — |
| `GROK_BIN` | caminho do grok CLI | `/root/.grok/bin/grok` |
| `GROK_CWD` | pasta de trabalho do Grok | `/root/Grock` |
| `CLAUDE_BIN` | caminho do claude CLI | `/usr/bin/claude` |
| `CLAUDE_CODE_CWD` | pasta do Claude Code | `/root/CentralDark` |
| `AUDIO_STT_URL/KEY/MODEL` | transcrição de áudio | vazio (desligado) |
| `TOKENROUTER_API_KEY` | fallback texto do Grok | — |

---

## 🔁 Como aplicar mudança de config

```bash
# depois de editar secrets/.env:
pm2 restart CentralDark-GuardiaoBot --update-env
pm2 restart CentralDark-GrokTmpBridge --update-env
```

> Estado vivo (allowlist, sessão) não vira commit na main. Código/doc = GitHub. Ver `CLAUDE.md`.

---

## Conexões Rápidas

- [[00-LEIA-PRIMEIRO]] — portão de entrada
- [[MAPA-DO-CEREBRO]] — visão geral
- [[CONSCIENCIA]] — documento mestre
