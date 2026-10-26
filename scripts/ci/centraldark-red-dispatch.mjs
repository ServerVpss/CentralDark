// CentralDark RED — entrada universal para Cline, ZENDRIVE, Hermes e outros modelos.
// Le somente um JSON sanitizado via stdin; NUNCA le prompt/log bruto, nem expõe token.
// Realiza repository_dispatch para workflow confiavel na branch main apos deploy.
import { normalizeRedReport } from "./centraldark-red-intake.mjs";

const REPO = "ServerVpss/CentralDark";
const API = "https://api.github.com/repos/" + REPO + "/dispatches";
async function readStdin(maxBytes = 4096) {
  let data = "";
  for await (const part of process.stdin) {
    data += part.toString("utf8");
    if (data.length > maxBytes) throw new Error("RED_INPUT_TOO_LARGE");
  }
  if (!data.trim()) throw new Error("RED_INPUT_EMPTY");
  return JSON.parse(data);
}
async function main() {
  const token = process.env.CENTRALDARK_GITHUB_DISPATCH_TOKEN;
  if (!token) throw new Error("DISPATCH_CREDENTIAL_NOT_BOUND");
  const raw = await readStdin();
  const red = normalizeRedReport(raw);
  const response = await fetch(API, {
    method: "POST",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: "Bearer " + token,
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ event_type: "centraldark_red_v1", client_payload: red }),
  });
  if (response.status !== 204) throw new Error("GITHUB_DISPATCH_HTTP_" + response.status);
  process.stdout.write(JSON.stringify({
    state: "DISPATCH_ACCEPTED_NOT_PROCESSING_PROOF",
    fingerprint: red.fingerprint, github_event: "centraldark_red_v1",
    next: "GITHUB_ACTION_RUN_THEN_PR_AND_SUPABASE_READBACK",
  }) + "\n");
}
main().catch((e) => {
  const code = e instanceof Error ? e.message : "UNKNOWN";
  console.error("RED_DISPATCH_BLOCKED=" + code.replace(/[^A-Z0-9_]/gi, "_").slice(0,100));
  process.exitCode = 1;
});
