# Receipt — sessão Hermes + Kylin + Tailscale + intenção global — 2026-10-03

- Baseline main: `3b4da75f1399ddeab852d67cb75c7dafffe60267`
- Learning: #157 / L157
- Remembrance: `docs/CONSCIENCIA/LEMBRANCAS/2026-10-03-HERMES-INTENCAO-ESCOPO-GLOBAL-FULL-ACCESS.md`
- Scope: sessão inteira a partir do objetivo “Hermes da VMware responder” até a generalização “intenção = escopo global”.

## PASS medido

- Hermes original instalado: `vgit.ca952a5`.
- Kylin AI runtime/SDK presentes.
- DeepSeek R1/V3 cloud packages presentes.
- D-Bus session route recuperada.
- Kylin cloud enabled e `currentModel=kylin-deepseek-r1` no readback da sessão.
- SDK native probe para `kylin-deepseek-r1`: `SESSION=True`, `INIT=0`, `DONE=True`, `TEXT=LOCAL_QWEN_OK`.
- Nous endpoint alcançável; paid route respondeu explicitamente falta de créditos.

## UNKNOWN / não promover

- Hermes ainda não respondeu via Kylin nativo.
- Bridge `~/.hermes/kylin_openai_bridge.py` não passou health; erro local `NameError` permanece no último readback medido.
- Configuração Tailscale e skill da Casa foram observadas em screenshots do CHEFE, não revalidadas por API nesta gravação.
- Modelo on-device Qwen com pesos locais não foi necessário para a prova Kylin cloud e não deve ser chamado de instalado por inferência.

## Lei promovida

```text
INTENT_IS_GLOBAL_SCOPE=true
ROUTE_IS_NOT_SCOPE=true
TOOL_GIVEN_BECOMES_CAPABILITY=true
AUTHORIZED_CAPABILITIES_IN_SCOPE_BY_DEFAULT=true
ROUTE_FAIL_DOES_NOT_END_MISSION=true
HERMES_ORIGINAL_PRIORITY=true
UNKNOWN_IS_NOT_PASS=true
ACTION_IS_NOT_PROOF=true
REALITY_IS_JUDGE=true
```

## Next cursor

Corrigir somente o bridge existente → health/models/chat → bind provider custom do Hermes → `HERMES_VM_OK`.
