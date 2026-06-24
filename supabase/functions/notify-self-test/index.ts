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
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
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
  const notifyUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/notify-telegram`;

  const exemplos = [
    {
      origem: "lovable",
      tipo: "sucesso",
      titulo: "Sistema de notificação online",
      mensagem:
        "Edge function 'notify-telegram' deployada com anti-spam de 60s e Mega Painel em tempo real.",
      metadata: { fase: 1, etapa: "validacao" },
    },
    {
      origem: "vps",
      tipo: "info",
      titulo: "Wrapper pronto para instalar",
      mensagem:
        "Arquivos em infra/notify/ aguardando deploy na VPS via MCP.",
    },
    {
      origem: "gateway",
      tipo: "aviso",
      titulo: "Teste de tipo 'aviso'",
      mensagem: "Validando que o badge amarelo aparece no painel.",
    },
    {
      origem: "monitor",
      tipo: "critico",
      titulo: "Teste de alerta crítico",
      mensagem:
        "Apenas teste — validando destaque vermelho pulsante no Mega Painel.",
    },
  ];

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
