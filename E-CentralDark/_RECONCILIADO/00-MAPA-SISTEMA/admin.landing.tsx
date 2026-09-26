import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Globe, Plus, Trash2, Save, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { friendlyError } from "@/lib/friendly-error";
import { PageScaffold } from "@/components/page-scaffold";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  adminGetLandingConfig,
  adminUpdateLandingConfig,
  type LandingSections,
  type LandingMetric,
  type LandingComparisonRow,
  type LandingHero,
} from "@/lib/landing-config.functions";
import { LoadingDots } from "@/components/ui/loading-dots";

export const Route = createFileRoute("/admin/landing")({ component: Page });

const SECTION_LABELS: Array<{ key: keyof LandingSections; label: string; desc: string }> = [
  { key: "intro", label: "Animação de abertura (Jarvis)", desc: "Splash com efeito de IA quando o visitante abre o site (1ª visita da sessão, ~2s, pode pular no clique)." },
  { key: "hero", label: "Hero (topo da página)", desc: "Título principal, subtítulo, badge, botões de ação" },
  { key: "metrics", label: "Barra de métricas", desc: "Os 4 números (50x, 24/7, 99%, +400%)" },
  { key: "features", label: "Recursos", desc: "Os 6 cards de funcionalidades" },
  { key: "connections", label: "Formas de conectar WhatsApp", desc: "QR Code, Cloud API, etc." },
  { key: "comparison", label: "Tabela comparativa", desc: "MultiZap vs Concorrentes" },
  { key: "plans", label: "Planos", desc: "Cards de Básico, Profissional, Premium" },
  { key: "security", label: "Segurança", desc: "Criptografia, LGPD, Backup" },
  { key: "final_cta", label: "CTA final", desc: "Última chamada com 'Oferta limitada'" },
];

const DEFAULT_HERO: LandingHero = {
  badge: "", headline_pre: "", headline_highlight: "", headline_post: "",
  subheadline: "", cta_primary: "Teste grátis", cta_secondary: "Falar com especialista",
  trust_badges: [],
};

