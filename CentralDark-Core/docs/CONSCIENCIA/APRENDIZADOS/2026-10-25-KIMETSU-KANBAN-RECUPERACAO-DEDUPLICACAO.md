# Aprendizado da CentralDark — Kimetsu, Kanban, contexto e duplicatas (25/10/2026)

**Ambiente observado:** Casa Windows SEGREDO. **Missão-mãe:** `t_911e17ff`. **Fonte operacional:** `K:\.agents\skills\centraldark-operational-method\references\KANBAN-KIMETSU-RECUPERACAO-E-DELTA-20261025.md`. **Método:** reaproveitar a skill `kimetsu-brainstorm` e o Kanban nativo. Este registro não muda o executor.

## Intenção e o problema real

A missão única é expandir conhecimento com deltas pequenos, preservar os componentes funcionais do Cockpit e manter o histórico das filhas. Foram lançadas tarefas em paralelo; houve limitações de cota e indisponibilidade de conexão. Depois de testar e utilizar `llamacpp/model`, quatro filhas falharam com erro explícito de **contexto de conversa longo demais**, mesmo após compactação automática. `RUNNING` com PID presente não significou progresso ou entrega.

## Provas observadas

- `t_42544fe8`, cards da máquina de estados: `DONE` com `provider_override=llamacpp` e `model_override=model`. Em `StatusPanel.tsx` o código reutiliza `EstadoOperacional` e `etiquetaCanonica` do componente existente. A comparação visual com o protótipo da porta 8081 ainda não foi provada.
- `t_4a328069`, `t_b4b70da6`, `t_6056a006` e `t_7cfbaae4`: a saída do worker registrou `rc=1` e `This conversation has grown too long`. Repetir a execução com o mesmo contexto é uma retentativa sem resolução de causa.
- Cinco Delta-Filhos (os quatro citados e `t_80a4c299`) foram movidos de `blocked` para `scheduled` pelo comando nativo. Conferência inicial mostrou `blocked=8`, `scheduled=5`, `running=0`, `done=7`. **Nova contraprova:** eventos da filha `t_4a328069` mostram `scheduled` e depois `unblocked` em outro momento, sem ator indicado; houve novo run e falha por contexto. Assim, o estado `scheduled` não impede outro cliente/agente de retomar o cartão. Não inventar o autor do desbloqueio nem disputar o estado; reler eventos a cada relatório.
- O servidor `llama.cpp` local respondeu a teste curto com `TESTE_LOCAL_OK`; o sucesso de uma resposta não garante capacidade para vários agentes, longas janelas de contexto ou múltiplos slots.
- A função nativa `hermes kanban archive ID` existe e conserva histórico; `archive --rm` pode eliminar definitivamente cartão arquivado. Não houve exclusão nem arquivamento de cartão nesta melhoria.
- A abertura visual do Explorador do Windows com `Start-Process explorer.exe` foi confirmada pelo usuário. Não é exclusiva da pasta do Jan; não comprova autenticação ou conexão MCP.

## Regra consolidada

1. 🫁 **Concentração:** medir intenção, estado, run, PID, log, modelo, workspace e owner antes de declarar saúde.
2. 🌊 **Água:** identificar se a causa foi cota, conectividade, contexto, workspace ou concorrência; evitar força bruta.
3. 🦋 **Inseto:** corrigir a causa e retomar somente um cartão existente por vez. Enquanto não corrigida, manter `scheduled` ou `blocked` com causa e `NEXT_CURSOR`.
4. ♻️ **Duplicata:** comparar objetivo, alvo, owner, entrega, histórico e dependências. Se igual e comprovado, aproveitar deltas úteis e **arquivar a repetida**; nunca apagar a missão-mãe nem purgar o histórico automaticamente.
5. ⭐⭐⭐ **Michelin:** entregar com execução real, readback, contraprova e prova do alvo; diferenciar êxito documental de êxito de implementação.
6. 🔗 **Handoff:** usar a mesma pasta canônica já existente; uma pessoa/agente escritor por arquivo, leitores em paralelo; os filhos continuam ligados por intenção à missão-mãe permanente.

## Decisão e justificativa

- **Por que fazer:** houve erro recorrente de contexto e o Kanban acumulou bloqueios; faltava uma recuperação operacional explícita e conservadora.
- **Por que não criar outra coisa:** já existem skill canônica, Kimetsu, Michelin, receitas Hermes, catálogo automático e handoff.
- **Por que usar:** observação nativa e documentação validada na Casa, sem duplicar dispatcher, banco, scheduler ou serviço.
- **Por que modificar:** explicitar tratamento diferente para `CONTEXTO` e `COTA`, retomada gradual e arquivamento condicionado à duplicidade comprovada.
- **O que foi modificado:** uma referência nova sob `references/`, links de navegação na skill e no mapa `INTERLIGADOS.md`, e apontamento na receita Hermes universal. Nenhum cartão foi reativado, modelo alterado ou servidor reiniciado por esta atualização.
- **Prova documental:** atualização recursiva do catálogo e verificação sem diferenças e alertas. O estado funcional das cinco filhas em espera **continua não comprovado**.
- **Contraprova:** os IDs históricos, `t_911e17ff`, o modelo validado, o Cockpit na porta 8080, as receitas antigas e os demais bloqueios não foram alterados por este aprendizado.
- **Próximo cursor:** investigar uma sessão de worker com contexto excessivo, encontrar o procedimento de compactação/reinício seguro da versão Hermes instalada e só então testar um cartão existente, sem retentativas em massa.


## Delta 25/10/2026 — Kimetsu Remix + 17 Respirações + seleção de modelo/reasoning

O CHEFE determinou que qualquer execução material da CentralDark passe primeiro pela `kimetsu-brainstorm` e use o catálogo de **17 Respirações Integradas** para selecionar a política adequada ao estado real. A Remix não deve apenas citar uma respiração: exige classificação, intenção, `BREATH_ID/NAME`, execução, evidência, veredito e transição.

A skill-mãe `centraldark-operational-method` agora trata a Kimetsu como **PREEXEC obrigatório** para mutação, implementação, correção, integração, delegação executável e prova. As skills-filhas permanecem em seus próprios owners; a mãe inventaria gatilho, técnica, modelo/provedor/reasoning que funcionou e evidência. Melhoria autônoma pelo Hermes continua permitida somente com writer único, teste, contraprova e readback.

Para Hermes Desktop/CLI/Kanban, a ordem de autoridade foi fixada: **GitHub/documentação oficial NousResearch primeiro → versão/help/config/schema da Casa → efeito real**. Medição da Casa: Hermes `v0.22.4+91.g944c3a4`; tarefas recentes provaram `Opus 4.6=minimal`, `Haiku 4.5=low`, `Sonnet 4.5=medium`; `NULL` significa herança do perfil. O modelo local `llamacpp/model` aparece com `Reasoning: off` no estado resolvido, apesar de existir `reasoning_effort: low` no YAML; não confundir configuração escrita com suporte/efeito ativo.

A referência operacional completa foi incorporada em `K:\.agents\skills\centraldark-operational-method\references\HERMES-FREE-TIER-FALLBACK.md`. A autocura do catálogo registrou em 25/10/2026 01:48:52 -03:00: **nenhum alerta estrutural detectado**.
