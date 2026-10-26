/**
 * Catraca de conta CentralDark — mesma Sala de Controle, sem segunda casca.
 * Supabase Auth identifica a conta; assinaturas e papeis so sao mostrados
 * como verificados quando uma fonte autorizada os comprova.
 */
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import {
  BookOpen, Bug, ChevronDown, CircleHelp, Download,
  FileClock, LogOut, Search, Settings2,
  ShieldCheck, SlidersHorizontal, UserRound, Wallet,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { definirModoModuloCockpit, useModulosCockpit, type ModoModuloCockpit } from "@/lib/modulos-cockpit";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuSub,
  DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type AcoesMenuConta = {
  onPersonalizar: () => void;
  onConfiguracoes: () => void;
  onAdministracao: () => void;
  onBuscar: () => void;
  onDownloads: () => void;
  onSair: () => void | Promise<void>;
};

const REPO = "https://github.com/ServerVpss/CentralDark";

// Leitura do catalogo ja usado por PainelAdminCentralDark (tipos Supabase
// gerados ainda nao incluem "plans"). RLS continua decidindo o acesso.
const catalogoExistente = supabase as unknown as {
  from: (table: string) => {
    select: (columns: string) => {
      eq: (column: string, value: boolean) => {
        order: (column: string) => Promise<{
          data: Array<{ name: string; slug: string }> | null;
          error: unknown;
        }>;
      };
    };
  };
};

function nomeDaConta(usuario: User | null): string {
  const nome = usuario?.user_metadata?.["full_name"];
  if (typeof nome === "string" && nome.trim()) return nome.trim().slice(0, 80);
  return usuario?.email?.split("@")[0] || "Conta CentralDark";
}

export function MenuContaCentralDark(acoes: AcoesMenuConta) {
  const modulos = useModulosCockpit();
  const [usuario, definirUsuario] = useState<User | null>(null);
  const [lido, definirLido] = useState(false);
  const [planos, definirPlanos] = useState<Array<{ name: string; slug: string }> | null>(null);
  const [planosDisponiveis, definirPlanosDisponiveis] = useState(false);
  useEffect(() => {
    let ativo = true;
    void supabase.auth.getUser().then(({ data, error }) => {
      if (!ativo) return;
      definirUsuario(error ? null : (data.user ?? null));
      definirLido(true);
    }).catch(() => { if (ativo) definirLido(true); });
    const { data } = supabase.auth.onAuthStateChange((_evento, sessao) => {
      if (ativo) definirUsuario(sessao?.user ?? null);
    });
    return () => { ativo = false; data.subscription.unsubscribe(); };
  }, []);

  // Fonte de planos e catalogo de oferta, nao prova de compra/assinatura.
  useEffect(() => {
    let ativo = true;
    void catalogoExistente.from("plans").select("name, slug")
      .eq("is_active", true).order("display_order")
      .then(({ data, error }) => {
        if (!ativo) return;
        if (error) { definirPlanosDisponiveis(false); return; }
        definirPlanosDisponiveis(true);
        definirPlanos((data ?? []).filter((plano) =>
          typeof plano.name === "string" && typeof plano.slug === "string"
        ).slice(0, 8));
      })
      .catch(() => { if (ativo) definirPlanosDisponiveis(false); });
    return () => { ativo = false; };
  }, []);

  const email = usuario?.email || "Sessão sem e-mail verificado";
  const id = usuario?.id ? usuario.id.slice(0, 8) + "…" : "não confirmado";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="outline" size="sm"
          aria-label="Abrir conta e configurações CentralDark"
          title="Conta · perfil, assinatura, configurações e ajuda"
          data-cd-flow="instinto.CockpitShell.menu-conta">
          <UserRound className="mr-1 size-4 text-gold" aria-hidden="true" />
          <span className="hidden sm:inline">Minha conta</span>
          <ChevronDown className="ml-1 size-3" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={9}
        className="z-[100] w-[min(320px,calc(100vw-20px))] rounded-xl border-border bg-popover/95 p-2 shadow-2xl backdrop-blur">
        <DropdownMenuLabel className="flex items-center gap-3 rounded-lg bg-muted/30 px-3 py-3">
          <span className="flex size-10 items-center justify-center rounded-full border border-gold/40 bg-gold/10 text-gold">
            <UserRound className="size-5" aria-hidden="true" />
          </span>
          <span className="min-w-0 flex-1">
            <strong className="block truncate text-sm">{lido ? nomeDaConta(usuario) : "Consultando conta…"}</strong>
            <span className="block truncate text-xs font-normal text-muted-foreground">{email}</span>
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="gap-2 rounded-md px-3 py-2.5">
            <UserRound className="size-4" aria-hidden="true" /> Meu perfil
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="z-[110] w-[min(310px,calc(100vw-20px))] p-2">
            <DropdownMenuLabel>Identidade autenticada</DropdownMenuLabel>
            <div className="space-y-2 px-2 py-2 text-xs text-muted-foreground">
              <p className="break-all"><strong className="text-foreground">E-mail:</strong> {email}</p>
              <p><strong className="text-foreground">ID:</strong> {id}</p>
              <p>Função e permissões: validadas pelo servidor.</p>
            </div>
            <DropdownMenuItem onSelect={acoes.onAdministracao}>
              <ShieldCheck className="size-4" /> Consultar gestão da conta
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="gap-2 rounded-md px-3 py-2.5">
            <Wallet className="size-4" aria-hidden="true" /> Assinatura e planos
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="z-[110] w-[min(310px,calc(100vw-20px))] p-2">
            <DropdownMenuLabel>CentralDark · Assinaturas</DropdownMenuLabel>
            <p className="px-2 py-2 text-xs text-amber-500" role="status">
              Sua assinatura, cobrança e renovação: não verificadas nesta sessão.
            </p>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs">Planos disponíveis · catálogo existente</DropdownMenuLabel>
            {planosDisponiveis ? (
              planos?.length ? planos.map((plano) => (
                <p key={plano.slug} className="flex justify-between gap-3 px-2 py-1.5 text-xs">
                  <span className="truncate">{plano.name}</span>
                  <span className="shrink-0 font-mono text-muted-foreground">{plano.slug}</span>
                </p>
              )) : (
                <p className="px-2 py-2 text-xs text-muted-foreground">Nenhum plano ativo retornado.</p>
              )
            ) : (
              <p className="px-2 py-2 text-xs text-muted-foreground">
                Catálogo indisponível ou sem autorização de leitura.
              </p>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={acoes.onAdministracao}>
              <Wallet className="size-4" /> Consultar planos no painel existente
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuItem onSelect={acoes.onPersonalizar} className="gap-2 rounded-md px-3 py-2.5">
          <SlidersHorizontal className="size-4" /> Personalização
        </DropdownMenuItem>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="gap-2 rounded-md px-3 py-2.5">
            <Settings2 className="size-4" /> Configurações
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="z-[110] w-[min(320px,calc(100vw-20px))] p-3">
            <DropdownMenuLabel>Sistema → Módulos</DropdownMenuLabel>
            <p className="mb-3 text-xs text-muted-foreground">
              Preferência de carregamento desta interface. Não para, inicia ou
              reinicia serviços da VPS.
            </p>
            {([
              ["aionui", "CentralDark Estúdio · AionUI"],
              ["hermes", "Hermes ONE"],
            ] as const).map(([id, titulo]) => (
              <label key={id} className="mb-3 flex flex-col gap-1 text-xs font-medium">
                <span>{titulo}</span>
                <select
                  aria-label={`Modo de carregamento de ${titulo}`}
                  className="min-h-9 rounded-md border border-border bg-background px-2 text-foreground"
                  value={modulos[id]}
                  onChange={(e) => definirModoModuloCockpit(id, e.currentTarget.value as ModoModuloCockpit)}
                >
                  <option value="ativo">Ativo · pronto para abrir</option>
                  <option value="sob-demanda">Sob demanda · carregar ao clicar</option>
                  <option value="desativado">Desativado na interface</option>
                </select>
              </label>
            ))}
            <p className="mb-2 text-[11px] text-amber-500">
              Execução real: controlada pelo gateway autorizado; esta seleção
              não comprova parada ou início de processos.
            </p>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={acoes.onConfiguracoes}>
              <Settings2 className="size-4" /> Abrir configurações do Harness
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="gap-2 rounded-md px-3 py-2.5">
            <CircleHelp className="size-4" /> Ajuda
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="z-[110] w-[min(300px,calc(100vw-20px))] p-2">
            <DropdownMenuItem asChild>
              <a href={REPO + "/issues"} target="_blank" rel="noopener noreferrer">
                <BookOpen className="size-4" /> Central de ajuda
              </a>
            </DropdownMenuItem>
            <DropdownMenuItem disabled>
              <ShieldCheck className="size-4" /> Central de privacidade · pendente
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <a href={REPO + "/commits/main"} target="_blank" rel="noopener noreferrer">
                <FileClock className="size-4" /> Histórico de versões
              </a>
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={acoes.onBuscar}>
              <Search className="size-4" /> Localizar ferramentas
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <a href={REPO + "/issues/new"} target="_blank" rel="noopener noreferrer">
                <Bug className="size-4" /> Relatar um problema
              </a>
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuItem onSelect={acoes.onDownloads} className="gap-2 rounded-md px-3 py-2.5">
          <Download className="size-4" /> Baixar aplicativos e pacotes
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => void acoes.onSair()}
          className="gap-2 rounded-md px-3 py-2.5 text-destructive focus:text-destructive">
          <LogOut className="size-4" /> Sair da conta
        </DropdownMenuItem>
        <p className="px-3 pt-2 text-[10px] text-muted-foreground">
          Uma interface · identidade Supabase · acesso autorizado pelo backend.
        </p>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
