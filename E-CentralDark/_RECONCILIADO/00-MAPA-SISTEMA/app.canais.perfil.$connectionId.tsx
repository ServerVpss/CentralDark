import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState, useEffect, useRef } from "react";
import { formatDateBR } from "@/lib/datetime";
import {
  User, Clock, CalendarDays, MessageSquare, ArrowLeft, Upload, Trash2, Plus, Save,
} from "lucide-react";
import { PageScaffold } from "@/components/page-scaffold";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { friendlyError } from "@/lib/friendly-error";
import {
  getWhatsAppProfile, updateWhatsAppProfile, uploadWhatsAppProfilePhoto,
  getBusinessHours, saveBusinessHours,
  getHolidays, addHoliday, removeHoliday,
  getAutoMessages, saveAutoMessages,
} from "@/lib/whatsapp-profile.functions";
import { LoadingDots } from "@/components/ui/loading-dots";

export const Route = createFileRoute("/app/canais/perfil/$connectionId")({
  component: Page,
});

const VERTICALS: Array<{ value: string; label: string }> = [
  { value: "UNDEFINED", label: "Não definido" },
  { value: "AUTO", label: "Automotivo" },
  { value: "BEAUTY", label: "Beleza & Bem-estar" },
  { value: "APPAREL", label: "Moda & Roupas" },
  { value: "EDU", label: "Educação" },
  { value: "ENTERTAIN", label: "Entretenimento" },
  { value: "EVENT_PLAN", label: "Eventos" },
  { value: "FINANCE", label: "Financeiro" },
  { value: "GROCERY", label: "Mercado" },
  { value: "GOVT", label: "Governo" },
  { value: "HOTEL", label: "Hotelaria" },
  { value: "HEALTH", label: "Saúde" },
  { value: "NONPROFIT", label: "ONG" },
  { value: "PROF_SERVICES", label: "Serviços profissionais" },
  { value: "RETAIL", label: "Varejo" },
  { value: "TRAVEL", label: "Turismo" },
  { value: "RESTAURANT", label: "Restaurante" },
  { value: "OTHER", label: "Outro" },
];

const DAYS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

function Page() {
  const { connectionId } = useParams({ from: "/app/canais/perfil/$connectionId" });

  return (
    <PageScaffold
      title="Perfil do WhatsApp"
      description="Foto, nome, horário e mensagens automáticas desta conexão."
      icon={User}
      adminHref={`/admin/whatsapp/perfil/${connectionId}`}
    >
      <div className="mb-4">
        <Button asChild variant="outline" size="sm">
          <Link to="/app/canais"><ArrowLeft className="h-4 w-4 mr-2" />Voltar para canais</Link>
        </Button>
      </div>
      <Tabs defaultValue="perfil" className="w-full">

        <TabsList>
          <TabsTrigger value="perfil"><User className="h-4 w-4 mr-2" />Perfil</TabsTrigger>
          <TabsTrigger value="horario"><Clock className="h-4 w-4 mr-2" />Horário</TabsTrigger>
          <TabsTrigger value="feriados"><CalendarDays className="h-4 w-4 mr-2" />Feriados</TabsTrigger>
          <TabsTrigger value="mensagens"><MessageSquare className="h-4 w-4 mr-2" />Mensagens</TabsTrigger>
        </TabsList>

        <TabsContent value="perfil" className="mt-4">
          <ProfileTab connectionId={connectionId} />
        </TabsContent>
        <TabsContent value="horario" className="mt-4">
          <BusinessHoursTab connectionId={connectionId} />
        </TabsContent>
        <TabsContent value="feriados" className="mt-4">
          <HolidaysTab connectionId={connectionId} />
        </TabsContent>
        <TabsContent value="mensagens" className="mt-4">
          <AutoMessagesTab connectionId={connectionId} />
        </TabsContent>
      </Tabs>
    </PageScaffold>
  );
}

