---
title: "Mapa Central do Cérebro Vivo — CentralDark"
date: 2026-06-29
tags: ["navegacao", "moc", "mapa", "cerebro"]
updated: 2026-06-29
---

# MAPA-DO-CEREBRO

> Mapa central de navegação do sistema de memória do CentralDark.
> Atualizado: 29 de junho de 2026

---

## 1. Visão Geral

O **CentralDark** possui duas camadas de memória que trabalham integradas:

- **`docs/CONSCIENCIA/`** — Camada **Universal** (fonte oficial de verdade). Toda IA lê aqui primeiro.
- **`docs/BRAIN/`** — Camada **Pessoal** (vault Obsidian do Pivete). Pensamentos, ideias, artefatos visuais.

Essas duas camadas se comunicam via **MCP**, **Bot Telegram** e **Guardião da Consciência**.

> Portão de entrada obrigatório: [[00-LEIA-PRIMEIRO]]

---

## 2. Estrutura Real (estado atual)

```
docs/
├── CONSCIENCIA/                    ← Camada Universal (IAs leem aqui)
│   ├── 00-LEIA-PRIMEIRO.md         ← Portão de entrada + tabela de roteamento
│   ├── MAPA-DO-CEREBRO.md          ← Este arquivo
│   ├── 01-IDENTIDADE.md            ← Quem é o Pivete, tom, idioma
│   ├── 02-PERMISSOES.md            ← O que pode/não pode fazer
│   ├── 03-FLUXO-DEPLOY.md          ← Como código vai pra produção
│   ├── 04-ESTRUTURA-VPS.md         ← Onde mora cada coisa na VPS
│   ├── 05-SSH-VPS.md               ← Como conectar na VPS
│   ├── 06-MCP-CENTRALDARK.md       ← O MCP e suas ferramentas
│   ├── 07-PENDENCIAS-E-HORARIO.md  ← Fontes únicas da verdade
│   ├── 08-HISTORICO-DECISOES.md    ← Decisões grandes já tomadas
│   ├── 09-ESTADO-ATUAL.md          ← Snapshot vivo do sistema
│   ├── 10-FALLBACK-LOVABLE.md      ← CRÍTICO: sync Lovable↔GitHub
│   ├── APRENDIZADOS.md             ← Base de conhecimento acumulada (259KB)
│   ├── CONSCIENCIA.md              ← Documento mestre (30KB)
│   ├── RETOMADA-*.md               ← Estado da última sessão IA
│   ├── ARTEFATOS/                  ← Técnicas e referências avançadas
│   │   └── TECNICAS-DE-LINKAGEM-SEMANTICA.md
│   └── ARQUIVO-MORTO/              ← Histórico obsoleto
│
└── BRAIN/                          ← Camada Pessoal (Obsidian)
    ├── BRAIN.md                    ← Documento raiz + link para CONSCIENCIA
    ├── INDEX.md                    ← Auto-gerado pelo workflow
    ├── 00-MAPA.md                  ← Mapa visual do sistema
    ├── 01-PENDENCIAS.md            ← Pendências prioritárias
    ├── 02-ARQUITETURA.md           ← Como o sistema funciona
    ├── 06-DECISOES.md              ← Decisões tomadas
    ├── 00 - Mapa do Sistema/
    ├── 05 - Documentacao/          ← Tutoriais e guias
    ├── 06 - Devedores & Contatos/  ← Financeiro pessoal
    └── 07 - Reuniões & Notas/      ← Notas rápidas e ideias
```

---

## 3. Componentes Ativos

