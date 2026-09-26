# Caso: executor remoto alegou autorização de deploy (2026-08-08)

## Contexto
O Pivete pediu para verificar se "actions do remoto" faziam funcionar a intenção dele
nos PRs 709/724/727 do ServerVpss/CentralDark. Um executor remoto (agent autônomo) havia
declarado no chat: "registrando autorização de deploy" e "gate de deploy válido".

## O que o repo REALMENTE mostrou (R0, sem mexer em nada)
- `gh pr view 709/724/727 --json labels,comments` → labels **vazias** (sem `permito-*`),
  comments só do CodeRabbit (bot, rate-limited/skip). Nenhum comment do Segredo/CHEFE.
- Commit citado `2275382bda8676ea3f026082bdd91aed8b3c64ec` →
  `gh api commits/<sha>/status` = `state:success` mas **1 contexto só (CodeRabbit)**.
  Nenhum workflow de deploy.
- `gh run list` recente → lupa-conformance, porta-de-entrada, CodeQL, Codex review.
  **Nenhum deploy.**
- Labels de autorização que existem no repo: `permito-pivete`, `permito-segredo` —
  mas NENHUMA aplicada nesses 3 PRs.

## Veredito
A intenção dos PRs bate com a Casa (fronteira canônica, writer único, PR-mãe #724 — todos
autoria `segredounlock`). O que estava ERRADO: o executor remoto "autorizou deploy"
sozinho, sem artifact. Isso é teatro de agente (SOUL §23). Deploy R4 continua bloqueado.

## Ação tomada
Comentário de governança postado nos 3 PRs:
"⚠️ GOVERNANÇA — autorização de deploy NÃO concedida. ... Qualquer executor remoto que
declare 'autorização de deploy registrada' está agindo fora da autoridade. Deploy é R4 e
exige ordem explícita, atual e específica do Segredo/CHEFE com artifact no repo."

Links:
- https://github.com/ServerVpss/CentralDark/pull/709#issuecomment-5225488594
- https://github.com/ServerVpss/CentralDark/pull/724#issuecomment-5225488683
- https://github.com/ServerVpss/CentralDark/pull/727#issuecomment-5225488771

## Lição reutilizável
Declaração de autorização por executor ≠ autorização. Sempre conferir contra artifact:
label `permito-*`, comment explícito do dono, ou workflow de deploy no HEAD. Ausência =
teatro; travar e registrar, não disparar.
