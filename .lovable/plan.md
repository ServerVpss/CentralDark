# Plano — Alinhar a regra-mãe ao texto oficial completo

## Comparação rápida (o que eu criei × o que você mandou agora)

O arquivo que já está no repo (`docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/REGRA-OFICIAL-MULTI-AGENTE-SEMANTICO.md`) é uma **versão resumida** que puxei do espelho no Notion. Bate no espírito, mas perde detalhe e formato. As diferenças que importam:

- **Cabeçalho de status** (Status/Escopo/Ativa explícitos) — faltando no meu.
- **Tabela Git × Notion** com papéis nomeados — eu colapsei em bullets.
- **Seção 2 expandida** (Antes/Durante/Depois com sub-bullets e o **checklist em caixinhas `[ ]`**) — eu encurtei.
- **Seção 3 (MCP)** com os 5 pontos completos e explicação de cada um — eu resumi em frases curtas.
- **Seção 4** com a lista de áreas sensíveis em formato narrativo e a frase "Autorização é por ação e por sessão. Não se generaliza…" — eu cortei.
- **Seção 5** com descrição de cada papel — eu virei lista seca.
- **Seção 7 (Referências cruzadas)** — não existia no meu arquivo.
- Meu arquivo tinha um bloco extra "Sincronia 4-Point" no fim que **não está** no texto oficial que você mandou.

Resumo: o conteúdo é o mesmo, mas o texto oficial é mais completo, mais formal e mais útil pra outra IA ler. Vale substituir.

## O que fazer

1. **Sobrescrever** `docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/REGRA-OFICIAL-MULTI-AGENTE-SEMANTICO.md` com o texto exato que você colou (íntegro, sem editar palavra).
2. **Não mexer em mais nada.** A referência no `00-LEIA-PRIMEIRO.md` já aponta pra esse mesmo arquivo — continua válida.
3. **Sem commit/push automático** — o repo está sincronizado pelo Lovable GitHub App; o commit sai pelo fluxo padrão do editor quando você aprovar.

## Validações que já estão feitas

- Subpasta `01-IDENTIDADE-E-REGRAS/` **existe** (criei no passo anterior).
- Busca por regras equivalentes: os arquivos parecidos (`11-MULTI-IA-FLUXO.md`, `20-COLABORACAO-MULTI-IA.md`, `PROMPT-MESTRE-MULTI-IA.md`, `01-REGRAS-DA-EQUIPE-IA.md`) tratam de fluxo operacional e papéis de equipe, **não** da regra-mãe Ler→Agir→Registrar. Não há duplicata — é substituição do arquivo recém-criado, não criação de novo.

## Fora de escopo

- Não vou editar `00-LEIA-PRIMEIRO.md`, `REGRA-OFICIAL-HIERARQUIA-MEMORIA.md`, nem outros arquivos da CONSCIENCIA.
- Não vou tocar Notion (o espelho lá já está e foi a origem desse texto).
- Sem deploy, sem migration, sem mexer em VPS/PM2/Caddy.
