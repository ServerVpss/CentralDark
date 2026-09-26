# COMANDO - perception-policy.mjs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\apps\modulos\HERMES-CORE\core\perception-policy.mjs
**SHA:** 42148d21c71188fc
**Timestamp:** 2026-08-28T02:56:26.563021
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const start = raw.indexOf('{');

### Contratos
- const gate = gateFromHistoryEntry(entry);
- const activeGate = activePerceptionGate(historico);
- active_gate: activeGate,
- consume_gate: true,
- active_gate: activeGate,
- active_gate: activeGate,

### Ouro Bruto (primeiros 5000 chars)
```
import { createHash } from 'node:crypto';

const META_TOOLS = new Set(['perception_orchestra', 'perception_gate']);
const CRITICAL_HANDLER_ACTIONS = new Set(['deploy', 'pm2', 'webhook']);
const MUTATING_HTTP_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);
const PERCEPTION_COMMAND = 'apps/modulos/HERMES-CORE/core/perception-orchestra.mjs';

function text(value) {
  return String(value ?? '').trim();
}

function stable(value) {
  if (Array.isArray(value)) return `[${value.map(stable).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stable(value[key])}`).join(',')}}`;
  }
  return JSON.stringify(value);
}

function digest(value) {
  return createHash('sha256').update(stable(value)).digest('hex').slice(0, 20);
}

function normalizeShell(command) {
  return text(command).replace(/\s+/g, ' ');
}

function shellLooksMutating(command) {
  const cmd = normalizeShell(command);
  if (!cmd) return false;
  return [
    /(^|[;&|]\s*)\s*(rm|mv|cp|mkdir|touch|chmod|chown|ln)\b/i,
    /\bsed\s+-[^\n;]*i\b/i,
    /\btee\b/i,
    /(^|[^>])>{1,2}(?!>)/,
    /\bgit\s+(add|commit|push|merge|rebase|reset|checkout|switch|cherry-pick|revert)\b/i,
    /\b(npm|pnpm|yarn)\s+(install|add|remove|uninstall|update|upgrade)\b/i,
    /\b(pm2|systemctl)\s+(start|stop|restart|reload|delete|enable|disable)\b/i,
    /\bdocker\s+(compose\s+)?(up|down|restart|rm|run|exec)\b/i,
    /\bcurl\b[^\n]*(--request|-X)\s*(POST|PUT|PATCH|DELETE)\b/i,
  ].some((rx) => rx.test(cmd));
}

function shellLooksCritical(command) {
  const cmd = normalizeShell(command);
  return [
    /\bgit\s+(push|merge|rebase|reset|cherry-pick|revert)\b/i,
    /\b(pm2|systemctl)\s+(start|stop|restart|reload|delete|enable|disable)\b/i,
    /\bdocker\s+(compose\s+)?(up|down|restart|rm|run)\b/i,
    /\bcurl\b[^\n]*(--request|-X)\s*(POST|PUT|PATCH|DELETE)\b/i,
  ].some((rx) => rx.test(cmd));
}

function parsePacketFromResult(value) {
  const raw = text(value);
  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  if (start < 0 || end < start) return null;
  try {
    const parsed = JSON.parse(raw.slice(start, end + 1));
    return parsed && parsed.mode === 'PARALLEL_PERCEPTION_SERIAL_MUTATION' ? parsed : null;
  } catch {
    return null;
  }
}

function perceptionScopeFromCommand(command) {
  const raw = String(command || '');
  const quoted = raw.match(/HERMES_PERCEPTION_SCOPE_KEY='([^']*)'/);
  if (quoted) return quoted[1].replace(/'\\''/g, "'");
  const bare = raw.match(/HERMES_PERCEPTION_SCOPE_KEY=([^\s]+)/);
  return bare ? bare[1] : null;
}

function gateFromHistoryEntry(entry) {
  if (entry?.perception_gate) return entry.perception_gate.consumed === true ? null : entry.perception_gate;
  if (entry?.ferramenta !== 'shell') return null;
  const command = String(entry.args?.comando || '');
  if (!command.includes(PERCEPTION_COMMAND)) return null;
  const packet = parsePacketFromResult(entry.resultado);
  if (!packet) {
    return {
      ready_for_writer: false,
      proposal_scope_key: perceptionScopeFromCommand(command),
      next_rule: 'PERCEPTION_RECEIPT_UNPARSEABLE',
      discriminating_tests: [],
      all_four_completed: false,
      unproven_roles: [],
    };
  }
  return {
    ready_for_writer: packet.ready_for_writer === true,
    proposal_scope_key: perceptionScopeFromCommand(command),
    next_rule: packet.next_rule || 'UNKNOWN',
    discriminating_tests: packet.evidence_confrontation?.discriminating_tests || [],
    all_four_completed: packet.evidence_confrontation?.all_four_completed === true,
    unproven_roles: packet.evidence_confrontation?.unproven_roles || [],
    effective_independent_count: packet.evidence_confrontation?.effective_independent_count ?? 0,
    material_findings: Array.isArray(packet.material_findings) ? packet.material_findings.length : 0,
  };
}

export function classifyMaterialMutation(ferramenta, args = {}) {
  const tool = text(ferramenta);
  if (tool === 'escrever_arquivo') return { mutating: true, critical: false, kind: 'FILE_WRITE' };
  if (tool === 'aprender') return { mutating: true, critical: true, kind: 'CRYSTALLIZE_LEARNING' };
  if (tool === 'git') {
    const action = text(args.acao || 'status').toLowerCase();
    return action === 'commit_push'
      ? { mutating: true, critical: true, kind: 'GIT_PROMOTION' }
      : { mutating: false, critical: false, kind: 'GIT_READ' };
  }
  if (tool === 'handler') {
    const action = text(args.acao).toLowerCase();
    const method = text(args.metodo || args.method || 'GET').toUpperCase();
    const mutatingHttp = action === 'http' && MUTATING_HTTP_METHODS.has(method);
    const critical = CRITICAL_HANDLER_ACTIONS.has(action) || mutatingHttp;
    return { mutating: critical, critical, kind: critical ? 'EXTERNAL_MUTATION' : 'HANDLER_READ' };
  }
  if (tool === 'shell') {
    const command = args.comando || '';
    const mutating = shellLooksMutating(command);
    return { mut
```