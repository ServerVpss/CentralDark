# 🗿 SEGREDO RELÍQUIA — Dossiê de Escavação

> Snapshot cumulativo da pesquisa feita até esta rodada. Este arquivo existe para **não perder o fio** quando a escavação continuar em outra sessão, aparelho ou agente.

```text
STATUS=HISTORICAL_RESEARCH_SNAPSHOT
SOURCE_IS_AUTHORITY=false
CANONICAL_OWNERS_REMAIN_UNCHANGED=true
ZERO_DEPLOY=true
ZERO_VPS_MUTATION=true
ZERO_SECRET_VALUE=true
ZERO_FORCE_PUSH=true
REUSE_BEFORE_CREATE=true
```

## 0. Recibo da gaveta

- Repositório: `ServerVpss/CentralDark`
- Base medida antes de abrir a gaveta: `main@80f806d9283553ed99f3189bd556898558188b0c`
- Branch da relíquia: `docs/segredo-reliquia-hud-20260816`
- Objetivo: guardar **tudo que já foi encontrado**, inclusive peças históricas, peças fora da `main`, peças mergeadas, hipóteses, ausências e trilhas ainda `UNKNOWN`.
- Regra: achado histórico não vira runtime atual automaticamente.

---

## 1. Mapa-mãe preservado

A escavação foi organizada sem trocar a árvore principal:

```text
                 CENTRALDARK
                      |
        ┌─────────────┼─────────────┐
        |             |             |
       VPS          CASA          MOBILE
        |             |             |
   Cloudflare      Hermes       Obsidian
        |             |             |
    Gateway       Agentes        SOL
        |                           |
       API                      iPhone
        |
    Browser/Tools
```

Tudo abaixo entra **dentro desse mapa**, sem inventar uma segunda arquitetura.

---

## 2. 💎 SOL Desktop / Tauri — relíquia confirmada no Git

### Evidência localizada

Branch histórica:

```text
feature/sol-miniapp-voice-poc-20260731
```

Commit:

```text
ec6b3dfe37d9d306da2bf6b80a1c9bc6fbf0038d
feat(sol-desktop): congelar POC Tauri voice-first e referências clean-room
```

Arquivos preservados pelo commit:

```text
apps/sol-desktop/README.md
artifacts/sol-desktop-poc/MANIFEST.json
artifacts/sol-desktop-poc/sol-desktop-poc-source.zip
docs/REFERENCIAS/APPCENTRALDARK-EVOLUIR-LOCAL-SNAPSHOT.md
third_party/open-lovable/README.md
```

O manifesto histórico registra:

```text
source_zip=sol-desktop-poc-source.zip
source_zip_sha256=cbde3ed45617ebfcea2c8fbe882272177f85e5b0c24d0af7f7016ab701c6bc13
source_zip_size_bytes=25636
files_inside=30
deterministic_core_tests=6/6 PASS
tauri_windows_build=PENDING_ON_WINDOWS
npm_install_in_sandbox=BLOCKED_BY_REGISTRY_CONNECTIVITY
```

### Capacidades descritas naquele POC

- Tauri v2 + React/TypeScript/Vite;
- janela flutuante e always-on-top;
- temas Overclock e CRM;
- menus SOL, PIVETE, Missões, Agentes, CRM, Builder, Voz e Config;
- push-to-talk por botão e `Ctrl+Shift+Espaço`;
- entrada textual;
- reconhecimento de voz do sistema quando disponível;
- TTS pelo bridge CentralDark ou fallback do Windows;
- gateway plugável;
- botão de interrupção;
- roteador local determinístico;
- receipts com redação de segredos;
- testes unitários do núcleo.

### Snapshot `APPCENTRALDARK EVOLUIR`

O mesmo commit preserva referência histórica de um pacote descrito como:

```text
sha256=378848b430f182bc54b48839e2eef09c20220aaa7ee7c8d9bb725283490de009
size_bytes=57640977
entries=11360
status=REFERENCE_ONLY_CLEAN_ROOM
```

Capacidades observadas no snapshot:

