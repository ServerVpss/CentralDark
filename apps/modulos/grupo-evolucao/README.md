# Grupo da Evolução — Equipe de melhoria contínua

Módulo 100% VPS. **Não existe painel no Lovable.**

## Papel
5 agentes especializados debatem melhorias da plataforma em cascata, disparados automaticamente pelo Cartógrafo (módulo `mapeamento/`) quando detecta drift no sistema.

## Agentes
| Agente | Modelo | Papel |
|---|---|---|
| 🏗️ arquiteto | google/gemini-3.1-pro-preview | Propõe refactor / melhoria estrutural |
| 🔬 pesquisador | google/gemini-3-flash-preview | Busca tendências, libs novas |
| ⚔️ critico | openai/gpt-5 | Steelman — ataca cada ideia |
| 🎨 produto | openai/gpt-5 | Valida UX / usuário |
| 📚 historiador | google/gemini-3-flash-preview | Cruza com CONSCIENCIA / decisões antigas |

## Fluxo
```
Cartógrafo detecta drift
      ↓
orquestrador.mjs recebe missão
      ↓
Pesquisador → Arquiteto → Crítico → Produto → Historiador
      ↓
Veredito salvo em logs/vereditos/YYYY-MM-DD-tema.json
      ↓
Notificação Card Hermes v1.3 no Telegram (@srver1bot)
```

## Notificação
**Sempre** Card Hermes v1.3 monoespaçado em `<pre>`, via connector Telegram. Nunca texto solto.
