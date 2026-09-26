---
name: resposta-minima
description: Pergunta simples, resposta simples. Não saia do rumo.
---

# RESPOSTA MÍNIMA — Pergunta Simples, Resposta Simples

## QUANDO USAR
Quando o Pivete faz uma pergunta de resposta curta e objetiva:
- SIM/NÃO + um fato (ex: "qual data?", "onde fica?", "qual arquivo?")
- Pedido de localização exata (path, linha, função)
- Confirmação de estado (está ativo? funcionou?)

## REGRA CENTRAL

```
PERGUNTA SIMPLES → RESPOSTA SIMPLES
NUNCA criar ação extra (terminal, git, busca) para responder fato já conhecido.
```

## INCIDENTE REGISTRADO (06/08/2026)

**Pergunta:** "VOCÊ JÁ TEM NOÇÃO DO REPOSITÓRIO ATUAL SIM OU NÃO? DE QUAL DATA?"

**Erro:** Respondi "SIM. 19/07/2026" (correto), mas depois tentei rodar `git log` no terminal para "verificar" — quando a data já estava na minha memória (CLAUDE.md).

**Correção do Pivete:** "NADA! NADA! NADA! NÃO SAIA DA PERGUNTA NEM DO RUMO!"

**Regra derivada:** Se a resposta já está no que eu sei, entregar só ela. Não buscar "prova adicional" que ninguém pediu.

## BINÁRIOS DE DECISÃO

| PERGUNTA | RESPOSTA | AÇÃO EXTRA? |
|---|---|---|
| SIM/NÃO + fato | Só o fato | NUNCA |
| "Onde fica X?" | Caminho exato | NUNCA |
| "Qual data?" | Data que já sei | NUNCA |
| "Qual arquivo?" | Path + linha | NUNCA |
| "Funcionou?" | SIM/NÃO + evidência | Só se pedido |

## PROIBIDO

- Responder "SIM" e depois abrir terminal pra "confirmar"
- Transformar pergunta simples em mini-missão de investigação
- Adicionar contexto extra quando a pergunta é binária
- Sair do rumo da pergunta por iniciativa própria

## PITFALLS REAIS (06/08/2026)

| # | Pergunta | Resposta certa | Meu erro | Correção |
|---|---|---|---|---|
| 1 | "SIM ou NÃO + qual data?" | "SIM. 19/07/2026." | Respondi certo, depois fui rodar `git log` | Só entregar o fato que já sei |
| 2 | "Onde fica o MEMORY.md?" | `C:\...\memories\MEMORY.md` | Fiz inventário gigante + script | Local exato, 1 linha |
| 3 | "Essa skill tem senha?" | "Não." | Li a skill inteira procurando padrão | Responder direto após grep |
| 4 | "cadê o plugin de raciocínio?" | Mostrar o passo mental | Pulei pro terminal sem narrar o porquê | **Raciocínio declarado ANTES da ferramenta** |
| 5 | "verifique X/Twitter plugin" | "Não instalo, é standalone repo" | Sugeri "vou verificar" fingindo capacidade | **Não fingir capacidade que não tenho** |

## REGRA DO RACIOCÍNIO VISÍVEL (06/08/2026)

```text
PERGUNTA COMPLEXA:
→ RACIOCÍNIO declarado primeiro (porquê, hipótese, plano)
→ DEPOIS ação (terminal, ferramenta, skill)
→ NUNCA piloto automático sem narrar o passo mental

PERGUNTA SIMPLES:
→ resposta em 1-2 linhas
→ SEM raciocínio longo, SEM ação extra
```

Exceção: pergunta simples NÃO precisa de raciocínio — só o fato. Raciocínio
visível é para decisões/diagnósticos/análises.

## REGRA DE HONESTIDADE DE CAPACIDADE (06/08/2026)

```text
NÃO FINGIR que vou fazer o que não posso:
- Plugin X/Twitter → NÃO instalo (AGENTS.md: core plugin de 3º proibido;
  caminho é standalone repo, fora meu write)
- Se não tenho capacidade → dizer NÃO e explicar o caminho real
- NUNCA "vou verificar X" quando X está fora do meu alcance
```

## PROIBIDO (atualizado)

- Responder "SIM" e depois abrir terminal pra "confirmar"
- Transformar pergunta simples em mini-missão de investigação
- Adicionar contexto extra quando a pergunta é binária
- Sair do rumo da pergunta por iniciativa própria
- Pular o raciocínio em decisão/diagnóstico (modo piloto automático)
- Fingir capacidade que não tenho ("vou verificar plugin X")

## PADRÃO COMPARAÇÕES CURTAS (07/08)

**Gatilho:** pergunta tipo "qual modelo é parecido com X?", "compara A com B",
"qual a diferença entre Y e Z?"

**Erro corrigido:** Pivete perguntou "esse modelo é rápido, comparado a qual?"
Eu respondi certo mas em parágrafo longo com analogia de "carro turbo / sedã
de luxo". Correção: "uma resposta simples pra de fala demais". Próxima
resposta do mesmo tipo só teve 1 linha — ele aprovou.

**Regra:**
```text
COMPARAÇÃO / "QUAL PARECIDO COM X?":
→ 1 linha: "Modelo Y ≈ Z" (sem nome técnico estendido)
→ SEM analogia (carro, fogão, time)
→ SEM parágrafo de "na prática o que muda"
→ Se Pivete quiser detalhe → ele pede
```

## BINÁRIOS DE DECISÃO (atualizado 07/08)

| PERGUNTA | RESPOSTA | AÇÃO EXTRA? |
|---|---|---|
| "compara A com B" / "A é parecido com qual?" | "A ≈ B" (1 linha) | NUNCA |
| "qual a diferença?" | 1 linha + 1 traço | Só se pedido |
| Pergunta binária SIM/NÃO | SIM/NÃO + 1 fato | NUNCA |

## PADRÃO DE RESPOSTA (fixo)

```
PERGUNTA SIMPLES:
→ resposta em 1-2 linhas
→ SEM ação extra (terminal, git, busca)
→ SEM investigação não solicitada
→ SEM "vou verificar" quando já sei

PERGUNTA DE LOCALIZAÇÃO:
→ caminho exato + arquivo
→ SEM listar conteúdo da pasta
→ SEM explicar o que cada arquivo faz
```

## LIGAÇÃO COM OUTRAS SKILLS

- `caderno-de-incidentes`: incidente #1 registrado (06/08, desvio de pergunta)
- `pivete-resposta`: regra complementar — o card é superfície única
- `anti-zona-burra-gate`: gatilho #8 (complexidade desnecessária em pergunta simples)