- executável desktop;
- sidecar Node;
- integração Tauri;
- PTY/panes;
- Claude/Codex/Gemini;
- MCP;
- catálogo;
- missões e squads;
- cron;
- memória Jarvis;
- wake lock;
- live prompt;
- voz/NLU;
- watchers de transcript;
- ponte remota;
- preview server;
- observação;
- screenshots;
- QA visual.

### Estado correto

```text
SOL_DESKTOP_TAURI_IN_GIT=true
SOURCE_ZIP_IN_GIT=true
HISTORICAL_WINDOWS_BUILD_STATUS=PENDING_ON_WINDOWS
CURRENT_LOCAL_WINDOWS_BUILD=NOT_REMEASURED_IN_THIS_PR
```

Não confundir o estado histórico do manifesto com o estado atual da máquina física.

---

## 3. 🧠 Hermes — percepção paralela já existia

Arquivo encontrado no núcleo Hermes:

```text
HERMES-CORE/perception-orchestra.mjs
```

O orquestrador trabalha com quatro ataques de percepção:

```text
A_LOGIC
B_IMPLEMENTATION
C_REGRESSION_FALSE_GREEN
D_SIMPLIFICATION
```

Semântica extraída:

```text
PARALLEL_PERCEPTION_SERIAL_MUTATION
parallel_perception=true
mutation_allowed=false
writer_required_for_mutation=true
model_vote_is_truth=false
reality_is_judge=true
dedupe_required=true
counterproof_required=true
gold_requires_counterproof=true
four_answers_are_four_proofs=false
```

Fluxo útil para futuras missões:

```text
4 percepções read-only em paralelo
→ dedupe
→ confronto de independência da evidência
→ teste discriminante quando necessário
→ 1 slot de mutação canônica
→ Writer
```

Isso casa diretamente com a estratégia de “várias pontas procuram ao mesmo tempo; uma caneta altera o canônico”.

---

## 4. 🏠 CASA-VAULT + Hermes + Obsidian

Owner arquitetural localizado:

```text
docs/ARQUITETURA/HERMES-CASA-OBSIDIAN-SYNC.md
```

Estrutura registrada:

```text
E:\CentralDark\Pivete\CASA-VAULT
├── 00-CANONICO/          ↔ CentralDark/docs/BRAIN
├── 10-MEMORIA-PRIVADA/
├── 20-INBOX-HERMES/
├── 30-ANEXOS/
├── 90-CONFLITOS/
├── .hermes-sync/
└── .obsidian/
```

Regra de trajetória:

```text
edição em 00-CANONICO
→ sincronização para docs/BRAIN
→ commit/PR/merge
→ Hermes recarrega a fonte da verdade
→ contexto/direção atualizados
```

O sync descrito diferencia:

- Git mudou sozinho → Git → Obsidian;
- Obsidian mudou sozinho → Obsidian → `docs/BRAIN`;
- ambos iguais → sincronizado;
- ambos diferentes → preservar em `90-CONFLITOS` e parar;
- exclusão → nunca propagar automaticamente.

Estado:

```text
CASA_VAULT_ARCHITECTURE=PRESENT
BIDIRECTIONAL_HASH_SYNC=DESCRIBED
PHYSICAL_LOCAL_PATH_RUNTIME=NOT_REMEASURED_IN_THIS_PR
```

---

## 5. 🌌 Obsidian Grafo Vivo / Jarvis

Arquivos fortes:

```text
apps/modulos/obsidian-plugin-grafo-vivo/README.md
apps/modulos/obsidian-plugin-grafo-vivo/PLANO-ENXAME-v0.3+.md
```

### O que existe no registro auditado

```text
v0.1 2D=EXISTS
v0.4 3D=COMPLETED_IN_2026-07-06_SNAPSHOT
v0.2 WebSocket=PENDING_IN_THAT_SNAPSHOT
v0.3 note sync=PENDING_IN_THAT_SNAPSHOT
v0.5 SVG icons=PENDING_IN_THAT_SNAPSHOT
```

Capacidades descritas no README:

- grafo 2D;
- nós por categoria;
- partículas em arestas ativas;
- filtro;
- clique em `obsidian_path` abre nota;
- Grafo 3D · Jarvis;
- `3d-force-graph` bundleado;
- glow/pulso online/offline;
- labels de setor;
- foco em nó;
- dados vivos via `/api/graph` / endpoint configurável;
- polling periódico.

