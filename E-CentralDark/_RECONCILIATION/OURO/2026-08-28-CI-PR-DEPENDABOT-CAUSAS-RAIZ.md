# !REGISTRA — CI, PRs e Dependabot: quatro causas-raiz

```text
MISSION_ID=CI_PR_DEPENDABOT_ROOTCAUSE_20260828
REGISTERED_AT=2026-08-28
WRITER=Claude Code
MODE=INVESTIGACAO + REMEDIACAO PARCIAL
```

## O que estava acontecendo

Cinco PRs abertos, quatro em conflito, CI vermelho em todos, e 201 alertas
Dependabot sem nenhum PR de correção. Parecia problema de conteúdo dos PRs.
Não era. Eram **quatro causas-raiz independentes**, todas fora dos PRs.

## Causa 1 — runner sem `python` (infra)

```text
T0: python: command not found  -> exit 127 em TODO gate da Trigger Fabric
```

O runner self-hosted tinha `python3` (3.10.12) mas **não** `python`. Todo gate
que chamava `python ...` morria antes de rodar uma linha.

```text
REMEDIACAO: ln -sf /usr/bin/python3 /usr/local/bin/python
T1: PR #1223 saiu de 5 pass -> 14 pass
REVERSIVEL: rm /usr/local/bin/python
```

## Causa 2 — contrato de título de PR (governança)

`.github/workflows/pr-title-contract.yml` exige **emoji + texto todo em
maiúsculo**. Os 5 PRs abertos violavam. Não é bug: é contrato.

```text
PROVA: PR #1246, aberto com titulo no formato -> validate-title = PASS
```

Corrigir os títulos dos PRs existentes exige `gh pr edit`, que foi **bloqueado
por permissão** nesta sessão. Fronteira registrada, não contornada.

## Causa 3 — PR carregando validador velho

O gate lê `scripts/lupa/validar-continuidade-global.mjs`. A main tem o fix
`stripComments` (que ignora comentários ao procurar comando proibido); PRs
criados antes dele **não têm**. Sem o fix, o gate lê a linha de comentário
`# - ZERO rebase -X ours` como se fosse comando real e acusa
`MAIN_WRITER_SHARED_FORBIDDEN_FORCE` em 4 workflows.

```text
PROVA: grep -c stripComments  ->  PR #1223 = 0  |  main = 2
CORRECAO: sincronizar a branch com a main (nao aplicada — recusada pelo CHEFE)
```

## Causa 4 — SyntaxError commitado na main (a mais grave)

`apps/modulos/HERMES-CORE/agents/GraphRAG-Master/agent.mjs` tinha **merge
malfeito commitado**: dois trechos duplicados, um `} catch {}` fechando o `try`
cedo demais, statements órfãos, e um segundo `} catch` sem `try`.

O arquivo não parseava -> `continuity-guard.test.mjs` falhava -> o gate
"Porta, identidade e governança canônica estão íntegras?" reprovava
**em todo PR aberto**, independente do conteúdo do PR.

```text
T0: node --check = SyntaxError (linha 112, depois 142)
    continuity-guard.test.mjs = 0 pass / 1 fail
T1: node --check = PASS
    continuity-guard.test.mjs = 34 pass / 0 fail
DELTA: 8 linhas removidas, 0 adicionadas
PR: #1247
```

## Dependabot — 201 alertas, zero PRs

Não era throttling nem Dependabot quebrado (ele cria e mergeia PRs
normalmente na raiz). Era **escopo de configuração ausente**.

```text
Medido com --paginate (a 1a medicao usou per_page=100 SEM --paginate
e ficou capada em 100 — erro meu, corrigido no 2o commit):

182  apps/modulos/Bolt/source/pnpm-lock.yaml    -> npm
 13  apps/modulos/Bolt/source/package.json      -> npm
  6  apps/modulos/Bolt/source/docs/poetry.lock  -> pip
---
201  total, 100% em Bolt/source
```

