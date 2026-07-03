# ROTA FIXA — Reload do Open WebUI após mudar CSS

## Passo único

```bash
docker restart open-webui
```

Depois: **`Ctrl+Shift+R`** no browser pra forçar recarga sem cache.

## Onde vive o CSS

- Arquivo: `apps/modulos/WebUI/custom-css/esmeralda.css`
- Mount: `/app/backend/static/custom.css:ro`
- Definido em: `apps/modulos/WebUI/docker-compose.override.yml`

## Editar cor rapidamente

Só variáveis no topo do `esmeralda.css`:

```css
:root {
  --em-primary: 160 84% 39%;   /* emerald HSL */
  --em-radius: 12px;
}
```

## Verificação

```bash
docker ps | grep open-webui   # tem que estar Up
curl -s http://localhost:PORTA_WEBUI/static/custom.css | head -5
```
