# CONTRATO - contrato-prova.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\ECentralDark_RECONCILIATIONOUROLOCALskills 2\kimetsu-legacy-operational-method\references\contrato-prova.md
**SHA:** 3cf9af26e2a7c07a
**Timestamp:** 2026-08-28T02:57:23.772128
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- ### Regra: Verso Sem Mudança = Erro

### Ouro Bruto (primeiros 5000 chars)
```
---
title: Contrato de Prova e Formato de Fala — Kimetsu Legacy
---

# Contrato de Prova

## Registro Obrigatório por Respiração Executada

```text
BREATH=
VERSE=
TRIGGER=
ACTION=
OBSERVATION=
EVIDENCE=
VERDICT=
NEXT_BREATH=
```

## Vereditos Permitidos

```text
PASS
FAIL
UNKNOWN
BLOCKED
SKIP_JUSTIFICADO
```

> **Nunca** usar `PASS` para técnica não executada. Use `SKIP_JUSTIFICADO` com razão explícita.

---

## Formato de Fala do Hermes

### Antes da Execução
```text
RESPIRAÇÃO DA <NOME>
VERSO:
<verso da respiração — marcador de mudança real de política>
TRIGGER:
<condição que disparou>
EXECUÇÃO:
<ação concreta que Hermes realmente fará>
```

### Após a Execução
```text
EVIDÊNCIA:
<resultado observável>
VEREDITO:
PASS | FAIL | UNKNOWN | BLOCKED | SKIP_JUSTIFICADO
TRANSIÇÃO:
<RESPIRAÇÃO_ATUAL> → <PRÓXIMA_RESPIRAÇÃO>
```

---

## Regra do Verso

> **Verso = Marcador de mudança real de política operacional.**
> `Verso ≠ poesia`. Verso = "A política operacional AGORA mudou para: <Respiração>"

### Formalização

```text
ANTES do Verso:    Política = <Respiração_Anterior>
VERSO DECLARADO:  "Quando <condição>, a política muda para <Respiração_Nova>"
DEPOIS do Verso:   Política = <Respiração_Nova>
```

### Regra: Verso Sem Mudança = Erro

```text
SE Verso declarado MAS Política_Nova == Política_Atual
ENTÃO ERRO: Verso vazio — não houve mudança real de política
```

---

## Exemplo Completo

```text
RESPIRAÇÃO DO INSETO
VERSO:
Quando a causa cabe num ponto, não transforme o ponto num continente.
TRIGGER:
causa_exata=TRUE
EXECUÇÃO:
ROOT_CAUSE=bit-flip em mem[0x7fff+1]
MINIMUM_PATCH=flip bit 0 de volta
TARGETED_TEST=mem[0x7fff] == 0x42
COUNTERTEST=mem[0x7fff] != 0x43
REGRESSION_CHECK=0 falhas em 1000 iterações

EVIDÊNCIA:
mem[0x7fff] == 0x42 confirmado | 1000 iterações sem regressão
VEREDITO:
PASS
TRANSIÇÃO:
INSETO → VENTO
```
```