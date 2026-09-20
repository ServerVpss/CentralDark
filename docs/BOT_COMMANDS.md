# 🤖 Comandos do Bot Telegram

## Comandos de Consulta (Grupo e Privado)

| Comando | Tipo | Exemplo | Descrição |
|---------|------|---------|-----------|
| `/cpf` | CPF | `/cpf 12345678900` | Consulta dados por CPF |
| `/cnpj` | CNPJ | `/cnpj 12345678000100` | Consulta empresa por CNPJ |
| `/placa` | Placa | `/placa ABC1234` | Consulta veículo por placa |
| `/placa2` | Placa Completa | `/placa2 ABC1234` | Consulta veículo detalhada |
| `/telefone` ou `/tel` | Telefone | `/tel 11999998888` | Consulta por telefone |
| `/email` | Email | `/email user@email.com` | Consulta por email |
| `/cep` | CEP | `/cep 01310100` | Consulta moradores por CEP |
| `/nome` | Nome | `/nome João Silva` | Busca por nome |
| `/score` | Score | `/score 12345678900` | Score de crédito |
| `/rg` | RG | `/rg MG12345678` | Consulta por RG |
| `/cnh` | CNH | `/cnh 12345678900` | Consulta por CNH |
| `/pix` | PIX | `/pix chave@pix.com` | Consulta chave PIX |
| `/foto` | Foto | `/foto 12345678900` | Foto em todos os estados |
| `/foto` | Foto (estado) | `/foto SP 12345678900` | Foto em estado específico |
| `/nacional` | Foto Nacional | `/nacional 12345678900` | Alias para `/foto` |

## Consultas Múltiplas

É possível enviar até **5 consultas simultâneas** em uma única mensagem:

```
/cpf 12345678900 /placa ABC1234 /telefone 11999998888
```

## Comandos Gerais (Chat Privado)

| Comando | Descrição |
|---------|-----------|
| `/start` | Inicia o bot / Menu principal |
| `/start assinar` | Link direto para planos |
| `/cancelar` | Cancela operação em andamento |

## Botões Inline

| Botão | Callback Data | Descrição |
|-------|--------------|-----------|
| 🗑️ Apagar | `delete_msg` | Deleta mensagem de resultado |
| 📄 Baixar PDF | `pdf:{tipo}:{valor}` | Gera e envia PDF |
| 📝 Ver TXT | `txt:{tipo}:{valor}` | Gera e envia TXT |
| ◀️ Anterior | `page:{id}:{n}` | Página anterior |
| ▶️ Próximo | `page:{id}:{n}` | Próxima página |
| 🔍 {Nome} | `qcpf:{cpf}` | Consulta rápida de CPF (em resultados de CEP/Telefone) |

## Painel Admin (Via Bot)

Disponível para usuários com ID na lista `owner_ids`:

| Menu | Descrição |
|------|-----------|
| 📋 Gerenciar Planos | Criar, editar, ativar/desativar planos |
| 👥 Usuários Ativos | Lista de assinantes ativos |
| 📊 Estatísticas | Métricas do bot |
| 📢 Broadcast | Envio em massa para assinantes |

### Broadcast

Público-alvo:
- **Todos**: Todos os usuários que já assinaram
- **Apenas Ativos**: Apenas com plano ativo
- **Apenas Expirados**: Apenas com plano expirado

Formatos suportados: texto, foto, vídeo, documento.
