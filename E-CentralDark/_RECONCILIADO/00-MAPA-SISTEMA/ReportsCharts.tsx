import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { reportTickets, reportSatisfaction, searchTicketHistory } from "@/lib/reports.functions";
import { formatDateTimeBR } from "@/lib/datetime";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar, PieChart, Pie, Cell, Legend,
} from "recharts";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { LoadingDots } from "@/components/ui/loading-dots";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#ec4899"];

function Stat({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <Card className="p-4">
      <p className="text-xs uppercase text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
    </Card>
  );
}

export function TicketsReport({ scope }: { scope: "workspace" | "admin" }) {
  const [days, setDays] = useState(14);
  const fn = useServerFn(reportTickets);
  const { data, isLoading } = useQuery({
    queryKey: ["report-tickets", scope, days],
    queryFn: () => fn({ data: { scope, days } }),
    refetchInterval: 60_000,
  });

  if (isLoading || !data) return <div className="p-8 text-muted-foreground"><LoadingDots size="sm" label="Carregando" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Atendimentos</h1>
        <Select value={String(days)} onValueChange={(v) => setDays(Number(v))}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Últimos 7 dias</SelectItem>
            <SelectItem value="14">Últimos 14 dias</SelectItem>
            <SelectItem value="30">Últimos 30 dias</SelectItem>
            <SelectItem value="60">Últimos 60 dias</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="Total no período" value={data.total} />
        <Stat label="Em aberto" value={data.open} />
        <Stat label="Resolvidos" value={data.resolved} />
        <Stat label="Fechados" value={data.closed} />
      </div>

      <Card className="p-4">
        <h3 className="font-semibold mb-3">Atendimentos abertos por dia</h3>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={data.daily}>
            <defs>
              <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.6} />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
            <XAxis dataKey="day" tickFormatter={(v) => v.slice(5)} fontSize={11} />
            <YAxis allowDecimals={false} fontSize={11} />
            <Tooltip />
            <Area type="monotone" dataKey="value" stroke="#3b82f6" fill="url(#g1)" />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        <Card className="p-4">
          <h3 className="font-semibold mb-3">Por setor</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={data.bySector} dataKey="value" nameKey="name" outerRadius={90} label>
                {data.bySector.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip /><Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>
        <Card className="p-4">
          <h3 className="font-semibold mb-3">Por status</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data.byStatus}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="name" fontSize={11} /><YAxis allowDecimals={false} fontSize={11} />
              <Tooltip />
              <Bar dataKey="value" fill="#10b981" radius={[6,6,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <div className="p-4 border-b"><h3 className="font-semibold">Performance por atendente</h3></div>
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-2 text-left">Atendente</th>
              <th className="px-4 py-2 text-right">Tickets</th>
              <th className="px-4 py-2 text-right">Mensagens</th>
              <th className="px-4 py-2 text-right">1ª resposta (min)</th>
            </tr>
          </thead>
          <tbody>
            {data.agents.map((a) => (
              <tr key={a.user_id} className="border-t">
                <td className="px-4 py-2 font-medium">{a.name}</td>
                <td className="px-4 py-2 text-right">{a.tickets}</td>
                <td className="px-4 py-2 text-right">{a.messages}</td>
                <td className="px-4 py-2 text-right">{a.avg_first_response_min || "—"}</td>
              </tr>
            ))}
            {!data.agents.length && <tr><td colSpan={4} className="p-6 text-center text-muted-foreground">Sem dados.</td></tr>}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

export function SatisfactionReport({ scope }: { scope: "workspace" | "admin" }) {
  const [days, setDays] = useState(30);
  const fn = useServerFn(reportSatisfaction);
  const { data, isLoading } = useQuery({
    queryKey: ["report-satisfaction", scope, days],
    queryFn: () => fn({ data: { scope, days } }),
    refetchInterval: 60_000,
  });

  if (isLoading || !data) return <div className="p-8 text-muted-foreground"><LoadingDots size="sm" label="Carregando" /></div>;

  const npsColor = data.nps >= 50 ? "text-emerald-600" : data.nps >= 0 ? "text-amber-600" : "text-red-600";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Satisfação dos Clientes</h1>
        <Select value={String(days)} onValueChange={(v) => setDays(Number(v))}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="7">7 dias</SelectItem>
            <SelectItem value="30">30 dias</SelectItem>
            <SelectItem value="90">90 dias</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Stat label="Avaliações" value={data.total} />
        <Card className="p-4">
          <p className="text-xs uppercase text-muted-foreground">NPS</p>
          <p className={`mt-1 text-2xl font-bold ${npsColor}`}>{data.nps}</p>
        </Card>
        <Stat label="Média" value={data.avg.toFixed(2)} />
        <Stat label="Promotores" value={data.promoters} sub="nota 9-10" />
        <Stat label="Detratores" value={data.detractors} sub="nota 0-6" />
      </div>

      <Card className="p-4">
        <h3 className="font-semibold mb-3">Média diária</h3>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={data.daily}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
            <XAxis dataKey="day" tickFormatter={(v) => v.slice(5)} fontSize={11} />
            <YAxis domain={[0, 10]} fontSize={11} />
            <Tooltip />
            <Area type="monotone" dataKey="value" stroke="#10b981" fill="#10b98155" />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      <Card className="overflow-hidden">
        <div className="p-4 border-b"><h3 className="font-semibold">Comentários recentes</h3></div>
        <ul className="divide-y">
          {data.recent.map((r, i) => (
            <li key={i} className="p-4 flex gap-3 items-start">
              <Badge variant={r.rating >= 9 ? "default" : r.rating <= 6 ? "destructive" : "secondary"}>
                {r.rating}
              </Badge>
              <div className="flex-1 text-sm">
                <p>{r.comment ?? <span className="text-muted-foreground italic">Sem comentário</span>}</p>
                <p className="text-xs text-muted-foreground mt-1">{formatDateTimeBR(r.created_at)}</p>
              </div>
            </li>
          ))}
          {!data.recent.length && <li className="p-6 text-center text-muted-foreground">Sem avaliações.</li>}
        </ul>
      </Card>
    </div>
  );
}

export function HistoryReport({ scope }: { scope: "workspace" | "admin" }) {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("");
  const [days, setDays] = useState(30);
  const fn = useServerFn(searchTicketHistory);
  const { data = [], isLoading } = useQuery({
    queryKey: ["history", scope, q, status, days],
    queryFn: () => fn({ data: { scope, q: q || undefined, status: status || undefined, days } }),
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Histórico de Conversas</h1>
      <Card className="p-3 flex flex-wrap gap-2 items-center">
        <Input className="max-w-xs" placeholder="Buscar trecho..." value={q} onChange={(e) => setQ(e.target.value)} />
        <Select value={status || "all"} onValueChange={(v) => setStatus(v === "all" ? "" : v)}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="open">Em aberto</SelectItem>
            <SelectItem value="pending">Pendente</SelectItem>
            <SelectItem value="resolved">Resolvido</SelectItem>
            <SelectItem value="closed">Fechado</SelectItem>
          </SelectContent>
        </Select>
        <Select value={String(days)} onValueChange={(v) => setDays(Number(v))}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="7">7 dias</SelectItem>
            <SelectItem value="30">30 dias</SelectItem>
            <SelectItem value="90">90 dias</SelectItem>
            <SelectItem value="180">180 dias</SelectItem>
          </SelectContent>
        </Select>
      </Card>
      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-2 text-left">Contato</th>
              <th className="px-4 py-2 text-left">Última mensagem</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-right">Quando</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={4} className="p-6 text-center text-muted-foreground">Buscando…</td></tr>}
            {!isLoading && data.map((t) => (
              <tr key={t.id} className="border-t">
                <td className="px-4 py-2">
                  <div className="font-medium">{t.contact_name ?? "—"}</div>
                  <div className="text-xs text-muted-foreground">{t.contact_phone ?? ""}</div>
                </td>
                <td className="px-4 py-2 text-muted-foreground line-clamp-1">{t.last_message_preview ?? "—"}</td>
                <td className="px-4 py-2"><Badge variant="secondary">{t.status}</Badge></td>
                <td className="px-4 py-2 text-right text-xs text-muted-foreground">
                  {t.last_message_at ? formatDateTimeBR(t.last_message_at) : "—"}
                </td>
              </tr>
            ))}
            {!isLoading && !data.length && <tr><td colSpan={4} className="p-6 text-center text-muted-foreground">Nenhuma conversa.</td></tr>}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
