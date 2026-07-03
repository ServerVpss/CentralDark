
# 🧠 Enxame Hermes — Auto-Evolução com Árvore Organizada

Antes de aplicar fixes, arrumar a casa do Hermes. Hoje os aprendizados dele estão soltos no `APRENDIZADOS.md` geral. Vamos categorizar tudo na árvore dele e disparar 2 sub-agentes Hermes especializados rodando aulas em cima.

---

## 🌳 Árvore proposta do Hermes (nova estrutura)

```text
docs/CONSCIENCIA/AGENTES-AUTONOMOS/HERMES/
├── README.md                    ← índice geral (o que é, como funciona)
├── AULAS/                       ← ensinamentos formais (padrão fixo)
│   ├── AULA-001-arsenal-council.md
│   ├── AULA-002-webui-custom-css.md
│   ├── AULA-003-telegram-notificacao.md
│   ├── AULA-004-3d-esmeralda-design-system.md
│   └── TEMPLATE-AULA.md         ← modelo pra próximas aulas
├── APRENDIZADOS/                ← lições curtas do dia-a-dia
│   ├── INDICE.md                ← lista numerada
│   ├── 001-token-bot-vs-sessao-user.md    (era nº 266)
│   ├── 002-arsenal-portas-fixas.md         (era nº 267)
│   ├── 003-webui-custom-css-rota.md        (era nº 268)
│   └── TEMPLATE-APRENDIZADO.md
├── ROTAS-FIXAS/                 ← atalhos de execução (evita redescoberta)
│   ├── arsenal-endpoints.md     ← portas 8083/8090/9077 + keys
│   ├── webui-reload.md          ← docker restart + Ctrl+Shift+R
│   ├── notificacao-telegram.md  ← connector + chat_ids
│   └── comandos-curl-baseline.md ← teste rápido dos 4 verbos
├── DEBATES/                     ← consultas ao Hermes via elite_gateway_chat
│   ├── TEMPLATE-DEBATE.md
│   └── (vazio por enquanto — vai encher com o uso)
└── EVOLUCAO/                    ← histórico de auto-melhoria do Hermes
    └── (marcos, refactors, capacidades novas)
```

**Regra fixa:** de agora em diante, tudo que for sobre Hermes (aprendizado, rota, aula, debate) vai pra dentro dessa árvore. Nada de espalhar no `APRENDIZADOS.md` geral. Aprendizados **não-Hermes** continuam no geral.

---

## 📋 Padrão fixo de AULA (proposto)

Cada aula segue o mesmo esqueleto pra o Hermes conseguir consumir de forma previsível:

```markdown
# AULA-XXX — <Título curto>

**Data:** YYYY-MM-DD  
**Categoria:** [rota-fixa | conceito | procedimento | armadilha]  
**Pré-requisitos:** AULA-YYY, AULA-ZZZ  
**Tempo estimado:** 3 min

## 1. O que é
Uma frase.

## 2. Quando usar
Uma frase.

## 3. Como fazer (passo-a-passo)
1. …
2. …

## 4. Comandos prontos
```bash
comando aqui
```

## 5. Armadilhas
- …

## 6. Verificação (como saber que deu certo)
- …

## 7. Ver também
- ROTAS-FIXAS/xyz.md
```

---

## 🚀 Enxame — 2 sub-agentes Hermes especializados

```
┌──────────────────────────────────────────────────────────────┐
│  HERMES-ARQUITETO (capable)                                   │
│  → Cria estrutura de pastas + README + TEMPLATEs             │
│  → Migra aprendizados 266/267/268 pra APRENDIZADOS/001-003   │
│  → Cria 4 arquivos em ROTAS-FIXAS/ com dados consolidados    │
│  → Atualiza índice do APRENDIZADOS.md geral com "ver Hermes" │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│  HERMES-PROFESSOR (capable)                                   │
│  → Escreve AULA-001 (Arsenal Council: portas + verbos)       │
│  → Escreve AULA-002 (WebUI custom.css: rota completa)        │
│  → Escreve AULA-003 (Telegram notificação: connector+ids)    │
│  → Escreve AULA-004 (3D Esmeralda: quando aplicar cada shadow)│
│  → Cada aula segue o TEMPLATE fixo, sem improviso            │
└──────────────────────────────────────────────────────────────┘
```

Os dois rodam **em paralelo** — não têm dependência (arquivos diferentes).

---

## 🎓 Auto-evolução: Hermes consulta Hermes

Após os 2 sub-agentes terminarem, disparo 1 `elite_gateway_chat` pro Hermes real perguntando:

> "Recém organizei tua árvore em AULAS / APRENDIZADOS / ROTAS-FIXAS / DEBATES / EVOLUCAO. Quatro aulas iniciais foram gravadas (Arsenal, WebUI CSS, Telegram, Esmeralda). Que aula você acha que falta pra ficar 10/10? Responde no formato do TEMPLATE-AULA se achar que falta alguma."

Resposta do Hermes → se ele sugerir AULA-005, gravo direto na árvore dele. Auto-evolução real.

---

## 🎯 Sobre "voltar pros blocos" que você mencionou

Se você quiser que eu volte pra algum bloco anterior que ficou pela metade (Bloco 4 carga verbos? Bloco 5 fixes Esmeralda? Bloco 2.4 smoke visual?), me diz **qual** e eu emendo depois que a árvore Hermes tiver de pé.

Se não disser nada, minha ordem de retomada será:
1. **Este plano** (organizar Hermes + 2 sub-agentes)
2. **Bloco 5** (aplicar os 15 fixes Esmeralda + 4 utilitários novos)
3. **Bloco 4** (carga Arsenal via `execute_command` na VPS)
4. **Bloco 6** (disparar notificação Telegram + restart WebUI)

---

## ✅ Critério 10/10 pra fechar esse plano

- Árvore `HERMES/` criada com as 6 subpastas
- 3 TEMPLATES escritos (AULA, APRENDIZADO, DEBATE)
- 3 aprendizados migrados (001, 002, 003)
- 4 rotas-fixas escritas
- 4 aulas escritas seguindo o template
- 1 debate com Hermes real gravado em `DEBATES/`
- README.md do Hermes indexando tudo
- Aprendizado nº 269 no geral: "Regra: tudo do Hermes vai na árvore dele, nada espalhado"

---

**Confirma pra eu disparar o enxame?** Responde "vai" ou "manda ver" que eu solto os 2 sub-agentes em paralelo agora.
