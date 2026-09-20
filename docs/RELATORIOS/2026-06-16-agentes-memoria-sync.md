# Relatório — Agentes de memória e sincronização CentralDark

- **Data:** 2026-06-16
- **Hora:** 11:30 BRT
- **Fase nova:** #132 — Ecossistema de agentes de memória
- **Fase pausada:** #131.4 — Validação ponta a ponta do Builder Bolt

## Motivo

Durante a validação ponta a ponta do Builder Bolt, a interface pública abriu corretamente em `https://builder.centralldark.com`, mas a geração falhou com erro de provider/modelo/key/config.

Antes de continuar depurando o provider, o usuário decidiu criar uma base mais forte de agentes de memória para garantir que qualquer IA nova consiga recarregar contexto, entender fase atual e continuar sem perder informação.

## Estado pausado do Builder Bolt

```txt
#131.4 — Validação ponta a ponta do Builder Bolt no navegador
STATUS: UI pública OK, geração com erro de provider
PRÓXIMO PASSO PAUSADO: diagnosticar se a falha é modelo OpenRouter, key/crédito/permissão, bug/config Builder Bolt ou erro interno do provider.
```

## Decisões novas

1. A palavra `salva` vira comando de checkpoint de memória.
2. Palavras como `reload`, `carrega`, `carregar memória`, `recarregar memória` e `sync ia` viram comando de boot de contexto.
3. A porta de entrada oficial deve ser um único `README.md` na raiz.
4. O `README.md` da raiz direciona para `CentralDark/` e para os documentos de memória.
5. Criar pasta `CentralDark/agentes/` para guardar agentes com nomes simples e documentação clara.
6. Criar um Agente Mestre de Memória para orquestrar agentes auxiliares.
7. Aprendizados novos devem registrar categoria, data, hora BRT, contexto, aprendizado e próximo passo.

## Próxima fase

```txt
#132.1 — Planejar e criar o Agente Mestre de Memória
```

## O que não foi tocado

```txt
Infra pública real
Containers
WhatsApp/WuzAPI
CRM
Banco real
Credenciais reais
Serviços operacionais
```

## Retomada após agentes

Depois que o agente de memória estiver validado, retomar:

```txt
#131.4 — Builder Bolt provider error
```
