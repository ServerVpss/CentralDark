# Motor de Seleção — Kimetsu Legacy

## Função Principal

```text
FUNCTION SELECT_BREATH(state):
ALWAYS:
  CONCENTRAÇÃO_TOTAL

IF visão_global_necessária:
  RETURN SOL

IF invariantes_ou_risco:
  RETURN PEDRA

IF causa_desconhecida:
  RETURN FERA

IF informação_demais:
  RETURN NÉVOA

IF dependência_indireta:
  RETURN SERPENTE

IF propagação_importa:
  RETURN VENTO

IF detalhe_fino_importa:
  RETURN FLOR

IF causa_exata:
  RETURN INSETO

IF caminho_bloqueado:
  RETURN ÁGUA

IF sequência_temporal:
  RETURN SOM

IF persistência_evidência:
  RETURN CHAMAS

IF ajuste_operador OR ajuste_humano:
  RETURN AMOR

IF ação_curta_e_provada OR velocidade_decisiva:
  RETURN TROVÃO

IF contraprova_necessária:
  RETURN LUA
```

## Tabela de Prioridades

| Prioridade | Condição | Respiração | Gatilho |
|------------|----------|------------|---------|
| 0 | ALWAYS | CONCENTRAÇÃO TOTAL | Kernel obrigatório |
| 1 | visão_global_necessária | SOL | Orquestração necessária |
| 2 | invariantes_ou_risco | PEDRA | Risco elevado, infraestrutura |
| 3 | causa_desconhecida | FERA | Sistema desconhecido |
| 4 | informação_demais | NÉVOA | Ruído excessivo |
| 5 | dependência_indireta | SERPENTE | Cadeia A→B não direta |
| 6 | propagação_importa | VENTO | Blast radius relevante |
| 7 | detalhe_fino_importa | FLOR | Falha sutil/intermitente |
| 8 | causa_exata | INSETO | Diferença atômica conhecida |
| 9 | caminho_bloqueado | ÁGUA | Adaptação necessária |
| 10 | sequência_temporal | SOM | Jobs, pipelines, ordem |
| 11 | persistência_evidência | CHAMAS | Caminho comprovado, múltiplas etapas |
| 12 | ajuste_operador/humano | AMOR | UX, ergonomia, fluxo humano |
| 13 | ação_curta_e_provada/velocidade | TROVÃO | Janela estreita, ação única |
| 14 (Final) | contraprova_necessária | LUA | Antes do fechamento |

## Regras de Decisão

1. **CONCENTRAÇÃO TOTAL sempre primeiro** — kernel obrigatório antes de qualquer Respiração
2. **Uma Respiração por ciclo** — foco único, execução completa, depois volta ao kernel
3. **LUA sempre no final** — contraprova obrigatória antes do veredicto
4. **Se nenhuma condição match** → volta para SOL (reavaliação)
5. **Múltiplas condições** → prioridade pela tabela (menor número = maior prioridade)

## Mapeamento de Sinônimos

| Condição | Sinônimos Aceitos |
|----------|-------------------|
| visão_global_necessária | overview_needed, system_view, orchestration_needed |
| invariantes_ou_risco | safety_critical, high_risk, infrastructure |
| causa_desconhecida | unknown_cause, black_box, unexplored |
| informação_demais | noise_overload, too_many_signals |
| dependência_indireta | indirect_dependency, middleware_chain |
| propagação_importa | blast_radius, side_effects, ripple_effect |
| detalhe_fino_importa | subtle_bug, intermittent, needle_in_haystack |
| causa_exata | exact_cause, atomic_diff, known_root |
| caminho_bloqueado | blocked_path, adaptation_needed |
| sequência_temporal | temporal_sequence, pipeline, ordering |
| persistência_evidência | proven_path, multi_step, sustain |
| ajuste_operador | operator_fit, ux, ergonomics |
| ajuste_humano | human_fit, usability, operator_needs |
| ação_curta_e_provada | short_action, proven_short |
| velocidade_decisiva | decisive_speed, narrow_window |
| contraprova_necessária | adversarial_needed, falsification_needed |

## Exemplo de Uso

```python
state = {
    "visão_global_necessária": True,
    "causa_desconhecida": False,
    "informação_demais": True,
    "detalhe_fino_importa": False
}

# Seleção:
# 1. CONCENTRAÇÃO_TOTAL (sempre)
# 2. SOL (visão_global_necessária = True, prioridade 1)
# 3. NÉVOA (informação_demais = True, prioridade 4)
# Executa SOL → NÉVOA → CONCENTRAÇÃO_TOTAL → LUA
```