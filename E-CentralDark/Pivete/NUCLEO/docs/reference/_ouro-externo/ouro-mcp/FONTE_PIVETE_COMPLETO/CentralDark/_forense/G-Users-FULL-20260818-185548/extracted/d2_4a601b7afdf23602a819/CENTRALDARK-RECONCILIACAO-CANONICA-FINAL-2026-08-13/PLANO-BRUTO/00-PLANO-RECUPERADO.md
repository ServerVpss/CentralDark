# PLANO BRUTO — Recuperado (sem invenção)

## Objetivo final
CentralDark: plataforma de automação (WhatsApp/Telegram/CRM) + agentes com memória auditável + Zero Trust aplicado ao próprio sistema.

## Papéis
- **CHEFE/SEGREDO:** autoridade humana
- **SOL:** coordenadora / reconciliadora
- **Hermes/Pivete:** executor quando autorizado
- Modelos variam; modo operacional permanece SOL

## Infra
- **Canônico:** ServerVpss/CentralDark (filesystem VPS + local)
- VPS: `/root/CentralDark` (nova) + `/root/Multizap` (legado)
- GitHub: fonte de código de apps; profile + mae como evidência
- Cloudflare / Contabo: integrados operacionalmente (detalhe UNPROVEN no ZIP)
- PM2, WuzAPI, Gateway, MCP: componentes históricos da conversa

## Segurança (conceitual)
- Cadeia sequencial + bidirecional
- Fail-closed
- Sem bypass / sem inferência de intenção
- Sem especificação → sem ação
- SECURITY_PLAN = STAGED_NOT_ACTIVE até fim do forensics

## Memória
- 03-memoria estilo Obsidian
- Ledger append-only + fingerprint
- Alinhar tools ao espírito deny-delete (não recriar mae)

## Observabilidade / Painel
- Planejado (PAINEL-UNICO = BLUEPRINT)
- Não afirmar implantação

## Encerramento
Só com especificação explícita.
