# 2026-10-02 — Lei da Peneira Completa

## Sequência canônica

APRENDIZADO → LEMBRANÇA → RECEITA EXECUTÁVEL → HOOK REAL quando aplicável → TRIGGER → BOOT → VERIFIER → CONSUMER REAL → CHECK-LIST DIÁRIO → RECEIPT → PR-MÃE #1562 → PR RELACIONADA quando o escopo intersecta → BINDING FÍSICO quando o claim depende dele → READBACK.

Cada camada deve terminar como PASS, UNKNOWN, BLOCKED ou N/A. N/A precisa de justificativa; UNKNOWN nunca vira PASS.

## Descoberta que obrigou a lei

O aprendizado #146 já tinha lembrança, recipe registry, deterministic lock, Trigger Fabric, System Sentinel, verifier e consumer. Mesmo assim o verifier mostrou `HYBRID_MULTIROUTE_CHECKLIST_CONTRACT=false` com `missing=[]`.

A causa não era conteúdo ausente no Git. `origin/main` continha `docs/BRAIN/00-MAPA-SISTEMA/CHECK-LIST-DIARIO.md`, mas `/root/CentralDark` usava sparse-checkout e não materializava `docs/BRAIN/00-MAPA-SISTEMA`.

`CHECK_PRESENT_IN_GIT != CHECK_PRESENT_IN_RUNTIME`.

Delta mínimo aplicado no consumer existente: materializar `docs/BRAIN/00-MAPA-SISTEMA` no sparse-checkout. Depois disso, os cinco checks #146 passaram: HOOK_CONTRACT, SENTINEL_HOOK, MACHINE_RECIPE, CHECKLIST_CONTRACT e RECIPE_COMPLETENESS.

O verifier global permaneceu com 30 falhas fora do cone. Portanto `UNRELATED_GLOBAL_RED_DOES_NOT_INVALIDATE_PROVEN_CONE=true` e `CONE_PASS_DOES_NOT_IMPLY_GLOBAL_PASS=true`.

## Binding físico E:\VMs

Quando o claim depende de Casa/VM/shared storage, o binding físico também deve cair na peneira.

Snapshot desta sessão:
- Windows SEGREDO route: OFFLINE.
- CENTRALDARK-OS/root: ONLINE.
- vmware-hgfsclient: sem share listado.
- /etc/fstab: sem HGFS/SHARED observado.
- /proc/mounts: sem HGFS observado.
- /mnt/hgfs/CENTRALDARK-SHARED: ausente.

Classificação: `E:\VMs\CENTRALDARK-OS\SHARED <-> guest HGFS = NOT_PROVEN`; `/root/CentralDark consumer = PROVEN_FOR_#146_CONE`. São claims diferentes.

## Hook != Trigger

Hermes runtime guard já possui hooks reais: on_session_start, pre_llm_call, pre_tool_call, post_tool_call, pre_verify e on_session_end. O #147 reutiliza `pre_verify` para checar materialização mínima da peneira. Failover de rota continua no Trigger Fabric/System Sentinel; nenhum callback de failure inexistente é inventado.

## Leis

`LEARNING_REGISTERED != REMEMBRANCE_REGISTERED`
`REMEMBRANCE_REGISTERED != RECIPE_REGISTERED`
`RECIPE_REGISTERED != HOOK_BOUND`
`HOOK_BOUND != TRIGGER_BOUND`
`TRIGGER_BOUND != BOOT_LOADED`
`BOOT_LOADED != VERIFIER_ENFORCED`
`VERIFIER_ENFORCED != CONSUMER_PROVEN`
`CONSUMER_PROVEN != CHECKLIST_REGISTERED`
`CHECKLIST_REGISTERED != PR_MOTHER_RECEIPT`
`PR_MOTHER_RECEIPT != RELATED_PR_RECONCILED`
`REPO_PROOF != PHYSICAL_BINDING_PROOF_WHEN_PHYSICAL_BINDING_IS_MATERIAL`

`FIXED_POINT_REQUIRES_ALL_APPLICABLE_LAYERS=true`
`NON_APPLICABLE_LAYER_MUST_BE_EXPLICIT=true`
`CHECK_PRESENT_IN_GIT_IS_NOT_CHECK_PRESENT_IN_RUNTIME=true`
`SPARSE_CHECKOUT_IS_BINDING_NOT_SOURCE_OF_TRUTH=true`
`PHYSICAL_BINDING_REQUIRED_WHEN_CLAIM_DEPENDS_ON_HOST_VM_SHARE=true`

## NEXT_CURSOR

Antes de FIXED_POINT, enumerar camadas aplicáveis, provar/materializar cada uma, preservar UNKNOWN/N/A honestos e fazer readback final.

## Delta descoberto pela própria peneira

`docs/receipts` foi adicionado ao sparse-checkout do consumer porque o receipt participa do fechamento verificável. A primeira probe mostrou o path habilitado, mas o arquivo ainda ausente no checkout root antigo, provando `SPARSE_PATH_ENABLED != FILE_PRESENT_AT_CURRENT_HEAD`. A prova válida deve usar o mesmo HEAD do claim, por worktree detachado de `origin/main`.
