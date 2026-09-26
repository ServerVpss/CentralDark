# COMANDO - KanbanBoard.tsx
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\CentralDark\apps\clone-deck\apps\crm\src\components\kanban\KanbanBoard.tsx
**SHA:** 13d4c0ffb3c8c879
**Timestamp:** 2026-08-26T19:31:37.552271
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- const navigate = useNavigate();

### Ouro Bruto (primeiros 5000 chars)
```
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useNavigate } from "@tanstack/react-router";
import { listTickets } from "@/lib/tickets.functions";
import { listTicketFilterDims } from "@/lib/whatsapp.functions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDateBR } from "@/lib/datetime";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, Clock, MessageCircle, CheckCircle2, Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { LoadingDots } from "@/components/ui/loading-dots";

type Props = {
  workspaceId: string;
  /** Pra onde mandar o usuário quando clicar num card */
  chatPath: "/app/chat" | "/admin/chat";
};

type ColumnDef = {
  id: "chatbot" | "aguardando" | "atendimento" | "fechado";
  title: string;
  /** classes da barra de cabeçalho da coluna */
  header: string;
  /** classes do badge de contagem */
  badge: string;
  /** classes da borda lateral do card */
  cardBorder: string;
  /** Match dos tickets do banco */
  match: (t: any) => boolean;
  icon: React.ComponentType<{ className?: string }>;
};

const COLUMNS: ColumnDef[] = [
  {
    id: "chatbot",
    title: "ChatBot",
    header: "bg-blue-500/15 text-blue-300 border-blue-500/30",
    badge: "bg-blue-500/25 text-blue-100",
    cardBorder: "border-l-blue-500",
    icon: Bot,
    // ChatBot: aberto, sem atendente humano
    match: (t) => t.status === "open" && !t.assignee_id,
  },
  {
    id: "aguardando",
    title: "Aguardando atendimento",
    header: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    badge: "bg-amber-500/25 text-amber-100",
    cardBorder: "border-l-amber-500",
    icon: Clock,
    match: (t) =>
      (t.status === "open" && !!t.assignee_id) ||
      t.status === "waiting_client",
  },
  {
    id: "atendimento",
    title: "Em Atendimento",
    header: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    badge: "bg-emerald-500/25 text-emerald-100",
    cardBorder: "border-l-emerald-500",
    icon: MessageCircle,
    match: (t) => t.status === "in_progress" || t.status === "critical",
  },
  {
    id: "fechado",
    title: "Fechado",
    header: "bg-zinc-500/15 text-zinc-300 border-zinc-500/30",
    badge: "bg-zinc-500/25 text-zinc-100",
    cardBorder: "border-l-zinc-500",
    icon: CheckCircle2,
    match: (t) => t.status === "closed" || t.status === "resolved",
  },
];

const DAYS_PT = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];
function relativeDay(iso?: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  const diffDays = Math.floor((Date.now() - d.getTime()) / 86400000);
  if (diffDays === 0) return "Hoje";
  if (diffDays === 1) return "Ontem";
  if (diffDays < 7) return DAYS_PT[d.getDay()];
  return formatDateBR(d);
}

function maskPhone(phone?: string | null) {
  if (!phone) return "";
  // mascara meio: +55 (35) ****-5676
  if (phone.length < 8) return phone;
  return phone.replace(/(\d{2,4})(\d{4})$/, "****-$2");
}

export function KanbanBoard({ workspaceId, chatPath }: Props) {
  const navigate = useNavigate();
  const [channel, setChannel] = useState<string>("__all__");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const dimsFn = useServerFn(listTicketFilterDims);
  const dimsQ = useQuery({
    queryKey: ["ticket-dims", workspaceId],
    queryFn: () => dimsFn({ data: { workspaceId } }),
  });

  const ticketsFn = useServerFn(listTickets);
  const ticketsQ = useQuery({
    queryKey: ["kanban-tickets", workspaceId, channel],
    queryFn: () =>
      ticketsFn({
        data: {
          workspaceId,
          filter: "all",
          limit: 100,
          phoneNumberId: channel === "__all__" ? null : channel,
        },
      }),
    refetchInterval: 30_000,
  });

  const tickets = ticketsQ.data?.tickets ?? [];

  // filtro client-side por nome/telefone
  const filtered = useMemo(() => {
    const n = name.trim().toLowerCase();
    const p = phone.trim().replace(/\D/g, "");
    return tickets.filter((t: any) => {
      if (n && !(t.contact?.name?.toLowerCase().includes(n))) return false;
      if (p && !(t.contact?.phone?.replace(/\D/g, "").includes(p))) return false;
      return true;
    });
  }, [tickets, name, phone]);

  const grouped = useMemo(() => {
    const map: Record<string, any[]> = { chatbot: [], aguardando: [], atendimento: [], fechado: [] };
    for (const t of filtered) {
      const col = COLUMNS.find((c) => c.match(t));
      if (col) map[col.id].push(t);
    }
    return map;
  }, [filtered]);

  const clearFilters = () => {
    setChannel("__all__");
    setName("");
```