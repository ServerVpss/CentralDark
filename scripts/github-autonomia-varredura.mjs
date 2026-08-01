#!/usr/bin/env node
/**
 * Varredura eventual da promoção autônoma.
 *
 * Reutiliza o juiz/promotor canônico em subprocessos separados:
 * - juiz recebe apenas GITHUB_TOKEN read-only;
 * - promotor recebe somente PROMOTION_TOKEN;
 * - cada decisão é presa a recibo SHA-256 e revalidada pelo motor canônico.
 */
import { spawnSync } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const API = "https://api.github.com";
const ROOT = resolve(fileURLToPath(new URL("..", import.meta.url)));
const ENGINE = join(ROOT, "scripts", "github-autonomia-promocao.mjs");

function markerAuthorized(pr) {
  const labels = new Set((pr.labels || []).map((label) => String(label.name || label).toLowerCase()));
  const text = `${pr.title || ""}\n${pr.body || ""}`;
  return labels.has("permito-pivete") || /\bPERMITO[ _-]?PIVETE\b/i.test(text);
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

async function api(token, method, path, body) {
  const response = await fetch(`${API}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "centraldark-autonomia-varredura/1.0",
      ...(body === undefined ? {} : { "Content-Type": "application/json" }),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : {};
  if (!response.ok) throw new Error(`GITHUB_${method}_${path}_${response.status}:${text.slice(0, 500)}`);
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
    "Nenhuma promoção foi executada. O controlador continuará reavaliando após a correção.",
  ].join("\n");
  const comments = await api(token, "GET", `/repos/${repository}/issues/${number}/comments?per_page=100`);
  const existing = comments.find((comment) => String(comment.body || "").includes(marker));
  if (existing) await api(token, "PATCH", `/repos/${repository}/issues/comments/${existing.id}`, { body });
  else await api(token, "POST", `/repos/${repository}/issues/${number}/comments`, { body });
}

function runEngine(mode, env) {
  // Build clean env excluding PROMOTION_TOKEN for judge subprocess security
  const baseEnv = { ...process.env };
  if (mode === "judge") {
    delete baseEnv.PROMOTION_TOKEN;
  }
  return spawnSync(process.execPath, [ENGINE, mode], {
    cwd: ROOT,
    env: { ...baseEnv, ...env },
    encoding: "utf8",
    maxBuffer: 4 * 1024 * 1024,
  });
}

async function main() {
  const repository = process.env.GITHUB_REPOSITORY || "";
  const judgeToken = process.env.JUDGE_TOKEN || process.env.GITHUB_TOKEN || "";
  const promotionToken = process.env.PROMOTION_TOKEN || "";
  const trustedAuthors = String(process.env.BOT_TRUSTED_AUTHORS || "segredounlock")
    .split(",").map((item) => item.trim()).filter(Boolean);
  const sweepDir = process.env.BOT_SWEEP_DIR || join(process.env.RUNNER_TEMP || "/tmp", "centraldark-autonomia");

  if (!repository.includes("/")) throw new Error("GITHUB_REPOSITORY_INVALID");
  if (!judgeToken) throw new Error("JUDGE_TOKEN_MISSING");
  await mkdir(sweepDir, { recursive: true });

  const pulls = await api(judgeToken, "GET", `/repos/${repository}/pulls?state=open&per_page=100`);
  const candidates = pulls.filter((pr) => eligibleSummary(pr, repository, trustedAuthors));
  console.log(`AUTONOMIA_SWEEP_CANDIDATES=${candidates.map((pr) => pr.number).join(",") || "none"}`);

  for (const pr of candidates) {
    const eventPath = join(sweepDir, `event-pr-${pr.number}.json`);
    const receiptPath = join(sweepDir, `receipt-pr-${pr.number}.json`);
    await writeFile(eventPath, `${JSON.stringify({ pull_request: { number: pr.number } })}\n`, { mode: 0o600 });

    const judge = runEngine("judge", {
      GITHUB_TOKEN: judgeToken,
      GITHUB_EVENT_PATH: eventPath,
      GITHUB_EVENT_NAME: "autonomy_sweep",
      BOT_RECEIPT_PATH: receiptPath,
    });
    process.stdout.write(judge.stdout || "");
    process.stderr.write(judge.stderr || "");
    if (judge.status !== 0) {
      await upsertDiagnostic(judgeToken, repository, pr.number, "JUDGE_FAILED", judge.stderr || judge.stdout);
      continue;
    }

    const sealed = JSON.parse(await readFile(receiptPath, "utf8"));
    const decision = sealed?.receipt?.candidates?.[0]?.decision || "UNKNOWN";
    console.log(`PR=${pr.number} SWEEP_DECISION=${decision}`);

    if (!promotionToken) {
      await upsertDiagnostic(
        judgeToken,
        repository,
        pr.number,
        "PROMOTION_TOKEN_MISSING",
        "O secret PROMOTION_TOKEN não está disponível para o workflow. O fallback com GITHUB_TOKEN é proibido porque suprimiria gatilhos pós-merge.",
      );
      continue;
    }

    const promote = runEngine("promote", {
      GITHUB_TOKEN: promotionToken,
      GITHUB_EVENT_PATH: eventPath,
      GITHUB_EVENT_NAME: "autonomy_sweep",
      BOT_RECEIPT_PATH: receiptPath,
    });
    process.stdout.write(promote.stdout || "");
    process.stderr.write(promote.stderr || "");
    if (promote.status !== 0) {
      await upsertDiagnostic(judgeToken, repository, pr.number, "PROMOTE_FAILED", promote.stderr || promote.stdout);
    }
  }
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  main().catch((error) => {
    console.error(`AUTONOMIA_SWEEP_ERROR=${error.message}`);
    process.exit(1);
  });
}
