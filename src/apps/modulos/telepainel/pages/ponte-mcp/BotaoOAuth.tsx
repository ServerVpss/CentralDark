import { useEffect, useRef, useState } from "react";
import { Button } from "@/shared/ui/button";
import { Github, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface Props {
  provider: "github" | "openai";
  onConectado?: (info: ResultadoOAuth) => void;
  desabilitado?: boolean;
}

export interface ResultadoOAuth {
  ok: boolean;
  provider: string;
  username?: string;
  avatar_url?: string;
  chave_plena?: string;
  prefixo?: string;
  chave_id?: string;
  injetado_na_vps?: boolean;
  injecao_motivo?: string | null;
  erro?: string;
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;

const PROVIDER_CONFIG = {
  github: {
    label: "Entrar com GitHub",
    icone: Github,
    cor: "bg-[#24292e] hover:bg-[#1b1f23] text-white",
    funcao: "ponte-mcp-oauth-github",
  },
  openai: {
    label: "Entrar com OpenAI (em breve)",
    icone: Github, // placeholder até a Fase 2
    cor: "bg-muted text-muted-foreground cursor-not-allowed",
    funcao: "ponte-mcp-oauth-openai",
  },
} as const;

export function BotaoOAuth({ provider, onConectado, desabilitado }: Props) {
  const [estado, setEstado] = useState<"ocioso" | "aguardando" | "ok" | "erro">("ocioso");
  const popupRef = useRef<Window | null>(null);

  const cfg = PROVIDER_CONFIG[provider];
  const Icone = cfg.icone;
  const bloqueado = desabilitado || provider === "openai";

  useEffect(() => {
    function handler(ev: MessageEvent) {
      if (!ev.data || ev.data.tipo !== "ponte-mcp-oauth") return;
      const dados = ev.data as ResultadoOAuth;
      if (dados.ok) {
        setEstado("ok");
        toast.success(`Conectado como @${dados.username}!`);
        onConectado?.(dados);
        if (dados.injetado_na_vps === false) {
          toast.warning("Chave criada, mas não consegui injetar direto no MCP da VPS.", {
            description: dados.injecao_motivo || "Copia a chave manualmente.",
          });
        }
      } else {
        setEstado("erro");
        toast.error(dados.erro || "Login OAuth falhou.");
      }
      try { popupRef.current?.close(); } catch {}
    }
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [onConectado]);

  const abrir = () => {
    if (bloqueado) return;
    const url = `${SUPABASE_URL}/functions/v1/${cfg.funcao}?action=start`;
    const w = 600, h = 720;
    const left = window.screenX + (window.outerWidth - w) / 2;
    const top = window.screenY + (window.outerHeight - h) / 2;
    const popup = window.open(
      url,
      "ponte-mcp-oauth",
      `width=${w},height=${h},left=${left},top=${top},popup=yes`,
    );
    if (!popup) {
      toast.error("Seu navegador bloqueou o popup. Libera popups pra esse site.");
      return;
    }
    popupRef.current = popup;
    setEstado("aguardando");

    // Vigia se o usuário fechou sem completar
    const timer = setInterval(() => {
      if (popup.closed) {
        clearInterval(timer);
        setEstado((s) => (s === "aguardando" ? "ocioso" : s));
      }
    }, 600);
  };

  return (
    <Button
      onClick={abrir}
      disabled={bloqueado || estado === "aguardando"}
      className={`${cfg.cor} shadow-3d active:translate-y-[1px] gap-2`}
    >
      {estado === "aguardando" ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : estado === "ok" ? (
        <CheckCircle2 className="w-4 h-4" />
      ) : estado === "erro" ? (
        <AlertCircle className="w-4 h-4" />
      ) : (
        <Icone className="w-4 h-4" />
      )}
      {estado === "aguardando" ? "Aguardando login..." : cfg.label}
    </Button>
  );
}
