import { createHash, randomUUID } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { z } from "zod";

const READ = {
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: true,
};

const WRITE = {
  readOnlyHint: false,
  destructiveHint: true,
  idempotentHint: false,
  openWorldHint: true,
};

const VERIFIED_AT = "2026-08-15";
const CLOUDFLARE_BASE = "https://api.cloudflare.com/client/v4";
const CONTABO_BASE = "https://api.contabo.com";
const CONTABO_AUTH = "https://auth.contabo.com/auth/realms/contabo/protocol/openid-connect/token";
const TAILSCALE_BASE = "https://api.tailscale.com/api/v2";
const BUILDKITE_BASE = "https://api.buildkite.com/v2";
const SUPPORTED_PROVIDERS = new Set(["cloudflare", "contabo", "tailscale", "buildkite"]);
const PATH_VALUE_RE = /^[A-Za-z0-9._:-]{1,160}$/;
const CURRENCY_RE = /^[A-Z]{3}$/;
const SENSITIVE_KEY_RE = /(authorization|cookie|password|passwd|senha|secret|token|api[_-]?key|private[_-]?key|service[_-]?role|refresh[_-]?token|access[_-]?token|credential|credencial|card[_-]?number|payment[_-]?nonce)/i;
const SENSITIVE_VALUE_RE = /(?:Bearer\s+\S{12,}|bkua_[A-Za-z0-9]+|tskey-[a-z]+-\S+|gh[pousr]_[A-Za-z0-9_]{20,}|sb_(?:secret|publishable)_[A-Za-z0-9_-]{20,}|sk-[A-Za-z0-9_-]{16,}|-----BEGIN [A-Z ]*PRIVATE KEY-----)/i;

const capability = (provider, name, spec) => Object.freeze({
  provider,
  capability: name,
  financial: false,
  deprecated: false,
  alpha: false,
  restricted: false,
  secretBearing: false,
  requiredParams: [],
  queryParams: [],
  body: false,
  controlPlaneStatus: ["READ_SUPPORTED", "FINANCIAL_READ_SUPPORTED"].includes(spec.status)
    ? "READY_READ_ONLY"
    : spec.status === "UNSUPPORTED_BY_PUBLIC_API"
      ? "NOT_AVAILABLE"
      : "QUARANTINED_UNTIL_RUNTIME_COMPENSATION_PROVEN",
  lastVerifiedAt: VERIFIED_AT,
  ...spec,
});

