// Helper server-only pra falar com o MultiZap-Gateway.
// Centraliza: leitura de secrets, timeout, categorização de erro e logs seguros
// (sem nunca imprimir o token). Usado tanto pelas server functions do app
// quanto pelas do painel master.

// Fingerprint não-criptográfico (FNV-1a 32-bit) só pra comparar paridade
// CRM ↔ VPS nos logs, sem expor o token. Evita importar node:crypto pra
// não quebrar o bundle do client (este módulo é importado por *.functions.ts).
function tokenFingerprintSafe(token: string): string {
  if (!token) return "vazio";
  let h = 0x811c9dc5;
  for (let i = 0; i < token.length; i++) {
    h ^= token.charCodeAt(i);
    h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0;
  }
  const fp = h.toString(16).padStart(8, "0");
  return `len=${token.length} fnv8=${fp}`;
}

export type GatewayErrorKind =
  | "missing_url"
  | "missing_token"
  | "timeout"
  | "connection_refused"
  | "dns_error"
  | "tls_error"
  | "mixed_content"
  | "unauthorized"
  | "http_error"
  | "non_json"
  | "network_error"
  | "unknown";

export type GatewayCallResult<T> = {
  ok: boolean;
  status?: number;
  latency_ms: number;
  data?: T;
  error?: { kind: GatewayErrorKind; message: string };
};

function readConfig() {
  const url = process.env.MULTIZAP_GATEWAY_URL?.trim();

  // Nome oficial do secret no CRM/Lovable: MULTIZAP_GATEWAY_TOKEN.
  // Fallback server-only: GATEWAY_SERVER_TOKEN, útil quando o ambiente do
  // worker/VPS usa o mesmo nome do Gateway. Nunca usar MULTIZAP_WEBHOOK_SECRET
  // aqui: ele é do fluxo Gateway → CRM (X-Gateway-Secret), não CRM → Gateway.
  const primaryToken = process.env.MULTIZAP_GATEWAY_TOKEN?.trim();
  const fallbackToken = process.env.GATEWAY_SERVER_TOKEN?.trim();
  const token = primaryToken || fallbackToken || "";
  const tokenSource = primaryToken
    ? "MULTIZAP_GATEWAY_TOKEN"
    : fallbackToken
      ? "GATEWAY_SERVER_TOKEN"
      : "none";

  return {
    url: url ? url.replace(/\/+$/, "") : "",
    token,
    tokenSource,
    urlConfigured: !!url,
    tokenConfigured: !!token,
  };
}

function maskUrl(u: string): string {
  try {
    const parsed = new URL(u);
    return `${parsed.protocol}//${parsed.host}`;
  } catch {
    return "(url inválida)";
  }
}

function classifyError(err: unknown): { kind: GatewayErrorKind; message: string } {
  const msg = err instanceof Error ? err.message : String(err);
  const lower = msg.toLowerCase();

  if (err instanceof Error && err.name === "AbortError") {
    return { kind: "timeout", message: "Tempo esgotado falando com o Gateway." };
  }

  if (lower.includes("econnrefused") || lower.includes("connection refused")) {
    return { kind: "connection_refused", message: "Conexão recusada pelo Gateway." };
  }

  if (lower.includes("enotfound") || lower.includes("eai_again") || lower.includes("getaddrinfo")) {
    return { kind: "dns_error", message: "Não consegui resolver o endereço do Gateway." };
  }

  if (lower.includes("certificate") || lower.includes("tls") || lower.includes("ssl")) {
    return { kind: "tls_error", message: "Erro de TLS/SSL ao falar com o Gateway." };
  }

  return { kind: "network_error", message: msg || "Falha de rede." };
}

function newCallId() {
  return Math.random().toString(36).slice(2, 8);
}

function safeBodySnippet(body: unknown): string {
  try {
    const s = typeof body === "string" ? body : JSON.stringify(body);
    if (!s) return "";

    const sanitized = s
      .replace(/("?(authorization|token|access_token|api[_-]?key)"?\s*[:=]\s*"?)[^",}\s]+/gi, "$1***")
      .replace(/Bearer\s+[A-Za-z0-9._~+/=-]+/gi, "Bearer ***");

    return sanitized.length > 280 ? sanitized.slice(0, 280) + "…(truncado)" : sanitized;
  } catch {
    return "(corpo não serializável)";
  }
}

