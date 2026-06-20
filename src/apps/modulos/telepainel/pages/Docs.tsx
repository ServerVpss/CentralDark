import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Input } from "@/shared/ui/input";
import { Switch } from "@/shared/ui/switch";
import { Label } from "@/shared/ui/label";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from "@/shared/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/shared/ui/tooltip";
import {
  Sparkles, Copy, Check, Palette, Type, Square, Layers, MousePointerClick,
  PanelsTopLeft, Bell, ShieldCheck, ArrowRight, Loader2, Heart,
  Home, Settings as SettingsIcon, Users, BarChart3, Zap, Code2, Download,
} from "lucide-react";
import { toast } from "sonner";

/* =========================================================
   DOCS — Design System "Esmeralda" (3D Tátil)
   Página única, pública, sem dependência de auth/backend.
   Tudo o que aparece aqui é exatamente o que o app usa.
   ========================================================= */

const SECTIONS = [
  { id: "intro",       label: "Visão geral",        icon: Sparkles },
  { id: "instalacao",  label: "Como instalar",      icon: Download },
  { id: "cores",       label: "Cores & tokens",     icon: Palette },
  { id: "tipografia",  label: "Tipografia",         icon: Type },
  { id: "raio",        label: "Raio & espaçamento", icon: Square },
  { id: "sombras",     label: "Sombras 3D",         icon: Layers },
  { id: "botoes",      label: "Botões",             icon: MousePointerClick },
  { id: "inputs",      label: "Inputs & forms",     icon: Code2 },
  { id: "cards",       label: "Cards",              icon: PanelsTopLeft },
  { id: "badges",      label: "Badges & status",    icon: Bell },
  { id: "dialog",      label: "Diálogos & modais",  icon: ShieldCheck },
  { id: "nav",         label: "Navegação",          icon: Home },
  { id: "animacoes",   label: "Animações",          icon: Zap },
  { id: "snippets",    label: "Snippets prontos",   icon: Heart },
] as const;

/* ---------- CodeBlock com botão copiar ---------- */
function CodeBlock({ code, lang = "tsx" }: { code: string; lang?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success("Copiado!");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Falha ao copiar");
    }
  };
  return (
    <div className="relative group rounded-xl border border-border/60 bg-secondary/40 overflow-hidden">
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-border/50 bg-secondary/60">
        <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{lang}</span>
        <button
          onClick={copy}
          className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          {copied ? <Check className="h-3 w-3 text-primary" /> : <Copy className="h-3 w-3" />}
          {copied ? "Copiado" : "Copiar"}
        </button>
      </div>
      <pre className="p-3 text-[12px] leading-relaxed font-mono overflow-x-auto max-h-[420px]">
        <code>{code}</code>
      </pre>
    </div>
  );
}

/* ---------- Bloco de seção ---------- */
function Section({
  id, title, description, children,
}: { id: string; title: string; description?: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24 space-y-4">
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      {children}
    </section>
  );
}

/* ---------- Swatch ---------- */
function Swatch({ name, varName, hslLight, hslDark }: { name: string; varName: string; hslLight: string; hslDark: string }) {
  return (
    <div className="rounded-xl border border-border/60 bg-card shadow-3d-soft overflow-hidden">
      <div className="h-16" style={{ background: `hsl(${hslLight})` }} />
      <div className="h-10 dark:hidden" style={{ background: `hsl(${hslLight})` }} />
      <div className="h-10 hidden dark:block" style={{ background: `hsl(${hslDark})` }} />
      <div className="p-3 space-y-1 border-t border-border/50">
        <div className="text-xs font-semibold">{name}</div>
        <div className="text-[10px] font-mono text-muted-foreground truncate">{varName}</div>
        <div className="text-[10px] font-mono text-muted-foreground/80">L: {hslLight}</div>
        <div className="text-[10px] font-mono text-muted-foreground/80">D: {hslDark}</div>
      </div>
    </div>
  );
}

/* ---------- Sombra demo ---------- */
function ShadowDemo({ className, label }: { className: string; label: string }) {
  return (
    <div className="space-y-2">
      <div className={`h-20 rounded-xl bg-card border border-border/60 ${className} flex items-center justify-center`}>
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
      </div>
      <code className="text-[10px] font-mono text-muted-foreground">.{className}</code>
    </div>
  );
}

