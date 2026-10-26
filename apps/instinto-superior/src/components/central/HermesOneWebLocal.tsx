/* #OBSERVACOES# | HERMES_ONE_WEB_LOCAL
 * @owner: apps/instinto-superior/src/components/central/HermesOneWebLocal.tsx
 * @doc_ref: docs/CONSCIENCIA/RELATORIO-HERMES-ONE-LOCAL-E-COCKPIT-20261025.md
 * @last_updated: 2026-10-25T12:00:00Z
 * @implementado: preview do dashboard web nativo Hermes sob demanda no cockpit local
 * @pendente: migracao Electron IPC/Office 3D e ingress autentificado VPS
 * @estado: PREVIEW_LOCAL_ONLY @next_cursor: provar iframe autenticado e criar adapter web autorizado
 */
import { useEffect, useState } from "react";
import { ExternalLink, RefreshCcw, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

type Estado = "PROBING" | "READY" | "OFFLINE" | "NOT_LOCAL";
function urlLocalHermes(): string | null {
  if (typeof window === "undefined") return null;
  const hostname = window.location.hostname.toLowerCase();
  // So o browser da Casa pode alcançar o servidor em loopback.
  if (hostname !== "localhost" && hostname !== "127.0.0.1") return null;
  // O daemon Hermes usa bind IPv4 exclusivo (127.0.0.1), sem listener ::1.
  return "http://127.0.0.1:9119/";
}
export function HermesOneWebLocal({ autenticado }: { autenticado: boolean }) {
  const [endereco, definirEndereco] = useState<string | null>(null);
  const [estado, definirEstado] = useState<Estado>("PROBING");
  const [revisao, definirRevisao] = useState(0);
  useEffect(() => {
    if (!autenticado) { definirEstado("OFFLINE"); return; }
    const url = urlLocalHermes();
    definirEndereco(url);
    if (!url) { definirEstado("NOT_LOCAL"); return; }
    definirEstado("PROBING");
    // Prova pequena sem CORS: o favicon so carrega se o web server respondeu.
    const prova = new Image();
    let ativo = true;
    prova.onload = () => { if (ativo) definirEstado("READY"); };
    prova.onerror = () => { if (ativo) definirEstado("OFFLINE"); };
    prova.src = url + "favicon.ico?cd_probe=" + Date.now();
    return () => { ativo = false; prova.onload = null; prova.onerror = null; };
  }, [autenticado, revisao]);
  return (
    <section className="rounded-xl border border-border bg-background/70 p-4 sm:p-6"
      aria-label="Hermes ONE · interface web local">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <img src="/brands/hermes-one.svg" alt="Hermes ONE" className="h-8 w-32 object-contain" />
          <div className="min-w-0">
            <h3 className="font-semibold">Hermes ONE · módulo local</h3>
            <p className="text-xs text-muted-foreground">
              Dashboard web Hermes nativo · independente do AionUI · porta 9119 (Casa)
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" type="button" onClick={() => definirRevisao((v) => v + 1)}>
            <RefreshCcw className="size-4" /> Verificar
          </Button>
          {endereco && estado === "READY" ? (
            <Button variant="outline" size="sm" asChild>
              <a href={endereco} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="size-4" /> Abrir janela
              </a>
            </Button>
          ) : null}
        </div>
      </div>
      <p role="status" aria-live="polite"
        className={estado === "READY" ? "mb-3 text-xs text-emerald-400" : "mb-3 text-xs text-amber-400"}>
        {!autenticado ? "Acesse o Cockpit autenticado para usar o módulo." :
          estado === "PROBING" ? "Carregando módulo Hermes ONE · validando interface local…" :
          estado === "READY" ? "Interface web respondeu. Login, sessão e ações precisam de verificação própria." :
          estado === "NOT_LOCAL" ? "Interface restrita à Casa. A VPS requer ingress autenticado, ainda não publicado." :
          "Hermes Web não respondeu em 9119. Inicie pelo script autorizado no disco K:."}
      </p>
      {estado === "READY" && endereco && autenticado ? (
        <iframe
          key={revisao}
          src={endereco}
          title="Hermes ONE · dashboard web nativo"
          className="min-h-[70dvh] w-full rounded-lg border border-border bg-[#111]"
          loading="eager"
          referrerPolicy="no-referrer"
          sandbox="allow-scripts allow-same-origin allow-forms allow-downloads allow-popups"
        />
      ) : (
        <div className="flex min-h-52 items-center justify-center rounded-lg border border-dashed border-border p-5 text-center">
          <div>
            <ShieldAlert className="mx-auto mb-3 size-6 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {estado === "PROBING" ? "Inicializando Hermes ONE…" :
                estado === "NOT_LOCAL" ? "O acesso remoto aguarda uma ponte segura." :
                "Serviço web local indisponível ou acesso não autorizado."}
            </p>
          </div>
        </div>
      )}
      <p className="mt-3 text-xs text-muted-foreground">
        Esta é a UI web do Hermes Agent. O Office 3D do Hermes Desktop Electron
        usa APIs IPC próprias e ainda não está disponível como página web.
        O gateway e os modos internos do Hermes permanecem preservados.
      </p>
    </section>
  );
}
