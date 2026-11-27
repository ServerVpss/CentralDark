// Edge function de teste — dispara notificações de exemplo pelo notify-telegram.
// Uso interno só pra validar que o ciclo (edge → telegram → painel) está fechado.
// Pode ser removida depois que o sistema estiver maduro.
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  // Só admin logado pode chamar
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return new Response(JSON.stringify({ ok: false, error: "unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(
    Deno.env.get("HUB_SUPABASE_URL")!,
    Deno.env.get("HUB_SUPABASE_SERVICE_ROLE_KEY")!,
  );
  const token = authHeader.replace("Bearer ", "");
  const { data: userData } = await supabase.auth.getUser(token);
  const userId = userData?.user?.id;
  if (!userId) {
    return new Response(JSON.stringify({ ok: false, error: "invalid_token" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  const { data: isAdmin } = await supabase.rpc("has_role", {
    _user_id: userId,
    _role: "admin",
  });
  if (!isAdmin) {
    return new Response(JSON.stringify({ ok: false, error: "forbidden" }), {
      status: 403,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const notifyKey = Deno.env.get("NOTIFY_API_KEY")!;
  const notifyUrl = `${Deno.env.get("HUB_SUPABASE_URL")}/functions/v1/notify-telegram`;

  // Opcional: { tipos: ["critico", ...] } pra filtrar quais disparar
  let body: { tipos?: string[] } = {};
  try {
    body = (await req.json()) as { tipos?: string[] };
  } catch {
    body = {};
  }
  const filtroTipos = Array.isArray(body.tipos) ? body.tipos : null;

  const tsNow = Date.now();
  const TODOS = [
    { tipo: "info", origem: "cofre", titulo: "Teste info", mensagem: "Validando rota tipo info." },
    { tipo: "sucesso", origem: "cofre", titulo: "Teste sucesso", mensagem: "Rota de sucesso ok." },
    { tipo: "aviso", origem: "cofre", titulo: "Teste aviso", mensagem: "Rota de aviso ok." },
    { tipo: "erro", origem: "cofre", titulo: "Teste erro", mensagem: "Rota de erro ok." },
    { tipo: "critico", origem: "cofre", titulo: "Teste crítico", mensagem: "Rota crítica ok." },
    { tipo: "venda", origem: "cofre", titulo: "Teste venda", mensagem: "Rota de venda ok." },
    { tipo: "pagamento", origem: "cofre", titulo: "Teste pagamento", mensagem: "Rota de pagamento ok." },
    { tipo: "sistema", origem: "cofre", titulo: "Teste sistema", mensagem: "Rota de sistema ok." },
  ];
  const exemplos = (filtroTipos
    ? TODOS.filter((e) => filtroTipos.includes(e.tipo))
    : TODOS
  ).map((e) => ({ ...e, metadata: { test_ts: tsNow } }));

  const resultados: unknown[] = [];
  for (const ex of exemplos) {
    const r = await fetch(notifyUrl, {
      method: "POST",
      headers: {
        "X-Notify-Key": notifyKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(ex),
    });
    const j = await r.json();
    resultados.push({ status: r.status, body: j });
    // pequena pausa pra cada notificação aparecer separada
    await new Promise((res) => setTimeout(res, 400));
  }

  return new Response(
    JSON.stringify({ ok: true, enviadas: resultados.length, resultados }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
});
