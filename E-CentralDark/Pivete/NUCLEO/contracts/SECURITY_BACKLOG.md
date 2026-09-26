# CONTRATO - SECURITY_BACKLOG.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\security\SECURITY_BACKLOG.md
**SHA:** d169fab46f929b03
**Timestamp:** 2026-08-26T19:32:53.217458
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Riscos
- - **Risco:** O Supabase Sync Bridge (e o próprio Frontend) dependem da tabela `instances`, que ainda não estava criada no schema físico da VPS, ou foi desenhada sem RLS (Role Level Security).
- - **Risco:** O sistema ficou híbrido. O CRM espera `whatsapp_connections`, o Bot espera `instances`. O Gateway `connections.json` opera como Proxy.
- - **Risco:** Fragmentação e Duplicação do Banco de Dados.
- - **Risco:** Aplicação disparando chamadas de Log via Frontend pode revelar schema/arquitetura se RLS rejeitar (HTTP 403 / Log Supabase exposto).
- - **Risco:** O frontend cria registros "órfãos" na tabela `whatsapp_connections` sem a geração formal das instâncias (`/admin/users`) na WuzAPI via REST (Gateway Node).
- - **Risco:** Descontinuidade de Serviço de Geração de QRs.

### Ouro Bruto (primeiros 5000 chars)
```
# Backlog de Segurança (Dívida Técnica)

Este arquivo gerencia a dívida técnica de segurança do legado.
**Regra atual:** Foco total em entregar Chat Realtime e Notificações. Qualquer melhoria de segurança que NÃO for risco crítico entra neste backlog para resolução futura.

## 🔴 Crítico — Corrigir Imediatamente
- **Módulo:** Bot Frontend / Tabela Instances
- **Risco:** O Supabase Sync Bridge (e o próprio Frontend) dependem da tabela `instances`, que ainda não estava criada no schema físico da VPS, ou foi desenhada sem RLS (Role Level Security).
- **Evidência:** Supabase retorna `HTTP 404 Could not find the table 'api.instances' in the schema cache`.
- **Impacto:** O painel "Nova Conexão" exibia modal e rodava hooks falsamente isolados no cache local, sem persistência remota, ou expunha tokens caso o bridge tentasse atualizar colunas desprotegidas no Supabase. O backend WuzAPI falhava porque o ID nunca salvava no banco.
- **Correção proposta:** Uma nova `Migration` foi gerada e atachada ao `038-sync-wuzapi-schema`. Ela criará a tabela nativa `instances` blindada via RLS atada aos `workspace_members`.
- **Prioridade:** Crítico
- **Status:** ✅ Resolvido em Migration. Requer acionamento na VPS.

## 🟠 Alto — Corrigir Antes de Produção
- **Módulo:** Gateway / Mapeamento de Tabelas
- **Risco:** O sistema ficou híbrido. O CRM espera `whatsapp_connections`, o Bot espera `instances`. O Gateway `connections.json` opera como Proxy.
- **Evidência:** O seu log acusa `whatsapp_connections` existente, enquanto `instances` 404.
- **Impacto:** Confusão de dados entre os painéis (O número 5676 existe num lugar e não no outro).
- **Correção proposta:** Adotar `instances` como fonte primária temporária para destravar o WuzAPI Token Workflow via Bot, mas unificar o schema das tabelas em refatoração posterior.
- **Prioridade:** Alto
- **Status:** ⏳ Pendente

## 🔴 Crítico — Falso Positivo de Arquitetura Resolvido
- **Módulo:** Bot / Tabela Instances
- **Risco:** Fragmentação e Duplicação do Banco de Dados.
- **Evidência:** O Bot estava utilizando a tabela fantasma `instances` para persistência das conexões, enquanto a estrutura corporativa do CRM (e o script de Migration SQL original da infra) consolidou isso na tabela primária e segura `whatsapp_connections`.
- **Impacto:** Exigir a criação de um schema separado resultaria em dois centros da verdade desconexos, desestabilizando a segurança RLS e causando quebras no roteamento do PM2 Bridge.
- **Correção proposta:** Substituição total da query target `.from('instances')` para `.from('whatsapp_connections')` no `instanceService.ts` e refatoração da estrutura de `Instance` para parsear o campo `qr_code` ao invés do pseudo-campo legado. Extirpar os arquivos de migration gerados acidentalmente.
- **Prioridade:** Crítico
- **Status:** ✅ Executado Imediatamente.

## 🟠 Alto — Auditoria RLS em \`system_logs\`
- **Módulo:** Logger Central
- **Risco:** Aplicação disparando chamadas de Log via Frontend pode revelar schema/arquitetura se RLS rejeitar (HTTP 403 / Log Supabase exposto).
- **Evidência:** Supabase lançando \`new row violates row-level security policy for table system_logs\`.
- **Impacto:** Logs perdidos e poluição de falhas 403 no Network Tab que travavam requisições paralelas.
- **Correção proposta:** Os métodos de `logService.ts` no Frontend e do `supabaseService.js` no Node foram embrulhados com supressor de erro (Catch block silencioso). A longo prazo, deve-se criar uma Edge Function no Supabase para injetar auditoria com service_role segura.
- **Prioridade:** Médio/Alto
- **Status:** ✅ Isolado na camada de abstração. Aguarda correção real na base do Supabase (Cloud).

## 🟠 Alto — Orquestração de Conexões Front/Gateway
- **Módulo:** Bot Frontend / Gateway Create Flow
- **Risco:** O frontend cria registros "órfãos" na tabela `whatsapp_connections` sem a geração formal das instâncias (`/admin/users`) na WuzAPI via REST (Gateway Node).
- **Evidência:** O usuário clica em "Nova Conexão" no navegador. O Supabase insere a linha, mas o `connection_id` ficava nulo/inexistente porque o webhook/sync do backend não estava programado para escutar INSERTS e fabricar a conexão na GoLang Engine. Quando o usuário clica para gerar o QR, ele esbarra no Erro "Nenhum connection_id atrelado".
- **Impacto:** Conexões "mortas" na interface que nunca progridem para QRCode.
- **Correção proposta:** Implantado geração de UUID v4 no client-side como paliativo. No futuro, a função `create` do Frontend deve acionar uma Edge Function do Supabase, que servirá de Proxy autenticado (usando Service Role) para bater em `POST https://proxy.multizap.dev/connections` e executar a geração em Transaction-safe mode na VPS.
- **Prioridade:** Médio/Alto
- **Status:** ⏳ Pendente

## 🟠 Alto — Auditoria de Spec WuzAPI (Conflito de Verbos HTTP 405)
- **Módulo:** Node Gateway / WuzAPI Connection Client
- **Risco:** Descontinuidade de Serviço de Geração de QRs.
- **Evidência:** O diagnóstico do Gateway disparou 5 exceções e
```