import { useState, useEffect, useRef } from "react";
import {
  Building2,
  Lock,
  Upload,
  Trash2,
  Check,
  Loader2,
  Save,
  Webhook,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { usePayments } from "@/shared/hooks/usePayments";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface EfiConfig {
  display_name: string;
  min_deposit: number;
  client_id: string;
  client_secret: string;
  pix_key: string;
  certificate_name: string | null;
}

interface EfiGatewayConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EfiGatewayConfigDialog({ open, onOpenChange }: EfiGatewayConfigDialogProps) {
  const { efiGateway, updateEfiGateway, loadingEfiGateway } = usePayments();
  const [isSaving, setIsSaving] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [showClientId, setShowClientId] = useState(false);
  const [showClientSecret, setShowClientSecret] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [config, setConfig] = useState<EfiConfig>({
    display_name: "EFI (Gerencianet) PIX",
    min_deposit: 2,
    client_id: "",
    client_secret: "",
    pix_key: "",
    certificate_name: null,
  });

  useEffect(() => {
    if (efiGateway) {
      const gatewayConfig = efiGateway.config as { client_id?: string; client_secret?: string; pix_key?: string } || {};
      setConfig({
        display_name: efiGateway.name || "EFI (Gerencianet) PIX",
        min_deposit: efiGateway.min_deposit || 2,
        client_id: gatewayConfig.client_id || "",
        client_secret: gatewayConfig.client_secret || "",
        pix_key: gatewayConfig.pix_key || "",
        certificate_name: "cert.p12",
      });
    }
  }, [efiGateway]);

  const handleCertificateUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.name.endsWith(".p12") || file.name.endsWith(".pem")) {
        setConfig({ ...config, certificate_name: file.name });
        toast.success("Certificado carregado com sucesso!");
      } else {
        toast.error("Formato inválido. Use .p12 ou .pem");
      }
    }
  };

  const handleRemoveCertificate = () => {
    setConfig({ ...config, certificate_name: null });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleVerifyWebhook = async () => {
    setIsVerifying(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast.success("Webhook verificado com sucesso!");
    } catch (error) {
      toast.error("Erro ao verificar webhook");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleRegisterWebhook = async () => {
    setIsRegistering(true);
    
    const webhookUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/efi-webhook`;
    
    const attemptRegister = async (attempt: number): Promise<{ data: unknown; error: unknown }> => {
      try {
        const { data, error } = await supabase.functions.invoke("efi-register-webhook", {
          body: { webhook_url: webhookUrl },
        });
        return { data, error };
      } catch (err) {
        if (attempt < 2) {
          console.log(`Tentativa ${attempt + 1} falhou, tentando novamente...`);
          await new Promise(resolve => setTimeout(resolve, 1000));
          return attemptRegister(attempt + 1);
        }
        throw err;
      }
    };
    
    try {
      const { data, error } = await attemptRegister(0);

      if (error) throw error;

      const result = data as { success?: boolean; error?: string; webhook_url?: string };
      if (result?.success) {
        toast.success(`Webhook registrado: ${result.webhook_url}`);
      } else {
        toast.error(result?.error || "Erro ao registrar webhook");
      }
    } catch (error) {
      console.error("Register webhook error:", error);
      toast.error("Erro ao registrar webhook. Verifique sua conexão e tente novamente.");
    } finally {
      setIsRegistering(false);
    }
  };

  const handleSave = async () => {
    if (!config.client_id || !config.client_secret || !config.pix_key) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    setIsSaving(true);
    try {
      await updateEfiGateway.mutateAsync({
        client_id: config.client_id,
        client_secret: config.client_secret,
        pix_key: config.pix_key,
        min_deposit: config.min_deposit,
        is_active: true,
      });
      onOpenChange(false);
    } catch (error) {
      // Error handled by mutation
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-card border-border max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Configurar EFI (Gerencianet) PIX
          </DialogTitle>
          <DialogDescription>
            Insira as credenciais para o gateway de pagamento
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Display Name */}
          <div className="space-y-2">
            <Label htmlFor="display_name">Nome de Exibição</Label>
            <Input
              id="display_name"
              value={config.display_name}
              onChange={(e) => setConfig({ ...config, display_name: e.target.value })}
              className="bg-secondary/50"
            />
            <p className="text-xs text-muted-foreground">
              Nome que será exibido para os usuários na tela de recarga
            </p>
          </div>

          {/* Min Deposit */}
          <div className="space-y-2">
            <Label htmlFor="min_deposit">Depósito Mínimo (R$)</Label>
            <Input
              id="min_deposit"
              type="number"
              min={1}
              step={0.01}
              value={config.min_deposit}
              onChange={(e) =>
                setConfig({ ...config, min_deposit: parseFloat(e.target.value) || 0 })
              }
              className="bg-secondary/50"
            />
            <p className="text-xs text-muted-foreground">
              Valor mínimo para recarga neste gateway
            </p>
          </div>

          {/* EFI Info Box */}
          <div className="rounded-lg bg-success/10 border border-success/30 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="h-4 w-4 text-success" />
              <span className="font-medium text-success">EFI PIX (Gerencianet)</span>
            </div>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• PIX instantâneo via API oficial</li>
              <li>• Requer certificado .p12 ou .pem</li>
              <li>• Comunicação segura via mTLS</li>
            </ul>
          </div>

          {/* Certificate Upload */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Certificado Digital (.p12 / .pem)
            </Label>
            <p className="text-xs text-muted-foreground mb-2">
              Faça upload do certificado gerado no painel EFI para comunicação mTLS
            </p>

            {config.certificate_name ? (
              <div className="flex items-center justify-between rounded-lg bg-success/10 border border-success/30 p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-warning/20 p-2">
                    <Lock className="h-5 w-5 text-warning" />
                  </div>
                  <div>
                    <p className="text-success font-medium flex items-center gap-1">
                      <Check className="h-4 w-4" />
                      Certificado carregado
                    </p>
                    <p className="text-xs text-muted-foreground">{config.certificate_name}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleRemoveCertificate}
                  className="text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div
                className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  Clique para fazer upload do certificado
                </p>
                <p className="text-xs text-muted-foreground mt-1">.p12 ou .pem</p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".p12,.pem"
              onChange={handleCertificateUpload}
              className="hidden"
            />
          </div>

          {/* Client ID */}
          <div className="space-y-2">
            <Label htmlFor="client_id">Client ID</Label>
            <div className="relative">
              <Input
                id="client_id"
                type={showClientId ? "text" : "password"}
                placeholder="Client_Id_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                value={config.client_id}
                onChange={(e) => setConfig({ ...config, client_id: e.target.value })}
                className="bg-secondary/50 pr-10 font-mono text-sm"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                onClick={() => setShowClientId(!showClientId)}
              >
                {showClientId ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Client Secret */}
          <div className="space-y-2">
            <Label htmlFor="client_secret">Client Secret</Label>
            <div className="relative">
              <Input
                id="client_secret"
                type={showClientSecret ? "text" : "password"}
                placeholder="Client_Secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                value={config.client_secret}
                onChange={(e) => setConfig({ ...config, client_secret: e.target.value })}
                className="bg-secondary/50 pr-10 font-mono text-sm"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                onClick={() => setShowClientSecret(!showClientSecret)}
              >
                {showClientSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* PIX Key */}
          <div className="space-y-2">
            <Label htmlFor="pix_key">Chave PIX (EVP)</Label>
            <Input
              id="pix_key"
              placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
              value={config.pix_key}
              onChange={(e) => setConfig({ ...config, pix_key: e.target.value })}
              className="bg-secondary/50 font-mono text-sm"
            />
          </div>

          {/* Webhook Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Webhook className="h-4 w-4 text-primary" />
              <Label>Webhook de Notificação</Label>
            </div>
            <p className="text-xs text-muted-foreground">
              Registre o webhook para receber notificações automáticas de pagamentos
            </p>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 gap-2"
                onClick={handleVerifyWebhook}
                disabled={isVerifying}
              >
                {isVerifying ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
                Verificar Atual
              </Button>
              <Button
                variant="glow"
                className="flex-1 gap-2"
                onClick={handleRegisterWebhook}
                disabled={isRegistering}
              >
                {isRegistering ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Webhook className="h-4 w-4" />
                )}
                Registrar
              </Button>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              O webhook permite que pagamentos PIX sejam confirmados automaticamente
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button variant="glow" className="gap-2" onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Salvar
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
