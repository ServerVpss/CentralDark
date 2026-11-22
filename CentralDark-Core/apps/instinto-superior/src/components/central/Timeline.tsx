import { useI18n } from "@/lib/i18n";
import { Reveal, SectionHeading } from "./Reveal";
import { Lightbulb, Hammer, ScanSearch, Network, ShieldAlert, Sparkles } from "lucide-react";

const STAGES = [
  { n: 1, icon: Lightbulb },
  { n: 2, icon: Hammer },
  { n: 3, icon: ScanSearch },
  { n: 4, icon: Network },
  { n: 5, icon: ShieldAlert },
  { n: 6, icon: Sparkles },
];

export function Timeline() {
  const { t } = useI18n();

  return (
    <section id="evolucao" data-key="1" className="relative scroll-mt-24 px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <SectionHeading kicker={t("evo.kicker")} title={t("evo.title")} lead={t("evo.lead")} />

        <ol className="relative mt-16 space-y-8 md:space-y-10">
          <span
            aria-hidden
            className="forge-trail absolute top-3 bottom-3 left-4 w-px md:left-1/2"
          />
          {STAGES.map((s, i) => {
            const Icon = s.icon;
            const right = i % 2 === 1;
            return (
              <li key={s.n} className="group relative">
                <Reveal delay={i * 70}>
                  <div
                    className={`flex flex-col md:flex-row md:items-center ${
                      right ? "md:flex-row-reverse" : ""
                    }`}
                  >
                    <div className="md:w-1/2">
                      <div
                        className={`forge-stage ml-11 p-5 md:ml-0 ${
                          right
                            ? "md:ml-7 md:mr-0 md:hover:-translate-x-1"
                            : "md:mr-7 md:hover:translate-x-1"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon aria-hidden className="size-4 text-ember" />
                          <span className="font-forge-heading text-[11px] tracking-[0.2em] text-gold-soft">
                            0{s.n}
                          </span>
                        </div>
                        <h3 className="font-forge-heading mt-2 text-lg font-semibold text-forge-light">
                          {t(`evo.${s.n}.name`)}
                        </h3>
                        <p className="font-forge-body mt-2 text-sm leading-relaxed text-muted-foreground">
                          {t(`evo.${s.n}.desc`)}
                        </p>
                      </div>
                    </div>
                    <span
                      aria-hidden
                      className={`forge-connector absolute top-7 left-4 h-px w-7 md:left-1/2 ${
                        right ? "md:w-7" : "md:w-7 md:-translate-x-full"
                      }`}
                    />
                    <span
                      aria-hidden
                      className="forge-node absolute top-5 left-4 size-4 -translate-x-1/2 rounded-full md:left-1/2"
                    >
                      <span className="absolute inset-1 rounded-full bg-forge-light" />
                    </span>
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
