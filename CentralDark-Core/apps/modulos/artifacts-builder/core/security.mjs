// 🔐 Sanitização e classificação de caminho sensível para artefatos.
//
// Portado (não reescrito do zero) de `scripts/lupa/pr-learning-artifact.mjs`
// (PR #668, ainda Draft) — funções puras, sem I/O, já cobertas por 19 testes
// naquele PR. Reaproveitadas aqui em vez de duplicadas conforme a delta
// "ARTEFATO UNIVERSAL CENTRALDARK" postada em #668 pelo SEGREDO/CHEFE:
// preservar o ouro provado, reconciliar no artifacts-builder, nunca manter
// duas implementações da mesma responsabilidade.

/** Sanitiza texto não confiável antes de embutir em um artefato: redige
 * segredos comuns (tokens GitHub/Bearer/JWT/provider/bot, chaves privadas,
 * pares chave=valor sensíveis) e neutraliza HTML/@-menção injetável. */
export function sanitizeText(value, maxLength = 12000) {
  let text = String(value ?? '').slice(0, maxLength);
  const patterns = [
    [/\bgithub_pat_[A-Za-z0-9_]{20,}\b/gi, '[REDACTED_GITHUB_TOKEN]'],
    [/\bBearer\s+[A-Za-z0-9._~+/=-]{12,}/gi, 'Bearer [REDACTED]'],
    [/\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{5,}\.[A-Za-z0-9_-]{5,}\b/g, '[REDACTED_JWT]'],
    [/\bgh[pousr]_[A-Za-z0-9_]{20,}\b/g, '[REDACTED_GITHUB_TOKEN]'],
    [/\bsk-[A-Za-z0-9_-]{16,}\b/g, '[REDACTED_PROVIDER_KEY]'],
    [/\b\d{8,12}:[A-Za-z0-9_-]{30,}\b/g, '[REDACTED_BOT_TOKEN]'],
    [/(-----BEGIN [A-Z0-9 ]*PRIVATE KEY-----)[\s\S]*?(-----END [A-Z0-9 ]*PRIVATE KEY-----)/gi, '[REDACTED_PRIVATE_KEY]'],
    [/(api[_-]?key|secret|password|passwd|token)\s*[:=]\s*["']?[A-Za-z0-9._~+/=-]{16,}/gi, '$1=[REDACTED]'],
  ];
  for (const [pattern, replacement] of patterns) text = text.replace(pattern, replacement);
  return text.replaceAll('@', '@​').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

const SENSITIVE_PATH = /(^|\/)(\.env(?:\.|$)|secrets?(\/|$)|tokens?(\/|$)|sessions?(\/|$)|\.ssh(\/|$)|[^/]+\.(pem|key)$)/i;

/** Um único caminho é sensível? Fail-closed: qualquer incerteza vira `true`. */
export function isSensitivePath(pathname) {
  return SENSITIVE_PATH.test(String(pathname ?? ''));
}

/** Classifica uma lista de referências de arquivo (evidências, source_refs)
 * sem abrir o conteúdo — só o nome do caminho. Espelha `classifyFiles` de
 * `pr-learning-artifact.mjs`, generalizado de "arquivo de PR" para
 * "qualquer source_ref de artefato". */
export function classifyPaths(paths = []) {
  const categories = { workflows: 0, docs: 0, tests: 0, code: 0, sensitive_paths: 0 };
  for (const raw of paths) {
    const name = String(raw ?? '');
    if (isSensitivePath(name)) { categories.sensitive_paths++; continue; }
    if (name.startsWith('.github/workflows/')) categories.workflows++;
    else if (name.startsWith('docs/') || /\.md$/i.test(name)) categories.docs++;
    else if (/(^|\/)(test|tests|__tests__)(\/|$)|\.(test|spec)\.[cm]?[jt]sx?$/i.test(name)) categories.tests++;
    else categories.code++;
  }
  return categories;
}
