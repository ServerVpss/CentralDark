import { useEffect, useState } from "react";
import { Check, ExternalLink, Eye, Monitor, Puzzle, RotateCcw, Smartphone, TerminalSquare, TriangleAlert } from "lucide-react";

import { SeloEstado } from "@/components/central/EstadoCentralDark";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type PeleCockpit = "default" | "ouro" | "ops" | "esmeralda";
const CHAVE_PELE = "centraldark.cockpit.pele";
const peles = [
  ["default", "Instinto Superior · padrão"],
  ["ouro", "Breu & Ouro"],
  ["ops", "Ops · Ciano"],
  ["esmeralda", "Esmeralda"],
] as const;

function peleValida(valor: string | null): valor is PeleCockpit {
  return peles.some(([id]) => id === valor);
}

export function usePeleCockpit() {
  const [pele, definirPele] = useState<PeleCockpit>("default");
  useEffect(() => {
    try {
      const salva = localStorage.getItem(CHAVE_PELE);
      if (peleValida(salva)) definirPele(salva);
    } catch {
      // Armazenamento indisponível: manter o padrão sem bloquear o cockpit.
    }
    const sincronizar = (evento: StorageEvent) => {
      if (evento.key === CHAVE_PELE)
        definirPele(peleValida(evento.newValue) ? evento.newValue : "default");
    };
    window.addEventListener("storage", sincronizar);
    return () => window.removeEventListener("storage", sincronizar);
  }, []);
  function selecionar(valor: string) {
    if (!peleValida(valor)) return;
    definirPele(valor);
    try {
      if (valor === "default") localStorage.removeItem(CHAVE_PELE);
      else localStorage.setItem(CHAVE_PELE, valor);
    } catch {
      // A seleção continua funcionando nesta sessão sem armazenamento.
    }
  }
  return { pele, selecionar };
}

const cores = [
  ["Fundo", "bg-background"],
  ["Superfície", "bg-surface"],
  ["Superfície elevada", "bg-surface-2"],
  ["Ouro", "bg-gold"],
  ["Brasa", "bg-ember"],
  ["Azul neon", "bg-neon-blue"],
  ["Verde neon", "bg-neon-green"],
  ["Roxo neon", "bg-neon-purple"],
] as const;

const estados = ["PASS", "RUNNING", "BLOCKED", "AUTH_REQUIRED", "UNKNOWN", "FAIL"] as const;

function MiniSuperficie({ tipo }: { tipo: "publica" | "entrada" | "controle" }) {
  const titulos = {
    publica: "CentralDark — Instinto Superior",
    entrada: "Cockpit vivo",
    controle: "Sala de controle",
  };
  return (
    <div className="overflow-hidden rounded-md border border-border bg-background shadow-[var(--shadow-deep)]">
      <div className="flex h-7 items-center gap-1.5 border-b border-border bg-surface px-3">
        <span className="size-1.5 rounded-full bg-destructive" />
        <span className="size-1.5 rounded-full bg-gold" />
        <span className="size-1.5 rounded-full bg-neon-green" />
      </div>
      <div className="grid-mesh min-h-40 p-4">
        <p className="font-mono text-[8px] text-neon-blue uppercase">
          {tipo === "controle" ? "PRIVADO" : "PÚBLICO"}
        </p>
        <p className="mt-3 text-lg font-semibold text-foreground">{titulos[tipo]}</p>
        <div className="mt-4 h-1.5 w-3/4 rounded-full bg-primary/70" />
        <div className="mt-2 h-1.5 w-1/2 rounded-full bg-muted-foreground/30" />
        <div className="mt-6 grid grid-cols-3 gap-2">
          <span className="h-10 rounded-md border border-border bg-surface" />
          <span className="h-10 rounded-md border border-border bg-surface" />
          <span className="h-10 rounded-md border border-border bg-surface" />
        </div>
      </div>
    </div>
  );
}