Roadmap histórico do WebSocket:

```text
MCP tool call
→ WebSocket
→ partícula na aresta correspondente
→ <1s de latência desejada
```

Não promover o roadmap a fato runtime até medir o código/serviço atual.

---

## 6. 🌐 WebSocket / Elite Gateway

Arquivo localizado:

```text
apps/modulos/elite-gateway/scripts/elite_ws_gateway.py
```

O arquivo implementa:

- FastAPI;
- endpoint WebSocket `/ws`;
- verificação inicial de token;
- Zendriver;
- Chrome headless;
- profile configurável;
- loop de recebimento/envio de mensagens.

Estado correto:

```text
ELITE_WS_GATEWAY_CODE=PRESENT
OBSIDIAN_WS_IS_SAME_GATEWAY=UNPROVEN
CURRENT_RUNTIME_LISTENING=UNPROVEN_IN_THIS_PR
```

A existência de um WebSocket não prova que todas as superfícies WebSocket convergem nele.

---

## 7. 🎙️ CentralDark Voice

Módulo localizado na `main`:

```text
apps/modulos/centraldark-voice/
├── README.md
├── content.js
├── background.js
├── popup.js
├── popup.html
└── manifest.json
```

Fluxo descrito:

```text
botão "Ler em voz alta" / Web Speech API
→ extensão CentralDark Voice
→ bridge.centralldark.com/v1/audio/speech
→ MP3
→ reprodução no browser
```

Características registradas:

- interceptação do botão de voz do Claude;
- fallback por `window.speechSynthesis.speak`;
- configuração por popup;
- suporte Chrome/Edge/Brave;
- possibilidade avançada em Electron/Claude Desktop;
- várias vozes configuráveis.

Estado:

```text
VOICE_MODULE_CODE=PRESENT
CURRENT_BRIDGE_RUNTIME=NOT_REMEASURED_IN_THIS_PR
```

---

## 8. 🛡️ Fundação privada de segurança — PR #873

PR:

```text
#873 feat(security): absorver fundação privada sem duplicar owners
state=CLOSED
merged=true
merge_commit_sha=c330bf8e87829e5c3e21f3571cdfe903970d9fd0
```

Package candidato histórico:

```text
PACKAGE_SHA256=3e468625d91c7bfec5e2518dbe142fa3893a385c3be846f5a01d76d709d3aa78
PACKAGE_NODE_TESTS=9/9_PASS_REPRODUCED
PACKAGE_VALIDATOR=PASS_REPRODUCED
```

Estruturas privadas incorporadas no delta:

```text
centraldark_private.security_control
centraldark_private.security_incident
centraldark_private.session_revocation
centraldark_private.asset_posture
centraldark_private.backup_restore_evidence
centraldark_private.secret_status
```

Superfícies modeladas:

```text
CASA / Windows
VPS / Linux
Frontend
Backend
Agents
Database
Backup / Restore
Sessions
```

Estado histórico explicitamente honesto da missão:

```text
HOUSE_WINDOWS_POSTURE=UNPROVEN
VPS_LINUX_POSTURE=UNPROVEN_IN_THIS_MISSION
SESSION_REVOCATION_CONSUMER=UNPROVEN
BACKUP_RESTORE_PHYSICAL_TEST=UNPROVEN
```

Conclusão: existe a estrutura de postura/segurança; isso não prova uma VPN, firewall ou túnel específico em execução na Casa.

---

## 9. ⛏️ ANY_INPUT=POSSIBLE_ORE + Chrome DevTools — PR #919

PR:

```text
#919 feat(memory-linker): minério universal + Chrome DevTools MCP
state=CLOSED
merged=true
merge_commit_sha=0e76d8ddeb10eb44a0f973509709e0c7a0219889
```

Contrato absorvido:

```text
any_input_is_possible_ore=true
everything_can_teach=true
source_is_not_authority=true
promotion_is_not_universal=true
gold_requires_proof=true
crystal_requires_reusable_proven_delta=true
```

Classes explícitas adicionadas:

