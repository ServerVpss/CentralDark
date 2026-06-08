import { useState, useEffect } from "react";
import { Zap, Check, Loader2, Save, Webhook, Eye, EyeOff, Copy, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { useMisticPayGateway } from "@/hooks/usePayments";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const WEBHOOK_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/misticpay-webhook`;

export function MisticPayGatewayConfigDialog({ open, onOpenChange }: Props) {
  const { gateway, updateGateway } = useMisticPayGateway();
  const [isSaving, setIsSaving] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [showCi, setShowCi] = useState(false);
  const [showCs, setShowCs] = useState(false);

  const [config, setConfig] = useState({
    display_name: "MisticPay",
    min_deposit: 5,
    client_id: "",
    client_secret: "",
  });

  const [verifyResult, setVerifyResult] = useState<null | {
    ok: boolean; message: string; accountName?: string; balance?: number;
  }>(null);

  useEffect(() => {
    if (gateway) {
      const c = (gateway.config || {}) as { client_id?: string; client_secret?: string };
      setConfig({
        display_name: gateway.name || "MisticPay",
        min_deposit: gateway.min_deposit || 5,
        client_id: c.client_id || "",
        client_secret: c.client_secret || "",
      });
    }
  }, [gateway]);

  const handleVerify = async () => {
    if (!config.client_id || !config.client_secret) {
      toast.error("Preencha Client ID e Client Secret antes de verificar");
      return;
    }
    setIsVerifying(true);
    setVerifyResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("misticpay-verify", {
        body: { client_id: config.client_id, client_secret: config.client_secret },
      });
      if (error) throw error;
      const r = data as any;
      if (r?.success) {
        setVerifyResult({
          ok: true,
          message: "Credenciais válidas! Conexão com a MisticPay OK.",
          accountName: r.user?.name,
          balance: r.user?.availableBalance,
        });
        toast.success("Credenciais MisticPay verificadas!");
      } else {
        setVerifyResult({ ok: false, message: r?.error || "Credenciais inválidas" });
        toast.error(r?.error || "Falha ao verificar credenciais");
      }
    } catch (e) {
      setVerifyResult({ ok: false, message: String(e) });
      toast.error("Erro ao verificar credenciais");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCopyWebhook = () => {
    navigator.clipboard.writeText(WEBHOOK_URL);
    toast.success("URL do webhook copiada!");
  };

  const handleSave = async () => {
    if (!config.client_id || !config.client_secret) {
      toast.error("Preencha Client ID e Client Secret");
      return;
    }
    setIsSaving(true);
    try {
      await updateGateway.mutateAsync({
        client_id: config.client_id,
        client_secret: config.client_secret,
        min_deposit: config.min_deposit,
        is_active: true,
      });
      onOpenChange(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] bg-card border-border max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-400" />
            Configurar MisticPay
          </DialogTitle>
          <DialogDescription>
            Insira o Client ID e Client Secret da sua conta MisticPay
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">
          <div className="space-y-2">
            <Label htmlFor="display_name">Nome de Exibição</Label>
            <Input id="display_name" value={config.display_name}
              onChange={(e) => setConfig({ ...config, display_name: e.target.value })}
              className="bg-secondary/50" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="min_deposit">Depósito Mínimo (R$)</Label>
            <Input id="min_deposit" type="number" min={1} step={0.01} value={config.min_deposit}
              onChange={(e) => setConfig({ ...config, min_deposit: parseFloat(e.target.value) || 0 })}
              className="bg-secondary/50" />
          </div>

          <div className="rounded-lg bg-yellow-500/10 border border-yellow-500/30 p-3">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="h-4 w-4 text-yellow-500" />
              <span className="font-medium text-yellow-500">MisticPay PIX</span>
            </div>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• PIX instantâneo via API REST simples</li>
              <li>• Autenticação por Client ID + Client Secret</li>
              <li>• Webhook configurado por transação (automático)</li>
            </ul>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ci">Client ID (ci)</Label>
            <div className="relative">
              <Input id="ci" type={showCi ? "text" : "password"}
                placeholder="seu_client_id" value={config.client_id}
                onChange={(e) => setConfig({ ...config, client_id: e.target.value })}
                className="bg-secondary/50 pr-10 font-mono text-sm" />
              <Button type="button" variant="ghost" size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                onClick={() => setShowCi(!showCi)}>
                {showCi ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cs">Client Secret (cs)</Label>
            <div className="relative">
              <Input id="cs" type={showCs ? "text" : "password"}
                placeholder="seu_client_secret" value={config.client_secret}
                onChange={(e) => setConfig({ ...config, client_secret: e.target.value })}
                className="bg-secondary/50 pr-10 font-mono text-sm" />
              <Button type="button" variant="ghost" size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                onClick={() => setShowCs(!showCs)}>
                {showCs ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <Button variant="outline" className="w-full gap-2" onClick={handleVerify} disabled={isVerifying}>
            {isVerifying ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
            Verificar credenciais agora
          </Button>

          {verifyResult && (
            <div className={`rounded-lg p-3 border text-sm ${
              verifyResult.ok
                ? "bg-success/10 border-success/30 text-success"
                : "bg-destructive/10 border-destructive/30 text-destructive"
            }`}>
              <div className="flex items-center gap-2 font-medium">
                {verifyResult.ok ? <Check className="h-4 w-4" /> : <Zap className="h-4 w-4" />}
                {verifyResult.message}
              </div>
              {verifyResult.ok && (
                <div className="text-xs text-muted-foreground mt-1">
                  {verifyResult.accountName && <>Conta: <b>{verifyResult.accountName}</b> · </>}
                  Saldo: <b>R$ {Number(verifyResult.balance ?? 0).toFixed(2)}</b>
                </div>
              )}
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Webhook className="h-4 w-4 text-primary" />
              <Label>Webhook (já configurado automaticamente)</Label>
            </div>
            <p className="text-xs text-muted-foreground">
              A URL abaixo é enviada em cada transação como <code>projectWebhook</code>. Você não precisa cadastrar nada manualmente na MisticPay.
            </p>
            <div className="flex gap-2">
              <Input value={WEBHOOK_URL} readOnly className="bg-secondary/50 font-mono text-xs" />
              <Button variant="outline" size="icon" onClick={handleCopyWebhook}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button variant="glow" className="gap-2" onClick={handleSave} disabled={isSaving}>
            {isSaving ? <><Loader2 className="h-4 w-4 animate-spin" />Salvando...</>
              : <><Save className="h-4 w-4" />Salvar e Ativar</>}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