/* ---------- Conteúdo dos snippets gigantes ---------- */
const INDEX_CSS_SNIPPET = `@tailwind base;
@tailwind components;
@tailwind utilities;

@import url('https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700;800&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Geist+Mono:wght@400;500;600&display=swap');

@layer base {
  :root {
    /* LIGHT — neutro, emerald accent */
    --background: 0 0% 99%;
    --foreground: 0 0% 7%;
    --card: 0 0% 100%;
    --card-foreground: 0 0% 7%;
    --popover: 0 0% 100%;
    --popover-foreground: 0 0% 7%;
    --primary: 152 65% 32%;
    --primary-foreground: 0 0% 100%;
    --primary-glow: 152 70% 40%;
    --secondary: 0 0% 96%;
    --secondary-foreground: 0 0% 12%;
    --muted: 0 0% 95%;
    --muted-foreground: 0 0% 35%;
    --accent: 152 65% 32%;
    --accent-foreground: 0 0% 100%;
    --destructive: 0 72% 45%;
    --destructive-foreground: 0 0% 100%;
    --success: 152 65% 32%;
    --success-foreground: 0 0% 100%;
    --warning: 38 95% 45%;
    --warning-foreground: 0 0% 9%;
    --border: 0 0% 88%;
    --input: 0 0% 90%;
    --ring: 152 65% 32%;
    --radius: 0.5rem;
  }

  .dark {
    /* DARK — near-black, emerald assinatura */
    --background: 0 0% 4%;
    --foreground: 0 0% 92%;
    --card: 0 0% 6%;
    --card-foreground: 0 0% 92%;
    --popover: 0 0% 7%;
    --popover-foreground: 0 0% 92%;
    --primary: 152 76% 50%;
    --primary-foreground: 0 0% 4%;
    --primary-glow: 152 82% 58%;
    --secondary: 0 0% 10%;
    --secondary-foreground: 0 0% 92%;
    --muted: 0 0% 10%;
    --muted-foreground: 0 0% 55%;
    --accent: 152 76% 50%;
    --accent-foreground: 0 0% 4%;
    --destructive: 0 75% 55%;
    --destructive-foreground: 0 0% 98%;
    --border: 0 0% 12%;
    --input: 0 0% 12%;
    --ring: 152 76% 50%;
  }

  body {
    @apply bg-background text-foreground font-sans antialiased;
    font-family: 'Geist', 'Inter', system-ui, sans-serif;
  }
  h1, h2, h3, h4, h5, h6 {
    font-family: 'Geist', 'Inter', sans-serif;
    @apply font-semibold tracking-tight;
    letter-spacing: -0.02em;
  }
}

@layer utilities {
  /* ===== Sistema 3D Tátil "Esmeralda" ===== */
  .shadow-3d {
    box-shadow:
      0 10px 20px -8px rgba(0,0,0,0.25),
      0 2px 4px rgba(0,0,0,0.08),
      inset 0 1px 0 hsl(0 0% 100% / 0.18),
      inset 0 -2px 4px rgba(0,0,0,0.12);
  }
  .dark .shadow-3d {
    box-shadow:
      0 10px 24px -8px rgba(0,0,0,0.55),
      0 2px 6px rgba(0,0,0,0.35),
      inset 0 1px 0 hsl(0 0% 100% / 0.08),
      inset 0 -2px 4px rgba(0,0,0,0.45);
  }
  .shadow-3d-soft {
    box-shadow:
      0 6px 14px -6px rgba(0,0,0,0.2),
      0 1px 2px rgba(0,0,0,0.06),
      inset 0 1px 0 hsl(0 0% 100% / 0.15);
  }
  .shadow-3d-primary {
    box-shadow:
      0 10px 22px -8px hsl(var(--primary) / 0.55),
      0 2px 6px rgba(0,0,0,0.18),
      inset 0 1px 0 hsl(0 0% 100% / 0.3),
      inset 0 -2px 4px hsl(var(--primary) / 0.35);
  }
  .shadow-3d-destructive {
    box-shadow:
      0 10px 22px -8px hsl(var(--destructive) / 0.5),
      0 2px 6px rgba(0,0,0,0.18),
      inset 0 1px 0 hsl(0 0% 100% / 0.25),
      inset 0 -2px 4px hsl(var(--destructive) / 0.35);
  }
  .shadow-3d-pressed {
    box-shadow:
      0 3px 8px -4px rgba(0,0,0,0.3),
      inset 0 2px 4px rgba(0,0,0,0.18) !important;
    transform: translateY(1px);
  }

  /* Glass / Glow / Animations */
  .glass { background: hsl(var(--card) / 0.85); backdrop-filter: blur(16px) saturate(180%); }
  .glow-emerald { box-shadow: 0 0 16px hsl(var(--primary) / 0.18); }
  .animate-fade-in { animation: fadeIn .3s ease-out; }
  .animate-slide-up { animation: slideUp .4s cubic-bezier(0.16,1,0.3,1); }
  .animate-scale-in { animation: scaleIn .25s cubic-bezier(0.16,1,0.3,1); }
}

@keyframes fadeIn { from {opacity:0} to {opacity:1} }
@keyframes slideUp { from {opacity:0; transform:translateY(16px)} to {opacity:1; transform:translateY(0)} }
@keyframes scaleIn { from {opacity:0; transform:scale(.97)} to {opacity:1; transform:scale(1)} }

html { font-size: 17.5px; }
`;

