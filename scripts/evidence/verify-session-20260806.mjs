#!/usr/bin/env node
import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../..");
const expected = [
  { path: "evidence/session-completa-20260806/GATILHO-UNIVERSAL-IA-RIGOR-MAXIMO.zip", sha256: "877057300af4369e01e9636809ee6b632ccac9f94db2894acd5f1a6b887588fd", size: 46740 },
];
async function hashFile(file) {
  return await new Promise((resolve, reject) => {
    const hash = createHash("sha256");
    const stream = createReadStream(file);
    stream.on("data", data => hash.update(data));
    stream.on("error", reject);
    stream.on("end", () => resolve(hash.digest("hex")));
  });
}
let failed = 0;
for (const item of expected) {
  const file = path.join(root, item.path);
  const meta = await stat(file);
  const digest = await hashFile(file);
  const ok = meta.size === item.size && digest === item.sha256;
  console.log(`${ok ? "PASS" : "FAIL"} ${item.path} size=${meta.size} sha256=${digest}`);
  if (!ok) failed++;
}
if (failed) process.exit(1);
console.log("SESSION_EVIDENCE_VERIFY=PASS");
