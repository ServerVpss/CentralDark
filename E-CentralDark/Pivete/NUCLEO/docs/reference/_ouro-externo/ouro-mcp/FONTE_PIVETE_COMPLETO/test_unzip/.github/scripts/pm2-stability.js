let s = "";
process.stdin.on("data", d => s += d).on("end", () => {
  const rows = JSON.parse(s || "[]").map(x => ({
    name: x.name,
    status: x.pm2_env?.status,
    restarts: x.pm2_env?.restart_time || 0,
    unstable: x.pm2_env?.unstable_restarts || 0
  })).sort((a, b) => b.restarts - a.restarts);

  for (const r of rows) console.log(r.restarts + "\t" + r.unstable + "\t" + r.status + "\t" + r.name);
  console.log("\n=== Sugestao ecosystem ===");
  console.log("{\n  max_restarts: 15,\n  min_uptime: \"30s\",\n  exp_backoff_restart_delay: 1000,\n  max_memory_restart: \"512M\",\n  kill_timeout: 8000,\n  listen_timeout: 10000\n}");
  for (const r of rows.filter(x => x.restarts > 100)) console.log("- " + r.name);
});
