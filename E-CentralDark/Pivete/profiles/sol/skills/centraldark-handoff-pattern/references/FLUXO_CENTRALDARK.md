# FLUXO /CENTRALDARK — Arquitetura Completa (Visual)

---

## Visão Geral do Comando

```
/CENTRALDARK
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│  ENTRY POINT — Normalização de Aliases                      │
│  /CENTRALDARK | !CENTRALDARK | #CENTRALDARK | CENTRALDARK  │
└─────────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│  #ACORDAR — Carrega Contexto Mestre                         │
│  • Lê LEIA-ME-IA.md                                         │
│  • Identifica owners ativos                                 │
│  • Mede estado atual (HEAD, branch, PRs, writers)           │
└─────────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│  !CALIBRAR — Alinha Expectativas                            │
│  • Valida gatilhos: !MULTIBUSSOLA #CRISTALIZAR #FABLE_LOOP │
│  • Carrega skills relacionadas (auto-load)                  │
│  • Define escopo da missão                                  │
└─────────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│  #CRISTALIZAR · FABLE_LOOP — Pipeline 10 Frentes           │
│                                                             │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │ 1.NOTEPAD   │ │ 2.GITHUB    │ │ 3.DRIVE     │  ← READERS│
│  │  LOCAL      │ │  CURRENT    │ │  DOCS       │  PARALELOS│
│  └──────┬──────┘ └──────┬──────┘ └──────┬──────┘           │
│  ┌──────┴──────┐ ┌──────┴──────┐ ┌──────┴──────┐           │
│  │ 4.HERMES    │ │ 5.EXTERNOS  │ │ 6.SKILLS    │           │
│  │  RUNTIME    │ │  (ipnames)  │ │  TOOLS      │           │
│  └──────┬──────┘ └──────┬──────┘ └──────┬──────┘           │
│  ┌──────┴──────┐ ┌──────┴──────┐ ┌──────┴──────┐           │
│  │ 7.TESTS     │ │ 8.INFRA     │ │ 9.DOCS      │           │
│  │  COUNTER    │ │  PERF       │ │  HANDOFF    │           │
│  └──────┬──────┘ └──────┬──────┘ └──────┬──────┘           │
│         │              │              │                    │
│         └──────────────┼──────────────┘                    │
│                        ▼                                   │
│         ┌─────────────────────────────┐                    │
│         │ 10. REALITY JUDGE           │  ← META LUPA      │
│         │ (derruba cada claim)        │                    │
│         └──────────────┬──────────────┘                    │
└────────────────────────┼────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  RENDEZVOUS — Reconciliação                                 │
│  • Cruzamento de todos os fronts                            │
│  • Dedupe semântico (DELTAUTIL)                             │
│  • Owner match (sem segundo writer)                         │
│  • Classificação: CURRENT / SUPERSEDED / CONTRADICTED       │
└─────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  ONE WRITER PER SCOPE — PR #1381                            │
│  • Patch mínimo no escopo autorizado                        │
│  • Teste no MESMO HEAD                                      │
│  • Contraprova ativa                                        │
└─────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  REALITY JUDGE FINAL                                        │
│  ├─ PASS → Merge + Handoff ChatGPT completo                │
│  ├─ FAIL → Blocker real OU Decisão humana material          │
│  └─ NUNCA → Plano                                           │
└─────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  BOOT REFRESH — Atualiza estado para próxima sessão         │
│  • Receipt persistido                                       │
│  • Next cursor salvo                                        │
│  • Fixed point validado                                     │
└─────────────────────────────────────────────────────────────┘
```

---

## Skills Auto-Carregadas no Fluxo

```
#ACORDAR !CALIBRAR
       │
       ▼
┌────────────────────────────────────┐
│ centraldark-master-funnel-autonomo │  ← Funil mestre (obrigatório)
└────────────────────────────────────┘
       │
       ├──────────────────┬──────────────────┬──────────────────┐
       ▼                  ▼                  ▼                  ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│ session-     │   │ fable-loop   │   │ kimetsu-     │   │ screenpipe-  │
│ intelligence │   │              │   │ legacy-      │   │ hermes-      │
│ harvester    │   │ (10 fronts)  │   │ complete     │   │ integration  │
│ (Notepad)    │   │              │   │ (17 resp)    │   │ (logs vivo)  │
└──────────────┘   └──────────────┘   └──────────────┘   └──────────────┘
       │                  │                  │                  │
       ▼                  ▼                  ▼                  ▼
   Minerção           10 Leitores        Fixed Point        Screenpipe
   Notepad            Paralelos          + Auto-cura        + Meta Lupa
```

