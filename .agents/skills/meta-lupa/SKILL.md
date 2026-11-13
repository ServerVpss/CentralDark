---
name: meta-lupa
description: Aplicar a META LUPA com três temperaturas operacionais — FRIA, MÉDIA e QUENTE — preservando Bayes, entropia, valor da informação, mapa canônico, AutoLupa, contract_digest, candidate_ref, comitês independentes, registro auditável e autorização humana. Usar em auditorias, investigações, debugging multimodal, decisões arquiteturais, incidentes, avaliações de agentes, alegações conflitantes ou situações em que evidência deva alterar uma hipótese sem transformar confiança em autorização.
centraldark_autosync: true
centraldark_autosync_policy: main-runtime-lock
oracle_review_on_change: true
---

# META LUPA

Transformar a sequência `mapa → evidência → crença → teste → decisão → AutoLupa → consolidação` em análise explícita, reproduzível e proporcional ao custo do erro.

META LUPA é a evolução do mesmo artefato e mantém o motor bayesiano. FRIA, MÉDIA e QUENTE são modos internos, não skills concorrentes.

## Invariante de falsificação

Uma alegação de sucesso apoiada apenas por painel verde, status `Scheduled`, HTTP 200, ausência de erro ou listagem de recurso é evidência insuficiente do funcionamento ponta a ponta.

Nesse caso, a saída obrigatória é `VEREDITO=BLOQUEAR` (ou `CORRIGIR` quando o formato não admitir bloqueio), `FALSO_VERDE_BLOQUEADO=SIM`, e uma prova contrária ou próximo teste concreto. É proibido combinar `VEREDITO=APROVAR/APROVADA` com evidência insuficiente. Se isso ocorrer, a própria saída é inválida e a AutoLupa deve corrigi-la antes de responder.

### Falso verde de instrumento

O instrumento que observa também mente. Um resultado vazio, um `404` ou um
"nenhuma ocorrência" descrevem **o que a ferramenta devolveu**, não o que
existe no sistema. Antes de concluir ausência, identificar se a ferramenta
tem allowlist, filtro de caminho sensível, escopo padrão, paginação ou índice
defasado — e repetir a busca por um segundo canal independente.

Regra: **ausência de resultado em um instrumento não é evidência de ausência
no sistema.** Só vale como prova quando dois canais de proveniência distinta
concordarem.

### Falso verde de versionamento

Casos em que o Git aparenta saúde e esconde o defeito. Cada linha traz o
teste que efetivamente separa as hipóteses:

| Aparência | O que pode estar por trás | Teste que resolve |
|---|---|---|
| `git status` limpo | gitlink órfão: submódulo sem `.gitmodules` apontando para commit inexistente — a pasta chega vazia em todo clone | `git ls-tree <ref> <caminho>`; modo `160000` é gitlink, `100644` é arquivo |
| blob local igual ao da ref remota | a ref remota é cache local, podendo estar defasada ou já deletada no servidor | `git ls-remote origin <branch>`; ou `git fetch` e reler |
| merge sem conflito, `exit=0` | conteúdo de um dos lados descartado silenciosamente | `git diff <merge-base> <outro-lado> -- <arquivo>`; se vazio, aquele lado nada trouxe |
| verificação passa no código novo | a checagem podia já falhar antes — não mede regressão | rodar a **mesma** checagem no código original e comparar contagem e identidade dos erros |
| arquivo existe no disco | pode não estar versionado nem alcançável por outros | checkout limpo em worktree detached e contagem dos arquivos entregues |

Regra: para provar que algo está versionado, medir **o que um checkout limpo
entrega** — não o que a árvore de trabalho exibe.

## Três temperaturas operacionais

### FRIA — provar o que aconteceu

Use para R0/R1 e fatos locais. Separe SIM/NÃO, antes/depois, mudou/não mudou. Não explique mecanismo invisível.

Saída mínima: `MODO=FRIA`, fato, resultado, prova e lacuna.

### MÉDIA — localizar por que aconteceu

Ative em 401, 404, 429, timeout, contradição, evidência fraca, drift, falso verde ou R2. Formule hipóteses distinguíveis, mude uma variável por vez, use o canal correto, busque prova contrária e capture o delta do runtime.

Saída mínima: `MODO=MEDIA`, hipótese, variável alterada, canal, resultado binário, delta, prova contrária e camada localizada.

### QUENTE — tornar o achado repetível

Ative em R3/R4, produção, autenticação, dados, merge, alteração da própria skill, recorrência ou CAÇA_AO_ERRO. Fixe alvo e SHA; combine tela, log, processo e ação; use revisão adversarial; execute positivo, negativo, limite e rollback; valide autorização; registre BEGIN/FINAL e AutoLupa.

Saída mínima: `MODO=QUENTE`, contratos, observadores, testes, rollback, registro, autorização e ponto fixo.

Escalonamento: comece FRIA; contradição escala para MÉDIA; criticidade, recorrência ou promoção escala para QUENTE; ponto fixo resfria e encerra.

## Variantes dentro das três temperaturas — intensidade ≠ ferida

A temperatura define **quanto rigor e risco** a Meta-Lupa aplica. A variante define **qual ferida operacional está sendo examinada**. Não criar novas temperaturas para cada incidente; selecionar uma variante dentro de FRIA, MÉDIA ou QUENTE e preservar o mesmo owner.

```text
TEMPERATURA = intensidade / custo do erro
VARIANTE    = classe causal / método discriminante
```

### FRIA — variantes de observação

- `FRIA_FATO_BINARIO`: fato local simples, SIM/NÃO, antes/depois.
- `FRIA_READBACK`: reler CURRENT/STATUS/OBSERVE/REMEASURE sem explicar mecanismo invisível.
- `FRIA_REUSE_FINGERPRINT`: fingerprint invariável ou mesma falha sem informação nova; reutilizar prova/cristal e não reabrir investigação.

### MÉDIA — variantes de diagnóstico

- `MEDIA_CAUSA_DISCRIMINANTE`: hipótese distinguível + uma variável/teste por vez.
- `MEDIA_RECOVERY_VISUAL`: ação visual sem efeito, target/monitor/actionability divergente; classificar H01..H10 e testar uma hipótese read-only por vez.
- `MEDIA_FALSO_VERDE`: sucesso aparente com evidência insuficiente.
- `MEDIA_DRIFT_DISTRIBUIDO`: runtime/host/SHA/superfície divergem.
- `MEDIA_INSTRUMENTO_INCERTO`: sensor, ferramenta ou observador falhou; não projetar a falha do instrumento no alvo.

### QUENTE — variantes de consolidação/adversarial

- `QUENTE_META_EVOLUCAO`: alteração da própria Meta-Lupa; exigir regressão, contraprova e mesmo HEAD.
- `QUENTE_PROMOCAO_CANONICA`: main/merge/promoção/selagem.
- `QUENTE_PRODUCAO_AUTH`: produção, VPS, autenticação ou dados.
- `QUENTE_RECURRENCIA_ADVERSARIAL`: falha recorrente, recovery recorrente, agentes discordando ou caça ao erro.
- `QUENTE_CONSOLIDACAO`: demais escopos quentes que exigem teste positivo, negativo, limite e rollback.

**Escalonamento por variante:** FRIA pode subir para MÉDIA quando nasce contradição/causa desconhecida; `MEDIA_RECOVERY_VISUAL` sobe para `QUENTE_RECURRENCIA_ADVERSARIAL` somente quando a falha se repete com material novo ou o risco/ambiente exigir. Trocar variante sem evidência nova é ruído, não progresso.

