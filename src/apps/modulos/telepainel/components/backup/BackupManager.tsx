import { useState, useRef } from "react";
import {
  Download,
  Upload,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  FileJson,
  Database,
  RefreshCw,
  Trash2,
  ChevronDown,
  XCircle,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useBackup, RestoreResult, ExportResult, TableResult } from "@/hooks/useBackup";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const TABLE_DISPLAY_NAMES: Record<string, string> = {
  telegram_bots: "Bots do Telegram",
  bot_settings: "Configurações dos Bots",
  bot_security_settings: "Configurações de Segurança",
  telegram_subscriptions: "Assinaturas",
  subscription_plans: "Planos",
  payment_gateways: "Gateways de Pagamento",
  payment_gateway_settings: "Config. de Gateway",
  pix_transactions: "Transações PIX",
  pending_payments: "Pagamentos Pendentes",
  engagement_messages: "Mensagens de Engajamento",
  profiles: "Perfis",
  query_history: "Histórico de Consultas",
  bot_analytics: "Análises",
  payment_history: "Histórico de Pagamentos",
  telegram_messages: "Mensagens do Telegram",
  api_providers: "Provedores de API",
  api_usage_logs: "Logs de Uso da API",
  audit_logs: "Logs de Auditoria",
  bot_conversation_states: "Estados de Conversa",
  edge_function_health: "Saúde das Edge Functions",
  paginated_results: "Resultados Paginados",
  processed_updates: "Updates Processados",
  
  scheduled_broadcasts: "Broadcasts Agendados",
  telegram_user_terms: "Termos de Usuários",
  user_roles: "Papéis de Usuários",
};

