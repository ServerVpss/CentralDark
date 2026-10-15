---
title: "🪬 Circuito móvel selado — iPhone SEGREDO → Tailscale → Casa → Cockpit"
date: 2026-10-15
status: "T1_MOBILE_UI_PASS_ADMIN_UNVERIFIED"
proof_scope: "IPHONE_TAILSCALE_HOME_COCKPIT_SAFARI"
source_class: "INTERNAL"
sensitivity: "INTERNAL_NO_SECRETS"
owner: "docs/BRAIN/07-APRENDIZADOS-MEMORIAS/2026-10-15-CIRCUITO-IPHONE-TAILSCALE-CASA-COCKPIT.md"
main_related_commits: ["f4a3026b5a36389f26d53859396b5bb274aba0db", "0e6c45c74ce21c4e24b48aea31a9f613c0114ad0"]
pr_ledger: 1832
---

# 🪬 Circuito fechado — iPhone SEGREDO → Tailscale → Casa → Instinto Superior

<!-- CENTRALDARK_IPHONE_TAILSCALE_MOBILE_T1_20261015 -->

## Intenção e escopo do selo

O CHEFE pediu **registrar nos equivalentes** o resultado histórico do acesso móvel, com observação humana no aparelho. A conformidade de **100% aqui se aplica somente aos 5 critérios C01–C05 do circuito de abertura do Cockpit no Safari**, e não a todo o sistema, permissões Admin, sincronização do Obsidian ou deploy.

### Topologia que funcionou

```text
📱 iPhone SEGREDO (Tailscale ativo)
   → tailnet privado (MagicDNS)
   → windows-casa.tail6d7aa4.ts.net
   → Tailscale Serve HTTPS 443 (tailnet only)
   → HTTP proxy 127.0.0.1:3000 (Casa SEGREDO)
   → Instinto Superior — tela inicial renderizada no Safari móvel
```

A rota não tem `funnel` público. O navegador do iPhone deve ter Tailscale conectado. O Supabase Admin exige autenticação e papel administrativo verificados server-side e **não é concedido por IP da tailnet**.

## Provas discriminantes T0 / T1

| ID | Fato e prova | Resultado |
|---|---|---|
| C01 | Tela Tailscale do iPhone informa **windows-casa Connected** e MagicDNS/IP da Casa | PASS — screenshot enviada pelo CHEFE |
| C02 | IP/nome observados no iPhone correspondem à interface Tailscale `Running` da Casa, medidos via CLI | PASS — comparação fonte dispositivo+Casa |
| C03 | Tailscale Serve em segundo plano `tailnet only`, entrada HTTPS privada → `127.0.0.1:3000` | PASS — readback `tailscale serve status` na Casa |
| C04 | Vite permitiu **hostname exato** da Casa; teste com header Host antes 403 e depois HTTP 200 | PASS — código/readback Git e HTTP local |
| C05 | Safari **no iPhone** exibiu a página real CentralDark — Instinto Superior, com layout responsivo | PASS — screenshot enviada pelo CHEFE |

**RESULTADO DO ESCOPO FECHADO:** `MOBILE_COCKPIT_OPEN=PASS; CONFORMIDADE_CRITERIOS_C01_C05=5/5=100%; T1_USER_DEVICE_SCREENSHOT=PASS`.

**Limite da prova:** imagem prova a renderização vista pelo usuário, mas não estabelece HTTP trace coletado dentro do iPhone, autenticação, autorização de Admin, sincronização do Vault, nem permanência após reinício.

### Fix causais anteriores (com readback Git)

- Porta original do Cockpit: Vite `127.0.0.1:3000`; precisava de Tailscale Serve para não abrir a LAN.
- Diagnóstico remoto T0: HTTP 403, mensagem `Blocked request: This host is not allowed`.
- Correção menor: `apps/instinto-superior/vite.config.ts` permite só `windows-casa.tail6d7aa4.ts.net` — commit `f4a3026b5a36389f26d53859396b5bb274aba0db`.
- Vault viewer do Obsidian existente em `tools/vault-server/server.mjs` ficou `127.0.0.1:5174`, HTTP 200, sem Tailscale público ou privado sem autenticação — commit `0e6c45c74ce21c4e24b48aea31a9f613c0114ad0`.
- Fonte de UI iPhone: anexos da conversa **IMG_7406.png** (Tailscale Connected) e **IMG_7407.png** (Safari Instinto Superior); imagens privadas não foram publicadas no Git.

## Outros escopos — NÃO confundir com 100% global

| Escopo | Estado |
|---|---|
| iPhone Tailscale → Casa → Cockpit aberto no Safari | **PASS** |
| HTTPS completo no iPhone com telemetria de requisição do cliente | UNKNOWN (captura humana de tela, sem trace) |
| `/auth` login Supabase a partir do iPhone | UNKNOWN — não aparece nos prints |
| `/sala-controle` e role `user_roles.role=admin` | UNKNOWN — ainda sem screenshot/readback de sessão |
| Vault Obsidian sincronizado com o iPhone | UNKNOWN — só viewer local medido |
| Migração/sync Casa↔GitHub↔VPS de toda a stack | UNKNOWN |
| Servidor do Cockpit acessível depois de reboot | UNKNOWN — verificar persistência e health |

## Equivalentes canônicos, sem segunda memória

- Arquitetura física e sync: [Hermes Casa + Obsidian](../../../ARQUITETURA/HERMES-CASA-OBSIDIAN-SYNC.md).
- Mapa Obsidian/BRAIN: [Mapa Obsidian — BRAIN](../00-MAPA-SISTEMA/02-GRAFOS/MAPA-OBSIDIAN-BRAIN.md).
- Ledger/GOAL e continuidade: [PR #1832](https://github.com/ServerVpss/CentralDark/pull/1832).
- Não criar outro bot, proxy, API, vault ou HUD. Memória é arquivo Markdown indexado no vault BRAIN; contrato do sincronizador atual continua prevalecendo.

## NEXT_CURSOR

`C05_MOBILE_SAFARI_SEALED → VERIFY_IPHONE_ADMIN_LOGIN_SESSION → VERIFY_ADMIN_ROLE_SERVER_SIDE → TEST_OBSIDIAN_PRIVATE_MEMORY_BRIDGE → LIVE_RECEIPT_HUD_UPDATE`.

Revalidar os caminhos operacionais apenas se a fonte expirar; nunca reverdear o que não foi medido. **CURRENT > HISTORY; DOCUMENTED != EXECUTED; MERGED != DEPLOYED; UNKNOWN != PASS.**
