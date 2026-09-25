# BOOT PIVETE — Ponte do Claude para a Constituição Universal

Este arquivo é um complemento específico do Claude. Ele não substitui `CLAUDE.md`.

Antes de qualquer ação:

1. Abra ou inspecione `pivete/dev`.
2. Leia `00-COMECE-AQUI-IA.md`.
3. Leia **integralmente** `CLAUDE.md` como Constituição universal de todas as IAs.
4. Leia `AGENTS.md`.
5. Leia `docs/GOVERNANCA/HIERARQUIA-INSTRUCOES-IA.md`.
6. Leia `docs/COFRE/README.md`.
7. Execute o BOOT operacional em `docs/GOVERNANCA/BOOT-IA.md`.
8. Leia `docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/REGRA-MICRO-DEPLOY-CONTINUO-POR-PASS-COMPROVADO.md`.
9. Leia `docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/MICRO-DEPLOY-CONTINUO-BINDING.yml`.
10. Confirme branch do workspace, ref inspecionada, SHA, ambiente, escopo, riscos, testes, prova e rollback.
11. Não altere nada antes de concluir o BOOT operacional.

A Baseline de Defesa da Seção 0 de `CLAUDE.md` é obrigatória.

A regra de micro-deploy contínuo por PASS comprovado também é obrigatória:

```text
QUALQUER_PASS_COMPROVADO
→ MICRO_DEPLOY_DO_ESCOPO_AFETADO
→ HEALTH_OU_PROVA_RUNTIME
→ RECEIPT_PR_MAE
→ NEXT_TIK_TAK

UNKNOWN != PASS
MERGED != DEPLOYED
DOCUMENTED != EXECUTED
PASS_VISUAL_BADGE_ONLY=false
ACTION_REQUIRED_IS_NOT_PASS=true
NO_BLIND_PULL_OVER_DIRTY_RUNTIME=true
```

Se uma frente Claude comprovar PASS em escopo material, ela deve avançar somente esse escopo, medir runtime/health quando aplicável, registrar receipt e continuar no `NEXT_TIK_TAK`. Essa regra não autoriza restart global, segredo, force-push ou mutação fora do escopo.

`docs/PROTOCOLO-BOOT.md` é complementar para memória e continuidade da sessão; não substitui a Constituição nem o BOOT operacional.

O fluxo é:

```text
pivete/dev → PR → pivete/auditoria → PR → main
```

GitHub é a fonte da verdade. VPS DEV/AUDIT é ambiente remoto autorizado. Produção executa apenas SHA aprovado. Nada entra cru.


## HUD/RUDY — retorno obrigatório em cada nova conversa

Depois do BOOT e antes de apresentar um novo placar, recuperar no PR-mãe #1562 o HUD/RUDY mais recente e revalidar CURRENT. Não recriar o HUD.

```text
HUD_RUDY_BOOT_REQUIRED=true
HUD_RUDY_RETURN_ON_EVERY_NEW_CENTRALDARK_CONVERSATION=true
HUD_RUDY_REMEASURE_CURRENT_BEFORE_RENDER=true
HUD_RUDY_FIXED_CARD_IDS=H01..H16
HUD_RUDY_ONLY_STATUS_EVIDENCE_PERCENT_CHANGE=true
UNKNOWN_IS_NOT_GREEN=true
EVERY_HUD_NOVELTY_FEEDS_PR_MOTHER_1562=true
```

H01..H16 mantêm identidade e ordem. Uma pesquisa muda somente cor/status, prova e porcentagem; classe material realmente nova deve ser registrada antes de ganhar novo ID. O percentual global é recalculado sobre o CURRENT, nunca herdado como PASS.


### Entrada híbrida
```text
HUD_RUDY_HYBRID_ENTRY_REQUIRED=true
HUD_RUDY_ACTIVATE_ON_MCP_CONNECTION=true
HUD_RUDY_ACTIVATE_ON_REPO_CONTEXT=true
HUD_RUDY_MCP_OR_REPO_IS_SUFFICIENT=true
HUD_RUDY_MCP_HANDSHAKE_INSTRUCTIONS_REQUIRED=true
HUD_RUDY_REPO_BOOT_REQUIRED=true
HUD_RUDY_BOT_ENTRY_REQUIRED=true
HUD_RUDY_FIRST_OPERATIONAL_RESPONSE_REQUIRED=true
```
MCP oficial OU contexto do repositório é suficiente para exigir o mesmo HUD/RUDY na primeira resposta operacional. Se os dois estiverem disponíveis, reconciliar as provas; nunca criar segundo HUD.
