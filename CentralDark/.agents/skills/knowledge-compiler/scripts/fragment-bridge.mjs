#!/usr/bin/env node

import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

export const CONNECTOR_STATES = Object.freeze([
  'UNKNOWN',
  'CONNECTED',
  'SYNCING',
  'SYNCED',
  'PARTIAL',
  'FAILED',
  'NOT_SYNCED',
]);

export function sha256(value) {
  const bytes = Buffer.isBuffer(value) ? value : Buffer.from(String(value), 'utf8');
  return crypto.createHash('sha256').update(bytes).digest('hex');
}

export function normalizeText(value) {
  return String(value ?? '')
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => line.replace(/[ \t]+$/g, ''))
    .join('\n')
    .trim();
}

function asNonNegativeInteger(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : fallback;
}

export function ingestSessionEnvelope(envelope, { sourceSha256 = null } = {}) {
  if (!envelope || typeof envelope !== 'object' || Array.isArray(envelope)) {
    throw new TypeError('SESSION_ENVELOPE_OBJECT_REQUIRED');
  }
  if (!Array.isArray(envelope.blocks)) {
    throw new TypeError('SESSION_ENVELOPE_BLOCKS_REQUIRED');
  }

  const firstByHash = new Map();
  const blocks = [];
  let droppedBlank = 0;
  let duplicateCount = 0;
  let thoughtMetadataOnly = 0;

  for (const raw of envelope.blocks) {
    const id = asNonNegativeInteger(raw?.id, blocks.length);
    const type = String(raw?.type ?? 'unknown').toLowerCase();
    const content = normalizeText(raw?.content ?? '');
    const declaredLength = asNonNegativeInteger(raw?.length, content.length);

    if (!content) {
      droppedBlank += 1;
      continue;
    }

    const contentSha256 = sha256(content);
    const duplicateOf = firstByHash.get(contentSha256) ?? null;
    if (duplicateOf === null) {
      firstByHash.set(contentSha256, id);
    } else {
      duplicateCount += 1;
    }

    if (type === 'thought') {
      thoughtMetadataOnly += 1;
      blocks.push({
        id,
        type,
        declared_length: declaredLength,
        content_sha256: contentSha256,
        duplicate_of: duplicateOf,
        metadata_only: true,
        canonical_content: false,
      });
      continue;
    }

    blocks.push({
      id,
      type,
      declared_length: declaredLength,
      content_sha256: contentSha256,
      duplicate_of: duplicateOf,
      metadata_only: false,
      canonical_content: duplicateOf === null,
      content: duplicateOf === null ? content : undefined,
    });
  }

  return {
    kind: 'SESSION_FRAGMENT_MANIFEST',
    state: 'CANDIDATE',
    provenance: {
      timestamp: envelope.timestamp ?? null,
      session_id: envelope.session_id ?? null,
      source: envelope.source ?? null,
      source_sha256: sourceSha256,
    },
    stats: {
      input_blocks: envelope.blocks.length,
      emitted_nonempty_blocks: blocks.length,
      unique_nonempty_hashes: firstByHash.size,
      duplicate_blocks: duplicateCount,
      dropped_blank_blocks: droppedBlank,
      thought_metadata_only_blocks: thoughtMetadataOnly,
    },
    blocks,
    route: [
      'HASH_PROVENANCE',
      'DEDUP_BY_HASH',
      'CLASSIFY',
      'KNOWLEDGE_COMPILER',
      'METACOGNICAO',
      'OWNER',
      'COUNTERPROOF',
      'CRYSTALLIZE',
    ],
    laws: {
      RAW_SESSION_IS_IMMUTABLE_INPUT: true,
      PRIVATE_OR_INTERMEDIATE_REASONING_IS_NOT_REQUIRED: true,
      DUPLICATE_IS_REFERENCE_NOT_SECOND_FACT: true,
      SOURCE_IS_PROVENANCE_NOT_AUTHORITY: true,
      UNKNOWN_IS_NOT_PASS: true,
    },
  };
}

