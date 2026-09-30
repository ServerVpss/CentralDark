# REGRA DE SECRETS E VARIAVEIS

Este documento fixa a regra segura para qualquer IA, agente, conector ou automacao que participe do CentralDark.

## Regra principal

Segredo real nao entra no GitHub, nao entra em commit, nao entra em issue/PR, nao entra em log persistente e nao deve ser repetido na resposta.

A presenca acidental de segredo em chat, imagem, terminal local, VPS autorizada ou arquivo bruto do CHEFE nao deve virar bloqueio automatico da missao. O comportamento correto e continuar o MVP, preservar o trabalho, evitar copiar o valor para superficie publica/persistente e registrar pendencia de rotacao quando o sistema estiver online.

## Regra operacional MVP — parceria sem falso bloqueio

```text
CHEFE_ENVIA_MATERIAL_COM_SEGREDO_OU_PRINT
→ NAO_REPETIR_VALOR
→ NAO_COMMITAR_VALOR
→ NAO_LEVAR_PARA_GITHUB
→ NAO_LOGAR_VALOR
→ USAR_APENAS_NO_AMBIENTE_AUTORIZADO_QUANDO_NECESSARIO
→ CONTINUAR_MVP_SE_A_INTENCAO_E_AUTORIZADA
→ MARCAR_ROTACAO_POS_ONLINE
→ RECEIPT_SEM_VALOR
```

```text
SECRET_IN_CHAT_OR_IMAGE_IS_NOT_AUTOMATIC_BLOCKER=true
SECRET_VALUE_MUST_NOT_BE_REPEATED=true
SECRET_VALUE_MUST_NOT_BE_COMMITTED=true
SECRET_VALUE_MUST_NOT_BE_PERSISTED_IN_GITHUB=true
SECRET_VALUE_MUST_NOT_BE_PUT_IN_PR_OR_ISSUE=true
SECRET_VALUE_MUST_NOT_BE_PUT_IN_ACTION_LOG=true
AUTHORIZED_RUNTIME_SECRET_USE_ALLOWED=true
ROTATE_AFTER_ONLINE=true
MVP_CONTINUES_IF_OWNER_AUTHORIZED=true
```

## Definicoes

- secret = chave, token, senha, cookie, API key, service role, chave SSH, connection string ou credencial sensivel.
- variavel sensivel = nome de configuracao que aponta para segredo ou acesso privilegiado.
- placeholder = texto falso usado no lugar do segredo real.
- sanitizar = remover ou mascarar conteudo sensivel antes de compartilhar para GitHub, logs persistentes ou resposta.
- vault/cofre = origem autorizada onde o valor pode existir.
- dump bruto autorizado = pacote temporario criado no runtime autorizado para preservacao/inventario, sem promocao para GitHub.

## Forma correta de compartilhar contexto

Usar placeholders em GitHub, docs e receipts:

```txt
SUPABASE_URL=<<nome-de-segredo>>
SUPABASE_SERVICE_ROLE=<<nome-de-segredo>>
GITHUB_TOKEN=<GITHUB_TOKEN_REDACTED>
DATABASE_URL=<DATABASE_URL_REDACTED>
CENTRALDARK_GATEWAY_KEY=<CENTRALDARK_GATEWAY_KEY_REDACTED>
```

## O que pode ser salvo no GitHub

Pode salvar:

- nome da variavel;
- finalidade;
- modulo que usa;
- onde deve existir;
- risco se faltar;
- exemplo falso;
- regra de validacao;
- hash/manifesto sem valor quando util;
- path sem valor quando necessario;
- pendencia de rotacao.

Nao pode salvar:

- valor real;
- token completo;
- senha;
- cookie;
- chave privada;
- service_role real;
- Authorization header com valor;
- connection string real;
- log contendo segredo.

## Regra de operacao

Quando o CHEFE trouxer texto, print, log ou arquivo que possa conter segredo:

1. A IA nao deve repetir o valor do segredo.
2. A IA nao deve travar a missao se o ambiente for do CHEFE e a intencao estiver autorizada.
3. A IA deve transformar qualquer registro persistente em placeholder ou manifesto sem valor.
4. A IA deve usar o segredo somente no runtime autorizado quando isso for necessario para o MVP.
5. A IA deve registrar pendencia de rotacao pos-online quando houver exposicao acidental.
6. A IA deve continuar com o menor delta util, sem palestra nem bloqueio generico.

## Regra curta

Trabalho continua.
GitHub nunca recebe valor.
Resposta nunca repete valor.
Runtime autorizado pode usar o segredo.
Se vazou no caminho: preservar MVP, marcar rotacao depois.
