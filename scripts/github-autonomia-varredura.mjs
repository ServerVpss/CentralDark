#!/usr/bin/env node
/**
 * Varredura eventual da promoção autônoma.
 *
 * Um único motor canônico:
 * - judge: read-only, produz recibo SHA-256;
 * - promote: revalida HEAD/base/intenção e promove.
 */
import { spawnSync } from "node:child_process";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { authorizationFor } from "./github-autonomia-promocao.mjs";

const API = "https://api.github.com";
const ROOT = resolve(fileURLToPath(new URL("..", import.meta.url)));
const ENGINE = join(ROOT, "scripts", "github-autonomia-promocao.mjs");
export const CANONICAL_AUTHORITY_LABEL = "👑 PERMITO-SEGREDO";

function markerAuthorized(pr) {
  return authorizationFor(pr).authorized;
}

export function eligibleSummary(pr, repository, trustedAuthors = ["segredounlock"]) {
  const trusted = trustedAuthors.map((item) => item.toLowerCase());
  return Boolean(
    pr?.state === "open" &&
    !pr?.draft &&
    pr?.base?.ref === "main" &&
    pr?.head?.repo?.full_name === repository &&
    trusted.includes(String(pr?.user?.login || "").toLowerCase()) &&
    markerAuthorized(pr)
  );
}

export function shouldMaterializeAuthority(pr, repository, trustedAuthors = ["segredounlock"]) {
  const auth = authorizationFor(pr);
  const trusted = trustedAuthors.map((item) => item.toLowerCase());
  return Boolean(
    pr?.state === "open" &&
    !pr?.draft &&
    pr?.base?.ref === "main" &&
    pr?.head?.repo?.full_name === repository &&
    trusted.includes(String(pr?.user?.login || "").toLowerCase()) &&
    auth.viaBody &&
    !auth.viaLabel
  );
}

async function api(token, method, path, body) {
  const response = await fetch(`${API}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "centraldark-autonomia-varredura/3.0",
      ...(body === undefined ? {} : { "Content-Type": "application/json" }),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await response.text();
  let data = {};
  if (text) {
    try { data = JSON.parse(text); }
    catch { data = { message: text.slice(0, 500) }; }
  }
  if (!response.ok) throw new Error(`GITHUB_${method}_${path}_${response.status}:${String(data.message || "request failed").slice(0, 500)}`);
  return data;
}

async function upsertDiagnostic(token, repository, number, code, detail) {
  const marker = "<!-- centraldark-autonomia-diagnostico -->";
  const body = [
    marker,
    "## Autonomia — bloqueio operacional",
    "",
    `Código: \`${code}\``,
    "",
    String(detail || "sem detalhe").slice(0, 2500),
    "",
    "Nenhuma promoção foi executada. O controlador continuará reavaliando automaticamente sem pedir novamente a mesma autorização.",
  ].join("\n");
  const comments = await api(token, "GET", `/repos/${repository}/issues/${number}/comments?per_page=100`);
  const existing = comments.find((comment) => String(comment.body || "").includes(marker));
  if (existing) await api(token, "PATCH", `/repos/${repository}/issues/comments/${existing.id}`, { body });
  else await api(token, "POST", `/repos/${repository}/issues/${number}/comments`, { body });
}

