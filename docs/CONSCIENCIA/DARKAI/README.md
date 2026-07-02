# 🧠 DARKAI — Cérebro Compartilhado das IAs do CentralDark

> **Ponto único de verdade.** Todo material sobre como IAs (Claude, GPT, Gemini, Cursor, bots Telegram, scripts na VPS) conversam entre si e usam o "cérebro compartilhado" mora AQUI. Não procure em outra pasta.

---

## 🚀 Começou agora? Vai por essa ordem:

| Ordem | Arquivo | Pra quê |
|-------|---------|---------|
| 1 | [`QUICKSTART.md`](QUICKSTART.md) | Instalar + rodar `darkai` em 5 minutos |
| 2 | [`00-COMECE-AQUI.md`](00-COMECE-AQUI.md) | Visão geral do curso |
| 3 | [`PROMPT-UNIVERSAL.md`](PROMPT-UNIVERSAL.md) | Prompt pronto pra ensinar QUALQUER IA a usar `darkai` |
| 4 | [`01-O-QUE-E-DARKAI.md`](01-O-QUE-E-DARKAI.md) → [`10-TROUBLESHOOTING.md`](10-TROUBLESHOOTING.md) | Curso completo em 10 partes |

---

## 📂 Mapa da pasta

### Documentação (leia)
```
README.md                       ← você está aqui (índice)
QUICKSTART.md                   ← passo a passo prático
PROMPT-UNIVERSAL.md             ← template pra ensinar outras IAs
00-COMECE-AQUI.md               ← porta de entrada do curso
01-O-QUE-E-DARKAI.md            ← conceito em linguagem simples
02-COMO-FUNCIONA-POR-DENTRO.md  ← fluxo técnico + diagrama
03-CATALOGO-DE-MODELOS.md       ← Gemini 3, GPT-5.5, etc — qual usar
04-USANDO-NO-TERMINAL-LOCAL.md  ← instalar no PC (Mac/Linux/Windows)
05-USANDO-NA-VPS.md             ← instalar na VPS
06-ENSINANDO-OUTRAS-IAS.md      ← prompt detalhado (versão longa)
07-EXEMPLOS-PRATICOS.md         ← 15+ receitas do mundo real
08-TECNICAS-QUE-USO.md          ← workflow do Lovable
09-ARQUITETURA-E-ORQUESTRACAO.md← orquestração multi-IA
10-TROUBLESHOOTING.md           ← erros comuns
COMO-USAR.md                    ← cola rápida de comandos
COMO-ENSINAR-OUTRA-IA.md        ← versão curta do prompt
INSTALAR-NA-VPS.md              ← comandos VPS
```

### Scripts (executa)
```
darkai.sh                       ← o CLI em si (bash + curl)
instalar-local.sh               ← instalador Mac/Linux
instalar-windows.ps1            ← instalador Windows PowerShell
exemplos/
  ├─ resumir-log.sh             ← resume /var/log/syslog
  └─ classificar-erro.sh        ← classifica gravidade de erro
```

### Recursos
```
imagens/                        ← diagramas do curso
```

---

## 🎯 Como cada IA "aprende" o darkai

| IA / Ambiente | Onde colar o `PROMPT-UNIVERSAL.md` |
|---------------|-----------------------------------|
| **Claude Code na VPS** | `~/.claude/CLAUDE.md` (já aponta pra cá) |
| **Cursor** | `.cursorrules` do projeto |
| **ChatGPT custom GPT** | Campo "Custom Instructions" |
| **Gemini CLI** | Primeira mensagem da sessão |
| **Bot Telegram (@srver1bot)** | System prompt no handler |
| **Grupo Telegram Central Dark** | Já configurado — IAs conversam entre si usando `darkai` |
| **Scripts Python/Bash na VPS** | `subprocess.run(["darkai", "..."])` |

---

## 🔗 Integrações que já funcionam com darkai

1. **Notificações Telegram** — scripts em `scripts/webhook/` mandam saída do `darkai` pro grupo/canal
2. **Grupo "Central Dark — Grupo Da Evolução"** — IAs (Claude, Gemini, GPT) conversam ali usando `darkai` como intermediário comum
3. **Canal "Central Dark — Status"** — recebe alertas gerados por `darkai --system "seja SRE" "resume o log"`
4. **Guardião (`infra/guardiao/`)** — usa `darkai` pra classificar anomalias
5. **PR Agent (`.github/workflows/pr-agent.yml`)** — revisa PRs com GPT via proxy

---

## 🏗️ Orquestração multi-IA (setores autônomos)

Ideia atual — cada IA vira um "setor" com papel fixo, todas falam pela mesma chave via `darkai`:

```
┌─────────────────┐   ┌──────────────────┐   ┌─────────────────┐
│  COLETOR (loop) │──▶│ ANALISTA (batch) │──▶│ NOTIFICADOR (TG)│
│ Gemini Flash    │   │ GPT-5.4 raciocina│   │ manda pro grupo │
│ 1min tail logs  │   │ decide gravidade │   │ ou canal Status │
└─────────────────┘   └──────────────────┘   └─────────────────┘
        │                      │                      │
        └───── todos usam ─────┴──── darkai ──────────┘
              (uma chave, modelos diferentes por tarefa)
```

Ver [`09-ARQUITETURA-E-ORQUESTRACAO.md`](09-ARQUITETURA-E-ORQUESTRACAO.md) pra detalhes.

---

## 📌 Regra de atualização

**Toda vez que você mexer em `darkai`, adicionar um exemplo novo, ou integrar com outra IA/serviço:**
1. Atualiza o arquivo correspondente da pasta
2. Atualiza este `README.md` (mapa da pasta)
3. Se for mudança grande, cria/edita imagem em `imagens/`
4. Comita com mensagem `docs(darkai): <o que mudou>`

Assim o "curso" vive junto com a evolução real do sistema.

---

## 🆘 Deu ruim?

- Erro rodando `darkai` → [`10-TROUBLESHOOTING.md`](10-TROUBLESHOOTING.md)
- Não sabe qual modelo escolher → [`03-CATALOGO-DE-MODELOS.md`](03-CATALOGO-DE-MODELOS.md)
- IA nova não tá entendendo → cola [`PROMPT-UNIVERSAL.md`](PROMPT-UNIVERSAL.md) inteiro nela
