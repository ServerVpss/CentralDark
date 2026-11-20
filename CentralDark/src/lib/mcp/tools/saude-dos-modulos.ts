import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { naoAutenticado, supabaseForUser } from "../supabase";

export default defineTool({
  name: "saude_dos_modulos",
  title: "Saúde dos módulos",
  description:
    "Mostra a saúde dos módulos nas últimas 24h: taxa de sucesso, erros e último check.",
  inputSchema: {
    modulo: z.string().trim().min(1).optional().describe("Chave de um módulo específico (module_key)."),
    limite: z.number().int().min(1).max(100).default(30).describe("Quantidade máxima de módulos."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ modulo, limite }, ctx) => {
    if (!ctx.isAuthenticated()) return naoAutenticado();
    const supabase = supabaseForUser(ctx);

    let query = supabase
      .from("module_health_status")
      .select(
        "module_key, health_label, success_rate, total_attempts_24h, error_count_24h, last_check_at, last_failure_at",
      )
      .order("success_rate", { ascending: true })
      .limit(limite ?? 30);
    if (modulo) query = query.eq("module_key", modulo);

    const { data, error } = await query;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };

    return {
      content: [{ type: "text", text: JSON.stringify(data ?? [], null, 2) }],
      structuredContent: { modulos: data ?? [] },
    };
  },
});
