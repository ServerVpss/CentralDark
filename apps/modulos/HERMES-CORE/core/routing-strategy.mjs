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
