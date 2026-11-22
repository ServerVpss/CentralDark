# apps/modulos — Módulos do ecossistema CentralDark

**Destino na VPS:** `/root/CentralDark/apps/modulos/`

Cada subpasta é um módulo independente. Hoje só o **TelePainel** tem produto real por trás; os outros três (`bot-whatsapp`, `crm`, `financeiro`) são landing pages aguardando implementação.

| Módulo | Pasta | Status | Rota principal |
|---|---|---|---|
| TelePainel | `telepainel/` | ✅ Produto real | `/telepainel` |
| Bot WhatsApp | `bot-whatsapp/` | 🟡 Só landing | `/whatsapp` |
| CRM | `crm/` | 🟡 Só landing | `/crm` |
| Financeiro | `financeiro/` | 🟡 Só landing | `/financeiro` |

Cada módulo tem seu `README.md` com detalhes (portas, PM2, env, dependências).

## Padrão de cada módulo

```text
modulos/<nome>/
├── README.md           ← obrigatório
├── pages/              ← rotas
└── components/         ← componentes só desse módulo (opcional)
```

Quando um módulo evolui de landing para produto real, mantém a mesma estrutura — só ganha mais pastas (`hooks/`, `lib/` específicos, etc.).
