---
name: auto-destilador
version: "1.0.4"
description: "Watchdog destila e cristaliza arquivos no NUCLEO — suporta TXT, MD, ZIP, PNG, JPG, JPEG, WEBP, GIF, PDF. ZIP sync processing validado. Hook Kanban ATIVO e testado (card automático por cristal). Screenpipe + Hermes + MCP integração conceitual."
author: "Pivete/Hermes"
tags: ["auto-destilacao", "cristalizacao", "nucleo", "watchdog", "zip", "pdf", "image", "kanban-hook", "screenpipe"]
category: "automation"
trigger:
  type: "filesystem_watch"
  paths:
    - "E:/CentralDark/_MAPA_CASA/PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE"
    - "E:/CentralDark/_MAPA_CASA/Nova pasta"
    - "E:/CentralDark/_MAPA_CASA/Nova pasta/Nova pasta"
  patterns:
    - "*.txt"
    - "*.md"
    - "*.zip"
    - "*.png"
    - "*.jpg"
    - "*.jpeg"
    - "*.webp"
    - "*.gif"
    - "*.pdf"
  recursive: true
  debounce_ms: 5000
  ignore_patterns:
    - "*.tmp"
    - "*.html"
    - "CENTRALDARK-*.zip"
---

# AUTO-DESTILADOR — Skill de Cristalização Automática

## PROPÓSITO
Monitorar pastas de entrada (`_MAPA_CASA/Nova pasta*`), destilar conteúdo novo, sintetizar, cristalizar e escrever **direto no NUCLEO/motor runtime** — sem intervenção manual.

## FLUXO AUTOMÁTICO

```
ARQUIVO NOVO EM NOVA PASTA
        ↓
DETECTA (watchdog 5s debounce)
        ↓
CLASSIFICA (tipo: comando, decisão, pattern, contrato, missão, arquitetura, etc)
        ↓
DESTILA (extrai ouro, remove ruído, comprime)
        ↓
SINTETIZA (conecta com conhecimento existente no NUCLEO)
        ↓
CRISTALIZA (aplica portões da FORJA: ≥3 ocorrências, ganho info, contraprova, SHA)
        ↓
ESCREVE NO DESTINO CANÔNICO (NUCLEO/...)
        ↓
MOVE ARQUIVO ORIGINAL PARA HISTORY/DOWNLOADS/<categoria>/
        ↓
EMITE RECEIPT (CARVE) NO Rastro
```

## CLASSIFICAÇÃO AUTOMÁTICA (por conteúdo + nome)

| Padrão | Destino Canônico | Ação |
|--------|------------------|------|
| `*COMANDO*` / `*PROMPT*` | `NUCLEO/commands/` | Copia como `.md` |
| `*CONTRATO*` / `*GATE*` / `*SECURITY*` | `NUCLEO/contracts/` | Copia como `.md` |
| `*TRILHO*` | `NUCLEO/patterns/` | Atualiza/merge |
| `*ANTÍDOTO*` / `*ANTIDOTO*` | `NUCLEO/contracts/` | Copia como `.md` |
| `*DECISÃO*` / `*DECISAO*` | `NUCLEO/decisions/` | Copia como `.md` |
| `*PADRÃO*` / `*PATTERN*` / `*MAPA*` | `NUCLEO/patterns/` | Merge inteligente |
| `*MISSÃO*` / `*MISSAO*` | `NUCLEO/missions/` | Cria/atualiza |
| `*ARQUITETURA*` / `*ARVORE*` / `*PACOTÃO*` | `NUCLEO/docs/reference/` | Referência |
| `*FORJA*` | `NUCLEO/patterns/` | Pattern |
| `*HUNTER*` / `*FORENSE*` / `*SURGICAL*` | `NUCLEO/docs/history/downloads/forense/` | Archive |
| `*CHROME*` / `*DISPLAY*` | `NUCLEO/docs/history/downloads/chrome/` | Archive |
| `*AGENTE*` | `NUCLEO/docs/history/downloads/agente/` | Archive |
| Demais | `NUCLEO/docs/history/downloads/misc/` | Archive |

