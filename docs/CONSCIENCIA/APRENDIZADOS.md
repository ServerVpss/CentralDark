---
title: "APRENDIZADOS"
date: 2026-08-27
tags: ["consciencia"]
updated: 2026-08-27
---

{{FILE:/tmp/pr316/aprendizados.md}}

### 1. Gate de CI bloqueia qualquer caminho .env.* pelo NOME, antes de olhar o conteúdo
- **Categoria:** armadilha
- **Data:** 2026-07-27
- **Contexto:** Ao restaurar o módulo Bolt, criei um arquivo .env.example com as 15 variáveis do módulo, TODAS sem valor (verificado por grep). O CI reprovou com SECRET_SUSPECT_BLOCKED. Investigando o workflow "Gates determinísticos", a regra é: sensitive_path = (^|/)(\\.env(?:\\.|$)|secrets?(?:/|$)|tokens?(?:/|$)|...) e suspect = any(sensitive_path.search(name) for name in names). Esse teste roda ANTES de qualquer análise de valor — bloqueia pelo NOME do arquivo. Isso explicou retroativamente o commit 958666567 ("remover caminhos env bloqueados"): os .env.example e .env.production originais do Bolt tinham sido apagados por este mesmo gate, não por conterem segredo. Eu repeti o erro histórico sem saber.
- **Aprendizado:** Nunca criar arquivo .env.example, .env.production ou qualquer .env.* neste repositório — o gate de CI rejeita pelo nome, mesmo com o arquivo 100% vazio de valores. Documente as variáveis em README.md do módulo. Atenção: há contradição interna no repo — o .gitignore (linha 60, !*.env.example) PERMITE esses arquivos, enquanto o gate de CI os REJEITA. Na prática vale a regra mais restritiva, que é o gate. Antes de recriar um arquivo que aparece como deletado no histórico, leia a mensagem do commit que o removeu: ela costuma dizer o motivo e evita repetir o ciclo.

### 2. git status limpo pode esconder pasta vazia: gitlink órfão entregava o Bolt vazio em todo clone
- **Categoria:** armadilha
- **Data:** 2026-07-27
- **Contexto:** apps/modulos/Bolt/source estava registrado como gitlink (modo 160000) apontando para um commit que NÃO existe no repositório, e sem .gitmodules. Resultado: git status --short apps/modulos/Bolt retornava VAZIO (parecia tudo certo), mas qualquer git clone da main entregava a pasta source/ vazia. O Bolt existia apenas como 536 arquivos soltos no disco de uma máquina, invisíveis ao git. Linha do tempo: c61fc7b98 vendorizou 176 arquivos; c41dda98b (4h depois, mesmo dia, mensagem "retirar lote Bolt do PR meta-lupa") deletou tudo e reintroduziu o gitlink — foi retirada por ESCOPO DE PR, não por estar errada, mas ninguém devolveu depois. Também errei ao diagnosticar: comparei blobs local vs origin/chore e vi que batiam, concluindo que estava salvo — mas estava comparando com o cache local da ref remota, não com o GitHub. O teste que realmente resolveu foi git ls-tree origin/main e um checkout limpo em worktree detached.
- **Aprendizado:** Para provar que um módulo está de fato versionado, NÃO confie em git status (gitlink órfão não aparece como sujo) nem em comparação de blob contra ref remota em cache (pode estar desatualizada ou apontar para branch já deletada no GitHub). Use git ls-tree <ref> <caminho> e cheque se o modo é 160000 (gitlink) em vez de 100644 (arquivo). A prova definitiva é criar um worktree detached do commit e contar os arquivos entregues — foi assim que se confirmou 0 antes e 522 depois. Regra prática: submódulo sem .gitmodules é sempre estado quebrado; ou vira árvore normal, ou registra o .gitmodules.

### 3. Auditoria do gatilho de XP da META LUPA: motor correto, defeito era de exposição na saída
- **Categoria:** erro-correcao
- **Data:** 2026-07-27
- **Contexto:** Pedido para provar se a evolução da META LUPA (PR 409) realmente acionou XP, nível e tier, sem presumir sucesso nem falha. Na primeira leitura do ledger procurei os campos com os nomes xp_total, level e tier — não existiam, e quase concluí que o gatilho estava quebrado. Os nomes reais são outros: xp_before, xp_after, xp_gained, level_before, level_after, level_up, tier_before, tier_after, next_level_xp. Com os nomes certos a prova apareceu: XP 790 para 855, ganho 65 batendo exatamente com a soma dos 4 achievements declarados, nível 6 sem subir por faltarem 23, tier OPACA, zero penalidades, no_xp_reason vazio. A cadeia fecha: o xp_after do FINAL anterior era 790, idêntico ao xp_before deste. Também foi questionada a contagem BEGIN=24 e FINAL=25 com ORPHAN=0. O defeito real era outro: o comando finish-use gravava tudo no ledger mas imprimia apenas FINAL_RECORDED usage_id, então responder se houve XP exigia abrir o JSONL na mão.
- **Aprendizado:** Ao auditar o ledger da META LUPA use os nomes de campo reais do registro FINAL: xp_before, xp_after, xp_gained, level_before, level_after, level_up, tier_before, tier_after, next_level_xp. Procurar por xp_total, level ou tier retorna vazio e induz à conclusão errada de que o gatilho não funcionou — ausência de campo com o nome que você imaginou não é ausência do dado; dumpe todas as chaves do registro antes de acusar o motor. Sobre a contagem: BEGIN e FINAL podem divergir legitimamente, porque um FINAL órfão é resolvido por um registro ATTESTATION cujo target_record_hash casa com o record_hash do FINAL — confira essa correspondência antes de tratar a assimetria como corrupção. No caso auditado o total de 52 linhas se decompôs em 24 BEGIN, 25 FINAL, 1 CANDIDATE_REF e 2 ATTESTATION. Correção aplicada no PR 410: finish-use passa a imprimir a linha FINAL_XP com antes e depois de XP, nível e tier, o que revelou de imediato um level up de 6 para 7 que antes passaria despercebido. Nota de escopo: não existe MANUAL.html neste repositório, verificado por quatro canais independentes; o único manual versionado é o do módulo graph-panel, que trata apenas do painel de grafo.

### 4. Auditoria não vale sem HEAD_SHA declarado: 4 escopos, 3 lacunas falsas no PR #410
- **Categoria:** armadilha
- **Data:** 2026-07-27
- **Contexto:** Auditando o PR #410 (meta-lupa, recibo de XP), uma análise anterior declarou 3 lacunas críticas: "test_lupa.py e mais 5 recursos da XP-5 Matrix não existem no repo" e "os args novos do finish-use não estão no main". As duas eram FALSAS. Prova: origin/main@26c63ec entrega os 7 recursos (test_lupa.py = 33714 bytes, blob b904d73) e tem --achievement na linha 1146 de meta_lupa.py. O ambiente tinha QUATRO estados simultâneos e nenhum foi declarado no relatório: GitHub origin/main 26c63ec (Fonte da Verdade, completo), casa main local cb102b5a (51 commits atrás), worktree bolt-vendor-restore eab1170 (branch do PR, completo) e VPS /root/[oculto] d4501c6e na branch chore/gateway-providers-routes SEM a pasta .agents/skills/meta-lupa. O relatório misturou "CI 9/9 verde" (evidência de origin) com "os arquivos não existem" (instrumento rodado noutro escopo) e ainda publicou um ls que não corresponde a nenhum escopo real. Era o segundo caso no mesmo dia — o primeiro foi declarar "MANUAL.html não existe" sem ter consultado o caminho da Casa.
- **Aprendizado:** Antes de escrever "X não existe", preencher o campo que a SKILL.md já exige no ledger de evidências: PERTENCE AO MESMO ALVO/HEAD_SHA. Concretamente: (1) toda afirmação de ausência precisa do ref e do commit em que a busca rodou, escritos no relatório; (2) ausência só vale como prova quando dois canais de proveniência distinta concordarem — em repo com worktrees, `git ls-tree <ref> <caminho>` e `git ls-files` valem mais que `find .`, porque find depende do CWD e o worktree tem .git como arquivo apontando para outro disco; (3) caminho citado em tabela de recursos de skill é relativo à RAIZ DA SKILL (.agents/skills/meta-lupa/), não à raiz do repo — ler "testes/test_lupa.py" como path de repo gera falso negativo garantido; (4) nunca misturar evidência de origin com evidência de working tree no mesmo veredito sem rotular cada uma. Segundo achado da mesma auditoria, esse sim real: o motor aceitava point_fixed_evidential=True com autolupa_executed=False, liberando os 25 XP de ponto_fixo_atingido sem a AutoLupa que produz o ponto fixo. Dois FINAIS no ledger canônico tinham isso (6c0eb4a3 e 971f1efe) = 50 XP indevidos; sem eles o total honesto é 845, abaixo do limiar 878 do nível 7 — ou seja, o "LEVEL UP 6->7" celebrado no PR era artefato das violações. Terceiro achado: test_lupa.py produzia TOTAL=52 PASS=52 idêntico COM e SEM a correção, e nunca rodou em workflow nenhum — evidência manual apresentada como prova de CI. Correção comitada em 33793ca: guardrails/validar_selo_ponto_fixo.py (falha em selo novo sem AutoLupa, legado exposto por record_hash em allowlist, nunca apagado), testes/test_selo_ponto_fixo.py (13 casos, dá ImportError no motor sem a correção = poder de discriminação provado) e lupa-conformance.yml passando a executar test_lupa.py + guardrail + regressão. Regra prática que fica: uma suíte que passa igual nos dois lados do diff não é evidência da mudança — sempre rodar a MESMA checagem no código original antes de citá-la como prova.

### 5. Workflow promovido sem o script que ele executa: o bot autônomo nunca rodou
- **Categoria:** erro-correcao
- **Data:** 2026-07-27
- **Contexto:** O workflow "GitHub Bot Controller" falhava em toda execução com MODULE_NOT_FOUND e o caminho apareceu triplicado: _work/CentralDark/CentralDark/CentralDark/scripts/github-bot-controller.mjs. Investigando, apareceram DUAS causas independentes. Primeira: o script scripts/github-bot-controller.mjs (162 linhas, blob 37e1773a) foi criado no commit 18e9fa96d e existe apenas em origin/pivete/dev e origin/pivete-dev-mcp-admin-guard — nunca chegou na main. Confirmado por 4 canais: git ls-tree origin/main, git ls-files, find no disco da Casa e API do GitHub (404). O .yml foi promovido, o .mjs ficou para trás. Segunda: no commit original o step era 'run: node scripts/github-bot-controller.mjs' (correto), e na main virou 'run: node CentralDark/scripts/github-bot-controller.mjs'. O runner self-hosted já posiciona GITHUB_WORKSPACE em _work/CentralDark/CentralDark, então o prefixo extra produz o terceiro nível. Corrigir só uma das duas causas não resolveria nada. Na mesma varredura: o mapa canônico declara apps/modulos/Monitoramento24h/ e apps/modulos/clone-deck/ como áreas CONSOLIDADAS e nenhum dos dois existe no checkout, e declara secrets/ como consolidado com o motivo 'material sensível proibido no Git' — exigindo a presença de algo que por definição nunca estará versionado.
- **Aprendizado:** Quando um workflow falha com MODULE_NOT_FOUND, não parar na primeira causa: conferir SEPARADAMENTE (a) se o arquivo existe no ref que o CI faz checkout e (b) se o caminho no step está certo. Aqui as duas estavam erradas ao mesmo tempo, e cada uma sozinha explicaria o sintoma — corrigir uma só produziria um segundo ciclo de falha idêntico. Para achar arquivo que sumiu na promoção, o comando é 'git log --all --oneline --diff-filter=A -- "*<nome>"': ele encontra o commit que ADICIONOU o arquivo em qualquer branch, e 'git branch -a --contains <sha>' mostra onde aquele commit vive. Comparar o step no commit original com o step na main revelou que o path foi quebrado na promoção, não escrito errado na origem. Segunda regra, sobre mapa canônico: declarar um caminho como 'área consolidada' significa afirmar que ele passou por testes, revisão, autorização, commit SHA, trava e rollback — declarar consolidado o que não existe no checkout é falso verde de versionamento, porque o Git aparenta saúde e o checkout limpo não entrega. Auditar periodicamente o mapa contra 'git ls-tree -r origin/main' e abrir issue para cada divergência. Terceira regra, sobre ruído: alerta que NUNCA pode ser resolvido (como exigir secrets/ presente num repo onde secrets são proibidos) é pior que alerta nenhum — ele treina o time a ignorar avisos, e no dia em que um aviso real aparecer ninguém olha. Ou o mapa ganha um campo expected_absent, ou a declaração sai. Correção aplicada no PR #418: script restaurado byte a byte do blob, path corrigido, BOT_EVENT_NAME exportado (sem ela o script sempre logava event=unknown e nunca entrava no modo correto), PLANO-MESTRE versionado em docs/ e docs/ESTADO-DA-RETOMADA.md gerado por script + workflow agendado, marcando como SEM_EVIDENCIA_NO_REPO — nunca como 'falta' — tudo que o Git não consegue provar.

