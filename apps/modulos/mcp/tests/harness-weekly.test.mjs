import test from "node:test";
import assert from "node:assert/strict";
import { summarizeHarnessWeekRows } from "../src/agent-observability.js";

const now = Date.parse("2026-10-16T15:00:00.000Z");
const event = (event_id, kind, data, timestamp="2026-10-16T12:00:00.000Z", actor="hermes") =>
  ({ event_id, timestamp, kind, source: kind === "mcp_tool_call" ? "CentralDark-MCP" : "hermes-runtime",
    actor, key: "tool:github_read", data });
test("weekly trace separates PASS FAIL UNKNOWN, deduplicates calls, and computes known denominator", () => {
  const rows = [
    event("a", "mcp_tool_call", {call_id:"call1",ok:true,toolName:"github_read",durationMs:20}),
    event("a-copy", "mcp_tool_call", {call_id:"call1",ok:true,toolName:"github_read",durationMs:20}),
    event("b", "mcp_tool_call", {call_id:"call2",ok:false,toolName:"git_write",durationMs:40}),
    event("c", "grok_tool_started", {tool_name:"shell"}),
    event("old","mcp_tool_call",{call_id:"old",ok:true},"2026-10-07T12:00:00.000Z"),
  ];
  const result=summarizeHarnessWeekRows(rows,{now});
  assert.equal(result.totalObserved,3);
  assert.equal(result.pass,1);
  assert.equal(result.fail,1);
  assert.equal(result.unknown,1);
  assert.equal(result.successPctOfDecided,50);
  assert.equal(result.failurePctOfDecided,50);
  assert.equal(result.unknownPctOfObserved,33.3);
  assert.equal(result.avgDurationMs,30);
  assert.equal(result.daily.reduce((sum, d)=>sum+d.calls,0),3);
  assert.equal(result.coverage,"PARTIAL_INSTRUMENTED");
  assert.equal(JSON.stringify(result).includes("call1"),false);
});
test("no observed events never become 100% success",()=>{
  const result=summarizeHarnessWeekRows([],{now});
  assert.equal(result.totalObserved,0);
  assert.equal(result.successPctOfDecided,null);
  assert.equal(result.failurePctOfDecided,null);
  assert.equal(result.unknownPctOfObserved,null);
});
test("partial-cap warning remains explicit",()=>{
  const result=summarizeHarnessWeekRows([event("x","agent_tool_call",{status:"PASS"})],{now,capped:true});
  assert.equal(result.coverage,"PARTIAL_CAPPED");
  assert.equal(result.capped,true);
  assert.equal(result.bySource[0].name,"hermes");
});
