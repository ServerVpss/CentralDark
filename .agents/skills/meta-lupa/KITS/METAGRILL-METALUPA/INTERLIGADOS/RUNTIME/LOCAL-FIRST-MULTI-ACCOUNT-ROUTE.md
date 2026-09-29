# 🔗 INTERLIGADOS · LOCAL FIRST + MULTI-ACCOUNT + FALLBACK

**OWNER:** `.agents/skills/meta-lupa/SKILL.md`  
**GATILHO:** `👑🪬 !CENTRALDARK → 🔗 !># INTERLIGADOS`  
**MODO:** rota semântica do owner existente. Não cria engine, parser, cérebro ou gatilho paralelo.

## 🎯 Objetivo

Usar sempre a rota executável mais curta para o alvo atual e preservar a rota mais longa já provada como fallback.

```text
PRIMARY
ChatGPT
→ executor local exposto no CENTRALDARK-OS
→ ação local
→ readback

FALLBACK
ChatGPT
→ Desktop Commander VPS
→ Tailscale SSH
→ CENTRALDARK-OS
→ ação local
→ readback
```

```text
PRIMARY_FAILS != SYSTEM_FAILS
FALLBACK_SURVIVES=true
DO_NOT_KILL_PROVEN_FALLBACK=true
LOCAL_FIRST_WHEN_TARGET_IS_LOCAL=true
REALITY_IS_JUDGE=true
UNKNOWN_IS_NOT_PASS=true
```

## 🧩 Capacidade multi-account reaproveitada

A fonte existente já contém o modelo canônico `MULTI_ACCOUNT_ISOLATED_HOME`.

Arquivos owner:

- `scripts/vps/deploy-desktop-commander-multi-account.sh`
- `infra/systemd/centraldark-desktop-commander.service`
- `infra/systemd/centraldark-desktop-commander-conta2.service`
- `infra/systemd/centraldark-desktop-commander-profile.sh`
- `.github/workflows/remote-desktop-multi-account-live-reconcile.yml`

Contrato:

```text
PROFILE_1=principal
PROFILE_2=conta2
PROFILE_HOMES_DISTINCT=true
PROFILE_SERVICES_DISTINCT=true
ONE_REMOTE_PROCESS_PER_PROFILE=true
SERVICE_ACTIVE != DEVICE_READY
TWO_ACTIVE_PROCESSES != TWO_AUTHENTICATED_ACCOUNTS
```

O modelo foi encontrado também na cópia compartilhada da Casa/VM. Isso prova a fonte e a capacidade desenhada; não prova ainda que os dois perfis estejam autenticados e expostos no CENTRALDARK-OS local nesta sessão.

## 🗂️ Shared é corredor, não segundo owner

```text
CENTRALDARK-SHARED
→ garimpo / ingest / ponte de arquivos
→ CentralDark repo compartilhado
→ owner canônico continua no repo

SHARED_IS_INGEST_NOT_SECOND_OWNER=true
FILE_VISIBLE != RUNTIME_LOADED
SOURCE_PRESENT != LOCAL_DIRECT_BINDING_PROVED
```

## ⚡ Prioridade de rota

```text
TARGET=CENTRALDARK-OS_LOCAL
1. LOCAL_DIRECT, se realmente exposto à sessão ChatGPT
2. VPS_TAILSCALE_SSH, fallback provado

TARGET=VPS
1. VPS_DIRECT / owner aplicável

TARGET=CASA_WINDOWS
1. CASA_DIRECT, quando online/autenticada
2. rota alternativa autorizada, se existir e for medida
```

Nunca atravessar VPS/Tailscale por hábito quando o executor local já estiver provado e disponível. Nunca apagar o fallback só porque a rota curta ficou verde.

## 🔏 Lei do rastro de promoção

Todo delta material que sobreviver à contraprova segue a mesma costura:

```text
ACHADO MATERIAL
→ OWNER EXISTENTE
→ COMMIT NO PR-FILHO EQUIVALENTE
→ READBACK DO HEAD DO PR-FILHO
→ RECEIPT NO PR-FILHO
→ RECEIPT/ÂNCORA NO PR-MÃE #1562
→ PROMOÇÃO PARA MAIN SOMENTE QUANDO O CONE APLICÁVEL ESTIVER VERDE
→ READBACK DA MAIN
```

```text
CHILD_FIRST=true
MOTHER_LEDGER_SAME_CYCLE=true
MAIN_IS_CANONICAL_DESTINATION=true
PR_MOTHER_MERGE_FORBIDDEN=true
PENDING_OR_QUEUED != PASS
UNRESOLVED_REVIEW != PASS
MERGEABLE != MERGED
MERGED != DEPLOYED
```

Se a promoção para main estiver bloqueada por check, conflito ou review material, o rastro é feito no mesmo turno e a main fica explicitamente `PENDING_PROMOTION`; não se inventa verde.

## 🔮 Evolução futura do host

Intenção do CHEFE: quando o CENTRALDARK-OS estiver maduro o suficiente para virar o sistema principal da máquina física, preservar esta mesma semântica.

```text
VM/CAPSULE TODAY
→ CENTRALDARK-OS LOCAL
→ VPS REMOTE

PRIMARY HOST FUTURE
→ CENTRALDARK-OS PRIMARY HOST
→ VPS REMOTE
```

Só muda a camada física que hospeda o owner. Não nasce arquitetura paralela.