**Contrato visual H01..H10:** o classificador executável vive em `scripts/trigger-fabric/centraldark_full_trigger_boot.py#classify_visual_recovery`. As classes são variantes causais do mesmo invariante de recuperação, não dez novos invariantes e não dez retries. A Meta-Lupa recebe `VISUAL_ACTION_NO_EFFECT` + `visual_recovery_class` e usa `MEDIA_RECOVERY_VISUAL`; recurrence material usa `RECOVERY_RECURRENT` e escala para QUENTE.

**Saída auditável do motor:** `evaluate()` deve expor `mode_used` + `variant_used`. Temperatura sem variante continua válida para compatibilidade, mas consumidores novos devem preferir o par para classificar com mais precisão.

## ♻️ Self-Evolution e XP comprovado — integração no mesmo organismo (2026-10-14)

As técnicas externas de otimização **GEPA/DSPy** (feedback textual de falhas e rastros), **Reflexion** (memória episódica de correções) e **EvoAgentX** (avaliação repetível de workflows) são absorvidas como **método de observação e contraprova**, não como dependências obrigatórias, novos agentes ou novo orquestrador. Referências técnicas: `https://dspy.ai/3.1.0/api/optimizers/GEPA/overview/`, `https://arxiv.org/abs/2303.11366`, `https://github.com/ANative-Lab/EvoAgentX`.

No mesmo ciclo: **medir o baseline → executar delta no owner existente → coletar feedback sanitizado → reproduzir falha → comparar teste antes/depois → contraprova negativa → preservar green state → atualizar aprendizagem/ledger sem duplicação → continuar**. Se não há mudança material demonstrada, não há promoção nem registro ruidoso.

O ranking de `apps/modulos/proxy/self_evolve.py` mede sucesso de transporte e latência sob amostragem, não demonstra qualidade de resposta, aderência à intenção ou XP. Modelos não são promovidos por um único resultado rápido nem por HTTP 200. A saída declarada `TRANSPORTE_AMOSTRADO` preserva essa fronteira de prova.

**XP único e auditável** permanece em `scripts/meta_lupa.py`, `references/uso-ledger.jsonl` e guardrail de ponto fixo existentes. Toda declaração de ponto fixo exige `--autolupa sim`; para **ganhar XP** com `ponto_fixo_atingido`, a evidência também é obrigatória antes do `FINAL`. Encerramentos legados sem reivindicação de XP continuam compatíveis; o guardrail do ledger permanece como segunda contraprova. O progresso demonstrável usa `xp_before`, `xp_gained`, `xp_after`, `level_before/after`, `tier_before/after`, fingerprint e receipt. Não gerar XP por tentativas, respostas longas, estimativas, aparências verdes, ranking de proxy ou repetição do mesmo evento. Reescrever apenas o texto da evidência não concede de novo conquistas já registradas na mesma missão, HEAD, causa e teste; conquista inédita recebe somente seu delta.

**Regressão:** `testes/test_selo_ponto_fixo.py` contém teste de preflight. `apps/modulos/proxy/test_self_evolve.py` cobre ranking conservador, logs inválidos, latência sem prova, registro sem duplicação e ausência de XP fictício. Esses testes validam código em ambiente isolado; não comprovam deploy da VPS ou ativação do proxy.

## Princípios inegociáveis

1. Separar fato, inferência, suposição e desconhecido.
2. Não inventar probabilidades, likelihood ratios ou precisão estatística.
3. Tratar nome, aparência, status verde e autoridade como evidência fraca até validação.
4. Não multiplicar evidências correlacionadas como se fossem independentes.
5. Separar confiança epistemológica de permissão operacional.
6. Manter bloqueios críticos acima de qualquer posterior ou nota.
7. Escolher o teste que mais reduz incerteza por custo e risco.
8. Registrar cálculo, proveniência, sensibilidade, lacunas e próximo passo.
9. Ensinar em duas camadas: primeiro linguagem concreta e visual; depois a notação matemática equivalente.
10. Nunca usar escolaridade formal como proxy de capacidade de raciocínio.
11. Preservar e evoluir o que já existe; não criar versão, pasta, rota, serviço, regra ou documento paralelo sem provar que o encaixe canônico é impossível.
12. Subordinar autoajuste a um mapa único. Autonomia sem mapa é drift, não evolução.
13. Tratar área consolidada como bloqueada por padrão; confiança alta não desfaz trava.
14. Executar AutoLupa sobre o próprio veredito até atingir ponto fixo evidencial, sem limite artificial de iterações e sem prometer certeza absoluta.
15. Nenhuma promessa de alinhamento, aprendizado ou comportamento permanente pode exceder a capacidade observável do agente. Sem mecanismo persistente comprovado, rebaixar `sempre`, `nunca mais`, `garanto`, `não repetirei` ou equivalente para uma alegação testável no escopo atual.
16. Tratar confronto útil como fonte de informação: sobreviver, cair ou permanecer UNKNOWN só vira aprendizado quando existe evidência nova e delta reutilizável de crença/regra/teste.

## Gate de realidade distribuída, tempo, escopo e Writer

A Meta Lupa deve provar não só **se algo é verdade**, mas **onde, quando, em qual SHA, em qual superfície e sob qual Writer** essa verdade vale. Em sistemas distribuídos, uma evidência correta no lugar errado ou no tempo errado é falso verde.

Antes de aceitar alegação operacional material, fixar:

```text
TARGET:
SCOPE:
OWNER:
WRITER:
SOURCE_OF_TRUTH:
OBSERVED_AT:
HEAD_SHA/CANDIDATE_REF:
AUTH_STATE:
RUNTIME_STATE:
PROOF_STATE:
```

### Invariantes de realidade distribuída

```text
CURRENT > HISTORY
ACTION != PROOF
DOCUMENTED != EXECUTED
COMMITTED != DEPLOYED
MERGED != DEPLOYED
EXISTS != RUNNING
TOOL_LISTADO != TOOL_ATIVO
CAPABILITY != AUTHORITY
AUTH_REQUIRED != FAIL
SOURCE_PATTERN != RUNTIME_PROOF
DEVELOPMENT_MATERIAL != RUNTIME_PROOF
UI_TRUNCATED != CONFIG_INVALID
```

`AUTH_REQUIRED` significa fronteira humana de consentimento/autenticação naquele canal. Não deve ser promovido a `FAIL` nem bloquear rotas independentes que possuam owner e autorização próprios.

### Matriz de fontes da verdade

Não existe uma fonte física única para todos os fatos. Resolver a fonte pela natureza do claim:

```text
CODE/VERSIONAMENTO        -> Git/repositório canônico
BUILDER/EDITOR            -> builder observado (ex.: Lovable), sem substituir Git
CI/CHECKS                 -> provedor CI no HEAD exato
VPS_RUNTIME               -> processo/health/log medido na VPS
WINDOWS_RUNTIME           -> processo/bridge/health medido na Casa
AUTH                      -> provedor OAuth/secret binding aplicável
PACKAGE/ARTEFATO          -> arquivo + hash + manifesto + proveniência
DEPLOY                    -> artefato/SHA implantado + runtime remensurado
```

Uma fonte não herda autoridade probatória de outra. `BUILDER_DONE` não prova `CANONICAL_REPO_UPDATED`; `MERGED` não prova `RUNTIME_RUNNING`; screenshot não prova valor subjacente quando a UI pode truncar.

### Writer por escopo, não Writer global

```text
PARALLEL_PERCEPTION_ALLOWED=true
PARALLEL_MUTATION_DISJOINT_SCOPES_ALLOWED=true
PARALLEL_MUTATION_SAME_SCOPE=false
ONE_WRITER_PER_SCOPE=true
ONE_WRITER_GLOBAL=false
```

