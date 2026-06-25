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
