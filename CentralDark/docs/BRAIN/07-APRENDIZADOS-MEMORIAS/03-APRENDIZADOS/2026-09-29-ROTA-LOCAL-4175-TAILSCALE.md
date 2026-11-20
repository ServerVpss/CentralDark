---
title: "Rota local 4175 → Casa via Tailscale"
date: 2026-09-29
status: PROVED_SCOPED_ROUTE
tags: [centraldark-os, local-first, tailscale, casa, mvp, porta-4175, interligados]
owner: "🔗 !># INTERLIGADOS"
centraldark_note_schema: "brain07.v1"
centraldark_category: "03-APRENDIZADOS"
centraldark_kind: "APRENDIZADO_OPERACIONAL"
centraldark_context_owner: "SEGREDO/CHEFE"
centraldark_intent_anchor: "Rota local 4175 → Casa via Tailscale"
centraldark_agent_recall: "Recuperar causa, correcao, efeito e contraprova antes de repetir trabalho."
centraldark_kaizen_policy: "docs/CONSCIENCIA/PROGRAMAS/KAIZEN-VIVO-INTENCAO-VIVA-20261008.md"
centraldark_kaizen_skill: ".agents/skills/kaizen-sistema-um/SKILL.md"
centraldark_kaizen_trigger: "MATERIAL_DELTA_WHEN_CONSUMED"
centraldark_kaizen_runtime: "UNKNOWN_UNTIL_CONSUMER_READBACK"
centraldark_metabolic_roles: ["gojo-seis-olhos","whis-orientacao","vegeta-resiliencia","beerus-autolimpeza","kaizen-continuo","sukuna-potencia-sob-controle"]
centraldark_metabolic_source: "apps/instinto-superior/src/components/central/MapaMetabolicoCristal.tsx"
centraldark_previous_blob_sha: "0848d8ae675515dcccff4d1fa72203326414c746"
centraldark_previous_path: "docs/BRAIN/07-APRENDIZADOS-MEMORIAS/2026-09-29-ROTA-LOCAL-4175-TAILSCALE.md"
centraldark_self_catalog: ".agents/skills/centraldark-operational-method/catalogo/META-RSI-40.md"
centraldark_self_primary: "Self-Recovery"
centraldark_self_related: ["Self-Monitoring","Self-Orientation"]
centraldark_self_skill_refs: [".agents/skills/centraldark-operational-method/Skills/self-recovery/SKILL.md",".agents/skills/centraldark-operational-method/Skills/self-monitoring/SKILL.md",".agents/skills/centraldark-operational-method/Skills/self-orientation/SKILL.md"]
centraldark_self_review: "APPLIED_OR_NOOP_JUSTIFIED_WHEN_RUNTIME_CONSUMES"
centraldark_self_activation: "RECALL_AND_REVIEW_ONLY_NOT_AUTOPATCH"
centraldark_self_runtime: "UNKNOWN_UNTIL_CONSUMER_READBACK"
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