export function DesignCenter({
  pele = "default",
  selecionarPele,
  autenticado = false,
}: {
  pele?: PeleCockpit;
  selecionarPele?: (valor: string) => void;
  autenticado?: boolean;
}) {
  const [comparacao, definirComparacao] = useState<"canonico" | "teste">("canonico");

  return (
    <section id="design-center" className="scroll-mt-24">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] tracking-[0.2em] text-neon-blue uppercase">
            Designer · capacidade do cockpit
          </p>
          <h2 className="mt-3 text-3xl font-semibold">CentralDark Design Center</h2>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            Tokens, componentes, superfícies e Hermes reunidos no mesmo sistema visual.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <SeloEstado estado="UNKNOWN" />
          <span className="inline-flex min-h-7 items-center rounded-md border border-gold/40 px-2 py-1 font-mono text-[10px] text-gold">
            CANÔNICO
          </span>
          <span className="inline-flex min-h-7 items-center rounded-md border border-neon-blue/40 px-2 py-1 font-mono text-[10px] text-neon-blue">
            PUBLICAÇÃO NÃO MEDIDA
          </span>
        </div>
      </div>

      {selecionarPele ? (
        <div className="mt-6 flex flex-wrap items-center gap-3 border-y border-border py-4">
          <label id="pele-cockpit-label" className="text-sm font-medium">
            Aparência do cockpit
          </label>
          <Select value={pele} onValueChange={selecionarPele}>
            <SelectTrigger aria-labelledby="pele-cockpit-label" className="w-full sm:w-64">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {peles.map(([id, nome]) => (
                <SelectItem key={id} value={id}>
                  {nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            data-cd-flow="instinto.DesignCenter.botao-01"
            variant="ghost"
            size="sm"
            onClick={() => selecionarPele("default")}
            disabled={pele === "default"}
          >
            <RotateCcw /> Restaurar padrão
          </Button>
        </div>
      ) : null}

      <Tabs defaultValue="tokens" className="mt-8">
        <TabsList className="h-auto max-w-full flex-wrap justify-start">
          <TabsTrigger value="tokens">Tokens</TabsTrigger>
          <TabsTrigger value="biblioteca">Biblioteca</TabsTrigger>
          {autenticado ? <TabsTrigger value="extensoes">Marketplace</TabsTrigger> : null}
          <TabsTrigger value="superficies">Superfícies</TabsTrigger>
          <TabsTrigger value="auditoria">Auditoria</TabsTrigger>
        </TabsList>

        <TabsContent value="tokens" className="mt-6">
          <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
            <div>
              <h3 className="font-semibold">Paleta canônica</h3>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {cores.map(([nome, classe]) => (
                  <div key={nome} className="panel p-3">
                    <span className={`block h-14 rounded-md border border-border ${classe}`} />
                    <span className="mt-2 block text-xs text-muted-foreground">{nome}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="panel p-5">
              <h3 className="font-semibold">Fundamentos</h3>
              <dl className="mt-4 space-y-4 text-xs">
                <div>
                  <dt className="text-muted-foreground">Tipografia de exibição</dt>
                  <dd className="mt-1 text-lg font-semibold">Space Grotesk</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Tipografia técnica</dt>
                  <dd className="mt-1 font-mono">JetBrains Mono</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Raio base</dt>
                  <dd className="mt-1 font-mono">12 px</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Espaçamento</dt>
                  <dd className="mt-1 font-mono">4 · 8 · 12 · 16 · 24 · 32 · 48</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Sombras</dt>
                  <dd className="mt-1">Profunda · ouro · azul</dd>
                </div>
              </dl>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="biblioteca" className="mt-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <article className="panel p-6">
              <h3 className="font-semibold">Ações existentes</h3>
              <div className="mt-5 flex flex-wrap gap-3">
                <Button data-cd-flow="instinto.DesignCenter.botao-02">Primária</Button>
                <Button data-cd-flow="instinto.DesignCenter.botao-03" variant="outline">
                  Contorno
                </Button>
                <Button data-cd-flow="instinto.DesignCenter.botao-04" variant="ghost">
                  Discreta
                </Button>
                <Button data-cd-flow="instinto.DesignCenter.botao-05" disabled>
                  Indisponível
                </Button>
              </div>
            </article>
            <article className="panel p-6">
              <h3 className="font-semibold">Estados operacionais</h3>
              <div className="mt-5 flex flex-wrap gap-2">
                {estados.map((estado) => (
                  <SeloEstado key={estado} estado={estado} />
                ))}
              </div>
            </article>
          </div>
        </TabsContent>

        {autenticado ? (
          <TabsContent value="extensoes" className="mt-6">
            <section id="galeria-extensoes" aria-labelledby="galeria-extensoes-titulo">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-mono text-[10px] tracking-[0.2em] text-neon-blue uppercase">
                    Builder · biblioteca existente
                  </p>
                  <h3 id="galeria-extensoes-titulo" className="mt-2 text-xl font-semibold">
                    Marketplace de capacidades
                  </h3>
                  <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                    Um catálogo para extensões, skills, agentes, ferramentas MCP e conectores.
                    Cada capacidade mantém seu próprio owner e suas permissões. Estados
                    registrados não substituem medições ao vivo.
                  </p>
                </div>
                <SeloEstado estado="UNKNOWN" />
              </div>

              <div className="mt-5 flex flex-wrap gap-2" aria-label="Tipos de capacidade">
                {(["Extensões", "Skills", "Agentes", "Ferramentas MCP", "Conectores"] as const).map((tipo) => (
                  <span key={tipo} className="rounded-md border border-border px-3 py-2 text-xs text-muted-foreground">
                    {tipo}
                  </span>
                ))}
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                Inventário inicial: ZENDRIVE CLI. Demais capacidades ainda exigem
                inventário e contraprova; não foram migradas nem reinstaladas.
              </p>

              <article className="panel mt-6 p-6" data-cd-flow="instinto.DesignCenter.extensao-zendrive-cli">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <span className="rounded-md border border-neon-blue/40 p-2 text-neon-blue">
                      <TerminalSquare className="size-6" aria-hidden="true" />
                    </span>
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-wide text-neon-blue">
                        CentralDark VS Code Restore · extensão existente
                      </p>
                      <h4 className="mt-1 text-lg font-semibold">🪬 ZENDRIVE CLI</h4>
                      <p className="mt-1 font-mono text-xs text-muted-foreground">
                        centraldark.centraldark-vscode-restore · fonte 0.1.4 no PR #1842
                      </p>
                    </div>
                  </div>
                  <span className="rounded-md border border-border px-2 py-1 font-mono text-[10px] text-muted-foreground">
                    Casa: versão instalada exige leitura do VS Code · pacote 0.1.4 em preparação
                  </span>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                  Volta ao terminal já aberto no VS Code sem criar outra sessão Hermes.
                  Registra apenas foco, início e fim de execuções no mesmo funil de logs:
                  Casa → Tailscale → MCP CentralDark.
                </p>

                <dl className="mt-5 grid gap-4 border-y border-border py-4 text-xs sm:grid-cols-2">
                  <div>
                    <dt className="text-muted-foreground">Comando da extensão</dt>
                    <dd className="mt-1 font-mono">CentralDark: ZENDRIVE CLI (terminal existente)</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Última prova de telemetria</dt>
                    <dd className="mt-1 font-mono">3 eventos na VPS · offset 3028322 · 15/10/2026</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Integração de logs</dt>
                    <dd className="mt-1">
                      PR #1820 · fonte local protegida · coletor e log-funnel reutilizados
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Limite atual</dt>
                    <dd className="mt-1">
                      Provider ChatGPT/Zendrive não provado ao vivo; ativação neste cockpit não medida.
                    </dd>
                  </div>
                </dl>

                <div className="mt-5 flex flex-wrap gap-3">
                  <Button asChild size="sm" variant="outline" data-cd-flow="instinto.DesignCenter.extensao-zendrive-fonte">
                    <a href="https://github.com/ServerVpss/CentralDark/tree/main/skills/vs-code-restore" target="_blank" rel="noopener noreferrer">
                      <Puzzle /> Código e receita <ExternalLink />
                    </a>
                  </Button>
                  <Button asChild size="sm" variant="outline" data-cd-flow="instinto.DesignCenter.extensao-zendrive-pr">
                    <a href="https://github.com/ServerVpss/CentralDark/pull/1842" target="_blank" rel="noopener noreferrer">
                      Versão 0.1.4 · PR / atualizar <ExternalLink />
                    </a>
                  </Button>
                  <Button asChild size="sm" variant="outline" data-cd-flow="instinto.DesignCenter.extensao-zendrive-vsix-instructions">
                    <a href="https://code.visualstudio.com/docs/configure/extensions/extension-marketplace#_install-from-a-vsix" target="_blank" rel="noopener noreferrer">
                      Instalar VSIX no VS Code <ExternalLink />
                    </a>
                  </Button>
                  <Button asChild size="sm" variant="outline" data-cd-flow="instinto.DesignCenter.extensao-zendrive-logs">
                    <a href="https://github.com/ServerVpss/CentralDark/pull/1820" target="_blank" rel="noopener noreferrer">
                      Ver integração de logs <ExternalLink />
                    </a>
                  </Button>
                </div>
                <p className="mt-4 text-xs text-muted-foreground">
                  Atualização nativa do VS Code não distribui versões novas de uma extensão privada instalada por VSIX. Use o pacote VSIX da versão publicada ou gere o VSIX a partir da fonte; a ficha do Marketplace não atualiza o PC remotamente.
                  Não inicia Hermes nem concede acesso remoto.
                </p>
              </article>
            </section>
          </TabsContent>
        ) : null}

        <TabsContent value="superficies" className="mt-6">
          <div className="grid gap-5 lg:grid-cols-3">
            {(["publica", "entrada", "controle"] as const).map((tipo) => (
              <article key={tipo}>
                <div className="mb-3 flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase">
                    {tipo === "publica"
                      ? "Inicial pública"
                      : tipo === "entrada"
                        ? "Landing do cockpit"
                        : "Cockpit logado"}
                  </span>
                  <SeloEstado estado={tipo === "controle" ? "UNKNOWN" : "PASS"} />
                </div>
                <MiniSuperficie tipo={tipo} />
              </article>
            ))}
          </div>
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <div className="panel p-5">
              <Monitor className="size-5 text-neon-blue" />
              <h3 className="mt-3 font-semibold">Computador</h3>
              <p className="mt-2 text-xs text-muted-foreground">
                Grade ampla, painel completo e Hermes com passeio protegido nas bordas.
              </p>
            </div>
            <div className="panel p-5">
              <Smartphone className="size-5 text-neon-purple" />
              <h3 className="mt-3 font-semibold">Celular</h3>
              <p className="mt-2 text-xs text-muted-foreground">
                Controles empilhados, Hermes reduzido e textos sem sobreposição.
              </p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="auditoria" className="mt-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              [
                "Contraste semântico",
                "Tokens de texto e estado preservados; inspeção visual concluída.",
              ],
              ["Responsividade", "Capturas verificadas em 1280 × 1800 e 390 × 844."],
              [
                "Sobreposição do Hermes",
                "Navegação e controles permaneceram clicáveis nas duas larguras.",
              ],
              ["Movimento reduzido", "Contraprova executada com prefers-reduced-motion: reduce."],
            ].map(([item, prova]) => (
              <article key={item} className="panel p-5">
                <Check className="size-5 text-neon-green" />
                <h3 className="mt-3 text-sm font-semibold">{item}</h3>
                <p className="mt-2 text-xs text-muted-foreground">{prova}</p>
              </article>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <div className="mt-10 border-y border-border py-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] text-neon-blue uppercase">Comparação e rollback</p>
            <h3 className="mt-2 text-xl font-semibold">Canônico × refinamento</h3>
          </div>
          <Button
            data-cd-flow="instinto.DesignCenter.botao-06"
            type="button"
            variant="outline"
            onClick={() => definirComparacao("canonico")}
          >
            <RotateCcw />
            Reverter preview
          </Button>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <button
            data-cd-flow="instinto.DesignCenter.botao-07"
            type="button"
            onClick={() => definirComparacao("canonico")}
            aria-pressed={comparacao === "canonico"}
            className={`panel p-5 text-left ${comparacao === "canonico" ? "border-gold/60" : ""}`}
          >
            <Eye className="size-5 text-gold" />
            <h4 className="mt-3 font-semibold">Antes · canônico publicado</h4>
            <p className="mt-2 text-xs text-muted-foreground">
              Paleta, desenho, aura, cajado e nove ações aprovadas permanecem intocados.
            </p>
          </button>
          <button
            data-cd-flow="instinto.DesignCenter.botao-08"
            type="button"
            onClick={() => definirComparacao("teste")}
            aria-pressed={comparacao === "teste"}
            className={`panel p-5 text-left ${comparacao === "teste" ? "border-neon-blue/60" : ""}`}
          >
            <TriangleAlert className="size-5 text-neon-blue" />
            <h4 className="mt-3 font-semibold">Depois · refinamento em teste</h4>
            <p className="mt-2 text-xs text-muted-foreground">
              Mais definição e continuidade por quadro, sem mudar identidade ou cores.
            </p>
          </button>
        </div>
      </div>
    </section>
  );
}
