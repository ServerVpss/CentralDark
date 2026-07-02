// Edge function temporária: migra auth.users da origem (Lovable Cloud)
// para o Supabase de destino (lyoig) via Auth Admin API.
// Preserva id, senha bcrypt, metadata e status de confirmação.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const origem = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const destinoUrl = Deno.env.get("HUB_SUPABASE_URL")!;
    const destinoKey = Deno.env.get("HUB_SUPABASE_SERVICE_ROLE_KEY")!;

    // 1) Lista todos os users da origem
    const { data: lista, error: erroList } = await origem.auth.admin.listUsers({ perPage: 1000 });
    if (erroList) throw erroList;
    const users = lista.users;

    // 2) Pega senha bcrypt via SQL (a API não retorna)
    const resp = await fetch(`${Deno.env.get("SUPABASE_URL")}/rest/v1/rpc/exec_sql_admin`, {
      method: "POST",
      headers: {
        apikey: Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
        Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
        "Content-Type": "application/json",
      },
    }).catch(() => null);

    // Fallback: usa pg direto via connection string (não temos aqui, então usamos user metadata)
    // Estratégia alternativa: fetch direto no pg via Deno Postgres client
    const { Client } = await import("https://deno.land/x/postgres@v0.19.3/mod.ts");

    // Conecta na origem usando SUPABASE_DB_URL (Lovable Cloud injeta)
    const origemDbUrl = Deno.env.get("SUPABASE_DB_URL");
    if (!origemDbUrl) throw new Error("SUPABASE_DB_URL não disponível na origem");

    const clientOrigem = new Client(origemDbUrl);
    await clientOrigem.connect();
    const usersCompletos = await clientOrigem.queryObject<{
      id: string; email: string; encrypted_password: string;
      email_confirmed_at: string | null; raw_user_meta_data: any;
      raw_app_meta_data: any; created_at: string; phone: string | null;
      confirmed_at: string | null; last_sign_in_at: string | null;
    }>(`SELECT id::text, email, encrypted_password, email_confirmed_at,
        raw_user_meta_data, raw_app_meta_data, created_at::text,
        phone, confirmed_at::text, last_sign_in_at::text
        FROM auth.users ORDER BY created_at`);
    await clientOrigem.end();

    // 3) Conecta no destino e insere via SQL direto (preserva id + hash)
    const clientDestino = new Client(Deno.env.get("HUB_SUPABASE_DB_URL")!);
    await clientDestino.connect();

    const resultados: any[] = [];
    for (const u of usersCompletos.rows) {
      try {
        await clientDestino.queryObject`
          INSERT INTO auth.users (
            id, instance_id, aud, role, email, encrypted_password,
            email_confirmed_at, raw_user_meta_data, raw_app_meta_data,
            created_at, updated_at, phone, confirmed_at, last_sign_in_at
          ) VALUES (
            ${u.id}::uuid,
            '00000000-0000-0000-0000-000000000000'::uuid,
            'authenticated', 'authenticated',
            ${u.email}, ${u.encrypted_password},
            ${u.email_confirmed_at}::timestamptz,
            ${JSON.stringify(u.raw_user_meta_data)}::jsonb,
            ${JSON.stringify(u.raw_app_meta_data)}::jsonb,
            ${u.created_at}::timestamptz, now(),
            ${u.phone}, ${u.confirmed_at}::timestamptz,
            ${u.last_sign_in_at}::timestamptz
          ) ON CONFLICT (id) DO NOTHING`;
        resultados.push({ email: u.email, status: "ok" });
      } catch (e) {
        resultados.push({ email: u.email, status: "erro", msg: String(e).slice(0, 200) });
      }
    }
    await clientDestino.end();

    return new Response(
      JSON.stringify({
        total_origem: usersCompletos.rows.length,
        migrados: resultados.filter((r) => r.status === "ok").length,
        erros: resultados.filter((r) => r.status === "erro"),
      }, null, 2),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ erro: String(e), stack: (e as Error).stack }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
