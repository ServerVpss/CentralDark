# HANDOFF CANÔNICO — CENTRALDARK-REMOTE / CASA / !MICHELIN

**Atualização observada na Casa:** 2026-10-24 às 21:59:12 -03:00 (America/Bahia).
**Dono do método:** `K:\.agents\skills\centraldark-operational-method\SKILL.md`.
**Propósito:** qualquer agente autorizado que retome esta intenção encontra aqui o último ponto comprovado, os bloqueios e o menor próximo passo. Não abrir outra arquitetura nem competir com worker em andamento.

**CONTINUIDADE OPERACIONAL MAIS RECENTE (24/10, após 22:36):** o handoff ativo compartilhado entre agentes passou a ficar **na mesma pasta canônica do código**: `K:\scripts\remote-bridge\canonical\HANDOFF-DELTA-CONTINUO-CENTRALDARK-REMOTE-20261024.md`. **O registro atual prevalece sobre os snapshots antigos deste documento.** Auditoria Hermes em cartão independente `t_928a8cbd` (escritor exclusivo de `HANDOFF-DELTA-HERMES-TRACES-20261024.md`); cartão de integração `t_5b386368` teve run CRASHED por falta de finalização Kanban e precisa de reconciliação, não de declaração automática de DONE. A consolidação 10/10 links simbólicos e hashes SHA-256 passou. Respeitar ownership do menu/engine que outro agente trabalha. As duas contas usam a mesma intenção, mas o compartilhamento ocorre **por arquivo e Kanban**, não por transmissão automática dos tool calls privados.

## Intenção contínua do CHEFE

Consolidar **CentralDark-Remote** como nome público/owner próprio, preservar motor MCP existente, vincular a Casa Windows SEGREDO ao MCP CentralDark com OAuth2/PKCE e prova real ida-e-volta, sem romper legado nem os dois testes Hermes já aprovados.
Chefe confirmou que orienta também o outro agente em outra conta ChatGPT e **a intenção é a mesma**; compartilhar intenção NÃO significa que as contas compartilhem automaticamente memória, chat, token ou estado. Ler os artefatos vivos no host de destino antes de concluir.

## Último verde preservado — NÃO REGREDIR

- **Hermes Kanban da Casa:** `C:\Users\Administrador\AppData\Local\hermes\bin\hermes.exe`, perfil `default`, provedor `nvidia`, modelo `nvidia/nemotron-3-ultra-550b-a55b` comprovaram criação e exclusão do mesmo TXT em missões distintas.
- **Missão criar:** `t_2805243c`, `DONE`, arquivo criado e conteúdo conferido. **Missão excluir:** `t_26e02a16`, `DONE`, arquivo ausente após readback.
- **Receita universal:** `references/HERMES-KANBAN-RECEITA-UNIVERSAL.md`. Não modificar o comando `hermes kanban create`, os flags que funcionaram ou fixar `C:\root` como workspace padrão.
- **HUD game aprovado:** regra de layout FIXO V1 no `SKILL.md`, um único quadro de moldura dupla, indicadores e três estrelas. Métricas antigas são um snapshot escopado, não PASS de nova integração.
- **Catálogo e autocura:** tarefa agendada `CentralDark-Skill-Catalogo-Autocura` a cada 2 minutos em sessão Casa; última leitura `LastTaskResult=0` às 21:58:49. Documento técnico `references/AUTO-MELHORIA-COM-PROVA.md`. Preservar índices, histórico, SHA e textos em português.

## CentralDark-Remote — estado factual, NÃO confundir com E2E

- **Owner e nomenclatura pública:** `CentralDark-Remote`, não o nome do fornecedor; fonte de política `references/CENTRALDARK-REMOTE-NOMENCLATURA.md`.
- **Cartão original bloqueado:** `t_c7013806` com `workspace_kind=worktree` e caminho **inválido/não absoluto** `K:.worktrees\t_c7013806`; resultado `blocked`. Preservar a falha de preflight no histórico, não relançar esse cartão sem causa.
- **Cartão de continuação correto:** `t_5b386368`, título `CentralDark-Remote: corrigir nome, OAuth/pareamento, owner MCP e E2E`, `status=running` às 21:59, assignee `default`, provider `nvidia`, modelo `nvidia/nemotron-3-ultra-550b-a55b`, `workspace_kind=dir`, workspace **absoluto** `K:\_worktrees\centraldark-remote-name-migration-20261024`. Worker ativo observado; RUNNING não significa DONE.
- **Endpoint local medido:** `http://127.0.0.1:9101/health` respondeu `HTTP 200` com `engine_connected=false`, `remote_vendor=false` às 21:59. Porta 9100 falhou em leitura anterior. Health 200 não prova engine conectada.
- **Código-fonte existente:** `K:\scripts\remote-bridge\CentralDark-Remote-One.go` possui alteração de caminho base para `K:\Remote-Tray` e de logs para `K:\Bridge\logs`; existe cópia de fonte anterior em `K:\Bridge\logs\CentralDark-Remote-One.before-k-path-20261024-212805.go`.
- **One Shot novo:** `K:\Remote-Tray\CentralDark-Casa-OneShot.go` e `K:\Remote-Tray\CentralDark-Casa-OneShot.exe` gerado (2.032.128 bytes) às 21:24; `K:\Bridge\logs\tray-oneshot-build-20261024-212417.log` registra `GO_BUILD_EXIT=0`, `SELF_TEST_EXIT=0`, `INSTALLER_EXECUTED=false`, `TASK_OR_RUNTIME_CHANGED=false`. Isso **prova build/autoteste, não integrações ativas**.
- **Tentativa do instalador** registrada em `K:\Bridge\logs\tray-oneshot-20261024-212721.log`: teste do agente Casa `pass 1 / fail 0`; depois `TASK_NAME_OWNED_BY_DIFFERENT_PROGRAM: CentralDark-Casa-Commander`, `INSTALLER_EXIT_CODE=1`. Não substituir a tarefa Windows silenciosamente.
- **Tarefa Windows `CentralDark-Casa-Commander`** aponta para `C:\Users\Administrador\AppData\Local\CentralDark\Casa-Commander\Launch-Casa-Commander.ps1` e teve resultado anterior diferente de zero (3221225786). Owner precisa ser reconciliado antes de qualquer troca controlada.
- **PR original citado na análise:** `#1945`. Nenhuma evidência de merge/deploy por este handoff. Não presumir disponibilidade do OAuth/PKCE/MCP apenas por configuração ou por processo vivo.

