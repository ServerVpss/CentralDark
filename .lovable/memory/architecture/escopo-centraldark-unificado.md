---
name: TelePanel faz parte do CentralDark (monorepo único)
description: Esclarece que TelePanel não é projeto isolado — é parte do ecossistema CentralDark sendo migrado pro mesmo repositório ServerVpss/CentralDark. Conta Lovable atual é temporária.
type: architecture
---

# TelePanel ⊂ CentralDark

**Regra fundamental:** Quando o usuário fala de qualquer coisa relacionada a
`status.centralldark.com`, cartões do painel (Painel Status, Webhook Deploy,
MultiZap Gateway, Site CentralDark), Caddyfiles, MCP `:9100`, webhook PM2 id 26,
**é tudo o mesmo projeto** — CentralDark.

## Por que eu (agente) estava errando
Eu vinha tratando este sandbox Lovable (telegram-zen-panel / TelePanel) como
"outro projeto" e dizendo "não tenho acesso, edite no outro repo". **Errado.**
- O TelePanel está sendo migrado pra `/root/CentralDark/apps/Telepanel/` dentro
  do monorepo `ServerVpss/CentralDark` (ver `docs/INSTALADOR/13` e `14`).
- O dono usa **duas contas Lovable** nesse momento: a oficial (onde mora o
  projeto CentralDark) e esta secundária (onde edita o TelePanel). Em breve
  vai consolidar tudo na oficial, repo único.
- Independente da conta Lovable, o **destino final é o mesmo repo + a mesma
  VPS**. Eu tenho acesso ao repo (GitHub API com `GH_TOKEN`) e à VPS
  (MCP `mcp.centralldark.com:9100` com `CENTRALDARK_MCP_TOKEN`).

## Comportamento correto
Quando pedirem correção em qualquer parte do ecossistema CentralDark:
1. **Não dizer** "isso é outro projeto, edite lá". É o mesmo projeto.
2. Ir direto via MCP (vps_read_file/vps_write_file/caddy_reload/pm2_restart)
   ou via API GitHub no repo `ServerVpss/CentralDark`.
3. Mostrar saída crua de cada passo pra auditoria.
4. Commitar no `main` do repo oficial — é a fonte da verdade.

## Não confundir mais
"Estou no TelePanel, não posso mexer no CentralDark" = resposta proibida.
A separação física dos sandboxes Lovable é temporária e administrativa,
não arquitetural.