const TAILWIND_CONFIG_SNIPPET = `import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    container: { center: true, padding: "2rem", screens: { "2xl": "1400px" } },
    extend: {
      fontFamily: {
        sans: ['Geist', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['Geist Mono', 'ui-monospace', 'Menlo', 'monospace'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          glow: "hsl(var(--primary-glow))",
        },
        secondary: { DEFAULT: "hsl(var(--secondary))", foreground: "hsl(var(--secondary-foreground))" },
        destructive: { DEFAULT: "hsl(var(--destructive))", foreground: "hsl(var(--destructive-foreground))" },
        muted: { DEFAULT: "hsl(var(--muted))", foreground: "hsl(var(--muted-foreground))" },
        accent: { DEFAULT: "hsl(var(--accent))", foreground: "hsl(var(--accent-foreground))" },
        popover: { DEFAULT: "hsl(var(--popover))", foreground: "hsl(var(--popover-foreground))" },
        card: { DEFAULT: "hsl(var(--card))", foreground: "hsl(var(--card-foreground))" },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
`;

const BUTTON_SNIPPETS = {
  primary: `<Button className="rounded-xl shadow-3d-primary active:translate-y-[1px]">
  Confirmar
</Button>`,
  secondary: `<Button variant="outline" className="rounded-xl shadow-3d-soft active:translate-y-[1px]">
  Cancelar
</Button>`,
  destructive: `<Button variant="destructive" className="rounded-xl shadow-3d-destructive active:translate-y-[1px]">
  Excluir
</Button>`,
  ghost: `<Button variant="ghost" className="rounded-lg">
  Voltar
</Button>`,
  icon: `<Button size="icon" className="rounded-xl shadow-3d-primary">
  <Sparkles className="h-4 w-4" />
</Button>`,
};

const CARD_SNIPPET = `<Card className="rounded-xl border-border/60 shadow-3d-soft">
  <CardHeader>
    <CardTitle>Título</CardTitle>
    <CardDescription>Descrição curta.</CardDescription>
  </CardHeader>
  <CardContent>Conteúdo do card.</CardContent>
</Card>`;

const DIALOG_SNIPPET = `<Dialog>
  <DialogTrigger asChild>
    <Button className="rounded-xl shadow-3d-primary">Abrir</Button>
  </DialogTrigger>
  <DialogContent className="rounded-2xl border-border/60 bg-card/95 backdrop-blur-xl shadow-3d p-0 overflow-hidden">
    <div className="px-6 pt-6 pb-4 bg-gradient-to-b from-primary/10 to-transparent border-b border-border/50">
      <DialogHeader>
        <DialogTitle>Título</DialogTitle>
        <DialogDescription>Mensagem.</DialogDescription>
      </DialogHeader>
    </div>
    <div className="px-6 py-5">...</div>
    <DialogFooter className="px-6 pb-6 gap-2">
      <Button variant="outline" className="rounded-xl shadow-3d-soft">Cancelar</Button>
      <Button className="rounded-xl shadow-3d-primary">Confirmar</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>`;

