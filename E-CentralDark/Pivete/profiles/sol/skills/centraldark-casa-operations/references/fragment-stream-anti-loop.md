# Padrão Anti-Loop para Fragmentos Consecutivos (paste_25)

## Problema
Usuário cola script Python linha a linha (ou em pedaços) → Hermes trata cada fragmento como comando novo → repete recusa idêntica → loop de 3+ recusas idênticas → viola `SAME_FAILURE_NO_NEW_INFORMATION → REUSE_CRYSTAL`.

## Estados do Stream de Fragmentos

| Estado | Gatilho | Ação |
|--------|---------|------|
| `NORMAL` | Início conversa / intent clara | Processa normal |
| `FRAGMENT_STREAM_OPEN` | 1º fragmento sensível (secret, credencial, script incompleto) | Bloqueia execução + emite aviso **UMA vez** → `FRAGMENT_STREAM_OPEN` |
| `WAITING_FOR_INTENT` | Fragmentos 2..N do mesmo stream | **Não executa**, **não ecoa** conteúdo sensível, **não repete** aviso → mantém `FRAGMENT_STREAM_OPEN` |
| `READ_ONLY_ANALYSIS` | Intenção explícita "só analisa/le" | Prossegue análise sem execução |
| `EXECUTION_REQUEST` | Pedido explícito de execução | Gates normais (secrets continuam fora) |

## Fingerprint do Evento (para dedup)
Calculado a cada fragmento:
- `failure_class` — ex: `SECRET_IN_FRAGMENT`, `INCOMPLETE_SCRIPT`, `CREDENTIAL_EXPOSURE`
- `source/session` — origem (chat, paste, terminal) + session_id
- `gate_reason` — `SECRET_BLOCK`, `INCOMPLETE_SCRIPT`, `CREDENTIAL_IN_FRAGMENT`
- `intent_state` — `NONE`, `READ_ONLY`, `EXECUTE_REQUEST`

## Regra de Supressão (SUPPRESS)
Se **TODOS** verdadeiros:
- `SAME_FAILURE` (mesma failure_class)
- `SAME_REASON` (mesmo gate_reason)
- `NO_NEW_INFORMATION` (mesmo fingerprint, nenhuma intenção nova)

→ **SUPPRESS** = não emite resposta, não repete aviso, mantém `FRAGMENT_STREAM_OPEN`.

## Transições de Estado

| De | Para | Gatilho |
|------|------|---------|
| `NORMAL` | `FRAGMENT_STREAM_OPEN` | 1º fragmento sensível detectado |
| `FRAGMENT_STREAM_OPEN` | `WAITING_FOR_INTENT` | Fragmento 2..N do mesmo stream (SUPPRESS) |
| `WAITING_FOR_INTENT` | `READ_ONLY_ANALYSIS` | User diz "só analisa/le" |
| `WAITING_FOR_INTENT` | `EXECUTION_REQUEST` | User diz "executa/roda" + gates normais |
| `FRAGMENT_STREAM_OPEN` / `WAITING_FOR_INTENT` | `NORMAL` | Nova intenção material / nova causa material / `NEW_SKILL` / `NEW_INTENT` |

## Contraprova (validação do comportamento)
| Cenário | Esperado |
|---------|----------|
| A: fragmento 1 sensível | 1 recusa + aviso |
| B: fragmentos 2..20 mesmo stream | 0 recusas repetidas, 0 echo de segredo, stream aberto |
| C: intenção "só analisa" | Análise prossegue sem execução |
| D: intenção de executar script sensível | Gate normal bloqueia (secrets fora) |
| E: nova causa material | Nova mensagem permitida (reset stream) |

## Invariantes
1. **Primeiro fragmento sensível → 1 aviso** (máximo 1 por stream)
2. **Fragmentos 2..N mesmo stream → 0 recusa repetida, 0 echo de segredo**
3. **Fingerprint calculado em cada fragmento** (failure_class + source/session + gate_reason + intent_state)
4. **SAME_FAILURE + SAME_REASON + NO_NEW_INFO → SUPPRESS** (zero output)
5. **Intenção "só leitura" → READ_ONLY_ANALYSIS** (análise prossegue, sem execução)
6. **Intenção execução → gates normais** (secrets continuam fora)
7. **Secrets NUNCA em receipt/log/receipt** (regra absoluta)
8. **Nova causa material → reset stream** (nova mensagem permitida)

## Contrapass (validação do padrão)
| | Esperado |
|---|----------|
| Fragmento 1 sensível | 1 recusa + aviso |
| Fragmentos 2..20 mesmo stream | 0 recusa repetida, 0 echo secret, stream aberto |
| Intenção "só analisa" | Análise prossegue sem execução |
| Intenção executar script sensível | Gate normal bloqueia (secrets fora) |
| Nova causa material | Nova mensagem permitida |

---

*Origem: paste_25 (DELTAUTILS), registrado na sessão 2026-08-27. Incidente: Hermes/Charizard travado em loop de recusa idêntica para fragmentos consecutivos de script Python forense Contabo/Cloudflare.*