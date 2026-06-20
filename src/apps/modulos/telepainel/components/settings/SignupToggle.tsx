import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Power, UserPlus } from "lucide-react";
import { useSystemSetting } from "@/hooks/useSystemSetting";
import { toast } from "sonner";

export function SignupToggle() {
  const { value, loading, update } = useSystemSetting<{ enabled: boolean }>(
    "signup_enabled",
    { enabled: false }
  );

  const enabled = !!value?.enabled;

  const handleToggle = async (checked: boolean) => {
    const { error } = await update({ enabled: checked });
    if (error) {
      toast.error("Falha ao atualizar");
      return;
    }
    toast.success(checked ? "Cadastros LIGADOS 🔌" : "Cadastros DESLIGADOS ⛔");
  };

  return (
    <Card className="border-border bg-card shadow-3d-soft">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Cadastro de Contas
        </CardTitle>
        <CardDescription>
          Tomada geral. Quando desligado, novos usuários não conseguem criar conta.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          className={`flex items-center justify-between rounded-xl border p-4 transition-colors ${
            enabled
              ? "border-emerald-500/40 bg-emerald-500/5"
              : "border-destructive/40 bg-destructive/5"
          }`}
        >
          <div className="flex items-center gap-4">
            <div
              className={`rounded-lg p-3 ${
                enabled ? "bg-emerald-500/15 text-emerald-500" : "bg-destructive/15 text-destructive"
              }`}
            >
              <Power className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold">
                {enabled ? "Ligado — aceitando cadastros" : "Desligado — cadastros bloqueados"}
              </p>
              <p className="text-sm text-muted-foreground">
                Apenas administradores podem alterar este estado.
              </p>
            </div>
          </div>
          <Switch checked={enabled} onCheckedChange={handleToggle} disabled={loading} />
        </div>
      </CardContent>
    </Card>
  );
}
