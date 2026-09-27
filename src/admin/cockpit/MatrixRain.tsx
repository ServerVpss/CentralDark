import { useEffect, useRef } from "react";

export function MatrixRain() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let width = 0;
    let height = 0;
    let cols = 0;
    let drops: number[] = [];
    const glyphs = "アイウエオカキクケコサシスセソタチツテトナニヌネノ0123456789<>/*+-=$#@".split("");
    const fontSize = 14;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.ceil(width / fontSize);
      drops = new Array(cols).fill(0).map(() => Math.random() * -20);
    };
    resize();

    const onResize = () => resize();
    window.addEventListener("resize", onResize);

    let last = 0;
    const step = (t: number) => {
      raf = requestAnimationFrame(step);
      if (t - last < 60) return;
      last = t;

      ctx.fillStyle = "rgba(5, 46, 43, 0.18)";
      ctx.fillRect(0, 0, width, height);

      ctx.font = `${fontSize}px ui-monospace, Menlo, monospace`;
      ctx.fillStyle = "#34d399";
      for (let i = 0; i < cols; i++) {
        const ch = glyphs[Math.floor(Math.random() * glyphs.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;
        ctx.fillText(ch, x, y);
        if (y > height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      }
    };
    raf = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return <canvas ref={ref} className="cockpit-canvas" aria-hidden />;
}
