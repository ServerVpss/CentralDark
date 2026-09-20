import { useI18n } from "@/lib/i18n";
import { Reveal, SectionHeading } from "./Reveal";
import {
  Lightbulb,
  Hammer,
  ScanSearch,
  Network,
  ShieldAlert,
  Sparkles,
} from "lucide-react";

const STAGES = [
  { n: 1, icon: Lightbulb, accent: "text-gold" },
  { n: 2, icon: Hammer, accent: "text-neon-blue" },
  { n: 3, icon: ScanSearch, accent: "text-neon-green" },
  { n: 4, icon: Network, accent: "text-neon-purple" },
  { n: 5, icon: ShieldAlert, accent: "text-gold" },
  { n: 6, icon: Sparkles, accent: "text-neon-green" },
];

export function Timeline() {
  const { t } = useI18n();

  return (
    <section
      id="evolucao"
      data-key="1"
      className="relative scroll-mt-24 px-4 py-24 sm:px-6"
    >

      <div className="mx-auto max-w-6xl">
        <SectionHeading
          kicker={t("evo.kicker")}
          title={t("evo.title")}
          lead={t("evo.lead")}
        />

        <ol className="relative mt-16 space-y-6">
          <span
            aria-hidden
            className="absolute top-0 bottom-0 left-4 w-px bg-gradient-to-b from-primary/60 via-accent/40 to-transparent md:left-1/2"
          />
          {STAGES.map((s, i) => {
            const Icon = s.icon;
            const right = i % 2 === 1;
            return (
              <li key={s.n} className="relative">
                <Reveal delay={i * 70}>
                  <div
                    className={`flex flex-col gap-4 md:flex-row md:items-center ${
                      right ? "md:flex-row-reverse" : ""
                    }`}
                  >
                    <div className="md:w-1/2">
                      <div className="panel ml-10 p-5 transition-transform duration-300 hover:-translate-y-1 md:ml-0">
                        <div className="flex items-center gap-3">
                          <Icon className={`size-4 ${s.accent}`} />
                          <span className="font-mono text-[11px] tracking-[0.2em] text-muted-foreground">
                            0{s.n}
                          </span>
                        </div>
                        <h3 className="mt-2 text-lg font-semibold text-foreground">
                          {t(`evo.${s.n}.name`)}
                        </h3>
                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                          {t(`evo.${s.n}.desc`)}
                        </p>
                      </div>
                    </div>
                    <span
                      aria-hidden
                      className="absolute top-6 left-4 size-3 -translate-x-1/2 rounded-full bg-primary shadow-[0_0_0_4px] shadow-primary/20 md:left-1/2"
                    />
                    <div className="hidden md:block md:w-1/2" />
                  </div>
                </Reveal>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
