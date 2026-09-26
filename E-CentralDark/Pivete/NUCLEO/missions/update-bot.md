# MISSAO - update-bot.mjs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\PACOTE-SESSAO-INTEIRA-CENTRALDARK-20260806\02-SNAPSHOT-TRABALHO\rigor-audit\qa.teste-de-software.MARKDOWN\runtime\update-bot.mjs
**SHA:** 2943301b35b8d3a9
**Timestamp:** 2026-08-26T19:10:28.488839
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const start = Date.now();

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env node
/**
 * Bot de Atualizações: processa eventos em delta e deduplica entre sessões.
 * Lock por eventId evita corrida no checkpoint.
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
  const dir = path.dirname(file);
  await fs.mkdir(dir, { recursive: true });
  const tmp = path.join(dir, `.${path.basename(file)}.${process.pid}.${Date.now()}.tmp`);
  await fs.writeFile(tmp, `${JSON.stringify(value, null, 2)}\n`, { encoding: "utf8", mode: 0o600 });
  await fs.rename(tmp, file);
}

async function acquireLock(stateDir, eventId, timeoutMs = 5000) {
  const lockDir = path.join(stateDir, "locks");
  await fs.mkdir(lockDir, { recursive: true });
  const lockPath = path.join(lockDir, `${eventId}.lock`);
  const start = Date.now();
  while (true) {
    try {
      const fh = await fs.open(lockPath, "wx");
      await fh.writeFile(JSON.stringify({ pid: process.pid, ts: new Date().toISOString() }));
      await fh.close();
      return lockPath;
    } catch (error) {
      if (error.code !== "EEXIST") throw error;
      if (Date.now() - start > timeoutMs) throw new Error(`LOCK_TIMEOUT:${eventId}`);
      await new Promise((r) => setTimeout(r, 25));
    }
  }
}

async function releaseLock(lockPath) {
  if (!lockPath) return;
  await fs.unlink(lockPath).catch(() => {});
}

function missionOk(mission) {
  return Boolean(mission && (mission.id || mission.state || mission.nextState || mission.objective));
}

export async function processEvent(rawEvent, options = {}) {
  const stateDir = options.stateDir || DEFAULT_STATE_DIR;
  const eventId = hashObject(rawEvent);
  let lockPath = null;
  try {
    lockPath = await acquireLock(stateDir, eventId, options.lockTimeoutMs || 5000);
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
    const mOk = missionOk(result.event?.mission);
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

    // INCONCLUSIVO e BLOCKED nao avancam checkpoint (permite reavaliacao futura)
    if (
      deltaStatus.startsWith("BLOCKED") ||
      deltaStatus === "UNKNOWN" ||
      deltaStatus === "INCONCLUSIVO"
    ) {
      await writeAtomic(path.join(stateDir, "blocked", `${eventId}.json`), receipt);
      return {
        status:
          deltaStatus === "INCONCLUSIVO"
            ? "INCONCLUSIVO_NOT_CHECKPOINTED"
            : "BLOCKED_NOT_CHECKPOINTED",
        eventId,
        processed: false,
        missionPreserved: mOk,
        result,
      };
    }

    await writeAtomic(path.join(stateDir, "receipts", `${eventId}.json`), receipt);
    const checkpoint2 = await readCheckpoint(stateDir);
    if (checkpoint2.processed.includes(eventId)) {
      return {
        status: "DUPLICATE_EVENT",
        eventId,
        processed: false,
        missionPreserved: mOk,
        result,
      };
    }
    checkpoint2.processed = [...checkpoint2.processed, eventId].slice(-2000);
    checkpoint2.updatedAt = new Date().toISOString();
    await writeAtomic(path.join(stateDir, "checkpoint.json"), checkpoint2);

    return {
      status: "PROCESSED",
      eventId,
      processed: true,
      missionPreserved: mOk,
      result,
    };
  } finally {
    await releaseLock(lockPath);
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

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
```