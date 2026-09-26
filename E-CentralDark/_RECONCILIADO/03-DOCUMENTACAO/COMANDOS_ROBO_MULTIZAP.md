
## 2026-05-21 — Audit_log de Modo Intervenção (/admin/inbox)
Toda ação operacional do super_admin em /admin/inbox com Modo intervenção ON é registrada em audit_log com actions:
`admin:inbox_intervention_message`, `admin:payment_command_intervention`, `admin:inbox_intervention_claim`, `admin:inbox_intervention_close`, `admin:inbox_intervention_rename_contact`, `admin:inbox_intervention_transfer`.
Payload nunca contém conteúdo da mensagem, tokens, session_token, PIX copia-cola ou QR. Workspace_id é sempre o do dropdown (cliente), nunca o do master. /app/inbox normal não gera essas actions. Modo somente leitura bloqueia composer e ações, então não há o que auditar.
