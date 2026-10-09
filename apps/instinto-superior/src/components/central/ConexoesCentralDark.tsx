import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  CircleAlert,
  KeyRound,
  Link2,
  RefreshCw,
  ShieldCheck,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { lerConexoesCentralDark } from "@/lib/conexoes.functions";

const OAUTH_START_SUPPORTED = new Set(["github", "notion", "gdrive", "gmail", "tailscale", "cloudflare"]);

function tom(status: string) {
  if (status === "active" || status === "ok")
    return "border-neon-green/30 bg-neon-green/5 text-neon-green";
  if (status === "error" || status === "fail" || status === "expired") {
    return "border-destructive/40 bg-destructive/10 text-destructive";
  }
  return "border-border bg-muted/40 text-muted-foreground";
}

export function ConexoesCentralDark() {
  const ler = useServerFn(lerConexoesCentralDark);
  const q = useQuery({
    queryKey: ["centraldark", "contas-conexoes"],
    queryFn: () => ler(),
    refetchInterval: 60_000,
    retry: false,
  });

  const dados = q.data;
  const agrupadas = useMemo(() => {
    const mapa = new Map<string, NonNullable<typeof dados>["connections"]>();
    for (const conexao of dados?.connections ?? []) {
      const atual = mapa.get(conexao.provider_id) ?? [];
      atual.push(conexao);
      mapa.set(conexao.provider_id, atual);
    }
    return mapa;
  }, [dados]);

  const providers = useMemo(() => new Map((dados?.providers ?? []).map((p) => [p.id, p])), [dados]);

  const ativas = (dados?.connections ?? []).filter((c) => c.status === "active").length;
  const multi = [...agrupadas.values()].filter((lista) => lista.length > 1).length;

  function conectar(providerId: string) {
    // Transporte OAuth só é acionável quando a consulta viva ao owner retornou PASS.
    if (!dados?.userId || typeof window === "undefined") return;
    if (providerId !== "cloudflare" && dados.estado !== "PASS") return;
    const base = providerId === "cloudflare" ? window.location.origin : dados.fonte.replace(/\/$/, "");
    const params = new URLSearchParams({
      user_id: dados.userId,
      redirect_to: window.location.href,
    });
    window.location.href = `${base}/oauth/${providerId}/start?${params.toString()}`;
  }

  return (
    <section aria-labelledby="contas-conexoes-title">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] tracking-[0.2em] text-neon-blue uppercase">
            Owner canônico · oauth-broker
          </p>
          <h3 id="contas-conexoes-title" className="mt-3 text-2xl font-semibold">
            Contas / Conexões
          </h3>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            Várias contas podem coexistir. Nada é deduplicado ou desconectado automaticamente:
            primeiro mede, identifica a origem e só depois classifica PRIMARY / SECONDARY / TEST /
            LEGACY.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => void q.refetch()} disabled={q.isFetching}>
            <RefreshCw className={q.isFetching ? "animate-spin" : ""} />
            Atualizar
          </Button>
          <Button onClick={() => conectar("cloudflare")} disabled={!dados?.userId}>
            <Link2 />
            Conectar Cloudflare
          </Button>
          <p className="max-w-60 text-xs text-muted-foreground">
            Cloudflare OAuth pelo admin; token guardado no cofre já existente.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="panel p-5">
          <KeyRound className="size-5 text-gold" />
          <span className="mt-3 block font-mono text-[10px] text-muted-foreground uppercase">
            Broker
          </span>
          <strong className="mt-1 block text-xl">{dados?.estado ?? "UNKNOWN"}</strong>
        </article>
        <article className="panel p-5">
          <Users className="size-5 text-neon-blue" />
          <span className="mt-3 block font-mono text-[10px] text-muted-foreground uppercase">
            Conexões
          </span>
          <strong className="mt-1 block text-xl">{dados?.connections.length ?? 0}</strong>
        </article>
        <article className="panel p-5">
          <ShieldCheck className="size-5 text-neon-green" />
          <span className="mt-3 block font-mono text-[10px] text-muted-foreground uppercase">
            Ativas
          </span>
          <strong className="mt-1 block text-xl">{ativas}</strong>
        </article>
        <article className="panel p-5">
          <Link2 className="size-5 text-neon-purple" />
          <span className="mt-3 block font-mono text-[10px] text-muted-foreground uppercase">
            Providers multi-conta
          </span>
          <strong className="mt-1 block text-xl">{multi}</strong>
        </article>
      </div>

      {dados?.erro ? (
        <div className="mt-5 flex gap-3 rounded-lg border border-gold/30 bg-gold/5 p-4 text-sm">
          <CircleAlert className="mt-0.5 size-4 shrink-0 text-gold" />
          <div>
            <strong>Leitura não fechou verde.</strong>
            <p className="mt-1 text-muted-foreground">{dados.erro}</p>
          </div>
        </div>
      ) : null}

      <div className="mt-7 space-y-4">
        {[...agrupadas.entries()].map(([providerId, contas]) => {
          const provider = providers.get(providerId);
          return (
            <article key={providerId} className="panel p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-mono text-[10px] text-muted-foreground uppercase">
                    {providerId}
                  </p>
                  <h4 className="mt-1 font-semibold">{provider?.display_name ?? providerId}</h4>
                </div>
                <span className="rounded-full border border-border px-2 py-1 font-mono text-[10px]">
                  {contas.length} conta(s)
                </span>
              </div>
              <div className="mt-4 grid gap-3 lg:grid-cols-2">
                {contas.map((conta) => (
                  <div
                    key={conta.id}
                    className="rounded-lg border border-border bg-background/50 p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <strong className="truncate text-sm">
                        {conta.account_label || "sem rótulo"}
                      </strong>
                      <span
                        className={`rounded-full border px-2 py-1 font-mono text-[9px] ${tom(conta.status)}`}
                      >
                        {conta.status || "UNKNOWN"}
                      </span>
                    </div>
                    <dl className="mt-3 grid gap-2 text-xs text-muted-foreground">
                      <div className="flex justify-between gap-3">
                        <dt>último teste</dt>
                        <dd className="font-mono">{conta.last_test_status || "UNKNOWN"}</dd>
                      </div>
                      <div className="flex justify-between gap-3">
                        <dt>expira</dt>
                        <dd className="font-mono">
                          {conta.expires_at
                            ? new Date(conta.expires_at).toLocaleString("pt-BR")
                            : "UNKNOWN"}
                        </dd>
                      </div>
                    </dl>
                  </div>
                ))}
              </div>
              {OAUTH_START_SUPPORTED.has(providerId) ? (
                <Button className="mt-4" variant="outline" disabled={!dados?.userId || (providerId !== "cloudflare" && dados?.estado !== "PASS")} onClick={() => conectar(providerId)}>
                  <Link2 />
                  Conectar outra conta
                </Button>
              ) : null}
            </article>
          );
        })}

        {!q.isPending && (dados?.connections.length ?? 0) === 0 ? (
          <div className="panel p-6 text-sm text-muted-foreground">
            Nenhuma conexão retornada pelo broker para esta identidade. UNKNOWN continua UNKNOWN.
          </div>
        ) : null}
      </div>

      <div className="panel mt-7 p-5">
        <h4 className="font-semibold">Fronteira atual</h4>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          ChatGPT accounts, Secure MCP Tunnels e Remote Desktop Commander não são inventados como
          conexões do oauth-broker. Eles entram aqui somente quando houver adapter/receipt
          autorizado. Até lá permanecem como superfícies externas preservadas, não como PASS.
        </p>
        <p className="mt-3 font-mono text-[10px] text-muted-foreground">
          NO_BLIND_DISCONNECT=true · MULTI_ACCOUNT_ALLOWED=true · UNKNOWN_IS_NOT_PASS=true
        </p>
      </div>

      <p className="mt-4 font-mono text-[10px] text-muted-foreground">
        Fonte: {dados?.fonte ?? "UNKNOWN"} · medido em {dados?.medidoEm ?? "UNKNOWN"}
      </p>
    </section>
  );
}
