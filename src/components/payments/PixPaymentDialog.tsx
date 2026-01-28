import { useState, useEffect } from "react";
import { Copy, Check, Loader2, QrCode, RefreshCw, Clock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { usePayments, SubscriptionPlan } from "@/hooks/usePayments";
import { ConfettiCelebration } from "@/components/gamification/ConfettiCelebration";

interface PixPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan: SubscriptionPlan | null;
}

interface PixPaymentData {
  id: string;
  txid: string;
  value: number;
  planName: string;
  planDays: number;
  qrcode: string;
  qrcodeImage: string;
  expiresAt: string;
}

export function PixPaymentDialog({ open, onOpenChange, plan }: PixPaymentDialogProps) {
  const { createPixPayment, checkPaymentStatus } = usePayments();
  const [paymentData, setPaymentData] = useState<PixPaymentData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [showConfetti, setShowConfetti] = useState(false);

  // Generate PIX when dialog opens
  useEffect(() => {
    if (open && plan && !paymentData) {
      generatePix();
    }
    if (!open) {
      setPaymentData(null);
      setShowConfetti(false);
    }
  }, [open, plan]);

  // Timer countdown
  useEffect(() => {
    if (!paymentData) return;

    const interval = setInterval(() => {
      const expires = new Date(paymentData.expiresAt).getTime();
      const now = Date.now();
      const diff = expires - now;

      if (diff <= 0) {
        setTimeLeft('Expirado');
        clearInterval(interval);
        return;
      }

      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    }, 1000);

    return () => clearInterval(interval);
  }, [paymentData]);

  const generatePix = async () => {
    if (!plan) return;
    
    setIsLoading(true);
    try {
      const data = await createPixPayment.mutateAsync(plan.code);
      setPaymentData(data);
    } catch (error) {
      console.error('Error generating PIX:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!paymentData?.qrcode) return;
    
    try {
      await navigator.clipboard.writeText(paymentData.qrcode);
      setCopied(true);
      toast.success('Código copiado!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Erro ao copiar');
    }
  };

  const handleCheckPayment = async () => {
    if (!paymentData?.txid) return;
    
    setIsChecking(true);
    try {
      const result = await checkPaymentStatus.mutateAsync(paymentData.txid);
      if (result.isPaid) {
        // Show celebration!
        setShowConfetti(true);
        toast.success('Pagamento confirmado com sucesso!');
      } else {
        toast.info('Pagamento ainda não confirmado. Tente novamente em alguns segundos.');
      }
    } catch (error) {
      console.error('Error checking payment:', error);
    } finally {
      setIsChecking(false);
    }
  };

  const handleConfettiComplete = () => {
    setShowConfetti(false);
    onOpenChange(false);
  };

  return (
    <>
      <ConfettiCelebration
        isActive={showConfetti}
        onComplete={handleConfettiComplete}
        message="Pagamento Confirmado!"
        subMessage={`Seu plano ${paymentData?.planName || ''} foi ativado com sucesso.`}
        icon="party"
      />
      
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="bg-card border-border sm:max-w-md">
          <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5 text-primary" />
            Pagamento PIX
          </DialogTitle>
          <DialogDescription>
            {plan ? `${plan.name} - R$ ${Number(plan.price).toFixed(2)}` : 'Gerando pagamento...'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-muted-foreground">Gerando QR Code PIX...</p>
            </div>
          ) : paymentData ? (
            <>
              {/* Timer */}
              <div className="flex items-center justify-center gap-2 text-warning">
                <Clock className="h-4 w-4" />
                <span className="font-mono font-bold">{timeLeft}</span>
                <span className="text-sm text-muted-foreground">para expirar</span>
              </div>

              {/* QR Code */}
              <div className="flex justify-center">
                <div className="rounded-xl bg-white p-4">
                  <img
                    src={paymentData.qrcodeImage}
                    alt="QR Code PIX"
                    className="w-48 h-48"
                  />
                </div>
              </div>

              {/* Copy and Paste */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-center">PIX Copia e Cola</p>
                <div className="relative">
                  <div className="bg-secondary/50 rounded-lg p-3 pr-12 text-xs font-mono break-all max-h-20 overflow-y-auto">
                    {paymentData.qrcode}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                    onClick={handleCopy}
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-success" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Payment Info */}
              <div className="rounded-lg bg-secondary/30 p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Plano</span>
                  <span className="font-medium">{paymentData.planName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Valor</span>
                  <span className="font-bold text-primary">
                    R$ {paymentData.value.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Validade</span>
                  <span>{paymentData.planDays} dias</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">TXID</span>
                  <span className="font-mono text-xs">{paymentData.txid.slice(0, 12)}...</span>
                </div>
              </div>

              {/* Check Payment Button */}
              <Button
                variant="glow"
                className="w-full gap-2"
                onClick={handleCheckPayment}
                disabled={isChecking}
              >
                {isChecking ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Verificando...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4" />
                    Já Paguei - Verificar
                  </>
                )}
              </Button>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <p className="text-muted-foreground">Erro ao gerar pagamento</p>
              <Button variant="outline" onClick={generatePix}>
                Tentar novamente
              </Button>
            </div>
          )}
        </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
