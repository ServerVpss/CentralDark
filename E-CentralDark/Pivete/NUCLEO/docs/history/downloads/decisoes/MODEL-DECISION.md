# Decisão de modelo local

A seleção deve ser feita depois da medição de hardware e runtime.

## Roteamento proposto

- `Qwen3.6-35B-A3B`: triagem de alta capacidade quando memória total e runtime suportarem.
- `Qwen3.5-9B`: opção equilibrada para triagem contínua e correlação.
- `Qwen3.5-4B`: classificador leve para hardware menor.

## Regra

O modelo local não é o Guardião principal. Ele é a camada nervosa de triagem.

```text
Sentinela determinística
→ snapshot/finding
→ Qwen local classifica e correlaciona
→ conhecido volta ao código
→ desconhecido sobe para agente de fronteira
```

Grok/Luna permanecem `SCOUT_FAST`; Sonnet/Opus podem atuar em investigação e revisão, mas o Judge deve ser separado do escritor.
