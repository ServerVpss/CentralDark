// Painel master: /admin/sistema/apps
// Gerencia o aplicativo MultiZap (PWA + link/versão do APK Android).
// Apenas super_admin pode editar. Demais usuários nem chegam aqui (guard do /admin).

import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Smartphone, Apple, Monitor, Globe, Copy, ExternalLink, Save,
  CheckCircle2, AlertTriangle, Download, ShieldCheck, ImageIcon,
} from "lucide-react";
import { adminGetAppSettings, adminUpdateAppSettings } from "@/lib/admin-apps.functions";
import { friendlyError } from "@/lib/friendly-error";
import { formatDateTimeBR } from "@/lib/datetime";

export const Route = createFileRoute("/admin/sistema/apps")({
  component: AdminAppsPage,
});

type CheckResult = { ok: boolean; label: string; detail?: string };

function AdminAppsPage() {
  const qc = useQueryClient();
  const getFn = useServerFn(adminGetAppSettings);
  const upFn = useServerFn(adminUpdateAppSettings);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-app-settings"],
    queryFn: () => getFn(),
  });

  const [url, setUrl] = useState("");
  const [version, setVersion] = useState("");

  useEffect(() => {
    if (data) {
      setUrl(data.android_apk_download_url || "");
      setVersion(data.android_apk_version || "");
    }
  }, [data]);

  const saveM = useMutation({
    mutationFn: () => upFn({ data: { android_apk_download_url: url, android_apk_version: version } }),
    onSuccess: () => {
      toast.success("Configuração do app salva.");
      qc.invalidateQueries({ queryKey: ["admin-app-settings"] });
      qc.invalidateQueries({ queryKey: ["android-apk-info"] });
    },
    onError: (e: Error) => toast.error(friendlyError(e)),
  });

  const copyUrl = async () => {
    if (!url) return toast.error("Nenhum link configurado ainda.");
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copiado.");
    } catch {
      toast.error("Não foi possível copiar.");
    }
  };

  return (
    <div className="container mx-auto max-w-5xl space-y-6 p-4 md:p-6">
      <header className="space-y-1">
        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
          <Smartphone className="h-7 w-7 text-primary" />
          Aplicativo MultiZap (Master)
        </h1>
        <p className="text-muted-foreground text-sm">
          Controla o app que os clientes instalam no Android, iPhone e Desktop. Use este painel
          para publicar uma nova versão do APK Android e conferir se o PWA está saudável.
        </p>
      </header>

      <PlatformStatusGrid />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5 text-primary" />
            APK Android (Download direto)
          </CardTitle>
          <CardDescription>
            Link e versão que aparecem na tela inicial do chat e em qualquer botão
            “Baixar APK” espalhado pelo sistema. <strong>Use apenas o link oficial.</strong>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-48" />
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="apk-url">Link do APK (https://…)</Label>
                <div className="flex gap-2">
                  <Input
                    id="apk-url"
                    type="url"
                    placeholder="https://multizap.dev/downloads/multizap-1.0.0.apk"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                  />
                  <Button type="button" variant="outline" onClick={copyUrl} title="Copiar">
                    <Copy className="h-4 w-4" />
                  </Button>
                  {url && (
                    <Button type="button" variant="outline" asChild title="Abrir">
                      <a href={url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Deixe vazio para esconder o botão “Baixar APK” em todo o sistema.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="apk-version">Versão</Label>
                  <Input
                    id="apk-version"
                    placeholder="1.0.0"
                    value={version}
                    onChange={(e) => setVersion(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Publicado em</Label>
                  <Input
                    readOnly
                    value={
                      data?.android_apk_updated_at
                        ? formatDateTimeBR(data.android_apk_updated_at)
                        : "—"
                    }
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button onClick={() => saveM.mutate()} disabled={saveM.isPending}>
                  <Save className="mr-2 h-4 w-4" />
                  Salvar
                </Button>
                <Button variant="outline" asChild>
                  <a href="/docs/APPS_MULTIZAP_ANDROID_IOS_DESKTOP.md" target="_blank" rel="noopener noreferrer">
                    Como gerar APK/AAB
                  </a>
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <DiagnosticsCard />
    </div>
  );
}

function PlatformStatusGrid() {
  const items = [
    {
      icon: Globe,
      title: "PWA (Web)",
      status: "Ativo",
      ok: true,
      desc: "Manifest, ícones e meta tags publicados. Funciona em qualquer navegador moderno.",
    },
    {
      icon: Smartphone,
      title: "Android",
      status: "PWA + APK manual",
      ok: true,
      desc: "Instalável como PWA pelo Chrome. APK direto se um link estiver configurado abaixo.",
    },
    {
      icon: Apple,
      title: "iPhone / iPad",
      status: "Adicionar à Tela",
      ok: true,
      desc: "iOS instala via Safari → Compartilhar → Adicionar à Tela de Início.",
    },
    {
      icon: Monitor,
      title: "Desktop",
      status: "PWA instalável",
      ok: true,
      desc: "Chrome/Edge mostram o ícone de instalar. Abre em janela própria.",
    },
  ];
  return (
    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
      {items.map((it) => (
        <Card key={it.title}>
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <it.icon className="h-5 w-5" />
              </div>
              <Badge variant={it.ok ? "default" : "secondary"} className="gap-1">
                {it.ok ? <CheckCircle2 className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                {it.status}
              </Badge>
            </div>
            <h3 className="font-semibold text-sm">{it.title}</h3>
            <p className="text-xs text-muted-foreground">{it.desc}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function DiagnosticsCard() {
  const [results, setResults] = useState<CheckResult[] | null>(null);
  const [busy, setBusy] = useState(false);

  const run = async () => {
    setBusy(true);
    const out: CheckResult[] = [];
    try {
      const r = await fetch("/manifest.webmanifest", { cache: "no-store" });
      const j = await r.json();
      out.push({
        ok: r.ok && !!j.name && !!j.icons?.length,
        label: "Manifest carrega",
        detail: r.ok ? `${j.name} · ${j.icons?.length ?? 0} ícones` : `HTTP ${r.status}`,
      });
      out.push({
        ok: j.icons?.some((i: { sizes: string }) => i.sizes === "192x192"),
        label: "Ícone 192×192",
      });
      out.push({
        ok: j.icons?.some((i: { sizes: string }) => i.sizes === "512x512"),
        label: "Ícone 512×512",
      });
      out.push({
        ok: j.icons?.some((i: { purpose?: string }) => i.purpose === "maskable"),
        label: "Ícone maskable (Android)",
      });
    } catch (e) {
      out.push({ ok: false, label: "Manifest carrega", detail: (e as Error).message });
    }

    for (const path of ["/icons/icon-192.png", "/icons/icon-512.png", "/icons/apple-touch-icon.png"]) {
      try {
        const r = await fetch(path, { method: "HEAD" });
        out.push({ ok: r.ok, label: `Arquivo ${path}`, detail: r.ok ? "OK" : `HTTP ${r.status}` });
      } catch (e) {
        out.push({ ok: false, label: `Arquivo ${path}`, detail: (e as Error).message });
      }
    }

    setResults(out);
    setBusy(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" />
          Diagnóstico de instalação
        </CardTitle>
        <CardDescription>
          Testa se o navegador consegue carregar o manifest e os ícones. Roda direto no seu navegador.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Button onClick={run} disabled={busy}>
            <ImageIcon className="mr-2 h-4 w-4" />
            {busy ? "Verificando…" : "Verificar manifest e ícones"}
          </Button>
        </div>
        {results && (
          <ul className="divide-y rounded-md border">
            {results.map((r, i) => (
              <li key={i} className="flex items-center justify-between p-3 text-sm">
                <span className="flex items-center gap-2">
                  {r.ok ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                  )}
                  {r.label}
                </span>
                {r.detail && <span className="text-xs text-muted-foreground">{r.detail}</span>}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