---

## Comando Bot (/CENTRALDARK) — Implementação

```yaml
# No config do bot (hermes/bot/commands.yaml ou similar)
commands:
  centraldark:
    aliases: ["/centraldark", "!centraldark", "#centraldark", "centraldark"]
    description: "Dispara pipeline CentralDark completo"
    flow:
      - step: "normalize_alias"
      - step: "load_skill"
        skill: "centraldark-master-funnel-autonomo"
      - step: "auto_load_related"
        skills:
          - "session-intelligence-harvester"
          - "fable-loop"
          - "kimetsu-legacy-complete"
          - "screenpipe-hermes-integration"
          - "centraldark-handoff-pattern"
      - step: "execute_pipeline"
        mode: "full_autonomy"
        hard_stop: "07:00"
        handoff_format: "centraldark-handoff-pattern"
      - step: "output"
        targets: ["chatgpt_handoff", "repo_file", "figma_sync", "slack_sync"]
```

---

## O que Acontece em Cada Etapa (Resumo para o Bot)

| Etapa | Ação do Bot | Skill Dona | Output |
|-------|-------------|------------|--------|
| `normalize_alias` | Converte qualquer alias → `/CENTRALDARK` | Bot core | Comando único |
| `load_skill` | Carrega funil mestre | `centraldark-master-funnel-autonomo` | Contexto mestre |
| `auto_load_related` | Carrega 5 skills relacionadas | Auto (frontmatter) | Arsenal completo |
| `execute_pipeline` | Roda 10 frentes → rendezvous → writer → judge | `fable-loop` + `kimetsu` | Handoff ou Blocker |
| `output` | Entrega handoff nos 4 targets | `centraldark-handoff-pattern` | ChatGPT/Repo/Figma/Slack |

---

## Integração da Nova Skill (`centraldark-handoff-pattern`)

```
FLUXO EXISTENTE                    + NOVA SKILL
────────────────────────────────────────────────────
9. DOCS_HANDOFF (fable-loop)       → usa template de
                                     centraldark-handoff-pattern
                                     para montar saída

10. REALITY_JUDGE                  → valida contra
                                     regras de ouro do
                                     centraldark-handoff-pattern

OUTPUT targets                     → formata no
                                     padrão exato
                                     (MEASURED_AT, etc.)
```

---

## Diagrama Simplificado (para o Bot Entender)

```mermaid
graph TD
    A[/CENTRALDARK] --> B[Normalize Alias]
    B --> C[#ACORDAR]
    C --> D[!CALIBRAR]
    D --> E[#CRISTALIZAR · FABLE_LOOP]
    E --> F[10 Frentes Paralelas READERS]
    F --> G[RENDEZVOUS + Meta Lupa]
    G --> H[ONE WRITER - PR #1381]
    H --> I[Patch Mínimo + Teste + Contraprova]
    I --> J{REALITY JUDGE}
    J -->|PASS| K[Merge + Handoff ChatGPT]
    J -->|FAIL| L[Blocker / Decisão Humana]
    K --> M[BOOT REFRESH]
    L --> M
    M --> N[Próxima Sessão]
```

---

## Próximo Passo (para implementar)

1. **Bot command registration** — registrar `/centraldark` com aliases
2. **Auto-load chain** — garantir que `centraldark-master-funnel-autonomo` puxa as 5 skills
3. **Output formatter** — usar `centraldark-handoff-pattern` como template obrigatório
4. **Hard stop 07:00** — implementar no executor
5. **Receipt persistence** — salvar em `.hermes/receipts/centraldark-YYYYMMDD.md`

---

**Esse é o fluxo.** O bot recebe `/CENTRALDARK`, normaliza, carrega o funil mestre, auto-carrega as 5 skills, executa o pipeline 10 frentes, rendezvous, writer único, reality judge, e entrega o handoff nos 4 targets.

Quer que eu implemente o registro do comando no bot agora? 🤝