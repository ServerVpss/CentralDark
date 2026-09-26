# ⏸️ GUIA PRÁTICO: PAUSAR E CONTINUAR COM CODEX

**Data:** 24 de fevereiro de 2026
**Versão:** 1.0
**Status:** ✅ Pronto para usar

---

## 🎯 VISÃO GERAL

Você pode pausar seu trabalho a **qualquer momento** e retomar **perfeitamente** na próxima sessão.

```
HOJE                          AMANHÃ/DEPOIS
┌──────────────┐             ┌──────────────┐
│ Trabalho 1   │  PAUSA      │              │
│ Trabalho 2   │─────────→   │ RETOMA       │
│ [PAUSAR]     │             │ Trabalho 1   │
└──────────────┘             │ Trabalho 2   │
                             └──────────────┘
```

---

## ⏸️ COMO PAUSAR (3 FORMAS)

### FORMA 1: Pausa Manual Rápida

**Quando usar:** Você quer sair agora, continuar depois

**O que fazer:**

```
1. Digite no chat:
   "Vou pausar aqui. Checkpoint de [seu contexto]"

2. Eu vou:
   ✅ Salvar estado atual
   ✅ Fazer git commit
   ✅ Gerar arquivo de resumo
   ✅ Confirmar que tudo está salvo

3. Você:
   ✅ Pode fechar o chat
   ✅ Sair tranquilo
   ✅ Tudo está seguro
```

**Exemplo:**
```
Você: "Pausar agora. Dual-pillar squad no meio do sprint 1"
Eu:  "✅ Estado salvo. Checkpoint criado. Próximos passos documentados."
```

---

### FORMA 2: Pausa com Snapshot

**Quando usar:** Você quer detalhar exatamente o que pausou

**O que fazer:**

```
1. Digite no chat:
   "Quero pausar e fazer snapshot de:
    - Pilar 1: Onde parou exatamente
    - Pilar 2: Próximos passos
    - Squad: Status dos agentes"

2. Eu vou:
   ✅ Gerar relatório completo
   ✅ Listar tudo que foi feito
   ✅ Apontar exatamente próximos passos
   ✅ Criar arquivo .md de snapshot

3. Você:
   ✅ Tem documento completo
   ✅ Sabe exatamente por onde retomar
```

**Exemplo:**
```
Você: "Snapshot do progress: pilar 1 status, pilar 2 status, blockers"
Eu:  "✅ Snapshot criado em: .checkpoint/session-2026-02-24-1435.md"
```

---

### FORMA 3: Pausa Automática (95%)

**Quando usa:** Sistema detecta 95% de tokens

**O que acontece:**

```
Sistema detecta 95%
        ↓
Aviso crítico exibido
        ↓
Checkpoint salvo automaticamente
        ↓
Git commit automático
        ↓
Você é informado
        ↓
Pausa automática (sem perda)
```

**Você não precisa fazer nada** - é automático!

---

## 🔄 COMO CONTINUAR (3 FORMAS)

### FORMA 1: Continua Simples

**Use quando:** Você sabe aproximadamente onde parou

**O que fazer:**

```
1. Abra novo chat/sessão

2. Digite:
   "Continua de onde parou no dual-pillar squad"
   ou
   "Retoma Sprint 1 do squad"

3. Eu vou:
   ✅ Carregar contexto anterior
   ✅ Mostrar resumo do que foi feito
   ✅ Apontar próximos passos
   ✅ Você continua
```

**Exemplo:**
```
Você: "Continua do dual-pillar squad"
Eu:  "✅ Context carregado.
      Last session: 24/fev 14:35
      Completado: Squad + agents + backlog
      Próximo: Daily standup com @squad-master"
```

---

### FORMA 2: Continua com Checkpoint Específico

**Use quando:** Você tem o timestamp exato

**O que fazer:**

```
1. Abra novo chat/sessão

2. Digite:
   "Continua do checkpoint 24/fev 14:35"
   ou
   "Retoma de session-20260224-1435.md"

3. Eu vou:
   ✅ Ler arquivo de checkpoint exato
   ✅ Carregar contexto preciso
   ✅ Mostrar estado exato de parada
   ✅ Você continua de lá
```

