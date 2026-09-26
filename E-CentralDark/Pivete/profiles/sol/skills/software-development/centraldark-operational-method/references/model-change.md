# Alteração segura de modelo no Hermes

Para mudar o modelo do Hermes Agent, use um dos métodos oficiais:

1. **Configuração persistente** (recomendado para alterações de longa duração):
   ```bash
   hermes config set model.default <model-id>
   ```
   Exemplo: `hermes config set model.default nous/hermes-3-llama-3-1-70b`

2. **Menu interativo** (para escolha rápida e visual):
   ```bash
   hermes model
   ```
   Isso abrirá uma lista de modelos disponíveis para seleção.

**Não use** `hermes model set <model-id>` — esse comando não existe e resultará em erro.

Após alterar o modelo, confirme com:
```bash
hermes model
```
para ver o modelo atualmente ativo.

## Confirmação de ação

Antes de executar qualquer comando que altere o estado do agente (como mudar modelo, escrever arquivos, executar scripts, etc.):
- Aguarde uma autorização explícita do usuário (ex.: "sim", "execute", "prossiga", "vá ahead").
- Não interprete perguntas, sugestões ou afirmações exploratórias como autorização para agir.
- Se o usuário pedir confirmação ou esclarecimento, responda brevemente e aguarde o sinal claro para prosseguir.

Este padrão evita execuções indesejadas e respeita a intenção do usuário.