function TableResultItem({ result }: { result: TableResult }) {
  const hasErrors = result.errors.length > 0;
  const displayName = TABLE_DISPLAY_NAMES[result.table] || result.table;
  
  return (
    <AccordionItem value={result.table} className="border-b border-border/50">
      <AccordionTrigger className="py-2 hover:no-underline">
        <div className="flex items-center gap-3 w-full">
          {hasErrors ? (
            <XCircle className="h-4 w-4 text-destructive flex-shrink-0" />
          ) : (
            <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0" />
          )}
          <span className="text-sm font-medium flex-1 text-left">{displayName}</span>
          <div className="flex items-center gap-2">
            {result.count > 0 && (
              <Badge variant="secondary" className="text-xs">
                {result.count} registros
              </Badge>
            )}
            {hasErrors && (
              <Badge variant="destructive" className="text-xs">
                {result.errors.length} erro{result.errors.length > 1 ? "s" : ""}
              </Badge>
            )}
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="pb-3">
        <div className="pl-7 space-y-2">
          {result.count > 0 && (
            <p className="text-sm text-muted-foreground">
              ✓ {result.count} registro{result.count > 1 ? "s" : ""} processado{result.count > 1 ? "s" : ""} com sucesso
            </p>
          )}
          {hasErrors && (
            <div className="space-y-1">
              <p className="text-sm text-destructive font-medium">Erros encontrados:</p>
              {result.errors.map((error, idx) => (
                <p key={idx} className="text-xs text-destructive/80 pl-2 border-l-2 border-destructive/30">
                  {error}
                </p>
              ))}
            </div>
          )}
          {result.count === 0 && !hasErrors && (
            <p className="text-sm text-muted-foreground">Nenhum registro para processar</p>
          )}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

function ResultsSummary({ 
  results, 
  type,
  totalCount,
  totalErrors,
}: { 
  results: TableResult[];
  type: "export" | "restore";
  totalCount: number;
  totalErrors: number;
}) {
  const hasErrors = totalErrors > 0;
  const successTables = results.filter(r => r.errors.length === 0 && r.count > 0);
  const errorTables = results.filter(r => r.errors.length > 0);
  const emptyTables = results.filter(r => r.count === 0 && r.errors.length === 0);
  
  return (
    <div className="space-y-4 animate-fade-in">
      {/* Summary Header */}
      <div className={`rounded-lg border p-4 ${
        hasErrors 
          ? "border-warning/50 bg-warning/5" 
          : "border-success/50 bg-success/5"
      }`}>
        <div className="flex items-center gap-2 mb-3">
          {hasErrors ? (
            <AlertTriangle className="h-5 w-5 text-warning" />
          ) : (
            <CheckCircle2 className="h-5 w-5 text-success" />
          )}
          <span className={`font-medium ${hasErrors ? "text-warning" : "text-success"}`}>
            {type === "export" ? "Backup" : "Restauração"} {hasErrors ? "concluído com avisos" : "concluído com sucesso"}
          </span>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
          <div className="bg-background/50 rounded-lg p-2 text-center">
            <p className="text-2xl font-bold text-foreground">{totalCount}</p>
            <p className="text-xs text-muted-foreground">Registros</p>
          </div>
          <div className="bg-background/50 rounded-lg p-2 text-center">
            <p className="text-2xl font-bold text-success">{successTables.length}</p>
            <p className="text-xs text-muted-foreground">Tabelas OK</p>
          </div>
          <div className="bg-background/50 rounded-lg p-2 text-center">
            <p className={`text-2xl font-bold ${errorTables.length > 0 ? "text-destructive" : "text-muted-foreground"}`}>
              {errorTables.length}
            </p>
            <p className="text-xs text-muted-foreground">Com Erros</p>
          </div>
          <div className="bg-background/50 rounded-lg p-2 text-center">
            <p className="text-2xl font-bold text-muted-foreground">{emptyTables.length}</p>
            <p className="text-xs text-muted-foreground">Vazias</p>
          </div>
        </div>
      </div>

      {/* Detailed Results */}
      <div className="rounded-lg border border-border bg-card/50">
        <div className="p-3 border-b border-border bg-muted/30">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Database className="h-4 w-4" />
            Detalhes por Tabela
          </h4>
        </div>
        <Accordion type="multiple" className="px-3">
          {results.map((result) => (
            <TableResultItem key={result.table} result={result} />
          ))}
        </Accordion>
      </div>
    </div>
  );
}

export function BackupManager() {
  const {
    isExporting,
    isValidating,
    isRestoring,
    backupPreview,
    progress,
    exportBackup,
    validateBackup,
    restoreBackup,
    clearPreview,
  } = useBackup();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [restoreMode, setRestoreMode] = useState<"merge" | "replace">("merge");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [restoreResult, setRestoreResult] = useState<RestoreResult | null>(null);
  const [exportResult, setExportResult] = useState<ExportResult | null>(null);

  const handleExport = async () => {
    setExportResult(null);
    const result = await exportBackup();
    if (result) {
      setExportResult(result);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setRestoreResult(null);
    await validateBackup(file);
  };

  const handleRestore = async () => {
    if (!selectedFile || !backupPreview?.valid) return;

    setShowConfirmDialog(false);
    setConfirmText("");

    const result = await restoreBackup(selectedFile, restoreMode);
    setRestoreResult(result);

    if (result?.success) {
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    setRestoreResult(null);
    clearPreview();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-6">
      {/* Export Card */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-3">
              <Database className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle>Backup Completo</CardTitle>
              <CardDescription>
                Faça um backup de todos os seus dados: bots, assinaturas, planos,
                configurações e histórico.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Progress Bar for Export */}
          {isExporting && progress && (
            <div className="space-y-3 p-4 rounded-lg border border-primary/30 bg-primary/5 animate-fade-in">
              <div className="flex items-center justify-between text-sm">
                <span className="text-foreground font-medium">{progress.step}</span>
                <span className="text-primary font-bold">{progress.percentage}%</span>
              </div>
              <Progress value={progress.percentage} className="h-3" />
              <p className="text-xs text-muted-foreground">
                Processando dados... Por favor, aguarde.
              </p>
            </div>
          )}

          <Button
            variant="glow"
            size="lg"
            className="gap-2 w-full sm:w-auto"
            onClick={handleExport}
            disabled={isExporting}
          >
            {isExporting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Gerando Backup...
              </>
            ) : (
              <>
                <Download className="h-5 w-5" />
                Criar Backup Agora
              </>
            )}
          </Button>

          {/* Export Results Summary */}
          {exportResult && !isExporting && (
            <ResultsSummary
              results={exportResult.results}
              type="export"
              totalCount={exportResult.total_records}
              totalErrors={exportResult.total_errors}
            />
          )}
        </CardContent>
      </Card>

      {/* Restore Card */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-warning/10 p-3">
              <RefreshCw className="h-6 w-6 text-warning" />
            </div>
            <div>
              <CardTitle>Restaurar Backup</CardTitle>
              <CardDescription>
                Restaure seus dados a partir de um arquivo de backup JSON.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* File Upload */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileSelect}
                className="hidden"
                id="backup-file"
              />
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => fileInputRef.current?.click()}
                disabled={isValidating}
              >
                {isValidating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Validando...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Selecionar Arquivo
                  </>
                )}
              </Button>
              {selectedFile && (
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="gap-1">
                    <FileJson className="h-3 w-3" />
                    {selectedFile.name}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={handleClearFile}
                  >
                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Preview */}
          {backupPreview && (
            <div
              className={`rounded-lg border p-4 ${
                backupPreview.valid
                  ? "border-success/50 bg-success/5"
                  : "border-destructive/50 bg-destructive/5"
              }`}
            >
              {backupPreview.valid ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-success">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="font-medium">Backup válido</span>
                  </div>
                  <div className="grid gap-2 text-sm">
                    <p>
                      <span className="text-muted-foreground">Versão:</span>{" "}
                      {backupPreview.version}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Criado em:</span>{" "}
                      {backupPreview.created_at &&
                        format(new Date(backupPreview.created_at), "dd/MM/yyyy 'às' HH:mm", {
                          locale: ptBR,
                        })}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Total de registros:</span>{" "}
                      {backupPreview.metadata?.total_records}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Tabelas com dados:</span>{" "}
                      {backupPreview.metadata?.tables_count}
                    </p>
                  </div>
                  {backupPreview.tables_summary && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {backupPreview.tables_summary
                        .filter((t) => t.records > 0)
                        .map((table) => (
                          <Badge key={table.name} variant="outline" className="text-xs">
                            {table.name}: {table.records}
                          </Badge>
                        ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="h-5 w-5" />
                  <span>{backupPreview.error}</span>
                </div>
              )}
            </div>
          )}

          {/* Restore Options */}
          {backupPreview?.valid && (
            <div className="space-y-4">
              <div className="rounded-lg border border-warning/50 bg-warning/5 p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-warning mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-warning">Atenção!</p>
                    <p className="text-muted-foreground">
                      A restauração pode sobrescrever dados existentes. Escolha o modo de
                      restauração com cuidado.
                    </p>
                  </div>
                </div>
              </div>

              <RadioGroup
                value={restoreMode}
                onValueChange={(v) => setRestoreMode(v as "merge" | "replace")}
                className="space-y-3"
              >
                <div className="flex items-start space-x-3 rounded-lg border border-border bg-secondary/20 p-4">
                  <RadioGroupItem value="merge" id="merge" className="mt-1" />
                  <Label htmlFor="merge" className="cursor-pointer">
                    <p className="font-medium">Mesclar com dados existentes</p>
                    <p className="text-sm text-muted-foreground">
                      Adiciona os dados do backup sem remover dados atuais. Ignora duplicatas.
                    </p>
                  </Label>
                </div>
                <div className="flex items-start space-x-3 rounded-lg border border-border bg-secondary/20 p-4">
                  <RadioGroupItem value="replace" id="replace" className="mt-1" />
                  <Label htmlFor="replace" className="cursor-pointer">
                    <p className="font-medium text-destructive">Substituir tudo</p>
                    <p className="text-sm text-muted-foreground">
                      Remove todos os dados atuais antes de importar. Use com cuidado!
                    </p>
                  </Label>
                </div>
              </RadioGroup>

              {/* Progress Bar for Restore */}
              {isRestoring && progress && (
                <div className="space-y-3 p-4 rounded-lg border border-warning/30 bg-warning/5 animate-fade-in">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-foreground font-medium">{progress.step}</span>
                    <span className="text-warning font-bold">{progress.percentage}%</span>
                  </div>
                  <Progress value={progress.percentage} className="h-3" />
                  <p className="text-xs text-muted-foreground">
                    Restaurando dados... Não feche esta página.
                  </p>
                </div>
              )}

              <Button
                variant={restoreMode === "replace" ? "destructive" : "default"}
                size="lg"
                className="gap-2 w-full sm:w-auto"
                onClick={() => setShowConfirmDialog(true)}
                disabled={isRestoring}
              >
                {isRestoring ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Restaurando...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-5 w-5" />
                    Restaurar Backup
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Restore Results Summary */}
          {restoreResult && !isRestoring && (
            <ResultsSummary
              results={restoreResult.results}
              type="restore"
              totalCount={restoreResult.total_inserted}
              totalErrors={restoreResult.total_errors}
            />
          )}
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Restauração</AlertDialogTitle>
            <AlertDialogDescription className="space-y-4">
              <p>
                {restoreMode === "replace"
                  ? "Você está prestes a SUBSTITUIR todos os seus dados atuais. Esta ação não pode ser desfeita."
                  : "Você está prestes a mesclar os dados do backup com seus dados atuais."}
              </p>
              {restoreMode === "replace" && (
                <div className="space-y-2">
                  <Label htmlFor="confirm-text">
                    Digite <strong>CONFIRMAR</strong> para prosseguir:
                  </Label>
                  <Input
                    id="confirm-text"
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    placeholder="CONFIRMAR"
                    className="bg-secondary/50"
                  />
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConfirmText("")}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRestore}
              disabled={restoreMode === "replace" && confirmText !== "CONFIRMAR"}
              className={restoreMode === "replace" ? "bg-destructive hover:bg-destructive/90" : ""}
            >
              {restoreMode === "replace" ? "Substituir Tudo" : "Mesclar Dados"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
