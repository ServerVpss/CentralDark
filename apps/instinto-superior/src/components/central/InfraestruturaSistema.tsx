import { BookOpen, Boxes, Gem, Lock } from "lucide-react";

import { SeloEstado } from "@/components/central/EstadoCentralDark";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BIBLIOTECA,
  CRISTAL,
  PAINEIS_HISTORICOS,
  PAINEL_CENTRALDARK_FOTOS,
  VAULT,
} from "@/data/painel-unico";

function Lista({ itens }: { itens: string[] }) {
  return (
    <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
      {itens.map((i) => (
        <li key={i}>• {i}</li>
      ))}
    </ul>
  );
}

function Cofre() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <article className="panel p-5">
        <h4 className="font-semibold">{VAULT.raiz}</h4>
        <p className="mt-2 text-xs text-muted-foreground">{VAULT.diferenca}</p>
        <p className="mt-4 font-mono text-[10px] uppercase">Notas</p>
        <Lista itens={VAULT.notas} />
        <p className="mt-4 font-mono text-[10px] uppercase">Plugins da comunidade</p>
        <Lista itens={VAULT.pluginsComunidade} />
      </article>
      <article className="panel p-5">
        <h4 className="font-semibold">Menus do HUD</h4>
        <ul className="mt-3 space-y-2 text-sm">
          {VAULT.menus.map((m) => (
            <li key={m.nome}>
              <span className="font-mono text-neon-blue">{m.nome}</span>
              <span className="text-muted-foreground"> — {m.detalhe}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 font-mono text-[10px] uppercase">One Heart</p>
        <Lista
          itens={[
            VAULT.oneHeart.leitura,
            `Frescor máximo ${VAULT.oneHeart.frescorSeg}s`,
            `Ordem: ${VAULT.oneHeart.ordemEndpoints.join(" → ")}`,
            VAULT.oneHeart.nota,
          ]}
        />
      </article>
      <article className="panel p-5">
        <h4 className="font-semibold">Pendências do Chefe</h4>
        <Lista itens={VAULT.pendenciasChefe} />
      </article>
      <article className="panel p-5">
        <h4 className="font-semibold">Pendências do agente</h4>
        <Lista itens={VAULT.pendenciasAgente} />
      </article>
    </div>
  );
}

function Cristal() {
  const c = CRISTAL.capacidades;
  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">{CRISTAL.pasta}</p>
      <div className="grid gap-4 md:grid-cols-3">
        <article className="panel p-5">
          <h4 className="font-semibold">{c.total} capacidades</h4>
          <Lista
            itens={[
              `${c.EXISTING} existentes`,
              `${c.PARTIAL} parciais`,
              `${c.NEW_DELTA} deltas novos`,
              `${c.GAP} lacunas`,
              `${c.VERIFY_LIVE} a verificar ao vivo`,
            ]}
          />
          <p className="mt-3 font-mono text-[10px] text-muted-foreground">
            P0 {CRISTAL.prioridades.P0} · P1 {CRISTAL.prioridades.P1} · P2 {CRISTAL.prioridades.P2}
          </p>
        </article>
        <article className="panel p-5">
          <h4 className="font-semibold">Arsenal 50</h4>
          <Lista
            itens={[
              `Pacote: ${CRISTAL.arsenal.pacote}`,
              `Evidência de runtime: ${CRISTAL.arsenal.runtime}`,
              CRISTAL.arsenal.leitura,
              `Placar ${CRISTAL.placar.antes} → ${CRISTAL.placar.depois}`,
            ]}
          />
        </article>
        <article className="panel p-5">
          <h4 className="font-semibold">Leis do Cristal</h4>
          <Lista itens={CRISTAL.leis} />
        </article>
      </div>
      <article className="panel p-5">
        <h4 className="font-semibold">Capacidades por domínio</h4>
        <ul className="mt-3 flex flex-wrap gap-2">
          {CRISTAL.dominios.map(([d, n]) => (
            <li key={d} className="rounded border border-border px-2 py-1 font-mono text-[10px]">
              {d} · {n}
            </li>
          ))}
        </ul>
      </article>
      <article className="panel p-5">
        <div className="flex items-center justify-between gap-3">
          <h4 className="font-semibold">Graph Agentic Lens</h4>
          <SeloEstado estado={CRISTAL.graphLens.estado} />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">{CRISTAL.graphLens.ativos}</p>
        <Lista itens={CRISTAL.graphLens.regras} />
        <p className="mt-3 text-xs text-muted-foreground">
          Candidato de integração, ainda fora do bundle público. Sem fonte viva do grafo, só o
          exemplo de demonstração existe.
        </p>
      </article>
    </div>
  );
}

