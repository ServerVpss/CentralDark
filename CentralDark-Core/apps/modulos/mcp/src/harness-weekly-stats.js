/**
 * Read-only weekly projection of the existing CentralDark event funnel.
 * Does not collect, persist, or export raw prompts, credentials or payloads.
 * It is explicitly a bounded sample, not a claim about every harness execution.
 */
export function summarizeHarnessWeekRows(rows, { now = Date.now(), capped = false } = {}) {
  const since = now - 7 * 24 * 60 * 60 * 1000;
  const unique = new Map();
  for (const row of rows) {
    if (!["mcp_tool_call", "agent_tool_call", "grok_tool_started"].includes(row?.kind)) continue;
    const ms = Date.parse(String(row.timestamp || ""));
    if (!Number.isFinite(ms) || ms < since || ms > now) continue;
    const payload = row.data && typeof row.data === "object" ? row.data : {};
    const callId = typeof payload.call_id === "string" && payload.call_id ? payload.call_id : null;
    const key = callId ? row.source + ":" + callId : (row.event_id || row.source + ":" + row.timestamp + ":" + row.key);
    if (unique.has(key)) continue;
    const outcome = payload.ok === true || ["PASS", "SUCCESS", "COMPLETED"].includes(String(payload.status || "").toUpperCase())
      ? "pass"
      : payload.ok === false || ["FAIL", "FAILED", "ERROR", "BLOCKED"].includes(String(payload.status || "").toUpperCase())
        ? "fail" : "unknown";
    const duration = Number(payload.durationMs ?? payload.duration_ms);
    const toolName = String(payload.toolName ?? payload.tool_name ?? (row.key?.startsWith("tool:") ? row.key.slice(5) : "unknown")).slice(0, 96);
    const source = row.kind === "mcp_tool_call" ? "MCP" : (row.actor || "agents").slice(0, 60);
    unique.set(key, { traced: Boolean(payload.trace_id || payload.correlation_id || row.correlation_id), outcome, duration: Number.isFinite(duration) && duration >= 0 ? duration : null,
      toolName, source, day: new Date(ms).toISOString().slice(0, 10) });
  }
  const items = [...unique.values()];
  const pass = items.filter(x => x.outcome === "pass").length;
  const fail = items.filter(x => x.outcome === "fail").length;
  const unknown = items.length - pass - fail;
  const decided = pass + fail;
  const traced = items.filter(x => x.traced).length;
  const pct = n => decided ? Math.round(n / decided * 1000) / 10 : null;
  const counts = new Map();
  const sourceCounts = new Map();
  for (const item of items) {
    const current = counts.get(item.toolName) || { name: item.toolName, calls: 0, pass: 0, fail: 0, unknown: 0 };
    current.calls++;
    current[item.outcome]++;
    counts.set(item.toolName, current);
    const s = sourceCounts.get(item.source) || { name: item.source, calls: 0, pass: 0, fail: 0, unknown: 0 };
    s.calls++; s[item.outcome]++; sourceCounts.set(item.source, s);
  }
  const durations = items.map(x => x.duration).filter(x => x !== null);
  const daily = Array.from({length: 7}, (_, offset) => {
    const day = new Date(now - (6-offset)*86400000).toISOString().slice(0,10);
    const selected = items.filter(x => x.day === day);
    return { day, calls: selected.length, pass: selected.filter(x=>x.outcome==="pass").length,
      fail: selected.filter(x=>x.outcome==="fail").length,
      unknown: selected.filter(x=>x.outcome==="unknown").length };
  });
  return {
    schema: "centraldark.harness.weekly.v1", window: "rolling_7_days", timezone: "UTC",
    observedAt: new Date(now).toISOString(), since: new Date(since).toISOString(),
    coverage: capped ? "PARTIAL_CAPPED" : "PARTIAL_INSTRUMENTED", capped: Boolean(capped),
    totalObserved: items.length, pass, fail, unknown, traced,
    tracePctOfObserved: items.length ? Math.round(traced / items.length * 1000) / 10 : null,
    successPctOfDecided: pct(pass), failurePctOfDecided: pct(fail),
    unknownPctOfObserved: items.length ? Math.round(unknown / items.length * 1000) / 10 : null,
    avgDurationMs: durations.length ? Math.round(durations.reduce((a,b)=>a+b,0)/durations.length) : null,
    durationSamples: durations.length, daily,
    bySource: [...sourceCounts.values()].sort((a,b)=>b.calls-a.calls || a.name.localeCompare(b.name)),
    topTools: [...counts.values()].sort((a,b)=>b.calls-a.calls || a.name.localeCompare(b.name)).slice(0, 12),
    note: "Somente eventos instrumentados MCP/agentes no funil existente; chamadas diretas de ferramentas ChatGPT/Browser/VS Code não são inferidas. Histórico pode estar truncado.",
  };
}
