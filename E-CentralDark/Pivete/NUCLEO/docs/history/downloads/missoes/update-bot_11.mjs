#!/usr/bin/env node
/**
 * Bot de Atualizações: processa eventos em delta e deduplica entre sessões.
 * Não fica residente por padrão; Hermes chama em cada evento ou lote JSONL.
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { orchestrate } from "./orchestrator.mjs";
import { hashObject, sanitizeObject } from "./sanitize.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DEFAULT_STATE_DIR = path.join(ROOT, "learning", "update-bot");

async function readCheckpoint(stateDir) {
  try {
    return JSON.parse(await fs.readFile(path.join(stateDir, "checkpoint.json"), "utf8"));
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
    return { processed: [], updatedAt: null };
  }
}

async function writeAtomic(file, value) {
  const tmp = `${file}.${process.pid}.tmp`;
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(tmp, `${JSON.stringify(value, null, 2)}\n`, { encoding: "utf8", mode: 0o600 });
  await fs.rename(tmp, file);
}

export async function processEvent(rawEvent, options = {}) {
  const stateDir = options.stateDir || DEFAULT_STATE_DIR;
  const eventId = hashObject(rawEvent);
  const checkpoint = await readCheckpoint(stateDir);

  if (checkpoint.processed.includes(eventId)) {
    return { status: "DUPLICATE_EVENT", eventId, processed: false, missionPreserved: true };
  }

  const orchestrateFn = options.orchestrateFn || orchestrate;
  const result = await orchestrateFn(rawEvent, {
    ...(options.orchestratorOptions || {}),
    learningDir: options.learningDir,
  });

  const deltaStatus = result.delta?.match(/^STATUS=([^\n]+)/m)?.[1] || "UNKNOWN";
  const receipt = sanitizeObject({
    eventId,
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
    return { status: "BLOCKED_NOT_CHECKPOINTED", eventId, processed: false, missionPreserved: true, result };
  }

  await writeAtomic(path.join(stateDir, "receipts", `${eventId}.json`), receipt);
  checkpoint.processed = [...checkpoint.processed, eventId].slice(-2000);
  checkpoint.updatedAt = new Date().toISOString();
  await writeAtomic(path.join(stateDir, "checkpoint.json"), checkpoint);

  return { status: "PROCESSED", eventId, processed: true, missionPreserved: true, result };
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
  process.exit(results.every((item) => ["PROCESSED", "DUPLICATE_EVENT"].includes(item.status)) ? 0 : 1);
}
