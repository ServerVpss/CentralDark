---
name: fable-loop
gate: FABLE_LOOP | !CALIBRAR | !ACORDAR | #ACORDAR
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
