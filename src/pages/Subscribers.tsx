import { useState, useEffect } from "react";
import {
  ArrowUpDown,
  Calendar,
  CreditCard,
  Crown,
  Loader2,
  Mail,
  MoreVertical,
  Search,
  Shield,
  User,
  UserCheck,
  UserX,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface UserWithSubscription {
  id: string;
  user_id: string;
  email?: string;
  full_name?: string;
  created_at: string;
  subscription?: {
    plan_code: string;
    plan_name: string;
    status: string;
    started_at: string;
    expires_at: string;
    value: number;
  } | null;
}

const planColors: Record<string, string> = {
  diaria: "bg-muted text-muted-foreground",
  semanal: "bg-primary/10 text-primary",
  quinzenal: "bg-warning/10 text-warning",
  mensal: "bg-accent/10 text-accent",
};

const statusColors: Record<string, string> = {
  active: "bg-success/10 text-success",
  inactive: "bg-destructive/10 text-destructive",
  pending: "bg-warning/10 text-warning",
};

export default function Subscribers() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<UserWithSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminAndFetch = async () => {
      if (!user?.id) return;

      try {
        // Verificar se é admin
        const { data: roleData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .single();

        const admin = roleData?.role === "admin";
        setIsAdmin(admin);

        // Buscar perfis (admin vê todos, user vê só dele)
        const { data: profiles, error: profilesError } = await supabase
          .from("profiles")
          .select("*")
          .order("created_at", { ascending: false });

        if (profilesError) throw profilesError;

        // Buscar assinaturas
        const { data: subscriptions, error: subsError } = await supabase
          .from("user_subscriptions")
          .select("*");

        if (subsError) throw subsError;

        // Combinar dados
        const usersWithSubs: UserWithSubscription[] = (profiles || []).map((profile) => {
          const sub = subscriptions?.find((s) => s.user_id === profile.user_id);
          return {
            id: profile.id,
            user_id: profile.user_id,
            full_name: profile.full_name,
            created_at: profile.created_at,
            subscription: sub
              ? {
                  plan_code: sub.plan_code,
                  plan_name: sub.plan_name,
                  status: sub.status || "active",
                  started_at: sub.started_at,
                  expires_at: sub.expires_at,
                  value: sub.value,
                }
              : null,
          };
        });

        setUsers(usersWithSubs);
      } catch (error) {
        console.error("Error fetching users:", error);
        toast.error("Erro ao carregar usuários");
      } finally {
        setLoading(false);
      }
    };

    checkAdminAndFetch();
  }, [user?.id]);

  const filteredUsers = users.filter(
    (u) =>
      (u.full_name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      u.user_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.subscription?.plan_name?.toLowerCase() || "").includes(searchQuery.toLowerCase())
  );

  const totalRevenue = users.reduce((acc, u) => acc + Number(u.subscription?.value || 0), 0);
  const activeSubscribers = users.filter((u) => u.subscription?.status === "active").length;
  const premiumSubscribers = users.filter(
    (u) => u.subscription?.plan_code === "quinzenal" || u.subscription?.plan_code === "mensal"
  ).length;

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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              {isAdmin ? "Gerenciamento de Usuários" : "Assinantes"}
            </h1>
            <p className="text-muted-foreground">
              {isAdmin
                ? "Visualize e gerencie todos os usuários cadastrados"
                : "Gerencie seus assinantes e visualize estatísticas"}
            </p>
          </div>
          {isAdmin && (
            <Badge className="gap-1 bg-primary/20 text-primary">
              <Shield className="h-3 w-3" />
              Admin
            </Badge>
          )}
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-4">
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-primary/10 p-3">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{users.length}</p>
                <p className="text-sm text-muted-foreground">
                  {isAdmin ? "Usuários Cadastrados" : "Total"}
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-success/10 p-3">
                <UserCheck className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeSubscribers}</p>
                <p className="text-sm text-muted-foreground">Com Assinatura Ativa</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-warning/10 p-3">
                <Crown className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{premiumSubscribers}</p>
                <p className="text-sm text-muted-foreground">Premium</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-accent/10 p-3">
                <CreditCard className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  R$ {totalRevenue.toFixed(2).replace(".", ",")}
                </p>
                <p className="text-sm text-muted-foreground">Receita Total</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, ID ou plano..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-secondary/50"
            />
          </div>
          <Button variant="outline" className="gap-2">
            <User className="h-4 w-4" />
            Exportar Lista
          </Button>
        </div>

        {/* Table */}
        <div className="rounded-xl border border-border bg-card">
          {users.length === 0 ? (
            <div className="p-12 text-center">
              <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhum usuário ainda</h3>
              <p className="text-muted-foreground">
                Quando você tiver usuários cadastrados, eles aparecerão aqui
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-muted-foreground">
                    <Button variant="ghost" className="gap-1 -ml-4">
                      Usuário
                      <ArrowUpDown className="h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead className="text-muted-foreground">ID</TableHead>
                  <TableHead className="text-muted-foreground">Plano</TableHead>
                  <TableHead className="text-muted-foreground">Status</TableHead>
                  <TableHead className="text-muted-foreground">Cadastro</TableHead>
                  <TableHead className="text-muted-foreground text-right">Valor</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((userData) => (
                  <TableRow key={userData.id} className="hover:bg-secondary/30">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">
                            {userData.full_name || "Sem nome"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {userData.subscription ? "Assinante" : "Sem plano"}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-xs text-muted-foreground">
                        {userData.user_id.slice(0, 8)}...
                      </span>
                    </TableCell>
                    <TableCell>
                      {userData.subscription ? (
                        <Badge
                          className={cn(
                            "font-medium",
                            planColors[userData.subscription.plan_code] ||
                              "bg-muted text-muted-foreground"
                          )}
                        >
                          {userData.subscription.plan_name}
                        </Badge>
                      ) : (
                        <Badge className="bg-muted/50 text-muted-foreground">
                          Nenhum
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {userData.subscription ? (
                        <Badge
                          className={cn(
                            "font-medium",
                            statusColors[userData.subscription.status] ||
                              "bg-muted text-muted-foreground"
                          )}
                        >
                          {userData.subscription.status === "active" && "Ativo"}
                          {userData.subscription.status === "inactive" && "Inativo"}
                          {userData.subscription.status === "pending" && "Pendente"}
                        </Badge>
                      ) : (
                        <Badge className="bg-muted/50 text-muted-foreground">
                          N/A
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span className="text-sm">
                          {new Date(userData.created_at).toLocaleDateString("pt-BR")}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {userData.subscription
                        ? `R$ ${Number(userData.subscription.value)
                            .toFixed(2)
                            .replace(".", ",")}`
                        : "-"}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-popover border-border">
                          <DropdownMenuItem className="gap-2">
                            <Mail className="h-4 w-4" /> Enviar Mensagem
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2">
                            <CreditCard className="h-4 w-4" /> Adicionar Plano
                          </DropdownMenuItem>
                          {isAdmin && (
                            <DropdownMenuItem className="gap-2 text-destructive focus:text-destructive">
                              <UserX className="h-4 w-4" /> Remover Acesso
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
