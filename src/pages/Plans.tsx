import { useState } from "react";
import { Check, Crown, Edit2, Plus, Sparkles, Star, Trash2, Zap } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Plan {
  id: string;
  name: string;
  price: number;
  period: "monthly" | "yearly";
  features: string[];
  isPopular: boolean;
  subscribers: number;
  color: string;
  icon: React.ElementType;
}

const initialPlans: Plan[] = [
  {
    id: "1",
    name: "Free",
    price: 0,
    period: "monthly",
    features: ["1 Bot", "100 mensagens/dia", "Anti-spam básico", "Suporte por email"],
    isPopular: false,
    subscribers: 156,
    color: "from-muted-foreground/20 to-muted-foreground/5",
    icon: Star,
  },
  {
    id: "2",
    name: "Basic",
    price: 29.90,
    period: "monthly",
    features: ["3 Bots", "1.000 mensagens/dia", "Anti-spam avançado", "Anti-link", "Suporte prioritário"],
    isPopular: false,
    subscribers: 342,
    color: "from-primary/20 to-primary/5",
    icon: Zap,
  },
  {
    id: "3",
    name: "Pro",
    price: 99.90,
    period: "monthly",
    features: ["10 Bots", "Mensagens ilimitadas", "Todas as proteções", "Gamificação", "API Access", "Suporte 24/7"],
    isPopular: true,
    subscribers: 587,
    color: "from-warning/20 to-warning/5",
    icon: Crown,
  },
  {
    id: "4",
    name: "Enterprise",
    price: 299.90,
    period: "monthly",
    features: ["Bots ilimitados", "White-label", "Servidor dedicado", "Consultoria mensal", "SLA garantido", "Gerente de conta"],
    isPopular: false,
    subscribers: 89,
    color: "from-accent/20 to-accent/5",
    icon: Sparkles,
  },
];

export default function Plans() {
  const [plans, setPlans] = useState<Plan[]>(initialPlans);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [newPrice, setNewPrice] = useState("");

  const totalRevenue = plans.reduce((acc, plan) => acc + plan.price * plan.subscribers, 0);
  const totalSubscribers = plans.reduce((acc, plan) => acc + plan.subscribers, 0);

  const handleEditPlan = (plan: Plan) => {
    setEditingPlan(plan);
    setNewPrice(plan.price.toString());
    setIsEditDialogOpen(true);
  };

  const handleSavePrice = () => {
    if (!editingPlan) return;
    
    const price = parseFloat(newPrice);
    if (isNaN(price) || price < 0) {
      toast.error("Preço inválido");
      return;
    }

    setPlans((prev) =>
      prev.map((plan) =>
        plan.id === editingPlan.id ? { ...plan, price } : plan
      )
    );
    
    setIsEditDialogOpen(false);
    toast.success("Preço atualizado com sucesso!");
  };

  const togglePopular = (id: string) => {
    setPlans((prev) =>
      prev.map((plan) =>
        plan.id === id ? { ...plan, isPopular: !plan.isPopular } : plan
      )
    );
  };

  return (
    <DashboardLayout>
      <div className="animate-fade-in space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Planos</h1>
            <p className="text-muted-foreground">
              Gerencie seus planos de assinatura e preços
            </p>
          </div>
          <Button variant="glow" className="gap-2">
            <Plus className="h-4 w-4" />
            Criar Plano
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold gradient-text">
                  R$ {totalRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </p>
                <p className="text-sm text-muted-foreground">Receita Mensal Recorrente</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold">{totalSubscribers}</p>
                <p className="text-sm text-muted-foreground">Total de Assinantes</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold">
                  R$ {(totalRevenue / totalSubscribers).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </p>
                <p className="text-sm text-muted-foreground">Ticket Médio</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Plans Grid */}
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={cn(
                "relative overflow-hidden border-border bg-card transition-all hover:border-primary/30",
                plan.isPopular && "border-primary/50 shadow-lg shadow-primary/10"
              )}
            >
              {plan.isPopular && (
                <div className="absolute right-4 top-4">
                  <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                    Popular
                  </span>
                </div>
              )}
              
              {/* Gradient Header */}
              <div className={cn("h-2 w-full bg-gradient-to-r", plan.color)} />
              
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className={cn("rounded-lg bg-gradient-to-br p-2", plan.color)}>
                    <plan.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle>{plan.name}</CardTitle>
                    <CardDescription>{plan.subscribers} assinantes</CardDescription>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Price */}
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold">
                    R$ {plan.price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-muted-foreground">/mês</span>
                </div>

                {/* Features */}
                <ul className="space-y-2">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-success" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Actions */}
                <div className="flex items-center justify-between border-t border-border pt-4">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={plan.isPopular}
                      onCheckedChange={() => togglePopular(plan.id)}
                    />
                    <span className="text-xs text-muted-foreground">Destacar</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleEditPlan(plan)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle>Editar Plano {editingPlan?.name}</DialogTitle>
              <DialogDescription>
                Altere o preço do plano. A mudança afetará novos assinantes.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="price">Novo Preço (R$)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  className="bg-secondary/50"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancelar
              </Button>
              <Button variant="glow" onClick={handleSavePrice}>
                Salvar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
