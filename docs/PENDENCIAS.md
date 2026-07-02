# Pendências — CentralDark

Fonte ÚNICA de pendências do projeto. Qualquer item novo entra aqui.
Status: 🔴 alta · 🟡 média · 🟢 baixa · ✅ concluído

---

## 🟡 #1 — Migração centralldark.com + telepainel.centralldark.com
**Status:** em andamento (código pronto, falta executar na VPS)
**Sintoma:** site só responde pelo preview do Lovable; domínios próprios ainda não apontam.
**Como fechar:**
1. Apontar DNS dos 3 hostnames pro IP da VPS (`89.117.78.124`):
   - `centralldark.com` → A `89.117.78.124`
   - `www.centralldark.com` → A `89.117.78.124`
   - `telepainel.centralldark.com` → A `89.117.78.124`
2. Na VPS rodar `bash install.sh setup_centraldark_portal` (cria pastas, clona, builda).
3. Confirmar comigo pra eu editar o Caddyfile (regra: Caddy não muda sem OK).
4. `curl -I https://centralldark.com` e `curl -I https://telepainel.centralldark.com/dashboard` devem retornar `200`.
5. Atualizar este item pra ✅ com a data.

Detalhes técnicos: `docs/INSTALADOR/13-centraldark-portal.md`.

---

## ✅ #2 — Reestruturação do repo no padrão VPS (concluído 2026-06-20)
**O que foi feito:** `src/` reorganizado pra espelhar `/root/CentralDark/apps/`.
Páginas e componentes do TelePainel movidos pra `src/apps/modulos/telepainel/`,
landings dos outros módulos pra `src/apps/modulos/{bot-whatsapp,crm,financeiro}/`,
portal público pra `src/apps/web/`, código compartilhado pra `src/shared/`.
READMEs criados em cada módulo + `INSTALACAO.md` na raiz com mapa de migração.
**Exceção mantida:** `src/integrations/` ficou no lugar (regra Lovable: auto-gerado).

---

## 🟡 #3 — bot-whatsapp, crm, financeiro são só landing
**Sintoma:** os três módulos têm página pública bonita, mas zero produto por trás.
**Como fechar:** definir escopo de cada um, modelar tabelas, implementar.
Cada módulo tem seu README com a lista do que falta.

---

## 🟢 #4 — Arquitetura CentralDark 2026 — Versão Consolidada (Cloud + API pra IAs externas)
**Status:** adiado / expansão futura (complexo demais pra agora)
**Data de registro:** 25/06/2026
**Pedido original:** consolidar a arquitetura num doc único oficial, gravar nas 3 camadas do cérebro (repo `cerebro/`, `mem://`, e Cloud Supabase) e expor via edge function pública pra qualquer IA externa (Claude, Grok, Jarvis) ler/atualizar.

**Por que ficou pendente:** envolve criar tabela nova (`cerebro_memoria` + `cerebro_memoria_log`), RLS + GRANTs, 2 edge functions (`get-cerebro` público e `update-cerebro` admin), trigger de log automático, popular 6 seções, espelhar nos 3 mirrors da Sincronia 4-Point e atualizar `mem://index.md`. Hoje é overkill — o `cerebro/` no GitHub + `.claude/prompts/reload-centraldark-v3.md` já cobrem o caso de uso.

**Escopo das 6 seções previstas:**
1. Visão Geral 2026 (diagrama do fluxo Usuário → IA → Ferramentas/Memória/Notion/VPS)
2. Ferramentas Cognitivas (tabela conceitual ↔ real Lovable, já existe em `cerebro/ferramentas-cognitivas-e-comandos.md`)
3. Sistema de Memória Inteligente (protocolo detectar → comparar → atualizar → logar)
4. Comandos e Gatilhos (RELOAD V3, AUDITORIA DE MEMÓRIAS, Sincronia 4-Point, audit-rls, Swarm Mode, etc.)
5. Registro de Atualizações de Memória (log vivo lido da tabela `cerebro_memoria_log`)
6. Artefatos do Sistema (lista viva dos docs-chave)

**Como fechar quando reabrir:**
1. Confirmar com o usuário que vale a complexidade (vs. manter só em `cerebro/` no GitHub).
2. Rodar skill `audit-rls` antes de qualquer migration.
3. Criar migration `cerebro_memoria` + `cerebro_memoria_log` com RLS, GRANTs e trigger de log.
4. Deploy `get-cerebro` (público) e `update-cerebro` (JWT admin).
5. Popular 6 seções via `update-cerebro`.
6. Espelhar em `cerebro/arquitetura-centraldark-2026.md` e `/mnt/documents/`.
7. Atualizar `mem://index.md` com regra Core nova ("consultar `cerebro_memoria` antes de afirmar arquitetura").

**Por enquanto basta:** seguir usando `cerebro/` + `.claude/prompts/reload-centraldark-v3.md` + gatilho `RELOAD V3`.

---

## 🟡 #5 — Revisão de migração `docs/` do legado (`CentralDark1VPS` → `CentralDark`)

**Status:** mapeamento em andamento. Apenas pendências de revisão — nada migrado ainda.
**Data de registro:** 25/06/2026
**Contexto:** o repositório antigo `ServerVpss/CentralDark1VPS` continua de pé como servidor de operação ativa, mas tem 234 arquivos em `docs/` que nunca vieram pro principal. Esta pendência guarda o mapeamento completo, pasta por pasta, pra eu revisar com calma e só depois decidir o que entra.

**Legenda de status (por sub-pendência):**
- 🔴 **Não iniciado** — migração ainda nem começou, falta decisão
- 🟡 **Em progresso** — em revisão / parcialmente migrado
- ✅ **Concluído** — decisão tomada e aplicada (migrado, descartado ou arquivado)

**Resumo visual:**

