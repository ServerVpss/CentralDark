---
title: "REGRA OFICIAL HIERARQUIA MEMORIA"
tags: ["consciencia"]
updated: 2026-08-29
---

# Regra Oficial — Hierarquia de Memória e Semântica

- **Fonte da verdade permanente:** `docs/CONSCIENCIA/` + owners canônicos versionados no Git.
- **Autoridade humana atual:** `SEGREDO/CHEFE`.
- **Coordenação:** `SOL`.
- **Executor/continuidade:** `PIVETE/HERMES`.
- **Método operacional canônico:** `.agents/skills/centraldark-operational-method/SKILL.md`.
- **Padrão de comunicação com o humano:** `docs/CONSCIENCIA/PADRAO-RESPOSTA-SEGREDO-CHEFE.md`.

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

O caminho legado `docs/CONSCIENCIA/JEITO-CORRETO-DO-PIVETE.md` é somente alias histórico de compatibilidade. Não recebe regra nova e não compete com o método operacional canônico.

## 1. Hierarquia de fontes

1. **Git / canônicos atuais:** `LEIA-ME-IA.md`, `AGENTS.md`, `.agents/skills/centraldark-operational-method/SKILL.md`, `docs/CONSCIENCIA/PADRAO-RESPOSTA-SEGREDO-CHEFE.md`, regras oficiais e contratos vigentes.
2. **Estado vivo comprovado:** GitHub/PR/Actions/runtime/logs aplicáveis ao alvo atual.
3. **Histórico versionado:** decisões, relatórios, lembranças, commits antigos e aliases legados; servem de proveniência, não para sobrescrever regra atual.
4. **Memória de sessão/cache (`mem://` etc.):** apoio temporário, nunca autoridade canônica.

Conflito entre regra atual e memória antiga é resolvido pela regra atual **sem editar silenciosamente a história**.

## 2. Registro obrigatório

Tudo que precisa sobreviver à troca de IA, reset de sessão, workspace ou computador deve ser registrado no Git.

```text
regra operacional → .agents/skills/centraldark-operational-method/SKILL.md ou owner canônico da capacidade
comunicação com SEGREDO/CHEFE → docs/CONSCIENCIA/PADRAO-RESPOSTA-SEGREDO-CHEFE.md
decisão → docs/CONSCIENCIA/08-HISTORICO-DECISOES.md
aprendizado → docs/CONSCIENCIA/APRENDIZADOS.md
pendência → docs/PENDENCIAS.md
estado operacional → docs/CONSCIENCIA/09-ESTADO-ATUAL.md quando aplicável
```

Não criar outro “jeito correto”, V1/V2/V3 ou documento paralelo quando o owner existente puder receber o delta.

## 3. Proibição de memória evaporável como prova

Texto salvo somente em memória de sessão/cache não prova que algo foi registrado. Para contar como salvo de verdade, exige-se arquivo/commit/PR/relatório/aprendizado/pendência versionado ou ferramenta oficial que produza esse registro.

## 4. Compatibilidade com nomes legados

Nomes de arquivos, pastas, labels ou variáveis podem conter `pivete` por compatibilidade técnica. Nome legado **não define autoridade nem ownership do método**.

Exemplos:

```text
permito-pivete
pivete-invocacao.js
PIVETE-03-REGRAS-VIVAS.md
JEITO-CORRETO-DO-PIVETE.md
PROTOCOLO-ORQUESTRACAO-PIVETE.md
```

Esses nomes podem permanecer somente quando necessários à compatibilidade/proveniência. Seu significado operacional deve obedecer à identidade atual e nenhum deles pode governar a Casa como “modo do Pivete”.

## 5. Como uma IA deve consumir memória

```text
1. carregar identidade canônica atual
2. carregar o método operacional canônico único
3. fixar missão/HEAD/alvo
4. ler memória relevante
5. classificar CANONICAL | OPERATIONAL | HISTORICAL | CANDIDATE | UNKNOWN
6. traduzir aliases legados sem mudar a proveniência
7. nunca deixar histórico reatribuir autoridade atual
```

## 6. Regra de ouro

```text
MEMÓRIA PRESERVA A HISTÓRIA.
CANÔNICO DEFINE O SIGNIFICADO ATUAL.
SEGREDO/CHEFE CONTINUA SENDO O HUMANO.
SOL CONTINUA COORDENANDO.
PIVETE/HERMES CONTINUA SENDO O EXECUTOR.
UM MÉTODO OPERACIONAL CANÔNICO.
UM OWNER POR CAPACIDADE.
```

---

## Conexões Rápidas

- [[00-LEIA-PRIMEIRO]] — portão de entrada
- [[MAPA-DO-CEREBRO]] — visão geral
- [[CONSCIENCIA]] — documento mestre
