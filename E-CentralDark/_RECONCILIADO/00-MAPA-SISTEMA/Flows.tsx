import React, { useState } from "react";
import { FlowCanvas } from "@/components/dashboard/FlowCanvas";
import { 
  Plus, 
  Save, 
  Play, 
  MousePointer2, 
  Layers, 
  MessageSquare, 
  Zap, 
  Clock, 
  ArrowRight,
  Settings,
  Share2,
  ChevronRight,
  MonitorPlay,
  History
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function Flows() {
  const [activeTab, setActiveTab] = useState<"builder" | "settings" | "history">("builder");

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-64px)] overflow-hidden">
      {/* Upper Toolbar */}
      <div className="h-16 px-4 md:px-8 border-b border-border bg-card/40 backdrop-blur-md flex items-center justify-between shrink-0">
        <div className="flex items-center gap-6">
          <div className="flex flex-col">
            <h1 className="text-lg font-bold flex items-center gap-2 tracking-tight">
              <Layers className="w-5 h-5 text-primary" />
              Editor de Fluxo
            </h1>
            <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
              v2.4.0 • <span className="text-primary animate-pulse italic">Autosave: On</span>
            </p>
          </div>

          <div className="hidden lg:flex items-center gap-1 bg-background/50 border border-border p-1 rounded-full">
            {[
              { id: "builder", label: "Construtor", icon: MonitorPlay },
              { id: "settings", label: "Gatilhos", icon: Settings },
              { id: "history", label: "Versões", icon: History }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                  activeTab === tab.id 
                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <tab.icon className="w-3.5 h-3.5" /> {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="hidden sm:flex gap-2 text-xs font-bold uppercase border-border/50 hover:bg-primary/5 hover:text-primary transition-all">
            <Share2 className="w-3.5 h-3.5" /> Compartilhar
          </Button>
          <div className="h-6 w-px bg-border mx-2 hidden sm:block" />
          <Button variant="ghost" size="sm" className="hidden sm:flex gap-2 text-xs font-bold uppercase text-muted-foreground" onClick={() => toast.info("Rascunho salvo localmente")}>
             <Save className="w-3.5 h-3.5" /> Rascunho
          </Button>
          <Button size="sm" className="gap-2 text-xs font-bold uppercase shadow-lg shadow-primary/20" onClick={() => toast.success("Fluxo publicado e ativo!")}>
             <Play className="w-3.5 h-3.5" /> Publicar Fluxo
          </Button>
        </div>
      </div>

      {/* Main Builder Area */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Sidebar: Node Components */}
        <motion.div 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="hidden md:flex flex-col w-72 shrink-0 bg-card/20 border-r border-border backdrop-blur-sm p-4 overflow-y-auto custom-scrollbar"
        >
          <div className="space-y-6">
            <div className="space-y-3">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                <Plus className="w-3 h-3" /> Adicionar Nodes
              </h3>
              
              <div className="grid grid-cols-1 gap-2">
                {[
                  { label: "Enviar Mensagem", icon: MessageSquare, color: "text-blue-500", desc: "Texto, imagem ou áudio" },
                  { label: "Gatilho/Trigger", icon: Zap, color: "text-orange-500", desc: "Palavra-chave ou evento" },
                  { label: "Tempo de Espera", icon: Clock, color: "text-purple-500", desc: "Aguardar X minutos" },
                  { label: "Decisão / IF", icon: ArrowRight, color: "text-green-500", desc: "Se/Senão condicional" },
                  { label: "API Request", icon: Settings, color: "text-pink-500", desc: "Webhook externo" }
                ].map((node, i) => (
                  <button
                    key={i}
                    className="flex flex-col items-start p-3 bg-background/50 border border-border/50 rounded-xl hover:border-primary/40 hover:bg-primary/5 transition-all group text-left"
                    onClick={() => toast.info(`Arraste ${node.label} para o canvas`)}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`p-1.5 rounded-lg bg-background border border-border group-hover:border-primary/20 ${node.color}`}>
                        <node.icon className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-bold group-hover:text-primary transition-colors">{node.label}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground leading-tight">{node.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
               <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                <MousePointer2 className="w-3 h-3" /> Variáveis
              </h3>
              <div className="bg-background/40 border border-border rounded-xl p-3 space-y-2">
                <div className="flex justify-between items-center text-[10px] p-2 bg-muted/50 rounded border border-border/50 cursor-copy hover:border-primary/30">
                  <span className="font-mono text-muted-foreground">#contact_name</span>
                  <ChevronRight className="w-3 h-3" />
                </div>
                <div className="flex justify-between items-center text-[10px] p-2 bg-muted/50 rounded border border-border/50 cursor-copy hover:border-primary/30">
                  <span className="font-mono text-muted-foreground">#contact_phone</span>
                  <ChevronRight className="w-3 h-3" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* The ReactFlow Canvas */}
        <div className="flex-1 relative bg-[#0a0a0a]">
          <FlowCanvas />
          
          {/* Canvas Overlay Controls */}
          <div className="absolute bottom-6 left-6 flex items-center gap-2 bg-background/80 border border-border backdrop-blur-md p-1.5 rounded-full shadow-2xl z-10">
             <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-muted-foreground">
               <MonitorPlay className="w-4 h-4" />
             </Button>
             <div className="h-4 w-px bg-border" />
             <div className="flex items-center px-3 text-[10px] font-mono text-muted-foreground">
                ZOOM: 100%
             </div>
          </div>

          <div className="absolute top-6 right-6 flex flex-col gap-2 z-10">
             <Button variant="secondary" className="h-10 w-10 p-0 rounded-xl bg-background/80 border border-border backdrop-blur-md shadow-xl hover:text-primary">
               <Plus className="w-5 h-5" />
             </Button>
             <Button variant="secondary" className="h-10 w-10 p-0 rounded-xl bg-background/80 border border-border backdrop-blur-md shadow-xl hover:text-primary">
               <Layers className="w-5 h-5" />
             </Button>
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