| # | Pasta no legado | Arquivos | Status |
|---|---|---|---|
| 5.1 | `INSTALADOR/` | 23 | 🔴 Não iniciado |
| 5.2 | `tarefas/` | 33 | 🔴 Não iniciado |
| 5.3 | `WHATSAPP-API/` | 16 | 🔴 Não iniciado |
| 5.4 | `CONSCIENCIA/` | 45 (+3 ARQUIVO-MORTO) | 🟡 Em progresso (já sincronizada antes, reconciliar) |
| 5.5 | `RELATORIOS/` | 51 (33 + 12 + 1 + 5) | 🔴 Não iniciado |
| 5.6 | `INSTALADOR/backup/` | (binário/install.sh) | 🔴 Não iniciado |
| 5.7 | `AUDITORIAS/` | 4 | 🔴 Não iniciado |
| 5.8 | `BOTS/` | 3 | 🔴 Não iniciado |
| 5.9 | `SEGURANCA/` | 2 | 🔴 Não iniciado |
| 5.10 | `ARQUITETURA/` | 2 | 🔴 Não iniciado (atenção: principal tem `DESIGN-SISTEMA.md`, legado não) |
| 5.11 | `CODEX/` | 1 | 🔴 Não iniciado |
| 5.12 | `CONTINUIDADE/` | 4 | 🔴 Não iniciado |
| 5.13 | `DOMINIOS/` | 1 | 🔴 Não iniciado |
| 5.14 | `GATEWAY/` | 2 | 🔴 Não iniciado |
| 5.15 | `IA-TAREFAS/` | 2 | 🔴 Não iniciado |
| 5.16 | `agente/infra-recovery/` | 8 (3 + core/5) | 🔴 Não iniciado |
| 5.17 | `infra/vigia/` + `infra/webhook-deploy/` | 2 | 🔴 Não iniciado |
| 5.18 | `pendencias/` | 1 | 🔴 Não iniciado |
| 5.19 | `relatorios/` (minúsculo) | 1 | 🔴 Não iniciado |
| 5.20 | `sentinela/` | 2 | 🟡 Em progresso (principal já tem os mesmos 2 nomes) |
| 5.21 | `docs/` raiz (27 .md soltos) | 27 | 🔴 Não iniciado |



### 🔴 5.1 — Pasta `INSTALADOR/` (23 arquivos no legado · 2 no principal)

**Estado no principal hoje:** `docs/INSTALADOR/` só tem `13-centraldark-portal.md`, `14-sync-monorepo.md` e `backup/`. Todo o resto da numeração (00, 01–04, 08, 12, 15–24, 30) está faltando.

#### Pendência sugerida — Núcleo do instalador (00 → 04)
- **Título:** Migrar guias-base do instalador (como começar, arquitetura, dependências, portas, estrutura de pastas)
- **Descrição:** Documentação de entrada pra reinstalar o projeto numa VPS nova. É o "manual do zero".
- **Local no legado:** `docs/INSTALADOR/00-COMO-COMECAR.md`, `01-arquitetura.md`, `02-dependencias.md`, `03-portas-e-rede.md`, `04-estrutura-pastas.md`, `README.md`
- **Status atual no principal:** não existe
- **Sugestão:** Migrar
- **Justificativa:** sem isso, o `docs/INSTALADOR/` do principal fica órfão (só tem capítulos 13 e 14, sem 00–12).

#### Pendência sugerida — Webhooks, histórico e MCP (08, 12, 13, 14)
- **Título:** Migrar guias de webhook-deploy, decisões históricas, MCP e conexão de IA externa
- **Descrição:** Explicam como funciona o deploy via webhook, por que cada decisão foi tomada, como o MCP CentralDark funciona e como plugar uma IA externa nele.
- **Local no legado:** `docs/INSTALADOR/08-webhooks-e-deploy.md`, `12-historico-decisoes.md`, `13-mcp.md`, `14-conectar-ia-externa.md`
- **Status atual no principal:** não existe
- **Sugestão:** Revisar conteúdo e migrar
- **Justificativa:** parte pode estar duplicada com `docs/CONSCIENCIA/06-MCP-CENTRALDARK.md` e `WEBHOOK-DEPLOY-SEGURO.md`. Vale conferir antes de copiar bruto.

