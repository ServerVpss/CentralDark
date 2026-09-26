import { sanitizeText } from "./sanitize.mjs";

/**
 * LEIGO: junta endereço base e rota sem criar barras duplicadas.
 * PROFISSIONAL: normaliza URL absoluta e path HTTP com validação de protocolo.
 */
export function buildEndpoint(baseUrl, routePath) {
  const base = new URL(String(baseUrl));
  if (!["http:", "https:"].includes(base.protocol)) throw new Error("PROVIDER_PROTOCOL_INVALID");
  const route = String(routePath || "").startsWith("/") ? String(routePath) : `/${routePath || ""}`;
  return `${base.origin}${base.pathname.replace(/\/$/, "")}${route}`.replace(/([^:]\/)\/+/g, "$1");
}

/**
 * LEIGO: lê a lista de modelos de uma variável, separada por vírgulas.
 * PROFISSIONAL: prioriza env dinâmico e mantém fallback de configuração sem valores vazios.
 */
function resolveModels(definition, env) {
  const fromEnv = definition.modelsEnv ? env[definition.modelsEnv] : null;
  const values = String(fromEnv || "").split(",").map((x) => x.trim()).filter(Boolean);
  return values.length ? values : (definition.models || []).map(String).filter(Boolean);
}

/**
 * LEIGO: transforma a configuração em rotas realmente disponíveis no computador atual.
 * PROFISSIONAL: materializa somente provedores habilitados com credencial presente e endpoint válido; segredo fica não enumerável.
 */
export function resolveProviders(config, env = process.env) {
  const output = [];
  for (const definition of config.providers) {
    if (definition.enabled === false) continue;
    const baseUrl = definition.baseUrlEnv && env[definition.baseUrlEnv] ? env[definition.baseUrlEnv] : definition.baseUrl;
    const apiKey = definition.apiKeyEnv ? env[definition.apiKeyEnv] : null;
    if (definition.apiKeyEnv && !apiKey) continue;
    const models = resolveModels(definition, env);
    if (!models.length) continue;
    const provider = {
      id: definition.id,
      type: definition.type,
      endpoint: buildEndpoint(baseUrl, definition.path),
      models,
      timeoutMs: Number(definition.timeoutMs || 60000),
    };
    Object.defineProperty(provider, "apiKey", { value: apiKey || "", enumerable: false });
    output.push(provider);
  }
  return output;
}

/**
 * LEIGO: procura uma rota por nome e modelo, ou usa a primeira disponível.
 * PROFISSIONAL: filtra matriz provider/model por preferências explícitas e retorna candidatos ordenados para fallback.
 */
export function buildRouteCandidates(providers, preferences = {}) {
  const requestedProvider = preferences.provider || null;
  const requestedModel = preferences.model || null;
  const routes = [];
  for (const provider of providers) {
    if (requestedProvider && provider.id !== requestedProvider) continue;
    const models = requestedModel ? [requestedModel] : provider.models;
    for (const model of models) routes.push({ provider, model });
  }
  if (!routes.length) throw new Error(`NO_PROVIDER_ROUTE:${sanitizeText(requestedProvider || "AUTO")}/${sanitizeText(requestedModel || "AUTO")}`);
  return routes;
}
