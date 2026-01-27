import { useState, useEffect } from "react";
import { CreditCard, Key, Link, Bell, Shield, Save, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePayments } from "@/hooks/usePayments";

export function PaymentGatewaySettings() {
  const { gatewaySettings, updateGatewaySettings, loadingSettings } = usePayments();
  const [isSaving, setIsSaving] = useState(false);
  
  const [settings, setSettings] = useState({
    gateway_type: 'efi',
    is_sandbox: false,
    pix_key: '',
    webhook_url: '',
    auto_approve: true,
    notification_enabled: true,
  });

  useEffect(() => {
    if (gatewaySettings) {
      setSettings({
        gateway_type: gatewaySettings.gateway_type || 'efi',
        is_sandbox: gatewaySettings.is_sandbox || false,
        pix_key: gatewaySettings.pix_key || '',
        webhook_url: gatewaySettings.webhook_url || '',
        auto_approve: gatewaySettings.auto_approve ?? true,
        notification_enabled: gatewaySettings.notification_enabled ?? true,
      });
    }
  }, [gatewaySettings]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateGatewaySettings.mutateAsync(settings);
    } finally {
      setIsSaving(false);
    }
  };

  if (loadingSettings) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2">
            <CreditCard className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle>Gateway de Pagamento</CardTitle>
            <CardDescription>
              Configure as integrações de pagamento PIX
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Gateway Type */}
        <div className="space-y-2">
          <Label>Gateway</Label>
          <Select
            value={settings.gateway_type}
            onValueChange={(value) => setSettings({ ...settings, gateway_type: value })}
          >
            <SelectTrigger className="bg-secondary/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              <SelectItem value="efi">Efí (Gerencianet)</SelectItem>
              <SelectItem value="mercadopago">Mercado Pago</SelectItem>
              <SelectItem value="pagseguro">PagSeguro</SelectItem>
              <SelectItem value="stripe">Stripe</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* PIX Key */}
        <div className="space-y-2">
          <Label htmlFor="pix_key">Chave PIX</Label>
          <div className="relative">
            <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="pix_key"
              placeholder="Sua chave PIX (email, CPF, CNPJ, aleatória)"
              value={settings.pix_key}
              onChange={(e) => setSettings({ ...settings, pix_key: e.target.value })}
              className="pl-10 bg-secondary/50"
            />
          </div>
        </div>

        {/* Webhook URL */}
        <div className="space-y-2">
          <Label htmlFor="webhook_url">URL do Webhook</Label>
          <div className="relative">
            <Link className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="webhook_url"
              placeholder="https://seu-servidor.com/webhook/pix"
              value={settings.webhook_url}
              onChange={(e) => setSettings({ ...settings, webhook_url: e.target.value })}
              className="pl-10 bg-secondary/50"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            URL para receber notificações de pagamento confirmado
          </p>
        </div>

        {/* Switches */}
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border border-border bg-secondary/20 p-4">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Modo Sandbox</p>
                <p className="text-sm text-muted-foreground">
                  Usar ambiente de testes (sem cobranças reais)
                </p>
              </div>
            </div>
            <Switch
              checked={settings.is_sandbox}
              onCheckedChange={(checked) => setSettings({ ...settings, is_sandbox: checked })}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border bg-secondary/20 p-4">
            <div className="flex items-center gap-3">
              <CreditCard className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Aprovação Automática</p>
                <p className="text-sm text-muted-foreground">
                  Aprovar assinaturas automaticamente após pagamento
                </p>
              </div>
            </div>
            <Switch
              checked={settings.auto_approve}
              onCheckedChange={(checked) => setSettings({ ...settings, auto_approve: checked })}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border bg-secondary/20 p-4">
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Notificações</p>
                <p className="text-sm text-muted-foreground">
                  Receber notificações de novos pagamentos
                </p>
              </div>
            </div>
            <Switch
              checked={settings.notification_enabled}
              onCheckedChange={(checked) => setSettings({ ...settings, notification_enabled: checked })}
            />
          </div>
        </div>

        {/* API Credentials Info */}
        <div className="rounded-lg bg-warning/10 border border-warning/20 p-4">
          <h4 className="font-medium text-warning mb-2">Credenciais da API</h4>
          <p className="text-sm text-muted-foreground">
            As credenciais do gateway (Client ID, Client Secret) são configuradas de forma segura 
            nas variáveis de ambiente do servidor. Entre em contato com o suporte para atualizar.
          </p>
        </div>

        {/* Save Button */}
        <Button 
          variant="glow" 
          className="w-full gap-2" 
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Salvar Configurações
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
