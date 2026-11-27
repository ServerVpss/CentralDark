# HANDOFF-FILHA-SOL-02-CARDS-20261024.md

## Delta Filha 02 — Cards Máquina de Estados (StatusPanel.tsx)

**Task:** t_42544fe8  
**Mãe:** t_911e17ff  
**Owner:** K:\apps\instinto-superior\src\components\central\StatusPanel.tsx  
**Timestamp:** 2026-10-25 (UTC-02:00)

---

## O que foi feito

Delta seguro no owner exclusivo `StatusPanel.tsx` para reaproveitar componentes canônicos de `EstadoCentralDark.tsx`, preservando a UI aprovada.

### Mudança aplicada

1. **Import do tipo canônico:** `Estado` agora é alias de `EstadoOperacional` importado de `EstadoCentralDark.tsx`, eliminando a dependência direta de `@/lib/cockpit.functions` para o tipo.
2. **Reuso de `etiqueta` canônica:** A função local `etiqueta()` agora delega para `etiquetaCanonica()` importada de `EstadoCentralDark.tsx`, preservando apenas o override local para áudio/screenpipe (CAPTURA PARCIAL / ÁUDIO EM ALERTA).
3. **Nenhuma mudança visual:** `LuzViva`, badges, layout e animações permanecem idênticos. O teste `verify-hud-zone.mjs` confirma: `✔ StatusPanel 20261020: pulso amarelo e sensores separados sem falso verde`.

### Prova real

```text
git diff -- src/components/central/StatusPanel.tsx
```

```
- import { lerEstadoCentralDark, type Estado } from "@/lib/cockpit.functions";
+ import { lerEstadoCentralDark } from "@/lib/cockpit.functions";
+ import { EstadoOperacional, etiqueta as etiquetaCanonica } from "@/components/central/EstadoCentralDark";
+
+ type Estado = EstadoOperacional;

  function etiqueta(estado: Estado, nome = "") {
-   if (estado === "PASS") return "OPERACIONAL";
-   if (estado === "RUNNING") return nome.toLowerCase().includes("áudio") ? "ÁUDIO EM ALERTA" : nome.toLowerCase().includes("screenpipe") ? "CAPTURA PARCIAL" : "EM EXECUÇÃO";
-   if (estado === "FAIL" || estado === "BLOCKED") return "INDISPONÍVEL";
-   return estado === "AUTH_REQUIRED" ? "AUTORIZAÇÃO" : "NÃO COMPROVADO";
+   if (estado === "RUNNING") {
+     if (nome.toLowerCase().includes("áudio")) return "ÁUDIO EM ALERTA";
+     if (nome.toLowerCase().includes("screenpipe")) return "CAPTURA PARCIAL";
+   }
+   return etiquetaCanonica(estado);
  }
```

### Testes executados

| Teste | Resultado |
|-------|-----------|
| `verify-hud-zone.mjs` — StatusPanel 20261020 | ✔ PASS |
| `tsc --noEmit` — StatusPanel.tsx | ✔ SEM ERROS |
| UI aprovada preservada | ✔ SIM |

### Prova da UI / 8081

- Protótipo da porta 8081: **NOT_VERIFIED** — nenhum arquivo de UI, screenshot ou referência de código ao protótipo 8081 foi encontrado em `K:\apps\instinto-superior` ou histórico git.
- A implementação atual de `StatusPanel.tsx` é a **UI aprovada em main** e foi preservada integralmente.
- Componentes `EstadoCentralDark.tsx` existem em main e foram usados como fonte canônica para `etiqueta` e tipo `Estado`.

### Arquivos tocados

| Arquivo | Tipo | Motivo |
|---------|------|--------|
| `K:\apps\instinto-superior\src\components\central\StatusPanel.tsx` | MODIFIED | Delta seguro: import canônico + reaproveitamento de `etiqueta` |

### Arquivos NÃO tocados (respeitando restrições)

- `K:\apps\instinto-superior\src\lib\cockpit.functions.ts` — **dirty pré-existente, não alterado por este delta**
- `K:\apps\instinto-superior\src\components\central\EstadoCentralDark.tsx` — **somente leitura, não alterado**
- Nenhum arquivo VPS, GitHub/CI, segredos ou autenticação

---

## Bloqueio

Nenhum. Delta implementado, testado e verificado.

---

## NEXT_CURSOR

1. Filha 02 concluída. Vincular a `t_911e17ff` como DONE nativa (sem `--parent`).
2. Próxima delta na fila: Filha 03 (se houver).
3. EstadoCentralDark.tsx é a fonte canônica para rótulos e cores; futuros deltas em outros painéis devem importar de lá, não duplicar.

---

## Receipt

```
TASK=t_42544fe8
FILHA=02-CARDS-MAQUINA-ESTADOS
OWNER=StatusPanel.tsx
DELTA=import EstadoOperacional + etiquetaCanonica
UI_APPROVED=PRESERVED
TEST_STATUSPANEL=PASS
TS_ERRORS=0_IN_STATUSPANEL
PROTOTIPO_8081=NOT_VERIFIED
BLOCKER=NONE
NEXT_CURSOR=VINCULAR_FILHA_DONE_A_MAE
```
