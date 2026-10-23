// CentralDark — Red Guard: GitHub PR canônico + Supabase notifications_log.
// Executa SOMENTE como job trusted repository_dispatch/workflow_dispatch no default branch.
// Nunca imprime tokens, tool outputs, prompts, stack traces ou payload bruto.
import { readFile } from "node:fs/promises";
import {
  RED_PR_BRANCH, RED_PR_NUMBER, RED_RECEIPT_PATH, normalizeRedReport,
  receiptComment, isSameRed,
} from "./centraldark-red-intake.mjs";

const REPOSITORY = "ServerVpss/CentralDark";
const PR_URL = "https://github.com/" + REPOSITORY + "/pull/" + RED_PR_NUMBER;
const GH_API = "https://api.github.com";
const SECRET_KEY = process.env.CENTRALDARK_SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_URL = (process.env.CENTRALDARK_SUPABASE_URL ?? "").replace(/\/+$/, "");
const githubToken = process.env.GITHUB_TOKEN ?? "";
function guard(cond, code) { if (!cond) throw new Error(code); }

async function github(path, method = "GET", body) {
  const response = await fetch(GH_API + "/repos/" + REPOSITORY + path, {
    method,
    headers: {
      "Accept": "application/vnd.github+json",
      "Authorization": "Bearer " + githubToken,
      "X-GitHub-Api-Version": "2022-11-28",
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  if (!response.ok) throw new Error("GITHUB_HTTP_" + response.status);
  if (response.status === 204) return null;
  return response.json();
}

async function projection(red, number, githubCommentUrl) {
  if (!SUPABASE_URL || !SECRET_KEY) {
    throw new Error("SUPABASE_SECRET_BINDINGS_ABSENT");
  }
  // Key only used in a GitHub Actions server job. Never render into frontend.
  const headers = {
    apikey: SECRET_KEY,
    ...(SECRET_KEY.startsWith("sb_secret_") ? {} : { Authorization: "Bearer " + SECRET_KEY }),
    "Content-Type": "application/json",
  };
  const id = "centraldark:red:" + red.fingerprint;
  const table = SUPABASE_URL + "/rest/v1/notifications_log";
  const lookup = await fetch(table + "?select=id&dedupe_hash=eq." + encodeURIComponent(id) + "&limit=1", {
    headers, cache: "no-store",
  });
  if (!lookup.ok) throw new Error("SUPABASE_LOOKUP_HTTP_" + lookup.status);
  const existing = await lookup.json();
  if (Array.isArray(existing) && existing.length > 0) return "ALREADY_PROJECTED";
  const input = {
    origem: "cline_toolcall_red", tipo: "erro",
    titulo: "🔴 RED #" + String(number).padStart(3, "0") + " — " + red.surface + " / " + red.error_code,
    mensagem: "Tool " + red.tool_name + " · " + red.category + ". Confrontar no PR e reexecutar contraprova.",
    event_key: "centraldark.red.toolcall.v1",
    link: PR_URL,
    group_key: "centraldark:red:" + red.fingerprint,
    dedupe_hash: id,
    metadata: {
      ...red, github_receipt: githubCommentUrl, pr_url: PR_URL,
      proof_state: "FAIL_OBSERVED", publication_mode: "GITHUB_ACTIONS_AUTO_PROJECTION",
    },
  };
  const saved = await fetch(table, {
    method: "POST", headers: { ...headers, Prefer: "return=representation" },
    body: JSON.stringify(input),
  });
  if (!saved.ok) throw new Error("SUPABASE_INSERT_HTTP_" + saved.status);
  const rows = await saved.json();
  guard(Array.isArray(rows) && rows[0]?.id, "SUPABASE_READBACK_NOT_PROVED");
  return "SUPABASE_INSERT_CONFIRMED";
}

async function getFullComments() {
  const comments = [];
  for (let page = 1; page <= 10; page++) {
    const next = await github("/issues/" + RED_PR_NUMBER + "/comments?per_page=100&page=" + page);
    guard(Array.isArray(next), "GITHUB_COMMENTS_INVALID");
    comments.push(...next);
    if (next.length < 100) return comments;
  }
  throw new Error("GITHUB_COMMENTS_PAGINATION_LIMIT");
}

async function main() {
  guard(process.env.GITHUB_REPOSITORY === REPOSITORY, "REPO_IDENTITY_MISMATCH");
  guard(githubToken.length > 0, "GITHUB_TOKEN_MISSING");
  const file = process.env.GITHUB_EVENT_PATH;
  guard(typeof file === "string" && file.length > 0, "EVENT_FILE_MISSING");
  const event = JSON.parse(await readFile(file, "utf8"));
  const input = event.action === "centraldark_red_v1"
    ? event.client_payload : event.inputs;
  guard(input && typeof input === "object", "RED_PAYLOAD_MISSING");
  const red = normalizeRedReport(input);
  const pr = await github("/pulls/" + RED_PR_NUMBER);
  guard(pr.state === "open" && pr.merged !== true, "RED_PR_NOT_OPEN");
  guard(pr.head?.ref === RED_PR_BRANCH && pr.head?.repo?.full_name === REPOSITORY, "RED_PR_BRANCH_MISMATCH");

  const path = "/contents/" + RED_RECEIPT_PATH.split("/").map(encodeURIComponent).join("/");
  const receipt = await github(path + "?ref=" + encodeURIComponent(RED_PR_BRANCH));
  guard(receipt.encoding === "base64" && receipt.sha, "RED_LEDGER_INVALID");
  const ledger = Buffer.from(receipt.content.replace(/\s/g, ""), "base64").toString("utf8");
  const knownNumbers = [...ledger.matchAll(/## 🔴 RED #(\d{3,})/g)].map((m) => Number(m[1]));
  // Historical RED 001/002 are already documented, not new IDs for recurring cause.
  const knownCategoryId = {
    "NOT_ADVERTISED": 1,
    "ADVERTISED_BUT_REJECTED": 2,
  };
  const historical = knownCategoryId[red.category];
  const nextNumber = historical ?? Math.max(2, ...knownNumbers) + 1;
  const comments = await getFullComments();
  const already = comments.find((c) => isSameRed(c.body, red.fingerprint));
  let commentUrl = already?.html_url ?? null;
  if (!already) {
    const posted = await github("/issues/" + RED_PR_NUMBER + "/comments", "POST", {
      body: receiptComment(red, nextNumber),
    });
    guard(posted?.id && posted.html_url, "RED_COMMENT_NOT_PERSISTED");
    commentUrl = posted.html_url;
  }
  // Only new causal fingerprint adds a ledger entry; repeated RED is one fingerprint.
  const mark = "<!-- centraldark.red.v1:" + red.fingerprint + " -->";
  if (!ledger.includes(mark)) {
    const addition = [
      "", "", "### Registro RED #" + String(nextNumber).padStart(3, "0") + " / ocorrência " + red.fingerprint,
      mark,
      "- Origem: `" + red.surface + "`, host `" + red.host + "`",
      "- Ferramenta: `" + red.tool_name + "`, classe `" + red.category + "`",
      "- Código: `" + red.error_code + "`, modelo informado `" + red.model + "`",
      "- Source SHA: `" + red.source_sha + "`",
      "- Recibo GitHub: " + (commentUrl ?? "UNKNOWN"),
      "- FIX_STATE: `UNKNOWN`; CLINE_SESSION_E2E: `UNKNOWN`",
      "- NEXT_CURSOR: `" + red.next_cursor + "`",
    ].join("\n");
    const newContent = ledger + addition + "\n";
    // CAS via SHA: never overwrite another writer's newer version.
    await github(path, "PUT", {
      message: "red(auto): registrar " + red.fingerprint + " no ledger do PR #1903",
      branch: RED_PR_BRANCH, sha: receipt.sha,
      content: Buffer.from(newContent).toString("base64"),
    });
  }
  const projected = await projection(red, nextNumber, commentUrl);
  // Do not log identifiers beyond public PR link and sanitized classification.
  process.stdout.write(JSON.stringify({
    state: projected, red: String(nextNumber).padStart(3, "0"),
    fingerprint: red.fingerprint, pr: PR_URL,
    githubReceipt: commentUrl,
    proof: "SOURCE_EVENT_RECORDED_RUNTIME_FIX_UNKNOWN",
  }) + "\n");
}
main().catch((e) => {
  console.error("RED_INGEST_BLOCKED=" + (e instanceof Error ? e.message.replace(/[^A-Z0-9_]/gi, "_").slice(0,90) : "UNKNOWN"));
  process.exitCode = 1;
});