```text
BROWSER_OBSERVATION
CONVERSATION
COMMENT
FEEDBACK
COMMIT
PULL_REQUEST
ISSUE
RUNTIME_EVENT
```

Browser observation pode produzir sinais de:

- debugging;
- console;
- network;
- performance;
- Lighthouse;
- snapshot/screenshot;
- heap/memory quando aplicável.

Fluxo:

```text
Chrome DevTools MCP
→ BROWSER_OBSERVATION
→ Artifact→Capability
→ sinais
→ dedupe
→ contraprova / MetaLupa
→ owner canônico
→ teste
→ candidate | no-change | crystal
```

Também foi encontrado Playwright fisicamente no repo, incluindo configurações do Bolt/preview.

---

## 10. 🗿 Overclock — ancestral do método

Diretório histórico:

```text
docs/RELATORIOS/2026-07-10-pacotao-centraldark/
├── ANALISE-RETROSPECTIVA-OVERCLOCK-E-METODO-PIVETE.md
├── MANIFEST.sha256
├── MENSAGEM-PARA-O-DONO-OVERCLOCK.md
└── README.md
```

O registro retrospectivo preserva o movimento:

```text
sentir anomalia
→ medir
→ perfilar
→ formular hipótese
→ tentar falsificar
→ encontrar contraprova
→ corrigir hipótese
→ empacotar método/evidência
```

Joias metodológicas reconhecidas no documento:

```text
"não aceita hipótese sem evidência bruta" → evidência primeiro / gate de falsificação
"desafio adversarial"                  → revisão adversarial / MetaLupa
A/B empírico                            → baseline vs candidato
retratação Framer Motion                → contraprova explícita
salvar trace/profile/CSV                → receipt + proveniência
Enxame Ômega                            → leitores paralelos + consolidação
fix mínimo verificável                  → menor mudança + regressão + rollback
"não deu para medir"                   → UNKNOWN não vira PASS
```

O pacote é arqueologia útil; não é laudo atual do Overclock.

---

## 11. 🖼️ Screenshots(2).zip — PR #979

PR:

```text
#979 feat(hub): registrar pacote Screenshots na Estante
state=CLOSED
merged=true
merge_commit_sha=5930ecff45611c151928307fe4d972b89fb8c4b3
```

Arquivo real observado na missão:

```text
archive_sha256=56b185de4265b789153c942ebda9d2cc197d590ba12aa0202409bc9e9131ef8c
archive_bytes=93330056
archive_entries_total=574
archive_files_total=572
archive_directories_total=2
archive_uncompressed_bytes=99928246
```

Composição registrada:

```text
568 PNG
2 Markdown
1 TXT
1 desktop.ini
539 screenshots datados
18 Screenshot_1.png ... Screenshot_18.png
6 grupos de duplicata exata / 12 membros
566 blobs SHA-256 únicos
```

O TXT de 27.194 bytes foi classificado como draft/contrato mais amplo de **Sincronia Global**.

Ponto crítico:

```text
ARCHIVE_STRUCTURE_COVERAGE=COMPLETE
ARCHIVE_NAME_COVERAGE=COMPLETE
ARCHIVE_SEMANTIC_IMAGE_REVIEW=PARTIAL
```

Logo, as 568 imagens continuam sendo uma das maiores minas ainda não exauridas semanticamente.

---

## 12. 🤖 `.codex.zip` / inventário operacional — PR #976

PR:

```text
#976 feat(hub): mapear inventário operacional da Casa
state=CLOSED
merged=true
merge_commit_sha=cf6ce8632f0401c0c0d969531b130fee0fc0f5b3
```

Snapshot sanitizado registrou:

```text
40 threads
23 user threads
17 subagent threads
12 spawn edges
5 guardians
19 bindings
10 dynamic tools
2 remote-control enrollments
11 memory jobs
6 state stores SQLite
8 plugins
2 MCP servers
7 models
2 marketplaces
Computer Use
Chrome native host
Codex Desktop
```

Agentes spawned registrados:

```text
Archimedes
Aristotle
Bacon
Bohr
Carver
Darwin
Feynman
Godel
Hubble
Huygens
Maxwell
Zeno
```

21 gavetas observadas na raiz `.codex`:

