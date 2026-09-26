# Módulo multizap

## Explicação simples

Este é o módulo/produto atual do projeto.

Tudo que hoje está no repositório `clone-deck` será revisado e organizado para futuramente ficar dentro deste módulo:

```txt
/root/CentralDark/apps/modulos/multizap/
```

O nome `clone-deck` fica apenas como nome técnico atual do repositório no GitHub durante a transição.

## Detalhe técnico

Destino final planejado na VPS:

```txt
/root/CentralDark/apps/modulos/multizap/
```

Origem atual:

```txt
repositório segredounlock/clone-deck
```

A pasta antiga da VPS:

```txt
/root/Multizap/apps/clone-deck
```

é considerada legado e não será o destino final.

## Fluxo do produto

O módulo multizap mantém seu funcionamento próprio:

```txt
login
  -> portal interno
  -> central interna de módulos
  -> bot WhatsApp/Telegram
  -> CRM Multicanal
```

## Regras

- Não usar `APP` maiúsculo.
- Usar sempre `apps` minúsculo.
- Não usar `crm-chatbot` como nome final.
- O nome final do módulo atual é `multizap`.
- Não apagar nada da VPS nesta fase.
- Primeiro organizar o repositório, depois sincronizar a VPS.
- O instalador deve detectar instalação antiga antes de instalar/migrar.
