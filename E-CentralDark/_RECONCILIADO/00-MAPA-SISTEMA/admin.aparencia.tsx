import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Palette, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { getActiveTheme, setActiveTheme } from "@/lib/master-theme.functions";

function AparenciaPage() {
  const fnGet = useServerFn(getActiveTheme);
  const fnSet = useServerFn(setActiveTheme);
  const qc = useQueryClient();

  const q = useQuery({
    queryKey: ["active-theme"],
    queryFn: () => fnGet(),
    staleTime: 30_000,
  });

  const [enabled, setEnabled] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (q.data) setEnabled(!!q.data.enabled);
  }, [q.data]);

  async function handleToggle(next: boolean) {
    setSaving(true);
    const previous = enabled;
    setEnabled(next);
    try {
      await fnSet({ data: { enabled: next, mode: next ? "nexchat" : "current" } });
      await qc.invalidateQueries({ queryKey: ["active-theme"] });
      toast.success(next ? "Tema NexChat ativado" : "Tema atual restaurado");
    } catch (e: any) {
      setEnabled(previous);
      toast.error(e?.message ?? "Falha ao salvar tema");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="container mx-auto max-w-3xl space-y-6 p-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Aparência</h1>
        <p className="text-sm text-muted-foreground">
          Controle global do tema visual do MultiZap. Mudanças aqui afetam apenas as áreas que
          o time já liberou (próxima fase aplica em <code>/app/inbox</code>).
        </p>
      </header>

      <Card className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex gap-3">
            <div className="rounded-xl bg-primary/10 p-3 text-primary">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Tema NexChat (premium)</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Visual messenger moderno com glassmorphism, animações suaves e composer
                redesenhado. Atualmente disponível em <strong>preview</strong> — quando ligado,
                substitui o visual do inbox nas próximas rotas habilitadas.
              </p>
              <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
                Rollback imediato: desative aqui que volta tudo ao tema atual.
              </p>
            </div>
          </div>
          <Switch checked={enabled} onCheckedChange={handleToggle} disabled={saving || q.isLoading} />
        </div>

        <div className="mt-6 flex flex-wrap gap-3 border-t pt-4">
          <Button asChild variant="secondary">
            <Link to="/admin/aparencia/nexchat-preview">
              <Palette className="mr-2 h-4 w-4" />
              Ver preview do tema NexChat
            </Link>
          </Button>
          <Button asChild variant="ghost">
            <Link to="/admin/inbox">
              <ExternalLink className="mr-2 h-4 w-4" />
              Inbox master (aplicação futura)
            </Link>
          </Button>
        </div>
      </Card>

      <Card className="p-6 text-sm text-muted-foreground space-y-2">
        <h3 className="font-semibold text-foreground">Estado atual</h3>
        <div>Modo: <code>{q.data?.mode ?? "current"}</code></div>
        <div>Ativo: <code>{String(q.data?.enabled ?? false)}</code></div>
        <p className="pt-2 text-xs">
          A aplicação no <code>/app/inbox</code>, <code>/app/chat</code> e <code>/admin/inbox</code>
          é feita em fase separada para permitir validação visual antes do rollout.
        </p>
      </Card>
    </div>
  );
}

export const Route = createFileRoute("/admin/aparencia")({
  component: AparenciaPage,
});
