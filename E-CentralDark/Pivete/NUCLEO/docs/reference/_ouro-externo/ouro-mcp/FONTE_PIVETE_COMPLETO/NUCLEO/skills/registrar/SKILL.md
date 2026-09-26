---
name: registrar
description: "Registra uma entrada auditável da META LUPA com timestamp real, evidência e rollback. Use ao final do ciclo LER->PERGUNTAR->AGIR->REVISAR->PROVAR->REGISTRAR, ou sempre que precisar documentar uma decisão, prova ou veredito."
version: 1.0.0
author: Claude Code + Pivete
license: MIT
platforms: [windows]
metadata:
  hermes:
    tags: [meta-lupa, registro, auditoria, documentacao]
    related_skills: [meta-lupa]
---

# Skill: Registrar

Fecha o passo REGISTRAR da [META LUPA](../meta-lupa/SKILL.md)
(LER -> PERGUNTAR -> AGIR -> REVISAR -> PROVAR -> REGISTRAR), gravando uma
entrada nova no relatorio canonico:

`E:\CentralDark\Pivete\NUCLEO\motor\10-observabilidade\REVISAO-TECNICA-DA-LUPA.md`

## Quando usar

- Ao terminar de aplicar a Lupa numa mudanca real e precisar registrar o veredito.
- Sempre que o Pivete disser "registra", "registrar", "REGISTRAR" ou pedir pra
  documentar uma decisao/prova/estado no relatorio canonico.
- Nunca para rascunho ou narrativa sem evidencia -- o comando so grava, quem
  decide o conteudo (evidencia, testes, veredito) e voce.

## Como executar

Existe um comando real ja testado em `C:\Users\danda\bin\REGISTRAR` (Git
Bash, ja no PATH). Rode via ferramenta de terminal:

```bash
REGISTRAR "Titulo curto e descritivo da secao"
```

Ou, se ja tiver o conteudo pronto (evidencia, testes, veredito) num arquivo
ou heredoc, passe como segundo argumento pra nao deixar placeholder:

```bash
REGISTRAR "Titulo curto" /caminho/para/conteudo.md
```

```bash
REGISTRAR "Titulo curto" - <<'EOF'
### Evidencia
...
### Veredito
APROVAR | CONDICIONAR | CORRIGIR | BLOQUEAR
EOF
```

O comando sozinho ja garante, sem voce precisar pedir:
- timestamp real (roda `date` de verdade, nunca estima);
- numero de secao correto (le a ultima `## N.` do relatorio e soma 1);
- `size_before`/`sha256_before` reais pro bloco de Rollback documental.

## Depois de rodar

Leia a saida do comando (confirma numero da secao e timestamp) e diga pro
Pivete o que foi registrado, em uma frase. Se o conteudo ficou como
placeholder ("_(conteudo pendente...)_"), ofereca preencher a secao com a
evidencia real da conversa atual, editando o arquivo diretamente.

## Nao fazer

- Nao editar secoes antigas do relatorio pra "corrigir" retroativamente --
  se algo estava errado, registrar uma correcao nova (ver secao 33 do
  proprio relatorio como exemplo real disso).
- Nao inventar timestamp de cabeca quando o comando `REGISTRAR` estiver
  disponivel -- foi exatamente essa falha (documentada na secao 33) que
  motivou este comando existir.
- Nao duplicar o relatorio nem criar um segundo arquivo de registro.
