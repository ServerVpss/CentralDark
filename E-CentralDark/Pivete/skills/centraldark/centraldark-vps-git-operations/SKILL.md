---
name: centraldark-vps-git-operations
description: VPS git ops — chattr, lsattr, deploy, dependabot conflito.
---

# CentralDark VPS Git Operations

Operação do repo CentralDark na VPS (`/root/CentralDark`, via `ssh Segredo-VPS`). Complementa `centraldark-operational-discipline` (Regras 47/48/49).

Princípio: a VPS é do CHEFE. Ordem explícita = executa. Medir não é desculpa para não executar.

## CHATTR +I TRAVANDO DEPLOY

Sintoma: `git reset/checkout/stash` falha com `Operation not permitted` sem dizer que a causa é `chattr +i`.

### Filtro lsattr CORRETO (não conte a letra 'i' em qualquer lugar)

BUG CRÍTICO: `awk '$1 ~ /i/'` conta a letra `i` em **qualquer lugar** do path/nome → falsa contagem de 22k quando eram 9. O `i` real fica nas primeiras 9 posições do campo 1.

```bash
# Correto: só conta se o campo 1 tem formato de atributos E tem 'i' na posição certa
git ls-files -z | xargs -0 lsattr 2>/dev/null | awk '$1 ~ /^[-aAcCdDeEFijImNPsStTux]+$/ && $1 ~ /i/ {print $2}'
```

### O bug do 22k (2026-08-28)

`lsattr -R` cospe 371.609 linhas. 292.087 contêm a letra "i" em algum lugar — nomes de arquivo, outros atributos, cabeçalhos de pasta. Contar isso como "imutável" é o mesmo bug de filtro que eu tinha e que a revisão de código me obrigou a corrigir.

**NUNCA use `$1 ~ /i/` solto.** Medir o número REAL antes de sugerir `chattr -i` em massa.

### Origem cirúrgica (não acidente em massa)

Padrão conhecido: 9 arquivos, todos em `apps/modulos/HERMES-CORE/` (7 agents + decisor.mjs + cadeia.json). Isso é **trava deliberada durante crise de rebase**, não bug de script. O reflog mostra `rebase-merge` travado — o `chattr +i` foi colocado pra proteger os arquivos durante a crise.

### "Apaga tudo" — custo e backup

Quando o CHEFE diz "apaga tudo e refaz", medir o que está em jogo ANTES de executar. Ver `references/apaga-tudo-cost-analysis.md` (centraldark-vps-operations) para o padrão completo de backup.

Resumo:
- 132 `.env` (secrets, tokens, API keys) — NÃO estão no git
- 21 processos PM2 — config específica de cada um
- Âncora de rollback (`vps-pre-deploy-<timestamp>`) — recupera estado git

**Solução cirúrgica para drift git:** `git reset --hard origin/main` (não mexe em .env/PM2).

### Rebase-merge órfão (diretório velho, operação já abortada)

Se `.git/rebase-merge` existe mas `git status` não reporta rebase em andamento:
```bash
rm -rf .git/rebase-merge
```
Não é causa nem consequência do chattr — são independentes. O chattr bloqueia o deploy; o rebase-merge velho não bloqueia nada.

## DEPLOY DETERMINÍSTICO

Script: `scripts/vps/centraldark-deploy.sh` (repo).
- Dry-run: `bash scripts/vps/centraldark-deploy.sh`
- Apply: `bash scripts/vps/centraldark-deploy.sh --apply --aceitar-divergencia`
- CRLF Windows quebra bash remoto (`set: pipefail\r`). `sed -i 's/\r$//'` antes.

Ver `references/deploy-script-false-green-fix.md` (bug de falso-verde no script).

## DESKTOP SSH COMPATIBILITY VERIFICATION (cristalizado 2026-09-07)

O Hermes Desktop SSH mode exige que o Hermes remoto suporte as flags:
- `--ssh-session-token-file PATH`
- `--ssh-owner-nonce NONCE`

**Protocolo de verificação (executar na VPS via SSH):**

