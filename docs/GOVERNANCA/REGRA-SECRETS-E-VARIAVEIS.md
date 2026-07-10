# REGRA DE SECRETS E VARIAVEIS

Este documento fixa a regra segura para qualquer IA, agente, conector ou automacao que participe do CentralDark.

## Regra principal

Segredo real nao entra no chat, nao entra em documento e nao entra em commit.

## Definicoes

- secret = chave, token, senha, cookie, API key, service role, chave SSH, connection string ou credencial sensivel.
- variavel sensivel = nome de configuracao que aponta para segredo ou acesso privilegiado.
- placeholder = texto falso usado no lugar do segredo real.
- sanitizar = remover ou mascarar conteudo sensivel antes de compartilhar.

## Forma correta de compartilhar contexto

Usar placeholders:

```txt
SUPABASE_URL=<SUPABASE_URL>
SUPABASE_SERVICE_ROLE=<SUPABASE_SERVICE_ROLE_REDACTED>
GITHUB_TOKEN=<GITHUB_TOKEN_REDACTED>
DATABASE_URL=<DATABASE_URL_REDACTED>
CENTRALDARK_GATEWAY_KEY=<CENTRALDARK_GATEWAY_KEY_REDACTED>
```

## O que pode ser salvo

Pode salvar:

- nome da variavel;
- finalidade;
- modulo que usa;
- onde deve existir;
- risco se faltar;
- exemplo falso;
- regra de validacao.

Nao pode salvar:

- valor real;
- token completo;
- senha;
- cookie;
- chave privada;
- service_role real;
- Authorization header;
- connection string real.

## Regra de operacao

Quando o Pivete trouxer texto com variaveis:

1. A IA deve pedir versao sanitizada.
2. A IA deve trocar valores por placeholders.
3. A IA deve registrar apenas estrutura e contexto.
4. A IA deve avisar se detectar segredo real.
5. A IA nao deve repetir segredo na resposta.

## Regra curta

Contexto sim.
Segredo nao.
Placeholder sempre.
GitHub registra a estrutura, nunca a chave real.
