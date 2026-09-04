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

## Ouro cristalizado — sessão 2026-08-26
31. **READ_ONLY != NO_COGNITIVE_CHANGE.** Ler contexto, memória, prints ou repo sem escrever pode mudar a interpretação e a resposta da sessão. Read-only protege a fonte; não congela o estado cognitivo do modelo.
32. **CONTEXTO_ATIVO != MEMÓRIA_CANÔNICA.** Uma associação aprendida no chat pode mudar comportamento imediatamente e ainda não estar registrada no Git/BRAIN. Sempre rotular a camada para não confundir “entendido agora” com “cristalizado para depois”.
33. **Cross-chat é reconstrução, não telepatia entre janelas.** Quando a plataforma oferecer memória/histórico de conversas, o agente deve recuperar contexto relevante, dedupar e reconciliar antes de pedir repetição. Convergência entre chats não prova transporte causal escondido; canal de transporte continua exigindo evidência.
34. **Grafo útil precisa de propriedades + tags + links explicáveis.** Existência do Markdown não basta. Nota importante sem frontmatter, tags, relações e conexões rápidas vira ilha cognitiva. Usar `GRAPH-INVESTIGATOR → SEMANTIC-LINKER`, preservando `LINK_ORNAMENT = NOISE` e sem inventar relação para “deixar bonito”.
35. **O mapa visual não deve ser confundido com o mecanismo de recuperação.** Arrastar nó, zoom, animação e forças do Graph View mudam visualização; conteúdo, frontmatter, tags e wikilinks mudam o corpus. A meta não é “grafo bonito”, é menor distância semântica para recuperação humana e de agentes.
36. **Três cabeças físicas podem alimentar um cérebro lógico sem disputar autoridade.** CHEFE = intenção/autoridade; Hermes local = execução e observação da Casa; CentralDark = memória/registro/relações. Estado local fresco pode superar documentação antiga para o claim correspondente, mas precisa virar receipt/reconciliação antes de ser tratado como canônico persistente.

## Próximo
- CHEFE continua trazendo → eu adiciona aqui
- Revisitar quando houver padrão novo ou correção

## Conexões Rápidas

- [[BRAIN]] — entrada humana do cérebro.
- [[BANDA_INTENCAO_UNICA_COMPASSO]] — intenção única como partitura.
- [[INTENT_SYNC_STATE]] — estado mínimo entre superfícies.
- [[BANDA_COMPASSO_GLOBAL]] — compasso e anti-eco.
- [[GRAPH-INVESTIGATOR]] — encontra ilhas e propriedades ausentes.
- [[SEMANTIC-LINKER]] — cria ligações semânticas explicáveis.