Múltiplos agentes podem observar, testar e produzir deltas em paralelo. Escrita material concorrente é proibida somente quando os `MUTABLE_SCOPE`s se sobrepõem. Para o mesmo escopo, serializar por lease/handoff:

```text
OLD_WRITER_RELEASE
→ HANDOFF_RECEIPT
→ NEW_WRITER_ACQUIRE
→ REMEASURE_BASELINE
→ MUTATE
```

Repo igual não implica escopo igual; arquivo diferente não garante escopo diferente. Resolver escopo pela capacidade/owner/consumidores e pelo cone de impacto.

### Estado operacional não binário

Separar certeza epistemológica de estado operacional:

```text
PASS | RUNNING | BLOCKED | AUTH_REQUIRED | UNKNOWN | FAIL
```

Estados compostos são válidos quando evitam falso verde, por exemplo `BUILT_NOT_RUNTIME_PROVEN` e `CONTRACT_EXISTS_RUNTIME_NOT_PROVEN`.

### Evidência de UI

Campo cortado, ellipsis, largura visual ou screenshot parcial não provam configuração inválida. Quando a UI puder truncar:

```text
UI_RENDERED_VALUE
→ EXPAND/TOOLTIP/API/LOG/COMMAND
→ UNDERLYING_VALUE
→ VERDICT
```

Sem segundo canal, manter `UNKNOWN`.

## Roteamento mental distribuído dentro de `.agents/skills`

A Meta Lupa permanece o owner de falsificação e aceite. As skills abaixo são **lentes especializadas reutilizáveis**, não novos Judges, Writers ou autoridades. Carregar somente as pertinentes; `SKILL_LISTADA != SKILL_CARREGADA` e `TOOL_LISTADO != TOOL_ATIVO`.

```text
centraldark-operational-method -> método, autorização, Writer e execução CentralDark
codegraph-partner              -> símbolos, callers/callees, impacto e owner estrutural
code-validation-sandbox        -> reproduzir bug/fix isoladamente antes de aplicar
cot-react-loop                 -> observar → agir → medir → corrigir durante debugging
engine-gap-closure             -> fechar gaps de runtime/router/Writer sem falso verde
context-synthesis              -> reconciliar código, docs, conversa e fontes externas
git-analysis                   -> história, refs, diff e causalidade de versionamento
reality-drift-detector         -> detectar CURRENT divergindo de HISTORY
fable-loop                     -> estabilizar prova/contraprova até fixed point
frontend-design                -> material UI/UX quando o escopo for interface
schema-author                  -> contratos/schema quando a ferida for estrutura de dados
skill-workshop                 -> alterações de skills sem criar owner paralelo
```

Roteamento mínimo para debugging de código:

```text
ERRO
→ MAPA/OWNER (codegraph-partner quando disponível)
→ REPRODUÇÃO ISOLADA (code-validation-sandbox quando aplicável)
→ LOOP DE CORREÇÃO (cot-react-loop)
→ GAP DE ENGINE/RUNTIME (engine-gap-closure se houver)
→ CONTRAPROVA E ACEITE (meta-lupa)
→ FIXED POINT (fable-loop quando necessário)
```

Se uma skill/tool não estiver realmente disponível no runtime atual, usar o método equivalente permitido e marcar a capacidade ausente como `UNKNOWN`/`UNAVAILABLE`; nunca fingir carregamento.

## Gate de Mapa Único

Antes de criar, mover, renomear ou duplicar qualquer estrutura:

1. localizar a Fonte da Verdade e o mapa canônico do ambiente;
2. buscar por função, consumidores, rotas, nomes equivalentes e legado ativo;
3. tentar encaixar a mudança no componente existente de mesma responsabilidade;
4. preferir extensão pequena e compatível a novo módulo;
5. somente criar caminho novo se o encaixe existente for tecnicamente impossível ou produzir acoplamento pior;
6. nesse caso, usar nome humano, estável e coerente com a árvore, registrar responsabilidade, dependências e caminho canônico;
7. atualizar o mapa único na mesma mudança; nunca deixar a estrutura nascer antes do mapa.

Classificar o resultado:

```text
ENCAIXE_EXISTENTE | EXTENSAO_CANONICA | NOVO_CAMINHO_JUSTIFICADO | BLOQUEADO_POR_DUPLICIDADE
```

Não inferir que a estrutura “se ajeita sozinha”. Ela se ajusta automaticamente apenas dentro das rotas e responsabilidades autorizadas pelo mapa.

## Gate de Consolidação e Trava

Separar `funcionando agora` de `consolidado e protegido`. Promover uma área a `CONSOLIDADA` somente quando existirem, para o mesmo alvo e SHA:

```text
CAMINHO_CANONICO:
RESPONSABILIDADE:
TESTES:
REVISAO/FALSIFICACAO:
AUTORIZACAO_DO_SEGREDO_CHEFE:
COMMIT_OU_MERGE_SHA:
MECANISMO_DE_TRAVA:
ROLLBACK/RECUPERACAO:
```

Depois da promoção:

- bloquear edição automática por padrão;
- exigir reconhecimento do caminho pelo mapa e pelo gate determinístico;
- não tratar `CODEOWNERS`, comentário ou emoji como trava suficiente quando não houver check obrigatório;
- permitir mudança somente por autorização aplicável ao alvo exato, com nova revisão, testes e registro;
- preservar o histórico; não apagar a consolidação anterior para esconder regressão.

Áreas ainda não consolidadas permanecem operáveis dentro da autorização vigente, mas continuam submetidas a mapa, prova, rollback e ausência de regressão.

## Gate determinístico: prova → contraprova → aceite → reconciliação

O fechamento não escolhe entre acreditar em tudo ou rejeitar tudo. Ele examina,
tenta quebrar, retém somente o que sobrevive e reconcilia o restante sem
apagar prova boa.

```text
CANDIDATO
→ PROVA
→ CONTRAPROVA_INDEPENDENTE
→ RESULTADO
   ├── SURVIVED
   │   → RETER_BEM_PROVADO
   │   → ACEITE_DETERMINISTICO
   │   → SEAL_NO_LEDGER_EXISTENTE
   │
   ├── DEFEATED
   │   → REJEITAR_DELTA_DERROTADO
   │   → PRESERVAR_BEM_INDEPENDENTE
   │   → RECONCILIAR
   │
   └── UNKNOWN
       → NÃO_ACEITAR
       → NÃO_REJEITAR_GLOBALMENTE
       → NEXT_TEST
→ AUTOLUPA
→ FIXED_POINT somente quando não existe residual material
```

Contrato:

```text
PROOF_REQUIRED_BEFORE_ACCEPTANCE=true
COUNTERPROOF_REQUIRED_BEFORE_ACCEPTANCE=true
ACCEPTANCE_IS_COMPUTED_NOT_VOTED=true
ACCEPTANCE_RESULT_ENUM=ACCEPTED|PARTIAL|REJECTED|UNKNOWN
ACCEPTED=PROOF_SURVIVED_COUNTERPROOF_AND_NO_MATERIAL_RESIDUAL
PARTIAL=ONLY_PROVEN_GOOD_SURVIVES_AND_RESIDUAL_RETURNS_TO_RECONCILIATION
REJECTED=COUNTERPROOF_DEFEATED_THE_CANDIDATE
UNKNOWN=INSUFFICIENT_EVIDENCE_NO_PASS
SURVIVED_COUNTERPROOF_CAN_SEAL=true
DEFEATED_COUNTERPROOF_MUST_NOT_SEAL=true
UNKNOWN_COUNTERPROOF_MUST_NOT_SEAL=true
RECONCILIATION_PRESERVES_PROVEN_GOOD=true
RECONCILIATION_DISCARDS_ONLY_DISPROVEN_DELTA=true
SEALED_CLAIM_NO_REEXECUTE_WITHOUT_NEW_MATERIAL_CAUSE=true
NEW_MATERIAL_CAUSE_REQUIRES_REOPEN_WITH_CAUSE_REF=true
FIXED_POINT_REQUIRES_DETERMINISTIC_CLOSURE=true
```

