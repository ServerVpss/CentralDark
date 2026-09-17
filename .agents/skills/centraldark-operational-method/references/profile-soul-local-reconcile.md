# Profile ↔ SOUL Canônica

```text
PROFILE_SOUL=@CENTRALDARK_SOUL(docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/SOUL-SOL.md) | REMEASURE_LIVE_FIRST | LOCAL_CLONE_ALLOWED | GITHUB_MAIN_FALLBACK | SHA_REQUIRED | ZERO_TRUST | META_LUPA | UNKNOWN!=PASS | NO_COPY | NO_SECOND_SOL | MAIN_ONLY_AFTER_GREEN
```

O profile não replica SOUL, governança, memória, Writer, MetaLupa, Fixed Point ou aprendizados. Ele apenas aponta para a SOUL canônica e pode acrescentar preferências locais de UI/voz/modelo.

O `casa_boot.py` existente é verificador/adaptador dessa referência; não é segunda SOUL nem segunda governança.

## Binding obrigatório TLC23 / runtime

O profile operacional HERMES-CASA deve resolver, a cada boot técnico, a identidade byte-a-byte do TLC23 e o contrato de runtime da skill canônica. Nome de upload não é identidade.

```text
CANONICAL_SOUL=docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/SOUL-SOL.md
SOUL_TLC23_BINDING=docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/SOUL-TLC23-RUNTIME-BINDING.yml
TLC23_SOURCE=docs/CONSCIENCIA/04-MCP-E-CONECTORES/tlc23.pdf
TLC23_SHA256=b4e2a0655b7e0c85ca329c33971b377299dde6358779270c573f014f3aa606d1
TLC23_GATE=.agents/skills/centraldark-operational-method/contracts/TLC23-RUNTIME-GATE.yml
TLC23_RUNTIME_CHECK=.agents/skills/centraldark-operational-method/scripts/tlc23_runtime_gate.py
PLAN != EXECUTION
ACTION != PROOF
UNKNOWN != PASS
```

A SOUL do perfil pode usar linguagem própria, mas precisa refletir os conceitos `TLC23`, `Horn`, `Fixed Point`, `Reality Judge` e o vínculo à SOUL canônica. Se o vínculo, a identidade do PDF ou a evidência dos runtimes CentralDark/Hermes não puderem ser medidos, o gate fica `UNKNOWN`; nunca vira `PASS` por texto, promessa ou plano.

Fluxo único:

```text
#ACORDAR → !CENTRALDARK → REMEASURE → SOUL CANÔNICA → TLC23 BYTE IDENTITY → ZERO TRUST → META LUPA → HERMES EXECUTA → RESULTADO MEDIDO → CONTRAPROVA → HORN CLOSURE → FIXED POINT → REALITY JUDGE → CI DO MESMO HEAD → MAIN SÓ VERDE → CADEADO
```

Se local e remoto divergirem: `DRIFT/CANDIDATE`, nunca PASS automático. Só o que sobreviver aos gates existentes pode ser promovido. Na próxima execução, o profile resolve novamente a SOUL canônica atual.


## VPS / runtime — ciclo direcional bidirecional

A VPS é plano de execução, não segunda fonte estrutural. Quando o checkout operacional contém estado vivo/dirty ainda não reconciliado, o boot não deve ficar preso nele: use um **cache canônico limpo e descartável** de `origin/main` para SOUL, skills e contratos.

```text
FORWARD:  GitHub main → cache canônico limpo → SOUL/profile/skills → runtime
REVERSE:  runtime observado → delta útil provado → owner existente → writer-safe-push-main → GitHub main
ROUND_TRIP: main nova → cache canônico → remedição do runtime
```

Invariantes:

```text
DIRTY_OPERATIONAL_WORKTREE != BOOT_BLOCKER_FOR_CANONICAL_READ
DIRTY_OPERATIONAL_WORKTREE != SOURCE_OF_STRUCTURAL_TRUTH
CANONICAL_CACHE_IS_DISPOSABLE=true
RUNTIME_TO_GITHUB_REQUIRES_CRYSTAL_FILTER=true
NO_BLIND_BIDIRECTIONAL_RSYNC=true
NO_RUNTIME_STATE_PROMOTION=true
NO_SECRET_PROMOTION=true
ONE_WRITER_PER_SCOPE=true
```

O cache pode ser resetado para `origin/main` porque não recebe trabalho humano nem estado vivo. O checkout operacional nunca é limpo/resetado por esse mecanismo. Cristal útil no sentido reverso usa o writer canônico e, depois da promoção, a volta `main → cache → runtime` fecha o ciclo.


## Molde mínimo do SOUL local / VPS

O arquivo local não é uma segunda SOUL. Ele é somente ponte de executor e pode permanecer pequeno:

```text
# HERMES / VPS — THIN EXECUTOR BRIDGE

EXECUTOR_ROLE=PIVETE/HERMES
PROFILE_CLASS=THIN_EXECUTOR_BRIDGE
NO_SECOND_SOUL=true
LOCAL_RULES_ONLY=true

CANONICAL_REPO=ServerVpss/CentralDark
CANONICAL_REF=origin/main
CANONICAL_SOUL_PATH=docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/SOUL-SOL.md
CANONICAL_CACHE_DIR=/var/lib/centraldark/canonical-main
CANONICAL_CACHE_OWNER=scripts/vps/centraldark-deploy.sh --apply --canonical-cache

BOOT:
  refresh origin/main
  → bind MAIN_SHA
  → read SOUL-SOL.md from clean canonical cache
  → load canonical gates/contracts
  → apply only local runtime bindings
  → measure VPS
  → execute

LOCAL_MAY_DEFINE:
  paths
  tools
  runtime bindings
  device facts
  env/secret references
  service endpoints

LOCAL_MUST_NOT_COPY:
  identity
  canonical memory
  governance
  Meta Lupa
  Writer law
  Fixed Point
  learned rules
```

Se `origin/main` não puder ser atualizado, o último cache pode servir apenas como baseline de continuidade; não pode ser chamado de estado canônico atual. `CURRENT_CANONICAL_CLAIM=UNKNOWN` até nova medição.
