# Painel Admin > Security Center

Abas: Overview, Casa, VPS, Frontend, Backend, Banco, Sessões, Alertas, Incidentes, Backups, Dependências, Auditoria.

O painel é projeção do estado, não autoridade. Mostra `STATUS + EVIDENCE_REF + OBSERVED_AT`, nunca secret.

Overview: PASS/WARN/FAIL/UNKNOWN/UNPROVEN, incidentes abertos, sessões revogadas, eventos críticos, último restore test.

Banco: schemas expostos, RLS, grants, migrations, private schema, backup/restore.

Sessões: fingerprint, principal, created/seen/expires, revoked/reason. Nunca token.

Incidentes: timeline, containment, evidence refs, owner e resolução. Sem botão de contra-ataque.
