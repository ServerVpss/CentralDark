# 👑 COMITÊ — candidato de teste local do dono

Data: 2026-09-05
Base: main@31363d48137e7e081fc4645d9fcf19f9316dcec8
Branch: release/local-owner-test-20260905
Intenção: consolidar o estado já incorporado à main em um PR único de validação local do dono, sem declarar runtime global como PASS.

## Veredito de maturidade

- Arquitetura / contratos: 95%
- Convergência de entrada única API/Omni: 90%
- Sentinela / CARACOL / observabilidade: 90%
- Desktop / SOL / site em uma mesma política: 85%
- Voz/TTS pela API oficial com fallback legado: 85%
- Grafo / Obsidian / memória / GARIMPO já cristalizado: 90%
- Runtime end-to-end atual: 80% estimado para TESTE_LOCAL_DO_DONO, não para produção comprovada

## O que já pode ser testado em casa

- CentralDark como porta única de modelos no modo normal.
- Omni Router com `/v1/chat/completions` e `/v1/responses`.
- failover de provider/modelo no código, incluindo modelo expirado, spending-limit e rota não configurada.
- Sentinela classificando falhas e voltando por META_LUPA → CARACOL_REVERSO → RECONCILIAR.
- Desktop/SOL projetando Omni como entrada central e E:\CentralDark como Casa operacional.
- extensão de voz tentando `api.centralldark.com/v1/audio/speech` antes do bridge legado.
- grafo/Obsidian e contratos de costura existentes no mesmo Segundo Cérebro.

## O que ainda impede carimbo de produção/global fixed point

1. gates do HEAD exato precisam sair de queued/pending e fechar PASS/FAIL.
2. provar runtime local do Omni no HEAD atual, inclusive fallback real com `fallback_used=true`.
3. provar `api.centralldark.com` desembocando no Omni atual para chat/responses.
4. provar build/execução do Desktop/.exe no mesmo SHA e conexão pelo Omni.
5. provar TTS end-to-end pelo endpoint oficial e fallback legado apenas quando necessário.
6. remedir Screenpipe/MCP atual; documentação histórica não vale como CURRENT.
7. medir fisicamente E:\CentralDark\_MAPA_CASA\GARIMPO-CHEFE para provar que nada novo ficou fora do repo.
8. confirmar que referências a worktrees históricos não estão alimentando CURRENT.
9. secret scan/gates determinísticos do HEAD exato precisam ser executados pelo runner.
10. qualquer UNKNOWN material permanece amarelo; MERGED != DEPLOYED.

## Política de teste

OWNER_LOCAL_TEST_READY=true
PRODUCTION_READY=false
GLOBAL_RUNTIME_FIXED_POINT=NOT_PROVEN
UNKNOWN_IS_NOT_PASS=true
CURRENT_GT_HISTORY=true
LOCAL_TEST_MAY_PROCEED_WITH_YELLOW_RESIDUALS=true
DESTRUCTIVE_ACTIONS_FORBIDDEN_DURING_LOCAL_TEST=true

## Trajetória

SEGREDO/CHEFE → #ACORDAR/GOAL → SENTINELA → EXISTING_OWNER → SOL → MULTIBÚSSOLA → META_LUPA → ONE_WRITER → HERMES → CONTRAPROVA → REMEDIÇÃO → REALITY_JUDGE → FIXED_POINT_LOCAL → RECEIPT/CURSOR → TESTE_LOCAL_DO_DONO

Qualquer falha material durante o teste: primeiro elo quebrado → META_LUPA → CARACOL_REVERSO → último cursor provado → reconcilia somente o cone causal → retesta.

## Lei final

80–95% aqui significa maturidade suficiente para o dono experimentar localmente com observação e reversibilidade. Não significa deploy global provado.
