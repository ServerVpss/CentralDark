# Patch Map

| Arquivo | Ação | Motivo |
|---|---|---|
| `docs/CONSCIENCIA/02-PROTOCOLO-HANDOFF-IA.md` | substituir | fortalecer owner real |
| `scripts/trigger-fabric/verify_repo_contract.py` | substituir | validar owner real |
| `scripts/trigger-fabric/test_pombo_handoff_counterproof.py` | adicionar | contraprova fail-closed |
| `.github/workflows/trigger-fabric-package.yml` | substituir | disparar/rodar contraprova |
| `scripts/trigger-fabric/build_package.py` | substituir | pacote canônico carregar prova material |
| `scripts/trigger-fabric/verify_package.py` | substituir | fresh extraction validar owner/counterproof |

`REUSE_BEFORE_CREATE=true`: o único arquivo novo operacional é um teste de contraprova; não é owner/gate/workflow.
