import { createHash } from 'node:crypto';

const META_TOOLS = new Set(['perception_orchestra', 'perception_gate']);
const CRITICAL_HANDLER_ACTIONS = new Set(['deploy', 'pm2', 'webhook']);
const MUTATING_HTTP_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

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
    return { mutating, critical: mutating && shellLooksCritical(command), kind: mutating ? 'SHELL_MUTATION' : 'SHELL_READ' };
  }
  return { mutating: false, critical: false, kind: 'READ_ONLY_OR_META' };
}

export function mutationScopeKey(ferramenta, args = {}) {
  const tool = text(ferramenta);
  if (tool === 'escrever_arquivo') return `file:${text(args.path).replace('/root/CentralDark/', '') || 'UNKNOWN'}`;
  if (tool === 'git') {
    const paths = Array.isArray(args.paths) ? args.paths.map(text).filter(Boolean).sort() : [];
    return `git:${text(args.acao || 'status').toLowerCase()}:${paths.join(',') || 'tracked'}`;
  }
  if (tool === 'aprender') return `learning:${text(args.categoria || 'geral').toLowerCase()}`;
  if (tool === 'handler') return `handler:${text(args.acao).toLowerCase()}:${text(args.url || args.nome || args.name || 'UNKNOWN')}`;
  if (tool === 'shell') return `shell:${digest(normalizeShell(args.comando))}`;
  return `${tool || 'unknown'}:${digest(args)}`;
}

function actionSignature(entry) {
  return `${text(entry?.ferramenta)}|${mutationScopeKey(entry?.ferramenta, entry?.args || {})}`;
}

function recentRealEntries(historico, limit = 4) {
  return (Array.isArray(historico) ? historico : [])
    .filter((entry) => !META_TOOLS.has(text(entry?.ferramenta)))
    .slice(-limit);
}

export function activePerceptionGate(historico) {
  const list = Array.isArray(historico) ? historico : [];
  for (let index = list.length - 1; index >= 0; index -= 1) {
    const entry = list[index];
    const tool = text(entry?.ferramenta);
    if (entry?.perception_gate) {
      return entry.perception_gate.consumed === true ? null : entry.perception_gate;
    }
    if (tool === 'perception_gate' || tool === 'notificar_progresso') continue;
    break;
  }
  return null;
}

export function evaluatePerceptionGate({ decisao, historico = [] }) {
  const ferramenta = decisao?.ferramenta;
  const args = decisao?.args || {};
  const mutation = classifyMaterialMutation(ferramenta, args);
  const scopeKey = mutationScopeKey(ferramenta, args);

  if (!mutation.mutating) {
    return Object.freeze({ status: 'NOT_REQUIRED_READ_ONLY', required: false, allow_mutation: true, scope_key: scopeKey, mutation });
  }

  const activeGate = activePerceptionGate(historico);
  if (activeGate) {
    if (activeGate.ready_for_writer !== true) {
      return Object.freeze({
        status: 'BLOCK_MUTATION_PENDING_DISCRIMINATING_EVIDENCE',
        required: false,
        allow_mutation: false,
        scope_key: scopeKey,
        mutation,
        active_gate: activeGate,
      });
    }
    if (activeGate.proposal_scope_key === scopeKey) {
      return Object.freeze({
        status: 'PASS_READY_PERCEPTION_GATE',
        required: false,
        allow_mutation: true,
        consume_gate: true,
        scope_key: scopeKey,
        mutation,
        active_gate: activeGate,
      });
    }
  }

  const estado = text(decisao?.estado).toUpperCase();
  const recent = recentRealEntries(historico);
  const recentFailure = recent.some((entry) => entry?.ok === false || text(entry?.critic) !== '');
  const signature = `${text(ferramenta)}|${scopeKey}`;
  const repeatedTarget = recent.some((entry) => actionSignature(entry) === signature);
  const uncertainState = estado !== 'FATO';
  const required = mutation.critical || uncertainState || recentFailure || repeatedTarget;

  return Object.freeze({
    status: required ? 'REQUIRE_FOUR_PERCEPTIONS' : 'NOT_REQUIRED_CLEAR_LOCAL',
    required,
    allow_mutation: !required,
    scope_key: scopeKey,
    mutation,
    triggers: Object.freeze({
      critical: mutation.critical,
      uncertain_state: uncertainState,
      recent_failure_or_critic: recentFailure,
      repeated_mutation_target: repeatedTarget,
    }),
  });
}

export const PERCEPTION_GATE_INVARIANTS = Object.freeze({
  PARALLELIZE_PERCEPTION: true,
  SERIALIZE_MUTATION: true,
  CRITICAL_MUTATION_REQUIRES_PERCEPTION: true,
  TEST_STATE_CANNOT_MUTATE_WITHOUT_PERCEPTION: true,
  FAILED_OR_CRITIC_REJECTED_PATH_REQUIRES_PERCEPTION: true,
  REPEATED_MUTATION_TARGET_REQUIRES_PERCEPTION: true,
  READY_GATE_IS_SINGLE_USE: true,
});
