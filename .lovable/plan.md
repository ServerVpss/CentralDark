# Plano: Consolidação Notion CentralDark

Conexão **CentralDark - Lovable** confirmada com acesso ao hub `CentralDark • Consolidação` e aos 7 bancos. Vou executar em 4 blocos, em paralelo onde der.

## Bloco 1 — Auditoria (leitura)
- Varrer os 7 bancos: `📚 Histórico`, `📜 Regras`, `📥 Import Queue`, `📂 Estrutura`, `🔥 Pendências`, e os 2 restantes do hub.
- Listar páginas vazias, duplicadas, de teste e órfãs.
- Mapear o que já tem tag/status vs. o que está solto.

## Bloco 2 — Faxina
- Mover pro lixo: páginas vazias, testes e duplicatas confirmadas.
- Consolidar páginas redundantes (manter a mais recente, arquivar antigas com link).
- Padronizar títulos (prefixos: `[Infra]`, `[Bot]`, `[CRM]`, `[Log]`).

## Bloco 3 — Taxonomia (4 tags-mãe)
Criar/garantir nos bancos relevantes as multi-selects:
- `Fase 1: Infra` — Supabase, VPS, PM2, Edge Functions, RLS
- `Fase 2: CRM/Bot` — Telegram bot, painel TelePanel, pagamentos
- `Log: Execução` — registros do que foi rodado/deployado
- `Backlog: Pendente` — tudo que está parado aguardando ação

Reclassificar páginas existentes nessas 4 tags.

## Bloco 4 — Status de Guerra (página nova no hub)
Criar a página **🎯 Status de Guerra — 24/06/2026** dentro do `CentralDark • Consolidação` com 3 seções:
1. **Rodando** — serviços ativos (Supabase, Edge Functions verdes, PM2 online).
2. **Parado / Desejado** — `whatsapp-server` (PM2 id 1, stopped por design), itens em pausa.
3. **Falta fazer** — bloqueios atuais: disparos Telegram/Status sem chegar, sync 4-Point pendente, próximas migrações.

Linkar essa página no topo do hub.

## Entrega final
Relatório curto no chat com:
- O que foi limpo (contagem)
- O que foi reclassificado
- Link da página `Status de Guerra`
- Diagnóstico inicial dos disparos Telegram que não chegam (precisa investigar logs de `notification_events` + edge function, fica como próximo passo após aprovação do plano)

## Detalhes técnicos
- Uso `notion-query-data-sources` (SQL) pra auditar e `notion-update-page` / `notion-move-pages` pra mover lixo.
- Adiciono colunas multi-select via `notion-update-data-source` se as tags não existirem.
- Nada é deletado permanentemente — só vai pro lixo do Notion, reversível.
- Não toco em código do app nesta rodada (só Notion).