const WEBMCP_PATTERNS = Object.freeze({
  IMPERATIVE_TOOL_REGISTRATION: /document\.modelContext\.registerTool\s*\(/,
  DECLARATIVE_TOOL_NAME: /\btoolname\b/,
  DECLARATIVE_TOOL_DESCRIPTION: /\btooldescription\b/,
  MODEL_CONTEXT: /\bModelContext\b/,
  SCRIPT_TOOL: /\bScriptTool\b/,
  SCRIPT_TOOL_HOST: /\bScriptToolHost\b/,
  APC: /Annotated Page Content|\bAPC\b/,
  CROSS_DOCUMENT_RESULT: /CrossDocumentScriptToolResult|cross-document/i,
  CANCELLATION: /CancelTool|AbortSignal|cancel/i,
  DEVTOOLS_EVENTS: /InspectorWebMCPAgent|WebMCPToolExecuted|WebMCPToolResponded|WebMCPToolFailed/,
  INPUT_SCHEMA: /inputSchema|input_schema|FormMCPSchema/,
});

export function scanWebMcpMaterial(text) {
  const source = String(text ?? '');
  const matches = Object.entries(WEBMCP_PATTERNS)
    .filter(([, regex]) => regex.test(source))
    .map(([id]) => id);

  return {
    kind: 'WEBMCP_CAPABILITY_SCAN',
    state: matches.length ? 'CANDIDATE' : 'UNKNOWN',
    matched_capabilities: matches,
    owner_route: {
      transport: 'docs/CONSCIENCIA/MCP-FLUXO.md',
      cognition: 'docs/CONSCIENCIA/METACOGNICAO-OPERACIONAL.md',
      compiler: '.agents/skills/knowledge-compiler/SKILL.md',
    },
    laws: {
      WEBMCP_IS_CAPABILITY_NOT_NEW_BRAIN: true,
      TOOL_DECLARATION_IS_NOT_TOOL_EXECUTION_PROOF: true,
      SOURCE_IS_PROVENANCE_NOT_AUTHORITY: true,
    },
  };
}

const BUNDLE_FEATURES = Object.freeze({
  CONNECTOR_TAXONOMY: /gmail_sync_connector|github_sync_connector|notion_sync_connector|slack_sync_connector/,
  CONNECTOR_SYNC_STATE_MACHINE: /Syncing|Synced|Partial sync|Sync failed|Not synced/,
  MEMORY_IN_SEARCH: /memory_in_search(?:_2)?/,
  FILE_LIBRARY_AUTO_REFERENCE: /file_library_auto_reference/,
  REMOTE_BROWSER_DATA: /enable_remote_browser_data/,
  CONVERSATION_CLASSIFIER: /enable_conversation_classifier/,
  GMAIL_CONNECTOR: /GMAIL_CONNECTOR|gmail_sync_connector/,
  GITHUB_CONNECTOR: /GITHUB_CONNECTOR|github_sync_connector/,
  NOTION_CONNECTOR: /NOTION_CONNECTOR|notion_sync_connector/,
  SLACK_CONNECTOR: /SLACK_CONNECTOR|slack_sync_connector/,
});

export function scanBundleFeatures(text) {
  const source = String(text ?? '');
  const matches = Object.entries(BUNDLE_FEATURES)
    .filter(([, regex]) => regex.test(source))
    .map(([id]) => id);

  return {
    kind: 'BUNDLE_FEATURE_SCAN',
    state: matches.length ? 'CANDIDATE' : 'UNKNOWN',
    matched_capabilities: matches,
    laws: {
      BUNDLE_SYMBOL_IS_NOT_RUNTIME_PROOF: true,
      BUNDLE_SYMBOL_IS_NOT_ENABLED_STATE: true,
      CONNECTED_IS_NOT_SYNCHRONIZED: true,
    },
  };
}

export function normalizeConnectorState(state) {
  const normalized = String(state ?? 'UNKNOWN').trim().toUpperCase().replace(/[ -]+/g, '_');
  const aliases = {
    NOTSYNCED: 'NOT_SYNCED',
    NOT_SYNCHRONIZED: 'NOT_SYNCED',
    SYNCHRONIZING: 'SYNCING',
    SYNCHRONIZED: 'SYNCED',
  };
  const candidate = aliases[normalized] ?? normalized;
  return CONNECTOR_STATES.includes(candidate) ? candidate : 'UNKNOWN';
}

export function connectorStateVerdict(state) {
  const normalized = normalizeConnectorState(state);
  return {
    state: normalized,
    pass: normalized === 'SYNCED',
    material_unknown: normalized === 'UNKNOWN',
    terminal_failure: normalized === 'FAILED',
    laws: {
      CONNECTED_IS_NOT_SYNCHRONIZED: true,
      SYNCING_IS_NOT_PASS: true,
      PARTIAL_IS_NOT_PASS: true,
      UNKNOWN_IS_NOT_PASS: true,
    },
  };
}

export function bridgeFile(filePath) {
  const bytes = fs.readFileSync(filePath);
  const sourceSha256 = sha256(bytes);
  const ext = path.extname(filePath).toLowerCase();

  if (ext === '.json') {
    const parsed = JSON.parse(bytes.toString('utf8'));
    if (Array.isArray(parsed?.blocks)) {
      return {
        provenance: { path: filePath, sha256: sourceSha256 },
        result: ingestSessionEnvelope(parsed, { sourceSha256 }),
      };
    }
  }

  const text = bytes.toString('utf8');
  const webmcp = scanWebMcpMaterial(text);
  const bundle = scanBundleFeatures(text);

  return {
    provenance: { path: filePath, sha256: sourceSha256 },
    result: {
      kind: 'TEXT_OR_BUNDLE_FRAGMENT',
      state: webmcp.state === 'CANDIDATE' || bundle.state === 'CANDIDATE' ? 'CANDIDATE' : 'UNKNOWN',
      webmcp,
      bundle,
      route: [
        'HASH_PROVENANCE',
        'EXTRACT_SYMBOLS',
        'CLASSIFY',
        'KNOWLEDGE_COMPILER',
        'SELECT_EXISTING_OWNER',
        'COUNTERPROOF',
      ],
    },
  };
}

export function selfTest() {
  const fixture = {
    timestamp: '2026-09-03T00:00:00.000Z',
    session_id: 'fixture-session',
    source: 'SELF_TEST',
    blocks: [
      { id: 0, type: 'text', content: 'ouro', length: 4 },
      { id: 1, type: 'text', content: 'ouro', length: 4 },
      { id: 2, type: 'text', content: '', length: 0 },
      { id: 3, type: 'thought', content: 'intermediate', length: 12 },
    ],
  };

  const session = ingestSessionEnvelope(fixture, { sourceSha256: sha256('fixture') });
  assert.equal(session.stats.input_blocks, 4);
  assert.equal(session.stats.unique_nonempty_hashes, 2);
  assert.equal(session.stats.duplicate_blocks, 1);
  assert.equal(session.stats.dropped_blank_blocks, 1);
  assert.equal(session.stats.thought_metadata_only_blocks, 1);
  assert.equal(session.blocks.find((block) => block.type === 'thought')?.content, undefined);

  const webmcp = scanWebMcpMaterial('document.modelContext.registerTool(() => {}); ModelContext ScriptToolHost APC');
  assert.equal(webmcp.state, 'CANDIDATE');
  assert(webmcp.matched_capabilities.includes('IMPERATIVE_TOOL_REGISTRATION'));
  assert(webmcp.matched_capabilities.includes('MODEL_CONTEXT'));

  const bundle = scanBundleFeatures('gmail_sync_connector file_library_auto_reference enable_remote_browser_data');
  assert.equal(bundle.state, 'CANDIDATE');
  assert(bundle.matched_capabilities.includes('CONNECTOR_TAXONOMY'));
  assert(bundle.matched_capabilities.includes('FILE_LIBRARY_AUTO_REFERENCE'));

  assert.equal(connectorStateVerdict('CONNECTED').pass, false);
  assert.equal(connectorStateVerdict('SYNCED').pass, true);
  assert.equal(connectorStateVerdict('PARTIAL').pass, false);
  assert.equal(connectorStateVerdict('weird').state, 'UNKNOWN');

  return {
    ok: true,
    tests: [
      'session_dedupe',
      'thought_metadata_only',
      'webmcp_capability_scan',
      'bundle_candidate_scan',
      'connector_state_fail_closed',
    ],
  };
}

function parseArgs(argv) {
  const out = { selfTest: false, input: null };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--self-test') out.selfTest = true;
    else if (arg === '--input') out.input = argv[++i] ?? null;
  }
  return out;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const args = parseArgs(process.argv.slice(2));
  try {
    if (args.selfTest) {
      process.stdout.write(`${JSON.stringify(selfTest())}\n`);
    } else if (args.input) {
      process.stdout.write(`${JSON.stringify(bridgeFile(args.input), null, 2)}\n`);
    } else {
      process.stderr.write('usage: fragment-bridge.mjs --self-test | --input PATH\n');
      process.exitCode = 2;
    }
  } catch (error) {
    process.stderr.write(`${error?.stack || error}\n`);
    process.exitCode = 1;
  }
}
