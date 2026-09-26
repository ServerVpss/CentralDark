import React, { useState } from "react";
import { formatDateTimeBR } from "@/lib/datetime";
import { 
  HardDrive, 
  Download, 
  RotateCcw, 
  Plus, 
  Trash2, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  Activity,
  Database,
  ShieldCheck,
  Search,
  FileArchive,
  RefreshCcw,
  Cloud
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
const MOCK_BACKUPS = [
  { id: "1", date: "29/05/2026 00:00", size: "1.4 GB", type: "Snapshot Diário", status: "success", version: "v2.6.0" },
  { id: "2", date: "28/05/2026 00:00", size: "1.2 GB", type: "Snapshot Diário", status: "success", version: "v2.5.0" },
  { id: "3", date: "27/05/2026 14:35", size: "850 MB", type: "Manual (Pré-Update)", status: "success", version: "v2.4.8" },
  { id: "4", date: "27/05/2026 00:00", size: "0 KB", type: "Snapshot Diário", status: "failed", version: "v2.4.8" },
  { id: "5", date: "20/05/2026 00:00", size: "1.1 GB", type: "Full System Backup", status: "success", version: "v2.4.0" },
];

export default function Backups() {
  const [backups, setBackups] = useState(MOCK_BACKUPS);
  const [creating, setCreating] = useState(false);

  const createSnapshot = () => {
    setCreating(true);
    toast.promise(new Promise(resolve => setTimeout(resolve, 3000)), {
      loading: 'Gerando snapshot completo do sistema...',
      success: () => {
        const newBackup = {
          id: Date.now().toString(),
          date: formatDateTimeBR(),
          size: "1.5 GB",
          type: "Manual",
          status: "success",
          version: "v2.6.0"
        };
        setBackups([newBackup, ...backups]);
        setCreating(false);
        return 'Snapshot criado com sucesso!';
      },
      error: 'Erro ao gerar backup.',
    });
  };

  const deleteBackup = (id: string) => {
    setBackups(backups.filter(b => b.id !== id));
    toast.error("Snapshot removido permanentemente");
  };

  return (
    <div className="flex-1 p-4 md:p-8 space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <HardDrive className="w-8 h-8 text-primary" />
            Backups & Snapshots
          </h1>
          <p className="text-muted-foreground mt-1">Proteja seus dados com snapshots automáticos e manuais.</p>
        </div>
        <Button 
          onClick={createSnapshot} 
          disabled={creating}
          className="gap-2 shadow-lg shadow-primary/20"
        >
          {creating ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          {creating ? "Criando..." : "Criar Snapshot Agora"}
        </Button>
      </div>

      {/* Cloud Status Card */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 bg-primary/5 border border-primary/20 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 backdrop-blur-sm"
      >
        <div className="flex items-center gap-5">
           <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
             <Cloud className="w-8 h-8" />
           </div>
           <div className="space-y-1">
              <h3 className="text-lg font-bold">Armazenamento em Nuvem Ativo</h3>
              <p className="text-sm text-muted-foreground text-balance">Seus backups são criptografados em repouso e salvos em 3 zonas de disponibilidade diferentes.</p>
           </div>
        </div>
        <div className="flex flex-col items-center md:items-end gap-1">
           <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/70">Espaço Utilizado</p>
           <h3 className="text-2xl font-black tabular-nums">4.6 GB <span className="text-xs font-normal text-muted-foreground">/ 50 GB</span></h3>
           <div className="w-40 h-1.5 bg-muted rounded-full overflow-hidden mt-1">
              <div className="h-full bg-primary w-[10%] rounded-full shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)]" />
           </div>
        </div>
      </motion.div>

      {/* Stats Board */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Último Backup", value: "Há 12h", icon: Clock, color: "text-blue-500" },
          { label: "Saúde do Banco", value: "100%", icon: CheckCircle2, color: "text-green-500" },
          { label: "Taxa de Falha", value: "0.2%", icon: Activity, color: "text-orange-500" },
          { label: "Criptografia", value: "AES-256", icon: ShieldCheck, color: "text-primary" },
        ].map((stat, i) => (
          <div key={i} className="p-4 bg-card/40 border border-border rounded-xl flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</p>
              <h3 className="text-lg font-bold">{stat.value}</h3>
            </div>
            <stat.icon className={`w-5 h-5 ${stat.color}`} />
          </div>
        ))}
      </div>

      {/* Backups List Table */}
      <div className="bg-card/40 border border-border rounded-2xl backdrop-blur-md overflow-hidden shadow-sm">
        <div className="p-4 border-b border-border bg-background/50 flex justify-between items-center">
           <h3 className="font-bold flex items-center gap-2">
              <Database className="w-4 h-4 text-primary" /> Histórico de Snapshots
           </h3>
           <div className="relative max-w-xs hidden sm:block">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input placeholder="Buscar por data ou versão..." className="pl-8 h-8 text-xs bg-background/50 border-border" />
           </div>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-background/30">
              <TableRow className="border-border/50">
                <TableHead className="w-[200px] font-mono text-[10px] uppercase">Data / Hora</TableHead>
                <TableHead className="font-mono text-[10px] uppercase">Tipo de Snapshot</TableHead>
                <TableHead className="font-mono text-[10px] uppercase">Tamanho</TableHead>
                <TableHead className="font-mono text-[10px] uppercase">Versão Core</TableHead>
                <TableHead className="font-mono text-[10px] uppercase">Status</TableHead>
                <TableHead className="text-right font-mono text-[10px] uppercase">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence>
                {backups.map((backup, i) => (
                  <motion.tr 
                    key={backup.id}
                    layout
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: i * 0.05 }}
                    className="border-border/50 group hover:bg-primary/[0.02] transition-colors"
                  >
                    <TableCell className="font-mono text-xs font-bold text-foreground">
                       {backup.date}
                    </TableCell>
                    <TableCell>
                       <div className="flex items-center gap-2">
                          <FileArchive className="w-3.5 h-3.5 text-muted-foreground" />
                          <span className="text-xs">{backup.type}</span>
                       </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground font-mono">{backup.size}</TableCell>
                    <TableCell>
                       <Badge variant="outline" className="text-[10px] font-mono border-border/50 bg-background/50">{backup.version}</Badge>
                    </TableCell>
                    <TableCell>
                       <Badge className={
                         backup.status === "success" ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"
                       }>
                         {backup.status === "success" ? "OK" : "FALHA"}
                       </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                       <div className="flex justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                         <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-primary" onClick={() => toast.success("Iniciando restauração...")} title="Restaurar este backup">
                            <RotateCcw className="w-3.5 h-3.5" />
                         </Button>
                         <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-primary" onClick={() => toast.success("Download iniciado")} title="Download do Snapshot">
                            <Download className="w-3.5 h-3.5" />
                         </Button>
                         <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-destructive" onClick={() => deleteBackup(backup.id)} title="Remover permanentemente">
                            <Trash2 className="w-3.5 h-3.5" />
                         </Button>
                       </div>
                    </TableCell>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Info Notice */}
      <div className="p-4 bg-orange-500/5 border border-orange-500/20 rounded-xl flex items-start gap-3">
         <AlertTriangle className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
         <div className="space-y-1">
            <p className="text-xs font-bold text-orange-200">Atenção ao Restaurar</p>
            <p className="text-[11px] text-muted-foreground">
               Restaurar um snapshot substituirá todos os dados atuais, incluindo conversas e configurações recentes. 
               Este processo pode levar até 10 minutos e reiniciará o servidor.
            </p>
         </div>
      </div>
    </div>
  );
}
