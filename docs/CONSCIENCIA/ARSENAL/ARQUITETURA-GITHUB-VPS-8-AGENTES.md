---
title: "ARQUITETURA GITHUB VPS 8 AGENTES"
date: 2026-07-10
tags: ["consciencia", "arsenal", "governanca"]
updated: 2026-07-10
---

# 🌐 Arquitetura GitHub ↔ VPS — Malha de 8 Agentes

> Definida pelo Pivete em 10/07/2026. Governança de mudanças: **GitHub audita e aprova, VPS recebe e executa.** Reviewer nos dois lados — nada passa sem revisão dupla.

![Fluxo GitHub ↔ VPS](imagens/fluxo-github-vps-8-agentes.png)

## Por que essa arquitetura existe

Depois de um dia inteiro corrigindo bugs decorrentes de mudanças aplicadas direto na VPS sem revisão adequada (conflitos de merge que derrubaram serviços em produção, credenciais com paths desatualizados, tabelas de banco inventadas sem confirmar o schema real), o Pivete definiu um fluxo de governança formal: **nenhuma mudança nasce ou é aplicada sem passar por auditoria e revisão em ambos os lados** — GitHub (onde a mudança nasce) e VPS (onde ela é executada).

## 1) Bloco GitHub — auditoria e segurança

**Repo = fonte da verdade.**

| Agente | Papel |
|---|---|
| `codex-github-auditor` | Varre o repo, workflows, paths antigos, riscos estruturais |
| `codex-github-security` | Procura self-hosted runner perigoso, push direto na `main`, secrets expostos, permissões erradas |
| `codex-github-reviewer` | Confere se a mudança bate com a estrutura real do projeto |
| `codex-github-promoter` | Só empacota o que já foi aprovado pelos outros 3 |

**Fluxo:**
1. Mudança nasce
2. Entra no repo
3. `auditor` analisa
4. `security` valida
5. `reviewer` aprova ou devolve
6. `promoter` gera o pacote aprovado

Se der ruim: devolve pro repo → corrige → roda de novo.

## 2) Bloco VPS — setor que recebe

**VPS não recebe tudo cru. VPS recebe só o aprovado.**

| Agente | Papel |
|---|---|
| `codex-vps-receiver` | Recebe o pacote vindo do GitHub |
| `codex-vps-reviewer` | Confere se está coerente com PM2, paths, env, estrutura real da VPS |
| `codex-vps-executor` | Aplica de fato |
| `codex-vps-observer` | Valida health, logs, status depois de aplicar |

**Estrutura de pastas do setor recebedor:**
```
inbox
queue
in_review
approved
rejected
reports
shadow_context
```

**Fluxo:**
1. Pacote aprovado chega na VPS
2. `receiver` coloca em `inbox`/`queue`
3. `reviewer` confere
4. Se OK → `approved`
5. Se ruim → `rejected`
6. `executor` aplica
7. `observer` valida
8. Relatório volta pro GitHub/docs

## 3) Sincronia entre os dois blocos

```
GitHub audita e limpa
    ↓
GitHub aprova
    ↓
VPS recebe
    ↓
VPS revisa
    ↓
VPS executa
    ↓
VPS prova com log/health
    ↓
resultado volta pra docs/repo
```

## 4) Regra de ouro

- GitHub pensa e autoriza.
- VPS recebe e executa.
- Reviewer existe nos dois lados.
- Se não estiver coerente, volta.
- Se estiver coerente, segue.

## 5) Referências visuais

Variações do infográfico oficial da arquitetura:

![Variação 2](imagens/fluxo-github-vps-8-agentes-2.png)
![Variação 3](imagens/fluxo-github-vps-8-agentes-3.png)
![Variação 4](imagens/fluxo-github-vps-8-agentes-4.png)
![Variação 5](imagens/fluxo-github-vps-8-agentes-5.png)

## 6) Integração com Telegram — labels existentes

Respeitar labels já em uso no dispatcher de bots (`.github/workflows/dispatcher-bots.yml`, `bots-labels-seed.yml`) — ex: `assign:chatgpt`, `assign:codex`, `assign:lovable`. Criar labels novos só se genuinamente necessário para os 8 papéis acima (ex: `codex-github-auditor`, `codex-vps-receiver` etc podem virar labels de Issue/PR se fizer sentido pro fluxo de trabalho real).

## Status

🟡 **Ainda não implementado.** Este documento registra a arquitetura definida pelo Pivete. Próximo passo: criar o checklist exato de implementação dos 8 agentes (scripts, workflows do GitHub Actions para o bloco GitHub, e a estrutura de pastas + scripts para o bloco VPS).

## Conexões Rápidas

- [[MULTI-MODEL-ORCHESTRATION]] — vocabulário de orquestração multi-agente
- [[CONSELHO]] — Arsenal Council
- [[README]] — índice do Arsenal
