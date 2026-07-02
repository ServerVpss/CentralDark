---
title: "PLAYBOOK VALIDACAO DE ENDPOINTS"
date: 2026-07-02
tags: ["consciencia"]
updated: 2026-07-02
---

# 🛡️ PLAYBOOK — Validação Cirúrgica de Endpoints e Credenciais

> **Nome Técnico:** MCAI (Método Cirúrgico de Ataque à Infraestrutura)
> **Tipo de Documento:** Red Team Playbook
> **Atualizado:** 29 de junho de 2026

---

## 🎯 Objetivo

Identificar, validar e isolar falhas de comunicação ou credenciais expostas ("ratos") em endpoints de infraestrutura de forma **precisa e controlada**, minimizando ruído e risco de vazamento.

---

## 📋 FASE 1: Varredura de Segurança (Limpeza Prévia)

Antes de realizar qualquer teste, é obrigatório limpar o ambiente para evitar falsos positivos e vazamento acidental de credenciais.

### 1.1 Varredura por Padrão de Chave

```bash
grep -rnI "PADRÃO" /caminho/ --exclude-dir={.git,node_modules,cache}
```

> **Comando chave:** `grep -rnI "PADRÃO" /caminho/ --exclude-dir={lista_exclusao}`

### 1.2 Sanitização

Apagar ou rotacionar qualquer chave encontrada em `.bash_history` ou `.env` que **não** seja a chave ativa.

---

## 🚀 FASE 2: Validação de Protocolo (O Teste)

Não assumir que a URL é uma API. Validar a linguagem do servidor.

### 2.1 Teste de Protocolo (Curl)

Disparar requisições em paralelo:

| Teste | Cabeçalho |
|-------|-----------|
| Teste 1 | `Authorization: Bearer` |
| Teste 2 | `x-api-key` (padrão Anthropic) |
| Teste 3 | Full Headers (`x-api-key` + `anthropic-version`) |

### 2.2 Análise de Resposta

- `200 OK` (JSON) → O gateway é uma **API válida**
- `500 HTML` → O endpoint é uma **interface web** (Proxy Web) — ❌ **descartar para automação**

---

## 🔍 FASE 3: Mapeamento de Modelos

Com a autenticação validada, extrair o dicionário de modelos aceitos.

### 3.1 Requisição ao Endpoint `/models`

```bash
curl -H "x-api-key: [KEY]" \
     -H "anthropic-version: 2023-06-01" \
     [URL]/v1/models | python3 -m json.tool
```

### 3.2 Registro

Salvar os IDs exatos (ex: `sonnet-4.6`) para configuração no Cline.

---

## ✍️ FASE 4: Documentação de Aprendizado

Todo erro deve virar um registro na pasta `~/CentralDark/docs/APRENDIZADOS/[TEMA]/`.

**Estrutura do registro:**

1. Nome do Erro
2. Diagnóstico Técnico
3. Solução Aplicada
4. Regra de Ouro

---

> **⚠️ NOTA DE EXECUÇÃO**
>
> Nunca configure o Cline (bot) antes de validar o protocolo via terminal. O **terminal** é a "verdade absoluta" da comunicação com a VPS.
