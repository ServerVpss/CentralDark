
<!-- CENTRALDARK_SECRET_MVP_POLICY_V1 -->
## 🔐 Secrets — regra global
Owner: `docs/GOVERNANCA/REGRA-SECRETS-E-VARIAVEIS.md`

```text
SECRET_SEEN != BLOCKER
ASK_SANITIZED_COPY_BEFORE_WORK=false
DO_NOT_ECHO_SECRET_VALUE=true
DO_NOT_COMMIT_SECRET_VALUE=true
AUTHORIZED_RUNTIME_MAY_USE_SECRET=true
AUTHORIZED_VAULT_MAY_PRESERVE_SECRET=true
ACCIDENTAL_EXPOSURE_ACTION=ROTATE_POST_ONLINE
LOCAL_TOOL_DENIAL != GLOBAL_BLOCKER
BLOCKER_MUST_NAME_EXACT_TOOL_OR_LAYER=true
AUTHORIZED_ALTERNATE_ROUTE_BEFORE_HUMAN_BLOCKER=true
```
<!-- /CENTRALDARK_SECRET_MVP_POLICY_V1 -->

## 🧭 CURRENT CONTINUITY — 2026-11-09

> **Este é o estado vigente deste handoff.** O snapshot iniciado em 2026-08-28 permanece abaixo, preservado como proveniência histórica; não deve ser usado como CURRENT.

**FIO DA MISSÃO:** preservar a Casa, inventariar os 17.721 arquivos não rastreados e os 116 caminhos rastreados alterados, identificar a divergência Casa ↔ `origin/main` e preparar uma reconciliação sem perda.

**PRÓXIMO PASSO:** produzir inventário NUL-safe com caminhos e hashes; classificar os 35 caminhos rastreados alterados que também mudaram no remoto e os 16 arquivos não rastreados que colidem com o tree remoto; reconciliar por owner, começando pelo commit local exclusivo e seus três caminhos.

**PONTO DE CONTINUIDADE (NEXT_CURSOR):** preservar e inventariar os 17.721 arquivos, identificar a origem da divergência e preparar uma reconciliação sem perda.

### CURRENT medido na Casa — 2026-11-09T01:59:37-03:00

| Campo | Valor |
|---|---|
| Checkout | `F:\CentralDark` |
| Branch local | `main` |
| HEAD local | `b71963ffaacbca2847364517487bb232f611acdb` |
| origin/main / git ls-remote | `4d97ddadda74aaed3ebd17056170718a86a5ec7e` |
| Base comum | `4d2af54c746c827e01c47778a4ce9f4165c39eee` |
| Commits exclusivos | `1 local / 67 remoto` |
| Worktree | `17.721 não rastreados + 116 rastreados alterados = 17.837 caminhos` |
| Sobreposição | `35/116` caminhos rastreados alterados também mudaram no remoto |
| Colisões | `16` arquivos não rastreados já existem como caminhos rastreados em origin/main |
| Sincronização | `CHECKOUT_SYNCED=false` |

**Origem da divergência:** o único commit local exclusivo é `b71963f` (`fix(remote-bridge): restore canonical Windows build`). Ele altera:
- `scripts/remote-bridge/Build-Remote-Bridge.ps1`
- `scripts/remote-bridge/CORPO-UNICO-CAPACIDADES.md`
- `scripts/remote-bridge/canonical/Build-Remote-Bridge.ps1`

Os três caminhos também aparecem no conjunto remoto modificado desde a base comum. A simulação de três vias marcou `scripts/remote-bridge/CORPO-UNICO-CAPACIDADES.md` como `changed in both`; exige reconciliação manual por owner.

**Preservação aplicada:** `git fetch origin main` já havia concluído no passo anterior; nesta leitura `origin/main` coincide com `git ls-remote`. Nenhum merge, rebase, reset, stash, clean, force-push ou edição do checkout foi executado. O inventário completo e o manifesto de hashes ainda não foram produzidos.

**Checkpoint anterior preservado como proveniência, não como prova de sync:** missão `centraldark-hermes-envelope-20261107`; etapa `codeoss-11452-compile-electron-runtime-cli-pass-20261108`; `HASH_CHAIN_PASS`; receipt `8573d5515444fa686bf55b2c72ff3b68c16c8859245fa316fdcc243288e70715`; 9 etapas verificadas. O cursor deste delta documental é o inventário/reconciliação acima.

### Padrão SOL vigente nesta continuidade

Resultado primeiro; PT-BR direto; até quatro linhas por padrão; distinguir conversa, pergunta, correção, ensino e ordem. Recuperar protocolo, intenção, CURRENT, owner, checkpoint, receipt e `NEXT_CURSOR` quando disponíveis. Reutilizar owners; uma caneta por escopo; preservar o checkout; não executar fases cegamente. Manter separados **FIO DA MISSÃO**, **PRÓXIMO PASSO** e **PONTO DE CONTINUIDADE**. `UNKNOWN != PASS`, ação não é prova, documento não é execução, merge não é deploy; a realidade julga.



