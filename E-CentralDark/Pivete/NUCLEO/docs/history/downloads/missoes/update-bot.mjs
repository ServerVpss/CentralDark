#!/usr/bin/env node
/**
 * Bot de Atualizações: processa eventos em delta e deduplica entre sessões.
 * Usa claim atômico por eventId; INCONCLUSIVO e BLOCKED nunca viram checkpoint verde.
 */
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import { orchestrate } from "./orchestrator.mjs";
import { hashObject, sanitizeObject } from "./sanitize.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DEFAULT_STATE_DIR = path.join(ROOT, "learning", "update-bot");
const EVENT_SCHEMA_VERSION = 2;

async function readCheckpoint(stateDir) {
  try {
    return JSON.parse(await fs.readFile(path.join(stateDir, "checkpoint.json"), "utf8"));
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
    return { schemaVersion: EVENT_SCHEMA_VERSION, processed: [], updatedAt: null };
  }
}

async function writeAtomic(file, value) {
  const tmp = `${file}.${process.pid}.${crypto.randomBytes(6).toString("hex")}.tmp`;
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(tmp, `${JSON.stringify(value, null, 2)}\n`, { encoding: "utf8", mode: 0o600 });
  await fs.rename(tmp, file);
}

function processAlive(pid) {
  const value = Number(pid);
  if (!Number.isInteger(value) || value <= 0) return false;
  try {
    process.kill(value, 0);
    return true;
  } catch (error) {
    return error.code === "EPERM";
  }
}

async function staleLockCanBeRemoved(lockFile, stat, staleMs) {
  if (!stat || Date.now() - stat.mtimeMs <= staleMs) return false;
  try {
    const metadata = JSON.parse(await fs.readFile(lockFile, "utf8"));
    if (processAlive(metadata?.pid)) return false;
  } catch {
    // Lock corrompido só pode ser removido quando realmente ultrapassou staleMs.
  }
  return true;
}

async function acquireLock(lockFile, { retries = 0, delayMs = 20, staleMs = 30000 } = {}) {
  await fs.mkdir(path.dirname(lockFile), { recursive: true });
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const handle = await fs.open(lockFile, "wx", 0o600);
      await handle.writeFile(JSON.stringify({ pid: process.pid, ts: Date.now() }));
      return handle;
    } catch (error) {
      if (error.code !== "EEXIST") throw error;
      const stat = await fs.stat(lockFile).catch(() => null);
      if (await staleLockCanBeRemoved(lockFile, stat, staleMs)) {
        await fs.unlink(lockFile).catch(() => {});
        continue;
      }
      if (attempt === retries) return null;
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
  return null;
}

async function releaseLock(handle, lockFile) {
  if (handle) await handle.close().catch(() => {});
  await fs.unlink(lockFile).catch(() => {});
}

async function updateCheckpoint(stateDir, eventId) {
  const lockFile = path.join(stateDir, "locks", "checkpoint.lock");
  const lock = await acquireLock(lockFile, { retries: 250, delayMs: 10, staleMs: 30000 });
  if (!lock) throw new Error("CHECKPOINT_LOCK_TIMEOUT");
  try {
    const checkpoint = await readCheckpoint(stateDir);
    checkpoint.schemaVersion = EVENT_SCHEMA_VERSION;
    checkpoint.processed = [...new Set([...(checkpoint.processed || []), eventId])].slice(-2000);
    checkpoint.updatedAt = new Date().toISOString();
    await writeAtomic(path.join(stateDir, "checkpoint.json"), checkpoint);
  } finally {
    await releaseLock(lock, lockFile);
  }
}

