import { defineTool } from "@lovable.dev/mcp-js";
import { naoAutenticado, supabaseForUser } from "../supabase";

export default defineTool({
  name: "meu_perfil",
  title: "Meu perfil",
  description:
    "Mostra o perfil e os papéis (roles) do usuário conectado no CentralDark.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    if (!ctx.isAuthenticated()) return naoAutenticado();
    const supabase = supabaseForUser(ctx);
    const userId = ctx.getUserId();

    const [{ data: perfil, error: erroPerfil }, { data: papeis, error: erroPapeis }] =
      await Promise.all([
        supabase.from("profiles").select("full_name, avatar_url, created_at").eq("user_id", userId).maybeSingle(),
        supabase.from("user_roles").select("role").eq("user_id", userId),
      ]);

    const erro = erroPerfil ?? erroPapeis;
    if (erro) return { content: [{ type: "text", text: erro.message }], isError: true };

    const resultado = {
      email: ctx.getUserEmail() ?? null,
      nome: perfil?.full_name ?? null,
      criado_em: perfil?.created_at ?? null,
      papeis: (papeis ?? []).map((p) => p.role),
    };

    return {
      content: [{ type: "text", text: JSON.stringify(resultado, null, 2) }],
      structuredContent: resultado,
    };
  },
});
