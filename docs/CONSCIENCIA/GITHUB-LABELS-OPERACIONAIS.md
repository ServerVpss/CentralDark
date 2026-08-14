# Labels Operacionais CentralDark

## Identidade

```text
SEGREDO/CHEFE = humano e autoridade final
SOL = coordenadora
PIVETE/HERMES = executor, preservação e continuidade
```

Labels roteiam trabalho; **não concedem autoridade humana**.

## Núcleo

| Label | Semântica atual |
|---|---|
| 🟢 PRONTO-PARA-IA | contexto suficiente para análise/execução dentro do escopo vigente |
| 🟡 IA-PRECISA-REVISAR | revisão técnica necessária |
| 🔴 RISCO-SERVIDOR | risco de runtime/infra; aplicar gates proporcionais |
| 🟡 PRECISA-DE-OK | existe decisão humana realmente pendente de SEGREDO/CHEFE |
| 🔐 SEGURANÇA | auth/secret/RLS/credencial; fail-closed e sem valor de secret |
| 🟢 CORREÇÃO-SEGURA | baixo risco e escopo claro |
| 🔴 FALTA-EVIDÊNCIA | estado técnico insuficiente; `UNKNOWN` não vira PASS |
| 🧠 AGENTE-GROK | roteamento/capacidade, não autoridade |
| 🧠 AGENTE-CODEX | roteamento/capacidade, não autoridade |
| 🛠️ INFRA | classificação de escopo |
| 🔧 SELF-HEAL | automação determinística aplicável |
| 🤖 AGENTIC-DEVOPS | coordenação de capacidade, sem segundo sistema |

## Autorização

```text
INTENCAO_JA_AUTORIZADA
→ NÃO adicionar PRECISA-DE-OK só por cerimônia

DECISAO_HUMANA_REALMENTE_NOVA
→ PRECISA-DE-OK
→ AUTORIDADE=SEGREDO/CHEFE
```

O texto histórico `aguarda PERMITO Pivete` corresponde a `LEGACY_COMPATIBILITY_TOKEN_FOR_SEGREDO_CHEFE` quando algum gate ainda exigir o literal. Não significa que PIVETE/HERMES autoriza a si mesmo.

## Automação

1. Label verde não transforma `UNKNOWN` em PASS.
2. Label vermelha sinaliza risco/impedimento; não substitui prova causal.
3. `PRECISA-DE-OK` só pausa quando houver decisão humana nova fora da autorização vigente.
4. Mudança de escopo/ambiente/risco pode invalidar autorização anterior.
5. Roteamento de agente não muda Writer único nem autoridade.

## Regra final

```text
LABEL = SINAL
INTENCAO = SEGREDO/CHEFE
ESTADO = EVIDENCIA
EXECUCAO = CAPACIDADE AUTORIZADA
```
