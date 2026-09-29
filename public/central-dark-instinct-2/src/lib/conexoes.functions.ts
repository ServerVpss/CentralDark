import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const DEFAULT_HUB_BASE = "https://hub.centralldark.com";
const REQUEST_TIMEOUT_MS = 8_000;

type Provider = {
  id: string;
  display_name: string;
  auth_type?: "oauth" | "api_key";
  tier?: number;
};

type Connection = {
  id: string;
  provider_id: string;
  account_label: string | null;
  status: string;
  last_test_status: string | null;
  last_test_at: string | null;
  expires_at: string | null;
};

export type EstadoConexoesCentralDark = {
  estado: "PASS" | "FAIL" | "UNKNOWN";
  fonte: string;
  medidoEm: string;
  userId: string;
  providers: Provider[];
  connections: Connection[];
  erro: string | null;
};

function hubBase() {
  return (process.env["CENTRALDARK_HUB_BASE_URL"] ?? DEFAULT_HUB_BASE).replace(/\/$/, "");
}

export const lerConexoesCentralDark = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<EstadoConexoesCentralDark> => {
    const { data: papel, error: erroPapel } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .maybeSingle();

    if (erroPapel || !papel) throw new Response("Proibido", { status: 403 });

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const resposta = await fetch(
        `${hubBase()}/api/welcome-kit?user_id=${encodeURIComponent(context.userId)}`,
        {
          headers: { accept: "application/json" },
          cache: "no-store",
          signal: controller.signal,
        },
      );

      if (!resposta.ok) {
        return {
          estado: "FAIL",
          fonte: hubBase(),
          medidoEm: new Date().toISOString(),
          userId: context.userId,
          providers: [],
          connections: [],
          erro: `HTTP ${resposta.status}`,
        };
      }

      const payload = (await resposta.json()) as {
        ok?: boolean;
        providers?: Provider[];
        connections?: Connection[];
      };

      return {
        estado: payload.ok === true ? "PASS" : "UNKNOWN",
        fonte: hubBase(),
        medidoEm: new Date().toISOString(),
        userId: context.userId,
        providers: Array.isArray(payload.providers) ? payload.providers : [],
        connections: Array.isArray(payload.connections) ? payload.connections : [],
        erro: payload.ok === true ? null : "Broker respondeu sem ok=true",
      };
    } catch (erro) {
      return {
        estado: "UNKNOWN",
        fonte: hubBase(),
        medidoEm: new Date().toISOString(),
        userId: context.userId,
        providers: [],
        connections: [],
        erro: erro instanceof Error ? erro.message : String(erro),
      };
    } finally {
      clearTimeout(timeout);
    }
  });