# ⏰ Central de horário da CentralDark

Owner único de data/hora para a Casa.

## Contrato

```text
TIMEZONE_HUMANO=America/Sao_Paulo
LOCALE_HUMANO=pt-BR
DISPLAY_LABEL=BRT
ARMAZENAMENTO_MAQUINA=UTC_RFC3339
```

### Regra

- Tudo que é **mostrado a pessoa** (painel, Telegram, alerta, log legível, relatório humano, título de issue) usa `America/Sao_Paulo` e mostra `BRT`.
- Tudo que é **timestamp técnico de máquina** (BD, auditoria, ordenação, protocolos, `created_at`, `updated_at`, ledger, assinatura temporal) continua em UTC/RFC3339.
- Nenhum componente deve depender do fuso local do navegador, Windows, Linux, container ou VPS para exibir hora.
- `UTC != HORA_ERRADA`: UTC é correto para armazenamento/prova. O erro é exibir UTC como se fosse hora de Brasília.

## Entradas

- `node.cjs` — CommonJS.
- `node.mjs` — ESM, reexporta `node.cjs`.
- `frontend.ts` — browser/React/TypeScript.
- `python.py` — Python 3 com `zoneinfo`.
- `powershell.ps1` — PowerShell 7/Windows PowerShell compatível.
- `shell.sh` — shell/Linux.

## Formato humano padrão

`DD/MM/AAAA HH:mm:ss BRT`

## Invariantes

```text
HUMAN_TIME_REQUIRES_BRASILIA_TZ=true
MACHINE_TIME_STAYS_UTC=true
SERVER_LOCAL_TZ_IS_NOT_AUTHORITY=true
BROWSER_LOCAL_TZ_IS_NOT_AUTHORITY=true
UNKNOWN_TIME_SOURCE_IS_NOT_PASS=true
```

## Receita executável — `final_report` rastreável

Relatório humano/receipt não termina apenas com data civil. O mesmo instante deve carregar a projeção humana e a âncora técnica:

```text
FINAL_REPORT_TIME_FIELDS_REQUIRED=true
FINAL_REPORT_DATE_FIELD=DD/MM/AAAA HH:mm:ss BRT
FINAL_REPORT_DATE_UTC_FIELD=UTC_RFC3339
FINAL_REPORT_DATE_ONLY_IS_INSUFFICIENT=true
FINAL_REPORT_TIME_RECIPE=central-horario.finalReportTimeHeader
```

Em Node/ESM:

```js
import { finalReportTimeHeader } from './central-horario/node.mjs';

console.log(finalReportTimeHeader());
// Date: DD/MM/AAAA HH:mm:ss BRT
// Date-UTC: YYYY-MM-DDTHH:mm:ss.sssZ
```

Os dois campos representam o **mesmo instante**. `Date` é leitura humana em Brasília; `Date-UTC` é correlação/ordenação/auditoria de máquina. Não derivar um campo em chamada de relógio diferente da usada pelo outro.

## Escopo global permanente

`central-horario/` é o único owner de tempo para toda a CentralDark: Casa, VPS, HUB, MCP, Hermes, Gateway, automações, agentes, superfícies atuais e arquitetura futura.

```text
ONE_TIME_SYSTEM_ONLY=true
CANONICAL_TIME_OWNER=central-horario
FUTURE_COMPONENTS_MUST_REUSE_CANONICAL_TIME_OWNER=true
PARALLEL_TIME_SYSTEM_FORBIDDEN=true
LEGACY_TIME_DEBT_MUST_BE_VISIBLE=true
NEW_TIME_DRIFT_IS_BLOCKING=true
```

O gate varre o repositório inteiro. Dívida histórica permanece explícita e não vira falso-verde; qualquer novo delta que introduza hora fora deste owner é bloqueado. Corrigir legado significa migrá-lo para este mesmo owner, nunca criar outro sistema de horário.

## Contrato de apresentação humana — cristal global

A intenção do CHEFE é aplicada por **semântica de destino**, não pelo relógio local do executor:

```text
HUMAN_TIME_PRIMARY_DISPLAY=DD/MM/AAAA HH:mm:ss BRT
HUMAN_TIME_PRIMARY_TIMEZONE=America/Sao_Paulo
HUMAN_TIME_PRIMARY_LOCALE=pt-BR
HUMAN_TIME_FORMATTER_OUTSIDE_CANONICAL_OWNER=CONTRACT_VIOLATION
ISO_UTC_AS_PRIMARY_HUMAN_DISPLAY=FORBIDDEN
TECHNICAL_UTC_MAY_EXIST_AS_SECONDARY_MACHINE_FIELD=true
SELO_HUD_RECEIPT_ALERT_TELEGRAM_REPORT_USE_CANONICAL_HUMAN_TIME=true
GLOBAL_TIME_SCAN_DELTA_RATCHET_REQUIRED=true
DOCUMENTED_TIME_RULE_WITH_BROKEN_GATE=FAIL
```

Aplicação:
- **Selo Fabric, HUD, receipts, alertas, Telegram, painéis e relatórios para o CHEFE** mostram Brasília no formato brasileiro.
- **Banco, API, ordenação, assinatura, TTL, auditoria e correlação de máquina** mantêm UTC/RFC3339 quando esse é o contrato técnico.
- Se uma superfície humana também precisar do instante técnico, UTC entra como campo secundário explicitamente rotulado; nunca substitui a hora humana.
- O fiscal `scripts/lupa/validar-horario-centraldark.mjs` usa **delta ratchet**: dívida histórica fica visível, mas novo desvio bloqueia o HEAD que o introduziu.
