import { useState } from "react";
import { Check, Crown, Edit2, Plus, Sparkles, Star, Trash2, Zap, Loader2 } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { usePayments, SubscriptionPlan } from "@/hooks/usePayments";
import { SubscriptionStatus } from "@/components/payments/SubscriptionStatus";
import { PixPaymentDialog } from "@/components/payments/PixPaymentDialog";

const planIcons: Record<string, React.ElementType> = {
  free: Star,
  basic: Zap,
  pro: Crown,
  enterprise: Sparkles,
};

const planColors: Record<string, string> = {
  free: "from-muted-foreground/20 to-muted-foreground/5",
  basic: "from-primary/20 to-primary/5",
  pro: "from-warning/20 to-warning/5",
  enterprise: "from-accent/20 to-accent/5",
};

export default function Plans() {
  const { 
    plans, 
    loadingPlans, 
    updatePlan, 
    createPlan, 
    deletePlan,
    currentSubscription,
  } = usePayments();
  
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isPixDialogOpen, setIsPixDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  
  const [editForm, setEditForm] = useState({
    name: '',
    title: '',
    description: '',
    price: '',
    days: '',
    features: '',
    max_bots: '',
    max_messages_per_day: '',
  });

  const [newPlanForm, setNewPlanForm] = useState({
    code: '',
    name: '',
    title: '',
    description: '',
    price: '',
    days: '30',
    features: '',
    max_bots: '1',
    max_messages_per_day: '100',
  });

  const totalRevenue = plans.reduce((acc, plan) => acc + Number(plan.price) * 100, 0); // Mock subscriber count
  const totalSubscribers = plans.length * 50; // Mock data

  const handleEditPlan = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    setEditForm({
      name: plan.name,
      title: plan.title,
      description: plan.description || '',
      price: String(plan.price),
      days: String(plan.days),
      features: plan.features.join('\n'),
      max_bots: String(plan.max_bots),
      max_messages_per_day: String(plan.max_messages_per_day),
    });
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingPlan) return;
    
    await updatePlan.mutateAsync({
      id: editingPlan.id,
      updates: {
        name: editForm.name,
        title: editForm.title,
        description: editForm.description,
        price: parseFloat(editForm.price),
        days: parseInt(editForm.days),
        features: editForm.features.split('\n').filter(f => f.trim()),
        max_bots: parseInt(editForm.max_bots),
        max_messages_per_day: parseInt(editForm.max_messages_per_day),
      },
    });
    
    setIsEditDialogOpen(false);
  };

  const handleCreatePlan = async () => {
    await createPlan.mutateAsync({
      code: newPlanForm.code.toLowerCase().replace(/\s+/g, '-'),
      name: newPlanForm.name,
      title: newPlanForm.title,
      description: newPlanForm.description,
      price: parseFloat(newPlanForm.price),
      days: parseInt(newPlanForm.days),
      features: newPlanForm.features.split('\n').filter(f => f.trim()),
      max_bots: parseInt(newPlanForm.max_bots),
      max_messages_per_day: parseInt(newPlanForm.max_messages_per_day),
      is_active: true,
      is_popular: false,
      user_id: null,
    });
    
    setIsCreateDialogOpen(false);
    setNewPlanForm({
      code: '',
      name: '',
      title: '',
      description: '',
      price: '',
      days: '30',
      features: '',
      max_bots: '1',
      max_messages_per_day: '100',
    });
  };

  const handleDeletePlan = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este plano?')) {
      await deletePlan.mutateAsync(id);
    }
  };

  const togglePopular = async (plan: SubscriptionPlan) => {
    await updatePlan.mutateAsync({
      id: plan.id,
      updates: { is_popular: !plan.is_popular },
    });
  };

  const handleSubscribe = (plan: SubscriptionPlan) => {
    if (Number(plan.price) === 0) return;
    setSelectedPlan(plan);
    setIsPixDialogOpen(true);
  };

  if (loadingPlans) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

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
          <Button variant="glow" className="gap-2" onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            Criar Plano
          </Button>
        </div>

        {/* Current Subscription Status */}
        <SubscriptionStatus onUpgrade={() => {}} />

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold gradient-text">
                  R$ {totalRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </p>
                <p className="text-sm text-muted-foreground">Receita Mensal Estimada</p>
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
                <p className="text-3xl font-bold">{plans.length}</p>
                <p className="text-sm text-muted-foreground">Planos Ativos</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Plans Grid */}
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {plans.map((plan) => {
            const Icon = planIcons[plan.code] || Star;
            const color = planColors[plan.code] || "from-primary/20 to-primary/5";
            
            return (
              <Card
                key={plan.id}
                className={cn(
                  "relative overflow-hidden border-border bg-card transition-all hover:border-primary/30",
                  plan.is_popular && "border-primary/50 shadow-lg shadow-primary/10"
                )}
              >
                {plan.is_popular && (
                  <div className="absolute right-4 top-4">
                    <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                      Popular
                    </span>
                  </div>
                )}
                
                {/* Gradient Header */}
                <div className={cn("h-2 w-full bg-gradient-to-r", color)} />
                
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className={cn("rounded-lg bg-gradient-to-br p-2", color)}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle>{plan.name}</CardTitle>
                      <CardDescription>{plan.title}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  {/* Price */}
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold">
                      R$ {Number(plan.price).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-muted-foreground">/{plan.days} dias</span>
                  </div>

                  {/* Features */}
                  <ul className="space-y-2">
                    {plan.features.slice(0, 5).map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-success" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Subscribe Button */}
                  <Button 
                    variant={plan.is_popular ? "glow" : "outline"} 
                    className="w-full"
                    onClick={() => handleSubscribe(plan)}
                    disabled={Number(plan.price) === 0}
                  >
                    {Number(plan.price) === 0 ? 'Plano Atual' : 'Assinar Agora'}
                  </Button>

                  {/* Actions */}
                  <div className="flex items-center justify-between border-t border-border pt-4">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={plan.is_popular}
                        onCheckedChange={() => togglePopular(plan)}
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
                        onClick={() => handleDeletePlan(plan.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="bg-card border-border max-w-lg">
            <DialogHeader>
              <DialogTitle>Editar Plano {editingPlan?.name}</DialogTitle>
              <DialogDescription>
                Altere as configurações do plano
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nome</Label>
                  <Input
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="bg-secondary/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Título</Label>
                  <Input
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    className="bg-secondary/50"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Input
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="bg-secondary/50"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Preço (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={editForm.price}
                    onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                    className="bg-secondary/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Dias</Label>
                  <Input
                    type="number"
                    value={editForm.days}
                    onChange={(e) => setEditForm({ ...editForm, days: e.target.value })}
                    className="bg-secondary/50"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Máx. Bots</Label>
                  <Input
                    type="number"
                    value={editForm.max_bots}
                    onChange={(e) => setEditForm({ ...editForm, max_bots: e.target.value })}
                    className="bg-secondary/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Máx. Mensagens/Dia</Label>
                  <Input
                    type="number"
                    value={editForm.max_messages_per_day}
                    onChange={(e) => setEditForm({ ...editForm, max_messages_per_day: e.target.value })}
                    className="bg-secondary/50"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Recursos (um por linha)</Label>
                <Textarea
                  value={editForm.features}
                  onChange={(e) => setEditForm({ ...editForm, features: e.target.value })}
                  className="bg-secondary/50 min-h-[120px]"
                  placeholder="1 Bot&#10;100 mensagens/dia&#10;Anti-spam básico"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancelar
              </Button>
              <Button variant="glow" onClick={handleSaveEdit} disabled={updatePlan.isPending}>
                {updatePlan.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Salvar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Create Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="bg-card border-border max-w-lg">
            <DialogHeader>
              <DialogTitle>Criar Novo Plano</DialogTitle>
              <DialogDescription>
                Configure as opções do novo plano
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Código</Label>
                  <Input
                    value={newPlanForm.code}
                    onChange={(e) => setNewPlanForm({ ...newPlanForm, code: e.target.value })}
                    className="bg-secondary/50"
                    placeholder="premium"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Nome</Label>
                  <Input
                    value={newPlanForm.name}
                    onChange={(e) => setNewPlanForm({ ...newPlanForm, name: e.target.value })}
                    className="bg-secondary/50"
                    placeholder="Premium"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Título</Label>
                <Input
                  value={newPlanForm.title}
                  onChange={(e) => setNewPlanForm({ ...newPlanForm, title: e.target.value })}
                  className="bg-secondary/50"
                  placeholder="Plano Premium"
                />
              </div>
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Input
                  value={newPlanForm.description}
                  onChange={(e) => setNewPlanForm({ ...newPlanForm, description: e.target.value })}
                  className="bg-secondary/50"
                  placeholder="Para usuários avançados"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Preço (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={newPlanForm.price}
                    onChange={(e) => setNewPlanForm({ ...newPlanForm, price: e.target.value })}
                    className="bg-secondary/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Dias</Label>
                  <Input
                    type="number"
                    value={newPlanForm.days}
                    onChange={(e) => setNewPlanForm({ ...newPlanForm, days: e.target.value })}
                    className="bg-secondary/50"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Máx. Bots</Label>
                  <Input
                    type="number"
                    value={newPlanForm.max_bots}
                    onChange={(e) => setNewPlanForm({ ...newPlanForm, max_bots: e.target.value })}
                    className="bg-secondary/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Máx. Mensagens/Dia</Label>
                  <Input
                    type="number"
                    value={newPlanForm.max_messages_per_day}
                    onChange={(e) => setNewPlanForm({ ...newPlanForm, max_messages_per_day: e.target.value })}
                    className="bg-secondary/50"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Recursos (um por linha)</Label>
                <Textarea
                  value={newPlanForm.features}
                  onChange={(e) => setNewPlanForm({ ...newPlanForm, features: e.target.value })}
                  className="bg-secondary/50 min-h-[120px]"
                  placeholder="5 Bots&#10;500 mensagens/dia&#10;Anti-spam avançado"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancelar
              </Button>
              <Button variant="glow" onClick={handleCreatePlan} disabled={createPlan.isPending}>
                {createPlan.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Criar Plano
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* PIX Payment Dialog */}
        <PixPaymentDialog
          open={isPixDialogOpen}
          onOpenChange={setIsPixDialogOpen}
          plan={selectedPlan}
        />
      </div>
    </DashboardLayout>
  );
}
