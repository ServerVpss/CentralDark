import { NexPaymentInfo } from "./types";
import { Copy, QrCode, X, CheckCircle2, Clock, AlertCircle } from "lucide-react";

const STATUS_MAP: Record<NexPaymentInfo["status"], { label: string; tone: string; Icon: typeof Clock }> = {
  pending:  { label: "Pendente",  tone: "warn",    Icon: Clock },
  paid:     { label: "Pago",      tone: "success", Icon: CheckCircle2 },
  expired:  { label: "Expirado",  tone: "danger",  Icon: AlertCircle },
  canceled: { label: "Cancelado", tone: "danger",  Icon: X },
};

export function NexPaymentCard({
  payment,
  onCopyPix,
  onOpenQr,
  onCancel,
}: {
  payment: NexPaymentInfo;
  onCopyPix?: (code: string) => void;
  onOpenQr?: () => void;
  onCancel?: () => void;
}) {
  const s = STATUS_MAP[payment.status];
  const Icon = s.Icon;
  const showActions = payment.status === "pending";
  return (
    <div className="nx-pay">
      <div className="nx-pay-head">
        <div className="nx-pay-amount">
          R$ {payment.amount.toFixed(2).replace(".", ",")}
        </div>
        <span className="nx-badge" data-tone={s.tone}>
          <Icon size={12} style={{ marginRight: 4 }} />
          {s.label}
        </span>
      </div>
      <div style={{ display: "flex", gap: 12, fontSize: 12, color: "var(--nx-text-muted)" }}>
        {payment.gateway && <div><strong style={{ color: "var(--nx-text)" }}>Gateway:</strong> {payment.gateway}</div>}
        {payment.validUntil && <div><strong style={{ color: "var(--nx-text)" }}>Válido até:</strong> {payment.validUntil}</div>}
      </div>
      {payment.pixCopyPaste && showActions && (
        <div className="nx-pay-pix" title="PIX Copia e Cola">
          {payment.pixCopyPaste}
        </div>
      )}
      {showActions && (
        <div className="nx-pay-actions">
          {payment.pixCopyPaste && (
            <button
              type="button"
              className="nx-btn"
              data-variant="primary"
              onClick={() => onCopyPix?.(payment.pixCopyPaste!)}
            >
              <Copy size={14} /> Copiar PIX
            </button>
          )}
          <button type="button" className="nx-btn" onClick={onOpenQr}>
            <QrCode size={14} /> Ver QR Code
          </button>
          {onCancel && (
            <button type="button" className="nx-btn" onClick={onCancel}>
              <X size={14} /> Cancelar
            </button>
          )}
        </div>
      )}
    </div>
  );
}