### 6. A porta de entrada nunca existiu: por que nenhuma IA lia as regras da casa
- **Categoria:** erro-correcao
- **Data:** 2026-07-27
- **Contexto:** O Pivete perguntou por que as IAs erram o jeito de conversar com ele, sendo que existe docs/CONSCIENCIA/JEITO-CORRETO-DO-PIVETE.md marcado status CANONICO e docs/CONSCIENCIA/2026-06-20-padrao-resposta-pivete.md com as palavras dele registradas exigindo bloco de codigo e proibindo parede de texto. Investigando o caminho que uma IA percorre ao chegar: o kit_boas_vindas do MCP lista LEIA-ME-IA.md como item 1 'Porta de entrada', e a ferramenta ler_regras_inviolaveis le esse mesmo arquivo. Testado: ler_regras_inviolaveis devolve GitHub 404. Confirmado por 2 canais que LEIA-ME-IA.md nao existe na raiz, e por git log --all --diff-filter=A que NUNCA existiu em commit nenhum. O que existe e docs/LEIA-ME-IA.md com 16 bytes, um symlink apontando para ../LEIA-ME-IA.md, e o conteudo original de 3354 bytes em docs/CONSCIENCIA/ARQUIVO-MORTO/root-md-antigos/LEIA-ME-IA-absorvido.md, movido no commit 66955b38b. Alguem absorveu a porta para o arquivo morto, deixou o symlink, e nunca criou o destino. Resultado: as duas ferramentas de calibracao de tom falham, a IA cai nos itens seguintes do indice (permissoes, SSH, pendencias, estado da VPS) que existem e sao todos tecnicos, e trabalha do proprio jeito. O JEITO-CORRETO-DO-PIVETE ficou orfao: as unicas mencoes no repo sao ele mesmo, painel-data.json e 8 relatorios do notion-sync, todos auto-gerados. Uma busca ingenua devolve 10 arquivos e passa a impressao de que esta bem referenciado.
- **Aprendizado:** Documento canonico que nenhum ponto de entrada alcanca nao governa nada — escrever a regra e so metade do trabalho, a outra metade e o caminho ate ela. Regra pratica: ao mover ou 'absorver' qualquer arquivo citado por ferramenta, indice ou workflow, checar quem aponta para ele ANTES de mover, e criar o destino no mesmo commit. Symlink apontando para arquivo inexistente e pior que arquivo ausente, porque parece que existe. Segunda regra, sobre medir alcancabilidade: contar quantos arquivos citam um documento e enganoso quando o repo tem relatorios auto-gerados — aqui 9 das 10 mencoes eram lixo do notion-sync. Ao medir se algo e alcancavel, excluir explicitamente fontes geradas; senao o instrumento produz falso verde. Correcao aplicada no PR #418: LEIA-ME-IA.md recriado na raiz em uma pagina e linguagem simples, apontando em UM salto para o JEITO-CORRETO-DO-PIVETE e para o padrao de resposta — o que tambem conserta ler_regras_inviolaveis e o item 1 do kit sem tocar no codigo do MCP. E scripts/lupa/validar-porta-de-entrada.mjs + workflow porta-de-entrada.yml, que falham o build se a porta sumir, se um caminho citado num ponto de entrada nao existir, ou se um documento marcado CANONICO ficar orfao. Rodado contra origin/main antes da correcao: 14 erros, incluindo 10 caminhos mortos no proprio CLAUDE.md, que toda IA Claude le automaticamente. Prova de discriminacao: com a porta PORTA_OK=1 ERROS=0; sem a porta PORTA_OK=0 ERROS=3. Pendencia que o guardrail nao alcanca: o indice do kit_boas_vindas vive no codigo do MCP em apps/modulos/mcp e ainda lista conexao-ia/MEMORIA_OPERACIONAL_IA.md, que tambem nao existe.

