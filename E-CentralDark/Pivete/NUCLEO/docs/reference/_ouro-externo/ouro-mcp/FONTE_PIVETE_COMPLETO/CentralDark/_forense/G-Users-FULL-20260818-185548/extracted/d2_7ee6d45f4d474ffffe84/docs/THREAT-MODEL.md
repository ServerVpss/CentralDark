# Threat model

Ativos: autoridade humana, identidade operacional, sessões, credenciais, dados, gateway, workers/tools, código, logs/evidência, backups, Admin, Casa e VPS.

Ameaças prioritárias: broken access control/IDOR, privilege escalation, session theft/replay, secret leak, RLS/grants incorretos, banco exposto, brute force, SSRF/request abuse, injection, prompt/tool injection virando autoridade, supply-chain drift, fallback fail-open, exceção não tratada, worker self-authorization, writer collision, audit tampering, backup não restaurável, portas desnecessárias e containers privilegiados.
