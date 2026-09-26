---
name: centraldark-harvest
description: Minerar Notepad/CentralDark para handoff ChatGPT.
---

# CentralDark Intelligence Harvest

## Visão geral
Esta skill rege a mineração de fontes locais (Notepad LocalState, CentralDark repo, runtime state) e a reconciliação em um handoff para ChatGPT, sem criar novos sistemas.

## Pipeline
1. LOCALSTATE → Inventariar WindowState + TabState
2. RECONSTRUIR janelas/abas
3. EXTRAIR texto recuperável
4. DEREFERENCIAR arquivo original apenas se necessário
5. DEDUPLICAR
6. CLASSIFICAR (CURRENT_CANDIDATE, HISTORICAL_REFERENCE, DUPLICATE, SENSITIVE_QUARANTINE, DISCARD)
7. QUARENTENAR sensível
8. CRUZAR com estado vivo
9. CRISTALIZAR somente inteligência útil

## Forense READ_FIRST
- Sempre medir estado atual antes de confiar em dados históricos.
- LOCAL_REALITY = JUDGE: realidade observada localmente decide a verdade.
- HISTORICAL != CURRENT: dados antigos não sobrescrevem medições atuais.
- UNKNOWN != PASS: ausência de evidência não é prova.
- DOCUMENTED != EXECUTED: documentação não é execução.
- NOTEPAD_STATE != CANONICAL_TRUTH: estado do Notepad não é verdade canônica.
- UNSAVED_TAB != SAFE_TO_PERSIST: abas não salvas não são seguras para persistir.

## Proibições Adicionais
- Não criar nova API para ChatGPT.
- Não criar API/VPS bridge nova.
- Não criar daemon só para esta missão.
- Não criar webhook.
- Não criar bot/notificador.
- Não criar IPNAMES-V2.
- Não criar MEMORY-V2.
- Não duplicar owner existente.
- Não criar sistema novo.
- Não inventar nova arquitetura.
- Não alterar código sem delta material provado + owner correto + sem colisão de Writer.

## IPNAMES
- Tratar SOMENTE como enriquecimento.
- EXTERNAL_FEED != NETWORK_TRUTH.
- IP_PRESENTE_NO_FEED != SERVICO_AUTENTICADO.
- IP_AUSENTE_DO_FEED != MALICIOSO.
- FQDN_ASSOCIADO != CAUSALIDADE.
- LOCAL_REALITY = JUDGE.

## Operação
- PARALELIZE_PERCEPCAO: percepção pode ser paralela.
- SERIALIZE_MUTACAO: mutação deve ser serializada.
- OWNER correto identificado antes de qualquer mutação.
- Nenhuma colisão de Writer.

## Proibições
- Não criar nova API, serviço, daemon, webhook, bot, IPNAMES-V2, MEMORY-V2, ou duplicar owner.
- Não alterar firewall, VPN, DNS, rotas automaticamente.
- Se usar IPNAMES, registrar upstream repo + commit SHA + timestamp; cruzar apenas com DNS/conexão/trace local realmente observados.

## Formato do Handoff
Produzir bloco handoff com seções: MEASURED_AT, CENTRALDARK_BRANCH, CENTRALDARK_HEAD, ACTIVE_PR, WRITER_SCOPE, detalhes NOTEPAD, DEDUPED_ITEMS, SENSITIVE_QUARANTINED, HISTORICAL_ITEMS, CURRENT_CANDIDATES, FORMAT_VERIFIED, CURRENT_FACTS, SUPERSEDED_HISTORY, OPEN_GAPS, CONTRADICTIONS, IPNAMES_DELTA, NEXT_SAFE_ACTION.

## Referências
Veja `references/harvest-rules.md` para regras detalhadas e exemplos.