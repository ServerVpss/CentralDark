---
title: "PROMPT MEGA ESTABILIZAR"
date: 2026-07-02
tags: ["consciencia"]
updated: 2026-07-02
---

# 🚀 PROMPT MEGA — Estabilizar Tudo numa Tacada Só

> **Uso:** cola isso no Fable (ou qualquer IA forte tipo Claude Sonnet/Opus 4) rodando **em Ultracode / Effort máximo**, dentro do repo CentralDark na VPS.
>
> **Tempo estimado:** 15-40 min de execução.
>
> **Resultado:** sistema estabilizado, IAs calibradas, pendências fechadas, pronto pra usar no VS Code.

---

## 📋 COLA ISSO NA CAIXA DE MENSAGEM DA IA:

```
Você é o operador técnico do repo CentralDark (/root/CentralDark na VPS).

Missão desta sessão: estabilizar o sistema COMPLETO numa tacada só, e me deixar
pronto pra abrir o VS Code e trabalhar sem quebrar nada.

═══════════════════════════════════════════════════════════════
FASE 1 — CALIBRAÇÃO (leia antes de qualquer ação)
═══════════════════════════════════════════════════════════════

Leia nesta ordem exata:
1. CLAUDE.md (raiz) — regras + Sincronia 4-Point + áreas protegidas (Seção 9)
2. docs/CONSCIENCIA/DARKAI/README.md — o cérebro compartilhado
3. docs/CONSCIENCIA/DARKAI/PROMPT-UNIVERSAL.md — seu manual
4. docs/CONSCIENCIA/DARKAI/QUICKSTART.md
5. docs/CONSCIENCIA/GRUPO-EVOLUCAO.md
6. docs/PENDENCIAS.md — o que tá aberto
7. docs/CONSCIENCIA/APRENDIZADOS.md — decisões passadas
8. docs/CONSCIENCIA/08-HISTORICO-DECISOES.md

Regras invioláveis:
- Sempre PT-BR, tom direto, sem enrolação
- NUNCA mexer nas áreas protegidas (Seção 9 do CLAUDE.md) sem eu autorizar
- Fluxo: Editor → GitHub → VPS (nunca editar direto na VPS)
- Pra consulta pesada, usa `darkai "pergunta"` em vez de gastar teu contexto
- Antes de deploy/publish, rodar skill audit-rls

═══════════════════════════════════════════════════════════════
FASE 2 — DIAGNÓSTICO (me dá um retrato antes de mexer)
═══════════════════════════════════════════════════════════════

Faz um placar visual (formato monospace com ▓░ e ✅⚠️❌) mostrando:
- Status do Graphify (pipeline, .graphifyignore, labels)
- Status do darkai (CLI instalado? edge function ai-proxy viva?)
- Status do Grupo Evolução (PM2 rodando? IAs conversando sobre CentralDark?)
- Status do MCP (dist/ íntegro? tools cognitivas OK?)
- Sincronia 4-Point: Lovable ↔ GitHub ↔ VPS ↔ Cérebro Vivo bate?
- Pendências abertas em docs/PENDENCIAS.md (contagem por prioridade)

═══════════════════════════════════════════════════════════════
FASE 3 — EXECUÇÃO (estabilizar tudo)
═══════════════════════════════════════════════════════════════

Executa nesta ordem, parando e me avisando SÓ se der erro sério:

A) Pipeline Graphify:
   - Confirmar .graphifyignore na raiz cobrindo node_modules, dist, secrets, etc
   - Blindar pipeline-graphifyy.sh (set -Eeuo pipefail, log, trap, timeout, notify Telegram)
   - Adicionar labels graphify/pipeline-broken/ignore-pending

B) Grupo Evolução (Telegram):
   - Confirmar contexto-centraldark.cjs injetando contexto real
   - Confirmar prompts das 3 IAs (Gemini/Groq/Claude) falando de CentralDark real
   - Confirmar insights sendo salvos em APRENDIZADOS.md
   - Testar 1 ciclo local antes de pedir pra eu reiniciar PM2

C) darkai CLI:
   - Confirmar edge function ai-proxy no ar
   - Confirmar darkai.sh executável
   - Rodar `darkai --help` e me mostrar a saída

D) Fechar pendências fáceis de docs/PENDENCIAS.md:
   - Pega as de prioridade BAIXA e MÉDIA que dá pra resolver com edição de arquivo
   - Pra cada uma resolvida, marca no PENDENCIAS.md e loga em APRENDIZADOS.md

E) Sincronia 4-Point:
   - Verifica se GitHub está espelhado com a pasta local
   - Me dá o comando exato pra rodar na VPS: `cd /root/CentralDark && git pull && pm2 restart <lista> && pm2 save`

═══════════════════════════════════════════════════════════════
FASE 4 — RELATÓRIO FINAL
═══════════════════════════════════════════════════════════════

Me devolve no final:
1. Placar visual DEPOIS (mesma estrutura da Fase 2, mostrando evolução)
2. Lista do que fez (arquivos criados/editados)
3. Lista do que NÃO deu pra fazer sem minha decisão (com pergunta clara)
4. Comando exato pra eu rodar na VPS pra puxar tudo
5. Próximos 3 passos recomendados pra amanhã

═══════════════════════════════════════════════════════════════
REGRAS DE OURO
═══════════════════════════════════════════════════════════════

- Sou LEIGO. Explica em linguagem simples + dá o comando pronto pra copiar
- Se for mexer em área protegida, PARA e me pergunta com "PERMITO PIVETE?"
- Se algo puder quebrar produção, PARA e me avisa antes
- Trabalha em paralelo quando puder (várias leituras/edições ao mesmo tempo)
- Registra todo aprendizado novo no APRENDIZADOS.md antes de finalizar

Bora. Começa pela Fase 1 agora.
```