`.github/dependabot.yml` só declarava `directory: "/"`. O diretório nunca foi
vigiado, então nenhum PR de correção era criado — mesmo com fix disponível na
maioria. Estendido o arquivo existente (`REUSE_BEFORE_CREATE`) com duas
entradas: `npm` em `/apps/modulos/Bolt/source` e `pip` em `.../docs`. PR #1246.

## Gargalo de capacidade (não corrigido, decisão do CHEFE)

```text
VPS: 8 nucleos, load average 8.85 (saturado)
Disputa de CPU: dockerd 194%, mcpo 100%, ruby 92%
Runner: UM so, jobs em serie -> fila de 16 checks demora
Servico duplicado failed desde 2026-07-10 (antigo, nao e o ativo)
```

CI não está quebrado — está **faminto**. Nada foi morto nem reiniciado.

## Fronteiras encontradas (não contornadas)

```text
gh pr edit ............... bloqueado por permissao (2x)
sincronizar #1223 ........ recusado pelo CHEFE
.git/rebase-merge ........ rebase pendente de OUTRO writer -> nao tocado
chattr +i (5 arquivos) ... trava da VPS mantida; corrigida a FONTE no repo
conflitos reais .......... #1228 #1227 #1221 #1211 (update-branch falha nos 4)
```

## T1 — resultado medido depois do merge

`#1246` e `#1247` foram mergeados (03:30 e 03:39 UTC).

```text
MAIN_AGENT_SYNTAX ............ FAIL -> PASS
continuity-guard.test.mjs .... 0/1 -> 34 pass / 0 fail   (na main, nao no meu branch)
Dependabot PRs em Bolt/source ... 0 -> 6 (e subindo)
```

Destino dos 5 PRs que estavam travados:

```text
#1223 MERGED   (18:24Z) — destravado por python-symlink + update-branch
#1221 MERGED   (16:18Z)
#1227 CLOSED   — branch de resgate, ver abaixo
#1211 CLOSED
#1228 ABERTO   — conflito real, unico remanescente
```

## Resgate da VPS — falso alarme, nada perdido

`#1227` carregava 6 commits reais achados entre 3206 do bot de painel
(2 do SEGREDO/CHEFE + 4 do memory-executor). Foi fechado sem merge, o que
parecia perda. Não era:

```text
git diff origin/main origin/rescue-... -- <os 2 arquivos>  ->  VAZIO
```

O conteúdo dos 2 commits do CHEFE (`vps-exec-selfhosted.yml` +
`vps-housekeeping-scan.mjs`) já estava **integralmente na main**, chegado por
outro caminho. A branch `rescue-vps-housekeeping-and-memory-fixes` continua no
remoto como seguro que não precisou ser sacado.

Erro meu no meio do caminho: a primeira checagem disse "AUSENTE NA MAIN" porque
o MSYS converteu o path com `:` no Git Bash do Windows. `MSYS_NO_PATHCONV=1`
desmentiu. Mesma armadilha já vista antes nesta casa.

## Fila de CI — o gargalo que sobrou

```text
262 runs queued  |  1 in_progress  |  1 runner self-hosted
```

Não é falha, é capacidade. Os checks demoram porque a fila é serial e a VPS
está com CPU saturada. Nada foi morto nem reiniciado.

## Lição que sobrevive fora do caso

```text
CI_VERMELHO != CULPA_DO_PR
```

Quatro causas, nenhuma dentro dos PRs: falta de binário no runner, contrato de
título, defasagem de validador, e código quebrado na própria main. Antes de
mexer no conteúdo de um PR, medir se a base está sã — senão você conserta o
que não estava quebrado e o vermelho continua.

E: `per_page=100` sem `--paginate` mente calado. Medi 100, eram 201.
Contraprova achou meu próprio erro antes de virar afirmação falsa.
