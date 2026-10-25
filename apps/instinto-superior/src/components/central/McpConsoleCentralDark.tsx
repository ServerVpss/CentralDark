/**
 * Sala de Controle do MCP: único owner visual no Cockpit CentralDark.
 * Dados continuam no servidor MCP como API, sem HTML/CSS/JS renderizado pelo MCP.
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";

const MCP = "https://mcp.centralldark.com";
const PAINEIS = [
  { id: "status", title: "Estado do MCP", endpoint: "/status.json", publico: true },
  { id: "saude", title: "Saúde", endpoint: "/health", publico: true },
  { id: "catalogo", title: "Catálogo", endpoint: "/tools.json", publico: true },
  { id: "rotas", title: "Rotas", publico: false, endpoint: "/admin/api/rotas" },
  { id: "tools", title: "Ferramentas", publico: false, endpoint: "/admin/api/tools" },
  { id: "logs", title: "Logs", publico: false, endpoint: "/admin/api/logs" },
  { id: "metricas", title: "Métricas", publico: false, endpoint: "/admin/api/metricas" },
  { id: "snapshot", title: "Observabilidade", publico: false, endpoint: "/admin/api/operational-snapshot" },
  { id: "grok", title: "Grok", publico: false, endpoint: "/admin/api/grok/control" },
  { id: "buildkite", title: "Buildkite", publico: false, endpoint: "/admin/api/buildkite/status" },
  { id: "linear", title: "Linear", publico: false, endpoint: "/admin/api/linear" },
  { id: "tailscale", title: "Tailscale", publico: false, endpoint: "/admin/api/tailscale" },
  { id: "intent", title: "Intenção", publico: false, endpoint: "/admin/api/intent" },
  { id: "pareamento", title: "Dispositivos", publico: false, endpoint: "/device/devices" },
] as const;

type Endpoint = (typeof PAINEIS)[number];
type Resultado = { ok?: boolean; error?: string; [campo: string]: unknown };

async function solicitar(endpoint: string, opcoes: RequestInit = {}): Promise<Resultado> {
  const resposta = await fetch(MCP + endpoint, {
    ...opcoes,
    credentials: "include",
    cache: "no-store",
    headers: {
      Accept: "application/json",
      ...(opcoes.body ? { "Content-Type": "application/json" } : {}),
      ...opcoes.headers,
    },
  });
  const tipo = resposta.headers.get("content-type") || "";
  if (!tipo.includes("json")) {
    throw Error("MCP_HTTP_" + resposta.status + "_SEM_JSON");
  }
  const json = (await resposta.json()) as Resultado;
  if (!resposta.ok) {
    throw Error(String(json.error || json.status || "MCP_HTTP_" + resposta.status));
  }
  return json;
}

function JanelaJson({ dados }: { dados: unknown }) {
  return (
    <pre className="max-h-[550px] overflow-auto whitespace-pre-wrap break-all rounded-xl border border-border bg-black/20 p-4 font-mono text-xs leading-5">
      {JSON.stringify(dados, null, 2)}
    </pre>
  );
}

export function McpConsoleCentralDark() {
  const [aba, definirAba] = useState<Endpoint>(PAINEIS[0]);
  const [conteudo, definirConteudo] = useState<Resultado | null>(null);
  const [erro, definirErro] = useState("");
  const [ocupado, definirOcupado] = useState(false);
  const [senha, definirSenha] = useState("");
  const [idPareamento, definirIdPareamento] = useState("");
  const [codigo, definirCodigo] = useState("");
  const [autenticado, definirAutenticado] = useState(false);
  const [atualizadoEm, definirAtualizadoEm] = useState("");
  const principal = useMemo(() => PAINEIS.slice(0, 3), []);
  const privados = useMemo(() => PAINEIS.slice(3), []);

  const atualizar = useCallback(async (selecionado: Endpoint) => {
    definirOcupado(true);
    definirErro("");
    try {
      const resultado = await solicitar(selecionado.endpoint);
      definirConteudo(resultado);
      if (!selecionado.publico) definirAutenticado(true);
      definirAtualizadoEm(new Date().toLocaleTimeString("pt-BR"));
    } catch (e) {
      definirConteudo(null);
      definirErro(e instanceof Error ? e.message : String(e));
      if (!selecionado.publico) definirAutenticado(false);
    } finally {
      definirOcupado(false);
    }
  }, []);

  useEffect(() => { void atualizar(aba); }, [aba, atualizar]);

  async function entrar(evento: React.FormEvent) {
    evento.preventDefault();
    definirOcupado(true);
    definirErro("");
    try {
      const formulario = new URLSearchParams({ password: senha });
      const resposta = await fetch(MCP + "/admin/login", {
        method: "POST",
        credentials: "include",
        headers: { Accept: "application/json", "Content-Type": "application/x-www-form-urlencoded" },
        body: formulario.toString(),
        redirect: "manual",
      });
      if (!resposta.ok) throw Error("LOGIN_MCP_HTTP_" + resposta.status);
      definirAutenticado(true);
      definirSenha("");
      await atualizar(aba);
    } catch (e) {
      definirErro(e instanceof Error ? e.message : String(e));
    } finally {
      definirOcupado(false);
    }
  }

  async function executar(endpoint: string, corpo: Record<string, unknown>) {
    definirOcupado(true);
    definirErro("");
    try {
      const resposta = await solicitar(endpoint, { method: "POST", body: JSON.stringify(corpo) });
      definirConteudo(resposta);
      definirAtualizadoEm(new Date().toLocaleTimeString("pt-BR"));
    } catch (e) {
      definirErro(e instanceof Error ? e.message : String(e));
    } finally {
      definirOcupado(false);
    }
  }

  return (
    <section className="mt-8 rounded-2xl border border-border bg-card/40 p-5" aria-label="CentralDark MCP — Sala de Controle">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">MCP · API única</p>
          <h2 className="mt-2 text-2xl font-bold">CentralDark MCP</h2>
          <p className="mt-2 text-xs text-muted-foreground">
            Serviço: <code>mcp.centralldark.com/api/mcp</code> · Interface exclusivamente nesta Sala de Controle.
          </p>
        </div>
        <Button type="button" variant="outline" onClick={() => void atualizar(aba)} disabled={ocupado}>
          {ocupado ? "Consultando…" : "↻ Atualizar"}
        </Button>
      </div>

      <nav className="mt-5 flex flex-wrap gap-2" aria-label="Áreas do MCP">
        {[...principal, ...privados].map((item) => (
          <Button key={item.id} type="button" size="sm"
            variant={aba.id === item.id ? "default" : "outline"}
            onClick={() => definirAba(item)}>
            {item.title}
          </Button>
        ))}
      </nav>

      <div className="mt-5">
        <div className="mb-3 flex flex-wrap justify-between gap-3 text-xs">
          <strong>{aba.title}</strong>
          <span className="font-mono text-muted-foreground">{atualizadoEm ? "Lido às " + atualizadoEm : "Sem leitura"}</span>
        </div>
        {erro ? <p role="alert" className="mb-4 rounded-lg border border-amber-500 p-3 text-sm text-amber-500">{erro}</p> : null}
        {!aba.publico && !autenticado ? (
          <form onSubmit={(event) => void entrar(event)} className="mb-5 flex flex-wrap gap-2">
            <input type="password" required value={senha} onChange={(e) => definirSenha(e.target.value)}
              className="min-w-[220px] flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm"
              placeholder="Autenticação administrativa MCP" autoComplete="current-password" />
            <Button disabled={ocupado} type="submit">Autenticar MCP</Button>
          </form>
        ) : null}
        {aba.id === "pareamento" && autenticado ? (
          <form className="mb-4 grid gap-3 md:grid-cols-[1fr_1fr_auto]" onSubmit={(e) => {
            e.preventDefault();
            void executar("/device/pair/approve", { id: idPareamento, code: codigo.toUpperCase() });
          }}>
            <input required placeholder="ID do pareamento" value={idPareamento}
              onChange={(e) => definirIdPareamento(e.target.value)}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm" />
            <input required placeholder="Código temporário" value={codigo}
              onChange={(e) => definirCodigo(e.target.value)}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm" />
            <Button disabled={ocupado} type="submit">Aprovar dispositivo</Button>
          </form>
        ) : null}
        {aba.id === "intent" && autenticado ? (
          <Button className="mb-4" variant="outline" disabled={ocupado}
            onClick={() => void executar("/admin/api/e2e", {})}>
            Executar diagnóstico MCP E2E
          </Button>
        ) : null}
        {conteudo ? <JanelaJson dados={conteudo} /> : (
          <p className="rounded-xl border border-border px-4 py-6 text-sm text-muted-foreground">
            {ocupado ? "Consultando API…" : "Sem dados desta leitura."}
          </p>
        )}
      </div>
    </section>
  );
}
