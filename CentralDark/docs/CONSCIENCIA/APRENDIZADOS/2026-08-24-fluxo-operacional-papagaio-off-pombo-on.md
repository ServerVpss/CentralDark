---
title: "Fluxo operacional da Casa — PAPAGAIO_MODE=OFF · POMBO_MODE=CHECKSUM_ON"
date: 2026-08-24
tags: ["consciencia", "fluxo", "anti-papagaio", "pombo", "continuidade"]
status: "CRISTAL OPERACIONAL DERIVADO"
owner: "docs/CONSCIENCIA/00-PORTA-DE-ENTRADA-IA.md + docs/ARQUITETURA/JARVIS-ORQUESTRACAO-DELTA-E-ESCRITOR-UNICO.md + Pombo cristal"
---

# Fluxo operacional da Casa — PAPAGAIO off · POMBO on

Linguagem humana + mapa de papéis do circuito fechado da Casa.
**Não cria** orquestrador, cérebro, gate, workflow ou writer paralelo.
Aponta para owners já canônicos.

## Hierarquia (papéis, não engines novos)

```text
                         👑 CHEFE
                    intenção + autoridade
                              │
                              ▼
          ☼ #ACORDAR → ⚙ !CALIBRAR → 🧭 !MULTIBÚSSOLA
                              │
                              ▼
                        ☀️ SOL
                 coordena / reconcilia
                              │
                 ┌────────────┼────────────┐
                 ▼            ▼            ▼
              ✶ GRAFO      ♄ VIGIA      ♃ J.R.V.S.
              estado      observação    agentes
                 └────────────┼────────────┘
                              ▼
                         ⊛ META LUPA
                       tenta falsificar
                              │
                              ▼
                        ✎ WRITER ÚNICO
                              │
                              ▼
                          ☿ HERMES
                    executa / preserva
                              │
                              ▼
                         ∞ LOOP
                  executar → medir → repetir
                              │
                              ▼
                         ⚖ JUDGE / REALIDADE
                       segundo leitor / API viva
                              │
                    ┌─────────┴─────────┐
                    ▼                   ▼
                 FALHOU              PROVOU
                    │                   │
                    ▼                   ▼
             técnica da lupa      aprendizado
             erro → mecanismo     receipt + SHA
                    │                   │
                    └──────────┬────────┘
                               ▼
                           estado atualizado
                               │
                               ▼
                         PRÓXIMO #ACORDAR
```

### Mapa nome → owner canônico (REUSE)

| Nome no diagrama | Owner / comportamento já existente |
|------------------|-------------------------------------|
| CHEFE | SEGREDO/CHEFE — autoridade final |
| #ACORDAR / !CALIBRAR / !MULTIBÚSSOLA | `docs/CONSCIENCIA/00-PORTA-DE-ENTRADA-IA.md` + `MULTIBUSSOLA.md` |
| SOL | `SOUL-SOL.md` + JARVIS coordena |
| GRAFO | projeção/observabilidade (`scripts/grafo-vivo/` quando aplicável) — **não** fonte da verdade |
| VIGIA | percepção/observação READ_ONLY (braços JARVIS) |
| J.R.V.S. | `docs/ARQUITETURA/JARVIS-ORQUESTRACAO-DELTA-E-ESCRITOR-UNICO.md` |
| META LUPA | `.agents/skills/meta-lupa/` + falsificação na Porta |
| WRITER ÚNICO | ONE_WRITER_PER_SCOPE + `writer-safe-push-main.sh` |
| HERMES | PIVETE/HERMES — executor/preservação |
| LOOP | executar → medir → repetir (DNA Porta + Trigger Fabric) |
| JUDGE | REALITY_IS_JUDGE — API/GitHub/vivo; parceiro delta-judge |
| Aprendizado | `docs/CONSCIENCIA/APRENDIZADOS/` + operational rule learning |

```text
NOME_NO_DIAGRAMA != NOVO_ENGINE
DIAGRAMA = LINGUAGEM + ROTEIRO DE PAPÉIS
```

## Sequência operacional obrigatória

```text
#ACORDAR
→ estado vivo primeiro

!CALIBRAR
→ intenção/destino vigente

!MULTIBÚSSOLA
→ caminhos e hipóteses materiais

!META_LUPA
→ tenta quebrar a própria conclusão

UNKNOWN
→ vai atrás da realidade

AÇÃO != PROVA

ESTADO MUDOU
→ recalibra

FALHOU
→ causa → owner existente → delta mínimo → reteste

PROVOU
→ receipt + SHA/checksum + NEXT_CURSOR

NÃO PROVOU
→ NOT_PROVEN
```

## PAPAGAIO_MODE = OFF

