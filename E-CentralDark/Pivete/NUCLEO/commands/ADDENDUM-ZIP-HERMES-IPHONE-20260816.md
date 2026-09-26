# COMANDO - ADDENDUM-ZIP-HERMES-IPHONE-20260816.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\docs\RELATORIOS\SEGREDO-RELIQUIA\ADDENDUM-ZIP-HERMES-IPHONE-20260816.md
**SHA:** 7cfc060b2433f2a8
**Timestamp:** 2026-08-28T02:57:20.497011
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- SESSION_START=2026-08-08 01:50:27

### Ouro Bruto (primeiros 5000 chars)
```
# ⛏️ SEGREDO RELÍQUIA — Addendum ZIP / Hermes / iPhone

> Continuação do PR #998. Esta camada registra o pacote `investigação telefone depois casa vps github.zip` em modo estritamente read-only, com hashes, inventário, cronologia e cruzamento GitHub.

```text
MODE=FORENSIC_READ_ONLY_SNAPSHOT
ZERO_EXECUTION=true
ZERO_DEPLOY=true
ZERO_VPS_MUTATION=true
ZERO_NETWORK_MUTATION=true
ZERO_SECRET_VALUE=true
SOURCE_IS_AUTHORITY=false
HISTORICAL_MEDIA != CURRENT_RUNTIME
CORRELATION != CAUSATION
UNKNOWN != PASS
```

## 1. Pacote recebido

```text
name=investigação telefone depois casa vps github.zip
size_bytes=227036649
sha256=1649203d28fb32dad3d7c3d8b7bc8b783b3b7619941c5ef17b3f7f9cdf9321a5
```

Inventário observado:

```text
REAL_MEDIA=225
PNG=171
JPG=45
HEIC=7
MOV=1
MP4=1
MACOS_METADATA_ENTRIES≈225
EXECUTABLES_FOUND=0
ENCRYPTED_ITEMS_FOUND=0
EXACT_MEDIA_DUPLICATES_FOUND=0
```

Os itens `__MACOSX/._*` foram tratados como resíduos normais de metadados de compactação, não como programas.

Cobertura temporal observada nas mídias:

```text
2026-08-05 → 2026-08-13
```

---

## 2. 💎 Sessão Hermes longa em 08/08/2026

Screenshot preservado no pacote mostra uma sessão local com:

```text
SESSION_START=2026-08-08 01:50:27
SESSION_END=2026-08-08 07:14:03
MESSAGES=212
MODEL=tencent/hy3:free
```

Também aparecem duas superfícies SQLite relacionadas ao estado do Hermes:

```text
LOCAL_PROFILE_STATE_DB=%LOCALAPPDATA%/hermes/profiles/pivete/state.db
WORKING_COPY_STATE_DB=/e/CentralDark/Pivete/state.db
```

Classificação correta:

```text
TWO_STATE_DB_SURFACES_VISIBLE=CONFIRMED_BY_SCREENSHOT
WHICH_DB_WAS_CANONICAL_FOR_EVERY_ACTION=UNPROVEN
STATE_DIVERGENCE_OCCURRED=UNPROVEN
POSSIBLE_CONTEXT_DIVERGENCE_SURFACE=YES
```

A existência de duas bases visíveis é uma mina técnica para explicar divergência de contexto/sessão, mas não deve ser promovida a causa sem diff/hash dos bancos.

### Hash de imagem de referência

```text
IMG_4502.jpg
observed_time≈2026-08-08 08:35:34
sha256=bca91a320bc87355910f9bb6941e89938088b69238634084f03f75482b9026a4
```

---

## 3. 💎 Ponto de retomada Hermes

Outra imagem do pacote registra um ponto explícito de retomada da mesma janela de trabalho, com comando local de `--resume` e referência às 212 mensagens.

Identificador observado:

```text
session_id=20260808_015027_e0c2a6
```

Hash de imagem:

```text
IMG_4504.PNG
observed_time≈2026-08-08 08:40
sha256=28fd66779aaa30f57aea8c9241a49e5b7d81fd3ceff7a69b418451ac136f4e8c
```

Busca literal desse `session_id` no GitHub não encontrou material versionado.

Classificação:

```text
LOCAL_HERMES_SESSION_ID=CONFIRMED_BY_SCREENSHOT
SESSION_ID_VERSIONED_IN_GIT=NOT_FOUND
LOCAL_SESSION_ARTIFACT=LIKELY
```

`NOT_FOUND` descreve somente o resultado da busca no índice Git atual; não é prova absoluta de ausência histórica em todo artefato fora do Git.

---

## 4. 💎 Janela temporal Hermes ↔ GitHub em 08/08

A janela da sessão local:

```text
01:50 → 07:14 local
```

coincide com criação de PRs reais no GitHub.

### PR #721

```text
PR=#721
created_at=2026-08-08T07:02:01Z
local≈04:02 BRT
head=feat/artifacts-universal-schema-20260808
merge_commit_sha=5451c77fadf304d80aec0d8a57bded8d69169103
```

Escopo: schema universal de artefato, sanitização, SHA-256 determinístico, `artifact != aprovação`, renderer dedicado e correção de `/health` no Artifacts Builder.

### PR #724

```text
PR=#724
created_at=2026-08-08T07:25:22Z
local≈04:25 BRT
head=program/centraldark-convergencia-omniroute-722
```

Escopo: PR-mãe de convergência OmniRoute → CentralDark, preservação histórica e reconciliação posterior com os canônicos vivos.

### PR #727

```text
PR=#727
created_at=2026-08-08T07:59:53Z
local≈04:59 BRT
head=fix/writer-portavel-fallback-20260808
merge_commit_sha=01132b4075dfc3d703f801d2ed0ebcb597906b45
```

Escopo: Writer portátil, handoff, fallback por capacidade, preservação de branch/HEAD/delta e proibição de model-lock como autoridade.

### Veredito permitido

```text
HERMES_LOCAL_SESSION_OVERLAPS_721_724_727=CONFIRMED_TEMPORAL
SAME_WORK_PERIOD=STRONGLY_SUPPORTED
DIRECT_CAUSAL_MAPPING_EACH_MESSAGE_TO_EACH_PR=UNPROVEN
```

Não tratar coincidência temporal como prova causal de experiências pessoais.

---

## 5. Continuação da convergência

A cadeia posterior já medida permanece:

```text
#724 convergência
   ↓
#727 writer/handoff
   ↓
#733 promoção da convergência
   ↓
main
```

PR #733:

```text
head=fix/integracao-hub-hermes-pr-mae-20260809
created_at=2026-08-09T22:54:41Z
merged_at=2026-08-11T09:56:46Z
merge_commit_sha=667603fbe1a2577e2845fbec847ee523756dacb4
```

Isso fecha uma continuidade Git real entre a janela do dia 08 e a promoção dos dias 09–11.

---

## 6. 💎 Painel local Hermes / SOL em `127.0.0.1:9119`

Mídias do pacote mostram, no PC, uma interface local em:

```text
127.0.0.1:9119/chat?profile=sol
```

Elementos visuais observados:

```text
Hermes/SOL
seleção de modelo
sessão/chat
painel local
mensagem de inicialização de agente/provider
```

Buscas por `9119`, pelo endereço c
```