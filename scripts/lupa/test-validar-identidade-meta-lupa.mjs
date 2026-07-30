#!/usr/bin/env node

import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const VALIDATOR = resolve("scripts/lupa/validar-identidade-meta-lupa.mjs");
const SKILL_PATH = ".agents/skills/meta-lupa/SKILL.md";
const IDENTITY_PATH = ".agents/skills/meta-lupa/AUTOLUPA_CANONICAL_SHA";
const BOOT_FILES = ["AGENTS.md", "CLAUDE.md", "README.md"];

function run(command, args, cwd, expected = 0) {
  const result = spawnSync(command, args, {
    cwd,
    encoding: "utf8",
    windowsHide: true,
  });
  assert.equal(
    result.status,
    expected,
    `status inesperado: ${command} ${args.join(" ")}\nstdout=${result.stdout}\nstderr=${result.stderr}`,
  );
  return `${result.stdout || ""}\n${result.stderr || ""}`;
}

function write(root, relativePath, content) {
  const target = join(root, relativePath);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, content, "utf8");
}

const root = mkdtempSync(join(tmpdir(), "meta-lupa-identity-"));
let passed = 0;

try {
  run("git", ["init"], root);
  run("git", ["config", "user.email", "guardrail@centraldark.local"], root);
  run("git", ["config", "user.name", "CentralDark Guardrail"], root);

  write(root, SKILL_PATH, "# META LUPA\n\nfixture canônica\n");
  const skillBlob = run("git", ["hash-object", SKILL_PATH], root).trim();
  write(root, IDENTITY_PATH, `${skillBlob}  ${SKILL_PATH}\n# identidade canônica\n`);

  for (const bootFile of BOOT_FILES) {
    write(
      root,
      bootFile,
      `SKILL_PATH: ${SKILL_PATH}\nSKILL_IDENTITY_FILE: ${IDENTITY_PATH}\n`,
    );
  }

  run("git", ["add", "."], root);
  run("git", ["commit", "-m", "fixture válida"], root);

  run(process.execPath, [VALIDATOR, "--repo-root", root], root);
  passed += 1;

  const validIdentity = readFileSync(join(root, IDENTITY_PATH), "utf8");
  write(root, IDENTITY_PATH, `${"0".repeat(40)}  ${SKILL_PATH}\n`);
  const wrongIdentity = run(process.execPath, [VALIDATOR, "--repo-root", root], root, 1);
  assert.match(wrongIdentity, /IDENTITY_HEAD_MISMATCH/);
  passed += 1;
  write(root, IDENTITY_PATH, validIdentity);

  const validAgent = readFileSync(join(root, "AGENTS.md"), "utf8");
  write(root, "AGENTS.md", `${validAgent}SKILL_COMMIT_SHA: ${"1".repeat(40)}\n`);
  const duplicatedSha = run(process.execPath, [VALIDATOR, "--repo-root", root], root, 1);
  assert.match(duplicatedSha, /BOOT_SHA_DUPLICATED:AGENTS\.md/);
  passed += 1;
  write(root, "AGENTS.md", validAgent);

  const validSkill = readFileSync(join(root, SKILL_PATH), "utf8");
  write(root, SKILL_PATH, `${validSkill}drift não registrado\n`);
  const skillDrift = run(process.execPath, [VALIDATOR, "--repo-root", root], root, 1);
  assert.match(skillDrift, /IDENTITY_WORKTREE_MISMATCH|SKILL_HEAD_WORKTREE_DRIFT/);
  passed += 1;
  write(root, SKILL_PATH, validSkill);

  write(root, IDENTITY_PATH, `${skillBlob}  .agents/skills/outra-lupa/SKILL.md\n`);
  const wrongPath = run(process.execPath, [VALIDATOR, "--repo-root", root], root, 1);
  assert.match(wrongPath, /IDENTITY_PATH_MISMATCH/);
  passed += 1;

  console.log(`META_LUPA_IDENTITY_TESTS=PASS TOTAL=${passed}`);
} finally {
  rmSync(root, { recursive: true, force: true });
}
