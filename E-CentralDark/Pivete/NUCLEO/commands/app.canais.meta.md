# COMANDO - app.canais.meta.tsx
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\CentralDark\apps\clone-deck\apps\crm\src\routes\app.canais.meta.tsx
**SHA:** f7af6669f2b6efd2
**Timestamp:** 2026-08-26T19:31:53.285537
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- const navigate = useNavigate({ from: "/app/canais/meta" });

### Ouro Bruto (primeiros 5000 chars)
```
// Página nova: /app/canais/meta — fluxo simplificado em 4 abas
// (Perfis → Números → Webhook → Diagnóstico). Substitui a ideia do
// formulão único pelo modelo "perfil + descoberta automática".
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { formatDateTimeBR } from "@/lib/datetime";
import {
  Radio, Plus, Trash2, RefreshCw, Copy, Check, ChevronLeft,
  Eye, EyeOff, ShieldCheck, AlertTriangle, Loader2, Phone,
} from "lucide-react";
import { AddPhoneNumberWizard } from "@/components/whatsapp/AddPhoneNumberWizard";
import { PageScaffold } from "@/components/page-scaffold";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { useCurrentWorkspace } from "@/hooks/use-workspace";
import {
  listMetaProfiles, createMetaProfile, deleteMetaProfile,
  listMetaProfileNumbers, importMetaPhoneNumber, requestPhoneRegistration,
  updateWebhookEvents, getConnectionBasics, runConnectionDiagnostic,
  updateConnectionSecurity,
} from "@/lib/meta-profiles.functions";
import { cn } from "@/lib/utils";
import { LoadingDots } from "@/components/ui/loading-dots";

const tabSchema = z.object({
  tab: z.enum(["perfis", "numeros", "webhook", "diagnostico"]).default("perfis").catch("perfis"),
  profile: z.string().optional(),
  connection: z.string().optional(),
});

export const Route = createFileRoute("/app/canais/meta")({
  validateSearch: (s) => tabSchema.parse(s),
  component: Page,
});

function Page() {
  const { data: ws } = useCurrentWorkspace();
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/app/canais/meta" });

  const setTab = (tab: "perfis" | "numeros" | "webhook" | "diagnostico") =>
    navigate({ search: { ...search, tab } });

  return (
    <PageScaffold
      title="Conectar WhatsApp Meta"
      description="Crie um perfil com sua WABA, escolha o número e configure o webhook."
      icon={Radio}
      adminHref="/admin/whatsapp"
    >
      <div className="space-y-6 p-6">
        <Link
          to="/app/canais"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" /> Voltar para Canais
        </Link>

        {!ws ? (
          <div className="text-sm text-muted-foreground"><LoadingDots size="sm" label="Carregando workspace" /></div>
        ) : (
          <Tabs value={search.tab} onValueChange={(v) => setTab(v as never)}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="perfis">1. Perfis</TabsTrigger>
              <TabsTrigger value="numeros" disabled={!search.profile}>2. Números</TabsTrigger>
              <TabsTrigger value="webhook" disabled={!search.connection}>3. Webhook</TabsTrigger>
              <TabsTrigger value="diagnostico" disabled={!search.connection}>4. Diagnóstico</TabsTrigger>
            </TabsList>

            <TabsContent value="perfis" className="mt-6">
              <PerfisTab workspaceId={ws.id} onAccess={(id) => navigate({ search: { tab: "numeros", profile: id } })} />
            </TabsContent>
            <TabsContent value="numeros" className="mt-6">
              {search.profile ? (
                <NumerosTab
                  profileId={search.profile}
                  onSelected={(connId) => navigate({ search: { ...search, tab: "webhook" as const, connection: connId } })}
                />
              ) : (
                <Empty msg="Selecione um perfil primeiro." />
              )}
            </TabsContent>
            <TabsContent value="webhook" className="mt-6">
              {search.connection ? (
                <WebhookTab connectionId={search.connection} />
              ) : <Empty msg="Selecione um número primeiro." />}
            </TabsContent>
            <TabsContent value="diagnostico" className="mt-6">
              {search.connection ? (
                <DiagnosticoTab connectionId={search.connection} />
              ) : <Empty msg="Selecione um número primeiro." />}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </PageScaffold>
  );
}

function Empty({ msg }: { msg: string }) {
  return <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">{msg}</div>;
}

// --------------------------------------------------------------------
// Tab 1: Perfis
// ---------------------------------------------------------------
```