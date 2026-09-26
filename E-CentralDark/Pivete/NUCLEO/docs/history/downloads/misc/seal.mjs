#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const auditDir = path.join(root, "AUDIT");
const output = path.join(auditDir, "CODE-HASHES.sha256");
const excludedTopLevel = new Set(["AUDIT", "config", "receipts"]);

/**
 * LEIGO: lista tudo que faz parte do código selado, deixando configuração e recibos livres para uso.
 * PROFISSIONAL: inventário recursivo determinístico sem symlink e com exclusão explícita de áreas mutáveis.
 */
async function listFiles(directory) {
  const files = [];
  async function walk(current) {
    for (const entry of (await fs.readdir(current, { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name))) {
      const full = path.join(current, entry.name);
      const relative = path.relative(root, full).replaceAll("\\", "/");
      if (!relative.includes("/") && excludedTopLevel.has(relative)) continue;
      if (entry.isSymbolicLink()) throw new Error(`SYMLINK_NOT_SEALABLE:${relative}`);
      if (entry.isDirectory()) await walk(full);
      else if (entry.isFile()) files.push({ full, relative });
    }
  }
  await walk(directory);
  return files;
}

/** LEIGO: calcula o hash do arquivo. PROFISSIONAL: SHA-256 dos bytes integrais. */
async function hashFile(file) {
  return crypto.createHash("sha256").update(await fs.readFile(file)).digest("hex");
}

await fs.mkdir(auditDir, { recursive: true });
const files = await listFiles(root);
const lines = [];
for (const file of files) lines.push(`${await hashFile(file.full)}  ${file.relative}`);
await fs.writeFile(output, `${lines.join("\n")}\n`);
console.log(JSON.stringify({ status: "PASS", files: lines.length, output }, null, 2));
