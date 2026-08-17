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

Buscas por `9119`, pelo endereço completo e pela mensagem exata no Git atual não localizaram implementação correspondente.

Classificação:

```text
LOCAL_PANEL_EXISTED_BY_SCREENSHOT=CONFIRMED
HERMES_SOL_VISUAL_ASSOCIATION=CONFIRMED_BY_UI
CURRENT_MAIN_IMPLEMENTATION_PATH=NOT_LOCATED
LOCAL_OR_HISTORICAL_ONLY=PLAUSIBLE
```

Ausência na `main` atual não invalida a evidência visual de que a superfície local existiu.

---

## 7. 💎 Obsidian no iPhone ↔ BRAIN/PM2

Mídia de 12/08 mostra no iPhone/Obsidian a nota:

```text
MOC: PM2 — Gerenciador de Processos
```

O conteúdo observado corresponde ao owner atual:

```text
docs/BRAIN/MOC-PM2.md
```

Esse owner registra que PM2 mantém serviços CentralDark na VPS e lista, entre outros:

```text
CentralDark-BotServer
CentralDark-HubBot
CentralDark-GuardiaoConsciencia
CentralDark-GuardiaoAnalista
CentralDark-MCP
```

Classificação:

```text
IPHONE_OBSIDIAN_CONTAINED_CENTRALDARK_BRAIN_CONTENT=CONFIRMED_BY_CONTENT_MATCH
BRAIN_PM2_OWNER_IN_GIT=CONFIRMED
EXACT_SYNC_TRANSPORT_TO_IPHONE=UNPROVEN
```

Esse é um vínculo material forte entre conteúdo operacional da VPS/BRAIN e o Obsidian no telefone, sem ainda determinar se o transporte foi Git, sync próprio, cópia manual ou outra rota.

---

## 8. 💎 Vestígio `juggl_view`

Na mesma janela de Obsidian aparecem:

```text
juggl_view
Plugin desativado
Visualização em gráfico
MOC-PM2
```

Interpretação técnica permitida:

```text
WORKSPACE_RETAINED_VIEW_REFERENCE=SUPPORTED
PLUGIN_AVAILABLE_AT_SCREENSHOT=NO/DISABLED
HISTORICAL_GRAPH_VIEW_SURFACE=SUPPORTED
```

Um workspace pode manter referência a uma view que já não está disponível no aparelho. Isso explica tecnicamente uma interface/função aparecer como vestígio depois que o plugin foi removido/desativado.

---

## 9. 💎 PM2/VPS continua owner real no Git

Owner medido:

```text
docs/BRAIN/MOC-PM2.md
blob_sha=badd54d39a121226538df8a33788877322cc0c96
```

Semântica:

```text
PM2
→ mantém serviços CentralDark 24/7 na VPS
→ reinicia processo quando cai
→ pm2 save preserva estado
```

Classificação:

```text
PM2_AS_CENTRALDARK_VPS_PROCESS_MANAGER=CONFIRMED_IN_CANONICAL_DOC
LIVE_PM2_PROCESS_LIST_NOW=NOT_MEASURED_IN_THIS_ADDENDUM
```

---

## 10. Correção de classificação: Radmin / AnyDesk

SEGREDO/CHEFE esclareceu depois da primeira triagem:

```text
Radmin=OWNED_WORK_TOOL
AnyDesk=OWNED_WORK_TOOL
purpose=remote support for client machines
```

Portanto, substituir a leitura de suspeita anterior por:

```text
RADMIN_SUSPICIOUS_LEAD=REMOVED
ANYDESK_SUSPICIOUS_LEAD=REMOVED
REMOTE_SUPPORT_WORK_CONTEXT=CONFIRMED_BY_CHEFE
```

A mera presença desses softwares não deve ser usada como indício de comprometimento. Só reabrir a pista se houver sessão/log/configuração concretamente incompatível com o uso profissional declarado.

---

## 11. Arduino / cabo / serial

Neste ZIP específico, a triagem das 225 mídias não encontrou ainda uma imagem inequívoca de:

```text
Arduino
placa microcontroladora
cabo serial identificado
USB-UART
GPIO
esquema de conexão física Casa↔VPS
```

Classificação:

```text
ARDUINO_OR_SERIAL_LINK_IN_THIS_ZIP=NOT_LOCATED
DO_NOT_CONCLUDE_ABSENCE_FROM_OTHER_ARCHIVES=true
```

A trilha permanece aberta para próximos lotes.

---

## 12. Mapa acumulado sem trocar arquitetura

```text
                         CENTRALDARK
                              |
          ┌───────────────────┼───────────────────┐
          |                   |                   |
         VPS                 CASA               IPHONE
          |                   |                   |
        PM2                Hermes              Obsidian
          |                   |                   |
    CentralDark-MCP      state.db(s)          BRAIN/PM2
          |                   |                   |
      Hub/Missões        painel 9119             WARP
          |                   |                   |
       GitHub            Windows/PC           Rede Local
          |                                       |
   #721/#724/#727                             Controle TV
          |
        #733
          |
         main
```

Setas deste mapa significam relação arquitetural ou evidência cruzada, não necessariamente conexão de rede viva no instante atual.

---

## 13. O OURO desta camada

```text
💎 OURO_HERMES_SESSION
Sessão local de 5h24 com 212 mensagens preservada visualmente.

💎 OURO_STATE_DB
Duas superfícies SQLite do Hermes aparecem na mesma investigação.

💎 OURO_TEMPORAL_0808
A sessão local sobrepõe temporalmente #721, #724 e #727.

💎 OURO_LOCAL_PANEL
Interface Hermes/SOL local em 127.0.0.1:9119 fotografada, mesmo sem path localizado na main atual.

💎 OURO_OBSIDIAN_PM2
MOC-PM2 no iPhone corresponde a owner real do BRAIN que descreve processos da VPS.

💎 OURO_CONTINUIDADE
#724/#727 → #733 → main cria continuidade Git real após a janela de 08/08.
```

---

## 14. Fronteiras que continuam UNKNOWN

```text
qual state.db continha qual delta exato em cada minuto
se os dois state.db divergiram e quanto
mecanismo exato de sync BRAIN → iPhone naquela data
implementação fonte atual do painel local :9119
WARP ↔ rota privada CentralDark
TV ↔ CentralDark/VPS
Arduino/cabo ↔ Casa/VPS
qualquer causalidade entre software e experiência pessoal
```

---

## 15. Regra de continuidade

```text
HASH + HORA + MESMO ALVO + LOG/ARTEFATO
→ VÍNCULO SOBE

SCREENSHOT + TEXTO DO MESMO SCREENSHOT
→ 1 CLUSTER DE EVIDÊNCIA, NÃO 2

NOT_FOUND EM BUSCA
→ RESULTADO DO INSTRUMENTO, NÃO PROVA ABSOLUTA DE AUSÊNCIA

HISTÓRICO
→ NÃO VIRA RUNTIME ATUAL SEM NOVA MEDIÇÃO
```

Próximas minas de maior valor:

```text
A) hashes/diff dos state.db preservados, se existirem
B) logs/receipts de Hermes da sessão 01:50→07:14
C) origem do painel local :9119 em branch/ZIP/backup
D) mecanismo histórico de Obsidian/BRAIN no iPhone
E) Cloudflare/WARP ↔ rotas reais da VPS
F) lote físico Arduino/cabo/TV quando aparecer
```
