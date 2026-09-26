# CONTRATO - quality-gate-checklist.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\aiox-core\squads\squad-creator\checklists\quality-gate-checklist.md
**SHA:** b487db1c6095f983
**Timestamp:** 2026-08-28T13:25:21.280357
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- > **Pattern:** HO-PP-003 (Quality Gate Pattern)

### Contratos
- O campo `executor` define QUEM executa o gate:
- quality_gate:

### Ouro Bruto (primeiros 5000 chars)
```
# Quality Gate Validation Checklist

> **Pattern:** HO-PP-003 (Quality Gate Pattern)
> **Version:** 1.0.0
> **Source:** AIOS Quality Gate Standard
> **Updated:** 2026-01-24

Este checklist valida a estrutura e conformidade de Quality Gates conforme o padrao HO-PP-003.

---

## 1. Campos Obrigatorios

Todo Quality Gate DEVE conter os seguintes campos:

| Campo | Tipo | Descricao | Exemplo |
|-------|------|-----------|---------|
| `id` | string | Identificador unico no formato QG-X.Y | `QG-1.1B` |
| `name` | string | Nome descritivo do gate | `Briefing Completeness Gate` |
| `phase` | number | Numero da fase do workflow | `1` |
| `placement` | enum | Posicao do gate na fase | `transition` |
| `type` | enum | Tipo de execucao do gate | `hybrid` |
| `severity` | enum | Nivel de severidade | `blocking` |
| `criteria` | array | Lista de criterios de validacao | Ver secao 3 |
| `executor` | object | Quem executa a validacao | Ver secao 6 |
| `pass_action` | array | Acoes quando aprovado | `["Status -> Aprovado"]` |
| `fail_action` | array | Acoes quando reprovado | `["Status -> Bloqueado"]` |

### Checklist de Campos Obrigatorios

- [ ] `id` presente e no formato `QG-{phase}.{sequence}[suffix]`
- [ ] `name` presente e descritivo
- [ ] `phase` presente e numerico
- [ ] `placement` presente e com valor valido
- [ ] `type` presente e com valor valido
- [ ] `severity` presente e com valor valido
- [ ] `criteria` presente e array nao-vazio
- [ ] `executor` presente e objeto valido
- [ ] `pass_action` presente e array nao-vazio
- [ ] `fail_action` presente e array nao-vazio

---

## 2. Tipos Validos (type)

O campo `type` define COMO o gate e executado:

| Tipo | Descricao | Quando Usar |
|------|-----------|-------------|
| `manual` | Validacao humana completa | Decisoes criticas, aprovacoes finais |
| `automated` | Validacao 100% automatizada | Dados minimos, formatos, thresholds |
| `hybrid` | AI analisa + humano valida | Revisoes assistidas, aprovacoes complexas |
| `external` | Sistema externo valida | Webhooks, APIs terceiras |

### Checklist de Tipo

- [ ] `type` e um dos valores: `manual`, `automated`, `hybrid`, `external`
- [ ] Tipo escolhido e apropriado para o contexto:
  - [ ] `manual` -> Requer julgamento humano?
  - [ ] `automated` -> Pode ser validado por regras?
  - [ ] `hybrid` -> Beneficia de AI + supervisao?
  - [ ] `external` -> Depende de sistema externo?

---

## 3. Severidades Validas (severity)

O campo `severity` define O QUE ACONTECE se o gate falhar:

| Severidade | Descricao | Comportamento |
|------------|-----------|---------------|
| `blocking` | Gate bloqueante | Impede avanco; requer correcao |
| `warning` | Gate de alerta | Permite avanco; registra alerta |
| `info` | Gate informativo | Apenas registra; nao afeta fluxo |

### Checklist de Severidade

- [ ] `severity` e um dos valores: `blocking`, `warning`, `info`
- [ ] Severidade e apropriada para o impacto:
  - [ ] `blocking` -> Falha causa dano significativo?
  - [ ] `warning` -> Falha e relevante mas nao critica?
  - [ ] `info` -> Apenas para rastreamento/metricas?

---

## 4. Placements Validos (placement)

O campo `placement` define ONDE o gate e executado na fase:

| Placement | Descricao | Quando Usar |
|-----------|-----------|-------------|
| `entry` | Entrada da fase | Validar pre-condicoes antes de iniciar |
| `transition` | Transicao entre fases | Validar antes de passar para proxima fase |
| `exit` | Saida da fase | Validar resultado final da fase |

### Checklist de Placement

- [ ] `placement` e um dos valores: `entry`, `transition`, `exit`
- [ ] Placement e logico para o workflow:
  - [ ] `entry` -> Valida requisitos de entrada?
  - [ ] `transition` -> Valida criterios de passagem?
  - [ ] `exit` -> Valida entregaveis finais?

---

## 5. Estrutura de Criteria

O campo `criteria` e um array de objetos com a seguinte estrutura:

```yaml
criteria:
  - check: "Descricao do que esta sendo validado"
    type: "threshold | presence | enum | count"
    field: "nome_do_campo"
    value: valor_esperado
    operator: ">= | == | contains | > | < | != | in"
    weight: 0.0-1.0  # Opcional
```

### Campos do Criteria

| Campo | Obrigatorio | Descricao | Valores |
|-------|-------------|-----------|---------|
| `check` | Sim | Descricao legivel | String |
| `type` | Sim | Tipo de validacao | `threshold`, `presence`, `enum`, `count` |
| `field` | Condicional | Campo a validar | Nome do campo |
| `value` | Condicional | Valor esperado | Depende do tipo |
| `operator` | Condicional | Operador de comparacao | `>=`, `==`, `>`, `<`, `!=`, `contains`, `in` |
| `weight` | Nao | Peso na media ponderada | 0.0 a 1.0 |

### Tipos de Criteria

| Tipo | Descricao | Campos Requeridos |
|------|-----------|-------------------|
| `threshold` | Valor numerico minimo/maximo | `field`, `value`, `operator` |
| `presence` | Campo deve existir/ter valor | `field` |
| `enum` | Valor deve estar em lista | `field`, `value` (array) |
| `count` | Quantidade de 
```