# DECISAO - motor-selecao.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\ECentralDark_RECONCILIATIONOUROLOCALskills 2\kimetsu-legacy-operational-method\references\motor-selecao.md
**SHA:** 5f1f302e26796083
**Timestamp:** 2026-08-28T02:57:23.833264
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Riscos
- IF invariantes_ou_risco:              RETURN PEDRA

### Ouro Bruto (primeiros 5000 chars)
```
---
title: Motor de Seleção — Kimetsu Legacy
---

# Motor de Seleção — Kimetsu Legacy

## Função Principal

```text
FUNCTION SELECT_BREATH(state):
ALWAYS:
  CONCENTRATION_TOTAL

IF visão_global_necessária:           RETURN SOL
IF invariantes_ou_risco:              RETURN PEDRA
IF causa_desconhecida:                RETURN FERA
IF informação_demais:                 RETURN NÉVOA
IF dependência_indireta:              RETURN SERPENTE
IF propagação_importa:                RETURN VENTO
IF detalhe_fino_importa:              RETURN FLOR
IF causa_exata:                       RETURN INSETO
IF caminho_bloqueado:                 RETURN ÁGUA
IF sequência_temporal:                RETURN SOM
IF persistência_evidência:            RETURN CHAMAS
IF execução_multietapa_provada:       RETURN CHAMAS
IF ajuste_operador:                   RETURN AMOR
IF ajuste_humano:                     RETURN AMOR
IF ação_curta_e_provada:              RETURN TROVÃO
IF velocidade_decisiva:               RETURN TROVÃO
IF contraprova_necessária:            RETURN LUA

BEFORE_CLOSE:
  VERIFY_DECISION_INVARIANCE
  VERIFY_WRITER_SCOPE
  VERIFY_NO_SECRET_LEAKAGE
  VERIFY_ROLLBACK_READY
  VERIFY_EVIDENCE_COLLECTED
  VERIFY_LUA_CONTRAPROVA_PASSED
```

## Tabela de Decisão

| Prioridade | Condição | Respiração | Essência |
|------------|----------|------------|----------|
| 0 (Always) | `CONCENTRATION_TOTAL` | Kernel | Observador |
| 1 | `visão_global_necessária` | SOL | Meta-orquestrador |
| 2 | `invariantes_ou_risco` | PEDRA | Safety rails |
| 3 | `causa_desconhecida` | FERA | Descoberta exploratória |
| 4 | `informação_demais` | NÉVOA | Reduzir entropia |
| 5 | `dependência_indireta` | SERPENTE | Rota não-linear |
| 6 | `propagação_importa` | VENTO | Blast radius |
| 7 | `detalhe_fino_importa` | FLOR | Alta resolução |
| 8 | `causa_exata` | INSETO | Correção cirúrgica |
| 9 | `caminho_bloqueado` | ÁGUA | Adaptação |
| 10 | `sequência_temporal` | SOM | Ritmo/Sequenciamento |
| 11 | `persistência_evidência` | CHAMAS | Persistência evidência |
| 12 | `execução_multietapa_provada` | CHAMAS | Persistência evidência |
| 13 | `ajuste_operador` | AMOR | Ajuste ao operador |
| 14 | `ajuste_humano` | AMOR | Ajuste ao operador |
| 15 | `ação_curta_e_provada` | TROVÃO | Velocidade decisiva |
| 16 | `velocidade_decisiva` | TROVÃO | Velocidade decisiva |
| 16 | `contraprova_necessária` | LUA | Espelho adversarial |

## BEFORE_CLOSE (Hook Obrigatório)

```text
BEFORE_CLOSE:
  VERIFY_DECISION_INVARIANCE
  VERIFY_WRITER_SCOPE
  VERIFY_NO_SECRET_LEAKAGE
  VERIFY_ROLLBACK_READY
  VERIFY_EVIDENCE_COLLECTED
  VERIFY_LUA_CONTRAPROVA_PASSED
```

## Regras

1. **ALWAYS** executa `CONCENTRAÇÃO_TOTAL` primeiro
2. Primeira condição TRUE vence (ordem de prioridade)
3. `BEFORE_CLOSE` executa ANTES de qualquer `FIXED_POINT=TRUE`
3. `LUA` contraprova é obrigatória no fechamento
4. `WRITER_SCOPE` deve ser confirmado antes de mutação
```