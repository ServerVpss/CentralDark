import { useEffect, useState } from "react";
import { Menu, X, Languages } from "lucide-react";
import { LANGS, useI18n, type Lang } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { ExportPdf } from "./ExportPdf";


const SECTIONS = [
  { id: "evolucao", key: "nav.evolucao" },
  { id: "principios", key: "nav.principios" },
  { id: "loop", key: "nav.loop" },
  { id: "ledger", key: "nav.ledger" },
  { id: "multimodal", key: "nav.multimodal" },
  { id: "selo", key: "nav.selo" },
  { id: "pacotao", key: "nav.pacotao" },
];

export function Header() {
  const { t, lang, setLang } = useI18n();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-border bg-background/85 backdrop-blur-xl"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <a href="#top" className="flex items-center gap-2.5">
          <span className="relative flex size-8 items-center justify-center rounded-md border border-primary/40 bg-surface">
            <span className="animate-soft-pulse size-2.5 rounded-full bg-primary" />
          </span>
          <span className="flex flex-col leading-none">
            <span className="text-gold-gradient text-sm font-semibold tracking-wide">
              CentralDark
            </span>
            <span className="font-mono text-[10px] tracking-[0.18em] text-muted-foreground uppercase">
              Instinto Superior
            </span>
          </span>
        </a>

        <nav aria-label={t("nav.menu")} className="hidden items-center gap-1 lg:flex">
          {SECTIONS.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="rounded-md px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
            >
              {t(s.key)}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <div
            role="group"
            aria-label={t("nav.langs")}
            className="hidden items-center gap-1 rounded-full border border-border bg-surface/70 p-1 sm:flex"
          >
            <Languages aria-hidden className="mx-1.5 size-3.5 text-muted-foreground" />
            {LANGS.map((l) => (
              <button
                key={l.code}
                type="button"
                onClick={() => setLang(l.code as Lang)}
                aria-pressed={lang === l.code}
                aria-label={l.label}
                className={`min-h-9 min-w-9 rounded-full px-2.5 py-1 font-mono text-[10px] tracking-widest transition-colors ${
                  lang === l.code
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {l.flag}
              </button>
            ))}
          </div>
          <ExportPdf compacto />
          <Button
            variant="ghost"
            size="icon"
            className="min-h-11 min-w-11 lg:hidden"
            aria-label={t("nav.menu")}
            aria-expanded={open}
            aria-controls="menu-mobile"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? (
              <X aria-hidden className="size-5" />
            ) : (
              <Menu aria-hidden className="size-5" />
            )}
          </Button>
        </div>
      </div>

      {open ? (
        <div
          id="menu-mobile"
          className="border-t border-border bg-background/95 px-4 pt-3 pb-5 backdrop-blur-xl lg:hidden"
        >
          <nav aria-label={t("nav.menu")} className="grid grid-cols-2 gap-1">
            {SECTIONS.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2.5 text-sm text-muted-foreground hover:bg-surface hover:text-foreground"
              >
                {t(s.key)}
              </a>
            ))}
          </nav>
          <div
            role="group"
            aria-label={t("nav.langs")}
            className="mt-3 flex gap-1 sm:hidden"
          >
            {LANGS.map((l) => (
              <button
                key={l.code}
                type="button"
                onClick={() => setLang(l.code as Lang)}
                aria-pressed={lang === l.code}
                aria-label={l.label}
                className={`min-h-11 flex-1 rounded-md border border-border px-2 py-2 font-mono text-[11px] tracking-widest ${
                  lang === l.code
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground"
                }`}
              >
                {l.flag}
              </button>
            ))}
          </div>
        </div>
      ) : null}

    </header>
  );
}
