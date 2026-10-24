# CentralDark — Instinto Superior sobre AionUi v2.2.2

## Intenção

Usar **AionUi v2.2.2** como casca/cockpit existente e manter a CentralDark como cérebro persistente.

Não criar segundo Hermes, segundo router nem segunda memória.

```text
AionUi / Electron / React
        ↓
AionCore existente
        +
CentralDark bootstrap
        ↓
repo CentralDark CURRENT
        ↓
HERMES-CORE existente
        ↓
MCP / Hub / Builder / Skills / Docs / Evidence
```

## Upstream fixado

- repo: `iOfficeAI/AionUi`
- tag: `v2.2.2`
- commit: `6744099b279b991c17e31c243f0920477bd31cb6`
- licença: Apache-2.0

O overlay preserva os avisos/licença do AionUi e muda somente o necessário para o protótipo CentralDark.

## Branding visível

- produto: `CentralDark — Instinto Superior`
- executable: `CentralDark-Instinto-Superior`
- appId: `com.centraldark.instintosuperior`
- protocolo: `centraldark://`

Internos `AIONUI_*` permanecem quando renomeá-los não traz benefício; isso reduz drift e quebra desnecessária.

## Runtime

No primeiro boot:

1. procura `CENTRALDARK_REPO_ROOT`;
2. depois `~/CentralDark`;
3. depois `<userData>/CentralDark`;
4. se existir seed empacotado, materializa em userData;
5. como último fallback, tenta clone do GitHub;
6. liga **o HERMES-CORE já existente** usando o Electron como runtime Node;
7. evita duplicar Hermes por PID vivo.

`ACTION != PROOF` · `UNKNOWN != PASS`.

## Build

```bash
./build-prototype.sh /tmp/aionui-v2.2.2 linux
```

Para um instalador cheio com o cérebro dentro:

```bash
CENTRALDARK_SEED_DIR=/caminho/SOURCE_SNAPSHOT/CentralDark \
./build-prototype.sh /tmp/aionui-v2.2.2 linux
```

O branch é de laboratório. Não altera o owner visual/main até o protótipo fechar build + boot + Hermes + readback.


## Bots / Agentes — Rakazo como capability

O cockpit agora reserva uma superfície nativa **Bots / Agentes**. Rakazo é executado como módulo subordinado da CentralDark; não vira cérebro, owner ou orquestrador paralelo.

```text
CentralDark
  ↓
Instinto Superior / AionUi
  ↓
Bots / Agentes
  ↓
Rakazo
  ├─ bots persistentes
  ├─ browser
  ├─ desktop
  ├─ terminal
  ├─ workers
  ├─ sandbox
  ├─ MCP
  ├─ memória
  └─ delegação
```

Bindings do protótipo:

- rota AionUi: `/settings/bots`
- Rakazo web: `25810`
- Rakazo API: `127.0.0.1:3100`
- root de runtime: `/opt/centraldark/rakazo`
- sandbox padrão: Docker
- receita de deploy: `install-rakazo.sh`

A página AionUi incorpora a superfície Rakazo por `iframe` e também oferece abertura direta. Em WebUI remota o host é herdado de `window.location.hostname`; no Electron/local cai para `127.0.0.1`.

`REUSE_BEFORE_CREATE=true` · `ONE_SYSTEM_ONLY=true` · `RAKAZO=CAPABILITY_NOT_SECOND_BRAIN`.


## Celestial / Mapas — uma casca, um store, cinco vistas

O AionUi expõe a rota nativa `/settings/maps` e incorpora o GraphPanel existente. O GraphPanel continua owner de renderização; AionUi é somente a casca/menu.

- vistas: `Galáxia`, `2D`, `3D/Celestial`, `Módulos`, `Vault`;
- peles: `emerald`, `operational`, `forge`;
- store cliente único: `gd`;
- API única: `/api/graph?mode=...`;
- preferências: `centraldark.graph.view` e `centraldark.graph.theme`;
- binding: `centraldark.graph.url`.

`GRAPH_IS_PROJECTION_NOT_AUTHORITY=true` · `ONE_SYSTEM_ONLY=true`.


<!-- CENTRALDARK_AIONUI_FULL_SHELL_K_20261021 -->
## 👑🪬 CHEFE · DELTA 2026-10-21 — AionUI original inteiro na identidade CentralDark

**INTENT_ID:** CENTRALDARK-SHELL-AIONUI-FULL-K-20261021.
**OWNER ORIGINAL:** este diretório do protótipo, previamente promovido pelo PR #1748; **OWNER DA ENTRADA VISUAL:** PR #1895, `apps/instinto-superior/src/components/central/CockpitShell.tsx`. É a mesma intenção e o mesmo Shell, não dois sistemas.

