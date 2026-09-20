# 🔌 MCP CentralDark — o "cardápio" de ferramentas das IAs

> **Em 1 frase:** este é o servidor que permite qualquer IA (Claude, Grok, ChatGPT, Gemini)
> usar as ferramentas da CentralDark — mexer no GitHub, na VPS, ler a consciência, lembrar do
> seu jeito — tudo de forma segura e com login.

🔒 **PASTA TRANCADA** — consolidada e testada (30/06/2026). Outra IA só mexe aqui com
autorização **"PERMITO PIVETE"** (ver `CLAUDE.md` Seção 9).

---

## O básico (pra quem não é técnico)

- **Onde roda:** na VPS, processo PM2 `CentralDark-MCP`, porta interna `9100`.
- **Endereço público:** `https://mcp.centralldark.com` (precisa de login OAuth).
- **Quantas ferramentas:** **102** (96 originais + 4 cognitivas + 2 Gemini).
- **Versão:** 0.4.0.

Pra ligar/reiniciar/ver:
```bash
pm2 restart CentralDark-MCP      # reinicia
curl http://localhost:9100/health   # mostra se está no ar + nº de tools
pm2 logs CentralDark-MCP         # vê os logs
```

---

## 🗂️ As 102 ferramentas, por categoria

| Categoria | Qtd | Pra que serve |
|-----------|----:|---------------|
| 🐙 GitHub | ~37 | Ler/escrever/administrar repositório, issues, PRs, workflows |
| 🖥️ VPS | ~10 | Ler/escrever arquivos, rodar comandos seguros, PM2 (com trava) |
| 🧠 Consciência | 7 | Ler/atualizar as regras e o estado do projeto |
| 📋 Pendências | 3 | Abrir, fechar e listar tarefas |
| 💡 Aprendizado | 3 | Registrar e puxar aprendizados |
| ⚡ Skills | 4 | Instalar/listar/atualizar skills |
| 🗄️ Supabase | 4 | Consultar banco, schema, migrations |
| 🚀 Deploy | 1–2 | Status de deploy |
| 📡 Integrações | 13 | Notion, Linear, Sentry |
| 🌐 Elite Gateway | 3 | Falar com os modelos via proxy próprio (claude.ap7.site) |
| 📊 Painel/Admin | ~9 | Atualizar painel, admin e diagnóstico do próprio MCP |
| 🧩 Outras | 2 | Code reviewer, ferramenta de teste do Pivete |
| **🧠 Cognitivas** | **4** | **Lembranças + governança cognitiva — ver abaixo** |
| **🤖 Gemini** | **2** | **leitura rápida via API do Google Gemini (cérebro auxiliar)** |

### 🧠 As 4 ferramentas cognitivas (governança + memória cruzada)

| Ferramenta | O que faz |
|------------|-----------|
| `consultar_memoria_reserva` | Lê as **Lembranças** do Pivete (padrão de pensamento, por eixo de tempo) |
| `consolidar_pensamento` | Grava uma lembrança nova (validade de 30 dias) |
| `injetar_consciencia_centraldark` | Entrega as regras de conduta (zero enrolação, pragmatismo, foco) |
| `analise_de_estado_cognitivo` | Lê as últimas lembranças e diz o foco atual do Pivete |

> As Lembranças vivem em [`docs/CONSCIENCIA/LEMBRANCAS/`](../../../docs/CONSCIENCIA/LEMBRANCAS/).
> Detalhes técnicos em [`docs/`](docs/).

---

## 📁 Estrutura da pasta

```
apps/modulos/mcp/
├── README.md          ← você está aqui (mapa leigo)
├── package.json       ← dependências e scripts
├── tsconfig.json      ← config TypeScript
├── .gitignore         ← versiona o dist/, esconde .env e lixo
├── .env               ← segredos (NUNCA versionado)
├── docs/              ← documentação técnica (arquitetura + tools cognitivas)
└── dist/              ← CÓDIGO VIVO (o que roda hoje) — versionado no Git
    ├── index.js           entrypoint (servidor Express, rotas, OAuth)
    ├── mcp-server.js      protocolo MCP, registro de tools
    ├── oauth.js           login OAuth 2.1 + ponte GitHub
    ├── sessions.js        sessões e tokens
    ├── config.js          configuração via .env
    ├── audit-logger.js    log auditado de cada chamada
    └── tools/             as 102 ferramentas, por domínio
        ├── github/  vps/  consciencia/  pendencias/  aprendizado/
        ├── skills/  supabase/  deploy/  elite/  painel/  core/
        ├── cognitivo/     ← as 4 tools cognitivas (Lembranças)
        └── gemini/        ← as 2 tools do Gemini (cérebro auxiliar)
```

> **Nota técnica importante:** hoje o código vive no `dist/` (JavaScript compilado), que é a
> única cópia. A fonte TypeScript (`src/`) será reconstruída numa etapa futura. Por isso o
> `dist/` é versionado no Git — ver [`docs/ARQUITETURA.md`](docs/ARQUITETURA.md).
