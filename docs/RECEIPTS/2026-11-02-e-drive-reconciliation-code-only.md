# Reconciliação E: código útil sem cache — 2026-11-02

Status: `PARTIAL_DELETE_LOCKED`

## Owner

- Destino: `F:\CentralDark`
- Fonte histórica: `E:\CentralDark`
- Arquivo de reconciliação: `F:\CentralDark\_RECONCILIADO\2026-10-31-E-drive-reconciliation-final`

## Delta comprovado

- Origem: `E:\CentralDark\CentralDark\2026-11-02`
- Destino: `F:\CentralDark\_RECONCILIADO\2026-10-31-E-drive-reconciliation-final\CentralDark\CentralDark\2026-11-02`
- Arquivos úteis preservados: `212`
- Arquivos ausentes após cópia: `0`
- Hashes divergentes: `0`
- Diretórios de cache no delta: `0`

## Conteúdo excluído do arquivo

Dependências baixáveis, cache, builds, temporários e junctions: `node_modules`, `.pnpm`, `.cache`, `cache`, `Code Cache`, `GPUCache`, `DawnGraphiteCache`, `DawnWebGPUCache`, `dist`, `build`, `out`, `coverage`, `tmp`, `temp`.

Pastas de código como `apps/modulos`, `MODULES`, `src`, `scripts` e `tests` não foram descartadas por nome.

## Estado de publicação

- `origin/main` observado antes da atualização: `23eab6c04c3801b059c7fb6d460efe814c7e0263`
- O checkout local antigo foi preservado em `preserve/local-auto-sync-2026-10-31` e não foi promovido.
- Teste de presença: `PASS`.
- Teste de readback/hash do delta: `PASS`.
- `origin/main` atual após reconciliação externa: `24afe336df9fbeb056d9ce0d4eda4a83ac8f3cad`.
- Arquivos restantes em `E:\CentralDark` após remoção recuperável: `0`.
- Estado restante: somente diretórios vazios; `E:\CentralDark\CentralDark\2026-11-02\referenced-chatgpt-conversation-this-is-an` continua aberto por processo externo.
- Remoção de `E:\CentralDark`: `PARTIAL`; o caminho ainda existe e não foi falsamente marcado como concluído.
- Próxima ação: liberar o processo que mantém o diretório aberto e repetir a remoção dos diretórios vazios; depois comprovar `Test-Path E:\CentralDark = False`.
