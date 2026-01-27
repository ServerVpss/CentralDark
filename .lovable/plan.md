

# Plano: Correção do Erro de Conexão ao Criar Bot

## Diagnóstico

O problema identificado é uma **extensão do Chrome bloqueando requisições** para as Edge Functions. A extensão (`chrome-extension://eppiocemhmnlbhjplcgkofciiegomcon`) intercepta o `fetch` e causa falhas de rede.

**Boas notícias:** O token do bot é válido e o bot já foi criado com sucesso durante o teste! O bot `@SEGREDOPUXADASBOT` está online e pronto para uso.

## Soluções a Implementar

### 1. Verificar se o Bot já Existe Antes de Criar
- Antes de chamar a Edge Function para criar, verificar no banco se o bot com esse token já existe
- Se existir, apenas sincronizar em vez de criar

### 2. Melhorar Tratamento de Erros de Rede
- Distinguir entre erros de rede (extensão bloqueando) e erros da API
- Mostrar mensagem mais clara quando for erro de conexão
- Sugerir desabilitar extensões temporariamente

### 3. Adicionar Mecanismo de Retry
- Implementar retry automático para falhas de rede (1-2 tentativas)
- Adicionar timeout adequado para as requisições

### 4. Atualizar Configuração do Webhook (já criado)
- O webhook não foi configurado completamente durante a criação de teste
- Precisamos sincronizar o bot para ativar o webhook

## Arquivos a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `src/hooks/useTelegramBots.ts` | Adicionar verificação de bot existente, retry automático, e mensagens de erro mais claras |
| `src/pages/Bots.tsx` | Melhorar feedback visual durante retry |

## Detalhes Técnicos

### Verificação de Duplicatas
```text
Antes de criar:
1. Extrair bot_id do token (primeira parte antes do ":")
2. Consultar telegram_bots onde bot_id == extracted_id
3. Se existir, mostrar mensagem e opção de sincronizar
```

### Retry Automático
```text
Fluxo:
1. Primeira tentativa de criação
2. Se falhar com FunctionsFetchError, aguardar 1s e tentar novamente
3. Se falhar novamente, mostrar mensagem sugerindo desabilitar extensões
```

### Mensagens de Erro Melhoradas
- "Erro de conexão. Verifique se há extensões bloqueando requisições ou tente novamente."
- "Uma extensão do navegador pode estar bloqueando a conexão. Tente desabilitar extensões de VPN, proxy ou ad blockers."

