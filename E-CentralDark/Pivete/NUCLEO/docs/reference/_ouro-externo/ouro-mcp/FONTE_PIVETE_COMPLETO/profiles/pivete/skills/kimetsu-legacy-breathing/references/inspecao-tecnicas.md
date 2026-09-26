# Técnicas de Inspeção — Kimetsu Legacy (INSETO/FLOR/NÉVOA)

## ZOOM_IN

Ativa resolução máxima para inspeção atômica de alvo único.

### Uso
```text
ZOOM_IN TARGET=<endereço/campo/instrução>
```

### Estado
```
████████████████████ 100% RESOLUÇÃO
░░░░░░░░░░░░░░░░░░░░ 0% RUÍDO
```

### Alvos Válidos
- Instrução específica (endereço/memória)
- Byte/campo específico (struct, array, registro)
- Flag/registrador específico
- Janela temporal nanosegundo
- Diferença binária única

---

## COMPARE_EXPECTED_ACTUAL

Diff byte-a-byte/campo-a-campo entre estado esperado e atual.

### Template

| Átomo | Esperado | Atual | Diff | Tipo |
|-------|----------|-------|------|------|
| `<endereço/campo>` | `0xXX / "valor"` | `0xYY / "valor"` | `!=` | `bit/byte/string/struct` |

### Exemplo
```text
┌─────────────────────────────────────────────────────────────┐
│ COMPARE_EXPECTED_ACTUAL                                     │
├──────────────┬────────────┬────────────┬─────┬──────────────┤
│ ÁTOMO        │ ESPERADO   │ ATUAL      │ DIFF │ TIPO         │
├──────────────┼────────────┼────────────┼─────┼──────────────┤
│ reg[RAX]     │ 0x00000001 │ 0x00000000 │ !=  │ register     │
│ mem[0x7fff]  │ 0x41 0x42  │ 0x41 0x43  │ !=  │ byte[1]      │
│ struct.flags │ 0b00101101 │ 0b00101001 │ !=  │ bitfield[3]  │
│ json.field   │ "active"   │ "pending"  │ !=  │ string       │
└──────────────┴────────────┴────────────┴─────┴──────────────┘

DIFERENÇAS: 4
ÚNICA CAUSA RAIZ: mem[0x7fff+1] 0x42 → 0x43 (bit 0 flip)
```

### Comando
```text
TARGET=<endereço/campo> EXPECTED=<valor> ACTUAL=<valor>
# Ou estrutural:
DIFF_STRUCT=<struct_name> BASELINE=<hash> CURRENT=<hash>
```

---

## IDENTIFY_SMALL_ANOMALIES

Varredura exaustiva de subespaço → baseline → diff → filtro ruído → classificação → ranqueamento.

### Algoritmo
```text
1. DEFINIR_SUBESPAÇO      # Delimite região: memória, struct, log, trace, binário
2. ESTABELECER_BASELINE   # Hash/assinatura do estado "bom" conhecido
3. VARRER_ATOMS           # Enumere cada átomo: bytes, bits, flags, campos, instruções
4. COMPARE_BYTE_A_BYTE    # Diff exaustivo contra baseline
5. FILTRAR_RUÍDO          # Descarte variações esperadas (timestamps, IDs, nonces)
6. CLASSIFICAR_ANOMALIAS  # Agrupe por: bit-flip, off-by-one, race, corrupção, desvio lógico
7. RANQUEAR_IMPACTO       # Crítico > Alto > Médio > Baixo > Cosmético
```

### Tipos de Anomalias Atômicas

| Tipo | Descrição | Exemplo |
|------|-----------|---------|
| `bit-flip` | Bit único invertido | flag `0→1` ou `1→0` |
| `off-by-one` | Índice/contador ±1 | loop boundary, length field |
| `race` | Ordem de execução | store/load reorder, TOCTOU |
| `drift` | Desvio gradual | timestamp skew, counter skew |
| `corruption` | Dado corrompido | pointer mangled, struct padding |
| `logic-deviation` | Desvio de especificação | branch errado, condição invertida |
| `side-channel` | Vazamento lateral | timing, cache, power |

### Saída Padrão
```text
┌────────────────────────────────────────────────────────────────┐
│ IDENTIFY_SMALL_ANOMALIES — RELATÓRIO                           │
├────────────────────────────────────────────────────────────────┤
│ SUBESPAÇO:          <região/estrutura/intervalo>              │
│ BASELINE_HASH:      <sha256>                                   │
│ CURRENT_HASH:       <sha256>                                   │
│ ÁTOMOS_VARRIDOS:    <N>                                        │
│ ANOMALIAS_BRUTAS:   <M>                                        │
│ ANOMALIAS_FILTRADAS:<K>                                        │
├──────────────┬───────────┬──────────┬──────────┬──────────────┤
│ # │ ÁTOMO    │ TIPO      │ IMPACTO  │ EVIDÊNCIA               │
├──────────────┼───────────┼──────────┼──────────┼──────────────┤
│ 1 │ bit[3]   │ bit-flip  │ CRÍTICO  │ flag signed→unsigned    │
│ 2 │ byte[17] │ off-by-1  │ ALTO     │ length field mismatch   │
│ 3 │ instr[42]│ race      │ MÉDIO    │ store/load reorder      │
│ 4 │ field.x  │ drift     │ BAIXO    │ timestamp skew 2ms      │
└──────────────┴───────────┴──────────┴──────────┴──────────────┘

PRÓXIMO: ZOOM_IN em anomalia #1 (CRÍTICA) → TRACE_SINGLE_PATH
```

