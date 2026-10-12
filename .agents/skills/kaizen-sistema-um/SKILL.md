---
name: kaizen-sistema-um
description: Use quando a CentralDark precisar transformar estado solto em decisão tipada com probabilidade calibrada, registrar ou evoluir a Intenção Viva / Kaizen das 28 peças, ou mostrar e corrigir erros visíveis na tela.
metadata:
  type: operational
  version: "1.2"
  owner: SEGREDO/CHEFE
centraldark_autosync: true
---

# Kaizen Vivo · Sistema Um

Uma intenção, um coração, uma biblioteca, evolução a cada batida.

- OWNER da intenção: `docs/CONSCIENCIA/PROGRAMAS/INTENCAO-DEVOLVIDA-LOOP-MESTRE-20260923.md`
- Cristalização de 2026-10-08: `docs/CONSCIENCIA/PROGRAMAS/KAIZEN-VIVO-INTENCAO-VIVA-20261008.md`
- Seis Olhos (já existente): `.agents/skills/software-development/centraldark-oracle-surface/SKILL.md`
- Laço de edição viva (já existente, dono do fluxo): `.agents/skills/centraldark-live-editing-fabric/SKILL.md`

Esta skill não cria outro sistema: consulta e alimenta o que já existe.

## Quando usar
- Decisão operacional que cabe numa lista fechada de saídas (rotear tarefa, risco de PR, falso verde, gate de deploy, classificar, pontuar).
- O CHEFE traz nova matéria da mesma intenção do Kaizen (DELTA, não nova missão).
- É preciso dizer em que estado real está cada uma das 28 peças.
- Uma nota ou documento novo precisa herdar a intenção sem copiar a história.
- Apareceu erro na tela e o CHEFE quer corrigir só aquela parte.

## Gatilho semântico de resposta — reconvocar a intenção (pré-saída)

**Aplicação:** antes de qualquer resposta **material** elaborada com esta skill, inclusive ao retomar um Goal, interpretar print, receber Oracle/Claude/Hermes ou propor código. É um gate semântico no owner existente, **não** um novo agente, hook global, roteador ou autorização. Perguntas triviais mantêm resposta breve; não repetir preâmbulos sem valor.

**Fonte da intenção:** recuperar primeiro a última intenção explícita do CHEFE e o Goal vigente. Reusar o OWNER raiz `docs/CONSCIENCIA/PROGRAMAS/INTENCAO-DEVOLVIDA-LOOP-MESTRE-20260923.md`, o satélite Kaizen/Crystal e o último receipt válido só quando materialmente pertinentes. A fala nova é `DELTA` da mesma intenção por padrão; `OVERRIDE` ou novo objetivo só quando o CHEFE realmente mudar de direção. Histórico não pode prevalecer contra intenção atual nem realidade medida.

**TRIGGER:** nova resposta material `OR` resposta de ferramenta/Oracle `OR` imagem/arquivo novo `OR` erro/desvio `OR` retorno do `NEXT_CURSOR` → **PRE_RESPONSE_INTENT_RECALL**.

