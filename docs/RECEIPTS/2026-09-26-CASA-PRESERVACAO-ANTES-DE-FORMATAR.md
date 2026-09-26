---
title: "🧊 Casa — preservação antes de formatar"
status: "ATIVO"
date: 2026-09-26
owner: "docs/RECEIPTS/2026-09-26-CASA-PRESERVACAO-ANTES-DE-FORMATAR.md"
truth_scope: "CASA_PRESERVACAO_E_RESTAURACAO"
canonical: true
tags: [centraldark, casa, preservacao, restauracao, formatacao]
related:
  - "[[2026-09-11-centraldark-unified-oneshot-bridge-exe-remediacao]]"
  - "[[ESTADO-DA-RETOMADA]]"
---

# 🧊 Casa — preservação antes de formatar (2026-09-26)

## 👑 Intenção do CHEFE

VPS apagada. Computador da Casa (`segredo`, Windows) vai ser formatado.
**GitHub é a única fonte da verdade.** Salvar o ouro, sem segredos, sem arquitetura paralela, e poder voltar do zero.
A partir de agora a escrita do CHEFE vai direto na `main`; CI só quando ele decidir endurecer a régua.

## ✅ O que já está no GitHub (provado por leitura de volta)

| Onde | O que tem | Prova |
|---|---|---|
| `main` | todo o sistema canônico (SOUL, AGENTS, regras, scripts, ponte `scripts/remote-bridge/`, skills, receipts) | clone novo em 2026-09-26, HEAD `d3122ae` |
| ramo `preservacao/casa-arquivos-20260926` | cofre da Casa: 71.235 arquivos que **não existiam** na `main` (pastas não versionadas de `E:\CentralDark`, perfil local do Hermes com SOUL/memórias/skills/cron, 2 arquivos soltos de `C:\CentralDark`) | tip `60600ea4`; varredura de chaves no ramo remoto: 0 chaves reais (só textos de código que citam "BEGIN PRIVATE KEY") |
| ramo `preservacao/casa-c-main-20260926` | commits locais de `C:\CentralDark` que não estavam no GitHub | tip `d276f012` |
| commits locais conferidos | `C:\CentralDark` 9c96488e · `E:\CentralDark` 375558fd, 7d4fdaf5, fd91a39c · `E:\c\centraldark-main` f3b89a50 · `E:\c\centraldark-repo` b8504ba0 | todos buscáveis no GitHub |

Leitura do cofre: `README-PRESERVACAO.md` na raiz do ramo; `_MANIFESTO-DEDUP.tsv` diz o que foi cortado por já existir na `main` ou por ser cópia repetida; `SEGREDOS-REDIGIDOS.tsv` lista só caminho e tipo de cada valor trocado por `[REDIGIDO-PRESERVACAO]`.

## 🟡 Segunda varredura — pronta, **não publicada**

Achados que a primeira coleta não pegou (600 arquivos novos após dedup, ~7 mil já existiam):

- `E:\SITE SEGREDO` (projeto `GsmHub-Admin-Plus-master`, 309 arquivos)
- `%LOCALAPPDATA%\CentralDark` (receipts do Remote-Tray, ScheduledJobs, UnifiedRuntime — 24)
- `%LOCALAPPDATA%\hermes\pets`, `gateway-service`, `bot_relay` (110)
- `E:\c\Users\danda`, `E:\e\CentralDark`, `E:\root`, soltos de `E:\tmp` e `E:\tmp\claude-code-proxy`

A publicação automática foi **barrada pela trava de segurança contra vazamento de credencial** (há arquivos de pasta de usuário e de configuração de agentes). Os arquivos continuam no computador em `Documents\CD-PRESERVACAO-20260926\` (`casa-arquivos-4..7.zip`, `stage3..6`). Decisão do CHEFE: revisar e subir, ou descartar.

## 🔴 Fora de propósito (não vai para o GitHub)

- chaves, tokens, `.env`, `auth.json`, pastas `vault`/`mcp-tokens`, credenciais DPAPI → **morrem na formatação; recriar**
- bancos de conversa/estado do Hermes (`state.db`, `kanban.db`, `projects.db`, `sessions`)
- gravações do Screenpipe (tela e áudio)
- `%LOCALAPPDATA%\hermes\hermes-agent` → código de terceiro (NousResearch), limpo, reinstalável
- cópias inteiras do repositório (`E:\CentralDark\CentralDark|full|clean`, `E:\tmp\centraldark-main`, `E:\tmp\centraldark-pr-1416`, worktrees) → já no histórico do GitHub
- `GARIMPO-CHEFE`, `05-DEVEDORES-CONTATOS` (dados de terceiros), zips, instaladores, `node_modules`, caches
- o painel **Instinto Superior** vive no Lovable (projeto `Central Dark Instinct`, `49f92031-…`, publicado) — não depende do computador

## 🔑 A recriar depois de formatar (só nomes, nunca valores)

Chaves dos provedores de modelo (Anthropic, OpenAI, Gemini, OpenRouter e demais usadas no Hermes) · token do bot do Telegram · acesso ao GitHub (`gh auth login`) · Supabase · login OAuth da ponte (`CentralDarkBridge` → refazer, a chave volta protegida pelo Windows).

## ♻️ Restaurar a Casa (máquina zerada)

1. Instalar: Git, Node LTS, Python 3.13, PowerShell 7, Go, GitHub CLI, Claude Desktop, Desktop Commander, Screenpipe.
2. `gh auth login` → `git clone https://github.com/ServerVpss/CentralDark E:\CentralDark`
3. Cofre: `git -C E:\CentralDark fetch origin preservacao/casa-arquivos-20260926` e `git -C E:\CentralDark worktree add E:\CentralDark-cofre preservacao/casa-arquivos-20260926`
4. Hermes: instalar o Hermes; copiar `E:\CentralDark-cofre\hermes-profile\*` para `%LOCALAPPDATA%\hermes\` (SOUL, profile, config, memórias, skills, cron).
5. Recriar as chaves (lista acima) fora do repositório.
6. Ponte: construir a partir de `E-CentralDark/CentralDark-Unified-OneShot` do cofre (`BUILD.ps1`) e `scripts/remote-bridge/` da `main`; um usuário do Windows só (acabar com a mistura `danda` × `Administrador`).
7. Rodar a missão da ponte (provas P1–P10 em `docs/HANDOFF/2026-09-11-centraldark-unified-oneshot-bridge-exe-remediacao.md`).
8. Absorver o ouro do cofre nos donos existentes da `main`, aos poucos, sem V2.

## 🧪 Estado

```text
MAIN_CANONICA=PASS (clone novo)
COFRE_1_NO_GITHUB=PASS (71.235 arquivos, 0 chave real)
COMMITS_LOCAIS_NO_GITHUB=PASS (6 pontas conferidas)
COFRE_2_SEGUNDA_VARREDURA=PRONTO_LOCAL_NAO_PUBLICADO
SEGREDOS_NO_GITHUB=0_ACHADOS_POR_PADRAO (padrão desconhecido = UNKNOWN)
PODE_FORMATAR=DECISAO_DO_CHEFE apos resolver COFRE_2
```
