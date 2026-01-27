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

interface Subscriber {
  id: string;
  user_id: string;
  plan_code: string;
  plan_name: string;
  status: string;
  started_at: string;
  expires_at: string;
  value: number;
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
  const [searchQuery, setSearchQuery] = useState("");
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubscribers = async () => {
      try {
        const { data, error } = await supabase
          .from("user_subscriptions")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;
        setSubscribers(data || []);
      } catch (error) {
        console.error("Error fetching subscribers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscribers();
  }, []);

  const filteredSubscribers = subscribers.filter(
    (sub) =>
      sub.plan_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.plan_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.user_id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalRevenue = subscribers.reduce((acc, sub) => acc + Number(sub.value || 0), 0);
  const activeSubscribers = subscribers.filter((sub) => sub.status === "active").length;
  const premiumSubscribers = subscribers.filter(
    (s) => s.plan_code === "quinzenal" || s.plan_code === "mensal"
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
            <h1 className="text-2xl font-bold">Assinantes</h1>
            <p className="text-muted-foreground">
              Gerencie seus assinantes e visualize estatísticas
            </p>
          </div>
          <Button variant="glow" className="gap-2">
            <User className="h-4 w-4" />
            Exportar Lista
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-4">
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-primary/10 p-3">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{subscribers.length}</p>
                <p className="text-sm text-muted-foreground">Total</p>
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
                <p className="text-sm text-muted-foreground">Ativos</p>
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
              placeholder="Buscar por plano ou ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-secondary/50"
            />
          </div>
        </div>

        {/* Table */}
        <div className="rounded-xl border border-border bg-card">
          {subscribers.length === 0 ? (
            <div className="p-12 text-center">
              <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhum assinante ainda</h3>
              <p className="text-muted-foreground">
                Quando você tiver assinantes, eles aparecerão aqui
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-muted-foreground">
                    <Button variant="ghost" className="gap-1 -ml-4">
                      ID do Usuário
                      <ArrowUpDown className="h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead className="text-muted-foreground">Plano</TableHead>
                  <TableHead className="text-muted-foreground">Status</TableHead>
                  <TableHead className="text-muted-foreground">Período</TableHead>
                  <TableHead className="text-muted-foreground text-right">Valor</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubscribers.map((subscriber) => (
                  <TableRow key={subscriber.id} className="hover:bg-secondary/30">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium font-mono text-sm">
                            {subscriber.user_id.slice(0, 8)}...
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={cn(
                          "font-medium",
                          planColors[subscriber.plan_code] || "bg-muted text-muted-foreground"
                        )}
                      >
                        {subscriber.plan_name}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={cn(
                          "font-medium",
                          statusColors[subscriber.status] || "bg-muted text-muted-foreground"
                        )}
                      >
                        {subscriber.status === "active" && "Ativo"}
                        {subscriber.status === "inactive" && "Inativo"}
                        {subscriber.status === "pending" && "Pendente"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span className="text-sm">
                          {new Date(subscriber.started_at).toLocaleDateString("pt-BR")} -{" "}
                          {new Date(subscriber.expires_at).toLocaleDateString("pt-BR")}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      R$ {Number(subscriber.value).toFixed(2).replace(".", ",")}
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
                            <Mail className="h-4 w-4" /> Notificar
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2">
                            <CreditCard className="h-4 w-4" /> Alterar Plano
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2 text-destructive focus:text-destructive">
                            <UserX className="h-4 w-4" /> Cancelar
                          </DropdownMenuItem>
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
