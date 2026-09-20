# PR-MÃE #1562 — DELTA DOS PACOTES + CENTRALDARK DESKTOP

Data: 2026-09-20

## Materiais recebidos

| pacote | SHA-256 | relação atual com CentralDark |
|---|---|---|
| `CentralDark-Remote-Tray-DETERMINISTICO(1).zip` | `243ca4bed69dc9f7637d74f0c823f532f7862162fa66275b91fafce554b2a0eb` | PARCIALMENTE ABSORVIDO |
| `CentralDark-Capability-Cristal-20260913-AGENTIC-SENIOR-UNIFIED-DETERMINISTIC.zip` | `8c093e15c1d8e0a72a60e0965bf1b76d0311d4f737e4c1b0539475b8aab0c2a1` | PARCIALMENTE ABSORVIDO |
| `CentralDark-Capability-Cristal-20260913-OMNI-INGEST-DETERMINISTIC-HARDENED.zip` | `ee70d1edfcba17137377f371dac9aa986bbdd6fa0a7b8c23216a9b87aaae4b36` | DELTA MATERIAL A ABSORVER |

## 1. Remote Tray

Já existem no organismo:

- `scripts/remote-bridge/canonical/REMOTE-TRAY-STATUS-CANONICO.md`
- `scripts/remote-bridge/canonical/remote-tray-status.json`
- instalador/update canônico do remote bridge;
- runtime manifest do Desktop Commander;
- contrato `PROCESS_ALIVE_IS_NOT_DEVICE_ONLINE`;
- serviços/watchdogs de Desktop Commander.

O ZIP recebido acrescenta uma implementação de tray Windows determinística com:

- mutex de instância única;
- estado/receipt JSON;
- ledger JSONL append-only;
- device auth automático;
- clipboard + browser para código;
- detecção de sessão stale;
- backoff de reconexão;
- supervisor contido.

Os marcadores específicos do wrapper, como `Local\CentralDarkRemoteBridgeTray`, não foram encontrados na árvore atual. Portanto o ZIP não é byte/feature-identical ao owner atual.

Classificação: `PARTIAL_ALREADY_ABSORBED + USEFUL_DELTA`.

## 2. Capability Crystal Agentic Senior

A CentralDark já possui Trigger Fabric, Signal→Territory→Capability→Crystal, Artifact Capability Adapter, Knowledge Compiler, Capability Router, Meta-Lupa e contratos de cristalização.

O pacote recebido adiciona explicitamente:

```text
ONE_INPUT_CAN_HAVE_N_CAPABILITIES=true
STOP_AFTER_FIRST_DELTA=false
CAPABILITY_ENUMERATION_REQUIRED=true
GAP_MAP_REQUIRED=true
NEGATIVE_KNOWLEDGE_REQUIRED=true
```

e um mapa de gaps de cockpit/runtime.

Esses marcadores exatos não foram encontrados na árvore atual.

Classificação: `SEMANTIC_CORE_EXISTS + DELTA_NOT_FULLY_ABSORBED`.

## 3. Omni Ingest Deterministic Hardened

O pacote contém `centraldark-omni-artifact-crystallizer` com:

- N-type classification;
- magic bytes;
- FILE / SKILL / PLUGIN / APP / PACKAGE_BUNDLE;
- provenance;
- SHA-256 dedupe;
- binary quarantine;
- archive path-traversal-name quarantine;
- no execution during classification;
- crystallization plan separado da promoção.

A árvore atual contém mecanismos próximos (`artifact-capability.mjs`, Trigger Fabric, Knowledge Compiler, Signal/Territory Crystal), mas não contém o bloco `41-OMNI-ARTIFACT-CRYSTALLIZER` nem seus marcadores/testes exatos.

Classificação: `NEW_MATERIAL_DELTA`.

## 4. Referência visual: workbench desktop no próprio app

A referência visual pedida é compatível com a arquitetura já existente da CentralDark Desktop.

Já existe no PR-mãe:

- `apps/modulos/Bolt/source/app/components/centraldark/CentralDarkCockpitShell.client.tsx`
  - sidebar;
  - sessão;
  - Casa/projeto;
  - palco central;
  - painel de estado à direita.
- `apps/modulos/Bolt/source/app/components/sidebar/Menu.client.tsx`
  - histórico de chats;
  - busca;
  - nova conversa;
  - duplicação/remoção.
- `apps/modulos/Bolt/source/app/components/workbench/Workbench.client.tsx`
  - bancada integrada.
- `EditorPanel.tsx`
  - layout editor + terminal.
- `DiffView.tsx`
  - diff.
- `Preview.tsx`
  - preview vivo.
- `TerminalTabs.tsx` + XTerm
  - terminais em abas.
- `apps/modulos/Bolt/source/docs/CENTRALDARK-DESKTOP.md`
  - mesma aplicação web empacotada em Electron/Windows.

### Gap para chegar à experiência visual completa

```text
EXISTS:
SIDEBAR
CHAT_HISTORY
COCKPIT
CODE
DIFF
PREVIEW
XTERM_UI
ELECTRON_DESKTOP
HERMES_BRIDGE
SCREENPIPE_SENSOR

MISSING_OR_PARTIAL:
LIVE_TASK_QUEUE_BACKEND
SESSION_MANAGER_BACKEND
NATIVE_LOCAL_PTY_BRIDGE
TASK_TO_WORKTREE_BINDING
TASK_TO_GITHUB_PR_BINDING
LIVE_EXECUTION_TIMELINE
ONE_CLICK_TASK_RESUME
OMNI_INGEST_FULL_ABSORPTION
```

Não criar outro aplicativo. Estender `CentralDark Desktop / Bolt / Cockpit` existente.

## Próximo delta material

1. absorver Omni Ingest no pipeline existente;
2. absorver o delta útil do Remote Tray no runtime Desktop existente;
3. ligar tarefas/sessões/worktrees reais ao Cockpit/Workbench;
4. expor Code/Diff/Preview/Terminal como uma única bancada;
5. integrar tudo ao contrato global e à cabine única.

`REFERENCE_UI != NEW_APP`
`PACKAGE_RECEIVED != ABSORBED`
`SEMANTIC_OVERLAP != BYTE_IDENTITY`
`REUSE_BEFORE_CREATE=true`
`ONE_SYSTEM_ONLY=true`
