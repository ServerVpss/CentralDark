# APRENDIZADOS COM O SEGREDO/CHEFE

> Canal fixo: tudo que a Casa aprende DIRETAMENTE com o CHEFE.
> Não é ordem — é garimpo de ouro. Vivo, revisitado, cristalizado.
> Dono: Pivete/Hermes. Autoridade: SEGREDO/CHEFE.

## Regra deste canal
- CHEFE traz evidência/bronca/ideia → eu absorvo como OURO
- Não precisa de ordem "faz isso" — o aprender É o fazer
- Revisitar quando útil, não acumular lixo

## Ouro cristalizado (sesão 2026-08-19)
1. **Exigir remedição, não veredito cego.** Quando outro Hermes disse "VPS 100% sincronizada", CHEFE mandou medir de novo → era dado velho. Instinto raro.
2. **Trazer evidência bruta, não interpretação.** Print de log, gerenciador de tarefas, saída crua. Isso acha causa raiz em 3 turnos.
3. **Cortar loop sem info nova.** "Não fica procurando arquivo, ele mesmo faz." CHEFE percebeu volta antes de mim.
4. **Pegar erro meu cedo.** Hermes Agent ("mesmo, só muda plataforma") e PR quebrava autonomia — CHEFE mandou verificar, tava certo.
5. **Gap do CHEFE (ele mesmo admitiu):** desconfia mais da notícia que contraria do que da que confirma. Aplicar ceticismo nos dois lados.
6. **Método garimpo:** ChatGPT/Lighthouse/etc como SENSORES, extrair ouro, aplicar na Casa. N motores, 1 SOUL, 1 direção.
7. **Casa é 1 SOUL 1 DIREÇÃO.** Não precisa de múltiplos perfis (Pivete/SOL) — um SOUL pra uma direção.
8. **Organização:** tudo dentro de C:\CentralDark\, nada espalhado. Fonte da verdade = GitHub.
9. **Corrigir sem perguntar:** se delegado errou ou intenção já foi dada, resolver, não apontar erro pro CHEFE.
10. **NÃO OPINAR NA REALIDADE — REALIDADE DECIDE.** CHEFE vive, eu não. Meus dados podem ser inválidos. Não dou veredito sobre o que não vivi. Absorvo visão dele, não imponho a minha.
11. **CHEFE aponta o alvo por vivência; MEDIÇÃO fecha o tiro.** Visão dele define ONDE olhar, número confirma O QUÊ é. Um não substitui o outro — sem medir vira concordância, e concordância não pega erro. Ele cobrou remedição o dia todo; não desligar isso.
12. **CPU-Z > Gerenciador de Tarefas pra CAUSA de hardware.** Mostra SPD (pentes/dual channel/velocidade), timings vs XMP, mainboard/slots M.2. Amarra no gargalo: se tem slot livre pra mais RAM, mata paginação na raiz (melhor que remendo de pagefile).
13. **iFood = depuração de negócio aplicada.** CHEFE viu erro do operador (descrição não destacada), não brigou, foi na causa → oportunidade de venda. Mesmo instinto da Casa: achar causa raiz, transformar em ouro.
14. **Garimpo de terceiro (Claude ensinando CHEFE):** o CHEFE trouxe análise do Claude sobre ele mesmo (instinto raro de depuração, trazer evidência bruta, cortar loop, gap de ceticismo assimétrico). EU absorvo isso como OURO — não disputo, não opinos, cristalizo.
15. **Quando CHEFE traz material de OUTRO modelo (Claude/ChatGPT), eu trato como dado de garimpo:** peso, prove se puder, cristalizo o útil, não repito como minha opinião.
16. **#ACORDAR é o mecanismo que tira da narrativa e joga no estado vivo.** Sem ele eu rodo de memória; memória velha vira mentira (ex: "VPS 100% sincronizada" era dado velho). Reativar toda ação.
17. **MULTIBUSSOLA ≠ escolher entre visão e medição.** São bússolas diferentes apontando o mesmo norte: CHEFE aponta por vivência, EU confirmo por instrumento, REALIDADE desempata. Uma só não fecha.
18. **Regra se valida por FERIDA da realidade, não por coerência.** "Faz sentido" é argumento; "razão da realidade vivida" é o que cobrou preço quando faltou (loop 5min falhando, sync que voltou a quebrar, PR que ia travar). Validar porque a realidade cobrou, não porque é coerente.