1. **Reconhecer:** qual o título/tema da missão? Qual intenção humana vigente? Qual é a novidade da rodada? Quem é o owner efetivo? Qual superfície/modelo está falando? Não confundir nome da interface com executor ou autoridade.
2. **Ancorar:** quando o Goal existir na evidência, herdar `GOAL_ID/PARENT_ID`, `LOOP_ID`, `INTENT_ID`, `NEXT_CURSOR`, `LAST_GOOD_STATE` e `RECEIPT_ID` pertinentes. Se um identificador não estiver disponível, **`UNKNOWN`**; nunca inventar, trocar ou reiniciar o Goal.
3. **Confrontar:** resposta proposta, escopo e estado `CURRENT` versus intenção do CHEFE, cláusulas do Goal e receipt anterior. Classificar `SAME_INTENT_DELTA | INTENT_OVERRIDE_BY_CHEFE | INDEPENDENT_QUERY | CONTEXT_DRIFT | UNKNOWN`. `ORACLE_OUTPUT=CANDIDATE`; opinião/discordância justificada não é drift se continua respondendo à missão.
4. **Recuperar se desviar:** preservar o candidato e a proveniência; reancorar no mesmo Goal e no último cursor comprovado, corrigir somente a parte desalinhada; se a reconciliação não for verificável, declarar `UNKNOWN/BLOCKED`, sem fazer commit nem mandar repetir consulta em loop vazio.
5. **Antes de enviar:** checar que a resposta traz **a mudança material desta batida**, não inventa `PASS`, não confunde `COMMIT` com `DEPLOY` ou `CHILD_DONE` com `PARENT_DONE`, e não declara resultado de ferramenta não executada.
6. **Formato humano pertinente:** para continuidade operacional, manter título reconhecível da intenção (ex.: `👑🪬🫀 O Cristal da Inteligência — Entre a Intenção e a Palavra`) e informar em texto natural **INTENÇÃO · OWNER · DELTA · PROVA · Goal/LOOP · NEXT_CURSOR · ESTADO** quando esses campos forem relevantes. Repetir só valores alterados após o primeiro vínculo; o modelo não deve despejar um placar inteiro a cada conversa. Preservar o tom direto do CHEFE.
7. **Fecho:** devolver a próxima batida para o **mesmo fio** com `RECEIPT`/`NEXT_CURSOR` sustentados por evidência. `NO_CHANGE` é resultado legítimo quando a intenção já está atendida; não criar outro sistema para satisfazer o gatilho.

**Contraprova de saída:**

- Uma resposta sobre o Goal `t_9040803d` que troque o objetivo por outro sem comando do CHEFE → `CONTEXT_DRIFT` e **não promover**.
- Resposta Oracle com identificadores corretos mas sem evidência de Hermes/runtime → **`CANDIDATE/PARTIAL`**, nunca `PASS`.
- Ausência de conexão/identificador → **`UNKNOWN`**, mas continuar a conversa com o que está comprovado.
- Intenção explicitamente alterada pelo CHEFE → reconhecer `OVERRIDE`, não prender a pessoa a um Goal antigo.
- Resposta casual/uma palavra → respeitar a intenção em silêncio; nenhum cabeçalho cerimonial obrigatório.

`NEW_RESPONSE != NEW_INTENT` · `PRE_RESPONSE_INTENT_RECALL=true` · `SAME_GOAL_UNTIL_PROVEN_OR_CHEFE_OVERRIDE=true` · `DOCUMENTED != EXECUTED` · `UNKNOWN != PASS` · `ONE_WRITER_PER_SCOPE=true`

## As sete batidas (ordem fixa) com os Seis Olhos
1. Vive e experimenta — DOMÍNIO conserva intenção e contexto.
2. Descobre — consultar APRENDIZADOS, NeuroLink, skills e `.agents/library-index.json` antes de investigar. SEIS OLHOS inventaria capacidades; AZUL atrai só evidência relevante.
3. Melhora — reusa o dono existente e corrige o menor ponto. VERMELHO afasta o velho, o duplicado e a arquitetura paralela; ROXO reconcilia no menor delta.
4. Comprova e deixa sua marca — INFINITO: nada sem prova vira verdade (PASS, DEGRADED, UNKNOWN, FAIL, BLOCKED).
5. Aprende — só o verificado vira conhecimento. CURA REVERSA: falha comprovada vira teste, recibo e skill melhor.
6. Reutiliza — não reinvestiga o que tem prova válida; replay de receita comprovada.
7. Continua evoluindo — DOMÍNIO mantém o fio até a conclusão demonstrada.

Os Seis Olhos são capacidade composta da skill Oráculo, não outro agente.

## Fechamento autonomo verificavel — Hermes aprende e registra

