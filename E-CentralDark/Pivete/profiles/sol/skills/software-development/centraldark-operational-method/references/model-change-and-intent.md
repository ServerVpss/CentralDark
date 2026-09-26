# Interpretação de Intenção do Usuário

No protocolo CentralDark, é crucial distinguir entre:
- Perguntas que buscam confirmação ou esclarecimento (não autorizam ação)
- Declarações explícitas de autorização para executar

Sinais de que NÃO há autorização para agir:
- Perguntas diretas: "Quer que eu faça X?", "Você pode fazer Y?", "Deveríamos fazer Z?"
- Frases exploratórias: "Estou pensando em fazer X", "Será que poderíamos tentar Y?"
- Solicitações de informação: "Como eu faria X?", "Qual o comando para Y?"
- Expressões de dúvida: "Não tenho certeza se devemos fazer X"

Sinais de AUTORIZAÇÃO explícita:
- "Sim", "Execute", "Prossiga", "Vai ahead", "Faça isso"
- Comandos diretos: "Mude o modelo para X", "Execute o comando Y"
- Confirmação após pergunta: quando o usuário respondeu "sim" a uma pergunta explícita de autorização

Sempre aguarde uma autorização explícita antes de executar comandos que alterem o estado do sistema.

# Correta Alteração de Modelo no Hermes Agent

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