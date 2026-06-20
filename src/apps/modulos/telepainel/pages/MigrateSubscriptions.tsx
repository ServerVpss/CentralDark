import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Upload, Loader2, CheckCircle, AlertCircle, Users } from "lucide-react";
import { DashboardLayout } from "@/shared/layout/DashboardLayout";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Progress } from "@/shared/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface OldSubscription {
  userId: number;
  planCode: string;
  planName: string;
  planDays: number;
  txid: string;
  value: number;
  startedAt: string;
  expiresAt: string;
  renewalHistory?: unknown[];
  lastRenewalAt?: string;
}

export default function MigrateSubscriptions() {
  const { botId } = useParams<{ botId: string }>();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<{
    total: number;
    active: number;
    imported: number;
    skipped: number;
    errors: number;
  } | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  const handleMigrate = async () => {
    if (!botId) {
      toast.error("Bot ID não encontrado");
      return;
    }

    setLoading(true);
    setProgress(0);
    setLogs([]);
    setResults(null);

    try {
      addLog("📥 Carregando arquivo de assinaturas...");
      
      // Fetch the subscriptions file
      const response = await fetch("/data/subscriptions.json");
      if (!response.ok) {
        throw new Error("Arquivo de assinaturas não encontrado");
      }
      
      const data: Record<string, OldSubscription> = await response.json();
      const subscriptions = Object.values(data);
      
      addLog(`📊 Total de assinaturas encontradas: ${subscriptions.length}`);
      
      // Filter active subscriptions (expires_at > now)
      const now = new Date();
      const activeSubscriptions = subscriptions.filter(sub => {
        const expiresAt = new Date(sub.expiresAt);
        return expiresAt > now;
      });
      
      addLog(`✅ Assinaturas ativas (não expiradas): ${activeSubscriptions.length}`);
      addLog(`⏭️ Assinaturas expiradas (ignoradas): ${subscriptions.length - activeSubscriptions.length}`);
      
      let imported = 0;
      let skipped = 0;
      let errors = 0;
      
      for (let i = 0; i < activeSubscriptions.length; i++) {
        const sub = activeSubscriptions[i];
        setProgress(Math.round(((i + 1) / activeSubscriptions.length) * 100));
        
        try {
          // Check if subscription already exists
          const { data: existing } = await supabase
            .from("telegram_subscriptions")
            .select("id")
            .eq("telegram_user_id", sub.userId)
            .eq("bot_id", botId)
            .eq("txid", sub.txid)
            .maybeSingle();
          
          if (existing) {
            addLog(`⏭️ Usuário ${sub.userId} já existe (txid: ${sub.txid.substring(0, 8)}...)`);
            skipped++;
            continue;
          }
          
          // Map old plan codes to new ones
          const planCodeMap: Record<string, string> = {
            "PLANO_1D": "diario",
            "PLANO_7D": "semanal", 
            "PLANO_15D": "quinzenal",
            "PLANO_30D": "mensal",
          };
          
          const newPlanCode = planCodeMap[sub.planCode] || sub.planCode.toLowerCase();
          
          // Insert subscription
          const { error } = await supabase
            .from("telegram_subscriptions")
            .insert({
              telegram_user_id: sub.userId,
              bot_id: botId,
              plan_code: newPlanCode,
              plan_name: sub.planName,
              plan_days: sub.planDays,
              value: sub.value,
              txid: sub.txid,
              started_at: sub.startedAt,
              expires_at: sub.expiresAt,
              status: "active",
            });
          
          if (error) {
            addLog(`❌ Erro ao importar ${sub.userId}: ${error.message}`);
            errors++;
          } else {
            addLog(`✅ Importado: ${sub.userId} - ${sub.planName} (expira: ${new Date(sub.expiresAt).toLocaleDateString("pt-BR")})`);
            imported++;
          }
        } catch (err) {
          addLog(`❌ Erro: ${(err as Error).message}`);
          errors++;
        }
      }
      
      setResults({
        total: subscriptions.length,
        active: activeSubscriptions.length,
        imported,
        skipped,
        errors,
      });
      
      addLog(`\n🎉 Migração concluída!`);
      addLog(`   Importados: ${imported}`);
      addLog(`   Já existentes: ${skipped}`);
      addLog(`   Erros: ${errors}`);
      
      if (imported > 0) {
        toast.success(`${imported} assinaturas importadas com sucesso!`);
      }
      
    } catch (err) {
      addLog(`❌ Erro fatal: ${(err as Error).message}`);
      toast.error("Erro ao migrar assinaturas");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="animate-fade-in space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(`/bots/${botId}/settings`)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold">Migrar Assinaturas</h1>
            <p className="text-sm text-muted-foreground">
              Importar assinaturas do bot antigo
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Migration Card */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-primary" />
                Importar Assinaturas
              </CardTitle>
              <CardDescription>
                Importar usuários com assinaturas ativas do bot antigo para o novo sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <p className="text-sm text-amber-200">
                  ⚠️ <strong>Atenção:</strong> Esta ação irá importar apenas assinaturas que ainda não expiraram. 
                  Assinaturas já existentes no sistema serão ignoradas.
                </p>
              </div>

              {loading && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Progresso</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} />
                </div>
              )}

              <Button 
                variant="glow" 
                className="w-full" 
                onClick={handleMigrate}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Migrando...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Iniciar Migração
                  </>
                )}
              </Button>

              {results && (
                <div className="grid grid-cols-2 gap-3 pt-4">
                  <div className="p-3 rounded-lg bg-secondary/50 text-center">
                    <p className="text-2xl font-bold">{results.total}</p>
                    <p className="text-xs text-muted-foreground">Total</p>
                  </div>
                  <div className="p-3 rounded-lg bg-primary/10 text-center">
                    <p className="text-2xl font-bold text-primary">{results.active}</p>
                    <p className="text-xs text-muted-foreground">Ativos</p>
                  </div>
                  <div className="p-3 rounded-lg bg-green-500/10 text-center">
                    <p className="text-2xl font-bold text-green-500">{results.imported}</p>
                    <p className="text-xs text-muted-foreground">Importados</p>
                  </div>
                  <div className="p-3 rounded-lg bg-amber-500/10 text-center">
                    <p className="text-2xl font-bold text-amber-500">{results.skipped}</p>
                    <p className="text-xs text-muted-foreground">Ignorados</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Logs Card */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Log de Importação
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] overflow-y-auto p-3 rounded-lg bg-secondary/50 font-mono text-xs space-y-1">
                {logs.length === 0 ? (
                  <p className="text-muted-foreground">Clique em "Iniciar Migração" para começar...</p>
                ) : (
                  logs.map((log, i) => (
                    <p key={i} className={
                      log.includes("❌") ? "text-red-400" :
                      log.includes("✅") ? "text-green-400" :
                      log.includes("⏭️") ? "text-amber-400" :
                      log.includes("🎉") ? "text-primary font-bold" :
                      "text-foreground"
                    }>
                      {log}
                    </p>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
