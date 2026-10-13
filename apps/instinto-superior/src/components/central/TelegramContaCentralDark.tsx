import { useCallback, useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Link2, Loader2, RefreshCw, Send, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { lerVinculoTelegram, operarVinculoTelegram, type VinculoTelegram } from "@/lib/telegram-mtproto.functions";

type Etapa = "telefone" | "codigo" | "senha";

export function TelegramContaCentralDark() {
  const ler = useServerFn(lerVinculoTelegram);
  const operar = useServerFn(operarVinculoTelegram);
  const [estado, setEstado] = useState<VinculoTelegram | null>(null);
  const [etapa, setEtapa] = useState<Etapa>("telefone");
  const [telefone, setTelefone] = useState("");
  const [codigo, setCodigo] = useState("");
  const [senha, setSenha] = useState("");
  const [ocupado, setOcupado] = useState(false);
  const [mensagem, setMensagem] = useState<string | null>(null);

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
        <div className="space-y-3">
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
      ) : <p className="text-sm text-gold">Aguardando configuração ou alcance do serviço MTProto já existente.</p>}
      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" size="sm" variant="outline" disabled={ocupado} onClick={() => void atualizar()}>
          {ocupado ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />} Atualizar estado
        </Button>
        <span className="text-xs text-muted-foreground"><Link2 className="mr-1 inline size-3" />
          QR pendente; login atual por telefone, código e 2FA.</span>
      </div>
      {mensagem && <p role="status" className="rounded-lg border border-border p-3 text-sm">{mensagem}</p>}
      <p className="font-mono text-[10px] text-muted-foreground">
        VINCULADO != HERMES_CONSUMINDO_CONTA · BOT_TOKEN != MTProto_SESSION
      </p>
    </section>
  );
}