const SECRET_PATTERNS = [
  /gh[pousr]_[A-Za-z0-9]{20,}/g,
  /github_pat_[A-Za-z0-9_]{20,}/g,
  /\b[Bb]earer\s+[A-Za-z0-9._~+/-]{16,}=*/g,
  /\bey[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/g,
  /\b\d{8,12}:[A-Za-z0-9_-]{30,}\b/g,
];

export function sanitizeNotice(text, limit = 900) {
  let clean = String(text ?? "");
  for (const pattern of SECRET_PATTERNS) clean = clean.replace(pattern, "[REDACTED]");
  return clean.replace(/\s+/g, " ").trim().slice(0, limit);
}

export function classifyFailure(text) {
  const value = String(text || "").toLowerCase();
  if (/insufficient[_ ]quota|quota exceeded|credit|billing|payment required|402/.test(value)) return "CREDITS_EXHAUSTED";
  if (/\b429\b|rate limit|too many requests/.test(value)) return "RATE_LIMITED";
  if (/\b401\b|\b403\b|bad credentials|not authorized|resource not accessible/.test(value)) return "TOKEN_DENIED";
  if (/\b5\d\d\b|timeout|etimedout|econnreset|enotfound|service unavailable/.test(value)) return "PROVIDER_DOWN";
  if (/review_threads_unavailable|graphql/.test(value)) return "GITHUB_GRAPHQL_UNAVAILABLE";
  return "UNKNOWN_FAILURE";
}

export function noticeTargets(env = process.env) {
  return {
    telegram: Boolean(env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_CHAT_ID),
    webhook: Boolean(env.NOTIFY_WEBHOOK_URL),
  };
}

export async function notify(event, env = process.env) {
  const targets = noticeTargets(env);
  const text = [
    "🔴 CENTRALDARK — autonomia bloqueada",
    `causa: ${event.code}`,
    event.pr ? `PR: #${event.pr}` : null,
    event.head ? `HEAD: ${String(event.head).slice(0, 12)}` : null,
    event.run ? `run: ${event.run}` : null,
    `detalhe: ${sanitizeNotice(event.detail)}`,
  ].filter(Boolean).join("\n");

  const results = [];
  if (targets.telegram) {
    try {
      const response = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: env.TELEGRAM_CHAT_ID, text, disable_web_page_preview: true }),
      });
      results.push(`telegram:${response.ok ? "SENT" : `NOT_SENT_${response.status}`}`);
    } catch (error) {
      results.push(`telegram:NOT_SENT_${classifyFailure(error?.message)}`);
    }
  } else results.push("telegram:NOT_SENT_NO_SECRET");

  if (targets.webhook) {
    try {
      const response = await fetch(env.NOTIFY_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...event, detail: sanitizeNotice(event.detail), text }),
      });
      results.push(`webhook:${response.ok ? "SENT" : `NOT_SENT_${response.status}`}`);
    } catch (error) {
      results.push(`webhook:NOT_SENT_${classifyFailure(error?.message)}`);
    }
  } else results.push("webhook:NOT_SENT_NO_SECRET");

  const line = `AUTONOMIA_NOTICE=${event.code} ${results.join(" ")}`;
  console.log(line);
  return line;
}

function runEngine(mode, env) {
  const baseEnv = { ...process.env };
  delete baseEnv.JUDGE_TOKEN;
  delete baseEnv.PROMOTION_TOKEN;
  delete baseEnv.PROMOTER_TOKEN;
  delete baseEnv.GITHUB_TOKEN;
  return spawnSync(process.execPath, [ENGINE, mode], {
    cwd: ROOT,
    env: { ...baseEnv, ...env },
    encoding: "utf8",
    maxBuffer: 4 * 1024 * 1024,
  });
}

function config() {
  const repository = process.env.GITHUB_REPOSITORY || "";
  const trustedAuthors = String(process.env.BOT_TRUSTED_AUTHORS || "segredounlock")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  const sweepDir = process.env.BOT_SWEEP_DIR || join(process.env.RUNNER_TEMP || "/tmp", "centraldark-autonomia");
  if (!repository.includes("/")) throw new Error("GITHUB_REPOSITORY_INVALID");
  return { repository, trustedAuthors, sweepDir };
}

async function judgeSweep() {
  const { repository, trustedAuthors, sweepDir } = config();
  const judgeToken = process.env.JUDGE_TOKEN || process.env.GITHUB_TOKEN || "";
  if (!judgeToken) throw new Error("JUDGE_TOKEN_MISSING");
  await mkdir(sweepDir, { recursive: true });

  const pulls = await api(judgeToken, "GET", `/repos/${repository}/pulls?state=open&per_page=100`);
  const candidates = pulls.filter((pr) => eligibleSummary(pr, repository, trustedAuthors));
  console.log(`AUTONOMIA_SWEEP_CANDIDATES=${candidates.map((pr) => pr.number).join(",") || "none"}`);
  const failures = [];

  for (const pr of candidates) {
    const eventPath = join(sweepDir, `event-pr-${pr.number}.json`);
    const receiptPath = join(sweepDir, `receipt-pr-${pr.number}.json`);
    await writeFile(eventPath, `${JSON.stringify({ pull_request: { number: pr.number } })}\n`, { encoding: "utf8", mode: 0o600 });

    const judge = runEngine("judge", {
      GITHUB_TOKEN: judgeToken,
      GITHUB_EVENT_PATH: eventPath,
      GITHUB_EVENT_NAME: "autonomy_sweep",
      BOT_RECEIPT_PATH: receiptPath,
    });
    process.stdout.write(judge.stdout || "");
    process.stderr.write(judge.stderr || "");
    if (judge.status !== 0) {
      const raw = String(judge.stderr || judge.stdout || "JUDGE_FAILED");
      const code = classifyFailure(raw);
      await writeFile(join(sweepDir, `judge-failure-pr-${pr.number}.txt`), raw.slice(0, 4000), { encoding: "utf8", mode: 0o600 });
      await notify({ code: `JUDGE_FAILED:${code}`, pr: pr.number, head: pr.head?.sha, run: process.env.GITHUB_RUN_ID || null, detail: raw });
      failures.push(`${pr.number}:${code}`);
      continue;
    }

    const sealed = JSON.parse(await readFile(receiptPath, "utf8"));
    const candidate = sealed?.receipt?.candidates?.[0] || {};
    console.log(`PR=${pr.number} SWEEP_MODE=${candidate.mode || "UNKNOWN"} SWEEP_DECISION=${candidate.decision || "UNKNOWN"}`);
  }

  console.log(`AUTONOMIA_JUDGE_FAILURES=${failures.join(",") || "none"}`);
  if (failures.length) throw new Error(`JUDGE_SWEEP_FAILED:${failures.join(",")}`);
}

