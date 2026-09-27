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

## ✅ Segunda varredura — 43 arquivos CentralDark no cofre

Publicados no ramo `preservacao/casa-arquivos-20260926`, tip `d3f093a7` (tip remoto = commit local ⇒ conteúdo idêntico):
estado e receipts da ponte (`UnifiedRuntime`, `Remote-Tray`, `ScheduledJobs`), pets `hermes-centraldark*`, `gateway-service`, `bot_relay`, `E:\e\CentralDark`, `E:\root\CentralDark\logs`.
Revisão manual: 0 token/senha/bearer (event logs são só estado/fase).
**Excluídos:** 2 `profiles\{Segredo,Fulano}\auth\mcp-admin-session.json` (sessão = credencial; refazer login).

**Fora do escopo, descartado (correção do CHEFE):** `E:\SITE SEGREDO` (GsmHub), `claude-code-proxy`, soltos de `E:\tmp`, configurações de outros agentes. A pasta `danda` ficou com a frente SOL (seção abaixo).

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
COFRE_2_ESCOPO_CENTRALDARK=43_PUBLICADOS (tip d3f093a7; 2 sessoes excluidas)
ESCOPO_EXPANDIDO_INDEVIDAMENTE=CORRIGIDO
SEGREDOS_NO_GITHUB=0_ACHADOS_POR_PADRAO (padrão desconhecido = UNKNOWN)
PODE_FORMATAR=PASS_LADO_CLAUDE (cofre 1 + cofre 2 + commits locais + main); lado Danda ver frente SOL
```


## 🟣 Frente SOL — arqueologia Danda recuperada antes da formatação

Fonte: histórico de tool calls fornecido pelo CHEFE nesta sessão. **É evidência histórica observada, não medição CURRENT da Casa**, porque o dispositivo SEGREDO está offline no Remote Desktop Commander na revalidação atual.

O histórico prova que a frente Danda já executou uma cristalização local em `E:\CentralDark\_RECONCILIATION` com:

```text
CRYSTAL_ITEMS=13
CRYSTAL_BYTES=49957
CRISTAL_NOVO=7
DELTA_UTIL=6
JA_NO_GITHUB_VERIFIED=4
ANTI_SECRET_CRYSTAL=PASS_0_HITS
REHASH=PASS_13_SOURCE_UNCHANGED_AND_CRYSTAL_MATCH
PRIVATE_FILES_COPIED=0
GGUF_COPIED=false
JAN_MODELS_FINGERPRINTED=3
FINAL_COUNTERPROOF=UNKNOWN_BRANCH_CURRENT_BASE_BLOCKED
```

Itens cristalizados/reconciliados nessa frente:

1. `%LOCALAPPDATA%\hermes\SOUL.md` → preservar delta útil no owner SOUL/HERMES existente, sem nova SOUL.
2. `%USERPROFILE%\.centraldark\MAPA-MONITORES-CHEFE.json` → binding físico da Casa.
3. `%USERPROFILE%\.hermes\scripts\cadeia-free-watchdog.ps1` → bindings 8099/8788/3030; reconciliar com fixed-point-fabric/Screenpipe.
4. `%USERPROFILE%\.hermes\scripts\webui-watchdog.ps1` → recuperação local do WebUI 8788; absorver binding no owner existente.
5. `%LOCALAPPDATA%\CentralDark\UnifiedRuntime\active-profile.txt` → estado local/transitório do seletor de perfil; registro histórico, não ouro por si só.
6. `%LOCALAPPDATA%\CentralDark\UnifiedRuntime\profiles.json` → configuração operacional local de perfis; registro histórico, não autoridade arquitetural.
7. `UnifiedRuntime\tools\LogCollector\COLLECT-CENTRALDARK-LOGS.ps1` → coletor local candidato a absorção.
8. `UnifiedRuntime\tools\LogCollector\RUN-COLLECTOR.cmd` → launcher do coletor.
9. `Jan-v3.5-4B-Q4_K_XL\model.yml` → configuração/fingerprint de modelo local.
10. `Jan-code-4b-Q4_K_M\model.yml` → configuração/fingerprint de modelo local.
11. `sentence-transformer-mini\model.yml` → configuração/fingerprint de embedding local.
12. `JAN_MODELS_DANDA_RAW.jsonl` → manifesto de hash/tamanho dos três modelos; sem copiar ~GB de GGUF.
13. `hermes\config.sanitized.yaml` → configuração Hermes sanitizada; paths normalizados e valores sensíveis recriados localmente.

Observação histórica do runtime local:

```text
HERMES_LOCAL_ACTIVE=default
HERMES_DESKTOP_ACTIVE=pivete
UNIFIED_RUNTIME_ACTIVE=Fulanoo
UNIFIED_RUNTIME_DECLARED_PROFILES=Segredo,Fulano
STATUS=HISTORICAL_RUNTIME_OBSERVATION
PROFILE_IS_A_VIEW_NOT_A_GOVERNMENT=true
PROFILE_SELECTOR_IS_LOCAL_TRANSIENT_DETAIL=true
PROFILE_SELECTOR_IS_NOT_AUTHORITY=true
PROFILE_SELECTOR_IS_NOT_RESTORE_SOURCE=true
PROFILE_SELECTOR_MUST_NOT_DRIVE_ARCHITECTURE_INFERENCE=true
```

Também foi observado:

```text
PRIOR_OURO_EXACT_HASH_MATCHES=0
PRIOR_SNAPSHOT_EXACT_HASH_MATCHES=0
GITHUB_WRITE_PERFORMED=false
GITHUB_PUSH_PERFORMED=false
```

Ou seja: **o conhecimento da triagem Danda está agora registrado remotamente neste receipt**, mas os 13 artefatos locais ainda não estão comprovados como publicados byte-a-byte no GitHub.

### Gate restante para liberar formatação

```text
CASA_REMOTE_CHANNEL=OFFLINE_CURRENT
DANDA_CRYSTAL_KNOWLEDGE_REMOTE=PASS_BY_THIS_RECEIPT
DANDA_CRYSTAL_BYTES_REMOTE=UNKNOWN
DANDA_13_LOCAL_ARTIFACTS_REMOTE=PASS (ramo preservacao/casa-danda-arqueologia-20260926, tip 18cac68e, conferido por ls-remote)
```

Quando a Casa voltar online: ler `MANIFESTO_CRISTAL_DANDA.jsonl` + `ARQUEOLOGIA_DANDA_RECEIPT.json`, rehash, publicar apenas os 13 artefatos sanitizados/únicos em cofre/owner apropriado e fazer read-back remoto. Só então zerar a pendência Danda.

## 🧭 Regras do CHEFE fixadas nesta sessão (para qualquer motor que chegar depois)

```text
CHEFE_DECIDE_O_QUE_IMPORTA=true
EXECUTA → CONFERE → REGISTRA → SEGUE (menos pergunta, mais execução e prova)
TRAZ_SOLUCAO_NAO_PROBLEMA=true
ESCOPO=SO_CENTRALDARK (não varrer pasta/projeto que não é CentralDark)
CHAVE=DESCARTAVEL → guardar ONDE mora + NOME, nunca valor; re-derivar após reset (docs/MAPEAMENTO-ENV.md)
ESCRITA=DIRETO_NA_MAIN; CI só quando o CHEFE mandar endurecer
NAO_FAZER_O_CHEFE_REEXPLICAR=true (ler este receipt + MAPEAMENTO-ENV antes de agir na Casa)
```

Próximo cursor: Casa formatada → seguir "Restaurar a Casa" acima → montar Golden Capsule
(VMware + Linux + Docker + Hermes + IA local, Obsidian ↔ GitHub, MCP CentralDark com as duas rotas, painel admin local com acesso remoto).
O documento `CENTRALDARK_MATRIZ_BIDIRECIONAL_GOLDEN_CAPSULE_01.md` foi gerado no ChatGPT e ainda precisa entrar na main.


## 🟡 Golden Capsule cristalizada na main

Estado observado em 2026-09-26:

```text
GOLDEN_CAPSULE_DOC=PASS
ROUTE_MATRIX_DOC=PASS
CHEFE_AUTHORITY_CONTRACT=PASS
MAIN_COMMIT=b16dc982c66b874fba0ba66394591c6d59a3aec7
OWNER_PATH=docs/ARQUITETURA/CENTRALDARK-INSTINTO-SUPERIOR-OS/CENTRALDARK-MATRIZ-BIDIRECIONAL-GOLDEN-CAPSULE.md
```

O documento consolida no mesmo owner já existente de Instinto Superior / OS:

- Golden Capsule;
- matriz bidirecional de rotas;
- CentralDark MCP + rota direta Desktop Commander;
- Obsidian como memória viva;
- Git/GitHub como cristal externo;
- Hermes como executor local;
- IA local;
- restauração pós-formatação;
- autoridade operacional do CHEFE no domínio local;
- `ONE_SYSTEM_ONLY`, `ONE_WRITER_PER_SCOPE`, `CURRENT > HISTORY`, `UNKNOWN != PASS`.

Não cria um segundo núcleo nem um segundo owner de OS; é evolução do owner existente.
