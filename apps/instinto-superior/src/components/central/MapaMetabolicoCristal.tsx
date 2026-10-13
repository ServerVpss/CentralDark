/**
 * Projeção nominal do cristal no owner visual existente.
 * Metáfora de capacidades, não inventário de processos, diagnóstico nem segundo PET.
 * Fonte da intenção: docs/CONSCIENCIA/PROGRAMAS/KAIZEN-VIVO-INTENCAO-VIVA-20261008.md
 */
type Polo = { nome: string; significado: string };
/** Projeção estática dos owners existentes; não cria motor de Goal nem de PET. */
const NOMES_INTEGRAIS = [{"nome":"👑 CHEFE","text":"Intenção humana, soberania e direção; decide o objetivo."},{"nome":"🪬 Instinto Superior","text":"Identidade CentralDark e continuidade SOUL → RULES → AGENTS; SOL interpreta, Hermes executa."},{"nome":"🫀 Yuji","text":"Memória, vontade e identidade preservadas diante de poder extraordinário."},{"nome":"🔥 Sukuna","text":"Potência do motor substituível; força não significa permissão."},{"nome":"👁️ Gojo","text":"Inventário/observação, Infinito, Azul, Vermelho, Roxo, RCT e Domínio na skill Oracle existente."},{"nome":"🪽 Whis","text":"Mestre inclusive de Bills: observa, aconselha, orienta, treina, antecipa consequências e pode intervir; não usurpa decisão."},{"nome":"🐈 Bills","text":"Deus da Destruição: autoridade, transformação, equilíbrio com criação, força e discernimento falível; não licencia apagar dados."},{"nome":"♾️ Goku","text":"Instinto Superior: perceber, adaptar, agir com precisão; face instinto do PET Hermes."},{"nome":"💜 Vegeta","text":"Ego Superior: resistência, confronto e evolução pelo caminho de Bills; face ego/ascensão violeta."},{"nome":"💎 Vegetto","text":"Fusão Potara: capacidades convergem no metabolismo cognitivo e funcional."},{"nome":"💎 Gogeta","text":"Fusão sincronizada: mesmo organismo, mesma intenção, nenhuma segunda arquitetura."},{"nome":"🧿 Realidade","text":"Testes/readback/contraprova após o efeito; Reality Judge não é porteiro."},{"nome":"🫀 Kaizen","text":"Receita, aprendizado, replay, NeuroLink e NEXT_CURSOR que alimentam a próxima batida."}] as const;
/** Vínculo operacional aditivo: personagens seguem metáforas, nunca identidades de novos agentes. */
const PAPEIS_OPERACIONAIS = {
  "👑 CHEFE": "CHEFE humano: define intenção, critérios e autorização; nenhum modelo assume sua autoridade.",
  "🪬 Instinto Superior": "Cockpit da CentralDark: mostra o mesmo estado; SOL coordena e Hermes executa.",
  "🫀 Yuji": "SOUL e memória canônica: conservam identidade, intenção e histórico independentemente do modelo.",
  "🔥 Sukuna": "Potência dos modelos substituíveis (GPT/Codex, Claude ou IA local), sem autorização para executar.",
  "👁️ Gojo": "GPT/Codex e Claude/SOL observam, confrontam hipóteses e usam a skill Oracle existente; não escrevem.",
  "🪽 Whis": "Claude/SOL no papel consultivo: questiona premissas, orienta e propõe contraprova ao Hermes.",
  "🐈 Bills": "Decisão continua com o CHEFE; Hermes só transforma o escopo autorizado. Destruição é metáfora, não permissão.",
  "♾️ Goku": "Hermes PET, face Instinto: executa com precisão a receita já comprovada no mesmo núcleo.",
  "💜 Vegeta": "O mesmo Hermes PET, face Ego: resiste à falha, retesta e recupera o último estado provado.",
  "💎 Vegetto": "Integração do pensamento consultivo com o corpo Hermes: um Goal e uma autoridade de escrita.",
  "💎 Gogeta": "Sincronização GPT/Codex → Hermes → Claude/SOL → Hermes no mesmo fluxo, sem duplicar executor.",
  "🧿 Realidade": "Testes, gates do mesmo SHA, logs e readback arbitram hipóteses; pareceres de IA não são PASS.",
  "🫀 Kaizen": "Owner de receita e NeuroLink preserva versões anteriores; só promove delta comprovado e reuso posterior.",
} as const satisfies Record<(typeof NOMES_INTEGRAIS)[number]["nome"], string>;

