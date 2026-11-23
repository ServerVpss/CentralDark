import { defineTool } from "@lovable.dev/mcp-js";
import { naoAutenticado, supabaseForUser } from "../supabase";

export default defineTool({
  name: "listar_modulos_portal",
  title: "Listar módulos do portal",
  description: "Lista os módulos publicados no portal do CentralDark, na ordem de exibição.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    if (!ctx.isAuthenticated()) return naoAutenticado();
    const supabase = supabaseForUser(ctx);

    const { data, error } = await supabase
      .from("modulos_portal")
      .select("slug, nome, href, icone, status, ordem")
      .order("ordem", { ascending: true });

    if (error) return { content: [{ type: "text", text: error.message }], isError: true };

    return {
      content: [{ type: "text", text: JSON.stringify(data ?? [], null, 2) }],
      structuredContent: { modulos: data ?? [] },
    };
  },
});
