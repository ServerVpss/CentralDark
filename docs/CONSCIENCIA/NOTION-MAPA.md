# 🗺️ Mapa do Notion — CentralDark

> **Status:** Ativo · **Data:** 25/06/2026 · **Responsável:** Pivete
> **Fonte canônica deste mapa:** este arquivo (`docs/CONSCIENCIA/NOTION-MAPA.md`)
> **Lei vigente:** Git é fonte da verdade; Notion é painel humano (ver `REGRA-OFICIAL-HIERARQUIA-MEMORIA.md`)

---

## Por que esse arquivo existe

Qualquer IA (Lovable, Claude, GPT, Grok, Gemini, Codex, Cursor) que abrir este repositório precisa saber **onde no Notion** procurar antes de duplicar conteúdo. Este arquivo é o índice oficial.

**Regra Anti-Inflação:** antes de criar página/database novo no Notion, abrir este mapa, ver se já existe destino, e só criar se realmente não houver.

---

## 🏠 Hub central

**CentralDark • Consolidação**
https://app.notion.com/p/CentralDark-Consolida-o-389d08b5e95981a1a446c2691519a78a

Página-mãe do workspace. Todos os databases abaixo são filhos dela.

---

## 📊 Databases oficiais (8)

| Emoji + Nome | Fonte no Git | URL Notion | Data Source ID |
|---|---|---|---|
| 📜 Regras do Projeto | `REGRA-OFICIAL-*.md` em `docs/CONSCIENCIA/` | https://app.notion.com/p/fd0a063ceb2146fc9f5272027a7befdc | `867966ce-c6bb-4767-af25-e6da4b8eb9f9` |
| 🔥 Pendências Ativas | `docs/PENDENCIAS.md` | https://app.notion.com/p/b37757f141a84d78b738b29068423419 | `52dcbdf3-f1f2-49dc-8ee7-f26c34bece3e` |
| 🤖 Agent Logs | sessões e relatórios | https://app.notion.com/p/4744cbc70c4541d6bcf779b6d2ee7b5d | — |
| 📚 Histórico de Consolidação | mudanças estruturais | https://app.notion.com/p/d7707d3027f543f88e2987bb935cd006 | — |
| ⚖️ Registro de Decisões | `docs/CONSCIENCIA/08-HISTORICO-DECISOES.md` | https://app.notion.com/p/3bffaefcc6064ed6957ac2bfb6fb6c7f | — |
| 📥 Import Queue | itens a triar | https://app.notion.com/p/b6450045bf614983861a0ea43ab7996f | — |
| 📂 Estrutura de Pastas & Agentes | mapa de pastas | https://app.notion.com/p/e9c957797a724bcc872f9903e7c1cf7e | — |
| 🧠 Aprendizados | `docs/CONSCIENCIA/APRENDIZADOS.md` | https://app.notion.com/p/f53285e1891f4645bae8160b44d6cb6c | `d2dc1197-f0e2-4cea-9f8f-c3a5499a0303` |

---

## Onde NÃO espelhar (decisão de segurança)

Estes arquivos **ficam só no Git** (privado). Nunca subir pro Notion:

- `docs/CONSCIENCIA/04-ESTRUTURA-VPS.md` (IP público + árvore `/root/`)
- `docs/CONSCIENCIA/05-SSH-VPS.md` (paths de `.pem`, estratégia de chaves)
- `docs/CONSCIENCIA/12-COFRE-LOVABLE.md` (mapa de secrets)
- `docs/CONSCIENCIA/14-COFRE-SECRETS-CENTRALIZADO.md` (rotação de secrets)
- `docs/CONSCIENCIA/04-MCP-E-CONECTORES/secrets-mapeamento/` (paths internos)
- `docs/CONSCIENCIA/ARQUIVO-MORTO/` (legado, não merece espelho)

**Motivo:** copiar isso pro Notion = entregar mapa de ataque da VPS.

---

## Fluxo de sincronização

```
Git (docs/)  ──── espelha ────►  Notion (databases)
       ▲                              │
       │                              │
       └──── obrigatório commit ──────┘
              se mudar no Notion
```

- Mudou no Git → reflete no Notion (opcional, mas valioso).
- Mudou no Notion → **obrigatório** refletir no Git (senão não conta).
- `mem://` nunca recebe original — só cache de sessão.

---

## Como uma IA deve usar este mapa

1. Antes de criar página/database no Notion, abrir este arquivo.
2. Verificar se o destino já existe na tabela acima.
3. Se existir → usar o data source ID e adicionar entrada.
4. Se não existir → propor ao usuário antes de criar.
5. Ao criar algo novo no Notion, **atualizar este arquivo** no mesmo commit.
