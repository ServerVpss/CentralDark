#!/usr/bin/env node
/** SkillMaster core: classificar → rotear → consultar → aprender → policy → delta. */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";
import { classificarEvento } from "./classificar-evento.mjs";
import { routeQaContext, loadManifest, validateManifest } from "./router.mjs";
import { consultarDocumentos } from "./consultar.mjs";
import { consolidarDelta } from "./consolidar-delta.mjs";
import { evaluatePolicyGate } from "./policy-gate.mjs";
import { registerLearning, loadLearningForPattern, loadRecentLearnings } from "./learning-store.mjs";
import { runEnxame } from "./enxame-runner.mjs";
import { normalizeText, sanitizeObject } from "./sanitize.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SELF_MAP_IGNORES = [
  /^README\.md$/i,
  /(^|\/)README\.md$/i,
  /(^|\/)INDEX\.md$/i,
  /(^|\/)(?:REPORT|STAFF-REPORT(?:-V\d+(?:\.\d+)?)?)\.md$/i,
];

export async function orchestrate(rawEvent = {}, options = {}) {
  const root = options.root || ROOT;
  const event = classificarEvento(rawEvent);
  const routeResult = await routeQaContext(event, { root, manifestPath: options.manifestPath });
  const keywords = [event.evidence?.error, event.event, event.evidence?.command, event.evidence?.changedFiles].filter(Boolean);
  const consulta = await consultarDocumentos(routeResult.matches, keywords, { root });

  const learningOptions = { learningDir: options.learningDir };
  const previousLearning = event.event === "SESSION_RESUME"
    ? await loadRecentLearnings({ ...learningOptions, limit: 3 })
    : await loadLearningForPattern(event.evidence?.error || event.event, { ...learningOptions, limit: 3 });

  let enxame = null;
  const wantsEnxame = options.forceEnxame === true || event.event === "ENXAME_REQUEST" || event.tags.includes("enxame");
  if (wantsEnxame) {
    const enxameRunner = options.enxameRunner || runEnxame;
    enxame = await enxameRunner({
      prompt: [
        `EVENTO: ${event.event}`,
        event.evidence?.error ? `ERRO: ${event.evidence.error}` : "",
        event.mission?.id ? `MISSAO: ${event.mission.id}` : "",
        options.enxamePrompt || "Diagnóstico técnico staff, PT-BR, direto.",
      ].filter(Boolean).join("\n"),
      mode: options.enxameMode || "econo",
      judge: true,
      allowLarge: options.allowLargeEnxame === true,
      env: options.env,
      fetchImpl: options.fetchImpl,
    });
  }

  const policy = evaluatePolicyGate(options.policyFlags || {});
  let learning = { promoted: false, reason: "NAO_SOLICITADO" };
  if (options.learningRecord) {
    learning = await registerLearning({
      ...options.learningRecord,
      event: event.event,
      missionId: event.mission?.id,
    }, learningOptions);
  }

  const delta = consolidarDelta({ routeResult, consulta, event, policy, enxame, learning, previousLearning });
  return { delta, routeResult, consulta, enxame, policy, learning, previousLearning, event };
}

async function walkFiles(dir, predicate, acc = []) {
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (["node_modules", "learning", "tests", "runtime", ".git", "references"].includes(entry.name)) continue;
      await walkFiles(full, predicate, acc);
    } else if (predicate(full)) acc.push(full);
  }
  return acc;
}

function autoId(relativePath, usedIds) {
  const base = path.basename(relativePath, ".md").toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "documento";
  let id = base;
  let suffix = 2;
  while (usedIds.has(id)) id = `${base}-${suffix++}`;
  usedIds.add(id);
  return id;
}