export const PROVIDER_CAPABILITY_MATRIX = Object.freeze([
  capability("cloudflare", "accounts.list", {
    status: "READ_SUPPORTED", method: "GET", path: "/accounts",
    permission: "Account Settings Read", evidenceRef: "https://developers.cloudflare.com/api/resources/accounts/",
  }),
  capability("cloudflare", "zones.list", {
    status: "READ_SUPPORTED", method: "GET", path: "/zones",
    permission: "Zone Read", evidenceRef: "https://developers.cloudflare.com/api/resources/zones/",
    queryParams: ["name", "status", "account.id", "page", "per_page"],
  }),
  capability("cloudflare", "zones.get", {
    status: "READ_SUPPORTED", method: "GET", path: "/zones/{zone_id}",
    permission: "Zone Read", evidenceRef: "https://developers.cloudflare.com/api/resources/zones/",
    requiredParams: ["zone_id"],
  }),
  capability("cloudflare", "dns.list", {
    status: "READ_SUPPORTED", method: "GET", path: "/zones/{zone_id}/dns_records",
    permission: "DNS Read", evidenceRef: "https://developers.cloudflare.com/api/resources/dns/subresources/records/",
    requiredParams: ["zone_id"], queryParams: ["type", "name", "content", "proxied", "page", "per_page"],
  }),
  capability("cloudflare", "dns.create", {
    status: "WRITE_SUPPORTED", method: "POST", path: "/zones/{zone_id}/dns_records",
    permission: "DNS Write", evidenceRef: "https://developers.cloudflare.com/api/resources/dns/subresources/records/methods/create/",
    requiredParams: ["zone_id"], body: true,
  }),
  capability("cloudflare", "dns.update", {
    status: "WRITE_SUPPORTED", method: "PATCH", path: "/zones/{zone_id}/dns_records/{record_id}",
    permission: "DNS Write", evidenceRef: "https://developers.cloudflare.com/api/resources/dns/subresources/records/",
    requiredParams: ["zone_id", "record_id"], body: true,
  }),
  capability("cloudflare", "dns.delete", {
    status: "DESTRUCTIVE_SUPPORTED", method: "DELETE", path: "/zones/{zone_id}/dns_records/{record_id}",
    permission: "DNS Write", evidenceRef: "https://developers.cloudflare.com/api/resources/dns/subresources/records/",
    requiredParams: ["zone_id", "record_id"],
  }),
  capability("cloudflare", "rulesets.list", {
    status: "READ_SUPPORTED", method: "GET", path: "/{scope}/{scope_id}/rulesets",
    permission: "Varies by ruleset phase", evidenceRef: "https://developers.cloudflare.com/api/resources/rulesets/",
    requiredParams: ["scope", "scope_id"],
  }),
  capability("cloudflare", "rulesets.create", {
    status: "WRITE_SUPPORTED", method: "POST", path: "/{scope}/{scope_id}/rulesets",
    permission: "Varies by ruleset phase", evidenceRef: "https://developers.cloudflare.com/api/resources/rulesets/",
    requiredParams: ["scope", "scope_id"], body: true,
  }),
  capability("cloudflare", "rulesets.update", {
    status: "WRITE_SUPPORTED", method: "PUT", path: "/{scope}/{scope_id}/rulesets/{ruleset_id}",
    permission: "Varies by ruleset phase", evidenceRef: "https://developers.cloudflare.com/api/resources/rulesets/",
    requiredParams: ["scope", "scope_id", "ruleset_id"], body: true,
  }),
  capability("cloudflare", "rulesets.delete", {
    status: "DESTRUCTIVE_SUPPORTED", method: "DELETE", path: "/{scope}/{scope_id}/rulesets/{ruleset_id}",
    permission: "Varies by ruleset phase", evidenceRef: "https://developers.cloudflare.com/api/resources/rulesets/",
    requiredParams: ["scope", "scope_id", "ruleset_id"],
  }),
  capability("cloudflare", "origin_ca.list", {
    status: "READ_SUPPORTED", method: "GET", path: "/certificates",
    permission: "Origin CA certificate permission", evidenceRef: "https://developers.cloudflare.com/api/resources/origin_ca_certificates/",
  }),
  capability("cloudflare", "origin_ca.get", {
    status: "READ_SUPPORTED", method: "GET", path: "/certificates/{certificate_id}",
    permission: "Origin CA certificate permission", evidenceRef: "https://developers.cloudflare.com/api/resources/origin_ca_certificates/",
    requiredParams: ["certificate_id"],
  }),
  capability("cloudflare", "origin_ca.create", {
    status: "WRITE_SUPPORTED", method: "POST", path: "/certificates",
    permission: "Origin CA certificate permission", evidenceRef: "https://developers.cloudflare.com/api/resources/origin_ca_certificates/",
    body: true,
  }),
  capability("cloudflare", "origin_ca.revoke", {
    status: "DESTRUCTIVE_SUPPORTED", method: "DELETE", path: "/certificates/{certificate_id}",
    permission: "Origin CA certificate permission", evidenceRef: "https://developers.cloudflare.com/api/resources/origin_ca_certificates/",
    requiredParams: ["certificate_id"],
  }),
  capability("cloudflare", "subscriptions.list", {
    status: "FINANCIAL_READ_SUPPORTED", method: "GET", path: "/{scope}/{scope_id}/subscriptions",
    permission: "Billing Read", evidenceRef: "https://developers.cloudflare.com/api/resources/accounts/subresources/subscriptions/",
    requiredParams: ["scope", "scope_id"], financial: true,
  }),
  capability("cloudflare", "subscriptions.create", {
    status: "FINANCIAL_WRITE_SUPPORTED", method: "POST", path: "/{scope}/{scope_id}/subscriptions",
    permission: "Billing Write", evidenceRef: "https://developers.cloudflare.com/api/resources/accounts/subresources/subscriptions/methods/create/",
    requiredParams: ["scope", "scope_id"], body: true, financial: true,
  }),
  capability("cloudflare", "subscriptions.update", {
    status: "FINANCIAL_WRITE_SUPPORTED", method: "PUT", path: "/accounts/{account_id}/subscriptions/{subscription_id}",
    permission: "Billing Write", evidenceRef: "https://developers.cloudflare.com/api/resources/accounts/subresources/subscriptions/",
    requiredParams: ["account_id", "subscription_id"], body: true, financial: true,
  }),
  capability("cloudflare", "subscriptions.delete", {
    status: "FINANCIAL_WRITE_SUPPORTED", method: "DELETE", path: "/accounts/{account_id}/subscriptions/{subscription_id}",
    permission: "Billing Write", evidenceRef: "https://developers.cloudflare.com/api/resources/accounts/subresources/subscriptions/",
    requiredParams: ["account_id", "subscription_id"], financial: true,
  }),
  capability("cloudflare", "billing.paygo_info", {
    status: "FINANCIAL_READ_SUPPORTED", method: "GET", path: "/accounts/{account_id}/paygo-usage-info",
    permission: "Billing Read", evidenceRef: "https://developers.cloudflare.com/api/resources/billing/subresources/usage/methods/paygo_info/",
    requiredParams: ["account_id"], financial: true, alpha: true,
  }),
  capability("cloudflare", "billing.paygo_usage", {
    status: "FINANCIAL_READ_SUPPORTED", method: "GET", path: "/accounts/{account_id}/paygo-usage",
    permission: "Billing Read", evidenceRef: "https://developers.cloudflare.com/api/resources/billing/subresources/usage/methods/paygo/",
    requiredParams: ["account_id"], queryParams: ["from", "to"], financial: true, alpha: true,
  }),
  capability("cloudflare", "billing.account_usage", {
    status: "FINANCIAL_READ_SUPPORTED", method: "GET", path: "/accounts/{account_id}/billable/usage",
    permission: "Billing Read", evidenceRef: "https://developers.cloudflare.com/api/resources/billing/subresources/usage/methods/get/",
    requiredParams: ["account_id"], queryParams: ["from", "to", "metric_id"], financial: true, alpha: true, restricted: true,
  }),
  capability("cloudflare", "billing.profile", {
    status: "DEPRECATED", method: "GET", path: "/accounts/{account_id}/billing/profile",
    permission: "Billing Read or Billing Write", evidenceRef: "https://developers.cloudflare.com/api/resources/billing/subresources/profiles/methods/get/",
    requiredParams: ["account_id"], financial: true, deprecated: true, controlPlaneStatus: "READ_ONLY_DEPRECATED",
  }),
  capability("cloudflare", "billing.history", {
    status: "DEPRECATED", method: "GET", path: "/user/billing/history",
    permission: "Billing permission", evidenceRef: "https://developers.cloudflare.com/api/resources/user/subresources/billing/subresources/history/",
    financial: true, deprecated: true, controlPlaneStatus: "READ_ONLY_DEPRECATED",
  }),
  capability("cloudflare", "billing.pay_invoice", {
    status: "UNSUPPORTED_BY_PUBLIC_API", method: null, path: null,
    permission: null, evidenceRef: "https://developers.cloudflare.com/billing/manage-invoices/",
    financial: true,
  }),

  capability("contabo", "instances.list", {
    status: "READ_SUPPORTED", method: "GET", path: "/v1/compute/instances",
    permission: "Bearer + account role", evidenceRef: "https://api.contabo.com/",
    queryParams: ["page", "size", "orderBy", "name", "status", "tag"],
  }),
  capability("contabo", "instances.get", {
    status: "READ_SUPPORTED", method: "GET", path: "/v1/compute/instances/{instance_id}",
    permission: "Bearer + account role", evidenceRef: "https://api.contabo.com/",
    requiredParams: ["instance_id"],
  }),
  capability("contabo", "instances.start", {
    status: "DESTRUCTIVE_SUPPORTED", method: "POST", path: "/v1/compute/instances/{instance_id}/actions/start",
    permission: "Bearer + account role", evidenceRef: "https://api.contabo.com/",
    requiredParams: ["instance_id"],
  }),
  capability("contabo", "instances.stop", {
    status: "DESTRUCTIVE_SUPPORTED", method: "POST", path: "/v1/compute/instances/{instance_id}/actions/stop",
    permission: "Bearer + account role", evidenceRef: "https://api.contabo.com/",
    requiredParams: ["instance_id"],
  }),
  capability("contabo", "instances.restart", {
    status: "DESTRUCTIVE_SUPPORTED", method: "POST", path: "/v1/compute/instances/{instance_id}/actions/restart",
    permission: "Bearer + account role", evidenceRef: "https://api.contabo.com/",
    requiredParams: ["instance_id"],
  }),
  capability("contabo", "instances.audits", {
    status: "READ_SUPPORTED", method: "GET", path: "/v1/compute/instances/audits",
    permission: "Bearer + account role", evidenceRef: "https://api.contabo.com/",
    queryParams: ["page", "size", "orderBy", "instanceId", "requestId", "changedBy", "startDate", "endDate"],
  }),
  capability("contabo", "instances.action_audits", {
    status: "READ_SUPPORTED", method: "GET", path: "/v1/compute/instances/actions/audits",
    permission: "Bearer + account role", evidenceRef: "https://api.contabo.com/",
    queryParams: ["page", "size", "orderBy", "instanceId", "requestId", "changedBy", "startDate", "endDate"],
  }),
  capability("contabo", "snapshots.list", {
    status: "READ_SUPPORTED", method: "GET", path: "/v1/compute/instances/{instance_id}/snapshots",
    permission: "Bearer + account role", evidenceRef: "https://api.contabo.com/",
    requiredParams: ["instance_id"], queryParams: ["page", "size", "orderBy"],
  }),
  capability("contabo", "snapshots.get", {
    status: "READ_SUPPORTED", method: "GET", path: "/v1/compute/instances/{instance_id}/snapshots/{snapshot_id}",
    permission: "Bearer + account role", evidenceRef: "https://api.contabo.com/",
    requiredParams: ["instance_id", "snapshot_id"],
  }),
  capability("contabo", "snapshots.create", {
    status: "WRITE_SUPPORTED", method: "POST", path: "/v1/compute/instances/{instance_id}/snapshots",
    permission: "Bearer + account role", evidenceRef: "https://api.contabo.com/",
    requiredParams: ["instance_id"], body: true,
  }),
  capability("contabo", "snapshots.update", {
    status: "WRITE_SUPPORTED", method: "PATCH", path: "/v1/compute/instances/{instance_id}/snapshots/{snapshot_id}",
    permission: "Bearer + account role", evidenceRef: "https://api.contabo.com/",
    requiredParams: ["instance_id", "snapshot_id"], body: true,
  }),
  capability("contabo", "snapshots.delete", {
    status: "DESTRUCTIVE_SUPPORTED", method: "DELETE", path: "/v1/compute/instances/{instance_id}/snapshots/{snapshot_id}",
    permission: "Bearer + account role", evidenceRef: "https://api.contabo.com/",
    requiredParams: ["instance_id", "snapshot_id"],
  }),
  capability("contabo", "snapshots.rollback", {
    status: "DESTRUCTIVE_SUPPORTED", method: "POST", path: "/v1/compute/instances/{instance_id}/snapshots/{snapshot_id}/rollback",
    permission: "Bearer + account role", evidenceRef: "https://api.contabo.com/",
    requiredParams: ["instance_id", "snapshot_id"],
  }),
  capability("contabo", "snapshots.audits", {
    status: "READ_SUPPORTED", method: "GET", path: "/v1/compute/snapshots/audits",
    permission: "Bearer + account role", evidenceRef: "https://api.contabo.com/",
    queryParams: ["page", "size", "orderBy", "instanceId", "snapshotId", "requestId", "changedBy", "startDate", "endDate"],
  }),
  capability("contabo", "private_networks.audits", {
    status: "READ_SUPPORTED", method: "GET", path: "/v1/private-networks/audits",
    permission: "Bearer + account role", evidenceRef: "https://api.contabo.com/",
    queryParams: ["page", "size", "orderBy", "privateNetworkId", "requestId", "changedBy", "startDate", "endDate"],
  }),
  capability("contabo", "tags.list", {
    status: "READ_SUPPORTED", method: "GET", path: "/v1/tags",
    permission: "Bearer + account role", evidenceRef: "https://api.contabo.com/",
    queryParams: ["page", "size", "orderBy"],
  }),
  capability("contabo", "roles.api_permissions", {
    status: "READ_SUPPORTED", method: "GET", path: "/v1/roles/api-permissions",
    permission: "Bearer + account role", evidenceRef: "https://api.contabo.com/",
    queryParams: ["page", "size", "orderBy"],
  }),
  capability("contabo", "secrets.list", {
    status: "READ_SUPPORTED", method: "GET", path: "/v1/secrets",
    permission: "Bearer + account role", evidenceRef: "https://api.contabo.com/",
    queryParams: ["page", "size", "orderBy"], secretBearing: true,
    controlPlaneStatus: "BLOCKED_SECRET_BEARING_RESPONSE",
  }),
  capability("contabo", "secrets.audits", {
    status: "READ_SUPPORTED", method: "GET", path: "/v1/secrets/audits",
    permission: "Bearer + account role", evidenceRef: "https://api.contabo.com/",
    queryParams: ["page", "size", "orderBy", "requestId", "changedBy", "startDate", "endDate"],
  }),
  capability("contabo", "billing.invoice", {
    status: "UNSUPPORTED_BY_PUBLIC_API", method: null, path: null,
    permission: null, evidenceRef: "https://api.contabo.com/", financial: true,
  }),
  capability("contabo", "billing.payment", {
    status: "UNSUPPORTED_BY_PUBLIC_API", method: null, path: null,
    permission: null, evidenceRef: "https://api.contabo.com/", financial: true,
  }),
  capability("tailscale", "devices.list", {
    status: "READ_SUPPORTED", method: "GET", path: "/tailnet/{tailnet}/devices",
    permission: "Devices Read", evidenceRef: "https://tailscale.com/api#tag/devices",
    requiredParams: ["tailnet"],
  }),
  capability("tailscale", "dns.nameservers", {
    status: "READ_SUPPORTED", method: "GET", path: "/tailnet/{tailnet}/dns/nameservers",
    permission: "DNS Read", evidenceRef: "https://tailscale.com/api#tag/dns",
    requiredParams: ["tailnet"],
  }),
  capability("tailscale", "network.logs", {
    status: "READ_SUPPORTED", method: "GET", path: "/tailnet/{tailnet}/logging/network",
    permission: "logs:network:read", evidenceRef: "https://tailscale.com/docs/features/logging/network-flow-logs",
    requiredParams: ["tailnet"], queryParams: ["start", "end"],
  }),
  capability("tailscale", "keys.list", {
    status: "READ_SUPPORTED", method: "GET", path: "/tailnet/{tailnet}/keys",
    permission: "Keys Read", evidenceRef: "https://tailscale.com/api#tag/keys",
    requiredParams: ["tailnet"], secretBearing: true,
    controlPlaneStatus: "BLOCKED_SECRET_BEARING_RESPONSE",
  }),
  capability("buildkite", "user.get", {
    status: "READ_SUPPORTED", method: "GET", path: "/user",
    permission: "read_user", evidenceRef: "https://buildkite.com/docs/apis/rest-api/user",
  }),
  capability("buildkite", "organizations.list", {
    status: "READ_SUPPORTED", method: "GET", path: "/organizations",
    permission: "read_organizations", evidenceRef: "https://buildkite.com/docs/apis/rest-api/organizations",
  }),
  capability("buildkite", "pipelines.list", {
    status: "READ_SUPPORTED", method: "GET", path: "/organizations/{org}/pipelines",
    permission: "read_pipelines", evidenceRef: "https://buildkite.com/docs/apis/rest-api/pipelines",
    requiredParams: ["org"],
  }),
  capability("buildkite", "pipelines.get", {
    status: "READ_SUPPORTED", method: "GET", path: "/organizations/{org}/pipelines/{pipeline}",
    permission: "read_pipelines", evidenceRef: "https://buildkite.com/docs/apis/rest-api/pipelines",
    requiredParams: ["org", "pipeline"],
  }),
  capability("buildkite", "builds.list", {
    status: "READ_SUPPORTED", method: "GET", path: "/organizations/{org}/builds",
    permission: "read_builds", evidenceRef: "https://buildkite.com/docs/apis/rest-api/builds",
    requiredParams: ["org"],
  }),
  capability("buildkite", "agents.list", {
    status: "READ_SUPPORTED", method: "GET", path: "/organizations/{org}/agents",
    permission: "read_agents", evidenceRef: "https://buildkite.com/docs/apis/rest-api/agents",
    requiredParams: ["org"],
  }),
  capability("buildkite", "clusters.list", {
    status: "READ_SUPPORTED", method: "GET", path: "/organizations/{org}/clusters",
    permission: "read_clusters", evidenceRef: "https://buildkite.com/docs/apis/rest-api/clusters",
    requiredParams: ["org"],
  }),
  capability("buildkite", "pipeline.write", {
    status: "UNSUPPORTED_BY_PUBLIC_API", method: null, path: null,
    permission: "write_pipelines", evidenceRef: "https://buildkite.com/docs/apis/rest-api/pipelines",
    controlPlaneStatus: "QUARANTINED_UNTIL_RUNTIME_COMPENSATION_PROVEN",
  }),
]);

