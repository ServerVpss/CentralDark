# CONTRATO - admin.gateway-pix.tsx
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\CentralDark\apps\clone-deck\apps\crm\src\routes\admin.gateway-pix.tsx
**SHA:** 989053d79357c8cf
**Timestamp:** 2026-08-26T19:31:47.836214
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- PENDENTE: { v: "secondary", cls: "bg-amber-500/15 text-amber-500 border-amber-500/30", icon: Wallet },

### Ouro Bruto (primeiros 5000 chars)
```
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listGateways,
  saveGateway,
  testGatewayConnection,
  listPixTransactions,
  createPixTransaction,
  checkPixTransaction,
  getPaymentsSummary,
} from "@/lib/payments.functions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { CreditCard, Copy, QrCode, RefreshCw, CheckCircle2, AlertCircle, Wallet, TestTube2 } from "lucide-react";

export const Route = createFileRoute("/admin/gateway-pix")({ component: GatewayPixPage });

function GatewayPixPage() {
  const qc = useQueryClient();
  const listFn = useServerFn(listGateways);
  const saveFn = useServerFn(saveGateway);
  const testFn = useServerFn(testGatewayConnection);
  const listTx = useServerFn(listPixTransactions);
  const createTx = useServerFn(createPixTransaction);
  const checkTx = useServerFn(checkPixTransaction);
  const summaryFn = useServerFn(getPaymentsSummary);

  const { data: gwData, isLoading } = useQuery({
    queryKey: ["payment-gateways"],
    queryFn: () => listFn(),
  });
  const { data: txData } = useQuery({
    queryKey: ["pix-transactions"],
    queryFn: () => listTx({ data: { limit: 100 } }),
    refetchInterval: 15000,
  });
  const { data: summary } = useQuery({
    queryKey: ["payments-summary"],
    queryFn: () => summaryFn(),
    refetchInterval: 30000,
  });

  const gateway = useMemo(
    () => gwData?.gateways?.find((g: any) => g.provider === "misticpay") ?? null,
    [gwData],
  );

  const [form, setForm] = useState({
    provider: "misticpay",
    label: "MisticPay",
    client_id: "",
    client_secret: "",
    environment: "production" as "production" | "sandbox",
    webhook_url: "",
    base_url: "https://api.misticpay.com",
    is_active: true,
    is_default: true,
    notes: "",
  });

  useEffect(() => {
    if (gateway) {
      setForm({
        provider: gateway.provider,
        label: gateway.label || "MisticPay",
        client_id: gateway.client_id ?? "",
        client_secret: gateway.client_secret ?? "",
        environment: (gateway.environment as any) ?? "production",
        webhook_url: gateway.webhook_url ?? "",
        base_url: gateway.base_url ?? "https://api.misticpay.com",
        is_active: !!gateway.is_active,
        is_default: !!gateway.is_default,
        notes: gateway.notes ?? "",
      });
    }
  }, [gateway]);

  const suggestedWebhook =
    typeof window !== "undefined"
      ? `${window.location.origin.replace("id-preview--", "").replace(/-dev\./, ".")}/api/public/misticpay-webhook`
      : "/api/public/misticpay-webhook";

  const saveMut = useMutation({
    mutationFn: () =>
      saveFn({
        data: {
          ...form,
          id: gateway?.id,
          webhook_url: form.webhook_url || suggestedWebhook,
        } as any,
      }),
    onSuccess: () => {
      toast.success("Gateway salvo");
      qc.invalidateQueries({ queryKey: ["payment-gateways"] });
    },
    onError: (e: any) => toast.error(e?.message ?? "Erro ao salvar"),
  });

  const testMut = useMutation({
    mutationFn: () => testFn({ data: { id: gateway!.id } }),
    onSuccess: (r: any) => {
      if (r.ok) toast.success(`Conexão OK — ${r.body?.data?.name ?? "autenticado"}`);
      else toast.error(`Falha: ${r.body?.message ?? r.status}`);
    },
    onError: (e: any) => toast.error(e?.message ?? "Erro no teste"),
  });

  // Modal criar Pix
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    amount: "10",
    payerName: "",
    payerDocument: "",
    description: "Teste MultiZap",
  });
  const [pixResult, setPixResult] = useState<any>(null);

  const createMut = useMutation({
    mutationFn: () =>
      createTx({
        data: {
          amount: parseFloat(createForm.amount),
          payerName: createForm.payerName,
          payerDocument: createForm.payerDocument.replace(/\D/g, ""),
          description: createForm.description,
          purpose: "test",
        },
      }),
    onSuccess: (r: any) => {
      setPixResult(r.transaction);
      qc.invalidateQueries({ queryKey: ["pix-transactions"] });
      toast.success("Pix gerado");
   
```