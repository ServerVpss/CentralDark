# COMANDO - HUD-SEGREDO-RELIQUIA-20260816.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\docs\RELATORIOS\SEGREDO-RELIQUIA\HUD-SEGREDO-RELIQUIA-20260816.md
**SHA:** 8ff4f95ccf10aede
**Timestamp:** 2026-08-28T02:57:20.542263
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- - Regra: achado histórico não vira runtime atual automaticamente.

### Ouro Bruto (primeiros 5000 chars)
```
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
├── 20-INBOX
```