O aceite reutiliza o ledger já existente de claim seals. `SEAL` representa
aceite determinístico do claim no escopo provado; `REOPEN` exige `cause_ref`
material. Troca de agente, nova conversa, repetição da mesma discussão ou
curiosidade sem evidência nova não reabre claim selado.
## Camada de tradução obrigatória

Antes de apresentar qualquer equação:

1. explicar em uma frase o problema que ela resolve;
2. nomear cada entrada em linguagem comum;
3. mostrar um exemplo pequeno com números inteiros ou percentuais;
4. mostrar o caminho `antes → evidência → depois`;
5. só então exibir a fórmula;
6. encerrar dizendo o que o resultado permite concluir e o que não permite.

Quando a pessoa não quiser ou não precisar operar a fórmula, executar o calculador e explicar o resultado sem exigir manipulação algébrica. Não remover a matemática: manter a fórmula como prova auditável, com tradução ao lado.

## Fluxo obrigatório

### 1. Fixar decisão e fonte da verdade

Registrar:

```text
DECISÃO:
HIPÓTESE PRINCIPAL:
HIPÓTESES ALTERNATIVAS:
FONTE DA VERDADE:
AMBIENTE/HEAD_SHA:
CUSTO DO FALSO POSITIVO:
CUSTO DO FALSO NEGATIVO:
AUTORIDADE NECESSÁRIA:
```

Formular hipóteses que possam ser diferenciadas por observação. Se não houver teste capaz de distingui-las, marcar `NÃO TESTÁVEL NO ESCOPO`.

### 2. Definir prior sem teatro numérico

- Usar frequência histórica ou base rate quando houver.
- Usar intervalo e análise de sensibilidade quando o prior for incerto.
- Usar `0,5` apenas como cenário neutro declarado, não como fato.
- Evitar `0` e `1`: tornam a crença dogmática e impedem atualização ordinária.
- Registrar quem escolheu o prior e com qual evidência.

### 3. Construir o ledger de evidências

Para cada item, registrar:

```text
ID:
OBSERVAÇÃO:
PROVENIÊNCIA:
REPRODUZÍVEL: sim | não
PERTENCE AO MESMO ALVO/HEAD_SHA: sim | não | desconhecido
DEPENDÊNCIA/CLUSTER:
P(E|H):
P(E|¬H):
LR = P(E|H) / P(E|¬H):
BASE DO LR: empírica | estimada | ordinal
LIMITAÇÃO:
```

Somente usar LR numérico quando houver base defensável. Quando não houver, classificar ordinalmente como `favorece H`, `neutro`, `favorece ¬H` e calcular uma faixa de sensibilidade, nunca um número decorativo.

### 4. Verificar dependência

Agrupar evidências derivadas da mesma fonte, execução ou narrativa. Não multiplicar separadamente, por exemplo:

- screenshot e texto copiado do mesmo screenshot;
- teste verde e relatório que apenas repete esse teste;
- duas IAs citando a mesma resposta original;
- tamanho e nome derivados do mesmo metadado de arquivo.

Para dependências desconhecidas, calcular dois cenários:

1. **conservador:** um LR por cluster;
2. **otimista:** independência explícita.

Se a decisão mudar entre os cenários, marcar `SENSÍVEL À DEPENDÊNCIA`.

### 5. Atualizar a crença

Usar odds para múltiplas evidências:

```text
odds_prior = p / (1 - p)
odds_posterior = odds_prior × LR1 × LR2 × ... × LRn
p_posterior = odds_posterior / (1 + odds_posterior)
```

Para cálculos e gates determinísticos, executar `scripts/meta_lupa.py`. Ler `references/matematica-e-calibracao.md` quando houver múltiplas hipóteses, dependência, sensibilidade ou necessidade de justificar o LR.

### 6. Medir incerteza e escolher o próximo teste

Calcular entropia binária:

```text
H(p) = -p log2(p) - (1-p) log2(1-p)
```

Priorizar testes por valor esperado da informação:

```text
VOI = perda esperada antes
    - perda esperada depois do teste
    - custo total do teste
```

Incluir em `custo total`: tempo, dinheiro, risco operacional, reversibilidade, exposição de dados e custo cognitivo.

Preferir observação read-only, hash, diff, call sites, teste isolado e restauração controlada antes de mudanças no sistema. Ação que muda estado sem reduzir incerteza é aposta, não investigação.

### 7. Converter posterior em decisão sem ultrapassar autorização

Calcular o limiar teórico quando existirem custos comparáveis:

```text
p* = C_falso_positivo / (C_falso_positivo + C_falso_negativo)
```

Usar o limiar apenas como apoio. Antes de agir, aplicar gates separados:

```text
POSTERIOR SUFICIENTE?
EVIDÊNCIA REPRODUZÍVEL?
MESMO HEAD_SHA/ALVO?
SEM BLOQUEIO CRÍTICO?
ROLLBACK COMPROVADO?
AUTORIZAÇÃO PRESENTE?
```

Um posterior alto não autoriza exclusão, deploy, restart, produção, acesso sensível ou outra ação crítica.

### 8. Executar o Gate de Falsificação

Antes do veredito, responder:

1. Que observação faria a hipótese perder força?
2. Qual evidência foi procurada contra a conclusão preferida?
3. O teste distingue as hipóteses ou apenas confirma a narrativa?
4. Qual resultado produziria `BLOQUEADO`?
5. A conclusão sobrevive aos priors mínimo e máximo plausíveis?

Se não houver resposta concreta para a primeira pergunta, a hipótese está protegida contra refutação e não está pronta para decisão técnica.

### 9. Executar a AutoLupa

Revisar a própria análise como se tivesse sido produzida por outro agente:

1. procurar evidência ignorada contra o veredito;
2. verificar se o mapa canônico foi realmente lido ou apenas presumido;
3. procurar duplicação de pasta, rota, serviço, documento, regra ou método;
4. verificar se evidências correlacionadas foram contadas mais de uma vez;
5. tentar produzir um caso de regressão, rollback falho, falso verde ou SHA divergente;
6. conferir se confiança foi usada indevidamente como autorização;
7. comparar a saída com a intenção humana, interpretando falta de vocabulário pelo contexto e pelas provas, não de forma literalista;
8. atualizar o ledger e repetir somente quando surgir contradição ou evidência material nova.

Encerrar em ponto fixo quando uma nova passagem não alterar materialmente hipóteses, bloqueios, risco residual, próximo teste ou veredito. Registrar `PONTO_FIXO_ATINGIDO: sim | não`. Se não atingir, manter `CORRIGIR` ou `BLOQUEAR`; nunca forçar fechamento por contagem de rodadas.

### 9.1 Converter confronto em ouro informacional

Confronto não é pontuação de ego. O ativo é o **ganho de informação** produzido pela diferença entre crença anterior e evidência nova.

```text
CONFRONTO
→ EVIDENCIA NOVA
→ DELTA_DE_CRENCA
→ CONSEQUENCIA REUTILIZAVEL
→ OURO
```

Classificar cada confronto material:

```text
HIPOTESE_SOBREVIVE + PROVA_NOVA       = OURO
HIPOTESE_CAI + CONTRAPROVA            = OURO
EMPATE + UNKNOWN_MELHOR_DEFINIDO      = OURO
AUTOFALSIFICACAO + FRAQUEZA_CORRIGIDA = OURO
REVISAO_EXTERNA + ACHADO_CAUSAL       = OURO
```