const capabilityByKey = new Map(
  PROVIDER_CAPABILITY_MATRIX.map((item) => [`${item.provider}:${item.capability}`, item])
);

function jsonBlock(data) {
  return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
}

function credentialStatus(value) {
  return value && String(value).trim() ? "CONFIGURED" : "MISSING";
}

export function providerCredentialStatus(env = process.env) {
  return {
    cloudflare: {
      "CLOUDFLARE_API_TOKEN": credentialStatus(env.CLOUDFLARE_API_TOKEN || env.CF_API_TOKEN),
    },
    contabo: {
      "CONTABO_CLIENT_ID": credentialStatus(env.CONTABO_CLIENT_ID),
      "CONTABO_CLIENT_SECRET": credentialStatus(env.CONTABO_CLIENT_SECRET),
      "CONTABO_API_USER": credentialStatus(env.CONTABO_API_USER),
      "CONTABO_API_PASSWORD": credentialStatus(env.CONTABO_API_PASSWORD),
    },
    tailscale: {
      "TAILSCALE_API_KEY": credentialStatus(env.TAILSCALE_API_KEY || env.TS_API_KEY),
    },
    buildkite: {
      "BUILDKITE_API_TOKEN": credentialStatus(env.BUILDKITE_API_TOKEN || env.BUILDKITE_TOKEN),
    },
  };
}

