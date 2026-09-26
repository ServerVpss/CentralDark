# Catálogo Combo-Potencia — Padrão de Menu com Botão

**Data:** 06/08/2026
**Gatilho:** Pivete pergunta "mostra o catálogo do combo" ou "combo menu" ou "/combo-potencia"

## O que o Pivete quer

Quando pedir o catálogo do combo-potencia, exibir menu navegável com botões no Telegram:
- **6 braços principais:** ECC, superpowers, graphify, SkillSpector, cc-switch, hermes-agent
- **Paginação:** ECC tem 281 skills → precisa de páginas (não listar todas de uma vez)
- **Botão nativo:** preferir `InlineKeyboardMarkup` (não `clarify` que trava tool call)

## Estado atual

O adapter do Hermes (`adapter.py`) tem `send_choice_picker` com suporte a paginação. Mas o agente (via Telegram) não consegue chamar diretamente — depende de o gateway traduzir.

**Solução atual:** usar `clarify` com até 4 opções quando o Pivete pedir menu. Limitação: sem paginação nativa.

**Solução ideal (a construir):** configurar gatilho no adapter para que quando o Pivete digitar "combo menu" ou "/combo-potencia", o `send_choice_picker` paginado seja disparado automaticamente com os 6 braços → subpáginas para ECC/superpowers.

## Como responder hoje

Quando o Pivete pedir o catálogo:
1. Mostrar os 6 braços em texto + card resumido
2. Oferecer `clarify` com os 4 mais usados
3. Explicar que paginação nativa depende de config no adapter (SOL pode ajudar)