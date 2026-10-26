# HANDOFF CONTÍNUO — CENTRALDARK-REMOTE · CASA · !MICHELIN

**Owner do código:** `K:\scripts\remote-bridge\canonical\`.
**Owner do método:** `K:\.agents\skills\centraldark-operational-method\SKILL.md`.
**Lei existente:** `K:\docs\ARQUITETURA\JARVIS-ORQUESTRACAO-DELTA-E-ESCRITOR-UNICO.md`: ler owner, executar pelo mecanismo existente, testar, contraprovar, preservar último verde, registrar delta e continuar. Não criar arquitetura paralela.
**Escrito no contexto da missão 2026-10-24, horário America/Bahia;** conferir data/hora NTFS do arquivo para o carimbo efetivo.

## Intenção contínua do CHEFE

Entregar CentralDark-Remote como aplicativo Windows de bandeja com menu `NotifyIcon` e `ContextMenuStrip`, motor local reaproveitado, OAuth/PKCE e pareamento próprio no MCP CentralDark já existente, reconexão, ferramentas e logs/traces na Sala de Controle. Mesmo objetivo para os dois agentes ChatGPT e o Hermes; cada conta conserva seu próprio contexto privado e compartilha apenas registros autorizados aqui.

## Delta auditado por leitor independente

- O owner já consolidou fontes em `K:\scripts\remote-bridge\canonical\`. Manifesto `CENTRALDARK-REMOTE-FONTE-DA-VERDADE.md` e recibo `K:\Bridge\logs\centraldark-remote-source-consolidation-20261024-223004.json` foram lidos.
- **Contraprova real:** 10 de 10 aliases são links simbólicos válidos, destinos existem e SHA-256 bate com o recibo. Status **PASS para integridade da consolidação**, não para engine MCP.
- O outro agente editou `MENU-OPERACIONAL-TRAY.ps1` na pasta canônica em 24/10/2026 às 22:33:58, segundo LastWriteTime. Não editar esse arquivo ao mesmo tempo.
- Bandeja gráfica original está em `engine\CentralDark-Remote-Tray.ps1` (NotifyIcon, ContextMenuStrip, menus, logs, supervisor). OAuth histórico em `CENTRALDARK-OAUTH-TRAY.ps1`. A arquitetura é recuperável e deve ser reutilizada.
- Hermes original de migração `t_c7013806`: workspace inválido e BLOCKED. Continuação `t_5b386368`: medido **READY após run CRASHED** (worker saiu rc=0 sem chamada terminal `kanban_complete`/`kanban_block`/`kanban_request_review`). As edições eventualmente produzidas não ficam anuladas; medir cada efeito real.
- Criação `t_2805243c` e exclusão `t_26e02a16` pelo Hermes local da Casa: DONE e efeitos reais verificados. Método `hermes kanban create` preservado.
- Endpoint `http://127.0.0.1:9101/health` respondeu HTTP 200 com `engine_connected=false`. Remote E2E não é PASS. O instalador One Shot anterior encontrou `TASK_NAME_OWNED_BY_DIFFERENT_PROGRAM`; não assumir owner da tarefa à força.

## Loop de colaboração no mesmo owner

1. Antes de alterar código, ler `CENTRALDARK-REMOTE-FONTE-DA-VERDADE.md`, este HANDOFF, o status do Kanban, as últimas datas/hash e os recibos existentes.
2. **Um escritor por alvo:** agente da integração mantém exclusividade nos arquivos de engine, OAuth, menu e MCP enquanto atua. Outro agente pode auditar arquivos/links e produzir handoff ou testes **em arquivo próprio** sem colisão.
3. Cada agente cria um registro de delta com nome distinto `HANDOFF-DELTA-<data>-<agente>.md` **nesta pasta canônica**, ligando ao HANDOFF principal, ou atualiza a seção de seu próprio arquivo. Não editar simultaneamente um mesmo documento.
4. O agente seguinte lê os handoffs novos, mede o estado vivo de novo e só executa o próximo delta necessário. Cartões Kanban devem ter títulos, chave de idempotência e responsabilidades diferentes; nunca duas tarefas alterando o mesmo arquivo/owner.
5. Para o leitor que coordena (ChatGPT), observar via Desktop Commander autorizado os eventos persistidos e respostas Kanban. Não alegar visão direta de todo `tool_call` de outra conta sem telemetria publicada no owner.
6. Para Hermes, transmitir o caminho desta pasta **no corpo e workspace da missão**, além de comentário no cartão, de forma que a leitura inicial seja possível. A missão termina com chamada terminal correta do Kanban.

## Contrato mínimo de eventos e traces (não criar gateway novo)

Correlacionar, quando forem de fato medidos: `quando`, `agente/owner`, `device`, `kanban_task_id`, `run_id`, `tool`, `tool_call_id`, `trace_id`, `cid`, `status`, `duracao`, `evidencia`, `contraprova`, `proximo_cursor`. Campo não disponível é `NÃO DISPONÍVEL`. `tool_call_start` != `tool_call_completed` != `efeito real` != `kanban_complete`.
Usar registros existentes e saída curta em português; evitar serializar objetos PowerShell gigantes, argumentos privados, conversas, tokens, cookies ou cabeçalhos Authorization.

## Segurança sem bloquear MVP

Agilidade: pré-validação mínima do alvo/owner, teste e readback; não exigir revisão geral desnecessária. Mas autenticação MCP/OAuth e consentimento de pareamento continuam obrigatórios. **Credenciais não devem circular em TXT, comentários, handoffs, chat ou logs**. Hermes pode **usar a sessão/provedor seguro autorizado existente**, sem ler/exportar segredos para documentação. Só provar acesso com respostas sanitizadas e rastreio seguro.

## Próximo cursor

1. Concluir contraprova iniciada pelo outro agente: parser PowerShell, JSON, links canônicos e harness/agent test existentes. Nenhum instalador, restart ou deploy nesta leitura.
2. Recuperar bandeja original e seu menu, preservando os botões e código na pasta canônica. Medir a configuração real da engine e o erro de auth.
3. Conectar o mesmo motor ao MCP CentralDark existente e pareamento aprovado. Provar `engine_connected=true`, OAuth válido, `tools/list` e chamada de somente leitura, com readback e contraprova 401 sem auth.
4. Registrar cada delta/prova em arquivo próprio na mesma pasta e atualizar skill/catálogo canônico por referência; não criar skill/daemon concorrente.
5. Apresentar HUD game fixo V1 com baseline Hermes preservado e Remote pendente até prova E2E.

**Critério:** ganho confirmado hoje é **consolidação 10/10**, não a conexão remota. Outros estados só serão promovidos após medição específica.