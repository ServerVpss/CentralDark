---
title: "Cristal da sessão 2026-09-29 — fusão híbrida CentralDark"
date: 2026-09-29
status: SESSION_CRYSTAL
owner: ".agents/skills/meta-lupa/KITS/METAGRILL-METALUPA/SESSOES"
pr_mother: 1562
child_pr: 1577
tags: [centraldark, session-crystal, tailscale, desktop-commander, centraldark-os, tool-calls, resenha, memoria, aprendizagem]
---

# Cristal da sessão 2026-09-29

## Intenção

Cristalizar os deltas materiais desta sessão sem transformar narrativa em prova, sem criar segundo cérebro e sem perder o que funcionou.

```text
REUSE_BEFORE_CREATE=true
ONE_SYSTEM_ONLY=true
CURRENT > HISTORY
UNKNOWN != PASS
DOCUMENTED != EXECUTED
MERGED != DEPLOYED
REALITY = JUDGE
```

## 1. Rota híbrida provada

Topologia provada nesta sessão:

```text
ChatGPT
→ Desktop Commander
→ VPS vmi3256920
→ Tailscale
→ CENTRALDARK-OS
→ SSH / sessão gráfica / serviços
```

Identidades de rede observadas:
- VPS: `100.121.152.119`
- Casa Windows SEGREDO: `100.123.93.25`
- CENTRALDARK-OS: `100.67.163.91`
- tailnet owner observado: `segredounlock@`

Provas:
- VPS → CENTRALDARK-OS via Tailscale ping respondeu.
- Tailscale SSH reautenticado e depois passou.
- Readback remoto: `whoami=root`, `hostname=CENTRAKDARK-OS`, `pwd=/root`.
- A rota não depende da visibilidade do Desktop Commander do guest na mesma conta.

Aprendizado:
```text
ACCOUNT_PLANE != NETWORK_PLANE
DESKTOP_COMMANDER != TAILSCALE
TAILNET_ENROLLMENT_AUTH != TAILSCALE_SSH_CHECK
REACHABILITY != CATALOG_VISIBILITY
DIRECT_OR_DERP_IS_TEMPORAL_MEASUREMENT
```

## 2. Controle gráfico remoto provado

A partir da rota ChatGPT → VPS → Tailscale SSH → CENTRALDARK-OS foi executada uma ação na sessão gráfica do usuário `CENTRAKDARK-OS`.

Readback:
- sessão UKUI ativa;
- `peony /home/CENTRAKDARK-OS` iniciado;
- processo Peony observado em execução.

Conclusão limitada:
```text
REMOTE_GUI_ACTION_PATH=PROVED
VOICE_OR_CHAT_CAN_TRIGGER_REMOTE_GUI_ACTION=true
THIS_DOES_NOT_PROVE_ALL_GUI_APPS=true
```

## 3. Tool Calls visíveis no iPhone

O CHEFE forneceu evidência visual da interface móvel do ChatGPT mostrando:
- card `GitHub — Add comment to issue`;
- payload de solicitação visível;
- resposta visível;
- `result.id` retornado;
- campos de erro nulos.

Classificação:
```text
TOOL_CALL_EXECUTED != TOOL_CALL_RENDERED
IPHONE_TOOL_CALL_RENDERER=USER_CONFIRMED_VISIBLE
UI_SCREENSHOT_IS_FRONTEND_EVIDENCE
BACKEND_EFFECT_REQUIRES_TOOL_RECEIPT_OR_TARGET_READBACK
```

## 4. Resenha como camada compatível com rigor

Foi explicitado e registrado que a CentralDark pode acompanhar o ritmo coloquial da conversa quando o contexto estiver claramente em resenha, inclusive com linguagem forte contextual, sem inferir hostilidade só pelo estilo.

Gatilhos ligados:
```text
hora da resenha
↔ ritmo de resenha
↔ bater resenha
↔ trabalhar com resenha
↔ resenha com seriedade
↔ fala comigo do meu jeito
```

Regras:
```text
RESENHA != FALTA_DE_SERIEDADE
SERIEDADE != FRIEZA
STYLE_MATCHING != BLIND_MIMICRY
RESENHA != BYPASS
CALOR_HUMANO + PRECISAO_TECNICA = VALID
```

Owner específico já evoluído:
`docs/CONSCIENCIA/BAIANES-E-RESENHA-REGIONAL.md`

## 5. Persistência de aprendizado

Decisão desta sessão:
- novidade material que funciona deve virar aprendizado durável;
- registro solto não basta;
- aprendizado relevante precisa ser roteável pelo núcleo/índice;
- lembrança histórica não deve governar CURRENT sozinha;
- o núcleo aponta para a fonte específica em vez de copiar tudo para um monólito.

```text
NEW_MATERIAL_FACT
→ OWNER_EXISTENTE
→ APRENDIZADO
→ LEMBRANCA_SEMANTICA
→ CORE_INDEX
→ FUTURE_RETRIEVAL
→ REUSE_WITHOUT_REDISCOVERY
```

## 6. Estado que continua aberto

Não promover a verde sem medir:
- persistência após reboot do CENTRALDARK-OS para todos os serviços;
- mount HGFS permanente;
- Screenpipe permanente;
- paridade de contas Desktop Commander;
- rota direta Tailscale permanente (DERP/direct pode variar);
- promoção deste cristal para `main`.

```text
SESSION_CRYSTAL=PROVED_AS_DOCUMENT
RUNTIME_GLOBAL_FIXED_POINT=NOT_PROVEN
```

## Relações

- PR-mãe ledger: #1562
- child de ponte Tailscale: #1699
- child de visibilidade Tool Call: #1708
- child de resenha/linguagem: #1707
- lane de cristal de sessão: #1577

Este cristal une proveniência; não muda owner técnico dos subsistemas.
