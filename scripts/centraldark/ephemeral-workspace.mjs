#!/usr/bin/env node

import {
  existsSync,
  lstatSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  realpathSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { isAbsolute, join, relative, resolve, sep } from "node:path";

const MARKER = "CENTRALDARK_EPHEMERAL_WORKSPACE_CLEAN_REQUIRED";
const MARKER_FILE = ".centraldark-ephemeral.json";
const SCHEMA_VERSION = 1;
const argv = process.argv.slice(2);

function valueAfter(name, fallback = "") {
  const index = argv.indexOf(name);
  return index >= 0 && argv[index + 1] ? argv[index + 1] : fallback;
}

function valuesAfter(name) {
  const values = [];
  for (let i = 0; i < argv.length - 1; i += 1) {
    if (argv[i] === name && argv[i + 1]) values.push(argv[i + 1]);
  }
  return values;
}

function emit(payload) {
  process.stdout.write(`${JSON.stringify(payload)}\n`);
}

function fail(message, code = 2, details = {}) {
  process.stderr.write(`${JSON.stringify({ ok: false, error: message, ...details })}\n`);
  process.exit(code);
}

function isInside(root, target) {
  const rel = relative(root, target);
  return Boolean(rel) && rel !== ".." && !rel.startsWith(`..${sep}`) && !isAbsolute(rel);
}

function validateName(name) {
  if (!name || name === "." || name === ".." || !/^[A-Za-z0-9._-]+$/.test(name)) {
    fail("INVALID_WORKSPACE_NAME", 2, { name });
  }
}

function markerPath(target) {
  return join(target, MARKER_FILE);
}

function readMarker(target) {
  const file = markerPath(target);
  if (!existsSync(file)) fail("MARKER_MISSING_REFUSE_BLIND_DELETE", 3, { target, markerFile: file });
  let data;
  try {
    data = JSON.parse(readFileSync(file, "utf8"));
  } catch (error) {
    fail("MARKER_INVALID_JSON", 3, { target, message: String(error) });
  }
  if (
    data?.schemaVersion !== SCHEMA_VERSION ||
    data?.marker !== MARKER ||
    data?.cleanupRequired !== true
  ) {
    fail("MARKER_INVALID_REFUSE_DELETE", 3, { target });
  }
  return data;
}

function safeIdentity(marker, requestedTarget) {
  const target = resolve(requestedTarget);
  const markedTarget = resolve(String(marker.target || ""));
  const root = resolve(String(marker.root || ""));
  if (target !== markedTarget) fail("TARGET_MARKER_MISMATCH", 3, { target, markedTarget });
  if (!existsSync(root)) fail("MARKER_ROOT_MISSING", 3, { root });
  if (!existsSync(target)) return { target, root, absent: true };

  const targetStat = lstatSync(target);
  if (!targetStat.isDirectory() || targetStat.isSymbolicLink()) {
    fail("TARGET_NOT_PLAIN_DIRECTORY", 3, { target });
  }

  const realRoot = realpathSync(root);
  const realTarget = realpathSync(target);
  if (!isInside(realRoot, realTarget)) {
    fail("TARGET_OUTSIDE_MARKED_ROOT", 3, { realRoot, realTarget });
  }
  return { target: realTarget, root: realRoot, absent: false };
}

function pidAlive(pid) {
  if (!Number.isSafeInteger(pid) || pid <= 0) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

function summarize(path) {
  let files = 0;
  let dirs = 0;
  let symlinks = 0;
  let bytes = 0;

  function walk(current) {
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const child = join(current, entry.name);
      if (entry.isSymbolicLink()) {
        symlinks += 1;
        continue;
      }
      if (entry.isDirectory()) {
        dirs += 1;
        walk(child);
        continue;
      }
      if (entry.isFile()) {
        files += 1;
        bytes += statSync(child).size;
      }
    }
  }

  walk(path);
  return { files, dirs, symlinks, bytes };
}

function createWorkspace({ rootInput, name, purpose, owner, removeEmptyRoot, pids = [] }) {
  validateName(name);
  if (!rootInput) fail("ROOT_REQUIRED");
  const root = resolve(rootInput);
  mkdirSync(root, { recursive: true });
  const realRoot = realpathSync(root);
  const target = resolve(realRoot, name);
  if (!isInside(realRoot, target)) fail("TARGET_OUTSIDE_ROOT", 3, { realRoot, target });
  if (existsSync(target)) fail("TARGET_ALREADY_EXISTS", 3, { target });

  mkdirSync(target);
  const activePids = [...new Set(pids.map(Number).filter((pid) => Number.isSafeInteger(pid) && pid > 0))];
  const marker = {
    schemaVersion: SCHEMA_VERSION,
    marker: MARKER,
    markerFile: MARKER_FILE,
    root: realRoot,
    target,
    owner: owner || "UNKNOWN",
    purpose: purpose || "temporary-validation",
    createdAt: new Date().toISOString(),
    cleanupRequired: true,
    removeEmptyRoot: Boolean(removeEmptyRoot),
    activePids,
  };
  writeFileSync(markerPath(target), `${JSON.stringify(marker, null, 2)}\n`, "utf8");
  emit({ ok: true, action: "create", state: "ACTIVE", ...marker });
  return { marker, target, root: realRoot };
}

function statusWorkspace(targetInput) {
  if (!targetInput) fail("PATH_REQUIRED");
  const target = resolve(targetInput);
  if (!existsSync(target)) {
    emit({ ok: true, action: "status", state: "ABSENT", target });
    return;
  }
  const marker = readMarker(target);
  const identity = safeIdentity(marker, target);
  const activePids = (marker.activePids || []).filter((pid) => pidAlive(Number(pid)));
  emit({
    ok: true,
    action: "status",
    state: activePids.length ? "ACTIVE_PROCESS" : "ACTIVE",
    target: identity.target,
    root: identity.root,
    activePids,
    summary: summarize(identity.target),
  });
}

function registerPid(targetInput, pidInput) {
  if (!targetInput) fail("PATH_REQUIRED");
  const pid = Number(pidInput);
  if (!Number.isSafeInteger(pid) || pid <= 0) fail("VALID_PID_REQUIRED");
  const target = resolve(targetInput);
  const marker = readMarker(target);
  safeIdentity(marker, target);
  const activePids = [...new Set([...(marker.activePids || []), pid])];
  marker.activePids = activePids;
  marker.updatedAt = new Date().toISOString();
  writeFileSync(markerPath(target), `${JSON.stringify(marker, null, 2)}\n`, "utf8");
  emit({ ok: true, action: "register-pid", target, pid, activePids });
}

function cleanupWorkspace(targetInput) {
  if (!targetInput) fail("PATH_REQUIRED");
  const requestedTarget = resolve(targetInput);
  if (!existsSync(requestedTarget)) {
    emit({
      ok: true,
      action: "cleanup",
      state: "ALREADY_ABSENT",
      target: requestedTarget,
      readbackAbsent: true,
    });
    return;
  }

  const marker = readMarker(requestedTarget);
  const identity = safeIdentity(marker, requestedTarget);
  if (identity.absent) {
    emit({
      ok: true,
      action: "cleanup",
      state: "ALREADY_ABSENT",
      target: requestedTarget,
      readbackAbsent: true,
    });
    return;
  }

  const keepFile = join(identity.target, ".centraldark-keep");
  if (existsSync(keepFile) || marker.keep === true || marker.keepReason) {
    fail("FORENSIC_OR_EXPLICIT_KEEP_BLOCKS_DELETE", 4, {
      target: identity.target,
      keepFile: existsSync(keepFile),
      keepReason: marker.keepReason || null,
    });
  }

  const activePids = (marker.activePids || []).map(Number).filter(pidAlive);
  if (activePids.length) {
    fail("ACTIVE_PROCESS_BLOCKS_DELETE", 5, { target: identity.target, activePids });
  }

  const before = summarize(identity.target);
  const root = identity.root;
  rmSync(identity.target, { recursive: true, force: false, maxRetries: 2, retryDelay: 100 });
  const readbackAbsent = !existsSync(identity.target);
  if (!readbackAbsent) fail("CLEANUP_READBACK_FAILED", 6, { target: identity.target });

  let rootRemoved = false;
  if (marker.removeEmptyRoot === true && existsSync(root) && readdirSync(root).length === 0) {
    rmSync(root, { recursive: true, force: false });
    rootRemoved = !existsSync(root);
  }

  emit({
    ok: true,
    action: "cleanup",
    state: "CLEANED",
    target: identity.target,
    root,
    before,
    readbackAbsent,
    rootRemoved,
    completedAt: new Date().toISOString(),
  });
}

function inventoryRoot(rootInput, prefixes = []) {
  if (!rootInput) fail("ROOT_REQUIRED");
  const root = resolve(rootInput);
  if (!existsSync(root)) {
    emit({
      ok: true,
      action: "inventory",
      state: "ROOT_ABSENT",
      root,
      marked: [],
      unmarked: [],
      unclassifiedResidue: 0,
    });
    return;
  }

  const stat = lstatSync(root);
  if (!stat.isDirectory() || stat.isSymbolicLink()) {
    fail("ROOT_NOT_PLAIN_DIRECTORY", 3, { root });
  }

  const normalizedPrefixes = [...new Set(prefixes.filter(Boolean))];
  const marked = [];
  const unmarked = [];

  for (const entry of readdirSync(root, { withFileTypes: true })) {
    if (!entry.isDirectory() || entry.isSymbolicLink()) continue;
    const target = join(root, entry.name);
    const file = markerPath(target);

    if (existsSync(file)) {
      try {
        const marker = JSON.parse(readFileSync(file, "utf8"));
        const valid = marker?.schemaVersion === SCHEMA_VERSION
          && marker?.marker === MARKER
          && marker?.cleanupRequired === true;
        marked.push({
          name: entry.name,
          target,
          markerValid: valid,
          cleanupRequired: marker?.cleanupRequired === true,
          keep: Boolean(marker?.keep === true || marker?.keepReason || existsSync(join(target, ".centraldark-keep"))),
          activePids: (marker?.activePids || []).map(Number).filter(pidAlive),
        });
      } catch {
        marked.push({
          name: entry.name,
          target,
          markerValid: false,
          cleanupRequired: true,
          keep: false,
          activePids: [],
        });
      }
      continue;
    }

    if (normalizedPrefixes.length && normalizedPrefixes.some((prefix) => entry.name.startsWith(prefix))) {
      unmarked.push({ name: entry.name, target, classification: "UNMARKED_TEMP_WORKSPACE" });
    }
  }

  const invalidMarkers = marked.filter((item) => !item.markerValid).length;
  const activeMarked = marked.filter((item) => item.activePids.length > 0).length;
  const keptMarked = marked.filter((item) => item.keep).length;
  const cleanupCandidates = marked.filter((item) => item.markerValid && !item.keep && item.activePids.length === 0).length;
  const unclassifiedResidue = unmarked.length + invalidMarkers;

  emit({
    ok: unclassifiedResidue === 0,
    action: "inventory",
    state: unclassifiedResidue === 0 ? "CLASSIFIED" : "UNCLASSIFIED_RESIDUE",
    root,
    prefixes: normalizedPrefixes,
    marked,
    unmarked,
    counts: {
      marked: marked.length,
      invalidMarkers,
      activeMarked,
      keptMarked,
      cleanupCandidates,
      unmarked: unmarked.length,
    },
    unclassifiedResidue,
  });

  if (unclassifiedResidue > 0) process.exitCode = 8;
}

function selfTest() {
  const requestedRoot = join(tmpdir(), `centraldark-ephemeral-selftest-${process.pid}-${Date.now()}`);
  const name = "workspace";
  let target = null;
  let canonicalRoot = requestedRoot;
  let result = "FAIL";
  try {
    const created = createWorkspace({
      rootInput: requestedRoot,
      name,
      purpose: "self-test",
      owner: "porta-de-entrada",
      removeEmptyRoot: true,
    });
    target = created.target;
    canonicalRoot = created.root;
    writeFileSync(join(target, "probe.txt"), "delete-after-use\n", "utf8");
    const marker = readMarker(target);
    safeIdentity(marker, target);
    inventoryRoot(canonicalRoot, ["workspace"]);
    cleanupWorkspace(target);
    if (!existsSync(target) && !existsSync(canonicalRoot)) result = "PASS";
  } finally {
    if (target && existsSync(target)) rmSync(target, { recursive: true, force: true });
    if (existsSync(canonicalRoot)) rmSync(canonicalRoot, { recursive: true, force: true });
    if (requestedRoot !== canonicalRoot && existsSync(requestedRoot)) rmSync(requestedRoot, { recursive: true, force: true });
  }
  emit({
    ok: result === "PASS",
    action: "self-test",
    selfTest: result,
    marker: MARKER,
    markerFile: MARKER_FILE,
  });
  if (result !== "PASS") process.exit(7);
}

if (argv.includes("--self-test")) {
  selfTest();
  process.exit(0);
}

const command = argv[0];
switch (command) {
  case "create":
    createWorkspace({
      rootInput: valueAfter("--root"),
      name: valueAfter("--name"),
      purpose: valueAfter("--purpose"),
      owner: valueAfter("--owner"),
      removeEmptyRoot: argv.includes("--remove-empty-root"),
      pids: valuesAfter("--pid"),
    });
    break;
  case "inventory":
    inventoryRoot(valueAfter("--root"), valuesAfter("--prefix"));
    break;
  case "status":
    statusWorkspace(valueAfter("--path"));
    break;
  case "register-pid":
    registerPid(valueAfter("--path"), valueAfter("--pid"));
    break;
  case "cleanup":
    cleanupWorkspace(valueAfter("--path"));
    break;
  default:
    fail(
      "USAGE: ephemeral-workspace.mjs create --root <dir> --name <safe-name> [--owner <owner>] [--purpose <text>] [--remove-empty-root] [--pid <pid>] | inventory --root <dir> [--prefix <prefix> ...] | status --path <dir> | register-pid --path <dir> --pid <pid> | cleanup --path <dir> | --self-test",
      1,
    );
}
