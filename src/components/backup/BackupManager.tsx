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
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
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
import { useBackup, RestoreResult } from "@/hooks/useBackup";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function BackupManager() {
  const {
    isExporting,
    isValidating,
    isRestoring,
    backupPreview,
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
        <CardContent>
          <Button
            variant="glow"
            size="lg"
            className="gap-2 w-full sm:w-auto"
            onClick={exportBackup}
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

          {/* Restore Result */}
          {restoreResult && (
            <div
              className={`rounded-lg border p-4 ${
                restoreResult.success
                  ? "border-success/50 bg-success/5"
                  : "border-destructive/50 bg-destructive/5"
              }`}
            >
              <div className="space-y-3">
                <div
                  className={`flex items-center gap-2 ${
                    restoreResult.success ? "text-success" : "text-destructive"
                  }`}
                >
                  {restoreResult.success ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <AlertTriangle className="h-5 w-5" />
                  )}
                  <span className="font-medium">{restoreResult.message}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>Registros importados: {restoreResult.total_inserted}</p>
                  {restoreResult.total_errors > 0 && (
                    <p className="text-destructive">
                      Erros: {restoreResult.total_errors}
                    </p>
                  )}
                </div>
              </div>
            </div>
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
