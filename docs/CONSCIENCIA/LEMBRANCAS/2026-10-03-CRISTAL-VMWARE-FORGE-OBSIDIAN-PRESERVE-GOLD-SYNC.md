# 2026-10-03 — Cristal VMware Forge + Obsidian + sync preservativo da main

## Intenção do CHEFE

Transformar a sessão inteira em cristal reutilizável, sem arquitetura paralela:

```text
PREFLIGHT VIVO
→ BANCADA EXISTENTE
→ OBSIDIAN NA PRÓPRIA CENTRALDARK
→ HUD/BRAIN/Lembranças interligados
→ MAIN CURRENT entra por reconciliação preservativa
→ ouro local preservado
→ prova/contraprova/fingerprint/receipt
→ runner VMware isolado
→ replay VPS usando receita provada
```

## Topologia operacional

```mermaid
flowchart LR
    CHEFE[👑 CHEFE / intenção] --> BOOT[CENTRALDARK preflight vivo]
    BOOT --> MAIN[GitHub main CURRENT]
    BOOT --> PM[PR-mãe #1562]
    BOOT --> PRS[PRs abertos]
    BOOT --> CL[CHECK-LIST DIÁRIO]
    BOOT --> CORE[SOUL + AGENTS + LEIA-ME + Aprendizados + Lembranças]

    MAIN --> FORGE[E:\\VMs\\CENTRALDARK-OS\\SHARED\\CentralDark]
    FORGE --> OBS[Obsidian vault = própria raiz]
    FORGE --> HUD[HUD.html]
    FORGE --> BRAIN[docs/BRAIN]
    FORGE --> HERMES[Hermes original]
    FORGE --> KYLIN[Kylin AI + Qwen local]
    FORGE --> RUNNER[actions-runner/_work isolado]

    OBS --> GRAPH[Grafo Vivo]
    GRAPH --> HUB[Knowledge Hub]
    HUB --> RECEIPT[receipt / candidate / graph]

    FORGE --> CAPSULE[cápsula + fingerprint]
    CAPSULE --> VPS[VPS twin 24/7]
```

## Sync preservativo da main

```mermaid
flowchart TD
    A[MEASURE FORGE] --> B[FETCH MAIN CURRENT sem mutar]
    B --> C[CLASSIFY DELTA]
    C --> G[LOCAL_GOLD]
    C --> M[ALREADY_IN_MAIN]
    C --> S[STALE]
    C --> X[CONFLICT]
    C --> U[UNKNOWN]

    G --> P[PRESERVE]
    M --> D[DEDUPE]
    S --> O[OWNER / PROOF]
    O -->|seguro| R[RECONCILE]
    O -->|não provado| U
    X --> STOP[STOP destructive write]
    U --> STOP
    P --> R
    D --> R
    R --> T[RETEST]
    T --> H[HASH / FINGERPRINT]
    H --> RC[RECEIPT]
```

## Fluxo Obsidian/HUD

```mermaid
flowchart TD
    ROOT[SHARED/CentralDark] --> HOME[Home.md]
    ROOT --> HUD[HUD.html]
    ROOT --> PEND[Pendências.md]
    ROOT --> BRAIN[docs/BRAIN]
    ROOT --> CONS[docs/CONSCIENCIA]
    ROOT --> DOT[.obsidian local]
    DOT --> PLUGIN[centraldark-grafo-vivo]
    PLUGIN --> API[/api/graph]
    PLUGIN --> HUB[/memoria/ingest]
    HUD --> L152[Lembrança #152]
    HUD --> BRAIN
    HOME --> L152
    PEND --> L152
```

## Bindings medidos nesta sessão

```text
FORGE_WINDOWS_PATH=E:\VMs\CENTRALDARK-OS\SHARED\CentralDark
GUEST_WRITE_ROUTE=/home/CENTRAKDARK-OS/vmware-shares/CENTRALDARK-SHARED/CentralDark
CASA_E_WIDE_ROUTE_WRITE=EIO
DEDICATED_CENTRALDARK_SHARED_WRITE=PASS
OBSIDIAN_VAULT_ROOT=CentralDark
DOT_OBSIDIAN_GIT_IGNORED=PASS
PLUGIN_OWNER=apps/modulos/obsidian-plugin-grafo-vivo
PLUGIN_BUILD_PRESENT=PASS
HUD_LINK_TO_LEARNING_152=PASS
HOME_LINK_TO_LEARNING_152=PASS
PENDENCIAS_LINK_TO_LEARNING_152=PASS
OLD_WINDOWS_DOT_OBSIDIAN_BYTES=UNKNOWN
```

## Receita reutilizável

Owner: `docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/PROVEN-CLAIMS.lock.json#VMWARE_FORGE_OBSIDIAN_PRESERVE_GOLD_SYNC`

Fingerprint:

```text
dependency_fingerprint=557819f7b6230625330f8870cd41d69c1a16f21e3e40d644f00cd7aea4b9ff24
lock_key=90b98d0a64eca63a1da217b7c9de5072bcf107e3f2800768d10e78b26545c45b
proof_plan_hash=885608acd3366d0972a0207e316f445f36ca8eccaa024365e0da2fa442afad9a
result_schema_hash=8cd2c4e36f31316c6f65af6922e78c97a17a6cf6e2a0e6b88b60325cbfc3ca37
effect_schema_hash=1e1f8d17d66cc3374fcffaa481e0fe0fa218c06aee2566d6a8bdc303c7ec2c2e
```

