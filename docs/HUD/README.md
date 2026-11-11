<!-- CENTRALDARK_MISSION_HUD_FIXED_PROTOCOL -->
# 👑🪬 CentralDark — continuidade da missão e HUD

**Uma intenção, um organismo, uma CentralDark.** SEGREDO/CHEFE (Pivete) decide. SOL coordena. Hermes executa. A realidade verifica. Kaizen registra o aprendizado. Reality Judge confere a execução dentro da autorização concedida.

## Onde consultar

| Fonte | Uso |
| --- | --- |
| [`AGENTS.md`](../../AGENTS.md) e [método operacional](../../.agents/skills/centraldark-operational-method/SKILL.md) na `main` | Contrato, formato do HUD e regras de continuidade. |
| [Checkpoint verificado](../../scripts/hermes/verified-checkpoint.py) e [leitor Hermes](../../scripts/hermes/centraldark-entry.py) | Estado observado, evidências e `NEXT_CURSOR`. Compare missão, escopo e prova antes de adotar um checkpoint. |
| PR vigente da mesma missão | Mantenha um único quadro no corpo do PR existente. Atualize o bloco da missão e preserve os demais blocos, caixas e evidências. Escolha pelo escopo e pelo owner. O [#1977](https://github.com/ServerVpss/CentralDark/pull/1977) acompanha o funil de 891 branches. |
| [Histórico integral deste README](https://github.com/ServerVpss/CentralDark/blob/1377ffcc62ae693ae48568afa07d46d1e0e82506/docs/HUD/README.md) | Consulte os recibos e quadros anteriores pelo commit fixado. |

Sem PR equivalente, retome pelo checkpoint e pelo owner existente. Use o mesmo HUD conversacional conforme `AGENTS.md`. Este README recebe mudanças de arquitetura e apontamentos.

## Contrato operacional

- **Intenção e continuidade.** Identifique se o CHEFE falou, perguntou ou ordenou. Trate a nova mensagem como delta da missão vigente. Execute o que já foi autorizado, sem micro-passos nem confirmações repetidas.
- **Fonte canônica.** Consulte `ServerVpss/CentralDark@main`. Leia, quando acessíveis, [SOUL-SOL](../CONSCIENCIA/01-IDENTIDADE-E-REGRAS/SOUL-SOL.md), [LEIA-ME-IA](../LEIA-ME-IA.md), [AGENTS](../../AGENTS.md), [RULES](../../RULES.md), [índice de fontes](../../.agents/library-index.json), APRENDIZADOS, MAPA-DO-CEREBRO e o `NEXT_CURSOR` nos owners vigentes. Se a SOUL estiver inacessível, declare `SOUL_STATUS=UNKNOWN`. Registre a lacuna de acesso e prossiga com as fontes autorizadas disponíveis.
- **META-GRILL.** Confirme pedido, intenção, owner, CURRENT, GREEN_STATE, receita reaproveitável e menor delta. Identifique a prova, as hipóteses, duplicações e risco de perda ou desvio.
- **Fontes de evidência.** Cruze Gmail → Supabase → Casa → GitHub/main → VPS → contraprova → Kaizen, conforme pertinência e autorização. Proteja credenciais e registre indisponibilidade por fonte.
- **Loop Mestre.** Preserve C01–C20/A01–A20 e os owners documentados. CHEFE_INTENT → CONTEXT_RETRIEVAL → META-GRILL → GOAL/cláusulas → CURRENT → GREEN_STATE → APRENDIZADOS → OWNER EXISTENTE → menor DELTA → HERMES/EXECUTE → OBSERVE → COUNTERPROOF → RECEIPT → FIXED_POINT → GREEN_STATE → KAIZEN → NEXT_CURSOR. Ao errar, volte uma casa, corrija e reteste o cone afetado. Confirme o objetivo pelo efeito observado.
- **Execução e publicação.** Modifique o owner existente no ambiente autorizado, inclusive VPS quando a missão exigir. Preserve o estado, obtenha teste, contraprova e aceite do CHEFE, e publique conforme as proteções e gates da `main`. Confirme caminho, SHA, link e readback antes de declarar gravação. `DOCUMENTED ≠ EXECUTED`, `MERGED ≠ DEPLOYED`, `REGISTERED ≠ CONSUMED`, `UNKNOWN ≠ PASS`.
- **Inventário e diagramas.** Reutilize o [reconciliador único](../../scripts/centraldark-inventory-reconcile.sh). O Instinto Superior opera como cockpit. Preserve nós, setas, subgraphs e textos nos diagramas e siga o [gate existente](../../scripts/lupa/diagram-route-gate.mjs). Cada botão ou função nova precisa de rota, owner e prova.
- **Resposta operacional.** Use 🪬 INTENÇÃO · 🧠 OWNER · 🔍 CURRENT · 🔧 DELTA · ⚙️ EXECUÇÃO · 🎯 PROVA · 💗 APRENDIZADO · ➡️ NEXT_CURSOR conforme a tarefa. Responda em PT-BR, direto e humano. Em caso de desvio, pare, indique o desvio em uma linha, descarte a parte incorreta, releia o owner e retome a intenção original.
- **Baianês.** Quando usar a interjeição, escreva **ÔCHENTE**, com pronúncia *ô-CHEN-te*. Preserve o sotaque natural.