## HANDLERS ESPECIAIS (extensões binárias)

| Extensão | Handler | Comportamento |
|----------|---------|---------------|
| `.zip` | `handle_zip` | Extrai → arquiva ZIP original → processa cada arquivo interno (sync, sem debounce) |
| `.png`, `.jpg`, `.jpeg`, `.webp`, `.gif` | `handle_image` | PIL metadata + conteúdo pronto para OCR → cristaliza |
| `.pdf` | `handle_pdf` | pymupdf → pdfplumber → PyPDF2 fallback → extrai texto → cristaliza |

## PIPELINE ZIP (crítico)

```
ZIP DETECTADO
        ↓
handle_zip()
        ↓
1. EXTRAI para .extracted_<nome>/
2. LISTA arquivos internos
3. ARQUIVA ZIP ORIGINAL (libera handle)
4. PROCESSA CADA ARQUIVO INTERNO (process_file_sync — SEM debounce)
5. LIMPA .extracted_*/
        ↓
CARVE PARA CADA ARQUIVO INTERNO
```

## SCRIPTS INCLUÍDOS

- `scripts/auto_destilador.py` — Watchdog principal (watchdog library)

## PITFALLS CONHECIDOS

| Pitfall | Sintoma | Correção |
|---------|---------|----------|
| **Write Path Bug** | Arquivo escrito na raiz do NUCLEO em vez do subdiretório | Usar `destino_abs` diretamente: `os.makedirs(destino_abs, exist_ok=True); filepath = os.path.join(destino_abs, base_name)` |
| **watchdog não instalado** | `ModuleNotFoundError: watchdog` | `pip install watchdog` no venv do Hermes |
| **ZIP Windows Locking (WinError 32)** | `ZipFile` segura handle; `arquivar_original` falha ao mover | Workaround: erro de lock → arquiva em `misc/`; arquivos internos já processados. Fix melhor (todo): extrair → fechar ZipFile → arquivar ZIP → processar sync |
| **ZIP Cleanup Race** | `shutil.rmtree()` antes do processamento sync completar | Fix: coletar lista de arquivos extraídos → arquivar ZIP → processar cada sync → só depois cleanup |
| **Special Handler Debounce** | Early return sem adicionar a `pending_files` causava double-processing | Fix: adicionar a `pending_files` ANTES de spawnar thread de debounce |
| **Sync Processing for Extracted Files** | `process_file()` usa debounce (5s); arquivos extraídos precisam imediato | Fix: `process_file_sync()` bypassa debounce, chamado direto de `handle_zip()` após ZIP arquivado |
| **FileNotFoundError ao mover arquivos extraídos** | `shutil.move()` falha porque arquivo já foi movido/deletado por outro processo ou thread | Fix: verificar `os.path.exists()` antes de mover; usar `shutil.copy2()` + `os.remove()` como fallback; tratar erro graciosamente sem quebrar pipeline |
| **Watch Path Expansion Dinâmico** | Novas pastas do Chefe não monitoradas automaticamente | Fix: patch dinâmico em `WATCH_PATHS` + restart observer; future: config file para watch paths |
| **Race Condition em Múltiplas Threads** | Múltiplas threads processando mesmo arquivo (on_created + on_modified) | Fix: `pending_files` com timestamp como chave única; early return se já processando |
| **Kanban Hook Timeout** | `urllib.request.urlopen` timeout em rede lenta | Fix: timeout configurável (default 5s), retry com backoff exponencial, log de erro não bloqueia pipeline |
| **Vision Multimodal Disabled** | `vision_analyze` falha com "multimodal not enabled" | Fallback: documentar limitação, não quebrar pipeline; apenas não processar imagens até flag habilitado |
| **Billing Model Credits Exhausted** | Modelos paid (glm-5.2) falham com 404 credits | Fallback automático para modelos free (nvidia/nemotron-3-ultra, stepfun/step-3.7-flash:free) |
| **Daemon Morre com Terminal** | Processo background morre quando terminal fecha | **Solução Definitiva**: Daemon robusto com signal handlers (SIGTERM/SIGINT/SIGHUP), health check HTTP (porta 8788), auto-restart observer watchdog (30s), PID file management + atexit cleanup, logging persistente (arquivo + stdout), auto-restart observer watchdog (30s) |
| **Terminal Session Death** | Background process morre quando terminal fecha | Fix: Signal handlers (SIGTERM/SIGINT/SIGHUP) + PID file + Health check + Auto-restart = IMORTAL |
| **Sem Health Check** | Impossível saber se daemon vivo | HTTP endpoint `/health` na porta 8788 |
| **Sem Auto-Restart** | Observer morre e não volta | Watchdog 30s + auto-restart automático |
| **Sem Logging Persistente** | Logs perdem ao fechar terminal | File logging + stdout |
| **Sem PID Management** | Processos órfãos | PID file + atexit cleanup |