const CIRCUITO_COGNITIVO = [
  {
    nome: "🧠 GPT / Codex",
    papel: "Leitor e revisor de contratos, código, testes, SHA, CI e hipóteses técnicas.",
    limite: "Somente candidato e contraprova proposta; não usa ferramenta de mutação.",
    metafora: "👁️ Gojo — Seis Olhos e observação",
  },
  {
    nome: "⚙️ 🪬 Hermes",
    papel: "Único executor: roteia capacidade existente, mede, executa script autorizado, testa e emite recibo.",
    limite: "Uma caneta por escopo; conserva autorização, precondições e gates.",
    metafora: "♾️ Goku + 💜 Vegeta — duas faces do mesmo PET",
  },
  {
    nome: "🔍 Claude / SOL",
    papel: "Revisor consultivo da intenção, premissas, coerência, lacunas e critérios de aceite.",
    limite: "Não executa nem promove parecer a verdade; devolve hipóteses ao Hermes.",
    metafora: "🪽 Whis — orientação e contraprova",
  },
] as const;

const BATIDAS_DO_CIRCUITO = [
  "CHEFE define Goal, limites e autorização; recuperar CURRENT, owner e receita existente.",
  "GPT/Codex examina código e evidências; entrega hipótese técnica consultiva ao Hermes.",
  "Hermes reconcilia o candidato com as precondições e pede análise de Claude/SOL quando houver ganho.",
  "Claude/SOL contesta premissas e sugere teste discriminante; devolve candidato ao MESMO Hermes.",
  "Hermes escolhe uma caneta autorizada, executa o menor delta, testa, lê efeito e devolve receipt aos revisores.",
  "Reality Judge contraprova; Kaizen evolui a MESMA receita versionada, preservando a anterior; FIXED_POINT ou NEXT_CURSOR.",
] as const;

