---
title: "Rota local 4175 → Casa via Tailscale"
date: 2026-09-29
status: PROVED_SCOPED_ROUTE
tags: [centraldark-os, local-first, tailscale, casa, mvp, porta-4175, interligados]
owner: "🔗 !># INTERLIGADOS"
---

# Rota local 4175 → Casa via Tailscale

## Resultado que sobrevive

```text
CENTRALDARK-OS
→ serviço local :4175
→ listener 0.0.0.0
→ Tailscale
→ Casa/Windows
→ navegador
```

Provas desta rodada:

```text
LOCAL_LISTEN=PASS
LOCAL_CURL=PASS
VPS_TO_GUEST_TAILSCALE_4175=PASS
CASA_WINDOWS_VISIBILITY=USER_CONFIRMED
```

A página temporária retornou `CentralDark 4175` tanto no guest quanto por acesso remoto ao IP Tailscale do CENTRALDARK-OS. O CHEFE confirmou visualmente o consumo a partir da Casa/Windows.

## Regra operacional

```text
LOCAL_FIRST=true
TARGET_LOCAL → SUBIR NO CENTRALDARK-OS
OBSERVAR_LOCALMENTE
CONSUMIR_DA_CASA_PELA_MALHA
FALLBACK_VPS_TAILSCALE_PRESERVED=true
```

O usuário não precisa abrir/interagir com a VM para consumir uma porta publicada pelo CENTRALDARK-OS, desde que a rota de rede aplicável esteja disponível.

## Limites

```text
TEMP_HTTP_SERVER != PRODUCTION_SERVICE
USER_CONFIRMED_VISIBILITY != AUTOMATED_WINDOWS_PROBE
PORT_4175_TEST != PERMANENT_DEPLOY
UNKNOWN != PASS
```

## Próximo uso

Reaproveitar a mesma topologia para servir o MVP real: editar/rodar no CENTRALDARK-OS, visualizar no navegador da Casa em tempo real, e só promover para VPS quando a intenção exigir.