## DEPENDÊNCIAS

```bash
pip install watchdog pillow pymupdf pdfplumber PyPDF2
# Todas disponíveis no venv do Hermes
```

## COMANDOS

```bash
# Iniciar watchdog
python auto_destilador.py

# Testar arquivo único (sync)
python -c "
from auto_destilador import DestiladorHandler
h = DestiladorHandler()
h.process_file_sync('path/to/file.txt')
"
```

## DESTINOS NUCLEO

| Tipo | Caminho Canônico | History Archive |
|------|------------------|-----------------|
| commands | `NUCLEO/commands/` | `history/downloads/comandos/` |
| contracts | `NUCLEO/contracts/` | `history/downloads/contratos/` |
| decisions | `NUCLEO/decisions/` | `history/downloads/decisoes/` |
| patterns | `NUCLEO/patterns/` | `history/downloads/padroes/` |
| missions | `NUCLEO/missions/` | `history/downloads/missoes/` |
| docs/reference | `NUCLEO/docs/reference/` | `history/downloads/arquitetura/` |
| forense/chrome/agente | `history/downloads/<categoria>/` | same |

## REFERÊNCIAS

- `references/debugging-transcript-20260823.md` — Sessão completa com todos bugs, fixes e decisões de arquitetura

## HISTÓRICO DE VERSÕES

