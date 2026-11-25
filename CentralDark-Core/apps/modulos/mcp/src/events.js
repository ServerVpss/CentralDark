import { createHash, createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { lookup } from "node:dns/promises";
import https from "node:https";

export const CENTRALDARK_RECEIPT_CREATED = "centraldark.receipt.created";
const MAX_BODY_BYTES = 256 * 1024;
const MAX_RETRIES = 3;
const MAX_TTL_MS = 24 * 60 * 60 * 1000;
const SHA = /^[a-f0-9]{40}$/i;
const FINGERPRINT = /^[a-f0-9]{64}$/i;

const EVENT_DEFINITION = Object.freeze({
  name: CENTRALDARK_RECEIPT_CREATED,
  description: "Recibo CentralDark criado para uma missão autorizada.",
  deliveryModes: ["webhook"],
  argumentsSchema: {
    type: "object",
    properties: {
      mission_id: { type: "string" },
      repository: { type: "string" },
      pr_number: { type: "integer", minimum: 1 },
      status: { type: "string" },
    },
    additionalProperties: false,
  },
  payloadSchema: {
    type: "object",
    required: ["event_id", "mission_id", "repository", "pr_number", "head_sha", "receipt_fingerprint", "evidence_ref", "status", "timestamp"],
  },
});

function canonical(value) {
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  if (value && typeof value === "object") return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonical(value[key])}`).join(",")}}`;
  return JSON.stringify(value);
}

function secretBytes(secret) {
  if (typeof secret !== "string" || !secret.startsWith("whsec_")) throw new Error("EVENTS_INVALID_DELIVERY_SECRET");
  const encoded = secret.slice("whsec_".length);
  let bytes;
  try { bytes = Buffer.from(encoded, "base64"); } catch { throw new Error("EVENTS_INVALID_DELIVERY_SECRET"); }
  if (bytes.length < 24 || bytes.length > 64 || bytes.toString("base64") !== encoded) throw new Error("EVENTS_INVALID_DELIVERY_SECRET");
  return bytes;
}

function publicAddress(address) {
  if (address.includes(":")) return !(/^(::1|fc|fd|fe80:)/i.test(address));
  const parts = address.split(".").map(Number);
  if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) return false;
  const [a, b] = parts;
  return !(a === 0 || a === 10 || a === 127 || a >= 224 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168));
}

export async function validateCallbackUrl(value) {
  let url;
  try { url = new URL(String(value)); } catch { throw new Error("EVENTS_CALLBACK_URL_INVALID"); }
  if (url.protocol !== "https:" || url.username || url.password || !url.hostname) throw new Error("EVENTS_CALLBACK_URL_INVALID");
  const answers = await lookup(url.hostname, { all: true, verbatim: true });
  if (!answers.length || answers.some((answer) => !publicAddress(answer.address))) throw new Error("EVENTS_CALLBACK_ADDRESS_FORBIDDEN");
  return { url, addresses: answers };
}

async function securePost(urlValue, headers, body) {
  const { url, addresses } = await validateCallbackUrl(urlValue);
  const address = addresses[0];
  return await new Promise((resolve, reject) => {
    const request = https.request({
      protocol: "https:", hostname: url.hostname, servername: url.hostname,
      port: url.port || 443, path: `${url.pathname}${url.search}`, method: "POST",
      headers: { ...headers, "content-length": Buffer.byteLength(body) },
      lookup: (_host, _options, callback) => callback(null, address.address, address.family),
      timeout: 10_000,
    }, (response) => {
      const chunks = [];
      let size = 0;
      response.on("data", (chunk) => {
        size += chunk.length;
        if (size <= 16 * 1024) chunks.push(chunk);
      });
      response.on("end", () => resolve({ status: response.statusCode ?? 0, body: Buffer.concat(chunks).toString("utf8") }));
    });
    request.once("timeout", () => request.destroy(new Error("EVENTS_CALLBACK_TIMEOUT")));
    request.once("error", reject);
    request.end(body);
  });
}

function signedHeaders(secret, eventId, body, timestamp = Math.floor(Date.now() / 1000)) {
  const content = `${eventId}.${timestamp}.${body}`;
  const signature = createHmac("sha256", secretBytes(secret)).update(content).digest("base64");
  return {
    "content-type": "application/json",
    "webhook-id": eventId,
    "webhook-timestamp": String(timestamp),
    "webhook-signature": `v1,${signature}`,
  };
}

function allowedPrincipal(principal) {
  return Boolean(principal?.accountId) && /(?:^|\s)mcp(?:\s|$)/.test(String(principal.oauthScope || ""));
}

function validateArguments(argumentsValue) {
  if (argumentsValue == null) return {};
  if (!argumentsValue || Array.isArray(argumentsValue) || typeof argumentsValue !== "object") throw new Error("EVENTS_INVALID_ARGUMENTS");
  const allowed = new Set(["mission_id", "repository", "pr_number", "status"]);
  for (const key of Object.keys(argumentsValue)) if (!allowed.has(key)) throw new Error("EVENTS_INVALID_ARGUMENTS");
  if (argumentsValue.pr_number != null && (!Number.isInteger(argumentsValue.pr_number) || argumentsValue.pr_number < 1)) throw new Error("EVENTS_INVALID_ARGUMENTS");
  for (const key of ["mission_id", "repository", "status"]) if (argumentsValue[key] != null && typeof argumentsValue[key] !== "string") throw new Error("EVENTS_INVALID_ARGUMENTS");
  return structuredClone(argumentsValue);
}

