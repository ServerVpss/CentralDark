---
title: "ANALISE OVERCLOCK EXE"
date: 2026-08-26
tags: ["consciencia"]
updated: 2026-08-26
---

# Análise estática — overclock.exe

**Path:** `../overclock.exe` (~14,8 MB)  
**Data:** 2026-07-12  
**Método:** só estático (PE + strings). Sem execução.

## Resultado

| Campo | Valor |
|--------|--------|
| Formato | PE32+ GUI **x86-64** (Windows 64-bit) |
| Stack principal | **Tauri** (Rust + WebView) |
| UI | Frontend web empacotado (`dist`, Vite `localhost:5173` em dev) |
| Runtime web | **WebView2** (Windows) |
| Sidecar | **Node** (`node.exe`, `OVERCLOCK_NODE_BIN`, `OVERCLOCK_SIDECAR_PATH`) |
| Updater | GitHub releases `ustoppble/overclock-releases` + `latest.json` |
| Deep link | `overclock://callback` |
| Dados locais | `%APPDATA%` / `.overclock-app` / `session.json` |

## Evidências (strings no binário)

- `window.__TAURI_INTERNALS__`, `Tauri IPC`, `src-tauri`
- `OVERCLOCK_RESOURCES_DIR`, `OVERCLOCK_VERSION` / `1.1.0`
- `packages/shell`, `sidecar`, `app:sidecar-restarted`
- `http://localhost:5173/` (pipeline Vite de dev)
- `nsis` / instalador Windows típico de apps Tauri

## Como fazer o teu (espelho conceitual)

Não copiar o produto; copiar a **arquitetura**:

1. **Tauri 2.x** (ou 1.x) — `src-tauri` em Rust  
2. **Frontend** — React/Vite (ou similar) em `packages/shell` ou `src`  
3. **WebView2** no Windows (nativo do SO)  
4. Opcional: **sidecar Node** se precisar de runtime JS pesado fora do webview  
5. Updater via releases GitHub  

Scaffold típico:

```bash
npm create tauri-app@latest
# frontend: React + TypeScript + Vite
```

## O que NÃO é

- Não é Electron puro (apesar de strings genéricas “electron*” em dicionário/ruído)  
- Não é app .NET principal (sem stack CLR dominante)  
- Não é só um site: é **desktop** com shell Tauri + UI web  

## Segurança

- `.gitignore` no planão ignora `*.exe` / `*.dll` (não versionar binário)  
- Preferir manter binários só em `lab-bin/`

---

## Conexões Rápidas

- [[00-LEIA-PRIMEIRO]] — portão de entrada
- [[MAPA-DO-CEREBRO]] — visão geral
- [[CONSCIENCIA]] — documento mestre
