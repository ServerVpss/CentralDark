# Deploy Script Gotchas (2026-08-28)

Lições aprendidas na sessão — erros que o script de deploy cometeu e foram corrigidos.

## 1. `git checkout origin/main -- .` NUNCA move o HEAD

**Erro:** O script usava `git checkout origin/main -- .` pra "sincronizar" a VPS com a main, depois declarava `DEPLOY_PROVADO` quando `SHA_VPS == origin/main`. Mas `checkout origin/main -- .` só copia o conteúdo dos arquivos pro working tree — **não move o HEAD**. A prova era estruturalmente impossível.

**Correção:** Usar `git reset --hard origin/main` (que move o HEAD) ou `git pull --ff-only origin/main`.

**Lei:** `LEI_ESCRITA_NO_CABECALHO != LEI_IMPLEMENTADA_NO_CORPO`

## 2. chattr +i bloqueia deploy — são 9 arquivos, não 5

**Erro:** Repetimos "5 arquivos travados" a sessão inteira. O script mediu e descobriu **9**:
- `apps/modulos/HERMES-CORE/agents/Universal-Handler/agent.mjs`
- `apps/modulos/HERMES-CORE/agents/Auto-Diagnostico/agent.mjs`
- `apps/modulos/HERMES-CORE/agents/GraphRAG-Master/agent.mjs`
- `apps/modulos/HERMES-CORE/agents/Critic/agent.mjs`
- `apps/modulos/HERMES-CORE/agents/Knowledge-Collector/agent.mjs`
- `apps/modulos/HERMES-CORE/agents/Executor/agent.mjs`
- `apps/modulos/HERMES-CORE/agents/Deploy-Watcher/agent.mjs`
- `apps/modulos/HERMES-CORE/core/decisor.mjs`
- `apps/modulos/HERMES-CORE/core/cadeia.json`

**Correção:** Script agora filtra só rastreados (`git ls-files | xargs lsattr`) e falha com `IMUTAVEL_BLOQUEIA_DEPLOY` (exit 12) listando os bloqueados.

**Lei:** `ARQUIVO_CONGELADO_NA_VPS != ESTADO_CANÔNICO` — o chattr +i protegeu esses arquivos de corromperem, mas também os impediu de evoluir.

## 3. Dependabot: `groups` sem `applies-to` cobre só `version-updates`

**Erro:** PR #1277 agrupou, 13 conflitos sumiram, pareceu curado. Não estava — voltaram 15. Causa: `groups` sem `applies-to` cobre só `version-updates`. Os 201 alertas do Bolt/source eram `security-updates`, que ignoram o grupo.

**Correção:** `applies-to: security-updates` obrigatório no `dependabot.yml`.

**Lei:** `SINTOMA_SUMIU != CAUSA_RESOLVIDA`

## 4. `python: command not found` no runner self-hosted

**Erro:** Todo gate Python da Trigger Fabric morria com exit 127 porque o runner tinha `python3` mas não `python` no PATH.

**Correção:** `ln -s /usr/bin/python3 /usr/local/bin/python` (reversível com `rm`).

## 5. Rebase travado de outro processo

**Erro:** `.git/rebase-merge` existia na VPS de outro processo (não esta sessão). Tentar `git rebase` falha com "already a rebase-merge directory".

**Correção:** `git rebase --abort` (se for seguro) ou não tocar (ONE_WRITER_PER_SCOPE). Verificar `git status` antes de qualquer operação mutável.

## 6. `MERGED != DEPLOYED` — sempre medir o SHA real

**Erro:** Confiar no status "MERGED" da API do GitHub. O merge pode ter acontecido, mas a VPS não foi atualizada.

**Correção:** Após merge, medir `git rev-parse HEAD` na VPS e comparar com `git rev-parse origin/main`. Só declarar `DEPLOY_PROVADO` quando os SHA baterem.

## 7. Arquivo MAIOR não é MAIS NOVO

**Erro:** O GraphRAG-Master/agent.mjs da VPS tinha 199 linhas vs 158 da main. Parecia "mais novo", mas era linhagem anterior — faltavam `classificarCicloMestre` e `selfTest`.

**Correção:** Comparar conteúdo/funcionalidade, não contagem de linhas. `node --check` + testes reais como prova.
