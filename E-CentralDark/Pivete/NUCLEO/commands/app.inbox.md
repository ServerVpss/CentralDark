# COMANDO - app.inbox.tsx
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-local\apps\crm\src\routes\app.inbox.tsx
**SHA:** 3e15d4a322ce2986
**Timestamp:** 2026-08-26T19:33:56.523683
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- const navigate = useNavigate();
- const navigate = useNavigate();

### Ouro Bruto (primeiros 5000 chars)
```
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useCurrentWorkspace } from "@/hooks/use-workspace";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { formatDateBR, formatTimeBR, formatDateTimeBR } from "@/lib/datetime";
import {
  listTickets, getTicket, listMessages, sendMessage,
  updateTicketStatus, markRead, createTicketWithMessage, logMessageDiagnosticEvent,
  claimTicket, deleteTicket,
} from "@/lib/tickets.functions";
import { getPendingPixForTicket } from "@/lib/chat-payments.functions";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { TicketTimelinePanel } from "@/components/inbox/TicketTimelinePanel";
import { MessageStatusIcon } from "@/components/inbox/MessageStatusIcon";
import {
  enqueueMessage, retryMessage, removeFromQueue,
  getQueueSnapshot, getEmptyQueueSnapshot, subscribe as subscribeQueue, hydrateQueueFromStorage,
  type QueuedMessage,
} from "@/lib/chat-send-queue";
import { listTicketFilterDims, getTicketWindowStatus } from "@/lib/whatsapp.functions";
import { useSignedMediaUrl } from "@/lib/use-signed-media-url";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { FriendlyErrorBox } from "@/components/whatsapp/FriendlyErrorBox";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import {
  Search, Send, Plus, CheckSquare, Inbox as InboxIcon, ArrowUpDown, EyeOff, Eye,
  Filter as FilterIcon, MessageSquare, Clock, ArrowLeft, FileText, MapPin, Download, RefreshCw,
  X, Undo2, ArrowRightLeft, MoreVertical, Smile, Paperclip, Zap, Timer, Mic, Pencil, ListChecks,
  CheckCircle2, StickyNote, Receipt, Copy, Ban,
} from "lucide-react";
import { toast } from "sonner";
import { friendlyToastMessage } from "@/lib/whatsapp-error-translate";
import { cn } from "@/lib/utils";
import { LoadingDots } from "@/components/ui/loading-dots";

export const Route = createFileRoute("/app/inbox")({
  component: InboxPage,
  validateSearch: (search: Record<string, unknown>) => ({
    ticketId: typeof search.ticketId === "string" ? search.ticketId : undefined,
  }),
});


const STATUS_LABEL: Record<string, string> = {
  open: "Aberto", in_progress: "Em andamento", waiting_client: "Aguardando cliente",
  resolved: "Resolvido", closed: "Fechado", critical: "Crítico",
};

/* ============================================================
   PÁGINA PRINCIPAL — layout mobile-first estilo Underchat
   ============================================================ */
function InboxPage() {
  const { data: ws } = useCurrentWorkspace();
  const { ticketId: ticketIdFromUrl } = Route.useSearch();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [activeId, setActiveId] = useState<string | null>(ticketIdFromUrl ?? null);
  const [mainTab, setMainTab] = useState<"ticket" | "atendimentos">("atendimentos");
  const [search, setSearch] = useState("");
  const [searchInContent, setSearchInContent] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // filtros reais
  const [phoneNumberId, setPhoneNumberId] = useState<string>("__all__");
  const [sectorId, setSectorId] = useState<string>("__all__");
  const [assigneeId, setAssigneeId] = useState<string>("__all__");
  const [statusFilter, setStatusFilter] = useState<"open" | "resolved" | "all">("all");
  const [sortAsc, setSortAsc] = useState(false);

  // tab Atendendo / Aguardando
  const [statusTab, setStatusTab] = useState<"atendendo" | "aguardando">("atendendo");

  // abre conversa direto via ?ticketId=
  useEffect(() => {
    if (ticketIdFromUrl && ticketIdFromUrl !== activeId) {
      setActiveId(ticketIdFromUrl);
      setMainTab("ticket");
      navigate({ t
```