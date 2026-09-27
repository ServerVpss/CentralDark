import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Download,
  Eye,
  FileCode,
  Github,
  History,
  Loader2,
  MonitorPlay,
  Search,
  Sparkles,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { listarArquivosDaLanding, lerArquivo, lerVariosArquivos } from "@/lib/github.functions";
import { compararLandings } from "@/lib/comparar.functions";
import { montarPrevia } from "@/lib/landing-preview";
import { baixarZipDaLanding } from "@/lib/zip-landing";
import {
  formatarQuando,
  lerHistorico,
  limparHistorico,
  registrarHistorico,
  type ItemHistorico,
} from "@/lib/historico-repo";

export const Route = createFileRoute("/repositorio")({
  component: PaginaRepositorio,
  head: () => ({
    meta: [
      { title: "Leitura de Repositório — CentralDark" },
      {
        name: "description",
        content:
          "Área somente leitura para conectar um repositório GitHub, ver a landing page, comparar com a versão atual e exportar em ZIP.",
      },
      { property: "og:title", content: "Leitura de Repositório — CentralDark" },
      {
        property: "og:description",
        content: "Inspeção somente leitura dos arquivos da landing page de um repositório GitHub.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
});

function extrairDono(valor: string) {
  const limpo = valor.trim().replace(/\.git$/, "");
  const casou = limpo.match(/^(?:https?:\/\/github\.com\/)?([^/\s]+)\/([^/\s]+)/);
  if (!casou || !casou[1] || !casou[2]) return null;
  return { owner: casou[1], repo: casou[2] };
}

// Retrato estrutural da landing page atual deste site (mesma origem, só leitura)
async function retratoDaLandingAtual() {
  const resposta = await fetch("/", { headers: { Accept: "text/html" } });
  const html = await resposta.text();
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/\s+/g, " ")
    .slice(0, 60_000);
}

function PaginaRepositorio() {
  const [entrada, setEntrada] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [alvo, setAlvo] = useState<{ owner: string; repo: string } | null>(null);
  const [selecionados, setSelecionados] = useState<string[]>([]);
  const [previa, setPrevia] = useState<string | null>(null);
  const [historico, setHistorico] = useState<ItemHistorico[]>([]);
  const [filtroArquivos, setFiltroArquivos] = useState("");

  const listar = useServerFn(listarArquivosDaLanding);
  const ler = useServerFn(lerArquivo);
  const lerVarios = useServerFn(lerVariosArquivos);
  const comparar = useServerFn(compararLandings);

  useEffect(() => {
    setHistorico(lerHistorico());
  }, []);

  const busca = useMutation({
    mutationFn: (dados: { owner: string; repo: string }) => listar({ data: dados }),
    onSuccess: (dados) => {
      setSelecionados(dados.arquivos.map((a) => a.path).slice(0, 6));
      setHistorico(
        registrarHistorico({
          repo: dados.repo,
          acao: "consulta",
          arquivos: dados.arquivos.map((a) => a.path),
        }),
      );
    },
  });

  const arquivo = useMutation({
    mutationFn: (path: string) => ler({ data: { owner: alvo!.owner, repo: alvo!.repo, path } }),
    onSuccess: (dados) => {
      setHistorico(
        registrarHistorico({
          repo: busca.data?.repo ?? "",
          acao: "leitura",
          arquivos: [dados.path],
        }),
      );
    },
  });

  const mostrarPrevia = useMutation({
    mutationFn: async () => {
      const dados = await lerVarios({
        data: { owner: alvo!.owner, repo: alvo!.repo, paths: selecionados },
      });
      return montarPrevia(dados.arquivos);
    },
    onSuccess: (doc) => {
      setPrevia(doc);
      setHistorico(
        registrarHistorico({
          repo: busca.data?.repo ?? "",
          acao: "previa",
          arquivos: selecionados,
        }),
      );
    },
  });

  const exportarZip = useMutation({
    mutationFn: async () => {
      const dados = await lerVarios({
        data: { owner: alvo!.owner, repo: alvo!.repo, paths: selecionados },
      });
      await baixarZipDaLanding(
        busca.data?.repo ?? "repositorio",
        busca.data?.branch ?? "main",
        dados.arquivos.map((a) => ({ path: a.path, conteudo: a.conteudo })),
      );
    },
    onSuccess: () => {
      setHistorico(
        registrarHistorico({
          repo: busca.data?.repo ?? "",
          acao: "zip",
          arquivos: selecionados,
        }),
      );
    },
  });

  const resumo = useMutation({
    mutationFn: async () => {
      const dados = await lerVarios({
        data: { owner: alvo!.owner, repo: alvo!.repo, paths: selecionados.slice(0, 6) },
      });
      const atual = await retratoDaLandingAtual();
      const resultado = await comparar({
        data: {
          repositorio: dados.arquivos
            .filter((a) => a.conteudo)
            .map((a) => ({ path: a.path, conteudo: a.conteudo })),
          atual,
        },
      });
      return resultado.resumo;
    },
    onSuccess: () => {
      setHistorico(
        registrarHistorico({
          repo: busca.data?.repo ?? "",
          acao: "comparacao",
          arquivos: selecionados.slice(0, 6),
        }),
      );
    },
  });

  function enviar(e: React.FormEvent) {
    e.preventDefault();
    const dados = extrairDono(entrada);
    if (!dados) {
      setErro("Use o formato dono/repositorio ou a URL completa do GitHub.");
      return;
    }
    setErro(null);
    setAlvo(dados);
    setPrevia(null);
    setSelecionados([]);
    arquivo.reset();
    resumo.reset();
    busca.mutate(dados);
  }

  function alternar(path: string) {
    setSelecionados((atual) =>
      atual.includes(path) ? atual.filter((p) => p !== path) : [...atual, path],
    );
  }

  const dados = busca.data;
  const arquivosVisiveis =
    dados?.arquivos.filter((arquivo) =>
      arquivo.path.toLocaleLowerCase().includes(filtroArquivos.trim().toLocaleLowerCase()),
    ) ?? [];
  const podeAgir = Boolean(alvo) && selecionados.length > 0;
  const ocupado = mostrarPrevia.isPending || exportarZip.isPending || resumo.isPending;

  return (
    <main className="min-h-screen bg-background px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8">
          <span className="font-mono text-[10px] tracking-[0.22em] text-muted-foreground uppercase">
            Somente leitura
          </span>
          <h1 className="text-gold-gradient mt-2 flex items-center gap-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            <Github aria-hidden className="size-7 text-primary" />
            Leitura de Repositório
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Informe um repositório para listar apenas os arquivos da landing page, ver a prévia
            isolada, comparar com a versão atual e baixar em ZIP. Nada deste projeto é alterado e
            nada é enviado ao GitHub.
          </p>
        </header>

        <div className="mb-8 flex items-start gap-3 rounded-lg border border-ember/40 bg-ember/5 p-4">
          <AlertTriangle aria-hidden className="mt-0.5 size-4 shrink-0 text-ember" />
          <p className="text-xs leading-relaxed text-muted-foreground">
            <strong className="text-foreground">Provenance:</strong> o conteúdo exibido vem direto
            do repositório consultado no momento da leitura. Nenhum estado é presumido, publicado ou
            sincronizado com este site.
          </p>
        </div>

        <form onSubmit={enviar} className="flex flex-col gap-3 sm:flex-row">
          <Input
            value={entrada}
            onChange={(e) => setEntrada(e.target.value)}
            placeholder="dono/repositorio"
            aria-label="Repositório do GitHub"
            className="min-h-11 font-mono text-sm"
          />
          <Button type="submit" disabled={busca.isPending} className="min-h-11">
            {busca.isPending ? (
              <Loader2 aria-hidden className="size-4 animate-spin" />
            ) : (
              <Search aria-hidden className="size-4" />
            )}
            Ler arquivos
          </Button>
        </form>

        {erro ? (
          <p role="alert" className="mt-3 text-sm text-destructive">
            {erro}
          </p>
        ) : null}

        {busca.isError ? (
          <p role="alert" className="mt-3 text-sm text-destructive">
            Não foi possível ler o repositório. Confira o nome e se a conexão do GitHub está
            liberada para repositórios privados.
          </p>
        ) : null}

        {dados ? (
          <section className="mt-10">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[11px] tracking-wide text-muted-foreground">
              <span className="text-foreground">{dados.repo}</span>
              <span>branch: {dados.branch}</span>
              <span>{dados.privado ? "privado" : "público"}</span>
              <span>{dados.arquivos.length} arquivo(s) da landing</span>
              <span>{selecionados.length} selecionado(s)</span>
            </div>

            {dados.arquivos.length === 0 ? (
              <p className="mt-6 text-sm text-muted-foreground">
                Nenhum arquivo de landing page encontrado neste repositório.
              </p>
            ) : (
              <>
                <label className="technical-search mt-5 flex items-center gap-3">
                  <Search aria-hidden className="size-4 shrink-0 text-gold" />
                  <Input
                    value={filtroArquivos}
                    onChange={(evento) => setFiltroArquivos(evento.target.value)}
                    placeholder="Filtrar arquivos desta leitura"
                    aria-label="Filtrar arquivos desta leitura"
                    className="min-h-10 border-0 bg-transparent px-0 font-mono text-xs shadow-none focus-visible:ring-0"
                  />
                  <span
                    aria-live="polite"
                    className="shrink-0 font-mono text-[10px] text-muted-foreground"
                  >
                    {arquivosVisiveis.length}/{dados.arquivos.length}
                  </span>
                </label>
                <ul className="mt-5 divide-y divide-border rounded-lg border border-border bg-surface/50">
                  {arquivosVisiveis.map((a) => (
                    <li
                      key={a.path}
                      className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
                    >
                      <label className="flex min-w-0 items-center gap-3">
                        <input
                          type="checkbox"
                          checked={selecionados.includes(a.path)}
                          onChange={() => alternar(a.path)}
                          className="size-4 accent-[var(--color-primary)]"
                        />
                        <FileCode aria-hidden className="size-4 shrink-0 text-primary" />
                        <span className="truncate font-mono text-xs text-foreground">{a.path}</span>
                      </label>
                      <span className="flex items-center gap-3">
                        <span className="font-mono text-[10px] text-muted-foreground">
                          {(a.size / 1024).toFixed(1)} KB
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          className="min-h-9"
                          onClick={() => arquivo.mutate(a.path)}
                        >
                          <Eye aria-hidden className="size-3.5" />
                          Ver
                        </Button>
                      </span>
                    </li>
                  ))}
                </ul>
                {arquivosVisiveis.length === 0 ? (
                  <p className="mt-3 text-sm text-muted-foreground">
                    Nenhum arquivo corresponde a essa busca.
                  </p>
                ) : null}

                <div className="mt-5 flex flex-wrap gap-3">
                  <Button
                    className="min-h-11"
                    disabled={!podeAgir || ocupado}
                    onClick={() => mostrarPrevia.mutate()}
                  >
                    {mostrarPrevia.isPending ? (
                      <Loader2 aria-hidden className="size-4 animate-spin" />
                    ) : (
                      <MonitorPlay aria-hidden className="size-4" />
                    )}
                    Prévia isolada
                  </Button>
                  <Button
                    variant="outline"
                    className="min-h-11"
                    disabled={!podeAgir || ocupado}
                    onClick={() => resumo.mutate()}
                  >
                    {resumo.isPending ? (
                      <Loader2 aria-hidden className="size-4 animate-spin" />
                    ) : (
                      <Sparkles aria-hidden className="size-4" />
                    )}
                    Comparar com a versão atual
                  </Button>
                  <Button
                    variant="outline"
                    className="min-h-11"
                    disabled={!podeAgir || ocupado}
                    onClick={() => exportarZip.mutate()}
                  >
                    {exportarZip.isPending ? (
                      <Loader2 aria-hidden className="size-4 animate-spin" />
                    ) : (
                      <Download aria-hidden className="size-4" />
                    )}
                    Baixar ZIP
                  </Button>
                </div>
              </>
            )}
          </section>
        ) : null}

        {mostrarPrevia.isError || exportarZip.isError ? (
          <p role="alert" className="mt-6 text-sm text-destructive">
            Não foi possível ler os arquivos selecionados.
          </p>
        ) : null}

        {previa ? (
          <section className="mt-10">
            <h2 className="font-mono text-xs tracking-[0.18em] text-foreground uppercase">
              Prévia isolada (somente leitura)
            </h2>
            <p className="mt-2 text-xs text-muted-foreground">
              Renderização estática, sem scripts, dentro de uma caixa isolada. Nada é publicado nem
              copiado para este projeto.
            </p>
            <iframe
              title="Prévia isolada da landing page do repositório"
              sandbox=""
              srcDoc={previa}
              className="mt-4 h-[70vh] w-full rounded-lg border border-border bg-white"
            />
          </section>
        ) : null}

        {resumo.isError ? (
          <p role="alert" className="mt-6 text-sm text-destructive">
            {(resumo.error as Error)?.message ?? "Não foi possível gerar a comparação."}
          </p>
        ) : null}

        {resumo.data ? (
          <section className="mt-10">
            <h2 className="font-mono text-xs tracking-[0.18em] text-foreground uppercase">
              Diferenças visuais e estruturais
            </h2>
            <div className="mt-3 rounded-lg border border-border bg-surface/70 p-4 text-sm leading-relaxed whitespace-pre-wrap text-muted-foreground">
              {resumo.data}
            </div>
          </section>
        ) : null}

        {arquivo.isPending ? (
          <p className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 aria-hidden className="size-4 animate-spin" /> Lendo arquivo…
          </p>
        ) : null}

        {arquivo.isError ? (
          <p role="alert" className="mt-6 text-sm text-destructive">
            Não foi possível abrir este arquivo.
          </p>
        ) : null}

        {arquivo.data ? (
          <section className="mt-8">
            <h2 className="font-mono text-xs tracking-wide text-foreground">{arquivo.data.path}</h2>
            <pre className="mt-3 max-h-[60vh] overflow-auto rounded-lg border border-border bg-surface/70 p-4 font-mono text-[11px] leading-relaxed text-muted-foreground">
              <code>{arquivo.data.conteudo || "(arquivo vazio ou binário)"}</code>
            </pre>
          </section>
        ) : null}

        <section className="mt-14">
          <div className="flex items-center justify-between gap-4">
            <h2 className="flex items-center gap-2 font-mono text-xs tracking-[0.18em] text-foreground uppercase">
              <History aria-hidden className="size-4 text-primary" />
              Histórico local
            </h2>
            {historico.length > 0 ? (
              <Button
                variant="ghost"
                size="sm"
                className="min-h-9"
                onClick={() => setHistorico(limparHistorico())}
              >
                <Trash2 aria-hidden className="size-3.5" />
                Limpar
              </Button>
            ) : null}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Guardado apenas neste navegador. Nada é enviado ao GitHub.
          </p>
          {historico.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">Nenhuma consulta registrada ainda.</p>
          ) : (
            <ul className="mt-4 divide-y divide-border rounded-lg border border-border bg-surface/50">
              {historico.map((item, i) => (
                <li key={`${item.quando}-${i}`} className="px-4 py-3">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] text-muted-foreground">
                    <span className="text-foreground">{item.repo || "—"}</span>
                    <span>{item.acao}</span>
                    <span>{formatarQuando(item.quando)}</span>
                  </div>
                  {item.arquivos.length > 0 ? (
                    <p className="mt-1 truncate font-mono text-[10px] text-muted-foreground">
                      {item.arquivos.join(", ")}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