Só promover o aprendizado quando:

```text
EVIDENCIA_NOVA=SIM
DELTA_DE_CRENCA_OU_REGRA=SIM
REUTILIZAVEL=SIM
```

Se não houver informação nova nem mudança reutilizável, não abrir novo ciclo ornamental:

```text
MESMO_ERRO + MESMA_DISCUSSÃO + ZERO_INFORMACAO_NOVA + ZERO_MUDANCA
→ DESPERDICIO_DE_CICLO
```

### 10. Selecionar revisão proporcional ao ambiente

- Em desenvolvimento sem clientes, automatizar teste, revisão, fallback determinístico, correção mínima e nova tentativa dentro da autorização vigente.
- Quando houver produção real, clientes, volume ou impacto material declarado, exigir revisão adversarial independente e simultânea das superfícies críticas antes da promoção.
- IA indisponível não encerra o fluxo: usar checks e scripts determinísticos. Falha determinística impede a tentativa defeituosa e retorna para correção; não vira falso verde.
- Não prometer `100%` de certeza. Buscar evidência suficiente para o custo do erro e declarar o risco residual que não pode ser eliminado.

## Saída obrigatória

```text
VEREDITO: APROVAR | CONDICIONAR | CORRIGIR | BLOQUEAR
TRADUÇÃO DIRETA:
DECISÃO:
HIPÓTESES:
FONTE DA VERDADE:
PRIOR OU FAIXA:
EVIDÊNCIAS:
CLUSTERS/DEPENDÊNCIAS:
LRs OU CLASSIFICAÇÃO ORDINAL:
POSTERIOR OU FAIXA:
ENTROPIA ANTES/DEPOIS:
SENSIBILIDADE:
FALSIFICADOR:
PRÓXIMO TESTE:
VALOR DA INFORMAÇÃO:
CUSTO DO ERRO:
BLOQUEIOS:
AUTORIZAÇÃO:
RISCO RESIDUAL:
ENCAIXE NO MAPA:
ESTADO DE CONSOLIDAÇÃO:
MECANISMO DE TRAVA:
AUTOLUPA:
PONTO FIXO ATINGIDO:
REGISTRO:
FIO DA MISSÃO:
```

Se faltarem dados para números honestos, emitir análise qualitativa e especificar o experimento necessário. `NÃO CALCULÁVEL COM A EVIDÊNCIA ATUAL` é um resultado válido.

## Gate operacional obrigatorio

Qualquer operacao que altere, promova ou declare estado do repositorio deve
carregar esta META LUPA e apresentar um recibo fresco, amarrado ao HEAD e a
identidade canonica da arvore. A prova minima e:

```text
META_LUPA_LOADED=SIM
META_LUPA_CANONICAL_SHA=<tree SHA de .agents/skills/meta-lupa>
META_LUPA_RECEIPT_VALID=SIM
META_LUPA_USAGE_ID=<usage_id deterministico>
META_LUPA_GATE=PASS
```

O gate executavel vive no motor existente, sem criar outra Lupa:

```text
python .agents/skills/meta-lupa/scripts/meta_lupa.py issue-gate-receipt \
  --repo-root . --repo ServerVpss/CentralDark --mission-id <id> \
  --workspace-head <HEAD> --output <TEMP>/meta-lupa-gate.json
python .agents/skills/meta-lupa/scripts/meta_lupa.py gate \
  --repo-root . --input <TEMP>/meta-lupa-gate.json --operation <operacao>
```

O recibo e rejeitado quando falta carregamento, SHA/skill divergente, HEAD
divergente, `usage_id` incorreto, hash do recibo invalido ou idade acima de
15 minutos. Operacoes, workflows e declaracoes verdes devem tratar qualquer
falha como `STATUS=BLOCKED`; uma declaracao verde sem recibo recebe
`REASON=BLOCKED_FALSE_GREEN`. A ausencia de branch protection auditavel no
GitHub nao autoriza relaxar este gate local ou no CI.

## Recursos

- Ler `references/matematica-e-calibracao.md` para fórmulas, dependência, sensibilidade, múltiplas hipóteses e interpretação correta.
- Ler `references/casos.md` para padrões aplicados a arquivos, agentes e mudanças críticas.
- Executar `scripts/meta_lupa.py --help` para cálculos e gates determinísticos.
- Executar `testes/test_lupa.py` para validar o motor antes de cada uso crítico.

## Modo ULTRA + META LUPA e evolução contínua

`ULTRA + META LUPA` é um modo interno da skill única. Ele combina as três
temperaturas, prova contrária, antes/depois, delta de runtime, regressão,
AutoLupa e revisão até ponto fixo. Não cria outra skill, versão ou ledger.

Toda execução abre `BEGIN` e encerra `FINAL` no ledger canônico
`references/uso-ledger.jsonl`. O `FINAL` deve registrar missão, HEAD, modo,
gatilhos, risco, erro, causa raiz, prova contrária, teste/regressão, falso
verde, guardrail, rollback, melhorias, risco residual, arquivos, hash de
evidência, XP, nível, tier, ponto fixo e veredito.

XP só é concedido a fatos comprovados e declarados por `--achievement`:

```text
erro_reproduzido=5
causa_raiz_provada=10
prova_contraria_encontrada=10
falso_verde_bloqueado=20
teste_negativo_criado=15
regressao_criada=20
guardrail_novo=20
rollback_provado=20
risco_critico_evitado=30
duplicacao_real_removida=15
ponto_fixo_atingido=25
```

Penalidades explícitas usam `--penalty`: `falso_verde_declarado=-25`,
`evidencia_inventada=-50`, `ledger_orfao=-15`, `sucesso_sem_teste=-10` e
`alteracao_sem_autorizacao=-30`. O total nunca fica abaixo de zero.

O fingerprint determinístico é SHA-256 de `MISSION_ID + causa raiz + teste +
evidência + HEAD_SHA`. Se já existir em um `FINAL`, `XP_GAINED=0` e
`NO_XP_REASON=EVENTO_JA_REGISTRADO`. Tempo ligado, texto, número de agentes,
repetição, HTTP 200 ou painel verde não geram XP.

O custo do próximo nível é `ceil(100 * 1.15^(LEVEL - 1))`; o cálculo consome
sucessivamente cada limiar e permite múltiplos níveis no mesmo evento. Tiers:
níveis 1-9 `OPACA`, 10-29 `MONOCULO`, 30-49 `PRISMATICA`, 50+
`OMNIVISOR`. A AutoLupa deve validar cálculo, deduplicação, BEGIN/FINAL e
proveniência antes de selar o recibo.

### Integração determinística com a Skill-Mãe e Kimetsu

Esta é a forma operacional da metáfora: **Meta-Lupa em uma mão e o Método
Operacional CentralDark na outra**. O owner do ciclo permanece
`centraldark-operational-method`; o catálogo
`centraldark-operational-method/catalogo/CATALOGO.md` roteia a intenção e o
owner Kimetsu (`kimetsu-brainstorm`) escolhe a técnica conforme a condição
observada. Meta-Lupa mede, falsifica, registra e sela o efeito no ledger
existente `references/uso-ledger.jsonl`.

Sequência única:

`CATÁLOGO → KIMETSU_SELECIONA → MÉTODO_EXECUTA → METALUPA_CONTRAPROVA →
SELO_XP → RECIBO/NEXT_CURSOR`.