function headersToRecord(input?: HeadersInit): Record<string, string> {
  const out: Record<string, string> = {};

  if (!input) return out;

  if (input instanceof Headers) {
    input.forEach((value, key) => {
      out[key] = value;
    });
    return out;
  }

  if (Array.isArray(input)) {
    for (const [key, value] of input) {
      out[key] = value;
    }
    return out;
  }

  for (const [key, value] of Object.entries(input)) {
    out[key] = String(value);
  }

  return out;
}

function callerProvidedAuthHeader(input?: HeadersInit): boolean {
  const headers = headersToRecord(input);
  return Object.keys(headers).some((k) => k.toLowerCase() === "authorization");
}

function buildGatewayHeaders(inputHeaders: RequestInit["headers"], token: string): Record<string, string> {
  const headers = headersToRecord(inputHeaders);

  // Remove qualquer Authorization vindo do caller para impedir sobrescrita
  // acidental por token antigo/vazio. O Bearer server-only correto SEMPRE vence.
  for (const key of Object.keys(headers)) {
    if (key.toLowerCase() === "authorization") {
      delete headers[key];
    }
  }

  return {
    ...headers,
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export async function gatewayCall<T = unknown>(
  path: string,
  init: RequestInit = {},
  opts: { timeoutMs?: number } = {},
): Promise<GatewayCallResult<T>> {
  const started = Date.now();
  const callId = newCallId();
  const method = init.method ?? "GET";
  const { url, token, tokenSource, urlConfigured, tokenConfigured } = readConfig();

  if (!urlConfigured) {
    console.warn(
      `[multizap-gateway][${callId}] abortado: MULTIZAP_GATEWAY_URL ausente (${method} ${path})`,
    );
    return {
      ok: false,
      latency_ms: 0,
      error: { kind: "missing_url", message: "MULTIZAP_GATEWAY_URL não configurado no servidor." },
    };
  }

  if (!tokenConfigured) {
    console.warn(
      `[multizap-gateway][${callId}] abortado: MULTIZAP_GATEWAY_TOKEN/GATEWAY_SERVER_TOKEN ausente (${method} ${path})`,
    );
    return {
      ok: false,
      latency_ms: 0,
      error: { kind: "missing_token", message: "MULTIZAP_GATEWAY_TOKEN não configurado no servidor." },
    };
  }

  const tokenFingerprint = tokenFingerprintSafe(token);
  const timeoutMs = opts.timeoutMs ?? 8000;
  const callerAuthPresent = callerProvidedAuthHeader(init.headers);

  console.log(
    `[multizap-gateway][${callId}] → ${method} ${maskUrl(url)}${path} ` +
      `(timeout=${timeoutMs}ms, token ${tokenFingerprint}, source=${tokenSource}, ` +
      `auth_present=true, caller_auth_present=${callerAuthPresent})`,
  );

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(`${url}${path}`, {
      ...init,
      signal: controller.signal,
      headers: buildGatewayHeaders(init.headers, token),
    });

    const latency = Date.now() - started;
    const text = await res.text();

    let body: unknown = null;
    let parseOk = true;

    try {
      body = text ? JSON.parse(text) : null;
    } catch {
      parseOk = false;
      body = text;
    }

    console.log(
      `[multizap-gateway][${callId}] ← ${method} ${maskUrl(url)}${path} HTTP ${res.status} em ${latency}ms (resp=${text.length}B, json=${parseOk})`,
    );

    if (!res.ok) {
      const isAuth = res.status === 401 || res.status === 403;
      const snippet = safeBodySnippet(body);
      const serverHeader =
        res.headers.get("server") || res.headers.get("x-powered-by") || "(sem header server)";
      const cfRay = res.headers.get("cf-ray");
      const contentType = res.headers.get("content-type") || "(sem content-type)";

      if (isAuth && latency <= 5) {
        console.warn(
          `[multizap-gateway][${callId}] ⚠️ ${res.status} em ${latency}ms — RÁPIDO DEMAIS pra ter chegado no Gateway. ` +
            `Provável bloqueio antes (firewall/Cloudflare/proxy). server="${serverHeader}" cf-ray="${cfRay ?? "—"}" ` +
            `content-type="${contentType}" corpo="${snippet}"`,
        );
      } else if (isAuth) {
        console.warn(
          `[multizap-gateway][${callId}] ⚠️ ${res.status} unauthorized — token Bearer rejeitado pelo Gateway. ` +
            `Compare Lovable MULTIZAP_GATEWAY_TOKEN com VPS GATEWAY_SERVER_TOKEN. ` +
            `token ${tokenFingerprint} source=${tokenSource} caller_auth_present=${callerAuthPresent} ` +
            `server="${serverHeader}" corpo="${snippet}"`,
        );
      } else {
        console.warn(
          `[multizap-gateway][${callId}] ⚠️ HTTP ${res.status} server="${serverHeader}" corpo="${snippet}"`,
        );
      }

      const message =
        (body && typeof body === "object" && "message" in (body as Record<string, unknown>)
          ? String((body as { message?: unknown }).message)
          : null) ||
        (typeof body === "string" && body ? body : null) ||
        `Gateway respondeu HTTP ${res.status}`;

      return {
        ok: false,
        status: res.status,
        latency_ms: latency,
        error: {
          kind: isAuth ? "unauthorized" : "http_error",
          message,
        },
      };
    }

    if (!parseOk) {
      console.warn(
        `[multizap-gateway][${callId}] ⚠️ resposta não-JSON: "${safeBodySnippet(body)}"`,
      );
      return {
        ok: false,
        status: res.status,
        latency_ms: latency,
        error: { kind: "non_json", message: "Resposta do Gateway não é JSON válido." },
      };
    }

    const payload =
      body && typeof body === "object" && "data" in (body as Record<string, unknown>)
        ? (body as { data: unknown }).data
        : body;

    return {
      ok: true,
      status: res.status,
      latency_ms: latency,
      data: payload as T,
    };
  } catch (err) {
    const latency = Date.now() - started;
    const cls = classifyError(err);

    console.warn(
      `[multizap-gateway][${callId}] ✗ ${method} ${maskUrl(url)}${path} ERR ${cls.kind} em ${latency}ms — ${cls.message}`,
    );

    return { ok: false, latency_ms: latency, error: cls };
  } finally {
    clearTimeout(timeout);
  }
}

export async function gatewayFetch<T = unknown>(
  path: string,
  init: RequestInit = {},
  opts: { timeoutMs?: number } = {},
): Promise<T> {
  const res = await gatewayCall<T>(path, init, opts);

  if (!res.ok) {
    const err = new Error(res.error?.message ?? "Falha falando com o Gateway.") as Error & {
      kind?: GatewayErrorKind;
      httpStatus?: number;
    };
    err.kind = res.error?.kind;
    err.httpStatus = res.status;
    throw err;
  }

  return res.data as T;
}

const TRANSIENT_KINDS: GatewayErrorKind[] = [
  "timeout",
  "connection_refused",
  "dns_error",
  "network_error",
];

function isRetryable(res: GatewayCallResult<unknown>): boolean {
  if (res.ok) return false;

  const kind = res.error?.kind;

  if (kind && TRANSIENT_KINDS.includes(kind)) return true;
  if (kind === "http_error" && res.status && res.status >= 500) return true;

  return false;
}

function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

export async function gatewayCallWithRetry<T = unknown>(
  path: string,
  init: RequestInit = {},
  opts: { timeoutMs?: number; retries?: number; baseDelayMs?: number } = {},
): Promise<GatewayCallResult<T>> {
  const retries = opts.retries ?? 2;
  const base = opts.baseDelayMs ?? 400;

  let last: GatewayCallResult<T> | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const res = await gatewayCall<T>(path, init, { timeoutMs: opts.timeoutMs });
    last = res;

    if (res.ok || !isRetryable(res) || attempt === retries) {
      if (!res.ok && attempt > 0) {
        console.log(
          `[multizap-gateway] desistindo após ${attempt + 1} tentativas em ${path} (${res.error?.kind ?? "unknown"})`,
        );
      }
      return res;
    }

    const delay = Math.round(base * Math.pow(2, attempt) + Math.random() * 200);

    console.log(
      `[multizap-gateway] retry ${attempt + 1}/${retries} em ${path} após ${res.error?.kind} (esperando ${delay}ms)`,
    );

    await sleep(delay);
  }

  return last as GatewayCallResult<T>;
}