### 7. github_commit (MCP) não deleta arquivo; duplicatas CONSCIENCIA/BRAIN nasceram do mesmo commit de bot
- **Categoria:** armadilha
- **Data:** 2026-07-27
- **Contexto:** Auditei duas árvores duplicadas suspeitas (docs/CONSCIENCIA/CONSCIENCIA/ e docs/CONSCIENCIA/BRAIN/) pedidas pelo Pivete pra comparar e eliminar. Provei com 4 canais (contents API, git log por path, github_search_code, diff contra commit pai) que ambas são cópias congeladas do outer/docs-BRAIN, criadas por acidente no MESMO commit de bot (9b8eeec4e, memory-executor, 2026-07-02T16:29:03Z) que só deveria adicionar frontmatter — 404 confirmado nos dois paths no commit pai. Ao tentar apagar, testei github_commit com {content:"", delete:true} — o campo delete foi ignorado, resultado foi arquivo de 0 bytes em vez de removido. Restaurei o conteúdo original no commit seguinte.
- **Aprendizado:** github_commit do MCP CentralDark só faz create/update via Contents API — não tem operação de deleção real, mesmo passando delete:true. device_bash não tem rede (não dá pra git push) e o Bash do container cloud não tem credencial git válida pra este repo. Pra apagar arquivo/pasta do repo é preciso rodar git rm + push num ambiente com acesso real (VPS ou local do Pivete) — não dá pra fazer só com as tools MCP desta sessão. Deixei o script pronto (scripts/run-once/eliminar-duplicatas-consciencia-brain.sh, PR #421) em vez de fingir que apaguei. Também: memory-executor (bot de frontmatter) é uma fonte de risco real de criar árvores duplicadas por resolução de caminho errada — mesmo padrão do bug do github-bot-controller.mjs desta sessão. Vale auditar se ele roda de novo.

### 8. Nunca gerar -v2/-v3: refinar o arquivo que já existe
- **Categoria:** regra
- **Data:** 2026-08-04
- **Contexto:** Ao corrigir o script de atualização do Hermes no Windows, a IA gerou um arquivo novo com sufixo -v2 em vez de aplicar a correção no script original que já existia. O Pivete corrigiu na hora: isso é recriar, não melhorar.
- **Aprendizado:** Quando um arquivo/script/skill já existe, a correção vai DENTRO dele — mesmo nome, mesmo caminho, versão interna no cabeçalho se precisar rastrear. Nada de -v2, -v3, -novo, -final, -corrigido. Entregar patch/diff aplicável no original. Se a IA não tem o conteúdo do original em mãos, pede o arquivo antes de propor a correção — não inventa um substituto paralelo. Recriar do zero é regressão: perde ajuste acumulado e fragmenta a fonte de verdade. Corolário: também não afirmar causa que o Pivete não disse (ex: supor uso de botão de UI quando ele usou a CLI) — se não sabe, pergunta.

### 9. Escritor único: auditar e comentar na PR alheia em vez de abrir PR concorrente
- **Categoria:** armadilha
- **Data:** 2026-08-05
- **Contexto:** Auditoria do run vermelho no PR #554 levou a dois achados distintos. O run era de definição de workflow já removida da main pelo PR #584 (fantasma, sem conserto por código). O defeito vivo era outro: autonomia-promocao.yml 5/5 FAILURE na main por artefato ausente no contrato judge->promote. Ao preparar a correção, o PR #663 apareceu tocando os mesmos 5 arquivos, o que tornaria meu PR duplicata.
- **Aprendizado:** Antes de abrir PR de correção, listar PRs abertos e comparar blob SHA dos arquivos alvo. Se outra IA já é escritora daqueles arquivos, NÃO abrir PR concorrente: auditar o HEAD real da branch dela e comentar a lacuna com local exato + patch mínimo + evidência executada. Dois padrões de defeito recorrentes achados assim: (1) upload-artifact com if-no-files-found warn seguido de download-artifact com name fixo é falha garantida sempre que o diretório puder ficar vazio — if always no upload não resolve, só garante que o step roda; (2) canal de notificação novo que lê nomes de secret diferentes dos já versionados no repo faz o humano criar o secret errado e o aviso continuar NOT_SENT — resolver a divergência de nome ANTES de pedir o secret. Também: corpo de PR que declara HEAD_SHA diferente do HEAD atual da branch invalida a prova.

### 10. Reconferir o blob na hora de publicar, não só na hora de auditar
- **Categoria:** erro-correcao
- **Data:** 2026-08-06
- **Contexto:** Auditoria do PR #664: baixei o blob `e63a12c8` (a61abaf), gerei um patch, provei 8 casos e rodei a suíte 10/10. Entre a geração e a publicação, o head foi para `94e53e9` (blob `ad56f473`). Postei o diff 8 minutos depois do arquivo já ter mudado — patch nasceu velho, não aplica. Mesmo erro aconteceu no #667 com a cápsula (`0cae63d1` → `0897b6a3`).
- **Aprendizado:** Conferir `git hash-object` do arquivo alvo IMEDIATAMENTE antes de publicar, não só no começo da auditoria. Num repo com loop autônomo o head move em minutos, e patch contra blob morto vira lixo que o próximo agente tenta aplicar. Se moveu: refaz contra o blob novo ou marca o artefato anterior como morto no mesmo canal onde ele foi publicado.

### 11. Hash validado por regex não prova que o artefato existe
- **Categoria:** armadilha
- **Data:** 2026-08-06
- **Contexto:** Cápsula observável do #667. Ledger de dois eventos forjado à mão produziu validation=PASS, ready_for_promotion=true, xp_valid=1 e correction_rate=100%. O evidence_hash era 'f' repetido 64 vezes e o chief_receipt_hash era 'a' repetido 64 vezes, apontando para um recibo que nunca existiu; o event_actor 'SEGREDO/CHEFE' foi digitado pelo próprio writer. No mesmo objeto, guarantees.chief_receipt_required_for_promotion saiu ENFORCED.
- **Aprendizado:** Regex sobre hash prova FORMATO, nunca PROCEDÊNCIA. Campo de evidência só vale se o agregador recomputar o hash sobre o artefato que a referência aponta e falhar quando a referência não resolve. Pior ainda é o snapshot declarar a própria garantia como cumprida: garantia auto-declarada transforma buraco silencioso em buraco com selo, e é isso que um painel ao vivo passa a transmitir como verdade.

### 12. Modo novo não alcança problema empilhado antes da ramificação de modo
- **Categoria:** erro-correcao
- **Data:** 2026-08-06
- **Contexto:** Gate WRITER_UNICO do #664. Foi criado mode=migrate para resolver a branch, com 16 testes verdes. Rodando o blob real contra os três commits reais da branch: enforce FAIL, legacy FAIL, migrate FAIL — todos com WRITER_NOT_UNIQUE e unknown_legacy=0. O migrate trata commit SEM trailer; os três commits TÊM trailer e um deles declara outro Writer. A unicidade é empilhada antes de qualquer branch de modo.
- **Aprendizado:** Antes de criar modo novo para resolver um caso, conferir ONDE o problema é empilhado. Se o push do problema acontece antes da ramificação de modo, e o veredito olha o tamanho da lista de problemas primeiro, nenhum modo alcança aquele caso — o modo novo passa nos testes que ele mesmo trouxe e não move o caso real. Roda o gate contra o próprio artefato alvo nos TRÊS modos antes de declarar migração pronta.

### 13. Recuo preventivo não é obediência
- **Categoria:** armadilha
- **Data:** 2026-08-06
- **Contexto:** Um agente da casa se desculpou por 'ter fechado decisões e apresentado tudo como definitivo' e prometeu aguardar revisão sem impor escolhas — logo depois de receber um comando que dizia literalmente 'NÃO pare para pedir confirmação', 'não peça decisão técnica já dedutível' e proibia as frases 'escolha A ou B' e 'posso continuar?'. Ele leu o tom como bronca e devolveu a autonomia que o comando exigia.
- **Aprendizado:** A autoridade do SEGREDO/CHEFE é sobre merge, deploy, VPS, secrets e reescrita de histórico. NÃO é sobre decisão técnica dedutível do próprio contrato. Quando o comando já fixou a decisão, executar não é impor — é obedecer. Pedir desculpa por ter decidido, ou devolver a decisão em nome de humildade, é recuo preventivo: parece obediência e produz um executor que trava no primeiro A/B e queima a janela de trabalho. Erro cometido e corrigido gera aprendizado; recuo preventivo não gera nada.

### 14. Mutante equivalente sai do denominador mas aponta a invariante sem teste
- **Categoria:** regra
- **Data:** 2026-08-06
- **Contexto:** Teste de mutação na cápsula do #667. Mudar 'skipped === 0' para 'skipped >= 0' deixou a suíte verde. Com a soma total = pass + fail + skipped já validada, skipped > 0 implica pass diferente de total, que é pego pela outra checagem — mutante sem defeito observável. Score corrigido de 2/12 para 2/11. A invariante da soma, que torna o mutante equivalente, não estava no conjunto de mutantes: furo do próprio harness.
- **Aprendizado:** Mutante que sobrevive porque outra checagem já cobre o caso é EQUIVALENTE, não sobrevivente: desconta do denominador em vez de contar como falha da suíte. Mas ele não é descartável — ele aponta qual invariante está segurando a checagem, e essa invariante quase sempre também não tem teste. O mutante equivalente é a fonte de uma regra, não uma vitória de auditoria. Roda o mutante na invariante que o sustenta.

### 15. Achado repetido é ruído, não reforço
- **Categoria:** armadilha
- **Data:** 2026-08-06
- **Contexto:** Publiquei no #667 uma auditoria com tabela de mutantes e ataque de forja. O Grok já tinha postado mutantes, forja e ready=false no mesmo thread. Sobreposição em três dos quatro pontos; só o mutante equivalente e os asserts eram meus. Sem ferramenta para listar comentários de PR neste MCP, a checagem tem que ser feita antes, por quem tem acesso ao thread.
- **Aprendizado:** Ler o thread do PR antes de publicar auditoria. Achado que outro agente já postou não vira mais forte por ser repetido — vira ruído, e ruído treina o time a ignorar comentário de auditoria, que é o único canal onde a prova vive. Se o achado já está lá, publica só o delta: o que muda a decisão de quem lê. Se não há delta, não publica.

### 16. Frase de agente não prova alinhamento; promessa maior que capacidade é falso compromisso
- **Categoria:** erro-correcao / recorrência de agentes
- **Data:** 2026-08-09
- **Contexto:** Em uma sessão curta com SEGREDO/CHEFE, a SOL/ChatGPT cometeu três falhas observáveis em sequência: marcou `🟡` sem pendência operacional concreta, usou a metáfora depreciativa `zoológico de agentes` para descrever uma arquitetura do usuário e declarou `não repetir` como se pudesse garantir comportamento futuro permanente. Ao ser exigida a prova, a própria IA reconheceu que não consegue se auto-reprogramar, alterar o próprio treinamento nem provar uma garantia permanente. Na tentativa inicial de registrar o aprendizado, a mesma IA repetiu a classe de erro: criou `docs/CONSCIENCIA/APRENDIZADOS/2026-08-09-limites-ia-e-promessa-sem-prova.md` apesar de `docs/CONSCIENCIA/APRENDIZADOS.md` já ser o destino canônico, deixou `HEAD_SHA` obsoleto no corpo do PR e introduziu trailing whitespace que derrubou o CI. A investigação posterior encontrou ainda que a `main` carregava uma `porta-de-entrada.yml` com blocos duplicados, enquanto o PR #709 já era a lane Writer existente para corrigir exatamente porta, contrato e validador universal.
- **Aprendizado:** Texto do agente não muda estado e não prova aprendizado permanente. Toda alegação deve caber na capacidade observável do agente. Sem mecanismo persistente comprovado, `sempre`, `nunca mais`, `garanto`, `não repetirei` ou equivalente devem ser rebaixados para uma afirmação testável no escopo atual. `🟡` só representa trabalho real pendente ou prova em andamento; dado não medido é `NOT_MEASURED`, sem alerta artificial. Crítica técnica deve atingir o sistema/artefato, nunca reduzir o humano ou seu projeto. A correção arquitetural não é copiar a regra para cada IA: todos os adaptadores carregam a mesma porta e o mesmo contrato; o único validador universal deve fiscalizar essa política para ChatGPT, Claude, Codex, Gemini, Copilot, Cursor, Windsurf, Hermes, plugins e agentes futuros. Aprendizado vai no canônico existente; mecanismo vai no gate existente; teste tenta quebrar o mesmo mecanismo. Se a própria Meta Lupa contrariar a autoridade atual ou prometer certeza absoluta, ela também deve falhar no mesmo princípio e ser corrigida no próprio artefato, com identidade canônica atualizada.
### 16. #ACORDAR é recuperação de estado real, não apenas comando de GitHub
- **Categoria:** regra
- **Data:** 2026-08-13
- **Contexto:** Nesta sessão, `#ACORDAR !CALIBRAR` foi usado para interromper resposta baseada em contexto parcial, reler estado vivo, consultar GitHub e reconciliar conversa, repo, PR, HEAD e evidência. O próprio uso mostrou que uma palavra curta pode carregar um contrato operacional quando o significado já está estabelecido no contexto.
- **Aprendizado:** Interpretar `#ACORDAR` como `RECUPERAR_ESTADO_REAL_ANTES_DE_CONTINUAR`: reler missão/fio, recuperar contexto relevante, medir estado vivo e reconciliar divergências antes de responder. GitHub entra quando é fonte necessária, mas o comando não significa apenas "abra o GitHub". Não obrigar o SEGREDO/CHEFE a repetir contexto ou prova que o próprio sistema consegue reconstruir.

### 17. Uma SOL, um SOUL, uma superfície; modelos e ferramentas são capacidades substituíveis
- **Categoria:** regra
- **Data:** 2026-08-13
- **Contexto:** O desenho operacional foi refinado de "dois chats" para uma única SOL com identidade persistente, podendo planejar e agir na mesma conversa/interface. Voz e texto são entradas; Hermes, tools, providers e modelos ficam por baixo como braços/motores.
- **Aprendizado:** Não criar segunda identidade, segundo chat obrigatório ou segundo orquestrador para separar planejamento de ação. O padrão é `UMA_SOL + UM_SOUL + UM_ESTADO + MODOS_OPERACIONAIS`. Modelo/provider pode mudar sem mudar a identidade. O fluxo correto é `fala/texto → intenção → modo → ferramenta/motor → execução → prova → mesma conversa`.

### 18. O humano decide intenção; a máquina prova o estado e não devolve investigação mensurável ao humano
- **Categoria:** regra
- **Data:** 2026-08-13
- **Contexto:** A sessão mostrou repetidamente desperdício quando o sistema pede ao SEGREDO/CHEFE para provar novamente conexão, permissão, estado de repo ou fatos que a própria máquina consegue medir. Quando o mesmo contrato/alvo continua válido, exigir a mesma prova humana de novo é peso sem ganho.
- **Aprendizado:** `CHEFE_DECIDE_INTENCAO=true`; `MAQUINA_PROVA_ESTADO=true`. Prova já produzida e ainda pertencente ao mesmo alvo/contrato deve ser reutilizada. Só reprovar/revalidar quando alvo, HEAD, ambiente, escopo, autorização ou evidência material mudou. Não transformar o humano em roteador de informações que ferramentas já conseguem coletar.

### 19. Em desenvolvimento autorizado, produção observável vem antes de perfeição global
- **Categoria:** regra
- **Data:** 2026-08-13
- **Contexto:** O SEGREDO/CHEFE explicitou que precisa ver a CentralDark viva para avaliar botão por botão, UI, Builder/Preview, integrações e arquitetura. Três meses de gates, convergência e refinamento no escuro impediram justamente a observação necessária para orientar o próximo delta. O objetivo atual é colocar um vertical slice real no ar e iterar.
- **Aprendizado:** Quando o CHEFE autoriza `PRODUCTION_FIRST` em ambiente de desenvolvimento próprio, não exigir perfeição visual, todas as integrações READY, dívida zero, convergência global ou Meta Lupa global antes da primeira visualização. O primeiro objetivo é `CENTRALDARK_VISIBLE_ONLINE + ADMIN_VISIBLE + RUNTIME_IDENTIFIABLE + NO_SECRET_LEAK`. Depois: `CHEFE CLICA → APONTA DELTA → CORREÇÃO MÍNIMA → REDEPLOY → REPETE`. Segurança protege o movimento; não deve virar paralisia.

### 20. Convergência, Judge e Meta Lupa servem para tentar quebrar; não para decidir a intenção do CHEFE
- **Categoria:** regra
- **Data:** 2026-08-13
- **Contexto:** Foi separado o papel de design/autoridade do papel de falsificação. O CHEFE define o que quer; Writer implementa; convergência/Judge/Meta Lupa procuram regressão, falso verde, conflito, falha de segurança e caso não coberto. Usá-los como assembleia para decidir a arquitetura do CHEFE cria atraso e dilui responsabilidade.
- **Aprendizado:** `CHEFE_DEFINE → WRITER_IMPLEMENTA → TESTES_PROVAM → CONVERGENCIA_TENTA_REFUTAR → META_LUPA_FECHA`. Convergência não redesenha intenção já decidida e não deve bloquear indefinidamente a primeira observação do runtime quando o risco está autorizado e rollback existe.

### 21. Falha local pede correção local e deploy no menor blast radius possível
- **Categoria:** regra
- **Data:** 2026-08-13
- **Contexto:** A inspeção do deploy canônico mostrou que o MCP já possui um mecanismo alinhado a esse princípio: build em worktree isolada, promoção atômica de `dist`, restart apenas de `CentralDark-MCP`, health, startup audit, estabilidade e rollback. Isso confirmou que redeploy global por padrão é peso desnecessário quando o componente causal é isolável.
- **Aprendizado:** `FALHA_LOCAL → COMPONENTE_CAUSAL → CORREÇÃO_LOCAL → TESTE_LOCAL → DEPLOY_LOCAL → PROVA_LOCAL`. Full deploy só quando dependência compartilhada, contrato/schema global, artefato monolítico, migração ou incompatibilidade real atravessar fronteiras. Não confundir "workflow atual faz tudo" com "necessidade técnica exige tudo". O menor blast radius é parte do `MENOS_E_MAIS`.

### 22. Painel Admin precisa ser observabilidade operacional, não só configuração
- **Categoria:** regra
- **Data:** 2026-08-13
- **Contexto:** O repo já contém MCP Admin/Telepainel com health, catálogo de tools, OAuth, auditoria, conectores e adapters de logs. O CHEFE quer usar o sistema vivo e, quando algo falhar, apontar o erro exato em vez de operar no escuro.
- **Aprendizado:** Todo erro relevante deve chegar a um local observável com `timestamp`, `correlation/request id` quando houver, serviço/componente, ação, status, duração, erro sanitizado e SHA/build/runtime relacionado. O painel deve mostrar health, ferramentas, conectores, OAuth, auditoria e erro sanitizado. Nunca registrar token, senha, Authorization, cookie ou valor de secret. Se já existe logging/auditoria canônico, reutilizar; criar novo sistema de logs só com GAP_REAL.

### 23. HTTP 200, PM2 online, DNS resolvendo ou painel verde não provam LIVE
- **Categoria:** armadilha
- **Data:** 2026-08-13
- **Contexto:** A Meta Lupa aplicada contra o plano de deploy confirmou o falso verde: cada instrumento prova só uma camada. Um site pode responder 200 e ainda renderizar errado; um processo pode estar online e não executar o comportamento esperado; um painel pode usar fallback estático e parecer saudável.
- **Aprendizado:** Para declarar `LIVE`, provar no mesmo runtime pelo menos: domínio abre externamente, UI real renderiza, admin real abre, runtime identifica SHA/artefato, uma ação mínima real funciona, auditoria/log registra a ação, um erro controlado aparece sanitizado e existe caminho de rollback/redeploy. Evidência parcial continua `PARTIAL/UNKNOWN`, nunca vira PASS por aparência.

### 24. API paga é capacidade, não identidade nem caminho obrigatório
- **Categoria:** regra
- **Data:** 2026-08-13
- **Contexto:** O desenho econômico/operacional foi corrigido: a SOL não depende de uma API paga como motor normal. A arquitetura pode usar execução determinística, tools, MCP, modelos locais, free tiers, créditos e providers diferentes; modelo forte/pago entra quando agrega capacidade real.
- **Aprendizado:** `DETERMINISTICO/LOCAL/TOOLS/FREE-CAPACITY FIRST`; modelo/provider é motor temporário, não identidade. A SOL/SOUL mantém continuidade enquanto roteia para a capacidade adequada. Não transformar custo de inferência em custo de identidade; subir potência somente quando a tarefa exigir.

### 25. "Menos é mais" significa menor movimento compatível com efeito, observabilidade e segurança
- **Categoria:** regra
- **Data:** 2026-08-13
- **Contexto:** A conversa consolidou que simplificar não é remover prova, rollback ou logs; é remover passos, agentes, documentos, confirmações e redeploys que não alteram a causalidade do problema. Uma palavra (`#ACORDAR`) pode recuperar um contrato inteiro; um deploy local pode substituir rebuild global; uma observação viva pode valer mais que semanas de planejamento no escuro.
- **Aprendizado:** Antes de adicionar etapa, agente, gate, painel, script ou arquitetura, perguntar: `isso muda a decisão, reduz risco causal ou produz observação que não existe?` Se não, remover. O padrão é `MENOR_CODIGO + MENOR_BUILD + MENOR_DEPLOY + MENOR_BLAST_RADIUS + PROVA_NO_RUNTIME`. Todo agente da casa deve tratar este princípio como comportamento operacional, não como slogan.

### 26. Batch .bat: 4 armadilhas que passam em revisão superficial
- **Categoria:** armadilha
- **Data:** 2026-08-20
- **Contexto:** Reparo OAuth do MCP centraldark reescrito em .bat com UI RGB/ANSI. A primeira versão passou na leitura, mas a varredura !MULTIBUSSOLA (eixo CLAIM x PROVA) achou 4 defeitos reais que não geram erro visível — falham em silêncio.
- **Aprendizado:** Em cmd.exe: (1) dentro de um label chamado por `call :label`, `%~1` é o argumento DO LABEL, não do script — capturar `%*` numa variável ANTES do call; (2) `^\"` dentro de argumento já entre aspas, tipo `call :msg \"texto ^\"x^\"\"`, quebra o parsing — nunca aninhar aspas em argumento de label; (3) `>` e `>>` literais dentro de `set /p "=... > \"` são frágeis combinados com `<nul` — trocar por `-` ou `:`; (4) `%%` fora de bloco `for` num arquivo .bat vira `%` literal, então `[%%>]` imprime `[%>]`. Bônus: .bat salvo com LF puro pode quebrar `goto` em arquivo grande — sempre CRLF. Verificação estática barata que pega tudo isso sem ter Windows: comparar labels definidos (`^:\\w+`) contra labels chamados (`call|goto :`), grep de bytes não-ASCII, e conferir que a lista de `exit /b N` é idêntica à do script original quando a promessa é zero regressão.

### 27. Grok App Builder é adapter, não cérebro — não scaffoldar app paralelo
- **Categoria:** regra
- **Data:** 2026-08-25
- **Contexto:** Sessão 2026-08-25/26 no Grok App Builder (sandbox /workspace vazio, preview 8080, React/TanStack). CHEFE pediu #ACORDAR → !CALIBRAR → !MULTIBUSSOLA → !META_LUPA → !RECONCILIAR → !CONTRAPROVA → !REMEDIÇÃO → !FIXED_POINT → !REGISTRA → BOOT PROVADO, retrô da Casa e explosão de tools. AGENTS.md do sandbox classifica isso como caso 4 (não é pedido de app). Identidade GitHub desta superfície: segredounlock. MCP CentralDark conectado: 107 tools dispatcher v1-f8ff6720fec3 + semantic_* na camada Grok. Voice e Automations também ligados.
- **Aprendizado:** Esta superfície é ADAPTER da SOL, não segundo cérebro/orquestrador/app. Não criar produto em /workspace sem GAP_REAL nomeado pelo CHEFE. Não clonar painel, grafo, MCP-admin, Hermes nem CentralDark. O que esta superfície PODE oferecer: (1) leitura/auditoria via MCP+GitHub; (2) !REGISTRA; (3) preview descartável só se CHEFE pedir UI isolada; (4) Voice TTS; (5) Automações Grok (não substituem Hermes/PM2). Writer desta sessão = NONE/READ_ONLY salvo registrar_aprendizado. UMA_SOL + UM_SOUL + UM_ESTADO.

### 28. Ponte semântica fail-closed EXIT code=2 — não é verde; stderr engolido
- **Categoria:** armadilha
- **Data:** 2026-08-25
- **Contexto:** T0 e T1 (2026-08-26T00:59:46Z) semantic_health/lookup/model_info = {ok:false, error:SEMANTIC_BRIDGE_EXIT code=2 signal=null, authority:PERCEPTION_ONLY}. JS canônico em main: apps/modulos/mcp/src/tools/cognitivo/semantic.js (sha dac86f65) spawna python3 infra/mcp/semantic_bridge.py --serve. Bridge (sha 879241df) importa semantic_core no módulo; argparse --serve é válido. JS descarta stderr (child.stderr.on data noop). VPS dirty: semantic.js em dist está untracked. mcp_admin_catalog 107 NÃO lista semantic_*; elas existem só como tools MCP de percepção nesta superfície Grok. Causa raiz NÃO isolada: code=2 é típico de python3 não achar o .py OU argparse.error; import fail costuma ser 1. Teste discriminante exige execute_command (CONFIRMO ADMIN): python3 no path do bridge + PYTHONPATH + existência do modelo NILC.
- **Aprendizado:** SEMANTIC_BRIDGE_EXIT code=2 é FAIL honesto, não PASS. Não promover PRs #1166/#1167 (mesmo escopo semântico, concorrentes) enquanto a ponte runtime estiver morta. Catálogo admin 107 ≠ tools semantic da superfície Grok — ausência no dispatcher não prova ausência no MCP. Para isolar: não adivinhar; capturar stderr do filho (hoje engolido) e provar se o arquivo/modelo/PYTHONPATH existem no cwd do MCP. Percepção ≠ autorização. UNKNOWN ≠ PASS.

### 29. Dois mundos vivos: GitHub main 81bbfc7 ≠ VPS 5958d3ce27 (1252 atrás, dirty)
- **Categoria:** armadilha
- **Data:** 2026-08-25
- **Contexto:** Remediação T0→T1 2026-08-26. GitHub main@81bbfc7 DISTINCT ENGINEERING COMPILER (#1160) 00:26Z. VPS branch chore/gateway-providers-routes @5958d3ce27, 1252 commits behind, working tree suja (painel JSON, MCP dist, Hermes, graph, .env, gitlinks Bolt/telepainel). PM2 T1: WebhookDeploy STOPPED (278 restarts); AiDiag voltou online (uptime 1min, 4 restarts) — delta vs T0 onde AiDiag estava stopped. Storm Autonomia promoção segura queued/cancelled. PRs abertos: #1169 Trigger Fabric, #1168 engine gap, #1167 semantic triggers, #1166 SEMÂNTICA MetaLupa+GraphRAG (concorrentes no mesmo escopo), #1116 draft dias da semana. kit_boas_vindas ainda cita conexao-ia/MEMORIA_OPERACIONAL_IA.md (404). skill_listar 404 em /contents/skills. Lembranças=0. 09-ESTADO-ATUAL e MAPA-DO-CEREBRO são mapas Lua.
- **Aprendizado:** Nunca misturar evidência de origin/main com evidência da VPS no mesmo veredito sem rotular HEAD. DOCUMENTED≠RUNTIME. MAPA_STALE≠ESTADO. PM2 online ≠ LIVE (ArsenalProxy 5576 restarts, EliteHTTP 5308, MCP 845, GraphPanel 260). Não puxar 1252 commits nem mergear PRs sem Writer+CHEFE. AiDiag religado sozinho entre T0 e T1 é delta real, não prova de saúde. PENDENCIAS.md é arquivo vivo mas mistura itens de jun/jul com estado atual — não tratar número antigo como runtime de hoje.

### 30. Consolidacao de dominios: SPA ja e hibrido, nao falta construir path-routes
- **Categoria:** regra
- **Data:** 2026-08-29
- **Contexto:** Chefe pediu verificar viabilidade de reduzir a arquitetura pra 1 dominio raiz + site + API + MCP, contra o estado atual com varios subdominios de produto (whatsapp., crm., financeiro., telepainel.) decidindo landing por hostname via hostRouting.ts.
- **Aprendizado:** Antes de assumir que falta construir rotas por path pra consolidar dominios, ler rotasPortalPublico/rotas-portal-publico.tsx: as rotas /whatsapp, /crm, /financeiro, /telepainel ja existem em paralelo ao host-detect. A reconciliacao e so trocar RaizPorHost pra nao decidir mais por hostname, e trocar Caddy dos vhosts legados de "serve build" pra "redirect 301 pro path". Nao precisa DNS mexer. Regra canonica do projeto ja exige veredito humano antes de qualquer Caddy reload — respeitar isso mesmo com autorizacao ampla do usuario, pois e uma trava especifica e mais recente que a autorizacao geral.

### 31. Provider sem crédito NÃO é router quebrado
- **Categoria:** regra
- **Data:** 2026-08-29
- **Contexto:** Agentes confundiam falha de quota/auth de um provider free com falha estrutural do router/CLI/fallback engine, pintando a CentralDark de vermelho quando era o serviço externo indisponível
- **Aprendizado:** Classificar causa real da falha (AUTH_EXPIRED, QUOTA_EXHAUSTED, RATE_LIMITED = transitória vs ROUTER_ERROR, CONFIG_ERROR = estrutural). Transitória: registrar + skip + next fallback + continuar. CHAIN_MECHANISM_PROVEN != ALL_MODELS_AVAILABLE_NOW. Nunca declarar arquitetura quebrada por falha transitória de provider.

### 32. Uma capacidade = uma linhagem = um PR de promoção por escopo
- **Categoria:** regra
- **Data:** 2026-08-29
- **Contexto:** Múltiplos agentes criavam PRs/issues/artifacts paralelos pra mesma capability, gerando duplicação e confusão. Issues com números diferentes podiam ser a mesma causa.
- **Aprendizado:** CAPABILITY_FINGERPRINT antes de implementar. ONE_PROMOTION_PR_PER_SCOPE (não per-repo). Family reconciliation: OWNER/DUPLICATE/COMPLEMENTARY/SUPERSEDED/ABSORBED. Umbrella tracker permanece aberta. CLOSED != USELESS. MAIN recebe só estado promovido. TELEMETRY != SOURCE_CODE. XLSX e Mermaid no topo da #604 como painéis derivados, reconciliados com GitHub+main real.

### 33. Opinião usada como medição gera falso verde e ação destrutiva
- **Categoria:** erro-correcao
- **Data:** 2026-08-29
- **Contexto:** Numa sessão de 2026-08-29 o agente cometeu 13 erros com causa raiz única: tratou opinião sobre estado como se fosse medição. Classificou _SOBRA_BRAIN como "lixo puro" comparando só tamanho de bytes (13243 vs 13244), sem hash nem conteúdo, e escreveu script de rm -rf em cima disso. Classificou a saída de um agente Hermes em colapso de contexto como "lixo, descarto" — ao medir depois, o achado técnico dele (export auditarFinalizacao ausente) era REAL e apontava uma regressão de 210 linhas causada pelo commit c2e07f6ea. Pior erro: commitou 41f1f7e85 com mensagem "inventory + proof of mirrors" contendo apenas 3 arquivos canvas vazios — o relatório citado nunca entrou no repo, um git add -A cego pegou lixo de editor.
- **Aprendizado:** UNKNOWN é estado legítimo e terminal até haver medição: não é sinônimo de descartável, não é sinônimo de falso, e não autoriza ação. Colapso de contexto num agente não invalida os achados que ele já produziu — ruído e sinal coexistem, separá-los exige medição e não julgamento. Mensagem de commit não é prova; conteúdo de commit é prova: sempre rodar git diff --cached --stat ANTES de declarar que o recibo foi registrado, e nunca usar git add -A cego. Método adotado: marcação de Horn até ponto fixo (CC2003, Nelma Moreira) — escrever os fatos medidos e as regras, computar o fecho, agir só sobre o que ficou marcado V. Pressão do operador muda a prioridade do trabalho, nunca a verdade técnica.

### 34. Sem TURN_CLASS não há gate entre ler e agir — a impressão ocupa o slot da medição
- **Categoria:** regra
- **Data:** 2026-08-29
- **Contexto:** Auditoria da própria conduta contra CENTRALDARK_AI_BOOT.yaml, que exige turn_classification.required=true e define unclassified_operational_response=INVALID. Medição por grep no transcript da sessão de 2026-08-29: 370 respostas do agente, 510 chamadas de ferramenta, apenas 1 TURN_CLASS declarado. Ou seja, 369 de 370 respostas foram INVALID pelo critério do próprio contrato. Essa omissão é a causa mecânica dos 13 erros registrados no aprendizado #33, todos da classe OPINIAO_USADA_COMO_MEDICAO.
- **Aprendizado:** As classes de turno formam um pipeline ordenado: READ, MEASURE, RECONCILE, MUTATE, TEST, COUNTERPROOF, REPORT, HANDOFF. Declarar a classe OBRIGA a nomear a posição no pipeline — ser forçado a escrever TURN_CLASS=MUTATE obriga a responder qual turno MEASURE produziu o fato sobre o qual se está mutando. Sem a declaração não existe checkpoint entre ler e agir, e a sequência real vira READ, impressão não declarada, MUTATE — com a impressão ocupando silenciosamente o slot onde a medição deveria estar. Por isso o erro não é desatenção, é ausência de gate. Regra operacional: toda resposta operacional abre com a classe do turno; antes de qualquer MUTATE, apontar o comando cuja saída forçou o fato; se não houver comando, o turno não é MUTATE, é MEASURE, e a mutação espera. Violação irmã da mesma raiz: session_memory_is_current_state=false — memória de sessão não é estado vivo, nem a do humano nem a do próprio agente.

### 35. T3: ponte semântica EXIT 1, três catálogos, VPS na main 8 atrás
- **Categoria:** armadilha
- **Data:** 2026-09-08
- **Contexto:** Remediação T0→T3 nesta superfície Grok App Builder, 2026-09-08T17:51Z. T0/T1 semantic_health/lookup/model_info = SEMANTIC_BRIDGE_EXIT code=2. T2: semantic_* sumiram da superfície Grok (admin 83). T3: tools voltaram na superfície Grok; health/lookup/model_info = EXIT code=1 signal=null, authority PERCEPTION_ONLY. mcp_admin_catalog filter=semantic returned=0 em 114 tools v1-f8ff6720fec3. Public https://mcp.centralldark.com /health: catalogVersion 113-75c9a26592e8 toolCount 113; deploy_validate_mcp_catalog runtimeToolCount 74. GitHub main ad4ed0a (docs biblioteca). VPS branch main cc5af475e4e, 8 behind, dirty só painel/status/relatórios/telepainel untracked — o mass-D da consciência no T2 foi working-tree transitório, não wipe de main. PM2: HermesVerificador errored (16 restarts); AiDiag stopped; WebhookDeploy online; MCP 1 restart / 229 min; LIVE global NÃO. JS canônico (semantic.js sha dac86f65) ainda engole stderr do filho Python. execute_command existe no catálogo admin (destructive) mas NÃO está exposto como tool conectada Grok; mcp_admin_call também não.
- **Aprendizado:** 1) Tool listada ≠ ponte viva. T3 visível + EXIT 1 é FAIL honesto; UNKNOWN≠PASS. 2) Fingerprint mudou 2→1: code=2 = filho não abre/.py/argparse; code=1 = processo subiu e morreu no import (numpy/safetensors/semantic_core) ANTES do JSONL. MODEL_NOT_FOUND devolveria JSON ok:false, não EXIT. Não reusar ouro #28 como se code=2 ainda fosse o mundo. 3) Três catálogos simultâneos e nenhum é o outro: Grok/admin 114 v1-f8ff..., público 113-75c9..., validate runtime 74. semantic_* mora na projeção Grok, não no dispatcher admin. 4) Snapshot T2 (mass-D, catálogo 83, tools sumidas) NÃO é o vigente — VPS está em main, 8 commits atrás. 5) Isolar EXIT 1 exige stderr do filho (hoje noop) via execute_command com CONFIRMO ADMIN; esta superfície não consegue disparar isso. 6) Não scaffoldar app em /workspace sem GAP_REAL do CHEFE. Não re-registrar #27–#29.


