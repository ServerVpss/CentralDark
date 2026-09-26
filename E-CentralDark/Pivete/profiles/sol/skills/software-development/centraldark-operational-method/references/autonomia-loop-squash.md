# Autonomia, Loop e Coordenação — SEGREDO/CHEFE (sessão 2026-08-26)

## Quando o CHEFE autoriza explicitamente
Frases como "prossiga em loop e não volte", "só faz", "não me pergunte mais",
"PERMITO SEGREDO", "PERMITO PIVETE" = autorização ampla de execução.
- NÃO perguntar confirmação a cada passo. Executar e provar.
- Loop autônomo em background é aceitável (ver `scripts/squash-loop.sh`).

## Coordenação multi-agente ("paz e amor, várias canetas uma só direção")
Múltiplos agentes/janelas operando no mesmo repo: NÃO invadir branch alheio,
NÃO brigar por writer.
- Conflito em PR do Dependabot → comente `@dependabot rebase` (o dono do branch
  cura). NUNCA push manual em branch `dependabot/*` (anti-padrão + briga).
- Squash de PR `MERGEABLE` é operação atômica do GitHub (não escrita
  concorrente) → seguro mesmo com várias janelas. Se dois agentes squasharem o
  mesmo PR, o segundo falha graceful (GitHub impede double-merge).

## Evidência de merge quando branch protection está OFF
Medido 2026-08-26: `main.protected=false` (repo privado sem GitHub Pro →
API branch-protection retorna 403; `protected:false` confirma ausência).
- GitHub habilita o botão "Squash and merge" mesmo com checks `QUEUED`/`SKIPPED`
  (UI: "Some checks haven't completed yet" + botão verde).
- Screenshot do GitHub mostrando "No conflicts with base branch" + botão
  "Squash and merge" HABILITADO = evidência válida de mergeabilidade REAL.
  (Usuário: "fica em loop amarelo não significa nada, vê o botão".)
- Regra prática: `mergeable: MERGEABLE` + botão verde na UI = pode squashar,
  mesmo que `mergeStateStatus` esteja `UNSTABLE`/`UNKNOWN` e checks não verdes.
- CONTRAPROVA obrigatória: medir `gh pr view <n> --json mergeable` (esperado
  `MERGEABLE`) ANTES de squashar. `CONFLICTING` = parar
  (erro "GraphQL: Pull Request has merge conflicts").
- NÃO confundir com repo COM protection: lá, required status checks bloqueiam e
  QUEUED ≠ PASS vale rigidamente.

## Labels canônicas em PR (reforço)
Todo PR CentralDark DEVE ter `👑 PERMITO-SEGREDO` + `🧠 AGENTE-HERMES` + categoria
válida existente no remoto. `gh pr edit --remove-label` aceita 1 label por
chamada. Verificar existência via `gh api repos/ServerVpss/CentralDark/labels`.
Labels órfãs (ex: `🤖 IA-EXECUTAR` que não existe no remoto) devem ser removidas.
