import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
import test from "node:test";

const sessionsUrl = new URL("./sessions.js", import.meta.url).href;

test("estado de inscrições MCP Events sobrevive a novo processo com permissão restrita", () => {
  const dir = mkdtempSync(join(tmpdir(), "centraldark-events-"));
  const state = join(dir, "mcp-state.json");
  const subscription = { id: "sub_persist", account_id: "gabriel", name: "centraldark.receipt.created", delivery: { secret: "whsec_test" } };
  const run = (source) => execFileSync(process.execPath, ["--input-type=module", "-e", source], {
    env: { ...process.env, MCP_STATE_FILE: state }, encoding: "utf8",
  });
  try {
    run(`import { eventSubscriptionStore } from ${JSON.stringify(sessionsUrl)}; eventSubscriptionStore.putSubscription(${JSON.stringify(subscription)});`);
    const loaded = JSON.parse(run(`import { eventSubscriptionStore } from ${JSON.stringify(sessionsUrl)}; console.log(JSON.stringify(eventSubscriptionStore.getSubscription('sub_persist')));`));
    assert.equal(loaded.id, subscription.id);
    assert.equal(readFileSync(state).includes("sub_persist"), true);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
