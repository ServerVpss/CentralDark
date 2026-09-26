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
