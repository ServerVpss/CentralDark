# Central de Notificacoes - MultiZap

Modulo oficial: apps/central-notificacoes
Status: estrutura criada

## Explicacao leiga

Esta pasta e a central de avisos do MultiZap.

Quando o sistema precisar avisar alguem sobre algo importante, o aviso deve sair por aqui.

A Central de Logs guarda o problema. A Central de Notificacoes entrega o aviso.

## Fluxo oficial

```txt
Erro ou evento importante
  -> Central de Logs registra
  -> Central de Logs classifica
  -> se precisar avisar
  -> Central de Notificacoes envia o aviso
```

## Responsabilidades

- Receber pedidos de aviso vindos da Central de Logs.
- Padronizar mensagem simples para o usuario.
- Padronizar mensagem tecnica para o time.
- Evitar avisos duplicados.
- Nao mostrar dados sensiveis.

## Tipos previstos

| Tipo | Exemplo |
|---|---|
| deploy | deploy falhou ou terminou |
| seguranca | acesso negado ou configuracao ausente |
| whatsapp | WuzAPI desconectou ou QR expirou |
| gateway | Gateway offline |
| supabase | migration ou RLS com erro |
| sistema | aviso operacional normal |

## Proximos passos

- [ ] Criar servico de notificacao.
- [ ] Conectar com a Central de Logs.
- [ ] Criar painel visual.
- [ ] Definir canais de envio.
