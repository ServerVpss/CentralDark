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
