// Edge function TEMPORÁRIA — só pra QA dos 76 módulos.
// Recebe lista de módulos + inputs, chama api-query com SERVICE_ROLE,
// aguarda 10s entre cada chamada e devolve o relatório.
// PODE SER REMOVIDA depois do teste.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { modules, inputs, delay_ms = 10000 } = await req.json();
    if (!Array.isArray(modules) || !inputs) {
      return new Response(JSON.stringify({ error: "modules[] e inputs obrigatórios" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const SERVICE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const SUPA_URL = Deno.env.get("SUPABASE_URL")!;
    const URL_API = `${SUPA_URL}/functions/v1/api-query`;

    const results: any[] = [];

    for (let i = 0; i < modules.length; i++) {
      const mod = modules[i];
      const input = inputs[mod] ?? inputs.__default ?? "";
      const t0 = Date.now();
      const ac = new AbortController();
      const tid = setTimeout(() => ac.abort(), 35000);

      let httpStatus = 0;
      let body: any = null;
      let outcome = "http_error";
      let temDados = false;
      let erro = "";

      try {
        const res = await fetch(URL_API, {
          method: "POST",
          headers: {
            "content-type": "application/json",
            apikey: SERVICE,
            authorization: `Bearer ${SERVICE}`,
          },
          body: JSON.stringify({ module: mod, query: input }),
          signal: ac.signal,
        });
        httpStatus = res.status;
        const txt = await res.text();
        try { body = JSON.parse(txt); } catch { body = txt.slice(0, 400); }

        if (res.status === 200 && body && typeof body === "object") {
          const ok = body.success === true || body.ok === true;
          const status = (body.status || "").toString().toLowerCase();
          const data = body.data || body.result || body.response;
          temDados = !!(data && (Array.isArray(data) ? data.length : Object.keys(data).length > 0));

          if (status === "notfound" || status === "not_found") outcome = "notfound";
          else if (status === "module_disabled" || body.error === "module_disabled") outcome = "module_disabled";
          else if (status === "timeout") outcome = "timeout";
          else if (ok && temDados) outcome = "success";
          else if (ok && !temDados) outcome = "notfound";
          else outcome = "provider_error";

          if (body.error) erro = String(body.error).slice(0, 200);
          else if (Array.isArray(body.errors)) erro = body.errors.join("; ").slice(0, 200);
          else if (body.message && outcome !== "success") erro = String(body.message).slice(0, 200);
        } else {
          outcome = "http_error";
          erro = `HTTP ${res.status}: ${typeof body === "string" ? body : JSON.stringify(body).slice(0,200)}`;
        }
      } catch (e: any) {
        if (e.name === "AbortError") { outcome = "timeout"; erro = "timeout 35s"; }
        else { outcome = "http_error"; erro = String(e?.message || e).slice(0, 200); }
      } finally {
        clearTimeout(tid);
      }

      results.push({
        module: mod, input, http: httpStatus, ms: Date.now() - t0,
        outcome, tem_dados: temDados, erro,
        body_keys: body && typeof body === "object" ? Object.keys(body).slice(0, 6) : null,
      });

      if (i < modules.length - 1) await sleep(delay_ms);
    }

    return new Response(JSON.stringify({ results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: String(e?.message || e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
