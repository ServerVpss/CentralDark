import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Search, 
  Globe, 
  Activity, 
  Trash2, 
  Loader2,
  CheckCircle2,
  Clock
} from "lucide-react"; // Note: Fixed potential import issue
import { 
  Globe as GlobeIcon, 
  Trash2 as TrashIcon,
  Activity as ActivityIcon,
  Loader2 as LoaderIcon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { webhookService, Webhook } from "@/services/webhookService";
import { useAuth } from "@/contexts/AuthContext";

export default function Webhooks() {
  const { workspace } = useAuth();
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newUrl, setNewUrl] = useState("");

  useEffect(() => {
    if (workspace?.id) loadWebhooks();
  }, [workspace?.id]);

  const loadWebhooks = async () => {
    try {
      setIsLoading(true);
      const data = await webhookService.list(workspace!.id);
      setWebhooks(data as Webhook[]);
    } catch (err) {
      toast.error("Erro ao buscar webhooks");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!workspace?.id || !newUrl.trim()) return;
    try {
      const data = await webhookService.save({
        workspace_id: workspace.id,
        url: newUrl,
        is_active: true
      });
      setWebhooks([data as Webhook, ...webhooks]);
      setNewUrl("");
      toast.success("Webhook ativado!");
    } catch (err) {
      toast.error("Erro ao salvar");
    }
  };

  return (
    <div className="flex-1 p-4 md:p-8 space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <GlobeIcon className="w-8 h-8 text-primary" /> Webhooks
          </h1>
          <p className="text-muted-foreground">Envie eventos para sistemas externos via Supabase.</p>
        </div>
      </div>

      <div className="flex gap-2 max-w-2xl">
        <Input 
          placeholder="https://seu-sistema.com/webhook" 
          value={newUrl}
          onChange={(e) => setNewUrl(e.target.value)}
          className="bg-card/40 border-border"
        />
        <Button onClick={handleAdd} className="gap-2 shrink-0">
          <Plus className="w-4 h-4" /> Configurar
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {isLoading ? (
          <div className="flex justify-center py-20"><LoaderIcon className="w-8 h-8 animate-spin text-primary" /></div>
        ) : (
          <AnimatePresence>
            {webhooks.map((webhook) => (
              <motion.div
                key={webhook.id}
                className="bg-card/40 border border-border rounded-2xl p-5 flex items-center gap-6"
              >
                <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500 border border-green-500/20">
                  <ActivityIcon className="w-6 h-6 animate-pulse" />
                </div>
                <div className="flex-1 min-w-0">
                  <code className="text-sm font-mono text-foreground truncate block">{webhook.url}</code>
                  <Badge className="mt-2 bg-primary/10 text-primary border-primary/20">ATIVO</Badge>
                </div>
                <Button variant="ghost" size="icon" className="text-destructive">
                   <TrashIcon className="w-4 h-4" />
                </Button>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
