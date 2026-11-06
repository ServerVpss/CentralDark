import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Search, ShieldCheck } from "lucide-react";
import { SyncActionButton } from "@/components/central/SyncActionButton";
import { salvarCredencialTunelLocal, lerTunelLocal, lerEstadoMcpIntegrado } from "@/lib/mcp-admin.functions";

/**
 * Absorve a leitura operacional do legado mcp-admin-ui no Admin CentralDark.
 * UI e login: Instinto Superior. Catálogo e runtime: o MCP canônico permanece.
 * Não cria um novo login nem replica/desvia ações administrativas protegidas.
 */
export function McpAdminIntegrado() {
  const ler = useServerFn(lerEstadoMcpIntegrado);
  const [busca, setBusca] = useState("");
  const q = useQuery({
    queryKey: ["centraldark", "admin", "mcp-integrado"],
    queryFn: () => ler(),
    staleTime: 30_000,
    refetchInterval: 60_000,
    retry: false,
  });
  const ferramentas = useMemo(() => {
    const filtro = busca.trim().toLocaleLowerCase("pt-BR");
    if (!q.data) return [];
    const catalogo = q.data.ferramentas;
    return !filtro ? catalogo : catalogo.filter((item) =>
      [item.name, item.title ?? "", item.description]
        .some((campo) => campo.toLocaleLowerCase("pt-BR").includes(filtro)));
  }, [busca, q.data]);

  const estado = q.data?.estado ?? "UNKNOWN";
  const cor = estado === "PASS" ? "text-neon-green" : "text-amber-500";

  return (
    <section className="panel mb-6 space-y-4 p-5" aria-labelledby="mcp-admin-integrado" data-cd-owner="instinto.admin.mcp">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-wider text-gold">HARNESS / ADMIN CENTRALDARK</p>
          <h3 id="mcp-admin-integrado" className="mt-2 text-xl font-semibold">🪬 MCP Admin · dentro do Cockpit</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Servidor, catálogo e conexões continuam nos owners atuais. Esta é a vista administrativa do próprio Harness,
            sem outra página, senha textual ou segundo MCP.
          </p>
        </div>
        <SyncActionButton label="Atualizar MCP" onClick={() => void q.refetch()} isFetching={q.isFetching} />
      </div>

      <CredencialTunelLocal />
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-md border border-border p-3">
          <p className="text-xs text-muted-foreground">Servidor MCP · saúde HTTP</p>
          <strong className={"mt-1 block text-sm " + cor}>{q.isPending ? "Lendo…" : estado === "PASS" ? "🟢 Respondendo" : estado === "PARTIAL" ? "🟡 Parcial" : "🟡 Desconhecido"}</strong>
          <small className="mt-1 block font-mono text-xs">HTTP {q.data?.healthHttp ?? "—"}</small>
        </div>
        <div className="rounded-md border border-border p-3">
          <p className="text-xs text-muted-foreground">Ferramentas publicadas</p>
          <strong className="mt-1 block text-xl">{q.data?.declaradas ?? "—"}</strong>
          <small className="mt-1 block text-xs text-muted-foreground">Lista ≠ execução autorizada</small>
        </div>
        <div className="rounded-md border border-border p-3">
          <p className="text-xs text-muted-foreground">Catálogo e versão</p>
          <strong className="mt-1 block break-all font-mono text-xs">{q.data?.catalogVersion ?? "UNKNOWN"}</strong>
          <small className="mt-1 block font-mono text-xs">HTTP {q.data?.catalogoHttp ?? "—"}</small>
        </div>
      </div>

      <p role="status" aria-live="polite" className="text-xs text-muted-foreground">
        <ShieldCheck className="mr-1 inline size-3" />
        Fonte: {q.data?.fonte ?? "MCP CentralDark"} · leitura: {q.data?.medidoEm
          ? new Date(q.data.medidoEm).toLocaleString("pt-BR") : "aferição pendente"}.
        {" "}HTTP 200 comprova resposta da rota, não execução de ferramentas.
      </p>
      {q.isError ? (
        <p role="alert" className="rounded-md border border-amber-500/40 p-3 text-sm text-amber-500">
          A leitura administrativa não foi autorizada ou não está disponível nesta sessão. Verifique a sessão do Cockpit.
        </p>
      ) : null}
      {q.data?.motivo ? (
        <p role="alert" className="rounded-md border border-amber-500/40 p-3 font-mono text-xs text-amber-500">
          Causa da leitura incompleta: {q.data.motivo}
        </p>
      ) : null}

      <div className="flex items-center gap-2 rounded-md border border-border px-3">
        <Search className="size-4 text-muted-foreground" />
        <input aria-label="Buscar ferramentas MCP" type="search" value={busca}
          onChange={(event) => setBusca(event.target.value)}
          placeholder="Buscar no catálogo do MCP…"
          className="h-10 w-full bg-transparent text-sm outline-none" />
      </div>
      <p className="text-xs text-muted-foreground">
        {ferramentas.length} ferramenta(s) correspondem à busca · exibindo até 60.
        Administração de contas, conexões, credenciais e auditoria continua nas abas vizinhas deste mesmo painel.
      </p>
      <div className="max-h-80 divide-y overflow-y-auto rounded-md border border-border">
        {ferramentas.slice(0, 60).map((tool) => (
          <div key={tool.name} className="p-3">
            <div className="flex flex-wrap items-center gap-2">
              <strong className="break-all font-mono text-xs">{tool.title ?? tool.name}</strong>
              <span className="rounded border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground">
                {tool.destructive ? "🔒 ADMIN" : tool.readOnly ? "LEITURA" : "CAPACIDADE"}
              </span>
            </div>
            {tool.title ? <p className="mt-1 break-all font-mono text-[10px] text-muted-foreground">{tool.name}</p> : null}
            {tool.description ? <p className="mt-1 text-xs text-muted-foreground">{tool.description}</p> : null}
          </div>
        ))}
        {q.data && ferramentas.length === 0 ? (
          <p className="p-4 text-xs text-muted-foreground">Nenhuma ferramenta encontrada nesta leitura.</p>
        ) : null}
      </div>
    </section>
  );
}

