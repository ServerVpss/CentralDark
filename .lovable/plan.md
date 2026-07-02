Plano para continuar usando seu MCP de forma segura e executar o graph-panel na VPS

1. Estado confirmado
- O MCP antigo retornou 401 e não deve ser usado até reconectar.
- O MCP ativo é o segundo conector CentralDark, que respondeu normalmente.
- O dispatcher está ativo com 70 ferramentas carregadas.
- A política de segurança está ligada: leitura executa direto; escrita/execução real exige confirmações literais.
- Status atual do deploy está em ALERTA apenas porque há workflow ainda rodando; PM2 principal está online.

2. Parâmetros e ferramentas de VPS que vamos usar
- vps_git_status: leitura do estado git da VPS.
- vps_git_diff_safe: leitura segura de diferenças.
- vps_tree_safe: árvore segura de pastas.
- vps_list_dir_safe: listar diretórios permitidos.
- vps_read_file_safe: ler arquivos seguros, sem secrets/sessões/tokens.
- vps_write_file_safe: criar/alterar arquivo seguro; execução real exige `CONFIRMO ESCREVER`.
- vps_run_once_script: rodar script controlado na VPS; execução real exige `CONFIRMO RUN ONCE`.
- execute_command: comando shell na VPS; marcado como sensível/destrutivo, então só usar para comandos necessários e seguros.
- mcp_policy_summary: validar política de segurança antes de ações sensíveis.
- mcp_admin_catalog: consultar catálogo de ferramentas disponíveis.

3. O que vou fazer quando o plano for aprovado
- Ler, via MCP, a estrutura atual de `apps/modulos/` e confirmar se `graph-panel` já existe.
- Conferir GitHub/VPS antes de tocar em qualquer coisa.
- Criar ou ajustar o módulo somente dentro de `apps/modulos/graph-panel/`.
- Manter dentro do módulo: servidor, frontend público, scripts, dados, logs e documentação Markdown.
- Preparar `server.js` com endpoints:
  - `/api/health`
  - `/api/graph`
  - `/api/report`
  - `/api/audit`
  - `/api/stats`
  - `/api/history`
  - `/api/run`
- Preparar PM2 com nome `graph-panel` sem espalhar arquivo fora do módulo.
- Preparar documentação Markdown clara: README, MANUAL, ARQUITETURA e CHANGELOG.
- Preparar instrução/bloco de Caddy para `grafo.centralldark.com` apontar para `localhost:3030`.
- Não mexer em áreas protegidas como `apps/modulos/mcp/`, `scripts/webhook/`, `scripts/contas-admin/` ou Caddy existente sem limitar a alteração ao bloco novo do subdomínio.

4. Sobre graphifyy vs API Lovable
- Sim, dá para resolver mais rápido usando a API Lovable direto para montar o grafo.
- O melhor caminho é manter os dois:
  - principal: API Lovable para extrair, agrupar e rotular mais rápido;
  - reserva: graphifyy como opção 2, caso precise ou caso a API falhe.
- Assim não abandonamos o plano maior e ainda ganhamos velocidade agora.

5. Regras de segurança na execução
- Não vou ler `.env`, secrets, tokens, sessões, bancos locais ou chaves.
- Escrita real na VPS só com ferramentas seguras e confirmação exigida pelo MCP.
- Ações destrutivas continuam bloqueadas sem confirmação explícita.
- Logs e resultados serão sanitizados.

6. Resultado esperado
- Painel funcional na VPS em `apps/modulos/graph-panel/`.
- PM2 rodando como `graph-panel`.
- Subdomínio `grafo.centralldark.com` apontando para o painel.
- Página buscando automaticamente grafo, resumo e auditoria do último run.
- Documentação organizada para você achar e alterar depois.
- Lovable/API principal pronta para acelerar o mapeamento, com graphifyy mantido como reserva.