## Prova requerida

```text
1. repo/remote/branch/HEAD da forja corretos
2. status local capturado antes de mutação
3. main CURRENT fetcha sem reset/checkout cego
4. merge-base e inventário diferencial gerados
5. LOCAL_GOLD e UNKNOWN não são sobrescritos
6. .obsidian permanece ignorada pelo Git
7. plugin existente continua loadable
8. HUD/Home/Pendências preservam links para memória/BRAIN
9. runner usa _work separado da forja
10. receipt separa PASS / CONFLICT / UNKNOWN / NEXT_CURSOR
```

## Contraprova

```text
SAME_HEAD_ON_TWO_PATHS != SAME_PHYSICAL_BACKING
HUD_MATERIALIZED != HUD_CURRENT_STATE_PROVEN
PLUGIN_BUILD_PRESENT != PLUGIN_RUNTIME_LOADED
OBSIDIAN_FILES_PRESENT != OLD_WINDOWS_VAULT_FULLY_MIGRATED
FETCH_MAIN != SAFE_RECONCILIATION
DIRTY != BROKEN
UNKNOWN != SAFE_TO_OVERWRITE
```

## Segurança

Nenhuma senha, token, PAT, Bearer, chave privada ou valor secreto entra neste cristal. Apenas nomes de bindings, caminhos, fingerprints públicos de receita e estados de presença/prova.

## 2026-10-04 — Reset da forja: migração preservativa CASA → shared → VPS

Delta de intenção CURRENT do CHEFE, medido antes do wipe:

```text
NORMAL_DIRECTION=CASA_VMWARE_FORGE -> PROVA/GARIMPO -> MAIN -> REPLAY_VPS
TEMPORARY_RESET_WINDOW=VPS_MAY_BE_MORE_ADVANCED_THAN_VMWARE
TEMPORARY_VPS_LEAD_DOES_NOT_REVERSE_CANONICAL_DIRECTION=true

MIGRATION_SOURCE_WINDOWS=E:\CentralDark
MIGRATION_TARGET_SHARED=E:\VMs\CENTRALDARK-OS\SHARED\CentralDark
POST_RESET_CASA_FORGE=MIGRATION_TARGET_SHARED

PROMOTE_ONLY_PROVEN_USEFUL_DELTA=true
DELETE_OLD_SHARED_ONLY_AFTER_GARIMPO=true
COPY_SOURCE_INTO_SHARED_AFTER_OLD_SHARED_CLEARED=true
WIPE_COPY_EXECUTED=false
DOCUMENTED != EXECUTED
```

### Medição pré-wipe

```text
SHARED_GIT_ROOT=E:/VMs/CENTRALDARK-OS/SHARED/CentralDark
SHARED_BRANCH=feature/ai-cli-runtime-kernel
SHARED_HEAD=892454b98d941c3fada35d3df826f9962257f80f
MAIN_MEASURED_DURING_GARIMPO=5070d8e1b53b002e716701f7e41c6ae42847c7c4
SHARED_AHEAD_OF_MAIN=1
SHARED_BEHIND_MAIN=507

E_CENTRALDARK_IS_GIT_ROOT=false
E_CENTRALDARK_FILES_MEASURED=56018
E_CENTRALDARK_BYTES_MEASURED=1419550423

VMWARE_GUEST_RUNNING_AT_MEASUREMENT=false
```

### Peneira do conteúdo antigo da shared

- o commit local `892454b98...` adiciona `2026-09-29-AI-CLI-RUNTIME-KERNEL.md`, mas a `main` já possui o mesmo owner evoluído e deliberadamente mais conservador; a versão local antiga promove claims de seis CLIs como operacionais que o CURRENT não aceita sem prova;
- `package.json` / `package-lock.json` locais não são promoção segura: incluem versões mais antigas e removem o verificador CURRENT; o Desktop Commander já possui owner/rota canônica no remote bridge;
- skills locais de merge/voz já possuem owners canônicos equivalentes na `main`; não criar segunda cópia;
- arquivos idênticos à `main` são dedupe, não novo delta;
- auth/DPAPI/session, logs brutos, estados de runtime e artefatos temporários ficam fora do Git;
- Remote Tray/bridge já possui owner canônico em `scripts/remote-bridge/canonical/`; scripts soltos históricos não viram owner novo;
- reparos locais de Windows e exports/HUD históricos não sobem sem prova discriminante de utilidade CURRENT.

```text
GARIMPO_RESULT=NO_NEW_CANONICAL_DELTA_IDENTIFIED
LOCAL_HISTORY_ALREADY_ABSORBED_OR_STALE=true
SECRETS_RUNTIME_STATE_EXCLUDED=true
NEW_OWNER_CREATED=false
```

A limpeza física e a cópia permanecem pendentes até a rota Windows estar viva novamente e o readback pós-cópia provar o efeito. Não transformar esta seção em afirmação de wipe concluído.

## NEXT_CURSOR

Reabrir a rota Windows; confirmar Desktop Commander fora da shared; executar limpeza do conteúdo antigo de `E:\VMs\CENTRALDARK-OS\SHARED\CentralDark`; copiar o conteúdo de `E:\CentralDark` para a shared; comparar contagem/hash/amostragem; então subir a VM e provar a nova CASA/forja antes de retomar `CASA/VMware -> main -> VPS`.
