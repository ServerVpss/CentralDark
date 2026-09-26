import React, { useState } from "react";
import { 
  MonitorSmartphone, 
  Trash2, 
  Globe, 
  Clock, 
  ShieldCheck, 
  RefreshCcw,
  Smartphone,
  Laptop,
  AlertCircle,
  XCircle,
  CheckCircle2,
  Lock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
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
const MOCK_SESSIONS = [
  { id: "1", ip: "192.168.1.42", device: "Chrome / macOS", location: "São Paulo, BR", status: "active", lastSeen: "Agora", isCurrent: true },
  { id: "2", ip: "187.54.12.10", device: "iPhone 15 Pro", location: "Rio de Janeiro, BR", status: "active", lastSeen: "Há 12 min", isCurrent: false },
  { id: "3", ip: "177.12.89.5", device: "Firefox / Windows", location: "Curitiba, BR", status: "expired", lastSeen: "Há 2 dias", isCurrent: false },
  { id: "4", ip: "192.168.1.15", device: "Safari / iPad", location: "São Paulo, BR", status: "active", lastSeen: "Ontem", isCurrent: false },
];

export default function Sessions() {
  const [sessions, setSessions] = useState(MOCK_SESSIONS);

  const revokeSession = (id: string) => {
    setSessions(prev => prev.filter(s => s.id !== id));
    toast.error("Sessão revogada com sucesso");
  };

  const revokeAll = () => {
    setSessions(sessions.filter(s => s.isCurrent));
    toast.success("Todas as outras sessões foram encerradas");
  };

  return (
    <div className="flex-1 p-4 md:p-8 space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <Lock className="w-8 h-8 text-primary" />
            Sessões Ativas
          </h1>
          <p className="text-muted-foreground mt-1">Gerencie os dispositivos conectados à sua conta e encerre sessões suspeitas.</p>
        </div>
        <Button 
          variant="outline" 
          onClick={revokeAll}
          className="text-destructive border-destructive/30 hover:bg-destructive hover:text-destructive-foreground transition-all gap-2"
        >
          <XCircle className="w-4 h-4" /> Revogar Todas as Outras
        </Button>
      </div>

      {/* Security Status Card */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 bg-primary/5 border border-primary/20 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 backdrop-blur-sm"
      >
        <div className="flex items-center gap-5">
           <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
             <ShieldCheck className="w-8 h-8" />
           </div>
           <div className="space-y-1">
              <h3 className="text-lg font-bold">Sua conta está protegida</h3>
              <p className="text-sm text-muted-foreground">Monitoramos logins de novos endereços IP e dispositivos desconhecidos.</p>
           </div>
        </div>
        <div className="flex flex-col items-center md:items-end gap-1">
           <p className="text-xs font-bold uppercase tracking-widest text-primary/70">Nível de Segurança</p>
           <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className={`h-1.5 w-8 rounded-full ${i <= 4 ? 'bg-primary shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)]' : 'bg-primary/20'}`} />
              ))}
           </div>
           <span className="text-[10px] font-mono text-muted-foreground mt-1">FORTE (2FA Ativo)</span>
        </div>
      </motion.div>

      {/* Sessions Table */}
      <div className="bg-card/40 border border-border rounded-2xl backdrop-blur-md overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-background/50">
              <TableRow className="border-border/50">
                <TableHead className="w-[300px] font-mono text-[10px] uppercase tracking-widest">Dispositivo / Navegador</TableHead>
                <TableHead className="font-mono text-[10px] uppercase tracking-widest">Localização / IP</TableHead>
                <TableHead className="font-mono text-[10px] uppercase tracking-widest">Status</TableHead>
                <TableHead className="font-mono text-[10px] uppercase tracking-widest text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence>
                {sessions.map((session, i) => (
                  <motion.tr 
                    key={session.id}
                    layout
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: i * 0.05 }}
                    className={`group hover:bg-primary/5 transition-colors border-border/50 ${session.isCurrent ? 'bg-primary/[0.02]' : ''}`}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border border-border/50 ${session.isCurrent ? 'bg-primary/10 text-primary' : 'bg-muted/50 text-muted-foreground'}`}>
                           {session.device.includes('macOS') || session.device.includes('Windows') ? <Laptop className="w-5 h-5" /> : <Smartphone className="w-5 h-5" />}
                        </div>
                        <div>
                          <p className="text-sm font-bold flex items-center gap-2">
                            {session.device}
                            {session.isCurrent && <Badge className="bg-primary/20 text-primary text-[9px] h-4 border-primary/30 uppercase font-black tracking-tighter">Atual</Badge>}
                          </p>
                          <p className="text-[10px] text-muted-foreground font-mono flex items-center gap-1">
                             <Clock className="w-3 h-3" /> {session.lastSeen}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                       <div className="space-y-0.5">
                          <p className="text-xs font-medium flex items-center gap-1.5 uppercase tracking-wide">
                             <Globe className="w-3.5 h-3.5 text-muted-foreground" /> {session.location}
                          </p>
                          <code className="text-[10px] text-muted-foreground bg-background/50 px-1.5 py-0.5 rounded border border-border/50">{session.ip}</code>
                       </div>
                    </TableCell>
                    <TableCell>
                       <Badge className={
                         session.status === "active" ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"
                       }>
                         {session.status.toUpperCase()}
                       </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                       {!session.isCurrent ? (
                         <Button 
                           variant="ghost" 
                           size="icon" 
                           className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                           onClick={() => revokeSession(session.id)}
                         >
                           <Trash2 className="w-4 h-4" />
                         </Button>
                       ) : (
                         <Button variant="ghost" size="sm" className="h-8 text-[10px] font-bold uppercase tracking-widest text-muted-foreground pointer-events-none opacity-40">
                           Bloqueado
                         </Button>
                       )}
                    </TableCell>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Security FAQ / Tips */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
         <div className="p-6 bg-card/20 border border-border rounded-2xl space-y-4">
            <h4 className="font-bold flex items-center gap-2"><AlertCircle className="w-4 h-4 text-warning" /> Viu algo estranho?</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Se você não reconhece algum destes dispositivos ou localizações, revogue a sessão imediatamente e altere sua senha de acesso.
            </p>
            <Button variant="link" className="p-0 h-auto text-primary text-xs font-bold uppercase tracking-widest">
               Alterar Senha Agora
            </Button>
         </div>
         <div className="p-6 bg-card/20 border border-border rounded-2xl space-y-4">
            <h4 className="font-bold flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Dica de Segurança</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Evite fazer login em redes Wi-Fi públicas. Use sempre o WABOT com conexões seguras ou utilize uma VPN confiável.
            </p>
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground/60 uppercase">
               <ShieldCheck className="w-3 h-3" /> Verificado por Arena Security Cloud
            </div>
         </div>
      </div>
    </div>
  );
}
