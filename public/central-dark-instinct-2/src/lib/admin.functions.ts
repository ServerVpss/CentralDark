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
