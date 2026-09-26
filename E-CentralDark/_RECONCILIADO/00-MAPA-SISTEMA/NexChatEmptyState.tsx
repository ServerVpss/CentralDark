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
            <Link to="/app/chat" search={{ ticketId: undefined }} className="nx-chat-empty-btn nx-chat-empty-btn-primary">
              <Inbox size={16} /> Abrir Chat
            </Link>
          ) : platform === "ios" ? (
            <button
              type="button"
              onClick={() => setShowIosHelp(true)}
              className="nx-chat-empty-btn nx-chat-empty-btn-primary"
            >
              <Apple size={16} /> Como instalar no iPhone
            </button>
          ) : platform === "android" ? (
            hasUrl ? (
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="nx-chat-empty-btn nx-chat-empty-btn-primary"
              >
                <Download size={16} /> Baixar APK
              </a>
            ) : (
              <button
                type="button"
                onClick={installPwa}
                className="nx-chat-empty-btn nx-chat-empty-btn-primary"
              >
                <Smartphone size={16} /> Instalar como app
              </button>
            )
          ) : (
            // Desktop e qualquer outro — botão "Baixar para Windows" como no print
            <button
              type="button"
              onClick={installPwa}
              className="nx-chat-empty-btn nx-chat-empty-btn-primary"
              title={canPrompt ? "Instalar como aplicativo" : "Use Chrome ou Edge para instalar"}
            >
              <Download size={16} /> Baixar para Windows
            </button>
          )}

          {/* Badge Beta — sempre visível, como no print */}
          <span className="nx-chat-empty-badge-beta">
            <ShieldCheck size={14} /> Beta v{version || "1.0.0"}
          </span>
        </div>

        <p
          className="nx-chat-empty-version"
          style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "center" }}
        >
          Versão {version || "1.0.0"}
          {isLoading ? " · carregando…" : ""}
        </p>


        {/* Linha de atalhos secundários */}
        <div
          style={{
            marginTop: 28,
            display: "flex",
            flexWrap: "wrap",
            gap: 10,
            justifyContent: "center",
          }}
        >
          {hasUrl && platform !== "ios" && (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="nx-chat-empty-btn nx-chat-empty-btn-ghost"
              style={{ height: 40, padding: "0 14px", fontSize: 13 }}
            >
              <Download size={14} /> Baixar APK
            </a>
          )}
          <Link
            to="/app/canais"
            className="nx-chat-empty-btn nx-chat-empty-btn-ghost"
            style={{ height: 40, padding: "0 14px", fontSize: 13 }}
          >
            <Radio size={14} /> Ver canais
          </Link>
          <Link
            to="/app/inbox"
            search={{ ticketId: undefined }}
            className="nx-chat-empty-btn nx-chat-empty-btn-ghost"
            style={{ height: 40, padding: "0 14px", fontSize: 13 }}
          >
            <Inbox size={14} /> Abrir inbox
          </Link>
          <Link
            to="/app/contatos"
            className="nx-chat-empty-btn nx-chat-empty-btn-ghost"
            style={{ height: 40, padding: "0 14px", fontSize: 13 }}
          >
            <MessageSquarePlus size={14} /> Nova mensagem
          </Link>
        </div>
      </motion.div>

      {showIosHelp && <IosInstallHelp onClose={() => setShowIosHelp(false)} />}
    </main>
  );
}

function IosInstallHelp({ onClose }: { onClose: () => void }) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 60,
        background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: 420, width: "100%",
          background: "var(--nx-bg-card, #0f1720)", color: "var(--nx-text, #fff)",
          borderRadius: 16, border: "1px solid rgba(255,255,255,0.08)",
          padding: 24, position: "relative",
        }}
      >
        <button
          onClick={onClose}
          aria-label="Fechar"
          style={{
            position: "absolute", top: 12, right: 12,
            background: "transparent", border: "none", color: "inherit",
            cursor: "pointer", padding: 6, borderRadius: 8,
          }}
        >
          <X size={18} />
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <Apple size={22} />
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Instalar no iPhone / iPad</h3>
        </div>
        <p style={{ fontSize: 14, opacity: 0.8, marginBottom: 16 }}>
          O iPhone instala o MultiZap como um atalho na sua Tela de Início. É rápido:
        </p>
        <ol style={{ paddingLeft: 18, fontSize: 14, lineHeight: 1.6, display: "grid", gap: 8 }}>
          <li>Abra esta página no <strong>Safari</strong> (não funciona no Chrome do iPhone).</li>
          <li>
            Toque no botão <strong>Compartilhar</strong> <Share size={14} style={{ display: "inline" }} />
            {" "}na barra inferior.
          </li>
          <li>
            Role e toque em <strong>Adicionar à Tela de Início</strong>{" "}
            <PlusSquare size={14} style={{ display: "inline" }} />.
          </li>
          <li>Confirme em <strong>Adicionar</strong>. Pronto — o app aparece na sua tela.</li>
        </ol>
      </div>
    </div>
  );
}
