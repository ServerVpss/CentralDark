# COMANDO - NexChatEmptyState.tsx
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\CentralDark\apps\clone-deck\apps\crm\src\components\nexchat\NexChatEmptyState.tsx
**SHA:** 016129b726dad5c6
**Timestamp:** 2026-08-26T19:31:38.110522
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "center" }}
- gap: 10,
- <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
- <ol style={{ paddingLeft: 18, fontSize: 14, lineHeight: 1.6, display: "grid", gap: 8 }}>

### Ouro Bruto (primeiros 5000 chars)
```
// Empty state desktop do /app/chat — divulga o aplicativo oficial MultiZap.
// Texto principal mantido (Baixe o aplicativo MultiZap). Os botões são
// inteligentes: detectam Android/iPhone/Desktop e oferecem a ação certa.
// Link e versão do APK vêm do master_settings via RPC get_android_apk_info.

import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Download, Smartphone, ShieldCheck, Inbox, MessageSquarePlus, Radio,
  Apple, Monitor, X, Share, PlusSquare,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { usePlatformInstall } from "@/lib/use-platform-install";

type ApkInfo = { download_url: string; version: string; updated_at?: string };

function useApkInfo() {
  return useQuery({
    queryKey: ["android-apk-info"],
    staleTime: 60_000,
    queryFn: async (): Promise<ApkInfo> => {
      const { data, error } = await supabase.rpc("get_android_apk_info");
      if (error) throw error;
      const row = Array.isArray(data) ? data[0] : data;
      return {
        download_url: (row?.download_url ?? "").trim(),
        version: (row?.version ?? "").trim(),
        updated_at: row?.updated_at ?? "",
      };
    },
  });
}

export function NexChatEmptyState() {
  const { data, isLoading } = useApkInfo();
  const url = data?.download_url ?? "";
  const version = data?.version ?? "";
  const hasUrl = !!url;

  const { platform, installed, canPrompt, promptInstall } = usePlatformInstall();
  const [showIosHelp, setShowIosHelp] = useState(false);

  const installPwa = async () => {
    const r = await promptInstall();
    if (r === "unavailable") {
      // Navegadores que não disparam beforeinstallprompt (Firefox/Safari/etc.)
      alert(
        "Pra instalar pelo navegador: clique no ícone de instalar na barra de endereço " +
          "(Chrome, Edge ou Brave). No celular Android, abra o menu e toque em " +
          "'Adicionar à Tela Inicial'.",
      );
    }
  };

  return (
    <main className="nx-chat-empty">
      <div className="nx-chat-empty-bg" aria-hidden="true">
        <span className="nx-chat-empty-glow nx-chat-empty-glow-tr" />
        <span className="nx-chat-empty-glow nx-chat-empty-glow-bl" />
      </div>

      <motion.div
        className="nx-chat-empty-inner"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.div
          className="nx-chat-empty-mock"
          initial={{ opacity: 0, scale: 0.88, rotate: -2 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="nx-chat-empty-pulse" aria-hidden="true" />
          <div className="nx-chat-empty-window">
            <div className="nx-chat-empty-window-bar">
              <span className="nx-chat-empty-dot" data-color="red" />
              <span className="nx-chat-empty-dot" data-color="yellow" />
              <span className="nx-chat-empty-dot" data-color="green" />
            </div>
            <div className="nx-chat-empty-window-body">
              <span className="nx-chat-empty-line" style={{ width: "33%" }} />
              <span className="nx-chat-empty-bubble nx-chat-empty-bubble-me" style={{ width: "70%" }} />
              <span className="nx-chat-empty-bubble nx-chat-empty-bubble-them" style={{ width: "60%" }} />
              <span className="nx-chat-empty-bubble nx-chat-empty-bubble-me" style={{ width: "45%" }} />
            </div>
          </div>
          <motion.div
            className="nx-chat-empty-badge"
            aria-hidden="true"
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <Smartphone size={28} strokeWidth={2.5} />
          </motion.div>
        </motion.div>

        <motion.h2
          className="nx-chat-empty-title"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.25 }}
        >
          Baixe o <span className="nx-chat-empty-title-accent">MultiZap</span> Desktop
        </motion.h2>
        <motion.p
          className="nx-chat-empty-subtitle"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.32 }}
        >
          Tenha uma experiência de atendimento sem distrações com nosso app nativo
          de desktop. Conectado em todos os seus dispositivos, com criptografia
          ponta a ponta.
        </motion.p>

        {/* CTA principal — escolhe o botão certo pra cada plataforma */}
        <div className="nx-chat-empty-cta-row">
          {installed ? (
            <Link to="/app/chat" search={{ ticketId: undefined }} className="nx-cha
```