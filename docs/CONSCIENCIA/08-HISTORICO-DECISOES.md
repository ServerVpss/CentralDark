# 08 — Histórico de decisões grandes

Decisões arquiteturais e operacionais já tomadas. Não reabrir sem motivo forte.

## Migração CentralDark (em andamento)

**Decisão:** estrutura nova oficial da VPS é `/root/CentralDark/APP/{site,modulos,servidor-whatsapp,gateway,infra,scripts,logs,backups,revisoes,secrets}/`.

**Regra:** coisa nova já entra na árvore CentralDark. Migração das pastas antigas (`/root/Multizap/...`) é gradual, manual, e só com confirmação do usuário.

## Fluxo de deploy

**Decisão:** commit direto na `main`, sem PR pra mudança normal. PR + auto-merge só pra mudança crítica (Caddy, Docker, banco, secrets).

**Por quê:** velocidade. Usuário não-técnico não quer revisar PR de mudança trivial.

## Instalador + doc viva

**Decisão:** `install.sh` na raiz + `docs/INSTALADOR/` com 12 arquivos numerados. Toda mudança que afete instalação atualiza o arquivo correspondente no mesmo commit.

**Por quê:** sem isso, VPS nova não sobe do zero.

## Setor único de pendências

**Decisão:** `docs/PENDENCIAS.md` é a fonte única. Nada espalhado.

## Central de horário

**Decisão:** pasta `central-horario/` é fonte única pra qualquer formatação de data/hora. Fuso `America/Sao_Paulo`.

## Docs por pasta

**Decisão:** TODA pasta (repo e VPS) tem `README.md` (o que é) + `PLANO.md` (o que falta). Criar junto, ler antes de mexer, atualizar ao terminar.

## MCP CentralDark

**Decisão:** MCP próprio rodando em `mcp.centralldark.com` (porta 9100), OAuth GitHub. Conecta ChatGPT (e outros LLMs) direto ao repo + VPS.

## Memória eterna do agente ChatGPT

**Decisão (essa):** pasta `docs/CONSCIENCIA/` no repo + `/root/CentralDark/memoria-consciencia/` na VPS. Custom GPT lê tudo no começo de cada conversa. Atualização automática a cada 6h via GitHub Actions.

## GitHub Achievements

**Decisão:** farmar todas as 8 medalhas no perfil `segredounlock`. Todo commit em repo público leva trailer `Co-authored-by: SegredoiDev <segredounlock@users.noreply.github.com>`.

## Permissões do agente

**Decisão:** agente executa direto edições de código, git pull, build/test, restart de 3 serviços PM2 (`CloneDeck-Supabase-Sync`, `MultiZap-TelegramBot`, `MCP-CentralDark`). Tudo o que envolve Docker, WuzAPI, WhatsApp, Caddy, CRM, banco, secrets, `rm -rf` ou domínio pede confirmação.

## Gerenciador de pacotes — npm (raiz)

**Decisão (25/06/2026):** o gerenciador de pacotes oficial da raiz do repositório é **npm**. Lockfile único e versionado: `package-lock.json`.

**Contexto:** a raiz tinha dois lockfiles versionados — `package-lock.json` (npm, ativo, atualizado em 02/2026) e `bun.lockb` (resquício do template `vite_react_shadcn_ts`, de 01/2025). O VS Code alertava "multiple lockfiles" e não conseguia decidir o package manager automaticamente.

**Ações:** `bun.lockb` removido do git; campo `"packageManager": "npm@10.9.7"` adicionado ao `package.json` (padrão corepack — declaração única lida por todas as ferramentas, supera um `.vscode/settings.json` que o `.gitignore` bloquearia); `package-lock.json` revalidado com `npm install --package-lock-only` (resultado: up to date).

**Por quê npm:** lockfile mais recente e ativamente mantido, é o que o VS Code prefere por padrão, e o mais estável para um projeto Vite/React simples. Não havia motivo para manter o Bun do template.

**Regra:** instalar dependências na raiz **sempre com `npm`**. Não recriar `yarn.lock`, `pnpm-lock.yaml` ou `bun.lockb` na raiz.
