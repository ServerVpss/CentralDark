# 🩸 elite-recon-ia
Varredura paralela **Gemini 2.5 Pro + Flash** com rate-limit token-bucket, backoff exponencial em 429 (30s→60s→...→10min) e health-check do arsenal (`CentralDark-CondefonteV35`, Gemini Pro, Gemini Flash, darkai) a cada 5min via PM2 cron.

## Uso
- `node src/recon.mjs "prompt"` — varredura paralela
- `node src/recon.mjs --arquivo alvo.txt --system "..."`
- `node src/recon.mjs --lote prompts.jsonl`
- `node src/health-check.mjs` — health manual

## PM2
```
cd /root/CentralDark/apps/modulos/elite-recon-ia
npm install
pm2 start ecosystem.config.cjs && pm2 save
```

## Env
- `GEMINI_API_KEY` (obrigatório)
- `DARKAI_URL` (opcional, default `http://localhost:8891/health`)

## Logs
- `logs/recon.jsonl`, `logs/health.jsonl`, `logs/health-erros.log`
