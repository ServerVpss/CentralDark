import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RefreshCw, Smartphone, ExternalLink } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** URL temporária da VPS pra preview (default: domínio de staging/centralldark). */
  url?: string;
}

const DEFAULT_PREVIEW_URL = "https://centralldark.com";

export function IPhonePreviewModal({ open, onOpenChange, url }: Props) {
  const [src, setSrc] = useState(url ?? DEFAULT_PREVIEW_URL);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!autoRefresh) return;
    const t = setInterval(() => setReloadKey((k) => k + 1), 5000);
    return () => clearInterval(t);
  }, [autoRefresh]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[420px] p-0 bg-transparent border-none shadow-none">
        <DialogHeader className="sr-only">
          <DialogTitle>Preview iPhone</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center">
          {/* Barra de controles */}
          <div className="w-full flex items-center gap-2 mb-3 px-1">
            <input
              value={src}
              onChange={(e) => setSrc(e.target.value)}
              className="flex-1 bg-card/80 backdrop-blur rounded-md border border-border/40 px-2 py-1.5 text-xs font-mono"
              spellCheck={false}
            />
            <Button size="icon" variant="outline" onClick={() => setReloadKey((k) => k + 1)} title="Recarregar">
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
            <Button size="icon" variant="outline" asChild title="Abrir em nova aba">
              <a href={src} target="_blank" rel="noreferrer">
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </Button>
          </div>

          {/* Frame iPhone */}
          <div className="relative w-[360px] h-[720px] rounded-[44px] bg-zinc-900 p-3 shadow-2xl ring-1 ring-black/20">
            {/* Notch */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-32 h-6 bg-zinc-900 rounded-b-2xl z-20" />
            {/* Tela */}
            <div className="relative w-full h-full rounded-[32px] overflow-hidden bg-white">
              <iframe
                key={reloadKey}
                ref={iframeRef}
                src={src}
                className="w-full h-full border-0"
                title="Preview VPS"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              />
            </div>
            {/* Indicador home */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-28 h-1 bg-zinc-700 rounded-full" />
          </div>

          {/* Footer */}
          <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
            <Smartphone className="h-3.5 w-3.5" />
            <label className="flex items-center gap-1 cursor-pointer">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
              />
              Auto-refresh 5s
            </label>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
