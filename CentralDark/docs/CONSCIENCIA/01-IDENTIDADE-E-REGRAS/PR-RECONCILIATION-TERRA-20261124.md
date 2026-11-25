# 📝 PR #2174 — RECONCILIAÇÃO DE IDENTIDADE: IDENTIDADE DINÂMICA (SEM TERRA FIXA)

**State:** DRAFT · Não mesclado · Aprovação: CHEFE  
**Date:** 2026-11-24  
**Owner:** ORQUESTRADOR (função dinâmica, não identidade fixa)

---

## PRINCÍPIO FUNDAMENTAL
**Identidade pública = escolhida pelo CHEFE.**
**Nome do agente != Modelo. Nome do agente != Papel. Nome do agente != Motor.**

**PROIBIDO IMPORTAR IDENTIDADE FIXA:** TERRA, HERMES, SOL OU QUALQUER OUTRA.

- Papéis são funções dinâmicas.
- Modelos são motores substituíveis.
- Capacidades definem quem executa.
- Um orquestrador lógico por missão.
- Um writer por escopo.
- Autoridade final = CHEFE responsável.

---

## ALTERAÇÕES APLICADAS

| Arquivo | Alteração | Status |
|---|---|---|
| `/data/SOUL.md` | Header: `TERRA \| ORQUESTRADOR` → `OS — IDENTIDADE DINÂMICA` | ✅ Aplicado |
| `/data/SOUL.md` | Identidade fixa `TERRA` → Princípio: identidade escolhida pelo CHEFE | ✅ Aplicado |
| `/data/SOUL.md` | Hierarquia fixa → Funções dinâmicas (não identidades) | ✅ Aplicado |
| `/data/SOUL.md` | Cadeia: `TERRA ORQUESTRA` → `ORQUESTRADOR (escolhido por missão)` | ✅ Aplicado |

### Preservação
- **Motor:** `hermes`, `hermes_cli`, `HERMES_HOME`, `.hermes/` — preservados
- **Identidade do modelo:** `You are Hermes Agent, built by Nous Research` — identidade técnica do modelo (Nous Research), **não** nome público; a apresentação pública é escolhida pelo CHEFE
- **Identificadores técnicos:** Mantidos
- **Endpoints, arquivos de estado, protocolos, sessões:** Não alterados
- **Secretos:** Não expostos

---

## TESTES E CONTRAPROVAS

### 1. Localização da origem
- **Fonte:** `system_prompt.py::_identity_parts()` → `load_soul_md()` → `_agent_home()` → `/data`
- **Comprovado:** `/data/SOUL.md` é o arquivo primário de identidade
- **Resultado:** ✓ Origem comprovada

### 2. Correção aplicada
- **Antes:** Identidade fixa `TERRA` importada no system prompt
- **Depois:** Princípio de identidade dinâmica escolhida pelo CHEFE
- **Contraprova:** Regra em `SKILL.md`/`SOUL-SOL.md` de nomenclatura não fixa identidade
- **Resultado:** ✓ Correção necessária e correta

### 3. Validação externa
- `validate_unified_surface_parity_contract.py` → `UNIFIED_SURFACE_PARITY_CONTRACT=PASS` (exit 0)
- `CENTRALDARK_UNIFIED_SURFACE_PARITY_01` — contrato validado

---

## PR NO GITHUB
**PR #2174:** https://github.com/ServerVpss/CentralDark/pull/2174
- **Commit (HEAD):** `79a86963`
- **Additions:** 87 | **Deletions:** 0
- **State:** OPEN (aguarda aprovação CHEFE)

---

## PENDÊNCIAS
1. **Testar nova sessão** (readback do system prompt) — pendente (requer ambiente)
2. **Aprovação CHEFE** — aguardando
3. **Merge** — apenas após aprovação

---

## REFERÊNCIAS
- `system_prompt.py::_identity_parts()` → `load_soul_md()` → `_agent_home()` → `/data/SOUL.md`
- `SKILL.md` (`centraldark-operational-method`) — regras de apresentação
- `SOUL-SOL.md` — contrato de nomenclatura
- `CENTRALDARK_UNIFIED_SURFACE_PARITY_01` — contrato validado

---

**AUTOR:** ORQUESTRADOR (função dinâmica, não identidade fixa)  
**Data:** 2026-11-24  
**Status:** EM DRAFT · ESPERA APROVAÇÃO DO CHEFE