```bash
# 1. Verificar versão e método de instalação
hermes --version

# 2. Confirmar suporte às flags SSH Desktop
hermes serve --help | grep -A2 'ssh-session'

# 3. Se flags ausentes → Hermes remoto incompatível
#    Usar hermes update (detecta método de instalação)
#    Ou reinstall via instalador oficial se update falhar
hermes update

# 4. Após update: rodar doctor --fix
hermes doctor --fix

# 5. Provar compatibilidade: iniciar serve e testar handshake
nohup hermes serve --port 9119 --host 127.0.0.1 > /tmp/hermes-serve.log 2>&1 &
sleep 5
curl -s http://127.0.0.1:9119/status
# Resposta esperada: {"error":"Headless backend (hermes serve): web UI disabled — use `hermes dashboard` for the browser UI."}
```

**Sinais de incompatibilidade (log Desktop):**
```
Desktop boot failed: The remote Hermes install does not support --ssh-session-token-file and --ssh-owner-nonce. Update Hermes on the remote host to continue using Desktop SSH mode.
```

**Regra:** NÃO rodar `curl ... | sh` cego. Primeiro `doctor --fix` + detecção método + `hermes update`. A documentação oficial recomenda o doctor como diagnóstico/reparo e o update reconhece o método de instalação.

Ver `references/desktop-ssh-compatibility-verification.md` para detalhes completos.

### DEPLOYED_ONCE != DEPLOYED_NOW

O deploy foi provado no instante T. Se outro writer (ou o próprio agente em execução anterior) mexer no repo depois, o estado muda. Sempre re-medir antes de declarar DEPLOY_PROVADO.

Se a VPS não está mais no SHA da main após deploy:
- `DEPLOY_PROVADO_AS_<hora>=SIM`
- `DEPLOY_AINDA_VALIDO=NAO` se AFRENTE>0 ou branch != main
- Não "consertar" outro writer ativo — ONE_WRITER_PER_SCOPE

### "Apagar tudo e refazer" é destrutivo

Quando CHEFE diz "apaga tudo e refaz", medir o que está em jogo:
- Se os commits à frente são spam (bot de painel) → `git reset --hard origin/main` é seguro (nada real se perde)
- Se os commits à frente têm ouro do CHEFE → reset destrói trabalho insubstituível
- Sempre mostrar o diff antes de resetar

### Runtime sujo não é drift

Arquivos como `ai-diag.json`, `mcp-status.json`, `infra-vivo.json` são reescritos pelos serviços em runtime. Ter 2-7 modified é batimento cardíaco, não falha de deploy. Declarar "RASTREADOS_SUJOS=0" quando são 5 é otimismo; o certo é dizer "só ruído de runtime".

## CONFLITO DEPENDABOT / PR

Padrão único Casa: `.agents/skills/git-conflict-resolve-house-standard/SKILL.md`.
Motor: `dependabot-auto-merge.yml` + `scripts/dependabot/resolve-conflicts.sh`.
- "rebase não é merge squash" → `gh pr merge <n> --squash`.
- BUG resolver: `NO_CONFLICT` não empurra. Se GitHub still CONFLICTING: `git merge --no-ff origin/main && git push --force-with-lease origin <branch>`.
- Manual: `ssh Segredo-VPS "cd /root/CentralDark && git checkout main && git reset --hard origin/main && bash scripts/dependabot/resolve-conflicts.sh <PR>"`

### BUG CORRIGIDO — --ours cego (commit 9d31ebe4d)

O `git checkout --ours -- package.json` é cego — aceita o arquivo inteiro do PR,
perdendo mudanças da main que não são o bump. **CORRIGIDO:** o motor agora usa
merge inteligente com merge-base como referência (ver `references/ours-cego-bug-empirical-proof.md`).

Ver `references/vps-git-cookbook.md`.

## HARD GATES
- `chattr -i` em massa = HUMAN_FRONTIER, mas se CHEFE mandou "faz a massa", executa.
- Nunca `git clean -fdx`. Nunca force-push em main.

## Referências adicionais

- `references/apaga-tudo-cost-analysis.md` (centraldark-vps-operations) — custo de destruir VPS e backup antes de mutações destrutivas
- `references/ours-cego-bug-empirical-proof.md` — prova empírica do bug `--ours` cego no resolve-conflicts.sh e o fix correto
