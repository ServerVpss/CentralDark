---
title: "Garimpo do Desktop — papel do Grok mudou e a doc canônica não soube"
date: 2026-08-28
tags: ["aprendizado", "garimpo", "reconciliacao", "papeis-ia", "grok", "fronteira"]
status: "MEMORIA_RECUPERAVEL"
authority: "REFERENCIA; owner canônico permanece fora do BRAIN"
originator: "SEGREDO/CHEFE"
centraldark_note_schema: "brain07.v1"
centraldark_category: "02-SESSOES"
centraldark_kind: "CRISTAL_DE_SESSAO"
centraldark_context_owner: "SEGREDO/CHEFE"
centraldark_intent_anchor: "Garimpo do Desktop — papel do Grok mudou e a doc canônica não soube"
centraldark_agent_recall: "Recuperar a intencao, correcoes, limites e NEXT_CURSOR antes de continuar; sessao historica nao equivale ao estado atual."
centraldark_kaizen_policy: "docs/CONSCIENCIA/PROGRAMAS/KAIZEN-VIVO-INTENCAO-VIVA-20261008.md"
centraldark_kaizen_skill: ".agents/skills/kaizen-sistema-um/SKILL.md"
centraldark_kaizen_trigger: "MATERIAL_DELTA_WHEN_CONSUMED"
centraldark_kaizen_runtime: "UNKNOWN_UNTIL_CONSUMER_READBACK"
centraldark_metabolic_roles: ["yuji-identidade-e-continuidade","gojo-seis-olhos","goku-instinto-superior","kaizen-continuo"]
centraldark_metabolic_source: "apps/instinto-superior/src/components/central/MapaMetabolicoCristal.tsx"
centraldark_previous_blob_sha: "43aa9d597b71014b9e2b015411f6a64cac71602a"
centraldark_self_catalog: ".agents/skills/centraldark-operational-method/catalogo/META-RSI-40.md"
centraldark_self_primary: "Self-Questioning"
centraldark_self_related: ["Self-Reflection","Self-Analysis"]
centraldark_self_skill_refs: [".agents/skills/centraldark-operational-method/Skills/self-questioning/SKILL.md",".agents/skills/centraldark-operational-method/Skills/self-reflection/SKILL.md",".agents/skills/centraldark-operational-method/Skills/self-analysis/SKILL.md"]
centraldark_self_review: "APPLIED_OR_NOOP_JUSTIFIED_WHEN_RUNTIME_CONSUMES"
centraldark_self_activation: "RECALL_AND_REVIEW_ONLY_NOT_AUTOPATCH"
centraldark_self_runtime: "UNKNOWN_UNTIL_CONSUMER_READBACK"
---

# ⛏️ Garimpo do Desktop — o papel do Grok mudou e a doc canônica não soube

[[07 - Aprendizados & Memórias/README]]

Varredura de `C:\Users\danda\Desktop` a pedido do CHEFE: *"extrai o ouro daí e leva
pra CentralDark"*. 19 itens no topo, medidos um a um. Quase tudo era atalho, backup
ou repetição. **Sobrou uma pepita — e ela contradiz a Casa.**

## A pepita: o papel do Grok foi invertido e ninguém reconciliou

```text
docs/CONSCIENCIA/01-REGRAS-DA-EQUIPE-IA.md   (canônica)
  ultimo commit real ....... 2026-06-29
  diz ...................... "Grok = Executor técnico local controlado"
  autoriza ................. rodar scripts e comandos na VPS dentro do escopo

Desktop/relatorio-painel.txt                 (nao versionado)
  data ..................... 2026-08-23   <- DOIS MESES MAIS NOVO
  diz ...................... "Grok = Auditor VPS / Cientista de causa-raiz"
  nega ..................... deixar Grok mexer direto em nada sensível
```

Não é repetição, é **inversão de papel**: de *executor que roda comando* para
*auditor que só lê e opina*. A matéria nova é da mesma intenção, então é
`DELTA`, não missão nova — mas o owner canônico continua com a versão velha.

```text
NOVA_MATERIA_DA_MESMA_INTENCAO = DELTA
DELTA_NAO_RECONCILIADO != VERDADE_VIGENTE
DOC_CANONICA_ANTIGA != DOC_CANONICA_CERTA
```

## A lista de fronteira que não existia em lugar nenhum

O material do Desktop traz uma lista explícita do que um auditor **não** toca.
Procurei em `docs/CONSCIENCIA/` e essa lista não estava versionada:

```text
NAO TOCAR DIRETO (auditor read-only):
  rm / reset
  Caddy real
  Docker / WuzAPI
  sessão WhatsApp
  secrets
  banco real
  PM2 sensível
```

E o desenho de encadeamento seguro:

```text
Grok analisa
  → ChatGPT/MCP transforma em script seguro
  → humano roda na VPS
  → validamos resultado
```

Isso casa com `PARALLELIZE_PERCEPTION=true` / `SERIALIZE_MUTATION=true`:
**perceber pode ser paralelo e barato; mutar é serial e caro.**

## O que foi descartado por repetição ou irrelevância

```text
mapa-centraldark.txt ..... arvore de E:\BrainRepo (2026-07-02).
                           E:\BrainRepo NAO EXISTE MAIS -> proveniencia de repo morto.
Desktop.zip .............. backup dos mesmos 7 arquivos ja presentes. Zero delta.
.sixth / PList ........... pastas VAZIAS (0 bytes, 0 arquivos).
*.lnk (8) ................ atalhos de ferramenta (Chrome, TSM, Griffin, Hermes).
corrigir-mcp-codex.bat ... criado nesta propria sessao; ja conhecido.
Token/ + Tokens/ ......... 349MB + 6MB, das ferramentas de desbloqueio de celular.
                           Nao e material da Casa. NAO ABERTO, NAO COPIADO.
                           Nome indica credencial -> fronteira respeitada.
```

## O que este card NÃO faz

Não reescreve `01-REGRAS-DA-EQUIPE-IA.md`. Papel e autoridade são do CHEFE, não
de quem garimpa. O card **registra o delta e acende a luz**; a decisão de qual
versão vira canônica fica com quem manda.

```text
WRITER != JUDGE
GARIMPEIRO != DONO_DA_MINA
```

## Lição que sobrevive fora do caso

```text
ARQUIVO_SOLTO_MAIS_NOVO_QUE_A_DOC_CANONICA = ALARME
```

O ouro raramente é um arquivo que a Casa não tem. Quase sempre é um arquivo solto
que **discorda** do que a Casa tem — e é mais novo. Garimpo bom não é achar
coisa nova; é achar onde o passado e o presente brigam, e não deixar o mais
velho ganhar só por estar versionado.
