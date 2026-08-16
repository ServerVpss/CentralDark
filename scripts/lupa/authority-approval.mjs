#!/usr/bin/env node

import { appendFile, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const CANONICAL_AUTHORITY_LABEL = "👑 PERMITO-SEGREDO";
export const CANONICAL_AUTHORITY_SOURCE = "github-label:permito-segredo";
export const DERIVED_AUTHORITY_SOURCE = "github-label:auto-derived-from-intent";
export const FAST_MERGE_POLICY = "AUTO_SQUASH_IF_CLEAN";

function foldLabelName(value) {
  return String(value?.name || value || "")
    .trim()
    .toLocaleLowerCase("pt-BR");
}

function lineMarker(body, name) {
  const match = String(body || "").match(new RegExp(`^${name}:\\s*(.+?)\\s*$`, "mi"));
  return match?.[1]?.trim() || null;
}

function trustedAuthorsFrom(value) {
  const items = Array.isArray(value)
    ? value
    : String(value || "segredounlock").split(",");
  return new Set(items.map((item) => String(item).trim().toLocaleLowerCase("en-US")).filter(Boolean));
}

export function canonicalAuthorityLabel(value) {
  const folded = foldLabelName(value);
  if (folded === "permito-segredo" || folded === "👑 permito-segredo") {
    return CANONICAL_AUTHORITY_LABEL;
  }
  return String(value?.name || value || "").trim();
}

export function intentReceiptForEvent(event = {}, { trustedAuthors = ["segredounlock"], repository = null } = {}) {
  const pr = event.pull_request || {};
  const body = String(pr.body || "");
  const authority = lineMarker(body, "Intent-Authorized");
  const mergePolicy = lineMarker(body, "Merge-Policy");
  const intentScope = lineMarker(body, "Intent-Scope");
  const writer = lineMarker(body, "Writer");
  const writerScope = lineMarker(body, "Writer-Scope");
  const author = String(pr.user?.login || "").toLocaleLowerCase("en-US");
  const trusted = trustedAuthorsFrom(trustedAuthors).has(author);
  const headRepo = pr.head?.repo?.full_name || null;
  const baseRepo = pr.base?.repo?.full_name || null;
  const sameRepository = Boolean(headRepo && baseRepo && headRepo === baseRepo && (!repository || headRepo === repository));
  const valid = authority === "SEGREDO/CHEFE"
    && mergePolicy === FAST_MERGE_POLICY
    && Boolean(intentScope)
    && Boolean(writer)
    && Boolean(writerScope)
    && trusted
    && sameRepository;

  return {
    valid,
    authority,
    mergePolicy,
    intentScope,
    writer,
    writerScope,
    author: pr.user?.login || null,
    trusted,
    sameRepository,
  };
}

export function authorityApprovalForEvent(event = {}, options = {}) {
  const labels = new Set(
    (event.pull_request?.labels || []).map((label) => canonicalAuthorityLabel(label)),
  );
  const approved = labels.has(CANONICAL_AUTHORITY_LABEL);
  const intent = intentReceiptForEvent(event, options);
  return {
    approved,
    authority: approved ? "SEGREDO/CHEFE" : null,
    source: approved ? CANONICAL_AUTHORITY_SOURCE : "none",
    derivable: !approved && intent.valid,
    intent,
  };
}

export async function materializeDerivedAuthorityLabel(event, env = process.env, fetchImpl = fetch) {
  const repository = env.GITHUB_REPOSITORY || "";
  const token = env.GITHUB_TOKEN || "";
  const number = Number(event.pull_request?.number || 0);
  const intent = intentReceiptForEvent(event, {
    trustedAuthors: env.BOT_TRUSTED_AUTHORS || "segredounlock",
    repository,
  });

  if (!intent.valid) throw new Error("DERIVED_AUTHORITY_INTENT_INVALID");
  if (!repository || !token || !Number.isInteger(number) || number <= 0) {
    throw new Error("DERIVED_AUTHORITY_MATERIALIZATION_UNAVAILABLE");
  }

  const response = await fetchImpl(`https://api.github.com/repos/${repository}/issues/${number}/labels`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
      "User-Agent": "centraldark-authority-approval/1.0",
    },
    body: JSON.stringify({ labels: [CANONICAL_AUTHORITY_LABEL] }),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`DERIVED_AUTHORITY_LABEL_FAILED:${response.status}:${text.slice(0, 300)}`);
  }

  const labels = await response.json();
  const verified = Array.isArray(labels)
    && labels.some((label) => canonicalAuthorityLabel(label) === CANONICAL_AUTHORITY_LABEL);
  if (!verified) throw new Error("DERIVED_AUTHORITY_LABEL_NOT_VERIFIED");

  return {
    approved: true,
    authority: "SEGREDO/CHEFE",
    source: DERIVED_AUTHORITY_SOURCE,
    derivable: false,
    derived: true,
    intent,
  };
}

export async function main(env = process.env) {
  const eventPath = env.GITHUB_EVENT_PATH;
  const event = eventPath
    ? JSON.parse(await readFile(eventPath, "utf8"))
    : {};
  const options = {
    trustedAuthors: env.BOT_TRUSTED_AUTHORS || "segredounlock",
    repository: env.GITHUB_REPOSITORY || null,
  };
  let result = authorityApprovalForEvent(event, options);

  if (!result.approved && result.derivable) {
    result = await materializeDerivedAuthorityLabel(event, env);
  }

  if (env.GITHUB_OUTPUT) {
    await appendFile(
      env.GITHUB_OUTPUT,
      `approved=${result.approved}\nauthority=${result.authority || "NONE"}\nsource=${result.source}\nderived=${result.derived === true}\n`,
      "utf8",
    );
  }

  console.log(
    `AUTHORITY_APPROVED=${result.approved} AUTHORITY=${result.authority || "NONE"} SOURCE=${result.source} DERIVED=${result.derived === true}`,
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
