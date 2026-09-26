import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Smartphone, Monitor } from "lucide-react";
import {
  NexChatShell,
  NexNavigationRail,
  NexConversationList,
  NexChatHeader,
  NexMessageList,
  NexChatComposer,
  NexContactPanel,
  NexEmptyState,
  NexPixQrModal,
  NexImageModal,
  NexConversationSkeleton,
  type NexConversation,
  type NexMessage,
} from "@/components/nexchat";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// Dados FICTÍCIOS — preview visual. Nenhum dado real do MultiZap é tocado.
const CONVERSATIONS: NexConversation[] = [
  {
    id: "c1",
    contact: { id: "u1", name: "Ana Beatriz", phone: "+55 11 99999-1234", isOnline: true, channel: "meta", tags: ["Lead", "VIP"] },
    lastMessage: "Pode me mandar o PIX?",
    lastTime: "14:32",
    unread: 2,
    channel: "meta",
    connectionStatus: "connected",
  },
  {
    id: "c2",
    contact: { id: "u2", name: "Carlos Mendes", phone: "+55 21 98888-4321", isOnline: false, channel: "multizap_qr" },
    lastMessage: "Recebi o comprovante 👍",
    lastTime: "13:10",
    unread: 0,
    channel: "multizap_qr",
    connectionStatus: "connected",
  },
  {
    id: "c3",
    contact: { id: "u3", name: "Daniela Lopes", phone: "+55 31 97777-9999", isOnline: true, channel: "wuzapi", tags: ["Cliente"] },
    lastMessage: "PIX expirou, gera outro?",
    lastTime: "Ontem",
    unread: 5,
    channel: "wuzapi",
    connectionStatus: "error",
  },
  {
    id: "c4",
    contact: { id: "u4", name: "Eduardo Silva", phone: "+55 41 96666-1212", isOnline: false, channel: "meta" },
    lastMessage: "Aguardando conexão…",
    lastTime: "—",
    unread: 0,
    channel: "meta",
    connectionStatus: "disconnected",
  },
];

const PIX_CODE = "00020126360014BR.GOV.BCB.PIX0114+55119999912340208PAGAMENTO5204000053039865802BR5913MULTIZAP DEMO6009SAO PAULO62070503***6304ABCD";

const MESSAGES_BY_CONV: Record<string, NexMessage[]> = {
  // PIX PENDENTE + imagem + áudio + status
  c1: [
    { id: "m1", author: "them", body: "Oi, boa tarde! Tudo bem?", time: "14:28" },
    { id: "m2", author: "me", body: "Oi Ana! Tudo ótimo 🙌", time: "14:29", status: "read" },
    { id: "m3", author: "them", time: "14:30", media: { kind: "image", url: "https://images.unsplash.com/photo-1556742400-b5b7c5121f6e?w=400&q=70", fileName: "produto.jpg" }, body: "Esse aqui?" },
    { id: "m4", author: "me", body: "Sim, esse mesmo!", time: "14:30", status: "delivered" },
    { id: "m5", author: "them", time: "14:31", media: { kind: "audio", durationLabel: "0:18" } },
    { id: "m6", author: "system", body: "PIX gerado · expira em 5 min" },
    {
      id: "m7", author: "me", time: "14:32", status: "sent",
      payment: { amount: 50, currency: "BRL", status: "pending", gateway: "MisticPay", validUntil: "14:37", pixCopyPaste: PIX_CODE },
    },
  ],
  // PIX PAGO + documento
  c2: [
    { id: "m1", author: "them", body: "Segue o comprovante", time: "13:08", media: { kind: "document", fileName: "comprovante.pdf", sizeLabel: "124 KB" } },
    { id: "m2", author: "system", body: "Pagamento confirmado · R$ 120,00" },
    {
      id: "m3", author: "me", time: "13:09",
      payment: { amount: 120, currency: "BRL", status: "paid", gateway: "Recargas Brasil", validUntil: "13:09" },
    },
    { id: "m4", author: "me", body: "Recebido, obrigado! 🙏", time: "13:10", status: "read" },
  ],
  // PIX EXPIRADO + mensagem falhou
  c3: [
    { id: "m1", author: "them", body: "Bom dia! Quero renovar.", time: "09:12" },
    {
      id: "m2", author: "me", time: "09:15",
      payment: { amount: 35, currency: "BRL", status: "expired", gateway: "MisticPay", validUntil: "09:20" },
    },
    { id: "m3", author: "me", body: "Posso gerar outro PIX?", time: "10:02", status: "failed" },
  ],
  c4: [],
};

