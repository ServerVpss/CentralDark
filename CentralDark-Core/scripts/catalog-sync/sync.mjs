#!/usr/bin/env node
import { execSync } from "node:child_process";
import fs from "node:fs";

const raw = execSync("pm2 env 27", { encoding: "utf8" }).replace(/\x1b\[[0-9;]*m/g, "");
const url = raw.match(/^SUPABASE_DB_URL:\s*(.+)$/m)[1].trim();
const m = url.match(/^postgresql:\/\/([^:]+):(.+)@([^@]+)$/);
const PGURL = `postgresql://${m[1]}:${encodeURIComponent(m[2])}@${m[3]}`;

async function main() {
  const res = await fetch("https://mcp.centralldark.com/tools.json");
  if (!res.ok) throw new Error("fetch " + res.status);
  const data = await res.json();
  const tools = data.tools || (data.toolNames ? data.toolNames.map(n => ({ name: n })) : []);
  const server = data.server || { name: "centralldark-mcp", version: data.catalogVersion || "1.0.0" };

  const sqlFile = "/tmp/catalog-sync.sql";
  const lines = [
    "BEGIN;",
    `INSERT INTO catalog.sync_runs(status) VALUES('running') RETURNING id \\gset run_`,
    `INSERT INTO catalog.servers(name,description,version,base_url) VALUES(${q(server.name)},${q(server.description||"MCP CentralDark")},${q(server.version||"1.0.0")},'https://mcp.centralldark.com') ON CONFLICT(name) DO UPDATE SET version=EXCLUDED.version,updated_at=now() RETURNING id \\gset server_`,
  ];
  for (const t of tools) {
    lines.push(
      `INSERT INTO catalog.tools(server_id,name,description,category,tags,version,input_schema,output_schema) VALUES(:'server_id',${q(t.name)},${q(t.description||null)},${q(t.category||null)},ARRAY[${(t.tags||[]).map(q).join(",")}]::text[],${q(t.version||"1.0.0")},${q(JSON.stringify(t.input_schema||null))}::jsonb,${q(JSON.stringify(t.output_schema||null))}::jsonb) ON CONFLICT(server_id,name) DO UPDATE SET description=EXCLUDED.description,version=EXCLUDED.version,input_schema=EXCLUDED.input_schema,output_schema=EXCLUDED.output_schema,updated_at=now();`
    );
  }
  lines.push(
    `UPDATE catalog.sync_runs SET status='success', tools_found=${tools.length}, finished_at=now() WHERE id=:'run_id';`,
    "COMMIT;",
    `SELECT count(*) FROM catalog.tools;`
  );
  fs.writeFileSync(sqlFile, lines.join("\n"));
  const out = execSync(`psql "${PGURL}" -v ON_ERROR_STOP=1 -f ${sqlFile}`, { encoding: "utf8" });
  console.log(out.split("\n").slice(-15).join("\n"));
}
function q(v) { if (v===null||v===undefined) return "NULL"; return "'" + String(v).replace(/'/g,"''") + "'"; }
main().catch(e => { console.error("SYNC FAIL:", e.message); process.exit(1); });
