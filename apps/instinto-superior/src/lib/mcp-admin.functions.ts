import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// A UI humana mora no Harness; este adaptador apenas projeta leituras públicas
// do MESMO servidor MCP. Nenhuma credencial, cookie MCP ou operação admin é
// transportada para o navegador ou inventada por este adaptador.
const MCP_ORIGIN = "https://mcp.centralldark.com";
const TIMEOUT_MS = 7_000;

type Objeto = Record<string, unknown>;

export type FerramentaMcpIntegrada = {
  name: string;
  title: string | null;
  description: string;
  readOnly: boolean;
  destructive: boolean;
};

export type EstadoMcpIntegrado = {
  estado: "PASS" | "PARTIAL" | "UNKNOWN";
  fonte: string;
  medidoEm: string;
  healthHttp: number | null;
  catalogoHttp: number | null;
  service: string | null;
  catalogVersion: string | null;
  declaradas: number | null;
  ferramentas: FerramentaMcpIntegrada[];
  motivo: string | null;
};

function objeto(valor: unknown): valor is Objeto {
  return valor !== null && typeof valor === "object" && !Array.isArray(valor);
}
function texto(valor: unknown): string | null {
  return typeof valor === "string" && valor.trim() ? valor.slice(0, 500) : null;
}

async function lerPublico(path: "/health" | "/tools.json"): Promise<{
  http: number | null;
  dados: Objeto | null;
  erro: string | null;
}> {
  try {
    const resposta = await fetch(MCP_ORIGIN + path, {
      headers: { accept: "application/json" },
      cache: "no-store",
      redirect: "error",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!resposta.ok) return { http: resposta.status, dados: null, erro: path + "_HTTP_" + resposta.status };
    const dados: unknown = await resposta.json();
    if (!objeto(dados)) return { http: resposta.status, dados: null, erro: path + "_INVALID_SCHEMA" };
    return { http: resposta.status, dados, erro: null };
  } catch {
    return { http: null, dados: null, erro: path + "_UNREACHABLE" };
  }
}

export const lerEstadoMcpIntegrado = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<EstadoMcpIntegrado> => {
    const { data: papel, error } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .maybeSingle();

    if (error) throw new Response("ADMIN_ROLE_CHECK_UNAVAILABLE", { status: 503 });
    if (!papel) throw new Response("FORBIDDEN", { status: 403 });

    const [health, catalogo] = await Promise.all([lerPublico("/health"), lerPublico("/tools.json")]);
    const healthOk = health.dados?.['ok'] === true && health.http === 200;
    const toolsRaw = catalogo.dados?.['tools'];
    const ferramentas = Array.isArray(toolsRaw)
      ? toolsRaw.filter(objeto).filter((tool) => typeof tool['name'] === "string" && tool['name'].length > 0)
        .slice(0, 400).map((tool) => ({
          name: String(tool['name']).slice(0, 120),
          title: texto(tool['title']),
          description: texto(tool['description']) ?? "",
          readOnly: tool['readOnly'] === true,
          destructive: tool['destructive'] === true,
        }))
      : [];
    const total = typeof catalogo.dados?.['toolCount'] === "number"
      && Number.isSafeInteger(catalogo.dados['toolCount'])
      ? catalogo.dados['toolCount'] : null;
    const versaoHealth = texto(health.dados?.['catalogVersion']);
    const versaoCatalogo = texto(catalogo.dados?.['catalogVersion']);
    const catalogoIntegro = catalogo.http === 200 && Array.isArray(toolsRaw) && total !== null
      && total === toolsRaw.length && ferramentas.length === toolsRaw.length && versaoHealth !== null
      && versaoHealth === versaoCatalogo;

    const estado: EstadoMcpIntegrado["estado"] = healthOk && catalogoIntegro
      ? "PASS" : healthOk || catalogo.http === 200 ? "PARTIAL" : "UNKNOWN";
    const motivo = estado === "PASS" ? null : health.erro ?? catalogo.erro
      ?? (!healthOk ? "HEALTH_UNVERIFIED" : "CATALOG_VERSION_OR_COUNT_MISMATCH");

    return {
      estado,
      fonte: MCP_ORIGIN,
      medidoEm: new Date().toISOString(),
      healthHttp: health.http,
      catalogoHttp: catalogo.http,
      service: texto(health.dados?.['service']),
      catalogVersion: versaoCatalogo ?? versaoHealth,
      declaradas: total,
      ferramentas,
      motivo,
    };
  });
