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
