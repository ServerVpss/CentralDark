# 30 — Skill da Consciência CentralDark

## O que é

A skill **`centraldark-consciencia`** é um pacote padrão que carrega toda a Consciência do projeto (regras, padrão de qualidade, SSH, deploy, gatilhos de pendências) em qualquer IA externa com 1 comando.

## Onde mora

```text
skills/
└── centraldark-consciencia/
    ├── SKILL.md           ← manifesto + regras (fonte que a IA lê)
    ├── README.md
    ├── pendencias-ativas.md   ← espelho auto-sync de docs/PENDENCIAS.md
    └── scripts/
        ├── pos-instalacao.sh
        └── instalar-via-ssh.sh
```

## 3 caminhos pra instalar

### Caminho 1 — Cérebro CentralDark (curl direto, recomendado) 🔥

**O próprio MCP serve a skill** em rota pública, sem auth, sem mirror externo. 1 comando em qualquer IA com terminal:

```bash
# Via cérebro (MCP)
curl -sL https://mcp.centralldark.com/skills/centraldark-consciencia/install.sh | bash

# Espelho na porta pública (mesma coisa, fallback)
curl -sL https://install.centralldark.com/skills/centraldark-consciencia/install.sh | bash
```

O script detecta sozinho o agente (`~/.claude/`, `~/.cursor/`, `~/.config/codex/`, `~/.config/claude/`) e copia o `SKILL.md` no path certo. Cache 5 min, CORS liberado, funciona em VPS nova sem nada configurado.

**Rotas disponíveis (mesmas em `mcp.centralldark.com` e `install.centralldark.com`):**

| Rota | Devolve |
|------|---------|
| `GET /skills` | Lista JSON de todas as skills |
| `GET /skills/:nome` | Manifesto JSON + conteúdo |
| `GET /skills/:nome/SKILL.md` | Markdown cru |
| `GET /skills/:nome/install.sh` | Script bash auto-detect |

### Caminho 2 — Tools MCP (Lovable, Claude Desktop, n8n)

Pra cliente MCP autenticado, as 4 tools continuam disponíveis:

| Tool | Quando usar |
|------|-------------|
| `skill_listar` | "Quais skills tem?" |
| `skill_instalar` | "Instala a consciência" |
| `skill_status` | "Tá atualizada?" |
| `skill_atualizar` | "Puxa a versão nova" |

### Caminho 3 — SSH na VPS (IA com SSH ativo)

```bash
ssh-vps "bash /root/skills/centraldark-consciencia/scripts/instalar-via-ssh.sh"
```

O script auto-detecta o agente instalado (`~/.claude/`, `~/.cursor/`, `~/.config/codex/`) e copia a skill no path certo. Útil pra setup em massa ou modo emergência.

## Fonte única

A skill **não duplica** o conteúdo de `docs/CONSCIENCIA/`. Ela:

- Resume as 10 regras invioláveis no próprio `SKILL.md`
- Referencia os arquivos detalhados por path do repo
- Tem `pendencias-ativas.md` regenerado pelo workflow `consciencia-sync.yml` toda vez que `docs/PENDENCIAS.md` muda

## Como atualizar

1. Edite `docs/CONSCIENCIA/CONSCIENCIA.md` (regra inquebrável nova) **OU** `skills/centraldark-consciencia/SKILL.md` (versão resumida)
2. Bump do `version` no frontmatter de `SKILL.md`
3. Commit na `main`
4. O workflow `consciencia-sync.yml` regenera derivados
5. IAs externas chamam `skill_atualizar` ou rodam `skil.sh` de novo

## Auxiliar local

Pra rodar local sem precisar de SSH ou MCP:

```bash
bash scripts/instalar-consciencia.sh
```

Veja `scripts/instalar-consciencia.sh`.
