import { createFileRoute } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowRight,
  Binary,
  Check,
  Cpu,
  Download,
  Eye,
  FileText,
  Globe,
  HardDrive,
  Image as ImageIcon,
  Languages,
  Layers,
  Lock,
  Mic,
  ShieldCheck,
  Sparkles,
  Table,
  Video,
} from "lucide-react";

import heroArt from "@/assets/hero-centraldark.jpg";
import { LANGS, useI18n, type Lang } from "@/lib/i18n";
import { ANCORA_CANONICA } from "@/lib/canon";
import { Header } from "@/components/central/Header";
import { Reveal, SectionHeading } from "@/components/central/Reveal";
import { Timeline } from "@/components/central/Timeline";
import { LoopDiagram } from "@/components/central/LoopDiagram";
import { Ledger } from "@/components/central/Ledger";
import { Projecao } from "@/components/central/Projecao";
import { ExportPdf } from "@/components/central/ExportPdf";
import { HermesFlutuante, HermesPeles } from "@/components/central/HermesPet";

import { SeoI18n } from "@/components/central/SeoI18n";
import { Button } from "@/components/ui/button";

const SITE = "https://centraldark-instinto-superior.lovable.app";
const OG_IMAGE = `${SITE}/og-centraldark.jpg`;
const TITULO = "CentralDark — Instinto Superior";
const DESCRICAO =
  "Doutrina dark-neon de prova adversarial: estado vivo primeiro, Meta Lupa, Fable Loop, Judge, evidence ledger e cadeado derivado de prova.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITULO },
      { name: "description", content: DESCRICAO },
      { property: "og:title", content: TITULO },
      { property: "og:description", content: DESCRICAO },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE}/` },
      { property: "og:image", content: OG_IMAGE },
      {
        property: "og:image:alt",
        content: "Cadeado dourado em wireframe com rastros de luz neon sobre fundo preto",
      },
      { property: "og:locale", content: "pt_BR" },
      { property: "og:locale:alternate", content: "en_US" },
      { property: "og:locale:alternate", content: "es_ES" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITULO },
      { name: "twitter:description", content: DESCRICAO },
      { name: "twitter:image", content: OG_IMAGE },
    ],
    links: [
      { rel: "canonical", href: `${SITE}/` },
      { rel: "alternate", hrefLang: "pt-BR", href: `${SITE}/` },
      { rel: "alternate", hrefLang: "en-US", href: `${SITE}/?lang=en-US` },
      { rel: "alternate", hrefLang: "es-ES", href: `${SITE}/?lang=es-ES` },
      { rel: "alternate", hrefLang: "x-default", href: `${SITE}/` },
      // imagem principal entra com prioridade: melhora o tempo de render
      { rel: "preload", as: "image", href: heroArt },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: TITULO,
          url: `${SITE}/`,
          inLanguage: ["pt-BR", "en-US", "es-ES"],
          description: DESCRICAO,
        }),
      },
    ],
  }),
  component: () => (
    <>
      <SeoI18n />
      <PaginaCentralDark />
    </>
  ),
});

function Hero() {
  const { t } = useI18n();
  return (
    <section id="top" className="relative overflow-hidden pt-32 pb-20 sm:pt-40">
      <div aria-hidden className="absolute inset-0 -z-10">
        <img
          src={heroArt}
          alt=""
          width={1536}
          height={1024}
          decoding="async"
          className="h-full w-full object-cover opacity-40"
        />

        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/85 to-background" />
        <div className="grid-mesh absolute inset-0 opacity-40" />
      </div>

      <div className="mx-auto max-w-5xl px-4 text-center sm:px-6">
        <Reveal>
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-surface/70 px-3 py-1.5 font-mono text-[10px] tracking-[0.22em] text-primary uppercase">
            <Sparkles className="size-3" />
            {t("hero.badge")}
          </span>
        </Reveal>

        <Reveal delay={80}>
          <h1 className="mt-7 text-5xl leading-[0.95] font-semibold tracking-tight sm:text-7xl md:text-8xl">
            <span className="text-gold-gradient">{t("hero.title")}</span>
            <span className="mt-2 block text-2xl font-light text-foreground/85 sm:text-4xl">
              {t("hero.subtitle")}
            </span>
          </h1>
        </Reveal>

        <Reveal delay={160}>
          <p className="mx-auto mt-6 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-lg">
            {t("hero.lead")}
          </p>
        </Reveal>

        <Reveal delay={240}>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg" className="glow-gold">
              <a href="#evolucao">
                {t("hero.cta1")} <ArrowRight className="ml-1 size-4" />
              </a>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href="#loop">{t("hero.cta2")}</a>
            </Button>
          </div>
        </Reveal>

        <div className="mt-16 grid gap-4 sm:grid-cols-3">
          {[
            ["hero.stat1", "hero.stat1d", Eye],
            ["hero.stat2", "hero.stat2d", Layers],
            ["hero.stat3", "hero.stat3d", ShieldCheck],
          ].map(([title, desc, Icon], i) => {
            const I = Icon as typeof Eye;
            return (
              <Reveal key={title as string} delay={300 + i * 80}>
                <div className="panel h-full p-5 text-left">
                  <I className="size-4 text-gold" />
                  <p className="mt-3 text-sm font-semibold text-foreground">{t(title as string)}</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {t(desc as string)}
                  </p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Principios() {
  const { t } = useI18n();
  const items = [
    { n: 1, icon: Eye },
    { n: 2, icon: Layers },
    { n: 3, icon: AlertTriangle },
    { n: 4, icon: Cpu },
    { n: 5, icon: Binary },
    { n: 6, icon: Lock },
  ];
  return (
    <section id="principios" className="scroll-mt-24 px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <SectionHeading kicker={t("prin.kicker")} title={t("prin.title")} lead={t("prin.lead")} />
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((it, i) => {
            const Icon = it.icon;
            return (
              <Reveal key={it.n} delay={i * 60}>
                <div className="panel group h-full p-6 transition-transform duration-300 hover:-translate-y-1">
                  <span className="flex size-9 items-center justify-center rounded-lg border border-border bg-surface-2">
                    <Icon className="size-4 text-gold transition-colors group-hover:text-neon-green" />
                  </span>
                  <h3 className="mt-4 text-base font-semibold text-foreground">
                    {t(`prin.${it.n}.t`)}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {t(`prin.${it.n}.d`)}
                  </p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Multimodal() {
  const { t } = useI18n();
  const mods = [
    { k: "text", icon: FileText },
    { k: "image", icon: ImageIcon },
    { k: "audio", icon: Mic },
    { k: "video", icon: Video },
    { k: "code", icon: Binary },
    { k: "data", icon: Table },
  ];
  return (
    <section id="multimodal" className="scroll-mt-24 px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          kicker={t("multi.kicker")}
          title={t("multi.title")}
          lead={t("multi.lead")}
          tone="neon"
        />
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {mods.map((m, i) => {
            const Icon = m.icon;
            return (
              <Reveal key={m.k} delay={i * 60}>
                <div className="panel flex h-full items-start gap-4 p-5">
                  <Icon className="mt-0.5 size-5 shrink-0 text-neon-blue" />
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">{t(`multi.${m.k}`)}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                      {t(`multi.${m.k}d`)}
                    </p>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Idiomas() {
  const { t, lang, setLang } = useI18n();
  return (
    <section id="idiomas" className="scroll-mt-24 px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <SectionHeading kicker={t("lang.kicker")} title={t("lang.title")} lead={t("lang.lead")} />
        <Reveal className="mt-12">
          <div className="panel-gold flex flex-col items-center gap-5 p-7">
            <Languages aria-hidden className="size-5 text-gold" />
            <p className="font-mono text-[11px] tracking-[0.2em] text-muted-foreground uppercase">
              {t("lang.current")}: {lang}
            </p>
            <div
              role="group"
              aria-label={t("nav.langs")}
              className="flex flex-wrap justify-center gap-2"
            >
              {LANGS.map((l) => (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => setLang(l.code as Lang)}
                  aria-pressed={lang === l.code}
                  className={`min-h-11 rounded-lg border px-4 py-2 text-sm transition-colors ${
                    lang === l.code
                      ? "border-primary/60 bg-primary text-primary-foreground"
                      : "border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {l.label} <span className="font-mono text-[10px] opacity-80">{l.code}</span>
                </button>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Selo() {
  const { t } = useI18n();
  return (
    <section id="selo" className="scroll-mt-24 overflow-x-clip px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <SectionHeading kicker={t("selo.kicker")} title={t("selo.title")} lead={t("selo.lead")} />
        <div className="mt-14 grid items-center gap-8 lg:grid-cols-2">
          <Reveal>
            <ul className="space-y-3">
              {["selo.i1", "selo.i2", "selo.i3", "selo.i4"].map((k) => (
                <li key={k} className="panel flex items-start gap-3 p-4">
                  <Check className="mt-0.5 size-4 shrink-0 text-neon-green" />
                  <span className="text-sm leading-relaxed text-muted-foreground">{t(k)}</span>
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={120}>
            <div className="relative mx-auto flex aspect-square w-full max-w-sm items-center justify-center">
              <span
                aria-hidden
                className="animate-orbit absolute inset-0 rounded-full border border-dashed border-primary/30"
              />
              <span
                aria-hidden
                className="animate-soft-pulse absolute inset-8 rounded-full border border-accent/25"
              />
              <div className="panel-gold flex size-44 flex-col items-center justify-center gap-3 rounded-full text-center sm:size-52">
                <Lock className="size-7 text-gold" />
                <p className="text-gold-gradient px-6 font-mono text-[10px] leading-relaxed tracking-[0.18em]">
                  {t("selo.stamp")}
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Pacotao() {
  const { t } = useI18n();
  const packs = [
    { k: "local", icon: HardDrive },
    { k: "online", icon: Globe },
    { k: "dist", icon: Download },
  ];
  return (
    <section id="pacotao" className="scroll-mt-24 px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          kicker={t("pack.kicker")}
          title={t("pack.title")}
          lead={t("pack.lead")}
          tone="neon"
        />
        <div className="mt-14 grid gap-4 md:grid-cols-3">
          {packs.map((p, i) => {
            const Icon = p.icon;
            return (
              <Reveal key={p.k} delay={i * 80}>
                <div className="panel h-full p-6 transition-transform duration-300 hover:-translate-y-1">
                  <Icon className="size-5 text-neon-purple" />
                  <h3 className="mt-4 text-base font-semibold text-foreground">
                    {t(`pack.${p.k}`)}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {t(`pack.${p.k}d`)}
                  </p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Provenance() {
  const { t } = useI18n();
  return (
    <section data-key="1" className="px-4 py-12 sm:px-6">
      <Reveal className="mx-auto max-w-4xl">
        <div className="panel border-destructive/30 p-6">
          <div className="flex items-center gap-3">
            <AlertTriangle aria-hidden className="size-4 text-destructive" />

            <h2 className="text-sm font-semibold text-foreground">{t("prov.title")}</h2>
            <span className="ml-auto rounded-md border border-border bg-surface-2 px-2 py-1 font-mono text-[10px] tracking-wider text-muted-foreground">
              {t("prov.tag")}
            </span>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{t("prov.body")}</p>

          <div className="mt-6 rounded-lg border border-border bg-surface-2 p-4">
            <h3 className="font-mono text-[11px] tracking-wider text-foreground uppercase">
              {t("prov.anchor.title")}
            </h3>
            <dl className="mt-3 grid gap-2 font-mono text-[11px] text-muted-foreground sm:grid-cols-2">
              <div>
                <dt className="text-foreground/70">SOURCE</dt>
                <dd className="break-all">
                  {ANCORA_CANONICA.repositorio}@{ANCORA_CANONICA.branch}
                </dd>
              </div>
              <div>
                <dt className="text-foreground/70">SOURCE_HEAD</dt>
                <dd className="break-all">{ANCORA_CANONICA.sourceHead}</dd>
              </div>
              <div>
                <dt className="text-foreground/70">{t("prov.anchor.measured")}</dt>
                <dd>{ANCORA_CANONICA.medidoEm}</dd>
              </div>
              <div>
                <dt className="text-foreground/70">{t("prov.anchor.owners")}</dt>
                <dd>
                  <ul>
                    {ANCORA_CANONICA.owners.map((owner) => (
                      <li key={owner} className="break-all">
                        {owner}
                      </li>
                    ))}
                  </ul>
                </dd>
              </div>
            </dl>
            <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
              {t("prov.anchor.note")}
            </p>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

function CtaFinal() {
  const { t } = useI18n();
  return (
    <section className="relative overflow-hidden px-4 py-28 sm:px-6">
      <div aria-hidden className="grid-mesh absolute inset-0 opacity-30" />
      <Reveal className="relative mx-auto max-w-4xl text-center">
        <p className="text-3xl leading-tight font-semibold tracking-tight sm:text-5xl">
          <span className="block text-foreground">{t("cta.line1")}</span>
          <span className="text-gold-gradient mt-2 block">{t("cta.line2")}</span>
          <span className="text-neon-gradient mt-2 block">{t("cta.line3")}</span>
        </p>
        <p className="mt-6 text-sm text-muted-foreground">{t("cta.sub")}</p>
        <div className="hairline mx-auto mt-10 w-56" />
      </Reveal>
    </section>
  );
}

function Rodape() {
  const { t } = useI18n();
  return (
    <footer className="border-t border-border px-4 py-10 sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 sm:flex-row">
        <p className="font-mono text-[11px] tracking-wider text-muted-foreground">
          {t("footer.rights")}
        </p>
        <p className="font-mono text-[11px] tracking-wider text-muted-foreground">
          MENOS É MAIS · PROVA &gt; PROMESSA
        </p>
      </div>
    </footer>
  );
}

function ExportacaoPdf() {
  const { t } = useI18n();
  return (
    <section id="pdf" className="scroll-mt-24 px-4 py-20 sm:px-6 print:hidden">
      <div className="mx-auto max-w-4xl">
        <SectionHeading
          kicker={t("pdf.kicker")}
          title={t("pdf.title")}
          lead={t("pdf.lead")}
          tone="neon"
        />
        <Reveal className="mt-12">
          <div className="panel flex flex-col items-center gap-5 p-7 text-center">
            <ExportPdf />
            <p className="max-w-xl font-mono text-[11px] leading-relaxed text-muted-foreground">
              {t("pdf.hint")}
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function PaginaCentralDark() {
  const { t } = useI18n();
  return (
    <div className="min-h-dvh">
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground"
      >
        {t("a11y.skip")}
      </a>
      <Header />
      <main id="conteudo">
        <Hero />
        <Timeline />
        <Principios />
        <LoopDiagram />
        <Ledger />
        <Multimodal />
        <Idiomas />
        <Selo />
        <HermesPeles />
        <Pacotao />
        <Projecao />
        <Provenance />
        <ExportacaoPdf />
        <CtaFinal />
      </main>
      <Rodape />
      <HermesFlutuante />
    </div>
  );
}
