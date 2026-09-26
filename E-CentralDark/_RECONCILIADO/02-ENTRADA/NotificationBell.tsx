import React, { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

export default function NotificationBell() {
  const { workspace } = useAuth();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!workspace?.id) return;

    // Subscrever para novas mensagens inbound (tempo real)
    const channel = supabase
      .channel("notifications-messages")
      .on("postgres_changes", {
        event: "INSERT",
        schema: "api",
        table: "messages",
        filter: `direction=eq.inbound`,
      }, (payload) => {
        const msg = payload.new as any;
        setUnread(prev => prev + 1);

        // Toast de notificação
        toast.message("📱 Nova mensagem", {
          description: msg.text?.slice(0, 80) || "Mensagem recebida",
          duration: 5000,
          action: {
            label: "Ver",
            onClick: () => { window.location.href = "/chats"; },
          },
        });
      })
      .subscribe();

    // Subscrever para mudanças de conexão
    const connChannel = supabase
      .channel("notifications-connections")
      .on("postgres_changes", {
        event: "UPDATE",
        schema: "api",
        table: "instances",
      }, (payload) => {
        const inst = payload.new as any;
        const old = payload.old as any;

        if (inst.status !== old?.status) {
          if (inst.status === "connected") {
            toast.success("✅ WhatsApp conectado!", {
              description: inst.phone ? `Número: ${inst.phone}` : inst.name,
              duration: 8000,
            });
          } else if (inst.status === "disconnected") {
            toast.error("❌ WhatsApp desconectado", {
              description: inst.name,
              duration: 8000,
            });
          } else if (inst.status === "qr_code") {
            toast.info("📱 QR Code disponível", {
              description: "Escaneie para conectar",
              duration: 10000,
              action: {
                label: "Ver QR",
                onClick: () => { window.location.href = "/instancias"; },
              },
            });
          }
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(connChannel);
    };
  }, [workspace?.id]);

  return (
    <>
      <Bell className="w-4 h-4" />
      {unread > 0 && (
        <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 flex items-center justify-center bg-destructive text-destructive-foreground text-[10px] rounded-full animate-pulse">
          {unread > 99 ? "99+" : unread}
        </span>
      )}
    </>
  );
}
