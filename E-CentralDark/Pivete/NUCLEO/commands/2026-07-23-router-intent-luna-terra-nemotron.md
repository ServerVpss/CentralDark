# COMANDO - 2026-07-23-router-intent-luna-terra-nemotron.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\centraldark\docs\RELATORIOS\2026-07-23-router-intent-luna-terra-nemotron.md
**SHA:** e6fd5d331cf01db8
**Timestamp:** 2026-08-28T02:55:17.841904
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- Fallback padrão: `terra → nemotron → luna`.

### Ouro Bruto (primeiros 5000 chars)
```
# Router Intent-Based — Luna / Terra / Nemotron

**Data:** 23/07/2026
**Escopo:** `scripts/router/` (novo) + testes em `.agents/skills/lupa-bayesiana/testes/`
**PR:** #316 (mesma branch `feat/lupa-conformance-tests-2026-07-22-2130`)

---

## O que entra

- `scripts/router/rotas.json` — tabela viva com os 3 modelos oficiais, regras por prioridade e ordem de fallback.
- `scripts/router/intent_router.py` — função `rotear(prompt)` com hot-reload da config e cache LRU.
- `.agents/skills/lupa-bayesiana/testes/test_intent_router.py` — 11 testes que travam desvio das 3 rotas oficiais.

---

## Matriz de decisão

| Situação                                             | Categoria          | Modelo escolhido            |
|------------------------------------------------------|--------------------|------------------------------|
| Chat curto (< 200 chars, sem keywords técnicas)      | `chat_curto`       | `openai/gpt-5.6-luna`        |
| Código, SQL, revisão média                           | `codigo`/`revisao` | `openai/gpt-5.6-terra`       |
| Arquitetura, estratégia, refator, conselho, debate   | `raciocinio_pesado`| `nvidia/nemotron-3-ultra-550b` |
| Prompt > 4.000 caracteres                            | `contexto_grande`  | `nvidia/nemotron-3-ultra-550b` |
| Default                                              | `default`          | `openai/gpt-5.6-terra`       |

Fallback padrão: `terra → nemotron → luna`.

---

## Por que essas 3 rotas

Preços reais consultados no OpenRouter em 23/07/2026:

| Modelo                  | in/1M   | out/1M  | Papel                                    |
|--------------------------|---------|---------|-------------------------------------------|
| GPT-5.6-luna             | $0,15   | $0,60   | tráfego alto, respostas rápidas          |
| GPT-5.6-terra            | $1,25   | $5,00   | equilíbrio custo/qualidade, código       |
| Nemotron 3 Ultra 550B    | $0,50   | $2,20   | topo de raciocínio, contexto gigante     |

Nemotron custa **~14x menos** que GPT-5.6-sol e cobre o topo com folga; por isso é a rota pesada.

---

## Como usar

```python
from scripts.router.intent_router import rotear
escolha = rotear(prompt_do_usuario)
modelo_id = escolha["modelo_id"]  # já pronto pra mandar ao gateway
fallbacks = escolha["fallback"]
```

CLI rápida:

```bash
python scripts/router/intent_router.py "refatore a arquitetura do hub"
# -> {"categoria": "raciocinio_pesado", "modelo_id": "nvidia/nemotron-3-ultra-550b", ...}
```

---

## Próximos passos (fora deste PR)

1. Plugar o `intent_router` no `apps/modulos/proxy/` como camada acima do `neural_router.py` atual.
2. Alimentar métricas reais (latência/erro) e ligar auto-degradação para `terra` quando Nemotron ultrapassar o SLA.
3. Adicionar rota `luna+terra em paralelo` para "duelo curto" quando o Pivete pedir revisão cruzada.

```