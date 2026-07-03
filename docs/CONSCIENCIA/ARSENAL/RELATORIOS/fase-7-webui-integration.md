# Fase 7 — Arsenal no ChatWebUI (ui.centralldark.com)

**Data:** 03/07/2026
**Status:** ✅ concluída

## O que foi feito

O Arsenal Council agora aparece como 3 "modelos" no dropdown do Open WebUI:

| Modelo no dropdown | Modo | Tempo |
|---|---|---|
| 🎯 Arsenal Router | 1 IA rápida (`slot router`) | ~10s |
| ⚡ Arsenal Parallel | 3 IAs em paralelo + Juiz sintetiza | ~40s |
| 🔥 Arsenal Debate | 2 IAs, 2 rodadas + Veredito | ~90s |

Usuário conversa normal no WebUI, escolhe o modo pelo dropdown, e por baixo dos panos o adapter dispara Elite Gateway (api.centralldark.com/v1) usando os modelos do `regras.json` — **hot-reload** (troca `/router trocar juiz gpt-5` no Telegram e a próxima conversa no WebUI já usa).

## Arquitetura

```
Open WebUI (ui.centralldark.com)
  ├─ OPENAI_API_BASE_URLS: api.centralldark.com/v1 (Elite/GPT/Gemini direto)
  │                        + groq + openrouter + gemini nativo
  │                        + http://host.docker.internal:8090/v1  ← Arsenal Adapter (NOVO)
  │
  └─ ARSENAL ADAPTER (Node/PM2 :8090)
       ├─ /v1/models         → arsenal-router | parallel | debate
       ├─ /v1/chat/completions → dispatch pra Elite Gateway conforme modo
       ├─ Lê regras.json a cada request (hot-reload)
       └─ Salva cada conversa em DEBATES/ (aparece no Conselho Vivo)
```

## Arquivos criados

- `apps/modulos/arsenal-openai-adapter/server.mjs`
- `apps/modulos/arsenal-openai-adapter/package.json`
- `apps/modulos/arsenal-openai-adapter/ecosystem.config.cjs`

## Integração

1. Anexado `http://host.docker.internal:8090/v1` ao `OPENAI_API_BASE_URLS` do WebUI (docker-compose.yml)
2. Anexada key `arsenal-key-local-2026` ao `OPENAI_API_KEYS`
3. PM2 iniciado como `CentralDark-ArsenalAdapter` (auto-restart)
4. `docker compose up -d webui` pra recarregar env

## Ecossistema unificado (agora)

| Frente | Como usar o Arsenal |
|---|---|
| 🤖 Telegram (@srver1bot) | `/router` · `/refinar` · `/debate` |
| 💬 WebUI (ui.centralldark.com) | Dropdown → escolhe `arsenal-*` |
| 📊 Painel (status.centralldark.com/conselho.html) | Vê tudo ao vivo |
| 🧬 Hermes (cron 6h) | Roda debate autônomo em pendências |

**Toda conversa (Telegram OU WebUI) cai no mesmo `DEBATES/` e aparece no Painel.** Cérebro único, várias portas de entrada.

Volta pro [índice do Arsenal](../README.md).
