import React, { useState, useEffect } from "react";
import {
  Clock,
  Cloud,
  Loader2,
  MoreVertical,
  Phone,
  Plus,
  Power,
  QrCode,
  RefreshCw,
  Settings2,
  Smartphone,
  Trash2,
  Wifi,
  WifiOff
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuTrigger, DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { instanceService, Instance } from "@/services/instanceService";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { LiveBotStatus } from "@/components/dashboard/LiveBotStatus";
import { LiveMessagesPreview } from "@/components/dashboard/LiveMessagesPreview";

const STATUS_CONFIG: Record<string, { color: string; label: string; icon: typeof Wifi }> = {
  connected: { color: "bg-green-500/10 border-green-500/20 text-green-500", label: "CONECTADO", icon: Smartphone },
  qr_code: { color: "bg-amber-500/10 border-amber-500/20 text-amber-500", label: "AGUARDANDO QR", icon: QrCode },
  connecting: { color: "bg-blue-500/10 border-blue-500/20 text-blue-500", label: "CONECTANDO", icon: RefreshCw },
  disconnected: { color: "bg-muted border-border text-muted-foreground", label: "DESCONECTADO", icon: WifiOff },
};

const normalizarQr = (valor?: string | null) => {
  if (!valor) return null;
  return valor.startsWith("data:image") ? valor : `data:image/png;base64,${valor}`;
};

export default function Instances() {
  const { workspace } = useAuth();
  const [instances, setInstances] = useState<Instance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [showQRModal, setShowQRModal] = useState(false);
  const [activeQR, setActiveQR] = useState<string | null>(null);
  const [loadingQR, setLoadingQR] = useState(false);
  const [qrInstanceId, setQrInstanceId] = useState<string | null>(null);
  const [qrError, setQrError] = useState<string | null>(null);
  const [qrTimeoutId, setQrTimeoutId] = useState<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (workspace?.id) loadInstances();
  }, [workspace?.id]);

  // Real-time: escutar mudanças na tabela instances do workspace
  useEffect(() => {
    if (!workspace?.id) return;

    const channel = supabase
      .channel("whatsapp_connections-realtime")
      .on("postgres_changes", {
        event: "*",
        schema: "api",
        table: "whatsapp_connections",
        filter: `workspace_id=eq.${workspace.id}`,
      }, (payload) => {
        if (payload.eventType === "INSERT") {
          setInstances((prev) => [...prev, payload.new as Instance]);
        } else if (payload.eventType === "UPDATE") {
          setInstances((prev) =>
            prev.map((i) => (i.id === (payload.new as Instance).id ? (payload.new as Instance) : i))
          );
          const updated = payload.new as Instance;
          const qrAtualizado = normalizarQr(updated.qr_code_base64 || updated.qr_code);

          console.log("[QR_FLOW] realtime update", {
            id: updated.id,
            status: updated.status,
            hasQrCode: !!updated.qr_code,
            hasQrBase64: !!updated.qr_code_base64,
          });

          if (qrInstanceId === updated.id && qrAtualizado) {
            console.log("[QR_FLOW] qr image present from realtime");
            setActiveQR(qrAtualizado);
            setLoadingQR(false);
            setQrError(null);
            if (qrTimeoutId) { clearTimeout(qrTimeoutId); setQrTimeoutId(null); }
          }

          if (qrInstanceId === updated.id && updated.status === "qr_code" && !qrAtualizado) {
            setLoadingQR(true);
          }

          if (qrInstanceId === updated.id && updated.status === "connected") {
            setShowQRModal(false);
            setQrInstanceId(null);
            if (qrTimeoutId) { clearTimeout(qrTimeoutId); setQrTimeoutId(null); }
            toast.success(`${updated.name} conectado! ✅`);
          }
        } else if (payload.eventType === "DELETE") {
          setInstances((prev) => prev.filter((i) => i.id !== (payload.old as any).id));
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [workspace?.id, qrInstanceId]);

  const loadInstances = async () => {
    try {
      setIsLoading(true);
      const data = await instanceService.list(workspace!.id);
      setInstances(data as Instance[]);
    } catch (error) {
      toast.error("Erro ao carregar instâncias");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddInstance = async () => {
    if (!workspace?.id || !newName.trim()) return;
    try {
      await instanceService.create({
        workspace_id: workspace.id,
        name: newName,
        status: "disconnected",
      });
      // Real-time vai adicionar automaticamente
      setShowAddModal(false);
      setNewName("");
      toast.success(`Conexão "${newName}" criada!`);
    } catch (error) {
      toast.error("Erro ao criar conexão");
    }
  };

  const handleGetQR = async (inst: Instance) => {
    if (!inst.connection_id) {
       toast.error("Conexão Inválida", { description: "Nenhum connection_id atrelado. Exclua e recrie o aparelho." });
       return;
    }

    console.log("[QR_FLOW] instance created", { instanceId: inst.id, instanceName: inst.name, connectionId: inst.connection_id });
    console.log("[QR_FLOW] starting qr request");

    setQrInstanceId(inst.id!);
    setShowQRModal(true);
    setQrError(null);
    const qrAtual = normalizarQr(inst.qr_code_base64 || inst.qr_code);
    setActiveQR(qrAtual);
    setLoadingQR(!qrAtual);

    // Timeout de 30s: se nada chegar via realtime, mostra erro claro
    if (qrTimeoutId) clearTimeout(qrTimeoutId);
    const tid = setTimeout(() => {
      console.warn("[QR_FLOW] timeout 30s — nenhum QR recebido via realtime");
      setLoadingQR(false);
      setQrError(
        "O servidor não devolveu o QR em 30s. O sincronizador da VPS (CloneDeck-Supabase-Sync) " +
        "precisa criar a sessão na WuzAPI e gravar o qr_code. Verifique se o worker está online " +
        "e se a instância já foi registrada no Gateway."
      );
    }, 30000);
    setQrTimeoutId(tid);

    try {
      toast.info("Aguardando QR Code...", { description: "O código vai aparecer assim que o sincronizador atualizar a conexão." });

      if (inst.id && inst.status !== "connecting" && inst.status !== "qr_code") {
        console.log("[QR_FLOW] qr endpoint", "supabase update status=connecting (dispara worker VPS)");
        await instanceService.update(inst.id, { status: "connecting" });
      }
    } catch (err: any) {
      console.error("[QR_FLOW] erro ao marcar connecting", err?.message);
      toast.error("Falha ao preparar conexão", { description: err.message || "Tente novamente em alguns segundos." });
      setLoadingQR(false);
      setQrError(err?.message || "Falha ao preparar conexão.");
      if (qrTimeoutId) { clearTimeout(qrTimeoutId); setQrTimeoutId(null); }
    } finally {
      if (qrAtual) {
        setLoadingQR(false);
      }
    }
  };

  const handleDelete = async (id: string) => {
    try {
      // Optimistic update
      setInstances(prev => prev.filter(i => i.id !== id));
      await instanceService.delete(id);
      toast.success("Conexão removida.");
    } catch (error) {
      toast.error("Erro ao remover");
      // Fallback
      if (workspace?.id) loadInstances();
    }
  };

  const filtered = instances.filter((i) =>
    i.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 p-4 md:p-8 space-y-6 animate-in fade-in duration-500 overflow-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <Wifi className="w-8 h-8 text-primary" />
            Central de Conexões
          </h1>
          <p className="text-muted-foreground mt-1">Gerencie suas conexões WhatsApp</p>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="gap-2 shadow-lg shadow-primary/20">
          <Plus className="w-4 h-4" /> Nova Conexão
        </Button>
      </div>

      <LiveBotStatus />
      <LiveMessagesPreview />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full py-20 flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
            <p className="font-mono text-muted-foreground">Carregando conexões...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="col-span-full py-20 flex flex-col items-center justify-center gap-4">
            <WifiOff className="w-16 h-16 text-muted-foreground opacity-30" />
            <p className="text-muted-foreground">Nenhuma conexão. Crie uma para começar!</p>
          </div>
        ) : (
          filtered.map((inst) => {
            const cfg = STATUS_CONFIG[inst.status] || STATUS_CONFIG.disconnected;
            const Icon = cfg.icon;
            return (
              <motion.div
                key={inst.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card/40 border border-border rounded-2xl p-6 backdrop-blur-sm relative group hover:border-primary/30 transition-all shadow-xl"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className={`p-3 rounded-2xl border ${cfg.color}`}>
                    <Icon className={`w-6 h-6 ${inst.status === "connecting" ? "animate-spin" : ""}`} />
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-background border-border w-48">
                      <DropdownMenuItem className="gap-2" onClick={() => handleGetQR(inst)}><RefreshCw className="w-4 h-4" /> Reconectar / Gerar QR</DropdownMenuItem>
                      <DropdownMenuItem className="gap-2" onClick={() => {
                        toast.info("Desconectando aparelho...");
                        fetch(`https://proxy.multizap.dev/connections/${inst.connection_id}/logout`, { method: 'POST' }).then(() => toast.success("Aparelho deslogado!")).catch(() => toast.error("Falha no logout"));
                      }}><Power className="w-4 h-4" /> Forçar Logout</DropdownMenuItem>
                      <DropdownMenuItem className="gap-2"><Settings2 className="w-4 h-4" /> Editar Nome</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="gap-2 text-destructive" onClick={() => handleDelete(inst.id!)}>
                        <Trash2 className="w-4 h-4" /> Remover
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="space-y-1 mb-4">
                  <h3 className="text-xl font-bold tracking-tight">{inst.name}</h3>
                  {inst.phone && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5" /> {inst.phone}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <Badge className={cfg.color}>{cfg.label}</Badge>
                  {inst.status !== "connected" && (
                    <Button size="sm" variant="outline" className="h-8 gap-2 border-primary/20 hover:bg-primary/10"
                      onClick={() => handleGetQR(inst)}>
                      <QrCode className="w-3 h-3" /> Conectar
                    </Button>
                  )}
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Modal QR Code */}
      <Dialog open={showQRModal} onOpenChange={(open) => {
        setShowQRModal(open);
        if (!open) {
          setQrInstanceId(null);
          setQrError(null);
          setActiveQR(null);
          if (qrTimeoutId) { clearTimeout(qrTimeoutId); setQrTimeoutId(null); }
        }
      }}>
        <DialogContent className="bg-background border-border max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Escaneie o QR Code</DialogTitle>
            <DialogDescription>Abra o WhatsApp &gt; Aparelhos conectados &gt; Conectar aparelho</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center p-6 bg-white rounded-xl min-h-[300px]">
            {qrError ? (
              <div className="text-center space-y-3 px-2">
                <WifiOff className="w-12 h-12 text-red-500 mx-auto" />
                <p className="text-red-600 text-sm font-semibold">Não foi possível gerar o QR</p>
                <p className="text-black/60 text-xs leading-relaxed">{qrError}</p>
              </div>
            ) : loadingQR ? (
              <div className="text-center space-y-4">
                <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
                <p className="text-black/60 text-sm">Aguardando QR do servidor...</p>
                <p className="text-black/40 text-xs">O QR aparecerá automaticamente</p>
              </div>
            ) : activeQR ? (
              <img src={activeQR} alt="QR Code" className="w-full h-full object-contain" />
            ) : (
              <div className="text-center space-y-3">
                <Clock className="w-12 h-12 text-gray-400 mx-auto" />
                <p className="text-black/60 text-sm">QR Code não disponível</p>
                <p className="text-black/40 text-xs">O servidor ainda está processando</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <p className="text-[10px] text-muted-foreground text-center w-full uppercase font-mono">
              {qrError ? "Erro — feche e tente novamente" : loadingQR ? "Aguardando servidor... atualiza automaticamente" : "QR Code expira em 60 segundos"}
            </p>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Adicionar */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="sm:max-w-[600px] border-border bg-card/95 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="font-display">Nova Conexão WhatsApp</DialogTitle>
            <DialogDescription>
              Escolha o provedor de conexão para o seu número.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            {/* WuzAPI / QR Code Provider */}
            <div className="border border-primary/20 bg-primary/5 rounded-xl p-4 flex flex-col items-start hover:border-primary/50 transition-colors cursor-pointer" onClick={() => {
               // Keeps original logic for creating a WuzAPI connection
               document.getElementById("input-nome-conexao")?.focus();
            }}>
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mb-3">
                <QrCode className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-bold text-sm mb-1">QR Code Próprio</h3>
              <p className="text-xs text-muted-foreground mb-4">Conecte escaneando um QR Code via nosso servidor seguro WuzAPI.</p>
              
              <div className="w-full mt-auto space-y-3" onClick={(e) => e.stopPropagation()}>
                <Input 
                  id="input-nome-conexao"
                  placeholder="Ex: Suporte Principal" 
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  className="bg-background/50 h-9"
                />
                <Button onClick={handleAddInstance} className="w-full h-9 text-xs" disabled={!newName.trim()}>
                  Criar Conexão WuzAPI
                </Button>
              </div>
            </div>

            {/* Meta Cloud API Provider (Disabled/Coming Soon or Redirect) */}
            <div className="border border-border/50 bg-background/50 rounded-xl p-4 flex flex-col items-start opacity-70 hover:opacity-100 transition-opacity">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center mb-3">
                <Cloud className="w-5 h-5 text-blue-400" />
              </div>
              <h3 className="font-bold text-sm mb-1">WhatsApp Cloud API</h3>
              <p className="text-xs text-muted-foreground mb-4">Integração oficial via Meta para empresas verificadas.</p>
              
              <div className="w-full mt-auto">
                <Button variant="outline" className="w-full h-9 text-xs border-blue-500/30 text-blue-400" onClick={(e) => {
                   e.stopPropagation();
                   toast.info("A configuração manual da Cloud API Meta deve ser feita via Painel CRM.");
                }}>
                  Configurar no CRM
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
