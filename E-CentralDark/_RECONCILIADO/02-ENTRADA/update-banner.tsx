import { useEffect, useState } from "react";
import { useVersionCheck } from "@/lib/use-version-check";
import { Button } from "@/components/ui/button";
import { RefreshCw, X } from "lucide-react";

const SNOOZE_KEY = "mz_update_snooze_until";

export function UpdateBanner() {
  const { updateAvailable, forceUpdate } = useVersionCheck();
  const [snoozed, setSnoozed] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  useEffect(() => {
    if (!updateAvailable) return;
    if (forceUpdate) {
      // Refresh forçado: 5s e recarrega
      setCountdown(5);
      const t = setInterval(() => {
        setCountdown((c) => {
          if (c == null) return null;
          if (c <= 1) { window.location.reload(); return 0; }
          return c - 1;
        });
      }, 1000);
      return () => clearInterval(t);
    }
    try {
      const until = Number(localStorage.getItem(SNOOZE_KEY) ?? 0);
      setSnoozed(Date.now() < until);
    } catch { /* ignore */ }
  }, [updateAvailable, forceUpdate]);

  if (!updateAvailable || (snoozed && !forceUpdate)) return null;

  const handleReload = () => window.location.reload();
  const handleSnooze = () => {
    try { localStorage.setItem(SNOOZE_KEY, String(Date.now() + 30 * 60 * 1000)); } catch { /* ignore */ }
    setSnoozed(true);
  };

  return (
    <div className="fixed inset-x-0 top-0 z-[100] bg-primary text-primary-foreground shadow-lg">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2.5 text-sm">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          <span className="font-medium">
            {forceUpdate
              ? `Atualização obrigatória — recarregando em ${countdown ?? 5}s…`
              : "Nova versão disponível. Recarregue para usar as melhorias."}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="secondary" onClick={handleReload}>
            <RefreshCw className="mr-1 h-3.5 w-3.5" /> Recarregar agora
          </Button>
          {!forceUpdate && (
            <Button size="sm" variant="ghost" onClick={handleSnooze} className="text-primary-foreground hover:bg-white/10">
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
