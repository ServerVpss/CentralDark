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
