# 🧿 CentralDark Installer Deterministic Beta 1

**Versão:** `0.1.0-beta.1`  
**Data:** `2026-09-09`  
**Owner canônico da instalação:** `install.sh`  
**Princípio:** `REUSE_BEFORE_CREATE=true` / `ONE_SYSTEM_ONLY=true`

## Intenção

O instalador continua funcional em ambiente novo sem provider de IA, token ou serviço opcional. Ausência opcional não pode matar o menu nem produzir falso-verde.

## Lei de estado

- 🟢 `PROVED`: ação executada e pós-condição medida.
- 🔵 `READY`: capacidade disponível, ainda não provada no alvo.
- 🟡 `SETUP`: configuração humana/credencial necessária.
- 🟠 `BLOCKED`: pré-requisito obrigatório impediu a ação.
- ⚪ `OPTIONAL`: ausência aceitável.
- 🟣 `UNKNOWN`: evidência insuficiente.

`ACTION != PROOF` e `UNKNOWN != PASS`.

## PDF/Horn obrigatório

Fonte operacional: **Lógica Computacional 23 — Nelma Moreira**.

```text
SOURCE_SHA256=b4e2a0655b7e0c85ca329c33971b377299dde6358779270c573f014f3aa606d1
METHOD=HORN_FORWARD_CHAINING_TO_FIXED_POINT
```

No instalador, a adaptação mínima é:

```text
OWNER_PRESENT
→ REUSE_REQUIRED
→ EXTEND_EXISTING

OWNER_GAP
→ BLOCKED_OWNER_GAP
→ MEASURE

nunca:
OWNER_GAP → CREATE_PARALLEL_INSTALLER
```

A propagação termina quando nenhum fato material novo aparece. Isso é **fixed point no escopo**, não verdade absoluta.

## Camadas

```text
CENTRALDARK PRODUCT
        ↓
DETERMINISTIC INSTALLER CORE
        ├─ probes puros
        ├─ state machine
        ├─ Horn owner gate
        ├─ menu/wizard
        └─ proof-after-action
        ↓
install.sh CANÔNICO
        ├─ VPS/base
        ├─ pastas
        ├─ MCP
        ├─ Cloudflare/DNS
        ├─ dependências
        └─ serviços existentes
```

O Beta 1 orquestra e mede o `install.sh`; não duplica suas rotinas.

## Providerless / tokenless

```text
SEM PROVIDER
→ OPTIONAL
→ menu continua

SEM CLOUDFLARE TOKEN
→ SETUP
→ DNS APPLY bloqueado
→ restante continua
```

## CentralDark Full Bundle

```text
CentralDark Full Bundle
├─ VPS/Base
├─ CentralDark CLI
├─ Site/Apps
├─ MCP / Router
├─ Hermes / HERMES-CORE
├─ Obsidian Grafo Vivo
├─ Remote Bridge / Tray
├─ Observatory / Harness
└─ manifest + checksums + receipts
```

`COMPONENT_UPDATED != FULL_PACKAGE_PROVED`.

## Ciclo

```text
component update
→ REUSE/EXTEND owner existente
→ manifest candidate
→ staged install
→ self-tests
→ integration probes
→ counterproof
→ receipt
→ FULL release
```

## Owners reconhecidos

- VPS/infra: `install.sh`.
- MCP: `apps/modulos/mcp` + instalador canônico.
- Hermes: `apps/modulos/HERMES-CORE`.
- Obsidian: `apps/modulos/obsidian-plugin-grafo-vivo`.
- Remote: lineage existente do Remote Bridge/Tray.

`site/apps/CLI` permanece `OWNER_GAP` enquanto seus owners canônicos não forem medidos. Horn bloqueia criação paralela nesse caso.

## Gate de promoção

1. `bash -n` PASS.
2. providerless PASS.
3. tokenless PASS.
4. owner/Horn PASS.
5. pós-probes sem falso-verde.
6. compatibilidade com `install.sh` provada em sandbox/VPS.
7. só então integrar como entrada oficial.

Até 6/7: **candidato cristalizado, não runtime globalmente provado**.