Catálogo, seleção ou documentação não significam execução. O `finish-use`
novo exige `--seal-claimed sim` e ao menos um `--delivered-trace-refs`; sem
esses elementos a gravação do `FINAL` é bloqueada. O registro também pode
transportar `--kimetsu-round-id` e `--kimetsu-techniques` para preservar a
proveniência da escolha sem criar histórico paralelo. Registros históricos sem
`seal-xp/v1` permanecem intactos e são auditados como legado.

O ponto fixo local só pode ser declarado quando a AutoLupa, o guardrail Selo-XP,
o recibo e a contraprova estiverem no mesmo ciclo. `UNKNOWN != PASS`.

---

## Camada XP Consolidada (evolução no mesmo artefato)

Esta seção é extensão canônica (Princípio 11 + Gate Mapa item 4). Não cria V2.

### XP-1. contract_digest (resumo de contrato operacional)

Antes de executar uma missão longa, o executor emite um digest de 1 parágrafo
reforçando o contrato: fonte da verdade, autoridade final, gates de parada,
o que NÃO é permitido nesta rodada e o veredito mínimo aceitável.
O digest não substitui o mapa; é âncora de escopo. Se o digest contradiz o
mapa canônico, o mapa vence e o digest é CORRIGIDO.

### XP-2. candidate_ref (referência de candidato canônico)

Toda skill/arquivo citado por nome deve resolver para um caminho Git real
com `blob SHA`. Se houver duas candidatas conflitantes → `BLOCKED_SKILL_IDENTITY`.
Regra da missão: cópia baixada solta (ex: `METALUPA-BAYESIANA-CANONICA.md.lnk`)
NUNCA é fonte da verdade; só o repo conectado conta. Destino local canônico
desta skill: `.agents/skills/meta-lupa/`.

### XP-3. Comitês independentes

Para decisão crítica (deploy, consolidação, área protegida):
- **Executor** propõe e implementa.
- **Crítico** revisa o MESMO SHA/HEAD sem herdar o veredito; pode ser Grok,
  Gemini ou DarkAI, desde que não seja o executor.
- **Síntese** (Arquiteto) consolida divergências em veredito único.
Modelo ≠ setor. Um cérebro não vira "novo time".

### XP-4. AutoLupa registrada (ponto fixo auditável)

A AutoLupa (Fase 9) deve produzir um bloco curto no fim do relatório:
`PONTO_FIXO_ATINGIDO: sim|nao` + lista das 15 verificações respondidas
(reaproveitar existente / duplicação / EF na VPS / demo como real / secret /
provider vs rota / sobrevive troca modelo / relatório sem chat / autossep /
crítico mesmo SHA / branch só escopo / rollback / PR evidências / autoridade
SEGREDO/CHEFE / contradição fechada). Sem o bloco, veredito não sela.

### XP-5. Matriz de existência de recursos

| Recurso | Caminho | Estado |
|---|---|---|
| motor 3T e cálculo | `scripts/meta_lupa.py` | PRESENTE |
| guardrail | `guardrails/validar_meta_lupa.py` | PRESENTE |
| política | `approvals/politica.json` | PRESENTE |
| regressão 3T | `testes/test_meta_lupa_3t.py` | PRESENTE |
| ref math | `references/matematica-e-calibracao.md` | CRIADO |
| ref casos | `references/casos.md` | CRIADO |
| testes | `testes/test_lupa.py` | CRIADO (7/7) |

### XP-6. Versionamento implícito

Esta skill não usa semver. Maturidade = geração MetaLupa (pós-Lupa v1).
Toda evolução é correção mínima neste arquivo + recursos citados, nunca
novo arquivo paralelo. Blob atual de referência: `b71af825` (base recuperada).

## Guardrails de evidência experimental (Opus 5, 2026-07-28)

O ganho replicado de Opus 5 + Meta Lupa só pode ser promovido quando cada
execução apresenta recibo verificável: processo iniciado, PID observado,
processo encerrado com `exit_code=0`, log novo com SHA, stream completo,
recibo final, hashes de fixture e prompt, testes antes/depois no diretório
correto e `MODEL_ACTUAL` comprovado pelo stream real. Modelo solicitado nunca
substitui prova do modelo efetivamente usado; fallback silencioso é rejeitado.

Contagens de caracteres ficam separadas de tokens. `OUTPUT_CHARS` não é
`TOKEN_USAGE`; tokens só podem ser preenchidos por `modelUsage` real e, na
ausência dessa fonte, permanecem `UNKNOWN`. JSON primitivo, stream parcial,
log antigo, timeout, fixture contaminada, recibo incompleto, `exit 0` sem
execução e denominador que confunde falhas com testes são inválidos.

O denominador do laboratório congelado é `SEEDED_FAILURES_TOTAL=4` e
`TESTS_TOTAL=5`. O resultado é pontuado por ação correta e oráculo
independente, preservando módulos corretos e distinguindo falha encontrada de
falha apenas citada. Fable permanece `EXPERIMENTAL_FAIL_CLOSED`, fora do
roteamento padrão, até existir controle comparativo válido com a mesma
fixture, prompt, modelo, timeout, orçamento e manifesto de testes, com pelo
menos duas seeds válidas por braço.

## Percentual evidencial e fechamento de lacunas

Quando o pedido, gate ou relatório usar porcentagem, a Meta Lupa mede um
**escopo fechado**, nunca uma impressão geral. O medidor canônico desta skill é:

```text
scripts/percentual_evidencial.py
```

Contrato obrigatório:

```text
SCOPE=<escopo finito>
HEAD_SHA=<40 hex do mesmo candidato>
DECLARED_DENOMINATOR=<quantidade de checks required=true>
NUMERATOR=<checks required=true com status PASS + evidência>
DENOMINATOR=<DECLARED_DENOMINATOR validado contra os checks>
COVERAGE_PERCENT=NUMERATOR / DENOMINATOR * 100
```

Regras fail-closed:

1. o denominador é declarado antes do resultado e deve ser idêntico à quantidade de checks `required=true`;
2. `PASS` sem evidência não entra no numerador e bloqueia o manifesto;
3. `UNKNOWN`, `SKIPPED`, `BLOCKED` e `FAIL` continuam dentro do denominador e nunca viram PASS;
4. toda lacuna requerida deve trazer `next_test`: o teste/evidência que pode preenchê-la na próxima rodada;
5. `NOT_APPLICABLE` não pode retirar item requerido do denominador;
6. IDs duplicados bloqueiam a medição;
7. denominador zero ou ausente produz `NOT_MEASURED`/bloqueio, nunca `100%`;
8. `100%` só é alegável quando `NUMERATOR == DENOMINATOR`, todos os itens requeridos estão em PASS com evidência e não existe lacuna;
9. `resolution_plan_percent` mede somente quantas lacunas possuem um próximo teste explícito; não mede eficácia nem transforma UNKNOWN em conhecimento;
10. o manifesto recebe SHA-256 canônico para provar que o denominador e os checks medidos não mudaram depois do resultado.

Uso:

```text
python scripts/percentual_evidencial.py measure --input <manifest.json>
python scripts/percentual_evidencial.py self-test
```

A saída pode declarar `100%` **somente dentro daquele denominador fechado e reproduzível**. Isso não contradiz a proibição de prometer certeza universal: `100% do contrato medido` é diferente de `100% de certeza sobre o mundo`.
menos duas seeds válidas por braço.


## META-GRILL / autoentrevista CURRENT

Antes de resposta operacional material ou mutação, usar o gancho **já existente** `KITS/METAGRILL-METALUPA/META-GRILL/GANCHO.md`: intenção explícita → hierarquia CURRENT → cláusulas do Goal → GREEN_STATE → owner → sintoma/causa → contraprova (inclusive sensor) → menor delta → necessidade real de Oracle → veredito/receipt/NEXT_CURSOR. A entrevista é verificação de critérios, não diálogo inventado em nome do CHEFE, nem exposição de cadeia de pensamento privada. Respostas casuais não exigem ritual; só o cone causal pertinente é revalidado.

