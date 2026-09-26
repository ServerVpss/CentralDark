import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { formatDateBR } from "@/lib/datetime";
import {
  listAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  ANNOUNCEMENT_TYPES,
  type AnnouncementType,
} from "@/lib/announcements.functions";
import {
  listWorkspaceAnnouncements,
  createWorkspaceAnnouncement,
  updateWorkspaceAnnouncement,
  deleteWorkspaceAnnouncement,
} from "@/lib/workspace-announcements.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Search, Plus, Pencil, Trash2, RotateCw, Pin, Megaphone, Building2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { LoadingDots } from "@/components/ui/loading-dots";

/* ─────────────── tipos ─────────────── */
export type AnnouncementScope = "master" | "workspace";

type Props = {
  /** Quando true mostra botões adicionar/editar/apagar */
  canManage: boolean;
  /** master = avisos oficiais do sistema ; workspace = avisos internos da empresa */
  scope?: AnnouncementScope;
};

const SCOPE_FNS = {
  master: {
    list: listAnnouncements,
    create: createAnnouncement,
    update: updateAnnouncement,
    remove: deleteAnnouncement,
    badge: { icon: Megaphone, label: "Oficiais do sistema", className: "bg-primary/10 text-primary" },
    queryKey: "announcements-master",
  },
  workspace: {
    list: listWorkspaceAnnouncements,
    create: createWorkspaceAnnouncement,
    update: updateWorkspaceAnnouncement,
    remove: deleteWorkspaceAnnouncement,
    badge: { icon: Building2, label: "Da sua empresa", className: "bg-emerald-500/10 text-emerald-500" },
    queryKey: "announcements-workspace",
  },
} as const;

type TypeMeta = { id: AnnouncementType; label: string; dot: string };
const TYPES: TypeMeta[] = [
  { id: "novidade",     label: "Novidade",     dot: "bg-emerald-500" },
  { id: "informativo",  label: "Informativo",  dot: "bg-blue-500" },
  { id: "manutencao",   label: "Manutenção",   dot: "bg-amber-500" },
  { id: "atualizacao",  label: "Atualização",  dot: "bg-cyan-500" },
  { id: "correcao",     label: "Correção",     dot: "bg-indigo-500" },
  { id: "aviso",        label: "Aviso",        dot: "bg-red-500" },
  { id: "lembrete",     label: "Lembrete",     dot: "bg-pink-500" },
];

const TYPE_BY_ID = Object.fromEntries(TYPES.map((t) => [t.id, t])) as Record<AnnouncementType, TypeMeta>;

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

