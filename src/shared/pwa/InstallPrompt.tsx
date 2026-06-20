import { useState } from "react";
import { Download, X, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePWA } from "@/hooks/usePWA";
import { cn } from "@/lib/utils";

export function InstallPrompt() {
  const { canInstall, isIOS, install, isInstalled } = usePWA();
  const [dismissed, setDismissed] = useState(false);

  if (isInstalled || dismissed) return null;

  // Show iOS instructions
  if (isIOS && !isInstalled) {
    return (
      <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96">
        <div className="rounded-2xl border border-border/50 bg-card/95 backdrop-blur-lg p-4 shadow-2xl">
          <button
            onClick={() => setDismissed(true)}
            className="absolute top-2 right-2 p-1 rounded-full hover:bg-muted transition-colors"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
          
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-amber-600">
              <Smartphone className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Instalar TelePanel</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Toque em <span className="font-semibold">Compartilhar</span> e depois em{" "}
                <span className="font-semibold">"Adicionar à Tela Inicial"</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show install button for Android/Desktop
  if (!canInstall) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96 animate-slide-up">
      <div className="rounded-2xl border border-border/50 bg-card/95 backdrop-blur-lg p-4 shadow-2xl">
        <button
          onClick={() => setDismissed(true)}
          className="absolute top-2 right-2 p-1 rounded-full hover:bg-muted transition-colors"
        >
          <X className="h-4 w-4 text-muted-foreground" />
        </button>
        
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-amber-600">
            <Download className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-sm">Instalar TelePanel</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Instale o app para acesso rápido e experiência nativa
            </p>
            <Button
              size="sm"
              onClick={install}
              className="mt-3 h-8 bg-gradient-to-r from-primary to-amber-600 text-primary-foreground"
            >
              <Download className="h-3.5 w-3.5 mr-1.5" />
              Instalar Agora
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
