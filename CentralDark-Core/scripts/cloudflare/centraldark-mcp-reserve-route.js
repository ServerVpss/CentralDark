// @owner CentralDark-Core/scripts/cloudflare/centraldark-mcp-reserve-route.js
// @doc_ref ../../docs/DOMINIOS/API-CENTRALDARK.md
// @last_updated 2026-11-28
// Reuses the existing Worker. Bind only the documented MCP path patterns.
// The Pages UI stays outside those routes. API->MCP routing must remain disabled.
const MCP_PUBLIC_METHODS = new Map([
  ["/.well-known/oauth-authorization-server", ["GET", "HEAD", "OPTIONS"]],
  ["/.well-known/oauth-protected-resource", ["GET", "HEAD", "OPTIONS"]],
  ["/api/mcp", ["GET", "HEAD", "POST", "OPTIONS"]],
  ["/api/mcp-info", ["GET", "HEAD", "OPTIONS"]],
  ["/authorize", ["GET", "HEAD", "POST", "OPTIONS"]],
  ["/register", ["POST", "OPTIONS"]],
  ["/token", ["POST", "OPTIONS"]],
  ["/device/pair/start", ["POST", "OPTIONS"]],
  ["/device/pair/status", ["GET", "HEAD", "POST", "OPTIONS"]],
  ["/device/token/refresh", ["POST", "OPTIONS"]],
  ["/device/heartbeat", ["POST", "OPTIONS"]],
  ["/device/devices/self/revoke", ["POST", "OPTIONS"]],
  ["/device/desktop/start", ["POST", "OPTIONS"]],
  ["/device/desktop/session/check", ["POST", "OPTIONS"]],
]);

function routeError(status, error, extraHeaders = {}) {
  return new Response(JSON.stringify({ error }), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      ...extraHeaders,
    },
  });
}

addEventListener("fetch", (event) => {
  event.respondWith(proxy(event.request));
});

async function proxy(request) {
  const incoming = new URL(request.url);
  if (incoming.origin !== "https://mcp.centralldark.com") {
    return routeError(404, "route_not_forwarded");
  }
  const allowed = MCP_PUBLIC_METHODS.get(incoming.pathname);
  if (!allowed) return routeError(404, "route_not_forwarded");
  if (!allowed.includes(request.method)) {
    return routeError(405, "method_not_allowed", { Allow: allowed.join(", ") });
  }

  // Copy method, headers, query and body. Never fabricate Origin or credentials.
  incoming.hostname = "api.centralldark.com";
  const upstream = new Request(incoming.toString(), request);
  try {
    // OAuth redirects and their credentials must not be followed by the proxy.
    const response = await fetch(upstream, { redirect: "manual" });
    const headers = new Headers(response.headers);
    headers.set("Cache-Control", "no-store");
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  } catch {
    // No request body, token, nonce or upstream exception is written to logs.
    return routeError(502, "upstream_unavailable");
  }
}
