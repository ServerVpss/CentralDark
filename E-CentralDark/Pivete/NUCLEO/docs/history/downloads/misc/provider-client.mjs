import { sanitizeText } from "./sanitize.mjs";

/**
 * LEIGO: cancela uma chamada que ficou presa por tempo demais.
 * PROFISSIONAL: envolve fetch com AbortController e timeout determinístico.
 */
async function fetchWithTimeout(fetchImpl, url, init, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(new Error("REQUEST_TIMEOUT")), timeoutMs);
  try {
    return await fetchImpl(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

/**
 * LEIGO: aceita apenas texto de verdade; array vazio, objeto ou espaço em branco viram erro.
 * PROFISSIONAL: normaliza conteúdo string ou blocos textuais e aplica validação semântica non-empty.
 */
export function normalizeModelText(content) {
  let text = "";
  if (typeof content === "string") text = content;
  else if (Array.isArray(content)) {
    text = content.map((item) => {
      if (typeof item === "string") return item;
      if (["text", "output_text"].includes(item?.type) && typeof item.text === "string") return item.text;
      if (typeof item?.content === "string") return item.content;
      return "";
    }).join("\n");
  }
  text = sanitizeText(text, 30000).trim();
  if (!text) throw new Error("MODEL_EMPTY_RESPONSE");
  return text;
}

/**
 * LEIGO: chama qualquer API configurada usando o formato correto para aquele provedor.
 * PROFISSIONAL: monta payload OpenAI-compatible ou Anthropic, valida HTTP/JSON e rejeita resposta semanticamente vazia.
 */
export async function callRoute(route, request, options = {}) {
  const fetchImpl = options.fetchImpl || globalThis.fetch;
  if (typeof fetchImpl !== "function") throw new Error("FETCH_UNAVAILABLE");

  const headers = { "content-type": "application/json" };
  let body;
  if (route.provider.type === "anthropic") {
    headers["x-api-key"] = route.provider.apiKey;
    headers["anthropic-version"] = "2023-06-01";
    body = {
      model: route.model,
      max_tokens: Number(options.maxTokens || 4096),
      system: request.system,
      messages: [{ role: "user", content: request.user }],
    };
  } else if (route.provider.type === "openai-responses") {
    headers.authorization = `Bearer ${route.provider.apiKey}`;
    body = { model: route.model, instructions: request.system, input: request.user };
  } else if (route.provider.type === "openai-compatible") {
    headers.authorization = `Bearer ${route.provider.apiKey}`;
    body = {
      model: route.model,
      messages: [
        { role: "system", content: request.system },
        { role: "user", content: request.user },
      ],
    };
  } else {
    throw new Error(`PROVIDER_TYPE_UNSUPPORTED:${route.provider.type}`);
  }

  if (options.requestId) headers["x-client-request-id"] = options.requestId;
  const response = await fetchWithTimeout(fetchImpl, route.provider.endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  }, Number(route.provider.timeoutMs || 60000));

  const raw = await response.text();
  let data;
  try { data = raw ? JSON.parse(raw) : {}; }
  catch { throw new Error(`PROVIDER_INVALID_JSON:${response.status}`); }
  if (!response.ok) throw new Error(`PROVIDER_HTTP_${response.status}:${sanitizeText(data?.error?.message || raw, 400)}`);

  let content;
  if (route.provider.type === "anthropic") content = data?.content;
  else if (route.provider.type === "openai-responses") {
    content = data?.output_text ?? data?.output?.flatMap?.((item) => item?.content || []) ?? [];
  } else content = data?.choices?.[0]?.message?.content;

  return {
    text: normalizeModelText(content),
    provider: route.provider.id,
    model: route.model,
    endpoint: route.provider.endpoint,
  };
}

/**
 * LEIGO: tenta a rota preferida e, se ela falhar, passa para a próxima sem inventar sucesso.
 * PROFISSIONAL: executa fallback sequencial, coleta erros sanitizados e retorna a primeira resposta semanticamente válida.
 */
export async function callWithFallback(routes, request, options = {}) {
  const errors = [];
  for (const route of routes) {
    try { return await callRoute(route, request, options); }
    catch (error) { errors.push(`${route.provider.id}/${route.model}:${sanitizeText(error.message, 300)}`); }
  }
  throw new Error(`ALL_ROUTES_FAILED:${errors.join("|")}`);
}
