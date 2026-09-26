import { useState } from "react";
import { Shield, Copy, Check, KeyRound, Server, Github, AlertCircle, Terminal } from "lucide-react";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Cofre Lovable — página de status e rehidratação de secrets
// ---------------------------------------------------------------------------
// O que essa página faz:
//   - Mostra quais secrets o projeto espera (lista fixa, publicável)
//   - Explica como rehidratar uma conta Lovable nova (cenário B)
//   - Confirma que transferir workspace (cenário A) carrega tudo junto
//
// O que NÃO faz (limitação real da Lovable):
//   - NÃO lê os valores reais dos secrets (só a IA do chat tem acesso)
//   - NÃO grava secrets automaticamente (só a IA pode via add_secret)
// ---------------------------------------------------------------------------

type SecretSpec = {
  name: string;
  descricao: string;
  icon: React.ElementType;
  origem: string;
};

const SECRETS_ESPERADOS: SecretSpec[] = [
  {
    name: "VPS_HOST_LOVABLE",
    descricao: "Endereço da VPS (ex.: vmi3256920.contaboserver.net)",
    icon: Server,
    origem: "Painel do provedor da VPS",
  },
  {
    name: "VPS_USER_LOVABLE",
    descricao: "Usuário SSH da VPS (normalmente root)",
    icon: Server,
    origem: "Padrão: root",
  },
  {
    name: "VPS_SSH_KEY_LOVABLE",
    descricao: "Chave SSH privada pra IA conectar na VPS",
    icon: KeyRound,
    origem: "/root/.ssh/id_ed25519 na VPS",
  },
  {
    name: "GITHUB_PAT_PERFIL",
    descricao: "Token GitHub pra fallback de sync quando Lovable trava",
    icon: Github,
    origem: "https://github.com/settings/tokens",
  },
];

const FRASE_PRONTA =
  "Oi! Conta Lovable nova aqui. Roda o script scripts/lovable-agent/pull-vault-from-vps.sh pra puxar o cofre da VPS e me mostra os valores pra eu colar nos secrets.";

const COMANDO_ATUALIZAR_COFRE =
  "bash scripts/lovable-agent/pull-vault-from-vps.sh";

function CopiarBotao({ texto, label = "Copiar" }: { texto: string; label?: string }) {
  const [copiado, setCopiado] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(texto);
        setCopiado(true);
        setTimeout(() => setCopiado(false), 2000);
      }}
      className={cn(
        "flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-mono transition-all border",
        copiado
          ? "bg-success/10 text-success border-success/40"
          : "bg-warning/5 text-warning border-warning/30 hover:bg-warning/10"
      )}
    >
      {copiado ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
      {copiado ? "Copiado!" : label}
    </button>
  );
}

