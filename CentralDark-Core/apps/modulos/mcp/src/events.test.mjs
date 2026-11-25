import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import test from "node:test";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { z } from "zod";
import { buildServer } from "./mcp-server.js";

const {
  CENTRALDARK_RECEIPT_CREATED,
  createEventRegistry,
} = await import("./events.js");

function memoryStore() {
  const subscriptions = new Map();
  const deliveries = new Map();
  return {
    listSubscriptions: () => [...subscriptions.values()],
    getSubscription: (id) => subscriptions.get(id),
    putSubscription: (subscription) => subscriptions.set(subscription.id, subscription),
    deleteSubscription: (id) => subscriptions.delete(id),
    hasDelivery: (id) => deliveries.has(id),
    putDelivery: (id, value) => deliveries.set(id, value),
    deliveries,
  };
}

const principal = { accountId: "gabriel", oauthScope: "mcp" };
const delivery = {
  mode: "webhook",
  url: "https://chatgpt.example.test/mcp-events/callback",
  secret: `whsec_${Buffer.from("a".repeat(32)).toString("base64")}`,
};
const receipt = {
  event_id: "evt_receipt_001",
  mission_id: "mission-001",
  repository: "ServerVpss/CentralDark",
  pr_number: 2175,
  head_sha: "a".repeat(40),
  receipt_fingerprint: "f".repeat(64),
  evidence_ref: "pr:2175#receipt-001",
  status: "PASS",
  timestamp: "2026-11-25T08:00:00.000Z",
};

test("events/list descreve somente centraldark.receipt.created", () => {
  const registry = createEventRegistry({ store: memoryStore(), verifyCallback: async () => ({ ok: true }) });
  const listed = registry.list(principal);
  assert.deepEqual(listed.events.map((event) => event.name), [CENTRALDARK_RECEIPT_CREATED]);
  assert.equal(listed.events[0].deliveryModes[0], "webhook");
});

test("o endpoint MCP autenticado registra events/list fora de tools/call", async () => {
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  const server = buildServer({ callerUser: "gabriel", oauthScope: "mcp" });
  const client = new Client({ name: "events-test", version: "1" }, { capabilities: {} });
  await server.connect(serverTransport);
  await client.connect(clientTransport);
  const listed = await client.request(
    { method: "events/list", params: {} },
    z.object({ events: z.array(z.object({ name: z.string() })), nextCursor: z.null() }),
  );
  assert.deepEqual(listed.events.map((event) => event.name), [CENTRALDARK_RECEIPT_CREATED]);
  await client.close();
  await server.close();
});

test("events/subscribe e events/unsubscribe usam métodos MCP, não tools/call", async () => {
  const calls = [];
  const registry = {
    list: () => ({ events: [], nextCursor: null }),
    subscribe: async (principal, params) => { calls.push({ op: "subscribe", principal, params }); return { id: "sub_test", refreshBefore: "2026-11-26T00:00:00.000Z", cursor: null, truncated: false }; },
    unsubscribe: async (principal, params) => { calls.push({ op: "unsubscribe", principal, params }); return true; },
  };
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  const server = buildServer({ callerUser: "gabriel", oauthScope: "mcp", eventRegistry: registry });
  const client = new Client({ name: "events-test", version: "1" }, { capabilities: {} });
  await server.connect(serverTransport);
  await client.connect(clientTransport);
  const grant = await client.request({ method: "events/subscribe", params: { name: CENTRALDARK_RECEIPT_CREATED, arguments: {}, delivery } }, z.object({ id: z.string() }));
  const cancelled = await client.request({ method: "events/unsubscribe", params: { id: grant.id } }, z.object({ unsubscribed: z.boolean() }));
  assert.equal(cancelled.unsubscribed, true);
  assert.deepEqual(calls.map((call) => call.op), ["subscribe", "unsubscribe"]);
  assert.equal(calls[0].principal.accountId, "gabriel");
  await client.close();
  await server.close();
});

test("events/subscribe exige principal autorizado e idempotência por contrato", async () => {
  const store = memoryStore();
  let verifications = 0;
  const registry = createEventRegistry({
    store,
    verifyCallback: async () => { verifications += 1; return { ok: true }; },
  });
  const params = { name: CENTRALDARK_RECEIPT_CREATED, arguments: { mission_id: "mission-001", pr_number: 2175 }, delivery };
  const first = await registry.subscribe(principal, params);
  const second = await registry.subscribe(principal, params);
  assert.equal(first.id, second.id);
  assert.equal(store.listSubscriptions().length, 1);
  assert.equal(verifications, 1);
  const changedSecret = { ...delivery, secret: `whsec_${Buffer.from("b".repeat(32)).toString("base64")}` };
  await registry.subscribe(principal, { ...params, delivery: changedSecret });
  assert.equal(verifications, 2);
  await assert.rejects(() => registry.subscribe({ accountId: "gabriel", oauthScope: "" }, params), /EVENTS_FORBIDDEN/);
});

test("assinatura de entrega usa o corpo exato e evento duplicado é ignorado", async () => {
  const store = memoryStore();
  const sent = [];
  const registry = createEventRegistry({
    store,
    verifyCallback: async () => ({ ok: true }),
    deliver: async (subscription, body, headers) => { sent.push({ subscription, body, headers }); return { status: 202 }; },
  });
  await registry.subscribe(principal, { name: CENTRALDARK_RECEIPT_CREATED, arguments: { mission_id: "mission-001" }, delivery });
  const first = await registry.publishReceipt(receipt);
  const duplicate = await registry.publishReceipt(receipt);
  assert.equal(first.delivered, 1);
  assert.equal(duplicate.duplicate, true);
  assert.equal(sent.length, 1);
  assert.equal(sent[0].headers["webhook-id"], receipt.event_id);
  assert.match(sent[0].headers["webhook-signature"], /^v1,/);
  assert.equal(JSON.parse(sent[0].body).data.receipt_fingerprint, receipt.receipt_fingerprint);
  assert.equal(createHash("sha256").update(sent[0].body).digest("hex"), first.body_sha256);
});

test("evento com SHA inválido não é entregue e cancelamento é idempotente", async () => {
  const store = memoryStore();
  const registry = createEventRegistry({ store, verifyCallback: async () => ({ ok: true }) });
  const subscribed = await registry.subscribe(principal, { name: CENTRALDARK_RECEIPT_CREATED, arguments: {}, delivery });
  const rejected = await registry.publishReceipt({ ...receipt, event_id: "evt_bad_sha", head_sha: "stale" });
  assert.equal(rejected.rejected, "STALE_SHA");
  assert.equal(await registry.unsubscribe(principal, { id: subscribed.id }), true);
  assert.equal(await registry.unsubscribe(principal, { id: subscribed.id }), false);
});
