---
title: "CONFIGURACAO_CLINE"
date: 2026-07-02
tags: ["consciencia"]
updated: 2026-07-02
---

# 🚀 GUIA: Configuração de API no Cline

### O Cenário
Para automação bem-sucedida, o Cline exige uma conexão direta com provedores que expõem endpoints de API compatíveis com o padrão OpenAI/Anthropic.

### Passos de Validação
1. **Teste via Terminal**: Sempre valide o endpoint antes.
   `curl -H "x-api-key: [SUA_CHAVE]" [URL_API]/v1/models`
2. **Critério de Sucesso**: O servidor DEVE retornar um JSON. Se retornar HTML, o servidor é uma interface web e não serve para o Cline.

### Configuração Recomendada (Cline)
* **Provider**: OpenAI Compatible
* **Base URL**: Use apenas URLs que terminam em /v1 (ex: https://api.openrouter.ai/v1)
* **Headers**: Se o provedor exigir, adicione `x-api-key` no campo Custom Headers.

---

## Conexões Rápidas

- [[00-LEIA-PRIMEIRO]] — portão de entrada
- [[MAPA-DO-CEREBRO]] — visão geral
- [[CONSCIENCIA]] — documento mestre
