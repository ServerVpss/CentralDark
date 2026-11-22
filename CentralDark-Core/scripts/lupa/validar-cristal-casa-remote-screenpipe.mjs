#!/usr/bin/env node

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const target = resolve(process.argv[2] || 'docs/HANDOFF/2026-09-09-centraldark-casa-remote-screenpipe-cristal-full.json');
const raw = readFileSync(target, 'utf8');
const crystal = JSON.parse(raw);
const errors = [];

const requireTrue = (field) => {
  if (crystal[field] !== true) errors.push(`EXPECTED_TRUE:${field}`);
};

for (const field of [
  'canonical_lineage_only',
  'object_evolves_in_same_body',
  'domain_expansion_reuses_canonical_body',
  'domain_expansion_is_not_parallel_architecture',
  'reuse_before_create',
  'one_system_only',
  'one_writer_per_scope',
  'zero_regression_required',
  'unknown_is_not_pass',
  'action_is_not_proof',
  'sensor_failure_does_not_erase_durable_fact',
  'process_alive_is_not_device_online',
  'vnc_is_view_control_not_runtime_proof',
  'expected_operator_action_changes_signal_classification'
]) requireTrue(field);

if (crystal.parallel_architecture_as_shortcut !== 'FORBIDDEN') errors.push('PARALLEL_ARCHITECTURE_NOT_FORBIDDEN');
if (crystal.parallel_owner_by_numbered_name !== 'FORBIDDEN') errors.push('NUMBERED_PARALLEL_OWNER_NOT_FORBIDDEN');
if (crystal.rename_to_fake_evolution !== 'FORBIDDEN') errors.push('FAKE_EVOLUTION_RENAME_NOT_FORBIDDEN');

const operator = crystal.expected_operator_action_policy || {};
if (operator.during_explicit_restart_or_reconfiguration !== 'YELLOW_EXPECTED_TRANSIENT') {
  errors.push('EXPECTED_OPERATOR_ACTION_NOT_YELLOW');
}
if (operator.do_not_open_incident_solely_from_expected_short_outage !== true) {
  errors.push('EXPECTED_TRANSIENT_CAN_OPEN_FALSE_INCIDENT');
}

const routes = crystal.access_routes || {};
for (const route of ['remote_desktop_mcp', 'powershell_remoting', 'vscode_ssh', 'vps_mcp']) {
  if (!routes[route]) errors.push(`ACCESS_ROUTE_MISSING:${route}`);
}

if (crystal.remote_tray?.same_body_extension !== true) errors.push('REMOTE_TRAY_NOT_SAME_BODY');
if (crystal.screenpipe?.not_brain !== true) errors.push('SCREENPIPE_BECAME_BRAIN');
if (crystal.screenpipe?.not_writer !== true) errors.push('SCREENPIPE_BECAME_WRITER');
if (crystal.screenpipe?.not_judge !== true) errors.push('SCREENPIPE_BECAME_JUDGE');
if (crystal.wo_mic?.screenpipe_local_port_collision !== false) errors.push('FALSE_LOCAL_PORT_COLLISION');
if (crystal.obsidian?.github_remains_technical_source_of_truth !== true) errors.push('OBSIDIAN_REPLACED_GITHUB_AUTHORITY');
if (crystal.agents?.parallel_perception !== true) errors.push('PARALLEL_PERCEPTION_DISABLED');
if (crystal.agents?.parallel_mutation_same_scope !== false) errors.push('PARALLEL_MUTATION_ALLOWED');

const currentClaims = new Set(crystal.temporal_edges_requiring_remeasurement || []);
for (const edge of [
  'REMOTE_DEVICE_ONLINE_NOW',
  'SCREENPIPE_3030_LISTENING_NOW',
  'SCREENPIPE_AUDIO_INPUT_BOUND_NOW',
  'VOICE_TO_INTENT_TO_ROUTER_TO_RECEIPT_NOW',
  'CENTRALDARK_EXE_RUNNING_NOW',
  'VPS_DEPLOYED_SHA_NOW'
]) {
  if (!currentClaims.has(edge)) errors.push(`TEMPORAL_EDGE_NOT_REMEASURED:${edge}`);
}

const notProven = new Set(crystal.not_proven || []);
for (const claim of [
  'APP_READY_END_TO_END',
  'VOICE_FOLLOWS_INTENT_END_TO_END',
  'GLOBAL_FIXED_POINT'
]) {
  if (!notProven.has(claim)) errors.push(`FALSE_GREEN_RISK:${claim}`);
}

const forbiddenLineagePattern = /(^|[-_.])v\d+($|[-_.])/i;
const walk = (value, path = '$') => {
  if (Array.isArray(value)) return value.forEach((item, index) => walk(item, `${path}[${index}]`));
  if (value && typeof value === 'object') {
    for (const [key, item] of Object.entries(value)) {
      if (key === 'schema_version') errors.push(`NUMBERED_SCHEMA_KEY_FORBIDDEN:${path}.${key}`);
      if (forbiddenLineagePattern.test(key)) errors.push(`NUMBERED_LINEAGE_KEY_FORBIDDEN:${path}.${key}`);
      walk(item, `${path}.${key}`);
    }
    return;
  }
  if (typeof value === 'string' && forbiddenLineagePattern.test(value)) {
    errors.push(`NUMBERED_LINEAGE_VALUE_FORBIDDEN:${path}`);
  }
};
walk(crystal);

if (!String(crystal.next_cursor || '').includes('REMEASURE_FIRST_MUTABLE_EDGE_ONLY')) errors.push('NEXT_CURSOR_NOT_ANTI_HAMSTER');

const result = {
  ok: errors.length === 0,
  target,
  checks: 31,
  errors
};

process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
process.exit(result.ok ? 0 : 1);
