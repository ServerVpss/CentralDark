---
aliases:
  - CENTRALDARK
tags:
  - hermes
---
# Hermes Pivete — Free Router + MoA

## Aplicar

```powershell
.\APLICAR-CONFIG-TESTE.ps1
```

Para aplicar e reiniciar o Gateway:

```powershell
.\APLICAR-CONFIG-TESTE.ps1 -RestartGateway
```

## Provas rápidas

```powershell
pivete fallback list
pivete moa list
```

No Desktop, abra sessão nova e selecione:

```text
MoA: free-council
```

## O que mudou

- `fallback_providers` corrigido: deixou de ser string JSON e virou lista YAML oficial.
- 15 modelos OpenRouter HTTP 200 adicionados.
- Vision permanece no Gemini funcional e recebe fallback multimodal.
- Web extract, título, skills hub, curator e delegação usam rotas free testadas.
- Preset MoA `free-council` criado com tracing.

## Limite real

A cadeia nativa é ordenada, mas o fallback principal é limitado pelo runtime por turno.
O gateway/router próprio da CentralDark será a camada que garante cascata integral dentro da mesma chamada.
