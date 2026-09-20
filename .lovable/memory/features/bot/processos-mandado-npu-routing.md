---
name: Auto-roteamento NPU para /processos e /mandado
description: Módulos processos/processo/mandado aceitam CPF (11d) ou NPU (20d). Se input for NPU, auto-roteia para módulo `processo` (singular)
type: feature
---
Os módulos `processos`, `processo` e `mandado` aceitam dois tipos de entrada:
- **CPF (11 dígitos)**: consulta por pessoa
- **NPU (Número de Processo Unificado, 20 dígitos)**: consulta por processo específico

Quando o usuário envia `/processos <NPU 20d>` ou `/mandado <NPU 20d>`, o `api-query` auto-roteia para o módulo `processo` (singular), que é o endpoint correto para busca por número de processo. Mensagem de erro: "Informe um CPF (11 dígitos) ou número de processo (20 dígitos)."

Implementação em `supabase/functions/api-query/index.ts`: `NPU_OR_CPF_MODULES` set + bloco "Auto-route NPU".
