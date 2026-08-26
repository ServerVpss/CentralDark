# 🔌 HUB CENTRALDARK

O Hub é a caixa única de conexões da Casa.

```text
🚪 PORTA
→ 🔌 HUB
→ 💎 RUBY
→ 🧠 CÉREBRO
→ 🦾 EXECUÇÃO
→ ✅ PROVA
```

Referência arquitetural: `docs/ARQUITETURA/PORTA-HUB-RUBY-CEREBRO.md`.

## Função humana

Cada conexão precisa dizer ao CHEFE somente o necessário:

- ícone + nome;
- status: `CONECTADO | NÃO CONECTADO | ERRO`;
- `Serve para:` em frase curta;
- contas/labels quando houver múltiplas contas;
- acesso/capacidades em linguagem humana.

## Regra de expansão

Qualquer serviço, conta, assinatura, API ou fonte nova que possa ser conectada deve preferir este Hub em vez de criar uma entrada paralela.

```text
NEW_PROVIDER
→ HUB
→ autenticação/conector existente ou extensão mínima
→ RUBY lógico
→ capacidade correta da Casa
```

OAuth, API key, MCP, Gateway e adapters são mecanismos internos. Eles não precisam virar novas caixas na interface do CHEFE.

## Multi-conta

Uma mesma fonte pode ter múltiplas contas quando o mecanismo permitir. A interface deve preservar rótulo/identidade de cada conta e não misturar contexto silenciosamente.

```text
PROVIDER
├── CONTA A
├── CONTA B
└── ...
```

## Segurança

- segredo não entra em documentação;
- capacidade técnica não concede autorização;
- escopo de acesso deve ser o mínimo aplicável à intenção;
- desconexão/revogação precisa permanecer possível;
- erro de autenticação deve aparecer claramente ao CHEFE;
- nenhuma conexão nova cria segunda fonte da verdade.
