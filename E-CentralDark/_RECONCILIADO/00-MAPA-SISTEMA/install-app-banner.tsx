import { useEffect, useState } from "react";
import { useLocation } from "@tanstack/react-router";
import { Download, Smartphone, Monitor, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

type BIPEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const DISMISS_KEY = "install-banner-dismissed-at";
const DISMISS_DAYS = 7;

function isStandalone() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia?.("(display-mode: standalone)").matches ||
    // iOS Safari
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

function detectPlatform(): "ios" | "android" | "desktop" {
  if (typeof navigator === "undefined") return "desktop";
  const ua = navigator.userAgent.toLowerCase();
  if (/iphone|ipad|ipod/.test(ua)) return "ios";
  if (/android/.test(ua)) return "android";
  return "desktop";
}

export function InstallAppBanner() {
  const location = useLocation();
  const [deferred, setDeferred] = useState<BIPEvent | null>(null);
  const [installed, setInstalled] = useState<boolean>(false);
  const [visible, setVisible] = useState(false);
  const [platform, setPlatform] = useState<"ios" | "android" | "desktop">("desktop");
  const [justInstalled, setJustInstalled] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setPlatform(detectPlatform());
    setInstalled(isStandalone());

    const onBIP = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BIPEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferred(null);
      setJustInstalled(true);
      setTimeout(() => setJustInstalled(false), 4000);
    };
    window.addEventListener("beforeinstallprompt", onBIP);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBIP);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  useEffect(() => {
    // só mostra dentro do app logado
    const inApp = location.pathname.startsWith("/app");
    if (!inApp) return setVisible(false);
    if (installed) return setVisible(false);
    try {
      const last = Number(localStorage.getItem(DISMISS_KEY) ?? "0");
      const diff = Date.now() - last;
      if (diff < DISMISS_DAYS * 86400_000) return setVisible(false);
    } catch {}
    // iOS não dispara beforeinstallprompt — mostramos instruções
    // Android/Desktop só mostra quando o evento vier
    if (platform === "ios" || deferred) setVisible(true);
  }, [location.pathname, installed, deferred, platform]);

  const dismiss = () => {
    try { localStorage.setItem(DISMISS_KEY, String(Date.now())); } catch {}
    setVisible(false);
  };

  const install = async () => {
    if (!deferred) return;
    await deferred.prompt();
    const { outcome } = await deferred.userChoice;
    if (outcome === "accepted") {
      setDeferred(null);
      setVisible(false);
    } else {
      dismiss();
    }
  };

  if (justInstalled) {
    return (
      <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm text-primary shadow-lg backdrop-blur">
        <span className="inline-flex items-center gap-2">
          <Check className="h-4 w-4" /> App instalado com sucesso
        </span>
      </div>
    );
  }

  if (!visible) return null;

  const Icon = platform === "desktop" ? Monitor : Smartphone;
  const title =
    platform === "desktop"
      ? "Instalar MultiZap no computador"
      : "Instalar MultiZap no celular";
  const subtitle =
    platform === "ios"
      ? "Toque em Compartilhar e depois em 'Adicionar à Tela de Início'."
      : platform === "desktop"
      ? "Acesso rápido com janela própria, sem abrir o navegador."
      : "Abra como app, com ícone na tela inicial e notificações.";

  return (
    <div className="fixed bottom-4 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 overflow-hidden rounded-xl border border-border bg-card/95 shadow-2xl backdrop-blur">
      <div className="flex items-start gap-3 p-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground">{title}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
          <div className="mt-3 flex gap-2">
            {deferred && (
              <Button size="sm" onClick={install} className="h-8 gap-1.5">
                <Download className="h-3.5 w-3.5" /> Instalar agora
              </Button>
            )}
            <Button size="sm" variant="ghost" onClick={dismiss} className="h-8">
              Agora não
            </Button>
          </div>
        </div>
        <button
          onClick={dismiss}
          aria-label="Fechar"
          className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
