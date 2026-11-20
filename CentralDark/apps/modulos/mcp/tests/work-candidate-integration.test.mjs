import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
const mcpRoot = path.resolve(here, "..");
const hubRoot = path.resolve(mcpRoot, "..", "hub");
const consumer = readFileSync(path.join(mcpRoot, "src", "hub-mission-consumer.js"), "utf8");
const migration = readFileSync(path.join(hubRoot, "supabase", "migrations", "20260815_hub_work_candidate_discovery.sql"), "utf8");

test("resultado só publica candidato depois de receipt + evidence", () => {
  const processBlock = consumer.match(/async function processOneMission\(\)[\s\S]*?async function tick\(\)/)?.[0] || "";
  assert.ok(processBlock.length > 0);
  const receiptAt = processBlock.indexOf("appendReceiptEvent");
  const evidenceAt = processBlock.indexOf("appendEvidence");
  const discoveryAt = processBlock.indexOf("publishWorkCandidates");
  assert.ok(receiptAt >= 0 && evidenceAt > receiptAt && discoveryAt > evidenceAt);
  assert.match(migration, /candidate_evidence_required/);
  assert.match(migration, /evidence\.type = 'mcp_tool_receipt'/);
  assert.match(migration, /evidence\.sha = p_receipt_sha/);
});

test("work discovery reutiliza hub_missions e deduplica sem nova fila", () => {
  assert.match(consumer, /rpc\/publish_hub_work_candidate/);
  assert.match(migration, /insert into public\.hub_missions/i);
  assert.match(migration, /hub_missions_active_work_fingerprint_uidx/);
  assert.match(migration, /on conflict \(work_fingerprint\)[\s\S]*do nothing/i);
  assert.doesNotMatch(migration, /create\s+table/i);
});

test("worker não consegue autoaprovar candidato derivado", () => {
  const publishFunction = migration.match(/create or replace function public\.publish_hub_work_candidate[\s\S]*?revoke all on function/i)?.[0] || "";
  assert.ok(publishFunction.length > 0);
  assert.doesNotMatch(publishFunction, /p_authorization/i);
  assert.match(publishFunction, /'queued',\s*'pending'/i);
  assert.match(publishFunction, /parent_claim_not_owned/);
  assert.match(publishFunction, /candidate_revision_mismatch/);
  assert.doesNotMatch(consumer, /p_authorization/);
});

test("falha de derivação não apaga o resultado observado da missão pai", () => {
  const publishBlock = consumer.match(/async function publishWorkCandidates[\s\S]*?function receiptHash/)?.[0] || "";
  assert.ok(publishBlock.length > 0);
  assert.match(publishBlock, /failed \+= 1/);
  assert.match(publishBlock, /hub_work_candidate_publish_error/);
  const processBlock = consumer.match(/async function processOneMission\(\)[\s\S]*?async function tick\(\)/)?.[0] || "";
  assert.match(processBlock, /WORK_DISCOVERY_UNPROVEN/);
  assert.match(processBlock, /await finalizeMission\(mission\.id, verdict\.ok, finalStatus\)/);
});

test("input de candidato continua privado na view autenticada", () => {
  const apiView = migration.match(/create or replace view api\.hub_missions as[\s\S]*?from public\.hub_missions;/i)?.[0] || "";
  assert.ok(apiView.length > 0);
  assert.match(apiView, /work_fingerprint/);
  assert.match(apiView, /source_receipt_sha/);
  assert.doesNotMatch(apiView, /\binput\b/i);
});
