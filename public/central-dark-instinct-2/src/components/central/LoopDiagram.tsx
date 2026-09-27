import { useI18n } from "@/lib/i18n";
import { Reveal, SectionHeading } from "./Reveal";
import { ArrowDown, Lock } from "lucide-react";

const STEPS = [1, 2, 3, 4, 5, 6, 7, 8];

const TONE: Record<number, string> = {
  1: "border-neon-blue/40",
  2: "border-neon-blue/40",
  3: "border-neon-purple/45",
  4: "border-neon-purple/45",
  5: "border-gold/45",
  6: "border-neon-green/45",
  7: "border-neon-green/45",
  8: "border-gold/60",
};

export function LoopDiagram() {
  const { t } = useI18n();

  return (
    <section
      id="loop"
      data-key="1"
      className="relative scroll-mt-24 px-4 py-24 sm:px-6"
    >

      <div className="mx-auto max-w-6xl">
        <SectionHeading
          kicker={t("loop.kicker")}
          title={t("loop.title")}
          lead={t("loop.lead")}
          tone="neon"
        />

        <div className="relative mt-16">
          <div
            aria-hidden
            className="animate-orbit pointer-events-none absolute inset-0 mx-auto hidden size-[520px] rounded-full border border-dashed border-border md:block"
            style={{ top: "50%", transform: "translateY(-50%)" }}
          />
          <div className="relative grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((n, i) => (
              <Reveal key={n} delay={i * 60}>
                <div
                  className={`panel h-full border p-5 ${TONE[n]} transition-shadow duration-300 hover:shadow-[0_0_40px_-14px_var(--gold)]`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] tracking-[0.2em] text-muted-foreground">
                      STEP 0{n}
                    </span>
                    {n === 8 ? (
                      <Lock className="size-4 text-gold" />
                    ) : (
                      <ArrowDown className="size-4 rotate-[-90deg] text-muted-foreground" />
                    )}
                  </div>
                  <h3 className="mt-3 text-base font-semibold text-foreground">
                    {t(`loop.s${n}.t`)}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {t(`loop.s${n}.d`)}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal>
            <div className="panel-gold mt-8 flex items-start gap-3 p-5">
              <Lock className="mt-0.5 size-4 shrink-0 text-gold" />
              <p className="font-mono text-xs leading-relaxed text-muted-foreground sm:text-sm">
                {t("loop.note")}
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
