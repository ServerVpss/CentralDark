import { useCallback, useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Link2, Loader2, QrCode, RefreshCw, Send, ShieldCheck, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { gerenciarQrTelegram, lerVinculoTelegram, operarVinculoTelegram, type VinculoTelegram, type VinculoQrTelegram } from "@/lib/telegram-mtproto.functions";

type Etapa = "telefone" | "codigo" | "senha";

export function TelegramContaCentralDark() {
  const ler = useServerFn(lerVinculoTelegram);
  const operar = useServerFn(operarVinculoTelegram);
  const qr = useServerFn(gerenciarQrTelegram);
  const [estado, setEstado] = useState<VinculoTelegram | null>(null);
  const [etapa, setEtapa] = useState<Etapa>("telefone");
  const [telefone, setTelefone] = useState("");
  const [codigo, setCodigo] = useState("");
  const [senha, setSenha] = useState("");
  const [ocupado, setOcupado] = useState(false);
  const [mensagem, setMensagem] = useState<string | null>(null);
  // The QR image is a temporary authentication capability. Keep it in React memory only.
  const [qrId, setQrId] = useState<string | null>(null);
  const [qrImage, setQrImage] = useState<string | null>(null);
  const [qrExpiresAt, setQrExpiresAt] = useState<number | null>(null);
  const [qrEtapa, setQrEtapa] = useState<"idle" | "QR_PENDING" | "NEEDS_2FA" | "VERIFYING_2FA">("idle");
  const [qrSenha, setQrSenha] = useState("");
  const [qrBusy, setQrBusy] = useState(false);
  const [qrMensagem, setQrMensagem] = useState<string | null>(null);

  const atualizar = useCallback(async () => {
    setOcupado(true);
    try {
      const valor = await ler();
      setEstado(valor);
      if (valor.connected) {setEtapa("telefone"); setCodigo(""); setSenha("");}
    } catch {
      setMensagem("Não foi possível consultar o acesso administrativo ao MTProto.");
    } finally {setOcupado(false);}
  }, [ler]);

  useEffect(() => {void atualizar();}, [atualizar]);

  async function acionar(acao: "start" | "confirm" | "logout") {
    setMensagem(null); setOcupado(true);
    try {
      const result = acao === "start"
        ? await operar({data:{action:acao,phone:telefone.trim()}})
        : acao === "confirm"
          ? await operar({data:{action:acao,phone:telefone.trim(),code:codigo.trim(),
            ...(etapa === "senha" ? {password:senha} : {})}})
          : await operar({data:{action:acao,confirmation:"DESCONECTAR_TELEGRAM"}});
      setMensagem(result.detalhe);
      if (result.needsPassword) setEtapa("senha");
      if (result.ok && acao === "start") setEtapa("codigo");
      if (result.ok && acao !== "start") {
        setTelefone("");setCodigo("");setSenha("");setEtapa("telefone");
        await atualizar();
      }
    } catch {
      setMensagem("O owner não confirmou esta ação. O estado foi preservado.");
    } finally {setOcupado(false);}
  }


  function resetQr() {
    setQrId(null);
    setQrImage(null);
    setQrExpiresAt(null);
    setQrEtapa("idle");
    setQrSenha("");
  }

  function mostrarQr(result: VinculoQrTelegram) {
    setQrMensagem(result.detalhe);
    if (result.estado === "QR_PENDING" && result.id) {
      setQrId(result.id);
      setQrImage(result.image);
      setQrExpiresAt(result.expiresAt);
      setQrEtapa("QR_PENDING");
    } else if (result.estado === "NEEDS_2FA") {
      setQrImage(null);
      setQrEtapa("NEEDS_2FA");
    } else if (result.estado === "VERIFYING_2FA") {
      setQrImage(null);
      setQrEtapa("VERIFYING_2FA");
    } else if (result.estado === "CONNECTED") {
      resetQr();
      void atualizar();
    } else if (["CANCELLED","QR_NOT_FOUND","QR_EXPIRED","FAILED"].includes(result.estado)) {
      resetQr();
    }
  }

  async function iniciarQr() {
    setQrBusy(true);
    setQrMensagem(null);
    try {
      const result=await qr({data:{action:"qrStart"}});
      mostrarQr(result);
    } catch {
      setQrMensagem("Não foi possível gerar o QR no owner existente.");
    } finally {
      setQrBusy(false);
    }
  }

  async function cancelarQr() {
    if (!qrId) return;
    setQrBusy(true);
    try {
      const result=await qr({data:{action:"qrCancel",id:qrId}});
      mostrarQr(result);
      if (result.ok) resetQr();
    } catch {
      setQrMensagem("Não foi possível confirmar o cancelamento. Consulte o estado.");
    } finally {
      setQrBusy(false);
    }
  }

  async function enviarSenhaQr() {
    if (!qrId || !qrSenha) return;
    setQrBusy(true);
    try {
      const result=await qr({data:{action:"qrPassword",id:qrId,password:qrSenha}});
      setQrSenha("");
      mostrarQr(result);
    } catch {
      setQrMensagem("Não foi possível validar a senha. Consulte o estado.");
    } finally {
      setQrBusy(false);
    }
  }

  useEffect(() => {
    if (!qrId) return;
    let mounted=true;
    let inFlight=false;
    async function poll() {
      if (!mounted || inFlight || !qrId) return;
      inFlight=true;
      try {
        const result=await qr({data:{action:"qrStatus",id:qrId}});
        if (mounted) mostrarQr(result);
      } catch {
        if (mounted) setQrMensagem("Sem resposta do QR; clique em Atualizar estado.");
      } finally {
        inFlight=false;
      }
    }
    const handle=setInterval(()=>{void poll();},2500);
    return () => {mounted=false;clearInterval(handle);};
  }, [qrId,qr]);

  const pronto = estado?.estado === "READY";
  return (
    <section className="panel mt-7 space-y-4 p-5" aria-labelledby="mtproto-real">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-wider text-gold">Telegram · MTProto direto</p>
          <h4 id="mtproto-real" className="mt-1 text-lg font-semibold">Vincular conta Telegram ao Hermes</h4>
        </div>
        <span className="rounded-md border border-border px-2 py-1 font-mono text-[10px]">{estado?.estado || "MEDINDO"}</span>
      </div>
      <p className="text-sm text-muted-foreground">
        Pode acessar esta tela pela internet via HTTPS, com sua conta de administrador da CentralDark.
        Usa uma conta Telegram de usuário, separada do bot. O login passa pela função
        autenticada do Instinto Superior e a sessão fica no serviço MTProto da VPS,
        sem guardar código, senha ou token do bot em armazenamento do navegador.
      </p>
      {estado && <p role="status" className="text-xs text-muted-foreground">{estado.detalhe}</p>}
      {estado?.connected ? (
        <div className="space-y-3">
          <p className="flex items-center gap-2 text-sm text-neon-green">
            <ShieldCheck className="size-4" /> Conta conectada
            {estado.me?.username ? " (@" + estado.me.username + ")" : ""}
          </p>
          <Button type="button" variant="outline" disabled={ocupado}
            onClick={() => {if(window.confirm("Desvincular esta conta Telegram da VPS?")) void acionar("logout");}}>
            Desvincular conta
          </Button>
        </div>
      ) : pronto ? (
        <div className="space-y-4">
          <div className="rounded-lg border border-border p-4 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <p className="font-semibold text-sm"><QrCode className="mr-2 inline size-4" /> Entrar pelo QR do Telegram</p>
              {qrEtapa === "idle" ? (
                <Button type="button" size="sm" disabled={ocupado || qrBusy}
                  onClick={() => void iniciarQr()}>
                  {qrBusy ? <Loader2 className="size-4 animate-spin" /> : <QrCode className="size-4" />}
                  Gerar QR
                </Button>
              ) : (
                <Button type="button" variant="outline" size="sm" disabled={qrBusy || !qrId}
                  onClick={() => void cancelarQr()}>
                  <XCircle className="size-4" /> Cancelar QR
                </Button>
              )}
            </div>
            {qrEtapa === "QR_PENDING" && qrImage && (
              <div className="flex flex-col items-center gap-3" role="status">
                <img src={qrImage} alt="QR temporário para autorizar uma conta Telegram"
                  width={288} height={288} referrerPolicy="no-referrer"
                  className="rounded-md border border-border bg-white p-2" />
                <p className="text-xs text-muted-foreground text-center">
                  No Telegram já conectado: Configurações → Dispositivos → Conectar dispositivo.
                  Confirme a autorização no aplicativo. O QR é renovado automaticamente.
                </p>
                <p className="text-xs text-gold">
                  {qrExpiresAt ? "Validade do QR atual: " +
                    new Date(qrExpiresAt).toLocaleTimeString("pt-BR") : "Aguardando expiração"}
                </p>
              </div>
            )}
            {qrEtapa === "NEEDS_2FA" && (
              <div className="space-y-2">
                <label htmlFor="qr-telegram-2fa" className="text-xs font-semibold">
                  Senha de duas etapas do Telegram
                </label>
                <input id="qr-telegram-2fa" type="password" autoComplete="off"
                  value={qrSenha} onChange={(e)=>setQrSenha(e.target.value)}
                  disabled={qrBusy} className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm" />
                <Button type="button" disabled={qrBusy || !qrSenha}
                  onClick={()=>void enviarSenhaQr()}>Confirmar 2FA</Button>
              </div>
            )}
            {qrEtapa === "VERIFYING_2FA" && <p role="status" className="text-xs text-gold">
              <Loader2 className="mr-1 inline size-4 animate-spin" /> Telegram validando a senha…
            </p>}
            {qrMensagem && <p role="status" className="text-xs text-muted-foreground">{qrMensagem}</p>}
          </div>
          <div className="border-t border-border pt-4 space-y-3">
            <p className="text-xs font-semibold text-muted-foreground">Ou conectar por telefone e código</p>
            <label htmlFor="telefone-mtproto" className="block text-xs font-semibold">Telefone com DDI</label>
          <input id="telefone-mtproto" type="tel" autoComplete="tel" inputMode="tel"
            disabled={ocupado || etapa !== "telefone"} value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
            placeholder="+55..." className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm" />
          {etapa === "telefone" ? (
            <Button type="button" disabled={ocupado || !/^\+?\d{8,15}$/.test(telefone.trim())}
              onClick={() => void acionar("start")}><Send className="size-4" /> Enviar código</Button>
          ) : (
            <>
              <label htmlFor="codigo-mtproto" className="block text-xs font-semibold">Código recebido no Telegram</label>
              <input id="codigo-mtproto" inputMode="numeric" autoComplete="one-time-code"
                value={codigo} onChange={(e) => setCodigo(e.target.value.replace(/\D/g,""))}
                disabled={ocupado} placeholder="Código"
                className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm" />
              {etapa === "senha" && (
                <>
                  <label htmlFor="senha-mtproto" className="block text-xs font-semibold">Senha Telegram 2FA</label>
                  <input id="senha-mtproto" type="password" autoComplete="off"
                    value={senha} onChange={(e) => setSenha(e.target.value)}
                    disabled={ocupado} className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm" />
                </>
              )}
              <div className="flex gap-2">
                <Button type="button" variant="outline" disabled={ocupado}
                  onClick={() => {setEtapa("telefone");setCodigo("");setSenha("");}}>Voltar</Button>
                <Button type="button" disabled={ocupado || !/^\d{4,8}$/.test(codigo) || (etapa === "senha" && !senha)}
                  onClick={() => void acionar("confirm")}>
                  {etapa === "senha" ? "Confirmar senha 2FA" : "Confirmar código"}
                </Button>
              </div>
            </>
          )}
          </div>
        </div>
      ) : <p className="text-sm text-gold">Aguardando configuração ou alcance do serviço MTProto já existente.</p>}
      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" size="sm" variant="outline" disabled={ocupado} onClick={() => void atualizar()}>
          {ocupado ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />} Atualizar estado
        </Button>
        <span className="text-xs text-muted-foreground"><Link2 className="mr-1 inline size-3" />
          QR temporário ou telefone, código e 2FA. QR não equivale a conta vinculada.</span>
      </div>
      {mensagem && <p role="status" className="rounded-lg border border-border p-3 text-sm">{mensagem}</p>}
      <p className="font-mono text-[10px] text-muted-foreground">
        VINCULADO != HERMES_CONSUMINDO_CONTA · BOT_TOKEN != MTProto_SESSION
      </p>
    </section>
  );
}
