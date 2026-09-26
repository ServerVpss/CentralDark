import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Search, 
  Send, 
  MoreHorizontal, 
  Play, 
  Trash2, 
  Target,
  Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { campaignService, Campaign } from "@/services/campaignService";
import { useAuth } from "@/contexts/AuthContext";

export default function Campaigns() {
  const { workspace } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (workspace?.id) loadCampaigns();
  }, [workspace?.id]);

  const loadCampaigns = async () => {
    try {
      setIsLoading(true);
      const data = await campaignService.list(workspace!.id);
      setCampaigns(data as Campaign[]);
    } catch (err) {
      toast.error("Erro ao carregar campanhas");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!workspace?.id) return;
    try {
      const data = await campaignService.save({
        workspace_id: workspace.id,
        name: "Nova Campanha Marketing",
        status: 'draft',
        total_targets: 100,
        sent_count: 0
      });
      setCampaigns([data as Campaign, ...campaigns]);
      toast.success("Campanha criada!");
    } catch (err) {
      toast.error("Erro ao salvar");
    }
  };

  return (
    <div className="flex-1 p-4 md:p-8 space-y-6 animate-in fade-in duration-500 overflow-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Target className="w-8 h-8 text-primary" /> Campanhas
          </h1>
          <p className="text-muted-foreground">Disparos em massa persistidos no Supabase.</p>
        </div>
        <Button onClick={handleAdd} className="gap-2 shadow-lg shadow-primary/20">
          <Plus className="w-4 h-4" /> Nova Campanha
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {isLoading ? (
          <div className="col-span-full py-20 flex justify-center"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>
        ) : (
          <AnimatePresence>
            {campaigns.map((camp) => (
              <motion.div
                key={camp.id}
                className="bg-card/40 border border-border rounded-2xl p-5 space-y-4"
              >
                <div className="flex justify-between items-start">
                   <h3 className="text-lg font-bold">{camp.name}</h3>
                   <Badge className="bg-primary/10 text-primary uppercase text-[10px]">{camp.status}</Badge>
                </div>
                <div className="space-y-2">
                   <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Progresso</span>
                      <span>{camp.sent_count} / {camp.total_targets}</span>
                   </div>
                   <Progress value={(camp.sent_count / camp.total_targets) * 100} className="h-2" />
                </div>
                <div className="flex gap-2 justify-end">
                   <Button size="sm" variant="outline" className="h-8 uppercase text-[10px] font-bold">Pausar</Button>
                   <Button size="sm" className="h-8 uppercase text-[10px] font-bold">Relatório</Button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
