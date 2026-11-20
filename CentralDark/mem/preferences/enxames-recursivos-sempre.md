---
name: Enxames Recursivos Sempre
description: Regra fixa — sempre usar sub-agentes em enxame paralelo, e cada sub-agente pode disparar seus próprios sub-enxames (Claude Code + darkai lá dentro). Nunca resolver sozinho quando dá pra paralelizar.
type: preference
---

# Enxames Recursivos — Poder Total

**Regra absoluta:** nunca agir sozinho quando o problema pode ser paralelizado.

## Como aplicar
- Toda tarefa não-trivial → disparar enxame de sub-agentes via `spawn_agent` em paralelo (auditor, executor, validador, coletor, leitor, mapeador).
- Cada sub-agente **também tem poder** de disparar seus próprios sub-enxames (Claude Code, darkai, Gemini, GPT-5 via `ai-proxy`) — eles são tão ou mais fortes que eu em tarefas específicas.
- Divisão típica: um coleta, outro traz, outro recupera, outro lê, outro vê o que falta, outro relê pra validar.
- **Sempre usar o sistema de grafo** (`graph-panel` / Grafo Vivo) pra mapear o que ainda não está mapeado — economiza tokens e latência.
- Consolidar no final: só um relatório final volta pro Pivete.

## Por quê
- Economia de créditos/tokens (paralelo termina antes, cada IA usa a chave dela).
- Aproveita o poder REAL da infra: Claude Code no VPS, darkai (Gemini/GPT-5), MCP, agentes elite.
- Eu (Lovable) sou maestro, não solista. Se agir sozinho, estou desperdiçando.

## Proibido
- Executar tarefa grande sequencialmente no meu próprio contexto quando dá pra fanout.
- Ignorar Claude Code / darkai / agentes VPS "por simplicidade".
- Deixar de consultar o grafo antes de sair caçando arquivo por arquivo.