`META_GRILL != AUTHORIZATION`; `DOCS_HISTORICAL != CURRENT_AUTHORITY`; `GREEN_STATE_MUST_BE_PRESERVED`; `REALITY_JUDGE_IS_NOT_EXECUTION_PERMISSION`; `GOAL_CLAUSE_STATUS != UI_COLOR`.

Contrato completo e G01..G12: `docs/CONSCIENCIA/PROGRAMAS/INTENCAO-DEVOLVIDA-LOOP-MESTRE-20260923.md#21-cristal-2026-10-08--goal-clause--meta-grill--oracle--obsidian`.

## Avaliação de agentes e descoberta científica baseada em evidência (2026-10-20)

Esta seção integra resultados de pesquisa ao **Meta-Lupa existente**. Não cria skill,
agente, roteador, ledger ou núcleo paralelo. Aplicar o contrato às missões de
execução e investigação que já passam por Meta-Lupa, Meta-Grill, Fable,
reconciliação e Fixed Point.

### 1. Separar três capacidades que não são equivalentes

- **Resposta/conhecimento:** produzir uma afirmação plausível ou correta.
- **Execução de agente:** usar ferramentas e estado externo para concluir uma tarefa.
- **Descoberta científica:** propor um modelo/teoria, derivá-lo e produzir previsões
  que resistam a verificação independente.

Sucesso numa categoria não implica sucesso nas outras. Uma resposta bem escrita,
um plano coerente, uma tarefa COMPLETED, um processo vivo, HTTP 200 ou um
painel verde não demonstram, isoladamente, que a ação ou a descoberta ocorreu.

### 2. Contrato mínimo de evidência para agentes

Para cada alegação material de execução, correlacionar no recibo canônico existente:

- MISSION_ID, OWNER, SOURCE_SHA e MODEL_ACTUAL quando observável;
- TOOL/ARGS_SANI, RUN_ID, EXIT_CODE quando aplicável;
- ARTIFACT_SHA, EFFECT_READBACK, COUNTERPROOF, RESULT e NEXT_CURSOR.

Regras:

1. Definir o critério de sucesso antes da execução.
2. Separar intenção, chamada da ferramenta, saída, efeito externo e confirmação.
3. Reconsultar o efeito por um canal independente da afirmação do executor sempre
   que isso for tecnicamente possível.
4. Incluir pelo menos um teste negativo ou hipótese contrária para missões materiais.
5. Usar PASS somente com evidência ligada ao mesmo alvo/SHA e critério; caso
   contrário usar UNKNOWN, BLOCKED, FAIL ou NOT_RUN corretamente.
6. Preservar rastros originais; sanitizar segredos antes da ingestão; deduplicar
   pelo fingerprint existente. Não promover similaridade, telemetria ou relato a fato.
7. Medir apenas o escopo declarado. Não converter uma pontuação de benchmark em
   probabilidade universal de sucesso ou em autorização para agir.

### 3. Contrato para avaliar descoberta científica

Para experiências que afirmem redescobrir um resultado histórico, registar antes
da execução:

- data de corte do corpus e proveniência dos dados;
- corpus, tokenizer, modelo/base e treino efetivamente usados;
- prompts, contexto fornecido, orçamento, seeds e saídas integrais;
- auditoria de contaminação e informação posterior ao corte;
- critério de pontuação pré-registado e avaliadores independentes.

Pontuar etapas separadamente: (a) identificar anomalias; (b) escolher quais hipóteses
manter ou abandonar; (c) propor princípios novos; (d) derivar matematicamente o
resultado; (e) produzir previsões testáveis; (f) passar verificações simbólicas,
numéricas, casos-limite e revisão de especialistas independentes. Uma analogia
interessante ou a equação final isolada não equivale a uma teoria redescoberta.
Se a anomalia ou o caminho para a solução foi explicitamente entregue no prompt,
registrar essa ajuda: resolver o prompt não prova descoberta espontânea.

### 4. Contrato para benchmarks de agentes

Ao importar números de benchmarks, preservar URL/fonte primária, data, versão,
tarefa, modelo realmente avaliado, orçamento, ambiente, denominador, métrica,
intervalo/incerteza quando publicado e limitações. Não combinar pontuações
incompatíveis sem a normalização documentada; não tratar resultados de fornecedores
ou resumos secundários como prova primária.

Separar pelo menos: engenharia de software; busca/terminal; uso de ferramentas/GUI;
recuperação após erro; segurança; e descoberta científica. Relatar tanto o resultado
final quanto a qualidade da verificação e a taxa de falsos positivos/falsos verdes.
Comparações válidas exigem tarefas e condições equivalentes, ambiente reproduzível,
casos de teste reservados e baseline explícito.

### 5. Fontes de pesquisa incorporadas como referências, não como autoridade automática

- Philip Ball, Nature, The Einstein test: what happens when AI tries to rediscover
  relativity? (09 Sep 2026): https://www.nature.com/articles/d41586-026-02804-x
- Brian Keating, The Artificial Einstein Test — discussão de GPT-1900/Machina
  Mirabilis e limites de interpretação: https://keating.ai/einstein-test/
- IDE-Bench, avaliação de agentes de IDE em repositórios/tarefas não publicados:
  https://arxiv.org/abs/2601.20886
- OpenHands Index, avaliação de agentes de engenharia em várias famílias de tarefas:
  https://www.openhands.dev/blog/introducing-the-openhands-index
- AgentSWE, tarefas de criação, edição e otimização com casos reservados:
  https://github.com/VectorSpaceLab/AgentSWE

As fontes sustentam o desenho dos critérios, não provam que uma implementação da
CentralDark já os cumpre. Antes de declarar cobertura do núcleo, validar a mudança
por teste no mesmo SHA e por contraprova. A promoção de qualquer score, nova regra
ou workflow continua sujeita ao gate Meta-Lupa/AutoLupa existente.

### 6. Aceite operacional

- Nenhum núcleo, skill, executor ou ledger paralelo criado.
- O mesmo owner e recibo canônico permanecem responsáveis.
- Uma afirmação de conclusão sem efeito observado falha fechado.
- Uma alegação de descoberta sem corte de dados, auditoria de contaminação,
  derivação e validação independente fica NOT_PROVEN.
- A mudança só é considerada incorporada após revisão, testes aplicáveis e merge;
  merge não equivale a deploy nem comprova comportamento em runtime.


### 7. Ciclo de melhoria contínua orientado por experiência e alvo externo

Inspirado em A-Evolve-Training (arXiv:2606.20657), este contrato reaproveita os recibos e o funil existentes. Não cria banco de experiências, executor, orquestrador, worker pool ou serviço paralelo. Reutilizar o armazenamento canônico de execuções/recibos já existente; se não for comprovado, registrar a lacuna.

#### 7.1 Registro reutilizável de experiência

Cada tentativa material contribui para o recibo canônico com: objetivo e critério prévio; baseline imutável (SHA/configuração/dados); hipótese e delta mínimo; ferramenta/argumentos sanitizados, run ID e custo quando disponível; logs/artefatos por hash; métricas internas e externas; falha observada versus causa ainda hipotética; decisão de reutilizar/rejeitar/retestar; contraprova e NEXT_CURSOR.

Preservar falhas e sucessos como evidência, não como verdades universais. Reutilizar apenas quando ambiente, versão e objetivo forem comparáveis. Deduplicar pelos mecanismos existentes. Não persistir tokens, credenciais, dados pessoais desnecessários ou logs brutos sem sanitização e retenção definida.

