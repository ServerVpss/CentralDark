import { z } from "zod";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { resolve as pathResolve, join as pathJoin } from "node:path";

const MAX_READ_BYTES = 512 * 1024;
const BLOCKED_ROOTS = ["/etc/shadow", "/etc/sudoers", "/root/.ssh", "/root/CentralDark/secrets"];

function ok(data) {
  return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
}

function safePath(input) {
  if (!input || typeof input !== "string") throw new Error("path obrigatorio");
  if (input.includes("\0")) throw new Error("path invalido");
  if (input.includes("..")) throw new Error("path traversal bloqueado (..)");
  const abs = pathResolve(input);
  for (const b of BLOCKED_ROOTS) {
    if (abs === b || abs.startsWith(b + "/")) throw new Error(`path bloqueado: ${b}`);
  }
  return abs;
}

export const adminFileTools = [
  {
    name: "admin_file_list",
    description: "ADMIN: lista arquivos e pastas de um caminho absoluto. Bloqueia path traversal e paths sensiveis (secrets, .ssh, shadow).",
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false, title: "Admin file list" },
    inputSchema: z.object({
      path: z.string().min(1).describe("Caminho absoluto do diretorio"),
      maxEntries: z.number().int().positive().max(1000).optional().describe("Limite de entradas (default 200)"),
    }),
    handler: async (input) => {
      const abs = safePath(input.path);
      const st = statSync(abs);
      if (!st.isDirectory()) throw new Error("path nao e diretorio");
      const limit = input.maxEntries ?? 200;
      const raw = readdirSync(abs).slice(0, limit);
      const entries = raw.map((name) => {
        try {
          const s = statSync(pathJoin(abs, name));
          return { name, type: s.isDirectory() ? "dir" : s.isFile() ? "file" : "other", size: s.size };
        } catch (e) {
          return { name, error: String(e?.message || e) };
        }
      });
      return ok({ ok: true, path: abs, count: entries.length, truncated: raw.length >= limit, entries });
    },
  },
  {
    name: "admin_file_read",
    description: "ADMIN: le o conteudo de um arquivo por caminho absoluto (limite 512KB). Bloqueia paths sensiveis.",
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false, title: "Admin file read" },
    inputSchema: z.object({
      path: z.string().min(1).describe("Caminho absoluto do arquivo"),
      maxBytes: z.number().int().positive().max(MAX_READ_BYTES).optional(),
    }),
    handler: async (input) => {
      const abs = safePath(input.path);
      const st = statSync(abs);
      if (!st.isFile()) throw new Error("path nao e arquivo");
      const cap = input.maxBytes ?? MAX_READ_BYTES;
      const truncated = st.size > cap;
      const buf = readFileSync(abs);
      const content = buf.slice(0, cap).toString("utf8");
      return ok({ ok: true, path: abs, sizeBytes: st.size, truncated, content });
    },
  },
];
