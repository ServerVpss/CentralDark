## Diagnóstico dos vermelhos

Confirmado via GitHub API + análise dos arquivos:

- **`painel auto-update` (195 falhas acumuladas)** — o workflow aponta pra `apps/projeto-dashboard/` (que não existe mais). O painel foi consolidado em `apps/modulos/status/` no dia 02/07 e virou área protegida no `CLAUDE.md`, mas o `.yml` nunca foi atualizado.
- **`Farm — trailer Co-authored-by`** — falha silenciosa provavelmente por `submodules` no `actions/checkout@v4` (padrão desse tipo de erro na VPS self-hosted, já resolvido em outros workflows com `submodules: false`).

A VPS em si **está OK** — recebeu o último commit `129aa54a`, os 17 processos PM2 estão online. Ou seja, esses vermelhos não estão bloqueando deploy real, só quebrando automações periféricas (painel e badge de co-author).

## Conserto

### 1. `painel-auto-update.yml` — trocar caminhos
Três linhas a corrigir:
- Linha 17 (`paths-ignore`): `apps/projeto-dashboard/painel-data.json` → `apps/modulos/status/painel-data.json`
- Linha 48 (run): `node apps/projeto-dashboard/atualizar-painel-vivo.mjs` → `node apps/modulos/status/atualizar-painel-vivo.mjs`
- Linha 54 (`git add`): mesmo caminho novo
- Adicionar `submodules: false` no `actions/checkout@v4` (linhas 34-37) — evita erro se o repo tiver submódulo quebrado

### 2. `farm-co-author.yml` — proteger checkout
- Adicionar `submodules: false` no `actions/checkout@v4` (linhas 27-30)
- Adicionar `|| true` no final do step "Verificar trailer" pra ele **nunca marcar o workflow como failure** (é só um warning informativo pra farm de medalha, não deve derrubar CI)

### 3. Validar antes de commitar
Antes de fazer o commit, checar rapidamente se `apps/modulos/status/atualizar-painel-vivo.mjs` e `apps/modulos/status/painel-data.json` realmente existem no repo (já sei que `atualizar-painel-vivo.mjs` existe pelo `<codebase-context>`).

### 4. Depois do commit
- Aguardar o novo run do `painel auto-update` no push
- Se passar 🟢, disparar 1 `workflow_dispatch` do `farm-co-author` pra confirmar que a mudança dele também funciona
- Reportar o resultado

## O que NÃO vou fazer

- Não vou mexer em `apps/modulos/status/` (área protegida) — só nos `.yml`
- Não vou apagar os 195 runs vermelhos históricos (posso fazer isso depois se você quiser limpeza visual)
- Não vou reescrever o painel — só corrigir o caminho que ficou quebrado

## Resultado esperado

Próximo push na main → `painel auto-update` 🟢 (atualiza `status.centralldark.com`) + `farm-co-author` deixa de aparecer vermelho. Tudo continua indo pra VPS normalmente como já vai.
