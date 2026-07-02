// Ponte temporária: devolve os secrets necessários pra espelhar no HUB.
// Protegido por X-Bootstrap-Secret == MCP_SESSION_SECRET.
// Apagar depois do sync.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-bootstrap-secret",
};

const NEEDED = [
  "AGENT_LOG_SECRET",
  "CENTRALDARK_MCP_SESSION",
  "CENTRALDARK_MCP_TOKEN",
  "CONSULTAS_API_KEY",
  "EFI_CLIENT_ID",
  "EFI_CLIENT_SECRET",
  "EFI_PIX_KEY",
  "GH_APP_CLIENT_ID",
  "GH_APP_CLIENT_SECRET",
  "GH_APP_OWNER",
  "GH_APP_REPO",
  "GH_APP_TOKEN",
  "GH_TOKEN",
  "GITHUB_CLIENT_ID",
  "GITHUB_CLIENT_SECRET",
  "GITHUB_TOKEN",
  "ISEEK_API_KEY",
  "LOVABLE_API_KEY",
  "MCP_CENTRALDARK_TOKEN",
  "NOTIFY_API_KEY",
  "NOTION_API_TOKEN",
  "TELEGRAM_API_KEY",
  "VAULT_MASTER_KEY",
];

Deno.serve((req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  const expected = Deno.env.get("MCP_SESSION_SECRET");
  const got = req.headers.get("x-bootstrap-secret");
  if (!expected || got !== expected) {
    return new Response(JSON.stringify({ error: "unauthorized" }), {
      status: 401,
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  }
  const out: Record<string, string> = {};
  const missing: string[] = [];
  for (const n of NEEDED) {
    const v = Deno.env.get(n);
    if (v && v.length > 0) out[n] = v;
    else missing.push(n);
  }
  return new Response(JSON.stringify({ secrets: out, missing }), {
    headers: { ...CORS, "Content-Type": "application/json" },
  });
});
