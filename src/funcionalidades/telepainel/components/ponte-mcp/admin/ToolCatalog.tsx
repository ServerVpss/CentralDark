import { useMemo, useState } from "react";
import { Card } from "@/compartilhado/ui/card";
import { Input } from "@/compartilhado/ui/input";
import { Button } from "@/compartilhado/ui/button";
import { Skeleton } from "@/compartilhado/ui/skeleton";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/compartilhado/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/compartilhado/ui/table";
import { Search, Filter, X, Copy } from "lucide-react";
import { toast } from "sonner";
import { CATEGORIES, RISKS, ToolCategoryBadge, ToolRiskBadge } from "./badges";
import type { McpTool, ToolCategory, ToolRisk } from "./mcp-adapter";

interface Props {
  tools: McpTool[];
  loading: boolean;
}

export function ToolCatalog({ tools, loading }: Props) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<ToolCategory | "todas">("todas");
  const [risk, setRisk] = useState<ToolRisk | "todos">("todos");
  const [selected, setSelected] = useState<McpTool | null>(null);

  const filtered = useMemo(() => {
    return tools.filter((t) => {
      if (cat !== "todas" && t.category !== cat) return false;
      if (risk !== "todos" && t.risk !== risk) return false;
      if (q && !t.name.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [tools, q, cat, risk]);

  const countsByCat = useMemo(() => {
    const m = new Map<ToolCategory, number>();
    tools.forEach((t) => m.set(t.category, (m.get(t.category) ?? 0) + 1));
    return m;
  }, [tools]);

  return (
    <Card className="p-4 md:p-5 space-y-4">
      <header className="flex flex-col md:flex-row md:items-center gap-3 md:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Catálogo de ferramentas</h2>
          <p className="text-xs text-muted-foreground">
            {filtered.length} de {tools.length} tools · clique numa linha pra ver detalhes
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="tool-search" className="sr-only">Buscar tool por nome</label>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input
              id="tool-search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar tool..."
              className="pl-8 w-56"
            />
          </div>
        </div>
      </header>

      {/* Chips categorias */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          <Filter className="w-3 h-3" /> Categoria:
        </span>
        <FilterChip active={cat === "todas"} onClick={() => setCat("todas")} label={`Todas (${tools.length})`} />
        {CATEGORIES.map((c) => {
          const n = countsByCat.get(c) ?? 0;
          if (!n) return null;
          return (
            <FilterChip key={c} active={cat === c} onClick={() => setCat(c)} label={`${c} (${n})`} />
          );
        })}
      </div>

      {/* Chips risco */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          <Filter className="w-3 h-3" /> Risco:
        </span>
        <FilterChip active={risk === "todos"} onClick={() => setRisk("todos")} label="Todos" />
        {RISKS.map((r) => (
          <FilterChip key={r} active={risk === r} onClick={() => setRisk(r)} label={cap(r)} />
        ))}
      </div>

      {/* Tabela */}
      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[42%]">Ferramenta</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Risco</TableHead>
              <TableHead className="text-right">Ação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading &&
              Array.from({ length: 6 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={4}><Skeleton className="h-6 w-full" /></TableCell>
                </TableRow>
              ))}

            {!loading && filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-sm text-muted-foreground py-10">
                  Nenhuma ferramenta bate com esses filtros.
                  <Button variant="ghost" size="sm" className="ml-2" onClick={() => { setQ(""); setCat("todas"); setRisk("todos"); }}>
                    <X className="w-3 h-3 mr-1" /> limpar filtros
                  </Button>
                </TableCell>
              </TableRow>
            )}

            {!loading && filtered.map((t) => (
              <TableRow
                key={t.name}
                className="cursor-pointer hover:bg-muted/40"
                onClick={() => setSelected(t)}
                tabIndex={0}
                onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setSelected(t)}
              >
                <TableCell className="font-mono text-xs">{t.name}</TableCell>
                <TableCell><ToolCategoryBadge category={t.category} /></TableCell>
                <TableCell><ToolRiskBadge risk={t.risk} /></TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(t.name); toast.success("Nome copiado"); }}
                    aria-label={`Copiar nome ${t.name}`}
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Drawer de detalhe */}
      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="w-full sm:max-w-md">
          {selected && (
            <>
              <SheetHeader>
                <SheetTitle className="font-mono text-base break-all">{selected.name}</SheetTitle>
                <SheetDescription>Detalhes da ferramenta</SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-4">
                <div className="flex flex-wrap gap-2">
                  <ToolCategoryBadge category={selected.category} />
                  <ToolRiskBadge risk={selected.risk} />
                </div>
                {selected.description && (
                  <div>
                    <div className="text-xs uppercase text-muted-foreground mb-1">Descrição</div>
                    <p className="text-sm">{selected.description}</p>
                  </div>
                )}
                <div className="rounded-md border bg-muted/40 p-3 text-xs space-y-1">
                  <div><strong>Destrutiva:</strong> {selected.destructive ? "sim" : "não"}</div>
                  <div><strong>Confirmação obrigatória:</strong> {selected.requiresConfirmation ? "sim" : "não"}</div>
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => { navigator.clipboard.writeText(selected.name); toast.success("Nome copiado"); }}
                >
                  <Copy className="w-4 h-4 mr-2" /> Copiar nome
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </Card>
  );
}

function FilterChip({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-2.5 py-1 rounded-full text-xs border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
        active
          ? "bg-primary text-primary-foreground border-primary"
          : "bg-background hover:bg-muted border-border text-muted-foreground"
      }`}
      aria-pressed={active}
    >
      {label}
    </button>
  );
}

function cap(s: string) { return s[0].toUpperCase() + s.slice(1); }
