import crypto from "node:crypto";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
let running = false;

function secret() {
  return String(process.env.GITHUB_WEBHOOK_SECRET || process.env.CENTRALDARK_WEBHOOK_HMAC || "").trim();
}

function validSignature(rawBody, header) {
  const configured = secret();
  if (!configured || typeof header !== "string" || !header.startsWith("sha256=")) return false;
  const expected = `sha256=${crypto.createHmac("sha256", configured).update(rawBody).digest("hex")}`;
  const actual = Buffer.from(header);
  const wanted = Buffer.from(expected);
  return actual.length === wanted.length && crypto.timingSafeEqual(actual, wanted);
}

function log(message) {
  process.stdout.write(`[deploy-webhook] ${message}\n`);
}

async function runCanonicalSync() {
  const repo = process.env.VPS_REPO_PATH || "/root/CentralDark";
  const script = `${repo}/scripts/vps/auto-sync-main.sh`;
  await execFileAsync("bash", [script], {
    cwd: repo,
    env: { ...process.env, REPO_DIR: repo, BRANCH: "main" },
    maxBuffer: 4 * 1024 * 1024,
  });
}

export function githubDeployWebhook(req, res) {
  const rawBody = Buffer.isBuffer(req.rawBody) ? req.rawBody : null;
  if (!rawBody) return res.status(400).json({ ok: false, error: "RAW_BODY_REQUIRED" });
  if (!validSignature(rawBody, req.get("x-hub-signature-256"))) {
    log("signature rejected");
    return res.status(401).json({ ok: false, error: "INVALID_SIGNATURE" });
  }

  const event = String(req.get("x-github-event") || "");
  if (event === "ping") return res.status(200).json({ ok: true, event: "ping" });
  if (event !== "push") return res.status(202).json({ ok: true, event, action: "ignored" });

  let payload;
  try {
    payload = JSON.parse(rawBody.toString("utf8"));
  } catch {
    return res.status(400).json({ ok: false, error: "INVALID_JSON" });
  }
  if (payload?.ref !== "refs/heads/main") {
    return res.status(202).json({ ok: true, event, action: "ignored_branch", ref: payload?.ref || null });
  }
  if (!/^[0-9a-f]{40}$/i.test(String(payload?.after || ""))) {
    return res.status(400).json({ ok: false, error: "INVALID_AFTER_SHA" });
  }
  if (running) return res.status(202).json({ ok: true, event, action: "already_running" });

  running = true;
  const targetSha = payload.after;
  res.status(202).json({ ok: true, event, action: "accepted", targetSha });
  void runCanonicalSync()
    .then(() => log(`sync PASS sha=${targetSha}`))
    .catch((error) => log(`sync BLOCKED sha=${targetSha} reason=${String(error?.stderr || error?.message || error).slice(0, 500)}`))
    .finally(() => { running = false; });
}

export function githubDeployHealth(_req, res) {
  res.json({
    ok: true,
    service: "centraldark-api-deploy-route",
    route: "/webhook",
    canonicalOwner: "scripts/vps/auto-sync-main.sh",
    signature: secret() ? "configured" : "missing",
    running,
  });
}
