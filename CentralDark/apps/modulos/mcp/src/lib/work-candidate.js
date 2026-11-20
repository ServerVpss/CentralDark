import { createHash } from "node:crypto";

const CAPABILITY_RE = /^[A-Za-z0-9_-]{1,64}$/;
const SHA_RE = /^[0-9a-f]{40}$/i;
const RISK_RE = /^R[0-4]$/;
const MAX_CANDIDATES = 16;
const MAX_INPUT_BYTES = 20_000;
const SENSITIVE_KEY_RE = /(token|secret|password|passwd|authorization|cookie|session|api[_-]?key|private[_-]?key|service[_-]?role)/i;
const SENSITIVE_VALUE_RE = /(?:Bearer\s+\S{12,}|gh[pousr]_[A-Za-z0-9]{20,}|sb_(?:secret|publishable)_[A-Za-z0-9_-]{20,}|sk-[A-Za-z0-9]{20,}|-----BEGIN [A-Z ]*PRIVATE KEY-----)/i;

function stableValue(value) {
  if (Array.isArray(value)) return value.map(stableValue);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.keys(value).sort().map((key) => [key, stableValue(value[key])]),
    );
  }
  return value;
}

function containsSensitiveMaterial(value, depth = 0) {
  if (depth > 8) return true;
  if (typeof value === "string") return SENSITIVE_VALUE_RE.test(value);
  if (Array.isArray(value)) return value.some((item) => containsSensitiveMaterial(item, depth + 1));
  if (value && typeof value === "object") {
    return Object.entries(value).some(([key, item]) =>
      SENSITIVE_KEY_RE.test(key) || containsSensitiveMaterial(item, depth + 1)
    );
  }
  return false;
}

function byteLength(value) {
  return Buffer.byteLength(JSON.stringify(value), "utf8");
}

export function deriveWriterScope(capability) {
  const normalized = String(capability || "").trim();
  if (!CAPABILITY_RE.test(normalized)) return null;
  return `capability:${normalized.toLowerCase()}`;
}

export function candidateFingerprint({ capability, writerScope, target, branchSha, input }) {
  const identity = stableValue({
    capability: String(capability || "").trim().toLowerCase(),
    writer_scope: String(writerScope || "").trim().toLowerCase(),
    target: target == null ? null : String(target).trim(),
    branch_sha: String(branchSha || "").trim().toLowerCase(),
    input: input && typeof input === "object" && !Array.isArray(input) ? input : {},
  });
  return createHash("sha256").update(JSON.stringify(identity)).digest("hex");
}

export function extractWorkCandidates(payload, mission) {
  const raw = Array.isArray(payload?.work_candidates) ? payload.work_candidates : [];
  const accepted = [];
  const rejected = [];
  const branchSha = String(mission?.branch_sha || "").trim().toLowerCase();
  const risk = RISK_RE.test(String(mission?.risk || "")) ? String(mission.risk) : "R1";

  if (!SHA_RE.test(branchSha)) {
    return {
      accepted,
      rejected: raw.length ? [{ index: -1, reason: "PARENT_REVISION_UNPROVEN" }] : [],
      truncated: raw.length > MAX_CANDIDATES,
      totalObserved: raw.length,
    };
  }

  for (let index = 0; index < Math.min(raw.length, MAX_CANDIDATES); index += 1) {
    const item = raw[index];
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      rejected.push({ index, reason: "CANDIDATE_NOT_OBJECT" });
      continue;
    }

    const capability = String(item.capability || "").trim();
    const writerScope = deriveWriterScope(capability);
    const input = item.input == null ? {} : item.input;
    if (!writerScope) {
      rejected.push({ index, reason: "CAPABILITY_INVALID" });
      continue;
    }
    if (!input || typeof input !== "object" || Array.isArray(input)) {
      rejected.push({ index, reason: "INPUT_NOT_OBJECT" });
      continue;
    }
    if (byteLength(input) > MAX_INPUT_BYTES) {
      rejected.push({ index, reason: "INPUT_TOO_LARGE" });
      continue;
    }
    if (containsSensitiveMaterial({
      input,
      title: item.title,
      target: item.target,
    })) {
      rejected.push({ index, reason: "SENSITIVE_MATERIAL" });
      continue;
    }

    const target = item.target == null || String(item.target).trim() === ""
      ? null
      : String(item.target).trim().slice(0, 200);
    const title = String(item.title || `Descoberta: ${capability}`).trim().slice(0, 200);
    if (!title) {
      rejected.push({ index, reason: "TITLE_EMPTY" });
      continue;
    }

    accepted.push({
      title,
      target,
      capability,
      writer_scope: writerScope,
      input,
      branch_sha: branchSha,
      risk,
      work_fingerprint: candidateFingerprint({
        capability,
        writerScope,
        target,
        branchSha,
        input,
      }),
    });
  }

  return {
    accepted,
    rejected,
    truncated: raw.length > MAX_CANDIDATES,
    totalObserved: raw.length,
  };
}

export const __test = Object.freeze({
  containsSensitiveMaterial,
  stableValue,
  MAX_CANDIDATES,
  MAX_INPUT_BYTES,
});
