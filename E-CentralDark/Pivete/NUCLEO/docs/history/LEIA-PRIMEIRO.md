# LEIA PRIMEIRO — Pivete

Kit **só Windows**. Roda no seu PC, offline, sem depender de nada online.

## Em 30 segundos

1. Descompacte tudo em `E:\CentralDark\` (ou onde preferir).
2. Dê dois cliques em **`PAINEL.bat`** → abre o painel no navegador.
3. Dê dois cliques em **`ATUALIZAR.bat`** → escolha **1** pra só conferir (não muda nada).

Pronto. Nada é apagado em nenhum momento.

## Os três botões

| Arquivo | O que faz |
|---|---|
| `PAINEL.bat` | Regenera os dados e abre o painel |
| `ATUALIZAR.bat` | 1 = conferir · 2 = atualizar de verdade · 3 = clonar ao lado (se a pasta veio de ZIP) |
| `VIGIA.bat` | Deixa o painel se atualizando sozinho a cada 30s enquanto o Hermes trabalha |

## O BOOT universal

`BOOT-IA.md` é a lei da pasta. Qualquer IA que você apontar pra cá
(Hermes, Claude Code, Codex, Cursor, Copilot) lê ele automaticamente, porque
existem ponteiros na raiz: `AGENTS.md`, `CLAUDE.md`, `.cursorrules`,
`.github\copilot-instructions.md`.

A regra central do BOOT: **toda ação da IA vira uma linha no histórico e
atualiza o painel.** Sem registro, a tarefa não conta como feita.

Para apontar o Hermes pra cá, basta dizer a ele:

> Sua pasta de trabalho é `E:\CentralDark`. Leia `BOOT-IA.md` e obedeça.

## Onde ficam as coisas

```text
BOOT-IA.md            → a lei (leitura obrigatória da IA)
AGENTS.md / CLAUDE.md → ponteiros de 3 linhas pro BOOT
historico\acoes.jsonl → tudo que a IA fez, uma linha por ação
paineis\PAINEL.html   → o painel (abre offline)
paineis\dados.js      → gerado pelos scripts, não edite à mão
scripts\              → atualizar / registrar / gerar-painel / vigia
.github\protected-paths.txt → áreas travadas
.githooks\            → trava commit em área protegida e push direto na main
```

## Segurança (o que o script NUNCA faz)

- Nunca `reset --hard`, nunca `--force`, nunca apaga pasta.
- Backup `.bundle` do histórico inteiro antes de qualquer atualização.
- Só `merge --ff-only`. Se divergiu, ele para e te avisa.
- Se você tem trabalho não salvo, ele para antes de mexer em qualquer coisa.

## Ligar os hooks (opcional)

Só se a pasta for um clone git:

```powershell
git config core.hooksPath .githooks
```
