import { z } from "zod";
import { readdirSync, readFileSync, statSync, appendFileSync, mkdirSync, existsSync } from "node:fs";
import { join as pathJoin, sep } from "node:path";

const DR = "/root/CentralDark/secrets";
const LOG_DIR = "/root/CentralDark/logs";
const AUDIT = pathJoin(LOG_DIR, "mcp-vault-audit.log");

function audit(action, name, meta) {
  try {
    if (!existsSync(LOG_DIR)) mkdirSync(LOG_DIR, { recursive: true });
    const line = JSON.stringify({ ts: new Date().toISOString(), action, name, ...(meta || {}) }) + "\n";
    appendFileSync(AUDIT, line);
  } catch (_) {}
}

function safeResolve(name) {
  if (!name || typeof name !== "string") throw new Error("nome obrigatorio");
  if (name.includes("..") || name.includes("/") || name.includes("\\")) throw new Error("nome invalido");
  const full = pathJoin(DR, name);
  if (!full.startsWith(DR + sep) && full !== DR) throw new Error("path fora do diretorio");
  return full;
}

function parseIfEnv(name, content) {
  if (!/\.env$|\.env\.|\.password$|\.token$|\.txt$/i.test(name)) return null;
  const out = {};
  for (const raw of content.split(/\r\n?|\n/)) {
    const l = raw.trim();
    if (!l || l.startsWith("#")) continue;
    const e = l.indexOf("=");
    if (e < 0) continue;
    const k = l.slice(0, e).trim();
    let v = l.slice(e + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    out[k] = v;
  }
  return Object.keys(out).length ? out : null;
}

function ok(data) {
  return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
}

export const adminVaultTools = [
  {
    name: "vault_list",
    description: "ADMIN: lista todos os arquivos de secredo em /root/CentralDark/secrets (somente nomes). Uso exclusivo do admin.",
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false, title: "Vault list" },
    inputSchema: z.object({}),
    handler: async () => {
      const files = readdirSync(DR).filter((f) => {
        try { return statSync(pathJoin(DR, f)).isFile(); } catch { return false; }
      });
      audit("list", null, { count: files.length });
      return ok({ ok: true, dir: DR, files });
    },
  },
  {
    name: "vault_read",
    description: "ADMIN: le 1 arquivo de /root/CentralDark/secrets (aceita qualquer formato: .env, .txt, .password, .token, .json). Se for .env, tambem retorna parseado.",
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false, title: "Vault read" },
    inputSchema: z.object({
      name: z.string().min(1).describe("nome do arquivo dentro de /root/CentralDark/secrets"),
    }),
    handler: async (input) => {
      const full = safeResolve(input.name);
      const raw = readFileSync(full, "utf8");
      const parsed = parseIfEnv(input.name, raw);
      audit("read", input.name, { bytes: raw.length });
      return ok({ ok: true, name: input.name, raw, parsed });
    },
  },
  {
    name: "vault_read_all",
    description: "ADMIN: le TODOS os arquivos de /root/CentralDark/secrets de uma vez. Devolve { nome: { raw, parsed? } }.",
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false, title: "Vault read all" },
    inputSchema: z.object({}),
    handler: async () => {
      const out = {};
      for (const f of readdirSync(DR)) {
        const full = pathJoin(DR, f);
        try {
          if (!statSync(full).isFile()) continue;
          const raw = readFileSync(full, "utf8");
          out[f] = { raw, parsed: parseIfEnv(f, raw) };
        } catch (e) {
          out[f] = { error: (e && e.message) || String(e) };
        }
      }
      audit("read_all", null, { count: Object.keys(out).length });
      return ok({ ok: true, dir: DR, files: out });
    },
  },
];
