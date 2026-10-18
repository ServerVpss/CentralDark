import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { Eye, EyeOff, Pause, Play, Sparkles } from "lucide-react";

import hojaForjaUrl from "@/assets/hermes-sheet-forja.webp";
import hojaCelestialUrl from "@/assets/hermes-sheet-celestial.webp";
import hojaAscensaoUrl from "@/assets/hermes-sheet-ascensao.webp";
import folhaInstintoUrl from "@/assets/hermes-instinto-superior-sheet.webp";
import folha from "@/lib/hermes-folha.json";
import instinto from "@/lib/hermes-instinto-superior.json";
import { useI18n } from "@/lib/i18n";
import { Reveal, SectionHeading } from "@/components/central/Reveal";
import { JarvisParticleOrb } from "@/components/central/JarvisParticleOrb";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";

export type PeleHermes = "forja" | "celestial" | "ascensao";

const ARMAZEM = "centraldark.hermes.pele";

/** Proporção da célula do atlas: 192 x 208 px. */
const RAZAO = 208 / 192;

export const PELES: {
  id: PeleHermes;
  url: string;
  anel: string;
  brilho: string;
  ponto: string;
  /** Relevo levinho: mesma família de cor da letra do site. */
  glow: string;
  glowSuave: string;
}[] = [
  {
    id: "forja",
    url: hojaForjaUrl,
    anel: "border-gold/60",
    brilho: "0 0 42px -6px color-mix(in oklab, var(--gold) 55%, transparent)",
    ponto: "bg-gold",
    glow: "color-mix(in oklab, var(--gold) 55%, transparent)",
    glowSuave: "color-mix(in oklab, var(--gold) 26%, transparent)",
  },
  {
    id: "celestial",
    url: hojaCelestialUrl,
    anel: "border-neon-blue/60",
    brilho: "0 0 42px -6px color-mix(in oklab, var(--neon-blue) 55%, transparent)",
    ponto: "bg-neon-blue",
    glow: "color-mix(in oklab, var(--neon-blue) 55%, transparent)",
    glowSuave: "color-mix(in oklab, var(--neon-blue) 26%, transparent)",
  },
  {
    id: "ascensao",
    url: hojaAscensaoUrl,
    anel: "border-neon-purple/60",
    brilho: "0 0 42px -6px color-mix(in oklab, var(--neon-purple) 55%, transparent)",
    ponto: "bg-neon-purple",
    glow: "color-mix(in oklab, var(--neon-purple) 55%, transparent)",
    glowSuave: "color-mix(in oklab, var(--neon-purple) 26%, transparent)",
  },
];

/** Poses da folha, medidas quadro a quadro direto dos atlas (alpha por célula). */
export const POSES: { id: string; linha: number; quadros: number }[] = folha.peles.celestial.poses;

/** Quantos quadros abaixo disso já fazem o movimento pular. */
const LIMIAR_CURTO = 6;

const MOVIMENTOS_INSTINTO = instinto.movimentos;

type VisualHermes = "orbe" | "instinto" | "ego" | PeleHermes;
type ControleHermes = {
  visual: VisualHermes;
  movimento: number;
  quadro: number;
  reproduzindo: boolean;
  passeando: boolean;
  direcao: "esquerda" | "direita";
  velocidade: number;
};

const CONTROLE_INICIAL: ControleHermes = {
  visual: "orbe",
  movimento: 0,
  quadro: 0,
  reproduzindo: true,
  passeando: true,
  direcao: "direita",
  velocidade: 70,
};

let estadoControle = CONTROLE_INICIAL;
const ouvintesControle = new Set<() => void>();

function assinarControle(ouvinte: () => void) {
  ouvintesControle.add(ouvinte);
  return () => ouvintesControle.delete(ouvinte);
}

function obterControle() {
  return estadoControle;
}

function publicarControle(parcial: Partial<ControleHermes>) {
  estadoControle = { ...estadoControle, ...parcial };
  ouvintesControle.forEach((ouvinte) => ouvinte());
}

function useControleHermes() {
  const controle = useSyncExternalStore(assinarControle, obterControle, () => CONTROLE_INICIAL);
  const atualizar = (parcial: Partial<ControleHermes>) => {
    publicarControle(parcial);
  };
  return { controle, atualizar };
}

