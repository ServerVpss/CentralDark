#!/usr/bin/env node
/**
 * Sync bidirecional Linear ↔ docs/PENDENCIAS.md
 *
 * Modo padrão (dry-run):
 *   node scripts/sync/linear-pendencias.mjs
 *
 * Modo aplicar (commit no PENDENCIAS + fechar issues sincronizadas):
 *   node scripts/sync/linear-pendencias.mjs --apply
 *
 * Fluxo:
 *  1. Lê PENDENCIAS.md → extrai itens (#N título, status ✅/🟠, link SEG-N opcional).
 *  2. Lê Linear (team Segredo) → todas issues SEG-* + status.
 *  3. Linear → PENDENCIAS:
 *     - Issue marcada como Done/Completed e item correspondente ainda aberto no MD
 *       → marca ✅ no MD.
 *     - Issue cancelada → marca ❌.
 *  4. PENDENCIAS → Linear:
 *     - Item ✅ ENTREGUE/FECHADO/CONCLUÍDO no MD e issue ainda aberta no Linear
 *       → fecha issue (status=resolved/done).
 *  5. Relatório sanitizado em /tmp/linear-sync-report.md (sem tokens).
 *
 * Vars: LINEAR_API_KEY (Personal API Key, scope: write).
 */

import fs from "node:fs/promises";
import path from "node:path";

const ROOT = path.resolve(new URL("../..", import.meta.url).pathname);
const FILE = path.join(ROOT, "docs/PENDENCIAS.md");
const APPLY = process.argv.includes("--apply");
const TOKEN = process.env.LINEAR_API_KEY;
if (!TOKEN) {
  console.error("LINEAR_API_KEY ausente — abortando (não expor token).");
  process.exit(2);
}

async function linear(query, variables = {}) {
  const r = await fetch("https://api.linear.app/graphql", {
    method: "POST",
    headers: { Authorization: TOKEN, "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });
  if (!r.ok) throw new Error(`Linear HTTP ${r.status}`);
  const j = await r.json();
  if (j.errors) throw new Error(`Linear: ${JSON.stringify(j.errors).slice(0, 200)}`);
  return j.data;
}

// --- 1. Ler PENDENCIAS.md ---
const md = await fs.readFile(FILE, "utf8");
const lines = md.split("\n");

const items = []; // { line, pendNum, segId, done, raw }
const HEAD = /^### #?(\d+)[.\s]/;
for (let i = 0; i < lines.length; i++) {
  const m = lines[i].match(HEAD);
  if (!m) continue;
  const raw = lines[i];
  const seg = (raw.match(/SEG-(\d+)/) || [])[0] || null;
  const done = /✅\s*(ENTREGUE|FECHAD[OA]|CONCLUÍD[OA]|DISPENSADO)/i.test(raw);
  items.push({ line: i, pendNum: m[1], segId: seg, done, raw });
}

// --- 2. Ler Linear ---
const { team } = await linear(`query { team(id: "9fc69eaa-7e2a-4d5c-9ece-f3b81e6c8a26") {
  id
  states { nodes { id name type } }
  issues(first: 200) { nodes { id identifier title state { name type } } }
} }`);

const stateByType = Object.fromEntries(team.states.nodes.map((s) => [s.type, s]));
const issuesById = Object.fromEntries(team.issues.nodes.map((i) => [i.identifier, i]));

// --- 3. Comparar ---
const actions = []; // {kind, target, msg}

for (const item of items) {
  if (!item.segId) continue;
  const issue = issuesById[item.segId];
  if (!issue) {
    actions.push({ kind: "warn", msg: `${item.segId} citado no MD #${item.pendNum} mas não existe no Linear` });
    continue;
  }

  const linearDone = ["completed", "canceled"].includes(issue.state.type);

  // Linear → MD: issue fechada, MD aberto
  if (linearDone && !item.done) {
    actions.push({
      kind: "md-mark-done",
      target: item.line,
      msg: `#${item.pendNum} (${item.segId}) → marcar ✅ no MD (Linear: ${issue.state.name})`,
    });
    lines[item.line] = lines[item.line].replace(
      / · \[`SEG-\d+`\]/,
      ` — ✅ SINCRONIZADO via Linear (${issue.state.name})$&`
    );
  }

  // MD → Linear: MD fechado, issue aberta
  if (item.done && !linearDone) {
    actions.push({
      kind: "linear-close",
      target: issue.id,
      identifier: issue.identifier,
      msg: `${issue.identifier} #${item.pendNum} → fechar no Linear (MD: ✅)`,
    });
  }
}

// --- 4. Aplicar ---
let mutated = false;
if (APPLY) {
  if (actions.some((a) => a.kind === "md-mark-done")) {
    await fs.writeFile(FILE, lines.join("\n"));
    mutated = true;
  }
  const doneState = stateByType.completed;
  for (const a of actions.filter((x) => x.kind === "linear-close")) {
    await linear(
      `mutation($id: String!, $state: String!) { issueUpdate(id: $id, input: { stateId: $state }) { success } }`,
      { id: a.target, state: doneState.id }
    );
  }
}

// --- 5. Relatório ---
const report = [
  `# Linear ↔ PENDENCIAS sync (${new Date().toISOString()})`,
  `Mode: ${APPLY ? "APPLY" : "DRY-RUN"}`,
  `Itens no MD: ${items.length} · Issues no Linear: ${team.issues.nodes.length}`,
  ``,
  ...actions.map((a) => `- [${a.kind}] ${a.msg}`),
  ``,
  mutated ? "✏️ docs/PENDENCIAS.md atualizado." : "📖 docs/PENDENCIAS.md inalterado.",
].join("\n");
console.log(report);
await fs.mkdir("/tmp", { recursive: true });
await fs.writeFile("/tmp/linear-sync-report.md", report);
