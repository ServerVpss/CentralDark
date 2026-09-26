import React, { useState } from "react";
import { 
  Activity, 
  Search, 
  Filter, 
  Download, 
  Trash2, 
  RefreshCcw, 
  AlertCircle, 
  CheckCircle2, 
  Info,
  Terminal,
  Clock,
  ArrowRight,
  Database,
  Shield
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { toast } from "sonner";

// --- Mock Data ---
const MOCK_LOGS = [
  { id: "1", action: "instance.connected", user: "Admin", entity: "Vendas PR", level: "info", time: "Há 2 min", ip: "192.168.1.42" },
  { id: "2", action: "campaign.started", user: "Carlos", entity: "Black Friday", level: "info", time: "Há 15 min", ip: "187.54.12.10" },
  { id: "3", action: "api.invalid_token", user: "N/A", entity: "Webhook", level: "error", time: "Há 1h", ip: "45.12.89.5" },
  { id: "4", action: "user.login", user: "Maria", entity: "Dashboard", level: "info", time: "Há 2h", ip: "192.168.1.15" },
  { id: "5", action: "message.failed", user: "Bot", entity: "+5511988887777", level: "warn", time: "Há 3h", ip: "127.0.0.1" },
  { id: "6", action: "settings.updated", user: "Admin", entity: "Workspace", level: "info", time: "Hoje 08:30", ip: "192.168.1.42" },
  { id: "7", action: "database.backup", user: "System", entity: "Snapshot v2.5", level: "success", time: "Hoje 00:00", ip: "internal" },
  { id: "8", action: "auth.brute_force", user: "Unknown", entity: "Login", level: "critical", time: "Ontem", ip: "89.23.11.4" },
];

export default function SystemLogs() {
  const [logs, setLogs] = useState(MOCK_LOGS);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLevel, setFilterLevel] = useState("all");

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.action.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.entity.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = filterLevel === "all" ? true : log.level === filterLevel;
    return matchesSearch && matchesLevel;
  });

  const clearLogs = () => {
    setLogs([]);
    toast.error("Todos os logs locais foram limpos");
  };

  const getLevelBadge = (level: string) => {
    switch (level) {
      case "info": return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">INFO</Badge>;
      case "success": return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">SUCCESS</Badge>;
      case "warn": return <Badge className="bg-orange-500/10 text-orange-500 border-orange-500/20">WARN</Badge>;
      case "error": return <Badge className="bg-red-500/10 text-red-500 border-red-500/20">ERROR</Badge>;
      case "critical": return <Badge className="bg-purple-500/10 text-purple-500 border-purple-500/20 animate-pulse">CRITICAL</Badge>;
      default: return null;
    }
  };

  return (
    <div className="flex-1 p-4 md:p-8 space-y-6 animate-in fade-in duration-500 h-[calc(100vh-64px)] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <Terminal className="w-8 h-8 text-primary" />
            Logs do Sistema
          </h1>
          <p className="text-muted-foreground mt-1">Auditoria em tempo real de todas as ações e eventos do workspace.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={() => toast.info("Exportando logs...")}>
            <Download className="w-4 h-4" /> Exportar CSV
          </Button>
          <Button variant="ghost" className="text-destructive hover:bg-destructive/10" onClick={clearLogs}>
            <Trash2 className="w-4 h-4 mr-2" /> Limpar Histórico
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 shrink-0">
        {[
          { label: "Eventos Hoje", value: "2.4k", icon: Activity, color: "text-blue-500" },
          { label: "Sucesso API", value: "99.2%", icon: CheckCircle2, color: "text-green-500" },
          { label: "Erros", value: "14", icon: AlertCircle, color: "text-red-500" },
          { label: "Segurança", value: "Ativa", icon: Shield, color: "text-primary" },
        ].map((stat, i) => (
          <div key={i} className="p-4 bg-card/40 border border-border rounded-xl flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase">{stat.label}</p>
              <h3 className="text-xl font-bold">{stat.value}</h3>
            </div>
            <stat.icon className={`w-5 h-5 ${stat.color}`} />
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 shrink-0">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Filtrar por ação, usuário ou IP..." 
            className="pl-9 bg-card/40 border-border"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <select 
            className="bg-card border border-border text-xs rounded-lg px-3 outline-none focus:ring-1 focus:ring-primary h-10"
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
          >
            <option value="all">Todos os Níveis</option>
            <option value="info">Info</option>
            <option value="success">Success</option>
            <option value="warn">Warn</option>
            <option value="error">Error</option>
            <option value="critical">Critical</option>
          </select>
          <Button variant="outline" className="h-10">
            <RefreshCcw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Logs Terminal Table */}
      <div className="flex-1 bg-[#0a0a0a] border border-border rounded-2xl overflow-hidden shadow-2xl flex flex-col">
        <div className="flex items-center gap-2 px-4 py-2 border-b border-border/50 bg-[#1a1a1a]">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
          </div>
          <span className="text-[10px] font-mono text-muted-foreground ml-2">root@wabot-console:~# journalctl -u wabot-server -f</span>
        </div>
        
        <div className="flex-1 overflow-auto custom-scrollbar">
          <Table>
            <TableHeader className="bg-muted/10 sticky top-0 z-10">
              <TableRow className="border-border/40">
                <TableHead className="w-[180px] font-mono text-[10px] uppercase">Timestamp</TableHead>
                <TableHead className="w-[120px] font-mono text-[10px] uppercase">Nível</TableHead>
                <TableHead className="font-mono text-[10px] uppercase">Ação</TableHead>
                <TableHead className="font-mono text-[10px] uppercase">Usuário</TableHead>
                <TableHead className="font-mono text-[10px] uppercase">Entidade/Alvo</TableHead>
                <TableHead className="w-[150px] font-mono text-[10px] uppercase text-right">IP</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence>
                {filteredLogs.map((log, i) => (
                  <motion.tr 
                    key={log.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className="border-border/20 hover:bg-white/[0.02] font-mono text-xs transition-colors"
                  >
                    <TableCell className="text-muted-foreground whitespace-nowrap">
                       <div className="flex items-center gap-2">
                          <Clock className="w-3 h-3 opacity-30" /> {log.time}
                       </div>
                    </TableCell>
                    <TableCell>{getLevelBadge(log.level)}</TableCell>
                    <TableCell className="font-bold text-primary/80 tracking-tight">
                       {log.action}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{log.user}</TableCell>
                    <TableCell>
                       <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[9px] border-border/50 bg-background/50">{log.entity}</Badge>
                       </div>
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground/60">{log.ip}</TableCell>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </TableBody>
          </Table>
          
          {filteredLogs.length === 0 && (
            <div className="py-20 text-center space-y-3 opacity-20">
               <Database className="w-12 h-12 mx-auto" />
               <p className="font-mono text-xs">Nenhum evento registrado no buffer.</p>
            </div>
          )}
        </div>
        
        {/* Terminal Footer */}
        <div className="px-4 py-2 border-t border-border/50 bg-[#1a1a1a] flex justify-between items-center">
           <div className="flex items-center gap-4 text-[10px] font-mono text-muted-foreground">
              <span className="flex items-center gap-1.5"><div className="w-1 h-1 rounded-full bg-primary animate-pulse" /> Live Feed</span>
              <span>Buffer: {filteredLogs.length} events</span>
           </div>
           <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-muted-foreground">Página 1 de 1</span>
              <div className="flex gap-1">
                 <button className="p-1 hover:text-primary transition-colors"><ArrowRight className="w-3 h-3 rotate-180" /></button>
                 <button className="p-1 hover:text-primary transition-colors"><ArrowRight className="w-3 h-3" /></button>
              </div>
           </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(var(--primary-rgb), 0.2);
        }
      `}} />
    </div>
  );
}
