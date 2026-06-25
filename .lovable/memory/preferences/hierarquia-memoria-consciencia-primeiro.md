---
name: Hierarquia de Memória — docs/CONSCIENCIA/ é a fonte da verdade
description: Regra de prioridade máxima. Toda regra/decisão/aprendizado importante deve ser registrada PRIMEIRO em docs/CONSCIENCIA/ e só depois espelhada aqui em mem://. mem:// nunca é fonte principal.
type: preference
---

# Hierarquia de Memória (espelho — fonte oficial em docs/CONSCIENCIA/)

**Fonte oficial completa:** [`docs/CONSCIENCIA/REGRA-OFICIAL-HIERARQUIA-MEMORIA.md`](../../../docs/CONSCIENCIA/REGRA-OFICIAL-HIERARQUIA-MEMORIA.md)
Definida pelo Pivete em 25/06/2026. Prioridade máxima.

## Resumo aplicável a toda ação

1. **Antes de salvar qualquer regra/decisão/aprendizado importante** → escrever PRIMEIRO o arquivo `.md` em `docs/CONSCIENCIA/` (no lugar adequado).
2. Só depois espelhar em `mem://` (opcional, como cache de sessão).
3. **Nunca** registrar algo importante somente em `mem://`.

## Formato mínimo de registro em `docs/CONSCIENCIA/`
- Título
- Data
- Responsável pela decisão
- Caminho do arquivo
- Motivo
- Referências cruzadas

## Aplicação a memórias já existentes
Memórias antigas que vivem só em `mem://` e contêm regra/decisão importante (ex: `autonomia-absoluta-secrets`, `gestao-secrets-autorizacao-previa`, `swarm-mode-sub-agentes`, `auto-salvar-pendencia-ao-cortar`) precisam migrar para `docs/CONSCIENCIA/` na próxima oportunidade que forem tocadas.

## Por quê
- `mem://` é volátil entre workspaces.
- `docs/CONSCIENCIA/` é versionado no Git + espelhado na VPS + legível por humano e qualquer IA.
- Garante sobrevivência das regras a reset de sessão / troca de IA.
