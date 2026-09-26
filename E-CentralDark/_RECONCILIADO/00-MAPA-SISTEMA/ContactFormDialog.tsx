// Modal Adicionar / Editar Contato — réplica visual da tela do Underchat
// (campos: Nome, Sobrenome, Apelido, Aniversário, Email, DDI, Telefone,
//  Tipo de Documento, Atendente responsável, Ignorar, Etiqueta, Canais, Notas)
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { User as UserIcon } from "lucide-react";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createContact,
  updateContact,
  listWorkspaceAgents,
  listWorkspaceChannels,
} from "@/lib/contacts.functions";

type ContactRow = {
  id: string;
  name: string | null;
  last_name: string | null;
  nickname: string | null;
  birthday: string | null;
  ddi: string | null;
  phone: string | null;
  email: string | null;
  label: string | null;
  status: string;
  assignee_id: string | null;
  ignored: boolean;
  channel_ids: string[];
  document_type: string | null;
  notes: string | null;
  avatar_url: string | null;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contact?: ContactRow | null;
  onSaved?: () => void;
};

const DDI_OPTIONS = [
  { label: "Brasil (+55)", value: "+55" },
  { label: "EUA/Canadá (+1)", value: "+1" },
  { label: "Portugal (+351)", value: "+351" },
  { label: "Argentina (+54)", value: "+54" },
  { label: "Chile (+56)", value: "+56" },
  { label: "Espanha (+34)", value: "+34" },
  { label: "México (+52)", value: "+52" },
];

const DOC_TYPES = [
  { label: "CPF", value: "cpf" },
  { label: "CNPJ", value: "cnpj" },
  { label: "RG", value: "rg" },
  { label: "Passaporte", value: "passport" },
];

