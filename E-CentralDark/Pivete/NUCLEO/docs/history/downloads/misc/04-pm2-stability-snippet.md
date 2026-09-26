# OUTRO - 04-pm2-stability-snippet.sh
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\centraldark-hardening-pack\centraldark-hardening-pack\scripts\04-pm2-stability-snippet.sh
**SHA:** 08394ee5a1792bf5
**Timestamp:** 2026-08-26T19:10:14.972725
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- max_memory_restart: "512M",

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env bash
# Gera recomendações de estabilidade PM2 a partir do estado atual (não aplica sozinho).
set -Eeuo pipefail

echo "=== Restart counts (sanitizado) ==="
pm2 jlist 2>/dev/null | node -e '
let s=""; process.stdin.on("data",d=>s+=d).on("end",()=>{
  const rows=JSON.parse(s||"[]").map(x=>({
    name:x.name,
    status:x.pm2_env?.status,
    restarts:x.pm2_env?.restart_time||0,
    unstable:x.pm2_env?.unstable_restarts||0
  })).sort((a,b)=>b.restarts-a.restarts);
  for (const r of rows) console.log(`${r.restarts}\t${r.unstable}\t${r.status}\t${r.name}`);
  console.log("\n=== Sugestão ecosystem (por app com restarts altos) ===");
  console.log(`{
  max_restarts: 15,
  min_uptime: "30s",
  exp_backoff_restart_delay: 1000,
  max_memory_restart: "512M",
  kill_timeout: 8000,
  listen_timeout: 10000
}`);
  console.log("\nApps prioritários se restarts > 100:");
  for (const r of rows.filter(x=>x.restarts>100)) console.log("- "+r.name);
})'

echo
echo "Após corrigir causa raiz: pm2 reset <nome>"
echo "STATUS=RECOMMENDATION_ONLY"
```