// ----- Aba Perfil -----
function ProfileTab({ connectionId }: { connectionId: string }) {
  const fetchFn = useServerFn(getWhatsAppProfile);
  const updateFn = useServerFn(updateWhatsAppProfile);
  const uploadFn = useServerFn(uploadWhatsAppProfilePhoto);
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["wa-profile", connectionId],
    queryFn: () => fetchFn({ data: { connectionId } }),
  });

  const [form, setForm] = useState({
    about: "", description: "", address: "", email: "",
    vertical: "UNDEFINED", website: "",
  });

  useEffect(() => {
    if (data) {
      setForm({
        about: data.about, description: data.description,
        address: data.address, email: data.email,
        vertical: data.vertical || "UNDEFINED",
        website: data.websites?.[0] ?? "",
      });
    }
  }, [data]);

  const updateMut = useMutation({
    mutationFn: () => updateFn({ data: {
      connectionId,
      about: form.about, description: form.description,
      address: form.address, email: form.email || undefined,
      vertical: form.vertical as never,
      websites: form.website ? [form.website] : [],
    } }),
    onSuccess: () => {
      toast.success("Perfil atualizado na Meta.");
      qc.invalidateQueries({ queryKey: ["wa-profile", connectionId] });
    },
    onError: (e: Error) => toast.error(friendlyError(e)),
  });

  const uploadMut = useMutation({
    mutationFn: async (file: File) => {
      const buf = await file.arrayBuffer();
      const b64 = btoa(String.fromCharCode(...new Uint8Array(buf)));
      return uploadFn({ data: {
        connectionId, fileBase64: b64,
        mimeType: file.type as "image/jpeg" | "image/png",
        fileSize: file.size,
      } });
    },
    onSuccess: () => {
      toast.success("Foto atualizada. Pode levar alguns minutos pra aparecer.");
      qc.invalidateQueries({ queryKey: ["wa-profile", connectionId] });
    },
    onError: (e: Error) => toast.error(friendlyError(e)),
  });

  if (isLoading) return <Card><CardContent className="py-12 text-center text-muted-foreground"><LoadingDots size="md" label="Carregando" /></CardContent></Card>;
  if (error) return <Card><CardContent className="py-6 text-destructive">{(error as Error).message}</CardContent></Card>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Como sua empresa aparece no WhatsApp</CardTitle>
        <CardDescription>Essas informações são salvas direto na Meta.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-4">
          {data?.photoUrl
            ? <img src={data.photoUrl} alt="Foto" className="h-20 w-20 rounded-full object-cover border" />
            : <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center text-2xl"><User /></div>}
          <div className="flex flex-col gap-2">
            <div className="font-semibold">{data?.displayName}</div>
            <div className="text-sm text-muted-foreground">{data?.displayPhone}</div>
            <input
              ref={fileRef} type="file" accept="image/jpeg,image/png" className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) uploadMut.mutate(f); }}
            />
            <Button size="sm" variant="outline" disabled={uploadMut.isPending}
              onClick={() => fileRef.current?.click()}>
              <Upload className="h-4 w-4 mr-2" />
              {uploadMut.isPending ? "Enviando…" : "Trocar foto"}
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <Label>Recado curto (about) — até 139 caracteres</Label>
            <Input value={form.about} maxLength={139} onChange={e => setForm({ ...form, about: e.target.value })} />
          </div>
          <div className="space-y-1">
            <Label>Categoria</Label>
            <Select value={form.vertical} onValueChange={v => setForm({ ...form, vertical: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{VERTICALS.map(v => <SelectItem key={v.value} value={v.value}>{v.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1 md:col-span-2">
            <Label>Descrição da empresa</Label>
            <Textarea rows={3} maxLength={512} value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="space-y-1">
            <Label>E-mail</Label>
            <Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="space-y-1">
            <Label>Site</Label>
            <Input type="url" placeholder="https://…" value={form.website}
              onChange={e => setForm({ ...form, website: e.target.value })} />
          </div>
          <div className="space-y-1 md:col-span-2">
            <Label>Endereço</Label>
            <Input value={form.address} maxLength={256} onChange={e => setForm({ ...form, address: e.target.value })} />
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={() => updateMut.mutate()} disabled={updateMut.isPending}>
            <Save className="h-4 w-4 mr-2" />
            {updateMut.isPending ? "Salvando…" : "Atualizar"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ----- Aba Horário -----
function BusinessHoursTab({ connectionId }: { connectionId: string }) {
  const fetchFn = useServerFn(getBusinessHours);
  const saveFn = useServerFn(saveBusinessHours);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["wa-hours", connectionId],
    queryFn: () => fetchFn({ data: { connectionId } }),
  });

  const [hours, setHours] = useState<Array<{ weekday: number; start_time: string; end_time: string; enabled: boolean }>>([]);

  useEffect(() => {
    const fromDb = data?.hours ?? [];
    setHours(Array.from({ length: 7 }, (_, i) => {
      const existing = fromDb.find(h => h.weekday === i);
      return existing
        ? { weekday: i, start_time: existing.start_time.slice(0, 5), end_time: existing.end_time.slice(0, 5), enabled: existing.enabled }
        : { weekday: i, start_time: "09:00", end_time: "18:00", enabled: i >= 1 && i <= 5 };
    }));
  }, [data]);

  const mut = useMutation({
    mutationFn: () => saveFn({ data: { connectionId, hours } }),
    onSuccess: () => { toast.success("Horário salvo."); qc.invalidateQueries({ queryKey: ["wa-hours", connectionId] }); },
    onError: (e: Error) => toast.error(friendlyError(e)),
  });

  if (isLoading) return <Card><CardContent className="py-12 text-center text-muted-foreground"><LoadingDots size="md" label="Carregando" /></CardContent></Card>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Horário de atendimento</CardTitle>
        <CardDescription>Define quando sua equipe está disponível. Fora desse horário, a mensagem de ausente é disparada (se ativada).</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {hours.map((h, idx) => (
          <div key={h.weekday} className="flex items-center gap-3 py-2 border-b last:border-0">
            <Switch checked={h.enabled} onCheckedChange={c => {
              const copy = [...hours]; copy[idx] = { ...copy[idx], enabled: c }; setHours(copy);
            }} />
            <div className="w-24 font-medium">{DAYS[h.weekday]}</div>
            <Input type="time" value={h.start_time} disabled={!h.enabled} className="w-32"
              onChange={e => { const c = [...hours]; c[idx] = { ...c[idx], start_time: e.target.value }; setHours(c); }} />
            <span className="text-muted-foreground">até</span>
            <Input type="time" value={h.end_time} disabled={!h.enabled} className="w-32"
              onChange={e => { const c = [...hours]; c[idx] = { ...c[idx], end_time: e.target.value }; setHours(c); }} />
          </div>
        ))}
        <div className="flex justify-end pt-2">
          <Button onClick={() => mut.mutate()} disabled={mut.isPending}>
            <Save className="h-4 w-4 mr-2" />{mut.isPending ? "Salvando…" : "Salvar horário"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ----- Aba Feriados -----
function HolidaysTab({ connectionId }: { connectionId: string }) {
  const fetchFn = useServerFn(getHolidays);
  const addFn = useServerFn(addHoliday);
  const removeFn = useServerFn(removeHoliday);
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["wa-holidays", connectionId],
    queryFn: () => fetchFn({ data: { connectionId } }),
  });
  const [newDate, setNewDate] = useState("");
  const [newLabel, setNewLabel] = useState("");

  const addMut = useMutation({
    mutationFn: () => addFn({ data: { connectionId, date: newDate, label: newLabel || undefined } }),
    onSuccess: () => {
      toast.success("Feriado adicionado.");
      setNewDate(""); setNewLabel("");
      qc.invalidateQueries({ queryKey: ["wa-holidays", connectionId] });
    },
    onError: (e: Error) => toast.error(friendlyError(e)),
  });
  const removeMut = useMutation({
    mutationFn: (id: string) => removeFn({ data: { connectionId, holidayId: id } }),
    onSuccess: () => { toast.success("Feriado removido."); qc.invalidateQueries({ queryKey: ["wa-holidays", connectionId] }); },
  });

  if (isLoading) return <Card><CardContent className="py-12 text-center text-muted-foreground"><LoadingDots size="md" label="Carregando" /></CardContent></Card>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Feriados e datas fechadas</CardTitle>
        <CardDescription>Nessas datas o sistema dispara a mensagem de ausente o dia todo.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2 items-end">
          <div className="space-y-1">
            <Label>Data</Label>
            <Input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} className="w-44" />
          </div>
          <div className="space-y-1 flex-1 min-w-[160px]">
            <Label>Nome (opcional)</Label>
            <Input value={newLabel} onChange={e => setNewLabel(e.target.value)} placeholder="ex: Natal" />
          </div>
          <Button onClick={() => addMut.mutate()} disabled={!newDate || addMut.isPending}>
            <Plus className="h-4 w-4 mr-2" />Adicionar
          </Button>
        </div>

        <div className="border rounded-md divide-y">
          {data?.holidays.length === 0 && (
            <div className="p-6 text-center text-sm text-muted-foreground">Nenhum feriado cadastrado.</div>
          )}
          {data?.holidays.map(h => (
            <div key={h.id} className="flex items-center justify-between p-3">
              <div>
                <div className="font-medium">{formatDateBR(h.date + "T12:00:00")}</div>
                {h.label && <div className="text-sm text-muted-foreground">{h.label}</div>}
              </div>
              <Button size="icon" variant="ghost" onClick={() => removeMut.mutate(h.id)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ----- Aba Mensagens automáticas -----
function AutoMessagesTab({ connectionId }: { connectionId: string }) {
  const fetchFn = useServerFn(getAutoMessages);
  const saveFn = useServerFn(saveAutoMessages);
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["wa-auto", connectionId],
    queryFn: () => fetchFn({ data: { connectionId } }),
  });

  const [form, setForm] = useState({
    greeting_enabled: false, greeting_text: "",
    away_enabled: false, away_text: "",
    timezone: "America/Sao_Paulo",
  });

  useEffect(() => { if (data) setForm(data.config); }, [data]);

  const mut = useMutation({
    mutationFn: () => saveFn({ data: { connectionId, ...form } }),
    onSuccess: () => { toast.success("Mensagens automáticas salvas."); qc.invalidateQueries({ queryKey: ["wa-auto", connectionId] }); },
    onError: (e: Error) => toast.error(friendlyError(e)),
  });

  if (isLoading) return <Card><CardContent className="py-12 text-center text-muted-foreground"><LoadingDots size="md" label="Carregando" /></CardContent></Card>;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Saudação (1ª mensagem)</CardTitle>
              <CardDescription>Enviada quando um novo cliente abre conversa, dentro do horário de atendimento.</CardDescription>
            </div>
            <Switch checked={form.greeting_enabled} onCheckedChange={c => setForm({ ...form, greeting_enabled: c })} />
          </div>
        </CardHeader>
        <CardContent>
          <Textarea rows={3} maxLength={1024} value={form.greeting_text}
            onChange={e => setForm({ ...form, greeting_text: e.target.value })}
            disabled={!form.greeting_enabled} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Mensagem de ausente</CardTitle>
              <CardDescription>Enviada fora do horário de atendimento ou em feriado. Não repete mais de 1x por hora pro mesmo contato.</CardDescription>
            </div>
            <Switch checked={form.away_enabled} onCheckedChange={c => setForm({ ...form, away_enabled: c })} />
          </div>
        </CardHeader>
        <CardContent>
          <Textarea rows={3} maxLength={1024} value={form.away_text}
            onChange={e => setForm({ ...form, away_text: e.target.value })}
            disabled={!form.away_enabled} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Fuso horário</CardTitle>
          <CardDescription>Usado pra decidir se está dentro do horário de atendimento.</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={form.timezone} onValueChange={v => setForm({ ...form, timezone: v })}>
            <SelectTrigger className="max-w-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="America/Sao_Paulo">São Paulo / Brasília (GMT-3)</SelectItem>
              <SelectItem value="America/Manaus">Manaus (GMT-4)</SelectItem>
              <SelectItem value="America/Belem">Belém (GMT-3)</SelectItem>
              <SelectItem value="America/Fortaleza">Fortaleza (GMT-3)</SelectItem>
              <SelectItem value="America/Recife">Recife (GMT-3)</SelectItem>
              <SelectItem value="America/Noronha">Fernando de Noronha (GMT-2)</SelectItem>
              <SelectItem value="America/Rio_Branco">Rio Branco (GMT-5)</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={() => mut.mutate()} disabled={mut.isPending}>
          <Save className="h-4 w-4 mr-2" />{mut.isPending ? "Salvando…" : "Salvar mensagens"}
        </Button>
      </div>
    </div>
  );
}
