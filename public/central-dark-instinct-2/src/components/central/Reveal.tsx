import { useEffect, useRef, useState, type ReactNode } from "react";

// Revela o bloco quando ele entra na tela (animação sutil)
export function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`${className} ${visible ? "animate-rise" : "opacity-0"}`}
      style={visible ? { animationDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}

export function SectionHeading({
  kicker,
  title,
  lead,
  tone = "gold",
}: {
  kicker: string;
  title: string;
  lead?: string;
  tone?: "gold" | "neon";
}) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <span className="inline-block rounded-full border border-border bg-surface/60 px-3 py-1 font-mono text-[11px] tracking-[0.22em] text-muted-foreground uppercase">
        {kicker}
      </span>
      <h2
        className={`mt-5 text-3xl leading-tight font-semibold tracking-tight sm:text-4xl md:text-5xl ${
          tone === "gold" ? "text-gold-gradient" : "text-neon-gradient"
        }`}
      >
        {title}
      </h2>
      {lead ? (
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">{lead}</p>
      ) : null}
      <div className="hairline mx-auto mt-8 w-40" />
    </div>
  );
}