const PODERES_INTEGRAIS = [{"name":"SIX_EYES","text":"inventário de skills, tools, owners, evidências, falhas e NEXT_CURSOR"},{"name":"INFINITY","text":"não promover prova ausente nem output externo a verdade"},{"name":"BLUE","text":"atrair só evidência causal relevante"},{"name":"RED","text":"rejeitar duplicação, falso verde, stale e arquitetura paralela"},{"name":"PURPLE","text":"reconciliar menor delta no owner existente"},{"name":"RCT","text":"transformar falha comprovada em teste/receita/receipt"},{"name":"DOMAIN","text":"preservar LOOP_ID, TURN_ID, PARENT_ID, OWNER_SCOPE e NEXT_CURSOR"}] as const;
const BATIDAS_OP = [{"n":1,"text":"Vive e experimenta"},{"n":2,"text":"Descobre"},{"n":3,"text":"Melhora"},{"n":4,"text":"Comprova e deixa sua marca"},{"n":5,"text":"Aprende"},{"n":6,"text":"Reutiliza e alimenta a próxima batida"},{"n":7,"text":"Continua evoluindo"}] as const;
const BATIDAS_POEMA = [{"n":1,"text":"🫀 Receber"},{"n":2,"text":"👀 Perceber"},{"n":3,"text":"🧠 Compreender"},{"n":4,"text":"🔧 Transformar"},{"n":5,"text":"🪬 Conectar"},{"n":6,"text":"♻️ Aprender"},{"n":7,"text":"🚀 Continuar"}] as const;
const PECAS_INTEGRAIS = ["🌱 Kaizen: melhoria contínua.","🔄 Feedback: aprender com o retorno da realidade.","📈 Aprendizado incremental: evoluir em pequenos avanços.","🧠 Self-Learning: aprender com experiências comprovadas.","🔧 Self-Correction: identificar e corrigir erros.","❤️ Self-Healing: recuperar a operação após falhas.","🧿 Contraprova: verificar além da primeira aparência.","🪬 Continuidade da intenção: preservar o objetivo vigente.","♻️ Reuso: aproveitar o conhecimento já existente.","🎯 Menor delta: corrigir apenas o necessário.","🛡️ Preservação: proteger o que já funciona.","💻 Vibe Coding: desenvolver por conversa e experimentação.","👥 Crowdtesting: utilizar feedback humano como observação.","✅ CI sob demanda: aprofundar verificações quando necessário.","💾 Prompt/Self-Cache: reaproveitar contexto e trabalho adequado.","⚡ KV Cache: otimização do processamento de modelos compatíveis.","⚖️ RLCD: estudar decisões com confiança probabilística calibrada.","📚 Biblioteca indexada.","🧠 Memória NeuroLink.","🧭 Skills sob demanda.","🔮 Consulta ao Oráculo.","✍🏼 Self-Learning Harvest.","🔁 Replay de aprendizado.","💎 Promoção de memória validada.","🌟 Knowledge Compiler.","📋 Saídas estruturadas e verificadas por esquema.","📊 Avaliação paralela de decisões e suas probabilidades.","👀 Seis Olhos — Gojo Domain / Skill Evolution: observar capacidades utilizadas, selecionar evidências, rejeitar contradições, preparar a menor melhoria, aprender com falhas e preservar a continuidade da intenção."] as const;
const CAPACIDADES_INTEGRAIS = [{"id":"C01","text":"Intent Inbox Multimodal"},{"id":"C02","text":"Semantic Referent Resolver"},{"id":"C03","text":"Intent State"},{"id":"C04","text":"Sua Intenção Devolvida"},{"id":"C05","text":"Intent Coverage Engine"},{"id":"C06","text":"Human Final 10"},{"id":"C07","text":"Command Compiler"},{"id":"C08","text":"Capability/Owner Resolver"},{"id":"C09","text":"Master Loop"},{"id":"C10","text":"Model Pool"},{"id":"C11","text":"Hybrid Scheduler"},{"id":"C12","text":"CentralDark Router"},{"id":"C13","text":"Hermes Execution Plane"},{"id":"C14","text":"Proof / Counterproof / PDF Gate"},{"id":"C15","text":"Git Promotion"},{"id":"C16","text":"Live HUD"},{"id":"C17","text":"Federated Google Accounts"},{"id":"C18","text":"Semantic Storage Intake"},{"id":"C19","text":"Surface/Cockpit Projection"},{"id":"C20","text":"Learning Closure"}] as const;
const CLAUSULAS_G = [{"id":"G01","text":"Identidade, hierarquia e intenção CURRENT respeitadas","proof":"arquivos SOUL/RULES/AGENTS + delta com owner"},{"id":"G02","text":"META-GRILL executa antes da decisão, sem inventar fala do CHEFE","proof":"checklist de 10 perguntas + resposta/candidato"},{"id":"G03","text":"Goal/clauses/Horn diferenciam sintoma e objetivo","proof":"testes PASS, UNKNOWN, FAIL, STALE, fixed point"},{"id":"G04","text":"Owner existente e um writer por escopo","proof":"mapa de owners + git diff + ausência de duplicação"},{"id":"G05","text":"GREEN_STATE/receita/fingerprint reutilizados","proof":"replay e contraprova do cone alterado"},{"id":"G06","text":"Oracle consultivo e pesquisa aprofundada sob demanda","proof":"envelope correlacionado + candidato + custo/necessidade"},{"id":"G07","text":"Cache de contexto operacional preserva continuidade","proof":"capsule validada + compact/clean/reidratação provada"},{"id":"G08","text":"Hermes executa e sincroniza main→runtime sem apagar drift","proof":"SHA/hashes + `skill-sync-check.sh --check/--apply/--seal`"},{"id":"G09","text":"Reality Judge verifica efeito e o sensor","proof":"observador independente + negativo + readback"},{"id":"G10","text":"PR equivalente carrega as mesmas cláusulas","proof":"checklist por ID, links de teste/receipts e unknowns"},{"id":"G11","text":"HUD/Obsidian exibe métricas verdadeiras e relógio correto","proof":"owner plugin/HUD + fonte + atualização + prova Windows"},{"id":"G12","text":"Ciclo registra receita, timestamp, receipt e NEXT_CURSOR","proof":"registro durável + replay por outro executor"}] as const;
const CLAUSULAS_M = [{"id":"M01","text":"Poema Entre a Intenção e a Palavra intacto, byte a byte, com autoria, beija-flor, néctar, flores e concha."},{"id":"M02","text":"Desenho original com nós/setas/textos mantidos, sem reconstruir Mermaid."},{"id":"M03","text":"Personagens Yuji/Sukuna, Gojo, Whis/Bills, Goku/Vegeta, Vegetto/Gogeta, Realidade/Kaizen têm significado e vínculo."},{"id":"M04","text":"Whis aconselha e ensina Bills sem vetar toda decisão; Bills equilibra criação e destruição com discernimento imperfeito."},{"id":"M05","text":"Dois conjuntos originais de sete batidas preservados, operacional e poético, sem segunda máquina de estados."},{"id":"M06","text":"As 28 peças listadas, sem converter protótipo em capacidade provada."},{"id":"M07","text":"As 20 capacidades C01–C20 ligadas aos 40 requisitos/A01–A20 do owner."},{"id":"M08","text":"Sete poderes Gojo vinculados à mesma skill Oracle e não a agente paralelo."},{"id":"M09","text":"Fusão como metabolismo cognitivo E funcional de toda CentralDark, com Goal, owner, Hermes, Judge, receipt e NEXT_CURSOR."},{"id":"M10","text":"PET Goku/Vegeta na mesma store/movimentos/controles e sincronização do Hermes flutuante; arte exclusiva de Vegeta não alegada."},{"id":"M11","text":"Build/TypeScript/lint/readback visual da landing e cockpit no mesmo SHA, testes móveis e de acessibilidade."},{"id":"M12","text":"GOAL t_9040803d, G01–G12, readback de runtime/HUD/Obsidian, receipt e fixed point real; UNKNOWN sem falso PASS."}] as const;


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
        {/* Preserva o desenho anterior completo; conteúdo aditivo compartilhado entre landing e cockpit. */}
        <div className="space-y-5 border-t border-border pt-6" data-cd-cristal="metabolismo-integral">
          <h3 className="text-center text-lg font-semibold text-foreground">💎 Fusão = metabolismo cognitivo + funcional da CentralDark inteira</h3>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-lg border border-neon-blue/30 p-4">
              <h4 className="text-sm font-semibold text-neon-blue">🧠 Metabolismo cognitivo</h4>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">Intenção → CURRENT → percepção → compreensão → memória/NeuroLink → META-GRILL → confronto de hipóteses → Goal/cláusulas → decisão → aprendizado.</p>
            </div>
            <div className="rounded-lg border border-neon-purple/30 p-4">
              <h4 className="text-sm font-semibold text-neon-purple">⚙️ Metabolismo funcional</h4>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">Goal → GREEN_STATE/receita → owner/capability → Hermes → ação → teste → readback → Reality Judge/contraprova → receipt → HUD/Obsidian → NEXT_CURSOR.</p>
            </div>
          </div>
          <p className="text-center text-xs text-muted-foreground">👑 CHEFE → SOL coordena → Hermes executa → 🧿 realidade verifica o efeito → 🫀 Kaizen aprende. Nenhum segundo cérebro, PET executor ou writer.</p>
          {/* Complemento do MESMO mapa/metabolismo; projeção conceitual, nunca painel/serviço novo. */}
          <div className="rounded-xl border border-gold/30 bg-background/40 p-4 sm:p-5" data-cd-cristal="conselho-hermes">
            <h4 className="text-center text-base font-semibold text-foreground">
              ♾️ Uma intenção · múltiplos olhos · uma caneta · aprendizado comprovado
            </h4>
            <p className="mt-2 text-center text-xs leading-relaxed text-muted-foreground">
              Circuito consultivo: GPT/Codex pensa → Hermes mede e executa → Claude/SOL contrapõe
              → Hermes reconcilia → GPT/Codex revisa. Não são três executores nem um novo cérebro.
            </p>
            <div className="mt-4 grid gap-3 lg:grid-cols-3" aria-label="Responsabilidades do ciclo GPT, Hermes e Claude">
              {CIRCUITO_COGNITIVO.map((ator, indice) => (
                <div key={ator.nome} className={`rounded-lg border p-3 ${indice === 1 ? "border-gold/40 bg-gold/5" : "border-border bg-surface/60"}`}>
                  <p className="text-sm font-semibold text-foreground">{ator.nome}</p>
                  <p className="mt-1 text-[10px] font-mono tracking-wider text-gold">
                    {indice === 1 ? "EXECUTOR ÚNICO" : "PENSAMENTO CONSULTIVO"}
                  </p>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{ator.papel}</p>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground"><span className="font-semibold">Limite:</span> {ator.limite}</p>
                  <p className="mt-2 text-[11px] text-neon-blue">{ator.metafora}</p>
                </div>
              ))}
            </div>
            <p className="mt-3 text-center font-mono text-[11px] text-gold">
              GPT/Codex → Hermes → Claude/SOL → Hermes → GPT/Codex ↻
            </p>
            <ol className="mt-4 grid gap-2 text-xs leading-relaxed text-muted-foreground sm:grid-cols-2">
              {BATIDAS_DO_CIRCUITO.map((batida, indice) => (
                <li key={batida} className="rounded-md border border-border/70 p-3">
                  <span className="font-mono font-semibold text-neon-blue">{String(indice + 1).padStart(2, "0")}.</span> {batida}
                </li>
              ))}
            </ol>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              🫀 Receita conhecida: Hermes reutiliza primeiro, sem chamada de IA desnecessária.
              Novidade: revisores enviam somente candidatos; divergência vira teste, não votação.
              Kaizen acrescenta proveniência, versão e teste à mesma receita sem apagar a anterior.
            </p>
            <p className="mt-2 font-mono text-[10px] text-muted-foreground">
              VISUALIZAÇÃO DE CONTRATO · REVISÃO CRUZADA E2E AINDA UNKNOWN · MERGED ≠ DEPLOYED · UNKNOWN ≠ PASS
            </p>
          </div>
          <div className="rounded-lg border border-border p-4">
            <h4 className="text-sm font-semibold text-foreground">🧬 Nome, função, vínculo, limite</h4>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {NOMES_INTEGRAIS.map((n) => <div key={n.nome} className="rounded-md bg-background/40 p-3"><p className="text-xs font-semibold text-foreground">{n.nome}</p><p className="mt-1 text-xs text-muted-foreground">{n.text}</p><p className="mt-2 border-t border-border/60 pt-2 text-[11px] leading-relaxed text-neon-blue"><span className="font-semibold">No circuito: </span>{PAPEIS_OPERACIONAIS[n.nome]}</p></div>)}
            </div>
          </div>
          <div className="rounded-lg border border-border p-4">
            <h4 className="text-sm font-semibold text-foreground">👁️ Gojo — Domain da mesma skill Oracle</h4>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {PODERES_INTEGRAIS.map((poder) => <div key={poder.name} className="rounded-md bg-background/40 p-3"><p className="text-xs font-semibold text-foreground">{poder.name}</p><p className="mt-1 text-xs text-muted-foreground">{poder.text}</p></div>)}
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-lg border border-border p-4">
              <h4 className="text-sm font-semibold text-foreground">🫀 Sete batidas operacionais</h4>
              <ol className="mt-3 list-inside list-decimal space-y-1 text-xs text-muted-foreground">
                {BATIDAS_OP.map((b) => <li key={b.n}>{b.text}</li>)}
              </ol>
            </div>
            <div className="rounded-lg border border-border p-4">
              <h4 className="text-sm font-semibold text-foreground">🌸 Sete batidas do poema</h4>
              <ol className="mt-3 list-inside list-decimal space-y-1 text-xs text-muted-foreground">
                {BATIDAS_POEMA.map((b) => <li key={b.n}>{b.text}</li>)}
              </ol>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">"Entre a Intenção e a Palavra" permanece integral no manifesto: beija-flor, néctar, semente, jardim, flores, biblioteca, concha, memória e coração. Metáfora literária não substitui o ciclo funcional.</p>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-lg border border-border p-4">
              <h4 className="text-sm font-semibold text-foreground">📚 As 28 peças sem perda</h4>
              <ol className="mt-3 list-inside list-decimal space-y-1 text-xs text-muted-foreground">
                {PECAS_INTEGRAIS.map((item) => <li key={item}>{item}</li>)}
              </ol>
              <p className="mt-2 text-xs text-muted-foreground">28 conceitos ≠ 28 serviços provados.</p>
            </div>
            <div className="rounded-lg border border-border p-4">
              <h4 className="text-sm font-semibold text-foreground">🪬 C01–C20 do Loop Mestre</h4>
              <ol className="mt-3 space-y-1 text-xs text-muted-foreground">
                {CAPACIDADES_INTEGRAIS.map((cap) => <li key={cap.id}><span className="font-mono text-neon-blue">{cap.id}</span> · {cap.text}</li>)}
              </ol>
              <p className="mt-2 text-xs text-muted-foreground">40 requisitos e A01–A20 preservados no owner original.</p>
            </div>
          </div>
          <div className="rounded-lg border border-border p-4">
            <h4 className="text-sm font-semibold text-foreground">🧿 G01–G12 · Goal existente (checklist, não PASS)</h4>
            <ul className="mt-3 space-y-2 text-xs text-muted-foreground">
              {CLAUSULAS_G.map((cl) => <li key={cl.id}><span className="font-mono text-neon-blue">[ ] {cl.id}</span> — {cl.text} · {cl.proof}</li>)}
            </ul>
            <h4 className="mt-4 text-sm font-semibold text-foreground">🫀 M01–M12 · Critérios de integração do cristal</h4>
            <ul className="mt-3 space-y-2 text-xs text-muted-foreground">
              {CLAUSULAS_M.map((cl) => <li key={cl.id}><span className="font-mono text-neon-purple">[ ] {cl.id}</span> — {cl.text}</li>)}
            </ul>
          </div>
          <p className="text-center font-mono text-[10px] text-muted-foreground">GOAL t_9040803d · SAME OWNER · RUNTIME UNKNOWN · FIXED_POINT NÃO PROVADO</p>
        </div>

      </div>
    </section>
  );
}
