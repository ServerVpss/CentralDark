# 🔥 PENDÊNCIA — MCP Server Local com STDIO (Alta Prioridade)

> **Status:** 🟡 Aberta — aguardando execução
> **Prioridade:** 🔴 Alta
> **Criada em:** 25/06/2026
> **Tipo:** Infra / Ferramentas Cognitivas

---

## 🎯 Objetivo

Criar uma **IA privada extremamente rápida** rodando dentro da própria VPS CentralDark, exposta via **MCP stdio**, conectável pelo **Cursor** ou **Claude Desktop** através de SSH. Foco absoluto em **latência mínima** e **uso pessoal**.

---

## 📋 Requisitos Técnicos

- **Framework:** FastMCP (ou o mais performático disponível em 2026)
- **Transport:** `stdio` (prioridade máxima — sem HTTP, sem rede)
- **Resources:** expor todo o conteúdo da pasta `docs/CONSCIENCIA/` como recursos legíveis pela IA
- **Memória semântica local:** sistema de busca rápida sobre a consciência do projeto (índice em memória, sem dependência de serviço externo)
- **Contexto base obrigatório:**
  - `docs/CONSCIENCIA/00-ENTRADA/00-LEIA-PRIMEIRO.md`
  - `docs/CONSCIENCIA/00-ENTRADA/ARQUITETURA-CENTRALDARK-2026.md`
- **Performance:** resposta em tempo quase real (alvo < 100ms por consulta a resource)

---

## 📁 Estrutura Desejada

```
mcp-server/                         # nova pasta dedicada na raiz do repo
├── server.py                       # servidor FastMCP stdio
├── requirements.txt                # fastmcp + deps mínimas
├── start-mcp.sh                    # script de inicialização
├── ecosystem.config.js             # config PM2 (rodar permanente)
└── README.md                       # quick start

docs/CONSCIENCIA/04-MCP-E-CONECTORES/
└── MCP-LOCAL-STDIO.md              # documentação completa
```

---

## ✅ Entregáveis

1. **Código completo do servidor** (`server.py`):
   - Tools: `ler_consciencia(path)`, `listar_consciencia()`, `buscar_consciencia(query)`
   - Resources: `consciencia://<path>` mapeando toda a pasta `docs/CONSCIENCIA/`
   - Proteção contra path traversal (`_safe_path`)
   - Cache em memória dos arquivos para latência ~0

2. **Script de inicialização** (`start-mcp.sh`):
   ```bash
   #!/usr/bin/env bash
   cd /root/CentralDark/mcp-server
   exec python3 server.py
   ```

3. **PM2 permanente** (`ecosystem.config.js`):
   - Nome: `MCP-Local-Stdio`
   - `pm2 save` obrigatório após start
   - Logs em `/root/CentralDark/logs/mcp-local/`

4. **Documentação** (`docs/CONSCIENCIA/04-MCP-E-CONECTORES/MCP-LOCAL-STDIO.md`):
   - Como instalar (deps Python, FastMCP)
   - Como rodar manualmente para teste
   - Como subir no PM2
   - **Como conectar Cursor via SSH** (exemplo de config `mcp.json` com `ssh root@vps "python3 /root/CentralDark/mcp-server/server.py"`)
   - **Como conectar Claude Desktop** (mesma estratégia stdio-over-ssh)
   - Como testar com MCP Inspector

---

## 🚨 Observações Importantes

- **NÃO confundir** com o MCP remoto existente (`mcp.centralldark.com` — HTTP/OAuth, rodando em `/root/CentralDark/APP/infra/mcp/`). Esse novo é **separado**, **local**, **stdio**, **pessoal**.
- **Localização na VPS:** `/root/CentralDark/mcp-server/` (não tocar no `APP/infra/mcp/`).
- Seguir **Sincronia 4-Point**: criar no GitHub → sincroniza na VPS → atualizar Cérebro Vivo (`cerebro/` e/ou `docs/CONSCIENCIA/`).
- Após pronto: registrar no `APRENDIZADOS.md` e fechar esta pendência.

---

## 🔗 Referências

- FastMCP: https://github.com/jlowin/fastmcp
- MCP stdio spec: https://modelcontextprotocol.io/docs/concepts/transports#stdio
- Cursor MCP config: https://docs.cursor.com/context/model-context-protocol
- Claude Desktop MCP: https://modelcontextprotocol.io/quickstart/user

---

*Pendência criada conforme solicitação do dono do projeto em 25/06/2026.*