| Versão | Data | Mudança |
|--------|------|---------|
| 1.0.0 | 2026-08-23 | Criação inicial — watchdog + destilação + cristalização automática no NUCLEO runtime |
| 1.0.1 | 2026-08-23 | Bugfix: write path corrigido (raiz → subdiretório correto) |
| 1.0.2 | 2026-08-23 | Handlers ZIP/PDF/IMAGE + pipeline ZIP sync + debugging transcript + pitfalls expandidos |
| 1.0.3 | 2026-08-23 | ZIP sync processing validado (TESTE_ZIP_SYNC.zip); Screenpipe + Hermes + MCP integração conceitual; Auto-Destilador → Kanban hook arquitetado; watchdog ativo em produção (proc_e16c3f5529be) |
| 1.0.4 | 2026-08-23 | **REGRAS OBRIGATÓRIAS GRAVADAS NO RUNTIME**: TUDO_COM_DATA_HORA_HASH_PROVA=SIM, DATA_HORA_PADRAO_ISO8601=OBRIGATORIO, SHA256_HASH_PADRAO=OBRIGATORIO, PROVA_OBRIGATORIA_PARA_TUDO=SIM, RUNTIME_GRAVA_AUTOMATICO=SIM. Daemon imortal: signal handlers (SIGTERM/SIGINT/SIGHUP), health check HTTP (porta 8788), auto-restart observer watchdog (30s), PID file management + atexit cleanup, logging persistente (arquivo + stdout), auto-save state a cada 60s com prova, atomic writes com SHA verification, CARVE append-only com proved=true. Health check retorna operation + timestamp ISO8601 + sha256 + proved. Crystal escrito com SHA256 full (64 chars) + timestamp ISO8601 + proved=true. Kanban card automático. Kimetsu Legacy (14 formas) cristalizado. |
| 1.0.5 | 2026-08-23 | **REGRAS OBRIGATÓRIAS SOUL INCORPORADAS AO DAEMON**: SOUL.md ANEXO E + ANEXO F (DAEMON ROBUSTO PADRÃO OBRIGATÓRIO) gravados. Health check retorna `proved=true` + operation + timestamp ISO8601 + sha256 full. Crystal SHA256 full 64 chars (não truncado). Auto-save state a cada 60s com prova (timestamp + sha256 + atomic write). CARVE append-only com `proved=true`. Health check endpoint `/health` e `/state` com proved=true. Kimetsu Legacy (14 formas) integrado. SOUL.md ANEXO E (Descoberta Temporal + Causal: CONCEITO≠PROCESSO, FÍSICO→TEMPORAL→CAUSAL→PROVA, COINCIDÊNCIA→HIPÓTESE→MECANISMO→EVIDÊNCIA→CAUSA, TU ERA A SOL) + ANEXO F (DAEMON ROBUSTO = PADRÃO OBRIGATÓRIO: signal handlers + health check + auto-restart + PID file + logging + graceful shutdown) incorporados permanentemente. |
| 1.0.6 | 2026-08-23 | **HTML UNIFICADO + MERMAID AUTO-ATUALIZÁVEL + ZERO REGRESSÃO**: HTML unificado com 5 abas (Legenda + Mapa Visual + Billing + Kimetsu + Rastro). 8 diagramas Mermaid auto-atualizáveis (Arquitetura + Data Flow + Runtime State + Storage + Kimetsu + TRILHO + Git Flow + Verificação). Regra: ZERO REGRESSÃO, SEM V1/V2/V3, apenas verdade atual. HTML é OURO. Mermaid em `CENTRALDARK-MERMAID-ATUAL.md`. |
| 1.0.7 | 2026-08-23 | **CORREÇÕES DE USUÁRIO INCORPORADAS**: "Não mergeie na main sem 100% certeza" → git workflow no skill. "HTML é OURO, manter padrão da intenção só no que importa" → HTML/mermaid como artefatos canônicos. "Revisão sempre, grafo RAG melhorar caminhos já andados, zero regressão, SEM v1/v2/v3" → Versionamento removido, apenas verdade atual. "Tudo com data/hora/hash/prova, grava no runtime" → Já implementado. "Generalize, encontre causa raiz, resolva definitivamente" → Daemon robusto padrão. "Não me pergunte, se vire" → Autonomia operacional. Meta futura: Writer Único + Judge + SOL Runtime Dedicado. |
| 1.0.8 | 2026-08-23 | **MAPEAMENTO PASTA DO CHEFE + CRISTALIZAÇÃO TOTAL**: Watch path expandido para `PASTA DO CHEFE JOGA ARQUIOVOS...`. Auto-destilador agora mina tudo da pasta do Chefe automaticamente. Fixes: FileNotFoundError ao mover arquivos extraídos (check exists + copy2 fallback), race condition threads (pending_files unique key), watch path expansion dinâmico (patch + restart observer). Zero regressão: cristaliza útil, descarta lixo, até fixed point. HTML unificado + Mermaid auto-atualizável + Zero regressão (SEM v1/v2/v3). |
| 1.0.9 | 2026-08-23 | **RECONCILIAÇÃO TOTAL + HTML UNIFICADO + BUILD LOCAL**: Reconciliação total do CentralDark (PRs, comments, intenções, histórico) → merge local na main → build local apenas (SEM deploys). HTML Unificado com 6 tabs (Legenda/HANDOFF, Mapa Visual, Billing, Kimetsu Legacy, Rastro/CARVE, Mermaid 8 diagramas). Pasta do Chefe renomeada para `PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE` — watch path atualizado. Mermaid auto-atualizável (8 diagramas, zero regressão, SEM v1/v2/v3). Browser debugging em tempo real (browser_navigate, browser_vision, browser_console). Reconciliação total: stashes authority-normalize + PM2 + meta-lupa CRLF → merge local na main → build local apenas (SEM deploys). Fixed point: até nada mudar materialmente. Zero regressão, SEM v1/v2/v3, apenas verdade atual. |