export function deepRedact(value, depth = 0) {
  if (depth > 12) return "[REDACTED_DEPTH]";
  if (Array.isArray(value)) return value.map((item) => deepRedact(item, depth + 1));
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [
      key,
      SENSITIVE_KEY_RE.test(key) ? "[REDACTED]" : deepRedact(item, depth + 1),
    ]));
  }
  if (typeof value === "string" && SENSITIVE_VALUE_RE.test(value)) return "[REDACTED]";
  return value;
}

function containsSensitiveInput(value, depth = 0) {
  if (depth > 10) return true;
  if (typeof value === "string") return SENSITIVE_VALUE_RE.test(value);
  if (Array.isArray(value)) return value.some((item) => containsSensitiveInput(item, depth + 1));
  if (value && typeof value === "object") {
    return Object.entries(value).some(([key, item]) => SENSITIVE_KEY_RE.test(key) || containsSensitiveInput(item, depth + 1));
  }
  return false;
}

function getCapability(provider, name) {
  const normalizedProvider = String(provider || "").trim().toLowerCase();
  if (!SUPPORTED_PROVIDERS.has(normalizedProvider)) throw new Error("PROVIDER_UNSUPPORTED");
  const item = capabilityByKey.get(`${normalizedProvider}:${String(name || "").trim()}`);
  if (!item) throw new Error("PROVIDER_CAPABILITY_UNKNOWN");
  return item;
}

