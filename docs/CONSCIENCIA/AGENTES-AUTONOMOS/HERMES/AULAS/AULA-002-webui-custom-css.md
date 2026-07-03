# AULA-002 — Open WebUI custom.css (tema Esmeralda)

**Data:** 2026-07-03  
**Categoria:** procedimento  
**Pré-requisitos:** nenhum  
**Tempo estimado:** 3 min

## 1. O que é
Sistema de tema 3D Tátil Esmeralda aplicado no Open WebUI via arquivo CSS montado como volume Docker. Substitui variáveis de cor, sombras e border-radius nativos.

## 2. Quando usar
Toda vez que quiser mexer no visual do WebUI (cor, sombra, radius, spacing). **Nunca editar `src/` do open-webui nem tema built-in** — vai perder na próxima atualização.

## 3. Como fazer
1. Editar `apps/modulos/WebUI/custom-css/esmeralda.css` (variáveis no topo)
2. Commit + push (webhook sincroniza pra VPS)
3. Na VPS: `docker restart open-webui`
4. No browser: `Ctrl+Shift+R` pra bypassar cache

## 4. Comandos prontos
```bash
# Após push
docker restart open-webui
docker logs open-webui --tail 20   # verificar sem erro
```

## 5. Armadilhas
- ❌ Editar CSS na VPS direto — perde no próximo pull
- ❌ Esquecer o `Ctrl+Shift+R` — vê versão em cache
- ❌ Cor hardcoded no CSS — usar variáveis `--em-primary`, `--em-radius`

## 6. Verificação
- ✅ `docker ps` mostra `open-webui` como `Up`
- ✅ `curl http://localhost:PORTA/static/custom.css | head` retorna o CSS
- ✅ Botões com sombra 3D, radius arredondado, tema light emerald

## 7. Ver também
- ROTAS-FIXAS/webui-reload.md
- APRENDIZADOS/003-webui-custom-css-rota.md