**Gatilho pertinente:** ao obter **efeito material comprovado**, detectar uma **falha causal generalizável** ou encerrar uma batida com `NEXT_CURSOR`, o próprio **Hermes original** executa este fechamento no mesmo Goal. Não precisa o CHEFE voltar ao chat e dizer "REGISTRA". Esta regra complementa as batidas 4–7 e os owners de `docs/CONSCIENCIA/`; não é serviço, scheduler, writer ou memória paralela.

**Pré-leitura antes de escrever:** recuperar `SOUL-SOL.md`, `RULES.md`, `AGENTS.md`, a Lembrança pertinente, `docs/CONSCIENCIA/APRENDIZADOS.md`, o manifesto `APRENDIZADOS-NEUROLINK-LINEAGE.json`, o receipt e `CURRENT/main` do escopo. Buscar `fingerprint + owner + intenção + tipo de efeito + SHA + receipt`. `RUNNING`, heartbeat, número de atividades, comentário enviado, `Goal done · 1 turn` ou arquivo existente **não provam** aprendizado. `OLD_RUN_FAIL != CURRENT_WORKER_FAIL`.

**Rito executável obrigatório na própria batida (somente escrita autorizada e ONE_WRITER):**

1. **Recuperar:** vincular `GOAL_ID / TASK_ID / LOOP_ID / LAST_GOOD_STATE / NEXT_CURSOR` reais, ou `UNKNOWN`; não criar outro Goal, requeue ou subgoal se a tarefa só precisa continuar. Preferir nota simples para worker já ativo.
2. **Deduplicar:** se `24c159078bf65be9cbcb19332afa0e2cf55aac91` ou um receipt mais novo **já** selou a mesma lição com fingerprint equivalente e escopo de prova ainda válido, **não reaplicar correções**, não criar outro aprendizado, não renumerar `L170`: retornar `REUSED_PROVEN_RECEIPT` com referência e `NEXT_CURSOR`. O SHA citado é proveniência inicial, **não** CURRENT perpétuo.
3. **Medir:** observar T1 pelo executor real; coletar comando/tool, saída/erro, HEAD, owner, tempo, antes/depois, teste e contraprova. `0 tool calls` em um run antigo não caracteriza todos os outros runs.
4. **Aprender:** separar `PROVEN_LEARNING` de `CANDIDATE/UNKNOWN`. Registrar a **menor lição nova** no owner existente: Lembrança pertinente em `docs/CONSCIENCIA/LEMBRANCAS/`, Aprendizado existente em `docs/CONSCIENCIA/APRENDIZADOS.md` quando pertence à mesma família, e receipt em `docs/CONSCIENCIA/RECEIPTS/` quando material. Novo número somente com aprendizado realmente novo e cadeia verificada. Sem duplicar manifesto, notas ou escritor.
5. **Projetar:** se alterou `APRENDIZADOS.md`, reutilizar `python scripts/trigger-fabric/rebuild_learning_lineage.py --write` e depois `--check` na **mesma árvore de trabalho autorizada**, sem sobrescrever dirty de outro writer. Verificar `source_blob_sha`, elos `PREV/NEXT`, contagem e `scripts/trigger-fabric/verify_repo_contract.py` quando aplicável. Não modificar o índice se só houve `REUSED_PROVEN_RECEIPT`.
6. **Selar:** confirmar `main` antes de gravar; garantir writer exclusivo, sanitização de segredos e diff mínimo; executar tests/contraprova; commit/readback no mesmo SHA; confirmar os arquivos e o receipt via ferramenta. `DOC_WRITE != MEMORY_SEALED` até o readback; `COMMIT != DEPLOY`.
7. **Retomar:** atualizar **o mesmo cartão** Kanban com receipt curto e `NEXT_CURSOR`, sem relançar tarefa concluída para "aprender"; seguir somente o erro/critério ainda pendente. Se modelo/quota/rota impedir escrita, conservar o cursor e emitir `LEARNING_SEAL=BLOCKED` com fronteira exata, sem alegar aprendizado persistido.