---

## ORDER_BY_RELEVANCE

Ranqueamento por: `RELEVÂNCIA = (IMPACTO×0.5) + (PROB_CAUSA_RAIZ×0.3) + (RASTREABILIDADE×0.2)`

### Pesos
| Fator | Peso | Escala |
|-------|------|--------|
| IMPACTO | 0.5 | CRÍTICO=1.0, ALTO=0.7, MÉDIO=0.4, BAIXO=0.1 |
| PROB_CAUSA_RAIZ | 0.3 | 0.0 a 1.0 (evidência direta) |
| RASTREABILIDADE | 0.2 | 1.0=instrução única, 0.7=função, 0.4=módulo, 0.1=sistema |

### Cortes
| Relevância | Ação |
|------------|------|
| ≥ 0.70 | ZOOM_IN imediato (TRACE_SINGLE_PATH) |
| 0.40-0.69 | MONITOR ativo (collect evidence) |
| < 0.40 | LOG_ONLY (não consome ciclo ZOOM_IN) |

### Exemplo
```text
┌────┬──────────────┬─────────┬────────┬──────────┬───────────┬─────────────┐
│ #  │ ANOMALIA     │ IMPACTO │ PROB   │ RASTREAB │ RELEVÂNCIA │ AÇÃO        │
├────┼──────────────┼─────────┼────────┼──────────┼───────────┼─────────────┤
│ 1  │ bit-flip     │ 1.0     │ 0.95   │ 1.0      │ 0.965     │ ZOOM_IN #1  │
│ 2  │ off-by-1     │ 0.7     │ 0.80   │ 0.7      │ 0.710     │ ZOOM_IN #2  │
│ 3  │ race cond    │ 0.4     │ 0.60   │ 0.4      │ 0.460     │ MONITOR     │
│ 4  │ timestamp    │ 0.1     │ 0.30   │ 0.4      │ 0.190     │ LOG_ONLY    │
└────┴──────────────┴─────────┴────────┴──────────┴───────────┴─────────────┘
```

---

## Signal Extraction (Respiração NÉVOA)

```
COLLECT_SIGNALS → REMOVE_IRRELEVANT → CLUSTER_RELEVANT → ISOLATE_DECISION_VARIABLES → VALIDATE_DECISION_INVARIANCE
```

### Passo a Passo

| Passo | Ação | Critério |
|-------|------|----------|
| 1 | `COLLECT_SIGNALS` — Agregue todos sinais disponíveis | Exaustivo, sem filtro inicial |
| 2 | `REMOVE_IRRELEVANT` — Descarte sinais que não mudam a decisão | `DECISION(signal) == DECISION(∅)` → remove |
| 3 | `CLUSTER_RELEVANT` — Agrupe por variável de decisão | Correlação > 0.8 → mesmo cluster |
| 4 | `ISOLATE_DECISION_VARIABLES` — Conjunto mínimo determinante | Mínimo, independentes |
| 5 | `VALIDATE_DECISION_INVARIANCE` — Prove invariância | `DECISION(full) == DECISION(minimal)` |

### Regra de Ruído
```text
RUÍDO = sinal que NÃO altera DECISION_OUTCOME
SINAL = variável que ALTERA DECISION_OUTCOME
```

### Princípio Canônico
> **Névoa NÃO esconde informação. Névoa REVELA ao remover o que não decide = Reduzir entropia cognitiva.**

### Formalização
```text
ENTROPIA_COGNITIVA = -Σ p(decisão|sinais) × log p(decisão|sinais)

NÉVOA = operador que MINIMIZA ENTROPIA_COGNITIVA
        mantendo DECISION_INVARIANCE
```

### Regra Formal
```text
∀ sinal ∈ SINAIS:
    SE DECISION(SINAIS \ {sinal}) == DECISION(SINAIS)
    ENTÃO sinal ∈ RUÍDO
    SENÃO sinal ∈ VARIÁVEL_DECISÃO
```

### Métrica de Sucesso
```text
ΔENTROPIA = ENTROPIA_ANTES - ENTROPIA_DEPOIS
EFICIÊNCIA_NÉVOA = ΔENTROPIA / SINAIS_REMOVIDOS
META: EFICIÊNCIA_NÉVOA → MÁXIMA | DECISION_INVARIANCE = PASS
```