#### Pendência sugerida — Cloudflare e DNS (15, 16, 17)
- **Título:** Migrar guias de Cloudflare API, DNS e wildcard
- **Descrição:** Configuração de DNS dos domínios `centralldark.com` (relacionado à pendência #1).
- **Local no legado:** `docs/INSTALADOR/15-cloudflare-api.md`, `16-cloudflare-dns.md` (9.5KB, o maior do grupo), `17-dns-wildcard.md`
- **Status atual no principal:** não existe
- **Sugestão:** Migrar
- **Justificativa:** complementa diretamente a pendência #1 (migração dos domínios), que hoje está sem doc no principal.

#### Pendência sugerida — Acesso mobile, dependências auto, bootstrap (18–20)
- **Título:** Migrar guias de conexão pelo celular, auto-instalação de deps e bootstrap-URL
- **Local no legado:** `docs/INSTALADOR/18-conectar-pelo-celular.md`, `19-dependencias-auto.md`, `20-bootstrap-url.md`
- **Status atual no principal:** não existe
- **Sugestão:** Revisar conteúdo
- **Justificativa:** preciso confirmar se ainda condizem com a stack atual (Lovable Cloud) ou se viraram legado puro.

#### Pendência sugerida — UI, menu VPS, auto-update (21, 22, 23)
- **Título:** Migrar guias de UI all-in-one, menu de operação na VPS e auto-update
- **Local no legado:** `docs/INSTALADOR/21-ui-aio.md`, `22-menu-vps.md` (5.3KB), `23-auto-update.md`
- **Status atual no principal:** não existe; menu da VPS hoje vive em `scripts/menu/cdmenu.sh`
- **Sugestão:** Revisar conteúdo
- **Justificativa:** pode estar desatualizado em relação ao `scripts/menu/` atual. Vale comparar antes.

#### Pendência sugerida — Capítulo 24 (colisão de números) e 30
- **Título:** Resolver colisão dos três arquivos numerados `24-*` e migrar skill-consciencia
- **Descrição:** o legado tem **três** arquivos começando com `24-`: `24-api-docs.md`, `24-bot-server.md`, `24-mcp-status-design.md`. Indica que a numeração quebrou. Tem também `30-skill-consciencia.md`.
- **Local no legado:** `docs/INSTALADOR/24-api-docs.md`, `24-bot-server.md`, `24-mcp-status-design.md`, `30-skill-consciencia.md`
- **Status atual no principal:** não existe
- **Sugestão:** Revisar conteúdo (e renumerar na migração)
- **Justificativa:** se trouxer como está, fica confuso. Tem que decidir nova numeração antes de copiar.

### 🔴 5.2 — Pasta `tarefas/` (33 arquivos no legado · 0 no principal)

**Estado no principal hoje:** não existe `docs/tarefas/`.

#### Pendência sugerida — Sistema de tarefas (núcleo)
- **Título:** Avaliar se o sistema de tarefas com `monitor_tarefas.py` ainda faz sentido
- **Descrição:** scripts Python + Bash que monitoravam tarefas distribuídas pra IAs (abertas / em_andamento / concluidas / com_erro / resultados). Tem `monitor_tarefas.py` (10KB), `painel_netflix.sh` (3KB) e `scripts/ia-live-limpo.sh` (3.9KB).
- **Local no legado:** `docs/tarefas/monitor_tarefas.py`, `painel_netflix.sh`, `scripts/ia-live-limpo.sh`, `README.md`, `PLANO.md`, `ALLOWLIST-MCP-OK.md`
- **Status atual no principal:** não existe
- **Sugestão:** Revisar conteúdo (provavelmente descartar)
- **Justificativa:** o fluxo de multi-IA hoje vive em `docs/CONSCIENCIA/11-MULTI-IA-FLUXO.md` + `20-COLABORACAO-MULTI-IA.md` + `04-MULTI-IA-E-HANDOFF/`. Antes de descartar, conferir se algum script Python ainda roda em produção na VPS.

#### Pendência sugerida — Backup `.bak.20260606`
- **Título:** Descartar backup `monitor_tarefas.py.bak.20260606-235529`
- **Local no legado:** `docs/tarefas/monitor_tarefas.py.bak.20260606-235529` (6.8KB)
- **Status atual no principal:** não existe
- **Sugestão:** Provavelmente descartar
- **Justificativa:** snapshot de 1 dia antes do arquivo principal — sem valor histórico que justifique trazer.

#### Pendência sugerida — Tarefas concluídas + resultados (11 + 11 arquivos, jun/2026)
- **Título:** Revisar 11 pares "tarefa concluída + resultado" do início de junho/2026
- **Descrição:** auditorias e diagnósticos (estrutura VPS, workflows vermelhos, MCP DNS, MCP Grok, etc) com tarefas curtas (`concluidas/`) e os relatórios cheios (`resultados/`, alguns com 13KB).
- **Local no legado:** `docs/tarefas/concluidas/2026060*` e `docs/tarefas/resultados/2026060*`
- **Status atual no principal:** não existe; aprendizados podem ter sido absorvidos em `docs/CONSCIENCIA/APRENDIZADOS.md` ou `08-HISTORICO-DECISOES.md`
- **Sugestão:** Revisar conteúdo
- **Justificativa:** histórico de aprendizado tem valor — pode virar uma pasta `ARQUIVO-MORTO/tarefas-jun-2026/` no principal, ou ser sintetizado em 1 doc só, em vez de migrar os 22 arquivos crus.

#### Pendência sugerida — `.gitkeep` de subpastas
- **Título:** Descartar `.gitkeep` de `abertas/`, `em_andamento/`, `com_erro/`, `resultados/`, `concluidas/`
- **Sugestão:** Provavelmente descartar
- **Justificativa:** só fazem sentido se o sistema de tarefas voltar a rodar.

### 🔴 5.3 — Pasta `WHATSAPP-API/` (16 arquivos no legado · 0 no principal)

**Estado no principal hoje:** não existe `docs/WHATSAPP-API/`. O bot WhatsApp na VPS (PM2 id 1) está em estado `stopped` desejado.

#### Pendência sugerida — Documentação operacional das rotas WhatsApp
- **Título:** Decidir destino da documentação da WhatsApp API (rotas + roadmap)
- **Descrição:** 16 docs explicando rotas de chats, contacts, groups, avatares, histórico de mensagens, tempo real, domínio oficial e roadmap. Organizado em "LOTES" (LOTE-2 a LOTE-12) + capítulos por recurso.
- **Local no legado:** `docs/WHATSAPP-API/` inteiro (`README.md`, `06-chats.md`, `07-contacts.md`, `08-groups.md`, `15-official-domain.md`, `90-roadmap.md`, `LOTE-2-listChats.md` até `LOTE-12-tempo-real.md`)
- **Status atual no principal:** não existe
- **Sugestão:** Revisar conteúdo
- **Justificativa:** com o whatsapp-server parado por decisão (PM2 id 1 stopped), essa doc pode estar congelada como referência futura. Vale decidir se vira `docs/WHATSAPP-API/` no principal (com aviso "congelado") ou se vai inteiro pra `docs/CONSCIENCIA/ARQUIVO-MORTO/`. Em nenhum cenário deve sumir — é o único registro escrito do funcionamento dessas rotas.

---

### 🟡 5.4 — Pasta `CONSCIENCIA/` (45 arquivos + 3 em ARQUIVO-MORTO no legado · 45 no principal)

**Estado no principal hoje:** já existe `docs/CONSCIENCIA/` com praticamente os mesmos 45 nomes do legado — sincronização foi feita anteriormente. Falta só conferir se o conteúdo bate arquivo por arquivo e decidir o destino dos 3 da subpasta `ARQUIVO-MORTO/root-md-antigos/`.

#### Pendência sugerida — Reconciliar 45 arquivos do CONSCIENCIA
- **Título:** Conferir se cada um dos 45 .md do `CONSCIENCIA/` no principal está igual, mais novo ou mais velho que o do legado
- **Local no legado:** `docs/CONSCIENCIA/*.md` (raiz da pasta, 45 arquivos)
- **Status atual no principal:** mesmos nomes presentes
- **Sugestão:** Revisar conteúdo (sem migrar bruto)
- **Justificativa:** copiar por cima pode sobrescrever versão mais nova do principal. Conferir caso a caso e decidir manualmente.

#### Pendência sugerida — Arquivo morto `root-md-antigos`
- **Título:** Decidir se traz os 3 absorvidos antigos (CHECKPOINT, LEIA-ME-IA, START_HERE)
- **Local no legado:** `docs/CONSCIENCIA/ARQUIVO-MORTO/root-md-antigos/CHECKPOINT-2026-06-07.md`, `LEIA-ME-IA-absorvido.md`, `START_HERE-antigo.md`
- **Status atual no principal:** já existe a mesma pasta com os mesmos 3 arquivos
- **Sugestão:** Provavelmente já está migrado — só confirmar
- **Justificativa:** se os nomes batem, é duplicado puro. Conferir conteúdo de cada um.

---

### 🔴 5.5 — Pasta `RELATORIOS/` (51 arquivos no legado · 0 no principal)

**Estado no principal hoje:** não existe `docs/RELATORIOS/`. Tem só `docs/sentinela/` (que cobre uma parte).

#### Pendência sugerida — Relatórios soltos (33 .md históricos)
- **Título:** Decidir destino dos 33 relatórios datados de junho/2026 (auditorias, lovable-sync, builder-bolt, MCP, etc)
- **Local no legado:** `docs/RELATORIOS/2026-06-*.md` (33 arquivos, do dia 04 ao 24/jun)
- **Status atual no principal:** não existe
- **Sugestão:** Revisar conteúdo (provavelmente arquivo morto)
- **Justificativa:** são fotos do passado. Talvez vire `docs/CONSCIENCIA/ARQUIVO-MORTO/relatorios-jun-2026/` em vez de pasta nova.

#### Pendência sugerida — Subpasta `painel-vivo-validacao/` (12 arquivos)
- **Título:** Decidir destino dos 12 snapshots do painel-vivo
- **Local no legado:** `docs/RELATORIOS/painel-vivo-validacao/*.md`
- **Status atual no principal:** não existe (mas o workflow `painel-validacao.yml` está ativo no principal)
- **Sugestão:** Revisar — provavelmente manter o workflow gerando direto no principal e descartar histórico antigo
- **Justificativa:** snapshot velho não serve pra muita coisa quando a automação gera novos a toda hora.

#### Pendência sugerida — Subpasta `sentinela/` (.gitkeep)
- **Título:** Descartar `.gitkeep` solto
- **Local no legado:** `docs/RELATORIOS/sentinela/.gitkeep`
- **Sugestão:** Provavelmente descartar
- **Justificativa:** principal já tem `docs/sentinela/` com conteúdo real.

#### Pendência sugerida — Subpasta `supabase-bot/` (5 arquivos)
- **Título:** Decidir destino dos 5 relatórios do supabase-bot
- **Local no legado:** `docs/RELATORIOS/supabase-bot/*.md`
- **Status atual no principal:** não existe (workflow `supabase-bot.yml` está ativo)
- **Sugestão:** Revisar — manter só o último ou descartar histórico
- **Justificativa:** mesmo raciocínio do painel-vivo.

---

### 🔴 5.6 — `INSTALADOR/backup/` (no legado)

#### Pendência sugerida — Backup do install.sh
- **Título:** Decidir destino do backup antigo do instalador
- **Local no legado:** `docs/INSTALADOR/backup/` (no legado)
- **Status atual no principal:** já existe `docs/INSTALADOR/backup/` com `install.sh.GOLD-MASTER` e `README.md`
- **Sugestão:** Revisar — comparar os dois backups
- **Justificativa:** o principal já tem um "GOLD-MASTER". Se o do legado for o mesmo, é duplicado.

---

### 🔴 5.7 — Pasta `AUDITORIAS/` (4 arquivos no legado · 0 no principal)

#### Pendência sugerida — Migrar auditorias supabase + migração de espelho
- **Título:** Avaliar se as 4 auditorias de 05–06/jun ainda têm valor de consulta
- **Local no legado:** `docs/AUDITORIAS/2026-06-05-auditoria-supabase-contatos-schema.md`, `2026-06-05-dryrun-ligar-contatos-supabase.md`, `2026-06-05-supabase-management-mcp-projetos.md`, `2026-06-06-migracao-espelho-para-repo-fonte.md`
- **Status atual no principal:** não existe
- **Sugestão:** Revisar conteúdo
- **Justificativa:** a última (`migracao-espelho-para-repo-fonte`) pode ser exatamente o registro de quando o repo principal virou `CentralDark` — vale ouro pra contexto histórico.

---

### 🔴 5.8 — Pasta `BOTS/` (3 arquivos no legado · 0 no principal)

#### Pendência sugerida — Documentação do "time de bots"
- **Título:** Decidir se traz a doc de PROTOCOLO-REVISAO-HUMANA, README e TIME-DE-BOTS
- **Local no legado:** `docs/BOTS/PROTOCOLO-REVISAO-HUMANA.md`, `README.md`, `TIME-DE-BOTS.md`
- **Status atual no principal:** não existe (mas há `.github/workflows/bots-labels-seed.yml`, `dispatcher-bots.yml`, `github-bot-controller.yml` ativos)
- **Sugestão:** Migrar
- **Justificativa:** os bots estão rodando no principal sem doc. Trazer essa pasta dá contexto pros workflows que já existem.

---

### 🔴 5.9 — Pasta `SEGURANCA/` (2 arquivos no legado · 0 no principal)

#### Pendência sugerida — Checklist e padrão de segurança end-to-end
- **Título:** Migrar checklist do bot-server e padrão de segurança end-to-end
- **Local no legado:** `docs/SEGURANCA/CHECKLIST-BOT-SERVER.md`, `PADRAO-SEGURANCA-END-TO-END.md`
- **Status atual no principal:** não existe
- **Sugestão:** Migrar
- **Justificativa:** segurança não tem doc dedicada no principal hoje. Vale trazer.

---

### 🔴 5.10 — Pasta `ARQUITETURA/` (2 arquivos no legado · 1 no principal — diferente)

#### Pendência sugerida — Bot-server central + endpoints
- **Título:** Migrar docs de arquitetura do bot-server
- **Local no legado:** `docs/ARQUITETURA/BOT-SERVER-CENTRAL.md`, `BOT-SERVER-SERVICES-ENDPOINTS.md`
- **Status atual no principal:** pasta existe com `DESIGN-SISTEMA.md` (assunto diferente — só design visual)
- **Sugestão:** Migrar (somam, não conflitam)
- **Justificativa:** legado fala da arquitetura do bot-server, principal fala do design visual do sistema. Cabem juntos na mesma pasta.

---

### 🔴 5.11 — Pasta `CODEX/` (1 arquivo no legado · 0 no principal)

#### Pendência sugerida — Setup do Codex
- **Título:** Decidir destino do `CODEX/SETUP.md`
- **Local no legado:** `docs/CODEX/SETUP.md`
- **Status atual no principal:** não existe pasta `CODEX/`, mas `CONSCIENCIA/` já tem `CODEX-INTEGRADO.md`, `CODEX-REVISAO-PRS.md`, `TESTE-CODEX-TRIGGER-HANDLERS.md`
- **Sugestão:** Revisar conteúdo
- **Justificativa:** pode estar coberto pelas 3 docs Codex que já estão no CONSCIENCIA. Se for, descarta.

---

### 🔴 5.12 — Pasta `CONTINUIDADE/` (4 arquivos no legado · 0 no principal)

#### Pendência sugerida — Resumos de sessão Claude (22–23/jun)
- **Título:** Decidir destino dos resumos de sessão e do `proxima-ia.md`
- **Local no legado:** `docs/CONTINUIDADE/20260622-claude-resumo.md`, `20260622-claude-status-vigia-telegram.md`, `20260623-claude-resumo.md`, `proxima-ia.md`
- **Status atual no principal:** não existe
- **Sugestão:** Revisar — talvez sintetizar em 1 doc só dentro de `CONSCIENCIA/`
- **Justificativa:** resumos de sessão antigos viram peso morto rápido. O `proxima-ia.md` pode ter valor pra retomada — vale dar uma lida.

---

### 🔴 5.13 — Pasta `DOMINIOS/` (1 arquivo no legado · 0 no principal)

#### Pendência sugerida — API CentralDark (domínio oficial)
- **Título:** Migrar `API-CENTRALDARK.md`
- **Local no legado:** `docs/DOMINIOS/API-CENTRALDARK.md`
- **Status atual no principal:** não existe
- **Sugestão:** Revisar conteúdo
- **Justificativa:** se documenta o domínio `api.centralldark.com`, conecta direto com pendência #1 (migração de domínios).

---

### 🔴 5.14 — Pasta `GATEWAY/` (2 arquivos no legado · 0 no principal)

#### Pendência sugerida — Elite Gateway (endpoint público)
- **Título:** Migrar docs do Elite Gateway
- **Local no legado:** `docs/GATEWAY/ELITE_ENDPOINT_PUBLICO.md`, `README.md`
- **Status atual no principal:** não existe (mas tem memória `.lovable/memory/architecture/elite-gateway-endpoint-publico.md` e MCP `elite_gateway_*`)
- **Sugestão:** Migrar
- **Justificativa:** o gateway está em uso ativo via MCP. Doc no repo principal evita depender só da memória do Lovable.

---

### 🔴 5.15 — Pasta `IA-TAREFAS/` (2 arquivos no legado · 0 no principal)

#### Pendência sugerida — Handshake antigo + README
- **Título:** Decidir destino do handshake ChatGPT↔Grok de 06/jun
- **Local no legado:** `docs/IA-TAREFAS/README.md`, `docs/IA-TAREFAS/abertas/20260606-1915-chatgpt-handshake-grok.md`
- **Status atual no principal:** não existe
- **Sugestão:** Provavelmente descartar
- **Justificativa:** handshake pontual de teste, já cumpriu o papel. README pode ter regras úteis — conferir.

---

### 🔴 5.16 — Pasta `agente/infra-recovery/` (8 arquivos Python no legado · 0 no principal)

#### Pendência sugerida — Módulo Python de recuperação de infra
- **Título:** Decidir se traz o módulo Python completo (`infra_recovery.py`, `caddy_checker.py`, `pm2_manager.py`, `reporter.py`, `runner_manager.py`)
- **Local no legado:** `docs/agente/infra-recovery/` + `docs/agente/infra-recovery/core/`
- **Status atual no principal:** não existe
- **Sugestão:** Revisar conteúdo (e provavelmente mover pra fora de `docs/`)
- **Justificativa:** **isso é código Python, não documentação.** Se for usar, mover pra `scripts/agente/` ou `infra/agente/`. Se não roda mais, descartar. Não fica em `docs/`.

---

### 🔴 5.17 — `infra/vigia/` + `infra/webhook-deploy/` (2 READMEs no legado · 0 no principal)

#### Pendência sugerida — READMEs de vigia e webhook-deploy
- **Título:** Migrar READMEs do vigia e webhook-deploy
- **Local no legado:** `docs/infra/vigia/README.md`, `docs/infra/webhook-deploy/README.md`
- **Status atual no principal:** não existe em `docs/`, mas tem `scripts/vigia/` e `scripts/webhook/` com código ativo
- **Sugestão:** Migrar (de preferência pra dentro de `scripts/vigia/README.md` e `scripts/webhook/README.md`)
- **Justificativa:** README anda junto do código. Faz mais sentido lá do que em `docs/infra/`.

---

### 🔴 5.18 — Pasta `pendencias/` (1 arquivo no legado · 0 no principal)

#### Pendência sugerida — Secret vault future
- **Título:** Decidir destino de `secret-vault-future.md`
- **Local no legado:** `docs/pendencias/secret-vault-future.md`
- **Status atual no principal:** não existe (e este `PENDENCIAS.md` é a fonte única hoje)
- **Sugestão:** Revisar e absorver aqui no `PENDENCIAS.md` como item novo
- **Justificativa:** se ainda é pendência válida, vira item no `PENDENCIAS.md`. Pasta solta não deve existir.

---

### 🔴 5.19 — Pasta `relatorios/` minúsculo (1 arquivo no legado · 0 no principal)

#### Pendência sugerida — Regras de relatórios
- **Título:** Migrar `REGRAS_RELATORIOS.md`
- **Local no legado:** `docs/relatorios/REGRAS_RELATORIOS.md`
- **Status atual no principal:** não existe
- **Sugestão:** Migrar
- **Justificativa:** define o padrão de como relatórios devem ser escritos. Útil se os bots de painel/sentinela ainda geram relatórios.

---

### 🟡 5.20 — Pasta `sentinela/` (2 arquivos no legado · 2 no principal — mesmos nomes)

#### Pendência sugerida — Reconciliar last-report e last-snapshot
- **Título:** Conferir se `last-report.md` e `last-snapshot.json` do legado são mais recentes que os do principal
- **Local no legado:** `docs/sentinela/last-report.md`, `last-snapshot.json`
- **Status atual no principal:** existem com os mesmos nomes (`docs/sentinela/last-report.md`, `last-snapshot.json`)
- **Sugestão:** Provavelmente já está sincronizado — só confirmar
- **Justificativa:** o workflow `sentinela-divergencias.yml` está no principal e gera esses arquivos. Pode ser que o do legado esteja desatualizado.

---

### 🔴 5.21 — `docs/` raiz do legado (27 .md soltos · 7 no principal — todos diferentes)

**Estado no principal hoje:** raiz tem só 7 .md (`BOT_COMMANDS`, `CONSOLIDACAO-*`, `CRON_JOBS_SETUP`, `EDGE_FUNCTIONS`, `PENDENCIAS`, `README`). Os 27 do legado têm assuntos completamente diferentes.

#### Pendência sugerida — Grupo 1: docs operacionais ainda úteis
- **Título:** Avaliar e migrar docs vivos
- **Local no legado:** `AGENTS.md`, `AI_AUTONOMY_CURRENT_STATUS.md`, `STATE.md`, `STATUS_ATUAL_DO_PROJETO.md`, `NEXT_SESSION_PROMPT.md`, `RANDOLPH.md`
- **Sugestão:** Revisar — provavelmente substituídos por `CONSCIENCIA/09-ESTADO-ATUAL.md` + `CLAUDE.md` + prompts em `.claude/`
- **Justificativa:** o sistema de "estado atual" hoje é outro. Conferir se algum desses tem info única antes de descartar.

#### Pendência sugerida — Grupo 2: glossário e mapas (leigo)
- **Título:** Migrar materiais de explicação simples
- **Local no legado:** `GLOSSARIO_TECNICO_LEIGO.md`, `MAPA_LEIGO_DO_SISTEMA.md`, `MAPA_EVENTOS_WUZAPI.md`, `WHATSAPP_CONNECTION_MAP.md`
- **Sugestão:** Migrar
- **Justificativa:** o usuário é não-técnico — esses 4 são ouro pra consulta rápida. Não existem no principal.

#### Pendência sugerida — Grupo 3: workflows e deploy
- **Título:** Avaliar docs de deploy/workflow
- **Local no legado:** `CHANGELOG_TECNICO.md`, `ORGANIZACAO_VPS.md`, `ORQUESTRADOR_WORKFLOW_VPS.md`, `SUPABASE_WORKFLOW.md`, `SYNC_REPOS.md`, `WEBHOOKS.md`, `deploy.md`, `architecture.md`, `structure.md`, `lovable-sync-check.md`
- **Sugestão:** Revisar conteúdo
- **Justificativa:** muito disso pode estar coberto por `INSTALADOR/`, `CONSCIENCIA/03-FLUXO-DEPLOY.md` e `CLAUDE.md`. Conferir um a um.

#### Pendência sugerida — Grupo 4: segurança, env, MCP, gateway, github
- **Título:** Avaliar docs específicos
- **Local no legado:** `CHECKLIST-SEGURANCA-BOTS.md`, `MAPEAMENTO-ENV.md`, `TESTE-MCP.md`, `ELITE-GATEWAY-CURSO-COMPLETO.md`, `GITHUB_ACCESS.md`, `FARM_LOG.md`, `PENDENCIAS.md`
- **Sugestão:** Revisar conteúdo (atenção ao `PENDENCIAS.md` do legado — pode ter itens que não chegaram nesse aqui)
- **Justificativa:** o `PENDENCIAS.md` do legado é o ponto mais crítico — pode ter pendências antigas que ficaram pra trás.

---

### Próximos passos desta pendência #5

Quando você quiser revisar, abre item por item (5.1 → 5.21) e me fala "executa 5.X" — aí eu migro/descarto/arquivo conforme sua decisão e mudo o status do item pra ✅ aqui.
### 1. MCP Server Local com STDIO (FastMCP) — IA privada rápida dentro da VPS — 🔴 ABERTO (25/06/2026, 10:02 BRT)
### 2. VPS — ✅ CONCLUÍDO em 2026-06-25
### 3. MCP-CentralDark — criar .env real e fazer o servidor lê-lo (não usa dotenv) — 🟡 ABERTO (25/06/2026, 19:46 BRT)
### 4. Reativar workflow wuzapi-sessions-monitor e processos PM2 de WhatsApp — ✅ CONCLUÍDO em 2026-06-25
### 5. Reativar stack WhatsApp/WuzAPI completa — 🟡 ABERTO (25/06/2026, 21:14 BRT)
### 6. Investigação: index.html do painel some sozinho — 🟡 ABERTO (26/06/2026, 03:45 BRT)
### 7. Avaliar migração de secrets para Supabase Vault — 🟢 ABERTO (28/06/2026, 07:29 BRT)
- **Sintoma:** Secrets hoje vivem em arquivos .env (modo 0600) na VPS. Pivete cogitou centralizar no Supabase. Risco: tabela public exporia tudo via service_key.
- **Onde mexer:** secrets/ na VPS + extensão supabase_vault no projeto lyoigsqluyktoclwdaft
- **Critério pra fechar:** Se migrar, usar EXTENSÃO supabase_vault (criptografado em repouso), NUNCA tabela public. Projeto separado, sem pressa. Hoje o modelo 0600 já é seguro.
### 8. Revisar exposição de vps_write_file_safe no /mcp-public sem auth — ✅ CONCLUÍDO em 30/06/2026
- **Sintoma:** vps_write_file_safe estava exposta no endpoint /mcp-public SEM Bearer token (desde 27/06). Qualquer um com a URL podia escrever arquivos na VPS (exceto paths bloqueados).
- **O que foi feito:** endpoint `/mcp-public` removido por completo (rotas GET/POST em `dist/index.js` + whitelist `PUBLIC_CALLABLE_TOOL_NAMES` em `dist/mcp-server.js`, esvaziada). Decisão do Pivete: nenhuma IA externa sem terminal vai usar esse caminho — toda chamada ao MCP agora exige OAuth via `/mcp`. Confirmado `curl /mcp-public` → 404 após restart do `CentralDark-MCP`.
- **O que ficou no ar:** a edição foi feita direto em `dist/` porque não existe `src/` versionado no módulo MCP (ver achado paralelo na pendência #9) — não sobrevive a um rebuild do zero. Precisa portar pro source assim que o `src/` for reconstruído.
### 9. Refatorar fonte da verdade: universalizar + remover legados + regra ferramenta-ausente — 🟡 ABERTO (28/06/2026, 07:50 BRT — atualizado 30/06/2026 com mapeamento completo)
- **Sintoma:** CONSCIENCIA.md e 00-PORTA-DE-ENTRADA-IA.md com legado Multizap/clone-deck, nomes PM2 errados, agentes listados por nome (sem Claude/sem universal), snapshot de pendências velho. LEIA-ME-IA.md referenciado no fluxo mas foi pra ARQUIVO-MORTO (404).
- **Onde mexer:** docs/CONSCIENCIA/CONSCIENCIA.md + docs/CONSCIENCIA/00-PORTA-DE-ENTRADA-IA.md
- **Critério pra fechar:** Seção por seção, com confirmação do dono. Trocar MultiZap/clone-deck→CentralDark; universalizar agentes (qualquer IA via conector, sem citar nomes); corrigir nomes PM2 reais; adicionar regra ferramenta-ausente (IA avisa se não tem a tool); sincronizar snapshot de pendências com PENDENCIAS.md real. Fazer no fluxo do Obsidian.

**Mapeamento completo feito em 30/06/2026 (60 arquivos lidos: 45 em docs/CONSCIENCIA/ + 7 em relatorios/ + diretrizes) — 6 achados específicos a revisar, um por um, com o Pivete:**

1. **`CONSCIENCIA.md` duplica quase todo o conteúdo dos arquivos numerados (00 a 14)** — risco de desincronia: atualiza um lado, esquece o outro. Decidir: vira só um índice que linka pros numerados, ou mantém duplicado com checagem periódica.
2. **`06-MCP-CENTRALDARK.md` cita pasta `/APP/`** (`/root/CentralDark/APP/infra/mcp/`, `/root/CentralDark/APP/secrets/mcp.env`) que `04-ESTRUTURA-VPS.md` e `CONSCIENCIA.md` (seção 7) dizem explicitamente que **nunca existiu** — arquivo desatualizado, precisa correção.
3. **Dado divergente do MCP entre docs:** `MAPA-DO-CEREBRO.md` diz "95 ferramentas, porta 9200"; `09-ESTADO-ATUAL.md` (correto, confirmado ao vivo) diz "96 tools, porta 9100". Corrigir o `MAPA-DO-CEREBRO.md`.
4. **2 arquivos quase idênticos sobre GitHub:** `GITHUB-PROFISSIONAL-AUTOMACAO-CONTINUA.md` e `GITHUB-PROFISSIONAL-E-INTELIGENCIA-VIVA.md` dizem a mesma coisa com texto diferente — candidatos a fundir em um só.
5. **Vários arquivos antigos citam `segredounlock/clone-deck` como repo principal** (`00-PORTA-DE-ENTRADA-IA.md`, `CUSTOM-GPT-SETUP.md`, `CODEX-INTEGRADO.md`, `REPOSITORIO-OFICIAL.md`, `MODO-SEGREDO.md`) — desatualizado, hoje é `ServerVpss/CentralDark` (Seção 8 do CLAUDE.md).
6. **`CONSCIENCIA.md` (doc de regras) tem seção 17 sobre sync pausado do legado Recargas Brasil/Multizap** misturada no meio das regras vigentes — separar estado pontual de regra fixa.

**Achado 7 (30/06/2026, durante investigação de remoção do /mcp-public):** `06-MCP-CENTRALDARK.md` também precisa de correção sobre o que `/mcp-public` expunha — confirmado por leitura do código real que ele NUNCA expôs as tools de memória (`ler_consciencia`, `adicionar_pendencia`, `atualizar_consciencia` sempre exigiram OAuth Bearer via `/mcp`); só expunha tools de infra/diagnóstico (`mcp_status`, `vps_read_file_safe`, `vps_write_file_safe` etc). O endpoint foi removido por completo (ver pendência #8 ✅), então essa correção agora é só histórica/documental.

**Achado 8 (30/06/2026):** módulo MCP (`apps/modulos/mcp/`) não tem pasta `src/` versionada no Git — só `dist/` (compilado, gitignored) + `package.json` + `tsconfig.json`. Toda edição em `dist/` (como a remoção do `/mcp-public`) é a única cópia existente e não sobrevive a um rebuild do zero. Isso é a raiz do problema já citado em `09-ESTADO-ATUAL.md` ("fix do /openapi.json só existe no dist"). Precisa decidir: reconstruir o `src/` a partir do `dist/` atual, ou aceitar editar `dist/` como prática permanente (arriscado).

- **Critério pra fechar (mapeamento):** revisar item por item com o Pivete antes de qualquer edição em `docs/CONSCIENCIA/` (área protegida — Seção 9 do CLAUDE.md). Registrar cada decisão em `08-HISTORICO-DECISOES.md` conforme for fechando.
### 10. Processos fantasma no PM2 — id 3, 4, 6 com pid N/A — 🟡 ABERTO (30/06/2026, 22:15 BRT)
- **Sintoma:** `pm2 list` mostra 3 processos como "online" mas sem PID real (não estão de fato rodando): `CentralDark-BotServer` (id 4), `MultiZap-Gateway` (id 3), `CloneDeck-CRM` (id 6).
- **Causa identificada:** `CentralDark-BotServer` aponta pro script `apps/bot-server/start.sh`, que não existe mais — sumiu na reestruturação pra `apps/bot-telegram/` (o bot real que roda é `CentralDark-HubBot`, id 27, via `unified-bot.cjs`). `MultiZap-Gateway` e `CloneDeck-CRM` apontam pra `/root/Multizap/` — sistema legado (CentralDark1VPS).
- **Onde mexer:** PM2 (`pm2 delete`/`pm2 restart` conforme decisão) + `dump.pm2` (rodar `pm2 save` depois)
- **Critério pra fechar:** Decidir com o Pivete: (a) apagar os 3 do PM2 por serem ghost/legado, ou (b) para o id 4 especificamente, corrigir o script path pra apontar pro lugar certo se ele tiver uso real separado do HubBot. Os ids 3 e 6 são do sistema legado `CentralDark1VPS` — não mexer sem "Migração de Automação" (regra da Seção 8 do CLAUDE.md).

### 11. Avaliar destravar modo `auto` do Guardião da Consciência — 🟢 ABERTO (30/06/2026, 23:40 BRT)
- **Sintoma:** `CentralDark-GuardiaoConsciencia` (PM2 28, `infra/guardiao/guardiao.py`) está travado em modo "propor" (nunca move arquivo sozinho) até `08/07/2026`, por `REGRA-OFICIAL-GUARDIAO-MODO-PROPOR.md`. Essa data está perto de vencer.
- **Por que não decidir agora:** a regra oficial exige cumulativamente — 7-10 dias úteis de propostas reais validadas pelo admin, E lógica de movimentação de arquivo implementada e revisada. Hoje `guardiao.py` só tem o branch `propor`, a lógica de mover de fato **não existe ainda**. Destravar a data sozinha não muda comportamento nenhum até essa lógica ser escrita.
- **Onde mexer:** `infra/guardiao/guardiao.py` (implementar branch `auto`) + `REGRA-OFICIAL-GUARDIAO-MODO-PROPOR.md` (atualizar critério/data)
- **Critério pra fechar:** Decisão explícita do Pivete — não é automática só porque a data passou. Avaliar histórico de propostas em `fila/events.jsonl` antes de decidir.

### 12. Provedores LLM extras ativados (Groq, OpenRouter, Gemini) — ✅ CONCLUÍDO em 30/06/2026
- **O que foi feito:** chaves organizadas em `apps/modulos/mcp/.env` (estava uma bagunça de texto colado de 3 painéis diferentes). Groq e Gemini preenchidas em `apps/modulos/Bolt/source/.env` (OpenRouter já estava certa lá). Open WebUI (`apps/modulos/WebUI/docker-compose.yml`) ganhou `OPENAI_API_BASE_URLS`/`OPENAI_API_KEYS` com 4 conexões: Elite Gateway, Groq, OpenRouter, Gemini. Os 2 containers (`CentralDark-WebUI`, `CentralDark-Builder`) foram recriados e confirmados healthy/200.
- **O que ficou no ar:** o modelo `gpt-4o 🔗` antigo (cadastrado direto no admin do Open WebUI, sem key válida, causava o erro `'JSONResponse' object has no attribute 'body_iterator'`) continua na lista — não foi removido, só ficaram disponíveis alternativas funcionais (OpenRouter serve gpt-4o de verdade). Há também uma key OpenRouter alternativa não confirmada, comentada em `mcp/.env`, e um UUID + webhook secret de origem incerta também comentados lá — confirmar com o Pivete se algum desses tem uso.

### 13. Faxina de numeração em docs/CONSCIENCIA — números duplicados e fora de ordem — 🟡 ABERTO (30/06/2026)
- **Problema:** prefixos numéricos duplicados — `00`, `01`, `02`, `11`, `12` (triplicado!), `21` — além de possíveis números fora de ordem / buracos na sequência. Bagunça visual que o Pivete quer eliminar (regra: pastas/arquivos organizados, sem número torto).
- **Onde:** `docs/CONSCIENCIA/*.md`.
- **Cuidado (por isso não foi feito de imediato):** é ÁREA PROTEGIDA (CLAUDE.md Seção 9) e renomear arquivo quebra os wikilinks `[[...]]` do Obsidian. Tem que **renumerar E corrigir todos os links** que apontam pra cada arquivo no mesmo passo, senão o grafo do Pivete fica com bolinhas quebradas.
- **Decisão do Pivete (30/06):** "só deixa anotado" — não atacar agora; ir ajustando aos poucos pela regra do escoteiro ao passar por cada arquivo, ou em tarefa dedicada com plano quando ele autorizar (PERMITO PIVETE).

### 14. Claude Code via proxy nos 2 modos (terminal + extensão VSCode) — 🟡 ABERTO (30/06/2026)
- **Objetivo:** quando a conta principal cair, o Pivete continua trabalhando via proxy `claude.ap7.site` — tanto no terminal quanto na extensão do VSCode.
- **Terminal:** ✅ PRONTO e testado (HTTP 200). Script `secrets/claude-proxy.sh` (liga/desliga, lê key do cofre). Tutorial em `docs/APRENDIZADOS/PROXY/TUTORIAL-TERMINAL-SEM-CONTA.md`.
- **Extensão VSCode (barra lateral):** 🟡 pendente — apontar a extensão pro proxy (vars no ambiente do VSCode Server) + recarregar janela; documentar liga/desliga no tutorial. O Pivete escolheu "os dois".
- **Continuidade:** garantida pela memória (Lembranças + Consciência) — qualquer conta nova retoma com `/contexto`.
- **Preferência do Pivete (30/06):** usar a própria EXTENSÃO dele (abre bonito, com o nome da conversa). Se a extensão via proxy não rolar limpo, fallback é o terminal (já pronto) ou um chat local. "Faz o seu melhor."

🟡 #15 — Notificação automática de uso do MCP no Telegram (formato monospace) — 🟡 ABERTO (30/06/2026)
Pedido do Pivete: toda vez que QUALQUER IA trabalha usando o MCP dele, notificar no Telegram (igual o hook Stop), bem organizado, em formato MONOESPAÇADO (<pre>, fundo preto, bonito).

Padrão mono: já é regra (ver memória do padrão visual). Falta: o gatilho de notificação no MCP por uso/sessão.

Cuidado: definir granularidade — notificar por SESSÃO/ação relevante, NÃO cada tool call (evita spam). Implementação no MCP (dist/audit-logger.js é a base) + reusar scripts/notify-claude/notify-telegram.sh (já manda pro privado + canal).

🟡 #16 — Sync-loop do Google Drive — temporário até o Hub ficar pronto — 🟡 ABERTO (01/07/2026)
O que é: /root/CentralDark/scripts/sync-loop.sh — loop infinito que sincroniza docs/ pro Google Drive via rclone a cada 2 minutos.

Ajustes feitos (01/07): removido --verbose (estava enchendo log), nome do processo PM2 corrigido de CentralDark-SycDrive para CentralDark-SyncDrive.

Regra: fica rodando só até o Hub ficar pronto. Depois desliga e remove.

Onde mexer quando remover: pm2 delete CentralDark-SyncDrive, pm2 save, apagar o script sync-loop.sh.

🟡 #17 — Radar Visual de Atividade IA (Obsidian Graph) — 🟡 ABERTO (01/07/2026)
🎯 Objetivo
Habilitar a visualização em tempo real da "locomoção" das IAs dentro da sua estrutura de pensamento (Graph View), utilizando o motor visual do Obsidian.

⚙️ Stack Tecnológica (2026 High-Level)
Plugin: Local REST API (Permite controle externo do vault via requisições HTTP).

Middleware: Servidor de monitoramento em Node.js (utilizando chokidar) ou Python (watchdog).

Protocolo: Tagging dinâmico via API → addTag('#processando') → Espera (N)ms → removeTag('#processando').

Visual: Configuração de "Groups" no Graph View filtrando tag:#processando com cor: #00FF00 (Verde Neon).

📋 Roadmap de Implementação
[ ] Setup API: Instalar e configurar token de acesso do Local REST API no Obsidian.

[ ] Watcher: Criar script no seu NUCLEO que monitora o acesso a arquivos pelo Claude Code/Gemini.

[ ] Pipeline de Tags: Implementar a lógica de injeção e remoção de tags no arquivo lido.

[ ] UI: Configurar o filtro visual no Graph View para refletir a tag instantaneamente.

⚠️ Riscos e Manutenção
Performance: A injeção constante de tags pode disparar a reindexação do Obsidian em Vaults massivos.

Cuidado: definir granularidade — notificar por SESSÃO/ação relevante, NÃO cada tool call (evita spam e flickering frenético).

Estabilidade: Plugin externo exige re-instalação manual pós-update. Ação: Manter o .zip do plugin dentro da pasta [[INFRA/DEPENDENCIAS]].

---

## 🟡 #14 — Núcleo Vivo de Ensinamentos (pós-Hub)
**Status:** planejamento — executar DEPOIS do Hub
**Data de registro:** 02/07/2026
**Visão do Pivete:** sistema vivo que capture ensinamentos em qualquer canto (Gemini Live via voz, Lovable, VPS) e dispare em tempo real no grupo Telegram "Evolução IAs", sincronizando também Notion + GitHub + VPS automaticamente. Complemento vivo da CentralDark — nada perdido em chat, tudo com local rastreável.

**Peças a integrar:**
1. **Entrada:** Gemini Live (voz + abas), Lovable, ordens do Pivete via qualquer canal
2. **Núcleo:** pasta/arquivo único em `docs/CONSCIENCIA/NUCLEO-VIVO/` (ou tabela Supabase `nucleo_ensinamentos`)
3. **Distribuição em tempo real:**
   - Webhook → grupo Telegram "Evolução IAs" (dispara pras IAs de lá)
   - Mirror Notion (via connector já ativo)
   - Mirror Drive (via bisync já ativo — passo 1 concluído)
   - Mirror GitHub (via commit automático)
4. **Rastreabilidade:** cada ensinamento com timestamp, origem (quem falou), tags, e link permanente

**Pré-requisitos:**
- Hub concluído (central de conexões — Telegram, Drive, Gemini, GitHub, VPS num painel só)
- Bisync Drive ↔ VPS estável (✅ passo 1 done)

**Como fechar:**
1. Definir formato do ensinamento (markdown estruturado? JSON? tabela?)
2. Edge function `capturar-ensinamento` (recebe de qualquer origem)
3. Webhook Telegram → grupo Evolução IAs
4. Mirrors automáticos (Notion + GitHub + Drive)
5. Painel de leitura no Hub

