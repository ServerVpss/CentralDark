import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const read = (path) => readFileSync(join(ROOT, path), "utf8");

test("owners declare the incremental global portability contract", () => {
  for (const path of ["AGENTS.md", "RULES.md"]) {
    const source = read(path);
    assert.match(source, /portabilidade/iu);
    assert.match(source, /(?:global|ambiental)/iu);
    assert.match(source, /scripts\/checker\/_lib\.sh/iu);
    assert.match(source, /UNKNOWN\s*!=\s*PASS/iu);
  }
});

test("the canonical Bash resolver is environment-independent and fail-closed", () => {
  const source = read("scripts/checker/_lib.sh");
  assert.match(source, /BASH_SOURCE\[0\]/u);
  assert.match(source, /pwd\s+-P/u);
  assert.match(source, /realpath\s+-m/u);
  assert.match(source, /CK_REQUESTED_REPO_ROOT/iu);
  assert.match(source, /OUT_OF_SCOPE/u);
  assert.doesNotMatch(source, /CK_CANONICAL_ROOT\s*=\s*['"](?:\/root|[A-Z]:\\)/iu);
});

test("checker scripts do not reintroduce machine-root bindings", () => {
  const checkerDir = join(ROOT, "scripts/checker");
  for (const name of readdirSync(checkerDir).filter((item) => item.endsWith(".sh"))) {
    const source = readFileSync(join(checkerDir, name), "utf8");
    assert.doesNotMatch(source, /(^|[^A-Za-z_])(?:\/root\/CentralDark|[CK]:\\(?:CentralDark|apps|scripts))/u, name);
  }
});

test("literal EREs in checker scripts are syntactically valid when grep exists", () => {
  let grep;
  try {
    grep = execFileSync(process.platform === "win32" ? "where" : "command", process.platform === "win32" ? ["grep"] : ["-v", "", "grep"], { encoding: "utf8" }).trim().split(/\r?\n/)[0];
  } catch {
    return;
  }
  if (!grep) return;
  const checkerDir = join(ROOT, "scripts/checker");
  for (const name of readdirSync(checkerDir).filter((item) => item.endsWith(".sh"))) {
    const source = readFileSync(join(checkerDir, name), "utf8");
    for (const match of source.matchAll(/\bgrep\s+[^\n]*?\s-E[a-z]*\s+(['"])(.*?)\1/g)) {
      const result = spawnSync(grep, ["-Eq", match[2], process.platform === "win32" ? "NUL" : "/dev/null"], { encoding: "utf8" });
      assert.notEqual(result.status, 2, `${name}: invalid ERE ${match[2]}`);
    }
  }
});
