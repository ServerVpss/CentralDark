import { useState, useEffect } from "react";
import { Check, Crown, Edit2, Plus, Sparkles, Star, Trash2, Zap, Loader2 } from "lucide-react";
import { DashboardLayout } from "@/shared/layout/DashboardLayout";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Switch } from "@/shared/ui/switch";
import { Textarea } from "@/shared/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { cn } from "@/shared/lib/utils";
import { usePayments, SubscriptionPlan } from "@/shared/hooks/usePayments";
import { PixPaymentDialog } from "@/apps/modulos/telepainel/components/payments/PixPaymentDialog";
import { supabase } from "@/integrations/supabase/hub-client";

const planIcons: Record<string, React.ElementType> = {
  diaria: Star,
  semanal: Zap,
  quinzenal: Crown,
  mensal: Sparkles,
};

const planColors: Record<string, string> = {
  diaria: "from-muted-foreground/20 to-muted-foreground/5",
  semanal: "from-primary/20 to-primary/5",
  quinzenal: "from-warning/20 to-warning/5",
  mensal: "from-accent/20 to-accent/5",
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
  const [totalSubscribers, setTotalSubscribers] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [monthRevenue, setMonthRevenue] = useState(0);
  const [monthCount, setMonthCount] = useState(0);
  const [allTimeCount, setAllTimeCount] = useState(0);
  const [avgTicket, setAvgTicket] = useState(0);
  
  
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

  // Fetch real stats from database
  useEffect(() => {
    const fetchStats = async () => {
      // Count active subscriptions
      const { count: subsCount } = await supabase
        .from("telegram_subscriptions")
        .select("*", { count: "exact", head: true })
        .gte("expires_at", new Date().toISOString());
      
      setTotalSubscribers(subsCount || 0);

      // Soma receita das assinaturas usando paginação (traz value + created_at)
      let allSubs: { value: number; created_at: string }[] = [];
      let from = 0;
      const batchSize = 1000;
      let hasMore = true;
      while (hasMore) {
        const { data, error } = await supabase
          .from("telegram_subscriptions")
          .select("value, created_at")
          .range(from, from + batchSize - 1);
        if (error) break;
        if (data && data.length > 0) {
          allSubs = allSubs.concat(data as any);
          from += batchSize;
          hasMore = data.length === batchSize;
        } else {
          hasMore = false;
        }
      }

      const revenue = allSubs.reduce((acc, s) => acc + Number(s.value), 0);
      setTotalRevenue(revenue);
      setAllTimeCount(allSubs.length);
      setAvgTicket(allSubs.length > 0 ? revenue / allSubs.length : 0);

      // Receita do mês atual (vendas feitas neste mês)
      const now = new Date();
      const inicioMes = new Date(now.getFullYear(), now.getMonth(), 1);
      const doMes = allSubs.filter((s) => new Date(s.created_at) >= inicioMes);
      setMonthRevenue(doMes.reduce((acc, s) => acc + Number(s.value), 0));
      setMonthCount(doMes.length);
    };

    fetchStats();
  }, []);

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
      <div className="space-y-5 max-w-[1400px] mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-foreground">Planos</h1>
            <p className="text-sm text-muted-foreground">
              Gerencie seus planos de assinatura e preços
            </p>
          </div>
          <Button className="gap-2" onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            Criar Plano
          </Button>
        </div>


        {/* Estatísticas */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold gradient-text">
                  R$ {monthRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </p>
                <p className="text-sm text-muted-foreground">Receita do mês atual</p>
                <p className="text-xs text-muted-foreground/70 mt-1">
                  {monthCount} venda{monthCount === 1 ? "" : "s"} desde dia 1
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold">
                  R$ {totalRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </p>
                <p className="text-sm text-muted-foreground">Receita total (histórico)</p>
                <p className="text-xs text-muted-foreground/70 mt-1">
                  Tudo que já foi vendido
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold">{totalSubscribers}</p>
                <p className="text-sm text-muted-foreground">Assinantes ativos</p>
                <p className="text-xs text-muted-foreground/70 mt-1">
                  Ainda dentro do prazo
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold">{plans.length}</p>
                <p className="text-sm text-muted-foreground">Planos cadastrados</p>
                <p className="text-xs text-muted-foreground/70 mt-1">
                  Disponíveis pra venda
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Explicação simples dos números */}
        <Card className="bg-card/50 border-border/50">
          <CardContent className="pt-6 space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold">Como esses números são calculados</h3>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 text-sm text-muted-foreground">
              <div className="rounded-lg bg-secondary/30 p-3">
                <p className="font-medium text-foreground mb-1">💰 Receita do mês atual</p>
                <p className="text-xs leading-relaxed">
                  Soma de tudo que foi vendido entre o dia 1 deste mês e hoje.
                  Foram <span className="text-foreground font-medium">{monthCount}</span> venda(s),
                  totalizando <span className="text-foreground font-medium">R$ {monthRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>.
                </p>
              </div>
              <div className="rounded-lg bg-secondary/30 p-3">
                <p className="font-medium text-foreground mb-1">📊 Receita total</p>
                <p className="text-xs leading-relaxed">
                  Soma de <span className="text-foreground font-medium">todas</span> as {allTimeCount} vendas
                  já feitas desde o começo (ativas + expiradas).
                  Ticket médio: <span className="text-foreground font-medium">R$ {avgTicket.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span> por venda.
                </p>
              </div>
              <div className="rounded-lg bg-secondary/30 p-3">
                <p className="font-medium text-foreground mb-1">👥 Assinantes ativos</p>
                <p className="text-xs leading-relaxed">
                  Pessoas cuja assinatura <span className="text-foreground font-medium">ainda não venceu</span>.
                  Quando o prazo (ex: 7 dias, 30 dias) expira, saem dessa conta.
                </p>
              </div>
              <div className="rounded-lg bg-secondary/30 p-3">
                <p className="font-medium text-foreground mb-1">📦 Planos cadastrados</p>
                <p className="text-xs leading-relaxed">
                  Quantos planos diferentes você criou pra oferecer aos clientes
                  (diária, semanal, mensal etc.).
                </p>
              </div>
            </div>
          </CardContent>
        </Card>



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