**Exemplo:**
```
Você: "Continua do checkpoint 24/fev 14:35"
Eu:  "✅ Checkpoint 14:35 carregado
      Status: Sprint 1 + Architect design
      Bloqueadores: Nenhum
      Próximo: Daily standup"
```

---

### FORMA 3: Continua Forçada (Recovery)

**Use quando:** Houve erro ou quer estado anterior específico

**O que fazer:**

```
1. Abra novo chat/sessão

2. Digite:
   "Recovery: retoma do snapshot de [data]"
   ou
   "Preciso voltar pra antes de [timestamp]"

3. Eu vou:
   ✅ Listar checkpoints disponíveis
   ✅ Carregar o que você pediu
   ✅ Reverter ao estado anterior se necessário
   ✅ Continuar de lá
```

**Exemplo:**
```
Você: "Recovery: retoma do checkpoint 23/fev 18:00"
Eu:  "✅ Snapshot 23/fev 18:00 carregado
      Estado: Antes de criar squad
      Quer continuar daqui? [sim/não]"
```

---

## 📋 GUIA PASSO-A-PASSO

### CENÁRIO 1: Pausar AGORA

```
HOJE (14:35)
├─ Você: "Vou pausar aqui"
├─ Eu: Salvo tudo
├─ Git: Commit automático
└─ Arquivo: Checkpoint criado ✅

AMANHÃ (09:00)
├─ Novo chat/sessão
├─ Você: "Continua do dual-pillar squad"
├─ Eu: Context carregado
├─ VOCÊ CONTINUA: Próximas tarefas
└─ Sem perda ✅
```

### CENÁRIO 2: Pausar com Detalhe

```
HOJE (14:35)
├─ Você: "Snapshot do progresso completo"
├─ Eu: Gero relatório detalhado
├─ File: .checkpoint/session-20260224-1435.md
└─ Status: Documentado ✅

AMANHÃ (09:00)
├─ Novo chat/sessão
├─ Você: "Continua de 24/fev 14:35"
├─ Eu: Arquivo carregado + status mostrado
├─ VOCÊ CONTINUA: Próximas tarefas exatas
└─ Sem surpresa ✅
```

### CENÁRIO 3: Pausa Automática (95%)

```
HOJE (16:52)
├─ Uso: 95% detectado 🛑
├─ Sistema: Salva tudo automaticamente
├─ Aviso: Você é informado
└─ Status: Pausa segura ✅

AMANHÃ (09:00)
├─ Novo chat/sessão
├─ Você: "Continua de 24/fev 16:52"
├─ Eu: Context carregado (95% pause point)
├─ VOCÊ CONTINUA: Próximas tarefas
└─ Sem perda, sem surpresa ✅
```

---

## 🔍 O QUE É PRESERVADO

### Quando você pausa e retoma:

✅ **Código criado**
- Todos os arquivos salvos
- Git commits feitos
- Nenhuma perda

✅ **Contexto**
- Conversa anterior comprimida
- Resumo do progresso
- Próximos passos claros

✅ **Estado do Squad**
- Agentes e suas responsabilidades
- Tarefas criadas/em progresso
- Backlog e sprints

✅ **Decisões**
- Arquitetura definida
- Tech stack escolhido
- Riscos identificados

### O que NÃO é preservado:

❌ Conversas muito antigas (>10 mensagens)
- São comprimidas em resumo

❌ Tokens gastos em exploração
- Novamente você precisa explorar se necessário

❌ Estado de agentes em execução
- Agentes pausam quando sessão termina

---

## 🛠️ FERRAMENTAS ÚTEIS

### Ver Checkpoints Salvos

```bash
ls -la .claude/checkpoints/
# Mostra todos os checkpoints disponíveis
```

### Ver Log de Tokens

```bash
cat .claude/checkpoints/token-usage-log.json | jq .
# Mostra consumo de tokens
```

