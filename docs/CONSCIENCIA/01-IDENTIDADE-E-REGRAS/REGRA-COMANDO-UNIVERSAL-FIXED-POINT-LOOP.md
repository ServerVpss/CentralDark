---
title: "Regra — Comando Universal Fixed-Point Loop"
status: "CANONICAL_RULE"
updated: 2026-09-25
owner: "docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/"
authority: "SEGREDO/CHEFE"
truth_rule: "CENTRALDARK_COMMANDS_ARE_MODEL_REPLACEABLE"
---

# Regra — Comando Universal Fixed-Point Loop

## 0. Correção do Chefe

O `command_id` do loop de ponto fixo **não pode** carregar nome de modelo, versão,
executor ou instância temporária.

Errado:

```yaml
command_id: SOL_5_6_MAX_FIXED_POINT_LOOP
```

Certo:

```yaml
command_id: CENTRALDARK_FIXED_POINT_LOOP
```

A SOL pode coordenar. Hermes pode executar. Outro modelo pode substituir. Mas o
comando pertence ao organismo CentralDark, não a uma versão de agente.

## 1. Lei

```text
MODEL_IS_REPLACEABLE=true
AGENT_IS_REPLACEABLE=true
COMMAND_ID_IS_CANONICAL=true
CENTRALDARK_COMMANDS_ARE_ORGANISM_SCOPED=true
MODEL_NAME_IN_COMMAND_ID=false
VERSION_NAME_IN_COMMAND_ID=false
```

## 2. Separação correta

```yaml
command_id: CENTRALDARK_FIXED_POINT_LOOP
agent_role: FRONTIER_COORDINATOR
runtime_executor: CURRENT_AVAILABLE_AGENT
coordinator_hint: SOL_5_6_ALLOWED
model_binding: REPLACEABLE
```

`agent_role` pode mencionar função.
`coordinator_hint` pode mencionar quem está segurando a caneta agora.
`command_id` não pode mencionar modelo.

## 3. Por que isso existe

Se o comando nasce como `SOL_5_6_*`, só a SOL 5.6 parece autorizada a usar.
Isso quebra o princípio de modelos substituíveis e cria acoplamento falso.

```text
COMMAND_ID != CURRENT_MODEL
CURRENT_MODEL != OWNER
OWNER = CENTRALDARK_ORGANISM
REALIDADE = JUIZ
```

## 4. Forma canônica atual

```yaml
CENTRALDARK_FRONTIER_AGENT_COMMAND:
  command_id: CENTRALDARK_FIXED_POINT_LOOP
  invocation: "!CENTRALDARK #ACORDAR #CURRENT_REALITY 🔎 !META_LUPA ⚖️ !CONTRAPROVA"
  authority: SEGREDO_CHEFE
  agent_role: FRONTIER_COORDINATOR
  mode: MAX_AUTONOMY_WITH_REALITY_JUDGE
```

## 5. Regra de validação

Um comando canônico é inválido se `command_id` contém:

- nome de modelo;
- versão de modelo;
- apelido de agente atual;
- nome de ferramenta temporária;
- qualquer executor que possa ser substituído.

O lugar correto para isso é `agent_role`, `coordinator_hint`, `runtime_executor`,
ou receipt de execução.

<i>UNKNOWN != PASS · COMMAND_ID != MODEL · ONE_SYSTEM_ONLY</i>
