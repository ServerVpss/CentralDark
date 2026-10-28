# 2026-10-04 — Main → VPS Delta Replay Sync

## Intenção do CHEFE

Quando a SOL/Writer promover um delta para `main`, o mesmo delta deve ser materializado imediatamente na árvore canônica da VPS, sem esperar um `git pull` do runtime e sem trocar/resetar a branch viva só para transportar bytes.

Forma curta ensinada pelo CHEFE:

```text
BOTOU_NA_MAIN
→ BOTA_NA_VPS_TAMBEM
→ MESMO_DELTA
→ SEM_PERDER_TEMPO
```

## O que isto é

É um **sync por replay de delta conhecido**, não um segundo Git e não um deploy cego. `main` continua sendo a fonte estrutural da verdade. A VPS recebe exatamente os blobs tocados pelo commit já promovido e comprova paridade por hash/readback.

```text
MAIN_WRITE
→ CAPTURE_COMMIT_DELTA
→ CLASSIFY_TOUCHED_PATHS_ON_VPS
→ REPLAY_SAME_BLOBS
→ HASH_COMPARE
→ RUNTIME_RELOAD_IF_APPLICABLE
→ READBACK
→ CONTINUE
```

## Regra de segurança sem perder velocidade

Para cada path tocado no commit:

```text
VPS_PATH == NEW_MAIN_BLOB    → ALREADY_SYNCED
VPS_PATH == PARENT_MAIN_BLOB → SAFE_REPLAY
VPS_PATH_ABSENT + NEW_FILE   → SAFE_CREATE
OUTRO_RESULTADO              → LOCAL_DIVERGENCE; RECONCILE_ONLY_THIS_PATH
```

Deleção/rename também usa o mesmo princípio: só remover/mover automaticamente quando o estado vivo ainda corresponde ao parent conhecido ou ao próprio delta; divergência local não é apagada cegamente.

## Invariantes

```text
MAIN_IS_CANONICAL_SOURCE=true
MAIN_WRITE_REPLAYS_TO_VPS=true
SAME_COMMIT_DELTA_ONLY=true
NO_RUNTIME_PULL_REQUIRED_FOR_KNOWN_DELTA=true
NO_BRANCH_SWITCH_REQUIRED_FOR_DELTA_TRANSPORT=true
NO_HARD_RESET_FOR_RUNTIME_SYNC=true
PRESERVE_LOCAL_GOLD_ON_DIVERGENCE=true
HASH_READBACK_REQUIRED=true
RUNTIME_HEAD_PARITY_NOT_REQUIRED_FOR_FILE_DELTA_SYNC=true
RUNTIME_EFFECT_REQUIRES_RELOAD_OR_RESTART_ONLY_IF_APPLICABLE=true
COPY_IS_TRANSPORT_NOT_PROOF=true
REALITY_IS_JUDGE=true
```

## O que isso resolve

O runtime não precisa descobrir depois que a `main` mudou nem depender de um pull manual para receber um delta que o próprio Writer acabou de publicar. O transporte acontece no mesmo ato operacional.

Isso não afirma que `git HEAD` da branch viva na VPS é igual ao HEAD da `main`; prova apenas que os paths do delta foram materializados byte-a-byte. Se o claim exigir SAME_HEAD Git, medir/reconciliar Git separadamente.

## Proveniência

Fonte: instrução direta do SEGREDO/CHEFE nesta sessão, após replay do commit `af3441e...` da `main` para `/root/CentralDark` com hashes PASS.
Owner operacional: `.agents/skills/centraldark-operational-method/SKILL.md`.
Aprendizado: `docs/CONSCIENCIA/APRENDIZADOS.md#163`.
