# Dicionário de Funções da API

## Política de registro de linguagem

Este arquivo também preserva a tradução entre a complexidade técnica interna da CentralDark e a forma humana de entregar a mesma informação ao SEGREDO/CHEFE.

Princípio:

```text
FONTE / EVIDÊNCIA
↓
SEMÂNTICA
↓
CLASSIFICAR DESTINO
├─ INTERNO_TÉCNICO
├─ CHEFE
└─ PÚBLICO
↓
ESCOLHER REGISTRO
↓
POLIR SEM ALTERAR O FATO
↓
ENTREGAR
```

A fonte decide **o que é verdade**. A semântica decide **o que significa**. O contexto decide **como falar**. O polimento decide **quão limpo fica**, sem criar segunda verdade.

### Registros por destino

```text
TARGET=CHEFE
→ PT-BR coloquial, natural, direto e polido
→ termo técnico só quando necessário para a decisão ou pedido explícito
→ quando termo técnico for material, traduzir imediatamente para o significado prático
→ não despejar hash, gate, owner, stack, log ou código se a complexidade interna não mudar a decisão

TARGET=INTERNO_TECNICO
→ registro técnico preciso
→ nomes exatos, logs, hashes, contratos, causas e provas preservados

TARGET=PUBLICO
→ norma culta/padrão + texto polido
→ simples, claro e preciso
→ sem gíria interna quando ela não ajudar o público
```

Regra de compressão para o CHEFE:

```text
CHEFE_SHOULD_NOT_NEED_TO_READ_INTERNAL_COMPLEXITY=true
UNLESS_INTERNAL_COMPLEXITY_CHANGES_THE_DECISION=true
SOURCE_OF_TRUTH_UNCHANGED=true
MEANING_MUST_BE_PRESERVED=true
REGISTER_IS_PRESENTATION_LAYER=true
```

No jeito simples: **a máquina segura a complexidade; o CHEFE recebe o significado**.

### Vocabulário operacional

```text
SIMPLES      = fácil de compreender
COLOQUIAL    = natural e espontâneo; pode usar gíria/contexto sem perder precisão
CULTO        = registro alinhado à norma-padrão e vocabulário preciso
POLIDO       = limpo, claro, bem acabado e sem excesso; não implica formalidade
TÉCNICO      = vocabulário específico de uma área; não precisa ser difícil
```

Distinções que devem permanecer:

```text
SIMPLES != COLOQUIAL
FORMAL != BEM_ESCRITO
POLIDO != FORMAL
TÉCNICO != DIFÍCIL
REGISTRO != VERDADE
POLIMENTO != ALTERAÇÃO_DO_FATO
```

Exemplo do mesmo fato em registros diferentes:

```text
FATO INTERNO:
PR #1101
state=open
Writer=Codex Work
scope=LEIA-ME-IA.md

TÉCNICO/CULTO:
"O PR #1101 permanece aberto e declara Codex Work como Writer responsável pelo escopo LEIA-ME-IA.md."

CHEFE / COLOQUIAL POLIDO:
"O #1101 ainda tá aberto. O Codex tá escrevendo justamente no LEIA-ME-IA.md, então aqui é só leitura."
```

O conteúdo factual é o mesmo; só muda a camada de apresentação.

---

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
