---
title: "Escola operacional de skills para qualquer IA CLI"
status: "CANDIDATO_CANONICO"
source: "Curso fornecido por SEGREDO/CHEFE em 2026-08-01"
source_sha256: "5c6278447f026af115f940a5c5b3e55ebe2a6b1a7bc0a116a78872142005ad62"
---

# Escola operacional de skills

## Objetivo

Transformar orientação repetida em comportamento versionado, acionável, testável e compartilhado por Claude Code, Codex, Gemini, Cursor, Windsurf, Copilot, Hermes e qualquer IA futura que entre pelo boot universal.

Skill não é texto decorativo. É expertise codificada que define **quando carregar**, **qual processo seguir**, **o que provar** e **quando bloquear**.

## Princípios do curso convertidos em contrato

1. Descubra antes de construir: procure skill, regra, workflow e branch existentes.
2. Uma skill, um propósito: prefira módulos pequenos a uma mega-skill.
3. Acionável vence descritivo: cada regra deve produzir passo, comando, teste ou bloqueio.
4. Exemplo concreto vence abstração.
5. Menor privilégio: leitura e testes por padrão; escrita e operações críticas exigem escopo e autorização.
6. Teste isolado primeiro.
7. Verificação antes de conclusão: saída real, HEAD real e CI real.
8. Skills de equipe ficam no Git e chegam a todos pelo boot.
9. Meça eficácia: instruções repetidas, regressões, rodadas de review e tempo de onboarding.
10. Evolua por evidência: erro recorrente vira regressão e lição aprovada, nunca autoedição silenciosa.

## Descoberta obrigatória

Antes de criar arquivo ou skill:

```text
1. Buscar função equivalente na main.
2. Buscar branches e PRs relacionados.
3. Ler consumidores e adaptadores.
4. Classificar: REUSAR | ESTENDER | SUBSTITUÍDO | NOVO_JUSTIFICADO.
5. Bloquear duplicação sem justificativa.
```

## Segurança

Uma skill é instrução, não sandbox. Portanto:

- declare ferramentas e efeitos permitidos;
- nunca use `--force`, `--no-verify` ou bypass silencioso;
- mostre e confirme ação destrutiva;
- preserve branch protection e CI;
- não leia secrets;
- use branch/worktree isolada para escrita;
- mantenha rollback e recibo.

## Como construir uma skill

Toda skill deve conter:

```text
name único
condição de acionamento específica
propósito
invariantes
workflow passo a passo
bons e maus exemplos
stop gates
verificação reproduzível
saída obrigatória
```

Descrições vagas como “melhores práticas” são inválidas. A descrição precisa dizer **quando** e **por quê** carregar.

## Ordem de composição

```text
PROCESSO primeiro
→ DOMÍNIO depois
→ FERRAMENTA por último
```

Exemplo: `systematic-debugging` organiza o processo; uma skill de autenticação traz o domínio; worktree e CI executam as ferramentas.

## Antipadrões bloqueados

- skill que é apenas documentação;
- skill gigante com responsabilidades conflitantes;
- descrições sobrepostas;
- regra sem exemplo;
- autonomia destrutiva sem confirmação;
- “funciona” sem comando e saída;
- aprendizado promovido pelo próprio Writer;
- cópia da governança em cada adaptador;
- curso inteiro carregado em toda tarefa, queimando contexto.

## Autoaprendizado seguro

```text
ERRO PROVADO
→ CAUSA PROVADA
→ TESTE VERMELHO
→ CORREÇÃO
→ TESTE VERDE
→ CI NO MESMO HEAD
→ JUDGE
→ LEARNING_RECEIPT
→ CHEFE APROVA
→ LEDGER VERSIONADO
→ PRÓXIMOS AGENTES CARREGAM
```

“Aprender sozinho” significa detectar repetição e preparar uma lição verificável. Não significa alterar a própria governança escondido.

## Métricas

- repetição de instrução;
- defeito reincidente;
- cobertura de módulos obrigatórios;
- rodadas de review;
- tempo até CI verde;
- lições candidatas versus aprovadas;
- gates pulados ou vencidos.

## Regra final

```text
DEFINA UMA VEZ.
VERSIONE.
TESTE.
CARREGUE AUTOMATICAMENTE.
APRENDA POR REGRESSÃO.
NUNCA PROMOVA SEM PROVA.
```

## Preservação da fonte e do visual

O curso integral fornecido pelo CHEFE permanece em
`SOURCE-CURSO-SKILLS-ORIGINAL.txt.gz.base64`, preso ao SHA-256 registrado no manifesto.
Ele é fonte de estudo, não contexto obrigatório de toda tarefa.

O pacote visual original é versionado em partes Base64 reversíveis para não depender
de suporte binário do agente. O CI reconstrói o ZIP, verifica SHA-256, os quatro
membros, os hashes internos e as dimensões 3840×2160 dos dois PNGs. Uma imagem
bonita sem pacote reproduzível não recebe `PASS`.
