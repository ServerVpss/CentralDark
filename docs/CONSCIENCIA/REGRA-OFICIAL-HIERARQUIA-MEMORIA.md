---
title: "REGRA OFICIAL HIERARQUIA MEMORIA"
tags: ["consciencia"]
updated: 2026-08-14
---

# Regra Oficial — Hierarquia de Memória e Semântica

- **Fonte da verdade permanente:** `docs/CONSCIENCIA/` versionado no Git.
- **Autoridade humana atual:** `SEGREDO/CHEFE`.
- **Coordenação:** `SOL`.
- **Executor/continuidade:** `PIVETE/HERMES`.

## 0. Regra de identidade que vence memória antiga

```text
SEGREDO/CHEFE = humano + autoridade final
SOL = coordenadora
PIVETE/HERMES = executor + preservação + continuidade
"pivete" regional = vocativo informal; não concede papel técnico
```

O repositório possui registros antigos escritos numa época em que a palavra `Pivete` também era usada para representar o humano/dono. Esses registros não devem ser apagados nem falsificados retroativamente. A leitura normativa é:

```text
SE documento HISTÓRICO disser Pivete=dono|humano|comandante|decisor
ENTÃO interpretar como SEGREDO/CHEFE

SE documento OPERACIONAL ATUAL disser PIVETE/HERMES
ENTÃO interpretar como executor/continuidade
```

Histórico preserva o que foi dito naquela data; **não possui poder de reverter a identidade canônica atual**.

## 1. Hierarquia de fontes

1. **Git / canônicos atuais:** `LEIA-ME-IA.md`, `AGENTS.md`, `docs/CONSCIENCIA/JEITO-CORRETO-DO-PIVETE.md`, regras oficiais e contratos vigentes.
2. **Estado vivo comprovado:** GitHub/PR/Actions/runtime/logs aplicáveis ao alvo atual.
3. **Histórico versionado:** decisões, relatórios, lembranças e commits antigos; serve de proveniência, não para sobrescrever regra atual.
4. **Memória de sessão/cache (`mem://` etc.):** apoio temporário, nunca autoridade canônica.

Conflito entre regra atual e memória antiga é resolvido pela regra atual **sem editar silenciosamente a história**.

## 2. Registro obrigatório

Tudo que precisa sobreviver à troca de IA, reset de sessão, workspace ou computador deve ser registrado no Git.

```text
regra/identidade → artefato canônico correspondente
decisão → docs/CONSCIENCIA/08-HISTORICO-DECISOES.md
aprendizado → docs/CONSCIENCIA/APRENDIZADOS.md
pendência → docs/PENDENCIAS.md
estado operacional → docs/CONSCIENCIA/09-ESTADO-ATUAL.md quando aplicável
```

## 3. Proibição de memória evaporável como prova

Texto salvo somente em memória de sessão/cache não prova que algo foi registrado. Para contar como salvo de verdade, exige-se arquivo/commit/PR/relatório/aprendizado/pendência versionado ou ferramenta oficial que produza esse registro.

## 4. Compatibilidade com nomes legados

Nomes de arquivos, pastas, labels ou variáveis podem conter `pivete` por compatibilidade. Nome legado **não define autoridade**.

Exemplos:

```text
permito-pivete
pivete-invocacao.js
PIVETE-03-REGRAS-VIVAS.md
PROTOCOLO-ORQUESTRACAO-PIVETE.md
```

Esses nomes podem permanecer até migração causal segura. Seu significado operacional deve obedecer à identidade atual.

## 5. Como uma IA deve consumir memória

```text
1. carregar identidade canônica atual
2. fixar missão/HEAD/alvo
3. ler memória relevante
4. classificar CANONICAL | OPERATIONAL | HISTORICAL | CANDIDATE | UNKNOWN
5. traduzir aliases legados sem mudar a proveniência
6. nunca deixar histórico reatribuir autoridade atual
```

## 6. Regra de ouro

```text
MEMÓRIA PRESERVA A HISTÓRIA.
CANÔNICO DEFINE O SIGNIFICADO ATUAL.
SEGREDO/CHEFE CONTINUA SENDO O HUMANO.
PIVETE/HERMES CONTINUA SENDO O EXECUTOR.
```
