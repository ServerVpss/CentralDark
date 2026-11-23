/** CentralDark: separate Hermes native skill context activations from finished skill invocations. */
export type SkillUsageReceipt = {
  skill: string;
  receiptId: string;
  at: string;
  kind: "ACTIVATION" | "INVOCATION";
  outcome: "PASS" | "FAIL" | "BLOCKED" | "UNKNOWN" | null;
  source: string;
};
export type SkillUsageSummary = {
  skill: string;
  activations: number;
  executions: number;
  pass: number;
  fail: number;
  blocked: number;
  unknown: number;
  lastSeen: string;
};
function record(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function safeId(value: unknown, max: number): string | null {
  if (typeof value !== "string" || value.length > max || !/^[A-Za-z0-9_.:/-]+$/.test(value))
    return null;
  return value;
}
export function normalizeSkillUsageEvent(raw: unknown): SkillUsageReceipt | null {
  if (!record(raw) || raw["area"] !== "skill-usage") return null;
  const action = raw["acao"];
  if (action !== "skill_invocation" && action !== "skill_loaded") return null;
  const meta = raw["metadata"];
  if (!record(meta) || meta["verified"] !== true) return null;
  const skill = safeId(meta["skill_id"], 160);
  const receiptId = safeId(meta["receipt_id"], 180);
  const source = safeId(meta["source"], 80);
  const at = typeof raw["ts"] === "string" ? raw["ts"] : "";
  if (!skill || !receiptId || !source || !Number.isFinite(Date.parse(at))) return null;
  if (action === "skill_loaded") {
    // This is the native Hermes usage counter, NOT a completed task receipt.
    const useCount = meta["use_count"];
    if (
      source !== "HermesNativeSkillLifecycle" ||
      meta["kind"] !== "SKILL_CONTEXT_ACTIVATION_NOT_TASK_EXECUTION" ||
      typeof useCount !== "number" ||
      !Number.isInteger(useCount) ||
      useCount <= 0
    )
      return null;
    return { skill, receiptId, at, source, kind: "ACTIVATION", outcome: null };
  }
  const outcome = meta["outcome"];
  if (outcome !== "PASS" && outcome !== "FAIL" && outcome !== "BLOCKED" && outcome !== "UNKNOWN")
    return null;
  return { skill, receiptId, at, source, kind: "INVOCATION", outcome };
}
export function summarizeSkillUsage(rows: readonly unknown[]): {
  records: SkillUsageSummary[];
  invalid: number;
  repeated: number;
} {
  const map = new Map<string, SkillUsageSummary>();
  const seen = new Set<string>();
  let invalid = 0;
  let repeated = 0;
  for (const row of rows) {
    const event = normalizeSkillUsageEvent(row);
    if (!event) {
      invalid++;
      continue;
    }
    if (seen.has(event.receiptId)) {
      repeated++;
      continue;
    }
    seen.add(event.receiptId);
    const count = map.get(event.skill) ?? {
      skill: event.skill,
      activations: 0,
      executions: 0,
      pass: 0,
      fail: 0,
      blocked: 0,
      unknown: 0,
      lastSeen: event.at,
    };
    if (event.kind === "ACTIVATION") {
      count.activations++;
    } else {
      count.executions++;
      if (event.outcome === "PASS") count.pass++;
      else if (event.outcome === "FAIL") count.fail++;
      else if (event.outcome === "BLOCKED") count.blocked++;
      else count.unknown++;
    }
    if (Date.parse(event.at) > Date.parse(count.lastSeen)) count.lastSeen = event.at;
    map.set(event.skill, count);
  }
  return {
    records: [...map.values()].sort(
      (a, b) =>
        b.activations + b.executions - (a.activations + a.executions) ||
        a.skill.localeCompare(b.skill),
    ),
    invalid,
    repeated,
  };
}
