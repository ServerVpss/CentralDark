// Kanban CRM (funil de vendas) — colunas configuráveis + cards de contatos
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { formatDateTimeBR } from "@/lib/datetime";
import {
  listCrmBoard, createCrmColumn, updateCrmColumn, deleteCrmColumn,
  createCrmCard, moveCrmCard, deleteCrmCard, updateCrmCard,
  listContactsAvailableForCrm, seedCrmFromTickets,
} from "@/lib/crm.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, MoreVertical, Trash2, Pencil, Download, MessageCircle } from "lucide-react";
import { LoadingDots } from "@/components/ui/loading-dots";

type Card = {
  id: string; column_id: string; contact_id: string; ticket_id: string | null;
  title: string | null; value_cents: number; notes: string | null;
  position: number;
  contacts: { id: string; name: string | null; phone: string | null; avatar_url: string | null; tags: string[] | null; last_message_at: string | null } | null;
  tickets: { id: string; status: string; last_message_preview: string | null } | null;
};
type Column = { id: string; title: string; color: string; position: number; is_won: boolean; is_lost: boolean };

function brl(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
function fmtDateTime(iso?: string | null) {
  if (!iso) return null;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return null;
  return formatDateTimeBR(d, { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" });
}
function initials(name?: string | null, phone?: string | null) {
  if (name) return name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();
  if (phone) return phone.slice(-2);
  return "??";
}

export function CrmBoard({ workspaceId, chatPath = "/app/chat" as "/app/chat" | "/admin/chat" }: { workspaceId: string; chatPath?: "/app/chat" | "/admin/chat" }) {
  const qc = useQueryClient();
  const fetchBoard = useServerFn(listCrmBoard);
  const createColFn = useServerFn(createCrmColumn);
  const updateColFn = useServerFn(updateCrmColumn);
  const deleteColFn = useServerFn(deleteCrmColumn);
  const createCardFn = useServerFn(createCrmCard);
  const moveCardFn = useServerFn(moveCrmCard);
  const deleteCardFn = useServerFn(deleteCrmCard);
  const updateCardFn = useServerFn(updateCrmCard);
  const seedFn = useServerFn(seedCrmFromTickets);

  const boardQ = useQuery({
    queryKey: ["crm-board", workspaceId],
    queryFn: () => fetchBoard({ data: { workspaceId } }),
  });

  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<{ col: string; index: number } | null>(null);
  const [editCard, setEditCard] = useState<Card | null>(null);
  const [addCardCol, setAddCardCol] = useState<string | null>(null);
  const [newColOpen, setNewColOpen] = useState(false);
  const [editCol, setEditCol] = useState<Column | null>(null);

  const refresh = () => qc.invalidateQueries({ queryKey: ["crm-board", workspaceId] });

  const moveM = useMutation({
    mutationFn: (v: { cardId: string; toColumnId: string; toPosition: number }) => moveCardFn({ data: v }),
    onMutate: async (v) => {
      await qc.cancelQueries({ queryKey: ["crm-board", workspaceId] });
      const prev = qc.getQueryData<any>(["crm-board", workspaceId]);
      if (prev) {
        const next = { ...prev, cards: prev.cards.map((c: Card) => ({ ...c })) };
        const moving = next.cards.find((c: Card) => c.id === v.cardId);
        if (moving) {
          const fromCol = moving.column_id;
          moving.column_id = v.toColumnId;
          moving.position = v.toPosition - 0.5;
          // re-normalize positions per column
          const groups: Record<string, Card[]> = {};
          for (const c of next.cards) (groups[c.column_id] ||= []).push(c);
          for (const k of Object.keys(groups)) {
            groups[k].sort((a, b) => a.position - b.position).forEach((c, i) => (c.position = i));
          }
        }
        qc.setQueryData(["crm-board", workspaceId], next);
      }
      return { prev };
    },
    onError: (e: any, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(["crm-board", workspaceId], ctx.prev);
      toast.error(e?.message ?? "Falha ao mover");
    },
    onSettled: refresh,
  });
  const delColM = useMutation({
    mutationFn: (columnId: string) => deleteColFn({ data: { columnId } }),
    onSuccess: () => { refresh(); toast.success("Coluna removida"); },
    onError: (e: any) => toast.error(e?.message ?? "Falha"),
  });
  const delCardM = useMutation({
    mutationFn: (cardId: string) => deleteCardFn({ data: { cardId } }),
    onSuccess: () => { refresh(); toast.success("Card removido"); },
  });
  const seedM = useMutation({
    mutationFn: () => seedFn({ data: { workspaceId } }),
    onSuccess: (r) => { refresh(); toast.success(`${r.inserted} contato(s) importado(s)`); },
    onError: (e: any) => toast.error(e?.message ?? "Falha ao importar"),
  });

  if (boardQ.isLoading) {
    return <div className="flex h-full items-center justify-center"><LoadingDots label="Carregando funil" /></div>;
  }
  const columns: Column[] = boardQ.data?.columns ?? [];
  const cards: Card[] = (boardQ.data?.cards ?? []) as any;
  const cardsByCol = (id: string) => cards.filter(c => c.column_id === id).sort((a, b) => a.position - b.position);

  const performDrop = (toColumnId: string, toIndex: number) => {
    if (!dragId) return;
    const list = cardsByCol(toColumnId);
    const current = cards.find(c => c.id === dragId);
    const sameCol = current?.column_id === toColumnId;
    const currentIdx = sameCol ? list.findIndex(c => c.id === dragId) : -1;
    let target = Math.max(0, Math.min(toIndex, list.length));
    if (sameCol && currentIdx !== -1 && target > currentIdx) target -= 1;
    if (sameCol && target === currentIdx) { setDragId(null); setDragOver(null); return; }
    moveM.mutate({ cardId: dragId, toColumnId, toPosition: target });
    setDragId(null);
    setDragOver(null);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-2 border-b bg-card px-4 py-3">
        <div>
          <h1 className="text-lg font-semibold">Funil de vendas</h1>
          <p className="text-xs text-muted-foreground">Arraste os cards entre as colunas. Colunas e cards são configuráveis.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => seedM.mutate()} disabled={seedM.isPending}>
            <Download className="mr-1.5 h-4 w-4" /> Importar conversas
          </Button>
          <Button size="sm" onClick={() => setNewColOpen(true)}>
            <Plus className="mr-1.5 h-4 w-4" /> Nova coluna
          </Button>
        </div>
      </div>

      <div className="flex flex-1 gap-3 overflow-x-auto p-4">
        {columns.map((col) => {
          const list = cardsByCol(col.id);
          const total = list.reduce((s, c) => s + (c.value_cents ?? 0), 0);
          return (
            <div
              key={col.id}
              className={`flex w-72 shrink-0 flex-col rounded-xl border bg-muted/30 transition-colors ${
                dragOver?.col === col.id ? "border-primary/60 bg-primary/5" : ""
              }`}
              onDragOver={(e) => {
                if (!dragId) return;
                e.preventDefault();
                e.dataTransfer.dropEffect = "move";
                if (dragOver?.col !== col.id || dragOver?.index !== list.length) {
                  if (!dragOver || dragOver.col !== col.id) setDragOver({ col: col.id, index: list.length });
                }
              }}
              onDragLeave={(e) => {
                // só limpa se saiu mesmo da coluna
                const rt = e.relatedTarget as Node | null;
                if (!rt || !(e.currentTarget as Node).contains(rt)) {
                  if (dragOver?.col === col.id) setDragOver(null);
                }
              }}
              onDrop={(e) => {
                e.preventDefault();
                performDrop(col.id, dragOver?.col === col.id ? dragOver.index : list.length);
              }}
            >
              <div className="flex items-center justify-between border-b px-3 py-2" style={{ borderTopColor: col.color, borderTopWidth: 3 }}>
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: col.color }} />
                  <span className="text-sm font-semibold">{col.title}</span>
                  <span className="rounded-full bg-background px-1.5 py-0.5 text-[10px] text-muted-foreground">{list.length}</span>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="rounded p-1 hover:bg-muted"><MoreVertical className="h-3.5 w-3.5" /></button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onSelect={() => setEditCol(col)}><Pencil className="mr-2 h-3.5 w-3.5" /> Editar</DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => setAddCardCol(col.id)}><Plus className="mr-2 h-3.5 w-3.5" /> Adicionar card</DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600" onSelect={() => { if (confirm(`Excluir coluna "${col.title}" e seus cards?`)) delColM.mutate(col.id); }}>
                      <Trash2 className="mr-2 h-3.5 w-3.5" /> Excluir coluna
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              {total > 0 && (
                <div className="px-3 pt-2 text-[11px] text-muted-foreground">Total: <span className="font-medium text-foreground">{brl(total)}</span></div>
              )}
              <div className="flex-1 space-y-2 overflow-y-auto p-2">
                {list.map((c, i) => {
                  const showIndicator = dragOver?.col === col.id && dragOver?.index === i && dragId !== c.id;
                  const isDragging = dragId === c.id;
                  return (
                    <div key={c.id}>
                      {showIndicator && <div className="mb-2 h-1 rounded-full bg-primary/70" />}
                      <div
                        draggable
                        onDragStart={(e) => {
                          setDragId(c.id);
                          e.dataTransfer.effectAllowed = "move";
                          try { e.dataTransfer.setData("text/plain", c.id); } catch {}
                        }}
                        onDragEnd={() => { setDragId(null); setDragOver(null); }}
                        onDragOver={(e) => {
                          if (!dragId || dragId === c.id) return;
                          e.preventDefault();
                          e.stopPropagation();
                          const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                          const before = e.clientY < rect.top + rect.height / 2;
                          const idx = before ? i : i + 1;
                          if (dragOver?.col !== col.id || dragOver?.index !== idx) {
                            setDragOver({ col: col.id, index: idx });
                          }
                        }}
                        className={`cursor-grab select-none rounded-lg border bg-card p-2.5 shadow-sm transition-all hover:shadow-md active:cursor-grabbing ${
                          isDragging ? "rotate-1 opacity-40 ring-2 ring-primary/40" : ""
                        }`}
                        onClick={() => !isDragging && setEditCard(c)}
                      >
                        <div className="flex items-center gap-2">
                          <Avatar className="h-7 w-7">
                            <AvatarImage src={c.contacts?.avatar_url ?? undefined} />
                            <AvatarFallback className="text-[10px]">{initials(c.contacts?.name, c.contacts?.phone)}</AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">{c.title || c.contacts?.name || c.contacts?.phone || "—"}</p>
                            {c.contacts?.phone && <p className="truncate text-[11px] text-muted-foreground">{c.contacts.phone}</p>}
                          </div>
                        </div>
                        {c.tickets?.last_message_preview && (
                          <p className="mt-1.5 line-clamp-2 text-[11px] text-muted-foreground">{c.tickets.last_message_preview}</p>
                        )}
                        {fmtDateTime(c.contacts?.last_message_at) && (
                          <p className="mt-1 text-[10px] text-muted-foreground">{fmtDateTime(c.contacts?.last_message_at)}</p>
                        )}
                        <div className="mt-2 flex items-center justify-between">
                          {c.value_cents > 0 ? <span className="text-xs font-semibold text-emerald-600">{brl(c.value_cents)}</span> : <span />}
                          {c.ticket_id && (
                            <Link to={chatPath} search={{ ticketId: c.ticket_id } as any} onClick={(e) => e.stopPropagation()} className="flex items-center gap-1 text-[11px] text-primary hover:underline">
                              <MessageCircle className="h-3 w-3" /> Conversa
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {dragOver?.col === col.id && dragOver?.index >= list.length && dragId && (
                  <div className="h-1 rounded-full bg-primary/70" />
                )}
                {list.length === 0 && (
                  <div className={`flex min-h-[120px] items-center justify-center rounded-lg border-2 border-dashed text-center text-[11px] ${
                    dragOver?.col === col.id ? "border-primary/60 bg-primary/5 text-primary" : "border-transparent text-muted-foreground"
                  }`}>
                    {dragOver?.col === col.id ? "Soltar aqui" : "Sem cards. Arraste pra cá ou use +"}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {columns.length === 0 && (
          <div className="m-auto text-center text-sm text-muted-foreground">
            <p>Nenhuma coluna criada ainda.</p>
            <Button className="mt-2" size="sm" onClick={() => setNewColOpen(true)}><Plus className="mr-1.5 h-4 w-4" /> Criar primeira coluna</Button>
          </div>
        )}
      </div>

      {/* Diálogo nova coluna */}
      <NewColumnDialog
        open={newColOpen} onOpenChange={setNewColOpen} workspaceId={workspaceId}
        onCreated={() => { setNewColOpen(false); refresh(); }}
        createFn={(input: any) => createColFn({ data: input })}
      />

      {/* Diálogo editar coluna */}
      <EditColumnDialog
        column={editCol} onClose={() => setEditCol(null)}
        onSaved={() => { setEditCol(null); refresh(); }}
        updateFn={(input: any) => updateColFn({ data: input })}
      />

      {/* Diálogo adicionar card */}
      <AddCardDialog
        workspaceId={workspaceId} columnId={addCardCol} onClose={() => setAddCardCol(null)}
        onCreated={() => { setAddCardCol(null); refresh(); }}
      />

      {/* Diálogo editar card */}
      <EditCardDialog
        card={editCard} onClose={() => setEditCard(null)}
        onSaved={() => { setEditCard(null); refresh(); }}
        onDelete={(id) => { if (confirm("Excluir este card?")) { delCardM.mutate(id); setEditCard(null); } }}
        updateFn={(input: any) => updateCardFn({ data: input })}
      />
    </div>
  );
}

function NewColumnDialog({ open, onOpenChange, workspaceId, onCreated, createFn }: any) {
  const [title, setTitle] = useState("");
  const [color, setColor] = useState("#3b82f6");
  const [busy, setBusy] = useState(false);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Nova coluna</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5"><label className="text-xs font-medium">Título</label><Input value={title} onChange={(e) => setTitle(e.target.value)} /></div>
          <div className="space-y-1.5"><label className="text-xs font-medium">Cor</label><input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-9 w-16 rounded border" /></div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button disabled={!title.trim() || busy} onClick={async () => {
            setBusy(true);
            try { await createFn({ workspaceId, title: title.trim(), color }); setTitle(""); onCreated(); } catch (e: any) { toast.error(e?.message ?? "Falha"); } finally { setBusy(false); }
          }}>Criar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EditColumnDialog({ column, onClose, onSaved, updateFn }: any) {
  const [title, setTitle] = useState(column?.title ?? "");
  const [color, setColor] = useState(column?.color ?? "#3b82f6");
  const [busy, setBusy] = useState(false);
  // sincroniza quando muda
  if (column && (title !== column.title || color !== column.color) && !busy && title === "" && color === "#3b82f6") {
    setTitle(column.title); setColor(column.color);
  }
  return (
    <Dialog open={!!column} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader><DialogTitle>Editar coluna</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5"><label className="text-xs font-medium">Título</label><Input value={title} onChange={(e) => setTitle(e.target.value)} /></div>
          <div className="space-y-1.5"><label className="text-xs font-medium">Cor</label><input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-9 w-16 rounded border" /></div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button disabled={!title.trim() || busy} onClick={async () => {
            setBusy(true);
            try { await updateFn({ columnId: column.id, title: title.trim(), color }); onSaved(); } catch (e: any) { toast.error(e?.message ?? "Falha"); } finally { setBusy(false); }
          }}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AddCardDialog({ workspaceId, columnId, onClose, onCreated }: { workspaceId: string; columnId: string | null; onClose: () => void; onCreated: () => void }) {
  const fetchAvail = useServerFn(listContactsAvailableForCrm);
  const createCardFn = useServerFn(createCrmCard);
  const [search, setSearch] = useState("");
  const q = useQuery({
    queryKey: ["crm-avail", workspaceId, search],
    queryFn: () => fetchAvail({ data: { workspaceId, search } }),
    enabled: !!columnId,
  });
  return (
    <Dialog open={!!columnId} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Adicionar card</DialogTitle></DialogHeader>
        <Input placeholder="Buscar contato…" value={search} onChange={(e) => setSearch(e.target.value)} />
        <div className="max-h-72 space-y-1 overflow-y-auto">
          {(q.data?.contacts ?? []).map((c: any) => (
            <button key={c.id} className="flex w-full items-center gap-2 rounded p-2 text-left hover:bg-muted"
              onClick={async () => { try { await createCardFn({ data: { workspaceId, contactId: c.id, columnId: columnId! } }); onCreated(); } catch (e: any) { toast.error(e?.message ?? "Falha"); } }}>
              <Avatar className="h-7 w-7"><AvatarImage src={c.avatar_url ?? undefined} /><AvatarFallback className="text-[10px]">{initials(c.name, c.phone)}</AvatarFallback></Avatar>
              <div className="min-w-0 flex-1"><p className="truncate text-sm">{c.name || c.phone}</p><p className="truncate text-[11px] text-muted-foreground">{c.phone}</p></div>
            </button>
          ))}
          {q.data && q.data.contacts.length === 0 && <p className="p-4 text-center text-xs text-muted-foreground">Nenhum contato disponível.</p>}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function EditCardDialog({ card, onClose, onSaved, onDelete, updateFn }: { card: Card | null; onClose: () => void; onSaved: () => void; onDelete: (id: string) => void; updateFn: (i: any) => Promise<any> }) {
  const [title, setTitle] = useState(card?.title ?? "");
  const [value, setValue] = useState(card ? (card.value_cents / 100).toString() : "");
  const [notes, setNotes] = useState(card?.notes ?? "");
  const [busy, setBusy] = useState(false);
  if (card && title === "" && value === "" && notes === "" && (card.title || card.value_cents || card.notes)) {
    setTitle(card.title ?? ""); setValue(card.value_cents ? (card.value_cents / 100).toString() : ""); setNotes(card.notes ?? "");
  }
  return (
    <Dialog open={!!card} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader><DialogTitle>{card?.contacts?.name || card?.contacts?.phone || "Card"}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5"><label className="text-xs font-medium">Título (opcional)</label><Input value={title} onChange={(e) => setTitle(e.target.value)} /></div>
          <div className="space-y-1.5"><label className="text-xs font-medium">Valor (R$)</label><Input type="number" min="0" step="0.01" value={value} onChange={(e) => setValue(e.target.value)} /></div>
          <div className="space-y-1.5"><label className="text-xs font-medium">Observações</label><Textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} /></div>
        </div>
        <DialogFooter className="flex justify-between">
          <Button variant="destructive" size="sm" onClick={() => card && onDelete(card.id)}><Trash2 className="mr-1.5 h-4 w-4" /> Excluir</Button>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={onClose}>Fechar</Button>
            <Button disabled={busy} onClick={async () => {
              if (!card) return;
              setBusy(true);
              try {
                const cents = Math.round((parseFloat(value || "0") || 0) * 100);
                await updateFn({ cardId: card.id, title: title || null, valueCents: cents, notes: notes || null });
                onSaved();
              } catch (e: any) { toast.error(e?.message ?? "Falha"); } finally { setBusy(false); }
            }}>Salvar</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