## ALERTA DO TERMINAL DO CHEFE

A captura mostrou saída enorme, ilegível, composta por metadados internos serializados de PowerShell (módulos, providers, tipos/atributos, objetos complexos com barras e `\r\n`). **Causa exata do comando não foi isolada.** Não confundir essa saída com progresso ou relatório da engine. Ao investigar, emitir exclusivamente resultados curtos e redigidos (`estado`, `comando/teste`, `código`, `evidência`, `próximo passo`) e limitar grandes objetos: `Select-Object` de poucos campos, `Format-List`, `-Tail`, saída resumida, nunca serializar toda a sessão/Get-Command/propriedades reflexivas sem filtro. Nunca expor tokens, bearer, cookies ou segredos.

## Passos da próxima mão — seguir na ordem

1. **LEITURA SEM MUTAÇÃO:** ler `SKILL.md`, `references/HERMES-KANBAN-RECEITA-UNIVERSAL.md`, `references/CENTRALDARK-REMOTE-NOMENCLATURA.md`, `references/MICHELIN-3-ESTRELAS-PROTOCOLO.md` e este HANDOFF. Verificar estado novo do Kanban `t_5b386368` com `show`/`runs`, status da engine e owner da tarefa Windows.
2. **UM WRITER POR ALVO:** se o cartão Remote estiver `RUNNING`, não editar seus arquivos, não iniciar outra migração nem modificar seus scripts. Preferir observação/consulta dos logs enquanto a missão atua.
3. **CORRIGIR CAUSA, NÃO APARÊNCIA:** o executor novo só entra em produção após esclarecer a tarefa `CentralDark-Casa-Commander`, a configuração OAuth2/PKCE e a engine. O nome do produto é CentralDark-Remote; aliases externos só para compatibilidade, nunca como owner público.
4. **PROVAR E2E:** medir `CONNECTED`, auth sem segredos, `tools/list` MCP e UMA chamada autorizada de somente leitura com readback Casa→MCP CentralDark→Casa. Validar erro esperado sem autenticação e ausência de mutações. Provas devem vir de ferramentas realmente executadas, não da descrição do cartão.
5. **ZERO REGRESSÃO:** comparar provas anteriores; preservar CLI Hermes e HUD game. Se nova capacidade for provada, registrar por que fazer, por que não outra coisa, por que usar, por que modificar, delta, logs, contraprova, horário e resultado escopado. Atualizar catálogo pelo script canônico.
6. **NÃO PROMOVER PREMATURAMENTE:** `RUNNING != DONE`, `BUILD=PASS != ENGINE_CONNECTED`, `HTTP 200 != AUTH`, `PROCESSO_ATIVO != MCP_E2E`. Não editar GitHub/main, reiniciar serviços, desabilitar owner antigo ou executar instalador sem critério e escopo da intenção atual.

## Como comunicar / retornar

Usar o **HUD estilo game fixo V1** aprovado, com uma moldura única, placar dos testes preservados e estado Remote separado (`RUNNING`, `BLOCKED`, `PROVADO`). A primeira mensagem do agente sucessor deve identificar este HANDOFF como base, informar medições **atuais** e não repetir investigações concluídas sem necessidade.

**Próximo cursor:** `t_5b386368` → acompanhar sem conflito → resolver `engine_connected=false` e ownership da tarefa Windows → comprovar OAuth e chamada MCP real → só então promover Remote para PASS.

**Rastro deste handoff:** criado para atender à solicitação de continuidade do CHEFE entre agentes/contas, com melhoria antecipada; não executa o instalador, não altera engine, não altera workspace do worker e não reinicia missão. Evidência: leituras Hermes Kanban, tarefa Windows, logs Go e `/health` locais em 24/10/2026. Contraprova: estado `RUNNING`, falha do instalador e `engine_connected=false` impedem selo E2E.