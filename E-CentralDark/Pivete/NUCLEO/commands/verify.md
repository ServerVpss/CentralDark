# COMANDO - verify.mjs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\evidence\session-completa-20260806\.extracted_GATILHO-UNIVERSAL-IA-RIGOR-MAXIMO\GATILHO-UNIVERSAL-IA\scripts\verify.mjs
**SHA:** ca08da861e0d8165
**Timestamp:** 2026-08-28T02:57:25.116705
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- if (!files.length) return { total: 0, pass: 0, fail: 0, skipped: 0, cancelled: 0, todo: 0, status: "FAIL_ZERO_TESTS" };
- todo: Number(counts.todo || 0),
- summary.status = summary.total > 0 && summary.pass === summary.total && summary.fail === 0 && summary.skipped === 0 && summary.cancelled === 0 && summary.todo === 0 ? "PASS" : "FAIL";
- catch { return { status: "FAIL_MISSING_SEAL", missing: [], changed: [], untracked: [] }; }
- if (!match) return { status: "FAIL_SEAL_FORMAT", missing: [], changed: [], untracked: [] };
- const missing = [...expected.keys()].filter((name) => !actual.has(name));

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";
import { run } from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/**
 * LEIGO: encontra todos os arquivos, inclusive os que estão em subpastas.
 * PROFISSIONAL: walk recursivo sem seguir symlinks para impedir varredura rasa.
 */
async function walk(directory, predicate) {
  const output = [];
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    const full = path.join(directory, entry.name);
    if (entry.isSymbolicLink()) continue;
    if (entry.isDirectory()) output.push(...await walk(full, predicate));
    else if (entry.isFile() && predicate(full)) output.push(full);
  }
  return output;
}

/**
 * LEIGO: pergunta ao Node se cada arquivo JavaScript está bem escrito.
 * PROFISSIONAL: executa node --check por arquivo sem shell e coleta falhas estruturadas.
 */
function checkFile(file) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, ["--check", file], { shell: false, env: { ...process.env, NODE_OPTIONS: "" } });
    let stderr = "";
    child.stderr.on("data", (chunk) => stderr += chunk);
    child.on("error", (error) => resolve({ file: path.relative(root, file), code: 127, stderr: error.message }));
    child.on("close", (code) => resolve({ file: path.relative(root, file), code, stderr }));
  });
}

/**
 * LEIGO: roda testes pelo canal interno do Node; frases impressas pelos testes não contam como resultado.
 * PROFISSIONAL: consome o summary global estruturado de node:test e falha em zero, skip, cancel, todo ou fail.
 */
async function runStructuredTests(files) {
  if (!files.length) return { total: 0, pass: 0, fail: 0, skipped: 0, cancelled: 0, todo: 0, status: "FAIL_ZERO_TESTS" };
  let globalSummary = null;
  const stream = run({ files, concurrency: 1, isolation: "process", execArgv: [] });
  for await (const event of stream) {
    if (event.type === "test:summary" && !event.data?.file) globalSummary = event.data;
  }
  const counts = globalSummary?.counts || {};
  const summary = {
    total: Number(counts.tests || 0),
    pass: Number(counts.passed || 0),
    fail: Number(counts.failed || 0),
    skipped: Number(counts.skipped || 0),
    cancelled: Number(counts.cancelled || 0),
    todo: Number(counts.todo || 0),
  };
  summary.status = summary.total > 0 && summary.pass === summary.total && summary.fail === 0 && summary.skipped === 0 && summary.cancelled === 0 && summary.todo === 0 ? "PASS" : "FAIL";
  return summary;
}

/**
 * LEIGO: procura no código executável tentativas de abrir arquivos secretos.
 * PROFISSIONAL: varre fontes recursivas por APIs de leitura combinadas com caminhos sensíveis; documentação/testes não entram no gate.
 */
async function scanSecretFileReads(files) {
  const findings = [];
  for (const file of files.filter((x) =>
    (x.includes(`${path.sep}src${path.sep}`) || x.includes(`${path.sep}bin${path.sep}`)) &&
    !x.includes(`${path.sep}tests${path.sep}`)
  )) {
    const text = await fs.readFile(file, "utf8");
    const suspicious = /(?:readFile|open|createReadStream)\s*\([^\n]{0,160}(?:\.env|secrets|tokens|sessions|\.ssh)/i.test(text);
    if (suspicious) findings.push(path.relative(root, file));
  }
  return findings;
}


/**
 * LEIGO: confere se o código entregue continua exatamente igual ao pacote selado.
 * PROFISSIONAL: valida SHA-256, arquivos ausentes e arquivos novos nas áreas imutáveis; config/receipts permanecem mutáveis.
 */
async function verifyCodeSeal() {
  const manifestPath = path.join(root, "AUDIT", "CODE-HASHES.sha256");
  let manifest;
  try { manifest = await fs.readFile(manifestPath, "utf8"); }
  catch { return { status: "FAIL_MISSING_SEAL", missing: [], changed: [], untracked: [] }; }
  const expected = new Map();
  for (const line of manifest.split(/\r?\n/).filter(Boolean)) {
    const match = line.match(/^([a-f0-9]{64})  (.+)$/);
    if (!match) return { status: "FAIL_SEAL_FORMAT", missing: [], changed: [], untracked: [] };
    expected.set(match[2], match[1]);
  }
  const excluded = new Set(["AUDIT", "config", "receipts"]);
  const actualFiles = [];
  /**
   * LEIGO: reúne os arquivos atuais para comparar com o selo.
   * PROFISSIONAL: walk interno recursivo das áreas imutáveis com detecção de symlink.
   */
  async function collect(current) {
    for (const entry of await fs.readdir(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      const relative = path.relative(root, full).replaceAll("\\", "/");
      if (!relative.includes("/") && excluded.has(relative)) continue;
      if (entry.isSymbolicLink()) { actualFiles.push({ relative, symlink: true }); continue; }
      if (entry.isDirectory()) await collect(full);
      else if (entry.isFile()) actualFiles.push({ relative, full });
    }
  }
  await collect(root);
  const actual = n
```