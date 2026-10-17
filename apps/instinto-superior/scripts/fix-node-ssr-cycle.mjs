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
  console.log("SSR_CYCLE_FIX=NO_BRIDGE_SIGNATURE");
} else if (matches.length === 1) {
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
} else {
  throw new Error("SSR_CYCLE_FIX_BLOCKED: more than one circular bridge");
}

// Minimal post-build repair for the measured Nitro 1.168.32 output.
// The generated chunk initializes a server function before createServerFn.
// Move only that declaration to after the function factory is initialized.
// This does not modify auth, CSRF, routes, or server handlers.
for (const entry of entries) {
  const file = join(dir, entry);
  const source = readFileSync(file, "utf8");
  const start = source.indexOf("var lerCerebroVivo_createServerFn_handler = createServerRpc(");
  const factory = source.indexOf("var createServerFn = (options, __opts) => {");
  if (start < 0 || factory < 0 || start > factory) continue;
  const end = source.indexOf("//#endregion", start);
  const target = "var server_exports = /* @__PURE__ */ __exportAll({";
  if (end < 0 || end >= factory || source.split(target).length !== 2)
    throw new Error("SSR_SERVERFN_ORDER_BLOCKED: unexpected Nitro bundle shape");
  const declaration = source.slice(start, end);
  if (!declaration.includes("var lerCerebroVivo = createServerFn("))
    throw new Error("SSR_SERVERFN_ORDER_BLOCKED: missing declaration");
  const updated = (source.slice(0, start) + source.slice(end)).replace(target, declaration + target);
  if (updated.indexOf(declaration) <= updated.indexOf("var createServerFn = (options, __opts) => {"))
    throw new Error("SSR_SERVERFN_ORDER_BLOCKED: initialization still premature");
  const backup = join(dir, entry + ".pre-serverfn-order");
  copyFileSync(file, backup);
  const tmp = file + ".serverfn-tmp";
  writeFileSync(tmp, updated);
  renameSync(tmp, file);
  console.log("SSR_SERVERFN_ORDER=FIXED:" + entry);
}
