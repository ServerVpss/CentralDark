import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Check, ChevronRight, ExternalLink, Info, Link2, MessageCircle, X } from "lucide-react";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { cn } from "@/lib/utils";
import { CountryCodeSelect, COUNTRIES, type Country } from "./CountryCodeSelect";

type Etapa = 1 | 2 | 3;
type Modo = "existente" | "sem_numero";
type SubModoSemNumero = "fixo" | "teste_meta" | "twilio";
type StatusConexao = "novo" | "transferir" | "coexistencia" | "trocar_fornecedor";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConectar: (info: {
    modo: Modo;
    subModo?: SubModoSemNumero;
    telefone?: string;
    status?: StatusConexao;
    pin?: string;
  }) => void;
  conectando?: boolean;
}

export function ConnectWizard({ open, onOpenChange, onConectar, conectando }: Props) {
  const [etapa, setEtapa] = useState<Etapa>(1);
  const [modo, setModo] = useState<Modo>("existente");
  const [subModo, setSubModo] = useState<SubModoSemNumero | undefined>();
  const [pais, setPais] = useState<Country>(COUNTRIES.find((c) => c.iso === "BR")!);
  const [telefone, setTelefone] = useState("");
  const [status, setStatus] = useState<StatusConexao>("novo");
  // PIN 2FA — exigido só quando o modo é "trocar de fornecedor".
  // Nunca persiste fora do componente; é enviado uma vez ao backend.
  const [pin, setPin] = useState("");

  const reset = () => {
    setEtapa(1);
    setModo("existente");
    setSubModo(undefined);
    setPais(COUNTRIES.find((c) => c.iso === "BR")!);
    setTelefone("");
    setStatus("novo");
    setPin("");
  };

  const fechar = (v: boolean) => {
    if (!v) reset();
    onOpenChange(v);
  };

  const podeAvancar1 =
    (modo === "existente" && telefone.replace(/\D/g, "").length >= 8) ||
    (modo === "sem_numero" && !!subModo);

  // Migração de fornecedor exige PIN de 6 dígitos antes de abrir a Meta.
  const exigePin = modo === "existente" && status === "trocar_fornecedor";
  const pinOk = !exigePin || /^\d{6}$/.test(pin);

  const avancar = () => {
    if (etapa === 1) {
      // Se for "sem número", pula a etapa 2 (não faz sentido perguntar como
      // está conectado se ainda não tem número).
      setEtapa(modo === "sem_numero" ? 3 : 2);
    } else if (etapa === 2) {
      setEtapa(3);
    }
  };

  const voltar = () => {
    if (etapa === 3) {
      setEtapa(modo === "sem_numero" ? 1 : 2);
    } else if (etapa === 2) {
      setEtapa(1);
    } else {
      fechar(false);
    }
  };

  const numeroCompleto = `${pais.dial} ${telefone}`.trim();

  const finalizar = () => {
    onConectar({
      modo,
      subModo,
      telefone: modo === "existente" ? `${pais.dial.replace(/\D/g, "")}${telefone.replace(/\D/g, "")}` : undefined,
      status: modo === "existente" ? status : undefined,
      pin: exigePin ? pin : undefined,
    });
  };

  if (!open) return null;

  return (
    <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-[1fr_320px] min-h-[520px]">
        {/* Coluna principal */}
        <div className="flex flex-col p-6 md:p-8">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <Stepper etapa={etapa} pulouSemNumero={modo === "sem_numero"} />
            </div>
            <button
              type="button"
              onClick={() => fechar(false)}
              className="text-muted-foreground hover:text-foreground"
              aria-label="Fechar assistente"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 mt-8">
            {etapa === 1 && (
              <EtapaNumero
                modo={modo}
                setModo={setModo}
                subModo={subModo}
                setSubModo={setSubModo}
                pais={pais}
                setPais={setPais}
                telefone={telefone}
                setTelefone={setTelefone}
              />
            )}

            {etapa === 2 && (
              <EtapaStatusConexao
                numero={numeroCompleto}
                status={status}
                setStatus={setStatus}
              />
            )}

            {etapa === 3 && (
              <EtapaConectar
                modo={modo}
                subModo={subModo}
                status={status}
                numero={numeroCompleto}
                pin={pin}
                setPin={setPin}
                exigePin={exigePin}
              />
            )}
          </div>

          {/* Rodapé com botões */}
          <div className="mt-8 flex items-center justify-between border-t pt-4">
            <Button variant="outline" onClick={voltar} disabled={conectando}>
              Voltar
            </Button>

            {etapa < 3 ? (
              <Button
                onClick={avancar}
                disabled={!podeAvancar1 && etapa === 1}
                className="bg-sky-500 hover:bg-sky-600"
              >
                Próximo
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={finalizar}
                disabled={conectando || !pinOk}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {conectando
                  ? "Conectando…"
                  : exigePin
                    ? "Migrar com a Meta"
                    : "Conectar com a Meta"}
              </Button>
            )}
          </div>
        </div>

        {/* Coluna lateral ilustrativa */}
        <div className="hidden md:flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-8">
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 rounded-2xl bg-slate-900 dark:bg-slate-700 flex items-center justify-center shadow-lg">
              <MessageCircle className="h-10 w-10 text-sky-400" />
            </div>
            <div className="h-10 w-10 rounded-full bg-white dark:bg-slate-700 shadow flex items-center justify-center">
              <Link2 className="h-5 w-5 text-slate-500 text-sm" />
            </div>
            <WhatsAppIcon size="xl" loading="eager" className="drop-shadow-lg" />
          </div>
          <p className="mt-6 text-center text-sm text-muted-foreground max-w-[240px]">
            Conexão segura via API oficial do WhatsApp Business da Meta.
          </p>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   Stepper visual
   ========================================================= */
function Stepper({ etapa, pulouSemNumero }: { etapa: Etapa; pulouSemNumero: boolean }) {
  const passos = [
    { n: 1, titulo: "Inserir número do WhatsApp" },
    { n: 2, titulo: "Como o número está conectado", skip: pulouSemNumero },
    { n: 3, titulo: "Conectar com a Meta" },
  ];
  return (
    <div className="flex items-center gap-2 text-sm">
      {passos.map((p, i) => {
        const ativo = p.n === etapa;
        const concluido = p.n < etapa && !p.skip;
        const pulado = !!p.skip;
        return (
          <div key={p.n} className="flex items-center gap-2 flex-1 min-w-0">
            <div
              className={cn(
                "h-7 w-7 shrink-0 rounded-full flex items-center justify-center text-xs font-medium",
                ativo && "bg-sky-500 text-white",
                concluido && "bg-emerald-500 text-white",
                pulado && "bg-muted text-muted-foreground line-through",
                !ativo && !concluido && !pulado && "bg-muted text-muted-foreground",
              )}
            >
              {concluido ? <Check className="h-4 w-4" /> : p.n}
            </div>
            <span
              className={cn(
                "truncate",
                ativo ? "font-medium text-foreground" : "text-muted-foreground",
                pulado && "line-through",
              )}
            >
              {p.titulo}
            </span>
            {i < passos.length - 1 && (
              <div className="flex-1 border-t border-dashed border-muted-foreground/30 mx-2" />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* =========================================================
   Etapa 1 — número
   ========================================================= */
function EtapaNumero({
  modo,
  setModo,
  subModo,
  setSubModo,
  pais,
  setPais,
  telefone,
  setTelefone,
}: {
  modo: Modo;
  setModo: (m: Modo) => void;
  subModo: SubModoSemNumero | undefined;
  setSubModo: (s: SubModoSemNumero | undefined) => void;
  pais: Country;
  setPais: (c: Country) => void;
  telefone: string;
  setTelefone: (s: string) => void;
}) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-semibold">Insira o número que deseja conectar ao WhatsApp.</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Use o número que vai falar com os seus clientes. Pode ser um fixo ou celular.
        </p>
      </div>

      {/* Card: número existente */}
      <button
        type="button"
        onClick={() => setModo("existente")}
        className={cn(
          "w-full text-left rounded-xl border p-4 transition-colors",
          modo === "existente"
            ? "border-sky-500 ring-2 ring-sky-500/20 bg-sky-500/5"
            : "hover:border-muted-foreground/40",
        )}
      >
        <div className="font-medium">Número de telefone existente</div>
        <div className="text-sm text-muted-foreground">
          Insira o número que deseja conectar.
        </div>
        {modo === "existente" && (
          <div className="mt-4 flex gap-2" onClick={(e) => e.stopPropagation()}>
            <div className="w-28">
              <Label className="sr-only">País</Label>
              <CountryCodeSelect value={pais} onChange={setPais} />
            </div>
            <div className="flex-1">
              <Label className="sr-only">Telefone</Label>
              <Input
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                placeholder="11 98765 4321"
                inputMode="tel"
              />
            </div>
          </div>
        )}
      </button>

      {/* Card: ainda não tenho */}
      <button
        type="button"
        onClick={() => setModo("sem_numero")}
        className={cn(
          "w-full text-left rounded-xl border p-4 transition-colors",
          modo === "sem_numero"
            ? "border-sky-500 ring-2 ring-sky-500/20 bg-sky-500/5"
            : "hover:border-muted-foreground/40",
        )}
      >
        <div className="font-medium">Ainda não tenho um número para o WhatsApp.</div>
        {modo === "sem_numero" && (
          <div className="mt-4 space-y-2">
            <SubCard
              ativo={subModo === "fixo"}
              titulo="Usar número fixo"
              descricao="Você pode conectar seu número fixo com a API do WhatsApp."
              onClick={(e) => {
                e.stopPropagation();
                setSubModo("fixo");
              }}
            />
            <SubCard
              ativo={subModo === "teste_meta"}
              titulo="Usar número de teste gratuito do WhatsApp"
              descricao="Use um número de teste gratuito da Meta (limite de 5 destinatários)."
              onClick={(e) => {
                e.stopPropagation();
                setSubModo("teste_meta");
              }}
            />
            <SubCard
              ativo={subModo === "twilio"}
              titulo="Usar número de telefone acessível da Twilio"
              descricao="Nosso parceiro Twilio oferece números de celular acessíveis."
              externo
              onClick={(e) => {
                e.stopPropagation();
                setSubModo("twilio");
                window.open("https://www.twilio.com/try-twilio", "_blank", "noopener,noreferrer");
              }}
            />
          </div>
        )}
      </button>
    </div>
  );
}

function SubCard({
  ativo,
  titulo,
  descricao,
  externo,
  onClick,
}: {
  ativo: boolean;
  titulo: string;
  descricao: string;
  externo?: boolean;
  onClick: (e: React.MouseEvent) => void;
}) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "rounded-lg border p-3 flex items-start gap-3 cursor-pointer transition-colors",
        ativo ? "border-sky-500 bg-sky-500/5" : "hover:border-muted-foreground/40",
      )}
    >
      <div className="flex-1">
        <div className="font-medium text-sm">{titulo}</div>
        <div className="text-xs text-muted-foreground">{descricao}</div>
      </div>
      {externo ? (
        <ExternalLink className="h-4 w-4 text-muted-foreground" />
      ) : (
        <div
          className={cn(
            "h-4 w-4 rounded-full border-2 mt-1",
            ativo ? "border-sky-500 bg-sky-500" : "border-muted-foreground/40",
          )}
        />
      )}
    </div>
  );
}

/* =========================================================
   Etapa 2 — status da conexão
   ========================================================= */
function EtapaStatusConexao({
  numero,
  status,
  setStatus,
}: {
  numero: string;
  status: StatusConexao;
  setStatus: (s: StatusConexao) => void;
}) {
  const opcoes: Array<{ id: StatusConexao; titulo: string; descricao: string }> = [
    {
      id: "novo",
      titulo: "Configurar novo número",
      descricao:
        "Este número ainda não está sendo usado no WhatsApp. Vamos configurar do zero com a API do WhatsApp Business.",
    },
    {
      id: "transferir",
      titulo: "Transferir do app WhatsApp para a plataforma",
      descricao:
        "Você usa o WhatsApp (comum ou Business) neste número e quer migrar 100% para a API. O app antigo deixa de funcionar nele.",
    },
    {
      id: "coexistencia",
      titulo: 'Usar o app em paralelo ("Coexistência")',
      descricao:
        "Você quer continuar usando o WhatsApp Business no celular junto com a plataforma. Recurso novo da Meta, ainda em beta.",
    },
    {
      id: "trocar_fornecedor",
      titulo: "Trocar de outro fornecedor da API",
      descricao:
        "Você já usa a API em outra plataforma e quer migrar o número. Vai precisar da senha de 6 dígitos do fornecedor atual.",
    },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-semibold">Como o seu número está conectado ao WhatsApp?</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Por favor, escolha como você está usando o número <span className="font-medium">{numero}</span> atualmente.
        </p>
      </div>

      <div className="space-y-3">
        {opcoes.map((o) => {
          const ativo = status === o.id;
          return (
            <button
              key={o.id}
              type="button"
              onClick={() => setStatus(o.id)}
              className={cn(
                "w-full text-left rounded-xl border p-4 transition-colors flex items-start gap-3",
                ativo ? "border-sky-500 ring-2 ring-sky-500/20 bg-sky-500/5" : "hover:border-muted-foreground/40",
              )}
            >
              <div className="flex-1">
                <div className="font-medium">{o.titulo}</div>
                <div className="text-sm text-muted-foreground">{o.descricao}</div>
              </div>
              <div
                className={cn(
                  "h-4 w-4 mt-1 rounded-full border-2 shrink-0",
                  ativo ? "border-sky-500 bg-sky-500" : "border-muted-foreground/40",
                )}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* =========================================================
   Etapa 3 — abrir Meta
   ========================================================= */
function EtapaConectar({
  modo,
  subModo,
  status,
  numero,
  pin,
  setPin,
  exigePin,
}: {
  modo: Modo;
  subModo?: SubModoSemNumero;
  status?: StatusConexao;
  numero: string;
  pin: string;
  setPin: (s: string) => void;
  exigePin: boolean;
}) {
  const linhas: Array<[string, string]> = [];
  if (modo === "existente") {
    linhas.push(["Número", numero]);
    if (status === "novo") linhas.push(["Modo", "Configurar do zero"]);
    if (status === "transferir") linhas.push(["Modo", "Migrar do app para a API"]);
    if (status === "coexistencia") linhas.push(["Modo", "Coexistência com o app"]);
    if (status === "trocar_fornecedor") linhas.push(["Modo", "Migrar de outro fornecedor"]);
  } else {
    linhas.push(["Origem", "Vou obter um número novo"]);
    if (subModo === "fixo") linhas.push(["Tipo", "Número fixo próprio"]);
    if (subModo === "teste_meta") linhas.push(["Tipo", "Número de teste gratuito da Meta"]);
    if (subModo === "twilio") linhas.push(["Tipo", "Número comprado na Twilio"]);
  }

  // Aviso dinâmico de acordo com a escolha
  const aviso = (() => {
    if (modo === "sem_numero") {
      if (subModo === "teste_meta")
        return {
          tipo: "info" as const,
          titulo: "Número de teste da Meta",
          texto:
            "Esse número é gratuito mas só envia para até 5 destinatários cadastrados. Bom pra testar — não dá pra usar com clientes reais.",
        };
      if (subModo === "twilio")
        return {
          tipo: "info" as const,
          titulo: "Comprar número na Twilio",
          texto:
            "Abrimos o site da Twilio em outra aba. Depois de comprar o número lá, volte aqui e refaça o processo escolhendo 'Número de telefone existente'.",
        };
      return {
        tipo: "info" as const,
        titulo: "Você vai usar um número fixo próprio",
        texto:
          "Tenha em mãos um número que ainda NÃO esteja usando no WhatsApp comum. Se já estiver, escolha a opção 'Transferir do app'.",
      };
    }
    if (status === "transferir")
      return {
        tipo: "warning" as const,
        titulo: "Atenção: o WhatsApp do celular vai parar",
        texto:
          "Ao migrar este número para a API, o app do WhatsApp (comum ou Business) deixa de funcionar nele. Avise sua equipe antes de continuar.",
      };
    if (status === "coexistencia")
      return {
        tipo: "warning" as const,
        titulo: "Coexistência ainda é beta da Meta",
        texto:
          "Você continua usando o app no celular junto com a plataforma. Por ser recurso novo, podem aparecer instabilidades. Recomendamos só para testes.",
      };
    if (status === "trocar_fornecedor")
      return {
        tipo: "info" as const,
        titulo: "Tenha em mãos a senha de 6 dígitos",
        texto:
          "Para migrar de outro fornecedor da API, a Meta vai pedir a senha (2FA) de 6 dígitos que está cadastrada no fornecedor atual. Sem ela, a migração não conclui.",
      };
    return {
      tipo: "info" as const,
      titulo: "Tudo certo para configurar do zero",
      texto:
        "Este número será cadastrado na API oficial do WhatsApp Business. Você recebe um código de 6 dígitos por SMS ou ligação para confirmar.",
    };
  })();

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-semibold">Conectar com a Meta</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Vamos abrir a janela oficial da Meta. Escolha entrar com Facebook ou WhatsApp Business
          e autorize o app — é em 2 minutos.
        </p>
      </div>

      <div className="rounded-xl border p-4 bg-muted/30 space-y-2">
        {linhas.map(([k, v]) => (
          <div key={k} className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{k}</span>
            <span className="font-medium">{v}</span>
          </div>
        ))}
      </div>

      <div
        className={cn(
          "rounded-xl border p-4 flex gap-3",
          aviso.tipo === "warning"
            ? "border-amber-500/40 bg-amber-500/10"
            : "border-sky-500/30 bg-sky-500/5",
        )}
      >
        {aviso.tipo === "warning" ? (
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
        ) : (
          <Info className="h-5 w-5 text-sky-600 shrink-0 mt-0.5" />
        )}
        <div className="text-sm">
          <div className="font-medium">{aviso.titulo}</div>
          <p className="text-muted-foreground mt-1">{aviso.texto}</p>
        </div>
      </div>

      {exigePin && (
        <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/5 p-4 space-y-2">
          <Label htmlFor="pin-2fa" className="text-sm font-medium">
            PIN de 6 dígitos do fornecedor atual
          </Label>
          <Input
            id="pin-2fa"
            inputMode="numeric"
            maxLength={6}
            autoComplete="one-time-code"
            placeholder="••••••"
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
            className="text-center text-lg tracking-[0.5em] font-mono"
          />
          <p className="text-xs text-muted-foreground">
            É a senha de verificação em duas etapas cadastrada no fornecedor antigo da API.
            Sem isso a Meta não conclui a migração.
          </p>
        </div>
      )}

      <ul className="text-sm text-muted-foreground space-y-1.5 pl-4 list-disc">
        <li>A Meta vai pedir Facebook ou WhatsApp Business — escolha o que preferir.</li>
        <li>Autorize o acesso ao seu WhatsApp Business para esta plataforma.</li>
        <li>Quando terminar, a janela fecha sozinha e o número aparece aqui.</li>
      </ul>
    </div>
  );
}
