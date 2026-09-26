# COMANDO - app.financeiro.tsx
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\CentralDark\apps\clone-deck\apps\crm\src\routes\app.financeiro.tsx
**SHA:** 519fbdcfa7f7f3aa
**Timestamp:** 2026-08-26T19:31:54.231396
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const start = new Date(now);

### Gaps
- PENDENTE: "outline",

### Ouro Bruto (primeiros 5000 chars)
```
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getFinanceiroOverview,
  listFinanceiroPix,
  listFinanceiroLedger,
  listCollectionEvents,
  pauseCollection,
  resumeCollection,
  cancelPixFromFinance,
} from "@/lib/financeiro.functions";
import { useCurrentWorkspace } from "@/hooks/use-workspace";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import {
  Wallet, TrendingUp, TrendingDown, Receipt, Clock, XCircle, CheckCircle2,
  Pause, Play, Ban, Copy,
} from "lucide-react";

export const Route = createFileRoute("/app/financeiro")({
  component: FinanceiroPage,
});

const BRL = (n: number) => Number(n || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const fmtDT = (s: string | null | undefined) => (s ? new Date(s).toLocaleString("pt-BR") : "—");

const STATUS_VARIANT: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  PENDENTE: "outline",
  COMPLETO: "default",
  EXPIRADO: "secondary",
  CANCELADO: "destructive",
};

const CHANNEL_LABEL: Record<string, string> = {
  meta_cloud: "Meta Cloud API",
  wuzapi_gateway: "MultiZap QR / WuzAPI",
  baileys_selfhosted: "Baileys",
};

function FinanceiroPage() {
  const wsQuery = useCurrentWorkspace();
  const workspaceId = wsQuery.data?.id;
  if (!workspaceId) {
    return (
      <div className="container mx-auto max-w-7xl space-y-6 p-4 md:p-6">
        <Skeleton className="h-32" />
      </div>
    );
  }
  return <FinanceiroBody workspaceId={workspaceId} />;
}

function FinanceiroBody({ workspaceId }: { workspaceId: string }) {
  const qc = useQueryClient();
  const fetchOverview = useServerFn(getFinanceiroOverview);
  const fetchPix = useServerFn(listFinanceiroPix);
  const fetchLedger = useServerFn(listFinanceiroLedger);
  const fetchEvents = useServerFn(listCollectionEvents);
  const pauseFn = useServerFn(pauseCollection);
  const resumeFn = useServerFn(resumeCollection);
  const cancelFn = useServerFn(cancelPixFromFinance);

  const [status, setStatus] = useState<"PENDENTE" | "COMPLETO" | "EXPIRADO" | "CANCELADO" | "all">("all");
  const [channel, setChannel] = useState<"meta_cloud" | "wuzapi_gateway" | "baileys_selfhosted" | "all">("all");
  const [period, setPeriod] = useState<"today" | "yesterday" | "week" | "month" | "all">("month");

  const range = useMemo(() => {
    const now = new Date();
    const start = new Date(now);
    if (period === "today") start.setHours(0, 0, 0, 0);
    else if (period === "yesterday") { start.setDate(start.getDate() - 1); start.setHours(0, 0, 0, 0); }
    else if (period === "week") start.setDate(start.getDate() - 7);
    else if (period === "month") start.setDate(start.getDate() - 30);
    else return {};
    return { from: start.toISOString(), to: now.toISOString() };
  }, [period]);

  const overviewQ = useQuery({
    queryKey: ["fin-overview", workspaceId],
    queryFn: () => fetchOverview({ data: { workspaceId } }),
    refetchInterval: 30_000,
  });

  const pixQ = useQuery({
    queryKey: ["fin-pix", workspaceId, status, channel, period],
    queryFn: () =>
      fetchPix({
        data: { workspaceId, status, channel, ...range, limit: 50, offset: 0 },
      }),
    refetchInterval: 20_000,
  });

  const ledgerQ = useQuery({
    queryKey: ["fin-ledger", workspaceId, period],
    queryFn: () => fetchLedger({ data: { workspaceId, ...range, limit: 50, offset: 0 } }),
  });

  const eventsQ = useQuery({
    queryKey: ["fin-events", workspaceId],
    queryFn: () => fetchEvents({ data: { workspaceId, limit: 50 } }),
    refetchInterval: 30_000,
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["fin-pix"] });
    qc.invalidateQueries({ queryKey: ["fin-overview"] });
    qc.invalidateQueries({ queryKey: ["fin-events"] });
  };

  const pauseMut = useMutation({
    mutationFn: (pixId: string) => pauseFn({ data: { workspaceId, pixId } }),
    onSuccess: () => { toast.success("Cobrança pausada."); invalidate(); },
    onError: (e: Error) => toast.error(e.message),
  });
  const resumeMut = useMutation({
    mutationFn: (pixId: string) => resumeFn({ data: { workspaceId, pixId } }),
    onSuccess: () => { toast.success("Cobrança reativada."); invalidate(); },
    onError: (e: Error) => toast.error(e.message),
  });
  const cancelMut = useMutation({
    mutationFn: (pixId: stri
```