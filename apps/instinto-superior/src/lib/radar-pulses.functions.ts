import { createServerFn } from "@tanstack/react-start";
import { hostname } from "node:os";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Estado } from "./cockpit.functions";

type PulseInput = {
  source: string;
  status: Estado;
  httpCode: number | null;
  error: string | null;
};

export const gravarPulsos = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context, data }) => {
    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );
    const host = hostname();

    const linhas = (data as PulseInput[] | undefined)!.map((p: PulseInput) => ({
      source: p.source,
      status: p.status,
      http_code: p.httpCode,
      error: p.error,
      false_green: false,
      regression: false,
      host,
      ttl_seconds: 120,
    }));

    const { error } = await supabaseAdmin
      .from("radar_pulses" as any)
      .insert(linhas as any);

    if (error) {
      console.error("[radar-pulses] Erro ao gravar:", error.message);
      return { ok: false, erro: error.message };
    }

    // Limpa pulsos mais velhos que 24h
    const limite = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    await supabaseAdmin
      .from("radar_pulses" as any)
      .delete()
      .lt("measured_at", limite);

    return { ok: true, gravados: linhas.length };
  });

export const lerUltimosPulsos = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );

    const { data, error } = await supabaseAdmin
      .from("radar_pulses" as any)
      .select("*")
      .order("measured_at", { ascending: false })
      .limit(50);

    if (error) {
      return { ok: false, erro: error.message, pulsos: [] };
    }

    // Deduplica: último pulso por source
    const mapa = new Map<string, any>();
    for (const row of data ?? []) {
      const r = row as any;
      if (!mapa.has(r.source)) {
        mapa.set(r.source, r);
      }
    }

    return { ok: true, erro: null, pulsos: Array.from(mapa.values()) };
  });
