'use strict';

const DEFAULT_LOCAL_AI_BASE_URL = 'http://127.0.0.1:18435/v1';

function normalizeBaseUrl(baseUrl = DEFAULT_LOCAL_AI_BASE_URL) {
  return String(baseUrl).replace(/\/$/, '');
}

function isLocalAiEnabled(env = process.env) {
  return env.BOT_USE_LOCAL_AI === '1';
}

function localAiError(code, message, details = {}) {
  const error = new Error(message);
  error.localAiCode = code;
  Object.assign(error, details);
  return error;
}

function healthUrl(baseUrl) {
  const normalized = normalizeBaseUrl(baseUrl);
  return normalized.endsWith('/v1')
    ? `${normalized.slice(0, -3)}/health`
    : `${normalized}/health`;
}

function completionUrl(baseUrl) {
  return `${normalizeBaseUrl(baseUrl)}/chat/completions`;
}

async function readJson(response) {
  return response.json().catch(() => ({}));
}

async function resolveLocalAiModel({
  baseUrl = DEFAULT_LOCAL_AI_BASE_URL,
  fetchImpl = fetch,
} = {}) {
  let response;
  try {
    response = await fetchImpl(healthUrl(baseUrl), { method: 'GET' });
  } catch (cause) {
    throw localAiError('LOCAL_AI_UNAVAILABLE', `bridge health unavailable: ${cause.message || cause}`, { cause });
  }
  const body = await readJson(response);
  if (!response.ok) {
    throw localAiError('LOCAL_AI_HTTP_ERROR', `bridge health HTTP ${response.status}`, { status: response.status, body });
  }
  const model = body?.model || body?.current_model || body?.data?.model;
  if (typeof model !== 'string' || !model.trim()) {
    throw localAiError('LOCAL_AI_INVALID_RESPONSE', 'bridge health did not provide a model', { body });
  }
  return model.trim();
}

function parseChatCompletion(body) {
  const content = body?.choices?.[0]?.message?.content;
  if (typeof content !== 'string' || !content.trim()) {
    throw localAiError('LOCAL_AI_INVALID_RESPONSE', 'bridge completion did not provide choices[0].message.content', { body });
  }
  return content;
}

async function requestLocalAiChat({
  baseUrl = DEFAULT_LOCAL_AI_BASE_URL,
  messages,
  maxTokens = 4096,
  apiKey = '',
  fetchImpl = fetch,
} = {}) {
  const model = await resolveLocalAiModel({ baseUrl, fetchImpl });
  let response;
  try {
    response = await fetchImpl(completionUrl(baseUrl), {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        ...(apiKey ? { authorization: `Bearer ${apiKey}` } : {}),
      },
      body: JSON.stringify({ model, max_tokens: maxTokens, messages }),
    });
  } catch (cause) {
    throw localAiError('LOCAL_AI_UNAVAILABLE', `bridge completion unavailable: ${cause.message || cause}`, { cause });
  }
  const body = await readJson(response);
  if (!response.ok) {
    throw localAiError('LOCAL_AI_HTTP_ERROR', `bridge completion HTTP ${response.status}`, { status: response.status, body });
  }
  return parseChatCompletion(body);
}

function classifyLocalAiFailure(error) {
  if (error?.localAiCode) {
    return {
      code: error.localAiCode,
      retryable: error.localAiCode !== 'LOCAL_AI_INVALID_RESPONSE',
    };
  }
  if (Number.isInteger(error?.status)) {
    return { code: 'LOCAL_AI_HTTP_ERROR', retryable: error.status >= 500 || error.status === 429 };
  }
  if (/invalid response|did not provide/i.test(String(error?.message || error))) {
    return { code: 'LOCAL_AI_INVALID_RESPONSE', retryable: false };
  }
  if (error?.name === 'AbortError' || /timeout/i.test(String(error?.message || error))) {
    return { code: 'LOCAL_AI_TIMEOUT', retryable: true };
  }
  return { code: 'LOCAL_AI_UNAVAILABLE', retryable: true };
}

module.exports = {
  DEFAULT_LOCAL_AI_BASE_URL,
  classifyLocalAiFailure,
  isLocalAiEnabled,
  parseChatCompletion,
  requestLocalAiChat,
  resolveLocalAiModel,
};
