#!/usr/bin/env node

import { appendFile, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const CANONICAL_AUTHORITY_LABEL = "permito-segredo";

export function authorityApprovalForEvent(event = {}) {
  const labels = new Set(
    (event.pull_request?.labels || []).map((label) =>
      String(label?.name || label || "").toLowerCase(),
    ),
  );
  const approved = labels.has(CANONICAL_AUTHORITY_LABEL);
  return {
    approved,
    authority: approved ? "SEGREDO/CHEFE" : null,
    source: approved ? `github-label:${CANONICAL_AUTHORITY_LABEL}` : "none",
  };
}

export async function main(env = process.env) {
  const eventPath = env.GITHUB_EVENT_PATH;
  const event = eventPath
    ? JSON.parse(await readFile(eventPath, "utf8"))
    : {};
  const result = authorityApprovalForEvent(event);

  if (env.GITHUB_OUTPUT) {
    await appendFile(
      env.GITHUB_OUTPUT,
      `approved=${result.approved}\nauthority=${result.authority || "NONE"}\nsource=${result.source}\n`,
      "utf8",
    );
  }

  console.log(
    `AUTHORITY_APPROVED=${result.approved} AUTHORITY=${result.authority || "NONE"} SOURCE=${result.source}`,
  );
  return result;
}

const isMain = process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMain) {
  main().catch((error) => {
    console.error(`AUTHORITY_APPROVAL_ERROR=${error?.message || error}`);
    process.exitCode = 1;
  });
}
