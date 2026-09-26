---
title: "Mapa do Segundo Cérebro CentralDark"
date: 2026-06-29
tags: ["navegacao", "mapa", "centraldark", "obsidian", "cerebro-de-aco"]
updated: 2026-09-05
---

# 🗺️ MAPA — Segundo Cérebro CentralDark

## Entrada rápida

| Área | Arquivo |
|---|---|
| Cérebro principal | `docs/BRAIN/BRAIN.md` |
| Pendências | `docs/BRAIN/01-PENDENCIAS.md` |
| Arquitetura | `docs/BRAIN/02-ARQUITETURA.md` |
| Decisões | `docs/BRAIN/06-DECISOES.md` |
| Consciência mestra | `docs/CONSCIENCIA/CONSCIENCIA.md` |
| Aprendizados | `docs/CONSCIENCIA/APRENDIZADOS.md` |
| Pendências oficiais | `docs/PENDENCIAS.md` |
| Design system | `docs/ARQUITETURA/DESIGN-SISTEMA.md` |
| Padrão de resposta | `docs/CONSCIENCIA/2026-06-20-padrao-resposta-pivete.md` |
| Camada visual Vibe | `docs/CONSCIENCIA/21-PADRAO-APRESENTACAO.md` |

---

## CÉREBRO DE AÇO (Núcleo de Operação)

> Quatro pilares interdependentes. Alteração em um reflete nos outros.

### 🧠 NEXUS COGNITIVO — Open WebUI
- **Função:** QG de pensamento, chat e exploração com IA
- **URL:** `ui.centralldark.com`
- **Container:** `CentralDark-WebUI` (porta 3000)
- **Local:** `/root/CentralDark/apps/modulos/WebUI/`
- **Compose:** `apps/modulos/WebUI/docker-compose.yml`
- **Providers ativos:** Elite Gateway (`api.centralldark.com/v1`) + Anthropic key (`sk-lab-`)

### 🛠️ FÁBRICA DE ARTEFATOS — Builder Bolt
- **Função:** Execução rápida, codificação e geração de frontend com IA
- **URL:** `builder.centralldark.com`
- **Container:** `CentralDark-Builder` (porta 5174 → 5173)
- **Local:** `/root/CentralDark/apps/modulos/Bolt/`
- **Compose:** `apps/modulos/Bolt/docker-compose.yml`
- **Providers ativos:** Anthropic via `claude.ap7.site` + Elite Gateway + Cerebras + OpenRouter

### 🌐 ELITE GATEWAY — Proxy Anthropic
- **Função:** Gerenciamento de chaves, rotação inteligente e proxy puro para Anthropic
- **URL:** `api.centralldark.com/v1`
- **PM2:** `CentralDark-EliteAnthropicProxy` (id 37, **porta 8082**, online) + `elite-http-gateway` (porta 8080)
- **Local:** `/root/CentralDark/apps/modulos/elite-anthropic-proxy/`
- **Upstream:** `claude.ap7.site` → Anthropic API
- **Rotação de keys:** round-robin via `keys.json` (asyncio.Lock, cycle seguro)
- **Log:** `/var/log/centralldark/elite-anthropic.log` (rotating, max 5MB × 3)
- **Health check:** `GET /health` → JSON com `status`, `keys_count`, `version`, `upstream`
- **Status:** ✅ **OPERACIONAL desde 29/06/2026**
- **Integrado em:** Builder Bolt (`VITE_ANTHROPIC_API_BASE`) + Open WebUI (provider custom)

### 🚀 INTERFACE — TelePainel
- **Função:** Painel de controle visual, centralizador e cockpit do sistema
- **URL:** `telepainel.centralldark.com` (ou subdomínio definido)
- **Local:** `/root/CentralDark/apps/TelePainel/`
- **Status:** ativo

---

### Fluxo unificado do Cérebro de Aço

```text
Pivete
  ├─ pensa / explora  →  🧠 NEXUS COGNITIVO   (ui.centralldark.com)
  ├─ cria / codifica  →  🛠️ FÁBRICA DE ARTEFATOS (builder.centralldark.com)
  ├─ controla / vê    →  🚀 INTERFACE           (TelePainel)
  └─ tudo passa por   →  🌐 ELITE GATEWAY       (api.centralldark.com/v1)
                                ↓
                        claude.ap7.site
                                ↓
                        Anthropic API (key rotacionada)
```

### Regra de Ouro — Cérebro de Aço

> Qualquer alteração estrutural em um dos quatro pilares deve:
> 1. Ser refletida nos outros três (config, env, compose)
> 2. Ser registrada em `docs/CONSCIENCIA/08-HISTORICO-DECISOES.md`
> 3. Receber commit com prefixo `feat(cerebro-de-aco)` ou `fix(cerebro-de-aco)`

---

## Mapa operacional

```text
Usuário / Pivete
      ↓
ChatGPT / Claude / agentes
      ↓
MCP CentralDark
      ↓
GitHub ServerVpss/CentralDark
      ↓
Workflows / Webhook / VPS
      ↓
Mega Painel / Relatórios / Obsidian Git
```

---

## Como usar no Obsidian — CURRENT

1. Abrir o vault vivo `E:\CentralDark\Pivete\CentralDark\docs\BRAIN`.
2. Rodar `Obsidian Git: Pull`.
3. Começar por `docs/BRAIN/00-MAPA-SISTEMA/BRAIN.md`.
4. Consultar `docs/BRAIN/00-MAPA-SISTEMA/INDEX.md` para navegação completa.
5. Consultar `docs/BRAIN/04-DECISOES/01-PENDENCIAS.md` antes de decidir próxima tarefa.
6. Consultar `docs/BRAIN/00-MAPA-SISTEMA/02-ARQUITETURA.md` antes de mexer em fluxo, webhook, MCP ou VPS.

### Política de disco da Casa

- `E:\CentralDark` = **CASA OPERACIONAL VIVA** no Windows.
- `C:\CentralDark` = **LEGADO / FONTE A RECONCILIAR**, nunca baseline viva por padrão.
- Caminhos do Windows em `C:\Program Files` e `C:\Users\...\AppData` podem continuar em `C:` quando pertencem a software/perfil externo (Chrome, Claude, Hermes, Windows). Isso não cria uma segunda Casa.
- Dado próprio da CentralDark encontrado sob `C:\CentralDark` deve emitir `HOUSE_PATH_DRIFT` e passar por `META_LUPA → CARACOL_REVERSO → RECONCILIAR` antes de mover, apagar ou reescrever.
- Relatórios históricos podem citar `C:\CentralDark`; história não é CURRENT.

---

## Regra de ouro

```text
Se não está no GitHub, não é fonte oficial estrutural.
Se é runtime Windows da Casa, E:\CentralDark é a casa operacional vigente.
Se é decisão operacional, precisa virar doc, pendência, relatório ou memória.
CURRENT > HISTORY. UNKNOWN != PASS.
```

---

> Portainer (visualização de containers): `portainer.centralldark.com`

---

## Conexões Rápidas

- [[BRAIN]] — documento raiz
- [[01-PENDENCIAS]] — o que está em aberto
- [[02-ARQUITETURA]] — como o sistema funciona
- [[06-DECISOES]] — decisões tomadas
- [[08-HISTORICO-DECISOES]] — log de decisões do Cérebro de Aço
- [[MAPA-DO-CEREBRO]] — visão da camada CONSCIENCIA
