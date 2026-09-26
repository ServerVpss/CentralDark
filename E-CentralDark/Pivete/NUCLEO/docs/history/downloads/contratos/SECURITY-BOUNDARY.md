# Fronteira de segurança do Browser Adapter

## Browser contém sessão

O provider pode operar num navegador autenticado, mas o Hermes não precisa receber:

- cookies;
- Authorization;
- refresh tokens;
- localStorage de autenticação;
- session storage sensível;
- perfil físico do usuário.

O Browser Bridge deve retornar somente evidência necessária.

## ChatGPT / sites autenticados

Automação deve operar pela superfície autorizada da sessão.

Não usar request interno não documentado como API canônica.

## Credenciais do MCP

Há configuração existente no repositório com header de autenticação estático.

Não copiar esse valor para o novo adapter ou para este pack.

A nova costura deve resolver credenciais por ambiente/secret provider do runtime.

## Bind

Default:

```text
127.0.0.1
```

Não:

```text
0.0.0.0
```

até existir autorização e threat model explícitos.

## Logs

```text
raw_secret=false
raw_cookie=false
raw_authorization=false
full_private_page_default=false
```

Persistir referências e resumos sanitizados.
