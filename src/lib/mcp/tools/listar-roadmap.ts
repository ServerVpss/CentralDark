import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { naoAutenticado, supabaseForUser } from "../supabase";

export default defineTool({
  name: "listar_roadmap",
  title: "Listar roadmap",
  description:
    "Lista os itens do roadmap do projeto (título, status, prioridade). Permite filtrar por status.",
  inputSchema: {
    status: z
      .string()
      .trim()
      .min(1)
      .optional()
      .describe("Filtro opcional de status, ex.: pendente, em_andamento, concluido."),
    limite: z.number().int().min(1).max(100).default(20).describe("Quantidade máxima de itens."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ status, limite }, ctx) => {
    if (!ctx.isAuthenticated()) return naoAutenticado();
    const supabase = supabaseForUser(ctx);

    let query = supabase
      .from("project_roadmap")
      .select("id, title, description, status, priority, created_at, completed_at")
      .order("priority", { ascending: true })
      .limit(limite ?? 20);
    if (status) query = query.eq("status", status);

    const { data, error } = await query;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };

    return {
      content: [{ type: "text", text: JSON.stringify(data ?? [], null, 2) }],
      structuredContent: { itens: data ?? [] },
    };
  },
});
