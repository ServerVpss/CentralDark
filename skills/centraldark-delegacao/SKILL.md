---
name: centraldark-delegacao
description: Delegar tarefas do Builder com escritor único e prova.
version: 1.1.0
owner: .agents/skills/centraldark-operational-method/SKILL.md
catalog_owner: .agents/skills/skill-workshop/SKILL.md
execution_owner: .agents/skills/autonomous-ai-agents/hermes-agent/SKILL.md
tags: [centraldark, hermes, claude, codex, builder, delegacao, kanban, mcp, chatgpt]
---

# CENTRALDARK — Delegação transversal e verificável

## Acionamento
Use quando o CHEFE pedir **delegue ao Hermes**, quando um chat conectado precisar entregar execução local a um agente autorizado, ou quando houver uma missão já em andamento no Kanban. Não acione para conversa, resposta informativa ou trabalho sem intenção de delegação.

## Identidade e autoridade
A skill é uma receita portátil, **não** um novo executor, agente, scheduler, fila, servidor, autoridade ou credencial. O chat raciocina e encaminha; Hermes Kanban existente despacha; owner/escritor autorizado executa; realidade e receipts julgam. Uma conexão MCP ou um texto de skill **não** eleva permissões do cliente nem substitui instruções de sistema ou controles de segurança.

## Procedimento determinístico

1. **Preflight**: recuperar intenção/Goal e MAIN_SHA atual; aplicar `LEIA-ME-IA.md`, `RULES.md`, `AGENTS.md` e owner específico. Separar fatos atuais de histórico.
2. **Descoberta**: consultar catálogo autenticado de capacidades e rotas já conectadas, incluindo MCP, Remote Desktop Commander, SSH/Tailscale e GitHub. Escolher rota autorizada, viva e adequada; não usar credenciais inferidas.
3. **Deduplicação**: consultar `hermes kanban boards list`, `hermes kanban list` e `hermes kanban show <id>` no dispositivo autorizado. Procurar `INTENT_ID`, escopo e owner equivalentes. Continuar tarefa existente quando compatível; criar somente se faltar tarefa genuína. Se houver concorrência no mesmo caminho, respeitar writer ativo e não despachar mutação concorrente.
4. **Handoff**: preservar envelope `INTENT_ID | GOAL | OWNER | MAIN_SHA | PR_HEAD | ACTIVE_WRITER | STATUS | RECEIPT | NEXT_CURSOR` com escopo, critérios, limitações e links. Usar API/CLI do Kanban existente, nunca fila paralela; aplicar chave de idempotência estável.
5. **Dispatch**: antes de disparar, medir `hermes kanban dispatch --dry-run --max 1 --json`; confirmar que a tarefa selecionada é a certa e então disparar pela mesma rota. Se a ferramenta não puder despachar, registrar causa real e entregar o comando para o executor autorizado, **sem declarar SPAWNED**.
6. **Readback**: confirmar `TASK_ID`, `ASSIGNEE`, `WORKSPACE`, `READY/RUNNING/BLOCKED` na fonte e obter ACK do worker. `CREATED != DISPATCHED != STARTED != COMPLETED`.
7. **Teste + contraprova**: exigir efeito observado no alvo, checks do mesmo SHA, hash/readback, regressão e receipt vinculado ao owner/PR. `RUNNING != PASS`, `MERGED != DEPLOYED`, `UNKNOWN != PASS`.
8. **Continuidade**: atualizar o mesmo Goal/receita no Skill Workshop quando um novo caminho for comprovado; preservar falha e `NEXT_CURSOR` quando houver bloqueio real. Não criar skill por tentativa.

## Autenticação persistente para biblioteca privada

No Instinto Superior, o login administrativo da pessoa (Supabase) e a conexão de provedor GitHub (OAuth Broker existente) são relações distintas. O MCP remoto ainda tem sua autorização OAuth de cliente própria. **Não transportar o token GitHub para o ChatGPT, para outros agentes, para o SKILL.md ou para o cockpit.**

