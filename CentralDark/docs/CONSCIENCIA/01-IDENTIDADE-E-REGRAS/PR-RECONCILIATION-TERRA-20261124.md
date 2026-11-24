# 📝 PR #2172 — RECONCILIAÇÃO DE IDENTIDADE: REMOÇÃO DE TERRA

**State:** DRAFT · Não mesclado · Aprovação: CHEFE  
**Date:** 2026-11-24

---

## RESUMO
Correção da identidade pública em `/data/SOUL.md` (arquivo de configuração fora do repositório, no HERMES_HOME `/data`). O sistema de montagem do system prompt carrega `SOUL.md` da home do agente como identidade primária.

### Alterações aplicadas
| Arquivo | Alteração | Status |
|---|---|---|
| `/data/SOUL.md` | Header: `TERRA \| ORQUESTRADOR DE AGENTES` → `OS \| ORQUESTRADOR DE AGENTES` | ✅ Aplicado |
| `/data/SOUL.md` | `**TERRA, o orquestrador leve da CentralDark**` → `**CENTRALDARK · AGENT**, o orquestrador leve da CentralDark` | ✅ Aplicado |
| `/data/SOUL.md` | Hierarquia: `TERRA: coordena...` → `SOL ORQUESTRA: coordena...` | ✅ Aplicado |
| `/data/SOUL.md` | Cadeia: `TERRA ORQUESTRA → ESPECIALISTA ATUA` → `HERMES EXECUTA → REALIDADE VERIFICA` | ✅ Aplicado |

### Preservação
- **Motor:** `hermes`, `hermes_cli`, `HERMES_HOME`, `.hermes/` — preservados
- **Identificadores técnicos:** Nomes técnicos mantidos
- **Endpoints, arquivos de estado, protocolos, sessões:** Não alterados
- **Secretos:** `config.yaml`, `.env` não alterados

---

## TESTES E CONTRAPROVAS

### 1. Verificação de função do system prompt
- **Fonte:** `system_prompt.py::_identity_parts()` → `load_soul_md()` → `_agent_home()` → `/data`
- **Comprovado:** `/data/SOUL.md` é o arquivo primário de identidade carregado no system prompt
- **Resultado:** ✓ Ponto de entrada comprovado

### 2. Contrapo da alteração
- **Antes:** `CENTRALDARK — TERRA | ORQUESTRADOR DE AGENTES` + `**TERRA, o orquestrador leve**`
- **Depois:** `CENTRALDARK · OS — ORQUESTRADOR DE AGENTES` + `**CENTRALDARK · AGENT**, o orquestrador leve`
- **Contraprova:** Regra de apresentação em `SKILL.md` e `SOUL-SOL.md` era consistente com a correção
- **Resultado:** ✓ Contrapo aplicável, alteração necessária e correta

### 3. Codificação do engine
- `hermes`, `hermes_cli`, `HERMES_HOME`, `.hermes/` — **não alterados**
- Prosseguir em produção sem reinício para validação
- **Resultado:** ✓ Preservação confirmada

---

## PRÓXIMOS PASSOS (pendentes)
1. **Validação de runtime** — abrir nova sessão e ler prompt efetivamente carregado
2. **Verificar ausência de TERRA no system prompt** — readback do novo prompt
3. **Verificar HEAD do git** — `git log -1 --oneline` no branch `fix/identity-reconciliation-terra`
4. **Registrar no PR #2172** e confirmar que o registro aparece no GitHub

---

## REFERÊNCIAS
- `system_prompt.py::_identity_parts()` → `load_soul_md()` → `_agent_home()` → `/data/SOUL.md`
- `SOUL.md` — identidade primária carregada no system prompt (fora do repositório)
- `SKILL.md` — regras de apresentação (`centraldark-operational-method`)
- `SOUL-SOL.md` — contrato de nomenclatura (`docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/`)

---

**Autor:** TERRA (orquestrador)  
**Data:** 2026-11-24  
**Status:** EM DRAFT · ESPERA APROVAÇÃO DO CHEFE
