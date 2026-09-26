# Plano — apps/modulos

## Para que serve
Guarda os módulos de negócio da CentralDark. Cada subpasta é um produto ativável dentro do portal.

## ✅ Feito
- Estrutura criada: `multizap/`, `financeiro/`, `telepainel/`
- README + PLANO em cada módulo

## 🟡 Em andamento
- MultiZap ainda rodando na árvore antiga (`/root/Multizap/`)

## 🔴 A fazer
- Migrar MultiZap para `modulos/multizap/`
- Definir esqueleto inicial dos módulos `financeiro/` e `telepainel/`
- Padronizar contrato comum (ativação, permissões, logs)

## 🛡️ Regras de segurança
- Cada módulo isolado — não compartilha secret nem banco direto
- Ativação/desativação só via portal, com role válido
- Nenhum módulo mexe em outro sem passar pelo gateway

## 🚀 Próximo passo
Começar a migração do MultiZap quando vier sinal verde.
