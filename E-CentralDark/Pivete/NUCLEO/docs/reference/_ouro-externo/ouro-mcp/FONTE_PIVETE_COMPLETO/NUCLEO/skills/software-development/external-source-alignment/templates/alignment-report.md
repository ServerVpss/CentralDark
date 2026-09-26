# Alignment Report Template

**Mission ID:** [MISSION_ID]
**Date:** [YYYY-MM-DD]
**External Source:** [SOURCE_NAME] ([SIZE] bytes, SHA256 [SHA256])
**Stack Compared:** [STACK_COMPONENTS]
**Mission ID:** [MISSION_ID]
**Ledger:** usage_id=[USAGE_ID]

---

## Summary

| Class | Label | Count | Action |
|---|---|---|---|
| **A** | `PRINCÍPIO_REUTILIZÁVEL` | [COUNT] | Promover → estender artefato canônico |
| **B** | `EQUIVALENTE_JÁ_EXISTENTE` | [COUNT] | Ignorar (não duplicar) |
| **C** | `LACUNA_REAL` | [COUNT] | Promover backlog / fechar se crítico |
| **D** | `EXCLUSIVO_DA_PLATAFORMA` | [COUNT] | **REJEITAR** — nunca promover |
| **E** | `NÃO_VERIFICADO_OU_TEMPORAL` | [COUNT] | **REJEITAR** — nunca promover |
| **TOTAL** | | **[TOTAL]** | |

---

## Ouro Aproveitável (Classe A — Princípios Reutilizáveis)

| # | Princípio | Origem Externa | Aplicação no Stack |
|---|---|---|---|
| A1 | [Princípio] | [Origem] | [Aplicação] |
| A2 | [Princípio] | [Origem] | [Aplicação] |

---

## Já Existe no Stack (Classe B — Equivalente)

| # | Item Externo | Item Interno | Status |
|---|---|---|---|
| B1 | [Item] | [Item] | ✅ Idêntico |

---

## Lacunas Comprovadas (Classe C — Lacunas Reais)

| # | Lacuna | Onde Entra | Evidência Externa | Criticidade |
|---|---|---|---|---|
| C1 | [Lacuna] | [Arquivo/Módulo] | [Evidência] | 🔴 Crítica / 🟡 Menor |

---

## Conteúdo Rejeitado (Classes D + E)

| Classe | Count | Exemplos |
|---|---:|---|
| **D — Exclusivo da Plataforma** | [COUNT] | [Exemplos] |
| **E** | [COUNT] | [Exemplos] |

---

## Tabela Principal — Veredito por Bloco

| Bloco | Ouro (A) | Existe (B) | Lacuna (C) | Rejeitado (D+E) | Veredito |
|---|---:|---:|---:|---:|---|
| **1. Roteamento Tools** | [A] | [B] | **[C]** | [D+E] | 🟡 **CONDICIONAR** / 🟢 **APROVAR** |
| **2. Memória Versionada** | [A] | [B] | **[C]** | [D+E] | 🟡 **CONDICIONAR** / 🟢 **APROVAR** |
| **3. Correção Sem Culpa** | [A] | [B] | **[C]** | [D+E] | 🟢 **APROVAR** |
| **4. Decisão Visual** | [A] | [B] | **[C]** | [D+E] | 🟢 **APROVAR** |
| **TOTAL** | **[A]** | **[B]** | **[C]** | **[D+E]** | **CONDICIONAR** |

---

## Lacunas Críticas (Ação Imediata)

| # | Lacuna | Bloco | Onde | Esforço |
|---|---|---|---|---|
| 1 | [Lacuna] | [BLOCO] | [ARQUIVO/MÓDULO] | [Médio/Baixo] |

---

## Lacunas Menores (Backlog)

| # | Lacuna | Bloco | Prioridade |
|---|---|---|---|
| 1 | [Lacuna] | [BLOCO] | [Baixa/Média] |

---

## Classes D+E Rejeitadas — Resumo

| Classe | Count | Exemplos |
|---|---:|---|
| **D — Exclusivo da Plataforma** | [COUNT] | [Exemplos] |
| **E** | [COUNT] | [Exemplos] |

---

## Veredito da META LUPA

```
VEREDITO: [CONDICIONAR | APROVAR | BLOQUEAR]
TRADUÇÃO DIRETA: [Resumo em 1-2 linhas]
DECISÃO: [Ação decidida]
HIPÓTESES: [Nenhuma / Lista]
FONTE DA VERDADE: [Fontes]
PRIOR: 0.5 (neutro declarado).
EVIDÊNCIAS: [Count] itens classificados em 5 classes; [N] blocos comparados; [N] lacunas mapeadas.
CLUSTERS: [Nenhuma dependência cruzada detectada].
LRs: Qualitativos — evidências favorecem [CONDICIONAR/APROVAR].
POSTERIOR: [CONDICIONAR/APROVAR] com alta confiança.
ENTROPIA ANTES/DEPOIS: N/A (análise qualitativa).
SENSIBILIDADE: Baixa — conclusão robusta a variações de classificação.
FALSIFICADOR: Encontrar princípio Classe A não coberto no stack (não encontrado).
PRÓXIMO TESTE: Implementar [N] lacunas críticas e rodar META LUPA de regressão.
VALOR DA INFORMAÇÃO: Alto — evita importação cega de [N] itens D/E.
CUSTO DO ERRO: Médio — importar D/E criaria drift e paralisia.
BLOQUEIOS: Classes D/E bloqueadas por regra de ouro.
AUTORIZAÇÃO: PERMITO PIVETE para fechar lacunas críticas.
RISCO RESIDUAL: Baixo — apenas documentação de backlog.
ENCAIXE NO MAPA: Lacunas entram em artefatos existentes.
ESTADO CONSOLIDAÇÃO: Análise read-only consolidada.
MECANISMO TRAVA: META LUPA formal (BEGIN/FINAL registrados).
AUTOLUPA: PONTO_FIXO_ATINGIDO=sim (15 verificações respondidas).
REGISTRO: usage_id=[USAGE_ID]
FIO DA MISSÃO: [SOURCE] → classificar 5 classes → comparar 4 blocos → mapear lacunas → veredito [CONDICIONAR/APROVAR] → registrar
```

---

## Próxima Decisão do Pivete

| Opção | Ação |
|---|---|
| **Fechar N lacunas críticas agora** | [Ações específicas] |
| **Documentar N lacunas no backlog** | Criar issues/tarefas no formato META LUPA |
| **Nada** | Manter stack atual (já [X]% coberto) |

---

**Feito.**
**Evidência usada:** [FONTES] (SHA256 [SHA256]), [STACK_FILES], ledger uso-ledger.jsonl (BEGIN/FINAL usage_id=[USAGE_ID]).
**Pendência:** [N] lacunas críticas para fechamento; [N] lacunas para backlog; [N] itens D/E rejeitados.
**Próximo passo:** Aguardar decisão do Pivete sobre fechamento das [N] lacunas críticas.
**BOOT:** META LUPA formal completa (BEGIN/FINAL no ledger canônico).
**Fio da missão:** [SOURCE] → classificar 5 classes → comparar 4 blocos → mapear lacunas → veredito [CONDICIONAR/APROVAR] → registrar.