/** Hermes animado: percorre as poses da folha de sprites, com relevo levinho. */
function SpriteHermes({
  pele,
  quadroForcado,
  reproduzindo = true,
  largura,
  apenasPose,
  className,
  rotulo,
}: {
  pele: (typeof PELES)[number];
  largura: number;
  rotulo?: string;
  /** Quando definido, fica só nessa pose e repete os quadros dela. */
  quadroForcado?: number;
  reproduzindo?: boolean;
  apenasPose?: number;
  className?: string;
}) {
  const { t } = useI18n();
  const altura = Math.round(largura * RAZAO);
  const [pose, definirPose] = useState(apenasPose ?? 0);
  const [quadro, definirQuadro] = useState(0);

  useEffect(() => {
    if (!reproduzindo) {
      definirPose(apenasPose ?? 0);
      definirQuadro(quadroForcado ?? 0);
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let p = apenasPose ?? 0;
    let q = 0;
    const timer = window.setInterval(() => {
      const atual = POSES[p]!;
      q += 1;
      if (q >= atual.quadros) {
        q = 0;
        if (apenasPose === undefined) p = (p + 1) % POSES.length;
      }
      definirPose(p);
      definirQuadro(q);
    }, 130);
    return () => window.clearInterval(timer);
  }, [apenasPose, quadroForcado, reproduzindo]);

  const linha = POSES[pose]!.linha;
  // Mesmo pulso queimado nos quadros do pacote: 0,78 a 1,00 dentro da pose.
  const fase = quadro / POSES[pose]!.quadros;
  const pulso = 0.78 + 0.22 * (0.5 - 0.5 * Math.cos(2 * Math.PI * fase));

  return (
    <div
      role="img"
      aria-label={
        apenasPose === undefined
          ? (rotulo ?? t(`pet.${pele.id}`))
          : `${rotulo ?? t(`pet.${pele.id}`)} — ${t(`pet.pose.${POSES[apenasPose]!.id}`)}`
      }
      className={`hermes-sprite ${className ?? ""}`}
      style={
        {
          "--hermes-w": `${largura}px`,
          "--hermes-h": `${altura}px`,
          "--hermes-cols": String(folha.grade.cols),
          "--hermes-rows": String(folha.grade.rows),
          "--hermes-glow": pele.glow,
          "--hermes-glow-soft": pele.glowSuave,
          "--hermes-pulso": pulso.toFixed(3),
          backgroundImage: `url(${pele.url})`,
          backgroundPosition: `${-quadro * largura}px ${-linha * altura}px`,
        } as React.CSSProperties
      }
    />
  );
}

/** Instinto Superior: o mesmo motor, com todas as posturas corporais e luz preservada. */
function SpriteInstintoSuperior({
  largura,
  apenasMovimento,
  quadroForcado,
  reproduzindo = true,
  className,
}: {
  largura: number;
  apenasMovimento?: number;
  quadroForcado?: number;
  reproduzindo?: boolean;
  className?: string;
}) {
  const { t } = useI18n();
  const altura = Math.round(largura * RAZAO);
  const [movimento, definirMovimento] = useState(apenasMovimento ?? 7);
  const [quadro, definirQuadro] = useState(0);
  const movimentoPedidoRef = useRef(apenasMovimento);
  const quadroPedidoRef = useRef(quadroForcado);

  useEffect(() => {
    movimentoPedidoRef.current = apenasMovimento;
    quadroPedidoRef.current = quadroForcado;
    if (!reproduzindo) {
      definirMovimento(apenasMovimento ?? 0);
      definirQuadro(quadroForcado ?? 0);
    }
  }, [apenasMovimento, quadroForcado, reproduzindo]);

  useEffect(() => {
    if (!reproduzindo) return;
    const reduzir = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduzir) {
      definirMovimento(movimentoPedidoRef.current ?? 8);
      definirQuadro(0);
      return;
    }

    let atual = movimentoPedidoRef.current ?? 7;
    let frame = 0;
    let ciclos = 0;
    let animacao = 0;
    let anterior = performance.now();
    let acumulado = 0;
    const passo = 1000 / 60;
    const avancar = () => {
      const pedido = movimentoPedidoRef.current;
      if (pedido !== undefined && pedido !== atual) {
        atual = pedido;
        const novosDados = MOVIMENTOS_INSTINTO[atual];
        frame %= novosDados?.quadros ?? 16;
        ciclos = 0;
      }
      const dados = MOVIMENTOS_INSTINTO[atual];
      if (!dados) return;
      frame += 1;
      if (frame >= dados.quadros) {
        frame = 0;
        ciclos += 1;
        if (movimentoPedidoRef.current === undefined && ciclos >= 4) {
          const opcoes = MOVIMENTOS_INSTINTO.map((_, indice) => indice).filter(
            (indice) => indice !== atual,
          );
          atual = opcoes[Math.floor(Math.random() * opcoes.length)] ?? 8;
          ciclos = 0;
        }
      }
      definirMovimento(atual);
      definirQuadro(frame);
    };
    const atualizarAnimacao = (agora: number) => {
      acumulado += Math.min(agora - anterior, 100);
      anterior = agora;
      while (acumulado >= passo) {
        avancar();
        acumulado -= passo;
      }
      animacao = window.requestAnimationFrame(atualizarAnimacao);
    };
    animacao = window.requestAnimationFrame(atualizarAnimacao);
    return () => window.cancelAnimationFrame(animacao);
  }, [reproduzindo]);

  const dados = MOVIMENTOS_INSTINTO[movimento];
  if (!dados) return null;

  const fase = (quadro / Math.max(1, dados.quadros)) * Math.PI * 2;
  const pulsoAura = 0.88 + (Math.sin(fase) + 1) * 0.12;
  const derivaAura = Math.sin(fase * 2) * 1.5;

  return (
    <div
      role="img"
      aria-label={
        apenasMovimento === undefined
          ? t("pet.instinto")
          : `${t("pet.instinto")} — ${t(`pet.movimento.${dados.id}`)}`
      }
      className={`hermes-sprite hermes-instinto ${className ?? ""}`}
      style={
        {
          "--hermes-w": `${largura}px`,
          "--hermes-h": `${altura}px`,
          "--hermes-rows": String(instinto.grade.rows),
          "--hermes-cols": String(instinto.grade.cols),
          "--hermes-glow": "color-mix(in oklab, var(--neon-blue) 58%, transparent)",
          "--hermes-glow-soft": "color-mix(in oklab, var(--neon-purple) 24%, transparent)",
          "--hermes-atlas": `url(${folhaInstintoUrl})`,
          "--hermes-x": `${-quadro * largura}px`,
          "--hermes-y": `${-dados.linha * altura}px`,
          "--hermes-aura-pulso": pulsoAura.toFixed(3),
          "--hermes-aura-deriva": `${derivaAura.toFixed(2)}px`,
          /* Usa sempre a folha integral: 192 × 208 pixels reais por quadro. */
          backgroundImage: "var(--hermes-atlas)",
          backgroundPosition: "var(--hermes-x) var(--hermes-y)",
        } as React.CSSProperties
      }
    />
  );
}

