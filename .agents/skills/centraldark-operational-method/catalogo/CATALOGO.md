# CATÁLOGO CANÔNICO CENTRALDARK — uma skill, vários módulos reutilizados

**Owner único:** `centraldark-operational-method`. Cópias importadas com SHA-256; originais preservados para manter compatibilidade.

## Roteamento por intenção

1. Ler o pedido atual: **AÇÃO**, **ALVO**, **AMBIENTE**, **CRITÉRIO DE ACEITE**.
2. Resolver `WORKSPACE_ALVO` a partir da intenção — nunca fixar C:\root ou /root.
3. Escolher o **executor** local da Casa (Windows) ou da VPS (Linux); validar que está presente no host correto.
4. Consultar `hermes kanban assignees` e escolher perfil realmente disponível.
5. Carregar **Kimetsu Remix + 17 Respirações** antes de execução material e escolher a respiração pela condição observada, não por estética.
6. Escolher modelo, provedor **e reasoning effort** por evidência da tarefa; distinguir default do perfil, override por cartão e preset de sessão/Desktop.
7. Despachar com **`hermes kanban create`**. A descrição da missão determina se a ação é criar, remover, editar ou verificar.
8. Conferir `kanban show`, `kanban runs`, `reasoning_effort` quando disponível e o **efeito real no ambiente-alvo**.

**Ordem de autoridade para Hermes Desktop/CLI/Kanban:** consultar primeiro o GitHub/documentação oficial `NousResearch/hermes-agent`; depois medir a versão instalada (`hermes --version`), o help local e o estado/config/schema da Casa. Nunca promover comportamento do upstream a capacidade local sem confronto de versão.

**Receita parametrizada e detalhada:** [Hermes Kanban universal](../references/HERMES-KANBAN-RECEITA-UNIVERSAL.md).

**HANDOFF DA MIGRAÇÃO CENTRALDARK-REMOTE PARA PRÓXIMO AGENTE:** [leitura canônica do handoff](../references/HANDOFF-CENTRALDARK-REMOTE-20261024.md). Continuar o cartão `t_5b386368` conforme estado vivo, preservar a missão antiga bloqueada como prova de preflight e não reexecutar o instalador nem disputar os arquivos do worker. A intenção do CHEFE é comum às contas; cada conta precisa consultar o mesmo arquivo de transição.

**HUD ESTILO GAME FIXO V1:** ao apresentar o placar Michelin, preservar integralmente a moldura de linhas duplas do ultimo HUD aprovado pelo usuario (cabecalho, missao, ambiente, barra 100%, painel com 13 resultados historicos, inventario, duas missoes, tres estrelas e rodape). Um unico quadro; nenhuma lista gigante; evolucao so aditiva. Metricas de missoes futuras dependem de readback real. Contrato registrado no SKILL.md canônico.

**Gatilho `!michelin` — skill Michelin 3 estrelas:** [SKILL.md](skills-integradas/michelin-3-estrelas/SKILL.md) + [protocolo detalhado](../references/MICHELIN-3-ESTRELAS-PROTOCOLO.md), carregados junto da receita da intenção. Fases **construir → integrar → provar**, testes e contraprova sem substituir o comando que já funcionou. Fonte histórica preservada: `docs/LEMBRANCAS/metodo-chefe-conformidade-michelin-20261019.md`; registro de aprendizado: `docs/CONSCIENCIA/APRENDIZADOS/2026-10-24-MICHELIN-3-ESTRELAS-SKILL-HERMES-CASA.md`. Hierarquia constitucional: `docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/SOUL-SOL.md`. Selo limitado ao escopo executado.

## Rotas existentes

| Destino | Executor | Perfil | Modelo |
|---|---|---|---|
| Casa Windows | `C:\Users\Administrador\AppData\Local\hermes\bin\hermes.exe` | `default` foi comprovado na Casa | NVIDIA Nemotron comprovado; outros só após medir |
| VPS Linux | `/root/.hermes/hermes-agent/.hermes/bin/hermes` | Descobrir no host VPS | Descobrir e testar no host VPS |

