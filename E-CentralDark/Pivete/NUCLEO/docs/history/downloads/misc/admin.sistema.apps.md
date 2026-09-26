# OUTRO - admin.sistema.apps.tsx
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\CentralDark\apps\clone-deck\apps\crm\src\routes\admin.sistema.apps.tsx
**SHA:** a327088b80415c97
**Timestamp:** 2026-08-26T19:31:58.571627
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const run = async () => {

### Ouro Bruto (primeiros 5000 chars)
```
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
       
```