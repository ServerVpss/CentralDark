# MISSAO - workflow-state.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\pi-subagents@0.57.0@@@1\src\missions\workflow-state.ts
**SHA:** 7c2187d9f529e3a5
**Timestamp:** 2026-08-28T02:24:52.749942
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const raw = execFileSync("ps", ["-p", String(pid), "-o", "lstart="], { encoding: "utf-8", stdio: ["ignore", "pipe", "ignore"], timeout: 1000 }).trim();

### Padroes
- const STATE_KEY_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/;

### Ouro Bruto (primeiros 5000 chars)
```
import { execFileSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import * as fs from "node:fs";
import * as path from "node:path";
import { writePrivateAtomicJson } from "../shared/atomic-json.ts";
import { DEFAULT_FILE_SYSTEM_RETRY_DELAYS_MS, isRetryableFileSystemError, waitForFileSystemRetry } from "../shared/file-system-retry.ts";
import { assertWorkflowJsonValue } from "../workflows/scripted-workflow.ts";
import type { MissionStoreLocation } from "./types.ts";
import { validateMissionId } from "./store.ts";

const STATE_KEY_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/;
const STATE_LOCK_STALE_MS = 60_000;
export const MISSION_STATE_MAX_BYTES = 256 * 1024;

export interface MissionWorkflowState {
	path: string;
	get(key: string): unknown;
	set(key: string, value: unknown): void;
}

export function missionStatePath(location: MissionStoreLocation, missionId: string): string {
	return path.join(location.missionDir, validateMissionId(missionId), "state.json");
}

function isProcessAlive(pid: number): boolean {
	try {
		process.kill(pid, 0);
		return true;
	} catch (error) {
		return (error as NodeJS.ErrnoException).code === "EPERM";
	}
}

interface StateLockOwner {
	pid: number;
	token: string;
	createdAt: number;
	processKey?: string;
}

function linuxProcessStartKey(pid: number): string | undefined {
	try {
		const raw = fs.readFileSync(`/proc/${pid}/stat`, "utf-8");
		const tail = raw.slice(raw.lastIndexOf(")") + 2).trim().split(/\s+/);
		return tail[19] ? `linux:${tail[19]}` : undefined;
	} catch {
		return undefined;
	}
}

function psProcessStartKey(pid: number): string | undefined {
	try {
		const raw = execFileSync("ps", ["-p", String(pid), "-o", "lstart="], { encoding: "utf-8", stdio: ["ignore", "pipe", "ignore"], timeout: 1000 }).trim();
		return raw ? `ps:${raw}` : undefined;
	} catch {
		return undefined;
	}
}

function windowsProcessStartKey(pid: number): string | undefined {
	try {
		const raw = execFileSync("powershell.exe", ["-NoProfile", "-Command", `(Get-CimInstance Win32_Process -Filter \"ProcessId=${pid}\").CreationDate`], { encoding: "utf-8", stdio: ["ignore", "pipe", "ignore"], timeout: 1000, windowsHide: true }).trim();
		return raw ? `win:${raw}` : undefined;
	} catch {
		return undefined;
	}
}

function processStartKey(pid: number): string | undefined {
	if (process.platform === "linux") return linuxProcessStartKey(pid) ?? psProcessStartKey(pid);
	if (process.platform === "win32") return windowsProcessStartKey(pid);
	return undefined;
}

const CURRENT_PROCESS_KEY = processStartKey(process.pid);

function readStateLockOwner(lockPath: string): StateLockOwner | undefined {
	try {
		const owner = JSON.parse(fs.readFileSync(path.join(lockPath, "owner.json"), "utf-8")) as { pid?: unknown; token?: unknown; createdAt?: unknown; processKey?: unknown };
		if (Number.isSafeInteger(owner.pid) && (owner.pid as number) > 0 && typeof owner.token === "string" && owner.token && Number.isSafeInteger(owner.createdAt)) {
			return {
				pid: owner.pid as number,
				token: owner.token,
				createdAt: owner.createdAt as number,
				...(typeof owner.processKey === "string" && owner.processKey ? { processKey: owner.processKey } : {}),
			};
		}
	} catch {
		return undefined;
	}
	return undefined;
}

function stateLockIsStale(lockPath: string, now = Date.now()): boolean {
	const owner = readStateLockOwner(lockPath);
	if (owner) {
		if (!isProcessAlive(owner.pid)) return true;
		if (owner.processKey) {
			const currentProcessKey = owner.pid === process.pid ? CURRENT_PROCESS_KEY : processStartKey(owner.pid);
			if (currentProcessKey) return owner.processKey !== currentProcessKey;
			if (owner.pid === process.pid) return true;
		}
		return false;
	}
	try {
		return now - fs.statSync(lockPath).mtimeMs > STATE_LOCK_STALE_MS;
	} catch (error) {
		if ((error as NodeJS.ErrnoException).code === "ENOENT") return false;
		throw error;
	}
}

function removeOwnedStateLock(lockPath: string, owner: StateLockOwner): void {
	const current = readStateLockOwner(lockPath);
	if (current?.token !== owner.token) return;
	fs.rmSync(lockPath, { recursive: true, force: true });
}

function staleDirectoryExists(dirPath: string, now = Date.now()): boolean {
	try {
		return now - fs.statSync(dirPath).mtimeMs > STATE_LOCK_STALE_MS;
	} catch (error) {
		if ((error as NodeJS.ErrnoException).code === "ENOENT") return false;
		throw error;
	}
}

function tryMakeDirectory(dirPath: string, mode: number): boolean {
	try {
		fs.mkdirSync(dirPath, { mode });
		return true;
	} catch (error) {
		if ((error as NodeJS.ErrnoException).code === "EEXIST") return false;
		throw error;
	}
}

function waitForStateLock(delayMs: number | undefined, lockPath: string): void {
	if (delayMs === undefined) throw new Error(`Timed out acquiring mission state lock '${lockPath}'.`);
	waitForFileSystemRetry(delayMs);
}

function reclaimStaleStateLock(lockPath: string, reclaimPath: string): boolean {
	if (!stateLockIsStale(lockPath)) return
```