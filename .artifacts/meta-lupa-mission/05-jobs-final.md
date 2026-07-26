# Jobs — prova final

Perfil: `pivete`

| Job | ID | Direto | Trigger now | Histórico novo | Correção |
|---|---|---:|---:|---|---|
| gateway-watchdog | f2b5b0d232bc | PASS | PASS | b21cc200ef43493e939f6741cc8f88df `completed` | wrapper Python chama Git Bash explícito |
| atualizar-manual-sessao | 231f7061a4f3 | PASS | PASS | db43939026614129a65ae639be083bee `completed` | wrapper Python chama Git Bash explícito |
| atualizar-mapa-hermes | 2be95a87d7d5 | PASS | PASS | acf4a283dcc74a8fb23f899645f09408 `completed` | wrapper Python chama Git Bash explícito |
| GATE0-destilar-3-temp | 256eb36b2f3b | PASS | PASS | e641525b0570432eb21cfba4e227a03b `completed` | script canônico v7 + pin local free |

JOBS_REPAIRED=4/4
JOBS_SCHEDULED_FINAL=4/4
DIRECT_TESTS=4/4
TRIGGER_TESTS=4/4
UNAUTHORIZED_SPEND=NAO
GLOBAL_PROVIDER_MODEL_UNCHANGED=SIM

O provider/model global permaneceu `openai-codex/gpt-5.6-sol`. Somente o GATE0 foi fixado em `openrouter/nvidia/nemotron-3-nano-30b-a3b:free`, após resposta local comprovada.

Arquivos locais alterados:

- `profiles/pivete/jobs.json`
- quatro wrappers `.py` em `profiles/pivete/scripts/`
- script global `scripts/destilar-3-temp.sh`

Backup e rollback: `C:\tmp\meta-lupa-mission-20260726-123037\jobs`.

O teste de antepor Git Bash ao PATH do gateway não alterou o shell escolhido pelo scheduler e foi revertido. A correção efetiva ficou nos wrappers explícitos.
