---
title: "Obsidian Casa — edição viva e sincronização"
date: 2026-08-03
tags: ["obsidian", "hermes", "casa", "memoria", "sincronizacao"]
status: "proposto"
---

# Obsidian Casa — edição viva e sincronização

O modelo novo substitui a regra antiga de Obsidian somente leitura.

```text
E:\CentralDark\Pivete\CASA-VAULT\00-CANONICO
↔
E:\CentralDark\Pivete\CentralDark\docs\BRAIN
```

Você pode editar notas ao vivo no Obsidian. O Hermes sincroniza as alterações, registra no Git e recarrega a fonte da verdade.

## Pastas locais que nunca sobem

- `10-MEMORIA-PRIVADA`;
- `20-INBOX-HERMES` enquanto o aprendizado ainda for candidato;
- `30-ANEXOS`;
- `.obsidian`;
- `.hermes-sync`;
- `90-CONFLITOS`.

## O que realmente muda a direção

Uma nota em `00-CANONICO` muda a memória do projeto depois de sincronizada. Regras globais de comportamento continuam nos arquivos canônicos de governança e aprendizado. O Hermes deve transformar uma correção aprendida em atualização do arquivo existente, com prova, em vez de inventar uma regra paralela.

## Conflitos

Quando GitHub e Obsidian modificarem a mesma nota de formas diferentes, o sincronizador não escolhe escondido: guarda as duas versões em `90-CONFLITOS` e para para reconciliação.

Relacionado: [[TUTORIAL-OBSIDIAN]] | [[BRAIN]] | [[Memoria-Longa]]
