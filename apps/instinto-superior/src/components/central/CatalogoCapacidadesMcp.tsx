import { useEffect, useMemo, useState } from "react";
import { ExternalLink, RefreshCw, Search, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

// Projeção de catálogo público já versionado no MCP. NÃO concede execução.
// A fonte do despacho permanece apps/modulos/mcp/src/tools/core/mcp-admin.js.
type CloudflareOperation = [
  method: string,
  path: string,
  summary: string,
  tags: string[],
  pathParams: string[],
  queryParams: string[],
  headerParams: string[],
  contentTypes: string[],
  bodyRequired: boolean,
];
type CompressedCatalog = {
  schema: string;
  source: string;
  captured: string;
  operations: number;
  paths: number;
  sha256: string;
  gzipBase64: string;
};
type ParsedCatalog = { schema: string; operations: CloudflareOperation[] };
type Provider = "cloudflare" | "tailscale" | "centraldark" | "snapchat";
const PAGE_SIZE = 36;
const VALID_METHODS = ["Todos", "GET", "POST", "PUT", "PATCH", "DELETE"] as const;
const LAST_RUNTIME_READBACK = "18/10/2026";
const MCP_ROUTES = [
  ["mcp_admin_catalog", "Descoberta e filtro do catálogo unificado", "READ"],
  ["mcp_admin_call", "Despacho autenticado com auditoria", "ADMIN"],
  ["provider_capabilities", "OpenAPI Cloudflare + matriz de providers", "READ"],
  ["provider_credentials_status", "Estado de credenciais sem revelar valores", "READ"],
  ["provider_read", "Leitura de capability autorizada", "ALLOWLIST"],
  ["provider_mutate", "Mutação protegida com confirmação e idempotência", "GUARDED"],
  ["tailscale_status", "Sonda da tailnet; último probe HTTP 401", "UNKNOWN"],
  ["tailscale_bridge_status", "Ponte Casa ↔ VPS; última medição indisponível", "UNKNOWN"],
  ["github_dispatch_workflow", "Despacho dos owners GitHub Actions", "AUTHORIZED"],
  ["resolve-conflicts.sh", "Resolvedor de PR; execução ainda sem prova", "OWNER"],
] as const;
const PROVIDERS: {id: Provider; label: string; detail: string; status: string}[] = [
  {id: "cloudflare", label: "☁️ Cloudflare", detail: "API / Tunnel / Access / Workers / DNS", status: "CATÁLOGO" },
  {id: "tailscale", label: "🔗 Tailscale", detail: "Malha WireGuard e transporte privado", status: "ÚLTIMO PROBE 401" },
  {id: "centraldark", label: "🪬 MCP + Hermes", detail: "Dispatcher, ferramentas, rotas, auditoria", status: "MCP MEDIDO" },
  {id: "snapchat", label: "👻 Snapchat", detail: "Conta informada; vínculo ainda não demonstrado", status: "NÃO CONECTADO" },
];

async function loadSnapshot(): Promise<CloudflareOperation[]> {
  const response = await fetch("/catalog/cloudflare-openapi.snapshot.json", {
    cache: "no-store",
    credentials: "same-origin",
  });
  if (!response.ok) throw new Error("SNAPSHOT_HTTP_" + response.status);
  const envelope = (await response.json()) as CompressedCatalog;
  if (envelope.schema !== "centraldark.cloudflare.openapi.browser-projection.v1" ||
      envelope.operations !== 3670 || !envelope.sha256 ||
      typeof envelope.gzipBase64 !== "string") {
    throw new Error("CATALOG_SOURCE_INVALID");
  }
  if (typeof DecompressionStream !== "function") {
    throw new Error("DECOMPRESSION_NOT_SUPPORTED");
  }
  const encoded = atob(envelope.gzipBase64);
  const compressed = Uint8Array.from(Array.from(encoded, (ch) => ch.charCodeAt(0)));
  const stream = new Blob([compressed]).stream().pipeThrough(new DecompressionStream("gzip"));
  const raw = await new Response(stream).text();
  // Um snapshot com assinatura divergente não recebe selo de catálogo íntegro.
  if (!globalThis.crypto?.subtle) throw new Error("SHA256_BROWSER_UNAVAILABLE");
  const hashBuffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(raw));
  const hash = Array.from(new Uint8Array(hashBuffer)).map((x) => x.toString(16).padStart(2, "0")).join("");
  if (hash !== envelope.sha256) throw new Error("CATALOG_SHA256_MISMATCH");
  const parsed = JSON.parse(raw) as ParsedCatalog;
  if (parsed.schema !== "centraldark.cloudflare.openapi.operations.v1" ||
      !Array.isArray(parsed.operations) || parsed.operations.length !== envelope.operations) {
    throw new Error("CATALOG_OPERATIONS_INVALID");
  }
  return parsed.operations;
}

