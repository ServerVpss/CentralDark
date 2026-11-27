# Receipt — Lei da Peneira Completa #147

Data: 2026-10-02

## Intenção

Submeter a própria lei de registro à peneira completa, evitando que aprendizado/lembrança/recipe existam sem hook, trigger, boot, verifier, consumer, checklist, ledger e binding físico quando material.

## Cadeia

`APRENDIZADO → LEMBRANÇA → RECEITA → HOOK → TRIGGER → BOOT → VERIFIER → CONSUMER_REAL → CHECKLIST_DIARIO → PR_MAE_1562 → RELATED_PR_IF_SCOPE_INTERSECTS → PHYSICAL_BINDING_IF_MATERIAL → READBACK`

## Ferida encontrada

`CHECK-LIST-DIARIO.md` existia em `origin/main`, mas não no checkout runtime por causa do sparse-checkout do `CENTRALDARK-OS/root`.

`CHECK_PRESENT_IN_GIT != CHECK_PRESENT_IN_RUNTIME`.

Remediação mínima observada: `docs/BRAIN/00-MAPA-SISTEMA` adicionado ao sparse-checkout existente. Após isso os cinco checks HYBRID_MULTIROUTE passaram.

## Hook real

Owner: `apps/modulos/HERMES-CORE/plugins/centraldark-runtime-guard/__init__.py#pre_verify`.
O hook verifica materialização das fontes mínimas e emite `CENTRALDARK_COMPLETE_SIEVE_MATERIALIZATION=FAIL` quando faltarem.

## Trigger e boot

- `PRE_HUMAN_RETURN` carrega `COMPLETE_SIEVE_APPLICABILITY_CHECK` e `COMPLETE_SIEVE_READBACK`.
- `CENTRALDARK_AI_BOOT.yaml#complete_sieve_registration` carrega a sequência e as leis.

## Receita

Claim: `HYBRID_MULTIROUTE_CAPABILITY_REPLAY_PATH`.
Dependency fingerprint: `a21be5a59753d3b68e59c6429b20772399099a05b9a043dc0ab39827af0e6069`.
Lock key: `f78920ff5e179b8f66f4276a41bd96847f3c5b2b37e1aa9933097ccb2250fb0b`.

## Binding físico

T0: `E:\VMs\CENTRALDARK-OS\SHARED ↔ guest HGFS = NOT_PROVEN` porque Windows SEGREDO estava offline e o guest não apresentava share/mount HGFS.

T1 CURRENT:
- host `E:\VMs\CENTRALDARK-OS\SHARED` = PASS;
- VMX = PASS para `hostPath=E:\VMs\CENTRALDARK-OS\SHARED`, `guestName=CENTRALDARK-SHARED`, read/write;
- guest `CENTRAKDARK-OS` = PASS em `/home/CENTRAKDARK-OS/vmware-shares/CENTRALDARK-SHARED` via `fuse.vmhgfs-fuse`;
- arquivo discriminante `!CENTRALDARK.txt` = mesmo SHA-256 host↔guest: `d4e99f0fef87b499a97f567b767fe7b71dc5dce8f1303a6779135b35571fa130`.

Classificação: `HOST_VM_SHARED_BINDING=PASS_CURRENT_MEASUREMENT`. O caminho `/mnt/hgfs/CENTRALDARK-SHARED` permanece expectativa do bootstrap legado; o mount CURRENT provado está no diretório `$HOME/vmware-shares/CENTRALDARK-SHARED`. Persistência pós-reboot = `UNKNOWN` até prova própria.

## Estado global

O cone #146/#147 pode ser PASS enquanto o verifier global permanece vermelho por falhas fora do cone. `CONE_PASS_DOES_NOT_IMPLY_GLOBAL_PASS=true`.

## Leis seladas

- `FIXED_POINT_REQUIRES_ALL_APPLICABLE_LAYERS=true`
- `NON_APPLICABLE_LAYER_MUST_BE_EXPLICIT=true`
- `CHECK_PRESENT_IN_GIT_IS_NOT_CHECK_PRESENT_IN_RUNTIME=true`
- `SPARSE_CHECKOUT_IS_BINDING_NOT_SOURCE_OF_TRUTH=true`
- `PHYSICAL_BINDING_REQUIRED_WHEN_CLAIM_DEPENDS_ON_HOST_VM_SHARE=true`
- `UNRELATED_GLOBAL_RED_DOES_NOT_INVALIDATE_PROVEN_CONE=true`
- `CONE_PASS_DOES_NOT_IMPLY_GLOBAL_PASS=true`

NEXT_CURSOR: registrar este T1 na PR-MÃE #1562 e nas PRs #1742/#1743 quando o escopo intersectar; manter verifier global separado e provar persistência pós-reboot apenas se esse claim entrar no escopo.