function Biblioteca() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {BIBLIOTECA.map((g) => (
        <article key={g.grupo} className="panel p-5">
          <h4 className="font-semibold">{g.grupo}</h4>
          <Lista itens={g.itens} />
        </article>
      ))}
      <article className="panel p-5">
        <h4 className="font-semibold">Painéis CentralDark históricos</h4>
        <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
          {PAINEIS_HISTORICOS.map((p) => (
            <li key={p.nome}>
              • {p.nome} — {p.tipo} <span className="font-mono text-[10px]">→ {p.destino}</span>
            </li>
          ))}
        </ul>
      </article>
    </div>
  );
}

function PainelHistorico() {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {PAINEL_CENTRALDARK_FOTOS.map((f) => (
        <article key={f.id} className="panel p-5">
          <div className="flex items-center justify-between gap-3">
            <h4 className="font-semibold">{f.titulo}</h4>
            <span className="font-mono text-[10px] text-muted-foreground">{f.data}</span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">{f.nota}</p>
          <dl className="mt-3 space-y-2 text-sm">
            {f.itens.map(([k, v]) => (
              <div key={k}>
                <dt className="text-xs text-muted-foreground">{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 font-mono text-[10px] text-gold">HISTÓRICO · não é estado atual</p>
        </article>
      ))}
    </div>
  );
}

export function InfraestruturaSistema() {
  return (
    <section aria-labelledby="infra-titulo">
      <p className="font-mono text-[10px] tracking-[0.2em] text-neon-purple uppercase">
        Inventário
      </p>
      <h3 id="infra-titulo" className="mt-3 text-3xl font-semibold">
        Infraestrutura
      </h3>
      <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
        Tudo que foi reunido num só lugar: vault Obsidian, Cristal e biblioteca de documentos.
        Inventário não é prova de execução.
      </p>
      <Tabs defaultValue="obsidian" className="mt-7">
        <TabsList className="h-auto flex-wrap justify-start">
          <TabsTrigger value="obsidian">
            <Lock /> Cofre Obsidian
          </TabsTrigger>
          <TabsTrigger value="cristal">
            <Gem /> Cristal
          </TabsTrigger>
          <TabsTrigger value="biblioteca">
            <BookOpen /> Biblioteca
          </TabsTrigger>
          <TabsTrigger value="painel">
            <Boxes /> Painel CentralDark
          </TabsTrigger>
          <TabsTrigger value="repos">
            <Boxes /> Repositórios
          </TabsTrigger>
        </TabsList>
        <TabsContent value="obsidian" className="mt-6">
          <Cofre />
        </TabsContent>
        <TabsContent value="cristal" className="mt-6">
          <Cristal />
        </TabsContent>
        <TabsContent value="biblioteca" className="mt-6">
          <Biblioteca />
        </TabsContent>
        <TabsContent value="painel" className="mt-6">
          <PainelHistorico />
        </TabsContent>
        <TabsContent value="repos" className="mt-6">
          <article className="panel p-5 text-sm text-muted-foreground">
            <p>
              <span className="text-foreground">ServerVpss/centraldark-instinto-superior</span> —
              corpo visual (este cockpit).
            </p>
            <p className="mt-2">
              <span className="text-foreground">ServerVpss/CentralDark</span> — autoridade de
              contratos, runtime, governança e receipts.
            </p>
          </article>
        </TabsContent>
      </Tabs>
    </section>
  );
}
