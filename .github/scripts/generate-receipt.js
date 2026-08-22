#!/usr/bin/env node
const fs = require('fs');
const { execSync } = require('child_process');

const receipt = {
  schema: "centraldark.runtime.receipt.v1",
  run_id: `${process.env.GITHUB_RUN_ID}-${process.env.GITHUB_RUN_NUMBER}`,
  timestamp: new Date().toISOString(),
  repository: "ServerVpss/CentralDark",
  main_head: process.env.BASE_SHA || process.env.GITHUB_SHA,
  runtime_head: process.env.HEAD_SHA || process.env.GITHUB_SHA,
  host_id_sanitized: execSync('hostname | sha256sum | cut -c1-12', { encoding: 'utf8' }).trim(),
  baseline_sha256: (() => {
    try {
      const discoveryOut = process.env.DISCOVERY_OUT;
      if (!discoveryOut) return "unknown";
      const output = execSync(`find ${discoveryOut} -type f -exec sha256sum {} + | sha256sum | cut -d' ' -f1`, { encoding: 'utf8' });
      return output.trim();
    } catch {
      return "error";
    }
  })(),
  processes: [],
  routes: [],
  detectors: ["discovery", "ufw_conflicts", "validar-continuidade-global", "validar-porta-de-entrada", "validar-mapa"],
  findings: [],
  repairs_attempted: [],
  repairs_succeeded: [],
  repairs_failed: [],
  rollback: null,
  judge_verdict: "NOT_RUN",
  remaining_unknowns: [],
  coverage_scope: ["porta-de-entrada", "discovery", "ufw", "mapa", "identidade"],
  final_status: process.env.JOB_STATUS === "success" ? "PASS" : process.env.JOB_STATUS === "failure" ? "FAIL" : "BLOCKED"
};

fs.writeFileSync(process.env.OUTPUT_FILE, JSON.stringify(receipt, null, 2));
console.log("Receipt generated at:", process.env.OUTPUT_FILE);
