# OUTRO - NexPixQrModal.tsx
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\apps\crm\src\components\nexchat\NexPixQrModal.tsx
**SHA:** 34d216427914ce58
**Timestamp:** 2026-08-26T19:31:10.588168
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: 12 }}>

### Ouro Bruto (primeiros 5000 chars)
```
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Copy } from "lucide-react";

export function NexPixQrModal({
  open,
  onOpenChange,
  qrImageUrl,
  pixCopyPaste,
  amount,
  onCopy,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  qrImageUrl?: string;
  pixCopyPaste?: string;
  amount?: number;
  onCopy?: (code: string) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="nexchat-root sm:max-w-md">
        <DialogHeader>
          <DialogTitle>QR Code PIX</DialogTitle>
        </DialogHeader>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: 12 }}>
          {amount !== undefined && (
            <div className="nx-pay-amount">R$ {amount.toFixed(2).replace(".", ",")}</div>
          )}
          {qrImageUrl ? (
            <img src={qrImageUrl} alt="QR Code PIX" style={{ width: 240, height: 240, borderRadius: 16, background: "#fff", padding: 12 }} />
          ) : (
            <div style={{ width: 240, height: 240, background: "var(--nx-surface-hover)", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--nx-text-muted)", fontSize: 13 }}>
              QR indisponível
            </div>
          )}
          {pixCopyPaste && (
            <>
              <div className="nx-pay-pix" style={{ width: "100%" }}>{pixCopyPaste}</div>
              <button type="button" className="nx-btn" data-variant="primary" onClick={() => onCopy?.(pixCopyPaste)}>
                <Copy size={14} /> Copiar PIX
              </button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

```