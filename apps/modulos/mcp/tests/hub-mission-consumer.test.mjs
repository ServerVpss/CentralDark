import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const hubRoot = path.resolve(root, "..", "hub");

const consumer = readFileSync(path.join(root, "src", "hub-mission-consumer.js"), "utf8");
const health = readFileSync(path.join(root, "src", "health-deep.js"), "utf8");
const mcpAdmin = readFileSync(path.join(root, "src", "tools", "core", "mcp-admin.js"), "utf8");
const hubCommand = readFileSync(path.join(hubRoot, "supabase", "functions", "hub-command", "index.ts"), "utf8");
const migration = readFileSync(path.join(hubRoot, "supabase", "migrations", "20260809_hub_mission_execution_contract.sql"), "utf8");

test("consumer só reclama missão queued + approved com capability", () => {
  assert.match(consumer, /state=eq\.queued/);
  assert.match(consumer, /authorization=eq\.approved/);
  assert.match(consumer, /capability=not\.is\.null/);
  assert.match(consumer, /claimed_by/);
});

test("execução passa pelo dispatcher admin canônico sem fabricar aprovação destrutiva", () => {
  assert.match(consumer, /mcp_admin_call/);
  assert.match(consumer, /autoMission:\s*true/);
  assert.doesNotMatch(consumer, /confirmAdmin:\s*"CONFIRMO ADMIN"/);
  assert.match(mcpAdmin, /ctx\?\.autoMission\s*===\s*true/);
  assert.match(mcpAdmin, /INDEPENDENT_APPROVAL_REQUIRED/);
  assert.doesNotMatch(consumer, /vps-ssh-exec\.yml/);
  assert.doesNotMatch(consumer, /commands\.join/);
});

test("dispatcher interno valida inputSchema e audita o mesmo payload entregue ao handler", () => {
  assert.match(mcpAdmin, /parseToolInput\(tool, input\.input\)/);
  assert.match(mcpAdmin, /status:\s*"INPUT_INVALIDO"/);
  assert.match(mcpAdmin, /inputPayload:\s*parsed\.data/);
  assert.match(mcpAdmin, /tool\.handler\(parsed\.data, ctx\)/);
  assert.doesNotMatch(consumer, /tool\.handler\(input\.input \?\? \{\}, ctx\)/);
});

test("consumer reutiliza sanitizador canônico", () => {
  assert.match(consumer, /sanitizeOutgoingText/);
  assert.doesNotMatch(consumer, /gh\[pousr\]_\[A-Za-z0-9\]/);
});

test("PostgREST é fail-closed, com timeout e sem project ref silencioso", () => {
  assert.match(consumer, /HUB_SUPABASE_SERVICE_ROLE_KEY/);
  assert.match(consumer, /HUB_MISSION_SUPABASE_URL_MISSING/);
  assert.match(consumer, /AbortSignal\.timeout\(requestTimeoutMs\(\)\)/);
  assert.doesNotMatch(consumer, /DEFAULT_PROJECT_REF/);
  assert.doesNotMatch(consumer, /lyoigsqluyktoclwdaft/);
});

