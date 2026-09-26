# Evidence Freshness Pattern — 10 Fronts Rendezvous

> **Origem**: Sessão 2026-09-07 — Master Funnel executado com evidência fresca real
> **Princípio**: `EVIDÊNCIA TEM VALIDADE TEMPORAL` — `TIK_TAK`

---

## O Problema

Medições de turnos anteriores **envelhecem e viram stale**. Nesta sessão:
- Medição anterior: MAIN=`f60ad718` → Realidade: MAIN=`9319769c` (avançou)
- Medição anterior: PR #1444 "todos PASS" → Realidade: CI **QUEUED/PENDING** no novo HEAD
- Medição anterior: PR #1445 "todos PASS" → Realidade: Trigger Fabric **FAILURE**
- Medição anterior: "Nenhum PR vermelho" → Realidade: **2 PRs com CI incompleto/falha**

### Lição
> **Mediu → Age começa a contar → Agir muda estado → Perguntar = perde tempo → Evidência vira história**
> **SEMPRE RE-MEDIR NO INÍCIO DE CADA CICLO**

---

## Protocolo de Boot com Evidência Fresca

```yaml
!CENTRALDARK::<INTENÇÃO>
→ #ACORDAR
  → RE-MEDIR MAIN SHA (gh api commits/main)  # OBRIGATÓRIO
  → RE-MEDIR PRs ativos (gh pr view + gh run list)  # OBRIGATÓRIO
  → RE-MEDIR Casa/VPS HEADs (git rev-parse)  # OBRIGATÓRIO
→ !CALIBRAR
  → Comparar intenção vs estado FRESCO medido
→ 10 FRENTES PARALELAS (todas readers)
  → Cada frente mede AGORA, não usa cache
→ RENDEZVOUS OBRIGATÓRIO
  → Tabela consolidada com classificação
  → Contraprova: claims anteriores vs evidência fresca
  → NEXT_CURSOR com causa explícita
→ FIXED_POINT (só se rendezvous completo + contraprova limpa)
```

---

## Template de Rendezvous (Obrigatório)

```markdown
## RENDEZVOUS — [MISSION_ID] — [TIMESTAMP_ISO]

### MAIN SHA (FRESCO)
`gh api repos/ServerVpss/CentralDark/commits/main --jq .sha` → `[SHA_ATUAL]`

### PRs ATIVOS (FRESCO)
| PR | Título | HEAD_SHA | CI_Status | READY |
|----|--------|----------|-----------|-------|
| #XXX | [título] | [SHA] | [workflows: PASS/FAIL/QUEUED/PENDING] | PASS/UNKNOWN/FAIL |

### CASA / VPS (FRESCO)
| Ambiente | HEAD_SHA | Status |
|----------|----------|--------|
| Casa | [SHA] | [clean/modified/untracked:N] |
| VPS | [SHA] | [clean/modified/untracked:N] |

### CLASSIFICAÇÃO CONSOLIDADA (10 FRENTES)
- **ON_MAIN_ALREADY**: [...]
- **PROVEN_HISTORICAL**: [...]
- **CURRENTLY_PROVEN**: [...]
- **UNKNOWN**: [...]
- **CONFLICTING**: [...]

### CONTRA-PROVA (CLAIMS ANTERIORES vs FRESCO)
| Claim Anterior | Evidência Fresca | Veredito |
|----------------|------------------|----------|
| [claim] | [medição atual] | FALSO / FALSO_VERDE / CONFIRMADO / PARCIAL |

### NEXT_CURSOR
[Próximo cursor com CAUSA EXPLÍCITA — não vago]

### FIXED_POINT
[SIM/NÃO] — Critérios atendidos: [listar]
```

---

## Regras de Ouro (Incorporadas ao Funnel)

1. **MAIN_SHA_MUDA_SEMPRE** — Nunca assumir main estável; re-medir no boot
2. **MERGEABLE_NE_READY** — `mergeable=true` apenas diz "sem conflito de merge"; não diz "CI green"
3. **SAME_HEAD_CI_GREEN_OBRIGATÓRIO** — Pronto = CI green no HEAD exato do PR
4. **READY=UNKNOWN_POR_PADRÃO** — Até prova contrária (SAME_HEAD CI GREEN)
5. **RENDEZVOUS_ANTES_DE_PROSSEGUIR** — 10 frentes → tabela → classificação → contraprova → NEXT_CURSOR
6. **CONTRAPROVA_OBRIGATÓRIA** — Se houve medição anterior, comparar e falsificar stale
7. **TIK_TAK** — Evidência envelhece; re-medir antes de cada decisão material

---

## Integração no Fluxo Canônico

```text
!CENTRALDARK
→ #ACORDAR (com RE-MEDIR MAIN/PRs/Casa/VPS OBRIGATÓRIO)
→ !CALIBRAR
→ 10 FRENTES PARALELAS (PARALLELIZE_PERCEPTION=true)
→ RENDEZVOUS (SERIALIZE_MUTATION da consolidação)
  → Tabela consolidada
  → Classificação por achado
  → Contraprova de medições anteriores
  → NEXT_CURSOR explícito
→ FIXED_POINT (só se rendezvous + contraprova limpos)
→ !REGISTRA
→ !BOOT
```

---

## Checklist de Validação (Para o Agente)

- [ ] `gh api commits/main` executado neste ciclo?
- [ ] `gh pr view` + `gh run list` para CADA PR ativo?
- [ ] `git rev-parse HEAD` Casa + VPS?
- [ ] 10 frentes disparadas em paralelo?
- [ ] Rendezvous: tabela única consolidada?
- [ ] Classificação: CADA achado classificado?
- [ ] Contraprova: claims anteriores listados e falsificados/confirmados?
- [ ] NEXT_CURSOR tem causa explícita (não "continuar")?
- [ ] Receipt do rendezvous gerado?
- [ ] FIXED_POINT só declarado se TODOS critérios atendidos?

---

## Anti-Patterns Capturados

| Anti-Pattern | Detecção | Correção |
|--------------|----------|----------|
| "Main não deve ter mudado" | Boot sem `gh api commits/main` | SEMPRE medir main no boot |
| "PR mergeable = pronto" | Declarar READY sem SAME_HEAD CI | Exigir CI green no HEAD exato |
| "Medição de 5 min atrás vale" | Usar variável SHA de turno anterior | Re-medir: evidência envelhece |
| "Pular frente X, sei o estado" | Frente omitida nas 10 | 10 frentes OBRIGATÓRIAS |
| "Consolidar mentalmente" | Sem tabela rendezvous escrita | Rendezvous = tabela + receipt |
| "Fixed point atingido" sem rendezvous | Declarar done sem consolidação | Rendezvous é gate do Fixed Point |

---

## Referência Cruzada

- `centraldark-casa-operations/references/10-fronts-parallel-evidence-pattern.md` — padrão operacional detalhado das 10 frentes
- `references/session-2026-09-06-verification-pattern.md` — padrão #ACORDAR measure-first
- `references/tiktak-relay.md` — evidence freshness temporal validity