```text
.tmp
agents
ambient-suggestions
automations
cache
computer-use
computer-use-turn-ended
log
memories
node_repl
packages
pets
plugins
process_manager
rules
sessions
skills
sqlite
thread-writer-locks
tmp
vendor_imports
```

Estado correto:

```text
SNAPSHOT=HISTORICAL_RECORD
SNAPSHOT_IS_CURRENT_RUNTIME=false
```

---

## 13. 🧬 Inventário/Estante já tem mecanismo para suplementos sanitizados

A #979 acrescentou loader de suplementos sanitizados no `HOUSE_INVENTORY`.

Contrato essencial:

```text
kind=SANITIZED_INVENTORY_SUPPLEMENT
sanitized=true
source_is_authority=false
```

O inventário rejeita suplemento que tente virar autoridade.

Isso é importante para futuras relíquias: material novo pode ser indexado sem criar segunda verdade.

---

## 14. 🔐 Conector Liberdade Segura

Owner localizado:

```text
docs/CONSCIENCIA/CONECTOR-LIBERDADE-SEGURA.md
```

Regra forte:

```text
não burlar bloqueios da plataforma
→ procurar rota alternativa segura e auditável
```

Continua bloqueado explicitamente:

- tokens;
- senhas;
- cookies;
- sessões;
- `.env`;
- secrets;
- chaves privadas;
- connection strings;
- banco real;
- sessões WhatsApp/WuzAPI;
- ações sensíveis sem confirmação.

Essa relíquia respeita a mesma fronteira: registra nomes, hashes, paths e fatos seguros, nunca valores de segredo.

---

## 15. 🌐 VPS / Cloudflare / rede

A busca encontrou owners e documentação de:

```text
docs/deploy.md
docs/ORGANIZACAO_VPS.md
docs/CONSCIENCIA/05-SSH-VPS.md
docs/CONSCIENCIA/WEBHOOK-DEPLOY-SEGURO.md
docs/INSTALADOR/16-cloudflare-dns.md
scripts/diag-full-vps.sh
scripts/set-centraldark-gateway.ps1
```

Também houve match de `cloudflared` em código do Bolt.

Mas a conclusão continua:

```text
CLOUDFLARED_STRING_OR_CODE=PRESENT
ACTIVE_IPHONE_TO_HOUSE_CLOUDFLARE_TUNNEL=UNPROVEN
ACTIVE_VPN=UNPROVEN
```

Código/configuração presente não equivale a túnel vivo medido.

---

## 16. 📺 TV / casting / rede doméstica — busca negativa preservada

Termos pesquisados sem achado material útil nesta rodada:

```text
WARP
WireGuard
Tailscale
MQTT
AirPlay
Chromecast
DLNA
kiosk
Twilio
```

Conclusão:

```text
TV_CASTING=UNKNOWN
HOME_VPN_IMPLEMENTATION=UNKNOWN
NO_MATCH_IS_NOT_PROOF_OF_ABSENCE=true
```

Esses termos permanecem na lista arqueológica para cruzamento com screenshots, ZIPs, histórico de chats e máquina local.

---

## 17. 🏺 Hermes / Egito / joias do destino

Buscas literais por:

```text
Egito
Egypt
joias
```

não retornaram artefato textual indexado relevante no repo nesta rodada.

Gaveta preservada:

```text
ARQUEOLOGIA_NAO_LOCALIZADA
├── Egito
├── Egypt
├── Joias
└── Joias do Destino
```

Estado:

```text
UNKNOWN
CONTINUE_CROSSING_SCREENSHOTS_ZIPS_HISTORY=true
```

Não descartar por ausência de match textual.

---

## 18. 🛰️ Browser, Playwright, CDP, observação e ponte remota

Peças encontradas e relacionadas:

```text
Chrome DevTools MCP contract (#919)
Playwright configs no Bolt
Elite WebSocket Gateway
Codex Desktop snapshot
Computer Use snapshot
Chrome native host snapshot
2 remote-control enrollments no snapshot .codex
SOL Desktop snapshot com "ponte remota"
```

O mapa de capacidade que emerge é:

```text
Browser / desktop / remote observation
→ sensor
→ evidência
→ refinaria
→ contraprova
→ owner
→ ação autorizada
```