**Intenção explícita:** A Casa usa `K:\` como Forja e raiz operacional, `F:\` como armazenamento físico de caches, temporários, builds, worktrees isolados e arquivos brutos, e não aceita escritas intencionais da Forja em `C:\`. O CHEFE quer o **AionUI completo** (código Electron, renderer React, AionCore, tray com todas as funções, histórico e janelas) **recompilado sob a identidade CentralDark — Instinto Superior**, com ícone próprio no Harness e Obsidian original como módulo nativo. Não é um requisito de pacote pequeno ou produto comercial.

**Caminho de reuso:** `iOfficeAI/AionUi v2.2.2`, SHA `6744099b279b991c17e31c243f0920477bd31cb6`, Apache-2.0; `apply-overlay.py` e `build-prototype.sh` existentes; provas Linux do próprio owner. NÃO descompilar/reempacotar o `AionUI.exe` instalado quando os fontes oficiais já estão disponíveis. Retenção de avisos de terceiros e licença Apache obrigatória.

### Matriz de materialização — preservar funções originais

| Parte AionUI | Owner upstream | Delta correto | Prova atual |
| --- | --- | --- | --- |
| Tray: Mostrar, ocultar, novo chat, tarefas, pausar, atualização, sobre, reiniciar, sair | `packages/desktop/src/process/utils/tray.ts` | Preservar ações; trocar apenas tooltip + rótulos visíveis de marca no overlay | Overlay alterado no GitHub; Windows readback UNKNOWN |
| Menus e atalhos Electron | `packages/desktop/src/process/utils/appMenu.ts` | Preservar comportamentos, branding do binário via builder | Fonte mapeado, build Windows UNKNOWN |
| Janela, layout e editor | `packages/desktop/src/renderer/components/layout/*` | Logo, título, ícones, menus, espaço de trabalho CentralDark | Parte de branding histórica; paridade integral UNKNOWN |
| Backend AionCore e ferramentas | AionCore empacotado no upstream | Reutilizar instância, não criar segundo cérebro ou Hermes | Prova Linux histórica |
| Obsidian e vault | Owner Obsidian/Forja | Abrir app e usar memória canônica K: sem duplicar notas; janela inteira exige integração native-window validada | Launch source no PR #1895; embed UNKNOWN |
| Site local `127.0.0.1:8080` | `apps/instinto-superior` | Entrada Estúdio unificada e barra superior, sem confundir botão com app implantado | Patch source no PR #1895; runtime UNKNOWN |
| Instalador Windows | `build-prototype.sh` sobre snapshot upstream e electron-builder oficial | Build/artefatos transitórios exclusivamente em F:, prefixo/programa durável escolhido na Forja K:; hashes, backup, rollback e teste do pacote | NÃO EXECUTADO |

### Defesa de trabalho existente

A receita antiga usava `git reset --hard` e `git clean -fdx` dentro do source fornecido. Isso é incompatível com worktrees de agentes. A partir do delta atual, **recusa checkout sujo em vez de apagar**, exige SHA fixado e bloqueia destino `win` sem confirmação prévia do mapeamento K/F/C. O build só deve ser executado em staging descartável já autorizado no F:, com caches do Bun/Node, TEMP/TMP, dependências, outputs e logs controlados fora do C:.

O código do AionUI não precisa ficar copiado em duas árvores persistentes no K:. A versão fonte oficial pinned + overlay determinístico + pacote com identidade CentralDark satisfaz o objetivo de construção; o usuário final vê o aplicativo completo no Shell. **Lançar `AionUI.exe` por um botão ≠ compilar a variante CentralDark ≠ incorporar literalmente janela Win32 no DOM.** Cada etapa tem seu próprio teste e receipt.

### Gates e NEXT_CURSOR

1. Revalidar SHA/tag/licença upstream e diff sobre a versão fixada; reler o último receipt do protótipo.
2. Medir staging real em F:, perfis oficiais e caminho final no K:, sem alterar programas instalados ou Windows global. Conflitos não sobrescrevem obra de outro agente.
3. Reaplicar o overlay sobre checkout limpo com tag fixada; testar tooltip, menus, titlebar, protocolos, todas as funções anteriores e Apache notices.
4. Executar build Windows no host elegível e produzir instalador CentralDark, hash, log, versão, assinatura quando houver e rollback.
5. Materializar a variante **CentralDark** na Forja sem desinstalar o AionUI atual antes de contraprova e backup.
6. Integrar o Obsidian inteiro pela rota nativa existente; não confundir protocolo de abertura com integração literal de janela.
7. Provar app aberto no Windows, menu do tray, nova conversa, tarefas, pausa, atualização, Hermes, Obsidian, controle do Shell e site local com readback da mesma versão.
8. Publicar somente recibos e código de integração validados, nunca caches, segredos, sessões ou dados privados.

**Prova nesta escrita:** mapeamento upstream por leitura de source, alterações de overlay/build no branch do PR #1895, sem instalação, migração local, build Windows ou deploy. 
**NEXT_CURSOR:** `PR1895_HEAD → STAGING_F_PRECHECK → AIONUI_V2_2_2_OVERLAY → WINDOWS_BUILD → ARTIFACT_SHA256 → LOCAL_K_INSTALL_SAFE → TRAY_AND_UI_READBACK → OBSIDIAN_NATIVE → RECEIPT → FIXED_POINT`.
<!-- /CENTRALDARK_AIONUI_FULL_SHELL_K_20261021 -->