function NexChatPreviewPage() {
  const [selectedId, setSelectedId] = useState<string | null>("c1");
  const [pixOpen, setPixOpen] = useState(false);
  const [imgOpen, setImgOpen] = useState<string | null>(null);
  const [mobile, setMobile] = useState(false);
  const [mobileShowChat, setMobileShowChat] = useState(true);
  const [loadingList, setLoadingList] = useState(false);

  const conv = CONVERSATIONS.find((c) => c.id === selectedId) ?? null;
  const messages = selectedId ? (MESSAGES_BY_CONV[selectedId] ?? []) : [];
  const pixPayment = messages.find((m) => m.payment?.status === "pending")?.payment;

  function copyPix(code: string) {
    navigator.clipboard.writeText(code).then(() => toast.success("PIX copiado!"));
  }

  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col">
      <div className="flex items-center justify-between border-b bg-amber-500/10 px-4 py-2 text-xs">
        <div className="flex items-center gap-2 font-semibold text-amber-700 dark:text-amber-300">
          🎨 Preview NexChat · dados fictícios · nada real é alterado
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" onClick={() => setLoadingList((v) => !v)}>
            {loadingList ? "Mostrar lista" : "Skeleton"}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => { setMobile((v) => !v); setMobileShowChat(true); }}>
            {mobile ? <Monitor className="mr-1 h-3.5 w-3.5" /> : <Smartphone className="mr-1 h-3.5 w-3.5" />}
            {mobile ? "Desktop" : "Mobile"}
          </Button>
          <Button asChild size="sm" variant="ghost">
            <Link to="/admin/aparencia"><ArrowLeft className="mr-2 h-3.5 w-3.5" /> Voltar</Link>
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden bg-muted/30 p-4">
        <div
          style={{
            width: mobile ? 390 : "100%",
            height: "100%",
            margin: mobile ? "0 auto" : undefined,
            border: mobile ? "1px solid hsl(var(--border))" : undefined,
            borderRadius: mobile ? 24 : 0,
            overflow: "hidden",
            boxShadow: mobile ? "0 20px 50px rgba(0,0,0,0.25)" : undefined,
          }}
        >
          <NexChatShell>
            {!mobile && <NexNavigationRail active="chat" avatarFallback="M" />}

            {(!mobile || !mobileShowChat) && (
              loadingList ? (
                <aside className="nx-list" style={{ width: mobile ? "100%" : undefined }}>
                  <NexConversationSkeleton rows={6} />
                </aside>
              ) : (
                <div style={{ width: mobile ? "100%" : undefined, display: "flex" }}>
                  <NexConversationList
                    conversations={CONVERSATIONS}
                    selectedId={selectedId}
                    onSelect={(id) => { setSelectedId(id); if (mobile) setMobileShowChat(true); }}
                  />
                </div>
              )
            )}

            {(!mobile || mobileShowChat) && (
              <main className="nx-chat" style={{ width: mobile ? "100%" : undefined }}>
                {conv ? (
                  <>
                    <NexChatHeader
                      contact={conv.contact}
                      channel={conv.channel}
                      status={conv.connectionStatus}
                    />
                    {messages.length === 0 ? (
                      <NexEmptyState />
                    ) : (
                      <NexMessageList
                        messages={messages}
                        onCopyPix={copyPix}
                        onOpenQr={() => setPixOpen(true)}
                        onOpenImage={(u) => setImgOpen(u)}
                      />
                    )}
                    <NexChatComposer
                      onSend={(t) => toast.message("Preview: '" + t + "' (sem envio real)")}
                    />
                  </>
                ) : (
                  <NexEmptyState />
                )}
              </main>
            )}

            {!mobile && conv && (
              <NexContactPanel
                contact={conv.contact}
                sector="Vendas"
                assignee="Você"
                tags={conv.contact.tags ?? []}
                notes="Cliente recorrente · responde rápido"
              />
            )}
          </NexChatShell>
        </div>
      </div>

      {pixPayment && (
        <NexPixQrModal
          open={pixOpen}
          onOpenChange={setPixOpen}
          amount={pixPayment.amount}
          pixCopyPaste={pixPayment.pixCopyPaste}
          qrImageUrl={pixPayment.qrImageUrl}
          onCopy={copyPix}
        />
      )}
      <NexImageModal
        open={!!imgOpen}
        onOpenChange={(o) => !o && setImgOpen(null)}
        url={imgOpen ?? undefined}
      />
    </div>
  );
}

export const Route = createFileRoute("/admin/aparencia/nexchat-preview")({
  component: NexChatPreviewPage,
});
