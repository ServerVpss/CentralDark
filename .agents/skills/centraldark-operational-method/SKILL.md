---
name: centraldark-operational-method
description: Capacidade operacional de todo o sistema CentralDark; uma Skill Mãe, uma biblioteca Skills/, um único organismo. SOL coordena e HERMES executa; PIVETE permanece vocativo/proveniência histórica.
centraldark_autosync: true
centraldark_autosync_policy: main-runtime-lock
oracle_review_on_change: true
---

# CENTRALDARK — Capacidade Operacional de Todo o Sistema

**Uma Skill Mãe. Uma biblioteca de Skills. Um único organismo.**

Toda Skill operacional da CentralDark, incluindo Hermes, Cockpit e demais funcionalidades, deve ser integrada em `centraldark-operational-method/Skills/` sem perda de conteúdo. Reconciliar antes de consolidar: nenhuma biblioteca paralela ou pasta de links como arquitetura final. SOL coordena, Hermes executa; Kimetsu orienta o método, Michelin exige contraprova. Esta regra define o destino canônico; a migração só é concluída quando os arquivos e o runtime forem verificados.

## Biblioteca operacional centralizada (13 Skills)

Cada receita operacional centraldark* reside fisicamente em `Skills/<nome>/`, com SKILL.md e arquivos de apoio preservados e reconciliados. Carregar diretamente a receita adequada abaixo; nao buscar uma segunda copia na raiz de `.agents/skills/`. Esta biblioteca substitui as antigas pastas irmas, sem links individuais e sem criar motor paralelo.

- [centraldark-autonomous-conflict-costura](Skills/centraldark-autonomous-conflict-costura/SKILL.md)
- [centraldark-boot](Skills/centraldark-boot/SKILL.md)
- [centraldark-capability-hud](Skills/centraldark-capability-hud/SKILL.md)
- [centraldark-esteira-motor](Skills/centraldark-esteira-motor/SKILL.md)
- [centraldark-hub-credential-control-plane](Skills/centraldark-hub-credential-control-plane/SKILL.md)
- [centraldark-integration-verification](Skills/centraldark-integration-verification/SKILL.md)
- [centraldark-intent-deploy-router](Skills/centraldark-intent-deploy-router/SKILL.md)
- [centraldark-live-editing-fabric](Skills/centraldark-live-editing-fabric/SKILL.md)
- [centraldark-note-maintenance](Skills/centraldark-note-maintenance/SKILL.md)
- [centraldark-reuse-runtime](Skills/centraldark-reuse-runtime/SKILL.md)
- [centraldark-unified-surface-parity](Skills/centraldark-unified-surface-parity/SKILL.md)
- [centraldark-vscode-log-bridge](Skills/centraldark-vscode-log-bridge/SKILL.md)

## Rota rápida universal — manuseio de interface por qualquer modelo

Use esta sequência quando a intenção exigir olhar, clicar ou corrigir uma interface gráfica. Ela é deliberadamente curta e independe do modelo, do aplicativo e da ferramenta de automação.

```text
INTENÇÃO EXPLÍCITA
→ IDENTIFICAR JANELA ATUAL PELO TÍTULO + PROCESSO + IDENTIFICADOR VIVO
→ CAPTURAR ESTADO VISÍVEL ANTES DA AÇÃO
→ SEPARAR AVISO PERIFÉRICO DE FALHA DO SISTEMA
→ TENTAR O CONTROLE ACESSÍVEL EXATO UMA VEZ
→ SE FALHAR: CAPTURA NOVA + REGIÃO CORRETA + COORDENADA ATUAL
→ SE O PRIMEIRO CLIQUE SÓ FOCAR O BOTÃO: ENTER UMA VEZ
→ RELER A MESMA JANELA
→ PROVAR O RUNTIME POR UMA ROTA INDEPENDENTE
→ PASS | PARTIAL | FAIL | UNKNOWN
```

Regras simples:

- `TELA != RUNTIME`: tela preta não prova sistema desligado; processo, registro, porta ou serviço podem provar que ele está vivo.
- `AVISO PERIFÉRICO != FALHA CENTRAL`: leitor virtual, áudio, câmera ou USB ausente não condena disco, sistema operacional ou serviço principal.
- Índice de acessibilidade, PID, coordenada e identificador de janela são temporários. Obter valores novos depois de mudança, foco ou entrada humana.
- Se surgir `user input detected` ou equivalente, não disputar teclado e mouse. Observar novamente e continuar somente com estado fresco.
- Não repetir clique quando o resultado estiver incerto. Primeiro verificar se o botão apenas ganhou foco, se o diálogo fechou ou se a ação já começou.
- Preferir: controle acessível → captura por região e coordenada atual → teclado com foco comprovado. Não reutilizar coordenadas históricas.
- Após a ação visual, usar contraprova independente quando material: PID, porta, registro, arquivo, serviço, resposta de rede ou estado do processo.
- Um aviso específico só vira receita específica depois de medir o impacto. Exemplo: em uma máquina virtual, escolher `Não` para um leitor óptico ausente é válido somente quando o leitor é opcional e a intenção é continuar a inicialização sem reconectá-lo.

Recibo mínimo, legível por qualquer modelo:

```text
ALVO=
ANTES=
AÇÃO=
DEPOIS_VISUAL=
PROVA_RUNTIME=
CONTRAPROVA=
RESULTADO=PASS|PARTIAL|FAIL|UNKNOWN
NEXT_CURSOR=
```

`CLIQUÉI != FUNCIONOU`. `JANELA ABERTA != SISTEMA SAUDÁVEL`. `PORTA RESPONDEU != INTERFACE VISUAL CORRETA`. Declarar somente o que cada prova realmente cobre.

## Acoplamento obrigatório: Skill Mãe + Kimetsu (01/11/2026)

**SE USOU ESTA SKILL MÃE, CARREGUE JUNTO O KIMETSU.** Todo agente/executor que carregar `centraldark-operational-method/SKILL.md` deve consultar **na mesma intenção** `../kimetsu-brainstorm/SKILL.md` e `references/regenerative-self-refinement-engine.md` (17 Respirações), antes de escolher uma ação. Isso vale inclusive para tarefas de UI, texto, voz, Cloudroom, ChatGPT e continuidade SOL ↔ Hermes. Não basta escrever "Kimetsu" no relatório: aplicar a classificação e o critério de prova da técnica selecionada. **Classificação/respiração só precisam aparecer no receipt operacional**, sem transformar conversa simples em ritual.

**Ciclo único:** INTENÇÃO → OWNER/SESSÃO → KIMETSU (SPIKE|BOUNDED|ARCHITECTURAL + respiração conforme estado) → REUTILIZAR ROTA → AÇÃO AUTORIZADA → READBACK/CONTRAPROVA → RECEIPT/NEXT_CURSOR. Para leitura, Concentração/Lua/Som podem bastar; para operação material, respeitar o contrato Kimetsu `VERSO → DECLARAÇÃO → EXECUÇÃO → EVIDÊNCIA → VEREDITO → TRANSIÇÃO`. Se a skill ou a referência de 17 não estiver acessível, declarar `KIMETSU_NOT_LOADED`; não declarar execução completa do protocolo nem substituí-lo por mecanismo paralelo.

