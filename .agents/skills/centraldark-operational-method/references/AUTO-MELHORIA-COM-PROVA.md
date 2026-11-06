# Autoatualização, autocura e crescimento com prova — CentralDark

**Responsável:** `centraldark-operational-method`. **Local prioritário:** Windows Casa. **Gatilhos:** criação, edição ou retirada de arquivo sob esta skill; melhoria operacional comprovada; `!michelin` quando houver exigência de prova deliberada.

## Referências normativas

- Especificação pública do formato: https://agentskills.io/specification
- Manual oficial Hermes Skills: https://hermes-agent.nousresearch.com/docs/user-guide/features/skills
- **Regra de idioma:** TODO conteúdo novo ou editado de SKILL.md, instruções, aprendizados, descrições, registros e comentários próprios fica em **português**. Manter sem tradução apenas **identificadores técnicos**, comandos, propriedades de API, caminhos, nomes de modelos e URLs obrigatórios.
- O formato exige `SKILL.md` com metadados YAML (`name`, `description`) e admite subpastas `references/` e `scripts/`. O índice compacto aponta para detalhes sob demanda: não recarregar as 11 skills em todas as missões.
- Hermes oferece descoberta de skills por diretórios externos (`skills.external_dirs`), skills do projeto autorizado e carregamento progressivo. **Um arquivo estar no disco não comprova que um Hermes específico o carregou**; verificar a disponibilidade no runtime antes de atribuir essa capacidade ao agente.
- O Hermes prevê edição de skills com controles próprios (`skill_manage`) e aprendizagem a partir de fontes (`/learn`), mas qualquer incorporação deve preservar a skill canônica, evidências e aprovação aplicável; não usar para recriar o sistema.

## Contrato obrigatório: toda modificação tem explicação e rastro

Antes de registrar alteração funcional, exigir estes campos (em português):

| Campo | Pergunta que deve responder |
|---|---|
| `o_que` | Qual arquivo, capacidade ou comportamento mudou? |
| `por_que_fazer` | Que necessidade da intenção atual justifica a mudança? |
| `por_que_nao_fazer` | Por que não criar um segundo sistema, reescrever receita validada ou ampliar escopo? Quais alternativas foram descartadas? |
| `por_que_usar` | Por que usar o método ou comando reaproveitado? |
| `por_que_modificar` | Qual diferença técnica entre estado anterior e novo justifica editar? |
| `o_que_foi_modificado` | Qual é o delta exato, arquivo, origem e destino? |
| `prova` | Que teste, comando, log, artefato e estado real demonstram funcionamento? |
| `contraprova` | O que foi verificado para descartar falso positivo e regressão? |
| `veredito` | `PROVADO`, `PARCIAL`, `FAIL`, `UNKNOWN` ou `BLOQUEADO`. |
| `executado_em`, `criado_em`, `modificado_em` | Data/hora com fuso Bahia, coletadas da máquina e do evento, não inventadas. |
| `proximo_cursor` | Próxima ação material, se faltar algo. |

## Ciclo sem regressão — deliberado e recursivo

1. **Descobrir**: escanear recursivamente a árvore canônica, preservar cada caminho e hash, registrar data real de criação e modificação (filesystem Windows).
2. **Classificar**: novo/alterado/ausente, detectando referências Markdown quebradas e metadados de `SKILL.md` inválidos. Não apagar arquivos ausentes do histórico.
3. **Catalogar automaticamente**: gerar `catalogo/INDICE-VIVO.md`, `catalogo/ARQUIVOS-VIVOS.json`, `catalogo/VALIDACAO-AUTOMATICA.md` e `catalogo/HISTORICO-MUDANCAS.jsonl`; atualizar apenas **blocos delimitados** de `CATALOGO.md` e `INDICE-PESQUISA.md`, preservando descrições e demais seções já existentes.
4. **Autocura segura**: consertar links gerados **dentro da projeção do próprio índice**, nunca mudar links autorais ou código sem causa provada. Alertar sobre links antigos quebrados, sem adivinhar substitutos.
5. **Melhoria funcional**: só promover uma melhoria para a receita canônica após teste reproduzível + contraprova + readback do efeito (preferencialmente usando o mesmo Hermes Kanban existente). Mudanças apenas detectadas por hash são `NÃO_COMPROVADAS`, e ficam no histórico até evidência; nenhuma IA deve autocertificar por ter escrito o arquivo.
6. **Não perder o verde**: não alterar o comando `hermes kanban create` ou o perfil `default` já testados na Casa; preservar conteúdo e receitas funcionais sem sobrescrita; se houver erro, voltar ao último alvo comprovado e corrigir só o cone afetado.
7. **Regenerar**: sempre que mudar qualquer arquivo monitorado, repetir o catálogo; impedir loops ignorando arquivos gerados e blocos automáticos da própria projeção.
8. **Comprovar**: testar script PowerShell com parser, 2 varreduras consecutivas sem delta, links canônicos e ausência de alterações fora do escopo. Registrar hora e quantidade de arquivos, skills, alertas e deltas.