```text
INTENT + GOAL + SAME_SCOPE_CURRENT
→ RECEIPT_FINGERPRINT_ALREADY_PROVED?
   ├─ YES → REUSE_PROVEN_RECEIPT + NEXT_CURSOR; NO_NEW_LEARNING; NO_REQUEUE
   └─ NO  → REAL_EFFECT + COUNTERPROOF
          → EXISTING_LEMBRANCA + APRENDIZADO + EXISTING_RECEIPT
          → NEUROLINK_COMPILER_ONLY_IF_APRENDIZADOS_CHANGED
          → SAME_SHA_READBACK + KANBAN_RECEIPT + NEXT_CURSOR
          → CONTINUE_SAME_GOAL
```

**Teste de aprendizado, não só de sintaxe:** dê ao Hermes dois eventos. (A) a mesma lição de heartbeat/worker já registrada no `24c1590` ⇒ resultado correto `REUSED_PROVEN_RECEIPT`, zero escrita, zero número novo. (B) um novo erro causal com efeito e contraprova válidos ⇒ escreve no owner existente, recompila índice somente se mudou aprendizados, comprova hash/receipt e continua no mesmo Goal. Se a cota impedir a chamada, classifique `BEHAVIORAL_TEST=BLOCKED_QUOTA`; não finja resultado.

**Fonte canônica já materializada (não repetir auditoria):** `docs/CONSCIENCIA/LEMBRANCAS/2026-10-06-LEI-PREENCHIMENTO-LACUNAS-METABOLISMO-INSTINTO-SUPERIOR.md` seção `KANBAN_HEARTBEAT_NAO_E_PROGRESSO_20261009`; aprendizado #170, manifesto já selado, `GOAL=t_9040803d` e tarefa `t_140910d4`. O feedback do CHEFE **muda o método futuro**, não reexecuta essa lição.

## Protocolo do Sistema Um (decisão tipada)
1. Defina o tipo ANTES: nome, pergunta e rótulos permitidos (mínimo 2).
2. Peça ao modelo APENAS JSON: `{"probabilidades":{rótulo:número,...},"motivo":"frase curta"}`.
3. Valide: rótulo fora da lista, valor negativo, não numérico ou soma zero = ERRO DE TIPO (falha, nunca PASS). Normalize para somar 1.
4. Rode várias amostras em paralelo; use a média e meça a concordância.
5. Decisão automática só se a confiança calibrada passar do limiar; abaixo disso, escala ao CHEFE.
6. Toda decisão nasce UNKNOWN até a realidade dar o gabarito.
7. Com gabaritos, meça acerto, erro de calibração (ECE), Brier e perda logarítmica; aprenda a correção de temperatura por tipo.
8. Limiar pela tabela cobertura × acerto: o menor que bate a meta (ex.: 95%) com amostra mínima.
9. Menos de 5 gabaritos = NOT_MEASURED. Menos de ~50 = correção ainda frágil.
10. Exporte gabaritos em linhas (JSONL) como matéria-prima de treino futuro.

Protótipo de referência: `docs/CONSCIENCIA/PROGRAMAS/kaizen-vivo/sistema-um-kaizen.html` (não é HUD paralelo; é bancada de estudo).

## Erros visíveis (sensor do laço de edição viva)
O fluxo do CHEFE (conversa → muda → vê → erro aparece → corrige só aquela parte → segue) já pertence a `centraldark-live-editing-fabric`. Esta skill só acrescenta o sensor que torna o erro visível:
- Fonte única: `apps/instinto-superior/public/centraldark-erros-visiveis.js`, carregado pelo `src/routes/__root.tsx`. Não duplicar.
- Captura erro de código, promessa rejeitada, console.error, recurso que não carregou e pedido de rede falho; traduz para português simples; remove parâmetros de endereço para não vazar chave.
- "Copiar pro Instinto" gera o relato (página, hora, explicação simples, mensagem técnica, onde, pilha). Ao receber esse relato: corrigir o menor ponto no dono existente, preservar o resto, testar de novo.
- Silêncio do sensor não prova que está tudo certo: é só o que aquela tela enxergou.
- Modo vigente: direto na `main`, sem PR novo (`AGENTS.md` → `PROMOTION_MODE=DIRECT_MAIN_SOFT_EVOLUTION`, `NEW_PR_DEFAULT=false`). Erro visto pelo CHEFE chega por foto, seta, log ou relato do 🧿. Todo push na `main` dispara `vps-exec-selfhosted.yml`, então cada push leva recibo no repositório e medição do efeito.