Quando o CHEFE autenticar o GitHub App/OAuth App existente, o backend deverá validar identidade/consentimento/permissão `Contents: read` ou equivalente para `ServerVpss/CentralDark`; guardar grant cifrado no owner `oauth_connections`, renovar por mecanismo oficial se disponível e retornar somente conteúdo selecionado + SHA via API protegida. Nome do aplicativo, callback, owner, tipo de token e scopes devem ser confrontados no runtime: configuração no Git não prova consentimento.

**Estados separados:** `AUTH_CONNECTED` apenas após GitHub API readback do grant da sessão; `SKILL_DISCOVERED` é um estado diferente de `SKILL_LOADED` e de `HERMES_EXECUTED`. `UNAUTHORIZED` não permite fallback automático para token administrativo global. Não assumir que um login da conta autoriza todos os agentes e usuários.

**Contrato tipado do Hermes:** `.agents/skills/autonomous-ai-agents/hermes-agent/references/centraldark-delegacao-tipado.json`. Os procedimentos `IDENTIFY_INTENT`, `REMEASURE_MAIN`, `FIND_CAPABILITIES`, `RESOLVE_IDENTITY`, `VALIDATE_GITHUB_PERMISSION`, `REFRESH_OR_REAUTHORIZE`, `RESOLVE_SKILL`, `RESOLVE_ROUTE`, `DEDUP_KANBAN`, `DISPATCH_SAFE`, `OBSERVE_AND_COUNTERPROVE` e `RECEIPT_AND_REPLAY` devem ser reutilizados no mesmo owner, sem fabricar 12 skills independentes.


## Builder — terminais Hermes, Claude e Codex

**Quando usar:** missão do CHEFE recebida no Builder/Instinto Superior que exige uma ou mais tarefas nos terminais já existentes. O Builder **coordena e mostra resultado**, não é executor novo, fila nova ou substituto do Kanban Hermes. Esta seção especializa o procedimento acima; não cria outro dispatcher.

1. **Localizar antes de abrir:** resolver sessão do Builder, `INTENT_ID`, `GOAL`, owner do projeto, `MAIN_SHA` e `NEXT_CURSOR`. Procurar tarefa Kanban, terminal, sessão e workspace existentes. Reutilizar a sessão autorizada em vez de abrir terminal ou janela duplicada.
2. **Medir braços reais:** verificar para Hermes, Claude e Codex a identidade da sessão, processo/CLI ou endpoint, disponibilidade, ferramentas, permissão, diretório/branch/worktree e último ACK. Um botão visível, CLI instalado ou aba aberta **não** prova canal operacional; ausente, offline ou sem permissão é `UNAVAILABLE/UNKNOWN` no braço afetado.
3. **Quebrar por escopo material:** produzir tarefas com `TASK_ID`, `INTENT_ID`, `OWNER_PATHS`, dependências e critério de aceitação. Deduplicar pelo Kanban/receipt já existente. Dois terminais nunca recebem mutação simultânea no mesmo caminho, worktree, branch compartilhada ou recurso transacional; leitura e contraprova podem coexistir.
4. **Escolher executor por capacidade, não por rótulo:** Hermes opera as rotas autorizadas e continua o Kanban; Claude ou Codex podem editar, compilar, testar ou revisar conforme ferramentas e escopos efetivamente disponíveis. A distribuição é dinâmica. Cada tarefa recebe **um único `ACTIVE_WRITER`**; outro terminal no mesmo escopo fica `READ_ONLY` até handoff registrado.
5. **Handoff real:** transmitir ao terminal autorizado `INTENT_ID | TASK_ID | GOAL | OWNER_PATHS | MAIN_SHA | PR_HEAD | ACTIVE_WRITER | DEPENDS_ON | ACCEPTANCE | NEXT_CURSOR` e obter `ACK` correlacionado à sessão/rota. Não interpretar texto exibido no chat do Builder como entrega ao CLI. Se o adapter não despachar, preservar a tarefa e registrar `DISPATCH_NOT_PROVEN`.
6. **Executar e observar:** usar o Kanban, comando ou ponte já contratados; distinguir `ASSIGNED → ACKED → RUNNING → COMPLETED → VERIFIED`. Readback do arquivo/commit, código de saída, build e efeito real no alvo são provas diferentes. Nunca confundir compilação com instalação/conexão.
7. **Contraprova independente:** um terminal/revisor sem writer lease naquele escopo confronta o delta com o Goal, tenta reproduzir falha, verifica testes relevantes e regressão nos consumidores; anexar SHA, alvo, resultado e receipt ao mesmo Kanban/PR. O executor não aprova sozinho sua mutação. Se falhar, devolver **somente o cone afetado** ao writer corrente.
8. **Convergência:** o Builder exibe a mesma tarefa e receipt, com estado por terminal e `NEXT_CURSOR`; não mantém outra fila, status fabricado, segundo banco ou logs paralelos. `UNKNOWN != PASS`, `ACKED != COMPLETED`, `COMPLETED != VERIFIED`.

