# PR-MÃE #1562 — INVENTÁRIO GLOBAL VIVO

## Contrato global na main

O contrato canônico existente foi estendido; nenhum contrato paralelo foi criado.

- owner canônico: `docs/CONSCIENCIA/CONTRATO-RECONCILIACAO-ANTES-DE-CRIAR.json`
- commit do contrato na main: `e3e605a2497c7e822f06384e7bc0c962986f37e4`
- commit do enforcement na main: `de5e8cab08392d9887603b469121056fc3b28094`
- marker: `GLOBAL_EVERYTHING_INTO_CENTRALDARK`

## Exigência global cristalizada

- origem não cria arquitetura;
- uma letra, arquivo inteiro ou pacote inteiro é entrada válida;
- todo delta útil é absorvido na CentralDark existente;
- adição, remoção, atualização e substituição usam o mesmo contrato global;
- `centralldark.com` é o site público;
- `admin.centralldark.com` é a cabine única, alcançável pela internet e acessível somente ao dono autenticado;
- Hermes, Grok/outros modelos, MCP/tools, routing/OmniRoute, Grafo, BRAIN, Skills, GitHub, VPS/Casa, deploy, logs, contas, evidências, preview e missões convergem para a mesma cabine;
- nenhum agente/modelo/origem recebe contrato próprio;
- componentes atuais e futuros herdam o mesmo contrato.

## Inventário pendente apontado ao #1562

| classe | quantidade | arquivo |
|---|---:|---|
| branches do repositório | **613** | `docs/CONSCIENCIA/PR-MAE-1562-BRANCHES-GLOBAL.md` |
| PRs abertos | **27** | `docs/CONSCIENCIA/PR-MAE-1562-PRS-ABERTOS-GLOBAL.md` |
| issues abertas | **109** | `docs/CONSCIENCIA/PR-MAE-1562-ISSUES-ABERTAS-GLOBAL.md` |

## Sem perda silenciosa

Inventário não significa que código de 613 branches foi mergeado cegamente. Cada branch está registrada com HEAD e vínculo de PR aberto quando existe. O delta útil deve convergir para a CentralDark antes de branch/PR/issue ser encerrado ou removido.

## Commits do ledger no PR-mãe

- branches: `0b488a1a43f1f2c7f17902f8a72e565cfa3a268d`
- PRs abertos: `df200ee3754e12cae4bbaa2d6b26df5b8b79d3f8`
- issues abertas: `91d3c67e3025c2829d24414bad2c17bf0db14b9a`

Este arquivo é a entrada única para a varredura/absorção do passivo do repositório no PR-mãe #1562.


## Aprendizado calibrado da sessão — 2026-09-21

Estado medido no momento do registro:

- main atual: `70b49964f77288d80864b52e5d692580660e60a7`;
- PR #1614: MERGED em main;
- PR #1562: PR-mãe / rendezvous permanente / não mergear;
- TLC23_PDF_BOOT_GATE: registrado no universal gate registry;
- owner preservado: Meta-Lupa + Meta-Grill + Fable + HERMES universal method + Fixed Point;
- nenhuma arquitetura paralela criada.

Padrão canônico consolidado:

- examinar tudo;
- contraprovar;
- reconciliar;
- reter somente o delta que sobrevive;
- aceitar não substitui prova;
- prova válida + fingerprint causal igual = REUSE_PROOF;
- mudança material invalida somente o cone causal afetado;
- mesmo achado sem nova evidência = DROP_DUPLICATE;
- nenhum ganho material = NO_CHANGE;
- UNKNOWN != PASS;
- ACTION != PROOF;
- DOCUMENTED != EXECUTED;
- MERGED != DEPLOYED;
- REUSE_BEFORE_CREATE;
- ONE_SYSTEM_ONLY.

Fast-path de prova:

- alvo/owner/inputs/config/artefato/fronteira de segurança inalterados → reutilizar prova existente;
- premissa material alterada → tornar stale somente claims dependentes;
- revalidar somente os gates/claims do cone afetado;
- não rerodar o universo por mudança localizada.

Promoção / squash:

- gates materiais aplicáveis controlam promoção;
- workflow informativo não bloqueia sozinho;
- resultado mais novo do mesmo gate vence resultado histórico;
- sync/conflito resolvido não equivale a aprovação;
- squash é promoção do delta provado, não remédio para conflito.

Runner / Actions — aprendizado observado nesta sessão:

- tentativa de rerun enquanto o workflow ainda está rodando pode retornar `403 This workflow is already running`;
- esse fato é CANDIDATO A PADRÃO, não verdade global automática;
- mecanismo candidato: antes de rerun, medir estado do run; se ainda ativo, acompanhar; após conclusão, rerodar somente jobs realmente falhos;
- só promover esse candidato a regra canônica após reprodução + contraprova.

Interface humana:

- erro local não equivale a falha global;
- vermelho localizado deve gerar aviso simples, owner/alvo exato e próximo passo;
- observabilidade informa; não transforma sensor isolado em crise do sistema.

Coordenação:

- CHEFE = autoridade de intenção;
- SOL = coordenação/reconciliação;
- Ian/Geoff/Greg/Dex = lentes/personas funcionais quando úteis, sem voto de verdade;
- Hermes = executor;
- Realidade = juiz;
- Buzz = colaboração/event-view/HUD, não novo cérebro.

Histórico citado nesta sessão:

- #733 e #813/#814/#815 permanecem exemplos históricos de promoção determinística;
- janelas 3/3 e 9/9 observadas são evidência histórica do conjunto medido, não garantia causal universal;
- personas nomeadas não devem ser declaradas causa desses sucessos sem prova temporal/causal.

Voz:

- entrada por voz foi utilizada com sucesso nesta sessão para intenção → ferramenta GitHub → resposta;
- prova existente deve ser reutilizada enquanto rota/provider/autenticação/entrada/consumidor/runtime relevantes permanecerem equivalentes;
- mudança material reabre somente a peça afetada.

Princípio final:

`PROVA_EXISTENTE → REUSE`
`DELTA_MATERIAL → TARGETED_REVALIDATION`
`MESMO_ACHADO_SEM_NOVA_EVIDÊNCIA → DROP_DUPLICATE`
`REALIDADE → JUIZ`

Fonte conceitual TLC23 usada nesta sessão: “Examinai tudo. Retende o bem.” A operacionalização na CentralDark é exame + contraprova + reconciliação + retenção do delta sobrevivente.