| Componente | Função | Localização | Status |
|-----------|--------|------------|--------|
| **CONSCIENCIA** | Fonte oficial de regras e arquitetura | `docs/CONSCIENCIA/` | ✅ Ativo |
| **BRAIN** | Vault pessoal do Pivete (Obsidian) | `docs/BRAIN/` | ✅ Ativo |
| **MCP** | Hub de ferramentas (102 ferramentas) | Porta 9100 | ✅ Ativo |
| **Bot Telegram** | Cockpit principal de interação | `apps/bot-telegram/` | ✅ Ativo |
| **Guardião** | Vigia arquivos e atualiza painel | `infra/guardiao/` | ✅ Ativo |
| **Issues Agent** | Triagem automática de issues GitHub | `scripts/issues-agent/` | ✅ Ativo |
| **obsidian-writer** | Skill que grava notas no BRAIN | `apps/bot-telegram/skills/externas/` | ✅ Ativo |
| **memory-linker** | Varre gaps de memória e links quebrados | `scripts/memory-linker/` | 🔄 Planejado |

---

## 4. Fluxos Principais

```
Pivete fala no Telegram
  ↓ Bot detecta intenção via consciousness.cjs
  ↓ Roteia para skill correta (obsidian-writer, brainstorming, etc.)
  ↓ Grava em docs/BRAIN/ via GitHub
  ↓ Obsidian Git puxa em ≤10 min no PC do Pivete

Qualquer IA nova abre o repo
  ↓ Lê docs/CONSCIENCIA/00-LEIA-PRIMEIRO.md
  ↓ Segue ordem de leitura (01 → 12)
  ↓ Consulta RETOMADA-*.md se existir
  ↓ Opera com contexto completo

Claude Code / MCP modifica arquivos
  ↓ Commit no GitHub (fonte da verdade)
  ↓ Webhook da VPS puxa automaticamente
  ↓ PM2 recarrega processos afetados
  ↓ Painel atualiza em <30s
```

---

## 5. Mapas de Conteúdo (MOCs) — navegação por tema

| MOC | Tema | Status |
|-----|------|--------|
| [[MAPA-DO-CEREBRO]] | Visão geral de tudo | ✅ Este arquivo |
| [[00-LEIA-PRIMEIRO]] | Ordem de leitura + roteamento | ✅ Existe |
| [[CONSCIENCIA]] | Documento mestre das IAs | ✅ Existe |
| [[BRAIN]] | Raiz do vault do Pivete | ✅ Existe |

---

## 6. Conexões Rápidas

- [[00-LEIA-PRIMEIRO]] — portão de entrada com tabela de roteamento
- [[CONSCIENCIA]] — documento mestre (30KB, autoritativo)
- [[BRAIN]] — vault do Pivete, raiz do Obsidian
- [[08-HISTORICO-DECISOES]] — log de decisões importantes
- [[APRENDIZADOS]] — base de conhecimento acumulada
- [[TECNICAS-DE-LINKAGEM-SEMANTICA]] — como criar conexões inteligentes
- [[01-PENDENCIAS]] — o que está em aberto no BRAIN

---

## 7. Como Navegar

1. Comece pelo **[[00-LEIA-PRIMEIRO]]** — ele define a ordem e o roteamento
2. Use **este arquivo** para ter visão geral da estrutura física
3. Para temas específicos, siga os links em **Conexões Rápidas**
4. Se houver `RETOMADA-*.md`, leia antes de propor mudanças
5. Dúvida sobre onde gravar? Consulte a **tabela de roteamento** no `00-LEIA-PRIMEIRO.md`

---

## 8. Regras de Ouro

- Toda nota importante deve ter seção **Conexões Rápidas**
- Use **linkagem semântica** (com intenção) — ver [[TECNICAS-DE-LINKAGEM-SEMANTICA]]
- Atualize este mapa sempre que a estrutura principal mudar
- Nunca registre informação sensível (tokens, senhas, IDs internos)
- Áreas protegidas exigem "PERMITO PIVETE" antes de mexer

---

## Conexões Rápidas

- [[00-LEIA-PRIMEIRO]] — portão de entrada
- [[MAPA-DO-CEREBRO]] — visão geral
- [[CONSCIENCIA]] — documento mestre
