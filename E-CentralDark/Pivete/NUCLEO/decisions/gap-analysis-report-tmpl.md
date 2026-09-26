# DECISAO - gap-analysis-report-tmpl.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\aiox-core\squads\repertoire-mapper\templates\gap-analysis-report-tmpl.md
**SHA:** a2eb12a06f0d5f3c
**Timestamp:** 2026-08-28T13:25:14.597750
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- **Gap:**
- > {Descricao clara do gap: "O sujeito acredita que [X] mas as evidencias
- **Gap:**

### Ouro Bruto (primeiros 5000 chars)
```
# Gap Analysis Report

> Analise de Gaps: Espoused Theory vs Theory-in-Use
> Baseado em Chris Argyris & Donald Schon (1978)
>
> Analista: @argyris | Data: {YYYY-MM-DD} | Versao: {X.X.X}
>
> Este relatorio identifica as diferencas entre o que o sujeito DIZ
> que faz/acredita (espoused theory) e o que o COMPORTAMENTO observado
> revela (theory-in-use). Os gaps nao sao "erros" -- sao informacao
> valiosa sobre o repertorio real do sujeito.

---

## 1. Summary Metrics

### Numeros Gerais

| Metrica | Valor |
|---------|-------|
| Itens analisados (do Repertoire Manifest) | {N} |
| Itens validados (sem gap) | {N} ({%}) |
| Gaps detectados | {N} ({%}) |
| -- Critical gaps | {N} |
| -- Significant gaps | {N} |
| -- Minor gaps | {N} |
| Blind spots identificados | {N} |
| Contradicoes detectadas | {N} |
| Hidden expertise encontrada | {N} |
| Double-loop opportunities | {N} |
| Itens que requerem revisao | {N} |

### Distribuicao de Severidade

```
CRITICAL    [████░░░░░░░░░░░░░░░░] {N} ({%})
SIGNIFICANT [████████░░░░░░░░░░░░] {N} ({%})
MINOR       [██████░░░░░░░░░░░░░░] {N} ({%})
VALIDATED   [████████████████████] {N} ({%})
```

### Health Score

**Score geral: {X}/10**

| Dimensao | Score | Interpretacao |
|----------|-------|---------------|
| Consistencia (espoused vs actual) | {X}/10 | {O quanto o sujeito faz o que diz} |
| Completude (itens com evidencia) | {X}/10 | {O quanto os itens estao sustentados} |
| Auto-conhecimento (blind spots) | {X}/10 | {O quanto o sujeito se conhece} |
| Coerencia interna (sem contradicoes) | {X}/10 | {O quanto o repertorio e coerente} |

---

## 2. Severity Classification Guide

### Como classificar gaps

| Severity | Criterio | Acao | Impacto |
|----------|----------|------|---------|
| **CRITICAL** | Gap entre espoused e actual com impacto direto em resultados. O sujeito acredita fazer X mas evidencias mostram que faz Y, e Y causa danos. | Resolucao imediata. Apresentar evidencia ao sujeito com cuidado. | Alto -- afeta a eficacia do sujeito e a confianca de terceiros |
| **SIGNIFICANT** | Gap detectavel mas sem dano imediato. Padrao inconsistente que pode se tornar problema. | Incluir no plano de desenvolvimento. Monitorar. | Medio -- limita potencial ou gera ineficiencia |
| **MINOR** | Gap pequeno ou gap de documentacao. O sujeito faz algo diferente do declarado mas sem consequencia relevante. | Atualizar o manifesto. Registrar para referencia. | Baixo -- mais imprecisao do que problema |
| **BLIND SPOT** | O sujeito nao sabe que faz ou nao sabe que nao faz. Nao e gap de intencao, e gap de consciencia. | Apresentar com sensibilidade. Usar evidencia neutra. | Variavel -- pode ser de qualquer severity |
| **HIDDEN** | O sujeito possui expertise que ele mesmo nao reconhece. Nao e gap negativo -- e gap positivo. | Validar e incluir no manifesto. Celebrar. | Positivo -- expande o repertorio reconhecido |

### Exemplos de cada severity

**CRITICAL:**
> O sujeito diz "eu sempre ouço antes de aconselhar" (espoused), mas em 8 de 10
> sessoes analisadas, da conselho nos primeiros 5 minutos (actual). Mentorados
> reportam sentir que "nao sao ouvidos". Gap com impacto direto em resultados.

**SIGNIFICANT:**
> O sujeito diz "valorizo dados para decisao" (espoused), mas em incidentes
> criticos (CDM), 70% das decisoes foram tomadas por intuicao antes de ver
> dados (actual). Os dados foram usados para confirmar, nao para decidir.
> Sem dano imediato, mas limita a qualidade decisoria em situacoes ambiguas.

**MINOR:**
> O sujeito diz "uso o framework SWOT regularmente" (espoused), mas na
> pratica usa uma versao simplificada com apenas 2 quadrantes (actual).
> O resultado e similar -- gap de descricao, nao de competencia.

**BLIND SPOT:**
> O sujeito nao identifica "leitura de dinamica de grupo" como habilidade
> (nao aparece no espoused), mas consistentemente ajusta comportamento
> baseado em tensoes de grupo que outros nao percebem (actual). Expert
> em algo que nao sabe que sabe.

**HIDDEN:**
> O sujeito considera "networking" uma fraqueza, mas na pratica conecta
> pessoas com precisao notavel -- sabe intuitivamente quem complementa
> quem. Hidden expertise em matchmaking profissional.

---

## 3. Critical Gaps

<!-- Gaps com impacto direto em resultados. Resolucao prioritaria.
     Apresentar ao sujeito com evidencia e empatia. -->

### GAP-C-{001}: {Titulo descritivo}

| Campo | Valor |
|-------|-------|
| Severity | CRITICAL |
| Dominio | {Sub-dominio afetado} |
| Item(s) do Manifesto | {RM-XXX-NNN} |

**Espoused Theory (o que o sujeito diz):**
> {Citacao ou descricao do que o sujeito declara fazer/acreditar.
> Incluir fonte: transcricao, Q&A, declaracao direta.}
>
> Fonte: {referencia}

**Theory-in-Use (o que o comportamento revela):**
> {Descricao do que as evidencias mostram. Baseado em observacao,
> CDM incidents, analise de padroes, contradicao entre fontes.}
>
> Evidencias:
> - {Evidencia 1: fonte + descricao}
> - {Evidencia 2: fonte + descricao}
> - {Evidencia 3: fonte + desc
```