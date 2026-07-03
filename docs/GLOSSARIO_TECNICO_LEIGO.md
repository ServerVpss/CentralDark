# Dicionário de Funções da API

## `syncContactsFromWuzapi`
- **Nome técnico:** `syncContactsFromWuzapi`
- **Nome leigo:** Puxar os Clatos do WhatsApp para o CRM.
- **O que faz:** Busca a lista de pessoas do telefone, tenta baixar a foto de perfil deles e atualiza a "Agenda do CRM".
- **Quando roda:** Pode rodar em um evento (cronjob) ou ao plugar o WhatsApp a primeira vez.
- **Quais dados usa:** Nome que a pessoa cadastrou (PushName), Nome empresarial (BusinessName).
- **Quais dados salva:** Salva nomes não-cadastrados, números puros e a URL da foto.
- **O que NÃO pode fazer:** Se a sua equipe digitou manualmente que aquele número é do "João da Pamonha", a rotina é estritamente proibida de renomear para "João Pereira" (respeitando o `name_locked=true`). Também não pode imprimir senhas e falhar toda a lista só porque uma pessoa estava sem foto.
- **Como saber se funcionou:** Você abre o menu "Contatos" do painel e as fotos e nomes dos seus clientes estão lá.

## `upsertContact`
- **Nome técnico:** `upsertContact`
- **Nome leigo:** Salvar ou Atualizar Contato de Forma Inteligente.
- **O que faz:** Checa se o contato já existe no banco. Se não existe, cria um novo. Se já existe, atualiza sem destruir configurações antigas dele.
- **Quando roda:** Roda sempre que o `syncContactsFromWuzapi` achar a agenda, ou sempre que uma pessoa que você não conhecia te mandar um "Oi" (`message.received`).
- **Onde salva:** Tabela `contacts`.

## `saveMessage`
- **Nome técnico:** `saveMessage`
- **Nome leigo:** Carimbar e Guardar a Mensagem no Cofre.
- **O que faz:** Recebe o texto que o cliente escreveu e guarda na "Ficha" correta dentro do banco de dados (relacionada ao ID do Workspace da sua empresa e o ID do número de zap).
- **Quais dados usa:** Direção (`is_from_me`), Body (o texto).
- **O que NÃO pode fazer:** Não pode vazar as mensagens do seu Workspace para o Workspace de um concorrente. A blindagem RLS do Supabase atua aqui.

## `sendText` / `sendMedia`
- **Nome técnico:** `sendText`
- **Nome leigo:** Disparador de Mensagem.
- **O que faz:** Pega o texto que o atendente digitou na caixinha verde do chat e empurra para a API do Go (`WuzAPI`), com formatação rígida.
- **O que NÃO pode fazer:** Não pode tentar atirar mensagens em contatos bizarros, passando obrigatoriamente por uma etapa chamada `rateLimit` (controle de velocidade para o WhatsApp não bloquear sua conta).