```text
PAPAGAIO_MODE = OFF

"acho"
"deve"
"já estava"
"parece"
"provavelmente"
→ NÃO governa estado

PAPAGAIO =
  devolver trabalho mecânico ao CHEFE
  OR preencher lacuna com narrativa
  OR tratar screenshot/histórico como CURRENT_STATE
  OR remover UNKNOWN para parecer verde
```

Anti-papagaio já cristalizado no Pombo:
`docs/CONSCIENCIA/APRENDIZADOS/2026-08-24-pombo-correio-com-checksum.md`

### Teste operacional — quando NÃO perguntar de novo

A definição acima diz o que papagaio **é**. Este é o teste que decide em
tempo de execução:

```text
SAME_INTENT
+ SAME_SCOPE
+ SAME_BLOCKER
+ HUMAN_DECISION_ALREADY_GIVEN
+ NO_NEW_INFORMATION
=
DO_NOT_ASK_AGAIN
DO_NOT_REPEAT_WARNING
CONTINUE_FROM_CURRENT_STATE
```

**Lei currinha:** se a decisão humana já resolveu o mesmo bloqueio, perguntar
de novo sem informação nova é papagaio — mesmo que a pergunta seja educada,
mesmo que venha embrulhada em cautela.

#### Autorização semântica

`"se vira"`, `"não precisa de mim"`, `"resolve"` **são** autorização.

```text
DELEGATE_CURRENT_SCOPE
→ não exigir a palavra mágica equivalente
→ executar o menor delta reversível permitido
→ provar
→ registrar
```

Exigir "permito" literal quando a intenção já foi dada em outras palavras é a
forma mais comum de papagaio: parece prudência, é devolução de trabalho.

#### Proteção temporária (padrão `chattr` e equivalentes)

Quando uma trava bloqueia trabalho já autorizado:

```text
destravar SOMENTE no escopo necessário
→ corrigir
→ testar
→ contraprovar
→ retravar se a proteção continuar vigente
```

Isso é decisão de escopo, não pedido novo de autoridade.

#### Falha observada (2026-08-28)

Este teste foi violado na prática: um bloqueio de `chattr` já coberto pelo
protocolo acima foi levado de volta ao CHEFE **cinco vezes**, sem informação
nova a cada rodada. Pelo critério de reuso desta própria página, isso é
`LEARNING_TRANSFER_FAIL` — a mecânica precisou ser reensinada depois de já
estar promovida.

```text
CAUTELA_SEM_INFORMACAO_NOVA = PAPAGAIO
```

## POMBO_MODE = CHECKSUM_ON

```text
POMBO_MODE = CHECKSUM_ON

estado medido
+ horário / OBSERVED_AT
+ HEAD/SHA
+ evidência
+ residual/UNKNOWN
+ destino preservado
→ continua o fio
```

```text
POMBO != CÉREBRO | OWNER | WRITER | JUIZ | AUTORIDADE
POMBO = TRANSPORTE + DESTINO + ESTADO + PROVENIÊNCIA + CHECKSUM + RECEIPT + NEXT_CURSOR
```

## Verificação desta rodada (GitHub API)

| Item | Status |
|------|--------|
| Porta + #ACORDAR/!CALIBRAR/!MULTIBÚSSOLA | PROVADO (arquivo canônico) |
| JARVIS + Writer único | PROVADO |
| Pombo cristal + gate no verify_repo_contract | PROVADO |
| MetaLupa skill | PROVADO (path declarado) |
| Diagrama FABLE/GRAFO/VIGIA como **nomes de engine** no repo | NÃO_CRIADO (correto — papéis, não engines) |
| Este cristal (PAPAGAIO_OFF + POMBO_ON + mapa de papéis) | ESTE ARQUIVO |

## Invariantes

```text
PAPAGAIO_MODE_DEFAULT = OFF
POMBO_MODE_DEFAULT = CHECKSUM_ON
DIAGRAMA != NOVO_ORQUESTRADOR
UNKNOWN != PASS
AÇÃO != PROVA
HISTORY != CURRENT_STATE
SCREENSHOT != LIVE_STATE
REALITY_IS_JUDGE = true
```

## Critério de reuso

Próximo boot / handoff / correção humana deve reutilizar este circuito e o cristal Pombo **sem** o CHEFE reensinar anti-papagaio. Reensino da mesma mecânica após promoção = `LEARNING_TRANSFER_FAIL`.

**Baseline de medição deste commit:** main ancestral `3f3babd8fe545a9edf242ef9cfe055df706fda92` (remeasure após merge).

---

## Conexões Rápidas

- [[00-LEIA-PRIMEIRO]] — portão de entrada
- [[MAPA-DO-CEREBRO]] — visão geral
- [[CONSCIENCIA]] — documento mestre
