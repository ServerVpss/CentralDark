import { useState, useEffect } from "react";
import {
  Building2,
  Wallet,
  CreditCard,
  Zap,
  Globe,
  Shield,
  Settings2,
  Lock,
  Coins,
} from "lucide-react";
import { Card, CardContent } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Switch } from "@/shared/ui/switch";
import { Badge } from "@/shared/ui/badge";
import { usePayments, useMisticPayGateway } from "@/shared/hooks/usePayments";
import { EfiGatewayConfigDialog } from "./EfiGatewayConfigDialog";
import { MisticPayGatewayConfigDialog } from "./MisticPayGatewayConfigDialog";

interface PaymentGateway {
  id: string;
  name: string;
  slug: string;
  icon: React.ReactNode;
  iconColor: string;
  minDeposit: number;
  tags?: { label: string; icon?: React.ReactNode }[];
  isConfigurable: boolean;
}

const PAYMENT_GATEWAYS: PaymentGateway[] = [
  {
    id: "binancepay",
    name: "Binance Pay",
    slug: "binancepay",
    icon: <Coins className="h-6 w-6" />,
    iconColor: "text-yellow-500",
    minDeposit: 1.0,
    tags: [
      { label: "USDT" },
      { label: "Via Memo" },
    ],
    isConfigurable: true,
  },
  {
    id: "efi",
    name: "EFI (Gerencianet) PIX",
    slug: "efi",
    icon: <Building2 className="h-6 w-6" />,
    iconColor: "text-primary",
    minDeposit: 2.0,
    tags: [
      { label: "PIX", icon: <Lock className="h-3 w-3" /> },
      { label: "mTLS", icon: <Lock className="h-3 w-3" /> },
    ],
    isConfigurable: true,
  },
  {
    id: "mercadopago",
    name: "Mercado Pago",
    slug: "mercadopago",
    icon: <CreditCard className="h-6 w-6" />,
    iconColor: "text-blue-400",
    minDeposit: 5.0,
    isConfigurable: true,
  },
  {
    id: "misticpay",
    name: "MisticPay",
    slug: "misticpay",
    icon: <Zap className="h-6 w-6" />,
    iconColor: "text-yellow-400",
    minDeposit: 1.0,
    tags: [{ label: "PIX", icon: <Lock className="h-3 w-3" /> }],
    isConfigurable: true,
  },
  {
    id: "nowpayments",
    name: "NOWPayments (USDT)",
    slug: "nowpayments",
    icon: <Globe className="h-6 w-6" />,
    iconColor: "text-teal-400",
    minDeposit: 60.0,
    tags: [
      { label: "USDT" },
      { label: "BTC" },
      { label: "ETH" },
      { label: "BNB" },
    ],
    isConfigurable: true,
  },
  {
    id: "pagseguro",
    name: "PagSeguro",
    slug: "pagseguro",
    icon: <Shield className="h-6 w-6" />,
    iconColor: "text-green-400",
    minDeposit: 5.0,
    isConfigurable: true,
  },
  {
    id: "paypix",
    name: "PayPix",
    slug: "mxvpay",
    icon: <Wallet className="h-6 w-6" />,
    iconColor: "text-red-400",
    minDeposit: 10.0,
    isConfigurable: true,
  },
  {
    id: "pushypay",
    name: "PushyPay",
    slug: "pushypay",
    icon: <CreditCard className="h-6 w-6" />,
    iconColor: "text-blue-500",
    minDeposit: 5.0,
    isConfigurable: true,
  },
  {
    id: "stripe",
    name: "Stripe",
    slug: "stripe",
    icon: <CreditCard className="h-6 w-6" />,
    iconColor: "text-purple-400",
    minDeposit: 5.0,
    isConfigurable: true,
  },
];

export function PaymentGatewaysGrid() {
  const { efiGateway } = usePayments();
  const { gateway: misticGateway, toggleActive: toggleMistic } = useMisticPayGateway();
  const [activeGateways, setActiveGateways] = useState<Record<string, boolean>>({});
  const [configGateway, setConfigGateway] = useState<string | null>(null);

  useEffect(() => {
    if (efiGateway) {
      setActiveGateways((prev) => ({ ...prev, efi: efiGateway.is_active || false }));
    }
  }, [efiGateway]);

  useEffect(() => {
    setActiveGateways((prev) => ({ ...prev, misticpay: !!misticGateway?.is_active }));
  }, [misticGateway]);

  const anyActive = Object.values(activeGateways).some(Boolean);

  const handleToggleGateway = (gatewayId: string, checked: boolean) => {
    if (gatewayId === "misticpay") {
      if (!misticGateway) {
        setConfigGateway("misticpay");
        return;
      }
      toggleMistic.mutate(checked);
      if (checked) {
        // espelha exclusividade no estado local pra UI responder na hora
        setActiveGateways((prev) => {
          const next: Record<string, boolean> = {};
          for (const k of Object.keys(prev)) next[k] = false;
          next.misticpay = true;
          return next;
        });
        return;
      }
    }
    setActiveGateways((prev) => ({ ...prev, [gatewayId]: checked }));
  };

  const handleConfigClick = (gatewayId: string) => {
    setConfigGateway(gatewayId);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">Gateways de Pagamento</h2>
        <p className="text-sm text-muted-foreground">
          Configure os gateways de pagamento disponíveis
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {PAYMENT_GATEWAYS.map((gateway) => {
          const isActive = activeGateways[gateway.id] || false;

          return (
            <Card
              key={gateway.id}
              className={`bg-card border-border transition-all duration-200 ${
                isActive
                  ? "border-primary/50 bg-gradient-to-br from-card to-primary/5"
                  : "hover:border-border/80"
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`rounded-lg bg-secondary/50 p-2 ${gateway.iconColor}`}
                    >
                      {gateway.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-sm">{gateway.name}</h3>
                      </div>
                      <p className="text-xs text-muted-foreground">{gateway.slug}</p>
                    </div>
                  </div>
                  <Badge
                    variant={isActive ? "default" : "secondary"}
                    className={
                      isActive
                        ? "bg-success/20 text-success border-success/30 text-xs"
                        : anyActive
                          ? "bg-amber-500/10 text-amber-600 border-amber-500/30 text-xs"
                          : "bg-secondary text-muted-foreground text-xs"
                    }
                  >
                    {isActive ? "Ativo" : anyActive ? "Standby (fallback)" : "Inativo"}
                  </Badge>
                </div>

                <p className="text-sm mb-3">
                  Depósito mínimo:{" "}
                  <span className="text-primary font-medium">
                    R$ {gateway.minDeposit.toFixed(2)}
                  </span>
                </p>

                {gateway.tags && gateway.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {gateway.tags.map((tag, idx) => (
                      <Badge
                        key={idx}
                        variant="outline"
                        className="text-xs gap-1 py-0.5"
                      >
                        {tag.icon}
                        {tag.label}
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-muted-foreground">Ativar Gateway</span>
                  <Switch
                    checked={isActive}
                    onCheckedChange={(checked) => handleToggleGateway(gateway.id, checked)}
                  />
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full gap-2"
                  onClick={() => handleConfigClick(gateway.id)}
                >
                  <Settings2 className="h-4 w-4" />
                  Configurar
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <EfiGatewayConfigDialog
        open={configGateway === "efi"}
        onOpenChange={(open) => !open && setConfigGateway(null)}
      />
      <MisticPayGatewayConfigDialog
        open={configGateway === "misticpay"}
        onOpenChange={(open) => !open && setConfigGateway(null)}
      />
    </div>
  );
}