async function candidateFromMarkdown(root, relativePath, usedIds) {
  const raw = await fs.readFile(path.join(root, relativePath), "utf8");
  const heading = raw.split(/\r?\n/).find((line) => /^#\s+/.test(line))?.replace(/^#\s+/, "").trim();
  const stem = path.basename(relativePath, ".md");
  const triggerTokens = normalizeText(`${stem} ${heading || ""}`)
    .split(/\s+/)
    .filter((token) => token.length >= 4 && !["para", "como", "esta", "este", "completo", "relatorio"].includes(token));
  const triggers = [...new Set([normalizeText(stem), ...triggerTokens])].filter(Boolean).slice(0, 8);
  return {
    id: autoId(relativePath, usedIds),
    name: heading || stem,
    path: relativePath,
    triggers: triggers.length ? triggers : [normalizeText(stem)],
    priority: 5,
  };
}

export async function selfMap(options = {}) {
  const root = options.root || ROOT;
  const manifestPath = options.manifestPath || path.join(root, "manifest.json");
  const { manifest } = await loadManifest({ root, manifestPath });
  const knownPaths = new Set(manifest.map((entry) => entry.path.replace(/\\/g, "/").toLowerCase()));
  const allMd = await walkFiles(root, (file) => file.endsWith(".md") && path.basename(file) !== "SKILL.md");
  const relative = allMd.map((file) => path.relative(root, file).replace(/\\/g, "/"));
  const missing = relative.filter((item) => !knownPaths.has(item.toLowerCase()) && !SELF_MAP_IGNORES.some((pattern) => pattern.test(item)));

  const report = {
    totalMarkdownDetected: relative.length,
    indexedUniquePaths: knownPaths.size,
    missing,
    status: missing.length === 0 ? "SYNCED" : "DRIFT",
    applied: 0,
  };

  if (options.apply && missing.length) {
    const usedIds = new Set(manifest.map((entry) => entry.id));
    const additions = [];
    for (const item of missing) additions.push(await candidateFromMarkdown(root, item, usedIds));
    const next = [...manifest, ...additions];
    validateManifest(next, { root });
    const tmp = `${manifestPath}.${process.pid}.tmp`;
    await fs.writeFile(tmp, `${JSON.stringify(next, null, 2)}\n`, "utf8");
    await fs.rename(tmp, manifestPath);
    report.applied = additions.length;
    report.status = "SYNCED_AFTER_APPLY";
  }
  return report;
}

function spawnCapture(command, args, cwd) {
  return new Promise((resolve) => {
    const child = spawn(command, args, { cwd, env: process.env, shell: false });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => (stdout += chunk));
    child.stderr.on("data", (chunk) => (stderr += chunk));
    child.on("close", (code) => resolve({ code, stdout, stderr }));
    child.on("error", (error) => resolve({ code: 127, stdout, stderr: error.message }));
  });
}

async function listByExtension(root, dirs, extension) {
  const result = [];
  for (const dir of dirs) {
    const full = path.join(root, dir);
    const entries = await fs.readdir(full).catch(() => []);
    for (const entry of entries) if (entry.endsWith(extension)) result.push(path.join(dir, entry));
  }
  return result.sort();
}

