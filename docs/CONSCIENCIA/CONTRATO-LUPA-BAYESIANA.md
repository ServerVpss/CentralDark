---
title: "Contrato Lupa Bayesiana (canônica única)"
date: 2026-07-23
tags: ["lupa", "consciencia", "governanca"]
updated: 2026-08-14
---

# 🔍 Contrato da `lupa-bayesiana` — canônica única

> **Fonte da verdade:** `.agents/skills/meta-lupa/SKILL.md` no repo `ServerVpss/CentralDark`.
> **Não existem** `tecnica-da-lupa`, `MetaLupa`, `lupa-premium` ou qualquer variante paralela. "MetaLupa" é o nome interno que a própria skill canônica usa para se descrever como evolução — **é o mesmo artefato**.

## Identidade

| Campo | Valor |
|---|---|
| Caminho canônico | `.agents/skills/meta-lupa/SKILL.md` |
| Nome | `lupa-bayesiana` |
| Duplicatas proibidas | `tecnica-da-lupa`, `metalupa-bayesiana-canonica`, `lupa-premium` |
| Guard automatizado | `.github/workflows/lupa-drift-guard.yml` |
| Inventário | `docs/RELATORIOS/inventario-skills.json` |

## O que ENTRA (obrigatório em toda missão)

1. **Decisão** clara + hipótese principal + alternativas testáveis.
2. **Fonte da verdade** nomeada (repo/SHA, arquivo, endpoint) — não "memória" nem "aparência".
3. **Prior** com base declarada (histórico, base rate ou 0,5 neutro assumido).
4. **Ledger de evidências** com proveniência, reprodutibilidade e cluster de dependência.
5. **Custo do falso positivo e falso negativo** — se desconhecido, marcar `NÃO CALCULÁVEL`.
6. **Autorização** aplicável: a autoridade humana vigente é `SEGREDO/CHEFE`; marcador histórico `PERMITO PIVETE` não concede nem revoga autorização atual.

## O que SAI (formato obrigatório de saída)

Todos os campos do bloco `SAÍDA OBRIGATÓRIA` da skill devem ser preenchidos. Faltar campo é falha do contrato, não estilo:

```
VEREDITO · TRADUÇÃO DIRETA · DECISÃO · HIPÓTESES · FONTE DA VERDADE ·
PRIOR OU FAIXA · EVIDÊNCIAS · CLUSTERS · LRs · POSTERIOR · ENTROPIA ·
SENSIBILIDADE · FALSIFICADOR · PRÓXIMO TESTE · VOI · CUSTO DO ERRO ·
BLOQUEIOS · AUTORIZAÇÃO · RISCO RESIDUAL · ENCAIXE NO MAPA ·
ESTADO DE CONSOLIDAÇÃO · MECANISMO DE TRAVA · AUTOLUPA · PONTO FIXO ·
REGISTRO · FIO DA MISSÃO
```

Vereditos permitidos: `APROVAR | CONDICIONAR | CORRIGIR | BLOQUEAR`.

## Ganho de informação = ouro operacional

A Lupa não mede vitória de uma pessoa ou modelo. Mede quanto uma observação reduz erro e melhora o próximo movimento.

```text
CONFRONTO
→ EVIDENCIA NOVA
→ DELTA_DE_CRENCA
→ MUDANCA_REUTILIZAVEL
→ OURO
```

```text
HIPOTESE_SOBREVIVE + PROVA_NOVA       → OURO
HIPOTESE_CAI + CONTRAPROVA            → OURO
EMPATE + UNKNOWN_MELHOR_DEFINIDO      → OURO
AUTOFALSIFICACAO + FRAQUEZA_CORRIGIDA → OURO
REVISAO_EXTERNA + ACHADO_CAUSAL       → OURO
```

Sem evidência nova, sem delta de crença/regra/teste e sem consequência reutilizável, repetir o confronto é desperdício de ciclo. `INFORMATION_GAIN_REQUIRED=true`.

## Pontos fixos (invariantes que não mudam entre execuções)

| # | Ponto fixo | Verificação automatizada |
|---|---|---|
| PF-1 | Só existe **uma** skill canônica de Lupa | `detectar_drift.py` — falha se ≠1 dir `.agents/skills/*lupa*` fora do canônico |
| PF-2 | `tecnica-da-lupa` e `MetaLupa` **nunca** voltam como skills paralelas | `detectar_drift.py` — bloqueia diretório e menção ativa em doc |
| PF-3 | Toda AutoLupa termina em `PONTO_FIXO_ATINGIDO: sim` ou mantém `CORRIGIR/BLOQUEAR` | Revisão humana + `test_autolupa_conformance.py` (15 checks) |
| PF-4 | Área protegida só muda com autorização vigente do `SEGREDO/CHEFE` aplicável ao alvo | guardrails + contrato atual de permissões |
| PF-5 | Prior nunca é `0` nem `1`; nunca inventar LR sem base declarada | Revisão manual + gate de falsificação da própria skill |
| PF-6 | Consolidação exige o bloco de 8 campos (caminho, testes, SHA, rollback...) | Revisão humana no PR + `docs/CONSCIENCIA/09-ESTADO-ATUAL.md` |
| PF-7 | Falta de dado → resultado válido é `NÃO CALCULÁVEL`, nunca chute numérico | Revisão humana |
| PF-8 | Confronto só vira aprendizado promovido com evidência nova + delta reutilizável | SOUL + AGENTS + MetaLupa |

## Checks CI ativos

- **`.github/workflows/lupa-drift-guard.yml`** — roda em todo PR para `main`, `pivete/dev`, `pivete/auditoria`:
  1. `python scripts/lupa/inventario_skills.py` (gera artifact `inventario-skills.json`)
  2. `python scripts/lupa/detectar_drift.py` (falha se drift)
  3. Assert `.agents/skills/meta-lupa/SKILL.md` existe e nenhum dir paralelo

- **`.github/workflows/lupa-conformance.yml`** (PR #316) — 15 verificações da AutoLupa + XP-3 + hash-guard canônico.

## Allowlist histórica (menções legítimas)

Estes arquivos podem citar as técnicas removidas **por serem registro histórico**:

- `docs/RELATORIOS/2026-07-22-incidente-drive-docs-autolupa.md`
- `docs/CONSCIENCIA/APRENDIZADOS.md`
- `scripts/lupa/detectar_drift.py` (o próprio guard)
- `docs/CONSCIENCIA/CONTRATO-LUPA-BAYESIANA.md` (este arquivo)
- `.github/workflows/lupa-drift-guard.yml`

Menção fora dessa lista, com padrão `skill|habilidade|técnica: tecnica-da-lupa|MetaLupa|...`, é tratada como drift e trava o PR.

## Como auditar sem dúvida

```bash
# 1. inventário atual
python scripts/lupa/inventario_skills.py | jq '.skills[] | {nome, caminho, canonica}'

# 2. drift check local
python scripts/lupa/detectar_drift.py

# 3. hash canônico atual (deve bater com o do repo)
git hash-object .agents/skills/meta-lupa/SKILL.md
```

Se qualquer um dos três divergir, o PR já quebra no CI antes de chegar em revisão humana.

---

## Conexões

- [[SKILL.md]] — `.agents/skills/meta-lupa/SKILL.md`
- [[SOUL-SOL.md]] — autoridade e aprendizado operacional atuais
- [[APRENDIZADOS.md]] — histórico de erros, correções e contraprovas

---

## Conexões Rápidas

- [[00-LEIA-PRIMEIRO]] — portão de entrada
- [[MAPA-DO-CEREBRO]] — visão geral
- [[CONSCIENCIA]] — documento mestre