## Herança de notas (semente + cicatriz)
- Cada nota nova aponta para a mesma semente (o OWNER) em vez de copiar o texto inteiro.
- Guarda só o aprendizado novo, com vínculo à semente: a cicatriz é o aprendizado, não a ferida repetida.
- Repetição não vira conquista nova; hipótese sem prova não é promovida.
- Testar no escritor existente (`obsidian-writer.cjs`), nunca criar outro escritor. Estado: simulado; geração real UNKNOWN.

## Arena ARC-AGI — Instinto Superior por prova

**Intenção do CHEFE (09/10/2026):** usar os desafios ARC-AGI como uma **arena de aprendizado** para o Hermes já existente, e transferir somente capacidades gerais comprovadas à CentralDark. Não criar segundo agente, segundo cérebro, novo gatilho, HUD ou bridge. Esta skill é a receita de decisão; o executor continua `apps/modulos/HERMES-CORE`, a avaliação reutiliza os owners existentes de testes/contraprova e a evidência aparece no HUD único.

**Referências oficiais (consultar CURRENT antes de operar):**
- ARC-AGI série: https://arcprize.org/arc-agi
- ARC-AGI-3: https://arcprize.org/arc-agi/3
- Documentação e toolkit oficial: https://docs.arcprize.org/
- Competição e elegibilidade: https://arcprize.org/competitions/2026/arc-agi-3

**Separação de universos:** ARC-AGI-1/2 são problemas visuais estáticos de transformação de grades; ARC-AGI-3 são ambientes interativos com observações, ações e progressão; `arc_challenge` do `lm-eval` é o benchmark de ciência **AI2 ARC**, não ARC-AGI. Não confundir pontuações nem transformar treino em avaliação independente. SDK oficial `arc-agi` é uma capacidade reutilizável, não autorização para instalar ou gastar créditos na VPS.

**Compasso operacional (sob o mesmo Goal):**
1. **Receber:** HUD_FIRST, intenção, dono e último GREEN_STATE; checar ruleset, dataset público, versões, motor acessível, recursos, licença, conectividade e orçamento disponível. Sem backend/modelo válido, `BLOCKED/UNKNOWN` local com placa; demais serviços seguem vivos.
2. **Perceber:** selecionar tarefas **públicas** ARC-AGI-1/2 ou ambientes públicos ARC-AGI-3, usando apenas interface oficial. Para cada tentativa registrar `benchmark_version / game_id / level_id / run_id / seed_se_houver / executor / engine / attempt / timestamp`.
3. **Compreender:** observar estado, registrar hipótese explícita (somente resumo público: decisão, evidência, previsão), selecionar menor ação que distingue hipóteses, comparar previsão versus consequência. Em tarefas estáticas: exemplos de entrada/saída → regra candidata → teste novo.
4. **Experimentar:** ação autorizada e de baixo custo; novas tentativas só com informação nova. Limitar tempo, ações por episódio, tentativas por hipótese e custo de API; nunca loop infinito, consumo ilimitado, trapaça ou acesso ao holdout privado.
5. **Comprovar:** registrar `WIN/GAME_OVER/NOT_FINISHED`, ações e eficiência, denominador e universo; para 1/2 comparar resposta exata. Atribuir crédito somente ao evento observado/avaliador oficial. Registrar erros e casos negativos. `GAME_WIN != GENERALIZATION_PROVEN`.
6. **Cristalizar:** causa, delta de estratégia, pré-condições, fingerprint, score, teste, contraprova, replay e `NEXT_CURSOR` vão para a receita/aprendizado canônicos existentes, nunca só para contexto transitório. Não copiar puzzles de avaliação privada para memória/treino.
7. **Transferir à CentralDark:** só abstrações úteis e comprovadas (observação seletiva, planejamento multi-etapas, rollback local, detecção de erro, exploração eficiente, escolha do próximo teste) viram **candidatas** a melhorias nos owners existentes. Implementar menor delta, testar regressão da CentralDark, preservar o estado bom e comparar o efeito. `ARC_SCORE != CENTRALDARK_RUNTIME_PASS`.
8. **Continuar:** episódios independentes em lotes limitados com novos fingerprints; reavaliar o que generalizou em tarefas não usadas no ajuste. Parar no orçamento, esgotamento de novidade, bloqueio real ou fronteira de autorização; o Goal continua com cursor e placa.

