# Mapa Leigo do Sistema (MultiZap)

Bem-vindo ao mapa do sistema! Aqui você entende como a nossa máquina funciona sem precisar saber ler código de programação. Pense neste sistema como um Restaurante de Luxo.

## `apps/bot`
**Nome leigo:** A Tela de Bate-Papo (O Salão do Restaurante)
- **O que faz:** É a tela onde você clica, vê os contatos na barra da esquerda e digita mensagens.
- **O que entra nela:** Sinais invisíveis do banco de dados avisando que chegou uma mensagem nova.
- **O que sai dela:** Comandos de envio (quando você aperta a setinha verde de enviar).
- **Arquivos principais:** `Chats.tsx` (A tela principal), `useRealtimeMessages.ts` (A antena de TV que capta mensagens no ar).
- **O que pode dar errado:** Se a internet falhar ou a antena estiver desconfigurada, a tela pode ficar "congelada" e a mensagem nova não aparecer.
- **Como testar:** Abra `bot.multizap.dev`, mande uma mensagem pelo celular e veja se ela aparece na tela sem você ter que dar "F5".

## `apps/crm/atendimento-whatsapp-gateway-deploy/gateway`
**Nome leigo:** A Telefonista do WhatsApp (O Gateway)
- **O que faz:** Fica escutando a linha de telefone 24 horas por dia. Quando chega um SMS no WhatsApp, ela anota, filtra se é foto ou texto e passa pro Arquivo (Banco de Dados). E também atende o Painel do Usuário (Bot) para fazer disparos.
- **O que entra nela:** Eventos do WhatsApp enviados pela WuzAPI (Mensagem, Visto por último).
- **O que sai dela:** Pacotes empacotados, com o nome da pessoa arrumado, gravados na tabela `messages`.
- **Arquivos principais:** `webhooks.routes.js` (a porta de entrada), `supabaseService.js` (o escrivão que anota no banco de dados).
- **O que pode dar errado:** Se a telefonista estiver com as configurações de banco erradas (faltando o arquivo `.env`), ela ouve a mensagem mas não tem onde anotar, então a mensagem se perde no além.
- **Como testar sem expor segredo:** Executar o script `test-gateway.sh` que dispara mensagens de mentira sem usar senhas reais de banco de dados.

## `security`
**Nome leigo:** O Cofre do Gerente
- **O que faz:** Dita as regras do que os programadores não podem fazer de jeito nenhum (vazar senhas de clientes, destruir a base sem backup).
- **Arquivos principais:** `SECURITY_BACKLOG.md` (A nossa lista de dívidas de segurança).

## `scripts/run-once`
**Nome leigo:** A Caixa de Ferramentas Automáticas
- **O que faz:** Contém robozinhos (.sh) criados por nós para instalar configurações, consertar servidores travados e diagnosticar erros sem que um humano tenha que digitar 30 comandos difíceis na tela preta do servidor.
