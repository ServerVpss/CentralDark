#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";

const repo = process.cwd();
const run = (args) => execFileSync("git", ["-C", repo, "-c", "safe.directory=E:/CentralDark", ...args], { encoding: "utf8" }).trim();
const staged = run(["diff", "--cached", "--name-only", "--diff-filter=ACMR"]).split(/\r?\n/).filter(Boolean);

if (staged.length === 0) {
  console.log("CENTRALDARK_CONTRACT=NO_CHANGE");
  process.exit(0);
}

const secretPattern = /(^|\/)(\.env(\..*)?|secrets\/|.*\.pem$|.*\.key$|.*credentials.*|CREDENCIAIS-TEMP)/i;
const forbidden = staged.filter((file) => secretPattern.test(file));
if (forbidden.length) {
  console.error("CENTRALDARK_CONTRACT=FAIL_SECRET_PATH");
  console.error(forbidden.join("\n"));
  process.exit(1);
}

const receipt = staged.find((file) => /^docs\/CONSCIENCIA\/RECEIPTS\/[^/]+\.md$/.test(file));
const onlyMeta = staged.every((file) => file.startsWith("docs/CONSCIENCIA/RECEIPTS/") || file === "CHANGELOG.md");
if (!receipt && !onlyMeta) {
  console.error("CENTRALDARK_CONTRACT=FAIL_RECEIPT_MISSING");
  console.error("Toda mudança precisa incluir docs/CONSCIENCIA/RECEIPTS/<id>.md");
  process.exit(1);
}

if (receipt) {
  const content = readFileSync(receipt, "utf8");
  const required = ["OBJETIVO", "ESTADO_INICIAL", "ACAO", "PROVA", "CONTRAPROVA", "RESULTADO", "PROXIMO_PASSO"];
  const missing = required.filter((field) => !new RegExp(`^${field}=`, "m").test(content));
  if (missing.length) {
    console.error(`CENTRALDARK_CONTRACT=FAIL_RECEIPT_INCOMPLETE ${missing.join(",")}`);
    process.exit(1);
  }
}

console.log(`CENTRALDARK_CONTRACT=PASS files=${staged.length} receipt=${receipt ?? "not-required"}`);