O caminho VPS consta do script existente `K:\scripts\vps\neurolink-gateway-dispatch.sh`. **Leitura ao vivo:** `test -x /root/.hermes/hermes-agent/.hermes/bin/hermes` retornou `VPS_HERMES_CLI=FOUND` em 24/10/2026. Isso comprova o binário, **não** comprova perfil, provedor ou workspace na VPS; conferir esses três antes de despachar.

## Provedores medidos

| Provedor/modelo | Situação | Observação |
|---|---|---|
| `nvidia` / `nvidia/nemotron-3-ultra-550b-a55b` | **PASS Casa** | Missões de criação `t_2805243c` e remoção `t_26e02a16` concluídas |
| `custom` / `jann` (túnel Cloudflare) | **FAIL observado** | `APIConnectionError` no teste anterior, exigir nova prova |
| Qualquer outro | **UNKNOWN** | Permitido se configurado e comprovado; não declarar disponível sem teste |

## Módulos incorporados e método Michelin convertido

A skill Michelin é uma operacionalização de uma Lembrança histórica preservada. O catálogo agora contém cópias das **17 capacidades CentralDark** encontradas nos diretórios especializados (`12` no nível principal, `2` em `devops`, `3` em `software-development`). Dessas, `16` têm `SKILL.md` e uma (`centraldark-auto-sync-vscode`) contém um manifesto `package.json`. O método central permanece no `SKILL.md` da Skill-Mãe. Os scripts e as referências específicos de cada módulo ficam dentro da sua pasta integrada. **Cópia catalogada não comprova execução do runtime.** As fontes originais permanecem por compatibilidade.

| Módulo incorporado | Para qual intenção usar | Tipo de conteúdo |
|---|---|---|
| [michelin-3-estrelas](skills-integradas/michelin-3-estrelas/SKILL.md) | `!michelin` e execução deliberada passo a passo; carregar junto da receita da intenção | **Skill efetiva** criada a partir de Lembrança preservada; três fases, contraprova e readback |
| [intent-deploy-router](skills-integradas/centraldark-intent-deploy-router/SKILL.md) | Classificar a intenção antes de escolher ferramenta, escrita, deploy ou agente | Regras de roteamento |
| [capability-hud](skills-integradas/centraldark-capability-hud/SKILL.md) | Medir ferramentas e conectores disponíveis antes de declarar bloqueio | Diagnóstico de capacidades |
| [reuse-runtime](skills-integradas/centraldark-reuse-runtime/SKILL.md) | Encontrar dono e receita existentes antes de criar nova infraestrutura | Reuso e ownership |
| [boot](skills-integradas/centraldark-boot/SKILL.md) | Executar rotina de boot e validar HUD/receipts quando solicitado | Inicialização |
| [esteira-motor](skills-integradas/centraldark-esteira-motor/SKILL.md) | Distinguir Hermes/motor, deploy Actions e fila | Operação e CI |
| [autonomous-conflict-costura](skills-integradas/centraldark-autonomous-conflict-costura/SKILL.md) | Resolver conflitos Git/PR por método prévio | Adaptador de resolução; dono especializado permanece válido |
| [live-editing-fabric](skills-integradas/centraldark-live-editing-fabric/SKILL.md) | Editar e visualizar resultado sem iniciar CI desnecessária | Edição viva |
| [unified-surface-parity](skills-integradas/centraldark-unified-surface-parity/SKILL.md) | Alinhar interfaces Texto, Voz, Work e Desktop | Contratos de superfície |
| [hub-credential-control-plane](skills-integradas/centraldark-hub-credential-control-plane/SKILL.md) | Governar Hub, OAuth e conectores sem expor segredos | Credenciais e integrações |
| [vscode-log-bridge](skills-integradas/centraldark-vscode-log-bridge/SKILL.md) | Coletar sinais VS Code Casa via ponte existente | Observabilidade, sem exportar log bruto |
| [auto-sync-vscode](skills-integradas/centraldark-auto-sync-vscode/package.json) | Inspecionar dependências do auto-sync VS Code | **package.json**, não skill executável; descobrir consumidor real |