export function CatalogoCapacidadesMcp() {
  const [provider, setProvider] = useState<Provider>("cloudflare");
  const [operations, setOperations] = useState<CloudflareOperation[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("");
  const [method, setMethod] = useState<(typeof VALID_METHODS)[number]>("Todos");
  const [page, setPage] = useState(1);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    void loadSnapshot().then((items) => {
      if (active) { setOperations(items); setError(null); }
    }).catch((cause: unknown) => {
      if (active) setError(cause instanceof Error ? cause.message : "CATALOG_UNAVAILABLE");
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const filtered = useMemo(() => {
    if (!operations) return [];
    const q = filter.trim().toLocaleLowerCase("pt-BR");
    return operations.filter((operation) =>
      (method === "Todos" || operation[0] === method) &&
      (!q || [operation[0], operation[1], operation[2], ...operation[3]]
        .some((part) => part.toLocaleLowerCase("pt-BR").includes(q))));
  }, [filter, method, operations]);
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pages);
  const visible = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  async function copyDiscovery(operation: CloudflareOperation) {
    const json = JSON.stringify({
      tool: "provider_capabilities",
      input: { provider: "cloudflare", view: "openapi", method: operation[0], search: operation[1], limit: 5 },
    }, null, 2);
    try {
      await navigator.clipboard.writeText(json);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <section aria-labelledby="catalogo-capacidades-mcp" className="space-y-4">
      <header className="panel p-5">
        <p className="font-mono text-[10px] uppercase tracking-wider text-neon-blue">🧩 ONE MCP · ONE HERMES · DESCOBERTA SOB DEMANDA</p>
        <h3 id="catalogo-capacidades-mcp" className="mt-2 text-xl font-semibold">Catálogo unificado de capacidades</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Busca por função e provider, sem instanciar milhares de ferramentas. O inventário documenta possibilidades;
          autenticação, autorização, transporte e execução são medidos separadamente.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-4">
          <div className="rounded-lg border border-border p-3">
            <strong className="block text-xl">{operations?.length ?? (loading ? "…" : "—")}</strong>
            <span className="text-xs text-muted-foreground">Operações Cloudflare no snapshot</span>
          </div>
          <div className="rounded-lg border border-border p-3">
            <strong className="block text-xl">3.761</strong>
            <span className="text-xs text-muted-foreground">OpenAPI conectada · leitura 18/10</span>
          </div>
          <div className="rounded-lg border border-border p-3">
            <strong className="block text-xl">141</strong>
            <span className="text-xs text-muted-foreground">Ferramentas MCP · última medição {LAST_RUNTIME_READBACK}</span>
          </div>
          <div className="rounded-lg border border-border p-3">
            <strong className="block text-xl">13</strong>
            <span className="text-xs text-muted-foreground">Rotas runtime · última medição {LAST_RUNTIME_READBACK}</span>
          </div>
        </div>
        <p className="mt-3 text-xs text-amber-500">
          SNAPSHOT ≠ CURRENT: catálogo Cloudflare empacotado em 08/10 (3.670 operações);
          a API conectada em 18/10 indicou 3.761. As 91 operações novas aguardam sincronização do snapshot.
          Nenhum número significa permissão para executar.
        </p>
      </header>

      <nav aria-label="Provedores do catálogo" className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        {PROVIDERS.map((item) => (
          <button key={item.id} type="button" aria-pressed={provider === item.id} onClick={() => setProvider(item.id)}
            className={provider === item.id ?
              "rounded-lg border border-neon-blue bg-neon-blue/10 p-3 text-left" :
              "rounded-lg border border-border bg-muted/10 p-3 text-left hover:bg-muted/30"}>
            <strong className="block text-sm">{item.label}</strong>
            <span className="mt-1 block text-xs text-muted-foreground">{item.detail}</span>
            <span className="mt-2 block font-mono text-[10px] text-amber-500">{item.status}</span>
          </button>
        ))}
      </nav>

      {provider === "cloudflare" ? (
        <div className="panel p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h4 className="font-semibold">Cloudflare · operação por operação</h4>
              <p className="mt-1 text-xs text-muted-foreground">
                Busca local no snapshot íntegro (SHA-256 verificado); sem consultar tokens no navegador.
              </p>
            </div>
            <a href="https://developers.cloudflare.com/api/" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs underline"><ExternalLink className="size-3" /> Documentação oficial</a>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <label className="flex min-w-48 flex-1 items-center gap-2 rounded-md border border-border px-3">
              <Search className="size-4 text-muted-foreground" />
              <input type="search" aria-label="Buscar operação Cloudflare" value={filter}
                onChange={(e) => { setFilter(e.target.value); setPage(1); setCopied(false); }}
                className="h-10 min-w-0 flex-1 bg-transparent text-sm outline-none"
                placeholder="Tunnel, Access, DNS, Workers…" />
            </label>
            <select value={method} aria-label="Filtrar método HTTP"
              onChange={(e) => { setMethod(e.target.value as (typeof VALID_METHODS)[number]); setPage(1); }}
              className="min-h-10 rounded-md border border-border bg-background px-3 text-sm">
              {VALID_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          {loading ? <p className="mt-4 flex items-center gap-2 text-sm"><RefreshCw className="size-4 animate-spin" /> Validando catálogo…</p> : null}
          {error ? <p role="alert" className="mt-4 text-xs text-amber-500">
            Não foi possível verificar o snapshot: {error}. Inventário não promovido a PASS.
          </p> : null}
          {operations ? (
            <>
              <p className="mt-3 text-xs text-muted-foreground">{filtered.length} operações correspondem · página {safePage}/{pages} · INVENTORY_ONLY</p>
              <div className="mt-3 max-h-[38rem] divide-y overflow-y-auto rounded-md border border-border">
                {visible.map((op) => (
                  <article key={op[0] + " " + op[1]} className="flex flex-wrap items-start justify-between gap-3 p-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded border border-border px-2 py-0.5 font-mono text-xs">{op[0]}</span>
                        <code className="break-all text-xs">{op[1]}</code>
                      </div>
                      <p className="mt-1 text-sm">{op[2]}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{op[3].slice(0, 3).join(" · ") || "sem tag"} · execução não autorizada pelo inventário</p>
                    </div>
                    <Button size="sm" variant="outline" title="Copiar apenas a consulta de descoberta, sem executar"
                      onClick={() => void copyDiscovery(op)}><Copy className="size-3" /> Consultar</Button>
                  </article>
                ))}
                {visible.length === 0 ? <p className="p-4 text-sm text-muted-foreground">Nenhuma operação encontrada.</p> : null}
              </div>
              <div className="mt-3 flex items-center justify-between gap-3 text-xs">
                <Button type="button" variant="outline" size="sm" disabled={safePage <= 1}
                  onClick={() => setPage((value) => Math.max(1, value - 1))}>Anterior</Button>
                <span>Página {safePage} de {pages} {copied ? "· consulta copiada" : ""}</span>
                <Button type="button" variant="outline" size="sm" disabled={safePage >= pages}
                  onClick={() => setPage((value) => Math.min(pages, value + 1))}>Próxima</Button>
              </div>
            </>
          ) : null}
        </div>
      ) : null}

      {provider === "centraldark" ? (
        <div className="panel p-5">
          <h4 className="font-semibold">Hermes + MCP · rotas operacionais</h4>
          <p className="mt-2 text-xs text-muted-foreground">
            O catálogo completo das 141 ferramentas permanece no servidor autenticado;
            esta projeção exibe entradas conhecidas, sem publicar o catálogo privilegiado como arquivo público.
          </p>
          <div className="mt-3 divide-y rounded-md border border-border">
            {MCP_ROUTES.map(([name, detail, state]) => (
              <div key={name} className="flex flex-wrap items-start justify-between gap-2 p-3 text-sm">
                <div><code className="break-all text-xs">{name}</code><p className="mt-1 text-xs text-muted-foreground">{detail}</p></div>
                <span className="font-mono text-[10px] text-amber-500">{state}</span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Fluxo: mcp_admin_catalog → selecionar capability permitida → mcp_admin_call →
            auditoria → receipt. OAuth administrador não converte catálogo em aprovação universal.
          </p>
        </div>
      ) : null}

      {provider === "tailscale" ? (
        <div className="panel p-5">
          <h4 className="font-semibold">Tailscale · gerenciamento privado</h4>
          <p className="mt-2 text-sm text-muted-foreground">
            A VPN WireGuard conecta Casa, VPS e outros dispositivos; não substitui o login do MCP
            nem concede autorização de ação. O último teste do provider retornou HTTP 401,
            portanto não há prova de sessão Tailscale saudável nesta tela.
          </p>
          <div className="mt-3 space-y-2 font-mono text-xs">
            <p>PROVIDER_CREDENTIAL=CONFIGURED (leitura de 18/10)</p>
            <p>TAILSCALE_API=HTTP_401 · NOT_PASS</p>
            <p>TUNNEL_BROKER=FETCH_FAILED · UNKNOWN</p>
            <p>CAPABILITIES=tailscale_status · tailscale_devices_list · tailscale_bridge_status</p>
          </div>
          <a className="mt-4 inline-flex items-center gap-1 text-xs underline" target="_blank" rel="noopener noreferrer"
            href="https://tailscale.com/kb/1151/what-is-tailscale"><ExternalLink className="size-3" /> Arquitetura Tailscale</a>
        </div>
      ) : null}

      {provider === "snapchat" ? (
        <div className="panel p-5">
          <h4 className="font-semibold">Snapchat · conta informada</h4>
          <p className="mt-2 text-sm text-muted-foreground">
            Conta citada pelo CHEFE. Não foi encontrada uma sessão autorizada do Snapchat
            neste MCP nem um adapter existente comprovado. Nenhuma credencial é solicitada ou armazenada.
          </p>
          <p className="mt-3 font-mono text-xs text-amber-500">CATALOG_ENTRY=true · API_CONNECTION=UNKNOWN · ACTIONS=DISABLED</p>
        </div>
      ) : null}

      <footer className="panel p-4 text-xs text-muted-foreground">
        <strong className="text-foreground">Zero Trust por finalidade:</strong>
        Cloudflare Tunnel / Access = acesso web publicado com política e identidade;
        Tailscale = malha privada entre dispositivos; Hermes = executor;
        MCP CentralDark = catálogo, despacho e auditoria. As funções não compartilham credenciais automaticamente.
        <p className="mt-2">SOURCE_ONLY ≠ DEPLOYED · CATALOGUED ≠ AUTHORIZED ≠ EXECUTED · UNKNOWN ≠ PASS.</p>
      </footer>
    </section>
  );
}
