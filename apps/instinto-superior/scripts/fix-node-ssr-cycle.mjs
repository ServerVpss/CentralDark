// CentralDark Instinto Superior — ajuste mínimo do grafo Nitro node-server.
// Corrige somente a dependência ESM circular gerada pelo bundle, sem alterar CSRF, auth ou handlers.
import { readFileSync, readdirSync, mkdirSync, copyFileSync, writeFileSync, renameSync } from "node:fs";
import { join, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";

const app = dirname(dirname(fileURLToPath(import.meta.url)));
const dir = join(app, ".output/server/_ssr");
const ssrPath = join(dir, "ssr.mjs");
const entries = readdirSync(dir).filter((name) => /^server-[\w-]+\.mjs$/.test(name));
const prefix = /^import \{ s as server_exports \} from "\.\/([^"\n]+)";\n/;
const matches = entries.map((name) => ({ name, text: readFileSync(join(dir, name), "utf8") }))
  .filter(({ text }) => prefix.test(text));
const ssr = readFileSync(ssrPath, "utf8");
if (matches.length === 0) {
  // Newer Nitro output has no circular bridge: the SSR entry imports the
  // CSRF middleware directly and the loader resolves the server entry.
  // Treat that shape as already safe instead of mutating or failing closed.
  const serverImports = ssr.match(/import\("\.\/(server-[\w-]+\.mjs)"\)/g) ?? [];
  const serverMatch = ssr.match(/import\("\.\/(server-[\w-]+\.mjs)"\)/);
  const serverEntry = serverMatch?.[1];
  const directCsrf = serverEntry
    ? readFileSync(join(dir, serverEntry), "utf8").includes("createCsrfMiddleware")
    : false;
  if (serverImports.length === 1 && directCsrf) {
    console.log("SSR_CYCLE_FIX=NOT_REQUIRED");
    console.log("CSRF_INTACT=PASS");
    process.exit(0);
  }
  if (/import\("\.\/server-[\w-]+\.mjs"\)/.test(ssr)) {
    throw new Error("SSR_CYCLE_FIX_BLOCKED: server entry shape changed without direct CSRF proof");
  }
}
if (matches.length !== 1) throw new Error(`SSR_CYCLE_FIX_BLOCKED: expected one circular bridge, found ${matches.length}`);
const { name, text } = matches[0];
const target = text.match(prefix)?.[1];
if (!target || !entries.includes(target)) throw new Error("SSR_CYCLE_FIX_BLOCKED: target entry missing");
const targetText = readFileSync(join(dir, target), "utf8");
if (!targetText.includes("createCsrfMiddleware") || !targetText.includes("server_exports as s"))
  throw new Error("SSR_CYCLE_FIX_BLOCKED: handler or CSRF contract changed");
const oldExport = ", server_exports as t";
const oldLoader = `import("./${name}").then((n) => n.t)`;
if (text.split(oldExport).length !== 2 || ssr.split(oldLoader).length !== 2)
  throw new Error("SSR_CYCLE_FIX_BLOCKED: bundle anchors changed");
const newBridge = text.replace(prefix, "").replace(oldExport, "");
const newSsr = ssr.replace(oldLoader, `import("./${target}").then((n) => n.s)`);
if (!newBridge.includes("createCsrfMiddleware") || !newSsr.includes(`import("./${target}")`))
  throw new Error("SSR_CYCLE_FIX_BLOCKED: CSRF/entry invariants failed");
const backupDir = join(app, ".output/.cyclefix-backup");
mkdirSync(backupDir, { recursive: true });
for (const original of [join(dir, name), ssrPath]) copyFileSync(original, join(backupDir, basename(original)));
const safeReplace = (path, updated) => {
  const tmp = path + ".cyclefix-tmp";
  writeFileSync(tmp, updated);
  renameSync(tmp, path);
};
try {
  safeReplace(join(dir, name), newBridge);
  safeReplace(ssrPath, newSsr);
} catch (error) {
  for (const original of [join(dir, name), ssrPath]) {
    copyFileSync(join(backupDir, basename(original)), original);
  }
  throw error;
}
console.log("SSR_CYCLE_FIX=PASS");
console.log("CSRF_INTACT=PASS");
console.log("SSR_ENTRY=" + target);
