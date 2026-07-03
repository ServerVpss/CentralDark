# ROTA FIXA — Comandos curl baseline (teste rápido dos 4 verbos)

## Rodar na VPS (não funciona fora — chave é local)

```bash
for m in arsenal-router arsenal-parallel arsenal-debate arsenal-hermes; do
  echo "=== $m ===" &&
  time curl -s http://localhost:8090/v1/chat/completions \
    -H "Authorization: Bearer arsenal-key-local-2026" \
    -H "Content-Type: application/json" \
    -d "{\"model\":\"$m\",\"messages\":[{\"role\":\"user\",\"content\":\"responde só ok\"}]}" \
    | jq -r '.choices[0].message.content // .error'
done
```

## Latências esperadas

- `arsenal-router`: ~2.5s
- `arsenal-parallel`: ~10s
- `arsenal-debate`: ~43s
- `arsenal-hermes`: ~50s

## Sinais de saúde

- ✅ Todos retornam 200 com content string
- ⚠️ Um único 5xx → investigar log daquele modelo
- ❌ 401/403 → key mudou, atualizar em todo lugar

## Script pronto (proposto)

`/root/CentralDark/scripts/carga-arsenal.sh` — salva output em `/root/CentralDark/logs/arsenal-carga-$(date +%s).json`.
