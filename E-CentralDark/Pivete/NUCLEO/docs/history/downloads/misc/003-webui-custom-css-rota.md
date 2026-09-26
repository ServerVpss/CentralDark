# OUTRO - 003-webui-custom-css-rota.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\docs\CONSCIENCIA\AGENTES-AUTONOMOS\HERMES\APRENDIZADOS\003-webui-custom-css-rota.md
**SHA:** 05372dead3432ef1
**Timestamp:** 2026-08-28T02:56:50.053717
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- **Regra:** pra mudar visual do WebUI, editar SÓ esse `.css` — nada de mexer em `src/` do open-webui, nem tocar tema built-in.

### Ouro Bruto (primeiros 5000 chars)
```
---
title: "003 Webui Custom Css Rota"
date: 2026-07-05
tags: ["consciencia"]
updated: 2026-07-05
---

# 003 — Open WebUI: custom.css via volume mount

**Data:** 2026-07-03  
**Categoria:** atalho

## Contexto
Fase 3 (Composer/Esmeralda UI) aplicou tema 3D tátil no Open WebUI via volume mount de CSS.

## Aprendizado
- **Arquivo fonte:** `apps/modulos/WebUI/custom-css/esmeralda.css`
- **Montado como:** `/app/backend/static/custom.css:ro` (via `docker-compose.override.yml`)
- **Reload:** `docker restart open-webui` + `Ctrl+Shift+R` no browser
- **Variáveis editáveis no topo:** `--em-primary`, `--em-radius`, sombras 3D

**Regra:** pra mudar visual do WebUI, editar SÓ esse `.css` — nada de mexer em `src/` do open-webui, nem tocar tema built-in.

## Ver também
- AULA-002 (WebUI custom CSS completo)
- ROTAS-FIXAS/webui-reload.md

---

## Conexões Rápidas

- [[00-LEIA-PRIMEIRO]] — portão de entrada
- [[MAPA-DO-CEREBRO]] — visão geral
- [[CONSCIENCIA]] — documento mestre

```