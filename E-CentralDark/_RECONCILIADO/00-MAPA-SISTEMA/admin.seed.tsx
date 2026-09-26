import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Card } from "@/components/ui/card";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Database, Search, Sparkles, Trash2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { LoadingDots } from "@/components/ui/loading-dots";
import {
  adminListWorkspacesForSeed,
  seedWorkspace,
  resetWorkspaceSeed,
  getWorkspaceSeedStats,
} from "@/lib/seed.functions";

export const Route = createFileRoute("/admin/seed")({
  component: AdminSeedPage,
});

const TABLE_LABELS: Record<string, string> = {
  contacts: "Contatos",
  contact_groups: "Grupos de contatos",
  contact_group_members: "Membros de grupos",
  sectors: "Setores",
  quick_replies: "Respostas rápidas",
  chatbot_flows: "Chatbots",
  campaigns: "Campanhas",
  campaign_recipients: "Destinatários de campanha",
  ai_agent_configs: "Agentes de IA",
  ai_usage_log: "Uso de IA",
  notifications: "Notificações",
  whatsapp_connections: "Conexões WhatsApp",
  tickets: "Atendimentos",
  ticket_messages: "Mensagens",
  satisfaction_ratings: "Avaliações",
};

function AdminSeedPage() {
  const qc = useQueryClient();
  const listFn = useServerFn(adminListWorkspacesForSeed);
  const seedFn = useServerFn(seedWorkspace);
  const resetFn = useServerFn(resetWorkspaceSeed);
  const statsFn = useServerFn(getWorkspaceSeedStats);

  const [search, setSearch] = useState("");
  const [statsFor, setStatsFor] = useState<{ id: string; name: string } | null>(null);
  const [resetFor, setResetFor] = useState<{ id: string; name: string } | null>(null);
  const [resetConfirm, setResetConfirm] = useState("");

  const list = useQuery({
    queryKey: ["admin", "seed", "workspaces"],
    queryFn: () => listFn(),
  });

  const stats = useQuery({
    queryKey: ["admin", "seed", "stats", statsFor?.id],
    queryFn: () => statsFn({ data: { workspaceId: statsFor!.id } }),
    enabled: !!statsFor,
  });

  const seedM = useMutation({
    mutationFn: (id: string) => seedFn({ data: { workspaceId: id } }),
    onSuccess: (r) => {
      const total = Object.values(r.created).reduce((a, b) => a + b, 0);
      toast.success(`Workspace populado com ${total} registros de demonstração.`);
      qc.invalidateQueries({ queryKey: ["admin", "seed"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const resetM = useMutation({
    mutationFn: (id: string) =>
      resetFn({ data: { workspaceId: id, confirm: "CONFIRMAR-RESET" as const } }),
    onSuccess: (r) => {
      const total = Object.values(r.deleted).reduce((a, b) => a + b, 0);
      toast.success(`Reset concluído: ${total} registros de demonstração removidos.`);
      qc.invalidateQueries({ queryKey: ["admin", "seed"] });
      setResetFor(null);
      setResetConfirm("");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const filtered = (list.data ?? []).filter((w) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      w.name?.toLowerCase().includes(q) ||
      w.slug?.toLowerCase().includes(q) ||
      w.id.toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start gap-3">
        <Database className="h-8 w-8 text-primary mt-1" />
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Dados de demonstração</h1>
          <p className="text-sm text-muted-foreground max-w-2xl">
            Popule um workspace com dados de exemplo (contatos, setores, chatbot, campanha)
            para o cliente conhecer a plataforma. O reset apaga somente o que foi
            criado como demonstração — nada de dados reais é tocado.
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link to="/admin/seed-resets">Histórico de resets</Link>
        </Button>
      </div>

      <Card className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, slug ou ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-md"
          />
          <div className="ml-auto text-sm text-muted-foreground">
            {filtered.length} workspace(s)
          </div>
        </div>

        {list.isLoading ? (
          <div className="flex justify-center py-8"><LoadingDots size="md" /></div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Workspace</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Dados demo</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((w) => (
                <TableRow key={w.id}>
                  <TableCell className="font-medium">{w.name}</TableCell>
                  <TableCell className="text-muted-foreground">{w.slug}</TableCell>
                  <TableCell>
                    {w.seed_contacts_count > 0 ? (
                      <Badge variant="secondary">
                        {w.seed_contacts_count} contato(s) demo
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">sem demo</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setStatsFor({ id: w.id, name: w.name })}
                    >
                      Detalhes
                    </Button>
                    <Button
                      size="sm"
                      variant="default"
                      disabled={seedM.isPending}
                      onClick={() => seedM.mutate(w.id)}
                    >
                      <Sparkles className="h-3 w-3 mr-1" />
                      Popular
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={w.seed_contacts_count === 0}
                      onClick={() => setResetFor({ id: w.id, name: w.name })}
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Resetar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                    Nenhum workspace encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* Modal: detalhes */}
      <Dialog open={!!statsFor} onOpenChange={(v) => !v && setStatsFor(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dados de demonstração — {statsFor?.name}</DialogTitle>
            <DialogDescription>
              Contagem por tabela. Tudo aqui foi criado como demonstração e pode ser
              removido com segurança.
            </DialogDescription>
          </DialogHeader>
          {stats.isLoading ? (
            <div className="flex justify-center py-6"><LoadingDots size="md" /></div>
          ) : (
            <div className="space-y-1 max-h-80 overflow-auto">
              {Object.entries(stats.data?.counts ?? {})
                .sort(([, a], [, b]) => b - a)
                .map(([k, v]) => (
                  <div key={k} className="flex justify-between text-sm py-1 border-b">
                    <span>{TABLE_LABELS[k] ?? k}</span>
                    <Badge variant={v > 0 ? "default" : "outline"}>{v}</Badge>
                  </div>
                ))}
              <div className="flex justify-between font-semibold pt-2">
                <span>Total</span>
                <span>{stats.data?.total ?? 0}</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal: confirmar reset */}
      <Dialog
        open={!!resetFor}
        onOpenChange={(v) => {
          if (!v) {
            setResetFor(null);
            setResetConfirm("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Resetar dados de demonstração
            </DialogTitle>
            <DialogDescription>
              Vai apagar TODOS os registros marcados como demonstração em{" "}
              <strong>{resetFor?.name}</strong>. Dados reais do cliente não são
              afetados. Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="confirm-reset">
              Digite <code className="bg-muted px-1 rounded">CONFIRMAR-RESET</code> para
              prosseguir:
            </Label>
            <Input
              id="confirm-reset"
              value={resetConfirm}
              onChange={(e) => setResetConfirm(e.target.value)}
              placeholder="CONFIRMAR-RESET"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setResetFor(null);
                setResetConfirm("");
              }}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              disabled={resetConfirm !== "CONFIRMAR-RESET" || resetM.isPending}
              onClick={() => resetFor && resetM.mutate(resetFor.id)}
            >
              {resetM.isPending ? "Resetando..." : "Resetar agora"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