function safePathValue(name, raw) {
  const value = String(raw ?? "").trim();
  if (!PATH_VALUE_RE.test(value)) throw new Error(`PROVIDER_PATH_PARAM_INVALID:${name}`);
  if (name === "scope" && !new Set(["accounts", "zones"]).has(value)) throw new Error("PROVIDER_SCOPE_INVALID");
  return encodeURIComponent(value);
}

export function buildProviderRequest(provider, capabilityName, params = {}) {
  const item = getCapability(provider, capabilityName);
  if (item.status === "UNSUPPORTED_BY_PUBLIC_API" || !item.method || !item.path) {
    throw new Error("UNSUPPORTED_BY_PUBLIC_API");
  }
  let path = item.path;
  for (const name of item.requiredParams) {
    if (!(name in params)) throw new Error(`PROVIDER_PATH_PARAM_REQUIRED:${name}`);
    path = path.replace(`{${name}}`, safePathValue(name, params[name]));
  }
  if (/\{[^}]+\}/.test(path)) throw new Error("PROVIDER_PATH_TEMPLATE_UNRESOLVED");

  const query = new URLSearchParams();
  const rawQuery = params.query && typeof params.query === "object" && !Array.isArray(params.query)
    ? params.query
    : {};
  for (const key of Object.keys(rawQuery)) {
    if (!item.queryParams.includes(key)) throw new Error(`PROVIDER_QUERY_PARAM_NOT_ALLOWED:${key}`);
    const raw = rawQuery[key];
    if (raw == null || raw === "") continue;
    const values = Array.isArray(raw) ? raw : [raw];
    for (const value of values) query.append(key, String(value).slice(0, 500));
  }

  const body = params.body == null ? undefined : params.body;
  if (body !== undefined && !item.body) throw new Error("PROVIDER_BODY_NOT_ALLOWED");
  if (body !== undefined && (typeof body !== "object" || Array.isArray(body))) throw new Error("PROVIDER_BODY_MUST_BE_OBJECT");
  if (body !== undefined && containsSensitiveInput(body)) throw new Error("PROVIDER_INPUT_CONTAINS_SENSITIVE_MATERIAL");

  return {
    item,
    method: item.method,
    path: `${path}${query.size ? `?${query.toString()}` : ""}`,
    body,
  };
}

let contaboTokenCache = null;
async function contaboAccessToken() {
  const now = Date.now();
  if (contaboTokenCache?.token && contaboTokenCache.expiresAt > now + 60_000) return contaboTokenCache.token;
  const required = ["CONTABO_CLIENT_ID", "CONTABO_CLIENT_SECRET", "CONTABO_API_USER", "CONTABO_API_PASSWORD"];
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length) throw new Error(`CONTABO_CREDENTIALS_MISSING:${missing.join(",")}`);

  const data = new URLSearchParams({
    client_id: process.env.CONTABO_CLIENT_ID,
    client_secret: process.env.CONTABO_CLIENT_SECRET,
    username: process.env.CONTABO_API_USER,
    password: process.env.CONTABO_API_PASSWORD,
    grant_type: "password",
  });
  const response = await fetch(CONTABO_AUTH, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: data,
    signal: AbortSignal.timeout(20_000),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload?.access_token) throw new Error(`CONTABO_AUTH_FAILED:${response.status}`);
  contaboTokenCache = {
    "token": payload.access_token,
    expiresAt: now + Math.max(60, Number(payload.expires_in || 300)) * 1000,
  };
  return contaboTokenCache.token;
}

