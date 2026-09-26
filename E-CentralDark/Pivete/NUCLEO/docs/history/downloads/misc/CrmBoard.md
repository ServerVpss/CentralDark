# OUTRO - CrmBoard.tsx
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\CentralDark\apps\clone-deck\apps\crm\src\components\crm\CrmBoard.tsx
**SHA:** 28914e4e9ee2ac6e
**Timestamp:** 2026-08-26T19:31:46.025525
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- onDragStart={(e) => {

### Ouro Bruto (primeiros 5000 chars)
```
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
    mutationFn: (columnId: string) => deleteColFn({ data: { columnId
```