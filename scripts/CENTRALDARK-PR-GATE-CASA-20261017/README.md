# 🪬 CentralDark — PR Gate único da Casa

Execute **`EXECUTAR-CASA.cmd`** com duplo clique ou use PowerShell:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\CENTRALDARK-PR-GATE-CASA.ps1 -Modo Auditar
```

Requisitos: **GitHub CLI `gh` instalado e autenticado**, acesso à internet pelo Windows e permissão de leitura do repositório/Actions. A política de execução é alterada **somente no processo** deste comando.

O script consulta dinamicamente **todos os PRs abertos para main** e mede: HEAD, Draft, `mergeable_state`, Actions `pull_request` do mesmo SHA, check-runs, status antigo, reviews APPROVED no mesmo SHA e arquivos sobrepostos entre PRs. Para impedir falso verde, falhas de API e dados incompletos causam bloqueio. Os estados `queued`, `pending`, `skipped`, `action_required`, `cancelled` e `failure` não são tratados como verde.

Ele salva `RESULTADO-PR-GATE-<data-hora>/resultado.json` e `RELATORIO.md` junto ao pacote.

**Códigos:** `0` elegível para **revisão/planejamento de integração**, `2` bloqueado por checks ou owner, `3` erro de ferramenta/rede. `0` **não executa merge nem deploy**: os PRs são propostas e precisam primeiro entrar na main com o fluxo de aprovação do repositório. A diferença entre `PR_CI_PASS`, `MAIN_MERGED` e `VPS_DEPLOYED` continua preservada.

**Modo adicional:** `-Modo Preparar` roda o probe **somente leitura** do `K:\scripts\remote-bridge\canonical\CENTRALDARK-VPS-UPDATE.ps1 -ProbeOnly` **somente se todos os gates anteriores estiverem verdes**, mas NÃO aplica deploy. O updater já existe no projeto; nenhum serviço, agente ou bridge é criado aqui.

**Não realiza** `gh pr merge`, auto-merge, checkout, git reset/clean, push, SSH write, deploy, troca de chaves, edição da Casa nem da VPS.

## Snapshot medido nesta conversa — 17/10/2026

13 PRs abertos: #1829, #1830, #1831, #1833, #1834, #1835, #1836, #1837, #1838, #1839, #1840, #1841, #1842.
- #1841 e #1842 estão em Draft.
- No HEAD verificado, 12 PRs tinham workflows ainda pendentes, nenhum totalmente verde.
- #1834 tinha 16 workflows com `action_required` (não equivale necessariamente a teste de código falho).
- Arquivos coincidentes: #1830×#1842 (extensão VS Code), #1831×#1838 (CockpitShell), #1837×#1838 (documentos Trigger Fabric), #1839×#1840 (verify-hud-zone.mjs).
- `main` GitHub e VPS no momento da medição: `6b1105bce899a90841d5a76f3c4eb6ae2a3c35fa`; porém `deploy_status` relatou erro de parse do PM2, logo SHA igual não prova saúde dos serviços.

A auditoria executada por esse pacote será sempre **nova e dinâmica**. O snapshot acima é apenas referência histórica.