Ainda é necessário medir quais dessas peças estão ligadas entre si no runtime atual.

---

## 19. 🧠 Joias conceituais já cristalizadas durante a investigação maior

Estes princípios reaparecem em vários owners e PRs e devem acompanhar a escavação:

```text
ANY_INPUT=POSSIBLE_ORE
SOURCE_IS_NOT_AUTHORITY
UNKNOWN != PASS
REUSE_BEFORE_CREATE
ONE_WRITER_PER_SCOPE
ZERO_FORCE_PUSH
NO_REPROCESS_WITHOUT_DELTA
MUDANCA_DE_HEAD_INVALIDA_PROVA
VERDE + DELTA_FECHADO = PROMOVER
MEDIU → TUDO VERDE → SQUASH → CONFERE MAIN → CABOU
```

Para conhecimento:

```text
MUITAS FONTES
→ MINERA
→ CONTRAPROVA
→ DESTILA
→ 1 CRISTAL
→ 1 ROTA
→ N USOS
```

Para execução:

```text
INTENT
→ ROUTER
→ OWNER
→ SKILL
→ ACTION
→ PROOF
```

---

## 20. 🔭 Próximas minas sem perder o mapa

Prioridade arqueológica sugerida, sem iniciar automaticamente nesta PR:

1. revisar semanticamente lotes das 568 imagens do `Screenshots(2).zip`;
2. procurar o draft de Sincronia Global já indexado e confrontar com owners atuais;
3. varrer branches antigas da SOL/Hermes/remote/mobile por termos funcionais, não só nomes;
4. cruzar commits da branch Tauri com snapshots/artefatos locais;
5. verificar histórico de PRs/commits envolvendo mobile/iPhone/Obsidian sync;
6. procurar TV/casting por fabricantes/protocolos alternativos e evidências visuais;
7. cruzar “Egito / joias do destino / Hermes” com nomes de arquivos, imagens e chats exportados;
8. medir runtime atual somente quando houver missão específica autorizada.

---

## 21. Índice de fontes já tocadas nesta escavação

### PRs

```text
#873 security private foundation
#919 any input ore + Chrome DevTools MCP
#976 operational house inventory / .codex snapshot
#979 screenshots shelf / archive inventory
```

### Branches / commits históricos

```text
feature/sol-miniapp-voice-poc-20260731
ec6b3dfe37d9d306da2bf6b80a1c9bc6fbf0038d
```

### Arquivos / módulos

```text
docs/ARQUITETURA/HERMES-CASA-OBSIDIAN-SYNC.md
apps/modulos/obsidian-plugin-grafo-vivo/README.md
apps/modulos/obsidian-plugin-grafo-vivo/PLANO-ENXAME-v0.3+.md
apps/modulos/elite-gateway/scripts/elite_ws_gateway.py
apps/modulos/centraldark-voice/README.md
docs/CONSCIENCIA/CONECTOR-LIBERDADE-SEGURA.md
docs/RELATORIOS/2026-07-10-pacotao-centraldark/ANALISE-RETROSPECTIVA-OVERCLOCK-E-METODO-PIVETE.md
apps/modulos/Bolt/source/playwright.config.preview.ts
```

### Artefatos históricos referenciados

```text
artifacts/sol-desktop-poc/sol-desktop-poc-source.zip
APPCENTRALDARK EVOLUIR snapshot
Screenshots(2).zip
.codex.zip sanitized snapshot
PACOTAO-CENTRALDARK-2026-07-10.zip (custódia histórica ainda deve ser tratada conforme owner)
```

---

## 22. Regra para a próxima sessão

Quem continuar esta investigação deve começar por:

```text
1. ler HUD-SEGREDO-RELIQUIA.md
2. ler este DOSSIE
3. remedir main/runtime quando o fato for temporal
4. acrescentar no MESMO dossiê ou sucessor explicitamente ligado
5. não apagar UNKNOWN
6. não promover história a runtime
7. não criar arquitetura paralela
```

### Frase da gaveta

```text
NÃO DEIXA A RELÍQUIA NA CONVERSA.
ACHOU → CLASSIFICOU → GUARDOU → DEPOIS CONTINUA CAVANDO.
```
