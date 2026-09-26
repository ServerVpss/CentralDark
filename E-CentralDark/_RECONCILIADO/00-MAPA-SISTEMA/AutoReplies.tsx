import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Search, 
  Zap, 
  MoreHorizontal, 
  Trash2, 
  Edit, 
  Hash,
  MessageSquareText,
  Loader2
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
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { autoReplyService, AutoReply } from "@/services/autoReplyService";
import { useAuth } from "@/contexts/AuthContext";

export default function AutoReplies() {
  const { workspace } = useAuth();
  const [rules, setRules] = useState<AutoReply[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (workspace?.id) loadRules();
  }, [workspace?.id]);

  const loadRules = async () => {
    try {
      setIsLoading(true);
      const data = await autoReplyService.list(workspace!.id);
      setRules(data as AutoReply[]);
    } catch (err) {
      toast.error("Erro ao carregar regras");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleRule = async (rule: AutoReply) => {
    try {
      const updated = await autoReplyService.save({ ...rule, is_active: !rule.is_active });
      setRules(rules.map(r => r.id === rule.id ? updated as AutoReply : r));
      toast.success("Status atualizado");
    } catch (err) {
      toast.error("Erro ao atualizar");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await autoReplyService.delete(id);
      setRules(rules.filter(r => r.id !== id));
      toast.success("Regra removida");
    } catch (err) {
      toast.error("Erro ao remover");
    }
  };

  const handleAdd = async () => {
    if (!workspace?.id) return;
    try {
      const newRule = await autoReplyService.save({
        workspace_id: workspace.id,
        keyword: "Nova Palavra",
        response: "Olá! Esta é uma resposta automática.",
        is_active: true
      });
      setRules([newRule as AutoReply, ...rules]);
      toast.success("Nova regra criada!");
    } catch (err) {
      toast.error("Erro ao criar");
    }
  };

  const filtered = rules.filter(r => r.keyword.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="flex-1 p-4 md:p-8 space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Zap className="w-8 h-8 text-primary" /> Auto-Respostas
          </h1>
          <p className="text-muted-foreground">Configure gatilhos reais no Supabase.</p>
        </div>
        <Button onClick={handleAdd} className="gap-2 shadow-lg shadow-primary/20">
          <Plus className="w-4 h-4" /> Nova Regra
        </Button>
      </div>

      <div className="relative max-w-lg">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Buscar palavra-chave..." 
          className="pl-10 bg-card/40 border-border" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : (
          <AnimatePresence>
            {filtered.map((rule, i) => (
              <motion.div
                key={rule.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-5 rounded-2xl border bg-card/40 backdrop-blur-sm flex flex-col md:flex-row items-center gap-6"
              >
                <div className="flex-1 min-w-[150px]">
                  <h3 className="text-lg font-black flex items-center gap-2">
                    <Hash className="w-4 h-4 text-muted-foreground" /> {rule.keyword}
                  </h3>
                </div>
                <div className="flex-1 bg-background/30 p-4 rounded-xl border border-border/50">
                  <p className="text-sm italic">"{rule.response}"</p>
                </div>
                <div className="flex items-center gap-4">
                  <Switch checked={rule.is_active} onCheckedChange={() => toggleRule(rule)} />
                  <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(rule.id!)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
