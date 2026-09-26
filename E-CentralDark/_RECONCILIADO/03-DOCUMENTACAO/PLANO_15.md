# Plano — scripts/

## Para que serve
Scripts operacionais: instalador da VPS, deploy, run-once (tarefas pontuais).

## ✅ Feito
- Estrutura `installer/`, `deploy/`, `run-once/` com READMEs

## 🟡 Em andamento
- Consolidar instalador da raiz (`install.sh`) com `docs/INSTALADOR/`

## 🔴 A fazer
- Mover scripts úteis de `/scripts/` (raiz do repo) para cá
- Padronizar template de script run-once

## 🛡️ Regras de segurança
- Script de deploy NUNCA roda `rm -rf` sem confirmação
- Script de instalador NUNCA apaga `secrets/`, `credenciais/`, `backups/`, `apps/crm/`

## 🚀 Próximo passo
Documentar o fluxo atual de deploy aqui.
