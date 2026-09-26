import React, { useState } from "react";
import { formatDateBR } from "@/lib/datetime";
import { 
  Plus, 
  Key, 
  Copy, 
  RefreshCcw, 
  ShieldCheck, 
  CheckCircle2, 
  MoreHorizontal, 
  Trash2, 
  Terminal, 
  ExternalLink, 
  Code2, 
  Cpu, 
  Webhook, 
  Smartphone,
  Info,
  Send
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

// --- Mock Data ---
const MOCK_TOKENS = [
  { id: "1", name: "Sistema de Vendas ERP", prefix: "wbt_live_8a2b...", status: "active", created: "10/05/2026", lastUsed: "Há 10 min" },
  { id: "2", name: "Site Principal / Contato", prefix: "wbt_live_9f1e...", status: "active", created: "15/05/2026", lastUsed: "Ontem" },
  { id: "3", name: "App Mobile Atendente", prefix: "wbt_live_0c3d...", status: "revoked", created: "01/01/2026", lastUsed: "Há 4 meses" },
];

export default function ApiIntegrations() {
  const [tokens, setTokens] = useState(MOCK_TOKENS);
  const [showTokenModal, setShowTokenModal] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Token copiado para a área de transferência!");
  };

  const handleRevoke = (id: string) => {
    setTokens(prev => prev.map(t => {
      if (t.id === id) {
        toast.warning("Token revogado com sucesso!");
        return { ...t, status: "revoked" };
      }
      return t;
    }));
  };

  const handleCreateToken = () => {
    const newToken = {
      id: Date.now().toString(),
      name: "Novo Token de API",
      prefix: "wbt_live_" + Math.random().toString(36).substring(7) + "...",
      status: "active",
      created: formatDateBR(),
      lastUsed: "Nunca"
    };
    setTokens([newToken, ...tokens]);
    toast.success("Token gerado com sucesso! Guarde-o em local seguro.");
  };

  return (
    <div className="flex-1 p-4 md:p-8 space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <Key className="w-8 h-8 text-primary" />
            API & Integrações
          </h1>
          <p className="text-muted-foreground mt-1">Gerencie chaves de acesso e integre o WABOT com qualquer sistema.</p>
        </div>
        <Button onClick={handleCreateToken} className="gap-2 shadow-lg shadow-primary/20">
          <Plus className="w-4 h-4" /> Gerar Novo Token
        </Button>
      </div>

      {/* API Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-card/40 border border-border rounded-2xl backdrop-blur-md flex flex-col gap-2 relative group overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Terminal className="w-24 h-24" />
          </div>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Requisições/Mês</p>
          <h3 className="text-3xl font-black">1.2M</h3>
          <p className="text-xs text-green-500 flex items-center gap-1 font-bold">
            <CheckCircle2 className="w-3 h-3" /> 100% de sucesso
          </p>
        </div>
        <div className="p-6 bg-card/40 border border-border rounded-2xl backdrop-blur-md flex flex-col gap-2 relative group overflow-hidden">
           <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Cpu className="w-24 h-24" />
          </div>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Tempo de Resposta</p>
          <h3 className="text-3xl font-black">42ms</h3>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-primary" /> Média global do cluster
          </p>
        </div>
        <div className="p-6 bg-card/40 border border-border rounded-2xl backdrop-blur-md flex flex-col gap-2 relative group overflow-hidden">
           <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <ShieldCheck className="w-24 h-24" />
          </div>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Segurança</p>
          <h3 className="text-3xl font-black text-primary">Nível 4</h3>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Info className="w-3 h-3" /> Monitoramento 24/7 ativo
          </p>
        </div>
      </div>

      {/* Tokens List */}
      <div className="bg-card/40 border border-border rounded-2xl backdrop-blur-md overflow-hidden">
        <div className="p-4 border-b border-border bg-background/50">
          <h3 className="font-bold flex items-center gap-2">
            <Code2 className="w-4 h-4 text-primary" /> Chaves de API Ativas
          </h3>
        </div>
        <div className="divide-y divide-border/50">
          <AnimatePresence>
            {tokens.map((token, i) => (
              <motion.div 
                layout
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.05 }}
                key={token.id} 
                className={`p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group transition-all ${
                  token.status === "revoked" ? "bg-muted/10 opacity-60 grayscale-[0.8]" : "hover:bg-primary/5"
                }`}
              >
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                    token.status === "active" ? "bg-primary/10 border-primary/20 text-primary" : "bg-muted border-border text-muted-foreground"
                  }`}>
                    <Key className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold truncate">{token.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="text-[10px] bg-background border border-border px-1.5 py-0.5 rounded font-mono text-muted-foreground">
                        {token.prefix}
                      </code>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(token.prefix)}>
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6 sm:gap-12 w-full sm:w-auto border-t sm:border-t-0 pt-4 sm:pt-0">
                   <div className="flex flex-col items-center sm:items-end">
                      <p className="text-[9px] uppercase font-bold text-muted-foreground">Criado em</p>
                      <p className="text-xs font-mono">{token.created}</p>
                   </div>
                   <div className="flex flex-col items-center sm:items-end">
                      <p className="text-[9px] uppercase font-bold text-muted-foreground">Último uso</p>
                      <p className="text-xs font-mono">{token.lastUsed}</p>
                   </div>
                   <div className="flex items-center gap-2">
                     <Badge className={token.status === "active" ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"}>
                       {token.status.toUpperCase()}
                     </Badge>
                     <DropdownMenu>
                       <DropdownMenuTrigger asChild>
                         <Button variant="ghost" size="icon" className="h-8 w-8">
                           <MoreHorizontal className="w-4 h-4" />
                         </Button>
                       </DropdownMenuTrigger>
                       <DropdownMenuContent align="end" className="bg-background border-border">
                         <DropdownMenuItem className="gap-2"><RefreshCcw className="w-3.5 h-3.5" /> Regenerar Token</DropdownMenuItem>
                         <DropdownMenuItem className="gap-2"><Terminal className="w-3.5 h-3.5" /> Ver logs de acesso</DropdownMenuItem>
                         <DropdownMenuSeparator />
                         <DropdownMenuItem 
                            className="gap-2 text-destructive" 
                            onClick={() => handleRevoke(token.id)}
                            disabled={token.status === "revoked"}
                         >
                           <Trash2 className="w-3.5 h-3.5" /> Revogar chave
                         </DropdownMenuItem>
                       </DropdownMenuContent>
                     </DropdownMenu>
                   </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Documentation Shortcuts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
         {[
           { label: "Documentação API", icon: ExternalLink, desc: "Endpoints e parâmetros" },
           { label: "SDK Node.js", icon: Smartphone, desc: "Livraria oficial" },
           { label: "Webhook Events", icon: Webhook, desc: "Lista de gatilhos" },
           { label: "Postman Collection", icon: Send, desc: "Testar requests" },
         ].map((item, i) => (
           <Button key={i} variant="outline" className="h-auto p-4 flex flex-col items-start gap-2 bg-card/20 border-border hover:border-primary/40 hover:bg-primary/5 transition-all group">
             <div className="flex justify-between w-full">
               <item.icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
               <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-40 transition-opacity" />
             </div>
             <div className="text-left">
               <p className="text-xs font-bold">{item.label}</p>
               <p className="text-[10px] text-muted-foreground">{item.desc}</p>
             </div>
           </Button>
         ))}
      </div>
    </div>
  );
}
