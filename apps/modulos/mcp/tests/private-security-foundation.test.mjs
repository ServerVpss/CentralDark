import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { sanitizeOutgoingDeep } from "../src/lib/sanitize.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const mcpRoot = path.resolve(here, "..");
const repoRoot = path.resolve(mcpRoot, "..", "..", "..");
const migration = readFileSync(
  path.join(repoRoot, "apps", "modulos", "hub", "supabase", "migrations", "20260815_private_security_foundation.sql"),
  "utf8"
);
const securityPage = readFileSync(
  path.join(repoRoot, "src", "apps", "modulos", "telepainel", "pages", "Security.tsx"),
  "utf8"
);
const houseOverview = readFileSync(
  path.join(repoRoot, "src", "apps", "modulos", "telepainel", "components", "security", "HouseSecurityOverview.tsx"),
  "utf8"
);

test("private security schema is deny-by-default for browser roles", () => {
  assert.match(migration, /create schema if not exists centraldark_private/i);
  assert.match(migration, /revoke all on schema centraldark_private from public, anon, authenticated/i);
  assert.match(migration, /enable row level security/gi);
  assert.doesNotMatch(migration, /grant\s+(?:select|insert|update|delete|all).*centraldark_private.*to\s+(?:anon|authenticated)/i);
});

test("admin overview reuses the live has_role owner and keeps a fresh-stack fallback", () => {
  assert.match(migration, /function public\.get_private_security_overview/i);
  assert.match(migration, /auth\.uid\(\)/i);
  assert.match(migration, /p\.proname = 'has_role'/i);
  assert.match(migration, /execute 'select public\.has_role\(\$1, ''admin''\)'/i);
  assert.match(migration, /from api\.user_roles/i);
  assert.match(migration, /r\.role = 'admin'/i);
  assert.match(migration, /grant execute on function public\.get_private_security_overview\(\) to authenticated/i);
});

test("private foundation stores status and references, not generic raw payloads", () => {
  assert.match(migration, /create table if not exists centraldark_private\.secret_status/i);
  assert.doesNotMatch(migration, /\b(secret_value|token_value|password_value|raw_payload)\b/i);
  assert.doesNotMatch(migration, /\bevidence\s+jsonb\b/i);
  assert.doesNotMatch(migration, /\bposture\s+jsonb\b/i);
});

test("server writer rpc is not executable by browser roles", () => {
  assert.match(migration, /function public\.set_private_security_control/i);
  assert.match(migration, /from public, anon, authenticated/i);
  assert.match(migration, /to service_role/i);
});

test("initial controls are honest and never seed physical surfaces as PASS", () => {
  assert.match(migration, /'house-windows'[\s\S]*?'UNPROVEN'/i);
  assert.match(migration, /'vps-linux'[\s\S]*?'UNPROVEN'/i);
  assert.match(migration, /'database'[\s\S]*?'UNKNOWN'/i);
  const seed = migration.match(/insert into centraldark_private\.security_control[\s\S]*?on conflict \(control_id\) do nothing;/i)?.[0] ?? "";
  assert.doesNotMatch(seed, /'PASS'/i);
});

test("Security Center reuses the existing route instead of creating Security-v2", () => {
  assert.match(securityPage, /Security Center \/ Centro de Segurança/);
  assert.match(securityPage, /HouseSecurityOverview/);
  assert.match(securityPage, /defaultValue="house"/);
  assert.match(securityPage, /value="bots"/);
});

test("House overview never renders backend error details or secret values", () => {
  assert.match(houseOverview, /get_private_security_overview/);
  assert.match(houseOverview, /UNPROVEN_NOT_DEPLOYED/);
  assert.match(houseOverview, /status-only/);
  assert.doesNotMatch(houseOverview, /error\.message|error\.details|error\.hint/);
});

test("deep sanitizer redacts values under sensitive key names", () => {
  const out = sanitizeOutgoingDeep({
    safe: "ok",
    password: "curto-e-nao-detectavel-por-prefixo",
    nested: { authorization: "qualquer-coisa" },
  });
  assert.equal(out.safe, "ok");
  assert.equal(out.password, "<valor-segredo-removido>");
  assert.equal(out.nested.authorization, "<valor-segredo-removido>");
});
