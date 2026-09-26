# DECISAO - README.md.hub-antigo
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\apps\modulos\hub\README.md.hub-antigo
**SHA:** 44214880d8444803
**Timestamp:** 2026-08-28T02:56:26.881567
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- **Modo padrão:** dark (mesmos tokens do `src/index.css`)

### Ouro Bruto (primeiros 5000 chars)
```
# Hub CentralDark

Painel central de segurança e orquestração — Sistema 3D Tátil "Esmeralda".

## Visão geral

O Hub concentra em um único lugar:
- **Conectores** — apps e MCPs do setup (editável via banco, sem rebuild)
- **Políticas** — fonte de verdade do PDP (Default-Deny, Tiers 0–4)
- **Aprovações** — fila de decisões humanas com hash vinculado e uso único
- **Auditoria** — log append-only encadeado por hash (sem UPDATE/DELETE)
- **Arquitetura** — visualização dos 7 componentes e fluxo de decisão

## Design system

**Tema:** Esmeralda — Sistema 3D Tátil  
**Fonte:** Geist + Geist Mono (Google Fonts)  
**Cor primária:** `hsl(152,76%,50%)`  
**Modo padrão:** dark (mesmos tokens do `src/index.css`)  
Referência: `docs/ARQUITETURA/DESIGN-SISTEMA.md`

## Os 7 componentes

| Componente | Papel |
|---|---|
| **MCP Adapter** | Recebe pedidos da IA. Não decide, não executa. Repassa ao PEP. |
| **PEP** | Chokepoint único. Emite capability assinada — chave nunca existe no processo da IA. |
| **PDP** | Decide: `ALLOW / DENY / REQUIRE_APPROVAL` + tier. Função pura. |
| **Approval Service** | Aprovação humana presa ao hash exato (nonce, recurso, ambiente, expiração). |
| **Connector Hub** | Executa conectores. Só aceita pedido com capability válida do PEP. |
| **Secret Provider** | Guarda credenciais. Só o Connector Hub lê, na execução. |
| **Audit Service** | Log append-only. `mcp_agent` tem apenas INSERT. |

## Fases MVP

- **Fase 0** ✅ — Fronteira + chokepoint + schema foundation
- **Fase 1** 🔄 — Approval Service (Telegram) com hash SHA-256
- **Fase 2** ⬜ — Secret Provider (fora do env do MCP)
- **Fase 3** ⬜ — Endurecimento + admin-mcp formal

## Banco de dados

Schemas: `hub.connectors`, `hub.theme_tokens`, `hub.policies`, `hub.approvals`, `hub.audit_log`  
Migration: `apps/hub/db/migrations/001_hub_foundation.sql`  
Supabase project: `lyoigsqluyktoclwdaft`

## Regra de ouro

> O **Connector Hub só executa pedido com capability assinada pelo PEP.**  
> A chave de assinatura vive **só no PEP**. A IA/MCP nunca tem essa chave.

```