# 04 — Estrutura de pastas na VPS

```
/root/Multizap/
├─ apps/
│  ├─ clone-deck/     # Frontend (este repo Lovable)
│  ├─ bot/            # Bot WhatsApp
│  ├─ crm/            # CRM (NÃO MOVER)
│  ├─ portal/
│  └─ web/
├─ api/
│  ├─ gateway/
│  ├─ whatsapp/qrcode/
│  ├─ webhooks/
│  └─ integrations/
├─ guarda/            # Monitoramento e auditoria
│  ├─ scripts/
│  ├─ scans/
│  ├─ status/
│  └─ incidentes/
├─ quarantine/        # Arquivos suspeitos isolados
├─ revisoes/          # Relatórios de operações (YYYYMMDD-HHMMSS/nome/)
├─ logs/              # Logs centralizados
├─ backups/           # Backups (BD, sessões WhatsApp)
├─ secrets/           # NUNCA versionado, nunca exposto em log
└─ credenciais/       # idem
```

## Regras
- O instalador **cria** todas as pastas vazias se não existirem.
- O instalador **nunca apaga** `secrets/`, `credenciais/`, `backups/`, `apps/crm/`, `wuzapi/`.
- Relatórios sempre em `revisoes/YYYYMMDD-HHMMSS/<nome-da-tarefa>/`.

<!-- CENTRALDARK_RUNNER_LINUX_PHASE_20261112 -->
## Layout isolado por host (medido em 2026-11-12)

- **Casa Windows:** `F:\_WORKER\CentralDark-Runners\CASA-1` = runner `centraldark-casa-1`; preservar a instancia atual e seu workspace.
- **VMware/openKylin:** `/home/CentralDark-OS/CentralDark` = checkout de codigo; `/home/CentralDark-OS/actions-runner` = binario, registro e servico Linux; `actions-runner/_work` = checkout efemero exclusivo de CI.
- **VPS futura:** usar layout relativo `$HOME/CentralDark` e `$HOME/actions-runner`, com registro e servico proprios. Nao copiar da VM `.credentials`, `.credentials_rsaparams`, `.runner`, `.service` ou chaves SSH.
- **GitHub:** source, PR, checks. **Hermes:** watchdog e consultas deterministicas existentes. **HUD:** PR equivalente e receipt, nao outro banco de estado.

`CENTRALDARK_RUNNER_HOME` permite definir um caminho absoluto por host. O instalador recusa symlink, instalacao dentro do checkout e diretorio parcial existente; usa lock exclusivo e so promove o pacote depois de verificar SHA-256. Nao executar jobs no checkout compartilhado/dirty.
<!-- /CENTRALDARK_RUNNER_LINUX_PHASE_20261112 -->
