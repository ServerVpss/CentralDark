# MISSAO - admin-provider-control.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\centraldark\apps\modulos\mcp\dist\modes\admin\tools\admin-provider-control.js
**SHA:** 5e10b06a28f5a5e8
**Timestamp:** 2026-08-28T02:54:37.776703
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- const missing = required.filter((key) => !process.env[key]);
- throw new Error(`CONTABO_CREDENTIALS_MISSING:${missing.join(",")}`);

### Ouro Bruto (primeiros 5000 chars)
```
import { createHash, randomUUID } from "node:crypto";
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
const SUPPORTED_PROVIDERS = new Set(["cloudflare", "contabo"]);
const PATH_VALUE_RE = /^[A-Za-z0-9._:-]{1,160}$/;
const CURRENCY_RE = /^[A-Z]{3}$/;
const SENSITIVE_KEY_RE = /(authorization|cookie|password|passwd|senha|secret|token|api[_-]?key|private[_-]?key|service[_-]?role|refresh[_-]?token|access[_-]?token|credential|credencial|card[_-]?number|payment[_-]?nonce)/i;
const SENSITIVE_VALUE_RE = /(?:Bearer\s+\S{12,}|gh[pousr]_[A-Za-z0-9_]{20,}|sb_(?:secret|publishable)_[A-Za-z0-9_-]{20,}|sk-[A-Za-z0-9_-]{16,}|-----BEGIN [A-Z ]*PRIVATE KEY-----)/i;
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
        s
```

---

# MISSAO - admin-provider-control.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\centraldark\apps\modulos\mcp\src\modes\admin\tools\admin-provider-control.js
**SHA:** 535f6be858d44396
**Timestamp:** 2026-08-28T02:54:47.206330
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- const missing = required.filter((key) => !process.env[key]);
- if (missing.length) throw new Error(`CONTABO_CREDENTIALS_MISSING:${missing.join(",")}`);

### Ouro Bruto (primeiros 5000 chars)
```
import { createHash, randomUUID } from "node:crypto";
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
const SUPPORTED_PROVIDERS = new Set(["cloudflare", "contabo"]);
const PATH_VALUE_RE = /^[A-Za-z0-9._:-]{1,160}$/;
const CURRENCY_RE = /^[A-Z]{3}$/;
const SENSITIVE_KEY_RE = /(authorization|cookie|password|passwd|senha|secret|token|api[_-]?key|private[_-]?key|service[_-]?role|refresh[_-]?token|access[_-]?token|credential|credencial|card[_-]?number|payment[_-]?nonce)/i;
const SENSITIVE_VALUE_RE = /(?:Bearer\s+\S{12,}|gh[pousr]_[A-Za-z0-9_]{20,}|sb_(?:secret|publishable)_[A-Za-z0-9_-]{20,}|sk-[A-Za-z0-9_-]{16,}|-----BEGIN [A-Z ]*PRIVATE KEY-----)/i;

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
 
```