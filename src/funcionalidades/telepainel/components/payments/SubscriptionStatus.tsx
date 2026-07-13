import { Crown, Clock, AlertCircle, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Progress } from "@/shared/ui/progress";
import { usePayments } from "@/shared/hooks/usePayments";

interface SubscriptionStatusProps {
  onUpgrade?: () => void;
}

export function SubscriptionStatus({ onUpgrade }: SubscriptionStatusProps) {
  const { currentSubscription, isSubscriptionActive, daysRemaining, loadingSubscription } = usePayments();

  if (loadingSubscription) {
    return (
      <Card className="bg-card border-border animate-pulse">
        <CardContent className="py-6">
          <div className="h-20 bg-secondary/50 rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  if (!currentSubscription || !isSubscriptionActive) {
    return (
      <Card className="bg-gradient-to-br from-warning/10 to-warning/5 border-warning/20">
        <CardContent className="py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-warning/20 p-3">
                <AlertCircle className="h-6 w-6 text-warning" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Sem Assinatura Ativa</h3>
                <p className="text-sm text-muted-foreground">
                  Assine um plano para desbloquear todos os recursos
                </p>
              </div>
            </div>
            <Button variant="glow" onClick={onUpgrade}>
              <Crown className="h-4 w-4 mr-2" />
              Ver Planos
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalDays = currentSubscription.plan_days;
  const progressPercent = Math.max(0, Math.min(100, (daysRemaining / totalDays) * 100));
  const isExpiringSoon = daysRemaining <= 7;
  const expiresAt = new Date(currentSubscription.expires_at);

  return (
    <Card className={`bg-gradient-to-br ${isExpiringSoon ? 'from-warning/10 to-warning/5 border-warning/20' : 'from-success/10 to-success/5 border-success/20'}`}>
      <CardContent className="py-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className={`rounded-full p-3 ${isExpiringSoon ? 'bg-warning/20' : 'bg-success/20'}`}>
              {isExpiringSoon ? (
                <Clock className="h-6 w-6 text-warning" />
              ) : (
                <CheckCircle className="h-6 w-6 text-success" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-lg">{currentSubscription.plan_name}</h3>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${isExpiringSoon ? 'bg-warning/20 text-warning' : 'bg-success/20 text-success'}`}>
                  {isExpiringSoon ? 'Expirando' : 'Ativo'}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Expira em {expiresAt.toLocaleDateString('pt-BR')} às {expiresAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">{daysRemaining}</p>
            <p className="text-sm text-muted-foreground">dias restantes</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progresso do plano</span>
            <span>{Math.round(progressPercent)}%</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>

        {isExpiringSoon && (
          <div className="mt-4 flex justify-end">
            <Button variant="glow" size="sm" onClick={onUpgrade}>
              <Crown className="h-4 w-4 mr-2" />
              Renovar Agora
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