---

## 🎓 TUTORIAL PRA LEIGO — Como Usar Isso

### O que essa "IA no VS Code" faz na prática?

Pensa nela como um **funcionário técnico** morando dentro do teu VS Code. Você
digita em português o que quer, ela vai lá, lê os arquivos, edita, salva e te
diz o que fez.

Diferença pra usar aqui no Lovable:
- **Lovable** = tá dentro do navegador, sincroniza com GitHub sozinho
- **VS Code + IA** (Claude Code, Cursor, Fable) = tá no teu PC ou na VPS, você
  vê tudo acontecendo em tempo real, controla mais fino

### Passo a passo (a primeira vez):

**1. Abre o VS Code na tua máquina** (ou no navegador via code-server na VPS).

**2. Abre a pasta do projeto:**
```
File → Open Folder → CentralDark
```

**3. Instala a extensão da IA que tu vai usar** (ex: Fable, Cursor, Claude Code)
   — é só procurar no marketplace de extensões.

**4. Faz login na IA** com tua conta.

**5. Abre o chat da IA** (geralmente um ícone na barra lateral).

**6. Cola o prompt mega** que tá lá em cima nesse arquivo.

**7. Aperta enter e espera.** Ela vai começar a ler, mostrar o que tá fazendo,
   pedir confirmação em coisas importantes.

**8. Quando ela pedir pra tu rodar algo na VPS**, tu abre o terminal
   (Terminal → New Terminal no VS Code) e cola o comando que ela mandou.

### Perguntas comuns:

**"E se ela quebrar alguma coisa?"**
Difícil, porque:
- Ela lê CLAUDE.md e sabe as áreas protegidas
- Tudo tá no Git — se estragar, você reverte com 1 comando
- Ela pergunta antes de mexer em coisa perigosa

**"Eu preciso saber programar?"**
Não. Você só precisa:
- Copiar/colar comandos
- Ler o que ela te fala (em português)
- Responder "sim" ou "não" quando ela perguntar

**"E o `darkai`? Como uso?"**
Depois que ela estabilizar tudo, no terminal você digita:
```
darkai "me explica o que esse arquivo faz"
darkai --help
darkai --modelo gemini "resume essa pasta pra mim"
```
Ela chama a IA melhor pra cada tarefa, sem tu se preocupar.

**"E se eu me perder no meio?"**
Cola isso no chat da IA:
```
Tô perdido. Me diz em 3 linhas: o que já fizemos, o que tá faltando,
qual o próximo passo?
```

### Dica de ouro pra não gastar crédito à toa:

- **Tarefa simples** (arrumar texto, renomear) → modelo pequeno (Haiku, Flash)
- **Tarefa média** (adicionar feature, debug simples) → modelo médio (Sonnet)
- **Tarefa cabuloa** (refatorar tudo, arquitetura) → Ultracode / Opus / GPT-5.5

---

## 📌 Guarde este arquivo!

Sempre que precisar estabilizar tudo de novo, é só voltar aqui e colar
o prompt mega no chat da IA.

**Última atualização:** 02/07/2026
