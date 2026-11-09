
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

> O snapshot de 2026-08-28 está classificado como histórico e preservado abaixo. Esta seção registra a medição atual da mesma missão.

**FIO DA MISSÃO:** preservar a Casa e preparar a reconciliação sem perda entre o checkout local e origin/main. O cursor anterior de inventariar os 17.721 caminhos não rastreados e identificar a divergência foi concluído para o escopo do Git status.

**PRÓXIMO PASSO:** revisar os 31 caminhos com conteúdo diferente do remoto, identificar os owners e os destinos de migração, e preparar a reconciliação sem perda dos 28 caminhos deletados em apps/modulos/status/.

**PONTO DE CONTINUIDADE:** revisar os 31 caminhos com conteúdo diferente do remoto, identificar os owners e os destinos de migração, e preparar a reconciliação sem perda dos 28 caminhos deletados em apps/modulos/status/.
**NEXT_CURSOR:** REVIEW_31_DIFFERENT_CONTENT_PATHS_AND_28_STATUS_DELETIONS_NO_LOSS

### CURRENT medido na Casa — 2026-11-09T02:21:25-03:00

| Campo | Valor |
|---|---|
| Checkout | `F:\CentralDark` |
| Branch local / HEAD | `main` / `b71963ffaacbca2847364517487bb232f611acdb` |
| origin/main / live ls-remote | `4d97ddadda74aaed3ebd17056170718a86a5ec7e` / MATCH |
| Base comum | `4d2af54c746c827e01c47778a4ce9f4165c39eee` |
| Commits exclusivos | `1 local / 67 remoto` |
| Git status | `17.837 entradas: 17.721 não rastreadas + 116 rastreadas alteradas` |
| Não rastreados | `17.687 arquivos + 34 diretórios` |
| Rastreados alterados | `88 presentes + 28 deletados` |
| Inventário | `17.775 arquivos SHA-256; 5.542.586.713 bytes; 0 erros; 0 instáveis; 0 reparse points` |
| Sincronização | `CHECKOUT_SYNCED=false` |

**Origem da divergência:** um commit local exclusivo, `b71963f`, altera três caminhos do Remote Bridge. Dois arquivos de build são byte a byte iguais ao main remoto. A divergência material do commit está concentrada em `scripts/remote-bridge/CORPO-UNICO-CAPACIDADES.md`; o worktree também contém uma terceira versão desse documento. A simulação de três vias marcou esse documento como `changed in both`.

**Conflitos medidos:** 16 caminhos não rastreados já existem no tree remoto: 14 são byte a byte idênticos e 2 são diferentes. Nos 35 caminhos rastreados também alterados no remoto: 4 são idênticos, 29 são diferentes e 2 estão ausentes no worktree. No total, 49 comparações de bytes produziram 18 iguais e 31 diferentes; 2 não puderam ser comparadas porque são exclusões locais.

As duas colisões não rastreadas com conteúdo diferente são:
- `.agents/skills/centraldark-operational-method/Skills/centraldark-builder-destop/SKILL.md`
- `docs/BRAIN/03-DOCUMENTACAO/02-BIBLIOTECA/Boas-praticas-para-pastas-e-arquivos-digitais.md`

As 28 exclusões locais estão em `apps/modulos/status/`: 26 têm blobs idênticos em HEAD e origin/main; `index.html` e `styles.css` têm versões remotas diferentes. Nenhum arquivo foi restaurado, removido ou sobrescrito.

**Recibo do inventário (escopo exato: caminhos declarados pelo git status, não varredura integral do filesystem):**
- Run: `centraldark-sync-20261109T022125`
- Manifesto JSONL: `C:\Users\Administrador\.hermes\scratch\centraldark-sync-inventory-20261109T022125.jsonl`
- SHA-256 do manifesto: `b81a44499f0bcdd9072b37c36e2701de12e4d211dfebd9dc20b26ec2e7d75566`
- Banco SQLite: `C:\Users\Administrador\.hermes\scratch\centraldark-sync-inventory-20261109T022125.sqlite3`
- Recibo JSON: `C:\Users\Administrador\.hermes\scratch\centraldark-sync-inventory-20261109T022125.receipt.json`
- Linhas do manifesto: `17.837`
- Readback após varredura: HEAD, origin/main e contagem do status estáveis; integridade SQLite OK.

**Preservação:** inventário completo para o escopo do Git status; reconciliação ainda pendente. Nenhum merge, rebase, reset, stash, clean, force-push ou edição do checkout foi executado. Os artefatos de inventário estão no scratch do Hermes, fora do repositório.

**PR documental:** `#1998` em rascunho, branch `docs/continuous-handoff-sync-20261109`. Atualiza este handoff e DELTA-CONTINUO; main ainda não foi alterado.

**Checkpoint anterior preservado como proveniência, não como prova de sync:** missão `centraldark-hermes-envelope-20261107`; etapa `codeoss-11452-compile-electron-runtime-cli-pass-20261108`; `HASH_CHAIN_PASS`; receipt `8573d5515444fa686bf55b2c72ff3b68c16c8859245fa316fdcc243288e70715`; 9 etapas verificadas.


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
