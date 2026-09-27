import { useI18n } from "@/lib/i18n";
import { Reveal, SectionHeading } from "./Reveal";

type Row = {
  code: string;
  key: string;
  locks: boolean;
  classes: string;
};

const ROWS: Row[] = [
  {
    code: "PASS",
    key: "ledger.pass",
    locks: false,
    classes: "text-neon-green border-neon-green/40 bg-neon-green/10",
  },
  {
    code: "FAIL",
    key: "ledger.fail",
    locks: false,
    classes: "text-destructive border-destructive/40 bg-destructive/10",
  },
  {
    code: "UNKNOWN",
    key: "ledger.unknown",
    locks: false,
    classes: "text-muted-foreground border-border bg-surface-2",
  },
  {
    code: "SKIPPED",
    key: "ledger.skipped",
    locks: false,
    classes: "text-muted-foreground border-border bg-surface-2",
  },
  {
    code: "STALE",
    key: "ledger.stale",
    locks: false,
    classes: "text-neon-blue border-neon-blue/40 bg-neon-blue/10",
  },
  {
    code: "PROTECTED_UNPROVEN",
    key: "ledger.protected",
    locks: false,
    classes: "text-neon-purple border-neon-purple/40 bg-neon-purple/10",
  },
  {
    code: "PROVEN",
    key: "ledger.proven",
    locks: true,
    classes: "text-gold border-gold/50 bg-gold/10",
  },
];

export function Ledger() {
  const { t } = useI18n();

  return (
    <section id="ledger" data-key="1" className="relative scroll-mt-24 px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <SectionHeading
          kicker={t("ledger.kicker")}
          title={t("ledger.title")}
          lead={t("ledger.lead")}
        />

        <Reveal className="mt-14">
          <div className="panel overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <caption className="sr-only">{t("ledger.title")}</caption>
              <thead>
                <tr className="border-b border-border bg-surface-2/60 font-mono text-[10px] tracking-[0.18em] text-muted-foreground uppercase">
                  <th scope="col" className="px-4 py-3 font-medium">
                    {t("ledger.col.status")}
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    {t("ledger.col.meaning")}
                  </th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">
                    {t("ledger.col.lock")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {ROWS.map((r) => (
                  <tr
                    key={r.code}
                    className="border-b border-border/60 align-top transition-colors last:border-0 hover:bg-surface-2/40"
                  >
                    <th scope="row" className="px-4 py-4 font-normal">
                      <span
                        className={`inline-block rounded-md border px-2 py-1 font-mono text-[10px] tracking-wider break-all ${r.classes}`}
                      >
                        {r.code}
                      </span>
                    </th>
                    <td className="px-4 py-4 text-sm leading-relaxed text-muted-foreground">
                      {t(r.key)}
                    </td>
                    <td
                      className={`px-4 py-4 text-right font-mono text-[11px] ${
                        r.locks ? "text-gold" : "text-muted-foreground"
                      }`}
                    >
                      {r.locks ? t("ledger.yes") : t("ledger.no")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
