import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { CheckCircle2, Circle, Loader2, Plus, Trash2, ListChecks } from "lucide-react";
import { useRoadmap, RoadmapItem } from "@/shared/hooks/useRoadmap";
import { cn } from "@/shared/lib/utils";

function priorityLabel(p: number) {
  if (p === 1) return { label: "Alta", cls: "text-rose-600 bg-rose-50 border-rose-200" };
  if (p === 2) return { label: "Média", cls: "text-amber-600 bg-amber-50 border-amber-200" };
  return { label: "Baixa", cls: "text-emerald-600 bg-emerald-50 border-emerald-200" };
}

function StatusIcon({ status, onClick }: { status: string; onClick: () => void }) {
  if (status === "concluido")
    return <CheckCircle2 className="h-4 w-4 text-emerald-600 cursor-pointer" onClick={onClick} />;
  if (status === "em_andamento")
    return <Loader2 className="h-4 w-4 text-amber-600 cursor-pointer" onClick={onClick} />;
  return <Circle className="h-4 w-4 text-muted-foreground cursor-pointer" onClick={onClick} />;
}

function nextStatus(s: string): RoadmapItem["status"] {
  if (s === "pendente") return "em_andamento";
  if (s === "em_andamento") return "concluido";
  return "pendente";
}

export function RoadmapList({ className }: { className?: string }) {
  const { items, loading, add, setStatus, remove } = useRoadmap();
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState(3);

  const submit = async () => {
    if (!title.trim()) return;
    await add(title, undefined, priority);
    setTitle("");
    setPriority(3);
  };

  return (
    <Card className={cn("", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <ListChecks className="h-4 w-4 text-primary" />
          Roadmap auto-construído
        </CardTitle>
        <CardDescription className="text-xs">
          Tarefas pendentes do projeto. Marca como feito quando ficar 100%.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2">
          <Input
            placeholder="Nova tarefa…"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
          />
          <select
            value={priority}
            onChange={(e) => setPriority(Number(e.target.value))}
            className="h-10 rounded-md border border-border bg-background px-2 text-sm"
          >
            <option value={1}>Alta</option>
            <option value={2}>Média</option>
            <option value={3}>Baixa</option>
          </select>
          <Button onClick={submit} className="gap-1">
            <Plus className="h-4 w-4" /> Adicionar
          </Button>
        </div>

        {loading ? (
          <div className="text-sm text-muted-foreground">Carregando…</div>
        ) : items.length === 0 ? (
          <div className="text-sm text-muted-foreground">
            Sem tarefas — adicione a primeira pra começar.
          </div>
        ) : (
          <ul className="divide-y divide-border/40">
            {items.map((it) => {
              const p = priorityLabel(it.priority);
              return (
                <li key={it.id} className="py-2 flex items-center gap-3 text-sm">
                  <StatusIcon
                    status={it.status}
                    onClick={() => setStatus(it.id, nextStatus(it.status))}
                  />
                  <div className="flex-1 min-w-0">
                    <div
                      className={cn(
                        "truncate",
                        it.status === "concluido" && "line-through text-muted-foreground",
                      )}
                    >
                      {it.title}
                    </div>
                    {it.description && (
                      <div className="text-xs text-muted-foreground truncate">{it.description}</div>
                    )}
                  </div>
                  <span
                    className={cn(
                      "text-[10px] px-1.5 py-0.5 rounded border font-medium",
                      p.cls,
                    )}
                  >
                    {p.label}
                  </span>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => remove(it.id)}
                    title="Remover"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                  </Button>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