export function ContactFormDialog({ open, onOpenChange, contact, onSaved }: Props) {
  const isEdit = !!contact;
  const qc = useQueryClient();
  const createFn = useServerFn(createContact);
  const updateFn = useServerFn(updateContact);
  const agentsFn = useServerFn(listWorkspaceAgents);
  const channelsFn = useServerFn(listWorkspaceChannels);

  const { data: agents = [] } = useQuery({
    queryKey: ["workspace-agents"],
    queryFn: () => agentsFn(),
    enabled: open,
  });
  const { data: channels = [] } = useQuery({
    queryKey: ["workspace-channels"],
    queryFn: () => channelsFn(),
    enabled: open,
  });

  const [form, setForm] = useState({
    name: "",
    last_name: "",
    nickname: "",
    birthday: "",
    email: "",
    ddi: "+55",
    phone: "",
    document_type: "",
    assignee_id: "",
    ignored: "no" as "yes" | "no",
    label: "",
    channel_ids: [] as string[],
    notes: "",
  });

  useEffect(() => {
    if (!open) return;
    if (contact) {
      setForm({
        name: contact.name ?? "",
        last_name: contact.last_name ?? "",
        nickname: contact.nickname ?? "",
        birthday: contact.birthday ?? "",
        email: contact.email ?? "",
        ddi: contact.ddi ?? "+55",
        // mostra o telefone sem o DDI no input
        phone: contact.phone?.replace(new RegExp(`^\\${contact.ddi ?? "+55"}`), "") ?? "",
        document_type: contact.document_type ?? "",
        assignee_id: contact.assignee_id ?? "",
        ignored: contact.ignored ? "yes" : "no",
        label: contact.label ?? "",
        channel_ids: contact.channel_ids ?? [],
        notes: contact.notes ?? "",
      });
    } else {
      setForm({
        name: "",
        last_name: "",
        nickname: "",
        birthday: "",
        email: "",
        ddi: "+55",
        phone: "",
        document_type: "",
        assignee_id: "",
        ignored: "no",
        label: "",
        channel_ids: [],
        notes: "",
      });
    }
  }, [open, contact]);

  const mutation = useMutation({
    mutationFn: async () => {
      const payload = {
        name: form.name || null,
        last_name: form.last_name || null,
        nickname: form.nickname || null,
        birthday: form.birthday || null,
        email: form.email || null,
        ddi: form.ddi || "+55",
        phone: form.phone || null,
        document_type: form.document_type || null,
        assignee_id: form.assignee_id || null,
        ignored: form.ignored === "yes",
        label: form.label || null,
        channel_ids: form.channel_ids,
        notes: form.notes || null,
      };
      if (isEdit && contact) {
        return updateFn({ data: { ...payload, id: contact.id } });
      }
      return createFn({ data: payload });
    },
    onSuccess: () => {
      toast.success(isEdit ? "Contato atualizado" : "Contato criado");
      qc.invalidateQueries({ queryKey: ["app-contacts"] });
      onSaved?.();
      onOpenChange(false);
    },
    onError: (e: unknown) => {
      toast.error(e instanceof Error ? e.message : "Erro ao salvar");
    },
  });

  const toggleChannel = (id: string) => {
    setForm((f) => ({
      ...f,
      channel_ids: f.channel_ids.includes(id)
        ? f.channel_ids.filter((c) => c !== id)
        : [...f.channel_ids, id],
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>{isEdit ? "Editar Contato" : "Adicionar Contato"}</DialogTitle>
            {isEdit && (
              <Badge variant="secondary" className="bg-emerald-500/15 text-emerald-500">
                Validado
              </Badge>
            )}
          </div>
        </DialogHeader>

        <div className="flex justify-center pb-2">
          <Avatar className="h-24 w-24">
            {contact?.avatar_url ? <AvatarImage src={contact.avatar_url} /> : null}
            <AvatarFallback className="bg-muted">
              <UserIcon className="h-10 w-10 text-muted-foreground" />
            </AvatarFallback>
          </Avatar>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Nome:">
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>
          <Field label="Sobrenome:">
            <Input
              placeholder="Sobrenome"
              value={form.last_name}
              onChange={(e) => setForm({ ...form, last_name: e.target.value })}
            />
          </Field>
          <Field label="Apelido:">
            <Input
              placeholder="Apelido"
              value={form.nickname}
              onChange={(e) => setForm({ ...form, nickname: e.target.value })}
            />
          </Field>
          <Field label="Aniversário:">
            <Input
              type="date"
              value={form.birthday}
              onChange={(e) => setForm({ ...form, birthday: e.target.value })}
            />
          </Field>
          <Field label="Email:" className="sm:col-span-2">
            <Input
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </Field>
          <Field label="DDI:">
            <Select value={form.ddi} onValueChange={(v) => setForm({ ...form, ddi: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {DDI_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Telefone:">
            <Input
              placeholder="Telefone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </Field>
          <Field label="Tipo de Documento:" className="sm:col-span-2">
            <Select
              value={form.document_type}
              onValueChange={(v) => setForm({ ...form, document_type: v })}
            >
              <SelectTrigger><SelectValue placeholder="Tipo de Documento" /></SelectTrigger>
              <SelectContent>
                {DOC_TYPES.map((d) => (
                  <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Atendente responsável:">
            <Select
              value={form.assignee_id || "__none__"}
              onValueChange={(v) => setForm({ ...form, assignee_id: v === "__none__" ? "" : v })}
            >
              <SelectTrigger><SelectValue placeholder="Selecione o atendente responsável" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">— Nenhum —</SelectItem>
                {agents.map((a) => (
                  <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Ignorar:">
            <Select
              value={form.ignored}
              onValueChange={(v) => setForm({ ...form, ignored: v as "yes" | "no" })}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="no">Não ignorar</SelectItem>
                <SelectItem value="yes">Ignorar</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Etiqueta:">
            <Input
              placeholder="Selecione a etiqueta"
              value={form.label}
              onChange={(e) => setForm({ ...form, label: e.target.value })}
            />
          </Field>
          <Field label="Canais:">
            <div className="flex min-h-10 flex-wrap items-center gap-1 rounded-md border bg-background px-2 py-1.5">
              {form.channel_ids.length === 0 && (
                <span className="text-sm text-muted-foreground">Selecione os canais</span>
              )}
              {channels
                .filter((c) => form.channel_ids.includes(c.id))
                .map((c) => (
                  <Badge key={c.id} variant="secondary" className="gap-1">
                    {c.name}
                    <button
                      type="button"
                      className="ml-1 text-xs"
                      onClick={() => toggleChannel(c.id)}
                    >
                      ×
                    </button>
                  </Badge>
                ))}
            </div>
            {channels.length > 0 && (
              <div className="mt-1 flex flex-wrap gap-1">
                {channels
                  .filter((c) => !form.channel_ids.includes(c.id))
                  .map((c) => (
                    <Badge
                      key={c.id}
                      variant="outline"
                      className="cursor-pointer"
                      onClick={() => toggleChannel(c.id)}
                    >
                      + {c.name}
                    </Badge>
                  ))}
              </div>
            )}
          </Field>
          <Field label="Notas:" className="sm:col-span-2">
            <Textarea
              rows={3}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </Field>
        </div>

        <div className="mt-2 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>
            {mutation.isPending ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <Label className="mb-1 block text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