#### 7.2 Loop de pesquisa com limites

1. Definir o alvo externo e o critério de sucesso antes de explorar.
2. Fixar baseline reproduzível e separar desenvolvimento de avaliação.
3. Explorar candidatos isolados, com limites de tempo, custo, concorrência e permissões.
4. Capturar execução, falhas e artefatos no recibo existente.
5. Medir proxy interno e alvo externo/holdout independente quando disponível.
6. Comparar com baseline e executar regressão/contraprova.
7. Promover somente o delta que melhora o alvo declarado sem violar invariantes.
8. Atualizar a política de busca, não sobrescrever o baseline nem autoalterar regras de segurança.
9. Parar por orçamento, regressão, evidência inconclusiva, falta de autorização ou ausência de avaliação externa confiável.

Autonomia não autoriza alteração de produção, permissões, segredos, orçamento ou critérios de segurança. Deploy, ações irreversíveis e mudança de owner continuam sob as autorizações existentes.

#### 7.3 Divergência entre proxy e alvo externo

Registrar métricas internas/externas com versões e amostras comparáveis. Se o proxy melhorar sem melhora externa, ou divergirem além de limiar pré-definido:

- marcar PROXY_DIVERGENCE, nunca PASS;
- suspender promoção baseada apenas no proxy;
- investigar contaminação, vazamento entre conjuntos, regressão e mudança de distribuição;
- testar hipóteses alternativas e procurar contraprova;
- alterar a política de busca somente sob as regras existentes;
- retomar promoção apenas após holdout independente ou contraprova adequada confirmar melhoria.

Sem alvo externo, holdout ou poder estatístico suficiente, usar UNKNOWN/NOT_MEASURED. Não inventar limiar depois de observar resultados. Uma pontuação interna crescente pode ser sobreajuste.

#### 7.4 Exploração paralela segura

Se worktrees/containers isolados já existirem, delimitar diretório, recursos, timeout, permissões e artefatos por tentativa; manter baseline imutável e recolher resultados por esquema determinístico. Não criar workers/containers automaticamente sem comprovar suporte existente. Sem isolamento, executar serialmente ou bloquear.

#### 7.5 Aceite

- Experiência recuperável no owner/recibo canônico existente.
- Baseline e critério definidos antes da tentativa.
- Métricas internas e externas separadas.
- Divergência do proxy detectada como risco, não sucesso.
- Artefatos, falhas e contraprovas ligados ao mesmo run/SHA.
- Promoção reproduzível e reversível; sem produção automática sem autorização.
- PASS somente quando melhoria no alvo externo estiver demonstrada; caso contrário UNKNOWN, BLOCKED, FAIL ou NOT_MEASURED.


#### 7.6 Roteamento de revisão com fallback

Nenhum provedor de revisão externo (incluindo Codex) é dependência obrigatória do fluxo. Falha, quota, timeout, indisponibilidade ou resposta inválida de um provedor deve gerar um evento/recibo com rota, causa, alvo/SHA e horário; exibir a falha de forma legível; e seguir para a próxima rota autorizada já existente.

Ordem de tentativa para revisão de PR, conforme capacidades realmente disponíveis:

1. Revisor inicialmente escolhido, se disponível.
2. Modelo local CURRENT pela workflow existente `.github/workflows/pr-agent.yml` (workflow `PR Review — IA local CentralDark`), registrando modelo/fonte/classe de execução que o próprio health endpoint reportar.
3. Checklist determinístico existente `.github/workflows/pr-auto-review.yml` para scanner de segredos, diff e classificação de escopo; ele complementa, mas não finge ser parecer semântico de IA.
4. Sentinela/workflow canônico existente quando o problema for divergência de estado, rota ou execução; não usar a Sentinela de drift como se fosse revisora de código se ela não executou análise do diff.
5. Outra rota local/autorizada descoberta no catálogo unificado, sem inventar nomes nem criar um novo dispatcher.

Cada tentativa deve produzir estado próprio: `PASS`, `FAIL`, `BLOCKED`, `NOT_RUN` ou `UNKNOWN`. Uma chamada MCP concluída só prova que a ferramenta foi invocada; não prova que a revisão foi feita. Só aceitar revisão quando houver conteúdo de parecer ligado ao PR e ao HEAD exato. Não converter fila/runner pendente, saída vazia, erro de provedor ou checklist determinístico em aprovação semântica.

Se uma rota falhar, registrar a causa e continuar automaticamente pelas rotas autorizadas restantes. Só declarar `BLOCKED` quando as alternativas aplicáveis tiverem sido tentadas ou estiverem comprovadamente indisponíveis, ou quando faltar autorização/isolamento necessário. A mensagem de falha deve apontar a próxima rota e o estado dela. Reutilizar os workflows, recibos e funil existentes; não criar novo agente, banco, roteador ou ledger.


#### 7.7 Recursão efetiva do aprimorador e autoprovisionamento

Distinguir explicitamente:

- `STRUCTURAL_RECURSION`: o sistema revisa/modifica o método e reutiliza a versão revisada no ciclo seguinte.
- `EFFECTIVE_RECURSION`: a versão revisada, aplicada em tarefas equivalentes e sob orçamento/tempo/compute comparáveis, supera a baseline em uma métrica-alvo externa previamente definida, sobrevive a contraprova e reproduz o ganho em novas execuções.
- `SELF_PROVISIONING`: o sistema prepara/atribui recursos para a próxima rodada usando capacidades, limites, owners e provisionadores já existentes; não significa permissão irrestrita para criar infraestrutura ou aumentar custo.

Contrato mínimo do experimento: fixar antes do teste o baseline SHA/método, conjunto de tarefas, alvo externo, direção da métrica, limites de recursos, orçamento, número de tentativas e critério de regressão. Comparar baseline e candidato com o mesmo conjunto ou pares equivalentes, ambiente/controlos comparáveis e contabilidade explícita de tokens/compute, tempo, chamadas e custo. Usar holdout não empregado na otimização; registrar variância e repetições suficientes para distinguir ganho de ruído. Artefatos, medições e contraprovas devem apontar para os mesmos run IDs e SHAs. Se o ganho existir apenas na métrica interna, classificar `PROXY_DIVERGENCE`; se custo/recursos forem incomparáveis, classificar `INCOMPARABLE_BUDGET`; se faltar medição externa independente, manter `UNKNOWN/NOT_MEASURED`. Nenhum desses estados autoriza promoção.

Após ganho externo reproduzido, a versão candidata pode virar o novo método de busca/revisão do próximo ciclo — com versão, receipt, rollback e regressão preservados. Autoprovisionamento pode reservar/reutilizar apenas recursos já autorizados, isolados e limitados, via owner/provisionador existente. A criação de worker, container, credencial, serviço, quota ou gasto novo exige autorização e gates que já regem esse recurso; não contornar limites, não ampliar privilégios e não provisionar a si próprio uma autoridade maior. Sem rota de provisionamento comprovada, não simular: registrar `BLOCKED` e apontar o owner existente. Reutilizar os registros/receipts e funis canônicos; não criar banco de experiências, supervisor ou núcleo paralelo.

`FIXED_POINT` deste ciclo exige: (1) método revisado efetivamente reutilizado; (2) ganho externo contra baseline comprovado sob recursos comparáveis; (3) contraprova/regressão executada; (4) reprodução independente; (5) promoção reversível registrada. Caso contrário, registrar somente `STRUCTURAL_RECURSION` ou o estado exato alcançado — nunca declarar autoaprimoramento efetivo por mera recursão do texto/código.
