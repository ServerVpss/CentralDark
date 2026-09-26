import React, { useState } from "react";
import { 
  Activity, 
  Search, 
  Cpu, 
  Database, 
  HardDrive, 
  Globe, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldCheck,
  RefreshCcw,
  Clock,
  ArrowRight,
  MonitorPlay,
  Zap,
  Radio,
  Server
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";

// --- Mock Data ---
const CHART_DATA = [
  { time: "00:00", cpu: 12, ram: 45, latency: 42 },
  { time: "04:00", cpu: 8, ram: 44, latency: 38 },
  { time: "08:00", cpu: 45, ram: 52, latency: 65 },
  { time: "12:00", cpu: 82, ram: 65, latency: 120 },
  { time: "16:00", cpu: 55, ram: 58, latency: 85 },
  { time: "20:00", cpu: 32, ram: 50, latency: 52 },
  { time: "23:59", cpu: 18, ram: 48, latency: 45 },
];

export default function AdminMonitoring() {
  const [activeTab, setActiveTab] = useState<"cluster" | "database" | "api">("cluster");

  return (
    <div className="flex-1 p-4 md:p-8 space-y-6 animate-in fade-in duration-500 overflow-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <MonitorPlay className="w-8 h-8 text-primary" />
            Saúde do Sistema
          </h1>
          <p className="text-muted-foreground mt-1">Status em tempo real de hardware, serviços e conectividade global.</p>
        </div>
        <div className="flex gap-2">
           <Badge className="bg-green-500/10 text-green-500 border-green-500/20 px-3 py-1 gap-1.5 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> CLUSTER: HEALTHY
           </Badge>
           <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl" onClick={() => toast.success("Métricas atualizadas")}>
              <RefreshCcw className="w-4 h-4" />
           </Button>
        </div>
      </div>

      {/* Main Grid: Hardware Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-card/40 border border-border rounded-2xl backdrop-blur-md space-y-4">
           <div className="flex justify-between items-center text-muted-foreground uppercase text-[10px] font-bold tracking-widest">
              <span className="flex items-center gap-2"><Cpu className="w-3.5 h-3.5" /> CPU Usage</span>
              <span className="text-foreground">32%</span>
           </div>
           <Progress value={32} className="h-2 bg-primary/10" />
           <div className="flex justify-between text-[10px] font-mono text-muted-foreground/60">
              <span>8 Cores / 16 Threads</span>
              <span>Temp: 48°C</span>
           </div>
        </div>

        <div className="p-6 bg-card/40 border border-border rounded-2xl backdrop-blur-md space-y-4">
           <div className="flex justify-between items-center text-muted-foreground uppercase text-[10px] font-bold tracking-widest">
              <span className="flex items-center gap-2"><Database className="w-3.5 h-3.5" /> Memory (RAM)</span>
              <span className="text-foreground">4.8 GB / 16 GB</span>
           </div>
           <Progress value={30} className="h-2 bg-primary/10" />
           <div className="flex justify-between text-[10px] font-mono text-muted-foreground/60">
              <span>Swap: 256 MB used</span>
              <span>Available: 11.2 GB</span>
           </div>
        </div>

        <div className="p-6 bg-card/40 border border-border rounded-2xl backdrop-blur-md space-y-4">
           <div className="flex justify-between items-center text-muted-foreground uppercase text-[10px] font-bold tracking-widest">
              <span className="flex items-center gap-2"><HardDrive className="w-3.5 h-3.5" /> Disk (NVMe)</span>
              <span className="text-foreground">820 GB / 2 TB</span>
           </div>
           <Progress value={41} className="h-2 bg-primary/10" />
           <div className="flex justify-between text-[10px] font-mono text-muted-foreground/60">
              <span>Read: 2.1 GB/s</span>
              <span>Write: 1.8 GB/s</span>
           </div>
        </div>
      </div>

      {/* Chart: Latency & Througput */}
      <div className="bg-card/40 border border-border rounded-2xl backdrop-blur-md overflow-hidden p-6 space-y-6">
        <div className="flex items-center justify-between">
           <h3 className="font-bold flex items-center gap-2 uppercase text-xs tracking-widest">
             <Radio className="w-4 h-4 text-primary" /> Latência de Rede & Tráfego (24h)
           </h3>
           <div className="flex gap-4">
             <div className="flex items-center gap-2 text-[10px] font-mono uppercase">
                <div className="w-3 h-3 rounded bg-primary/50" /> Latency (ms)
             </div>
             <div className="flex items-center gap-2 text-[10px] font-mono uppercase">
                <div className="w-3 h-3 rounded bg-blue-500/50" /> Throughput (req/s)
             </div>
           </div>
        </div>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={CHART_DATA} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorRam" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <Tooltip 
                contentStyle={{ background: "#000", border: "1px solid hsl(var(--primary)/0.2)", borderRadius: "8px", fontSize: "12px" }}
                itemStyle={{ fontWeight: "bold" }}
              />
              <Area type="monotone" dataKey="latency" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorCpu)" />
              <Area type="monotone" dataKey="cpu" stroke="#3b82f6" fillOpacity={1} fill="url(#colorRam)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Services Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { name: "Node.js API", status: "online", uptime: "15d 4h", port: 5000 },
          { name: "WuzAPI Engine (Go)", status: "online", uptime: "15d 4h", port: 3001 },
          { name: "PostgreSQL (Supabase)", status: "online", uptime: "99.99%", port: 5432 },
          { name: "Redis Cache", status: "online", uptime: "152d", port: 6379 },
          { name: "Socket.io Server", status: "online", uptime: "2d 12h", port: 5000 },
          { name: "Nginx Gateway", status: "online", uptime: "300d", port: 80 },
          { name: "Backup Worker", status: "idle", uptime: "Last run 1h ago", port: "N/A" },
          { name: "Log Aggregator", status: "online", uptime: "15d 4h", port: 5044 },
        ].map((service, i) => (
          <div key={i} className="p-4 bg-card/40 border border-border rounded-xl flex items-start gap-4">
             <div className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${service.status === 'online' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-orange-500 animate-pulse'}`} />
             <div className="space-y-1">
                <p className="text-sm font-bold">{service.name}</p>
                <div className="flex flex-col text-[10px] font-mono text-muted-foreground uppercase">
                   <span>Status: {service.status}</span>
                   <span>Uptime: {service.uptime}</span>
                   <span>Port: {service.port}</span>
                </div>
             </div>
          </div>
        ))}
      </div>

      {/* Footer Info */}
      <div className="p-4 bg-primary/5 border border-primary/20 rounded-2xl flex items-center gap-4">
         <Zap className="w-5 h-5 text-primary animate-bounce" />
         <p className="text-xs text-muted-foreground leading-relaxed">
            Monitoramento via Prometheus & Grafana Exporter ativo. Alertas críticos são disparados automaticamente via Webhook de Emergência para a equipe Root.
         </p>
      </div>
    </div>
  );
}