export default function AdminCofreLovable() {
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-warning/15 border border-warning/40 flex items-center justify-center shrink-0">
          <Shield className="w-6 h-6 text-warning" />
        </div>
        <div className="flex-1">
          <h1 className="font-display font-bold text-2xl text-foreground">Cofre Lovable</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Status dos segredos e como rehidratar uma conta Lovable nova a partir do cofre da VPS.
          </p>
        </div>
      </div>

      {/* Cenário A — Transferir workspace (já funciona) */}
      <section className="rounded-xl border border-success/30 bg-success/5 p-5">
        <div className="flex items-center gap-2 mb-2">
          <Check className="w-4 h-4 text-success" />
          <h2 className="font-display font-bold text-sm uppercase tracking-wider text-success">
            Cenário recomendado: transferir workspace
          </h2>
        </div>
        <p className="text-sm text-foreground/90">
          Quando você transfere o workspace pra outra conta Lovable, todos os secrets vão
          junto automaticamente. <strong>Zero trabalho</strong>. Esse é o caminho oficial e
          já está validado.
        </p>
      </section>

      {/* Cenário B — Conta nova do zero */}
      <section className="rounded-xl border border-warning/30 bg-warning/5 p-5 space-y-4">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-warning" />
          <h2 className="font-display font-bold text-sm uppercase tracking-wider text-warning">
            Conta Lovable nova do zero (sem transferência)
          </h2>
        </div>
        <p className="text-sm text-foreground/90">
          A Lovable só permite gravar secrets via chat com a IA. Então a rehidratação tem
          3 passos curtos:
        </p>

        <ol className="space-y-3 text-sm">
          <li className="flex gap-3">
            <span className="w-6 h-6 rounded-full bg-warning/20 border border-warning/50 text-warning font-mono text-[11px] font-bold flex items-center justify-center shrink-0">
              1
            </span>
            <div className="flex-1">
              <p className="text-foreground">
                Cole <strong>apenas a chave SSH</strong> no secret{" "}
                <code className="px-1.5 py-0.5 rounded bg-background/60 border border-border text-warning font-mono text-[11px]">
                  VPS_SSH_KEY_LOVABLE
                </code>{" "}
                (Workspace Settings &gt; Secrets). É o único valor manual — sem ele a IA não
                consegue acessar a VPS.
              </p>
            </div>
          </li>

          <li className="flex gap-3">
            <span className="w-6 h-6 rounded-full bg-warning/20 border border-warning/50 text-warning font-mono text-[11px] font-bold flex items-center justify-center shrink-0">
              2
            </span>
            <div className="flex-1 space-y-2">
              <p className="text-foreground">Abre o chat com a IA e cola essa frase:</p>
              <div className="flex items-start gap-2">
                <div className="flex-1 rounded-lg bg-background/60 border border-warning/30 px-3 py-2 text-[12px] font-mono text-foreground/90">
                  {FRASE_PRONTA}
                </div>
                <CopiarBotao texto={FRASE_PRONTA} label="Copiar frase" />
              </div>
            </div>
          </li>

          <li className="flex gap-3">
            <span className="w-6 h-6 rounded-full bg-warning/20 border border-warning/50 text-warning font-mono text-[11px] font-bold flex items-center justify-center shrink-0">
              3
            </span>
            <div className="flex-1">
              <p className="text-foreground">
                A IA vai mostrar os valores do cofre. Cole cada um no secret correspondente
                em Workspace Settings &gt; Secrets. Pronto, conta rehidratada.
              </p>
            </div>
          </li>
        </ol>
      </section>

      {/* Secrets esperados */}
      <section className="rounded-xl border border-border bg-card/50 p-5">
        <h2 className="font-display font-bold text-sm uppercase tracking-wider text-foreground mb-4">
          Secrets que o cofre guarda
        </h2>
        <div className="grid gap-2">
          {SECRETS_ESPERADOS.map((s) => (
            <div
              key={s.name}
              className="flex items-start gap-3 p-3 rounded-lg border border-border/60 bg-background/40 hover:border-warning/30 transition"
            >
              <div className="w-8 h-8 rounded-md bg-warning/10 border border-warning/30 flex items-center justify-center shrink-0">
                <s.icon className="w-4 h-4 text-warning" />
              </div>
              <div className="flex-1 min-w-0">
                <code className="text-[12px] font-mono font-bold text-warning">{s.name}</code>
                <p className="text-xs text-muted-foreground mt-0.5">{s.descricao}</p>
                <p className="text-[10px] text-muted-foreground/70 mt-1 font-mono">
                  Origem: {s.origem}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Manter cofre atualizado */}
      <section className="rounded-xl border border-border bg-card/50 p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-primary" />
          <h2 className="font-display font-bold text-sm uppercase tracking-wider text-foreground">
            Manter o cofre da VPS atualizado
          </h2>
        </div>
        <p className="text-sm text-muted-foreground">
          O cofre fica em{" "}
          <code className="px-1.5 py-0.5 rounded bg-background/60 border border-border text-primary font-mono text-[11px]">
            /root/CentralDark/secrets/lovable.env
          </code>{" "}
          na VPS. Pra rebaixar pra essa conta a qualquer momento, peça pra IA rodar:
        </p>
        <div className="flex items-start gap-2">
          <div className="flex-1 rounded-lg bg-background/60 border border-border px-3 py-2 text-[12px] font-mono text-foreground/90">
            {COMANDO_ATUALIZAR_COFRE}
          </div>
          <CopiarBotao texto={COMANDO_ATUALIZAR_COFRE} label="Copiar comando" />
        </div>
      </section>
    </div>
  );
}