function parseEnvFile(filePath) {
  if (!existsSync(filePath)) return {};
  const out = {};
  for (const line of readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const s = line.trim();
    if (!s || s.startsWith("#") || !s.includes("=")) continue;
    const i = s.indexOf("=");
    out[s.slice(0, i).trim()] = s.slice(i + 1).trim().replace(/^['"]|['"]$/g, "");
  }
  return out;
}

function loadSecretFromFiles(envKeys, files) {
  for (const key of envKeys) {
    const fromEnv = process.env[key];
    if (fromEnv && String(fromEnv).trim()) return String(fromEnv).trim();
  }
  for (const filePath of files) {
    const parsed = parseEnvFile(filePath);
    for (const key of envKeys) {
      if (parsed[key]) return parsed[key];
    }
  }
  return "";
}

function loadTailscaleKey() {
  return loadSecretFromFiles(
    ["TAILSCALE_API_KEY", "TS_API_KEY"],
    ["/root/CentralDark/secrets/tailscale.env", "/root/CentralDark/apps/modulos/mcp/.env"],
  );
}

function loadBuildkiteToken() {
  return loadSecretFromFiles(
    ["BUILDKITE_API_TOKEN", "BUILDKITE_TOKEN"],
    ["/root/CentralDark/secrets/buildkite.env", "/root/CentralDark/apps/modulos/mcp/.env"],
  );
}

async function providerHeaders(provider, requestId = randomUUID()) {
  if (provider === "cloudflare") {
    const token = loadSecretFromFiles(
      ["CLOUDFLARE_API_TOKEN", "CF_API_TOKEN"],
      ["/root/CentralDark/secrets/cloudflare.env", "/root/CentralDark/apps/modulos/mcp/.env"],
    );
    if (!token) throw new Error("CLOUDFLARE_CREDENTIALS_MISSING");
    return { Authorization: `Bearer ${token}`, Accept: "application/json", "Content-Type": "application/json" };
  }
  if (provider === "tailscale") {
    const token = loadTailscaleKey();
    if (!token) throw new Error("TAILSCALE_CREDENTIALS_MISSING");
    return { Authorization: `Bearer ${token}`, Accept: "application/json" };
  }
  if (provider === "buildkite") {
    const token = loadBuildkiteToken();
    if (!token) throw new Error("BUILDKITE_CREDENTIALS_MISSING");
    return { Authorization: `Bearer ${token}`, Accept: "application/json" };
  }
  const token = await contaboAccessToken();
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/json",
    "Content-Type": "application/json",
    "x-request-id": requestId,
  };
}

function providerBase(provider) {
  if (provider === "cloudflare") return CLOUDFLARE_BASE;
  if (provider === "tailscale") return TAILSCALE_BASE;
  if (provider === "buildkite") return BUILDKITE_BASE;
  return CONTABO_BASE;
}

function sanitizeError(error) {
  return String(error?.message || error || "provider_error")
    .replace(/Bearer\s+\S+/gi, "Bearer [REDACTED]")
    .replace(/(?:gh[pousr]_|sk-|sb_(?:secret|publishable)_)[A-Za-z0-9_-]{12,}/gi, "[REDACTED]")
    .slice(0, 500);
}

async function callProvider(provider, request, { requestId } = {}) {
  const headers = await providerHeaders(provider, requestId || randomUUID());
  const response = await fetch(`${providerBase(provider)}${request.path}`, {
    method: request.method,
    headers,
    body: request.body === undefined ? undefined : JSON.stringify(request.body),
    signal: AbortSignal.timeout(30_000),
  });
  const text = await response.text();
  let parsed;
  try { parsed = text ? JSON.parse(text) : null; } catch { parsed = { text: text.slice(0, 2_000) }; }
  const redacted = deepRedact(parsed);
  const cloudflareFailed = provider === "cloudflare" && redacted && typeof redacted === "object" && redacted.success === false;
  if (!response.ok || cloudflareFailed) {
    const error = new Error(`PROVIDER_HTTP_${response.status}`);
    error.providerPayload = redacted;
    throw error;
  }
  return { httpStatus: response.status, data: redacted };
}

export function summarizeTailscaleNetworkLogs(payload) {
  const logs = Array.isArray(payload?.logs)
    ? payload.logs
    : Array.isArray(payload?.records)
      ? payload.records.flatMap((record) => Array.isArray(record?.logs) ? record.logs : [record])
      : [];
  const nodes = new Set();
  let virtualFlows = 0;
  let subnetFlows = 0;
  let exitFlows = 0;
  let physicalFlows = 0;
  let txBytes = 0;
  let rxBytes = 0;
  let txPackets = 0;
  let rxPackets = 0;
  let lastLoggedAt = null;
  const countTraffic = (items) => {
    if (!Array.isArray(items)) return 0;
    for (const flow of items) {
      txBytes += Number(flow?.txBytes || 0);
      rxBytes += Number(flow?.rxBytes || 0);
      txPackets += Number(flow?.txPkts || flow?.txPackets || 0);
      rxPackets += Number(flow?.rxPkts || flow?.rxPackets || 0);
    }
    return items.length;
  };
  for (const logItem of logs) {
    if (logItem?.nodeId) nodes.add(String(logItem.nodeId));
    if (logItem?.srcNode?.nodeId) nodes.add(String(logItem.srcNode.nodeId));
    for (const dst of Array.isArray(logItem?.dstNodes) ? logItem.dstNodes : []) {
      if (dst?.nodeId) nodes.add(String(dst.nodeId));
    }
    virtualFlows += countTraffic(logItem?.virtualTraffic);
    subnetFlows += countTraffic(logItem?.subnetTraffic);
    exitFlows += countTraffic(logItem?.exitTraffic);
    physicalFlows += countTraffic(logItem?.physicalTraffic);
    if (logItem?.logged && (!lastLoggedAt || String(logItem.logged) > lastLoggedAt)) lastLoggedAt = String(logItem.logged);
  }
  return {
    logMessages: logs.length,
    nodeCount: nodes.size,
    virtualFlows,
    subnetFlows,
    exitFlows,
    physicalFlows,
    txBytes,
    rxBytes,
    txPackets,
    rxPackets,
    lastLoggedAt,
  };
}

export async function readTailscaleNetworkLogs({ start, end, tailnet = "-", limit = 200 } = {}) {
  const endDate = end ? new Date(end) : new Date();
  const startDate = start ? new Date(start) : new Date(endDate.getTime() - 15 * 60_000);
  if (!Number.isFinite(startDate.getTime()) || !Number.isFinite(endDate.getTime())) throw new Error("TAILSCALE_LOG_WINDOW_INVALID");
  if (startDate >= endDate) throw new Error("TAILSCALE_LOG_WINDOW_INVALID");
  if (endDate.getTime() - startDate.getTime() > 24 * 60 * 60_000) throw new Error("TAILSCALE_LOG_WINDOW_TOO_LARGE");
  const safeLimit = Math.max(1, Math.min(500, Number(limit) || 200));
  const request = buildProviderRequest("tailscale", "network.logs", {
    tailnet,
    query: { start: startDate.toISOString(), end: endDate.toISOString() },
  });
  const result = await callProvider("tailscale", request);
  const payload = result.data && typeof result.data === "object" ? result.data : {};
  const allLogs = Array.isArray(payload.logs)
    ? payload.logs
    : Array.isArray(payload.records)
      ? payload.records.flatMap((record) => Array.isArray(record?.logs) ? record.logs : [record])
      : [];
  const logs = allLogs.slice(Math.max(0, allLogs.length - safeLimit));
  return {
    ok: true,
    status: "PASS",
    provider: "tailscale",
    capability: "network.logs",
    httpStatus: result.httpStatus,
    window: { start: startDate.toISOString(), end: endDate.toISOString() },
    summary: summarizeTailscaleNetworkLogs({ logs: allLogs }),
    logs: deepRedact(logs),
    truncated: allLogs.length > logs.length,
    totalKnown: allLogs.length,
    returned: logs.length,
    source: "TAILSCALE_API_LOGGING_NETWORK",
  };
}

function operationFingerprint(input) {
  return createHash("sha256").update(JSON.stringify(input)).digest("hex");
}

function actorFingerprint(actor) {
  return createHash("sha256").update(String(actor || "unknown")).digest("hex").slice(0, 24);
}

function hubRestConfig() {
  const base = String(process.env.HUB_SUPABASE_URL || process.env.SUPABASE_URL || "").replace(/\/$/, "");
  const key = String(process.env.HUB_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || "");
  return { base, key };
}

async function hubRpc(name, body) {
  const { base, key } = hubRestConfig();
  if (!base || !key) throw new Error("PROVIDER_IDEMPOTENCY_LEDGER_UNAVAILABLE");
  const response = await fetch(`${base}/rest/v1/rpc/${name}`, {
    method: "POST",
    headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(15_000),
  });
  const text = await response.text();
  if (!response.ok) throw new Error(`PROVIDER_LEDGER_${response.status}`);
  try { return text ? JSON.parse(text) : null; } catch { return null; }
}

export function validateFinancialGuard(item, input) {
  if (!item.financial) return { ok: true };
  const amount = Number(input.expectedAmount);
  const currency = String(input.currency || "").trim().toUpperCase();
  if (!Number.isFinite(amount) || amount < 0) return { ok: false, status: "FINANCIAL_AMOUNT_REQUIRED" };
  if (!CURRENCY_RE.test(currency)) return { ok: false, status: "FINANCIAL_CURRENCY_REQUIRED" };
  return { ok: true, amount, currency };
}

async function reserveOperation({ idempotencyKey, provider, capabilityName, actor, fingerprint, amount, currency }) {
  return hubRpc("reserve_provider_operation", {
    p_idempotency_key: idempotencyKey,
    p_provider: provider,
    p_capability: capabilityName,
    p_actor_fingerprint: actorFingerprint(actor),
    p_request_fingerprint: fingerprint,
    p_amount: amount ?? null,
    p_currency: currency ?? null,
  });
}

async function finalizeOperation({ idempotencyKey, state, httpStatus, result }) {
  return hubRpc("finalize_provider_operation", {
    p_idempotency_key: idempotencyKey,
    p_state: state,
    p_provider_status: httpStatus ?? null,
    p_result_redacted: result == null ? null : deepRedact(result),
  });
}

const providerInputSchema = z.object({
  provider: z.enum(["cloudflare", "contabo", "tailscale", "buildkite"]),
  capability: z.string().min(1).max(100),
  params: z.record(z.string(), z.unknown()).optional().default({}),
});

export const adminProviderControlTools = [
  {
    name: "provider_capabilities",
    description: "Matriz canônica de capacidades oficiais Contabo/Cloudflare/Tailscale usadas pelo cockpit Admin. Não executa ação externa.",
    annotations: { ...READ, title: "Providers — matriz de capacidades" },
    inputSchema: z.object({ provider: z.enum(["cloudflare", "contabo", "tailscale", "buildkite"]).optional() }),
    handler: async (input) => jsonBlock({
      ok: true,
      status: "PASS",
      verifiedAt: VERIFIED_AT,
      provider: input.provider ?? "all",
      capabilities: PROVIDER_CAPABILITY_MATRIX.filter((item) => !input.provider || item.provider === input.provider),
      mutationPolicy: "QUARANTINED_UNTIL_RUNTIME_COMPENSATION_PROVEN",
      paymentPolicy: "NO_UNDOCUMENTED_PAY_ENDPOINT",
    }),
  },
  {
    name: "provider_credentials_status",
    description: "Mostra somente CONFIGURED/MISSING das credenciais dos providers. Nunca devolve valores.",
    annotations: { ...READ, title: "Providers — status de credenciais" },
    inputSchema: z.object({}),
    handler: async () => jsonBlock({ ok: true, status: "PASS", credentials: providerCredentialStatus() }),
  },
  {
    name: "provider_read",
    description: "Executa somente capability READ/FINANCIAL_READ/DEPRECATED allowlisted na API oficial do provider e redige campos sensíveis.",
    annotations: { ...READ, title: "Providers — leitura oficial" },
    inputSchema: providerInputSchema,
    handler: async (input) => {
      try {
        const request = buildProviderRequest(input.provider, input.capability, input.params);
        if (!["READ_SUPPORTED", "FINANCIAL_READ_SUPPORTED", "DEPRECATED"].includes(request.item.status)) {
          return jsonBlock({ ok: false, status: "READ_CAPABILITY_REQUIRED", capability: input.capability });
        }
        if (request.item.secretBearing === true) {
          return jsonBlock({
            ok: false,
            status: "BLOCKED_SECRET_BEARING_RESPONSE",
            provider: input.provider,
            capability: input.capability,
            observacao: "A API oficial pode devolver valor de secret; o cockpit não solicita nem renderiza esse payload.",
          });
        }
        const result = await callProvider(input.provider, request);
        return jsonBlock({
          ok: true,
          status: "PASS",
          provider: input.provider,
          capability: input.capability,
          httpStatus: result.httpStatus,
          deprecated: request.item.deprecated === true,
          alpha: request.item.alpha === true,
          restricted: request.item.restricted === true,
          evidenceRef: request.item.evidenceRef,
          data: result.data,
        });
      } catch (error) {
        return jsonBlock({
          ok: false,
          status: sanitizeError(error),
          provider: input.provider,
          capability: input.capability,
          data: deepRedact(error?.providerPayload ?? null),
        });
      }
    },
  },
  {
    name: "tailscale_network_logs",
    description: "Le os Network Flow Logs do Tailscale pela API oficial usando o cofre existente. Janela padrao 15 min, maximo 24h, sem expor credencial.",
    annotations: { ...READ, title: "Tailscale — Network Flow Logs" },
    inputSchema: z.object({
      start: z.string().optional(),
      end: z.string().optional(),
      tailnet: z.string().max(160).optional().default("-"),
      limit: z.number().int().min(1).max(500).optional().default(200),
    }),
    handler: async (input) => {
      try {
        return jsonBlock(await readTailscaleNetworkLogs(input));
      } catch (error) {
        return jsonBlock({ ok: false, status: sanitizeError(error), provider: "tailscale", capability: "network.logs" });
      }
    },
  },
  {
    name: "provider_mutate",
    description: "Mutação allowlisted de provider. Permanece fail-closed até compensação runtime ser provada; exige confirmação admin no dispatcher e idempotência persistente.",
    annotations: { ...WRITE, title: "Providers — mutação protegida" },
    inputSchema: providerInputSchema.extend({
      idempotencyKey: z.string().uuid(),
      expectedAmount: z.number().nonnegative().optional(),
      currency: z.string().length(3).optional(),
    }),
    handler: async (input, ctx) => {
      let request;
      try {
        request = buildProviderRequest(input.provider, input.capability, input.params);
      } catch (error) {
        return jsonBlock({ ok: false, status: sanitizeError(error), provider: input.provider, capability: input.capability });
      }
      if (["READ_SUPPORTED", "FINANCIAL_READ_SUPPORTED", "DEPRECATED"].includes(request.item.status)) {
        return jsonBlock({ ok: false, status: "MUTATION_CAPABILITY_REQUIRED", capability: input.capability });
      }
      if (request.item.status === "UNSUPPORTED_BY_PUBLIC_API") {
        return jsonBlock({ ok: false, status: "UNSUPPORTED_BY_PUBLIC_API", capability: input.capability });
      }
      const financial = validateFinancialGuard(request.item, input);
      if (!financial.ok) return jsonBlock({ ok: false, status: financial.status, capability: input.capability });

      if (request.item.controlPlaneStatus !== "READY" || process.env.PROVIDER_MUTATION_RUNTIME_ENABLED !== "true") {
        return jsonBlock({
          ok: false,
          status: "PROVIDER_MUTATION_RUNTIME_UNPROVEN",
          executionStatus: "blocked",
          provider: input.provider,
          capability: input.capability,
          controlPlaneStatus: request.item.controlPlaneStatus,
          observacao: "Código preparado; mutação não é liberada sem prova runtime de compensação + ledger de idempotência.",
        });
      }

      const fingerprint = operationFingerprint({
        provider: input.provider,
        capability: input.capability,
        params: input.params,
        expectedAmount: financial.amount ?? null,
        currency: financial.currency ?? null,
      });
      let reservation;
      try {
        reservation = await reserveOperation({
          idempotencyKey: input.idempotencyKey,
          provider: input.provider,
          capabilityName: input.capability,
          actor: ctx?.callerUser,
          fingerprint,
          amount: financial.amount,
          currency: financial.currency,
        });
      } catch (error) {
        return jsonBlock({ ok: false, status: sanitizeError(error), executionStatus: "blocked" });
      }
      if (reservation?.state === "SUCCEEDED") {
        return jsonBlock({ ok: true, status: "IDEMPOTENT_REPLAY", executed: false, receipt: deepRedact(reservation) });
      }
      if (reservation?.request_fingerprint && reservation.request_fingerprint !== fingerprint) {
        return jsonBlock({ ok: false, status: "IDEMPOTENCY_KEY_REUSE_MISMATCH", executed: false });
      }

      const requestId = input.provider === "contabo" ? input.idempotencyKey : randomUUID();
      try {
        const result = await callProvider(input.provider, request, { requestId });
        await finalizeOperation({ idempotencyKey: input.idempotencyKey, state: "SUCCEEDED", httpStatus: result.httpStatus, result: result.data });
        return jsonBlock({
          ok: true,
          status: "EXECUTED",
          provider: input.provider,
          capability: input.capability,
          idempotencyKey: input.idempotencyKey,
          httpStatus: result.httpStatus,
          receipt: result.data,
        });
      } catch (error) {
        try {
          await finalizeOperation({ idempotencyKey: input.idempotencyKey, state: "UNKNOWN", httpStatus: null, result: { error: sanitizeError(error) } });
        } catch { /* outcome continua UNKNOWN; não repetir automaticamente */ }
        return jsonBlock({
          ok: false,
          status: "PROVIDER_MUTATION_OUTCOME_UNKNOWN",
          executionStatus: "unknown",
          provider: input.provider,
          capability: input.capability,
          idempotencyKey: input.idempotencyKey,
          error: sanitizeError(error),
        });
      }
    },
  },
];

export const __test = Object.freeze({
  getCapability,
  containsSensitiveInput,
  operationFingerprint,
  actorFingerprint,
  sanitizeError,
});