// #OBSERVACOES# @owner: instinto.admin.mcp @doc_ref: README.md
// @last_updated: 2026-11-01T19:13:55.777094+00:00 @implementado: entrada privada, valor limpo apos envio, sem storage no navegador.
function CredencialTunelLocal() {
  const salvar = useServerFn(salvarCredencialTunelLocal);
  const ler = useServerFn(lerTunelLocal);
  const [key, setKey] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const estado = useQuery({queryKey: ['centraldark', 'tunnel-local'], queryFn: () => ler(), retry: false, refetchInterval: 15000});
  async function enviar(event: React.FormEvent) {
    event.preventDefault(); setBusy(true);
    const value = key; setKey('');
    try {
      const result = await salvar({data: {key: value}});
      setMessage(result.state === 'SAVED_RESTART_PENDING' ? 'Chave salva; ativação do serviço ainda pendente.' : 'Chave salva no Linux. Conexão com a OpenAI ainda em verificação.');
      await estado.refetch();
    } catch { setMessage('Não foi possível salvar. Verifique sua sessão admin e a chave informada.'); }
    finally { setBusy(false); }
  }
  return <form onSubmit={(event) => void enviar(event)} className="rounded-md border border-border p-4 space-y-3">
    <h4 className="font-semibold">Túnel OpenAI · Linux / STDIO</h4>
    <p className="text-sm text-muted-foreground">Conecta o MCP privado desta Forja ao ChatGPT e Codex.</p>
    <label htmlFor="openai-tunnel-key" className="block text-sm">Chave de runtime OpenAI (CONTROL_PLANE_API_KEY)</label>
    <input id="openai-tunnel-key" type="password" autoComplete="new-password" spellCheck={false}
      value={key} onChange={(event) => setKey(event.target.value)} required maxLength={503}
      className="w-full rounded border border-border bg-background p-2" placeholder="Cole sua chave de runtime" />
    <button type="submit" disabled={busy || !key || estado.data?.enabled !== true}
      className="rounded bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-50">
      {busy ? 'Salvando…' : 'Salvar e conectar no Linux'}</button>
    <button type="button" className="ml-3 text-sm underline" onClick={() => void estado.refetch()}>Verificar conexão</button>
    <p role="status" className="text-xs text-muted-foreground">{message || (estado.data?.state === 'READY_CHECK_PASSED' ? 'Cliente pronto; chamada pelo plugin ainda precisa de prova.' : estado.data?.enabled ? 'Túnel ainda não conectado. Informe a chave para iniciar.' : 'Acesso local pendente ou sessão admin não confirmada.')}</p>
    <p className="text-xs text-muted-foreground">Valor guardado somente no serviço Linux e nunca devolvido ao navegador. Chave salva não comprova conexão.</p>
  </form>;
}
