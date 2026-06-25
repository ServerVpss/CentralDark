# Pendências — CentralDark / MultiZap

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



### 5.1 — Pasta `INSTALADOR/` (23 arquivos no legado · 2 no principal)

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

### 5.2 — Pasta `tarefas/` (33 arquivos no legado · 0 no principal)

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

### 5.3 — Pasta `WHATSAPP-API/` (16 arquivos no legado · 0 no principal)

**Estado no principal hoje:** não existe `docs/WHATSAPP-API/`. O bot WhatsApp na VPS (PM2 id 1) está em estado `stopped` desejado.

#### Pendência sugerida — Documentação operacional das rotas WhatsApp
- **Título:** Decidir destino da documentação da WhatsApp API (rotas + roadmap)
- **Descrição:** 16 docs explicando rotas de chats, contacts, groups, avatares, histórico de mensagens, tempo real, domínio oficial e roadmap. Organizado em "LOTES" (LOTE-2 a LOTE-12) + capítulos por recurso.
- **Local no legado:** `docs/WHATSAPP-API/` inteiro (`README.md`, `06-chats.md`, `07-contacts.md`, `08-groups.md`, `15-official-domain.md`, `90-roadmap.md`, `LOTE-2-listChats.md` até `LOTE-12-tempo-real.md`)
- **Status atual no principal:** não existe
- **Sugestão:** Revisar conteúdo
- **Justificativa:** com o whatsapp-server parado por decisão (PM2 id 1 stopped), essa doc pode estar congelada como referência futura. Vale decidir se vira `docs/WHATSAPP-API/` no principal (com aviso "congelado") ou se vai inteiro pra `docs/CONSCIENCIA/ARQUIVO-MORTO/`. Em nenhum cenário deve sumir — é o único registro escrito do funcionamento dessas rotas.

---

### Próximos passos desta pendência #5

Quando você revisar as sugestões acima, abro pendência #6 com o mesmo mapeamento pras outras pastas de prioridade média (`RELATORIOS/`, `CONSCIENCIA/` — pra reconciliar os 45 do legado vs os atuais, `AUDITORIAS/`, `BOTS/`, `SEGURANCA/`, `INSTALADOR/backup/`) e baixa (`ARQUITETURA/`, `CODEX/`, `CONTINUIDADE/`, `DOMINIOS/`, `GATEWAY/`, `IA-TAREFAS/`, `agente/infra-recovery/`, `infra/`, `pendencias/`, `relatorios/` minúsculo, `sentinela/`, raiz com 27 .md).

