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
    },
    onError: (e: any) => toast.error(e?.message ?? "Erro ao gerar Pix"),
  });

  const checkMut = useMutation({
    mutationFn: (id: string) => checkTx({ data: { id } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pix-transactions"] });
      toast.success("Status atualizado");
    },
    onError: (e: any) => toast.error(e?.message ?? "Erro"),
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-primary/10 p-2">
          <CreditCard className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Gateway de Pagamento</h1>
          <p className="text-sm text-muted-foreground">
            Configuração do gateway Pix (MisticPay) e transações do sistema.
          </p>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="Transações totais" value={summary?.total ?? 0} />
        <StatCard label="Concluídas" value={summary?.completed ?? 0} tone="success" />
        <StatCard label="Pendentes" value={summary?.pending ?? 0} tone="warning" />
        <StatCard
          label="Recebido (R$)"
          value={(summary?.completed_amount ?? 0).toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
          })}
          tone="success"
        />
      </div>

      <Tabs defaultValue="config">
        <TabsList>
          <TabsTrigger value="config">Configuração</TabsTrigger>
          <TabsTrigger value="transactions">Transações</TabsTrigger>
          <TabsTrigger value="docs">Documentação</TabsTrigger>
        </TabsList>

        {/* Config */}
        <TabsContent value="config" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                MisticPay
                {gateway?.is_active && <Badge variant="default">Ativo</Badge>}
              </CardTitle>
              <CardDescription>
                Receba e envie Pix via API. Credenciais ficam armazenadas com acesso restrito ao
                Super Admin.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading && <p className="text-sm text-muted-foreground">Carregando…</p>}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Client ID (ci)">
                  <Input
                    value={form.client_id}
                    onChange={(e) => setForm({ ...form, client_id: e.target.value })}
                    placeholder="seu_client_id"
                  />
                </Field>
                <Field label="Client Secret (cs)">
                  <Input
                    type="password"
                    value={form.client_secret}
                    onChange={(e) => setForm({ ...form, client_secret: e.target.value })}
                    placeholder="••••••••"
                  />
                </Field>
                <Field label="URL Base">
                  <Input
                    value={form.base_url}
                    onChange={(e) => setForm({ ...form, base_url: e.target.value })}
                  />
                </Field>
                <Field label="Ambiente">
                  <select
                    className="h-10 rounded-md border bg-background px-3 text-sm"
                    value={form.environment}
                    onChange={(e) =>
                      setForm({ ...form, environment: e.target.value as any })
                    }
                  >
                    <option value="production">Produção</option>
                    <option value="sandbox">Sandbox</option>
                  </select>
                </Field>
                <Field label="Webhook URL (cole no painel MisticPay)" className="md:col-span-2">
                  <div className="flex gap-2">
                    <Input
                      value={form.webhook_url || suggestedWebhook}
                      onChange={(e) => setForm({ ...form, webhook_url: e.target.value })}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        navigator.clipboard.writeText(form.webhook_url || suggestedWebhook);
                        toast.success("Webhook copiado");
                      }}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Configure essa URL no painel MisticPay como webhook do projeto.
                  </p>
                </Field>
                <Field label="Observações" className="md:col-span-2">
                  <Textarea
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    rows={2}
                  />
                </Field>
                <div className="flex items-center gap-3">
                  <Switch
                    checked={form.is_active}
                    onCheckedChange={(v) => setForm({ ...form, is_active: v })}
                  />
                  <span className="text-sm">Ativo</span>
                </div>
                <div className="flex items-center gap-3">
                  <Switch
                    checked={form.is_default}
                    onCheckedChange={(v) => setForm({ ...form, is_default: v })}
                  />
                  <span className="text-sm">Gateway padrão</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                <Button onClick={() => saveMut.mutate()} disabled={saveMut.isPending}>
                  {saveMut.isPending ? "Salvando…" : "Salvar"}
                </Button>
                {gateway && (
                  <Button
                    variant="outline"
                    onClick={() => testMut.mutate()}
                    disabled={testMut.isPending}
                  >
                    <TestTube2 className="h-4 w-4 mr-2" />
                    {testMut.isPending ? "Testando…" : "Testar conexão"}
                  </Button>
                )}
                {gateway && (
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setCreateForm({
                        amount: "10",
                        payerName: "",
                        payerDocument: "",
                        description: "Teste MultiZap",
                      });
                      setPixResult(null);
                      setCreateOpen(true);
                    }}
                  >
                    <QrCode className="h-4 w-4 mr-2" />
                    Gerar Pix de teste
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Transactions */}
        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>Transações Pix</CardTitle>
              <CardDescription>Últimas 100 transações geradas pelo sistema.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Pagador</TableHead>
                      <TableHead>Workspace</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>ID externo</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(txData?.transactions ?? []).map((t: any) => (
                      <TableRow key={t.id}>
                        <TableCell className="text-xs">
                          {new Date(t.created_at).toLocaleString("pt-BR")}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={t.status} />
                        </TableCell>
                        <TableCell>
                          R$ {Number(t.amount).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell className="text-xs">
                          {t.payer_name}
                          <div className="text-muted-foreground">{t.payer_document}</div>
                        </TableCell>
                        <TableCell className="text-xs">{t.workspace?.name ?? "—"}</TableCell>
                        <TableCell className="text-xs max-w-[200px] truncate">
                          {t.description}
                        </TableCell>
                        <TableCell className="text-xs font-mono">
                          {t.external_transaction_id}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => checkMut.mutate(t.id)}
                            disabled={checkMut.isPending}
                          >
                            <RefreshCw className="h-3 w-3" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {!txData?.transactions?.length && (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center text-sm text-muted-foreground py-8">
                          Nenhuma transação ainda.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Docs */}
        <TabsContent value="docs">
          <Card>
            <CardHeader>
              <CardTitle>Como configurar</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <ol className="list-decimal pl-5 space-y-2">
                <li>
                  Crie sua conta em <a className="text-primary underline" href="https://misticpay.com" target="_blank" rel="noreferrer">misticpay.com</a> e pegue seu <b>Client ID</b> e <b>Client Secret</b>.
                </li>
                <li>Cole as credenciais na aba <b>Configuração</b> e salve.</li>
                <li>
                  Copie a <b>Webhook URL</b> e cole no painel da MisticPay (em "projectWebhook") para receber confirmações automáticas de pagamento.
                </li>
                <li>Clique em <b>Testar conexão</b> para validar as credenciais.</li>
                <li>Use <b>Gerar Pix de teste</b> para emitir um QR Code e validar o fluxo ponta-a-ponta.</li>
              </ol>
              <div className="rounded-md bg-muted p-3 text-xs">
                Documentação oficial: <a className="text-primary underline" href="https://docs.misticpay.com" target="_blank" rel="noreferrer">docs.misticpay.com</a>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal gerar pix */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Gerar Pix de teste</DialogTitle>
          </DialogHeader>
          {!pixResult ? (
            <div className="space-y-3">
              <Field label="Valor (R$)">
                <Input
                  type="number"
                  step="0.01"
                  value={createForm.amount}
                  onChange={(e) => setCreateForm({ ...createForm, amount: e.target.value })}
                />
              </Field>
              <Field label="Nome do pagador">
                <Input
                  value={createForm.payerName}
                  onChange={(e) => setCreateForm({ ...createForm, payerName: e.target.value })}
                />
              </Field>
              <Field label="CPF do pagador (só números)">
                <Input
                  value={createForm.payerDocument}
                  onChange={(e) => setCreateForm({ ...createForm, payerDocument: e.target.value })}
                />
              </Field>
              <Field label="Descrição">
                <Input
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                />
              </Field>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-center">
                {pixResult.qrcode_base64 ? (
                  <img
                    src={pixResult.qrcode_base64}
                    alt="QR Code Pix"
                    className="h-56 w-56 rounded border"
                  />
                ) : (
                  <div className="h-56 w-56 grid place-items-center border rounded text-muted-foreground text-xs">
                    Sem QR
                  </div>
                )}
              </div>
              <Field label="Pix copia e cola">
                <Textarea readOnly value={pixResult.copy_paste ?? ""} rows={3} />
              </Field>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  navigator.clipboard.writeText(pixResult.copy_paste ?? "");
                  toast.success("Copiado");
                }}
              >
                <Copy className="h-4 w-4 mr-2" /> Copiar código
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                Status: <StatusBadge status={pixResult.status} /> — Atualiza automaticamente pelo webhook.
              </p>
            </div>
          )}
          <DialogFooter>
            {!pixResult ? (
              <Button onClick={() => createMut.mutate()} disabled={createMut.isPending}>
                {createMut.isPending ? "Gerando…" : "Gerar Pix"}
              </Button>
            ) : (
              <Button variant="outline" onClick={() => setCreateOpen(false)}>
                Fechar
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <Label className="text-xs">{label}</Label>
      <div className="mt-1">{children}</div>
    </div>
  );
}

function StatCard({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: number | string;
  tone?: "default" | "success" | "warning";
}) {
  const toneCls =
    tone === "success"
      ? "text-emerald-500"
      : tone === "warning"
        ? "text-amber-500"
        : "text-foreground";
  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className={`text-2xl font-bold ${toneCls}`}>{value}</div>
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { v: any; cls: string; icon?: any }> = {
    COMPLETO: { v: "default", cls: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30", icon: CheckCircle2 },
    PENDENTE: { v: "secondary", cls: "bg-amber-500/15 text-amber-500 border-amber-500/30", icon: Wallet },
    FALHA: { v: "destructive", cls: "bg-red-500/15 text-red-500 border-red-500/30", icon: AlertCircle },
    CANCELADO: { v: "outline", cls: "bg-muted text-muted-foreground", icon: AlertCircle },
  };
  const cfg = map[status] ?? { v: "outline", cls: "" };
  const Icon = cfg.icon;
  return (
    <Badge variant="outline" className={`gap-1 ${cfg.cls}`}>
      {Icon && <Icon className="h-3 w-3" />}
      {status}
    </Badge>
  );
}
