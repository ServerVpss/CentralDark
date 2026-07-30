#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";
import { resolve, join } from "node:path";
import { spawnSync } from "node:child_process";

const args = process.argv.slice(2);
const argOf = (name, fallback) => {
  const index = args.indexOf(name);
  return index >= 0 && args[index + 1] ? args[index + 1] : fallback;
};

const ROOT = resolve(argOf("--repo-root", process.cwd()));
const JSON_OUT = args.includes("--json");
const SKILL_PATH = ".agents/skills/meta-lupa/SKILL.md";
const IDENTITY_PATH = ".agents/skills/meta-lupa/AUTOLUPA_CANONICAL_SHA";
const BOOT_FILES = ["AGENTS.md", "CLAUDE.md", "README.md"];

function read(relativePath) {
  return readFileSync(join(ROOT, relativePath), "utf8");
}

function git(...gitArgs) {
  const result = spawnSync("git", ["-C", ROOT, ...gitArgs], {
    encoding: "utf8",
    windowsHide: true,
  });
  if (result.status !== 0) {
    throw new Error(`GIT_PROOF_FAILED:${gitArgs.join(" ")}:${(result.stderr || "").trim()}`);
  }
  const value = (result.stdout || "").trim();
  if (!value) throw new Error(`GIT_PROOF_EMPTY:${gitArgs.join(" ")}`);
  return value;
}

const errors = [];
const facts = {};

for (const required of [SKILL_PATH, IDENTITY_PATH, ...BOOT_FILES]) {
  if (!existsSync(join(ROOT, required))) errors.push(`REQUIRED_PATH_MISSING:${required}`);
}

if (errors.length === 0) {
  const identityLines = read(IDENTITY_PATH)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"));

  if (identityLines.length !== 1) {
    errors.push(`IDENTITY_RECORD_COUNT_INVALID:${identityLines.length}`);
  } else {
    const match = identityLines[0].match(/^([0-9a-f]{40})\s+(.+)$/i);
    if (!match) {
      errors.push("IDENTITY_RECORD_INVALID");
    } else {
      const expectedBlob = match[1].toLowerCase();
      const declaredPath = match[2].trim();
      facts.expected_blob = expectedBlob;
      facts.declared_path = declaredPath;

      if (declaredPath !== SKILL_PATH) {
        errors.push(`IDENTITY_PATH_MISMATCH:${declaredPath}`);
      }

      try {
        const headBlob = git("rev-parse", `HEAD:${SKILL_PATH}`).toLowerCase();
        const worktreeBlob = git("hash-object", SKILL_PATH).toLowerCase();
        git("ls-files", "--error-unmatch", SKILL_PATH);
        git("ls-files", "--error-unmatch", IDENTITY_PATH);

        facts.head_blob = headBlob;
        facts.worktree_blob = worktreeBlob;

        if (expectedBlob !== headBlob) {
          errors.push(`IDENTITY_HEAD_MISMATCH:expected=${expectedBlob}:head=${headBlob}`);
        }
        if (expectedBlob !== worktreeBlob) {
          errors.push(`IDENTITY_WORKTREE_MISMATCH:expected=${expectedBlob}:worktree=${worktreeBlob}`);
        }
        if (headBlob !== worktreeBlob) {
          errors.push(`SKILL_HEAD_WORKTREE_DRIFT:head=${headBlob}:worktree=${worktreeBlob}`);
        }
      } catch (error) {
        errors.push(String(error.message || error));
      }
    }
  }

  for (const bootFile of BOOT_FILES) {
    const content = read(bootFile);
    if (!content.includes(`SKILL_IDENTITY_FILE: ${IDENTITY_PATH}`)) {
      errors.push(`BOOT_WITHOUT_IDENTITY_FILE:${bootFile}`);
    }
    if (/SKILL_COMMIT_SHA\s*:\s*[0-9a-f]{40}/i.test(content)) {
      errors.push(`BOOT_SHA_DUPLICATED:${bootFile}`);
    }
  }
}

const result = {
  guardrail: "validar-identidade-meta-lupa",
  skill_path: SKILL_PATH,
  identity_path: IDENTITY_PATH,
  boot_files: BOOT_FILES,
  facts,
  errors,
  ok: errors.length === 0,
};

if (JSON_OUT) {
  console.log(JSON.stringify(result, null, 2));
} else {
  for (const error of errors) console.error(`ERRO ${error}`);
  console.log(
    `META_LUPA_IDENTITY_OK=${result.ok ? 1 : 0} ` +
      `BOOT=${BOOT_FILES.length} ` +
      `EXPECTED=${facts.expected_blob || "UNKNOWN"} ` +
      `HEAD=${facts.head_blob || "UNKNOWN"} ` +
      `WORKTREE=${facts.worktree_blob || "UNKNOWN"} ` +
      `ERROS=${errors.length}`,
  );
}

process.exit(result.ok ? 0 : 1);
