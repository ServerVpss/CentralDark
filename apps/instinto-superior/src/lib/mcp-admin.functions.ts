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

// #OBSERVACOES# @owner: instinto.admin.mcp @doc_ref: README.md
// @last_updated: 2026-11-01T19:13:55.777094+00:00 @implementado: credencial local do tunel, somente admin, sem retorno do valor.
export const salvarCredencialTunelLocal = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => {
    const key = (input as { key?: unknown } | null)?.key;
    if (typeof key !== "string" || !/^sk-[A-Za-z0-9_-]{20,500}$/.test(key))
      throw new Response("CREDENCIAL_INVALIDA", { status: 400 });
    return { key };
  })
  .handler(async ({ context, data }) => {
    const role = await context.supabase.from("user_roles").select("role")
      .eq("user_id", context.userId).eq("role", "admin").maybeSingle();
    if (role.error) throw new Response("ADMIN_ROLE_CHECK_UNAVAILABLE", { status: 503 });
    if (!role.data) throw new Response("FORBIDDEN", { status: 403 });
    if (process.env['CENTRALDARK_LOCAL_TUNNEL_ENABLED'] !== '1')
      throw new Response("LOCAL_TUNNEL_NOT_ENABLED", { status: 503 });
    const fs = await import('node:fs/promises');
    const os = await import('node:os');
    const path = await import('node:path');
    const crypto = await import('node:crypto');
    const dir = path.join(os.homedir(), '.config/tunnel-client');
    const dest = path.join(dir, 'centraldark-casa.env');
    await fs.mkdir(dir, { recursive: true, mode: 0o700 });
    const temporary = path.join(dir, '.credential-' + crypto.randomUUID());
    try {
      await fs.writeFile(temporary, 'CONTROL_PLANE_API_KEY=' + data.key + '\n', {mode: 0o600, flag: 'wx'});
      await fs.rename(temporary, dest);
    } catch {
      await fs.unlink(temporary).catch(() => {});
      throw new Response("CREDENTIAL_SAVE_FAILED", { status: 503 });
    }
    let restartRequested = false;
    try {
      const { execFile } = await import('node:child_process');
      await new Promise<void>((resolve, reject) => {
        execFile('systemctl', ['--user', 'restart', 'centraldark-mcp-tunnel.service'], {timeout: 10000}, (error) => error ? reject(new Error('RESTART_PENDING')) : resolve());
      });
      restartRequested = true;
    } catch { /* Valor salvo; retorno distingue ativação ainda pendente. */ }
    return { saved: true, state: restartRequested ? "SAVED_NOT_VERIFIED" : "SAVED_RESTART_PENDING", measuredAt: new Date().toISOString() };
  });

export const lerTunelLocal = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const role = await context.supabase.from("user_roles").select("role")
      .eq("user_id", context.userId).eq("role", "admin").maybeSingle();
    if (role.error) throw new Response("ADMIN_ROLE_CHECK_UNAVAILABLE", { status: 503 });
    if (!role.data) throw new Response("FORBIDDEN", { status: 403 });
    if (process.env['CENTRALDARK_LOCAL_TUNNEL_ENABLED'] !== '1') return { enabled: false, state: 'UNAVAILABLE' };
    try {
      const response = await fetch('http://127.0.0.1:8742/readyz', {cache: 'no-store', redirect: 'error', signal: AbortSignal.timeout(3000)});
      return { enabled: true, state: response.ok ? 'READY_CHECK_PASSED' : 'NOT_READY' };
    } catch { return {enabled: true, state: 'NOT_CONNECTED'}; }
  });