export default function Docs() {
  const [activeId, setActiveId] = useState<string>("intro");
  const [dialogOpen, setDialogOpen] = useState(false);

  // Scroll spy simples
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActiveId(e.target.id);
        });
      },
      { rootMargin: "-30% 0px -60% 0px", threshold: 0 },
    );
    SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const colorTokens = useMemo(() => ([
    { name: "Background",  varName: "--background",  hslLight: "0 0% 99%",   hslDark: "0 0% 4%" },
    { name: "Foreground",  varName: "--foreground",  hslLight: "0 0% 7%",    hslDark: "0 0% 92%" },
    { name: "Card",        varName: "--card",        hslLight: "0 0% 100%",  hslDark: "0 0% 6%" },
    { name: "Primary",     varName: "--primary",     hslLight: "152 65% 32%",hslDark: "152 76% 50%" },
    { name: "Primary Glow",varName: "--primary-glow",hslLight: "152 70% 40%",hslDark: "152 82% 58%" },
    { name: "Secondary",   varName: "--secondary",   hslLight: "0 0% 96%",   hslDark: "0 0% 10%" },
    { name: "Muted",       varName: "--muted",       hslLight: "0 0% 95%",   hslDark: "0 0% 10%" },
    { name: "Destructive", varName: "--destructive", hslLight: "0 72% 45%",  hslDark: "0 75% 55%" },
    { name: "Warning",     varName: "--warning",     hslLight: "38 95% 45%", hslDark: "38 95% 55%" },
    { name: "Border",      varName: "--border",      hslLight: "0 0% 88%",   hslDark: "0 0% 12%" },
  ]), []);

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background text-foreground">
        {/* ===== Topbar ===== */}
        <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl bg-primary/15 text-primary flex items-center justify-center shadow-3d-primary">
                <Sparkles className="h-4 w-4" />
              </div>
              <div className="leading-tight">
                <div className="text-sm font-semibold">Esmeralda</div>
                <div className="text-[10px] text-muted-foreground -mt-0.5">Design System · v1.0</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">3D Tátil</Badge>
              <Badge variant="outline" className="text-[10px]">Light + Dark</Badge>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-8">
          {/* ===== Sidebar ===== */}
          <aside className="hidden lg:block">
            <nav className="sticky top-20 space-y-0.5">
              {SECTIONS.map((s) => {
                const Icon = s.icon;
                const active = activeId === s.id;
                return (
                  <a
                    key={s.id}
                    href={`#${s.id}`}
                    className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-all ${
                      active
                        ? "bg-secondary text-foreground shadow-3d-soft font-medium"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {s.label}
                  </a>
                );
              })}
            </nav>
          </aside>

          {/* ===== Conteúdo ===== */}
          <main className="space-y-16 min-w-0">
            {/* Hero */}
            <Section id="intro" title="Sistema de Design Esmeralda" description="Visual 3D tátil, estilo aplicativo nativo. Neutro de base, com verde esmeralda como assinatura. Funciona em light e dark sem perder identidade.">
              <Card className="rounded-2xl border-border/60 shadow-3d overflow-hidden">
                <div className="p-6 bg-gradient-to-br from-primary/10 via-transparent to-transparent">
                  <div className="flex flex-col sm:flex-row gap-6 items-start">
                    <div className="h-16 w-16 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-3d-primary">
                      <Sparkles className="h-7 w-7" />
                    </div>
                    <div className="space-y-2 flex-1">
                      <h3 className="text-xl font-semibold">Princípios</h3>
                      <ul className="grid sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
                        <li className="flex gap-2"><Check className="h-4 w-4 text-primary mt-0.5 shrink-0" /> Pegada 3D: sombra externa + brilho interno topo + sombra interna baixo.</li>
                        <li className="flex gap-2"><Check className="h-4 w-4 text-primary mt-0.5 shrink-0" /> <code className="font-mono text-xs">rounded-xl</code> e <code className="font-mono text-xs">rounded-lg</code> sempre.</li>
                        <li className="flex gap-2"><Check className="h-4 w-4 text-primary mt-0.5 shrink-0" /> <code className="font-mono text-xs">active:translate-y-[1px]</code> em tudo clicável.</li>
                        <li className="flex gap-2"><Check className="h-4 w-4 text-primary mt-0.5 shrink-0" /> Cores via tokens HSL. Nunca hardcode.</li>
                        <li className="flex gap-2"><Check className="h-4 w-4 text-primary mt-0.5 shrink-0" /> Fonte Geist (corpo e títulos).</li>
                        <li className="flex gap-2"><Check className="h-4 w-4 text-primary mt-0.5 shrink-0" /> Light é o tema padrão. Dark é variante.</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </Card>
            </Section>

            {/* Instalação */}
            <Section id="instalacao" title="Como instalar em outro projeto" description="Cole esses dois arquivos no seu projeto Tailwind + shadcn/ui e o visual fica idêntico.">
              <Tabs defaultValue="css">
                <TabsList className="rounded-xl shadow-3d-soft">
                  <TabsTrigger value="css" className="rounded-lg">src/index.css</TabsTrigger>
                  <TabsTrigger value="tw" className="rounded-lg">tailwind.config.ts</TabsTrigger>
                  <TabsTrigger value="deps" className="rounded-lg">Dependências</TabsTrigger>
                </TabsList>
                <TabsContent value="css" className="mt-4">
                  <CodeBlock code={INDEX_CSS_SNIPPET} lang="css" />
                </TabsContent>
                <TabsContent value="tw" className="mt-4">
                  <CodeBlock code={TAILWIND_CONFIG_SNIPPET} lang="ts" />
                </TabsContent>
                <TabsContent value="deps" className="mt-4">
                  <CodeBlock lang="bash" code={`# Tailwind + shadcn/ui + animações
npm i tailwindcss tailwindcss-animate class-variance-authority clsx tailwind-merge lucide-react sonner

# Instale shadcn/ui e adicione os componentes que usar:
npx shadcn@latest init
npx shadcn@latest add button card input dialog tabs badge switch label tooltip`} />
                </TabsContent>
              </Tabs>
            </Section>

            {/* Cores */}
            <Section id="cores" title="Cores & tokens" description="Toda cor vem de variável CSS em HSL. Trocar a primária muda o app inteiro.">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {colorTokens.map((c) => <Swatch key={c.varName} {...c} />)}
              </div>
              <CodeBlock lang="tsx" code={`/* ✅ Sempre use os tokens */
<div className="bg-primary text-primary-foreground">OK</div>
<div className="border border-border bg-card text-card-foreground">OK</div>

/* ❌ NUNCA hardcode */
<div className="bg-emerald-500 text-white">EVITE</div>`} />
            </Section>

            {/* Tipografia */}
            <Section id="tipografia" title="Tipografia" description="Geist no corpo e nos títulos. Geist Mono para código. Tracking levemente apertado nos títulos.">
              <Card className="rounded-xl border-border/60 shadow-3d-soft">
                <CardContent className="p-6 space-y-4">
                  <div><div className="text-[10px] uppercase text-muted-foreground mb-1">h1 · 3xl/4xl semibold</div><h1 className="text-4xl font-semibold tracking-tight">A raposa marrom salta</h1></div>
                  <div><div className="text-[10px] uppercase text-muted-foreground mb-1">h2 · 2xl semibold</div><h2 className="text-2xl font-semibold tracking-tight">A raposa marrom salta</h2></div>
                  <div><div className="text-[10px] uppercase text-muted-foreground mb-1">h3 · xl semibold</div><h3 className="text-xl font-semibold tracking-tight">A raposa marrom salta</h3></div>
                  <div><div className="text-[10px] uppercase text-muted-foreground mb-1">body · base</div><p className="text-base">Texto de corpo padrão. Esta fonte respira bem em parágrafos longos e mantém legibilidade no mobile.</p></div>
                  <div><div className="text-[10px] uppercase text-muted-foreground mb-1">muted · sm</div><p className="text-sm text-muted-foreground">Texto secundário / descrições.</p></div>
                  <div><div className="text-[10px] uppercase text-muted-foreground mb-1">mono · xs</div><code className="text-xs font-mono bg-secondary/60 px-2 py-1 rounded">const x = 199420</code></div>
                </CardContent>
              </Card>
            </Section>

            {/* Raio / espaçamento */}
            <Section id="raio" title="Raio & espaçamento" description="Raio padrão 0.5rem. Use rounded-lg em controles, rounded-xl em cards/dialogs, rounded-2xl em painéis grandes.">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { c: "rounded-md", l: "8px" },
                  { c: "rounded-lg", l: "10px · padrão" },
                  { c: "rounded-xl", l: "14px · cards" },
                  { c: "rounded-2xl", l: "20px · painel" },
                ].map((r) => (
                  <div key={r.c} className="space-y-2">
                    <div className={`h-20 bg-primary/10 border border-primary/30 ${r.c} flex items-center justify-center`}>
                      <span className="text-xs font-mono text-primary">{r.c}</span>
                    </div>
                    <div className="text-[10px] text-muted-foreground text-center">{r.l}</div>
                  </div>
                ))}
              </div>
            </Section>

            {/* Sombras 3D */}
            <Section id="sombras" title="Sombras 3D" description="A alma do sistema. Combinam sombra externa, brilho interno no topo (efeito luz) e sombra interna embaixo (peso).">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <ShadowDemo className="shadow-3d" label="shadow-3d" />
                <ShadowDemo className="shadow-3d-soft" label="shadow-3d-soft" />
                <ShadowDemo className="shadow-3d-primary bg-primary text-primary-foreground" label="shadow-3d-primary" />
                <ShadowDemo className="shadow-3d-destructive bg-destructive text-destructive-foreground" label="shadow-3d-destructive" />
                <ShadowDemo className="shadow-3d-pressed" label="shadow-3d-pressed" />
                <ShadowDemo className="glass" label=".glass" />
              </div>
            </Section>

            {/* Botões */}
            <Section id="botoes" title="Botões" description="Todo botão clicável recebe rounded-xl + shadow-3d-* + active:translate-y-[1px].">
              <Card className="rounded-xl border-border/60 shadow-3d-soft">
                <CardContent className="p-6 flex flex-wrap gap-3">
                  <Button className="rounded-xl shadow-3d-primary active:translate-y-[1px]">Primário</Button>
                  <Button variant="outline" className="rounded-xl shadow-3d-soft active:translate-y-[1px]">Secundário</Button>
                  <Button variant="destructive" className="rounded-xl shadow-3d-destructive active:translate-y-[1px]">Excluir</Button>
                  <Button variant="ghost" className="rounded-lg">Ghost</Button>
                  <Button variant="secondary" className="rounded-xl shadow-3d-soft">Secondary</Button>
                  <Button size="icon" className="rounded-xl shadow-3d-primary"><Sparkles className="h-4 w-4" /></Button>
                  <Button disabled className="rounded-xl"><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Carregando</Button>
                  <Button className="rounded-xl shadow-3d-primary active:translate-y-[1px]">
                    Avançar <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
              <div className="grid sm:grid-cols-2 gap-4">
                <CodeBlock code={BUTTON_SNIPPETS.primary} />
                <CodeBlock code={BUTTON_SNIPPETS.secondary} />
                <CodeBlock code={BUTTON_SNIPPETS.destructive} />
                <CodeBlock code={BUTTON_SNIPPETS.icon} />
              </div>
            </Section>

            {/* Inputs */}
            <Section id="inputs" title="Inputs & forms" description="Inputs usam rounded-lg, shadow interna sutil e ring na primária ao focar.">
              <Card className="rounded-xl border-border/60 shadow-3d-soft">
                <CardContent className="p-6 space-y-4 max-w-md">
                  <div className="space-y-2">
                    <Label htmlFor="ex-name">Nome</Label>
                    <Input id="ex-name" placeholder="Digite seu nome" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ex-mail">Email</Label>
                    <Input id="ex-mail" type="email" placeholder="voce@exemplo.com" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="ex-sw" className="cursor-pointer">Notificações</Label>
                    <Switch id="ex-sw" defaultChecked />
                  </div>
                </CardContent>
              </Card>
              <CodeBlock code={`<div className="space-y-2">
  <Label htmlFor="x">Nome</Label>
  <Input id="x" placeholder="Digite..." />
</div>`} />
            </Section>

            {/* Cards */}
            <Section id="cards" title="Cards" description="Estrutura básica de container. Sempre com sombra 3D suave e borda discreta.">
              <div className="grid sm:grid-cols-2 gap-4">
                <Card className="rounded-xl border-border/60 shadow-3d-soft">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><BarChart3 className="h-4 w-4 text-primary" /> Consultas hoje</CardTitle>
                    <CardDescription>Atualizado agora</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-semibold">2.481</div>
                    <div className="text-xs text-primary mt-1">↑ 12% vs ontem</div>
                  </CardContent>
                </Card>
                <Card className="rounded-xl border-border/60 shadow-3d-soft">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Users className="h-4 w-4 text-primary" /> Usuários ativos</CardTitle>
                    <CardDescription>Últimos 7 dias</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-semibold">432</div>
                    <div className="text-xs text-muted-foreground mt-1">31 novos esta semana</div>
                  </CardContent>
                </Card>
              </div>
              <CodeBlock code={CARD_SNIPPET} />
            </Section>

            {/* Badges & status */}
            <Section id="badges" title="Badges & status" description="Pequenos rótulos. Use cor da primária para sucesso, destructive para erro, amber para alerta.">
              <Card className="rounded-xl border-border/60 shadow-3d-soft">
                <CardContent className="p-6 flex flex-wrap items-center gap-3">
                  <Badge className="rounded-md">Padrão</Badge>
                  <Badge variant="secondary" className="rounded-md">Secundário</Badge>
                  <Badge variant="destructive" className="rounded-md">Erro</Badge>
                  <Badge variant="outline" className="rounded-md text-primary border-primary/30">Outline emerald</Badge>
                  <span className="inline-flex items-center gap-1.5 text-xs">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Online
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-xs">
                    <span className="h-2 w-2 rounded-full bg-amber-500" /> Degradado
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-xs">
                    <span className="h-2 w-2 rounded-full bg-destructive" /> Offline
                  </span>
                </CardContent>
              </Card>
            </Section>

            {/* Dialogs */}
            <Section id="dialog" title="Diálogos & modais" description="Modal fundido ao painel: gradiente sutil no topo, backdrop-blur, sombra 3D.">
              <Card className="rounded-xl border-border/60 shadow-3d-soft">
                <CardContent className="p-6">
                  <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="rounded-xl shadow-3d-primary active:translate-y-[1px]">
                        <ShieldCheck className="h-4 w-4 mr-2" /> Abrir modal de exemplo
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md rounded-2xl border-border/60 bg-card/95 backdrop-blur-xl shadow-3d p-0 overflow-hidden">
                      <div className="px-6 pt-6 pb-4 bg-gradient-to-b from-primary/10 to-transparent border-b border-border/50">
                        <div className="flex items-center gap-3">
                          <div className="h-11 w-11 rounded-xl bg-primary/15 text-primary flex items-center justify-center shadow-3d-primary">
                            <ShieldCheck className="h-5 w-5" />
                          </div>
                          <DialogHeader className="space-y-1 text-left">
                            <DialogTitle>Modal padrão Esmeralda</DialogTitle>
                            <DialogDescription>Cabeçalho com gradiente, conteúdo limpo, rodapé com ações.</DialogDescription>
                          </DialogHeader>
                        </div>
                      </div>
                      <div className="px-6 py-5">
                        <p className="text-sm text-muted-foreground">Esse é o template oficial pra qualquer caixa de confirmação ou formulário rápido.</p>
                      </div>
                      <DialogFooter className="px-6 pb-6 gap-2 sm:gap-2">
                        <Button variant="outline" className="rounded-xl shadow-3d-soft" onClick={() => setDialogOpen(false)}>Cancelar</Button>
                        <Button className="rounded-xl shadow-3d-primary" onClick={() => { setDialogOpen(false); toast.success("Feito!"); }}>Confirmar</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
              <CodeBlock code={DIALOG_SNIPPET} />
            </Section>

            {/* Navegação */}
            <Section id="nav" title="Navegação" description="Itens de sidebar com indicador lateral em forma de barra vertical, em primária.">
              <Card className="rounded-xl border-border/60 shadow-3d-soft">
                <CardContent className="p-4 max-w-xs">
                  {[
                    { icon: Home, label: "Início", active: true },
                    { icon: BarChart3, label: "Analytics" },
                    { icon: Users, label: "Usuários" },
                    { icon: SettingsIcon, label: "Configurações" },
                  ].map((i, idx) => {
                    const Icon = i.icon;
                    return (
                      <div
                        key={idx}
                        className={`relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-all ${
                          i.active
                            ? "bg-secondary text-foreground shadow-3d-soft font-medium"
                            : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground cursor-pointer"
                        }`}
                      >
                        {i.active && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full bg-primary" />}
                        <Icon className="h-4 w-4" />
                        {i.label}
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
              <CodeBlock code={`<a className="relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm
  bg-secondary text-foreground shadow-3d-soft font-medium">
  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full bg-primary" />
  <Home className="h-4 w-4" /> Início
</a>`} />
            </Section>

            {/* Animações */}
            <Section id="animacoes" title="Animações" description="Use sempre que o conteúdo aparece ou muda de estado. Curvas suaves, duração curta (200–400ms).">
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="rounded-xl border border-border/60 p-4 shadow-3d-soft animate-fade-in">
                  <div className="text-xs font-mono text-primary mb-2">animate-fade-in</div>
                  <div className="text-sm">Fade simples.</div>
                </div>
                <div className="rounded-xl border border-border/60 p-4 shadow-3d-soft animate-slide-up">
                  <div className="text-xs font-mono text-primary mb-2">animate-slide-up</div>
                  <div className="text-sm">Entra subindo.</div>
                </div>
                <div className="rounded-xl border border-border/60 p-4 shadow-3d-soft animate-scale-in">
                  <div className="text-xs font-mono text-primary mb-2">animate-scale-in</div>
                  <div className="text-sm">Cresce ao aparecer.</div>
                </div>
                <div className="rounded-xl border border-border/60 p-4 shadow-3d-soft">
                  <div className="text-xs font-mono text-primary mb-2">animate-pulse-glow</div>
                  <div className="h-6 w-6 rounded-full bg-primary animate-pulse-glow" />
                </div>
                <div className="rounded-xl border border-border/60 p-4 shadow-3d-soft">
                  <div className="text-xs font-mono text-primary mb-2">animate-float</div>
                  <Sparkles className="h-6 w-6 text-primary animate-float" />
                </div>
                <div className="rounded-xl border border-border/60 p-4 shadow-3d-soft">
                  <div className="text-xs font-mono text-primary mb-2">hover-lift</div>
                  <div className="rounded-lg border border-border/60 p-3 hover-lift cursor-pointer text-xs">Passe o mouse</div>
                </div>
              </div>
            </Section>

            {/* Snippets */}
            <Section id="snippets" title="Snippets prontos" description="Tudo o que você precisa colar em outro projeto pra ter o mesmo visual.">
              <Tabs defaultValue="css">
                <TabsList className="rounded-xl shadow-3d-soft">
                  <TabsTrigger value="css" className="rounded-lg">CSS completo</TabsTrigger>
                  <TabsTrigger value="tw" className="rounded-lg">tailwind.config</TabsTrigger>
                  <TabsTrigger value="ai" className="rounded-lg">Prompt p/ IA</TabsTrigger>
                </TabsList>
                <TabsContent value="css" className="mt-4">
                  <CodeBlock code={INDEX_CSS_SNIPPET} lang="css" />
                </TabsContent>
                <TabsContent value="tw" className="mt-4">
                  <CodeBlock code={TAILWIND_CONFIG_SNIPPET} lang="ts" />
                </TabsContent>
                <TabsContent value="ai" className="mt-4">
                  <CodeBlock lang="md" code={`Aplique o Design System "Esmeralda" neste projeto.

Regras inegociáveis:
- Tema: light por padrão, dark como variante. Accent verde esmeralda.
- Cores SEMPRE via tokens CSS (--primary, --background, etc.). NUNCA cores hardcoded (text-white, bg-black, bg-emerald-500).
- Fonte: Geist (corpo e títulos), Geist Mono pra código.
- Raio: rounded-lg em controles, rounded-xl em cards/dialogs, rounded-2xl em painéis grandes.
- Sombras: use utilitários globais shadow-3d, shadow-3d-soft, shadow-3d-primary, shadow-3d-destructive, shadow-3d-pressed.
- Todo botão clicável: rounded-xl + shadow-3d-* + active:translate-y-[1px].
- Modais: rounded-2xl + bg-card/95 + backdrop-blur-xl + shadow-3d, cabeçalho com gradiente from-primary/10 to-transparent.
- Inputs: shadow interna sutil, focus-visible com ring na primária.
- Animações: animate-fade-in / animate-slide-up / animate-scale-in pra entradas.

Cole no projeto:
1. src/index.css (snippet "CSS completo" da página /docs)
2. tailwind.config.ts (snippet "tailwind.config" da página /docs)
3. Instale shadcn/ui e adicione button, card, input, dialog, tabs, badge, switch, label, tooltip.`} />
                </TabsContent>
              </Tabs>
            </Section>

            <footer className="pt-8 border-t border-border/60 text-center text-xs text-muted-foreground">
              Design System Esmeralda · CentralDark / TelePainel · uso interno
            </footer>
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}
