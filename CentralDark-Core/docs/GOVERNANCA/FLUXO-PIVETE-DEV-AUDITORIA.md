# Fluxo Pivete DEV → Auditoria → Main

## Regra central

- **Pivete é a inteligência humana comandante:** define intenção, visual, prioridade e aprovação funcional.
- **As IAs são a força de execução:** implementam, testam, corrigem, auditam e apresentam evidências.
- **GitHub é a fonte da verdade e o histórico oficial.**
- **A VPS é o ambiente remoto de trabalho e execução**, nunca a única cópia do código.
- Nenhum deploy de código alterado pode acontecer sem commit identificável no GitHub.

## Branches permanentes

```text
pivete/dev        → oficina de desenvolvimento e validação visual do Pivete
pivete/auditoria  → homologação, testes, segurança e correção pelas IAs
main              → produção oficial protegida
```

## Promoção

```text
Pivete define a missão
        ↓
IA confirma branch pivete/dev
        ↓
IA edita no ambiente remoto DEV
        ↓
testes locais + commit + push
        ↓
deploy do commit no ambiente DEV da VPS
        ↓
Pivete valida no navegador
        ↓
PR: pivete/dev → pivete/auditoria
        ↓
IAs auditam, testam e corrigem na auditoria
        ↓
deploy do commit auditado no ambiente STAGING/AUDIT
        ↓
gates verdes + evidências
        ↓
PR: pivete/auditoria → main
        ↓
merge autorizado + deploy de produção
```

## Autonomia das IAs na auditoria

As IAs podem continuar ciclos de diagnóstico, correção, teste e novo commit sem intervenção do Pivete, desde que:

1. trabalhem somente em `pivete/auditoria` ou branch de missão derivada dela;
2. não alterem produção;
3. não façam merge para `main`;
4. não executem ações destrutivas;
5. não exponham secrets, tokens, cookies, chaves, IPs internos ou credenciais;
6. parem e peçam autorização para migrações destrutivas, troca de credenciais, alteração de domínio, firewall, permissões críticas ou perda potencial de dados;
7. registrem cada tentativa em commit pequeno e reversível;
8. entreguem prova de build, testes, segurança e deploy de staging.

## Ambientes separados na VPS

```text
/srv/centraldark/dev/hub      → branch pivete/dev
/srv/centraldark/audit/hub    → branch pivete/auditoria
/srv/centraldark/prod/hub     → branch main
```

Cada ambiente deve ter processo, porta, domínio/subdomínio, arquivo de ambiente e banco/projeto de dados separados.

```text
DEV   não escreve em dados de produção.
AUDIT não escreve em dados de produção.
MAIN  é o único ambiente oficial de produção.
```

## Regra obrigatória antes de editar

```bash
git status --short
git branch --show-current
git rev-parse HEAD
git fetch origin
```

A IA só continua se:

- a branch atual estiver autorizada;
- o diretório estiver limpo ou as mudanças existentes estiverem explicadas;
- o commit-base estiver identificado;
- não houver secrets no diff.

## Regra obrigatória antes do deploy DEV

```text
editar → testar → commit → push → deploy do SHA → smoke test → evidência
```

É proibido fazer deploy de mudança não commitada.

## Árvore-alvo do HUB

A migração deve ser incremental, preservando build e comportamento a cada commit.

```text
apps/modulos/hub/
├── public/
├── src/
│   ├── app/
│   │   ├── App.tsx
│   │   ├── providers/
│   │   ├── router/
│   │   └── config/
│   ├── pages/
│   │   ├── hub/
│   │   │   └── HubPage.tsx
│   │   └── login/
│   │       └── LoginPage.tsx
│   ├── features/
│   │   ├── dashboard/
│   │   ├── hermes/
│   │   ├── gateway/
│   │   ├── catalog/
│   │   ├── policies/
│   │   ├── connectors/
│   │   ├── abacus/
│   │   └── audit/
│   ├── shared/
│   │   ├── ui/
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── types/
│   │   └── security/
│   ├── integrations/
│   │   └── supabase/
│   ├── assets/
│   ├── main.tsx
│   └── index.css
├── supabase/
│   ├── functions/
│   └── migrations/
├── scripts/
│   ├── dev/
│   ├── audit/
│   └── deploy/
├── tests/
│   ├── unit/
│   ├── integration/
│   └── smoke/
├── docs/
│   ├── architecture/
│   ├── operations/
│   └── evidence/
├── .env.example
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Plano de migração sem big bang

### Fase 0 — Inventário

- Mapear arquivos atuais, imports, scripts, Supabase, build e deploy.
- Identificar arquivos órfãos, duplicados, secrets e dependências quebradas.
- Nenhum arquivo é movido nesta fase.

### Fase 1 — Casca da aplicação

- Mover `App.tsx`, providers e roteamento para `src/app/`.
- Mover páginas para `src/pages/`.
- Corrigir imports.
- Build obrigatório.

### Fase 2 — Features, uma por commit

Ordem inicial:

1. dashboard;
2. hermes;
3. gateway;
4. catalog;
5. policies;
6. connectors;
7. abacus;
8. audit.

Cada feature só é promovida após build e smoke test.

### Fase 3 — Shared e integrações

- Consolidar componentes visuais reutilizáveis em `shared/ui`.
- Consolidar hooks e bibliotecas sem regra de negócio em `shared/`.
- Manter integrações externas em `integrations/`.
- Proibir dependência circular entre features.

### Fase 4 — Testes e deploy DEV

- Build TypeScript/Vite.
- Testes unitários e de integração disponíveis.
- Smoke test das rotas e abas principais.
- Deploy apenas do SHA aprovado em DEV.

### Fase 5 — Auditoria

- PR de `pivete/dev` para `pivete/auditoria`.
- Varredura de secrets e dependências.
- Revisão de autenticação, autorização, RLS, CORS e logs.
- Teste de rollback.
- Evidências registradas em `docs/evidence/` ou no PR.

### Fase 6 — Produção

- PR de `pivete/auditoria` para `main`.
- Merge somente com gates verdes e autorização explícita.
- Deploy do SHA exato da `main`.
- Verificação pós-deploy e rollback preparado.

## Evidência mínima por entrega

```text
branch
commit SHA
arquivos alterados
resumo do diff
testes executados
resultado do build
ambiente implantado
smoke test
riscos e pendências
rollback
```

## Proibições

- commit direto na `main`;
- deploy DEV sobre o diretório de produção;
- usar banco de produção em DEV/AUDIT;
- force-push;
- reset destrutivo sem autorização;
- secret em código, log, PR ou documentação;
- mover todo o HUB em um único commit;
- declarar concluído sem evidência.
