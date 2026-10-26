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

/** Sonda ADMIN read-only: provas do Hub e MCP, jamais credenciais.
 * HTTP 200 isolado nao equivale a integracao funcional nem a receita P0 ativa.
 */
export const lerSaudeInfraCentralDark = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: papel, error } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .maybeSingle();
    if (error || !papel) throw new Response("Proibido", { status: 403 });

    type Readback = {
      estado: "ONLINE" | "OFFLINE" | "UNKNOWN";
      statusHttp: number | null;
      body: Record<string, unknown> | null;
    };
    const ler = async (url: string): Promise<Readback> => {
      const abort = new AbortController();
      const timeout = setTimeout(() => abort.abort(), 3500);
      try {
        const resposta = await fetch(url, {
          signal: abort.signal,
          cache: "no-store",
          headers: { Accept: "application/json" },
        });
        if (!resposta.ok)
          return { estado: "OFFLINE", statusHttp: resposta.status, body: null };
        const raw: unknown = await resposta.json().catch(() => null);
        const body = raw && typeof raw === "object" && !Array.isArray(raw)
          ? raw as Record<string, unknown> : null;
        const estado = body?.["ok"] === true || body?.["status"] === "ok"
          || body?.["status"] === "healthy" ? "ONLINE" : "UNKNOWN";
        return { estado, statusHttp: resposta.status, body };
      } catch {
        return { estado: "UNKNOWN", statusHttp: null, body: null };
      } finally {
        clearTimeout(timeout);
      }
    };

    const mcpBase = "https://mcp.centralldark.com";
    const [hubHealth, mcpHealth, mcpTools] = await Promise.all([
      ler(`${hubBase()}/health`),
      ler(`${mcpBase}/health`),
      ler(`${mcpBase}/tools.json`),
    ]);

    const health = mcpHealth.body;
    const catalog = mcpTools.body;
    const catalogCount = catalog?.["toolCount"];
    const healthCount = health?.["toolCount"];
    const catalogVersion = catalog?.["catalogVersion"];
    const healthVersion = health?.["catalogVersion"];
    const names = Array.isArray(catalog?.["toolNames"])
      ? (catalog["toolNames"] as unknown[]) : [];
    const catalogo = mcpHealth.estado === "ONLINE" && mcpTools.statusHttp === 200
      && typeof catalogCount === "number" && catalogCount > 0
      && healthCount === catalogCount
      && typeof catalogVersion === "string" && catalogVersion === healthVersion
      && names.includes("centraldark_deploy_micro_fallback")
        ? "PASS" as const : "UNKNOWN" as const;

    const recipeRaw = health?.["recipeFirst"];
    const recipe = recipeRaw && typeof recipeRaw === "object" && !Array.isArray(recipeRaw)
      ? recipeRaw as Record<string, unknown> : null;
    // So a resposta de runtime COM guarda, receita P0 e alias da mesma build
    // autoriza verde. tool no catálogo ou arquivo em GitHub nao bastam.
    const recipePass = catalogo === "PASS" && recipe?.["scope"] === "MCP_HTTP_ONLY"
      && recipe?.["status"] === "PASS"
      && recipe?.["codeStatus"] === "RECIPE_FIRST_MATCHED"
      && recipe?.["priority"] === 0
      && recipe?.["hostedDispatchLocked"] === true
      && recipe?.["adminAliasLoaded"] === true;
    const mcpRecipe = !recipe ? "UNKNOWN" as const
      : recipePass ? "PASS" as const : "DRIFT" as const;

    return {
      hub: hubHealth.estado,
      mcp: mcpHealth.estado,
      hubHttp: hubHealth.statusHttp,
      mcpHttp: mcpHealth.statusHttp,
      mcpCatalogo: catalogo,
      mcpCatalogVersion: typeof healthVersion === "string" ? healthVersion : null,
      mcpToolCount: typeof healthCount === "number" ? healthCount : null,
      mcpRecipe,
      mcpRecipeStatus: typeof recipe?.["codeStatus"] === "string"
        ? recipe["codeStatus"] : "SEM_READBACK_P0",
      mcpRecipeEscopo: "MCP_HTTP_ONLY" as const,
      medidoEm: new Date().toISOString(),
    };
  });