export function PainelHermes({ compacto = false }: { compacto?: boolean }) {
  const { t } = useI18n();
  const baseId = useId();
  const { controle, atualizar } = useControleHermes();
  const movimento = MOVIMENTOS_INSTINTO[controle.movimento] ?? MOVIMENTOS_INSTINTO[0];
  if (!movimento) return null;
  const pele = PELES.find((item) => item.id === (controle.visual === "ego" ? "ascensao" : controle.visual));
  const poseAntiga = POSES[controle.movimento] ?? POSES[0];
  if (!poseAntiga) return null;
  const maximo = controle.visual === "orbe" ? 1 : controle.visual === "instinto" ? movimento.quadros : poseAntiga.quadros;
  const movimentosDisponiveis = controle.visual === "instinto" ? MOVIMENTOS_INSTINTO : POSES;

  return (
    <div
      className={
        compacto ? "border-y border-neon-blue/25 py-6" : "mt-10 border-y border-neon-blue/25 py-8"
      }
    >
      <div
        className={`grid items-center gap-8 ${compacto ? "xl:grid-cols-[220px_1fr]" : "lg:grid-cols-[260px_1fr]"}`}
      >
        <div className="flex min-h-64 items-center justify-center">
          {controle.visual === "orbe" ? (
            <JarvisParticleOrb size={236} interactive label="JARVIS" />
          ) : controle.visual === "instinto" ? (
            <SpriteInstintoSuperior
              largura={216}
              apenasMovimento={controle.movimento}
              quadroForcado={controle.quadro}
              reproduzindo={controle.reproduzindo}
            />
          ) : pele ? (
            <SpriteHermes
               pele={pele}
               largura={180}
               apenasPose={Math.min(controle.movimento, POSES.length - 1)}
               reproduzindo={controle.reproduzindo}
               quadroForcado={controle.quadro}
               rotulo={controle.visual === "ego" ? t("pet.ego") : undefined}
             />
          ) : null}
        </div>
        <div>
          <p className="font-mono text-[10px] tracking-[0.2em] text-neon-blue uppercase">
            {t("pet.painel")}
          </p>
          <h3 className="mt-3 font-display text-3xl text-foreground">{t("pet.painelTitulo")}</h3>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor={`${baseId}-visual`}>{t("pet.visual")}</Label>
              <Select
                value={controle.visual}
                onValueChange={(visual: VisualHermes) =>
                  atualizar({
                    visual,
                    movimento:
                      visual === "orbe" || visual === "instinto"
                        ? controle.movimento
                        : Math.min(controle.movimento, POSES.length - 1),
                    quadro: 0,
                  })
                }
              >
                <SelectTrigger id={`${baseId}-visual`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="orbe">🫧 JARVIS · orbe de partículas</SelectItem>
                  <SelectItem value="instinto">{t("pet.instinto")}</SelectItem>
                   <SelectItem value="ego">{t("pet.ego")}</SelectItem>
                  {PELES.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {t(`pet.${item.id}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${baseId}-acao`}>{t("pet.acao")}</Label>
              <Select
                value={String(controle.movimento)}
                onValueChange={(valor) => atualizar({ movimento: Number(valor), quadro: 0 })}
              >
                <SelectTrigger id={`${baseId}-acao`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {movimentosDisponiveis.map((item, indice) => (
                    <SelectItem key={item.id} value={String(indice)}>
                      {t(`${controle.visual === "instinto" ? "pet.movimento" : "pet.pose"}.${item.id}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {controle.visual === "orbe" ? (
            <p className="mt-6 text-xs leading-relaxed text-muted-foreground">
              Pele JARVIS ativa. A esfera respira sozinha; com permissão do microfone, reage às frequências reais.
              Movimentos, quadros e velocidade continuam disponíveis nas peles clássicas.
            </p>
          ) : (
            <>
          <div className="mt-6 space-y-3">
            <div className="flex items-center justify-between gap-4">
              <Label htmlFor={`${baseId}-quadro`}>{t("pet.quadro")}</Label>
              <span className="font-mono text-xs text-neon-blue">
                {controle.quadro + 1} / {maximo}
              </span>
            </div>
            <Slider
              id={`${baseId}-quadro`}
              min={0}
              max={maximo - 1}
              step={1}
              value={[Math.min(controle.quadro, maximo - 1)]}
              onValueChange={([quadro = 0]) => atualizar({ quadro, reproduzindo: false })}
              aria-label={t("pet.quadro")}
            />
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => atualizar({ reproduzindo: !controle.reproduzindo })}
            >
              {controle.reproduzindo ? <Pause /> : <Play />}
              {controle.reproduzindo ? t("pet.pausar") : t("pet.reproduzir")}
            </Button>
            <div className="flex items-center gap-2">
              <Switch
                id={`${baseId}-passeio`}
                checked={controle.passeando}
                onCheckedChange={(passeando) => atualizar({ passeando })}
              />
              <Label htmlFor={`${baseId}-passeio`}>{t("pet.passear")}</Label>
            </div>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() =>
                atualizar({ direcao: controle.direcao === "direita" ? "esquerda" : "direita" })
              }
            >
              {controle.direcao === "direita" ? "→" : "←"} {t("pet.direcao")}
            </Button>
          </div>
          <div className="mt-6 space-y-3">
            <div className="flex items-center justify-between gap-4">
              <Label htmlFor={`${baseId}-velocidade`}>{t("pet.velocidade")}</Label>
              <span className="font-mono text-xs text-muted-foreground">{controle.velocidade}</span>
            </div>
            <Slider
              id={`${baseId}-velocidade`}
              min={30}
              max={180}
              step={10}
              value={[controle.velocidade]}
              onValueChange={([velocidade = 70]) => atualizar({ velocidade })}
              aria-label={t("pet.velocidade")}
            />
          </div>            </>
          )}
        </div>
      </div>
    </div>
  );
}

function HermesInstintoFolha() {
  const { t } = useI18n();

  return (
    <div className="mt-10">
      <div className="border-y border-neon-blue/25 py-8">
        <div className="grid items-center gap-8 md:grid-cols-[minmax(220px,0.7fr)_1.3fr]">
          <div className="flex justify-center">
            <SpriteInstintoSuperior largura={216} />
          </div>
          <div>
            <p className="font-mono text-[10px] tracking-[0.2em] text-neon-blue uppercase">
              {t("pet.adm")}
            </p>
            <h3 className="mt-3 font-display text-3xl text-foreground">{t("pet.instinto")}</h3>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              {t("pet.instintoLead")}
            </p>
            <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 font-mono text-[10px] tracking-[0.14em] text-muted-foreground uppercase">
              <span>{t("pet.dezMovimentos")}</span>
              <span>{t("pet.setentaOitoQuadros")}</span>
              <span className="text-neon-blue">{t("pet.luzMedida")}</span>
            </div>
          </div>
        </div>
      </div>

      <h3 className="mt-12 font-mono text-[11px] tracking-[0.22em] text-foreground uppercase">
        {t("pet.movimentos")}
      </h3>
      <p className="mt-2 text-sm text-muted-foreground">{t("pet.movimentosLead")}</p>
      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {MOVIMENTOS_INSTINTO.map((movimento, indice) => (
          <li key={movimento.id} className="panel flex flex-col items-center gap-3 p-4 text-center">
            <SpriteInstintoSuperior largura={96} apenasMovimento={indice} />
            <span className="font-mono text-[10px] tracking-[0.14em] text-foreground uppercase">
              {t(`pet.movimento.${movimento.id}`)}
            </span>
            <span className="font-mono text-[10px] tracking-[0.12em] text-neon-blue uppercase">
              {movimento.quadros} {t("pet.quadros")} · {t("pet.provado")}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Folha completa: cada pose rodando, com os quadros medidos. */
function HermesFolha({ pele }: { pele: (typeof PELES)[number] }) {
  const { t } = useI18n();

  return (
    <div className="mt-14">
      <h3 className="font-mono text-[11px] tracking-[0.22em] text-foreground uppercase">
        {t("pet.folha")}
      </h3>
      <p className="mt-2 text-sm text-muted-foreground">{t("pet.folhaLead")}</p>
      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {POSES.map((p, i) => {
          const curta = p.quadros < LIMIAR_CURTO;
          return (
            <li key={p.id} className="panel flex flex-col items-center gap-3 p-5 text-center">
              <SpriteHermes pele={pele} largura={108} apenasPose={i} />
              <span className="font-mono text-[10px] tracking-[0.18em] text-foreground uppercase">
                {t(`pet.pose.${p.id}`)}
              </span>
              <span
                className={`font-mono text-[10px] tracking-[0.14em] uppercase ${
                  curta ? "text-gold" : "text-muted-foreground"
                }`}
              >
                {p.quadros} {t("pet.quadros")} · {t("pet.provado")}
              </span>
              {curta && (
                <span className="text-[11px] leading-relaxed text-gold/80">{t("pet.curta")}</span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** Pele escolhida, guardada localmente e compartilhada entre a seção e o flutuante. */
export function usePeleHermes() {
  const [pele, definirPele] = useState<PeleHermes>("celestial");

  useEffect(() => {
    const salva = localStorage.getItem(ARMAZEM);
    if (salva === "forja" || salva === "celestial" || salva === "ascensao") {
      definirPele(salva);
    }
    const ouvir = (e: Event) => {
      const detalhe = (e as CustomEvent<PeleHermes>).detail;
      if (detalhe) definirPele(detalhe);
    };
    window.addEventListener("centraldark:pele", ouvir);
    return () => window.removeEventListener("centraldark:pele", ouvir);
  }, []);

  const trocar = (nova: PeleHermes) => {
    definirPele(nova);
    localStorage.setItem(ARMAZEM, nova);
    window.dispatchEvent(new CustomEvent<PeleHermes>("centraldark:pele", { detail: nova }));
  };

  return { pele, trocar };
}

/** Seção com as três peles do Hermes. */
export function HermesPeles() {
  const { t } = useI18n();
  const { pele, trocar } = usePeleHermes();
  const peleAtual = PELES.find((p) => p.id === pele);
  const ascensao = PELES.find((p) => p.id === "ascensao");
  const { controle, atualizar } = useControleHermes();
  if (!peleAtual || !ascensao) return null;

  return (
    <section id="hermes" className="scroll-mt-24 px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          kicker={t("pet.kicker")}
          title={t("pet.title")}
          lead={t("pet.lead")}
          tone="neon"
        />
        <PainelHermes />
        <div role="group" aria-label={t("pet.dupla")} className="mt-8 grid gap-4 sm:grid-cols-2">
          <button
            type="button"
            aria-pressed={controle.visual === "instinto"}
            onClick={() => atualizar({ visual: "instinto", movimento: 0, quadro: 0 })}
            className={`panel flex flex-col items-center gap-3 p-5 text-center transition-colors ${controle.visual === "instinto" ? "border-neon-blue" : "hover:border-neon-blue/60"}`}
          >
            <SpriteInstintoSuperior largura={96} apenasMovimento={0} />
            <span className="font-semibold text-foreground">{t("pet.instinto")}</span>
            <span className="text-xs text-muted-foreground">{t("pet.instintoFace")}</span>
          </button>
          <button
            type="button"
            aria-pressed={controle.visual === "ego"}
            onClick={() => atualizar({ visual: "ego", movimento: 0, quadro: 0 })}
            className={`panel flex flex-col items-center gap-3 p-5 text-center transition-colors ${controle.visual === "ego" ? "border-neon-purple" : "hover:border-neon-purple/60"}`}
          >
            <SpriteHermes pele={ascensao} largura={96} apenasPose={0} rotulo={t("pet.ego")} />
            <span className="font-semibold text-foreground">{t("pet.ego")}</span>
            <span className="text-xs text-muted-foreground">{t("pet.egoLead")}</span>
          </button>
        </div>
        <p className="mt-3 text-center text-xs text-muted-foreground">{t("pet.duplaNota")}</p>
        <HermesInstintoFolha />
        <div className="mt-16 border-t border-border pt-10">
          <p className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
            {t("pet.memoria")}
          </p>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{t("pet.memoriaLead")}</p>
        </div>
        <div role="group" aria-label={t("pet.skins")} className="mt-14 grid gap-5 sm:grid-cols-3">
          {PELES.map((p, i) => {
            const ativa = p.id === pele;
            return (
              <Reveal key={p.id} delay={i * 80}>
                <button
                  type="button"
                  onClick={() => trocar(p.id)}
                  aria-pressed={ativa}
                  className={`panel group flex h-full w-full flex-col items-center gap-4 p-6 text-center transition-all ${
                    ativa ? `${p.anel} scale-[1.015]` : "border-border hover:border-foreground/25"
                  }`}
                  style={ativa ? { boxShadow: p.brilho } : undefined}
                >
                  <SpriteHermes pele={p} largura={144} />
                  <div className="flex items-center gap-2">
                    <span className={`size-1.5 rounded-full ${p.ponto}`} />
                    <h3 className="font-mono text-[11px] tracking-[0.22em] text-foreground uppercase">
                      {t(`pet.${p.id}`)}
                    </h3>
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {t(`pet.${p.id}d`)}
                  </p>
                </button>
              </Reveal>
            );
          })}
        </div>
        <HermesFolha pele={peleAtual} />
      </div>
    </section>
  );
}

/** Hermes flutuante no canto, com a pele escolhida. */
export function HermesFlutuante() {
  const { t } = useI18n();
  const [visivel, definirVisivel] = useState(true);
  const [montado, definirMontado] = useState(false);
  const { controle, atualizar } = useControleHermes();
  const [x, definirX] = useState(12);
  const [pausado, definirPausado] = useState(false);
  const xRef = useRef(12);
  const direcaoRef = useRef(controle.direcao === "direita" ? 1 : -1);

  useEffect(() => definirMontado(true), []);
  useEffect(() => {
    try {
      definirVisivel(localStorage.getItem("centraldark.hermes.visivel") !== "false");
    } catch {
      /* armazenamento indisponível */
    }
  }, []);
  useEffect(() => {
    direcaoRef.current = controle.direcao === "direita" ? 1 : -1;
  }, [controle.direcao]);
  useEffect(() => {
    if (controle.visual === "orbe" || !controle.passeando || window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      return;
    let anterior = performance.now();
    let id = 0;
    let distanciaDesdePausa = 0;
    let pausaAte = 0;
    const mover = (agora: number) => {
      if (agora < pausaAte) {
        definirPausado(true);
        anterior = agora;
        id = requestAnimationFrame(mover);
        return;
      }
      definirPausado(false);
      const largura = window.innerWidth < 640 ? 96 : 132;
      const maximo = Math.max(12, window.innerWidth - largura - 12);
      const delta = controle.velocidade * ((agora - anterior) / 1000);
      let proximo = xRef.current + direcaoRef.current * delta;
      distanciaDesdePausa += delta;
      if (proximo >= maximo) {
        proximo = maximo;
        direcaoRef.current = -1;
        atualizar({ direcao: "esquerda" });
      }
      if (proximo <= 12) {
        proximo = 12;
        direcaoRef.current = 1;
        atualizar({ direcao: "direita" });
      }
      if (distanciaDesdePausa > Math.max(420, window.innerWidth * 0.65)) {
        pausaAte = agora + 1600;
        distanciaDesdePausa = 0;
      }
      xRef.current = proximo;
      definirX(proximo);
      anterior = agora;
      id = requestAnimationFrame(mover);
    };
    id = requestAnimationFrame(mover);
    return () => cancelAnimationFrame(id);
  }, [controle.visual, controle.passeando, controle.velocidade]);
  if (!montado) return null;
  const peleFlutuante = PELES.find((item) => item.id === (controle.visual === "ego" ? "ascensao" : controle.visual));
  const movimentoFlutuante = controle.passeando
    ? pausado
      ? 6
      : controle.direcao === "direita"
        ? 1
        : 2
    : controle.movimento;

  return (
    <div
      data-hermes-flutuante
      className="pointer-events-none fixed bottom-2 z-20 flex max-w-16 flex-col items-end gap-1 opacity-75 print:hidden sm:bottom-5 sm:z-40 sm:max-w-none sm:gap-2 sm:opacity-100"
      style={controle.visual === "orbe" ? { right: 12 } : { left: `${x}px` }}
    >
      {visivel && (
        <div className="animate-[flutuar_4.5s_ease-in-out_infinite] motion-reduce:animate-none">
          {controle.visual === "orbe" ? (
            <JarvisParticleOrb size={typeof window !== "undefined" && window.innerWidth < 640 ? 96 : 146} label="JARVIS" />
          ) : controle.visual === "instinto" ? (
            <SpriteInstintoSuperior
              largura={typeof window !== "undefined" && window.innerWidth < 640 ? 48 : 132}
              apenasMovimento={movimentoFlutuante}
              quadroForcado={controle.quadro}
              reproduzindo={controle.reproduzindo}
            />
          ) : peleFlutuante ? (
            <SpriteHermes
              pele={peleFlutuante}
              largura={typeof window !== "undefined" && window.innerWidth < 640 ? 48 : 132}
              apenasPose={Math.min(movimentoFlutuante, POSES.length - 1)}
              quadroForcado={controle.quadro}
              reproduzindo={controle.reproduzindo}
              rotulo={controle.visual === "ego" ? t("pet.ego") : undefined}
            />
          ) : null}
        </div>
      )}
      <button
        type="button"
        onClick={() =>
          definirVisivel((v) => {
            const proximo = !v;
            try {
              localStorage.setItem("centraldark.hermes.visivel", String(proximo));
            } catch {
              /* armazenamento indisponível */
            }
            return proximo;
          })
        }
        aria-pressed={!visivel}
        className="pointer-events-auto flex min-h-9 items-center gap-1.5 rounded-full border border-border bg-card/85 px-3 py-1.5 font-mono text-[10px] tracking-[0.18em] text-muted-foreground uppercase backdrop-blur transition-colors hover:text-foreground"
      >
        {visivel ? (
          <EyeOff aria-hidden className="size-3.5" />
        ) : (
          <Eye aria-hidden className="size-3.5" />
        )}
        <span className="sr-only sm:not-sr-only">{visivel ? t("pet.hide") : t("pet.show")}</span>
        <Sparkles aria-hidden className="size-3 text-gold" />
      </button>
    </div>
  );
}
