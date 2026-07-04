
## O que vai mudar

Toda ação liberada no MCP (`execute_command` e `vps_run_once_script`) passa a gravar um registro de auditoria em arquivo, e o painel Hermes ganha uma aba **"Auditoria"** que lê esses registros ao vivo pelo `api.centralldark.com`.

## O que cada ação vai registrar

Cada linha do log guarda:

- **Hora** (ISO 8601, com timezone)
- **Usuário** (quem chamou — vem do cabeçalho do MCP; se não vier, marca `mcp-local`)
- **IP** (remoto, capturado do transport HTTP do MCP; se for stdio local, marca `local-stdio`)
- **Ferramenta** (`execute_command` ou `vps_run_once_script`)
- **Comando** (sanitizado — segredos continuam mascarados pela sanitize atual)
- **cwd** e **root** usados
- **Status** (`OK`, `FALHOU`, `TIMEOUT`, `BLOQUEADO`, `BLOQUEADO_CONFIG`, `ERRO_SPAWN`)
- **exitCode**, **duração em ms**, **tamanho de stdout/stderr**
- **blockedPatterns** (quando aplicável)
- **hostname/pid** do processo MCP

Arquivo: `/root/CentralDark/logs/mcp-audit-YYYY-MM-DD.jsonl` (mesma pasta e padrão do `mcp-blocked-*.jsonl` que já existe). Um arquivo por dia, `chmod 600`, rotação natural.

## Onde entra no código

### 1. MCP (`apps/modulos/mcp/dist/tools/vps/`)

- **`vps-lazy.js` → `runCommand`**: envolvo o `spawn` num wrapper que mede tempo e, no `close`/`error`/bloqueio, chama uma função nova `auditLog(evento)` que faz `appendFileSync` no JSONL do dia. Também loga os casos `BLOQUEADO` e `BLOQUEADO_CONFIG` (hoje o segundo já grava, o primeiro não).
- **`vps-run-once.js`**: mesma função `auditLog` disparada antes/depois da execução do script.
- Helper `auditLog` fica num arquivo novo `apps/modulos/mcp/dist/lib/audit.js`, importado pelos dois.
- Captura de usuário/IP: leio `process.env.MCP_CALLER_USER` e `process.env.MCP_CALLER_IP` que o próprio dispatcher HTTP do MCP já preenche por request (se não existir, aplico fallback `mcp-local` / `local-stdio` e registro assim mesmo — nada silencioso).

### 2. Gateway (`apps/modulos/elite-gateway/scripts/elite_http_gateway.py`)

Três rotas novas, mesmo padrão de Bearer das rotas `/hermes/cadeia`:

- `GET /hermes/audit/dias` → lista os arquivos de dia disponíveis.
- `GET /hermes/audit?date=YYYY-MM-DD&limit=200&status=OK|FALHOU|BLOQUEADO` → devolve os últimos N registros do dia (default = hoje), filtro opcional por status.
- `GET /hermes/audit/stats?dias=7` → contagem por status/dia pros cards de resumo.

Leitura em modo tail (últimas N linhas) pra não estourar memória em arquivos grandes.

### 3. Painel Hermes (`apps/modulos/WebUI/custom-css/hermes-panel.{js,css}`)

- Adiciono duas abas no modal existente: **"Cadeia"** (o que já tem) e **"Auditoria"** (nova).
- Aba Auditoria mostra:
  - Cards de resumo no topo: OK / FALHOU / BLOQUEADO (últimas 24h).
  - Tabela: Hora · Usuário · IP · Ferramenta · Comando (truncado, hover mostra completo) · Status (badge colorido) · Duração.
  - Seletor de dia (dropdown com os dias que a rota `/dias` devolveu).
  - Filtro por status.
  - Botão "↻ Atualizar" + auto-refresh a cada 10s enquanto a aba está aberta.
- CSS segue o mesmo estilo Esmeralda já em uso no painel.

## Ativação na VPS

Depois do merge:

1. `git pull` no repo da VPS.
2. `pm2 restart 33 --update-env` (MCP) e `pm2 restart 60 --update-env` (Gateway) em background.
3. No WebUI, o `hermes-panel.js` já é montado pelo `docker-compose.override.yml` — Pivete só cola a versão nova em Admin → Settings → Interface → Custom JS (o painel avisa "versão nova disponível" se detectar hash diferente).

Sem downtime, sem tocar em nada bloqueado, sem mexer em secrets.

## Observação honesta sobre IP/usuário

O MCP hoje aceita chamadas por dois transportes:

- **HTTP** (dispatcher `mcp_admin_call`, etc.): consigo IP real e identificador do cliente pelos cabeçalhos — vai preenchido.
- **stdio local** (quando alguém abre o MCP direto no processo): não existe IP; nesse caso o registro fica marcado `local-stdio` com o `pid` de quem chamou. Não invento IP falso.

Isso vai estar visível no próprio painel pra não dar impressão de dado maquiado.

## Aprendizado no Hermes

Registro um aprendizado novo (categoria `regra`) explicando o formato do JSONL, as rotas novas do gateway e como o painel consome — pra qualquer IA futura mexer sem quebrar o padrão.
