/**
 * Projeção nominal do cristal no owner visual existente.
 * Metáfora de capacidades, não inventário de processos, diagnóstico nem segundo PET.
 * Fonte da intenção: docs/CONSCIENCIA/PROGRAMAS/KAIZEN-VIVO-INTENCAO-VIVA-20261008.md
 */
type Polo = { nome: string; significado: string };

function ParDoCristal({
  titulo,
  esquerda,
  direita,
  detalhe,
}: {
  titulo: string;
  esquerda: Polo;
  direita: Polo;
  detalhe: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-surface/70 p-3 sm:p-4">
      <p className="mb-3 text-center font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
        {titulo}
      </p>
      <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 sm:gap-4">
        {[esquerda, direita].map((polo, indice) => (
          <div key={polo.nome} className={indice === 0 ? "col-start-1" : "col-start-3"}>
            <p className="text-center text-sm font-semibold text-foreground sm:text-base">{polo.nome}</p>
            <p className="mt-1 text-center text-xs leading-relaxed text-muted-foreground">
              {polo.significado}
            </p>
          </div>
        ))}
        <span className="col-start-2 row-start-1 text-lg text-gold" aria-label="Relação de duas vias">
          ↔
        </span>
      </div>
      <p className="mt-3 text-center text-xs text-muted-foreground">{detalhe}</p>
    </div>
  );
}

/** Uma projeção compartilhada pela landing e pelo CockpitShell; HermesPet permanece intacto. */
export function MapaMetabolicoCristal({ compacto = false }: { compacto?: boolean }) {
  return (
    <section
      aria-label="Mapa de nomes do metabolismo cognitivo e funcional da CentralDark"
      className={`rounded-2xl border border-primary/30 bg-surface/50 ${compacto ? "p-4" : "p-5 sm:p-8"}`}
    >
      <div className="mx-auto max-w-3xl space-y-4">
        <div className="text-center">
          <p className="font-mono text-[10px] tracking-[0.18em] text-neon-blue uppercase">
            🪬 Intenção viva · Mapa de nomes
          </p>
          <h2 className="mt-2 text-xl font-semibold text-foreground sm:text-2xl">
            Cristal da Inteligência · Instinto Superior + Ego Superior
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Nomes preservados como referências de capacidades da mesma CentralDark;
            não representam novos agentes nem estado de execução comprovado.
          </p>
        </div>
        <div className="rounded-lg border border-gold/30 bg-background/50 p-3 text-center">
          <p className="text-sm font-semibold text-gold">👑 CHEFE — INTENÇÃO E AUTORIDADE</p>
          <p className="mt-1 text-xs text-muted-foreground">↓ 🪬 Instinto Superior — identidade preservada</p>
        </div>

        <ParDoCristal
          titulo="Identidade e potência"
          esquerda={{ nome: "🫀 Yuji Itadori", significado: "Continuidade e vontade" }}
          direita={{ nome: "🔥 Ryomen Sukuna", significado: "Potência que exige controle" }}
          detalhe="A identidade preservada não entrega a intenção ao poder."
        />
        <div className="text-center">
          <p className="text-xs text-muted-foreground">↓</p>
          <p className="font-semibold text-foreground">👁️ Satoru Gojo — Seis Olhos e Proteção</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Observação, proteção e contraprova; referência à skill Oráculo já existente.
          </p>
        </div>
        <div className="text-center text-xs text-muted-foreground">↓</div>
        <ParDoCristal
          titulo="Mestres e orientação"
          esquerda={{ nome: "🪽 Whis", significado: "Treinamento, precisão e conselho; também orienta Bills" }}
          direita={{ nome: "🐈 Bills / Beerus", significado: "Decisão, energia da Destruição e equilíbrio" }}
          detalhe="Whis orienta e intervém em situações específicas; não substitui toda decisão de Bills."
        />
        <div className="text-center text-xs text-muted-foreground">↓</div>
        <ParDoCristal
          titulo="Duas formas de evoluir"
          esquerda={{ nome: "♾️ Goku — Instinto Superior Completo", significado: "Perceber, adaptar, agir com precisão" }}
          direita={{ nome: "💜 Vegeta — Ego Superior", significado: "Confrontar, resistir e aprender com falhas" }}
          detalhe="Precisão adaptativa ↔ resiliência transformadora."
        />

        <div className="rounded-xl border border-neon-purple/40 bg-background/50 p-4 text-center">
          <p className="font-mono text-[10px] tracking-widest text-neon-purple uppercase">
            ↓ Fusão — uma única intenção
          </p>
          <h3 className="mt-2 text-base font-semibold text-foreground">
            💎 Metabolismo cognitivo + funcional da CentralDark
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Vegetto (brincos Potara) · Gogeta (Dança da Fusão)
          </p>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            Metáfora da convergência: intenção → percepção → compreensão → memória →
            execução autorizada → teste → readback → aprendizado → continuidade.
          </p>
        </div>

        <div className="text-center">
          <p className="font-semibold text-foreground">🧿 REALIDADE — CONTRAPROVA</p>
          <p className="mt-1 text-sm font-semibold text-foreground">↻ 🫀 KAIZEN CONTÍNUO</p>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            Hermes (PET) continua sendo a interface visual do executor existente.
            Nenhum segundo PET, motor, cérebro, cockpit, scheduler ou writer.
          </p>
          <p className="mt-2 font-mono text-[10px] text-muted-foreground">
            MAPA CONCEITUAL · RUNTIME/DEPLOY NÃO AFERIDOS · UNKNOWN ≠ PASS
          </p>
        </div>
      </div>
    </section>
  );
}
