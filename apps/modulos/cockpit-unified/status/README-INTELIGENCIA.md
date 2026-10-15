# Setor de Inteligência — status.centralldark.com

Aba dedicada dentro de `ai-review.html` que monitora o caminho
VPS → Lovable Proxy → Lovable AI Gateway.

## Arquivos

| Arquivo | Papel |
|---|---|
| `ai-diag-tick.mjs` | Coletor v2. Roda a cada 60s via PM2 cron. Grava `ai-diag.json`. |
| `ai-diag.json` | Snapshot vivo consumido pela aba "Setor de Inteligência". |
| `ecosystem.config.cjs` | PM2 config oficial (`CentralDark-AiDiag`, cron `* * * * *`). |
| `ai-review.html` | UI (aba "🧠 Setor de Inteligência"). |

## Testes cobertos

1. **proxy /health (local)** — pinga o proxy Lovable dedicado (3102).
   Fallback automático pro Arsenal Proxy (3101) se o dedicado não existir.
2. **gateway público (ping)** — verifica `https://ai.gateway.lovable.dev`
   está alcançável.
3. **chat completion end-to-end** — POST real usando
   `google/gemini-3-flash-preview`. Só roda com `LOVABLE_API_KEY` no env do PM2.
4. **erros_recentes** — lê `~/.pm2/logs/<proxy>-error.log` (últimas 15 linhas).

## Placar

`saude`: `saudavel` (3/3) · `degradado` (1-2/3) · `critico` (0/3).

## Reiniciar

```bash
cd /root/CentralDark/apps/modulos/status
pm2 restart CentralDark-AiDiag || pm2 start ecosystem.config.cjs
pm2 save
```

## Preparar para próxima fase

Para ativar o teste `chat` de verdade:
1. Preencher `apps/modulos/lovable-proxy/.env` (ver `.env.example`).
2. `cd apps/modulos/lovable-proxy && pm2 start ecosystem.config.cjs && pm2 save`.
3. Reiniciar o AiDiag herdando o env: `pm2 restart CentralDark-AiDiag --update-env`.
