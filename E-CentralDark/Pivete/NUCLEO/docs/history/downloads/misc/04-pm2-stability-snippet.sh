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