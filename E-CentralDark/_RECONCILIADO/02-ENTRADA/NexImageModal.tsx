import { X } from "lucide-react";

export function NexImageModal({
  open,
  onOpenChange,
  url,
  alt,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  url?: string;
  alt?: string;
}) {
  if (!open || !url) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={() => onOpenChange(false)}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.85)",
        zIndex: 60,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <button
        type="button"
        onClick={() => onOpenChange(false)}
        aria-label="Fechar"
        style={{
          position: "absolute",
          top: 16,
          right: 16,
          background: "rgba(255,255,255,0.1)",
          color: "#fff",
          border: 0,
          borderRadius: 999,
          width: 40,
          height: 40,
          display: "grid",
          placeItems: "center",
          cursor: "pointer",
        }}
      >
        <X size={20} />
      </button>
      <img
        src={url}
        alt={alt ?? "imagem"}
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "92vw", maxHeight: "88vh", borderRadius: 12 }}
      />
    </div>
  );
}
