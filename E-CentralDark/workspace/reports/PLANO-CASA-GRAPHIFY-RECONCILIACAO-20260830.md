# Plano da Casa CentralDark: reconciliacao e Graphify

Data: 2026-08-30
Modo atual: leitura, preservacao e mudancas locais controladas
Fonte de verdade Git: `origin/main = 0247ecf234fbd0bb8c790618417a38e030684a70`

## Arvore real atual

```text
E:\CentralDark\
|-- CentralDark\
|   `-- junction para Pivete\CentralDark\
|-- Pivete\
|   |-- CentralDark\              # clone fisico, branch local com estado nao commitado
|   |-- worktrees\                # inclui o worktree SOL ativo
|   |-- runtime, profiles, config, sessions, memories, logs, ...
|   |-- .env, auth.json, bancos e locks # protegidos; nao mover nesta fase
|   `-- demais estado legado da Casa
|-- hermes-webui\
|   |-- checkout antigo E\
|   `-- hermes-webui\             # checkout mais novo vindo do C, ainda aninhado por bloqueio
|-- workspace\
|   |-- sol\                      # mapa, fontes, app, voz, pacotes, docs, scripts e estado local
|   `-- reports\
|-- inbox\20260830\               # quatro artefatos CentralDark transportados do C
|-- profiles\                     # criado, ainda sem migrar estado vivo
|-- data\                         # criado, ainda sem migrar bancos
|-- runtime\                     # criado, ainda sem migrar processos
|-- cache\                        # criado, ainda sem migrar caches
`-- backups\                      # criado, ainda sem migrar backups
```

## Inventario de reconciliacao ja feito

- `C:\Users\danda\CentralDark` foi movido para `workspace\sol\01-FONTES\CentralDark-C-CHECKOUT-20260830`.
- `C:\Users\danda\Downloads` teve quatro artefatos CentralDark movidos para `inbox\20260830`.
- `C:\Users\danda\hermes-webui` foi movido para `E:\CentralDark\hermes-webui\hermes-webui` quando o checkout E estava bloqueado.
- `C:\Users\danda\Grok-Api` e `C:\Users\danda\telegram-zen-panel-6518f4e2-5d802052` nao sao duplicatas CentralDark/Hermes; permanecem no C.
- Perfis `.codex`, `.claude`, `.hermes`, Screenpipe, Chrome/Edge, AppData, cookies, historico, tokens, bancos, `.env` e `auth` nao foram abertos nem movidos.

## Plano em seis fases

### 1. Congelar e medir

- Desligar Hermes e somente os processos que mantem os caminhos de checkout abertos.
- Confirmar listeners, processos, locks, `git status`, remoto, branch e HEAD.
- Gerar manifestos de caminho, tamanho e SHA-256 dos dois checkouts Hermes e do clone CentralDark.
- Nao ler conteudo de credenciais, cookies, tokens ou bancos.

### 2. Fechar a topologia da Casa

- Manter `E:\CentralDark\CentralDark` como entrada canonica.
- Quando nao houver lock, mover fisicamente `Pivete\CentralDark` para `CentralDark`.
- Preservar um junction reversivel somente enquanto houver consumidores do caminho antigo.
- Manter `Pivete` como legado de estado ate cada subarvore ter owner e destino comprovados.

### 3. Reconciliar Hermes

- Comparar o checkout antigo E com o checkout novo aninhado usando remoto, HEAD, arvore rastreada e arquivos nao rastreados.
- Promover somente o checkout comprovadamente mais novo para `E:\CentralDark\hermes-webui`.
- Arquivar o outro em `workspace\sol\01-FONTES`, sem apagar `.git`, `log_monitor.py` ou `server.log`.
- Validar o runtime depois da troca; nao iniciar PM2 nem fazer deploy.

### 4. Organizar estado sem tocar segredos

- `profiles`: somente configuracoes nao sensiveis e com destino conhecido.
- `data`: dados locais explicitamente autorizados, nunca `auth`, tokens ou bancos ativos.
- `runtime`: manifests, recibos e estado recriavel depois de parar processos.
- `cache`: apenas caches regeneraveis, com prova de que nao sao credenciais.
- `backups`: somente copias identificadas, com origem, data e hash.
- `workspace`: scans, extracts, builds, reports, worktrees e fontes historicas.
- Qualquer item sem owner, destino ou prova fica em `99-QUARENTENA-REVISAO`.

### 5. Graphify em segundo plano, controlado

- Rodar contra fontes de codigo/documentacao, nao contra perfis, bancos, cookies, AppData ou caches.
- Alvos: `E:\CentralDark\CentralDark`, `workspace\sol`, fontes historicas e Hermes reconciliado.
- Usar modo dirigido/profundo somente nas fontes aprovadas, com `--update` nas repeticoes.
- Gerar grafos separados por fonte e um grafo de reconciliacao; nao misturar estado pessoal no corpus.
- Frentes: inventario, owners, rotas, UI SOL, voz, Hermes, MCP/API, processos, documentos e caminhos.
- O agente semantico pode trabalhar em paralelo quando houver slot; a tentativa anterior de 10 agentes foi limitada pelo ambiente. Nao declarar execucao se nao houver recibo.

### 6. Fechamento e prova

- Cada entrada recebe `REUSE`, `ABSORB`, `HISTORY_REFERENCE`, `QUARANTINE` ou `DROP_WITH_PROOF`.
- `UNCLASSIFIED = 0`, `SILENTLY_DROPPED = 0`, `UNOWNED = 0`.
- Comparar grafo com `origin/main`, filesystem e runtime real.
- Testar SOL local, chat, TTS, memoria e rotas sem tocar producao.
- Declarar `FIXED_POINT_LOCAL` somente com recibos no mesmo estado; caso contrario, `BLOCKED_FIXED_POINT` com bloqueio nomeado.

## Regra de seguranca

Nenhuma exclusao por nome parecido. Duplicata so pode ser removida depois de:

```text
mesma origem ou equivalente comprovado
AND
mesmo conteudo ou destino preservado
AND
nenhum consumidor ativo
AND
backup/hash registrado
AND
contraprova apos a mudanca
```

