// Edge function "guardiã" da LOVABLE_API_KEY.
// O bridge local da VPS chama /key uma vez no boot pra pegar a chave em memória.
// Nunca grava em disco fora daqui.

import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const LOVABLE_KEY = Deno.env.get("LOVABLE_API_KEY");
const BRIDGE_SECRET = Deno.env.get("WEBUI_LOVABLE_KEY");

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (!LOVABLE_KEY || !BRIDGE_SECRET) return json({ error: "config ausente" }, 500);

  const auth = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "").trim();
  if (auth !== BRIDGE_SECRET) return json({ error: "não autorizado" }, 401);

  const url = new URL(req.url);
  const path = url.pathname.replace(/^\/functions\/v1/, "").replace(/^\/openai-lovable-bridge/, "");

  // Único endpoint: entrega a chave pro bridge local
  if (path === "/key" || path === "") {
    return json({ key: LOVABLE_KEY, ok: true });
  }
  return json({ error: "rota não encontrada" }, 404);
});
