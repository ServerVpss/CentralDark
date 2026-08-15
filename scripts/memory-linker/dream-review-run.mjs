#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  buildDreamProposal,
  validateDreamProposal,
  writeProposalIdempotent,
} from './dream-review.mjs';
import {
  enrichDreamProposal,
  validatePatternDiscovery,
} from './pattern-discovery.mjs';

export function buildDreamReviewWithPatterns(events, { headSha, parseRejections = [] } = {}) {
  const baseProposal = buildDreamProposal(events, { headSha, parseRejections });
  const baseValidation = validateDreamProposal(baseProposal);
  if (!baseValidation.ok) {
    throw new Error(`DREAM_PROPOSAL_INVALID=${baseValidation.errors.join(',')}`);
  }

  const enriched = enrichDreamProposal(baseProposal);
  const patternValidation = validatePatternDiscovery(enriched);
  if (!patternValidation.ok) {
    throw new Error(`PATTERN_DISCOVERY_INVALID=${patternValidation.errors.join(',')}`);
  }
  return enriched;
}

function parseArgs(argv) {
  const args = {};
  for (let index = 0; index < argv.length; index += 1) {
    const item = argv[index];
    if (!item.startsWith('--')) continue;
    args[item.slice(2)] = argv[index + 1];
    index += 1;
  }
  return args;
}

function loadJsonl(inputPath) {
  const events = [];
  const parseRejections = [];
  const lines = fs.readFileSync(inputPath, 'utf8').split(/\r?\n/);
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index].trim();
    if (!line) continue;
    try {
      events.push(JSON.parse(line));
    } catch {
      parseRejections.push({ index, reason: 'JSON_INVALID' });
    }
  }
  return { events, parseRejections };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.input || !args.output || !args.head) {
    throw new Error('USAGE: dream-review-run.mjs --input <events.jsonl> --output <proposal.json> --head <40-hex-sha>');
  }

  const inputPath = path.resolve(args.input);
  const outputPath = path.resolve(args.output);
  const { events, parseRejections } = loadJsonl(inputPath);
  const proposal = buildDreamReviewWithPatterns(events, { headSha: args.head, parseRejections });
  const writeStatus = writeProposalIdempotent(outputPath, proposal);
  const discovery = proposal.pattern_discovery;

  console.log(
    `DREAM_REVIEW_RUN=${proposal.status} HEAD_SHA=${proposal.head_sha} ` +
    `CANDIDATES=${proposal.candidate_count} PATTERNS=${discovery.pattern_count} ` +
    `AUTO_HANDOFF=${discovery.autonomy_handoff_eligible_count} DIRECT_APPLY=0 WRITE=${writeStatus}`,
  );
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (isMain) {
  main().catch((error) => {
    console.error(`DREAM_REVIEW_RUN_ERROR=${error.message}`);
    process.exitCode = 1;
  });
}