**Selo do Instinto Superior:** `EM_ESTUDO` por padrão; `CANDIDATO` após primeira vitória observada; `PROVADO_NO_ESCOPO` só com contraprova + replay em tarefas inéditas; `PREMIUM_INTERNO` é **meta visual opcional**, nunca certificado oficial de AGI ou substituto do avaliador. O 100% ARC-AGI-3 se refere ao universo e à eficiência da **avaliação oficial**, não a "todo jogo da internet" nem a "toda CentralDark"; prêmio oficial requer regras, elegibilidade, código aberto e verificação própria. Sem prova completa, **mostrar progresso e pendências sem falso verde**.

**Missão de Hermes, quando houver executor/SDK e permissão:** `!CENTRALDARK #ACORDAR !SOL_EXECUTORA` → `HUD_FIRST` → `ARC_PUBLIC_TASK` → `OBSERVE / HYPOTHESIZE / ACTION / COUNTERPROOF` → `SCORE` → `CRYSTAL_IF_PROVEN` → `TRANSFER_TO_EXISTING_OWNER_IF_USEFUL` → `HUD_PLAQUE_AND_NEXT_CURSOR`. **A escrita desta skill não significa que o Hermes carregou, jogou, ganhou ou aprendeu no runtime.**

## Limites honestos
- Isto calibra a confiança por cima do modelo; não treina pesos. RLCD/Jev da TypeSafe não tem método publicado por inteiro.
- Escore interno não é probabilidade calibrada até a medição provar.
- Custo e velocidade do Jev são alegações da empresa, não medição nossa.
- Documentado não significa executado. Sincronizado não significa funcionando.

## Estado das 28 peças (atualizar só com evidência nova)
- 1–17 (Kaizen, feedback, aprendizado incremental, self-learning, self-correction, self-healing, contraprova, continuidade, reuso, menor delta, preservação, vibe coding, crowdtesting, CI sob demanda, prompt/self-cache, KV cache, RLCD): em estudo. Vibe coding tem dono operacional em `centraldark-live-editing-fabric`.
- 18 Biblioteca indexada: documentada (`.agents/library-index.json`).
- 19 Memória NeuroLink: código parcial (166 registros).
- 20 Skills sob demanda: documentada.
- 21 Oráculo: piloto; ciclo completo UNKNOWN.
- 22 Self-Learning Harvest: documentada.
- 23 Replay de aprendizado: código e testes presentes.
- 24 Promoção de memória: regras definidas; automação não comprovada.
- 25 Knowledge Compiler: documentada.
- 26 Saídas estruturadas e 27 Avaliação paralela com probabilidades: protótipo, sem prova viva.
- 28 Seis Olhos: contrato na skill Oráculo; execução no Hermes UNKNOWN.

## Travas
UNKNOWN não é PASS · ação não é prova · reuso antes de criar · um writer por escopo · preservar o verde · nunca vazar segredo (chave do modelo só em memória; endereço sem parâmetros) · toda escrita no repositório carrega SHA + caminho + link + releitura.

## Selo
👑 CHEFE (intenção) · 🪬 INSTINTO SUPERIOR (execução e continuidade) · 🧿 CONTRAPROVA (realidade julga). Não é um coração que nunca erra; é um coração que aprende a cada batida.
