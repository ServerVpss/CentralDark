# !michelin — Protocolo 3 Estrelas da CentralDark

**Local canônico de acionamento:** `centraldark-operational-method/SKILL.md`. Esta referência é um adaptador operacional, não uma segunda skill e não altera as regras do método original.

**Fontes existentes:** `K:\docs\LEMBRANCAS\metodo-chefe-conformidade-michelin-20261019.md` (INTENT_FIRST; SCRIPT_BEFORE_MODEL; REUSE_BEFORE_CREATE; construir → integrar → provar; iteração deliberada no escopo) e `K:\docs\CONSCIENCIA\01-IDENTIDADE-E-REGRAS\SOUL-SOL.md` (M — Michelin 3 estrelas; hierarquia CHEFE → SOUL → RULES → AGENTS → owner → skill/engine). A metodologia oficial de produto de 3 estrelas não é substituída por este adaptador.

## Gatilho

- `!michelin`, `!MICHELIN`, `MICHELIN 3 ESTRELAS` ou pedido explícito de rigor passo a passo: ativar este protocolo **junto da receita aplicável**, sem criar segunda rota nem segunda ferramenta.
- Se envolver Hermes e arquivos, ler também `HERMES-KANBAN-RECEITA-UNIVERSAL.md`. O gatilho muda rigor, sequenciamento e evidências; **nunca muda o comando do Hermes Kanban que já passou**.
- User intent prevalece para escolha de ação, destino, limites e critério de aceite. Não exigir aprovação a cada microajuste autorizado; não ampliar escopo nem executar mudanças destrutivas adicionais.

## Princípios de execução deliberada

1. **INTENT_FIRST:** transcrever a intenção atual em `AÇÃO`, `ALVO`, `AMBIENTE`, `WORKSPACE`, `ESCOPO`, `ACEITE`. Não copiar paths de testes anteriores.
2. **BUSCAR ANTES DE INVENTAR:** identificar método, comando, owner, runtime e prova que já funcionam. Preservar último verde e não multiplicar skills, processos e cartões.
3. **DECOMPOR:** missão pequena, precisa e verificável; um writer por alvo. Separar o que é preflight, o que é mutação autorizada e o que é comprovação.
4. **MENOR DELTA:** usar o executor canônico e a mesma sintaxe provada. Mudar só parâmetros da intenção (verbo, caminhos, conteúdo e critérios de aceite).
5. **CONTRAPROVA:** conferir que o alvo não era previamente o estado alegado; medir resultado real depois e comparar, sem inventar sinais.
6. **RECUPERAR SEM REPETIR:** diante de erro, ler logs da missão, causa real e proprietário do erro; tentar o menor ajuste correto sem criar tarefa concorrente.
7. **RELATO PRECISO:** separar `CARD_CREATED`, `ASSIGNED`, `RUNNING`, `DONE`, `EFFECT_PROVED` e `BLOCKED`; informar ID e prova usada.

## Três estrelas — avaliação proporcional ao alvo

| Etapa | Trabalho obrigatório | Prova mínima |
|---|---|---|
| ⭐ 1 — Construir com escopo | Resolver intenção e workspace dinamicamente; validar alvo, CLI, perfil e modelo/rota disponíveis; recuperar o método existente. | Alvo certo, limites explícitos, preflight real e plano mínimo. |
| ⭐⭐ 2 — Integrar / executar | Delegar com `hermes kanban create` ao perfil correto e modelo acessível; acompanhar o mesmo cartão. Para código, testar integração e CI conforme escopo. | ID real, assignee correto, execução e erros reais do worker. |
| ⭐⭐⭐ 3 — Provar o efeito | Consultar Kanban DONE/runs **e** readback do arquivo ou sistema afetado; verificar conteúdo/ausência/teste e contraprova adequada. Para produto/deploy, exigir deploy, auth, visual, Casa/VPS/logs e mesmo SHA conforme original. | Resultado no destino real e critérios do usuário satisfeitos. Sem prova E2E, não conceder 3 estrelas globais. |

**Importante:** três estrelas aqui significam a execução rigorosa **do escopo atual**; não declaram Fixed Point global da CentralDark. `UNKNOWN != PASS`. O critério é proporcional: não exigir CI, deploy ou browser para apagar um TXT; não declarar um deploy provado por HTTP 200.

## Contrato especial — Hermes Windows Casa

- Casa é a rota prioritária quando o destino da intenção for Windows Casa. `WORKSPACE_ALVO` e `CAMINHO_ALVO` são definidos pela intenção, não por esse documento.
- O comando que funcionou é `hermes kanban create` usando binário Casa, `--assignee default`, `--goal`, `--workspace dir:<WORKSPACE_ALVO>`, `--body-file -`, `--model`, `--provider`, `--json`, `--idempotency-key` distinta por intenção.
- Modelos **não são dogma**. NVIDIA Nemotron foi PASS nos testes reais; outros modelos somente quando comprovadamente disponíveis. Não voltar para provedor sabidamente offline sem medição nova.
- Criar e excluir foram provados com dois cartões distintos: criação `t_2805243c`, exclusão `t_26e02a16`. Ambos `DONE` com readback real.
- Outras intenções de arquivos (editar, copiar, mover, renomear, substituir, gerar formato diferente) usam **o mesmo create** e requisitos próprios. Não prometer 100% de uma operação ainda não testada.

## Saída Michelin em 5 campos

**INTENÇÃO:** ação e limites; **MÉTODO REUTILIZADO:** rota/comando; **ESTRELAS:** estrela 1/2/3 e evidência; **RESULTADO:** PASS/PARCIAL/BLOCKED/UNKNOWN; **PRÓXIMO CURSOR:** um passo concreto se necessário.

**Exemplo de selo escopado já provado:** criação + exclusão do TXT pela Casa = ⭐⭐⭐ **PASS no escopo do teste**. Isso não sela integração Linux, outros formatos, todo o Cockpit ou Fixed Point global.