### Snapshot histórico preservado — medição de 2026-08-28

Este bloco é histórico. Os valores e a seção antiga CURRENT_FACTS descrevem a medição de 2026-08-28, não o estado atual. O conteúdo é mantido para proveniência.

=== HANDOFF CHATGPT · HISTORICAL SNAPSHOT (2026-08-28) ===

MEASURED_AT=2026-08-28T15:07Z
CENTRALDARK_BRANCH=fix/git-conflict-padrao-unico
CENTRALDARK_HEAD=c4d713fbe3e00d6da213d8a4c6ef06c95f04bbde
CENTRALDARK_MAIN=80088d10d75a4db20f6f193d65c14ac7203deb39
ACTIVE_PR=none
WRITER_SCOPE=unknown

==================================================
NOTEPAD — MINERAÇÃO LOCAL (LOCALSTATE)
==================================================

SOURCE=WINDOWS_NOTEPAD_LOCALSTATE
WINDOWS_FOUND=2 janelas (WindowState: 2 arquivos .bin SHA256)
TABS_FOUND=30 abas no TabState atual
UNSAVED_TABS=detectados (abas sem path de arquivo de origem)
FILE_BACKED_TABS=detectados (f1caf39a referenciava C:\Users\danda\OneDrive\Área de Trabalho\comando serealizado mutaçao cdedo poribido.txt)
DEDUPED_ITEMS=6 itens de conteúdo inteligível identificados (ver abaixo)
SENSITIVE_QUARANTINED=4 arquivos (100e5ffd, 6e864aa6, c89dfadc, f1caf39a) — conteúdo não reproduzido
HISTORICAL_ITEMS=✓ (session-intelligence-harvester como owner canônico)
CURRENT_CANDIDATES=ver seção CURRENT_FACTS abaixo
FORMAT_VERIFIED=SIM (decodificação UTF-16/UTF-8 com sucesso em ~20% dos arquivos; ~80% binário/estrutural)

FORMATO DO NOTEPAD:
├── %LOCALAPPDATA%\Packages\Microsoft.WindowsNotepad_8wekyb3d8bbwe\LocalState\
│   ├── WindowState\ (composição/ordem das janelas)
│   ├── TabState\ (estado das abas: texto + meta + path origem)
│   └── LocalState.zip (exportação histórica: ~50 sessões em "TabState - Copia/")

==================================================
FACTS_MEDIDOS_NO_SNAPSHOT_2026-08-28 (HISTORICAL_REFERENCE_NOT_CURRENT)
==================================================

1. GATILHOS CENTRALDARK OPERAM conforme descrito na aba 0f9a4a3a:
   - !CENTRALDARK, #ACORDAR, !CALIBRAR, !MULTIBUSSOLA_META são gatilhos reais
   - O boot declarativo CENTRALDARK_AI_BOOT.yaml foi criado e está sendo iterado
   - Verificado no repo: commits c4d713fbe, a104fdf01, cfe195c18, f91e6752f
   - CLASSIFICAÇÃO: FACT (medido no HEAD atual do repo)

2. PADRÃO DE CONFLITO GIT — ÚNICO:
   - skill .agents/skills/git-conflict-resolve-house-standard/SKILL.md existe
   - motor scripts/dependabot/resolve-conflicts.sh existe
   - Prova empiricamente que --ours/Theirs têm semântica específica durante merge
   - Corrigido e amarrado no CENTRALDARK_AI_BOOT.yaml
   - CLASSIFICAÇÃO: FACT (owner existente + boot amarrado)

3. ROUTER DA CASA:
   - Conceito descrito na aba 1b5f5916: roteador que escolhe modelo em tempo real
   - CentralDark já implementa isso via omni-router / CENTRALDARK_AI_BOOT
   - CLASSIFICAÇÃO: FACT (conceito operacional existente + implementação no repo)

4. METALOUPA E AUTO-APERFEIÇOAMENTO:
   - Aba 698587c6: "MetaLupa não fica só julgando os outros. A própria cadeia produz material para melhorar a MetaLupa."
   - CONCEITO CONFIRMADO: a MetaLupa espelha/avalia o próprio processo, com evolução via delta provado
   - CLASSIFICAÇÃO: FACT (conceito alinhado com SKILL.md da meta-lupa)

5. ARQUIVO DE FORA DO REPO:
   - f1caf39a continha referência a: C:\Users\danda\OneDrive\Área de Trabalho\comando serealizado mutaçao cdedo poribido.txt
   - CONTEÚDO SENSITIVO/QUARDENADO: não reproduzido
   - CLASSIFICAÇÃO: SENSITIVE_QUARANTINE (material externo não reconciliado)

