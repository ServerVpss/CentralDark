import { Plus, MoreHorizontal, MessageSquare, Calendar as CalIcon, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const COLUMNS = [
  { id: "new", title: "Novos leads", color: "bg-blue-500", count: 12, value: "R$ 24.500" },
  { id: "qual", title: "Qualificação", color: "bg-amber-500", count: 8, value: "R$ 18.200" },
  { id: "prop", title: "Proposta", color: "bg-purple-500", count: 5, value: "R$ 32.000" },
  { id: "neg", title: "Negociação", color: "bg-orange-500", count: 3, value: "R$ 28.500" },
  { id: "won", title: "Ganhos", color: "bg-emerald-500", count: 7, value: "R$ 41.200" },
];

const CARDS = [
  { name: "João Silva", company: "Acme Ltda", value: "R$ 4.500", tags: ["Quente", "Premium"], date: "Hoje", msgs: 12 },
  { name: "Maria Santos", company: "TechCorp", value: "R$ 8.900", tags: ["Recorrente"], date: "Amanhã", msgs: 5 },
  { name: "Pedro Costa", company: "StartupX", value: "R$ 2.100", tags: ["Frio"], date: "3 dias", msgs: 2 },
];

export function KanbanSkeleton() {
  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col overflow-hidden">
      <header className="flex items-center justify-between border-b bg-card px-6 py-3">
        <div>
          <h2 className="text-sm font-semibold">Pipeline · Vendas Q2</h2>
          <p className="text-xs text-muted-foreground">35 oportunidades · R$ 144.400 em pipeline</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">Filtros</Button>
          <Button size="sm"><Plus className="mr-1 h-3.5 w-3.5" />Novo card</Button>
        </div>
      </header>

      <div className="flex-1 overflow-x-auto bg-muted/20 p-4">
        <div className="flex gap-4 h-full min-w-max">
          {COLUMNS.map((col) => (
            <div key={col.id} className="flex w-72 shrink-0 flex-col rounded-xl bg-card/60 border">
              <div className="flex items-center justify-between border-b px-3 py-2.5">
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`h-2 w-2 rounded-full ${col.color}`} />
                  <p className="truncate text-sm font-semibold">{col.title}</p>
                  <Badge variant="secondary" className="h-4 px-1.5 text-[10px]">{col.count}</Badge>
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="h-3.5 w-3.5" /></Button>
              </div>
              <p className="px-3 py-1 text-[11px] font-medium text-muted-foreground">{col.value}</p>
              <div className="flex-1 space-y-2 overflow-y-auto p-2">
                {CARDS.slice(0, col.id === "won" ? 2 : 3).map((c, i) => (
                  <div key={i} className="cursor-grab rounded-lg border bg-card p-3 shadow-sm transition-shadow hover:shadow-md">
                    <p className="text-sm font-semibold">{c.name}</p>
                    <p className="text-xs text-muted-foreground">{c.company}</p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {c.tags.map((t) => <Badge key={t} variant="outline" className="h-4 px-1.5 text-[9px]">{t}</Badge>)}
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                      <span className="inline-flex items-center gap-1"><DollarSign className="h-3 w-3" />{c.value}</span>
                      <span className="inline-flex items-center gap-1"><CalIcon className="h-3 w-3" />{c.date}</span>
                      <span className="inline-flex items-center gap-1"><MessageSquare className="h-3 w-3" />{c.msgs}</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <Avatar className="h-5 w-5"><AvatarFallback className="bg-primary/10 text-[8px] text-primary">AT</AvatarFallback></Avatar>
                    </div>
                  </div>
                ))}
                <button className="w-full rounded-lg border border-dashed py-2 text-xs text-muted-foreground hover:bg-muted/40">+ Adicionar card</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
