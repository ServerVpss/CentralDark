import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { naoAutenticado, supabaseForUser } from "../supabase";

export default defineTool({
  name: "criar_item_roadmap",
  title: "Criar item no roadmap",
  description:
    "Cria um novo item no roadmap do projeto. Exige que o usuário conectado tenha permissão de admin.",
  inputSchema: {
    titulo: z.string().trim().min(1).max(200).describe("Título curto do item."),
    descricao: z.string().trim().max(2000).optional().describe("Detalhe opcional do item."),
    prioridade: z.number().int().min(0).max(100).default(50).describe("Menor número = maior prioridade."),
    status: z.string().trim().min(1).default("pendente").describe("Status inicial do item."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async ({ titulo, descricao, prioridade, status }, ctx) => {
    if (!ctx.isAuthenticated()) return naoAutenticado();
    const supabase = supabaseForUser(ctx);

    const { data, error } = await supabase
      .from("project_roadmap")
      .insert({
        title: titulo,
        description: descricao ?? null,
        priority: prioridade ?? 50,
        status: status ?? "pendente",
        created_by: ctx.getUserId(),
      })
      .select()
      .maybeSingle();

    if (error) return { content: [{ type: "text", text: error.message }], isError: true };

    return {
      content: [{ type: "text", text: `Item criado: ${data?.title ?? titulo}` }],
      structuredContent: { item: data },
    };
  },
});
