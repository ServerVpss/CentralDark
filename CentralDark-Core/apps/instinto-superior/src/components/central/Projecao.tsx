import {
  Activity,
  BookOpen,
  CircleSlash,
  Cog,
  GitPullRequest,
  History,
  Lock,
  Network,
  PackageCheck,
  ScrollText,
  Search,
  ShieldCheck,
} from "lucide-react";
import { useMemo, useState } from "react";

import { PROJECAO_CONVERGIDA, type EstadoProva } from "@/lib/canon";
import { useI18n } from "@/lib/i18n";
import { Input } from "@/components/ui/input";
import { Reveal, SectionHeading } from "./Reveal";

/** Cor semântica por estado de prova — verde só quando existe prova medida. */
const TOM: Record<EstadoProva, string> = {
  PROVADO: "border-neon-green/40 text-neon-green",
  UNKNOWN: "border-gold/40 text-gold",
  BLOQUEADO: "border-destructive/50 text-destructive",
  HISTORICO: "border-border text-muted-foreground",
};

const ICONE: Record<EstadoProva, typeof ShieldCheck> = {
  PROVADO: ShieldCheck,
  UNKNOWN: CircleSlash,
  BLOQUEADO: Lock,
  HISTORICO: History,
};

function Selo({ estado }: { estado: EstadoProva }) {
  const { t } = useI18n();
  const Icon = ICONE[estado];
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-md border bg-surface-2 px-2 py-1 font-mono text-[10px] tracking-wider ${TOM[estado]}`}
    >
      <Icon aria-hidden className="size-3" />
      {t(`proj.state.${estado}`)}
    </span>
  );
}

export function Projecao() {
  const { t } = useI18n();
  const p = PROJECAO_CONVERGIDA;
  const [busca, definirBusca] = useState("");
  const termo = busca.trim().toLocaleLowerCase();
  const inclui = (...valores: unknown[]) =>
    !termo || valores.some((valor) => String(valor).toLocaleLowerCase().includes(termo));
  const filtrado = useMemo(
    () => ({
      owners: p.ownersMedidos.filter((item) => inclui(item.path, item.nota, item.estado)),
      filhos: p.funil.filhos.filter((item) =>
        inclui(item.numero, item.titulo, item.estado, item.vinculo),
      ),
      topologia: p.topologia.filter((item) =>
        inclui(item.nome, item.papel, item.evidencia, item.estado),
      ),
      automacoes: p.automacoes.exemplos.filter((item) =>
        inclui(item.nome, item.arquivo, item.nota, item.estado),
      ),
      areas: p.areasConhecimento.filter((item) => inclui(item.path, item.nota, item.estado)),
      saude: p.saude.filter((item) => inclui(item.camada, item.alvo, item.evidencia, item.estado)),
    }),
    [termo],
  );
  const totalEncontrado = Object.values(filtrado).reduce((total, itens) => total + itens.length, 0);

  return (
    <section id="projecao" className="scroll-mt-24 px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          kicker={t("proj.kicker")}
          title={t("proj.title")}
          lead={t("proj.lead")}
          tone="neon"
        />

        {/* Aviso de natureza: representação, nunca execução */}
        <Reveal className="mt-10">
          <p className="panel border-gold/30 p-4 font-mono text-[11px] leading-relaxed text-muted-foreground">
            {t("proj.disclaimer")}
          </p>
        </Reveal>

        <Reveal className="mt-4">
          <label className="technical-search flex items-center gap-3">
            <Search aria-hidden className="size-4 shrink-0 text-gold" />
            <Input
              value={busca}
              onChange={(evento) => definirBusca(evento.target.value)}
              placeholder={t("proj.search.placeholder")}
              aria-label={t("proj.search.label")}
              className="min-h-10 border-0 bg-transparent px-0 font-mono text-xs shadow-none focus-visible:ring-0"
            />
            <span
              aria-live="polite"
              className="shrink-0 font-mono text-[10px] text-muted-foreground"
            >
              {totalEncontrado} {t("proj.search.results")}
            </span>
          </label>
          {termo && totalEncontrado === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">{t("proj.search.empty")}</p>
          ) : null}
        </Reveal>

        {/* HEAD medida */}
        <Reveal className="mt-6">
          <div className="panel-gold p-6">
            <div className="flex flex-wrap items-center gap-3">
              <ScrollText aria-hidden className="size-4 text-gold" />
              <h3 className="text-sm font-semibold text-foreground">{t("proj.head.title")}</h3>
              <span className="ml-auto">
                <Selo estado="PROVADO" />
              </span>
            </div>
            <dl className="mt-5 grid gap-3 font-mono text-[11px] text-muted-foreground sm:grid-cols-2">
              <div>
                <dt className="text-foreground/70">SOURCE_HEAD</dt>
                <dd className="break-all text-neon-blue">{p.head.sha}</dd>
              </div>
              <div>
                <dt className="text-foreground/70">TREE</dt>
                <dd className="break-all">{p.head.tree}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-foreground/70">{t("proj.head.commit")}</dt>
                <dd className="break-words text-foreground/90">{p.head.titulo}</dd>
              </div>
              <div>
                <dt className="text-foreground/70">{t("proj.head.author")}</dt>
                <dd>
                  {p.head.autor} · {p.head.data}
                </dd>
              </div>
              <div>
                <dt className="text-foreground/70">{t("proj.head.sig")}</dt>
                <dd className="text-neon-green">{p.head.assinatura}</dd>
              </div>
            </dl>
          </div>
        </Reveal>

        {/* Owners normativos */}
        <Reveal className="mt-6">
          <div className="panel p-6">
            <h3 className="text-sm font-semibold text-foreground">{t("proj.owners.title")}</h3>
            <ul className="mt-5 space-y-3">
              {filtrado.owners.map((o) => (
                <li key={o.path} className="rounded-lg border border-border bg-surface-2 p-4">
                  <div className="flex flex-wrap items-start gap-3">
                    <p className="font-mono text-[11px] break-all text-foreground">{o.path}</p>
                    <span className="ml-auto">
                      <Selo estado={o.estado} />
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{o.nota}</p>
                  <p className="mt-2 font-mono text-[10px] break-all text-muted-foreground/70">
                    sha {o.sha}
                    {o.bytes > 0 ? ` · ${o.bytes.toLocaleString("pt-BR")} bytes` : ""}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>

        {/* Funil de promoção */}
        <Reveal className="mt-6">
          <div className="panel p-6">
            <div className="flex flex-wrap items-center gap-3">
              <GitPullRequest aria-hidden className="size-4 text-neon-purple" />
              <h3 className="text-sm font-semibold text-foreground">{t("proj.funnel.title")}</h3>
            </div>

            <div className="mt-5 rounded-lg border border-destructive/40 bg-surface-2 p-4">
              <div className="flex flex-wrap items-start gap-3">
                <p className="font-mono text-[11px] text-foreground">
                  #{p.funil.mae.numero} · {p.funil.mae.estado.toUpperCase()}
                </p>
                <span className="ml-auto">
                  <Selo estado={p.funil.mae.estadoProva} />
                </span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-foreground/90">
                {p.funil.mae.titulo}
              </p>
              <p className="mt-2 font-mono text-[10px] tracking-wider text-muted-foreground">
                {p.funil.mae.contrato} · merged={String(p.funil.mae.mergeado)} ·{" "}
                {p.funil.mae.fechadoEm}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-destructive/90">
                {t("proj.funnel.tension")}: {p.funil.mae.tensao}
              </p>
            </div>

            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {filtrado.filhos.map((f) => (
                <li key={f.numero} className="rounded-lg border border-border bg-surface-2 p-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="font-mono text-[11px] text-foreground">
                      #{f.numero} · {f.estado}
                    </p>
                    <span className="ml-auto">
                      <Selo estado={f.estadoProva} />
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.titulo}</p>
                  <p className="mt-2 font-mono text-[10px] text-muted-foreground/70">{f.vinculo}</p>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>

        {/* Topologia: quem executa o quê */}
        <Reveal className="mt-6">
          <div className="panel p-6">
            <div className="flex flex-wrap items-center gap-3">
              <Network aria-hidden className="size-4 text-neon-blue" />
              <h3 className="text-sm font-semibold text-foreground">{t("proj.topo.title")}</h3>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {filtrado.topologia.map((n) => (
                <div key={n.nome} className="rounded-lg border border-border bg-surface-2 p-4">
                  <div className="flex flex-wrap items-start gap-3">
                    <p className="text-sm font-semibold text-foreground">{n.nome}</p>
                    <span className="ml-auto">
                      <Selo estado={n.estado} />
                    </span>
                  </div>
                  <p className="mt-2 font-mono text-[10px] tracking-wider text-gold uppercase">
                    {n.papel}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {n.evidencia}
                  </p>
                  <p className="mt-2 font-mono text-[10px] text-muted-foreground/70">
                    {n.dentroDoLovable ? t("proj.topo.inside") : t("proj.topo.outside")}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        {/* Automações medidas */}
        <Reveal className="mt-6">
          <div className="panel p-6">
            <div className="flex flex-wrap items-center gap-3">
              <Cog aria-hidden className="size-4 text-neon-purple" />
              <h3 className="text-sm font-semibold text-foreground">{t("proj.auto.title")}</h3>
            </div>
            <dl className="mt-5 grid grid-cols-2 gap-3 font-mono text-[11px]">
              <div className="rounded-lg border border-border bg-surface-2 p-3">
                <dt className="tracking-wider text-muted-foreground">{t("proj.auto.total")}</dt>
                <dd className="mt-1 text-lg text-gold">{p.automacoes.total}</dd>
              </div>
              <div className="rounded-lg border border-border bg-surface-2 p-3">
                <dt className="tracking-wider text-muted-foreground">{t("proj.auto.fired")}</dt>
                <dd className="mt-1 text-lg text-neon-green">
                  {p.automacoes.disparadasPorEstaTela}
                </dd>
              </div>
            </dl>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {filtrado.automacoes.map((a) => (
                <li key={a.arquivo} className="rounded-lg border border-border bg-surface-2 p-4">
                  <div className="flex flex-wrap items-start gap-3">
                    <p className="text-sm font-semibold text-foreground">{a.nome}</p>
                    <span className="ml-auto">
                      <Selo estado={a.estado} />
                    </span>
                  </div>
                  <p className="mt-2 font-mono text-[10px] break-all text-muted-foreground/70">
                    {a.arquivo}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{a.nota}</p>
                </li>
              ))}
            </ul>
            <p className="mt-4 font-mono text-[10px] tracking-wider text-muted-foreground">
              {t("proj.auto.note")}
            </p>
          </div>
        </Reveal>

        {/* Áreas de conhecimento */}
        <Reveal className="mt-6">
          <div className="panel p-6">
            <div className="flex flex-wrap items-center gap-3">
              <BookOpen aria-hidden className="size-4 text-neon-blue" />
              <h3 className="text-sm font-semibold text-foreground">{t("proj.areas.title")}</h3>
            </div>
            <ul className="mt-5 grid gap-3 sm:grid-cols-2">
              {filtrado.areas.map((a) => (
                <li key={a.path} className="rounded-lg border border-border bg-surface-2 p-4">
                  <div className="flex flex-wrap items-start gap-3">
                    <p className="font-mono text-[11px] break-all text-foreground">{a.path}</p>
                    <span className="ml-auto">
                      <Selo estado={a.estado} />
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{a.nota}</p>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>

        {/* Saúde em camadas */}
        <Reveal className="mt-6">
          <div className="panel p-6">
            <div className="flex flex-wrap items-center gap-3">
              <Activity aria-hidden className="size-4 text-neon-green" />
              <h3 className="text-sm font-semibold text-foreground">{t("proj.health.title")}</h3>
            </div>
            <ul className="mt-5 space-y-3">
              {filtrado.saude.map((s) => (
                <li key={s.camada} className="rounded-lg border border-border bg-surface-2 p-4">
                  <div className="flex flex-wrap items-start gap-3">
                    <p className="font-mono text-[11px] tracking-wider text-foreground">
                      {s.camada}
                    </p>
                    <span className="ml-auto">
                      <Selo estado={s.estado} />
                    </span>
                  </div>
                  <p className="mt-2 font-mono text-[10px] text-gold">{s.alvo}</p>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {s.evidencia}
                  </p>
                </li>
              ))}
            </ul>
            <p className="mt-4 font-mono text-[10px] leading-relaxed tracking-wider text-muted-foreground">
              {t("proj.health.note")}
            </p>
          </div>
        </Reveal>

        {/* Micro-deploy: NO-OP provado */}
        <Reveal className="mt-6">
          <div className="panel-gold p-6">
            <div className="flex flex-wrap items-center gap-3">
              <PackageCheck aria-hidden className="size-4 text-gold" />
              <h3 className="text-sm font-semibold text-foreground">{t("proj.deploy.title")}</h3>
              <span className="ml-auto">
                <Selo estado={p.microDeploy.estado} />
              </span>
            </div>
            <dl className="mt-5 grid gap-3 font-mono text-[11px] text-muted-foreground sm:grid-cols-2">
              <div>
                <dt className="text-foreground/70">{t("proj.deploy.scope")}</dt>
                <dd className="text-foreground/90">{p.microDeploy.escopo}</dd>
              </div>
              <div>
                <dt className="text-foreground/70">{t("proj.deploy.result")}</dt>
                <dd className="text-neon-green">{p.microDeploy.resultado}</dd>
              </div>
              <div>
                <dt className="text-foreground/70">{t("proj.deploy.mut")}</dt>
                <dd>{p.microDeploy.mutacoes}</dd>
              </div>
              <div>
                <dt className="text-foreground/70">{t("proj.deploy.restart")}</dt>
                <dd>{p.microDeploy.reinicios}</dd>
              </div>
            </dl>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              {p.microDeploy.nota}
            </p>
          </div>
        </Reveal>

        {/* Recibo da matriz */}
        <Reveal className="mt-6">
          <div className="panel p-6">
            <h3 className="text-sm font-semibold text-foreground">{t("proj.matrix.title")}</h3>
            <dl className="mt-5 grid grid-cols-2 gap-3 font-mono text-[11px] sm:grid-cols-4">
              {(
                [
                  ["SAME", p.matriz.same],
                  ["LOCAL_BETTER", p.matriz.localBetter],
                  ["CANONICAL_BETTER", p.matriz.canonicalBetter],
                  ["CANONICAL_MISSING", p.matriz.canonicalMissingLocal],
                  ["LOCAL_UNIQUE", p.matriz.localUniqueUseful],
                  ["DUPLICATE", p.matriz.duplicate],
                  ["UNKNOWN", p.matriz.unknown],
                  ["EXTERNAL_WRITES", p.matriz.escritasExternas],
                ] as const
              ).map(([rotulo, valor]) => (
                <div key={rotulo} className="rounded-lg border border-border bg-surface-2 p-3">
                  <dt className="tracking-wider text-muted-foreground">{rotulo}</dt>
                  <dd className="mt-1 text-lg text-gold">{valor}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 font-mono text-[10px] leading-relaxed tracking-wider text-muted-foreground">
              {t("proj.matrix.note")}
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
