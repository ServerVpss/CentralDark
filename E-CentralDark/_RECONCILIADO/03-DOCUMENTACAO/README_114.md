# Central de Logs - MultiZap

Modulo oficial: apps/central-logs
Status: estrutura criada

## Explicacao leiga

Esta pasta e a caixa-preta do sistema.

Tudo que falhar ou precisar de evidencia deve passar por aqui: deploy, VPS, Gateway, WuzAPI, Supabase, CRM, Bot e seguranca.

A Central de Logs guarda o que aconteceu. A Central de Notificacoes avisa alguem quando for necessario.

## Fluxo oficial

```txt
Erro ou evento importante
  -> Central de Logs registra
  -> Central de Logs classifica
  -> Central de Logs guarda evidencia segura
  -> se precisar avisar
  -> Central de Notificacoes envia o aviso
```

## Areas cobertas

| Area | Exemplos |
|---|---|
| deploy | webhook, post-deploy, build |
| VPS | PM2, Caddy, Docker, portas |
| WhatsApp | WuzAPI, QR, sync, webhook |
| Gateway | rotas, payloads, integracoes |
| Supabase | migrations, RLS, realtime |
| seguranca | acesso negado, configuracao ausente |
| frontend | tela branca, build quebrado |

## Niveis de gravidade

| Nivel | Significado |
|---|---|
| info | evento normal |
| warning | atencao preventiva |
| error | falha que precisa correcao |
| critical | risco de producao ou seguranca |

## Regras

- Guardar somente o necessario para diagnostico.
- Mascarar valores sensiveis.
- Nao espalhar logs em varias pastas.
- Registrar origem, gravidade, horario e evidencia.
- Acionar a Central de Notificacoes quando precisar avisar alguem.

## Proximos passos

- [ ] Criar servico central de logs.
- [ ] Criar sanitizador de logs.
- [ ] Integrar com Central de Notificacoes.
- [ ] Criar armazenamento seguro.
- [ ] Conectar webhook deploy, Gateway e run-once neste padrao.