function Page() {
  const getFn = useServerFn(adminGetLandingConfig);
  const saveFn = useServerFn(adminUpdateLandingConfig);
  const { data, isLoading, refetch } = useQuery({ queryKey: ["admin-landing"], queryFn: () => getFn() });

  const [sections, setSections] = useState<LandingSections | null>(null);
  const [metrics, setMetrics] = useState<LandingMetric[]>([]);
  const [comparison, setComparison] = useState<LandingComparisonRow[]>([]);
  const [hero, setHero] = useState<LandingHero>(DEFAULT_HERO);
  const [introDurationMs, setIntroDurationMs] = useState<number>(2200);
  const [introShowOnApp, setIntroShowOnApp] = useState<boolean>(true);

  useEffect(() => {
    if (data) {
      const raw = (data.landing_sections ?? {}) as Partial<LandingSections>;
      setSections({
        intro: raw.intro ?? true,
        hero: raw.hero ?? true,
        metrics: raw.metrics ?? true,
        features: raw.features ?? true,
        connections: raw.connections ?? true,
        comparison: raw.comparison ?? true,
        plans: raw.plans ?? true,
        security: raw.security ?? true,
        final_cta: raw.final_cta ?? true,
      });
      setMetrics((data.landing_metrics as unknown as LandingMetric[]) ?? []);
      setComparison((data.landing_comparison as unknown as LandingComparisonRow[]) ?? []);
      setHero((data.landing_hero as unknown as LandingHero) ?? DEFAULT_HERO);
      const dRaw = (data as { intro_duration_ms?: number }).intro_duration_ms;
      const sRaw = (data as { intro_show_on_app?: boolean }).intro_show_on_app;
      setIntroDurationMs(typeof dRaw === "number" ? dRaw : 2200);
      setIntroShowOnApp(typeof sRaw === "boolean" ? sRaw : true);
    }
  }, [data]);

  type SavePayload = {
    landing_sections?: LandingSections;
    landing_metrics?: LandingMetric[];
    landing_comparison?: LandingComparisonRow[];
    landing_hero?: LandingHero;
    intro_duration_ms?: number;
    intro_show_on_app?: boolean;
  };
  const saveM = useMutation({
    mutationFn: (payload: SavePayload) => saveFn({ data: payload }),
    onSuccess: () => { toast.success("Salvo. Atualize a landing pra ver."); refetch(); },
    onError: (e: Error) => toast.error(friendlyError(e)),
  });

  return (
    <PageScaffold
      title="Landing Page"
      description="Tudo que aparece na home pública. Liga/desliga seções e edita textos sem mexer em código."
      icon={Globe}
    >
      <div className="p-6">
        {isLoading || !sections ? (
          <p className="text-sm text-muted-foreground"><LoadingDots size="sm" label="Carregando" /></p>
        ) : (
          <Tabs defaultValue="sections">
            <TabsList>
              <TabsTrigger value="sections">Seções (on/off)</TabsTrigger>
              <TabsTrigger value="intro">Animação</TabsTrigger>
              <TabsTrigger value="hero">Hero</TabsTrigger>
              <TabsTrigger value="metrics">Métricas</TabsTrigger>
              <TabsTrigger value="comparison">Comparação</TabsTrigger>
            </TabsList>

            {/* ANIMAÇÃO DE ABERTURA */}
            <TabsContent value="intro" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Animação de abertura (Jarvis)</CardTitle>
                  <CardDescription>
                    Splash com efeito de IA. Aparece na 1ª visita da sessão (landing, login e ao entrar no painel). Pode ser pulada com clique.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="rounded-lg border p-4">
                    <Label htmlFor="intro-duration" className="text-sm font-medium">Duração da animação</Label>
                    <p className="mb-2 text-xs text-muted-foreground">Em milissegundos. Ex.: 2200 = 2,2s. Mín 500, máx 15000.</p>
                    <div className="flex items-center gap-3">
                      <Input
                        id="intro-duration"
                        type="number"
                        min={500}
                        max={15000}
                        step={100}
                        value={introDurationMs}
                        onChange={(e) => setIntroDurationMs(Math.max(500, Math.min(15000, Number(e.target.value) || 2200)))}
                        className="w-40"
                      />
                      <span className="text-xs text-muted-foreground">≈ {(introDurationMs / 1000).toFixed(1)}s</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
                    <div>
                      <Label htmlFor="intro-show-app" className="text-sm font-medium">Mostrar animação no login e ao entrar no painel</Label>
                      <p className="text-xs text-muted-foreground">
                        Desligado: usuários finais NÃO veem a animação ao acessar /auth nem ao entrar em /app depois de logar. (A landing pública usa o toggle "Animação de abertura" da aba Seções.)
                      </p>
                    </div>
                    <Switch id="intro-show-app" checked={introShowOnApp} onCheckedChange={setIntroShowOnApp} />
                  </div>

                  <Button
                    onClick={() => saveM.mutate({ intro_duration_ms: introDurationMs, intro_show_on_app: introShowOnApp })}
                    disabled={saveM.isPending}
                  >
                    <Save className="mr-2 h-4 w-4" /> Salvar animação
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* SEÇÕES */}
            <TabsContent value="sections" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Liga/desliga seções da landing</CardTitle>
                  <CardDescription>Desmarque pra esconder a seção da home pública. Não apaga nada — só esconde.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {SECTION_LABELS.map(({ key, label, desc }) => (
                    <div key={key} className="flex items-center justify-between gap-4 rounded-lg border p-3">
                      <div className="flex items-start gap-3">
                        {sections[key] ? <Eye className="mt-0.5 h-4 w-4 text-emerald-500" /> : <EyeOff className="mt-0.5 h-4 w-4 text-muted-foreground" />}
                        <div>
                          <Label htmlFor={`sec-${key}`} className="text-sm font-medium">{label}</Label>
                          <p className="text-xs text-muted-foreground">{desc}</p>
                        </div>
                      </div>
                      <Switch
                        id={`sec-${key}`}
                        checked={sections[key]}
                        onCheckedChange={(v) => setSections({ ...sections, [key]: v })}
                      />
                    </div>
                  ))}
                  <Button onClick={() => saveM.mutate({ landing_sections: sections })} disabled={saveM.isPending}>
                    <Save className="mr-2 h-4 w-4" /> Salvar seções
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* HERO */}
            <TabsContent value="hero" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Texto do Hero</CardTitle>
                  <CardDescription>Topo da landing. O título fica: "{hero.headline_pre} <em>{hero.headline_highlight}</em> {hero.headline_post}"</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <Label>Badge (chip acima do título)</Label>
                    <Input value={hero.badge} onChange={(e) => setHero({ ...hero, badge: e.target.value })} />
                  </div>
                  <div>
                    <Label>Título — antes do destaque</Label>
                    <Input value={hero.headline_pre} onChange={(e) => setHero({ ...hero, headline_pre: e.target.value })} />
                  </div>
                  <div>
                    <Label>Título — destaque (em verde)</Label>
                    <Input value={hero.headline_highlight} onChange={(e) => setHero({ ...hero, headline_highlight: e.target.value })} />
                  </div>
                  <div className="md:col-span-2">
                    <Label>Título — depois do destaque</Label>
                    <Input value={hero.headline_post} onChange={(e) => setHero({ ...hero, headline_post: e.target.value })} />
                  </div>
                  <div className="md:col-span-2">
                    <Label>Subtítulo</Label>
                    <Textarea rows={3} value={hero.subheadline} onChange={(e) => setHero({ ...hero, subheadline: e.target.value })} />
                  </div>
                  <div>
                    <Label>Botão principal</Label>
                    <Input value={hero.cta_primary} onChange={(e) => setHero({ ...hero, cta_primary: e.target.value })} />
                  </div>
                  <div>
                    <Label>Botão secundário</Label>
                    <Input value={hero.cta_secondary} onChange={(e) => setHero({ ...hero, cta_secondary: e.target.value })} />
                  </div>
                  <div className="md:col-span-2">
                    <Label>Selos de confiança (1 por linha, máx 6)</Label>
                    <Textarea
                      rows={4}
                      value={hero.trust_badges.join("\n")}
                      onChange={(e) => setHero({ ...hero, trust_badges: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean).slice(0, 6) })}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Button onClick={() => saveM.mutate({ landing_hero: hero })} disabled={saveM.isPending}>
                      <Save className="mr-2 h-4 w-4" /> Salvar Hero
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* MÉTRICAS */}
            <TabsContent value="metrics" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Barra de métricas</CardTitle>
                  <CardDescription>Os números grandes logo abaixo do hero. Recomendado: 4 itens.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {metrics.map((m, i) => (
                    <div key={i} className="grid grid-cols-1 gap-2 rounded-lg border p-3 md:grid-cols-[140px_1fr_auto]">
                      <Input placeholder="50x" value={m.value} onChange={(e) => {
                        const c = [...metrics]; c[i] = { ...m, value: e.target.value }; setMetrics(c);
                      }} />
                      <Input placeholder="mais conversas atendidas" value={m.label} onChange={(e) => {
                        const c = [...metrics]; c[i] = { ...m, label: e.target.value }; setMetrics(c);
                      }} />
                      <Button variant="ghost" size="icon" onClick={() => setMetrics(metrics.filter((_, j) => j !== i))}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <Button variant="outline" disabled={metrics.length >= 8} onClick={() => setMetrics([...metrics, { value: "", label: "" }])}>
                      <Plus className="mr-2 h-4 w-4" /> Adicionar métrica
                    </Button>
                    <Button onClick={() => saveM.mutate({ landing_metrics: metrics.filter((m) => m.value && m.label) })} disabled={saveM.isPending}>
                      <Save className="mr-2 h-4 w-4" /> Salvar métricas
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* COMPARAÇÃO */}
            <TabsContent value="comparison" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Tabela comparativa</CardTitle>
                  <CardDescription>MultiZap vs Concorrentes. Marque o que cada lado tem.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {comparison.map((row, i) => (
                    <div key={i} className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-3 rounded-lg border p-3">
                      <Input placeholder="Funcionalidade" value={row.feature} onChange={(e) => {
                        const c = [...comparison]; c[i] = { ...row, feature: e.target.value }; setComparison(c);
                      }} />
                      <label className="flex items-center gap-2 text-xs"><Switch checked={row.us} onCheckedChange={(v) => {
                        const c = [...comparison]; c[i] = { ...row, us: v }; setComparison(c);
                      }} /> MultiZap</label>
                      <label className="flex items-center gap-2 text-xs"><Switch checked={row.them} onCheckedChange={(v) => {
                        const c = [...comparison]; c[i] = { ...row, them: v }; setComparison(c);
                      }} /> Concorrente</label>
                      <Button variant="ghost" size="icon" onClick={() => setComparison(comparison.filter((_, j) => j !== i))}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <Button variant="outline" disabled={comparison.length >= 20} onClick={() => setComparison([...comparison, { feature: "", us: true, them: false }])}>
                      <Plus className="mr-2 h-4 w-4" /> Adicionar linha
                    </Button>
                    <Button onClick={() => saveM.mutate({ landing_comparison: comparison.filter((r) => r.feature) })} disabled={saveM.isPending}>
                      <Save className="mr-2 h-4 w-4" /> Salvar comparação
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </PageScaffold>
  );
}