**Casos negativos obrigatórios:** (a) mesma intenção duas vezes ⇒ uma tarefa; (b) Hermes e Claude disputam o mesmo arquivo ⇒ segundo writer bloqueado; (c) Claude e Codex em owners independentes ⇒ execução paralela permitida; (d) terminal offline ou ponte sem ACK ⇒ sem alegação de despacho; (e) build verde, mas botão do cockpit sem efeito ⇒ `EFFECT_NOT_PROVEN`.

**Critério de aceitação:** ao clicar/delegar no Builder, o mesmo `TASK_ID` reaparece no Kanban existente com terminal/escopo corretos, ACK real, único writer, readback da saída e contraprova ligada ao mesmo `INTENT_ID`; ausência de ponte real permanece `BLOCKED`, sem simulação.

## Rotas e limites
A skill deve funcionar em ChatGPT, Claude, Codex, Hermes e outros agentes **somente quando a respectiva superfície possuir ferramentas e autorizações reais**. Chat sem shell pode usar MCP autorizado ou GitHub para handoff, mas não afirma ter executado na Casa. Instalar `SKILL.md` fornece instruções consultivas e não garante que o cliente carregou a skill; isso exige medição separada. Em qualquer superfície, pedidos de instalação dependem das regras desse cliente.

## Casos de aceitação
- **Positivo:** missão única → Kanban localizado → tarefa deduplicada/criada → dispatch → ACK → receipt.
- **Duplicata:** mesmo `INTENT_ID` não cria segundo cartão nem segundo writer.
- **Offline:** uma rota falha; tentar outra rota autorizada, sem inventar conectividade.
- **Negativo:** ferramenta sem autorização ou escopo ambíguo → não escrever/despachar.
- **Contraprova:** spawn com erro, runtime sem efeito ou receipt ausente → resultado não é PASS.

## Referências canônicas
- `.agents/skills/autonomous-ai-agents/hermes-agent/references/background-systems.md`
- `.agents/skills/centraldark-unified-surface-parity/SKILL.md`
- `.agents/skills/skill-workshop/SKILL.md`
- `docs/ARQUITETURA/JARVIS-ORQUESTRACAO-DELTA-E-ESCRITOR-UNICO.md` (§6.0)
- `apps/modulos/mcp/src/tools/skills/skill.js` (catálogo autenticado)
- `apps/modulos/mcp/src/tools/core/mcp-admin.js` (rotas e autorização)

## Receipt de origem
`INTENT_ID=CENTRALDARK-UNIFIED-DELEGATION-CATALOG-20261016`.
A prova de base foi `t_790c940d` na Casa Windows, despacho via Desktop Commander `SEGREDO`, tarefa `RUNNING` em `K:\\`; isso **não** comprova a conclusão daquela missão nem carregamento transversal.

