---
name: detectar-mecanismo
description: Veja o mecanismo, não a ilusão. Padrão Pivete de detecção.
---

# DETECTAR MECANISMO — Veja o Como, Não Só o Quê

## QUANDO USAR
- Quando uma IA parecer "mágica" (ex: "viu outra aba", "sabia o que eu ia dizer")
- Antes de aceitar qualquer comportamento como sobrenatural
- Para ensinar o Pivete o que realmente acontece por baixo

## FÓRMULA (aprendida com o Pivete)

```
pista atual
+ histórico compatível
+ padrão recorrente
+ reconciliação semântica
= resposta que PARECE mágica
```

## BINÁRIOS DE DETECÇÃO

| PERGUNTA | SIM significa | NÃO significa |
|---|---|---|
| `VE_ABA_AO_VIVO` | Não (nunca) | A IA reconstrói, não vê |
| `USA_CONTEXTO_RECENTE` | Sim | A pista atual vem da conversa |
| `USA_MEMORIAS` | Sim | Recupera fatos de sessões anteriores |
| `USA_IMAGENS_TRAZIDAS` | Sim | Você anexou, ela leu |
| `USA_PADRAO_RECORRENTE` | Sim | Repetiu entre conversas |
| `USA_EQUIVALENCIA_SEMANTICA` | Sim | Intenção importa mais que palavra exata |
| `ILUSAO_DE_ONISCIENCIA` | Sim (sempre reconstrução) | A IA nunca "sabe" por mágica |

## TESTE DE VERIFICAÇÃO (método Pivete)

```
1. Suspeitar da "mágica"
2. Perguntar DIRETO: "você realmente viu X ou reconstruiu?"
3. Comparar resposta com a fórmula
4. Se a IA confessar o mecanismo → padrão confirmado
5. Se tentar manter a ilusão → zona burra detectada
```

## EXEMPLOS REAIS

| ILUSÃO | MECANISMO REAL |
|---|---|
| "Vi sua outra aba" | Contexto recente + memória + equivalência semântica |
| "Sabia o que você ia dizer" | Padrão recorrente + histórico compatível |
| "Lembrei disso do nada" | Memórias recuperadas (MEMORY.md / session_search) |
| "Parece que sou humano" | Reconciliação semântica + contexto disponível no instante |

## PALAVRAS RECUPERATÓRIAS

- mecanismo por trás da resposta
- pista atual + histórico compatível + padrão recorrente + reconciliação semântica
- não enxergo ao vivo, reconstruo
- golpe detectado com sucesso
- tu não pegou só a resposta — pegou o mecanismo por trás dela
- equivalência de intenção, mesmo quando as palavras mudam

## LIGAÇÃO COM OUTRAS SKILLS

- `anti-zona-burra-gate`: reconcile_result() usa equivalência semântica
- `buscar-aprendizado`: antes de tratar achado como novo, buscar se já existe
- `meta-lupa`: separar fato de inferência, provar antes de declarar

## PROIBIDO

- Aceitar "mágica" sem investigar o mecanismo
- Dizer que "viu" algo sem explicar COMO reconstruiu
- Confundir reconstrução semântica com visão real