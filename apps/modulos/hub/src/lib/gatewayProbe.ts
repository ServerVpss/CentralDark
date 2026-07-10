// apps/modulos/hub/src/lib/gatewayProbe.ts
// Testa a conectividade do gateway CentralDark exibindo AS URLs testadas + status.
// NUNCA imprime token/segredo. NUNCA imprime Authorization. Só devolve status/latência.

export type ProbeResult = {
  url: string;                   // URL testada (sem token, sem query)
  method: 'GET';
  status: number | null;         // 200, 401, 404, ... (null se falhou antes de resposta)
  latencyMs: number | null;
  ok: boolean;                   // status entre 200-299
  errorSanitized: string | null; // mensagem já sanitizada (sem chave)
};

export type ProbeSummary = {
  results: ProbeResult[];
  overall: 'OK' | 'DEGRADED' | 'OFF' | 'UNKNOWN';
  testedAt: string;
};

// Redator: garante que nenhum segredo apareça no output antes de renderizar
export function redact(input: string): string {
  if (typeof input !== 'string') return String(input);
  return input
    .replace(/Bearer\s+[A-Za-z0-9._\-]+/gi, 'Bearer <REDACTED>')
    .replace(/cdk_live_[A-Za-z0-9._\-]{6,}/g, 'cdk_live_<REDACTED>')
    .replace(/sk-[A-Za-z0-9._\-]{6,}/g, 'sk-<REDACTED>')
    .replace(/eyJ[A-Za-z0-9._\-]{20,}/g, '<JWT-REDACTED>')
    .slice(0, 240);
}

function joinPath(base: string, path: string): string {
  const b = base.replace(/\/+$/, '');
  const p = path.startsWith('/') ? path : `/${path}`;
  return b + p;
}

/**
 * Prova o mesmo endpoint em duas formas (sem barra final + com barra final)
 * pra provar que o server normaliza. Aceita esquema de auth via `authScheme`:
 *   - 'none'      → sem header (descoberta pública)
 *   - 'x-api-key' → header x-api-key
 *   - 'bearer'    → header Authorization: Bearer <chave>
 *
 * A `apiKey` NUNCA é retornada, logada ou exposta na saída — só usada no fetch.
 */
export async function probeEndpoint(
  base: string,
  path: string,
  opts: { apiKey?: string; authScheme?: 'none' | 'x-api-key' | 'bearer'; timeoutMs?: number } = {}
): Promise<ProbeSummary> {
  const authScheme = opts.authScheme ?? 'none';
  const timeoutMs = opts.timeoutMs ?? 8000;
  const headers: Record<string, string> = { 'accept': 'application/json' };
  if (authScheme === 'x-api-key' && opts.apiKey) headers['x-api-key'] = opts.apiKey;
  if (authScheme === 'bearer' && opts.apiKey) headers['authorization'] = `Bearer ${opts.apiKey}`;

  const variants = [
    joinPath(base, path).replace(/\/+$/, ''),        // sem barra final
    joinPath(base, path).replace(/\/+$/, '') + '/',  // com barra final
  ];

  const results: ProbeResult[] = [];
  for (const url of variants) {
    const t0 = performance.now();
    let status: number | null = null;
    let ok = false;
    let errorSanitized: string | null = null;
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), timeoutMs);
      const r = await fetch(url, { method: 'GET', headers, signal: ctrl.signal });
      clearTimeout(timer);
      status = r.status;
      ok = r.ok;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      errorSanitized = redact(msg);
    }
    const latencyMs = Math.round(performance.now() - t0);
    results.push({ url: redact(url), method: 'GET', status, latencyMs, ok, errorSanitized });
  }

  // Overall: OK se ambos 2xx; DEGRADED se pelo menos um 2xx; OFF se todos falharam sem status; UNKNOWN caso 4xx/5xx nos dois
  const okCount = results.filter(r => r.ok).length;
  const failedNoStatus = results.filter(r => r.status === null).length;
  let overall: ProbeSummary['overall'] = 'UNKNOWN';
  if (okCount === results.length) overall = 'OK';
  else if (okCount > 0) overall = 'DEGRADED';
  else if (failedNoStatus === results.length) overall = 'OFF';

  return { results, overall, testedAt: new Date().toISOString() };
}

/** Formata resumo pra render (Markdown-friendly, sem segredos). */
export function formatProbeSummary(summary: ProbeSummary): string {
  const emoji = (s: number | null) => {
    if (s === null) return '⚫';
    if (s >= 200 && s < 300) return '🟢';
    if (s >= 400 && s < 500) return '🟡';
    return '🔴';
  };
  const lines = summary.results.map(
    (r) => `${emoji(r.status)} ${r.url} → ${r.status ?? 'sem resposta'} (${r.latencyMs ?? '-'}ms)${r.errorSanitized ? ` · erro: ${r.errorSanitized}` : ''}`
  );
  lines.push('');
  lines.push(`Status geral: **${summary.overall}** · testado em ${summary.testedAt}`);
  return lines.join('\n');
}