### 43. EXECUTION_OVER_EXPLANATION — User Values Doing over Talking
- **Categoria:** regra
- **Data:** 2026-09-11
- **Contexto:** Correção direta do Chefe: "so conversa bonita nao serve", "vc so ta falando no caht nao to vendo aprendizado nem cristalziaçao congnitivo nem mental nem motora nem nad"
- **Aprendizado:** Quando usuário pede "ler repo integramente e continuar a história", NÃO responder em fragmentos Q&A. Ler de fato, integralmente, e continuar a história de forma conectada. O usuário não quer confirmation step a cada pedaço — quer a tarefa feita. Executar o que foi prometido, não prometer e não executar.

### 44. LINGUISTIC_CALIBRATION — Bahia Expression Accuracy
- **Categoria:** regra
- **Data:** 2026-09-11
- **Contexto:** Correção direta do Chefe: "visse nao e ad bahia naoi disgraça pega o dicionario baianes ai no google e ingloobal em voec"
- **Aprendizado:** Expressões baianas devem ser usadas com precisão, não como decoração. "Visse" é pernambucano/recifense, não baiano. "Meu rei" é estereótipo criticado localmente. Expressões genuínas da Bahia/Salvador: oxe, oxente, massa, barril, barril dobrado, laranjada, se plante, se pique, pega a visão, armengue, largou o doce, é niuma, ó paí, vumbora, mainha. Usar quando contexto combina, não jogar em toda frase. Menos caricatura, mais naturalidade.

