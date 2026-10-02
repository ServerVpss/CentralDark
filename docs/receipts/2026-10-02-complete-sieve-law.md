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
Dependency fingerprint: `82ea2e99e9cae736db93b4d8804a034ebafd7471ccfbcc0e33053db60db4fe09`.
Lock key: `d1444ef3efcfb766ee2d121c1703d23bfc7e576f83d770a2d186ba491c9fe68a`.

## Binding físico

`E:\VMs\CENTRALDARK-OS\SHARED ↔ /mnt/hgfs/CENTRALDARK-SHARED = NOT_PROVEN` nesta medição.
Windows SEGREDO estava offline e o guest não apresentou share/mount HGFS. Isso não invalida o consumer `/root/CentralDark`, pois são claims diferentes.

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

NEXT_CURSOR: executar prova same-head no consumer real, registrar resultado na PR-MÃE #1562 e nas PRs #1742/#1743 sem merge.
