# Mapa de integração

| Capacidade | Transporte | Owner a procurar |
|---|---|---|
| política/deny | `security/policy.mjs` | gateway/router existente |
| sessão/revogação | `security/session.mjs` | auth/session owner |
| authz | `security/authz.mjs` | API/domain owner |
| sanitização | `security/sanitize.mjs` | error boundary/gateway |
| circuit breaker | `security/circuit-breaker.mjs` | provider resilience |
| audit | `security/audit.mjs` | observability owner |
| banco | `db/*.sql` | Supabase/migrations owner |
| Admin | `admin/*` | painel Admin existente/hermes-webui |
| Casa | `host/windows-readonly-audit.ps1` | local posture tooling |
| VPS | `host/linux-readonly-audit.sh` | VPS posture tooling |

Se existir owner, este pacote perde a disputa e vira somente fonte de delta.
