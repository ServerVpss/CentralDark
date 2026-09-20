# PR-MÃE #1562 — AUDITORIA END-TO-END DA SESSÃO 2026-09-20

## Intenção

Revisar os erros cometidos nesta sessão do início ao fim, corrigir imediatamente o que é corrigível e deixar explícito o que ainda depende de runtime/absorção.

## Estado vivo de referência

- MAIN no início desta auditoria: `64aa2cd2e21e7e16a16001d353ec3b9545e4cc06`
- MAIN após correção do contrato: `73bb785c4e3c01fda676df70c11bb6252850df15`
- VPS observada: `d539bb47c44e8aaa23634dfa13ac59ba93b6ada7`
- PR-mãe antes desta auditoria: `f6b63327564ead4f4227f9531905928e0cc69c79`
- PR-mãe vs main medido: `DIVERGED`, ahead 135 / behind 74 antes das novas escritas de ledger
- Casa: dispositivos `SEGREDO` offline durante esta auditoria; estado atual da Casa = UNKNOWN

## Erros da sessão e correção

| # | erro | classificação | correção/estado |
|---:|---|---|---|
| 1 | imagem conceitual apresentada depois do pedido de visual sem primeiro renderizar o frontend real | OVERCLAIM | corrigido semanticamente; mockup != screenshot real |
| 2 | inferência visual baseada em apenas 4 medições | UNDER-MEASURED | corrigido por leitura de App/landing/theme/routes/runtime |
| 3 | contagem `126` tratada como se fosse denominador canônico | INVENTED_METRIC | retirada como verdade global; cobertura só vale quando contrato define universo |
| 4 | `grill-me` aplicado antes do deploy apesar da ordem operacional pedida | ORDER_VIOLATION | regra corrigida: execução primeiro, grill/counterproof depois |
| 5 | confusão entre “3 peles” visuais e 3 superfícies web/portal/telepainel | SEMANTIC_MISREAD | 3 peles visuais pertencem à mesma cabine/app; superfícies não equivalem a temas |
| 6 | pressuposição de root Caddy em `/root/CentralDark/apps/web/dist` | RUNTIME_MISREAD | produção foi corrigida para `/var/www/*`; servir direto de /root causou 403 |
| 7 | tentativa de servir Caddy por caminho em `/root` | EXECUTION_ERROR | corrigido para `/var/www/centraldark`, `/var/www/portal-centraldark`, `/var/www/telepainel-centraldark` |
| 8 | erro de quoting/variável `$host` durante contraprova | COMMAND_BUG | comando refeita e hashes de origin validados |
| 9 | HTTP 200 usado cedo demais como prova de conteúdo correto | FALSE_GREEN_RISK | prova posterior passou a usar hash/asset esperado |
| 10 | `FIXED_POINT=PASS` dito sem escopo temporal explícito | TEMPORAL_OVERCLAIM | fixed point passa a ser HEAD/runtime/timestamp scoped |
| 11 | recomendação de runner Windows da Casa sem acesso vivo à Casa | INFERENCE_NOT_MEASUREMENT | Casa ficou UNKNOWN; recomendação não é prova de runner instalado |
| 12 | comando `hermes desktop` fornecido sem provar CLI/sintaxe na Casa | UNVERIFIED_COMMAND | retraído como comando comprovado; deve ser medido quando Casa voltar online |
| 13 | inventário do PR-mãe congelado em 613 branches | STALE_SNAPSHOT | remedição atual: 616 branches, 27 PRs, 109 issues |
| 14 | frase “tudo está no PR-mãe” apesar de #1562 estar divergente da main | OVERCLAIM | corrigido: ledger aponta tudo; branch não contém fisicamente todos os commits da main |
| 15 | confusão entre “indexado no PR-mãe” e “delta absorvido/mergeado” | SEMANTIC_OVERCLAIM | regra cristalizada: INVENTORY != ABSORPTION != MERGE |
| 16 | Remote Tray inicialmente tratado como ausente; main depois recebeu implementação canônica | HISTORY_AS_CURRENT | estado atual vence: engine/parser/harness existem agora na main |
| 17 | OmniRouter avaliado num runtime antigo e depois tratado como estado estático | STALE_RUNTIME | main atual modificou `centraldark_omni_router.py`; runtime VPS ainda precisa alcançar a main para prova atual |
| 18 | Admin/cabine tratado como arquitetura futura sem reconhecer suficientemente Bolt/Cockpit/Workbench existentes | REUSE_MISS | corrigido: CentralDark Desktop/Bolt é a casca a estender; não criar segundo app |
| 19 | limpeza da Biblioteca declarada como “110,6 MB liberados” embora delete mova para lixeira | QUOTA_OVERCLAIM | correção: 45 arquivos / 110,6 MB foram movidos para a lixeira; liberação física da cota = UNKNOWN até atualização/purge |
| 20 | varredura da Biblioteca limitada a 2000 itens/10 páginas | INCOMPLETE_SCAN | resultado da limpeza não deve ser chamado de biblioteca inteira |
| 21 | contrato global escrito e depois quebrado por erro estrutural JSON na main | REAL_DEFECT | corrigido em `73bb785c4e3c01fda676df70c11bb6252850df15` |
| 22 | contrato global chamado de validado antes de executar o validador canônico contra HEAD atual | PROOF_ORDER_ERROR | corrigido: TLC23 self-test 9/9 PASS + `validar-continuidade-global.mjs` ok=true no HEAD `73bb785...` |
| 23 | VPS chamada de “atualizada” enquanto main continuou avançando | TEMPORAL_DRIFT | estado atual medido: VPS `d539bb...`, origin/main `64aa2cd...` antes da correção de contrato; DEPLOY_CURRENT=FALSE |
| 24 | excesso de owner/ator/modelo/denominador quando o contrato do Chefe é global e origem-independente | INTERACTION_CONTRACT_VIOLATION | contrato global mantém `origin_is_not_architecture=true`; resposta operacional deve focar sistema/resultado |

## Prova da correção global

No HEAD `73bb785c4e3c01fda676df70c11bb6252850df15`:

```text
TLC23_SELF_TEST=PASS
TLC23_TESTS=9
GLOBAL_CONTRACT_VALIDATOR_OK=true
GLOBAL_CONTRACT_ERRORS=[]
GLOBAL_SCOPE=GLOBAL
GLOBAL_TEMPORAL_SCOPE=CONTINUOUS
COUNTERPROOF=PASS
```

## Passivo ainda real

```text
VPS_HEAD != MAIN_HEAD
CASA_CURRENT = UNKNOWN
PR_MOTHER != MAIN (DIVERGED)
ADMIN_COCKPIT_FULL_INTEGRATION != PROVED
OMNI_RUNTIME_CURRENT != PROVED
LIBRARY_PHYSICAL_QUOTA_RELEASE != PROVED
HERMES_DESKTOP_LOCAL_LAUNCH_COMMAND != PROVED
```

Esses itens não são convertidos em PASS por documentação.