function matches(filters, receipt) {
  return Object.entries(filters).every(([key, value]) => receipt[key] === value);
}

function validateReceipt(receipt) {
  const required = ["event_id", "mission_id", "repository", "pr_number", "head_sha", "receipt_fingerprint", "evidence_ref", "status", "timestamp"];
  if (!receipt || typeof receipt !== "object" || required.some((key) => receipt[key] == null)) return "INVALID_RECEIPT";
  if (!SHA.test(String(receipt.head_sha))) return "STALE_SHA";
  if (!FINGERPRINT.test(String(receipt.receipt_fingerprint))) return "INVALID_RECEIPT";
  if (!Number.isInteger(receipt.pr_number) || receipt.pr_number < 1 || !Number.isFinite(Date.parse(receipt.timestamp))) return "INVALID_RECEIPT";
  return null;
}

export function createEventRegistry({ store, verifyCallback, deliver = securePost, now = () => Date.now() }) {
  if (!store) throw new Error("EVENTS_STORE_REQUIRED");
  const verifier = verifyCallback ?? (async (subscription) => {
    const challenge = randomUUID();
    const eventId = `msg_verification_${randomUUID()}`;
    const body = JSON.stringify({ type: "verification", challenge });
    const response = await deliver(subscription, body, signedHeaders(subscription.delivery.secret, eventId, body));
    if (response.status < 200 || response.status >= 300) return { ok: false, reason: "challenge_failed" };
    let returned = "";
    try { returned = String(JSON.parse(response.body).challenge || ""); } catch { return { ok: false, reason: "challenge_failed" }; }
    const expected = Buffer.from(challenge);
    const actual = Buffer.from(returned);
    return { ok: actual.length === expected.length && timingSafeEqual(actual, expected), reason: "challenge_failed" };
  });

  function list(principal) {
    if (!allowedPrincipal(principal)) throw new Error("EVENTS_FORBIDDEN");
    return { events: [EVENT_DEFINITION], nextCursor: null };
  }

  async function subscribe(principal, params) {
    if (!allowedPrincipal(principal)) throw new Error("EVENTS_FORBIDDEN");
    if (params?.name !== CENTRALDARK_RECEIPT_CREATED || params?.delivery?.mode !== "webhook") throw new Error("EVENTS_UNSUPPORTED");
    const argumentsValue = validateArguments(params.arguments);
    secretBytes(params.delivery.secret);
    const ttlMs = Math.min(Number.isFinite(params.ttlMs) ? Math.max(60_000, params.ttlMs) : MAX_TTL_MS, MAX_TTL_MS);
    const identity = canonical([principal.accountId, params.delivery.url, params.name, argumentsValue]);
    const id = `sub_${createHash("sha256").update(identity).digest("hex").slice(0, 32)}`;
    const existing = store.getSubscription(id);
    const subscription = {
      id, account_id: principal.accountId, name: params.name, arguments: argumentsValue,
      delivery: { mode: "webhook", url: params.delivery.url, secret: params.delivery.secret },
      expires_at: new Date(now() + ttlMs).toISOString(), updated_at: new Date(now()).toISOString(),
    };
    if (!existing || existing.delivery?.secret !== subscription.delivery.secret) {
      const verification = await verifier(subscription);
      if (!verification?.ok) throw new Error(`EVENTS_CALLBACK_${verification?.reason || "FAILED"}`);
    }
    store.putSubscription(subscription);
    return { id, refreshBefore: subscription.expires_at, cursor: null, truncated: false };
  }

  async function unsubscribe(principal, params) {
    if (!allowedPrincipal(principal)) throw new Error("EVENTS_FORBIDDEN");
    const subscription = store.getSubscription(String(params?.id || ""));
    if (!subscription || subscription.account_id !== principal.accountId) return false;
    store.deleteSubscription(subscription.id);
    return true;
  }

  async function publishReceipt(receipt) {
    const rejected = validateReceipt(receipt);
    if (rejected) return { delivered: 0, rejected };
    if (store.hasDelivery(receipt.event_id)) return { delivered: 0, duplicate: true };
    const event = { eventId: receipt.event_id, name: CENTRALDARK_RECEIPT_CREATED, timestamp: receipt.timestamp, data: receipt, cursor: null };
    const body = JSON.stringify(event);
    if (Buffer.byteLength(body) > MAX_BODY_BYTES) return { delivered: 0, rejected: "EVENT_TOO_LARGE" };
    const body_sha256 = createHash("sha256").update(body).digest("hex");
    const targets = store.listSubscriptions().filter((subscription) => subscription.name === event.name && Date.parse(subscription.expires_at) > now() && matches(subscription.arguments, receipt));
    let delivered = 0;
    const failures = [];
    for (const subscription of targets) {
      let response = null;
      for (let attempt = 1; attempt <= MAX_RETRIES; attempt += 1) {
        const headers = { ...signedHeaders(subscription.delivery.secret, event.eventId, body), "x-mcp-subscription-id": subscription.id };
        try { response = await deliver(subscription, body, headers); } catch (error) { response = { status: 0, error: String(error) }; }
        if (response.status >= 200 && response.status < 300) break;
        if (response.status === 410 || response.status === 413) break;
      }
      if (response?.status >= 200 && response.status < 300) delivered += 1;
      else failures.push({ id: subscription.id, status: response?.status ?? 0 });
    }
    store.putDelivery(receipt.event_id, { event_id: receipt.event_id, body_sha256, delivered_at: new Date(now()).toISOString(), delivered, failures });
    return { delivered, failures, body_sha256 };
  }

  return { list, subscribe, unsubscribe, publishReceipt };
}
