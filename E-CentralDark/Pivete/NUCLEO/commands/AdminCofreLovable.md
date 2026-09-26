# COMANDO - AdminCofreLovable.tsx
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\apps\bot\src\pages\admin\AdminCofreLovable.tsx
**SHA:** 981b07da44d5e87a
**Timestamp:** 2026-08-26T19:31:04.500610
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- origem: "Padrão: root",

### Ouro Bruto (primeiros 5000 chars)
```
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
            <span className="w-6 h-6 rounded-full bg-warning/20 border border-warning/50 text-warning font-mono text-[11px] font-bold flex items-cente
```