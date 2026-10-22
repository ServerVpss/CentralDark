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
    // Falha na consulta não significa que o usuário perdeu o papel admin.
    // Separar API/RLS indisponível (503) de papel realmente ausente (403).
    if (error) throw new Response("ADMIN_ROLE_CHECK_UNAVAILABLE", { status: 503 });
    return { admin: !!data, medidoEm: new Date().toISOString() };
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


// Despacha somente o workflow canônico; o próprio workflow decide gates e squash.
// A UI nunca recebe o token GitHub e o despacho não é prova de merge/deploy.
export const solicitarPromocaoSegura = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("user_roles").select("role")
      .eq("user_id", context.userId).eq("role", "admin").maybeSingle();
    if (error) throw new Response("ADMIN_ROLE_CHECK_UNAVAILABLE", { status: 503 });
    if (!data) throw new Response("FORBIDDEN", { status: 403 });

    const token = process.env.CENTRALDARK_GITHUB_DISPATCH_TOKEN;
    if (!token) return { state: "BLOCKED" as const, reason: "DISPATCH_TOKEN_NOT_CONFIGURED" };
    try {
      const response = await fetch(
        "https://api.github.com/repos/ServerVpss/CentralDark/actions/workflows/autonomia-promocao.yml/dispatches",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ref: "main" }),
          cache: "no-store",
          redirect: "error",
          signal: AbortSignal.timeout(10000),
        },
      );
      if (response.status !== 204) {
        return { state: "BLOCKED" as const, reason: `GITHUB_DISPATCH_HTTP_${response.status}` };
      }
      return { state: "DISPATCHED" as const, reason: "WORKFLOW_QUEUED_NOT_MERGED_OR_DEPLOYED" };
    } catch {
      return { state: "UNKNOWN" as const, reason: "DISPATCH_RESULT_UNCONFIRMED" };
    }
  });
