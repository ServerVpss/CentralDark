import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// Verificação de admin feita no servidor, pela tabela de papéis (fail-closed).
export const verificarAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .maybeSingle();
    return { admin: !error && !!data, medidoEm: new Date().toISOString() };
  });



// CentralDark Gram: owner MTProto existente na VPS (127.0.0.1:8790).
// Leitura server-side, autenticada e limitada a status. Nunca retorna sessão, me, telefone ou token.
export type StatusGramMTProto = {
  gateway: "RUNNING" | "UNKNOWN";
  configurado: boolean | null;
  sessaoPresente: boolean | null;
  autorizado: boolean | null;
  consultaEm: string;
  owner: "centraldark-telegram-mtproto.service";
  motivo: string | null;
};

export const lerStatusGramMTProto = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<StatusGramMTProto> => {
    const { data, error } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .maybeSingle();
    if (error || !data) throw new Response("Proibido", { status: 403 });

    const base = "http://127.0.0.1:8790";
    const resultado: StatusGramMTProto = {
      gateway: "UNKNOWN",
      configurado: null,
      sessaoPresente: null,
      autorizado: null,
      consultaEm: new Date().toISOString(),
      owner: "centraldark-telegram-mtproto.service",
      motivo: null,
    };
    try {
      const ler = async (path: "/health" | "/status") => {
        const resposta = await fetch(base + path, {
          cache: "no-store",
          redirect: "error",
          signal: AbortSignal.timeout(7000),
        });
        if (!resposta.ok) throw new Error("Upstream HTTP");
        return (await resposta.json()) as Record<string, unknown>;
      };
      const health = await ler("/health");
      if (health.ok !== true) throw new Error("Health not ready");
      resultado.gateway = "RUNNING";
      resultado.configurado = health.configured === true;
      resultado.sessaoPresente = health.hasSession === true;
      if (resultado.configurado && resultado.sessaoPresente) {
        const status = await ler("/status");
        resultado.autorizado =
          status.ok === true && typeof status.connected === "boolean"
            ? status.connected
            : null;
        if (resultado.autorizado === null) resultado.motivo = "STATUS_UNVERIFIED";
      } else {
        resultado.autorizado = false;
        resultado.motivo = "CONFIG_OR_SESSION_MISSING";
      }
    } catch {
      // Sem detalhes da exceção de rede ou dados sensíveis na resposta.
      resultado.motivo = "MTPROTO_INTERNAL_UNREACHABLE";
    }
    return resultado;
  });

// Consumo privado: sem API autorizada de saldo/créditos, nada é inventado.
export const lerConsumoPrivado = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .maybeSingle();
    if (!data) throw new Response("Proibido", { status: 403 });
    return {
      estado: "UNKNOWN" as const,
      motivo: "Nenhuma fonte autorizada de saldo, créditos ou tokens está conectada.",
      itens: [
        { nome: "Saldo Lovable", valor: null },
        { nome: "Créditos consumidos", valor: null },
        { nome: "Tokens", valor: null },
        { nome: "Gasto por provedor/modelo", valor: null },
        { nome: "Orçamento", valor: null },
      ],
      medidoEm: null as string | null,
    };
  });
