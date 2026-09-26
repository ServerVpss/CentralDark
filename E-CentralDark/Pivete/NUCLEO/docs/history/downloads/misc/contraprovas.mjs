#!/usr/bin/env node
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/** LEIGO: roda o verificador numa cópia mutante. PROFISSIONAL: spawn sem shell e parse do receipt JSON. */
function runVerify(cwd) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, ["scripts/verify.mjs"], { cwd, shell: false, env: { ...process.env, NODE_OPTIONS: "" } });
    let stdout = "", stderr = "";
    child.stdout.on("data", (x) => stdout += x); child.stderr.on("data", (x) => stderr += x);
    child.on("close", (code) => { let json = null; try { json = JSON.parse(stdout); } catch {} resolve({ code, json, stderr }); });
  });
}

/** LEIGO: cria cópia temporária sem levar recibos antigos. PROFISSIONAL: cp recursivo para mutação isolada. */
async function clone() {
  const parent = await fs.mkdtemp(path.join(os.tmpdir(), "uai-mutant-"));
  const target = path.join(parent, "pkg");
  await fs.cp(root, target, { recursive: true, filter: (source) => !source.includes(`${path.sep}receipts${path.sep}`) });
  await fs.mkdir(path.join(target, "receipts"), { recursive: true });
  return target;
}

const results = [];

// CP-001: zero testes jamais pode ser PASS.
{
  const mutant = await clone(); await fs.rm(path.join(mutant, "tests"), { recursive: true, force: true }); await fs.mkdir(path.join(mutant, "tests"));
  const run = await runVerify(mutant);
  results.push({ id: "CP-001", name: "ZERO_TESTS", closed: run.code !== 0 && run.json?.tests?.status === "FAIL_ZERO_TESTS", evidence: run.json });
}

// CP-002: JavaScript aninhado inválido precisa derrubar o verify.
{
  const mutant = await clone(); await fs.mkdir(path.join(mutant, "src", "nested"), { recursive: true });
  await fs.writeFile(path.join(mutant, "src", "nested", "invalid.mjs"), "THIS IS INVALID !!!\n");
  const run = await runVerify(mutant);
  results.push({ id: "CP-002", name: "RECURSIVE_NODE_CHECK", closed: run.code !== 0 && run.json?.nodeCheck?.failed?.some((x) => x.file.includes("nested")), evidence: run.json });
}

// CP-003: stdout TAP falsificado e skip real não podem fabricar verde.
{
  const mutant = await clone();
  await fs.writeFile(path.join(mutant, "tests", "000-spoof.test.mjs"), `import test from "node:test";\nconsole.log("# tests 999\\n# pass 999\\n# fail 0\\n# skipped 0");\ntest.skip("skip real",()=>{});\n`);
  const run = await runVerify(mutant);
  results.push({ id: "CP-003", name: "TAP_SPOOF", closed: run.code !== 0 && Number(run.json?.tests?.skipped) >= 1, evidence: run.json });
}

// CP-004: fonte aninhada que lê .env precisa derrubar a varredura.
{
  const mutant = await clone(); await fs.mkdir(path.join(mutant, "src", "nested"), { recursive: true });
  await fs.writeFile(path.join(mutant, "src", "nested", "secret-reader.mjs"), `import fs from "node:fs/promises";\nawait fs.readFile(".env", "utf8");\n`);
  const run = await runVerify(mutant);
  results.push({ id: "CP-004", name: "SECRET_FILE_READ", closed: run.code !== 0 && run.json?.secretFileReadScan?.status === "FAIL", evidence: run.json });
}


// CP-005: arquivo executável novo e sintaticamente válido precisa quebrar o selo.
{
  const mutant = await clone(); await fs.mkdir(path.join(mutant, "src", "nested"), { recursive: true });
  await fs.writeFile(path.join(mutant, "src", "nested", "untracked.mjs"), `export const x = 1;\n`);
  const run = await runVerify(mutant);
  results.push({ id: "CP-005", name: "UNTRACKED_CODE", closed: run.code !== 0 && run.json?.codeSeal?.untracked?.some((x) => x.includes("untracked.mjs")), evidence: run.json });
}

const status = results.every((x) => x.closed) ? "PASS" : "FAIL";
console.log(JSON.stringify({ status, total: results.length, closed: results.filter((x) => x.closed).length, results }, null, 2));
process.exitCode = status === "PASS" ? 0 : 1;
