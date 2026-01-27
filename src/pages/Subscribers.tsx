import { useState } from "react";
import {
  ArrowUpDown,
  Calendar,
  CreditCard,
  Crown,
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

interface Subscriber {
  id: string;
  name: string;
  email: string;
  telegramId: string;
  plan: "free" | "basic" | "pro" | "enterprise";
  status: "active" | "inactive" | "pending";
  startDate: string;
  endDate: string;
  revenue: number;
}

const subscribers: Subscriber[] = [
  {
    id: "1",
    name: "João Silva",
    email: "joao@email.com",
    telegramId: "@joaosilva",
    plan: "pro",
    status: "active",
    startDate: "2024-01-15",
    endDate: "2025-01-15",
    revenue: 997,
  },
  {
    id: "2",
    name: "Maria Santos",
    email: "maria@email.com",
    telegramId: "@mariasantos",
    plan: "enterprise",
    status: "active",
    startDate: "2024-02-01",
    endDate: "2025-02-01",
    revenue: 2997,
  },
  {
    id: "3",
    name: "Pedro Costa",
    email: "pedro@email.com",
    telegramId: "@pedrocosta",
    plan: "basic",
    status: "pending",
    startDate: "2024-03-10",
    endDate: "2024-04-10",
    revenue: 297,
  },
  {
    id: "4",
    name: "Ana Oliveira",
    email: "ana@email.com",
    telegramId: "@anaoliveira",
    plan: "pro",
    status: "active",
    startDate: "2024-01-20",
    endDate: "2025-01-20",
    revenue: 997,
  },
  {
    id: "5",
    name: "Carlos Ferreira",
    email: "carlos@email.com",
    telegramId: "@carlosferreira",
    plan: "free",
    status: "inactive",
    startDate: "2024-02-15",
    endDate: "2024-03-15",
    revenue: 0,
  },
];

const planColors = {
  free: "bg-muted text-muted-foreground",
  basic: "bg-primary/10 text-primary",
  pro: "bg-warning/10 text-warning",
  enterprise: "bg-accent/10 text-accent",
};

const statusColors = {
  active: "bg-success/10 text-success",
  inactive: "bg-destructive/10 text-destructive",
  pending: "bg-warning/10 text-warning",
};

export default function Subscribers() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredSubscribers = subscribers.filter(
    (sub) =>
      sub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.telegramId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalRevenue = subscribers.reduce((acc, sub) => acc + sub.revenue, 0);
  const activeSubscribers = subscribers.filter((sub) => sub.status === "active").length;

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
                <p className="text-2xl font-bold">
                  {subscribers.filter((s) => s.plan === "pro" || s.plan === "enterprise").length}
                </p>
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
                <p className="text-2xl font-bold">R$ {totalRevenue.toLocaleString()}</p>
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
              placeholder="Buscar por nome, email ou Telegram..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-secondary/50"
            />
          </div>
        </div>

        {/* Table */}
        <div className="rounded-xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-muted-foreground">
                  <Button variant="ghost" className="gap-1 -ml-4">
                    Assinante
                    <ArrowUpDown className="h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead className="text-muted-foreground">Telegram</TableHead>
                <TableHead className="text-muted-foreground">Plano</TableHead>
                <TableHead className="text-muted-foreground">Status</TableHead>
                <TableHead className="text-muted-foreground">Período</TableHead>
                <TableHead className="text-muted-foreground text-right">Receita</TableHead>
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
                        <p className="font-medium">{subscriber.name}</p>
                        <p className="text-sm text-muted-foreground">{subscriber.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{subscriber.telegramId}</TableCell>
                  <TableCell>
                    <Badge className={cn("font-medium", planColors[subscriber.plan])}>
                      {subscriber.plan.charAt(0).toUpperCase() + subscriber.plan.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={cn("font-medium", statusColors[subscriber.status])}>
                      {subscriber.status === "active" && "Ativo"}
                      {subscriber.status === "inactive" && "Inativo"}
                      {subscriber.status === "pending" && "Pendente"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span className="text-sm">
                        {new Date(subscriber.startDate).toLocaleDateString("pt-BR")} -{" "}
                        {new Date(subscriber.endDate).toLocaleDateString("pt-BR")}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    R$ {subscriber.revenue.toLocaleString()}
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
                          <Mail className="h-4 w-4" /> Enviar Email
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
        </div>
      </div>
    </DashboardLayout>
  );
}