## Fórmula de execução Windows Casa

```powershell
$base = 'K:\.agents\skills\centraldark-operational-method'
powershell.exe -NoProfile -ExecutionPolicy Bypass -File (Join-Path $base 'scripts\atualizar-catalogo-self-healing.ps1')
```

Para avaliar sem escrever: usar `-SomenteVerificar`. Para execução automática, o Agendador de Tarefas da Casa chama **esse mesmo script**, periodicamente, sem novo serviço ou outro watcher paralelo.

**Agendamento comprovado no Windows Casa (24/10/2026):** tarefa `CentralDark-Skill-Catalogo-Autocura`, a cada **2 minutos**, principal interativo `SEGREDO\Administrador`. Teste manual pelo Agendador: `LastTaskResult=0`. A execução periódica ocorre enquanto a sessão interativa do usuário estiver disponível; esta configuração **não promete rodar enquanto o Windows estiver desligado ou sem sessão**.

## Registro da melhoria funcional — promoção protegida ao SKILL.md

O scanner sozinho detecta alterações, mas **não interpreta um hash novo como função comprovada**. O verificador específico para arquivos da Casa é `scripts/registrar-prova-hermes-casa.ps1`. Ele exige a missão Hermes `DONE`, execução `completed`, alvo dentro do workspace real, resultado no disco e as explicações obrigatórias. **Nenhum comando de exclusão ou criação é executado por esse verificador.**

Exemplo de uso com **variáveis resolvidas da intenção** (não reutilizar ID ou diretório do teste histórico):

```powershell
$base = 'K:\.agents\skills\centraldark-operational-method'
& (Join-Path $base 'scripts\registrar-prova-hermes-casa.ps1') `
  -IdMissao $IdDevolvidoPeloHermes -Acao $AcaoComprovada -ArquivoAlvo $AlvoDaIntencao `
  -PorQueFazer $JustificativaDaIntencao -PorQueNaoFazerOutraCoisa $AlternativaDescartada `
  -PorQueUsar $MotivoDeReuso -PorQueModificar $MotivoDaModificacao `
  -OQueMudou $DeltaReal -Contraprova $ContraprovaMedida `
  -ReferenciaExterna $ReferenciaDosLogs
```

Para **criação**, adicionar `-ConteudoEsperado` ou `-Sha256Esperado`; para **exclusão**, o destino já deve estar ausente. O verificador emite um recibo em `catalogo/comprovacoes/ID.json`, e o atualizador adiciona somente um **bloco identificado e delimitado** ao `SKILL.md`, mantendo todo o resto intacto. Essa promoção não inventa compatibilidade com outros formatos ou ambientes.

Foi promovida uma prova real já concluída: `t_26e02a16` (TXT excluído) em `catalogo/comprovacoes/t_26e02a16.json`. A criação anterior permanece documentada como prova histórica, pois o arquivo foi excluído e não deve ser recriado apenas para gerar recibo.

**Não executar novamente** o antigo script de importação `integrar-skills-centraldark-20261024.ps1` como rotina de atualização: sua função era a cópia inicial e ele sobrescreve os índices editados manualmente. O script novo é o único responsável pelo catálogo vivo.

## Distinção de provas e datas

- Datas **de criação/modificação** são metadados NTFS/Windows do arquivo, não data de comprovação.
- Data **de sincronização** é o horário em que o catálogo foi regenerado.
- Data **da prova** é o momento do teste no host real, com artefato ou log rastreável.
- Histórico de mudança é apêndice; não reescrever eventos antigos. Mesmo nome de arquivo pode ter múltiplas versões SHA.
- `PROVADO` aplica-se exclusivamente à intenção e ao alvo medidos, nunca à CentralDark inteira.

## Casos já comprovados — NÃO regressar

- Criação de TXT por Hermes da Casa: `t_2805243c`, `DONE`, conteúdo lido.
- Exclusão do TXT pelo mesmo Kanban: `t_26e02a16`, `DONE`, arquivo ausente.
- `!michelin`: método fonte preservado em `docs/LEMBRANCAS` e skill operacional em `Skills/michelin-3-estrelas/SKILL.md`.

**Política de segurança operacional:** nenhuma exclusão, reinicialização, alteração global de modelo, GitHub push/merge ou chamada à VPS é consequência automática de sincronizar documentação. A atualização automática só atua **dentro da própria skill canônica** e somente nos arquivos de índice e registro sob seu controle.