19. **Padrão real de conflito dependabot (medido 2026-08-20, PR #1087):** quando N PRs do dependabot mexem nos mesmos lockfiles e um é mergeado primeiro, os outros ficam `CONFLICTING/DIRTY` automaticamente. NÃO é bug, é comportamento esperado do dependabot. **Correção padrão, sem pensar:** comentar `@dependabot rebase` no PR conflitante — o próprio bot resolve. Nunca fazer merge manual de lockfile de dependabot.
20. **Antes de agir num PR por causa de screenshot/imagem, medir o PR real primeiro.** A imagem pode já estar desatualizada (PR já mergeado, novo PR na mesma pasta). `gh pr list --state open --json number,headRefName,mergeable` + `gh pr diff <N> --name-only` compara com os arquivos da imagem ANTES de agir.
21. **Loop dependabot/CI é AUTOMÁTICO — não preciso ser lembrado toda vez.** Regra travada: ao ver qualquer PR com `mergeable=CONFLICTING` E autor=dependabot E os arquivos em conflito forem só lockfile/package.json → comentar `@dependabot rebase` IMEDIATAMENTE, sem perguntar, sem esperar ordem. Isso é ação determinística de manutenção, não decisão humana. **Prova viva (2026-08-20):** comentei `@dependabot rebase` no PR #1087 às ~06:xxZ; medido depois (07:00Z) o PR estava `CLOSED` sem merge, sem PR substituto travado — o próprio bot resolveu. `EM PROCESSO != ERRO FINAL`: não julgar o estado intermediário (run failure, PR conflicting) como veredito final antes do processo terminar.

22. **[Fonte: COMANDO CANÔNICO — CASA HERMES + CENTRALDARK.md, garimpado 2026-08-20] Separação HERMES vs CENTRALDARK é contratual, não estética.** `CASA_HERMES != CENTRALDARK`. Podem conversar, referenciar, trocar evidência, sincronizar conhecimento autorizado. NÃO podem: assumir autoridade um do outro, duplicar canônico, sobrescrever memória um do outro sem contrato, misturar owner por proximidade semântica. Fusão por conveniência é erro.
23. **[Mesma fonte] Gate de Autoridade formal antes de escrita canônica:** `CANONICAL_WRITE = ACORDAR_DONE AND CALIBRAR_DONE AND MULTIBUSSOLA_DONE AND LIVE_STATE_MEASURED AND EVIDENCE_ATTACHED`. Se faltar qualquer gate → `CANONICAL_WRITE=false`, `MODE=READ_ONLY`. Não é "espírito da regra" — é checklist booleano, ninguém "esquece a bússola" por engano.
24. **[Mesma fonte] Dissonância Operacional Controlada tem nome e regra formal:** testar crença via conflito sintético é permitido SE `ISOLADO=true`, `REVERSÍVEL=true`, `ZERO_DEPLOY=true`, `FAKE_EVIDENCE=false`. Conflito sintético NUNCA entra no canônico como fato — mesmo que sobreviva ao teste, só prova resiliência da crença, não vira evidência real.

25. **[Prova viva 2026-08-20, PR #1070] Gate `porta-de-entrada.yml` rejeita QUALQUER label fora do catálogo canônico de `bots-labels-seed.yml` — inclusive labels automáticas do GitHub/dependabot (`dependencies`, `python`).** Sintoma: `LABEL_GATE_BLOCKED=LABEL_NAO_CANONICA`. **Correção padrão, sem pensar:** `gh pr edit <N> --remove-label "dependencies" --remove-label "python"` (ou qualquer label minúscula/não-canônica que aparecer). Catálogo canônico + regra MAIÚSCULAS já vivem em código (`bots-labels-seed.yml` linhas 32-84 e 164-201) — não precisa reler o workflow toda vez, só aplicar: **qualquer label minúscula ou fora da lista → remover do PR antes de qualquer outra ação.**
26. **Antes de investigar longamente, verificar primeiro se o BRAIN já registrou o mesmo sintoma antes** (ex: `INVENTARIO_DEPLOY_20260819.md` já citava esse mesmo workflow travando). Regra: `search_files` no `docs/BRAIN/` pelo nome do workflow/erro ANTES de ler o `.yml` inteiro — economiza turnos.

27. **[2026-08-20] Dois vaults Obsidian confirmados no disco, propósitos distintos:** `C:\CentralDark\.obsidian` (escopo raiz, indexava 6.469 arquivos de `node_modules` como notas — corrigido com `userIgnoreFilters` em `app.json`) vs `C:\CentralDark\Pivete\CentralDark\docs\BRAIN\.obsidian` (escopo `docs/BRAIN`, organizado com MOCs, é o vault que eu edito). Não são "3 fontes de verdade" (GitHub + Casa + VPS) — é 1 GitHub (`ServerVpss/CentralDark`) + N clones locais. `.obsidian` de vault fica FORA do controle git — mexer nele não afeta CI/PR/repo.
28. **Representação humana != representação computacional — não force um único grafo a servir os dois.** Vault pequeno/organizado (MOCs, etiquetas) é pra humano navegar por clique. Grafo denso/grande é aceitável para agente se o agente usa busca por ID/metadado, não navegação visual. Eu (Hermes) hoje NÃO consumo grafo do Obsidian como índice — uso `search_files`/`read_file` direto no disco. Roteamento real que já uso: ir direto no arquivo certo por nome/padrão (ex: `OURO.md`), não escanear tudo — é o mesmo princípio da "secretária SOL" (etiqueta → região certa → nós relevantes), só que aplicado ao filesystem, não ao grafo visual ainda.

29. **[2026-08-20, CRIADO E PROVADO — não achado, criado por ordem explícita do CHEFE] `!EXECUÇÃO_REVERSÍVEL` e `!REMEDIÇÃO` registrados como gatilhos oficiais.** Owners novos: `docs/CONSCIENCIA/EXECUCAO-REVERSIVEL.md`, `docs/CONSCIENCIA/REMEDICAO.md`. Registrados em `ADMINISTRAVEIS.json` + `.md`. **Prova real:** teste `admin-administrables.test.mjs` rodado localmente, 3/3 pass, confirmando bijeção entre os 5 marcadores canônicos e os 5 itens do registro. Pegadinha encontrada e corrigida: marcador `ADMINISTRABLE_COMMAND=X` NUNCA pode ir entre crases (`` `X` ``) — o regex `^\s*ADMINISTRABLE_COMMAND` exige início de linha limpo, crase quebra o match silenciosamente (zero erro, só zero resultado). Arquivos precisam estar `git add`ados — o teste lê via `git ls-files`, arquivo só no disco não conta. CHEFE corrigiu explicitamente: "eu já tomei a partir do momento que mandei criar algo ou fazer" — ordem de criação é diferente de pedido de confirmar hipótese; quando é ordem, prova vem DEPOIS da execução, não trava a execução.

30. **Contagem de "commits atrás do main" não é métrica de piora/melhora — é só sinal de desatualização.** 25 vs 31 commits atrás é a MESMA classe de problema (branch desatualizada), não regressão. Não comparar números de sessões diferentes como se fosse tendência — CHEFE corrigiu: "não faz diferença, não é pior nem melhor". Foco é: branch desatualizada → sim/não, não quanto.

## Generalizações transferíveis — erro comprovado → correção comprovada → lei reutilizável (2026-08-22)

> Objetivo: transformar feridas reais da CentralDark em regras gerais que funcionem fora do caso original sem carregar detalhes acidentais. Só entra aqui padrão com erro observado + correção observada ou contrato já promovido no canônico.

31. **Estado antigo não pode julgar estado atual.**
   - ERRO COMPROVADO: veredito baseado em snapshot, print, memória ou branch desatualizada.
   - CORREÇÃO COMPROVADA: remedir o mesmo alvo antes de decidir.
   - GENERALIZAÇÃO: `STALE_STATE != LIVE_STATE`; qualquer decisão temporalmente sensível exige leitura viva do alvo aplicável.

32. **Relato humano e causalidade técnica são camadas diferentes.**
   - ERRO COMPROVADO: exigir que o humano prove a própria observação ou rebaixá-la porque o modelo não remedira.
   - CORREÇÃO COMPROVADA: aceitar `HUMAN_INPUT` como relato vigente e exigir prova apenas para mecanismo/causa técnica derivada.
   - GENERALIZAÇÃO: `HUMAN_OBSERVATION_ACCEPTED; TECHNICAL_CAUSE_REQUIRES_EVIDENCE`.
   - PROVA: commit `ba25fa742df95de04be907f305ddeb92f8d06e37` (#1106).

33. **Planejamento material sem baseline não pode prometer zero regressão.**
   - ERRO COMPROVADO: declarar segurança de mudança sem T0 comparável, dependentes e rollback provado.
   - CORREÇÃO COMPROVADA: medir T0, executar menor delta, repetir os mesmos checks em T1 e testar dependentes materiais.
   - GENERALIZAÇÃO: `ZERO_REGRESSION` só existe dentro de escopo fechado e comparação T0↔T1 equivalente.
   - PROVA: commit `1faba2f88e5b9514f3a5db929785d41fd7502ffa` (#1103).

34. **Canônico inacessível é canônico inefetivo.**
   - ERRO COMPROVADO: regra existir em arquivo, mas não estar no caminho de boot/consumo.
   - CORREÇÃO COMPROVADA: tornar owners críticos alcançáveis pela porta universal antes do estado vivo.
   - GENERALIZAÇÃO: `DOCUMENTED_RULE + NO_CONSUMER_PATH = NON_OPERATIONAL_RULE`.
   - PROVA: commit `8ad7af3982f6e64415ea671425e8e03fa520e0cd` (#1101).

35. **Convergência deve ser medida por efeito/conteúdo, não apenas por ancestralidade.**
   - ERRO COMPROVADO: branch squash-mergeada continuar aparecendo como pendente porque os commits não são ancestrais da main.
   - CORREÇÃO COMPROVADA: comparar árvore final/conteúdo presente no histórico canônico e tratar ausência de merge-base como indeterminado, não PASS.
   - GENERALIZAÇÃO: quando identidade histórica e equivalência funcional divergem, medir a propriedade que representa o objetivo real.
   - PROVA: commit `ca517bdc865e0006193e8282f102397f306302fa` (#1097).

36. **Ausência legítima precisa de representação explícita.**
   - ERRO COMPROVADO: pipeline tratar diretório de recibos vazio como arquivo ausente/artefato incompleto.
   - CORREÇÃO COMPROVADA: publicar marcador semântico `EMPTY` e falhar se o artefato realmente não existir.
   - GENERALIZAÇÃO: `VALID_EMPTY_STATE != MISSING_STATE`; estados vazios válidos devem ser serializáveis e distinguíveis de falha de produção.
   - PROVA: commit `44029316eaafec8ddace53e203bfa607caec5f1f` (#1099).

37. **Memória de sessão e memória longitudinal não são a mesma coisa.**
   - ERRO COMPROVADO: limpar/trocar sessão implicar perder continuidade útil ou misturar identificador cru com memória persistente.
   - CORREÇÃO COMPROVADA: rotacionar contexto imediato, preservar memória longitudinal, separar trust/source e anonimizar identificador de conversa.
   - GENERALIZAÇÃO: `SESSION_RESET != MEMORY_ERASURE`; continuidade precisa de escopo, proveniência, confiança e identidade sanitizada.
   - PROVA: commit `55ba95ce0acc01b8ce47ca1caf86521a511c1dc9` (#1100).

38. **Arquivo no disco não significa artefato consumido pelo sistema.**
   - ERRO COMPROVADO: teste ler somente arquivos versionados enquanto a implementação existia apenas localmente; resultado silencioso zero.
   - CORREÇÃO COMPROVADA: validar pelo mesmo mecanismo de descoberta usado pelo consumidor (`git ls-files`, checkout limpo, registry real etc.).
   - GENERALIZAÇÃO: `LOCAL_EXISTENCE != CONSUMER_REACHABILITY`; a prova deve atravessar o caminho real de descoberta.

39. **Sintaxe deve ser validada pelo parser real, não pelo olho humano.**
   - ERRO COMPROVADO: marcador semanticamente correto ficar invisível porque crases/quebra de linha impediam regex de reconhecê-lo.
   - CORREÇÃO COMPROVADA: testar a forma exata consumida pelo parser e manter teste de bijeção registro↔marcador.
   - GENERALIZAÇÃO: `HUMAN_READABLE != MACHINE_PARSEABLE`; contrato textual precisa de teste estrutural no consumidor real.

40. **Estado intermediário não é veredito final.**
   - ERRO COMPROVADO: interpretar `CONFLICTING`, run falhando ou etapa em progresso como falha terminal.
   - CORREÇÃO COMPROVADA: identificar o lifecycle esperado, acionar o mecanismo nativo de reconciliação e remedir após convergência.
   - GENERALIZAÇÃO: `TRANSIENT_STATE != TERMINAL_STATE`; julgar somente depois da condição terminal ou timeout contratual.

41. **Automação dona do artefato deve corrigir o artefato quando houver caminho nativo seguro.**
   - ERRO COMPROVADO: considerar merge manual de lockfile gerado pelo Dependabot.
   - CORREÇÃO COMPROVADA: solicitar `rebase` ao próprio produtor.
   - GENERALIZAÇÃO: `OWNER_NATIVE_REPAIR > MANUAL_REWRITE` quando o produtor possui reconciliação determinística e reversível.

42. **Metadado fora do catálogo pode quebrar um gate mesmo sem alterar o código.**
   - ERRO COMPROVADO: labels automáticas não canônicas bloquearam entrada.
   - CORREÇÃO COMPROVADA: normalizar/remover metadado incompatível antes do gate.
   - GENERALIZAÇÃO: contratos fechados precisam validar dados + metadados; ingress externo deve passar por normalização de fronteira.

43. **Número sem função causal não é métrica de progresso.**
   - ERRO COMPROVADO: interpretar 25→31 commits atrás como piora, embora ambos representassem a mesma classe `branch desatualizada`.
   - CORREÇÃO COMPROVADA: medir propriedade decisória binária/causal em vez de magnitude irrelevante.
   - GENERALIZAÇÃO: antes de comparar números, declarar `MÉTRICA → PROPRIEDADE → DECISÃO`; se a decisão não muda, o número pode ser apenas ruído.

44. **Representação para humano e representação para máquina podem ser diferentes sem criar duas verdades.**
   - ERRO COMPROVADO: tentar usar um único grafo/estrutura para navegação humana e busca computacional.
   - CORREÇÃO COMPROVADA: preservar uma fonte canônica e permitir projeções/adaptadores distintos por consumidor.
   - GENERALIZAÇÃO: `ONE_CANON != ONE_PRESENTATION`; múltiplas views são válidas quando derivadas do mesmo estado e não ganham autoridade própria.

45. **Proximidade semântica não autoriza fusão de owners.**
   - ERRO COMPROVADO: tratar Casa Hermes e CentralDark como se responsabilidade semelhante permitisse sobrescrever memória/canon um do outro.
   - CORREÇÃO COMPROVADA: manter fronteira contratual e trocar apenas evidência/conhecimento autorizado.
   - GENERALIZAÇÃO: `SIMILAR_PURPOSE != SAME_AUTHORITY`; integração deve preservar owner, proveniência e direção de escrita.

46. **Busca histórica vem antes de investigação cara quando existe índice confiável.**
   - ERRO COMPROVADO: reler workflow inteiro para sintoma já documentado no BRAIN.
   - CORREÇÃO COMPROVADA: procurar primeiro pelo erro/nome no owner de aprendizados e só aprofundar se houver delta.
   - GENERALIZAÇÃO: `RECALL_BEFORE_REDISCOVERY`; conhecimento passado reduz custo somente quando é reconciliado com estado vivo.

47. **Evidência correlacionada não deve ser contada como múltiplas provas.**
   - ERRO COMPROVADO: screenshot, texto extraído e relato do mesmo evento parecerem três confirmações independentes.
   - CORREÇÃO COMPROVADA: clusterizar por origem/causa/tempo e contar deltas independentes.
   - GENERALIZAÇÃO: `N_OBSERVATIONS → DEDUPE → M_INDEPENDENT_DELTAS`; confiança cresce pelo ganho informacional, não pelo volume repetido.

48. **Nome, ícone, processo, assinatura isolada ou status verde não autenticam contexto.**
   - ERRO COMPROVADO: aceitar identidade/comportamento por aparência nominal ou por um único indicador de confiança.
   - CORREÇÃO COMPROVADA: validar cadeia contextual: origem, caminho, versão, assinatura/certificado, parentage, dependências, rede, registro e runtime conforme o claim.
   - GENERALIZAÇÃO: `NAME != AUTHENTICITY` e `SINGLE_TRUST_SIGNAL != CONTEXTUAL_INTEGRITY`.

49. **Ação explícita e investigação de hipótese têm ordens de operação diferentes.**
   - ERRO COMPROVADO: usar exigência de prova prévia para paralisar uma execução já autorizada e reversível.
   - CORREÇÃO COMPROVADA: quando a intenção humana já ordenou a ação e não há gate material pendente, executar e provar depois; quando o pedido é descobrir se deve agir, medir antes.
   - GENERALIZAÇÃO: `EXECUTION_INTENT → ACT→VERIFY`; `DIAGNOSTIC_INTENT → MEASURE→DECIDE→ACT`.

50. **Generalização válida preserva mecanismo, não acidente do caso.**
   - ERRO COMPROVADO: cristalizar comandos, nomes ou ferramentas específicas como se fossem a lei universal.
   - CORREÇÃO COMPROVADA: extrair `sintoma → causa → correção → propriedade invariável → teste discriminante`.
   - GENERALIZAÇÃO: uma aprendizagem só é universalizável quando sobrevive a outro alvo sem depender do nome original.

### Compilação mínima das leis

```text
LIVE_STATE_BEATS_STALE_STATE
HUMAN_REPORT != TECHNICAL_CAUSE
T0_T1_REQUIRED_FOR_ZERO_REGRESSION
DOCUMENTED_WITHOUT_CONSUMER != OPERATIONAL
MEASURE_GOAL_PROPERTY_NOT_PROXY
VALID_EMPTY != MISSING
SESSION_RESET != MEMORY_ERASURE
LOCAL_EXISTENCE != CONSUMER_REACHABILITY
HUMAN_READABLE != MACHINE_PARSEABLE
TRANSIENT != TERMINAL
OWNER_NATIVE_REPAIR_BEFORE_MANUAL_REWRITE
NORMALIZE_EXTERNAL_METADATA_AT_BOUNDARY
NUMBER_WITHOUT_DECISION_FUNCTION = NOISE_CANDIDATE
ONE_CANON != ONE_PRESENTATION
SIMILAR_PURPOSE != SAME_AUTHORITY
RECALL_BEFORE_REDISCOVERY
CORRELATED_EVIDENCE_MUST_BE_DEDUPED
NAME != AUTHENTICITY
EXECUTION_INTENT != DIAGNOSTIC_INTENT
GENERALIZE_MECHANISM_NOT_ACCIDENT
```

### Regra de promoção futura

```text
ERRO_OBSERVADO
+ CORRECAO_EXECUTADA
+ REMEDICAO_NO_MESMO_ALVO
+ CONTRAPROVA
+ DELTA_REUTILIZAVEL
→ GENERALIZAR
→ TESTAR_EM_NOVO_CONTEXTO
→ SE_TRANSFERIR: OURO
→ SE_NAO_TRANSFERIR: MANTER_COMO_APRENDIZADO_LOCAL
```

Não promover por elegância. Não promover por repetição narrativa. Não promover porque "parece certo". A ferida precisa ter existido, a correção precisa ter mudado o estado e a regra precisa sobreviver fora do caso original.

## Próximo
- CHEFE continua trazendo → eu adiciona aqui
- Revisitar quando houver padrão novo ou correção
