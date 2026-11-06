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

- Arquitetura física e sync: [Hermes Casa + Obsidian](../../ARQUITETURA/HERMES-CASA-OBSIDIAN-SYNC.md).
- Mapa Obsidian/BRAIN: [Mapa Obsidian — BRAIN](../00-MAPA-SISTEMA/02-GRAFOS/MAPA-OBSIDIAN-BRAIN.md).
- Ledger/GOAL e continuidade: [PR #1832](https://github.com/ServerVpss/CentralDark/pull/1832).
- Não criar outro bot, proxy, API, vault ou HUD. Memória é arquivo Markdown indexado no vault BRAIN; contrato do sincronizador atual continua prevalecendo.

## NEXT_CURSOR

`C05_MOBILE_SAFARI_SEALED → VERIFY_IPHONE_ADMIN_LOGIN_SESSION → VERIFY_ADMIN_ROLE_SERVER_SIDE → TEST_OBSIDIAN_PRIVATE_MEMORY_BRIDGE → LIVE_RECEIPT_HUD_UPDATE`.

Revalidar os caminhos operacionais apenas se a fonte expirar; nunca reverdear o que não foi medido. **CURRENT > HISTORY; DOCUMENTED != EXECUTED; MERGED != DEPLOYED; UNKNOWN != PASS.**

<!-- CENTRALDARK_IPHONE_AUDIO_DUPLEX_20261105 -->
## 🍒 Delta 05/11/2026: áudio Casa → iPhone comprovado pelo CHEFE e correção de duplex

**INTENÇÃO:** preservar o circuito iPhone→Tailscale→Cockpit, permitir ouvir o PC **e** enviar microfone do iPhone sem inverter botões ou substituir o player.

**OWNER DE CÓDIGO:** `apps/instinto-superior/src/components/central/PlayerLocalJarvis.tsx` (existente). **TESTE REUTILIZADO:** `apps/instinto-superior/scripts/verify-popup-close.mjs`. **Nenhuma nova bridge/porta/serviço/skill.**

**PROVA DE RUNTIME ANTERIOR À CORREÇÃO:**
- O CHEFE relatou ter **ouvido áudio real do PC no iPhone**, em casa, usando a conexão privada Tailscale e Cockpit :8443. Isto é testemunho humano de reprodução, não captura de áudio nem gravação.
- Browser Connector na aba `https://windows-casa.tail6d7aa4.ts.net:8443/sala-controle?aba=visao` leu `CONECTADO`, fonte `Mixagem estéreo (2- Realtek(R) Audio)`, `DETECTANDO · 2%` e `Latência WebRTC 3 ms` no PC transmissor. `SEM SINAL` naquele painel se referia à recepção local, não ao áudio transmitido. RTT não é atraso completo de áudio.
- A inspeção de `PlayerLocalJarvis` confirmou canal Supabase `centraldark-audio-relay` para sinalização e `RTCPeerConnection` para áudio; não é transporte MCP e não é inferência IA. A interface misturava modos mutuamente exclusivos `role=listener|broadcaster`; alternar role desmontava conexões. `useId` não garantia ID único entre browsers isolados.

**DELTA APLICADO À MAIN (source):**
- Commit `0c571267c509d6c046b05e74aecdabbeb4574b37`: áudio duplex de duas direções independentes, `crypto.randomUUID()` por instância, sessões WebRTC com `linkId`, controles claros para ouvir/enviar e medidores separados, mantendo `PopupCloseButton`, Cockpit, Supabase e Tailscale. Não interromper a recepção ao ligar a transmissão; áudio do Windows mantém a track de vídeo viva enquanto compartilha o sistema.
- Commit `4604f176b2edcc0bd7a2453061febc0348847a8d`: fonte **Mixagem estéreo** sem filtros de voz (echoCancellation, noiseSuppression e autoGainControl desativados para loopback); microfone convencional mantém cancelamento de eco.
- Commit `3bd3f8c0f1584d9075b6584a95e32db4e697a6fd`: teste de regressão estático no owner existente.

**READBACK:** fonte `main` contém os dois estados e botões independentes, linkId e captura; o Browser ainda mostrava os botões **antigos** na rota :8443 após os commits. Correção adicional SSR `7a08867776a98dafa1032fbf70d5f589e8d9e30f` evita avaliar `navigator` durante render no servidor. Na validação estática de source, **16/16 condições** corresponderam ao conteúdo, inclusive o teste reutilizado. Isto **não** substitui executar `node --test`, `tsc`, build ou E2E no iPhone. A consulta ao commit mais recente não retornou status CI; **não há comprovação de typecheck/build/deploy nem de reprodução duplex nos dois dispositivos** nesta rodada.

**GATES:** `IPHONE_HEARD_PC_AUDIO=HUMAN_CONFIRMED`; `SOURCE_DUPLEX_READBACK=PASS`; `LIVE_UI_UPDATED=NO`; `LIVE_DUPLEX_BIDIRECTIONAL=UNKNOWN`; `NO_REMOTE_DESKTOP_COMMANDER_USED=TRUE`.

**NEXT_CURSOR:** no owner Linux/Cockpit, preservar mudanças locais e rodar testes focados + build; fazer deploy/reload seguro no owner existente; abrir novo player no Windows e iPhone pela mesma rota Tailscale; provar PC→iPhone, iPhone→PC, simultâneo, botão Parar isolado, echo/permite áudio, recepção no Safari e readback no Browser. Não marcar FIXED_POINT antes das duas pontas.
<!-- /CENTRALDARK_IPHONE_AUDIO_DUPLEX_20261105 -->
