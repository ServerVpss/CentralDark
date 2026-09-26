# OUTRO - PixModal.tsx
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\apps\crm\src\components\pix\PixModal.tsx
**SHA:** cb818f0d2fe02b9e
**Timestamp:** 2026-08-26T19:31:12.408920
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
- borderRadius: 8, padding: 14, marginBottom: 16, display: "flex", gap: 10, alignItems: "flex-start",
- <div style={{ display: "flex", gap: 4, marginBottom: 16, borderBottom: "1px solid var(--nx-border, #2a3142)" }}>
- <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
- display: "flex", alignItems: "center", gap: 6, padding: "8px 14px",

### Ouro Bruto (primeiros 5000 chars)
```
// Modal de envio de PIX no chat.
// Fase 1: chave cadastrada + manual (estático). Avisa antes se houver risco
// (fora da janela 24h, sem chave selecionada etc).
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { QrCode, KeyRound, Edit3, Loader2, AlertTriangle, X } from "lucide-react";

import { listPixStaticKeys } from "@/lib/pix-keys.functions";
import { sendPixMessage } from "@/lib/pix-send.functions";

type PixModalProps = {
  open: boolean;
  onClose: () => void;
  workspaceId: string;
  ticketId: string;
};

type Tab = "static" | "manual";

export function PixModal({ open, onClose, workspaceId, ticketId }: PixModalProps) {
  const [tab, setTab] = useState<Tab>("static");
  const [selectedKeyId, setSelectedKeyId] = useState<string>("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");

  // Manual
  const [mKey, setMKey] = useState("");
  const [mType, setMType] = useState<"cpf" | "cnpj" | "email" | "phone" | "random">("cpf");
  const [mName, setMName] = useState("");
  const [mCity, setMCity] = useState("SAO PAULO");

  const [showOutOfWindowWarn, setShowOutOfWindowWarn] = useState(false);

  const listFn = useServerFn(listPixStaticKeys);
  const sendFn = useServerFn(sendPixMessage);

  const keysQuery = useQuery({
    queryKey: ["pix-static-keys", workspaceId],
    queryFn: () => listFn({ data: { workspaceId } }),
    enabled: open && tab === "static",
  });

  const keys = keysQuery.data?.keys ?? [];

  const sendM = useMutation({
    mutationFn: async () => {
      const amt = parseFloat(amount.replace(",", "."));
      if (!amt || amt <= 0) throw new Error("Informe um valor válido.");

      const payload =
        tab === "static"
          ? {
              ticketId,
              source: "static" as const,
              staticKeyId: selectedKeyId,
              amount: amt,
              description: description || undefined,
              acknowledgedOutOfWindow: false,
            }
          : {
              ticketId,
              source: "manual" as const,
              manual: {
                key: mKey,
                keyType: mType,
                beneficiaryName: mName,
                beneficiaryCity: mCity || "SAO PAULO",
              },
              amount: amt,
              description: description || undefined,
              acknowledgedOutOfWindow: false,
            };
      return await sendFn({ data: payload });
    },
    onSuccess: (res) => {
      if (res.ok) {
        toast.success(`PIX de R$ ${res.amount.toFixed(2)} enviado.`);
        onClose();
      } else if (res.code === "OUT_OF_WINDOW") {
        setShowOutOfWindowWarn(true);
      } else {
        toast.error(res.message);
      }
    },
    onError: (e) => toast.error((e as Error).message),
  });

  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 200,
        display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "var(--nx-surface, #1a1f2e)", borderRadius: 12, padding: 20,
          maxWidth: 520, width: "100%", color: "var(--nx-text, #fff)",
          border: "1px solid var(--nx-border, #2a3142)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <QrCode size={22} color="#22c55e" />
            <h3 style={{ margin: 0, fontSize: 18 }}>Enviar PIX</h3>
          </div>
          <button type="button" onClick={onClose} aria-label="Fechar" style={{ background: "none", border: "none", color: "inherit", cursor: "pointer" }}>
            <X size={20} />
          </button>
        </div>

        {showOutOfWindowWarn ? (
          <div>
            <div style={{
              background: "rgba(245, 158, 11, 0.12)", border: "1px solid rgba(245, 158, 11, 0.4)",
              borderRadius: 8, padding: 14, marginBottom: 16, display: "flex", gap: 10, alignItems: "flex-start",
            }}>
              <AlertTriangle size={20} color="#f59e0b" style={{ flexShrink: 0, marginTop: 2 }} />
              <div style={{ fontSize: 14, lineHeight: 1.5 }}>
                <strong>Conversa fora da janela de 24h.</strong><br />
                O cliente não envia mensagem há mais de 24h. Pela regra do WhatsApp, só dá pra enviar via
                <strong> template aprovado pela Meta</strong>. Mandar mensagem livre agora pode bloquear seu número.
                <br /><br />
                O envio por template estará disponível em breve. Por enquanto, peça pro cliente mandar qualquer mensagem antes pra reabrir a janela.
             
```