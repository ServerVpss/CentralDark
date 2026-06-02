import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Loader2, AlertCircle, ExternalLink } from "lucide-react";
import { MonospaceResultDisplay } from "@/components/consultation/MonospaceResultDisplay";

// Tipagem mínima do Telegram WebApp
declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        initData: string;
        initDataUnsafe: any;
        themeParams: Record<string, string>;
        ready: () => void;
        expand: () => void;
        close: () => void;
        BackButton?: { show: () => void; onClick: (cb: () => void) => void };
        MainButton?: any;
        colorScheme?: "light" | "dark";
      };
    };
  }
}

interface ResultData {
  query_type: string;
  query_input: string;
  result_data: any;
  created_at: string;
  user?: { first_name?: string; username?: string; id?: number };
}

export default function WebAppResult() {
  const { pathToken, secretToken } = useParams<{
    pathToken: string;
    secretToken: string;
  }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ResultData | null>(null);
  const [themeReady, setThemeReady] = useState(false);

  // Inicializa Telegram WebApp e tema
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-web-app.js";
    script.async = true;
    script.onload = () => {
      const tg = window.Telegram?.WebApp;
      if (tg) {
        tg.ready();
        tg.expand();
        // Aplica cores do tema do Telegram
        const tp = tg.themeParams || {};
        const root = document.documentElement;
        if (tp.bg_color) root.style.setProperty("--tg-bg", tp.bg_color);
        if (tp.text_color) root.style.setProperty("--tg-text", tp.text_color);
        if (tp.hint_color) root.style.setProperty("--tg-hint", tp.hint_color);
        if (tp.button_color) root.style.setProperty("--tg-btn", tp.button_color);
        if (tp.section_bg_color)
          root.style.setProperty("--tg-section-bg", tp.section_bg_color);
      }
      setThemeReady(true);
    };
    script.onerror = () => setThemeReady(true);
    document.body.appendChild(script);
    return () => {
      script.remove();
    };
  }, []);

  // Busca o resultado validando initData
  useEffect(() => {
    if (!themeReady || !pathToken || !secretToken) return;

    const fetchResult = async () => {
      try {
        const initData = window.Telegram?.WebApp?.initData || "";

        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

        const res = await fetch(
          `${supabaseUrl}/functions/v1/webapp-get-result`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${anonKey}`,
              apikey: anonKey,
            },
            body: JSON.stringify({
              path_token: pathToken,
              secret_token: secretToken,
              init_data: initData,
            }),
          },
        );

        const json = await res.json();
        if (!res.ok) {
          const map: Record<string, string> = {
            tokens_ausentes: "Link inválido.",
            nao_encontrado: "Resultado não encontrado.",
            token_invalido: "Link inválido ou adulterado.",
            expirado: "Este resultado expirou. Faça a consulta novamente.",
            abra_pelo_telegram:
              "Abra esta página pelo botão dentro do Telegram.",
            assinatura_invalida:
              "Assinatura do Telegram inválida. Reabra pelo bot.",
            consulta_de_outro_usuario:
              "Este resultado pertence a outro usuário.",
            bot_nao_encontrado: "Configuração do bot ausente.",
            erro_interno: "Erro interno. Tente novamente.",
          };
          setError(map[json.error] || json.error || "Erro ao carregar.");
          return;
        }

        setData(json as ResultData);
      } catch (err) {
        console.error(err);
        setError("Não foi possível carregar o resultado.");
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [themeReady, pathToken, secretToken]);

  const bgStyle: React.CSSProperties = {
    background: "var(--tg-bg, hsl(var(--background)))",
    color: "var(--tg-text, hsl(var(--foreground)))",
    minHeight: "100vh",
  };

  const headerStyle: React.CSSProperties = {
    background: "var(--tg-section-bg, hsl(var(--card)))",
  };

  if (loading || !themeReady) {
    return (
      <div
        style={bgStyle}
        className="flex flex-col items-center justify-center gap-3 p-6"
      >
        <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
        <p className="text-sm opacity-70">Carregando resultado…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={bgStyle} className="p-4">
        <div
          style={headerStyle}
          className="rounded-xl p-5 flex flex-col items-center gap-3 text-center border border-border/40"
        >
          <AlertCircle className="h-10 w-10 text-amber-400" />
          <h2 className="text-base font-semibold">Não foi possível abrir</h2>
          <p className="text-sm opacity-80 max-w-sm">{error}</p>
          <a
            href="https://t.me"
            className="inline-flex items-center gap-1 text-xs text-cyan-400 mt-2"
          >
            <ExternalLink className="h-3 w-3" /> Voltar ao Telegram
          </a>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const dt = new Date(data.created_at).toLocaleString("pt-BR", {
    timeZone: "America/Sao_Paulo",
  });

  return (
    <div style={bgStyle} className="p-3 sm:p-4">
      {/* Cabeçalho compacto */}
      <div
        style={headerStyle}
        className="rounded-xl px-4 py-3 mb-3 border border-border/40"
      >
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div>
            <p className="text-[11px] uppercase tracking-wider opacity-60">
              Consulta
            </p>
            <p className="font-mono text-sm font-semibold">
              /{data.query_type}{" "}
              <span className="opacity-70">{data.query_input}</span>
            </p>
          </div>
          <p className="text-[11px] opacity-60">{dt}</p>
        </div>
        {data.user?.first_name && (
          <p className="text-[11px] opacity-60 mt-1">
            Solicitado por: {data.user.first_name}
            {data.user.username ? ` (@${data.user.username})` : ""}
          </p>
        )}
      </div>

      {/* Resultado no mesmo formato do app */}
      <MonospaceResultDisplay result={data.result_data} showCopyButton />

      <p className="text-[10px] opacity-40 text-center mt-4">
        Resultado seguro · validado pelo Telegram · expira em 24h
      </p>
    </div>
  );
}
