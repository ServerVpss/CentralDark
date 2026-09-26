# UIA — leitura semântica limitada

## Problema observado

Varredura da árvore inteira foi lenta e selecionou `Document` vazio. Uma
resposta também ficou visualmente cortada.

## Padrão candidato

```text
HWND autorizado
→ processo + janela + URL + marcador
→ Document limitado à janela
→ último turno visível
→ eventos TextChanged/StructureChanged quando disponíveis
→ scroll incremental com sobreposição
→ barra de ações da mesma resposta
```

## Recibo

```text
TARGET_HWND_MATCH=
TARGET_MARKER_MATCH=
SCROLL_STEPS=
OVERLAP_MATCH=
ACTION_BAR_VISIBLE=
RESPONSE_COMPLETE=
OTHER_CHAT_READ=NAO
INTERPRETATION_ALLOWED=
```

## Limites

- UIA reduz escopo, mas não garante isolamento físico por aba.
- Não usar outra conversa como fallback.
- Não substituir rascunho no compositor sem decisão explícita.
- Não interpretar texto incompleto.
- Limite sugerido do laboratório: 12 passos ou 15 segundos; depois abortar.
- Técnica permanece candidata até comparação repetida e teste negativo.