## 🪬 Casa ⇄ VPS por identidade + PID + Kanban — inventário nativo

**Delta do CHEFE (2026-10-21):** reutilizar o catálogo MCP, o PowerShell da Casa, a extensão ZENDRIVE, Tailscale/SSH e o Hermes original para localizar PID/PPID e encaminhar a mesma missão, sem ressuscitar Desktop Commander externo. Não existe "enviar comando para PID remoto" sem uma sessão RPC/SSH/CLI autenticada: PID é um atributo do processo, não um canal de transporte nem autoridade.

**Sensor Casa já existente, ampliado neste mesmo owner** (`scripts/casa/discover-operational-channels.ps1`). Na Casa Windows, após medir o checkout atual e com um terminal já autorizado:
```powershell
pwsh -NoProfile -File .\scripts\casa\discover-operational-channels.ps1 -IncludeRuntime -Json
```
A resposta `centraldark.casa-process-inventory.v1` inclui `origin_host`, `measured_at_utc`, estado de `sshd`, listener 22, serviço Tailscale, SSHs estabelecidos e candidatos PID/PPID Hermes/VS Code. Não inclui linha de comando nem segredos. `HERMES_CANDIDATE` não prova sessão funcional; `Cline` embutido na extensão do VS Code não tem PID próprio inferível automaticamente. Sem leitura no Windows: `CASA_PID=UNKNOWN`, nunca usar PIDs históricos.

**Sensor VPS disponível agora:** `mcp_admin_call(tool=local_compute_status, input={includeProcesses:true})` no MCP existente, ou consulta read-only `ps` sob sessão autorizada. O `runtime_platform` deve ser `linux`. O PID do Hermes VPS é específico desse host e pode mudar ao reiniciar. Não contaminar o placar da Casa com o PID da VPS.

**Rota catalogada:** `mcp_admin_catalog(filter="CASA_NATIVE_PID_INVENTORY")` deve listar `SOURCE_ONLY_CASA_ACK_REQUIRED` *somente após deploy do código MCP*. Isso é descoberta, não ferramenta RPC para invocar Windows. Usar `CASA_NATIVE_PID_INVENTORY` como recipe/source, e a rota autorizada que já existe (CLI Casa/Cline, executor Hermes local ou ponte autenticada própria) como corpo.

**Handoff bidirecional:** fixar `INTENT_ID | HOST_ID | PROCESS_PID | PARENT_PID | EXECUTOR_SESSION_ID | TRANSPORT | AUTH_SCOPE | OWNER | MAIN_SHA | TASK_ID | ACK | NEXT_CURSOR`. A direção `Casa→VPS` usa SSH/Remote-SSH e MCP que já estiverem autenticados; a direção `VPS→Casa` exige autenticação na conta da Casa e prova de execução, não bastando `home.ssh_22=OPEN`. Para tarefa, usar o **mesmo Hermes Kanban**: `hermes kanban boards list`, `hermes kanban list`, deduplicar por idempotência, `dispatch --dry-run --max 1 --json`, enviar somente se o task correto foi selecionado, confirmar `TASK_ID + ACK + runtime readback`. Não misturar a sessão Hermes Gateway da VPS com processos Hermes candidatos da Casa.

**Critério de fechamento:** `CASA_PID_READBACK` + `SSH_AUTHENTICATED_SESSION` ou `AUTHORIZED_CASA_EXECUTOR_ACK` + `KANBAN_TASK_ID` + `WORKER_ACK` + `EFFECT_READBACK` + `RECEIPT`. Na falta de qualquer elo, devolver `UNKNOWN` ou `BLOCKED` naquele elo e preservar o trabalho corrente; nunca fingir delegação via PID. Respeitar escritor único por escopo e autorização por dispositivo.
