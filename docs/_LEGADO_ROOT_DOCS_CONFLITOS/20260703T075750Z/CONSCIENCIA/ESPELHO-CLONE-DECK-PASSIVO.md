# Espelho `segredounlock/clone-deck` passivo

## Estado validado

O repositório oficial operacional é:

```txt
ServerVpss/CentralDark
```

O repositório abaixo é espelho/backup/passivo:

```txt
segredounlock/clone-deck
```

## Regra

O espelho não deve ser usado para trabalho novo, PR principal, workflow operacional, aprendizado padrão ou pendência padrão sem confirmação explícita do usuário.

Actions do espelho devem permanecer desativadas.

Workflows do espelho, se existirem nos arquivos, devem ser tratados como passivos/neutralizados. O espelho não deve executar deploy, VPS, PM2, Docker, Caddy, WuzAPI, WhatsApp, CRM ou qualquer automação operacional.

## Sync / mirror

A direção oficial é:

```txt
ServerVpss/CentralDark -> segredounlock/clone-deck
```

O sync deve enviar apenas arquivos seguros, corrigidos e funcionais.

Nunca enviar:

- `.env`;
- secrets;
- tokens;
- sessões;
- chaves;
- arquivos sensíveis;
- dados de sessão WhatsApp;
- workflows executáveis quando a regra do espelho exigir passividade.

## Alerta sobre ferramenta de aprendizado

Foi observado que uma ferramenta antiga de aprendizado ainda gravou no espelho `segredounlock/clone-deck`.

Isso não deve ser o padrão. Aprendizados e pendências operacionais do projeto devem ir para `ServerVpss/CentralDark`.

Até correção definitiva da ferramenta, sempre verificar o destino antes e depois de registrar memória.

## Regra de segurança

Se qualquer ferramenta tentar gravar memória, pendência, workflow, PR ou documentação operacional no espelho, parar e corrigir o destino para o repo oficial.
