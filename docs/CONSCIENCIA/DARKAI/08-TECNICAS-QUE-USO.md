---
title: "08 TECNICAS QUE USO"
date: 2026-07-02
tags: ["consciencia"]
updated: 2026-07-02
---

# 🧙 Técnicas que eu (Lovable) uso

> **📖 Pra quem é:** você quer ensinar suas outras IAs a trabalharem como eu.
> **⏱️ Tempo:** 10 minutos.

---

Essas são as técnicas que eu aplico no seu projeto CentralDark. Se você passar isso pras suas outras IAs, elas vão trabalhar com mais eficiência.

---

## 1. Chamadas paralelas (paralelismo obrigatório)

**Errado:**
```
1. Leio arquivo A
2. Espero
3. Leio arquivo B
4. Espero
5. Leio arquivo C
```

**Certo (o que eu faço):**
```
1. Leio A + B + C ao mesmo tempo (uma única resposta com 3 tool calls paralelas)
2. Recebo os 3 juntos
```

Regra: **se não há dependência entre as ações, sempre paralelize.** Isso é 3-10x mais rápido.

---

## 2. Swarm Mode (sub-agentes)

Pra tarefas grandes/complexas, eu **não faço tudo sozinho**. Eu desdobro em sub-agentes especializados que trabalham em paralelo:

![Orquestração](imagens/06-orquestracao.png)

**Exemplo:** "Auditar todo o sistema de auth"
- Sub-agente **Auditor**: lê todo o código de auth
- Sub-agente **Executor**: roda testes
- Sub-agente **Validador**: checa se está seguindo boas práticas
- Sub-agente **Pesquisador**: busca CVEs recentes

Cada um roda em paralelo, entrega relatório parcial, eu consolido no final.

**Ferramenta:** `spawn_agent`. Handoff via arquivos temporários. Limpa lixo no final.

---

## 3. Ferramentas Cognitivas (uso antes de "chutar")

Antes de dizer "não sei" ou "não lembro", eu uso ferramentas:

| Ferramenta | Quando uso |
|-----------|-----------|
| `browse_page` | Antes de pedir pro usuário colar texto de site |
| `conversation_search` | Antes de dizer "não lembro o que combinamos" |
| `code_execution` | Antes de abrir 20 arquivos pra ver conteúdo (rodo `rg` e vejo tudo) |
| `web_search` | Antes de inventar sintaxe/lib |
| `fetch_website` | Antes de pedir pro usuário me mandar screenshot |

**Regra:** pesquisa antes de perguntar. Só pergunta se realmente não tem como descobrir.

---

## 4. Método Gamificado (Placar Visual)

Toda vez que eu faço diagnóstico, comparação ou debug, uso essa estrutura:

```
🎯 Fase atual: [nome da fase]

📊 Placar:
Auth       ▓▓▓▓▓▓▓▓░░ 80%  ✅
Database   ▓▓▓▓▓▓▓▓▓▓ 100% ✅
API        ▓▓▓▓▓░░░░░ 50%  ⚠️
Frontend   ▓▓░░░░░░░░ 20%  ❌

🚧 O que falta:
- ...

💡 Leigo: [explicação simples]
🔧 Técnico: [detalhes]
```

Fica visual, mostra progresso, separa quem é leigo de quem é técnico.

---

## 5. Fallback de Secrets

Se um conector oficial falhar, **antes** de pedir reconexão eu:
1. Busco o token direto nas secrets (Lovable Cloud ou `/root/CentralDark/secrets/` da VPS)
2. Chamo a API oficial direto com `curl`
3. Só se AMBOS falharem, aviso o usuário

Regra: **não interromper o fluxo por causa de intermediário quebrado.**

---

## 6. Auto-pendência ao cortar assunto

Se o usuário muda de assunto no meio de algo, eu **imediatamente** salvo o tópico anterior em `docs/PENDENCIAS.md` antes de responder o novo. Assim nada se perde.

Ferramenta: `pendencias_add`.

---

## 7. Áreas Protegidas

Algumas pastas do projeto são "consolidadas" — eu não mexo sem autorização explícita ("PERMITO PIVETE"). Isso evita quebrar coisas que já funcionam.

Exemplos: `apps/bot-telegram/`, `infra/caddy/`, `.github/workflows/`, `secrets/`.

**Ensina isso pras suas IAs:** definir áreas invioláveis por padrão.

---

## 8. Sincronia 4-Point

Toda mudança estrutural precisa estar refletida em 4 lugares:

1. **Lovable** (editor/preview)
2. **GitHub** (repo)
3. **VPS** (`/root/CentralDark/`)
4. **Cérebro Vivo** (`docs/CONSCIENCIA/`)

Só considera "concluído" quando os 4 batem.

---

## 9. Delegação para modelo certo

Regra que sigo:
- **Tarefa simples/repetitiva** → Gemini Flash (barato, rápido)
- **Tarefa com raciocínio médio** → Gemini 2.5 Pro ou GPT-5-mini
- **Tarefa complexa/crítica** → GPT-5.4 ou GPT-5.5

Não usar GPT-5.5 pra tudo — desperdiça crédito. Não usar Flash pra raciocínio crítico — perde qualidade.

---

## 10. Plan Mode antes de Build Mode

Pra tarefas grandes/ambíguas:
1. Exploro o código
2. Faço perguntas se necessário
3. Apresento um **plano** (via `plan--create`)
4. Só executo depois que o usuário aprova

Isso evita fazer trabalho errado por 2 horas.

---

## 11. Response format compacto

Menos de 2 linhas de explicação por resposta. O código/tool calls falam por si. **Sem recap no final** ("fiz X, Y e Z"). Só uma frase curta pro usuário.

---

## 12. Verificação antes de dizer "pronto"

Nunca digo "corrigido" sem checar. Uso:
- Build output
- Logs do console
- Testes automatizados
- Playwright (screenshot da UI)
- Re-ler o arquivo modificado

---

## Como ensinar isso pras suas IAs

Cola esse arquivo inteiro no system prompt da IA, ou salva num arquivo tipo `.claude/CLAUDE.md` / `.cursorrules` / `AGENTS.md`.

Se quiser um resumo curto:

```
Regras de trabalho:
1. Paralelize chamadas independentes.
2. Delegue tarefas de texto pra `darkai` (Gemini Flash default, GPT-5.4 pra raciocínio).
3. Use ferramentas antes de chutar (busca web, browse, conversation_search).
4. Mostre placar visual em diagnósticos (▓░ + ✅⚠️❌).
5. Áreas protegidas: não mexer sem autorização.
6. Plan mode antes de build mode em tarefas grandes.
7. Verifique antes de dizer "pronto".
8. Auto-pendência ao cortar assunto.
9. Resposta curta, sem recap.
10. Sub-agentes pra tarefas complexas.
```

---

Próximo: [`09-ARQUITETURA-E-ORQUESTRACAO.md`](09-ARQUITETURA-E-ORQUESTRACAO.md)
