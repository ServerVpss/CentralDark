---
name: fable-loop
gate: FABLE_LOOP | !CALIBRAR | !ACORDAR | #ACORDAR
<<<<<<< HEAD
author: HERMES-CASA (pivete profile) — derivado do cot-react-loop + learning-crystal-loop
date_created: 2026-08-31T22:03:43-03:00
canonical_sha_target: AUTO (hash do blob post-escrita)
status: CRISTALIZADO — nao E experimentos
---

# FABLE LOOP — Skill cristalizada (não experimental)
# Base: cot-react-loop + LEARNING_CRYSTAL_LOOP.yml + MODO-OPERACIONAL-LOOP-EVIDENCIA-PRIMEIRO.md
# Regra de ouro: NÃO é roteamento padrão enquanto MetaLupa não promover.

TRIGGERS: #FABLE_LOOP | !FABLE_LOOP | #ACORDAR + intenção de loop contínuo

PRE-FLIGHT (obrigatório antes do 1o ciclo):
- MEDIR repo HEAD, writer, worktree, remote
- LOCALIZAR skill/cot-react-loop existente (reutilizar, não duplicar)
- PROVAR que nao existe skill fable-loop nomeado (ja feito 2026-08-31 22:03)
- FIXAR writer = HERMES (executor) + NEMOTRON (observador/contraprova) — nao dois escritores no mesmo scope

CICLO (cada volta reduz pelo menos 1 UNKNOWN ou contradição):
1. MAPEAR — intencao + estado + scope
2. LER — fonte canônica (repo, docs, contrato)
3. ENTENDER — cruzar com existente (reuse > create)
4. BUSCAR CONTRADICAO — outro lado (Nemotron / observer)
5. TESTAR CRENCA — executar, medir, hash
6. CORRIGIR COMPREENSAO — se prova derruba crença
7. CONSOLIDAR SOMENTE O QUE SOBREVIVEU — delta, nao historia inteira
8. REINDEXAR — atualizar indice, nao contexto ativo
9. REPETIR — ate FIXED_POINT ou UNKNOWN comprovado

POINT FIXED (parar somente quando):
- REALITY_JUDGE = PASS (executor + observador concordam com prova)
- MAIN HEAD exato + CI verde comprovado (se aplicável)
- NÃO UNKNOWN convertido em PASS
- NÃO sinal parcial promovido a prova

ROLE GATE (nao inverter):
- HERMES = EXECUTOR (faz, escreve no scope autorisado)
- NEMOTRON = OBSERVADOR / CONTRAPROVA (mede independentemente, nao inicia mesmo scope)
- RENDEZVOUS = compara resultados
- REALITY_JUDGE = decide PASS / RECONCILE / UNKNOWN
- ONE_WRITER_PER_SCOPE = nao dois editores no mesmo scope

FALLBACK / CONTRAPROVA (obrigatorio para risco > R1):
- Se HERMES diz PASS → NEMOTRON mede por caminho independente
- Se divergir → RECONCILE, nao PASS
- Nunca autorizar a si mesmo

ANTI-TEATRO (nao fazer):
- Nao dizer "skill carregada" sem ler
- Nao transformar conversa crua em delta
- Nao criar V2/V3 do loop ao inves de estender existente
- Nao repetir leitura ja consolidada sem motivo

BACKUP DA CRIACAO DESTE SKILL (receita do que foi feito):
- Arquivo criado: .agents/skills/fable-loop/SKILL.md (pra nao inventar skill paralelo em /c/Users/danda/.hermes)
- Base reutilizada: cot-react-loop (ja existente, nao duplicado)
- Prueba: git hash-object + git rev-parse HEAD: (post-commit)
- Regra: se arquivo revertido sem aviso (como ocorreu com omni-router 2026-08-31 22:30-00:04), re-patch + commit IMEDIATO antes de continuar.

FIXED POINT ATUAL (2026-08-31 22:03):
- Skill criado, base reutilizada, writer identificado (HERMES executor / NEMOTRON observer)
- Replicar: cada ciclo do FABLE LOOP precisa reduzir pelo menos 1 UNKNOWN; nao repetir sem novo input
- Proxima virada: medida independente pelo NEMOTRON sobre o estado do router (portas 8099/8788/3030)
=======
author: HERMES-CASA (pivete profile), derived from cot-react-loop and learning-crystal-loop
canonical_sha_target: AUTO
status: CRYSTALLIZED_AS_READ_ONLY_METHOD
default_routing: false
---

# FABLE LOOP - calibration and stabilization method

Fable Loop is a read-only method inside the canonical CentralDark cycle. It is
not an agent, router, provider, identity, or second brain. Its default routing
remains closed until MetaLupa proves promotion with the required controlled
comparison.

TRIGGERS: #FABLE_LOOP | !FABLE_LOOP | #ACORDAR + explicit continuous-loop intent

PRE-FLIGHT (required before the first cycle):
- MEASURE repo HEAD, writer, worktree, remote, and applicable runtime
- REUSE an existing cot-react-loop or equivalent owner; do not duplicate it
- FIX the measured writer before any authorized mutation
- Keep Hermes as executor and an independent observer as counterproof

CYCLE (each round must reduce at least one UNKNOWN or contradiction):
1. MAP - intent, state, scope, owner, and proof target
2. READ - canonical repository, contracts, and current evidence
3. UNDERSTAND - compare with existing capability; reuse before create
4. SEEK_CONTRADICTION - inspect the independent observer side
5. TEST_BELIEF - execute the discriminating test, measure, and hash
6. CORRECT - update the smallest supported interpretation or delta
7. CONSOLIDATE - retain only information that survives counterproof
8. REINDEX - update the existing index or receipt, not active context
9. REPEAT - stop at a fixed point or preserve the UNKNOWN frontier

FIXED_POINT (method result, not global PASS):
- reality judge has an applicable proof
- the candidate remains on the measured HEAD
- no UNKNOWN was converted into PASS
- no partial signal was promoted to proof

ROLE_GATE:
- HERMES/PIVETE = executor and writer only in the authorized scope
- OBSERVER = independent reader and counterproof; it does not write the same scope
- RENDEZVOUS = compare observations without voting truth
- REALITY_JUDGE = decide PASS, RECONCILE, or UNKNOWN
- ONE_WRITER_PER_SCOPE = never two editors in the same scope

FALLBACK / COUNTERPROOF (required for material risk):
- If the executor reports PASS, the observer measures through an independent path
- If the observations diverge, reconcile; do not declare PASS
- Provider or transport changes require measured material failure

ANTI-THEATER:
- Do not claim a skill was loaded without reading it
- Do not turn raw conversation into a delta
- Do not create V2/V3 or a parallel loop
- Do not repeat a completed read without new evidence

CANONICAL_BINDING:
- owner: .agents/skills/fable-loop/SKILL.md
- mode: READ_ONLY_CALIBRATION
- default_routing: false
- may_write_canonical: false
- promotion_gate: META_LUPA_SAME_CONTROL
>>>>>>> origin/feat/fixed-point-fabric-proof-20260831