### Capacidades CentralDark incorporadas em 28/10/2026

| Pasta integrada em `skills-integradas/` | Quando usar | Recursos na mesma pasta |
|---|---|---|
| [centraldark-note-maintenance](skills-integradas/centraldark-note-maintenance/SKILL.md) | Atualizar e reconciliar notas vivas | `scripts/` com 3 scripts Python |
| [centraldark-hermes-operations](skills-integradas/centraldark-hermes-operations/SKILL.md) | Operar Hermes, cron, SSH e portas | `SKILL.md` |
| [reconciliacao-diaria-centraldark](skills-integradas/reconciliacao-diaria-centraldark/SKILL.md) | Reconciliar estado e checklist diário | `SKILL.md` |
| [centraldark-evidence-reconciliation](skills-integradas/centraldark-evidence-reconciliation/SKILL.md) | Comparar provas de código, runtime e HUD | `references/` com 2 receitas |
| [centraldark-ops](skills-integradas/centraldark-ops/SKILL.md) | Operações integradas da Casa, GitHub e VPS | `references/` com 5 receitas |
| [centraldark-oracle-surface](skills-integradas/centraldark-oracle-surface/SKILL.md) | Consultar a superfície Oracle já existente | `SKILL.md` |

**Sincronização deliberada e preservação:** executar `scripts/atualizar-catalogo-self-healing.ps1 -SincronizarSkillsCentralDark` a partir desta Skill-Mãe. Importa **somente** as pastas CentralDark conhecidas, preserva arquivos originais e exige destino sem edição local antes de atualizar cópias divergentes. O atualizador já existente registra SHA, datas e histórico no índice vivo. Não mover o owner original nem eliminar caminhos usados pelos loaders até que exista prova de substituição funcional.

## Descoberta e auditoria

- **Inventário importado**: [ARQUIVOS.json](ARQUIVOS.json), com SHA256 dos 15 arquivos de 11 módulos.
- **Índice de navegação**: [INDICE-PESQUISA.md](INDICE-PESQUISA.md), por intenção e palavra-chave.
- **Buscador próprio**: [../scripts/pesquisar-catalogo.ps1](../scripts/pesquisar-catalogo.ps1); consulta somente leitura.
- **Receita universal**: [../references/HERMES-KANBAN-RECEITA-UNIVERSAL.md](../references/HERMES-KANBAN-RECEITA-UNIVERSAL.md).
- **Provas reais**: criação `t_2805243c` DONE (TXT com conteúdo correto); exclusão `t_26e02a16` DONE (TXT ausente).
- **Fronteira**: cada ambiente tem seus próprios perfis, modelos e workspaces. Cartão `READY` sem assignee não executa. `DONE` exige confirmação do efeito.
- **Preservação**: originais mantidos; não modificar GitHub/main, VPS ou Cockpit além do escopo autorizado.

<!-- AUTOCATALOGO:INICIO -->
## Inventário vivo com horários e rastreabilidade

**Última sincronização (Casa):** 2026-10-28 20:39:30 -03:00. **Arquivos:** 95. **Skills:** 18.

Este bloco é mantido pelo script canônico. Datas vêm do sistema de arquivos; SHA indica mudança de bytes. Verificação funcional requer prova separada.

