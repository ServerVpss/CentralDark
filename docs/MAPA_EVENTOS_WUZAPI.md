# Dicionário de Eventos do WhatsApp (WuzAPI)

O WuzAPI envia alertas para a nossa Telefonista (Gateway) sempre que algo acontece no WhatsApp do cliente.

## 1. `message.received`
- **Nome leigo:** Mensagem Nova Recebida.
- **Explicação:** Uma pessoa mandou uma mensagem para você, ou o seu próprio aparelho enviou uma mensagem para alguém.
- **Exemplo Prático:** Cliente João enviou a foto de um boleto e escreveu "Pago!".
- **Abre ticket:** Sim (Geralmente).
- **Atualiza contato:** Sim.
- **Atualiza foto/nome:** Sim (De forma leve para não gastar franquia).
- **O que faz com a mensagem:** Salva no Banco de Dados (Tabela `messages` e/ou `ticket_messages`).
- **Risco se processar errado:** O celular da pessoa mostra que a mensagem foi, mas o vendedor no sistema nunca recebe, causando brigas com o cliente.

## 2. `presence.updated`
- **Nome leigo:** Status de Digitação ("Fulano está digitando...").
- **Explicação:** Uma fofoca rápida de que alguém abriu a tela do celular e começou a apertar os botões do teclado ou o botão do microfone.
- **O que faz com a mensagem:** Apenas pisca visualmente na tela, não salva em lugar nenhum.

## 3. `message.receipt`
- **Nome leigo:** Confirmação de Leitura (Tique Azul / Tique Cinza).
- **Explicação:** O sistema avisa se a mensagem chegou no bolso do cliente e se ele leu de fato.
- **Abre ticket:** Não.
- **Atualiza Contato:** Não.
- **Onde salva:** Geralmente edita uma linha que já existe na Tabela `messages` alterando a coluna de Status de `pending` para `read`.

## 4. `history.sync`
- **Nome leigo:** Sincronização de Histórico Antigo.
- **Explicação:** Ocorre quando você acabou de escanear o QR Code de um número no sistema pela primeira vez, e o sistema tenta "sugar" todas as últimas conversas da semana passada para dentro da tela.
- **Abre ticket:** Não.
- **O que faz com a mensagem:** Salva massivamente no banco, em silêncio.
- **Risco se processar errado:** Pode quebrar o servidor de tanta mensagem processada ao mesmo tempo. (Atualmente delegado para *batching* assíncrono).

## 5. `connection.connected` & `connection.disconnected`
- **Nome leigo:** Celular Ligado / Celular Desligado da Tomada.
- **Explicação:** Avisa a saúde do aparelho. Se a bateria acabar ou a Meta banir o número, ele grita "Desconectado".
- **Onde salva:** Na tabela de `connections` / `instances`.
