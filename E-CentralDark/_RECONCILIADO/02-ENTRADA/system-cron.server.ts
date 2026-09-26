import { supabaseAdmin } from "@/integrations/supabase/client.server";

/** Wrapper que mede duração e atualiza system_jobs.last_*. */
export async function runJob(name: string, fn: () => Promise<Record<string, unknown> | void>) {
  const t0 = Date.now();
  try {
    const result = (await fn()) ?? {};
    const ms = Date.now() - t0;
    await supabaseAdmin.rpc("system_job_record_run", {
      _name: name, _status: "ok", _duration_ms: ms, _error: "",
    });
    return new Response(JSON.stringify({ ok: true, ms, ...result }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    const ms = Date.now() - t0;
    const msg = e instanceof Error ? e.message : String(e);
    await supabaseAdmin.rpc("system_job_record_run", {
      _name: name, _status: "error", _duration_ms: ms, _error: msg.slice(0, 500),
    });
    return new Response(JSON.stringify({ ok: false, ms, error: msg }), {
      status: 500, headers: { "Content-Type": "application/json" },
    });
  }
}

export async function jobIsEnabled(name: string): Promise<boolean> {
  const { data } = await supabaseAdmin.from("system_jobs")
    .select("enabled").eq("name", name).maybeSingle();
  return !!data?.enabled;
}