6. TRANSCRIÇÃO YOUTUBE COM METADADOS:
   - c89dfadc (121KB): continha transcript markdown + metadata "yt/detailpage" com fields como "cpn", "el"
   - POSSÍVEL CONTEÚDO SENSÍVEL: metadata de sessão/Youtube pode conter tokens de contexto
   - CLASSIFICAÇÃO: SENSITIVE_QUARANTINE — não reproduzido

==================================================
SUPERSEDED_HISTORY (UTIL, MAS DESATUALIZADO)
==================================================

- Aba 100e5ffd (17KB): "AGORA FECHOU A FÓRMULA" — discute alargamento/compressão do organismo, fanout adaptativo
  → CONCEITO: relevantíssimo como contexto histórico de evolução do sistema
  → STATUS: HISTORICAL_REFERENCE — o que era ideia então, hoje já está implementado (CENTRALDARK_AI_BOOT.yaml com boot inteligente)

- Aba c89dfadc e f1caf39a: material bruto extraído de outras sessões/abas
  → STATUS: DISCARD/QUARANTINE — não serve como fato atual, apenas como evidência de que sessões anteriores geraram material

==================================================
OPEN_GAPS (UNKNOWN MATERIAL)
==================================================

1. Quem é o WRITER ativo no escopo atual do CentralDark?
   → UNKNOWN — não medido explicitamente nesta extração. Boot declarativo deve registrar.

2. O que exatamente está contido nas ~24 abas binárias não decodificáveis?
   → UNKNOWN — podem ser estado de layout, metadados de UI, ou conteúdo em encoding não UTF-16. Sem leitura, é UNKNOWN.

3. O LocalState.zip tem ~50 sessões históricas — qual a inteligência consolidada nelas?
   → UNKNOWN até extração em lote do diretório "TabState - Copia/" ser feita explicitamente

4. O arquivo OneDrive "comando serealizado mutaçao cdedo poribido.txt" — o que exatamente nele?
   → UNKNOWN e SENSITIVE — arquivo externo ao repo, não lido, possivelmente sensível

==================================================
CONTRADIÇÕES
==================================================

NENHUMA CONTRADIÇÃO ENCONTRADA entre o que estava nos Notepad e o estado atual do CentralDark:
- Gatilhos (!CENTRALDARK, #ACORDAR, !CALIBRAR) → operacionais no repo ✓
- Boot declarativo → implementado e sendo iterado ✓
- Conflito git unificado → skill + script + boot amarrado ✓
- Conceito de router → implementado via CENTRALDARK_AI_BOOT ✓

HISTÓRICO ALINHADO COM REALIDADE ATUAL. Nenhuma abra contradictoria detectada.

==================================================
IPNAMES_DELTA
==================================================

NENHUMA CORRELAÇÃO OBSERVÁVEL com ipnames neste handoff.
Não havia menção a IPs, DNS, hosts ou rede no material minerado do Notepad.
Regra: IP_PRESENTE_NO_FEED != SERVICO_AUTENTICADO — intacta.

==================================================
NEXT_SAFE_ACTION (MENOR DELTA MATERIAL)
==================================================

1. Extrair em lote o diretório "TabState - Copia/" do LocalState.zip para identificar inteligência histórica adicional (session-intelligence-harvester já é o owner para isso)
2. Se WANTED: ler o arquivo do OneDrive de forma segura, apenas para reconciliar com o que já existe no repo (não para persistir)
3. Registrar no CENTRALDARK_AI_BOOT.yaml o WRITER ativo e escopo atual
4. Quando o CHEFE quiser entregar ao ChatGPT: copiar este HANDOFF.md ou imprimir o bloco copiável abaixo

==================================================
DECISÃO CHEFE (NÃO AUTOMÁTICA)
==================================================

CHATGPT = superfície de raciocínio/conversa
HERMES = executor/preservação local
CENTRALDARK = estado/canal canônico
CHEFE = autoridade final que decide quando entregar o handoff

O Hermes NÃO envia nada ao ChatGPT automaticamente.
Este handoff foi preparado para ser entregue manualmente quando o CHEFE decidir.

=== END HANDOFF ===


## 🔏 !RASTRO — LEI DO RASTRO (cadeado obrigatório · owner: `AGENTS.md`)

```text
RESPONSE_WITHOUT_TRACE=INVALID
EVERY_WRITE_CLAIM_TO_CHEFE_CARRIES=COMMIT_SHA+PATH+LINK+READBACK(remote_tip==local_sha)
EVERY_MEMORY_CLAIM_NAMES_WHERE=true
ACTIVE_PR_MOTHER_RECEIPT_SAME_TURN_AS_DIRECT_MAIN=true
```

Vale para qualquer motor (Claude, ChatGPT, Codex, Gemini, Grok, Hermes, CI). Disse que gravou → mostra ID, caminho, link e prova de leitura de volta. Sem isso, não aconteceu.