export async function verifyPackage(options = {}) {
  const root = options.root || ROOT;
  const { manifest, validation } = await loadManifest({ root });
  const selfMapReport = await selfMap({ root, apply: false });
  const jsFiles = await listByExtension(root, ["runtime", "tests"], ".mjs");
  const checks = [];
  for (const file of jsFiles) {
    const result = await spawnCapture(process.execPath, ["--check", file], root);
    checks.push({ file, pass: result.code === 0, error: result.stderr.trim() });
  }

  const tests = jsFiles.filter((file) => file.startsWith(`tests${path.sep}`) || file.startsWith("tests/"));
  const testRun = await spawnCapture(process.execPath, ["--test", ...tests], root);
  const demo = await orchestrate({
    event: "TEST_FAILED",
    mission: { id: "VERIFY", state: "FAILURE_CAPTURED", nextState: "TESTE_DISCRIMINATIVO_VERDE" },
    evidence: { error: "trailer no rodapé não foi reconhecido", command: "node --test", changedFiles: ["validator.mjs"] },
  }, { root });

  const scanFiles = [...await listByExtension(root, ["runtime"], ".mjs"), ...await listByExtension(root, ["02-KIT-ENXAME-OMEGA"], ".sh")];
  const gWord = ["gr", "ep"].join("");
  const rWord = ["read", "File"].join("");
  const centralKey = ["CENTRALDARK", "_API_KEY"].join("");
  const forbiddenSources = [
    ["\\/etc", "\\/centraldark\\/[^\\n]*\\.env"].join(""),
    ["\\/root", "\\/CentralDark\\/\\.env"].join(""),
    `${gWord}[^\\n]*(?:${centralKey}|\\.env)`,
    `${rWord}[^\\n]*(?:\\.env|secrets|tokens|sessions|\\.ssh)`,
  ].map((source) => new RegExp(source, "i"));
  const forbidden = [];
  for (const file of scanFiles) {
    const content = await fs.readFile(path.join(root, file), "utf8");
    if (forbiddenSources.some((pattern) => pattern.test(content))) forbidden.push(file);
  }

  const shellFiles = await listByExtension(root, ["02-KIT-ENXAME-OMEGA"], ".sh");
  const bashProbe = await spawnCapture("bash", ["--version"], root);
  const shellChecks = [];
  if (bashProbe.code === 0) {
    for (const file of shellFiles) {
      const result = await spawnCapture("bash", ["-n", file], root);
      shellChecks.push({ file, pass: result.code === 0, error: result.stderr.trim() });
    }
  }

  const testOutput = `${testRun.stdout}\n${testRun.stderr}`.trim();
  const tapNumber = (label) => Number(testOutput.match(new RegExp(`# ${label} (\\d+)`))?.[1] || 0);
  const testSummary = {
    total: tapNumber("tests"),
    pass: tapNumber("pass"),
    fail: tapNumber("fail"),
    skipped: tapNumber("skipped"),
    cancelled: tapNumber("cancelled"),
    todo: tapNumber("todo"),
  };
  const receipt = {
    status: validation.valid && selfMapReport.status === "SYNCED" && checks.every((check) => check.pass) && (bashProbe.code !== 0 || shellChecks.every((check) => check.pass)) && testRun.code === 0 && testSummary.fail === 0 && testSummary.skipped === 0 && /STATUS=OK/.test(demo.delta) && forbidden.length === 0 ? "PASS" : "FAIL",
    manifest: { count: manifest.length, hash: validation.hash, selfMap: selfMapReport },
    nodeCheck: { total: checks.length, fail: checks.filter((check) => !check.pass) },
    shellSyntax: { applicable: bashProbe.code === 0, total: shellChecks.length, fail: shellChecks.filter((check) => !check.pass) },
    tests: { exitCode: testRun.code, summary: testSummary, output: testOutput },
    demo: { statusOk: /STATUS=OK/.test(demo.delta), delta: demo.delta },
    secretReadScan: { pass: forbidden.length === 0, files: forbidden },
  };
  return receipt;
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const args = process.argv.slice(2);
  if (args.includes("--self-map")) {
    const report = await selfMap({ apply: args.includes("--apply") });
    console.log(JSON.stringify(report, null, 2));
    process.exit(report.status.startsWith("SYNCED") ? 0 : 2);
  }
  if (args.includes("--verify")) {
    const receipt = await verifyPackage();
    console.log(JSON.stringify(sanitizeObject(receipt), null, 2));
    process.exit(receipt.status === "PASS" ? 0 : 1);
  }

  let input;
  const inputIndex = args.indexOf("--input");
  if (inputIndex >= 0 && args[inputIndex + 1]) {
    input = JSON.parse(await fs.readFile(args[inputIndex + 1], "utf8"));
  } else if (args.includes("--stdin")) {
    const chunks = [];
    for await (const chunk of process.stdin) chunks.push(chunk);
    input = JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } else {
    input = {
      event: "TEST_FAILED",
      mission: { id: "RECUPERAR_E_FINALIZAR_PR664", state: "INVARIAVEL_ATUAL_CORRIGIDA", nextState: "TESTE_DISCRIMINATIVO_VERDE" },
      evidence: { command: "node --test scripts/lupa/validar-escritor-unico.test.mjs", exitCode: 1, error: "trailer no rodapé não foi reconhecido", changedFiles: ["scripts/lupa/validar-escritor-unico.mjs"] },
    };
  }

  const result = await orchestrate(input, {
    forceEnxame: args.includes("--enxame"),
    allowLargeEnxame: args.includes("--allow-large"),
  });
  console.log(result.delta);
  if (args.includes("--json")) console.error(JSON.stringify(sanitizeObject({ route: result.routeResult, policy: result.policy, learning: result.learning }), null, 2));
  process.exit(/STATUS=(OK|INCONCLUSIVO)/.test(result.delta) ? 0 : 1);
}
