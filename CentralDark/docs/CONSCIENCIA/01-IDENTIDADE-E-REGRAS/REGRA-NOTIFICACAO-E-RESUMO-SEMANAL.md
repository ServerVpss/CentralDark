---
title: "Regra Global — Notificação e Resumo Semanal da Casa"
status: "CANONICAL_GLOBAL_RULE"
updated: 2026-09-25
owner: "docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/"
authority: "SEGREDO/CHEFE"
scope: "toda superfície que resuma, notifique ou reporte estado da CentralDark"
truth_rule: "REALIDADE_IS_JUDGE"
complements: "GABARITO-RECIBO-TELEGRAM.md"
---

# Regra Global — Notificação e Resumo Semanal da Casa

## 1. Prompt canônico do resumo semanal

Este texto é lei, ditado pelo CHEFE. Quem resumir a Casa segue este molde:

```text
Toda semana, prepare um resumo de status do CentralDark com base
nas fontes que eu selecionar.

Separe fatos comprovados de UNKNOWNs, destaque mudanças materiais,
decisões, riscos e deltas não cristalizados, preserve o princípio
CURRENT > HISTORY e termine com o NEXT_CURSOR.
```

Instrução de cadência:

```text
Toda semana, resuma mudanças materiais, UNKNOWNs e próximo passo
da CentralDark.
```

## 2. Estrutura obrigatória do resumo

```text
📣 CABEÇALHO — semana + período

🟢 FATOS COMPROVADOS
   <o que foi medido, com fonte>

⚠️ UNKNOWNS
   <o que não foi provado — nunca promovido a verde>

🔄 MUDANÇAS MATERIAIS
   <o que mudou de estado>

💎 DECISÕES
   <o que ficou decidido e por quem>

🔴 RISCOS
   <o que pode quebrar>

🧿 DELTAS NÃO CRISTALIZADOS
   <o que existe mas não subiu>

📊 PORCENTAGEM HONESTA
   <valor>% <o que>

🎯 NEXT_CURSOR
   <um único próximo passo>

📌 ÂNCORA
   <commit / arquivo / endpoint>

<i>🟡 UNKNOWN ≠ 🟢 PASS · ⚖️ REALIDADE = 👑 JUIZ · 🦜🚫 PAPAGAIO_OFF</i>
```

## 3. Invariantes do resumo

```text
CURRENT > HISTORY=true
FATO_COMPROVADO_EXIGE_FONTE=true
UNKNOWN_NAO_VIRA_VERDE=true
NEXT_CURSOR_UNICO=true
DELTA_NAO_CRISTALIZADO_FICA_VISIVEL=true
SEM_NARRATIVA_SEM_PROVA=true
```

- **Fato comprovado** = medido agora, com fonte citada (commit, arquivo, endpoint, log).
- **UNKNOWN** = não medido ou medido sem resultado conclusivo. **Fica na seção própria, nunca no bloco verde.**
- **Delta não cristalizado** = existe no runtime ou na conversa, mas não foi promovido a arquivo, commit ou contrato.

## 4. Fronteira de execução (honestidade obrigatória)

```text
BANCADA_EXTERNA_ESCREVE_REGRA=true
BANCADA_EXTERNA_ESCREVE_SCRIPT=true
BANCADA_EXTERNA_DISPARA_SOZINHA=false
HERMES_RESIDENTE_EXECUTA=true
```

A bancada externa (UseAI e equivalentes) **não possui shell na VPS nem gancho de
disparo**. Ela produz a regra, o molde e o script. **Quem dispara em cadência é o
Hermes, residente no PM2, via cron.**

Dizer que o disparo já é automático sem o processo vivo do lado da VPS é
`ACTION != PROOF`.

## 5. Fluxo do resumo semanal

```text
CRON_DO_HERMES (semanal)
→ mede o estado vivo (git, VPS, fila, serviços)
→ separa fato de UNKNOWN
→ monta o resumo no molde do §2
→ envia no Telegram pelo GuardiaoCasa
→ grava receipt
→ define NEXT_CURSOR
```

## 6. Frase canônica

> Resumo semanal não é boletim bonito: é separação entre o que a Casa provou e o
> que ainda não sabe. O UNKNOWN aparece — não se esconde.

> O NEXT_CURSOR é o presente do resumo: quem lê sabe exatamente onde a mão volta.
