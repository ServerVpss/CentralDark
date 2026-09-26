# Plano — scripts/run-once

## Para que serve
Scripts executados uma única vez para tarefas pontuais (migração, correção, limpeza).

## ✅ Feito
- Pasta criada com README

## 🟡 Em andamento
- Run-once reais ainda vivem em `/scripts/run-once/` (raiz)

## 🔴 A fazer
- Definir template padrão (cabeçalho, log em `/root/CentralDark/revisoes/`, idempotência)
- Mover run-once antigos pra cá após validar

## 🛡️ Regras de segurança
- Todo run-once gera relatório em `revisoes/YYYYMMDD-HHMMSS/<nome>/`
- Nada destrutivo sem confirmação dupla
- Logs sanitizados

## 🚀 Próximo passo
Criar template de run-once.