export async function gatewayFetchWithRetry<T = unknown>(
  path: string,
  init: RequestInit = {},
  opts: { timeoutMs?: number; retries?: number; baseDelayMs?: number } = {},
): Promise<T> {
  const res = await gatewayCallWithRetry<T>(path, init, opts);

  if (!res.ok) {
    const err = new Error(res.error?.message ?? "Falha falando com o Gateway.") as Error & {
      kind?: GatewayErrorKind;
      httpStatus?: number;
    };
    err.kind = res.error?.kind;
    err.httpStatus = res.status;
    throw err;
  }

  return res.data as T;
}

export function getGatewayDiagnostic() {
  const { urlConfigured, tokenConfigured, url, tokenSource, token } = readConfig();

  return {
    url_configured: urlConfigured,
    token_configured: tokenConfigured,
    token_source: tokenSource,
    token_fingerprint: tokenConfigured ? tokenFingerprintSafe(token) : null,
    url_masked: urlConfigured ? maskUrl(url) : null,
  };
}

export type GatewayRawResult = {
  http_status: number | null;
  latency_ms: number;
  ok: boolean;
  raw_text: string;
  parsed_json: unknown;
  parse_ok: boolean;
  network_error: { kind: GatewayErrorKind; message: string } | null;
};

export async function gatewayCallRaw(
  path: string,
  init: RequestInit = {},
  opts: { timeoutMs?: number } = {},
): Promise<GatewayRawResult> {
  const started = Date.now();
  const { url, token, urlConfigured, tokenConfigured } = readConfig();

  if (!urlConfigured || !tokenConfigured) {
    return {
      http_status: null,
      latency_ms: 0,
      ok: false,
      raw_text: "",
      parsed_json: null,
      parse_ok: false,
      network_error: {
        kind: !urlConfigured ? "missing_url" : "missing_token",
        message: !urlConfigured
          ? "MULTIZAP_GATEWAY_URL não configurado."
          : "MULTIZAP_GATEWAY_TOKEN não configurado.",
      },
    };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), opts.timeoutMs ?? 10000);

  try {
    const res = await fetch(`${url}${path}`, {
      ...init,
      signal: controller.signal,
      headers: buildGatewayHeaders(init.headers, token),
    });

    const latency = Date.now() - started;
    const text = await res.text();

    let parsed: unknown = null;
    let parseOk = true;

    try {
      parsed = text ? JSON.parse(text) : null;
    } catch {
      parseOk = false;
      parsed = null;
    }

    const safeText = text
      .replace(/("?(authorization|token|access_token|api[_-]?key)"?\s*[:=]\s*"?)[^",}\s]+/gi, "$1***")
      .replace(/Bearer\s+[A-Za-z0-9._~+/=-]+/gi, "Bearer ***");

    return {
      http_status: res.status,
      latency_ms: latency,
      ok: res.ok,
      raw_text: safeText.length > 8000 ? safeText.slice(0, 8000) + "…(truncado)" : safeText,
      parsed_json: parsed,
      parse_ok: parseOk,
      network_error: null,
    };
  } catch (err) {
    const latency = Date.now() - started;
    const cls = classifyError(err);

    return {
      http_status: null,
      latency_ms: latency,
      ok: false,
      raw_text: "",
      parsed_json: null,
      parse_ok: false,
      network_error: cls,
    };
  } finally {
    clearTimeout(timeout);
  }
}
