# Plano — Agentes CentralDark

## Fase atual

```txt
#132.1 — Planejar Agente Mestre de Memória e agentes auxiliares
```

## Status

```txt
EM EXECUÇÃO DOCUMENTAL
```

## Objetivo imediato

Criar o pacote inicial do Agente Mestre de Memória em documentação, sem mexer em produção.

## Pacote inicial em criação

```txt
AGENTE-MESTRE-MEMORIA.md
PROMPT-CODEX.md
CHECKLIST-READONLY.md
RELATORIO-MODELO.md
```

Este pacote define a função do agente mestre, o prompt para novas IAs, o checklist read-only e o modelo de relatório/handoff.

## Escopo permitido

- README da raiz.
- `CentralDark/README.md`.
- `docs/CONSCIENCIA/`.
- `docs/PENDENCIAS.md`.
- `docs/RELATORIOS/`.
- Pasta `CentralDark/agentes/`.

## Fora de escopo

- Infra pública real.
- Containers.
- WhatsApp/WuzAPI.
- CRM.
- Banco e provedores.
- Credenciais reais.
- Alteração operacional de serviços.
- Limpeza destrutiva.

## Próximos passos

1. Criar pacote documental inicial do Agente Mestre.
2. Abrir PR para revisão humana.
3. ChatGPT revisa o resultado antes de merge/aplicação.
4. Validar se `reload/carrega memória` funciona em conversa nova.
5. Retomar #131.4 Builder Bolt provider error.
