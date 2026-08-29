---
title: "DOCUMENTACAO OBRIGATORIA"
date: 2026-08-28
tags: ["consciencia"]
updated: 2026-08-28
---

# DOCUMENTAÇÃO OBRIGATÓRIA — lei da Casa

> 🔍 **LUPA NA MÃO · INTENÇÃO NA FRENTE** — CentralDark

```text
DECRETADO POR   SEGREDO/CHEFE · 2026-08-25
CLASSE          LEI — irreversível, inevitável, mensurável
GATE            .agents/skills/visual-design-method/scripts/check-documentacao.mjs
ÁRVORE          ARVORE-DO-PROJETO.md
ESCOPO          qualquer linguagem, qualquer arquivo, qualquer motor
```

---

## A lei

```text
SEM DOCUMENTAÇÃO A CASA NÃO ANDA.
```

Código sem documentação é entregue **vazio para o dono**. Ele recebe algo que
só funciona enquanto quem escreveu estiver por perto. Isso não é entrega — é
dependência com aparência de entrega.

```text
CODIGO_SEM_DOC   = ENTREGA_VAZIA
ENTREGA_VAZIA    = DEPENDENCIA
DEPENDENCIA      != TRABALHO_ENTREGUE
```

---

## Por que existe um gate, e não só este documento

O próprio `CONTRACT.yml` da Casa já responde:

```text
prose_only_rule: NOT_LEARNED
proven_operational_rule_must_bind_to_runtime: true
→ BIND_RULE_TO_ENGINE_OR_GATE
→ POSITIVE_TEST
→ NEGATIVE_TEST
```

Regra escrita em markdown é **intenção**. Regra que reprova build é **lei**.
Se esta página existisse sozinha, ela seria exatamente o tipo de documento que
todo mundo cita e ninguém cumpre.

Por isso a lei nasce com verificador no mesmo dia.

---

## As quatro exigências

O gate mede quatro coisas. Cada uma nasceu de um prejuízo real, não de teoria.

### D1 · CABEÇALHO

> Todo arquivo abre dizendo **o que é** e **para que serve**.

Quem abrir daqui a seis meses precisa entender o assunto sem ler uma linha de
lógica. Cabeçalho com menos de 60 caracteres úteis conta como ausente —
`/* helpers */` não é documentação, é rótulo.

```text
FALHA  arquivo abre direto no código
FALHA  cabeçalho existe mas é vazio demais
PASSA  bloco explicando assunto, uso e limite
```

### D2 · CONTRATO DAS FUNÇÕES

> Função exportada diz **o que entra** e **o que sai**.

Função exportada é porta pública: alguém vai chamar sem ler o corpo. Em
JavaScript e TypeScript isso é JSDoc com `@param` e `@returns`.

```text
FALHA  export function somar(a, b)          sem bloco antes
PASSA  /** @param {number} a @returns {number} */
```

Função interna não é obrigada — quem lê ela já está dentro do arquivo.

### D3 · PENDÊNCIA VISÍVEL

> Dívida que só existe na cabeça de quem escreveu é dívida escondida.

Marcas reconhecidas: `TODO:` `FIXME:` `HACK:` `BUG:` `NOTE:` `XXX:`

Esta exigência **avisa, não reprova** — código pequeno e fechado pode
legitimamente não ter pendência. Mas arquivo grande sem nenhuma marca costuma
significar que a pendência existe e não foi escrita.

Marca boa aponta **owner e destino**:

```js
// TODO: gate irmão para Merge-Policy quase-certa.
//       Owner: scripts/trigger-fabric/verify_repo_contract.py (PR #1149).
```

### D4 · ANCORAGEM NA ÁRVORE

> Arquivo que não aparece em `ARVORE-DO-PROJETO.md` é órfão.

Documentação solta some. Um arquivo pode estar perfeitamente documentado por
dentro e mesmo assim ninguém achar — existe no disco e não existe no mapa.

```text
FALHA  órfão — não citado na árvore
PASSA  caminho ou nome presente em ARVORE-DO-PROJETO.md
```

---

## Como rodar

```bash
node .agents/skills/visual-design-method/scripts/check-documentacao.mjs --selftest
```

```bash
node .agents/skills/visual-design-method/scripts/check-documentacao.mjs
```

```bash
node .agents/skills/visual-design-method/scripts/check-documentacao.mjs src/index.css
```

Três respostas, sem meio-termo:

```text
PASS           exit 0
FAIL           exit 1
NAO_APLICAVEL  exit 2      ← nunca 0
```

**Amarelo não existe.** O `public_status_contract` proíbe amarelo como
aprovação pública, e `NAO_APLICAVEL` nunca vira `PASS` — arquivo fora de
escopo não passou, ele **não foi julgado**.

---

## O que o gate NÃO faz

```text
GATE_PASSA != DOCUMENTAÇÃO_BOA
```

Ele mede **presença e ancoragem**, não qualidade da prosa. Garante que existe
cabeçalho, que funções exportadas têm contrato, que o arquivo está no mapa.

Se o texto explica bem, quem julga é gente lendo. `REALITY_IS_JUDGE` vale aqui
também — inclusive contra este gate.

---

## Estender para outra linguagem

Uma entrada no mapa `LINGUAGENS` do gate:

```js
'.py': { nome: 'Python', bloco: /"""[\s\S]*?"""/, linha: /^\s*#/ },
'.sh': { nome: 'Shell',  bloco: /^#[\s\S]*?(?=\n[^#])/m, linha: /^\s*#/ },
```

Não cria gate novo. `no_new_workflow_when_owner_exists = true`.

---

## Escopo atual — declarado com honestidade

```text
COBERTO      .agents/skills/visual-design-method     (8 arquivos)
NÃO COBERTO  apps (1.221) · scripts (327) · src (248) · supabase (158)
```

⚫ Ligar o gate no repositório inteiro vai **reprovar muita coisa no primeiro
dia**. Isso não é o gate errado — é o passivo aparecendo. Decidir quando ligar
é do CHEFE, porque a partir daí build para até a dívida ser paga.

Caminho sugerido, se quiser progressivo:

```text
1. arquivo novo já nasce obrigado
2. arquivo tocado precisa sair documentado
3. passivo antigo entra por área, uma por vez
```

Nenhuma das três é mais correta que a outra. A terceira só é menos dolorosa.

---

## Invariantes

```text
SEM_DOCUMENTACAO_A_CASA_NAO_ANDA=true
DOC_OBRIGATORIA_EM_QUALQUER_LINGUAGEM=true
ARQUIVO_ORFAO_REPROVA=true
CABECALHO_VAZIO_NAO_CONTA_COMO_DOC=true
FUNCAO_EXPORTADA_EXIGE_CONTRATO=true
NA_NUNCA_VIRA_PASS=true
GATE_PASSA_NAO_SIGNIFICA_DOC_BOA=true
REGRA_SEM_GATE_NAO_E_LEI=true
```

---

```text
🔍  LUPA NA MÃO · INTENÇÃO NA FRENTE
    CentralDark · SEGREDO/CHEFE
```
