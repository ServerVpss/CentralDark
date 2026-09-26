import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useCurrentWorkspace } from "@/hooks/use-workspace";
import { getBranding, saveBranding } from "@/lib/branding.functions";
import { PageScaffold } from "@/components/page-scaffold";
import { Palette, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { DomainsManagerCard } from "@/components/branding/DomainsManagerCard";
import { LoadingDots } from "@/components/ui/loading-dots";
import { WorkspaceOnboarding } from "@/components/onboarding/WorkspaceOnboarding";
import { setOnboardingCompleted } from "@/lib/onboarding.functions";


export const Route = createFileRoute("/app/personalizar")({ component: PersonalizarPage });

function PersonalizarPage() {
  const { data: ws } = useCurrentWorkspace();
  const fetchBranding = useServerFn(getBranding);
  const persistBranding = useServerFn(saveBranding);
  const qc = useQueryClient();

  const { data: branding, isLoading } = useQuery({
    queryKey: ["branding", ws?.id],
    enabled: !!ws?.id,
    queryFn: () => fetchBranding({ data: { workspaceId: ws!.id } }),
  });

  const [brandName, setBrandName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#3b82f6");
  const [sidebarBg, setSidebarBg] = useState("");
  const [faviconUrl, setFaviconUrl] = useState("");
  const [loginBgUrl, setLoginBgUrl] = useState("");
  const [hideLovableBrand, setHideLovableBrand] = useState(false);

  useEffect(() => {
    if (branding) {
      setBrandName(branding.brand_name ?? "");
      setLogoUrl(branding.logo_url ?? "");
      setPrimaryColor(branding.primary_color ?? "#3b82f6");
      setSidebarBg(branding.sidebar_bg ?? "");
      setFaviconUrl(branding.favicon_url ?? "");
      setLoginBgUrl(branding.login_background_url ?? "");
      setHideLovableBrand(branding.hide_lovable_brand ?? false);
    }
  }, [branding]);

  const save = useMutation({
    mutationFn: () =>
      persistBranding({
        data: {
          workspaceId: ws!.id,
          brand_name: brandName || null,
          logo_url: logoUrl || null,
          primary_color: primaryColor || null,
          sidebar_bg: sidebarBg || null,
          favicon_url: faviconUrl || null,
          login_background_url: loginBgUrl || null,
          hide_lovable_brand: hideLovableBrand,
        },
      }),

    onSuccess: () => {
      toast.success("Personalização salva");
      qc.invalidateQueries({ queryKey: ["branding", ws?.id] });
    },
    onError: (e: Error) => toast.error("Erro ao salvar", { description: e.message }),
  });

  return (
    <PageScaffold
      title="Personalizar"
      description="Defina logo, nome e cores da marca exibidas para sua equipe."
      icon={Palette}
      adminHref="/admin/personalizar"
    >
      <div className="p-6">
        {isLoading || !ws ? (
          <p className="text-sm text-muted-foreground"><LoadingDots size="sm" label="Carregando" /></p>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader><CardTitle>Marca</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="brand_name">Nome da marca</Label>
                  <Input id="brand_name" value={brandName} onChange={(e) => setBrandName(e.target.value)} placeholder="Ex.: Minha Empresa" />
                </div>
                <div>
                  <Label htmlFor="logo_url">URL do logo</Label>
                  <Input id="logo_url" value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} placeholder="https://..." />
                  {logoUrl && (
                    <div className="mt-2">
                      <img src={logoUrl} alt="Pré-visualização" className="h-12 w-12 rounded-md border object-cover" />
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="primary_color">Cor primária</Label>
                    <div className="flex gap-2">
                      <Input id="primary_color" type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="w-14 p-1" />
                      <Input value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="sidebar_bg">Cor da sidebar</Label>
                    <div className="flex gap-2">
                      <Input id="sidebar_bg" type="color" value={sidebarBg || "#0f172a"} onChange={(e) => setSidebarBg(e.target.value)} className="w-14 p-1" />
                      <Input value={sidebarBg} onChange={(e) => setSidebarBg(e.target.value)} placeholder="opcional" />
                    </div>
                  </div>
                </div>
                <div className="space-y-3 border-t pt-4">
                  <div>
                    <Label htmlFor="favicon_url">URL do favicon (ícone da aba)</Label>
                    <Input id="favicon_url" value={faviconUrl} onChange={(e) => setFaviconUrl(e.target.value)} placeholder="https://..." />
                  </div>
                  <div>
                    <Label htmlFor="login_bg">URL do fundo da tela de login</Label>
                    <Input id="login_bg" value={loginBgUrl} onChange={(e) => setLoginBgUrl(e.target.value)} placeholder="https://..." />
                  </div>
                  <div className="flex items-center justify-between rounded-md border p-3">
                    <div className="space-y-0.5">
                      <Label htmlFor="hide_brand">Esconder marca MultiZap</Label>
                      <p className="text-xs text-muted-foreground">
                        Remove "powered by MultiZap" do rodapé. Requer plano com white-label liberado.
                      </p>
                    </div>
                    <Switch id="hide_brand" checked={hideLovableBrand} onCheckedChange={setHideLovableBrand} />
                  </div>
                </div>
                <Button onClick={() => save.mutate()} disabled={save.isPending}>
                  {save.isPending ? "Salvando..." : "Salvar personalização"}
                </Button>
              </CardContent>
            </Card>

            <DomainsManagerCard workspaceId={ws.id} whiteLabelActive={true} />

            <OnboardingResetCard />


            <Card>
              <CardHeader><CardTitle>Pré-visualização</CardTitle></CardHeader>
              <CardContent>
                <div className="overflow-hidden rounded-md border">
                  <div className="flex items-center gap-2 border-b p-3" style={{ backgroundColor: sidebarBg || undefined, color: sidebarBg ? "#fff" : undefined }}>
                    {logoUrl ? (
                      <img src={logoUrl} alt="" className="h-8 w-8 rounded object-cover" />
                    ) : (
                      <div className="h-8 w-8 rounded" style={{ backgroundColor: primaryColor }} />
                    )}
                    <span className="text-sm font-semibold">{brandName || ws.name}</span>
                  </div>
                  <div className="space-y-2 p-4">
                    <div className="h-3 w-3/4 rounded" style={{ backgroundColor: primaryColor, opacity: 0.7 }} />
                    <div className="h-3 w-1/2 rounded bg-muted" />
                    <Button style={{ backgroundColor: primaryColor }}>Botão exemplo</Button>
                  </div>
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                  As mudanças aparecem na sidebar do /app após salvar e recarregar.
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </PageScaffold>
  );
}

function OnboardingResetCard() {
  const [open, setOpen] = useState(false);
  const fnComplete = useServerFn(setOnboardingCompleted);
  const qc = useQueryClient();

  const replay = async () => {
    try {
      await fnComplete({ data: { reset: true } });
      await qc.invalidateQueries({ queryKey: ["onboarding-state"] });
      setOpen(true);
      toast.success("Tour reaberto");
    } catch (e) {
      toast.error("Não consegui reabrir o tour");
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Tour de boas-vindas
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            Refaça o passo a passo de apresentação da plataforma quando quiser.
          </p>
          <Button variant="outline" onClick={replay}>Refazer tour</Button>
        </CardContent>
      </Card>
      {open && <WorkspaceOnboarding forceOpen onClose={() => setOpen(false)} />}
    </>
  );
}
