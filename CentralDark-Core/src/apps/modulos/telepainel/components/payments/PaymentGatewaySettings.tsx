import { EfiGatewayConfig } from "./EfiGatewayConfig";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { CreditCard } from "lucide-react";

export function PaymentGatewaySettings() {
  return (
    <div className="space-y-6">
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <CreditCard className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Gateway de Pagamento</CardTitle>
              <CardDescription>
                Configure o gateway de pagamento PIX para receber pagamentos no bot
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <EfiGatewayConfig />
        </CardContent>
      </Card>
    </div>
  );
}