/* ─────────────── componente principal ─────────────── */
export function AnnouncementsPanel({ canManage, scope = "master" }: Props) {
  const qc = useQueryClient();
  const fns = SCOPE_FNS[scope];
  const BadgeIcon = fns.badge.icon;

  const [selectedType, setSelectedType] = useState<AnnouncementType | "all">("all");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<any | null>(null);
  const [open, setOpen] = useState(false);

  const listFn = useServerFn(fns.list);
  const listQ = useQuery({
    queryKey: [fns.queryKey, selectedType, search, canManage],
    queryFn: () =>
      listFn({
        data: {
          type: selectedType === "all" ? null : selectedType,
          search: search || null,
          includeInactive: canManage,
        },
      }),
  });

  const items = listQ.data?.items ?? [];

  const counts = useMemo(() => {
    const map: Record<string, number> = { all: items.length };
    for (const t of TYPES) map[t.id] = 0;
    for (const it of items) map[it.type] = (map[it.type] ?? 0) + 1;
    return map;
  }, [items]);

  const delFn = useServerFn(fns.remove);
  const delMut = useMutation({
    mutationFn: (id: string) => delFn({ data: { id } }),
    onSuccess: () => {
      toast.success("Aviso removido");
      qc.invalidateQueries({ queryKey: [fns.queryKey] });
    },
    onError: (e: any) => toast.error(e.message || "Não consegui remover."),
  });

  return (
    <div className="flex h-full flex-col gap-4 p-4 md:p-6">
      <div className="grid flex-1 grid-cols-1 gap-4 md:grid-cols-[220px_1fr] min-h-0">
        {/* SIDEBAR de tipos */}
        <aside className="flex flex-col gap-3 rounded-lg border bg-card/40 p-3">
          {canManage ? (
            <Button className="w-full" onClick={() => { setEditing(null); setOpen(true); }}>
              <Plus className="mr-2 h-4 w-4" /> Adicionar
            </Button>
          ) : (
            <div className={cn("flex items-center gap-2 rounded-md px-3 py-2 text-sm", fns.badge.className)}>
              <BadgeIcon className="h-4 w-4" />
              {fns.badge.label}
            </div>
          )}

          <div className="px-1 pt-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Tipos
          </div>

          <nav className="space-y-0.5">
            <TypeButton
              label="Todos"
              dot=""
              count={counts.all}
              active={selectedType === "all"}
              onClick={() => setSelectedType("all")}
              icon
            />
            {TYPES.map((t) => (
              <TypeButton
                key={t.id}
                label={t.label}
                dot={t.dot}
                count={counts[t.id] ?? 0}
                active={selectedType === t.id}
                onClick={() => setSelectedType(t.id)}
              />
            ))}
          </nav>
        </aside>

        {/* LISTA */}
        <section className="flex min-h-0 flex-col rounded-lg border bg-card/40">
          {/* busca + atualizar */}
          <div className="flex items-center gap-2 border-b p-3">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar informativos"
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => listQ.refetch()}
              title="Atualizar"
            >
              <RotateCw className={cn("h-4 w-4", listQ.isFetching && "animate-spin")} />
            </Button>
          </div>

          {/* lista */}
          <ScrollArea className="flex-1">
            {listQ.isLoading && (
              <p className="p-10 text-center text-sm text-muted-foreground"><LoadingDots size="sm" label="Carregando" /></p>
            )}
            {!listQ.isLoading && items.length === 0 && (
              <div className="flex flex-col items-center justify-center gap-2 p-12 text-center text-muted-foreground">
                <Megaphone className="h-10 w-10 opacity-30" />
                <p className="text-sm">Nenhum aviso por aqui.</p>
                {canManage && (
                  <p className="text-xs">Clique em <strong>Adicionar</strong> pra publicar o primeiro.</p>
                )}
              </div>
            )}

            <ul className="divide-y">
              {items.map((it: any) => {
                const meta = TYPE_BY_ID[it.type as AnnouncementType] ?? TYPE_BY_ID.informativo;
                return (
                  <li
                    key={it.id}
                    className={cn(
                      "group flex items-start gap-3 px-4 py-3 transition hover:bg-accent/40",
                      !it.active && "opacity-60",
                    )}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        {it.pinned && <Pin className="h-3 w-3 text-amber-400" />}
                        {it.icon && <span className="text-base leading-none">{it.icon}</span>}
                        <p className="truncate font-semibold">{it.title}</p>
                        {!it.active && (
                          <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] uppercase text-muted-foreground">
                            inativo
                          </span>
                        )}
                      </div>
                      {it.body && (
                        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                          {it.body}
                        </p>
                      )}
                      {it.link_url && (
                        <a
                          href={it.link_url}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-1 inline-block text-xs text-primary hover:underline"
                        >
                          Abrir link
                        </a>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {canManage && (
                        <>
                          <Button
                            variant="ghost" size="icon"
                            onClick={() => { setEditing(it); setOpen(true); }}
                            title="Editar"
                            className="h-8 w-8"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" title="Apagar" className="h-8 w-8 text-destructive hover:text-destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Apagar aviso?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta ação não pode ser desfeita. O aviso some pra todos os clientes.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => delMut.mutate(it.id)}>
                                  Apagar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </>
                      )}
                      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <span className={cn("h-2 w-2 rounded-full", meta.dot)} />
                        {relativeDay(it.created_at)}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </ScrollArea>
        </section>
      </div>

      {canManage && (
        <AnnouncementDialog
          open={open}
          onOpenChange={setOpen}
          editing={editing}
          scope={scope}
          onSaved={() => qc.invalidateQueries({ queryKey: [fns.queryKey] })}
        />
      )}
    </div>
  );
}

/* ─────────────── botão de tipo na sidebar ─────────────── */
function TypeButton({
  label, dot, count, active, onClick, icon,
}: {
  label: string; dot: string; count: number; active: boolean; onClick: () => void; icon?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-sm transition",
        active ? "bg-primary/15 text-primary" : "text-foreground/80 hover:bg-accent",
      )}
    >
      <span className="flex items-center gap-2">
        {icon ? (
          <span className="text-[11px] font-bold">≡</span>
        ) : (
          <span className={cn("h-2 w-2 rounded-full", dot)} />
        )}
        {label}
      </span>
      {count > 0 && (
        <span className="rounded bg-muted px-1.5 text-[10px] font-bold text-muted-foreground">
          {count}
        </span>
      )}
    </button>
  );
}

/* ─────────────── diálogo criar/editar ─────────────── */
function AnnouncementDialog({
  open, onOpenChange, editing, onSaved, scope,
}: {
  open: boolean; onOpenChange: (v: boolean) => void; editing: any | null; onSaved: () => void; scope: AnnouncementScope;
}) {
  const fns = SCOPE_FNS[scope];
  const createFn = useServerFn(fns.create);
  const updateFn = useServerFn(fns.update);

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [type, setType] = useState<AnnouncementType>("informativo");
  const [icon, setIcon] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [active, setActive] = useState(true);
  const [pinned, setPinned] = useState(false);

  // resetar campos quando muda o item / abre o modal
  useMemo(() => {
    if (open) {
      setTitle(editing?.title ?? "");
      setBody(editing?.body ?? "");
      setType(editing?.type ?? "informativo");
      setIcon(editing?.icon ?? "");
      setLinkUrl(editing?.link_url ?? "");
      setActive(editing?.active ?? true);
      setPinned(editing?.pinned ?? false);
    }
  }, [open, editing]);

  const saveMut = useMutation({
    mutationFn: async () => {
      const payload = {
        title: title.trim(),
        body: body.trim() || null,
        type,
        icon: icon.trim() || null,
        link_url: linkUrl.trim() || null,
        active,
        pinned,
      };
      if (editing?.id) {
        return updateFn({ data: { id: editing.id, ...payload } });
      }
      return createFn({ data: payload });
    },
    onSuccess: () => {
      toast.success(editing?.id ? "Aviso atualizado" : "Aviso publicado");
      onSaved();
      onOpenChange(false);
    },
    onError: (e: any) => toast.error(e.message || "Não consegui salvar."),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-1rem)] sm:w-[95vw] max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editing?.id ? "Editar aviso" : "Novo aviso"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div className="grid grid-cols-[80px_1fr] gap-2">
            <div>
              <Label className="text-xs">Ícone</Label>
              <Input value={icon} onChange={(e) => setIcon(e.target.value)} placeholder="📢" maxLength={4} />
            </div>
            <div>
              <Label className="text-xs">Tipo</Label>
              <Select value={type} onValueChange={(v) => setType(v as AnnouncementType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TYPES.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      <span className="flex items-center gap-2">
                        <span className={cn("h-2 w-2 rounded-full", t.dot)} />
                        {t.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="text-xs">Título</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Canal de suporte atualizado" />
          </div>

          <div>
            <Label className="text-xs">Mensagem</Label>
            <Textarea value={body} onChange={(e) => setBody(e.target.value)} rows={4} placeholder="Conteúdo do aviso…" />
          </div>

          <div>
            <Label className="text-xs">Link (opcional)</Label>
            <Input value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="https://…" />
          </div>

          <div className="flex items-center gap-6 pt-1">
            <label className="flex items-center gap-2 text-sm">
              <Switch checked={active} onCheckedChange={setActive} />
              Ativo
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Switch checked={pinned} onCheckedChange={setPinned} />
              Fixar no topo
            </label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button
            disabled={!title.trim() || saveMut.isPending}
            onClick={() => saveMut.mutate()}
          >
            {editing?.id ? "Salvar alterações" : "Publicar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
