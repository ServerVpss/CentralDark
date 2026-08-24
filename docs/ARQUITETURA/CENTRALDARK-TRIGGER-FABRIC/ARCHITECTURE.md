# CENTRALDARK — Trigger Fabric canônica

A Trigger Fabric **não é um novo orquestrador**. Ela é o contrato que liga os gatilhos da Casa aos owners já existentes, preservando `ONE_SYSTEM_ONLY`, `REUSE_BEFORE_CREATE` e `ONE_WRITER_PER_SCOPE`.

```text
SEGREDO/CHEFE
      ↓
#ACORDAR + !CALIBRAR + !MULTIBUSSOLA
      ↓
DESTINATION_LOCK
      ↓
PERCEPÇÃO PARALELA
A1..A5 + C1..C5 + eixos materiais
      ↓
RENDEZVOUS
normalize → dedupe → conflito → teste discriminante
      ↓
META_LUPA ADAPTATIVA
FRIA | MÉDIA | QUENTE
      ↓
ROTEAR PARA OWNER EXISTENTE
      ↓
GraphRAG
Memory Linker
Session Harvester
MetaLupa
Reality Judge
Hermes Core
Knowledge Compiler
Vector Memory quando implementado/provado
      ↓
ONE WRITER PER SCOPE
      ↓
EXECUÇÃO MÍNIMA
      ↓
TESTE + CONTRAPROVA
      ↓
REALITY JUDGE
  ┌──────┼──────┐
  ↓      ↓      ↓
PROVADO FALHOU UNKNOWN
  ↓      ↓      ↓
RECEIPT  REMEDE MEDIR REALIDADE
CRYSTAL    ↘     ↙
LEARNING     RENDEZVOUS
  ↓
LAST_GOOD_STATE
  ↓
NEXT BOOT
```

## Owners existentes

| Capacidade | Owner observado |
|---|---|
| Boot/governança | `LEIA-ME-IA.md`, `AGENTS.md` |
| `!MULTIBUSSOLA` | `docs/CONSCIENCIA/MULTIBUSSOLA.md` |
| MetaLupa | `.agents/skills/meta-lupa/` |
| Missões/retomada | `apps/modulos/HERMES-CORE/core/orchestrator.mjs` |
| GraphRAG | `apps/modulos/HERMES-CORE/agents/GraphRAG-Master/agent.mjs` |
| Memória/delta/dream/padrões | `scripts/memory-linker/` |
| Colheita de sessão | `.agents/skills/session-intelligence-harvester/SKILL.md` |
| Cristalização | `.agents/skills/knowledge-compiler/` |
| Memória vetorial | `.agents/skills/vector-memory/SKILL.md` |
| Conformance | `.github/workflows/lupa-conformance.yml` |

## Automatismos observados no código

- mission poll: `5s`
- orphan recovery: `45s`
- GraphRAG refresh: `30m`
- GC legado: `6h` — **não promover como seguro automaticamente**; é destrutivo e precisa de reconciliação com a política atual.

## UNKNOWNs materiais preservados

```text
SESSION_END_HOOK_PHYSICAL_WIRING = NOT_PROVEN
DREAM_REVIEW_SCHEDULER_LOCAL = NOT_PROVEN
VECTOR_MEMORY_RUNTIME = NOT_PROVEN
WINDOWS_E_CENTRALDARK_SAME_HERMES_CORE_ACTIVE = NOT_PROVEN
```

A Casa não transforma esses UNKNOWNs em `PASS`. O gatilho mestre deve fazê-la andar atrás da realidade e costurar apenas as arestas realmente ausentes.

## Regra de interligação

```text
EVENTO
→ CLASSIFICAR
→ LOCALIZAR OWNER EXISTENTE
→ PROVAR CONSUMIDOR
→ NO_NEW_INFORMATION ? STOP : CONTINUE
→ RENDEZVOUS
→ ONE_WRITER
→ EXECUTAR
→ PROVAR NO MESMO ALVO
→ APRENDER
```

Nenhum `second brain`, `dispatcher-v2`, `MCP paralelo`, `GraphRAG-v2` ou segundo scheduler nasce desta arquitetura.