async function promoteSweep() {
  const { repository, trustedAuthors, sweepDir } = config();
  const promoterToken = process.env.PROMOTER_TOKEN || process.env.PROMOTION_TOKEN || process.env.GITHUB_TOKEN || "";
  if (!promoterToken) {
    await notify({ code: "PROMOTER_TOKEN_MISSING", run: process.env.GITHUB_RUN_ID || null, detail: "Nenhum token de escrita disponível para concluir a intenção já autorizada." });
    throw new Error("PROMOTER_TOKEN_MISSING");
  }
  await mkdir(sweepDir, { recursive: true });

  const files = (await readdir(sweepDir)).filter((name) => /^receipt-pr-\d+\.json$/.test(name)).sort();
  console.log(`AUTONOMIA_PROMOTE_RECEIPTS=${files.join(",") || "none"}`);
  const failures = [];

  for (const name of files) {
    const match = name.match(/^receipt-pr-(\d+)\.json$/);
    const number = Number(match?.[1]);
    if (!Number.isInteger(number) || number <= 0) continue;
    const eventPath = join(sweepDir, `event-pr-${number}.json`);
    const receiptPath = join(sweepDir, name);

    const livePr = await api(promoterToken, "GET", `/repos/${repository}/pulls/${number}`);
    if (shouldMaterializeAuthority(livePr, repository, trustedAuthors)) {
      const labels = await api(promoterToken, "POST", `/repos/${repository}/issues/${number}/labels`, { labels: [CANONICAL_AUTHORITY_LABEL] });
      const verified = Array.isArray(labels)
        && labels.some((label) => String(label?.name || label).trim().toLocaleLowerCase("pt-BR") === CANONICAL_AUTHORITY_LABEL.toLocaleLowerCase("pt-BR"));
      if (!verified) {
        failures.push(`${number}:AUTHORITY_LABEL_NOT_VERIFIED`);
        await upsertDiagnostic(promoterToken, repository, number, "AUTHORITY_LABEL_NOT_VERIFIED", "GitHub não confirmou a label canônica após a materialização da dependência derivada da intenção.");
        continue;
      }
      console.log(`PR=${number} AUTHORITY_DEPENDENCY_MATERIALIZED=${CANONICAL_AUTHORITY_LABEL}`);
      await api(promoterToken, "POST", `/repos/${repository}/dispatches`, {
        event_type: "centraldark_autonomia_recheck",
        client_payload: { pr_number: number, reason: "authority_dependency_materialized", head: livePr.head?.sha || null },
      });
      continue;
    }

    const promote = runEngine("promote", {
      GITHUB_TOKEN: promoterToken,
      GITHUB_EVENT_PATH: eventPath,
      GITHUB_EVENT_NAME: "autonomy_sweep",
      BOT_RECEIPT_PATH: receiptPath,
    });
    process.stdout.write(promote.stdout || "");
    process.stderr.write(promote.stderr || "");
    if (promote.status !== 0) {
      const raw = String(promote.stderr || promote.stdout || "falha sem detalhe");
      const code = classifyFailure(raw);
      await upsertDiagnostic(promoterToken, repository, number, `PROMOTE_FAILED:${code}`, sanitizeNotice(raw, 2400));
      await notify({ code: `PROMOTE_FAILED:${code}`, pr: number, run: process.env.GITHUB_RUN_ID || null, detail: raw });
      failures.push(`${number}:${code}`);
    }
  }

  console.log(`AUTONOMIA_PROMOTE_FAILURES=${failures.join(",") || "none"}`);
  if (failures.length) throw new Error(`PROMOTE_SWEEP_FAILED:${failures.join(",")}`);
}

export async function main(argv = process.argv.slice(2)) {
  const mode = argv[0] || "";
  if (mode === "judge") return judgeSweep();
  if (mode === "promote") return promoteSweep();
  throw new Error(`MODE_INVALID:${mode || "empty"}`);
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  main().catch((error) => {
    console.error(`AUTONOMIA_SWEEP_ERROR=${error.message}`);
    process.exit(1);
  });
}