test("revisão da missão é presa ao HEAD real do runtime antes do dispatch", () => {
  assert.match(consumer, /execFileSync\("git", \["rev-parse", "HEAD"\]/);
  assert.match(consumer, /revisionVerdict\(mission\.branch_sha, runtimeHead\(\)\)/);
  assert.match(consumer, /REVISION_MISMATCH/);
  assert.match(consumer, /RUNTIME_REVISION_UNPROVEN/);
});

test("resultado ambíguo ou textual nunca vira sucesso silencioso", () => {
  assert.match(consumer, /RESULTADO_NAO_ESTRUTURADO/);
  assert.match(consumer, /RESULTADO_SEM_STATUS_COMPROVADO/);
  assert.match(consumer, /UNKNOWN\|UNPROVEN\|INDETERMINADO/);
  assert.match(consumer, /explicitSuccess/);
});

test("receipt é recuperável, hashado e continua pending até validação independente", () => {
  assert.match(consumer, /type:\s*"execution_receipt"/);
  assert.match(consumer, /type:\s*"mcp_tool_receipt"/);
  assert.match(consumer, /url_path:/);
  assert.match(consumer, /receiptHash\(receiptText\)/);
  assert.match(consumer, /status:\s*"pending"/);
  assert.match(consumer, /EVIDENCE_PENDING/);
});

test("finalização exige read-back de exatamente uma missão", () => {
  assert.match(consumer, /async function finalizeMission/);
  assert.match(consumer, /prefer:\s*"return=representation"/);
  assert.match(consumer, /HUB_MISSION_FINALIZE_READBACK_FAILED/);
  assert.match(consumer, /rows\.length !== 1/);
});

test("falha antes do dispatch pode liberar claim; depois do dispatch vira UNKNOWN sem replay", () => {
  assert.match(consumer, /releaseClaimBeforeDispatch/);
  assert.match(consumer, /CLAIM_EVENT_WRITE_FAILED_REQUEUED/);
  assert.match(consumer, /POST_DISPATCH_OUTCOME_UNKNOWN/);
  assert.match(consumer, /markPostDispatchUnknown/);
});

test("claim longo tem heartbeat e stale fica não comprovado, sem refileirar", () => {
  assert.match(consumer, /startClaimHeartbeat/);
  assert.match(consumer, /renewClaim/);
  assert.match(consumer, /STALE_CLAIM_UNPROVEN/);
  assert.match(consumer, /replay automático proibido/);
  const stale = consumer.match(/async function recoverStaleClaims\(\)[\s\S]*?function unwrapResult/)?.[0] || "";
  assert.ok(stale.length > 0);
  assert.doesNotMatch(stale, /state:\s*"failed"/);
  assert.doesNotMatch(stale, /state:\s*"queued"/);
  assert.match(migration, /hub_missions_running_claim_idx/);
});

test("hub-command exige writer_scope e revisão exata para missão executável", () => {
  assert.match(hubCommand, /adminPublic\.from\('hub_missions'\)/);
  assert.match(hubCommand, /adminApi\.from\('audit_log_api'\)/);
  assert.match(hubCommand, /WRITER_SCOPE_RE/);
  assert.match(hubCommand, /writer_scope_required_for_execution/);
  assert.match(hubCommand, /writer_scope:\s*writerScope/);
  assert.match(hubCommand, /SHA_RE/);
  assert.match(hubCommand, /branch_sha_required_for_execution/);
  assert.match(hubCommand, /input:\s*executionInput/);
  assert.match(hubCommand, /auto_execution_eligible/);
  assert.match(hubCommand, /Boolean\(writerScope\)/);
  assert.match(hubCommand, /input_contains_sensitive_material/);
  assert.match(hubCommand, /SENSITIVE_KEY_RE/);
  assert.match(hubCommand, /SENSITIVE_VALUE_RE/);
  assert.doesNotMatch(hubCommand, /commands/);
});

test("PEN_POOL reutiliza hub_missions: várias STOCK, no máximo uma LEASED por scope", () => {
  assert.match(migration, /add column if not exists writer_scope text/);
  assert.match(migration, /hub_missions_executable_scope_ck/);
  assert.match(migration, /check \(capability is null or writer_scope is not null\) not valid/i);
  assert.match(migration, /create unique index if not exists hub_missions_one_running_writer_scope_idx[\s\S]*on public\.hub_missions \(writer_scope\)[\s\S]*where state = 'running' and writer_scope is not null/i);
  assert.match(migration, /queued = caneta em STOCK; running = LEASED/);
  assert.doesNotMatch(migration, /create table[^;]+pen[_-]?pool/i);
});

test("schema estende hub_missions sem expor input a authenticated/anon", () => {
  assert.match(migration, /alter table public\.hub_missions/);
  assert.match(migration, /add column if not exists capability text/);
  assert.match(migration, /add column if not exists input jsonb/);
  assert.match(migration, /add column if not exists writer_scope text/);
  assert.match(migration, /revoke select on public\.hub_missions from authenticated/i);
  assert.match(migration, /grant select \([\s\S]*writer_scope[\s\S]*execution_status[\s\S]*\) on public\.hub_missions to authenticated/i);
  assert.match(migration, /revoke all on api\.hub_missions from anon/i);
  const apiView = migration.match(/create or replace view api\.hub_missions as[\s\S]*?from public\.hub_missions;/i)?.[0] || "";
  assert.ok(apiView.length > 0);
  assert.match(apiView, /writer_scope/);
  assert.doesNotMatch(apiView, /\binput\b/i);
  assert.doesNotMatch(migration, /create table[^;]+queue/i);
});

test("health profundo observa consumer sem iniciar polling por import", () => {
  assert.match(health, /getHubMissionConsumerStatus/);
  assert.doesNotMatch(health, /startHubMissionConsumer/);
  assert.match(health, /pollStaleMs/);
  assert.match(health, /HUB_MISSION_CONSUMER_ENABLED=false/);
});
