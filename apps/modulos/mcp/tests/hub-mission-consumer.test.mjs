import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const repo = path.resolve(root, "..", "..", "..");

const consumer = readFileSync(path.join(root, "src", "hub-mission-consumer.js"), "utf8");
const health = readFileSync(path.join(root, "src", "health-deep.js"), "utf8");
const hubCommand = readFileSync(path.join(repo, "hub", "supabase", "functions", "hub-command", "index.ts"), "utf8");
const migration = readFileSync(path.join(repo, "hub", "supabase", "migrations", "20260809_hub_mission_execution_contract.sql"), "utf8");

test("consumer só reclama missão queued + approved com capability", () => {
  assert.match(consumer, /state=eq\.queued/);
  assert.match(consumer, /authorization=eq\.approved/);
  assert.match(consumer, /capability=not\.is\.null/);
  assert.match(consumer, /claimed_by/);
});

test("execução passa pelo dispatcher admin canônico", () => {
  assert.match(consumer, /mcp_admin_call/);
  assert.match(consumer, /confirmAdmin:\s*"CONFIRMO ADMIN"/);
  assert.doesNotMatch(consumer, /vps-ssh-exec\.yml/);
  assert.doesNotMatch(consumer, /commands\.join/);
});

test("consumer reutiliza sanitizador canônico", () => {
  assert.match(consumer, /sanitizeOutgoingText/);
  assert.doesNotMatch(consumer, /gh\[pousr\]_\[A-Za-z0-9\]/);
});

test("receipt é hash e evidência não é auto-validada pelo executor", () => {
  assert.match(consumer, /createHash\("sha256"\)/);
  assert.match(consumer, /type:\s*"mcp_tool_receipt"/);
  assert.match(consumer, /status:\s*"pending"/);
  assert.match(consumer, /hub_mission_events/);
});

test("claim stale falha fechado e nunca é refileirado automaticamente", () => {
  assert.match(consumer, /STALE_CLAIM_UNPROVEN/);
  assert.match(consumer, /replay automático proibido/);
  assert.match(consumer, /state:\s*"failed"/);
  assert.doesNotMatch(consumer, /STALE_CLAIM[\s\S]{0,500}state:\s*"queued"/);
  assert.match(migration, /hub_missions_running_claim_idx/);
});

test("hub-command grava capability/input e bloqueia material sensível", () => {
  assert.match(hubCommand, /capability/);
  assert.match(hubCommand, /input:\s*executionInput/);
  assert.match(hubCommand, /auto_execution_eligible/);
  assert.match(hubCommand, /input_contains_sensitive_material/);
  assert.match(hubCommand, /SENSITIVE_KEY_RE/);
  assert.match(hubCommand, /SENSITIVE_VALUE_RE/);
  assert.doesNotMatch(hubCommand, /commands/);
});

test("schema estende hub_missions em vez de criar fila paralela", () => {
  assert.match(migration, /alter table public\.hub_missions/);
  assert.match(migration, /add column if not exists capability text/);
  assert.match(migration, /add column if not exists input jsonb/);
  assert.doesNotMatch(migration, /create table[^;]+queue/i);
});

test("consumer é iniciado e observado pelo health profundo", () => {
  assert.match(health, /startHubMissionConsumer\(\)/);
  assert.match(health, /hub_mission_consumer/);
  assert.match(health, /hubMissionConsumer/);
});
