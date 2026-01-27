import { useState, useEffect } from "react";
import {
  Users,
  Search,
  Clock,
  CheckCircle,
  XCircle,
  Crown,
  RefreshCw,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  CreditCard,
  AlertTriangle,
  ChevronDown,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useTelegramBots } from "@/hooks/useTelegramBots";
import { Loader2 } from "lucide-react";

interface TelegramSubscription {
  id: string;
  telegram_user_id: number;
  bot_id: string;
  plan_id: string | null;
  plan_code: string;
  plan_name: string;
  plan_days: number;
  value: number;
  txid: string | null;
  started_at: string;
  expires_at: string;
  status: string;
  created_at: string;
}

interface SubscriptionPlan {
  id: string;
  code: string;
  name: string;
  price: number;
  days: number;
}

export default function TelegramUsers() {
  const { bots } = useTelegramBots();
  const [selectedBotId, setSelectedBotId] = useState<string>("all");
  const [subscriptions, setSubscriptions] = useState<TelegramSubscription[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "expired">("all");
  
  // Add subscription dialog
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newSub, setNewSub] = useState({
    telegramUserId: "",
    planId: "",
    days: "",
  });
  const [isAdding, setIsAdding] = useState(false);

  // Edit subscription dialog
  const [editingSub, setEditingSub] = useState<TelegramSubscription | null>(null);
  const [editDays, setEditDays] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchData();
  }, [selectedBotId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch subscriptions
      let query = supabase
        .from("telegram_subscriptions")
        .select("*")
        .order("expires_at", { ascending: false });

      if (selectedBotId !== "all") {
        query = query.eq("bot_id", selectedBotId);
      }

      const { data: subsData } = await query;
      setSubscriptions((subsData || []) as TelegramSubscription[]);

      // Fetch plans
      const { data: plansData } = await supabase
        .from("subscription_plans")
        .select("id, code, name, price, days")
        .eq("is_active", true)
        .order("price", { ascending: true });

      setPlans((plansData || []) as SubscriptionPlan[]);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  const isExpired = (expiresAt: string) => new Date(expiresAt).getTime() < Date.now();
  const daysLeft = (expiresAt: string) => {
    const diff = new Date(expiresAt).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const filteredSubscriptions = subscriptions.filter((sub) => {
    // Search filter
    if (searchTerm && !sub.telegram_user_id.toString().includes(searchTerm)) {
      return false;
    }
    // Status filter
    if (filterStatus === "active" && isExpired(sub.expires_at)) return false;
    if (filterStatus === "expired" && !isExpired(sub.expires_at)) return false;
    return true;
  });

  const stats = {
    total: subscriptions.length,
    active: subscriptions.filter((s) => !isExpired(s.expires_at)).length,
    expired: subscriptions.filter((s) => isExpired(s.expires_at)).length,
    revenue: subscriptions.reduce((acc, s) => acc + Number(s.value), 0),
  };

  const handleAddSubscription = async () => {
    if (!newSub.telegramUserId || !newSub.planId) {
      toast.error("Preencha todos os campos");
      return;
    }

    setIsAdding(true);
    try {
      const plan = plans.find((p) => p.id === newSub.planId);
      if (!plan) {
        toast.error("Plano não encontrado");
        return;
      }

      const days = parseInt(newSub.days) || plan.days;
      const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
      const botId = selectedBotId !== "all" ? selectedBotId : bots[0]?.id;

      const { error } = await supabase.from("telegram_subscriptions").insert({
        telegram_user_id: parseInt(newSub.telegramUserId),
        bot_id: botId,
        plan_id: plan.id,
        plan_code: plan.code,
        plan_name: plan.name,
        plan_days: days,
        value: plan.price,
        txid: `MANUAL_${Date.now()}`,
        started_at: new Date().toISOString(),
        expires_at: expiresAt,
        status: "active",
      });

      if (error) throw error;

      toast.success("Assinatura adicionada com sucesso!");
      setShowAddDialog(false);
      setNewSub({ telegramUserId: "", planId: "", days: "" });
      fetchData();
    } catch (error) {
      console.error("Error adding subscription:", error);
      toast.error("Erro ao adicionar assinatura");
    } finally {
      setIsAdding(false);
    }
  };

  const handleExtendSubscription = async () => {
    if (!editingSub || !editDays) return;

    setIsUpdating(true);
    try {
      const additionalDays = parseInt(editDays);
      const currentExpiry = new Date(editingSub.expires_at);
      const baseDate = currentExpiry.getTime() > Date.now() ? currentExpiry : new Date();
      const newExpiry = new Date(baseDate.getTime() + additionalDays * 24 * 60 * 60 * 1000);

      const { error } = await supabase
        .from("telegram_subscriptions")
        .update({
          expires_at: newExpiry.toISOString(),
          plan_days: editingSub.plan_days + additionalDays,
        })
        .eq("id", editingSub.id);

      if (error) throw error;

      toast.success(`Assinatura estendida por ${additionalDays} dias!`);
      setEditingSub(null);
      setEditDays("");
      fetchData();
    } catch (error) {
      console.error("Error extending subscription:", error);
      toast.error("Erro ao estender assinatura");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelSubscription = async (sub: TelegramSubscription) => {
    if (!confirm("Tem certeza que deseja cancelar esta assinatura?")) return;

    try {
      const { error } = await supabase
        .from("telegram_subscriptions")
        .update({ expires_at: new Date().toISOString(), status: "cancelled" })
        .eq("id", sub.id);

      if (error) throw error;

      toast.success("Assinatura cancelada!");
      fetchData();
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      toast.error("Erro ao cancelar assinatura");
    }
  };

  const handleDeleteSubscription = async (sub: TelegramSubscription) => {
    if (!confirm("Tem certeza que deseja EXCLUIR esta assinatura? Esta ação não pode ser desfeita.")) return;

    try {
      const { error } = await supabase
        .from("telegram_subscriptions")
        .delete()
        .eq("id", sub.id);

      if (error) throw error;

      toast.success("Assinatura excluída!");
      fetchData();
    } catch (error) {
      console.error("Error deleting subscription:", error);
      toast.error("Erro ao excluir assinatura");
    }
  };

  if (loading) {
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Usuários do Telegram</h1>
            <p className="text-muted-foreground">
              Gerencie assinaturas dos usuários do bot
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchData} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Atualizar
            </Button>
            <Button variant="glow" onClick={() => setShowAddDialog(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Adicionar Assinatura
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-sm text-muted-foreground">Total de Assinaturas</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-success/10">
                  <CheckCircle className="h-6 w-6 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.active}</p>
                  <p className="text-sm text-muted-foreground">Ativos</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-destructive/10">
                  <XCircle className="h-6 w-6 text-destructive" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.expired}</p>
                  <p className="text-sm text-muted-foreground">Expirados</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-warning/10">
                  <CreditCard className="h-6 w-6 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    R$ {stats.revenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-sm text-muted-foreground">Receita Total</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por ID do Telegram..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-secondary/50"
                  />
                </div>
              </div>
              <Select value={selectedBotId} onValueChange={setSelectedBotId}>
                <SelectTrigger className="w-[200px] bg-secondary/50">
                  <SelectValue placeholder="Selecionar Bot" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Bots</SelectItem>
                  {bots.map((bot) => (
                    <SelectItem key={bot.id} value={bot.id}>
                      {bot.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as typeof filterStatus)}>
                <SelectTrigger className="w-[150px] bg-secondary/50">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Ativos</SelectItem>
                  <SelectItem value="expired">Expirados</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Subscriptions Table */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Assinaturas ({filteredSubscriptions.length})</CardTitle>
            <CardDescription>
              Lista de todas as assinaturas do Telegram
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredSubscriptions.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma assinatura encontrada</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID Telegram</TableHead>
                      <TableHead>Plano</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Início</TableHead>
                      <TableHead>Expira</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSubscriptions.map((sub) => {
                      const expired = isExpired(sub.expires_at);
                      const days = daysLeft(sub.expires_at);
                      return (
                        <TableRow key={sub.id}>
                          <TableCell className="font-mono">
                            {sub.telegram_user_id}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Crown className="h-4 w-4 text-primary" />
                              {sub.plan_name}
                            </div>
                          </TableCell>
                          <TableCell>
                            R$ {Number(sub.value).toFixed(2)}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {new Date(sub.started_at).toLocaleDateString("pt-BR")}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              {new Date(sub.expires_at).toLocaleDateString("pt-BR")}
                            </div>
                          </TableCell>
                          <TableCell>
                            {expired ? (
                              <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30">
                                Expirado
                              </Badge>
                            ) : days <= 3 ? (
                              <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                {days}d restante
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-success/10 text-success border-success/30">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                {days}d restante
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  Ações <ChevronDown className="ml-1 h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => {
                                  setEditingSub(sub);
                                  setEditDays("");
                                }}>
                                  <Clock className="mr-2 h-4 w-4" />
                                  Estender Dias
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleCancelSubscription(sub)}
                                  className="text-warning"
                                >
                                  <XCircle className="mr-2 h-4 w-4" />
                                  Cancelar
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDeleteSubscription(sub)}
                                  className="text-destructive"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Excluir
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add Subscription Dialog */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Assinatura Manual</DialogTitle>
              <DialogDescription>
                Adicione uma assinatura manualmente para um usuário do Telegram
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>ID do Telegram *</Label>
                <Input
                  placeholder="123456789"
                  value={newSub.telegramUserId}
                  onChange={(e) => setNewSub({ ...newSub, telegramUserId: e.target.value })}
                  className="bg-secondary/50"
                />
              </div>
              <div className="space-y-2">
                <Label>Plano *</Label>
                <Select value={newSub.planId} onValueChange={(v) => setNewSub({ ...newSub, planId: v })}>
                  <SelectTrigger className="bg-secondary/50">
                    <SelectValue placeholder="Selecionar plano" />
                  </SelectTrigger>
                  <SelectContent>
                    {plans.map((plan) => (
                      <SelectItem key={plan.id} value={plan.id}>
                        {plan.name} - R$ {plan.price.toFixed(2)} ({plan.days} dias)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Dias (opcional - usa padrão do plano)</Label>
                <Input
                  type="number"
                  placeholder="30"
                  value={newSub.days}
                  onChange={(e) => setNewSub({ ...newSub, days: e.target.value })}
                  className="bg-secondary/50"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancelar
              </Button>
              <Button variant="glow" onClick={handleAddSubscription} disabled={isAdding}>
                {isAdding ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Adicionar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Extend Subscription Dialog */}
        <Dialog open={!!editingSub} onOpenChange={(open) => !open && setEditingSub(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Estender Assinatura</DialogTitle>
              <DialogDescription>
                Adicione dias à assinatura do usuário {editingSub?.telegram_user_id}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="p-4 rounded-lg bg-secondary/30">
                <p className="text-sm text-muted-foreground">Plano atual</p>
                <p className="font-medium">{editingSub?.plan_name}</p>
                <p className="text-sm text-muted-foreground mt-2">Expira em</p>
                <p className="font-medium">
                  {editingSub && new Date(editingSub.expires_at).toLocaleString("pt-BR")}
                </p>
              </div>
              <div className="space-y-2">
                <Label>Dias para adicionar *</Label>
                <Input
                  type="number"
                  placeholder="30"
                  value={editDays}
                  onChange={(e) => setEditDays(e.target.value)}
                  className="bg-secondary/50"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingSub(null)}>
                Cancelar
              </Button>
              <Button variant="glow" onClick={handleExtendSubscription} disabled={isUpdating}>
                {isUpdating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Estender
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