### Ler Último Checkpoint

```bash
cat $(ls -t .claude/checkpoints/checkpoint-*.md | head -1)
# Mostra último checkpoint salvo
```

---

## 📞 EXEMPLOS REAIS

### Exemplo 1: Pausa Rápida

```
VOCÊ:
"Preciso ir agora. Pauso aqui no squad."

EU:
"✅ Checkpoint salvo
- Criado: Squad dual-pilar (11 agentes)
- Status: Config.yaml + backlog + workflows
- Próximo: Daily standup
- Tempo: ~2h de trabalho"

AMANHÃ:
VOCÊ: "Continua squad"
EU: "[Carrega contexto] Próximo: ativar @squad-master"
```

### Exemplo 2: Pausa com Detalhe

```
VOCÊ:
"Quero snapshot completo antes de pausar"

EU:
"✅ Snapshot criado (3 partes):
- PILAR 1: Make.com setup + Twilio pronto
- PILAR 2: Kajabi decidido + schema planejado
- SQUAD: 11 agentes configurados
- Arquivo: .checkpoint/snap-20260224-1435.md"

AMANHÃ:
VOCÊ: "Continua de 24/fev 14:35"
EU: "[Abre arquivo exato] Próximos passos..."
```

### Exemplo 3: Pausa Automática 95%

```
SISTEMA:
"🛑 95% de tokens atingido
- Checkpoint: Salvo automaticamente
- Arquivo: .checkpoint/session-20260224-1652.md
- Status: Pronto para retomar amanhã"

AMANHÃ:
VOCÊ: "Continua de 24/fev 16:52"
EU: "[Context carregado] Você estava em..."
```

---

## 🎯 BOAS PRÁTICAS

### ✅ FAZER

- ✅ Pausar quando cansado
- ✅ Pausar entre grandes tarefas
- ✅ Tirar snapshot se tiver feito muito
- ✅ Usar timestamps se possível
- ✅ Deixar mensagem clara sobre contexto

### ❌ EVITAR

- ❌ Deixar tarefas que devem ser continuadas não documentadas
- ❌ Esquecer de fazer git commit antes de pausar
- ❌ Assumir que vai lembrar tudo depois
- ❌ Pausar no meio de operação crítica

---

## 🆘 TROUBLESHOOTING

### Problema: "Perdi o contexto"

**Solução:**
```
1. Liste checkpoints: ls .claude/checkpoints/
2. Leia último: cat checkpoint-*.md
3. Diga: "Continua de [timestamp encontrado]"
```

### Problema: "Não lembro de onde parei"

**Solução:**
```
1. Diga: "Qual era meu último checkpoint?"
2. Eu vou buscar e mostrar
3. Escolha de onde retomar
```

### Problema: "Quero voltar para antes"

**Solução:**
```
1. Diga: "Recovery: retoma do checkpoint de [data]"
2. Eu vou listar options
3. Você escolhe qual carregar
```

---

## 📊 RESUMO RÁPIDO

| Situação | Comando | Resultado |
|----------|---------|-----------|
| Pausa agora | "Vou pausar" | Tudo salvo ✅ |
| Pausa com detalhe | "Snapshot completo" | Arquivo .md ✅ |
| Continua simples | "Continua squad" | Context carregado ✅ |
| Continua exato | "Continua de 24/fev 14:35" | Checkpoint preciso ✅ |
| Recovery | "Recovery: retoma de [data]" | Estado anterior ✅ |

---

## 🚀 PRÓXIMAS AÇÕES

**Agora você pode:**

1. ✅ Trabalhar sem medo de perder contexto
2. ✅ Pausar quando quiser
3. ✅ Continuar perfeitamente depois
4. ✅ Manter sua continuidade de trabalho

**Quer pausar agora ou continuar com o Squad?**

---

**Criado:** 24 de fevereiro de 2026
**Versão:** 1.0
**Status:** ✅ Pronto para usar

*Faz parte da Global Token Protection Layer - Seu trabalho está sempre salvo.*
