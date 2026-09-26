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
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button type="button" className="nx-btn" data-variant="primary" onClick={onClose}>Entendi</button>
            </div>
          </div>
        ) : (
          <>
            {/* Abas */}
            <div style={{ display: "flex", gap: 4, marginBottom: 16, borderBottom: "1px solid var(--nx-border, #2a3142)" }}>
              <TabBtn active={tab === "static"} onClick={() => setTab("static")} icon={<KeyRound size={14} />}>
                Chave cadastrada
              </TabBtn>
              <TabBtn active={tab === "manual"} onClick={() => setTab("manual")} icon={<Edit3 size={14} />}>
                Manual
              </TabBtn>
            </div>

            {tab === "static" && (
              <div style={{ marginBottom: 16 }}>
                <Label>Chave PIX</Label>
                {keysQuery.isLoading ? (
                  <div style={{ padding: 8, color: "var(--nx-text-muted)" }}>Carregando…</div>
                ) : keys.length === 0 ? (
                  <div style={{
                    padding: 12, fontSize: 13, color: "var(--nx-text-muted)",
                    background: "rgba(255,255,255,0.03)", borderRadius: 6,
                  }}>
                    Nenhuma chave cadastrada. Use a aba <strong>Manual</strong> ou cadastre uma chave em
                    Configurações → PIX.
                  </div>
                ) : (
                  <select
                    value={selectedKeyId}
                    onChange={(e) => setSelectedKeyId(e.target.value)}
                    style={inputStyle}
                  >
                    <option value="">Selecione…</option>
                    {keys.map((k) => (
                      <option key={k.id} value={k.id}>
                        {k.label} — {k.beneficiary_name} ({k.key_type.toUpperCase()})
                        {k.is_default ? " ⭐" : ""}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}

            {tab === "manual" && (
              <>
                <div style={{ marginBottom: 12 }}>
                  <Label>Tipo da chave</Label>
                  <select value={mType} onChange={(e) => setMType(e.target.value as typeof mType)} style={inputStyle}>
                    <option value="cpf">CPF</option>
                    <option value="cnpj">CNPJ</option>
                    <option value="email">E-mail</option>
                    <option value="phone">Telefone</option>
                    <option value="random">Chave aleatória</option>
                  </select>
                </div>
                <div style={{ marginBottom: 12 }}>
                  <Label>Chave</Label>
                  <input value={mKey} onChange={(e) => setMKey(e.target.value)} style={inputStyle} placeholder="Ex: 12345678900" />
                </div>
                <div style={{ marginBottom: 12 }}>
                  <Label>Nome do beneficiário</Label>
                  <input value={mName} onChange={(e) => setMName(e.target.value)} style={inputStyle} maxLength={25} />
                </div>
                <div style={{ marginBottom: 12 }}>
                  <Label>Cidade</Label>
                  <input value={mCity} onChange={(e) => setMCity(e.target.value)} style={inputStyle} maxLength={15} />
                </div>
              </>
            )}

            <div style={{ marginBottom: 12 }}>
              <Label>Valor (R$)</Label>
              <input
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/[^0-9.,]/g, ""))}
                style={inputStyle}
                placeholder="0,00"
                inputMode="decimal"
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <Label>Descrição (opcional)</Label>
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={inputStyle}
                maxLength={50}
                placeholder="Ex: Mensalidade plano básico"
              />
            </div>

            <div style={{
              background: "rgba(34, 197, 94, 0.08)", border: "1px solid rgba(34, 197, 94, 0.25)",
              borderRadius: 6, padding: 10, marginBottom: 14, fontSize: 12, color: "var(--nx-text-muted)",
            }}>
              💡 Será enviado: QR Code (imagem) + código copia-e-cola. Antes de enviar, conferimos automaticamente
              se a conversa está dentro da janela de 24h do WhatsApp.
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button type="button" className="nx-btn" onClick={onClose} disabled={sendM.isPending}>
                Cancelar
              </button>
              <button
                type="button"
                className="nx-btn"
                data-variant="primary"
                onClick={() => sendM.mutate()}
                disabled={
                  sendM.isPending ||
                  !amount ||
                  (tab === "static" && !selectedKeyId) ||
                  (tab === "manual" && (!mKey || !mName))
                }
              >
                {sendM.isPending ? <Loader2 size={14} className="animate-spin" /> : <QrCode size={14} />}
                Enviar PIX
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function TabBtn({ active, onClick, icon, children }: { active: boolean; onClick: () => void; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: 6, padding: "8px 14px",
        background: "none", border: "none", borderBottom: active ? "2px solid #22c55e" : "2px solid transparent",
        color: active ? "var(--nx-text)" : "var(--nx-text-muted)", cursor: "pointer", fontSize: 13,
      }}
    >
      {icon} {children}
    </button>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <label style={{ display: "block", fontSize: 12, color: "var(--nx-text-muted)", marginBottom: 4 }}>{children}</label>;
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "8px 10px", background: "var(--nx-bg, #0f1419)",
  border: "1px solid var(--nx-border, #2a3142)", borderRadius: 6,
  color: "var(--nx-text, #fff)", fontSize: 14,
};
