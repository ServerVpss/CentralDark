/**
 * Aplica strategy do cadeia.json sobre a lista de modelos darkai.
 * priority = ordem do array (default)
 * cost = cost_weight asc, depois timeout
 * latency = timeout_ms asc
 * round_robin = rotaciona início por minuto
 */
export function applyRoutingStrategy(models, strategy = 'priority') {
  if (!Array.isArray(models) || models.length === 0) return models;
  const s = String(strategy || 'priority').toLowerCase();
  const copy = models.map((m, i) => ({ ...m, _i: i }));

  if (s === 'cost') {
    copy.sort((a, b) => {
      const ca = a.cost_weight ?? 50;
      const cb = b.cost_weight ?? 50;
      if (ca !== cb) return ca - cb;
      return (a.timeout_ms || 30000) - (b.timeout_ms || 30000);
    });
  } else if (s === 'latency') {
    copy.sort((a, b) => (a.timeout_ms || 30000) - (b.timeout_ms || 30000));
  } else if (s === 'round_robin') {
    const n = copy.length;
    const offset = Math.floor(Date.now() / 60_000) % n;
    return [...copy.slice(offset), ...copy.slice(0, offset)].map(({ _i, ...rest }) => rest);
  }
  // priority: keep order
  return copy.map(({ _i, ...rest }) => rest);
}

/**
 * Resolve o modo Hermes para o contrato model-agnostic da PR #1804.
 * Reutiliza o roteador existente: receita provada roda no typed core; IA
 * entra somente sob demanda quando regra determinística não cobre o evento.
 */
export function resolveHermesExecutionMode(event = {}) {
  const input = event && typeof event === 'object' ? event : {};
  const alias = String(input.command || input.alias || '').trim().toLowerCase();
  const intelligenceAliases = new Set(['/intelligence', '/oraculo', '/sol', '/analisa', '/decide', '/meta', '/contraprova']);
  const hasProvenRecipe = input.proven_recipe === true || input.recipe_status === 'PROVEN' || input.recipe_status === 'PASS';
  const machineResolvable = input.machine_resolvable === true || input.ambiguity === 'MACHINE_RESOLVABLE';
  const reasoningRequired = input.reasoning_required === true || input.recipe_status === 'MISSING' || input.recipe_status === 'UNKNOWN' || intelligenceAliases.has(alias);
  const liveOrgan = input.live_organ_mutation === true;

  if (reasoningRequired && !hasProvenRecipe && !machineResolvable) {
    return {
      mode: 'HERMES_INTELLIGENCE_MODE',
      requires_ai: true,
      action: 'CALL_ORACLE_OR_LOCAL_MODEL',
      gate_required: liveOrgan,
      owner_required: liveOrgan,
      receipt_required: true,
    };
  }

  return {
    mode: 'HERMES_TYPED_CORE',
    requires_ai: false,
    action: machineResolvable && !hasProvenRecipe ? 'MEASURE_AND_CONTINUE' : 'RUN_PROVEN_RECIPE',
    gate_required: liveOrgan,
    owner_required: liveOrgan,
    receipt_required: true,
  };
}
