import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const sourcePath = new URL("../core/orchestrator.mjs", import.meta.url);

test("runtime calibration recreates mission directories before enqueue work", async () => {
  const source = await readFile(sourcePath, "utf8");
  const calibration = source.match(
    /async function calibrarRuntimeInterno\(\) \{([\s\S]*?)\n\}/,
  );

  assert.ok(calibration, "calibration owner must exist");
  const body = calibration[1];
  assert.match(
    body,
    /await garantirRuntimeDirs\(\);[\s\S]*?const estado = await calibrateRuntime\(\);/,
    "the calibration path must restore its own mission directories before enqueueing a sidecar",
  );
});
