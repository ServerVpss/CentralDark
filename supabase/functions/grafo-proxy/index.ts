// Bridge de compatibilidade para o grafo.
// O owner público é a API oficial; este bridge não possui dados nem autenticação próprios.
const API_GRAPH_URL = "https://api.centralldark.com/api/graph";
const ALLOWED_ORIGINS = new Set(
  (Deno.env.get("CENTRALDARK_ALLOWED_ORIGINS") ??
    "https://centraldark.com,https://www.centraldark.com,https://ui.centralldark.com")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
);

function corsHeaders(req: Request): HeadersInit {
  const origin = req.headers.get("origin") ?? "";
  return {
    "Access-Control-Allow-Origin": ALLOWED_ORIGINS.has(origin) ? origin : "null",
    "Access-Control-Allow-Headers": "authorization, content-type",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Vary": "Origin",
  };
}

Deno.serve(async (req) => {
  const cors = corsHeaders(req);
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  if (req.method !== "GET") {
    return new Response(JSON.stringify({ error: "method_not_allowed" }), {
      status: 405,
      headers: { ...cors, "content-type": "application/json", "cache-control": "no-store" },
    });
  }

  const authorization = req.headers.get("authorization");
  if (!authorization) {
    return new Response(JSON.stringify({ error: "authorization_required" }), {
      status: 401,
      headers: { ...cors, "content-type": "application/json", "cache-control": "no-store" },
    });
  }

  try {
    const incoming = new URL(req.url);
    const upstream = new URL(API_GRAPH_URL);
    incoming.searchParams.forEach((value, key) => upstream.searchParams.append(key, value));

    const response = await fetch(upstream, {
      headers: {
        accept: "application/json",
        authorization,
      },
    });
    const body = await response.text();
    return new Response(body, {
      status: response.status,
      headers: {
        ...cors,
        "content-type": response.headers.get("content-type") ?? "application/json",
        "cache-control": "no-store",
      },
    });
  } catch {
    return new Response(JSON.stringify({ error: "graph_api_unavailable" }), {
      status: 502,
      headers: { ...cors, "content-type": "application/json", "cache-control": "no-store" },
    });
  }
});