| Skill | Criada em (Casa) | Modificada em (Casa) | SHA-256 (12) |
|---|---|---|---|
| `catalogo/skills-integradas/centraldark-autonomous-conflict-costura/SKILL.md` | 2026-10-25T04:03:31-03:00 | 2026-10-25T04:03:31-03:00 | 6b85b31d4b9d |
| `catalogo/skills-integradas/centraldark-boot/SKILL.md` | 2026-10-25T04:03:31-03:00 | 2026-10-27T12:22:45-03:00 | 4d00d4976189 |
| `catalogo/skills-integradas/centraldark-capability-hud/SKILL.md` | 2026-10-25T04:03:31-03:00 | 2026-10-27T12:23:02-03:00 | 628473969c7c |
| `catalogo/skills-integradas/centraldark-esteira-motor/SKILL.md` | 2026-10-25T04:03:31-03:00 | 2026-10-25T04:03:31-03:00 | 49745155400e |
| `catalogo/skills-integradas/centraldark-evidence-reconciliation/SKILL.md` | 2026-10-28T10:39:34-03:00 | 2026-10-15T13:26:01-03:00 | 2aa36f69bf5e |
| `catalogo/skills-integradas/centraldark-hermes-operations/SKILL.md` | 2026-10-28T10:39:33-03:00 | 2026-10-28T19:36:57-03:00 | b3b12f25b576 |
| `catalogo/skills-integradas/centraldark-hub-credential-control-plane/SKILL.md` | 2026-10-24T18:41:19-03:00 | 2026-10-12T02:29:56-03:00 | f907162e7819 |
| `catalogo/skills-integradas/centraldark-intent-deploy-router/SKILL.md` | 2026-10-25T04:03:31-03:00 | 2026-10-25T04:03:31-03:00 | ff847288dd61 |
| `catalogo/skills-integradas/centraldark-live-editing-fabric/SKILL.md` | 2026-10-25T04:03:31-03:00 | 2026-10-25T04:01:30-03:00 | 23484d80e412 |
| `catalogo/skills-integradas/centraldark-note-maintenance/SKILL.md` | 2026-10-28T10:39:33-03:00 | 2026-10-27T00:26:07-03:00 | 2ac916d6324e |
| `catalogo/skills-integradas/centraldark-ops/SKILL.md` | 2026-10-28T10:39:34-03:00 | 2026-10-25T04:01:30-03:00 | a6c703e3b56f |
| `catalogo/skills-integradas/centraldark-oracle-surface/SKILL.md` | 2026-10-28T10:39:34-03:00 | 2026-10-28T20:32:34-03:00 | ef794f5c36be |
| `catalogo/skills-integradas/centraldark-reuse-runtime/SKILL.md` | 2026-10-25T04:03:31-03:00 | 2026-10-25T04:03:31-03:00 | 7be349147606 |
| `catalogo/skills-integradas/centraldark-unified-surface-parity/SKILL.md` | 2026-10-25T04:03:31-03:00 | 2026-10-25T04:01:30-03:00 | 88289de635e4 |
| `catalogo/skills-integradas/centraldark-vscode-log-bridge/SKILL.md` | 2026-10-25T04:03:31-03:00 | 2026-10-25T04:03:31-03:00 | d28db794b3a1 |
| `catalogo/skills-integradas/michelin-3-estrelas/SKILL.md` | 2026-10-25T04:03:31-03:00 | 2026-10-26T16:35:50-03:00 | 152636701508 |
| `catalogo/skills-integradas/reconciliacao-diaria-centraldark/SKILL.md` | 2026-10-28T10:39:33-03:00 | 2026-10-25T04:01:30-03:00 | cdb5809ce228 |
| `SKILL.md` | 2026-10-26T18:15:25-03:00 | 2026-10-28T20:31:37-03:00 | 7552eabc6d6d |

- [Índice de todos os arquivos com datas](INDICE-VIVO.md)
- [Inventário técnico de hashes e referências](ARQUIVOS-VIVOS.json)
- [Alertas de integridade](VALIDACAO-AUTOMATICA.md)
- [Histórico das alterações](HISTORICO-MUDANCAS.jsonl)
- [Método de autorreparo e evidência](../references/AUTO-MELHORIA-COM-PROVA.md)
<!-- AUTOCATALOGO:FIM -->
