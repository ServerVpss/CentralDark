# Mass-triage live-verification recipe + output template

## Live endpoint probe (run after splitting bot/human issues)
```bash
# Health / 5xx endpoints cited in alerts
for u in \
  "https://api.centralldark.com/health" \
  "https://mcp.centralldark.com/health" \
  "https://mcp.centralldark.com/status.json" \
  "https://install.centralldark.com/status.json" \
  "https://status.centralldark.com/" ; do
  echo "=== $u ==="
  curl -s -o /dev/null -w "HTTP %{http_code} | time %{time_total}s\n" --max-time 8 "$u" 2>&1 \
    || echo "FETCH FAILED (timeout/conn reset = status 0 / fetch failed)"
done

# CORS-style alerts ("sem CORS no painel"): check the header on a 200 response
for u in "https://mcp.centralldark.com/tools.json" "https://api.centralldark.com/health"; do
  echo "=== CORS: $u ==="
  curl -s -I --max-time 8 "$u" | grep -i "access-control-allow-origin" || echo "(no ACAO header)"
done
```
Status interpretation:
- `200` (+ ACAO header present for CORS alerts) → recovered. Mark JÁ_CORRIGIDA.
- `502/503/404` or `000`/fetch-failed (timeout) → still failing. Mark FALHA_CONFIRMADA.
- `200` but ACAO missing on a CORS alert → CORS gap remains (previously FALHA, still open).

## Compact output-table template
Group by root cause; one line per issue within the group.

```
### Causa raiz N: <nome>  (<class> count)
- #NN <CLASS> <curto resumo com evidência>
- ...

### Resumo numérico
JÁ_CORRIGIDA=x · FALHA_CONFIRMADA=y · PRECISA_DE_PR=z · BLOQUEADA_POR_PIVETE=w · OBSOLETA=0 · DUPLICADA=0

### Achados-chave
- <insight acionável, ex.: "único endpoint ainda caído é X (503) — liga #a, #b, #c">
- <gating blocker, ex.: "GitHub Bot Controller quebrado impede bots assign:* de agir">
```
Always state that you verified endpoints live and did NOT close issues / open PRs.

## Note on "verify before reporting"
Auto-alert bots (Sentinela etc.) relabel/open slowly. On the audit that produced this skill:
26 Sentinela alerts total. 15 were already recovered (endpoints back to 200 + CORS `*`).
Only `install.centralldark.com` (status.json → 503) was genuinely still down across runs.
Reporting all 26 as "open outages" would have been wrong by 11.