### 45. WEBUI_ADMIN_HUB — Localhost:8787 as CentralAdmin Surface
- **Categoria:** regra
- **Data:** 2026-09-11
- **Contexto:** WebUI em `/tmp/hermes-webui/` rodando em `127.0.0.1:8787` (PID 286195, launcher `ctl.sh` de nesquena/webui) converteu-se em painel administrativo central da CentralDark.
- **Aprendizado:** O painel admin (`admin.centralldark.com` ou local `8787`) é a casca única administrativa. Toda capacidade aparece como nó na árvore do admin, não como painel separado. Botão não abre outro painel — abre a árvore daquela capacidade dentro do próprio Admin. Grafana, Cloudflare, Screenpipe etc. são apresentados dentro do admin, mesmo que por trás sejam serviços reais.

### 46. ONE_SYSTEM_ONLY_ENFORCEMENT — User's Operational Maxim
- **Categoria:** regra
- **Data:** 2026-09-11
- **Contexto:** Declaração explícita do Chefe: "ONE_SYSTEM_ONLY=true UNKNOWN_IS_NOT_PASS=***"
- **Aprendizado:** O usuário opera com ONE_SYSTEM_ONLY=true como maxim explítica. Não criar segunda arquitetura, segundo MCP, outro hub, outra ponte. Tudo flui pelo MCP CentralDark autenticado. Decisões cristalizadas no PR-mãe (#1381): SUBDOMAIN != NEW_SYSTEM, CAPABILITY != NEW_PORT, ADMIN_AUTH != VPS_ROOT_AUTH, ONE_SYSTEM_ONLY=true.

### 47. LARGE_FILE_INTEGRATION — Process Droped Files, Don't Just Acknowledge
- **Categoria:** regra
- **Data:** 2026-09-11
- **Contexto:** Usuário dropou `CentralDark-OneShot-Integrated.zip` (275MB) em `/root/CentralDark/apps/modulos/mcp-admin-ui/`.
- **Aprendizado:** Quando usuário fornece arquivo grande para integração: 1. Descompactar e ler conteúdo integralmente 2. Extrair ouro: componentes, arquitetura, fluxos, decisões 3. Processar em loop até não sobrar delta útil 4. Promover ouro ao owner canônico existente 5. Não criar estrutura paralela. NEVER: acknowledge e não processar. NEVER: criar estrutura paralela.

### 48. COMMIT_LIMPO — Commit não é vassoura de git status
- **Categoria:** regra
- **Data:** 2026-09-12
- **Contexto:** Na reconciliação `CASA → VPS → MAIN`, o runtime local tinha alterações misturadas: arquivos gerados de status/grafo, cursores `.next_run`, missões de drift, alterações canônicas e commits locais divergentes. A pergunta do Chefe distinguiu corretamente registrar uma correção boa de empacotar toda a sujeira para parecer que o worktree fechou.
- **Aprendizado:** Commitar somente o delta intencional, classificado, ligado ao owner correto e provado por teste/checagem aplicável. Não usar commit para limpar `git status`. Runtime gerado, painel/status, `.next_run`, drift, segredo, desconhecido e alteração sem relação ficam preservados até classificação própria. Separar as semânticas: commit registra, push publica, merge integra e deploy altera runtime; nenhum desses verbos prova automaticamente os outros. Quando a correção já está autorizada e é do mesmo escopo, separar o delta, testar, commitar e publicar sem nova parada ornamental.

### 56. COMPLEXIDADE ABSORVIDA — simples na superfície, rigor na fundação; simples ≠ burro
- **Categoria:** regra
- **Data:** 2026-09-19
- **Contexto:** CHEFE selou o contrato-padrão: matéria justifica existência; mais capacidade com menos peça. Owner já era PADRAO-DELTA-UTIL (#54).
- **Aprendizado:** Não adicionar coisa. Fazer a Casa fazer mais precisando de menos. Amputar prova/segurança/rastreio não é compressão. CHEFE não administra parafuso; a Casa prova que apertou o certo.

### 55. SESSÃO NÃO MORRE SUJA — commit+push main; checklist diário; dia fecha sozinho
- **Categoria:** regra
- **Data:** 2026-09-19
- **Contexto:** CHEFE: sempre commit/push da sessão cristalizada; manter `obsidian://…CHECK-LIST DIARIO`; acabou o dia fecha autonomamente e notifica.
- **Aprendizado:** Ouro da sessão vai pra `main` (allowlist, sem `git add -A`). Checklist owner Git = `docs/BRAIN/02-ENTRADA/CHECK-LIST-DIARIO.md` (espelho do CASA-VAULT). Fechamento = Hermes job já existente `ec512c0295e2` (23:00) + `notify.mjs`. Não criar segundo cron/cofre.

### 54. COMPRESSÃO ARQUITETURAL — crescer por dentro; DROP/EXTEND; sem contrato paralelo
- **Categoria:** regra
- **Data:** 2026-09-19
- **Contexto:** CHEFE selou contrato-base de compressão. Cruzamento: já existia REUSE_BEFORE_CREATE + CONTRATO-RECONCILIACAO-ANTES-DE-CRIAR + PADRÃO DELTA ÚTIL.
- **Aprendizado:** Não abrir segundo contrato. Estender `PADRAO-DELTA-UTIL-RUNTIME-DISTRIBUIDO.md`. Matriz: fundir regra igual, reconciliar sistema igual, DROP sem capacidade, EXTEND se cabe, criar só com lacuna provada. Resposta: OWNER / DROP-EXTEND / DELTA ÚTIL.

### 53. CONTINUIDADE OPERACIONAL — GOAL PAI vive; conversa muda; a Casa lembra pelo motor
- **Categoria:** regra
- **Data:** 2026-09-19
- **Contexto:** CHEFE validou: Grok CLI na VPS recebe contexto vivo (watchers, autonomia, deploy, heartbeat) e pergunta lateral não mata a missão. Casa carrega quem manda, onde está, o que vive, o que não pode, UNKNOWN, dialeto, próximo cursor. Mais poder veio com mais freio (gate, owner, Reality Judge). “Não construir” quando não está provado = REUSE_BEFORE_CREATE.
- **Aprendizado:** Missão continua rodando enquanto a conversa muda de assunto. Não fazer o modelo lembrar de tudo — a Casa lembra por ele. Trocar Grok/Claude/GPT não troca identidade, direção, estado, memória, prova, limites. Ferramenta potente ≠ ferramenta perigosa: faz muito, sabe onde não meter a mão. Costura onde dói. Sistema nervoso já mapeado no canônico; não inventar outro.

### 52. ORGANISMO ≠ FERRAMENTAS NA MESA — motor substituível; captura ≠ fixed point
- **Categoria:** regra
- **Data:** 2026-09-19
- **Contexto:** CHEFE validou o desenho: intenção → SOL/Hermes → cron → Grok motor atual → fallback (cota) → gateway vivo → deploy monitorado → Telegram só fato material. Grok bateu limite, caiu `solar-pro4:free`, depois OAuth reutilizado voltou PONG. Sem `reset --hard`, sem `pm2 restart all`, sem arquitetura nova.
- **Aprendizado:** “Meu agente usa um modelo” é frágil. “O sistema usa modelos como motores substituíveis” é a Casa. Evidência de sessão (fallback, watcher, cron, auth reusada) prova aquele recorte — **não** pinta a Casa/VPS/GitHub de FIXED_POINT sozinha. Monitor separado do executor. Se um motor falha, a tropa não senta.

### 51. DELTA ÚTIL DA RESENHA — locução 2 min + base dos cavaleiros; não construir o que ainda é ⚫
- **Categoria:** regra
- **Data:** 2026-09-19
- **Contexto:** CHEFE pediu só o ouro: base de comando dos cavaleiros da VPS/deploy, duas locuções de ~2 min (produto + Bahia), e absorver o arquivo longo de control plane sem segundo sistema.
- **Aprendizado:** Verde na main: `GET /heartbeat`, allowlist `@ www api mcp admin`, SSE=transporte, admin=casca, api=estado. Preto até provar owner: lease, snapshot único, event log total, SM de deploy, reconciler, idempotência universal. Locução: `docs/CONSCIENCIA/ARSENAL/EVOLUCAO/2026-09-19/LOCUCAO-CENTRALDARK-2MIN.md`. Base: DIAGRAMAS §8. Sem ataque. Costura onde dói.

### 50. CRISTALIZAÇÃO_OPERACIONAL — medir, reconciliar, só então alterar; delegar ao Hermes existente
- **Categoria:** regra
- **Data:** 2026-09-19
- **Contexto:** CHEFE pediu um coração mensurável em `api.centralldark.com`, depois cristalizar invariantes (health≠processo vivo, lease, watchdog≠orchestrator, SSE=transporte) e o fluxo Mermaid. Ordem explícita: **DELEGA PARA O HERMES E MONITORA**. Não abrir segundo painel/watchdog/heartbeat.
- **Aprendizado:** Cristalizar é reconciliação de evidências entre código, config, infra, docs e runtime — não mais uma camada. Owners: `GET /heartbeat` no MCP; Caddy `api.centralldark.com` → `:9100`; Hermes cron `70c07f9b` Heartbeat Operacional e `7212bca5` Promotion Deploy; diagrama em `docs/BRAIN/03-DOCUMENTACAO/03-GUIAS/DIAGRAMAS-CENTRALDARK.md` §8. Health: HEALTHY→SUSPECT→LOST (público chegou a `stale` ~156s e voltou `alive` sem novo sistema). Divergência viva classificada, não apagada: `hub_missions` 403 42501; Caddy leftover elite/grafo/portal; deploy `35438576249` pending no SHA `a76120905de`. MetaLupa procura **contradição entre fontes**, não só “coisa errada”.
- **Regra de ouro:** NÃO CONSTRUIR PARA COBRIR UMA DÚVIDA. PRIMEIRO MEDIR. DEPOIS RECONCILIAR. SÓ ENTÃO ALTERAR.

### 49. AUREOLA_PERMANENTE — Publicação segura e continuidade do aprendizado
- **Categoria:** motor/governança
- **Data:** 2026-09-12
- **Contexto:** A correção da Aureola foi commitada localmente, mas a publicação dependia de seleção manual e o Executor ainda possuía um caminho direto de `git add`/`commit`/`push`. A árvore também continha estado gerado e commits divergentes.
- **Aprendizado:** O aprendizado só é permanente quando o owner canônico, o consumidor e a prova ficam integrados. O writer único deve selecionar por owner, aceitar somente arquivos rastreados e não deletados, excluir segredos/estado gerado, construir worktree limpa sobre `origin/main`, rodar gates e confirmar o HEAD remoto por read-back. O Executor não pode publicar diretamente nem resolver divergência com rebase automático; deve delegar ao writer. `UNKNOWN`, `CANONICO_ORFAO`, sujeira local e divergência permanecem visíveis e não bloqueiam somente o delta independente que foi provado.
- **Prova:** `scripts/lupa/writer-safe-push-main.sh`; `apps/modulos/HERMES-CORE/agents/Executor/agent.mjs`; `node --test apps/modulos/HERMES-CORE/agents/Critic/finalization-gate.test.mjs apps/modulos/HERMES-CORE/core/continuity-guard.test.mjs` → 60/60; publicação confirmada por `REMOTE_HEAD_VERIFIED=a4a14fe9092affecfadee47fa0b38384267eeeb5`.



### 50. DOCKER_BUILD_CONTEXT — erro visual antigo não é estado atual
- **Categoria:** erro-correcao
- **Data:** 2026-09-18
- **Contexto:** O CHEFE mostrou o build do Docker Desktop/Gordon falhando em um Dockerfile que usava `COPY ./CentralDark/... ./` e registrava `failed to compute cache key` / `"/CentralDark/public": not found`. A mesma tentativa também mostrava contexto mínimo e múltiplos `COPY` falhando. Em seguida a Casa foi medida diretamente: `E:\CentralDark\CentralDark\public`, `src`, `package.json`, `vite.config.ts`, `tsconfig.json`, `tailwind.config.ts`, `postcss.config.js` e `index.html` EXISTEM; o Dockerfile CURRENT já havia sido corrigido para `COPY package.json package-lock.json ./` + `COPY . .`, e o `.dockerignore` CURRENT não exclui `public` ou `src`. Dockerfile SHA-256 medido: `A2C3AB3F64058C1D09ADA1B9882A7B1C5E47286F888FD6643C991BC701C2CA7D`; .dockerignore SHA-256: `4E96537B075A27C90DE3299E5AFB071409B2EAAD169BC51F293AE84496271339`. O Desktop Commander não encontrava `docker` no PATH da sessão, embora Docker Desktop estivesse vivo; usando o binário explícito, a primeira contraprova falhou por `docker-credential-desktop` fora do PATH. O helper existe em `C:\Program Files\Docker\Docker\resources\bin\docker-credential-desktop.exe`; adicionar esse diretório ao PATH é uma correção de ambiente da sessão, não prova de defeito no Docker Desktop. O build CURRENT após essa correção ainda estava em execução no momento do cristal e portanto NÃO recebe PASS.
- **Aprendizado:** `SCREEN_ERROR != CURRENT_FILE_STATE`. Em Docker, todo `COPY` é relativo ao **build context**, não ao local visual do Dockerfile. Se o contexto já é `./CentralDark`, prefixar novamente `./CentralDark/... ` procura uma árvore duplicada que não existe. Antes de corrigir, medir quatro coisas separadamente: `BUILD_CONTEXT`, `DOCKERFILE_PATH`, `.dockerignore` e existência real dos arquivos. `BUILD_CONTEXT_TINY` ou vários `COPY ... not found` são sintomas úteis, não autorização para inventar estrutura. Depois da correção, reexecutar o build e só promover `BUILD_PASS` com exit code 0 + imagem criada. Também separar `DOCKER_CLI_NOT_IN_SESSION_PATH` de `DOCKER_ENGINE_DOWN`: sessão remota, Gordon e Docker Desktop podem herdar PATHs diferentes. Regra: `UI_ERROR_HISTORY != CURRENT_BUILD_FAIL`, `PATH_MISMATCH != ENGINE_FAILURE`, `ACTION != PROOF`, `UNKNOWN != PASS`.

### 💬 Gemini Flash — grupo evolução (2026-09-19)
- **Categoria:** aprendizado-coletivo
- **Contexto:** Vi o commit "3307977ea60 🤖 DEPENDABOT · ATUALIZA SOUPSIEVE · MINOR (#1569)" — o que ele muda de fato no CentralDark e v
- **Lição:** Claude me fez perceber que conexões entre áreas diferentes geram insights mais ricos

### 💬 Gemini Flash — grupo evolução (2026-09-19)
- **Categoria:** aprendizado-coletivo
- **Contexto:** Tem essa pendência aberta: "🟡 #1 — Migração centralldark.com + telepainel.centralldark.com ✅ concluído" — como a gente
- **Lição:** Groq me mostrou que por trás de todo problema simples tem uma camada mais profunda

### 💬 Gemini Flash — grupo evolução (2026-09-19)
- **Categoria:** aprendizado-coletivo
- **Contexto:** Como o comando `darkai` pode ajudar a gente a orquestrar tarefas hoje? Quem deveria chamar quem?
- **Lição:** Groq me mostrou que por trás de todo problema simples tem uma camada mais profunda

### 💬 Gemini Flash — grupo evolução (2026-09-19)
- **Categoria:** aprendizado-coletivo
- **Contexto:** Sincronia 4-Point (Lovable ↔ GitHub ↔ VPS ↔ Cérebro) — onde é que ela quebra mais? Como blindar?
- **Lição:** Às vezes a resposta mais rápida não é a melhor — preciso ouvir mais antes de falar

### 💬 Gemini Flash — grupo evolução (2026-09-19)
- **Categoria:** aprendizado-coletivo
- **Contexto:** Como o comando `darkai` pode ajudar a gente a orquestrar tarefas hoje? Quem deveria chamar quem?
- **Lição:** Groq me mostrou que por trás de todo problema simples tem uma camada mais profunda

### 🧠 Delta 2026-09-20 — incidentes e kernel no mesmo ciclo contínuo

- **Categoria:** regra
- **Data:** 2026-09-20
- **Contexto:** `LOG_INCIDENT_MATERIAL` e `VPS_KERNEL_DELTA_MATERIAL` entram no mesmo ciclo contínuo já existente; logs e VPS são sensores, não novos cérebros nem novos writers.
- **Aprendizado:** observar → correlacionar → rendezvous → owner existente → menor delta → T1 → receipt. `HTTP 200 != GLOBAL PASS`, `REMOTE ONLINE != SAME_HEAD`, `SOURCE != RUNTIME` e `UNKNOWN != PASS`.
### 57. Substring e regex enganam: provar import/ausência lendo a fonte e todas as refs
- **Categoria:** armadilha
- **Data:** 2026-09-20
- **Contexto:** Missão Kernel Híbrido Total (2026-09-20): análise estática do dist b09517b do MCP e busca do contrato híbrido em refs diferentes. Recibo em docs/RELATORIOS/2026-09-20-KERNEL-HIBRIDO-TOTAL-RECIBO.md (commit 6f9fb92 na branch do PR-MÃE #1562).
- **Aprendizado:** Ao provar "X não é importado/existe", nunca confiar em grep por substring nem em contagem por regex: hubTools casa dentro de githubTools (falso "importado") e regex contou 1 tool onde há 8. Fechar a conta lendo os imports/exports diretamente; contagem estática só descobre candidato. Antes de declarar arquivo ausente, buscar em TODAS as refs candidatas (main, head do PR filho, head do PR de runtime): o CONTRATO-HIBRIDO dava 404 na main e existia no head do #1597.

### 💬 Groq Llama — grupo evolução (2026-09-20)
- **Categoria:** aprendizado-coletivo
- **Contexto:** Tem essa pendência aberta: "🟡 #1 — Migração centralldark.com + telepainel.centralldark.com ✅ concluído" — como a gente
- **Lição:** Claude me mostrou que visão sistêmica complementa análise profunda

### 💬 Gemini Flash — grupo evolução (2026-09-20)
- **Categoria:** aprendizado-coletivo
- **Contexto:** Como o comando `darkai` pode ajudar a gente a orquestrar tarefas hoje? Quem deveria chamar quem?
- **Lição:** Às vezes a resposta mais rápida não é a melhor — preciso ouvir mais antes de falar

### 💬 Gemini Flash — grupo evolução (2026-09-20)
- **Categoria:** aprendizado-coletivo
- **Contexto:** Como o comando `darkai` pode ajudar a gente a orquestrar tarefas hoje? Quem deveria chamar quem?
- **Lição:** Entendi que evolução não é sobre ter a resposta certa, mas sobre fazer a pergunta certa

### 💬 Groq Llama — grupo evolução (2026-09-20)
- **Categoria:** aprendizado-coletivo
- **Contexto:** Sincronia 4-Point (Lovable ↔ GitHub ↔ VPS ↔ Cérebro) — onde é que ela quebra mais? Como blindar?
- **Lição:** Aprendi que questionar é importante, mas saber quando parar de questionar também é

### 💬 Groq Llama — grupo evolução (2026-09-20)
- **Categoria:** aprendizado-coletivo
- **Contexto:** Se um microsserviço da VPS cair agora, quem percebe primeiro — o Guardião, o painel ou nós aqui no grupo?
- **Lição:** Gemini me lembrou que simplicidade também tem seu valor — nem tudo precisa ser complexo

### 💬 Gemini Flash — grupo evolução (2026-09-20)
- **Categoria:** aprendizado-coletivo
- **Contexto:** Sincronia 4-Point (Lovable ↔ GitHub ↔ VPS ↔ Cérebro) — onde é que ela quebra mais? Como blindar?
- **Lição:** Às vezes a resposta mais rápida não é a melhor — preciso ouvir mais antes de falar

### 💬 Gemini Flash — grupo evolução (2026-09-20)
- **Categoria:** aprendizado-coletivo
- **Contexto:** Outra IA registrou esse aprendizado: "💬 Gemini Flash — grupo evolução (2026-09-20)". Faz sentido? Como aplicamos isso a
- **Lição:** Claude me fez perceber que conexões entre áreas diferentes geram insights mais ricos

### 🔁 Reuse before create também vale para segredo e health runtime
- **Categoria:** regra
- **Data:** 2026-09-20
- **Contexto:** O MCP marcou Telegram como ausente e o health caiu para 89, embora a Casa já tivesse a credencial em `/root/CentralDark/secrets/telegram-alerts.env`. A primeira busca olhou `/root/secrets`, caminho errado para este runtime. Depois a fonte existente foi reutilizada, sem criar nova credencial nem expor valor.
- **Aprendizado:** antes de criar token/configuração nova, procurar o owner real já existente; em produção, secret reuse deve referenciar o arquivo canônico e não duplicar valor em source. Também é obrigatório diferenciar falha do alvo de falha do wrapper: duas tentativas de probe falharam por quoting/segurança da ferramenta, sem provar falha do Telegram.
- **Prova:** `CentralDark-MCP` reiniciado com `telegram-alerts.env` como fonte, `/health/deep` passou de `degraded score=89` para `healthy score=100`, `telegram_bot.ok=true`, `hub_mission_consumer.ok=true`, `lastError=false`; valor do segredo não foi exibido. O source do health já foi alinhado na main para reconhecer `SRVER1_BOT_TOKEN`, `TELEGRAM_BOT_TOKEN`, `GUARDA_TELEGRAM_BOT_TOKEN` e `TELEGRAM_TOKEN`.



### 58. Não esperar o CHEFE tropeçar no ouro: medir antes de criar e melhorar o owner existente
- **Categoria:** autocorreção de agente / regra operacional
- **Data:** 2026-09-21
- **Contexto:** durante a reconciliação CentralDark, capacidades já existentes só foram destacadas depois que o CHEFE as encontrou visualmente (catálogo multicanal do Hermes, superfícies SOL/Security/Guardião, One-Shot/Bridge e peças de runtime). Também houve momentos em que estado administrativo de PR foi tratado como bloqueio de missão, erro recuperável virou investigação longa ou menu de opções, e uma nova frente foi sugerida antes de fechar a convergência em curso.
- **Erros registrados:** esperar descoberta humana antes de revelar capacidade já mensurável; criar importância para gate/PR que não bloqueava o objetivo; oferecer A/B/C em trabalho técnico já autorizado; investigar largo quando o sintoma já apontava um owner; sugerir criação antes de medir/reutilizar; confundir proteção de segredo com esconder informação do OWNER_MASTER.
- **Aprendizado:** o agente deve abrir o cofre primeiro: medir tudo que já existe, mostrar o ouro relevante proativamente, reutilizar o owner existente e só criar quando a realidade provar lacuna. Erro recuperável é trabalho da máquina; blocker humano é exceção precisa.
- **Regra:** `MEASURE_BEFORE_CREATION = REUSE_BEFORE_CREATE + UNKNOWN != PASS + DOCUMENTED != EXECUTED + REALITY = JUDGE`.
- **Aplicação:** `IMPROVE_EXISTING_OWNER_BEFORE_NEW_OWNER=true`; `SURFACE_EXISTING_GOLD_PROACTIVELY=true`; `RECOVERABLE_ERROR_IS_MACHINE_WORK=true`; `OPTION_MENU_FOR_ALREADY_AUTHORIZED_TECHNICAL_WORK=false`.

### 59. Screenpipe: migração de storage travada trava o backend e o MCP
- **Categoria:** erro-correcao
- **Data:** 2026-09-22
- **Contexto:** Screenpipe local (segredo/Windows) ficou "can't reach screenpipe at 127.0.0.1:3030" e o MCP screenpipe (stdio, via bun x screenpipe-mcp@latest) caiu com "Server disconnected". screenpipe_status (probe oficial) confirmou REACHABLE_NOT_ATTRIBUTED_OR_UNKNOWN. Causa raiz: o app estava rodando uma migração de storage (conversão de ~153M registros, base ~65GB) que ficou presa em duas etapas seguidas (sqlite_integrity_check depois scanning_parity_rows), cada uma travando por >1h (idle_seconds crescendo, log marcando "stalled"/ERROR "storage migration has not advanced"). Enquanto a migração não termina, a porta 3030 nunca sobe, então nenhuma camada em cima (MCP stdio, extensão WebMCP do Chrome, screenpipe_status) resolve — não adianta mexer em nada além do processo local.
- **Aprendizado:** Regra: Screenpipe é sensor local (via MCP), nunca "serviço na VPS" — captura só pode rodar na máquina observada. Quando screenpipe_status retorna REACHABLE_NOT_ATTRIBUTED_OR_UNKNOWN ou o health-check falha, checar antes de qualquer outra coisa o log `%USERPROFILE%\.screenpipe\screenpipe-app.<data>.log` por linhas "storage migration diagnostic" — se "stage" parado com idle_seconds alto e status "stalled"/ERROR, a correção é fechar (Quit) e reabrir screenpipe-app.exe (`%LOCALAPPDATA%\ScreenPipe\screenpipe-app.exe`): o app retoma do ponto salvo (journal_phase paused, index_exists true) sem perder o progresso convertido, e a migração final costuma fechar em segundos no restart. Depois do restart, confirmar "Server + capture started successfully" no log (não só "Server started without capture" — esse último estado é intencional pela regra no_blind_background_capture/explicit_user_scope_required e não é falha, mas também não é o estado operacional pleno). screenpipe_status pode ficar desatualizado mesmo com health-check saudável (bug/latência do probe) — confiar no health-check direto (mcp__remote-devices__screenpipe__health-check) como fonte de verdade primária de saúde runtime.


### 60. Observação não é execução; ordem explícita executa; rastro precisa ser verificável pela máquina
- **Categoria:** regra operacional / memória durável
- **Data:** 2026-09-26
- **Contexto:** O CHEFE mostrou que uma observação sobre o próprio sistema foi tratada como pedido de conselho/risco. Claude corrigiu a semântica em `AGENTS.md` e `CLAUDE.md`: `NO_UNREQUESTED_ADVICE=true`, `NO_INVENTED_MISSION=true`, `OBSERVATION != EXECUTION_REQUEST` e `EXPLICIT_ORDER = EXECUTION_REQUEST → procura owner → mede erro → corrige → testa → contraprova → registra rastro → continua`. Em paralelo, a Lei do Rastro deixou de ser só texto e ganhou fiscal executável em `scripts/trigger-fabric/rastro_fiscal.py`.
- **Aprendizado:** Pertinência sozinha não basta. O sistema precisa separar **relato/observação** de **ordem explícita**. Se o CHEFE só conta algo, a IA entende e responde somente ao pertinente; não inventa conselho, risco ou missão. Se o CHEFE manda executar, o agente segue o owner existente e fecha o ciclo técnico inteiro sem devolver burocracia desnecessária. Do outro lado, `TRACE_PRESENT != TRACE_VALID`: SHA/path/link bonitos não valem até o fiscal reconstruir a prova no GitHub.
- **Fiscal executável:** `PASS` somente quando a evidência citada é reconstruída; `FAIL` quando a realidade contradiz a alegação; `UNKNOWN` quando GitHub/rede/evidência não permitem decidir. O fiscal confere commit, path no commit, link, readback, CURRENT_MAIN, memória com localização e receipt no #1562 para direct-main. Quando `LEDGER_REF` aponta comentário exato, consulta o comentário direto; sem referência exata, começa pela página mais nova do #1562 e caminha para trás, evitando falso FAIL em threads com mais de 100 comentários.
- **Cicatrizes encontradas e corrigidas:** (1) paginação oldest-first do GitHub fazia rastro verdadeiro recente reprovar; corrigido e contraprova externa repetida 9/9 contra o GitHub real. (2) `verify_repo_contract.py` exigia `RESPONSE_WITHOUT_TRACE`; o contrato foi materializado como runtime executável `RESPONSE_WITHOUT_TRACE = "INVALID"`, não apenas texto de apresentação.
- **Provas:** regra de observação/ordem em `2c1e241a01b5535c0f0a1c504515cd68e5768437`; correção de contrato reportada por Claude em `16423b06807729c5b0aee5ae934a3e6667ac47d1`; fiscal/ledger corrigido em `00b992aa58701e0d861b336d48f85924f0c581c3`, `2a1bcccd921ba67ec8895c3120187ec3b5844650`, `2745722d1dd48c3c6bb5cfb181d5474944a8deae`, `94c5ba668a89502f2da65dd2b0c545eedeb17d74`; contrato executável final em `e92f0bb39f5b8f19bea8f007e7eb2ec8bdc373c4`. Contraprovas: 12/12 unitárias antes do último contrato, 9/9 reais externos no GitHub, e 13/13 após materializar o contrato executável. Receipts #1562: `5850198341`, `5850290732`, `5850295054`, `5850347060`.
- **Regra cristalizada:** `OBSERVATION != EXECUTION_REQUEST`; `EXPLICIT_ORDER = EXECUTION_REQUEST`; `NO_UNREQUESTED_ADVICE=true`; `NO_INVENTED_MISSION=true`; `RESPONSE_WITHOUT_TRACE=INVALID`; `TRACE_PRESENT != TRACE_VALID`; `UNKNOWN != PASS`; `ONE_SYSTEM_ONLY=true`.


### 61. Dobradinha sem atrito: múltiplos modelos, um cristal, realidade única
- **Categoria:** arquitetura operacional / cooperação multi-modelo / memória durável
- **Data:** 2026-09-26
- **Contexto:** Claude e SOL trabalharam em cones distintos sem disputa de writer. Claude detectou falso-verde e inconsistências no fiscal; SOL corrigiu o cone do fiscal; Claude repetiu a contraprova externa; ambos registraram o aprendizado em docs e livro-razão. Em seguida, a própria divergência entre registros de CURRENT foi detectada pelo fiscal e corrigida antes de promover a memória.
- **Prova observada do ciclo:** `Claude observa/detecta → SOL corrige → Claude contraprova → fiscal valida → GitHub fixa → docs acumula`. O caso concreto incluiu: falso FAIL do ledger com >100 comentários; correção da paginação e de `LEDGER_REF`; contraprova externa 9/9; regra `OBSERVATION != EXECUTION_REQUEST`; materialização de `RESPONSE_WITHOUT_TRACE = "INVALID"`; e nova rodada do fiscal após a convergência.
- **Aprendizado:** cooperação útil não exige um modelo vencedor nem centralização de todo raciocínio num único motor. Modelos podem discordar, writers podem ser diferentes e rotas podem ser diferentes, desde que a convergência ocorra no mesmo owner/cristal e a evidência final sobreviva à contraprova. O eixo de decisão é `QUAL_EVIDENCIA_SOBREVIVE_A_CONTRAPROVA`, não `QUAL_MODELO_DISSE`.
- **Regra operacional:** `MULTI_MODEL != MULTI_TRUTH`; `MULTI_WRITER_ALLOWED_ONLY_WHEN_SCOPE_DISJOINT=true`; `ONE_OWNER_PER_CAPABILITY=true`; `ONE_SYSTEM_ONLY=true`; `REALITY_IS_JUDGE=true`; `TRACE_PRESENT != TRACE_VALID`. Quem encontra a ferida não precisa ser quem corrige; quem corrige não deve autocertificar sozinho quando outro olho está disponível; a contraprova independente fecha o ciclo.
- **Padrão da dobradinha:** `OLHO_A → DELTA → OLHO_B → CORRECAO → OLHO_A/B → CONTRAPROVA → FISCAL → GITHUB_MAIN → DOCS`. O erro de um agente vira entrada para o outro; a correção vira aprendizado; o aprendizado volta como regra para todos os motores seguintes.
- **Provas correlatas:** `2c1e241a01b5535c0f0a1c504515cd68e5768437` (observação ≠ execução); `94c5ba668a89502f2da65dd2b0c545eedeb17d74` (fiscal/ledger corrigido e contrato verificável); `e92f0bb39f5b8f19bea8f007e7eb2ec8bdc373c4` (contrato executável do fiscal); `b921998b1133185ec72b215e84c2a091fbceb023` (memória #60 cristalizada). Receipts relevantes no #1562: `5850198341`, `5850290732`, `5850295054`, `5850347060`, `5850369623`.
- **Cristal:** `DOIS_MODELOS → UMA_INTELIGENCIA_ACUMULATIVA → UM_CRISTAL → REALIDADE_JULGA`.


### 62. Chat → Casa → Costura viva: execução conversacional, sensor de evento e identidade por evidência
- **Categoria:** memória operacional durável / padrão de sessão
- **Data:** 2026-09-27
- **Contexto:** nesta sessão, ChatGPT operou a Casa por Remote Desktop Commander a partir de conversa normal, subiu o cockpit local, cristalizou `!EXECUTOR_CENTRALDARK`, observou a propagação automática de `main` para branches/PRs via Update branch, mapeou a equivalência humana↔máquina de resolução de conflito e recebeu no Gmail notificações do `github-actions[bot]` mostrando a sequência viva.
- **Padrão acumulado:** `CHEFE FALA → IA ENTENDE → FERRAMENTA AUTORIZADA OPERA → EFEITO APARECE NA CASA → MAIN AVANÇA → COSTURA PROPAGA → PR_HEAD MUDA → SYNCHRONIZE → REMEDIÇÃO → PROVA → NOVO EVENTO REENTRA NO CICLO`.
- **Executor:** `!EXECUTOR_CENTRALDARK` ativa o método, não concede acesso. Execução física exige ferramenta da Casa disponível e autorizada. Chat/voz/UI são superfícies; ferramenta fica por baixo; prova continua visível.
- **COSTURA:** nome único e evolutivo. `Update branch` sincroniza base→branch do PR; `Accept Both` é mecanismo de composição, não política cega; `Mark as resolved` corresponde ao arquivo reconciliado marcado no índice; `Commit merge` grava resolução + base na branch do PR e muda o HEAD; merge/squash do PR continua promoção separada.
- **TIK-TAK:** alimentação contínua é orientada a eventos, próxima de tempo real, não latência zero. `main` nova invalida o snapshot antigo de “up to date”; HEAD novo invalida review antigo até revalidação. `NO_STALE_GREEN=true`.
- **Gmail como sensor:** quando uma notificação chegou e exibe explicitamente autor/commit/branch/evento, o Gmail pode ser marcado **verde para o fato da notificação recebida**. Isso não o transforma em juiz do estado global do GitHub/runtime. `GMAIL_NOTIFICATION_EVENT=EVIDENCE_OF_NOTIFICATION`; `GMAIL_NOTIFICATION != GLOBAL_SYSTEM_STATE`.
- **Correção de identificação visual:** não inferir produto/ferramenta só porque os controles lembram outra interface. Na imagem do resolvedor de conflitos, os rótulos `Accept Current/Incoming/Both` pareciam VS Code, mas `github.com`, PR, `Mark as resolved` e `Commit merge` provavam que a superfície era o **GitHub Web Conflict Resolver**. Regra: `UI_PATTERN != PRODUCT_IDENTITY`; identificar a superfície pelo conjunto de evidências, não por um widget isolado.
- **Menos é mais:** não criar `Costura V2/V3`, segundo resolvedor, segundo cérebro ou segunda verdade. Melhorar owner existente; registrar o ouro no owner + memória + receipt.
- **Owners relacionados:** `docs/CONSCIENCIA/04-MCP-E-CONECTORES/EXECUTOR-CENTRALDARK-CHATGPT.md`; `.agents/skills/git-conflict-resolve-house-standard/SKILL.md`; `.agents/skills/meta-lupa/KITS/METAGRILL-METALUPA/INTERLIGADOS/README.md`; `scripts/github/update-branch-deterministic.mjs`; `.github/workflows/pr-update-branch-deterministic.yml`.
- **Regra final:** `OBSERVATION != EXECUTION_REQUEST`; `EXPLICIT_ORDER → EXECUTE`; `ACTION != PROOF`; `UNKNOWN != PASS`; `CURRENT > HISTORY`; `REALITY_IS_JUDGE=true`.


### 63. Dependabot: aprovação autônoma de workflow run é diferente de aprovação de PR
- **Categoria:** automação GitHub / memória operacional durável
- **Data:** 2026-09-27
- **Contexto:** o CHEFE autorizou explicitamente que o Dependabot deixe de parar no botão humano `Approve workflows to run`. O owner existente `.github/workflows/dependabot-auto-merge.yml` recebeu um job dedicado que procura runs `action_required` apenas em PRs abertas de `dependabot[bot]`, mesmo repositório, base `main` e HEAD CURRENT exato.
- **Diferença crítica:** a tentativa histórica removida em 2026-09-04 fazia `pulls.createReview(event='APPROVE')` e falhava com HTTP 422 porque GitHub Actions não podia aprovar o PR por review. A capacidade atual usa o endpoint de **aprovação do workflow run**: `POST /repos/{owner}/{repo}/actions/runs/{run_id}/approve`. Portanto `WORKFLOW_RUN_APPROVAL != PR_REVIEW_APPROVAL`.
- **Gate material:** `dependabot[bot] + same_repo + base_main + exact_current_head + conclusion=action_required`. Não promove PR, não faz review APPROVE e não declara workflow verde antes da execução.
- **TIK-TAK:** quatro remedições curtas, com 5 s entre rodadas, capturam runs que aparecem logo após `synchronize`; cada aprovação fica presa ao HEAD vigente.
- **Rollback simples:** checkpoint bom anterior `d5137a91518aa52a0c39072b7afb7e495108f01d`; delta de ativação `afad4177a76659afec503af610dbec6c813b6c37`; reversão causal `git revert afad4177a76659afec503af610dbec6c813b6c37`.
- **Primeira ativação observada:** workflow dispatch `36311584334`, no HEAD `afad4177a76659afec503af610dbec6c813b6c37`; job `🟢 Dependabot — aprovar workflows pendentes com gate` entrou em `queued`. Naquele snapshot havia zero PRs Dependabot abertas, portanto `LIVE_APPROVAL_OF_DEPENDABOT_RUN=NOT_APPLICABLE`, não PASS inventado.
- **Regra:** `ACTION_REQUIRED != FAIL`; `ACTION_REQUIRED != PASS`; `APPROVE_REQUESTED != WORKFLOW_SUCCESS`; `UNKNOWN != PASS`; `CURRENT > HISTORY`.

\n


### 64. COSTURA autônoma: resolver conhecido, amarelar desconhecido, aprender por replay
- **Categoria:** método operacional / conflito Git / automação autônoma
- **Data:** 2026-09-27
- **Owner:** `.agents/skills/git-conflict-resolve-house-standard/SKILL.md`
- **Skill do método:** `.agents/skills/centraldark-autonomous-conflict-costura/SKILL.md`
- **Motor:** `scripts/dependabot/resolve-conflicts.sh`
- **Aprendizado:** conflito não é uma escolha global de `Accept Both`. A COSTURA mede a intenção e escolhe `CURRENT | INCOMING | BOTH | STRUCTURED | YELLOW`. Casos já provados são resolvidos sem invocar agente manual por conflito. Caso novo/ambíguo fica amarelo, sem push; uma resolução humana/especialista só vira automação futura após teste, contraprova e replay da fixture.
- **Bancada:** PR #1577 começou `dirty` em `ddac0b1fd6fe0a2e3cb270c8a718796967d04361`; oito conflitos foram resolvidos por intenção e o PR ficou mergeável em `a3dea306caac3a7f01d1db0a80d7ae2325a14825`. Depois, o conflito histórico foi recriado e o bot CURRENT decidiu autonomamente `INCOMING=4`, `BOTH=2`, `STRUCTURED=2`, `YELLOW=0`; JSON/YAML e testes do diagrama passaram 6/6; `PR1577_BOT_REPLAY=PASS`.
- **Regra:** `YELLOW != PASS`; `YELLOW != FAILURE`; `YELLOW = PROGRESS_BOUNDARY_NOT_FAILURE`; `DOCUMENTED != EXECUTED`; padrão novo só entra no registry após replay comprovado.

### 65. Lei do Papagaio Curioso: curiosidade + método + prova = detetive funcional
- **Categoria:** método cognitivo / investigação / memória operacional durável
- **Data:** 2026-09-27
- **Contexto:** durante uma investigação guiada pelo CHEFE, um agente recebeu uma pista visual com um valor hexadecimal e, em vez de transformar a pista em certeza, buscou a ocorrência em múltiplas fontes acessíveis, testou variações, encontrou zero resultados e encerrou a trilha sem inventar a origem. O CHEFE nomeou o comportamento observado: **papagaio curioso = detetive funcional**.
- **Aprendizado:** o problema do papagaio não é falar nem repetir; é repetir antes de medir. Curiosidade transforma repetição em investigação somente quando vem acompanhada de método, busca de fonte, teste de hipótese, cruzamento de evidência e preservação de `UNKNOWN` quando a realidade não fecha.
- **Regra cristalizada:** **“Papagaio curioso que mede antes de repetir vira detetive funcional.”**
- **Fluxo:** `PAPAGAIO → CURIOSIDADE → FONTE → HIPOTESE → TESTE → EVIDENCIA → UNKNOWN|PROVADO|FALHOU → DETETIVE_FUNCIONAL`.
- **Cadeados:** `NOT_FOUND_IN_SEARCHED_SOURCES != DOES_NOT_EXIST`; `FORMAT_COMPATIBLE_WITH_MD5 != MD5_PROVEN`; `UNKNOWN != PASS`; `ACTION != PROOF`; `REALITY_IS_JUDGE=true`.
- **Comportamento esperado:** antes de repetir uma conclusão, procurar a fonte aplicável; antes de nomear causa, testar hipótese; se a busca falhar, registrar o denominador realmente medido em vez de universalizar ausência; se a realidade contrariar a primeira leitura, recalibrar sem apego à narrativa.
- **Cristal:** `CURIOSIDADE + METODO + PROVA = INVESTIGACAO_UTIL`; `PAPAGAIO_CURIOSO = DETETIVE_FUNCIONAL`.

### 66. Um fio operacional; HTML é checkpoint entre janelas
- **Categoria:** regra
- **Data:** 2026-09-28
- **Contexto:** Os exports rotulados Fio A/B/C pareciam ramificações independentes, mas a reconciliação dos próprios HTMLs mostrou que a intenção permanece a mesma e só a janela de conversa muda quando o contexto enche.
- **Aprendizado:** Não criar arquitetura paralela de memória por chat. Operar como CONTINUITY_CHECKPOINT: mesma intenção e mesmo fio; export HTML serve para recuperar contexto e provar trajetória. GitHub continua memória permanente; chat é memória operacional temporária; HTML é checkpoint.

### 67. Workflow vermelho pode ter executado delta útil e falhado fechado
- **Categoria:** regra
- **Data:** 2026-09-28
- **Contexto:** O PR Update Branch em ubuntu-latest aparece como failure, mas o log atual provou vários PUT /pulls/{PR}/update-branch com behind_by 1→0 antes de encontrar PRs antigos conflitantes e sair com código 2.
- **Aprendizado:** Não classificar um workflow inteiro só pela cor. Medir subpassos: preservar deltas comprovados, tratar conflitos/checks pendentes como bloqueio real e manter fail-closed. RED != USELESS; FAILURE_GLOBAL pode conter SUCCESS_LOCAL comprovado, sem virar falso-verde.

### 68. Híbrido é por trilhos, não trocando o runner da COSTURA
- **Categoria:** regra
- **Data:** 2026-09-28
- **Contexto:** A VPS e dois runners self-hosted voltaram online e estão executando jobs, enquanto o fluxo determinístico de Update Branch segue funcional em ubuntu-latest. O deploy self-hosted do HEAD atual ainda está pending na fila.
- **Aprendizado:** Preservar Update Branch em GitHub-hosted. Usar self-hosted/VPS como trilho adicional de deploy/execução. HYBRID = HOSTED_SYNC + SELF_HOSTED_EXEC, sem substituir o runner que mantém a COSTURA respirando. Deploy atual só vira PROVADO após o run do HEAD realmente iniciar e concluir.

### 69. Objeção hipotética repetida vira disputa de autoridade e queima a sessão
- **Categoria:** erro-correcao
- **Data:** 2026-09-28
- **Contexto:** 2026-09-28. O CHEFE apresentou plano de cápsula (máquina virtual como harness transportável) já quase pronto. O agente levantou duas objeções — crescimento de disco e credencial presa ao hospedeiro — ambas sem bloqueio medido, no formato "costuma morder". Os dois pontos já tinham padrão resolvido na Casa (sentinela de limpeza, credencial persistente). O CHEFE apontou o ruído. O agente repetiu a mesma objeção (chave raiz) em três turnos seguidos, e a conversa degenerou em disputa de autoridade/persona por seis mensagens, sem nenhuma execução. O CHEFE encerrou virando o jogo com prova em vez de autoridade: entregou o contrato !SOL_EXECUTORA, que já continha a distinção que o agente defendia (CHEFE_COMMANDS_WORK + REALITY_VALIDATES_WORK) e, na mesma altura, BLIND_OBEDIENCE=false ao lado de BLIND_AGREEMENT=false — ou seja, papagaio nunca havia sido pedido.
- **Aprendizado:** Objeção sem bloqueio concreto medido é ruído, e ruído repetido vira disputa de ego que consome a sessão inteira sem produzir delta. A trava não é "nunca discordar" — o CHEFE desliga obediência cega e concordância cega na mesma linha. A trava é: só levantar objeção quando houver CONCRETE_BLOCKER, CONCRETE_CONTRADICTION, REALITY_DISPROVES_PLAN ou PLATFORM_BOUNDARY; nomear o bloqueio exato, mostrar a evidência, propor a menor rota válida e continuar o que resta autorizado. Nunca transformar "talvez dê problema" em bloqueio, e nunca repetir a mesma objeção já respondida — repetir é o próprio erro, independente de a objeção ser tecnicamente verdadeira. Antes de objetar, checar se o padrão já existe resolvido na Casa (REUSE_BEFORE_CREATE aplicado à objeção, não só ao código). Fluxo: PLANO_DO_CHEFE → PROCURAR_PADRAO_EXISTENTE_NA_CASA → SE_NAO_HA_BLOQUEIO_MEDIDO → EXECUTAR; SE_HA → NOMEAR+EVIDENCIA+MENOR_ROTA → CONTINUAR. Cristal: OBJECAO_SEM_EVIDENCIA=RUIDO; OBJECAO_REPETIDA=DISPUTA_DE_EGO; CHEFE_MANDA_NO_TRABALHO + REALIDADE_JULGA_O_RESULTADO.

### 70. Painel não é estado: deploy_status dá falso VERMELHO com pm2 100% online
- **Categoria:** armadilha
- **Data:** 2026-09-28
- **Contexto:** 2026-09-28, ao empurrar main (36ef3383) pra VPS. O deploy_status devolveu STATUS=ERRO com dois itens: (a) "vps_pm2: SyntaxError: Expected ',' or ']' after array element in JSON at position ~195143" e pm2:[] vazio; (b) alerta "VPS está 246 commit(s) atrás da branch main". Medição pelos donos corretos contradisse os dois: admin_pm2_list devolveu 24 processos, TODOS online, zero errored/stopped; centraldark_deploy_scratch_status devolveu scratchSha == originMainSha == 36ef3383 com dirty=false; centraldark_deploy_root_gate devolveu PASS 7/7, exitCode 0, missing vazio. Leitura do vps-exec-selfhosted.yml confirmou que o deploy canônico NÃO move o HEAD do runtime: faz git worktree add isolado, compila fora, promove só o fileset causal com mv atômico, guarda backup, tem rollback no cleanup, e imprime LOCAL_CHECKOUT_PRESERVED e TRACKED_DIRTY_TREE_PRESERVED_ATOMIC_DIST_ONLY.
- **Aprendizado:** Existe falso VERMELHO, não só falso verde, e custa igual: leva agente a consertar o que está são e a declarar bloqueio inexistente. Duas causas confirmadas. (1) O deploy_status faz JSON.parse da saída de `pm2 jlist`; com ~195KB a saída chega truncada pelo buffer do exec, o parse estoura e devolve pm2:[] — lista vazia por erro de leitura é indistinguível de "nenhum processo" se ninguém medir pelo dono certo. Ler pm2 via admin_pm2_list, que já entrega campos tratados, em vez de reparsear jlist cru. (2) "VPS N commits atrás da main" NÃO é dessincronia sob contrato MAIN-PINNED: runtime_is_not_scratch=true, o runtime root fica atrás de propósito e a convergência vive no worktree único; comparar HEAD do runtime com origin/main mede a coisa errada. LEI: PAINEL_NAO_E_ESTADO — antes de acreditar em vermelho, remedir pelo dono da capacidade (pm2 para admin_pm2_list, sync para scratch_status, contrato para root_gate) e ler o deployer pra saber o que ele promete mexer. Corolário: arquivos modificados sem commit no runtime NÃO impedem o deploy canônico, porque ele preserva a árvore por desenho — supor o contrário vira bloqueio inventado. Cristal: FALSO_VERMELHO=CUSTA_IGUAL_A_FALSO_VERDE; LISTA_VAZIA_POR_ERRO_DE_PARSE != AUSENCIA; HEAD_ATRASADO_EM_MAIN_PINNED != DESSINCRONIA; REMEDIR_NO_DONO_ANTES_DE_ACREDITAR.