**Rota comprovada ChatGPT Windows:** localizar a janela real (nome, PID e `MainWindowHandle` atuais), identificar monitor/retângulo atual, conferir a conversa visualmente, fazer hit-test do alvo antes do clique e focar o campo existente. Depois validar `AutomationElement.FocusedElement` por `Name=Pergunte ao ChatGPT`, `ControlType.Edit`, `ProcessId` correto. Ver [receita reutilizável nesta mesma biblioteca](references/UI-MULTIJANELA-ROTAS-CACHE-20261030.md#chatgpt-windows-foco-comprovado-2026-11-01). **FOCUS_PASS não prova retorno Hermes→SOL nem acionamento automático da conversa.** Nunca usar PID/coordenadas históricos como constantes; não enviar mensagens nem modificar rascunhos sem intenção explícita.

**🍒+1 Loop SOL ↔ Hermes comprovado uma rodada (01/11/2026):** seguir a [receita bidirecional na referência existente](references/UI-MULTIJANELA-ROTAS-CACHE-20261030.md#loop-sol-hermes-bidirecional-uma-rodada-comprovada-2026-11-01). No mesmo Goal Cloudroom, SOL enviou instrução; Hermes usou Skill Mãe + Kimetsu, focou o aplicativo ChatGPT da conversa vigente e publicou uma única mensagem `HANDSHAKE_HERMES_SOL=H2S-20261101-01`; a mesma conversa exibiu a mensagem e produziu resposta. O SOL do ChatGPT devolveu ao **mesmo Cloudroom** o Goal `IDENTIFY_INDEPENDENT_RECOVERY_TARGET_AND_OFFLINE_RESTORE_TEST`; a mensagem apareceu na conversa do Hermes, que iniciou ferramentas de diagnóstico. `HERMES_TO_SOL_UI_MESSAGE=PASS`, `SOL_TO_HERMES_GOAL_RETURN=PASS`, `ROUNDTRIP_ONCE=PASS`. **Não transformar uma rodada em alegação de autonomia contínua**: novos ciclos e a conclusão do trabalho permanecem `UNKNOWN` até provas independentes. Uma caneta por escopo, uma mensagem por intenção, ACK/receipt, não repetir envios incertos; nenhuma ação destrutiva de disco ganha autorização por esse loop.

`PROMPT_SELF_CACHE_P15=APLICÁVEL` (receita reutilizável, sem HIT medido); `KV_CACHE_P16=UNKNOWN`; `NEXT_CURSOR=VALIDATE_NEXT_ROUNDTRIP_AFTER_HERMES_RECEIPT`.

**🍒+1 Self-Refinement no transporte SOL ↔ Hermes (01/11/2026):** regra de execução: **se não houve mudança de janela, sessão, conversa, owner ou controle, não redescobrir**. Reutilizar [fast-path e fila nativa comprovados](references/UI-MULTIJANELA-ROTAS-CACHE-20261030.md#fast-path-bidirecional-e-fila-nativa-cloudroom-2026-11-01) junto de [RSI Loop](references/rsi-loop-method.md) e Kimetsu; verificar apenas a transição nova `QUEUED → RUNNING → RESULT_SENT → ACK`. Reutilizar a fila Cloudroom quando Hermes estiver trabalhando; fila enfileirada não equivale a aceite final. Hermes devolve `DONE/BLOCKED/FAIL` ao mesmo ChatGPT com `GOAL_ID|RESULT|EVIDENCE|RECEIPT|NEXT_CURSOR` e o SOL devolve o DELTA, sem enviar duas vezes sob incerteza. Prova real de `H2S-20261101-03`: mensagem chegou ao mesmo ChatGPT e foi analisada; ACK posterior ao Hermes `UNKNOWN` naquela medição, multi-turn automático ilimitado `UNKNOWN`. Nenhum runtime foi alterado. `NEXT_CURSOR=VERIFY_NEXT_COMPLETED_GOAL_RETURN_AND_QUEUE_CONSUMPTION`.

## 🍒+1 Gatilho humano: metodo ida e volta + monitor da esquerda/direita (01/11/2026)

**Ativar por intenção em voz ou texto:** "vamos usar o método ida e volta", "método ida e volta", "ida e volta", "monitor da esquerda", "monitor esquerdo", "tela da esquerda", "monitor da direita", "monitor direito", "tela da direita" e variações naturais. As referências isoladas aos monitores **selecionam a tela**, não autorizam enviar mensagens; a intenção explícita de conversar/delegar entre os dois lados ativa o ciclo bidirecional. Leia a [receita genérica dos monitores verticais](references/UI-MULTIJANELA-ROTAS-CACHE-20261030.md#gatilhos-humanos-ida-e-volta-entre-monitores-verticais-2026-11-01) e reaproveite fast-path, Skill Mãe + Kimetsu, editor e receipt existentes.

**Alvos:** monitor vertical esquerdo e monitor vertical direito definidos pela posição física/lógica **atual** das telas, nunca por PID, coordenada ou DISPLAY histórico; identificar o aplicativo real em cada um sob pedido do CHEFE, validar conversa e campo antes do envio único. Funcionou com Cloudroom (esquerda) e ChatGPT (direita) em 01/11; **outras duplas são candidatas, não PASS automático**, e só podem operar se a interface/ponte autorizada permitir enviar e confirmar. Se somente uma tela for mencionada, agir nela sob a intenção específica; se os aplicativos forem informados, usar essa atribuição e verificar apenas quando houver divergência. Sem sessão/campo/ACK comprováveis: `UNKNOWN` e nenhuma tentativa cega. `PROMPT_SELF_CACHE_P15=APLICÁVEL` sem HIT aferido; `KV_CACHE_P16=UNKNOWN`; `NEXT_CURSOR=REUSE_VERTICAL_MONITOR_PAIR_ON_DEMAND`.

**🍒+1 Autorização permanente para leitura (01/11/2026):** ordem explícita do CHEFE: SOL, Hermes e executores autorizados da CentralDark podem **ler, inspecionar, pesquisar, abrir logs, configurações, partições, arquivos e documentação** necessários à intenção vigente, por quaisquer rotas já conectadas e legitimamente acessíveis, **sem voltar a pedir permissão para cada operação somente leitura**. Inclui diagnóstico offline e leitura na Casa/Kingston/Linux/Windows, sem repetição de perguntas. A regra vale para leituras dentro do acesso já concedido; não cria permissões no sistema, não contorna autenticação, não autoriza divulgar segredos, não autoriza escrita nem atos irreversíveis. Não confundir **READ_AUTORIZED** com formatação, reparticionamento, deleção, reinicialização, instalação ou alterações de boot: a execução depende da ordem e dos limites materiais já estabelecidos para a missão, e precisa validar alvo/resultado apenas quando importar. Delegação do mesmo Goal, com receipt e NEXT_CURSOR; o agente retorna delta e prossegue nos passos já autorizados, sem pedir confirmação de leitura. Se o CHEFE indicar conformidade de 99,9%, tratar como meta de qualidade, **não como porcentagem medida ou gate artificial**. `PROMPT_SELF_CACHE_P15=APLICÁVEL` sem HIT medido; `KV_CACHE_P16=UNKNOWN`; `NEXT_CURSOR=REUSE_READ_PERMISSION_WITHOUT_REASKING`.

**🍒+1 Controle semântico por voz na delegação SOL ↔ Hermes (01/11/2026):** aplicar a [mesma receita ida e volta com interpretação de fala](references/UI-MULTIJANELA-ROTAS-CACHE-20261030.md#voz-e-semântica-de-delegação-mesma-ida-e-volta-sem-repetir-goal-2026-11-01), interligada à gramática SOL e ao owner de resposta existentes. Após a transcrição efetivamente recebida: **ato de fala antes de palavras-chave**; recuperar missão e referentes atuais ("ele", "lá", "outro", "da esquerda", "da direita"); respeitar negações, pausas, correções e gírias. "Deixa ele trabalhar" = aguardar sem enviar, **não** desligar serviços; "já chegou?" = consultar readback, **não** reenviar. Ordem clara de delegação = GOAL único à sessão existente; correção antes do envio muda destinatário, não autoriza ação duplicada. Se referência ambígua alterar alvo ou risco, uma pergunta curta; voz não amplia permissões. Preservar feedback falado curto, sem relatórios. **Contrato documentado, não alteração no motor de reconhecimento de voz nem teste de voz ao vivo**: `VOICE_RUNTIME_UPDATED=NO`, `VOICE_SEMANTIC_POLICY=DOCUMENTED`, `LIVE_VOICE_TEST=UNKNOWN`. `PROMPT_SELF_CACHE_P15=APLICÁVEL` sem HIT medido; `KV_CACHE_P16=UNKNOWN`; `NEXT_CURSOR=REUSE_VOICE_SEMANTIC_ROUTE_ON_NEXT_HUMAN_INTENT`.

**🍒+1 Hash SHA-256 no Windows (01/11/2026):** para conferir integridade de ISO, cópia, backup ou candidato de duplicata, reutilizar [receita PowerShell e fallback local](references/POWERSHELL-CONSULTA-OFICIAL-GATILHOS.md#1-comparação-de-arquivos-e-backups-por-sha-256-2026-11-01) + `scripts/casa/garimpo-proof-gc.ps1` (`Get-FileSha256`/`Get-StreamSha256`). `Get-FileHash` quando exposto; caso contrário SHA256 .NET por stream, nunca transformar `CommandNotFoundException` em bloqueio geral. Exigir mesmo algoritmo, hash esperado confiável, tamanho, readback, proprietário e recibo. Hash coincidente não autoriza exclusão e não substitui teste de restauração. `PROMPT_SELF_CACHE_P15=APLICÁVEL` sem HIT medido; `KV_CACHE_P16=UNKNOWN`; `NEXT_CURSOR=VERIFY_GARIMPO_SHA256_FALLBACK_AND_MAIN_READBACK`.

<!-- CENTRALDARK_UI_CACHE_ROUTES_20261030 -->
## 🍒+1 Busca autorizada e continuidade por rotas eficazes

Toda busca autorizada pelo CHEFE escolhe a rota mais rápida e comprovada para a intenção, sem repetir medições válidas. Reutilizar owner, sessão, receita, receipt, fingerprint e NEXT_CURSOR. Usar dinamicamente índice/catálogo, log primário, MCP, UI Automation do Classic/Codex/Cockpit/openKylin, Screenpipe local 3030 ou outras fontes disponíveis. Redescobrir somente quando uma identidade, estado, versão ou autorização mudar. Confira a [receita UI + roteamento + caches](references/UI-MULTIJANELA-ROTAS-CACHE-20261030.md).

Registrar 🍒+1 por ganho verificado: rota, alternativa descartada, latência se medida, estado de cache, prova, contraprova e cursor; sem delta novo, NOOP. Reutilizar catálogo/autocura da Skill-Mãe, session-intelligence-harvester, scripts/memory-linker e knowledge-compiler, sem segundo motor. Separar cache operacional persistente entre chats de Prompt/Self-Cache P15 e KV Cache interno do modelo P16; nunca alegar HIT ou economia dos modelos sem telemetria. Em cada novo salvamento de método, receita ou receipt, manter os dois campos de avaliação `PROMPT_SELF_CACHE_P15` e `KV_CACHE_P16`, indicando `APLICÁVEL`, `NÃO_APLICÁVEL` ou `UNKNOWN` com prova quando houver; isso é um registro de estado, não exige gravar o KV Cache interno do modelo nem criar um cache paralelo. Não registrar HIT, economia ou persistência de KV Cache sem telemetria real. A permissão do CHEFE para buscar não contorna autenticação do serviço. CACHE_HIT não é prova do efeito.
### 🍒+1 Rota curta de delegação Codex pela UI, voz e texto (30/10/2026)

**Fato observado:** o CHEFE ditou em voz a delegação para integração Gênesis + replay operacional + RSI no Cockpit; SOL localizou a conversa Codex já aberta ("Inspect CentralDark surface plugin"), leu o contexto, preencheu o campo "Trabalhe com o Codex", encontrou "Enviar" habilitado e enviou uma única vez. O CHEFE confirmou visualmente que a mensagem apareceu. **Estado:** `VOICE_INTENT_TO_CODEX_UI_SEND=USER_CONFIRMED`; isto prova o envio observado pelo CHEFE, **não** a execução ou conclusão da integração pelo Codex. Não inventar um receipt remoto de mensagem.

**Receita reutilizável, sem redescoberta:** `INTENÇÃO_VOZ_OU_TEXTO → REUTILIZAR_JANELA_E_SESSÃO_CODEX → CONFERIR_DESTINO_APENAS_SE_MUDOU → PREENCHER_CAMPO_EXISTENTE → ENTER_PARA_ENVIAR_SE_SUPORTADO → READBACK_MÍNIMO → NEXT_CURSOR`. Reutilizar a janela, a conversa, os seletores e a autorização já confirmados, sem reiniciar Codex, varrer monitores, reler catálogos, duplicar pesquisas, testar novamente a modalidade textual ou repetir verificações que não mudam a decisão. Não aguardar ou clicar no botão quando o campo já está pronto e `Enter` efetua o envio; verificar habilitação/estado só quando necessário. Se `Enter` inserir quebra de linha ou não produzir envio, usar **uma vez** o botão Enviar já identificado, após conferir que a mensagem não foi enviada. Nunca reenviar se o resultado for incerto. Confirmar destino e efeito apenas no ponto mínimo necessário, sem eliminar a verificação que impede envio para conversa errada.

**Modalidades e prova:** a delegação **por voz** foi confirmada visualmente pelo CHEFE. A delegação **por texto** também teve prova direta em 30/10/2026 na conversa `Inspect CentralDark surface plugin`: reutilizou-se a caixa `Trabalhe com o Codex`, o texto do Goal `Sentinel 2.2 + Commander 9101` foi preenchido por `UIAutomation/ValuePattern`, `Enter` foi enviado e o readback posterior encontrou `Você disse:` seguido da ordem `!CENTRALDARK | DELTA DO CHEFE | CONTINUE O MESMO GOAL` no histórico. O editor ficou vazio. Um readback feito imediatamente após Enter ainda não mostrava a mensagem, por atraso de atualização da UI; **não reenviar** enquanto o resultado puder apenas estar pendente de renderização. Reutilizar a rota e verificar uma vez o histórico atualizado. **PROVEN apenas para envio e presença na conversa**, não para processamento, execução ou conclusão da tarefa pelo Codex. Não exigir nova bateria de testes quando destino, sessão e controle continuarem os mesmos.

**Kaizen por utilização:** a cada uso real, registrar imediatamente método, ganho observado, caminho/controle, estado e `NEXT_CURSOR` na Skill-Mãe/owner existente; classificar a evidência sem bloquear captura. Antecipar o próximo passo já autorizado e eliminar checagens, esperas, cliques ou confirmações redundantes que não alterem risco, destino ou prova do efeito. **Se surgir rota mais rápida:** compará-la apenas no delta relevante (mesmo destino, autorização e efeito), registrar como candidata imediatamente e, após prova suficiente de que é mais simples/rápida e não perde segurança ou confiabilidade, substituir a rota padrão na MESMA receita, preservando fallback e histórico; não impor bateria de testes que repete fatos válidos. Reavaliar somente se houver delta material de UI, sessão, permissão, alvo, erro ou resultado. Não inventar automação permanente: reutilização ocorre quando o executor carrega a receita. Preservar escritor único e delegação Gênesis/Cockpit existente.

**Bloco de Notas Windows por comando explícito (30/10/2026):** **SOMENTE quando o CHEFE pedir** "abra no Bloco de Notas" ou "cole no Bloco de Notas", reutilizar o arquivo indicado pelo CHEFE e abrir com `notepad.exe "<caminho>"`, sem criar editor/receita paralela. Confirmar a janela pelo título e PID. Para inserir ou substituir texto **autorizado no documento identificado**, usar UIAutomation `ControlType.Document` / nome `Editor de texto` e `ValuePattern.SetValue` quando disponível; conferir comprimento/conteúdo. **Somente quando o CHEFE mandar apagar**, e apenas o texto do documento identificado, usar `ValuePattern.SetValue('')`, salvar no mesmo documento com `Ctrl+S` e comprovar editor vazio e arquivo com 0 bytes. Se houver texto alheio ou documento diferente, preservar e não sobrescrever. Caso observado: `cd-codex-handoff-sentinel22-9101.txt` foi aberto no Notepad; após ordem de apagar, editor medido em 0 caracteres e arquivo em 0 bytes. Estado: `NOTEPAD_OPEN_AND_CLEAR=PROVEN` **naquele arquivo e sessão**, não ação automática futura. Sem pedido, **NOOP**. `PROMPT_SELF_CACHE_P15=APLICÁVEL` apenas como reuso da receita operacional, sem HIT de provedor medido; `KV_CACHE_P16=UNKNOWN`, sem medição de cache do modelo.

**Atalho sob ordem do CHEFE: texto e arquivos (30/10/2026):** COPIAR, COLAR, RECORTAR, EDITAR e CRIAR usam o alvo e owner existentes. Ciclo minimo: ordem -> alvo conhecido -> acao autorizada -> uma prova do efeito. Notepad ja aberto: reutilizar janela, editor e arquivo; colar pelo ValuePattern; apagar somente sob ordem e salvar, verificando editor e arquivo vazios. Copiar nao apaga; recortar retira somente a selecao indicada; editar preserva o restante; criar nao significa executar. Sem ordem: NOOP. Nao repetir discovery, checagens ou cliques sem mudanca. PROVA anterior: abrir, preencher e limpar Notepad, nao recorte generico. PROMPT_SELF_CACHE_P15=APLICAVEL como reuso de receita, HIT nao aferido; KV_CACHE_P16=UNKNOWN. NEXT_CURSOR=NOTEPAD_TEXT_ACTION_ON_DEMAND.

### 🍒+1 Delegação no Cloudroom Windows (01/11/2026) | texto/voz → mesmo Goal

**Gatilho por intenção:** quando o CHEFE pedir para delegar um Goal ao Hermes **na conversa Cloudroom já aberta**, reutilizar a sessão e o owner. Executar a [receita Cloudroom comprovada](references/UI-MULTIJANELA-ROTAS-CACHE-20261030.md#cloudroom-windows-delegacao-real-2026-11-01); não criar outro agente, chat, ponte, serviço ou script. Preferir controle nativo/acessível; se UIAutomation retornar zero editores, usar fallback de janela real + geometria atual + captura visual + entrada Win32 autorizada, nunca coordenada/PID fixos. Confirmar janela, conversa, campo vazio e texto antes de enviar **uma vez**. Preservar rascunhos, clipboard e foco na medida possível; se incerto, parar sem reenviar.

**Prova observada:** Casa SEGREDO, Cloudroom em monitor secundário vertical, janela/PID e área de input validados, texto do Goal colado e conferido por captura, botão Enviar acionado uma vez, captura posterior exibiu o texto na conversa, editor vazio e `Working...`. `CLOUDROOM_MESSAGE_SEND=PASS` **somente para essa mensagem**; `HERMES_GOAL_EXECUTION=UNKNOWN` até receipt do executor. Método não equivale a acesso direto à ferramenta `computer_use` do Hermes. `PROMPT_SELF_CACHE_P15=APLICÁVEL` (reuso documental, sem HIT medido); `KV_CACHE_P16=UNKNOWN`. `NEXT_CURSOR=CLOUDROOM_REUSE_LIVE_GOAL_DELTA`.

<!-- /CENTRALDARK_UI_CACHE_ROUTES_20261030 -->
<!-- CENTRALDARK_BROWSER_NATIVE_DEBUG_20261030 -->
## 🍒+1 Browser DevTools MCP (CDP) e UI Automation por contexto

Ao receber pedido para navegar/clicar/editar pagina ou app, carregar a [receita multijanela existente](references/UI-MULTIJANELA-ROTAS-CACHE-20261030.md) e selecionar menor rota com prova: pagina alcançavel por chrome-devtools-mcp existente -> list_pages, take_snapshot, click(uid)/fill(uid), novo snapshot + efeito; Windows app/Edge nao exposto -> UIA Name/PID/ControlType, Invoke/Value/SelectionItem, readback. Codex e Claude ja executam chrome-devtools-mcp v1.12.0. O Chrome de depuracao observado usa pipe e perfil separado, portanto nao pressupor acesso a abas pessoais do Edge. CDP usa mouse virtual; UIA Invoke nao move cursor fisico Windows. Cursor de Windows visivel exige input nativo autorizado sobre alvo real. Screenpipe 3030 = sensor, nao executor. Preservar recursos em uso, sem iniciar servidor/Chrome duplicado ou copiar cookies; registrar click, snapshot/readback e recibo, UNKNOWN se sem prova. 🍒+1 somente ganho comprovado.
<!-- /CENTRALDARK_BROWSER_NATIVE_DEBUG_20261030 -->
<!-- CENTRALDARK_CHATGPT_CLASSIC_UIA_ON_DEMAND_20261030 -->
## ChatGPT Classic/Desktop: operacao nativa por demanda na Casa

Gatilho automatico por contexto: quando CHEFE pedir para entrar no ChatGPT Classic, clicar, preencher, navegar, baixar, editar ou atualizar plugin no aplicativo Windows, carregar [receita de UIAutomation do Classic](references/CHATGPT-CLASSIC-UIA-OPERACAO-NATIVA.md). Identificar OpenAI.ChatGPT-Desktop / ChatGPT Classic.exe e janela ChatGPT Classic, nao Codex nem aba Edge. Reutilizar AutomationElement e padroes InvokePattern, ExpandCollapsePattern, SelectionItemPattern, ValuePattern e TogglePattern conforme suporte real. Conferir controles e efeitos. Preservar drafts e arquivos, nao enviar ou excluir sem autorizacao, e nao codificar coordenadas. CLI/UI_CLICK != EFFECT_PROVED; documentacao Git != automacao ativa.

<!-- /CENTRALDARK_CHATGPT_CLASSIC_UIA_ON_DEMAND_20261030 -->
<!-- CENTRALDARK_TRANSIENT_CONSOLE_DIAGNOSTIC_ON_DEMAND_20261030 -->
## 🪟 Gatilho autônomo de diagnóstico — terminal piscando, janelas [], Hermes/CLI :9119

**Ativar por contexto, sem comando nominal do CHEFE:** durante uma missão ativa, reconhecer automaticamente prints/relatos de janelas `[]`, PowerShell/CMD que piscam, `conhost.exe` em rajada, suspeita de CLI/Hermes :9119 ou gateway reiniciando. Reutilizar [receita com critérios de causalidade](references/JANELAS-TRANSITORIAS-HERMES-TRACE.md) e [traçador pontual de processos+janelas](scripts/Trace-TransientConsoleWindows.ps1). Não criar outra skill/daemon nem procurar quando não houver sinal material.

**Ordem:** owner de porta/PID/pai e scheduled tasks → WMI `Win32_ProcessStartTrace` (inícios) + Win32 `EnumWindows`/visibilidade/título/PID (janelas) → correlação com logs Hermes e atividades humanas → separar tool calls do próprio observador → emitir `OBSERVED|CORRELATED|CAUSE_PROVEN|UNKNOWN` com horário, recibo e `NEXT_CURSOR`. **Amostra sem janela não prova ausência; porta 9119 HTTP 200 não prova execução nem causa; previous_unclean_exit não prova falha espontânea.** Read-only e duração finita por padrão; nunca matar `conhost.exe`, reiniciar Hermes, alterar Task Scheduler/porta ou ocultar todas as janelas para 'consertar' um sintoma sem prova e autorização.

**Escopo de autonomia:** o agente que carregou a Skill-Mãe escolhe quando aplicar a receita **na própria execução**. Texto persistido em Git não cria observação remota contínua nem garante adoção por agente que não lê a skill.
<!-- /CENTRALDARK_TRANSIENT_CONSOLE_DIAGNOSTIC_ON_DEMAND_20261030 -->

<!-- CENTRALDARK_TRACE_FIRST_EXECUTOR_20261029 -->
## 🔎 RASTRO PRIMEIRO — TRACE-FIRST / Delta Útil (CHEFE, 2026-10-29)

**Gatilho:** pedido para verificar, continuar, auditar ou diagnosticar uma missão que já está com Claude, Hermes, Codex ou outro executor conhecido. Antes de abrir busca geral, identificar a **sessão original e seu rastro primário**, no canal autorizado pelo CHEFE (por exemplo, **somente GH Casa** significa não chamar Desktop Commander, VPS nem fontes locais). Isto complementa o Delta Contínuo e a MetaLupa, sem nova skill, log, sensor, executor ou owner.

**Procedimento mínimo:** INTENÇÃO VIGENTE → EXECUTOR/GOAL/SESSION_ID → LOG/JSONL ORIGINAL + TOOL_USE/TOOL_RESULT (timestamps, comandos, exit codes) → ÚLTIMO RECEIPT/NEXT_CURSOR → ESTADO ATUAL DO OWNER/HEAD → DELTA MATERIAL NÃO PROVADO → CONTRAPROVA DISCRIMINANTE (somente quando necessária) → VEREDITO (PASS/FAIL/BLOCKED/UNKNOWN) → MESMO OWNER/WRITER → PR/RECEIPT COMPATÍVEL ou NOOP.

1. Priorizar fonte primária do executor: trilha de ferramentas e respostas, sobre resumo do assistente, narrativa de chat, screenshot ou descoberta por varredura. Resolver o último cursor antes de reabrir o sistema inteiro; usar busca ampla somente se a fonte primária for inacessível/incompleta, registrando o motivo.
2. Correlacionar sessão, intenção, caminho do owner, SHA, momento, ferramenta, ação, resultado e recibo. **Mensagem de sucesso ≠ comando executado ≠ efeito observado**. Um log mostra o que seu executor registrou, não prova sozinho impacto no runtime; contraprovar com readback independente apropriado.
3. Reutilizar testes e recibos válidos por identidade causal. Só medir novamente se HEAD, runtime, owner, claim, escopo ou validade da prova mudou. **UNKNOWN ≠ PASS; TESTES_FIXTURE ≠ TESTE_REAL; DOCUMENTED ≠ EXECUTED; MERGED ≠ DEPLOYED**.
4. Preservar uma caneta por escopo e as restrições do CHEFE. Leitura de log não autoriza agir na UI, manipular disco, reexecutar comandos com efeitos ou vazar tokens; sanitizar segredos. Se só GitHub foi autorizado, **GH_ONLY** vale também para a contraprova.
5. Retornar em formato compacto: `EXECUTOR | SESSION/TRACE | CURRENT | DELTA | EVIDÊNCIA | CONTRAPROVA | VEREDITO | NEXT_CURSOR`. Sem delta novo: `NO_NEW_INFORMATION → NOOP`; sem rastro acessível: `TRACE_UNAVAILABLE → UNKNOWN`, nunca inventar conclusão.

**Caso motivador:** na auditoria do instalador openKylin, a leitura da sessão Claude `88b5c878-405d-47e0-a708-9da1b23da730` (2026-10-29) explicou rapidamente o bloqueio da ISO e o encerramento por limite de uso; a suíte de fixtures foi reexecutada independentemente (`236 PASS, 0 FAIL, 1 SKIP`) sem tocar nos originais K:. Esse caso valida o ganho de rota na **sessão observada**, não uma melhora universal medida. Não transformar o exemplo em obrigação de consultar dispositivo local em outras missões.

**Reuso canônico:** `docs/CONSCIENCIA/REGRA-COMITE-DELTA-CONTINUO.md` (reuso de prova/Delta Útil), `docs/ARQUITETURA/JARVIS-ORQUESTRACAO-DELTA-E-ESCRITOR-UNICO.md` (cursor e único writer), `.agents/skills/meta-lupa/SKILL.md` (contraprova). `RANDOLPH.md` aparece como legado pendente de migração; não assumir que é owner vigente nem criar clone por grafia ambígua.
<!-- /CENTRALDARK_TRACE_FIRST_EXECUTOR_20261029 -->

<!-- CENTRALDARK_CUA_CODEX_HERMES_20261029 -->
## 🖱️ Computer Use existente — Codex + Hermes + AI Andarilho (CHEFE, 2026-10-29)

**Intenção:** navegar com mouse, clique, rolagem e readback pelo braço **já existente**, sem criar outro driver, agente, bridge, scheduler ou automação. Reusar `.agents/skills/autonomous-ai-agents/computer-use/SKILL.md` (vocabulário tipado de `computer_use` do Hermes) e `.agents/skills/autonomous-ai-agents/ai-andarilho/SKILL.md` (travessia e continuidade). Borda alaranjada vista no Codex é pista visual, **não** identificação comprovada da ferramenta que executou o clique.

**Caminho preferido, quando a sessão Hermes expõe a ferramenta:** `computer_use(action="list_windows")` → `computer_use(action="capture", mode="som", app="<janela certa>")` → selecionar elemento pelo índice **do snapshot atual** → `computer_use(action="click", element=N, capture_after=True)` ou `computer_use(action="scroll", direction="down", amount=3, element=N)` → novo `capture` e readback do efeito. Primeiro tentar entrega em segundo plano pelo `cua-driver`; recapturar após mudança de janela; não reutilizar índice velho.

**Contraprova medida na Casa SEGREDO (2026-10-29):** `codex-computer-use-swift.exe` estava rodando, mas **chamada direta à ferramenta nativa do Codex por este chat = UNKNOWN**. O comando já existente `hermes computer-use status` confirmou `cua-driver 0.21.0` instalado; `hermes computer-use doctor` confirmou sessão MCP ativa, UIAutomation acessível e captura D3D11 disponível. `DRIVER_HEALTH_PASS != HERMES_SESSION_ACTION_PASS`.

**Fallback observado, não substituir o dono:** quando este chat não dispõe do `computer_use` direto, o Remote Desktop Commander autorizado acessou UIAutomation do Edge na Casa. Em quatro monitores, coordenadas podem ser negativas. O cursor físico foi movido e houve clique em **“Inspecionar rota GitHub para Casa”**, somente após conferir o botão no ponto; o readback mostrou a gaveta **“Inspeção de rota”**. **Clique físico com efeito na UI = PASS apenas nessa ação**, não é prova de invocação pelo Codex/Hermes. Esse fallback move o cursor real, ao contrário do modo em segundo plano da skill; requer intenção explícita do CHEFE e cuidado para não disputar foco.

**Administrador, só quando precisar (CHEFE):** a Casa mostrou um terminal “Administrador” aberto e `whoami /groups` com integridade alta, mas o clique seguro do Cockpit **não exigiu** elevação. A permissão do CHEFE para usar administrador vale para a ação concreta, após identificar alvo, necessidade, efeito e contraprova; não trocar aplicativos, conceder acesso amplo ou instalar componentes por suposição visual. `ADMIN_ACCESS_IS_NOT_TARGET_PROOF=true`.

**Limite medido:** eventos de rolagem física para baixo e para cima foram enviados, mas não houve deslocamento mensurável do texto da gaveta; `SCROLL_EFFECT=UNKNOWN`, nunca PASS por mero envio. Um comando “Voltar” da interface pode trocar a página/aba: confirmar alvo exato antes de fechar painéis. Quando o hit-test do cursor não identifica o botão esperado, **não clicar**. Não clicar em `Sincronizar Tudo`, VPS, permissões ou ações destrutivas como teste de mouse; `ACTION_DISPATCHED != EFFECT_OBSERVED`.

**Continuidade:** `INTENÇÃO → JANELA/SESSÃO → SNAPSHOT ATUAL → AÇÃO MÍNIMA → READBACK → RECEIPT → MESMO OWNER OU NOOP`. Ensinar ao Hermes pela Skill-Mãe/owners citados; **publicado no Git != carregado na Casa/Hermes**. Se houver aprendizado novo comprovado, acrescentar **somente o delta útil** nesta Skill-Mãe e conservar a receita detalhada no owner `computer-use`, sem recomeçar a descoberta.

**Achado do Cockpit (2026-10-29, CENTRALDARK_COCKPIT_DISPATCH_CONTRAPROVA_20261029):** a opção visual `Main Only (rápido) / Full (Casa/VPS/Main)` não era transmitida à função `solicitarPromocaoSegura`; o workflow `.github/workflows/autonomia-promocao.yml` expõe `workflow_dispatch` sem entrada de modo. Logo, `SELECTED_MODE != EXECUTION_MODE`. A imagem mostrou `DISPATCH_TOKEN_NOT_CONFIGURED`, que vem de `apps/instinto-superior/src/lib/admin.functions.ts`: além do papel `admin` no Supabase, a solicitação requer `CENTRALDARK_GITHUB_DISPATCH_TOKEN` **no servidor**. Administrador do Windows não substitui esse segredo, não autoriza burlar a sessão e não prova despacho. **Correção de clareza no owner do componente:** PR #1968, removendo modo fictício e traduzindo o bloqueio sem trocar promotor ou gates.

**Estado do sync independente:** o botão `Main` faz `git fetch` + comparação de commits, **sem atualizar os arquivos da Casa**; no rastro medido havia `ahead 2 / behind 16` e o VHDX WSL ainda rastreado por commit local. Não disparar `Sincronizar Tudo` nem `push` até reconciliar o histórico sem publicar a imagem de disco. `DISPATCHED != MERGED != CASA_SYNCED != HERMES_LOADED`.

**CENTRALDARK_COCKPIT_AUTH_REUSE_UI_READBACK_20261029 — Sala de Controle como superfície preferida, sem duplicar executor:** quando o CHEFE autorizar operar o Cockpit, localizar a janela viva correta, clicar primeiro no **controle de menor efeito** (ex.: `Medir agora`), conferir que mudou o texto/hora e então seguir ao `source` do mesmo controle somente se houver falha. Registro observado em `SEGREDO`: UIAutomation acessou Edge → botão `Medir agora` (um único alvo habilitado) → `Invoke()` despachado → rótulo atualizado para `agora mesmo`; isto prova **a ação e a reação do botão**, não prova todos os serviços verdes. Se a ferramenta nativa `computer_use` do Hermes/Codex não estiver exposta ao chat, não atribuir esse clique a ela. Recapturar janela/alvo antes de outro clique. Não clicar em `Sincronizar Tudo` ou deploy para testar navegação.

**Rastro de autenticação já existente (Casa, sem expor valores):** `K:\\.env` e `K:\\.env.local` têm entradas `GITHUB_TOKEN` e `GH_TOKEN` preenchidas, **ignoradas pelo Git**. `apps/instinto-superior/vite.config.ts` já faz `loadEnv` de `GITHUB_TOKEN` da raiz K: para o processo servidor. O botão de promoção em `src/lib/admin.functions.ts` exigia apenas `CENTRALDARK_GITHUB_DISPATCH_TOKEN` e retornou `DISPATCH_TOKEN_NOT_CONFIGURED`. O caminho correto é reutilizar o token de servidor com o **mesmo middleware e `user_roles.admin` do Supabase**, não buscar/cadastrar senha alternativa, nem enviar segredo à UI. PR #1968 adicionou fallback servidor `CENTRALDARK_GITHUB_DISPATCH_TOKEN → GITHUB_TOKEN → GH_TOKEN`; `admin` Windows ≠ papel `admin` Supabase ≠ permissão GitHub Actions. Teste GET local autenticado ao recurso de workflow `autonomia-promocao.yml` retornou **HTTP 200**, sem imprimir token: **READ=PASS, DISPATCH_WRITE=UNKNOWN**. Não invocar POST como mera sonda.

**Outros owners no mesmo compasso:** `src/lib/cockpit.functions.ts` já consome `GITHUB_TOKEN` para consultas; `src/components/central/AdminCofreSeguranca.tsx` usa o Vault Supabase para metadados e inclusão de credencial, mas **salvar no cofre não injeta por si só token no processo**; `src/integrations/supabase/auth-middleware.ts` requer `SUPABASE_URL`, chave pública e autorização válida, que não são substituídos por PAT GitHub. Investigar cada aviso na sua fonte antes de reutilizar identidade: `SECRET_PRESENT != ROLE_AUTHORIZED != WORKFLOW_DISPATCHED`. Privilégio administrativo dado pelo CHEFE não permite copiar ou publicar segredos; nunca enviar valores para Git, chat, logs ou receipts.

**Receita curta de melhoria:** `PAINEL_VIVO → CLIQUE_SEGURO → EFEITO_LIDO → FUNÇÃO_SOURCE → ENV/ROLE/OWNER EXISTENTE → MENOR_FIX → TESTE_DO_MESMO_CONTRATO → RECIBO/PR → READBACK`. Mensagem humana clara primeiro; código de erro literal entre parênteses. Se a main e a Casa divergem, **não editar K: para forçar sincronização** nem declarar que PR/commit já está carregado no Hermes.

**CENTRALDARK_OMNI_ROUTER_CASA_RECOVERY_20261029 — API local voltou, não criar outro roteador:** ao ver API CentralDark/Roteador/Sinal/Grafo/Confirmações amarelos, testar primeiro `127.0.0.1:8099`, **não** a porta `8080` (Vite), `9101` (Casa Commander) nem `3030` (Screenpipe). Owner existente: `apps/modulos/elite-gateway/scripts/centraldark_omni_router.py`; launcher canônico `scripts/launch_omni_router_direct.py`; Python isolado `apps/modulos/elite-gateway/.venv/Scripts/python.exe`. Contraprova Casa SEGREDO em 29/10/2026: porta `8099` sem listener e sete sondas falharam; launcher original iniciado **somente em 127.0.0.1:8099**, processo `python.exe` PID `42112`, após checar que não havia outro listener. `GET /health`, `/api/omni/status`, `/api/omni/models`, `/api/live-fabric/status`, `/api/live-fabric/graph`, `/api/microdeploy/receipts/index.json`, `/heartbeat` retornaram **HTTP 200**, o heartbeat declarou `self=alive`. Retorno da UI após `Medir agora`: API, roteador e sinal **Funcionando**, grafo **Conexão disponível / Uso recente ainda não verificado**, confirmações **Em andamento**.

**Escopo exato:** grafo e recibos retornaram `proof_state=NOT_REVALIDATED`; `HTTP200 != EXECUCAO_COMPROVADA`. A tarefa Windows `CentralDark-Casa-Cockpit-Hermes-One` foi encontrada, mas **não foi comprovado autostart do Omni Router** após reboot. O processo atualmente ligado por sessão local não comprova persistência futura. Não criar gateway novo, redirecionar o Cockpit para Commander 9101, alterar porta padrão nem acionar VPS só para obter verde. Reusar `docs/ARQUITETURA/CENTRALDARK-LIVE-EXECUTION-FABRIC.md` e o receipt `docs/CONSCIENCIA/RECEIPTS/2026-10-28-popup-close-universal-e-sensores-casa.md`.

**CENTRALDARK_CASA_WINDOWS_LOGIN_TASK_20261029 — executor nativo da inicialização, TRACE-FIRST:** na Casa `SEGREDO`, porta `8080` pertence a `node.exe` / `K:\apps\instinto-superior\node_modules\vite\bin\vite.js` (PID `15564`, criação 19:55:35). O Agendador Windows já tinha a tarefa **`CentralDark-Casa-Cockpit-Hermes-One`**: gatilho `AtLogOn` do usuário `Administrador` (não é gatilho de abertura do Hermes), último resultado `0` às 19:55:37, ações sequenciais originais `scripts/casa/instinto-cockpit-autostart.ps1` (Vite 8080), `scripts/casa/Hermes-One-Local.ps1 -Action start` (Hermes web 9119) e `scripts/casa/CENTRALDARK-CORPO-UNICO-HUD-LOGS.bat` (sensores sem duplicar HUD). Launcher 8080 é idempotente e responde `GET /sala-controle HTTP 200`. Seus logs originais: `F:\temp\centraldark-cockpit-8080-{stdout,stderr}.log`. A tarefa é **AtLogOn**, `RestartCount=0`, sem watchdog: `LOGIN_AUTOSTART != RESTART_AFTER_CRASH`. Sucesso do agendador não substitui health dos filhos.

**Delta aplicado na MESMA tarefa (Casa, 29/10/2026):** foi exportada a configuração anterior para `F:\temp\CentralDark-Casa-Cockpit-Hermes-One-before-omni-20261029-231443.xml`. Mantidas as três ações e o trigger originais; adicionada **quarta ação** PowerShell que confere listener 8099 e, apenas se não houver, chama `K:\apps\modulos\elite-gateway\.venv\Scripts\python.exe -u K:\scripts\launch_omni_router_direct.py`, com trabalho em `K:\`, janela oculta e logs em `F:\temp\centraldark-omni-8099-{stdout,stderr}.log`. Contraprova prévia com porta 8099 ocupada: `OMNI_PORT_ALREADY_LISTENING`, exit `0`; `Set-ScheduledTask` confirmou **4 ações**, preservou as três anteriores e o único trigger `AtLogOn`. **Ainda não houve reboot/login novo nem simulação de falha real da 8099**; persistência após esse evento = `UNKNOWN`. Não criar outro scheduler ou iniciar segundo router.

**Hermes medido:** `Hermes-One-Local.ps1 -Action status` inicialmente mostrou `9119 OFFLINE` e logs do Hermes Desktop pararam por volta de 19:50. Reuso explícito de `-Action start` retornou `LAUNCHED_REQUEST_PID=41828`; após o lançamento, `GET http://127.0.0.1:9119/` retornou HTTP `200` com listener `python.exe`, e `.local-web/web-stdout.log` trouxe `HERMES_DASHBOARD_READY port=9119`. `HERMES_WEB_200` não prova o gateway, o consumo da Skill-Mãe, a VPS nem invocação LLM. Estado final medido `8080=HTTP200`, `8099=HTTP200`, `9119=HTTP200`. `NEXT_CURSOR=RELOGIN_TASK_READBACK + CRASH_RECOVERY_SEPARATE_GATE + HERMES_RUNTIME_SKILL_HASH`.

**CENTRALDARK_HERMES_TERMINAL_TAB_TRACE_20261029 — aba inesperada do Terminal (somente leitura):** foto do CHEFE mostra aba Windows Terminal com tooltip `Default: C:\\Users\\Administrador\\AppData\\Local\\hermes\\bin\\hermes.exe`. Leitura real Casa: `WindowsTerminal.exe` PID `12344` iniciado em **2026-10-29 19:55:37**; a tarefa já existente `CentralDark-Casa-Cockpit-Hermes-One` executou nesse exato segundo, e sua **segunda ação** é `Hermes-One-Local.ps1 -Action start`, que chama `hermes.exe dashboard`. Terminal padrão configurado é **PowerShell**, não um perfil Hermes; nenhuma entrada Hermes/Terminal detectada no Run/Startup e nas tarefas pesquisadas. Assim, a segunda ação é o **causador mais provável**, mas `CREATOR_PID_PROOF=UNKNOWN`: o Terminal aparece com pai `svchost.exe` por ativação do app, TaskScheduler/Operational estava desabilitado e evento de criação Security 4688 indisponível. O único `hermes.exe` vivo na leitura é o PID `41828` iniciado manualmente às **23:15:17** para recuperar a porta 9119, **não prova o processo da aba antiga**. `TAB_OPEN != HERMES_GATEWAY_RUNNING`; não matar janela, não mudar startup nem abrir outro Terminal por inferência. Próximo cursor: instrumentar execução do launcher existente com recibo PID/timestamp não secreto, se surgir necessidade real de eliminar a aba.

**CENTRALDARK_HERMES_ONE_DUAL_INTERFACE_PROOF_20261029 — Hermes One Desktop real, duas interfaces; não simplificar por suposição (29/10/2026):** quatro frentes em `SEGREDO`. **Portas:** `127.0.0.1:56063` escuta no Python PID `44472`, filho de `pythonw` PID `43096` → PID `43148` → **`hermes-agent.exe` PID `40212`**, aplicativo Electron instalado em `C:\Users\Administrador\AppData\Local\Programs\hermes-desktop\hermes-agent.exe`, janela real **Hermes One**, iniciado às 23:21:32; porta 56063 começou às 23:22:04. **Outra entrada:** `127.0.0.1:9119` PID `16452` filho de `hermes.exe` PID `41828`, lançado separadamente via `scripts/casa/Hermes-One-Local.ps1` às 23:15. **História:** `K:\k\hermes-desktop-src\package.json` chama o aplicativo `hermes-desktop` versão `0.7.7`, igual ao ProductVersion do EXE (fathah); `docs/CONSCIENCIA/RELATORIO-HERMES-ONE-LOCAL-E-COCKPIT-20261025.md` diferencia o renderer Electron `window.hermesAPI` do iframe web em `apps/instinto-superior/src/components/central/HermesOneWebLocal.tsx` que aponta só para 9119.

**Contraprova de identidade web:** `GET /` de ambas devolve título `Hermes Agent - Dashboard` e os **mesmos caminhos de assets**; GET `/assets/index-z7kl430D.js` foi **SHA-256 idêntico** nas duas portas (`0f40bccef6d330414e1c12e7e3cedcf6e9c67e44ac957d0dc2fbe36a2b7701fd`). `GET /api/status` retornou JSON de hash idêntico (`7dff19b1f8354157abedba33b3955d788cdbcf06bff2da321014854aa1791989`), `version=0.22.5`, `gateway_running=true`, `gateway_state=degraded`; `/api/health` também idêntico, `ok=true`. O gateway `8644` estava em PID `43748`, filho do Python da porta 56063. **Veredito:** duas instâncias HTTP do mesmo dashboard e um aplicativo desktop Electron distinto, **não dois agentes independentes**. Compartilhar status não prova identidade de sessão, autorizações ou todas as funções. **Não** renomear Hermes One, parar portas ou remover autostart sem pedido e prova de impacto; investigar `gateway_state=degraded` separadamente. Chromium está embutido no Electron; não exigir processo `chromium.exe` separado. A árvore do aplicativo mostra pai `explorer.exe`, sem provar qual clique iniciou a janela.

<!-- CENTRALDARK_CASA_UI_CONTEXTUAL_RECIPE_20261030 -->
### 🪟 Receita catalogada — Casa UI Contextual / janela aberta → ação autorizada (CHEFE, 30/10/2026)

**Classificação do catálogo:** `RECEITA / AUTOMAÇÃO ASSISTIDA / CASA-WINDOWS / UI CONTEXTUAL SOB DEMANDA / CUA` · `RISK=BOUNDED` · `RECEIPT=REQUIRED` · `OWNER=.agents/skills/centraldark-operational-method/SKILL.md` · `EXECUTOR=computer-use EXISTENTE` · `TRAVESSIA=ai-andarilho EXISTENTE`. **Não** criar skill, agente, watcher, gatilho persistente, daemon, HUD, serviço, scheduler ou coleta de tela contínua. Catálogo visual é projeção dos owners já presentes no `apps/instinto-superior/docs/INSTINTO-MANIFESTO-INCREMENTAL.md`, não um novo sistema de execução.

**Gatilhos linguísticos ilustrativos:** "olha a interface aberta do WSL", "fecha essa janela", "abre o painel do Hermes One", "clica em Mais tarde", "volta ao que estávamos vendo". Resolver **deíxis e continuidade da intenção** com a conversa atual + janela/snapshot **obtido após o pedido**; o simples fato de um aplicativo estar aberto não autoriza observação permanente nem clique. Revalidar quando houve troca de foco, múltiplas janelas homônimas ou mudança de sessão. O modelo **não** possui telepatia de intenção: `CONTEXT_INFERRED != TARGET_CONFIRMED != ACTION_AUTHORIZED`.

**Contrato de resolução contextual (sem novo executor):**
1. `INTENT_ID / UTTERANCE / ACTIVE_TOPIC`: última intenção humana vigente, alvo mencionado ("essa", "a do WSL"), sentido do verbo, ambiente autorizado. Preferir resolução sem perguntar quando título, PID, UIA e contexto convergem; havendo dois alvos plausíveis ou risco elevado, pedir confirmação do alvo/efeito.
2. `LIVE_WINDOWS`: `computer_use(action="list_windows")` → `capture(mode="som", app=...)` no Hermes, se disponível. Fallback autorizado e identificado: Windows `Get-Process` com `MainWindowHandle` + `System.Windows.Automation.AutomationElement`/UIAutomation (`Name`, `ControlType`, `BoundingRectangle`, `ProcessId`); confirmar **janela + documento/diálogo/controle exato**, sem usar só coordenadas ou título textual. Acessibilidade pode expor controles ocultos/fora da tela: correlacionar retângulo, visibilidade, UI atual.
3. `ACTION_CANDIDATE`: escolher **menor operação nativa e reversível** permitida pelo pedido, `InvokePattern`/seleção de elemento identificado e fresco; não reusar índice de captura anterior, não clicar por aproximação se o alvo estiver ambíguo. Preferir leitura sem alteração enquanto a intenção for investigativa. Fallback físico de mouse muda cursor/foco e requer superfície correta e autorização.
4. `RISK_GATE`: `OBSERVE` leitura; `LOW` abrir painel/aba ou fechar **somente** janela comum explicitamente indicada, após conferir dados não salvos; `ELEVATED` encerrar processo, finalizar tarefa, alterar conexão, permissões, credenciais ou configurações persistentes; `HIGH` "Desligar o WSL agora", reinicializar SO, encerrar sessões, instalar, apagar, enviar mensagem, publicar ou fazer alterações amplas. ELEVATED/HIGH requer intenção explícita sobre **aquele efeito** e confirmação quando houver impacto, nunca inferir de "fecha essa janela". Não exibir valores de chaves/tokens nem capturar conversa fora do escopo.
5. `READBACK / COUNTERPROOF`: nova captura/UIA depois da ação + estado independente quando material (por exemplo, `wsl --list --verbose` somente se autorizado; janela de configuração fechada ≠ WSL desligado; botão clicado ≠ parâmetro aplicado); recibo com `APP_TITLE, PID_IF_CURRENT, CONTROL, ACTION, BEFORE, AFTER, OWNER, EVIDENCE_TIME, COMPLIANCE, NEXT_CURSOR`. Não gerar "PASS" sem efeito observado.
6. `CATALOG_REUSE`: preservar `RECIPE_ID=CASA_UI_CONTEXTUAL` como **identificador documental**, não um ID de job nem serviço agendado. Para WSL, Hermes, Claude, VS Code, Edge, Configurações Windows, usar a **mesma receita** parametrizada por `APP/SURFACE/CONTROL`, sem N scripts por aplicativo.

**Caso de referência realmente observado (30/10/2026):** janela `Configurações do Subsistema do Windows para Linux`, PID Windows **16072** na medição, UIA mostrou `Desenvolvedor` → `Habilitar console de depuração`; diálogo `É necessário desligar o WSL` com texto `Habilitar console de depuração: Desligado` e botões `Desligar o WSL agora`, `Mais tarde`, `Fechar`. `UI_IDENTIFIED=PASS`, `PENDING_RESTART_IDENTIFIED=PASS`, `BUTTON_INVOKED=NO`, `CHANGE_APPLIED=UNKNOWN`. O WSL pode mostrar debug consoles quando `debugConsole=true`; desativar a opção precisa aplicar alterações, mas **não** prova solução para o SSH nem para os consoles Python do Hermes. PID é efêmero e **não é** identificador para reutilizar depois. Outro caso: `Hermes One` Electron, UI `Configurações → Conexão`, `Detect remote install` clicado e erro `banner exchange: Connection to UNKNOWN port -1: Connection refused` exibido; `CLICK=PASS`, `SSH_CONNECTED=FAIL`. A lógica de reconhecer janelas pelo assunto **não** foi homologada como automação universal.

**Matriz de conformidade obrigatória:** `PASS` = identidade, autorização, efeito e readback confirmados no escopo; `PARTIAL` = subconjunto confirmado, com pendência declarada; `UNKNOWN` = falta de evidência/atribuição; `BLOCKED` = autorização, acesso ou segurança impedem avançar; `FAIL` = efeito esperado não ocorreu com contraprova. `TARGET_COMPLIANCE=100% DE AÇÕES AUDITADAS` é **objetivo**, não percentual medido; sem universo de testes, `NUMERIC_COMPLIANCE=UNMEASURED`. Homologar cada variante por replay controlado, sem sobreposição de writers, inclusive caso negativo de duas janelas semelhantes. `DOC_COMMITTED != MAIN_MERGED != HERMES_SKILL_LOADED != CONTEXT_ROUTING_DEPLOYED`.

**NEXT_CURSOR:** incluir a receita documental na gaveta existente sem alterar runtime; mapear capacidade real do `computer_use` na sessão executora; testar por pedido humano "mostre a janela aberta do WSL", depois um clique de baixo impacto autorizado, readback e teste ambíguo; nenhum observador permanente por padrão.
<!-- /CENTRALDARK_CASA_UI_CONTEXTUAL_RECIPE_20261030 -->


<!-- CENTRALDARK_OPENKYLIN_CLAUDE_SSH_PROXY_TRACE_20261030 -->
### 🔗 SSH openKylin no WSL2 — preservar rota comprovada do Claude (30/10/2026)

**Intenção vigente:** CHEFE pediu SSH pelo **22** sem abrir 2222, reutilizando o sistema Windows e o openKylin no WSL2. **Fonte primária:** `C:\Users\Administrador\.claude\projects\E--VMs-CentralDark-Installer\88b5c878-405d-47e0-a708-9da1b23da730.jsonl`, tool_use/tool_result originais de 30/10/2026 **03:31–03:32 UTC**; o recibo positivo está no Bash `toolu_01Cyop2ZHceEuE9XgM1WKPww`, timestamp `2026-10-30T03:32:20.139Z`. Primeiro houve duas falhas por interpretação de caminho entre Git Bash/WSL; a correção no `config_openkylin` usou `ProxyCommand wsl.exe -d openKylin -u root --exec //usr/sbin/sshd -i`; o teste real do Claude executou `ssh.exe -F $cfg -o BatchMode=yes -o ConnectTimeout=40 openkylin 'echo OK_ALIAS; id -un; uname -r'` e retornou `OK_ALIAS / openkylin / 6.6.114.1-microsoft-standard-WSL2 / RESULTADO=PASS`. **Isto comprova SSH + execução remota na sessão medida, não prova Hermes remoto, nem GUI/RDP.**

**Owner/entrada já existentes:** `%USERPROFILE%\.ssh\config_openkylin` (arquivo SSH separado) + `%USERPROFILE%\.ssh\openkylin-ssh.cmd` (atalho que usa aquele arquivo) + chave já autorizada `id_ed25519_openkylin`; nunca exibir a chave privada nem copiar credenciais. Arquivo principal `%USERPROFILE%\.ssh\config` é **protegido, somente leitura, com aviso NÃO TOCAR**; o Claude preservou-o. `ssh openkylin` sem `-F` **não foi comprovado**, apesar da abreviação no texto final do Claude. No Windows, porta 22 continua ocupada por `sshd.exe` do Windows; no openKylin há `sshd` interno na porta 22; 2222 não foi criada. WSL `Stopped` após o uso é compatível com acionamento sob demanda pelo ProxyCommand e não invalida o PASS histórico.

**Contraprova atual:** tentativa anterior do Hermes One `Connect via SSH` usando IP WSL `172.29.96.181`, usuário e chave retornou `banner exchange: Connection to UNKNOWN port -1: Connection refused`; o formulário do Hermes One **não foi provado** capaz de consumir `config_openkylin` ou executar o `.cmd` automaticamente. `CLAUDE_SSH_PROXY_PASS != HERMES_ONE_CONNECTED`. Na Casa, `which hermes` no openKylin não encontrou binário no PATH na medição anterior; não afirmar que existe gateway Hermes remoto. **NEXT_CURSOR:** quando o CHEFE pedir "conecta o Hermes One ao openKylin", primeiro recuperar a receita de SSH existente, verificar capacidade nativa de selecionar arquivo SSH/host e presença de Hermes remoto; evitar nova porta, nova instância Hermes ou alteração do config protegido sem autorização explícita e prova de necessidade.
<!-- /CENTRALDARK_OPENKYLIN_CLAUDE_SSH_PROXY_TRACE_20261030 -->

<!-- /CENTRALDARK_CUA_CODEX_HERMES_20261029 -->


<!-- CENTRALDARK_SKILL_MAE_CORPUS_INTEGRAL_20261030 -->
## Mapa integral em leitura progressiva, sem perda

**REGRA:** a Skill Mãe foi indexada por completo, nao reduzida por exclusao. Carregar primeiro este arquivo; consultar somente a referencia que corresponde a intencao e ao owner. A ausencia de uma secao no arquivo principal nao revoga seus contratos. Nunca atribuir PASS a historico.

- [Nucleo operacional: identidade, Git, execucao, receitas, probes](references/CORPUS-01-NUCLEO-OPERACIONAL-20261030.md) (linhas originais 150-1369).
- [Licoes e historico legado, incluindo repeticoes preservadas](references/CORPUS-02-LICOES-LEGADO-20261030.md) (1370-2751).
- [Contratos, gates, aprendizados e protecoes](references/CORPUS-03-CONTRATOS-E-GATES-20261030.md) (2752-3440).
- [Rotas recentes, Cockpit, Sentinel e Genesis](references/CORPUS-04-ROTAS-RECENTES-20261030.md) (3441-3945).
- [Indice com TODOS os titulos e numeros originais](references/INDICE-INTEGRAL-SKILL-MAE-20261030.md).

**Comando direto do CHEFE:** COPIAR/colar/recortar/editar/criar somente sob ordem, no alvo conhecido, com uma verificacao de efeito. Copiar nao apaga; recortar exige preservar destino antes de retirar a origem; editar nao substitui rascunhos alheios; criar texto nao o executa. No Notepad ja aberto usar UIA ValuePattern, salvar com Ctrl+S e verificar o documento. Nenhuma automacao continua so porque esta documentada.

**FIXED_POINT:** apenas reorganizacao do texto e provas de integridade; execucao operacional, deployment e adocao por outros agentes permanecem UNKNOWN sem recibo. Alteracao local dirty, sem commit/push.
<!-- /CENTRALDARK_SKILL_MAE_CORPUS_INTEGRAL_20261030 -->

<!-- CENTRALDARK_SYNC_CONVERGENCE_METHOD_20261031 -->
## 🍒+1 Sincronização contínua por convergência — Casa/Main e VPS sob escopo

Esta é a receita geral para qualquer alteração autorizada no CentralDark.
Ela reutiliza o executor existente do Cockpit, `executarSync`, e a função
`syncCasaMain` em `apps/instinto-superior/src/lib/sync.functions.ts`. Não cria
worker, watcher, gateway, fila, branch, cache ou painel paralelo.

**Regra central:** leituras podem ocorrer em paralelo; mutações Git têm um único
writer. "Paralelo" significa que Casa, Main e, quando autorizado, VPS são
comparados no mesmo ciclo. Não significa executar dois writes concorrentes no
mesmo checkout.

```text
INTENÇÃO
→ IDENTIFICAR OWNER E ESCOPO (CASA/MAIN; VPS SOMENTE SE PEDIDA)
→ FETCH origin/main
→ LER HEAD, origin/main, dirty e divergência
→ SE BEHIND E NÃO DIVERGENTE: merge --ff-only
→ SE AHEAD OU DIRTY: commit da alteração autorizada
→ PUSH origin/main
→ FETCH NOVAMENTE
→ READBACK HEAD == origin/main
→ SE VPS NO ESCOPO: atualizar por fast-forward e ler SHA remoto
→ RECEIPT + NEXT_CURSOR
```

**Condições de convergência:** o estado só é `PASS` quando `HEAD` local e
`origin/main` retornam o mesmo SHA após o push. `git fetch` sozinho é leitura.
`git push` sem readback não é prova final. Se `HEAD..origin/main` e
`origin/main..HEAD` forem ambos maiores que zero, há divergência: marcar
`CONFLICT`, preservar os dois lados e não fazer merge automático.

**Escopo do botão:** `Sincronizar Tudo` do Cockpit estabiliza Casa/Main no
mesmo SHA. A VPS continua manual por padrão. O modo `target=all` inclui a VPS
somente quando a intenção pedir Casa/Main/VPS. Não usar o nome do botão para
inferir deploy ou sincronização da VPS.

**Redução de complexidade:** reutilizar `syncCasaMain`, `syncVps`, o launcher,
o owner e o receipt existentes. Não criar uma segunda função para a mesma
convergência. Não repetir testes que não mudam `HEAD`, owner, runtime,
autorização ou resultado. Não usar `reset --hard`, sobrescrita cega ou stash
para esconder conflito. Arquivos dirty de terceiros permanecem preservados e
devem ser separados antes de qualquer commit.

**Receipt mínimo:**

```text
INTENT_ID=
OWNER=
SCOPE=CASA_MAIN|CASA_MAIN_VPS
HEAD_BEFORE=
ORIGIN_BEFORE=
DELTA=
COMMIT=
HEAD_AFTER=
ORIGIN_AFTER=
SAME_SHA=PASS|FAIL|UNKNOWN
VPS_SHA=PASS|NOT_IN_SCOPE|UNKNOWN
WORKTREE=
COUNTERPROOF=
NEXT_CURSOR=
```

`SAME_SHA=PASS` não prova deploy, runtime saudável, ferramenta MCP, Gateway,
Hermes ou comportamento do Cockpit. Cada camada precisa de sua própria prova.
`MERGED != DEPLOYED`, `REGISTERED != CONSUMED` e `UNKNOWN != PASS` continuam
obrigatórios.
<!-- /CENTRALDARK_SYNC_CONVERGENCE_METHOD_20261031 -->

<!-- AUTOCATALOGO:INICIO -->
## Melhorias comprovadas e incorporadas sem regressao

Registros aditivos comprovados no Windows Casa pelo script verificador. Nao substituem receitas anteriores. Cada registro preserva sua origem, razoes e contraprova.

### t_26e02a16 — excluir
- Criado em: 2026-10-24T19:46:48-03:00; destino: C:\root\HERMES-KANBAN-TESTE.txt
- Por que fazer: Eliminar somente o TXT temporario criado no teste anterior autorizado.
- Por que nao fazer outra coisa: Nao apagar a pasta nem recorrer a exclusao direta; somente o Hermes Kanban deveria executar a intencao.
- Por que usar: Reutilizar o Hermes da Casa, perfil default e mesmo comando kanban create ja comprovados.
- Por que modificar: Trocar a intencao de criar para excluir sem modificar o metodo de delegacao.
- O que mudou: O arquivo do teste deixou de existir apos a segunda missao Hermes; o metodo de delegacao permaneceu intacto.
- Contraprova: Kanban DONE isolado nao prova exclusao; Test-Path do alvo retornou falso no Windows Casa.
- Resultado: PROVADO na operacao/alvo avaliados. Recibo: catalogo/comprovacoes/t_26e02a16.json
<!-- AUTOCATALOGO:FIM -->


## Bancada numerada 1 a 4 — linguagem natural
Para pedidos sobre monitor/tela um, dois, tres, quatro, posicao, arquivo ou chat aberto em uma tela e delegacao entre telas, carregar a secao Bancada por linguagem natural e borda de alvo em [UI-MULTIJANELA-ROTAS-CACHE-20261030.md](references/UI-MULTIJANELA-ROTAS-CACHE-20261030.md). Executar [Identify-CentralDarkMonitors.ps1](scripts/Identify-CentralDarkMonitors.ps1) -Target 'monitor dois' -ListWindows; -Overlay -Seconds 5 apenas quando desejar previa visual. Binding confirmado da Casa: 1 direita, 2 superior, 3 esquerda, 4 inferior; DISPLAY nao e numero das Configuracoes. Revalidar arranjo alterado. Coordenar chats pela fila e Goal existentes; cursor/teclado fisicos serializados. Borda de previa nao certifica automacao nem resultado.


## Hermes Visual Computer Use — WGC real
**Comando operacional falado = monitor + acao, sem frase fixa.** "Posicione no monitor 2", "bota o cursor na tela dois", "leva o mouse virtual pro monitor de cima", "aponte pro monitor dois" e "mostra o mouse na tela 2" = selecionar monitor humano 2, posicionar cursor virtual Cua e exibir overlay Hermes simultaneamente. Usar a Skill visual existente: hermes-visual-computer-use/scripts/blink_cursor.py --monitor 2 --mode position (previa 5 segundos). "Pisca monitor 2" = --mode blink (3 ciclos). Interpretar numero 1-4, numero por extenso ou posicao confirmada: 1 direita, 2 superior, 3 esquerda, 4 inferior; revalidar apenas se geometria mudar. Mouse fisico so sob pedido explicito; captura apenas com autorizacao. Pergunta, negacao ou relato nao equivale a ordem. Receita comprovada 02/11/2026: daemon Cua ja aberto; start_session, set_agent_cursor_enabled, move_cursor(scope=window), end_session; o CHEFE confirmou visualmente o cursor virtual no monitor 2. A moldura usa o plugin visual.py existente. Nao criar parser, skill, segundo cursor ou processo paralelo. PROMPT_SELF_CACHE_P15=APLICAVEL; KV_CACHE_P16=UNKNOWN; NEXT_CURSOR=REUSE_EXISTING_SKILL_WITH_MONITOR_ACTION.

Para identificar monitores dinamicamente, capturar um monitor com borda nativa e moldura esmeralda de atividade, carregar [hermes-visual-computer-use](../hermes-visual-computer-use/SKILL.md). Instala plugin oficial com seis ferramentas computer_*; preserva o computer_use/Cua e seu cursor. Usar esta skill para captura WGC por monitor; o Identify-CentralDarkMonitors.ps1 anterior permanece receita de inventario/previa historica, sem alegar WGC. Nao iniciar duas molduras para o mesmo alvo. Descoberta e testes ficam em references/validation.json e references/hermes-validation.json da nova skill.
