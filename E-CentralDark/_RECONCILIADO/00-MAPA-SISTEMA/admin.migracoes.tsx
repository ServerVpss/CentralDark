import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Download, AlertTriangle, Database, ShieldCheck, Loader2 } from "lucide-react";
import JSZip from "jszip";
import {
  listWorkspacesForExport,
  previewWorkspaceExport,
  exportWorkspaceData,
} from "@/lib/export-workspace.functions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { friendlyError } from "@/lib/friendly-error";

export const Route = createFileRoute("/admin/migracoes")({ component: Page });

function Page() {
  const listFn = useServerFn(listWorkspacesForExport);
  const previewFn = useServerFn(previewWorkspaceExport);
  const exportFn = useServerFn(exportWorkspaceData);

  const [selectedId, setSelectedId] = useState<string>("");
  const [exporting, setExporting] = useState(false);

  const workspaces = useQuery({
    queryKey: ["admin", "migracoes", "workspaces"],
    queryFn: () => listFn(),
  });

  const preview = useQuery({
    queryKey: ["admin", "migracoes", "preview", selectedId],
    queryFn: () => previewFn({ data: { workspaceId: selectedId } }),
    enabled: !!selectedId,
  });

  async function handleExport() {
    if (!selectedId) return;
    setExporting(true);
    try {
      const result = await exportFn({ data: { workspaceId: selectedId } });
      const zip = new JSZip();

      for (const [name, content] of Object.entries(result.files)) {
        zip.file(name, JSON.stringify(content, null, 2));
      }
      zip.file("README-importacao.md", result.readme);

      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const safeName = (result.workspace?.name ?? "workspace")
        .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      a.href = url;
      a.download = `multizap-export-${safeName}-${new Date().toISOString().slice(0, 10)}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("Exportação concluída! Arquivo baixado.");
      if (result.truncated) {
        toast.warning("Algumas mensagens foram cortadas pelo limite. O essencial veio.");
      }
    } catch (err) {
      toast.error(friendlyError(err));
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-primary/10 p-2 text-primary">
          <Database className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Migrações</h1>
          <p className="text-sm text-muted-foreground">
            Exporta o conteúdo de um workspace pra levar pra outro CRM.
          </p>
        </div>
      </div>

      <Card className="border-amber-500/30 bg-amber-500/5">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <ShieldCheck className="h-4 w-4 text-amber-500" />
            O que vai no arquivo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>✅ Conexões WhatsApp (sem tokens), contatos privados, tickets privados, mensagens de texto, log de envio.</p>
          <p>❌ Grupos, mídias (imagens/áudios), tokens, secrets, dados de outros workspaces.</p>
          <p className="text-xs">Tudo registrado em auditoria (action: <code>admin:export_workspace</code>).</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>1. Escolha o workspace</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {workspaces.isLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Carregando workspaces…
            </div>
          ) : workspaces.error ? (
            <p className="text-sm text-destructive">
              Não consegui listar os workspaces. {friendlyError(workspaces.error)}
            </p>
          ) : (
            <Select value={selectedId} onValueChange={setSelectedId}>
              <SelectTrigger className="w-full max-w-md">
                <SelectValue placeholder="Selecione um workspace…" />
              </SelectTrigger>
              <SelectContent>
                {(workspaces.data ?? []).map((w: any) => (
                  <SelectItem key={w.id} value={w.id}>
                    {w.name} {w.slug ? <span className="text-muted-foreground">— {w.slug}</span> : null}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </CardContent>
      </Card>

      {selectedId && (
        <Card>
          <CardHeader>
            <CardTitle>2. Prévia do que será exportado</CardTitle>
          </CardHeader>
          <CardContent>
            {preview.isLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Contando registros…
              </div>
            ) : preview.error ? (
              <p className="text-sm text-destructive">{friendlyError(preview.error)}</p>
            ) : preview.data ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <StatBox label="Conexões" value={preview.data.counts.connections} />
                <StatBox label="Contatos" value={preview.data.counts.contacts} />
                <StatBox label="Tickets" value={preview.data.counts.tickets} />
                <StatBox label="Mensagens" value={preview.data.counts.messages} />
              </div>
            ) : null}
          </CardContent>
        </Card>
      )}

      {selectedId && preview.data && (
        <Card>
          <CardHeader>
            <CardTitle>3. Gerar e baixar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {preview.data.counts.messages > 20000 && (
              <div className="flex items-start gap-2 rounded-md border border-amber-500/30 bg-amber-500/5 p-3 text-sm">
                <AlertTriangle className="mt-0.5 h-4 w-4 text-amber-500" />
                <span>
                  Esse workspace tem mais de 20.000 mensagens. O export vai trazer as 20.000 mais antigas
                  e marcar o resto como "truncado" no README.
                </span>
              </div>
            )}
            <Button onClick={handleExport} disabled={exporting} size="lg" className="gap-2">
              {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              {exporting ? "Gerando arquivo…" : "Exportar workspace (.zip)"}
            </Button>
            <p className="text-xs text-muted-foreground">
              O arquivo é gerado direto no seu navegador. Nenhum dado fica salvo em servidor.
            </p>
          </CardContent>
        </Card>
      )}

      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="text-base">Próximo passo: receber mensagens nos dois CRMs</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            Esse export traz o histórico até agora. Pra mensagens novas chegarem nos
            dois CRMs <strong>ao mesmo tempo</strong>, o Gateway precisa fazer fanout dos webhooks.
          </p>
          <p>
            Isso mexe na <Badge variant="outline">área protegida</Badge> Gateway/WuzAPI.
            Quando quiser ativar, responda no chat com a frase exata:
          </p>
          <code className="block rounded bg-muted px-3 py-2 text-xs">
            AUTORIZO MEXER NO GATEWAY/WUZAPI
          </code>
        </CardContent>
      </Card>
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-2xl font-bold tabular-nums">{value.toLocaleString("pt-BR")}</div>
    </div>
  );
}
