// Grok Provider via Zendriver Proxy (2026)
// Fonte: GitHub ServerVpss/CentralDark
// Runtime: apps/modulos/elite-gateway (Python, humanizer + mapeamento_humano_v3)
// Fallback: Abacus RouteLLM (grok-4.5 / grok-4.3 ja no catalogo /v1/models)

const GROK_ZENDRIVER = {
  name: "Grok xAI",
  provider: "grok",
  baseUrl: "https://api.x.ai/v1",

  authType: "web_session",
  providerType: "zendriver",

  sessionCookieEnv: "GROK_SESSION_COOKIE",
  loginUrl: "https://grok.com/login",

  fallback: {
    authType: "bearer",
    keyEnv: "GROK_API_KEY",
  },

  modelMap: {
    "grok-beta": "grok-4.5",
    "grok-4": "grok-4.5",
    "grok-4.5": "grok-4.5",
    "grok-4.3": "grok-4.3",
  },

  defaultModel: "grok-4.5",
  timeoutMs: 120000,

  headers() {
    const cookie = process.env[this.sessionCookieEnv];
    if (cookie) {
      return { Cookie: cookie, "User-Agent": "CentralDark-Zendriver/1.0" };
    }
    const key = process.env[this.fallback.keyEnv];
    if (key) return { Authorization: `Bearer ${key}` };
    throw new Error("[grok-zendriver] Nem GROK_SESSION_COOKIE nem GROK_API_KEY configurados");
  },

  resolveModel(requested) {
    return this.modelMap[requested] || this.defaultModel;
  },
};

export default GROK_ZENDRIVER;
