## O que vai acontecer

Esse repo Lovable hoje é "tudo num lugar só": tem as 5 landings (CentralDark, TelePainel, WhatsApp, CRM, Financeiro), o portal de login, a home e o app real do TelePainel. Eu vou desembolar isso na VPS, na estrutura que você pediu, sem quebrar nada que já tá no ar.

## Estrutura final na VPS

```text
/root/CentralDark/apps/
├── web/                        ← portal + homepage pública (CentralDark)
│   ├── (Portal.tsx, LandingCentralDark, Auth, Status público)
│   └── README.md
└── modulos/
    ├── README.md               ← índice geral: o que é cada módulo, como instalar, status
    ├── telepainel/             ← landing + app admin completo (o que já existe hoje)
    │   └── README.md           ← tutorial de instalação e o que foi feito
    ├── bot-whatsapp/           ← só landing por enquanto (sem produto)
    │   └── README.md           ← marca como "landing-only, instalação pendente"
    ├── crm/                    ← só landing
    │   └── README.md
    └── financeiro/             ← só landing
        └── README.md
```

## Passo a passo

1. **Auditar a pasta `apps/web` atual na VPS** — você falou que tá embolada, com coisa repetida. Eu entro via SSH, listo tudo, identifico o que é lixo / duplicado / desconhecido, e te mando um relatório curto **antes** de mover qualquer coisa. Nada é apagado sem você confirmar.

2. **Auditar os "planos" que já estão na pasta `modulos`** — abrir o que tem lá hoje, comparar com o que esse repo Lovable entrega, listar o que tá desatualizado e corrigir.

3. **Migrar conteúdo pra estrutura nova:**
   - `LandingCentralDark` + `Portal` + `Auth` + `Status` público → `apps/web/`
   - `LandingTelePainel` + todo o app admin (dashboard, consultas, bots, plans, etc.) → `apps/modulos/telepainel/`
   - `LandingWhatsapp` → `apps/modulos/bot-whatsapp/`
   - `LandingCRM` → `apps/modulos/crm/`
   - `LandingFinanceiro` → `apps/modulos/financeiro/`

4. **Criar os READMEs** (1 índice em `modulos/` + 1 por módulo) com: o que é, status atual (produto real vs só landing), como instalar, portas, env, serviço PM2, rota Caddy. Mesmo padrão do `docs/INSTALADOR/`.

5. **Atualizar `docs/PENDENCIAS.md`** marcando essa reorganização como fechada e abrindo as pendências novas que aparecerem (ex.: "bot-whatsapp ainda é só landing, falta produto real").

6. **Validar:** confirmar que o que já tá em produção (TelePainel admin, portal de login) continua respondendo igual, e que Caddy / PM2 não precisaram ser mexidos (se precisarem, peço sua confirmação antes — regra da workspace).

## O que NÃO vou fazer sem você liberar

- Apagar arquivos da `apps/web` que parecerem "lixo" — primeiro te mostro a lista.
- Mexer em Caddy, Docker, CRM antigo, WuzAPI, banco de produção.
- Mover pastas antigas do `/root/Multizap/` (a regra é migração gradual, não derrubar).

## Próximo passo depois que você aprovar

Começo pelo item 1 (auditoria da `apps/web` + `modulos` na VPS) e te mando o relatório do que achei antes de mover qualquer coisa.