async function alreadyProcessed(stateDir, eventId) {
  try {
    await fs.access(path.join(stateDir, "receipts", `${eventId}.json`));
    return true;
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  const checkpoint = await readCheckpoint(stateDir);
  return Array.isArray(checkpoint.processed) && checkpoint.processed.includes(eventId);
}

export async function processEvent(rawEvent, options = {}) {
  const stateDir = options.stateDir || DEFAULT_STATE_DIR;
  const eventId = hashObject({ schemaVersion: EVENT_SCHEMA_VERSION, event: rawEvent });
  const eventLockFile = path.join(stateDir, "locks", `${eventId}.lock`);
  const eventLock = await acquireLock(eventLockFile, { retries: 0, staleMs: options.lockStaleMs || 30000 });
  if (!eventLock) {
    return { status: "EVENT_IN_PROGRESS", eventId, processed: false, missionPreserved: false };
  }

  try {
    if (await alreadyProcessed(stateDir, eventId)) {
      return { status: "DUPLICATE_EVENT", eventId, processed: false, missionPreserved: true };
    }

    const orchestrateFn = options.orchestrateFn || orchestrate;
    const result = await orchestrateFn(rawEvent, {
      ...(options.orchestratorOptions || {}),
      learningDir: options.learningDir,
    });

    const deltaStatus = result.delta?.match(/^STATUS=([^\n]+)/m)?.[1] || "UNKNOWN";
    const missionPreserved = /(?:^|\n)MISSAO_ATUAL_PRESERVADA=SIM(?:\n|$)/.test(result.delta || "");
    const receipt = sanitizeObject({
      eventId,
      schemaVersion: EVENT_SCHEMA_VERSION,
      ts: new Date().toISOString(),
      deltaStatus,
      event: result.event,
      route: result.routeResult,
      policy: result.policy,
      learning: result.learning,
      delta: result.delta,
    });

    if (deltaStatus.startsWith("BLOCKED") || deltaStatus === "UNKNOWN") {
      await writeAtomic(path.join(stateDir, "blocked", `${eventId}.json`), receipt);
      return { status: "BLOCKED_NOT_CHECKPOINTED", eventId, processed: false, missionPreserved, result };
    }

    if (deltaStatus === "INCONCLUSIVO") {
      await writeAtomic(path.join(stateDir, "inconclusive", `${eventId}.json`), receipt);
      return { status: "INCONCLUSIVE_NOT_CHECKPOINTED", eventId, processed: false, missionPreserved, result };
    }

    await writeAtomic(path.join(stateDir, "receipts", `${eventId}.json`), receipt);
    await updateCheckpoint(stateDir, eventId);
    return { status: "PROCESSED", eventId, processed: true, missionPreserved, result };
  } finally {
    await releaseLock(eventLock, eventLockFile);
  }
}

export async function processJsonlFile(file, options = {}) {
  const raw = await fs.readFile(file, "utf8");
  const lines = raw.split(/\r?\n/).filter((line) => line.trim());
  const results = [];
  for (const [index, line] of lines.entries()) {
    try {
      results.push(await processEvent(JSON.parse(line), options));
    } catch (error) {
      results.push({ status: "INVALID_EVENT", line: index + 1, error: error.message });
    }
  }
  return results;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  let results;
  if (args.includes("--stdin")) {
    const chunks = [];
    for await (const chunk of process.stdin) chunks.push(chunk);
    results = [await processEvent(JSON.parse(Buffer.concat(chunks).toString("utf8")))];
  } else {
    const index = args.indexOf("--file");
    if (index < 0 || !args[index + 1]) throw new Error("USE --stdin OU --file <eventos.jsonl>");
    results = await processJsonlFile(args[index + 1]);
  }
  console.log(JSON.stringify(sanitizeObject(results.map((item) => ({
    status: item.status,
    eventId: item.eventId,
    processed: item.processed,
    delta: item.result?.delta,
  }))), null, 2));
  const okStatuses = new Set(["PROCESSED", "DUPLICATE_EVENT", "EVENT_IN_PROGRESS", "INCONCLUSIVE_NOT_CHECKPOINTED"]);
  process.exit(results.every((item) => okStatuses.has(item.status)) ? 0 : 1);
}
