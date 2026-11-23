# Protocolo `revisao-humana` — Time de Bots

> Documento curto e prático. Toda Issue/PR criada por bot do time **DEVE** seguir isso.
> Espelho: `mem://protocolo-revisao-humana`.

## Por que existe

O Time de Bots roda 24/7, mas **humano é a última camada**. Sem esse protocolo, bot mergeia coisa errada, gera ruído ou esconde risco. A label `revisao-humana` é a chave que separa "bot sugeriu" de "humano aprovou".

## Quando aplicar a label

```text
SEMPRE que:
├── bot abrir Issue                         → label revisao-humana
├── bot abrir PR                            → label revisao-humana
├── bot detectar finding de segurança       → label revisao-humana + p0/p1
└── bot escrever recomendação acionável     → label revisao-humana

NUNCA aplicar quando:
├── bot só atualiza dado próprio
│   (ex: painel-vivo no painel-data.json,
│    sentinela editando Issue dela mesma)
└── relatório informativo sem ação pedida
```

## Anatomia mínima de uma Issue/PR de bot

Toda Issue/PR aberta por bot do time precisa ter:

1. **Título** com prefixo do bot: `[VIGIA]`, `[SENTINELA]`, `[DOC-GUARDIAO]`, etc.
2. **Labels obrigatórias**:
   - `revisao-humana`
   - `auto` (marca que foi bot, não humano)
   - `assign:<bot-dono>` (pro Dispatcher rotear)
   - `p0` / `p1` / `p2` / `p3` (severidade)
3. **Corpo estruturado**:
   ```markdown
   ## O que aconteceu
   <fato observado, com link>

   ## Por que importa
   <impacto, risco>

   ## Sugestão (não executado)
   <ação proposta>

   ## Bloqueado pelo protocolo
   - Bot NÃO mergeia
   - Bot NÃO reinicia serviço
   - Bot NÃO apaga arquivo
   - Bot NÃO toca secret
   ```
4. **Relatório completo** em `docs/RELATORIOS/<bot>/<YYYY-MM-DD-HHMM>.md` (link no corpo).

## O que o humano faz

```text
1. Lê o corpo + relatório
2. Decide:
   ├── aprova       → tira `revisao-humana`, aplica fix (ou pede pro bot dono)
   ├── recusa       → comenta motivo + fecha
   ├── precisa mais → comenta pergunta, mantém label
   └── escalou      → adiciona `p0` e chama mestre
3. Quando resolver, fecha com motivo
```

## TTL e escalada

- **7 dias sem ação** → `sentinela-stale.yml` aplica label `stale` e comenta lembrete.
- **30 dias sem ação** → bot dono comenta "ainda vale?" e propõe fechar.

## Catálogo de labels

Mantido no workflow `.github/workflows/bots-labels-seed.yml` (rode-o pra criar/atualizar tudo de uma vez). Tabela rápida:

| Categoria | Labels |
|---|---|
| Governança | `revisao-humana`, `vigia`, `auto`, `stale`, `needs-codex-review` |
| Severidade | `p0`, `p1`, `p2`, `p3` |
| Assign IA  | `assign:chatgpt`, `assign:codex`, `assign:lovable`, `assign:grok` |
| Assign bot | `assign:supabase-bot`, `assign:dependabot`, `assign:codeql`, `assign:doc-guardiao`, `assign:faxineiro-repo`, `assign:auditor-divergencia`, `assign:guarda-seguranca`, `assign:vps-healthcheck`, `assign:painel-vivo`, `assign:sentinela`, `assign:vigia` |
| Escopo | `dependencies`, `mcp`, `linear`, `sentry`, `notion`, `security`, `github-actions`, `bot-server`, `install-callback`, `frontend` |

Aliases antigos mantidos por compatibilidade: `assign:faxineiro`, `assign:auditor`, `assign:seguranca`, `assign:vps-health`.

## Travas duras (NUNCA quebrar)

```text
❌ Bot mergeia em main                    → proibido
❌ Bot reinicia produção                  → proibido
❌ Bot apaga arquivo                      → proibido
❌ Bot lê/edita .env, secrets/, .ssh/     → proibido
❌ Bot mexe em Docker/WuzAPI/Caddy/CRM    → proibido sem confirmação humana
❌ Bot aplica `revisao-humana` em si mesmo e remove sozinho → proibido
```

Se um bot violar qualquer item, ele é **desligado** até a causa-raiz ser corrigida e documentada em `docs/CONSCIENCIA/APRENDIZADOS.md`.

## Como adicionar um bot novo

1. Cria entrada em `docs/BOTS/README.md` (quadro principal) e `docs/BOTS/TIME-DE-BOTS.md` (mapa).
2. Adiciona label `assign:<novo-bot>` em `.github/workflows/bots-labels-seed.yml` e roda o workflow.
3. Workflow do bot novo aplica `revisao-humana` + `auto` + `assign:<novo-bot>` em tudo que abrir.
4. Dispatcher (`dispatcher-bots.yml`) já reage à label `assign:*` — sem mudança lá.
5. Primeira semana = MODO RELATÓRIO (só Issue, sem PR de código).
