---
title: "Orphans 2026 06 25 Arquivados 36"
date: 2026-07-02
tags: ["consciencia"]
updated: 2026-07-02
---

# 🗑️ Notion Cleanup Orphans — Execução confirmada

**Data:** 2026-06-25T21:24Z
**Modo:** 🔴 EXECUÇÃO (`CONFIRM=YES_DELETE_ORPHANS`)
**Target:** `regras, pendencias, decisoes`
**Disparado por:** segredounlock
**Run:** `28201393419` (workflow `notion-sync.yml`)

## Resumo

| Base | Notion (antes) | Git | Arquivados | Notion (depois) |
|---|---:|---:|---:|---:|
| 📜 regras | 14 | 4 | **10** | 4 |
| 🔥 pendências | 14 | 1 | **13** | 1 |
| ⚖️ decisões | 24 | 11 | **13** | 11 |
| **TOTAL** | 52 | 16 | **36** | 16 |

> Notion agora bate exatamente com o Git nessas 3 bases. 🟩

## Itens arquivados

### 📜 Regras (10)
- Protocolo Multi-Agente Semântico (regra-mãe) — Ler→Agir→Registrar, rigor máximo no MCP
- Memória só conta se está no Git — mem:// não é fonte oficial
- Cérebro Vivo Central — protocolo obrigatório multi-IA
- VPS é intocável sem permissão explícita
- Atualizar Mega Painel + Telegram a cada ação relevante
- Antes de escrever arquivos importantes, mostrar resumo pro usuário
- Repo privado ou grande → usar GH_TOKEN desde o primeiro acesso
- Notion é o cérebro organizacional do projeto
- Tarefas grandes → 3 a 4 sub-agentes em paralelo
- Sempre responder em PT-BR (100% do conteúdo)

### 🔥 Pendências (13)
- #3 — bot-whatsapp, crm, financeiro são só landing
- #5 — Revisão de migração docs/ do legado (CentralDark1VPS → CentralDark)
- #4 — Arquitetura CentralDark 2026 (Cloud + API pra IAs externas)
- #1 — Migração centralldark.com + telepainel.centralldark.com
- P6 — Guardião da Consciência: ativar Decisor (matar spam de propostas)
- P5 — Registrar/sincronizar bots no Supabase + healthcheck
- P2 — Sincronização realtime do Mega Painel (status.centralldark.com)
- P1 — Resolver conexão do MCP CentralDark (Grok não conecta)
- P3 — Telegram automático em início/fim de toda ação relevante + registro no Notion
- P4 — Preparar integração futura com Obsidian como camada do Cérebro Vivo
- Ativação do Segundo Cérebro (Obsidian)
- Apagar manualmente 2 databases legados (Visualizações da página inicial + Minhas Tarefas)
- Iniciar Fase 1 da Consolidação CentralDark (import de docs do CentralDark1)

### ⚖️ Decisões (13)
- Estrutura oficial da VPS: /root/CentralDark/APP/
- GitHub Achievements — perfil segredounlock
- Memória eterna do agente em docs/CONSCIENCIA/
- Docs por pasta (README.md + PLANO.md)
- Permissões do agente (execução direta vs confirmação)
- Setor único de pendências (docs/PENDENCIAS.md)
- Gerenciador de pacotes oficial: npm
- Fluxo de deploy: commit direto na main
- Central de horário única (America/Sao_Paulo)
- MCP CentralDark próprio em mcp.centralldark.com
- Instalador + doc viva (install.sh + docs/INSTALADOR/)
- P1 MCP CentralDark — Cloudflare descartado como causa
- Contrato operacional do Cérebro Vivo — 7 regras

## Observações

- "Arquivado" no Notion = não aparece nas views, mas pode ser restaurado da lixeira em até 30 dias.
- Nada foi tocado em `aprendizados` nesta execução (decisão segura porque eram duplicatas por ID que precisavam do parser novo de dedup).
- O `cleanup-orphans.mjs` agora tem dedup automática por `#N` em aprendizados — basta rodar o workflow com `cleanup_target=aprendizados` `cleanup_orphans=confirm-delete` quando quiser apagar os 20 duplicados.
