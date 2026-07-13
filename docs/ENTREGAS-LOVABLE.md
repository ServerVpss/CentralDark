# 📒 Diário de Entregas — Lovable

> **Para quê serve isso (leigo):** é o caderno de obra da Lovable. Toda vez que a Lovable mexe em algum arquivo do projeto, ela escreve aqui — em português simples — o que foi feito, onde, como testar e o que ainda falta. Assim o Pivete, a equipe do GitHub e as automações não precisam adivinhar nada: abrem este arquivo e leem o que aconteceu, na ordem, do mais novo pro mais velho.

## Como ler

- Entrada mais recente sempre no **topo**.
- Cada entrega segue o mesmo modelo padronizado (abaixo).
- Se um campo não se aplica, escrever `—` (não apagar o campo).
- O SHA do commit da própria entrega **não pode** ficar dentro do arquivo (o arquivo faz parte do próprio commit — colocar o SHA aqui geraria outro commit em cima). Nesse caso, usar `este commit (SHA informado no chat/PR)`. Nas próximas entregas, o SHA anterior pode ser preenchido normalmente.

## Modelo padrão de entrega

```md
## [AAAA-MM-DD HH:MM BRT] — Título curto e claro

- **Fio da missão:** de onde viemos e o que o Pivete pediu.
- **Escopo:** frontend | admin | portal | telepainel | docs | backend | infra.
- **Área tocada:** caminhos exatos dos arquivos.
- **O que mudou:**
  - `caminho/arquivo` → o que foi alterado, em 1 linha.
- **Supabase / backend:** migration, edge function ou "—".
- **Depende da VPS / equipe GitHub?:** sim/não + o quê.
- **Como testar (leigo):** passos simples em PT-BR.
- **Evidência:** rota, print, query ou observação de validação.
- **Pendências deixadas:** o que ficou pra depois.
- **Próximo passo:** uma única ação.
- **Commit:** `[LOVABLE][área] título` — SHA e branch.
- **Branch:** `pivete/dev`.
```

---

## 2026-07-13 16:28 BRT — Padronizar entregas e labels (Lovable ↔ GitHub)

- **Fio da missão:** Pivete pediu um fluxo contínuo entre Lovable e a equipe/automação do GitHub, pra ninguém adivinhar o que a Lovable mudou nem gastar tokens repetindo contexto.
- **Escopo:** docs.
- **Área tocada:**
  - `docs/ENTREGAS-LOVABLE.md`
  - `docs/LEIA-EQUIPE-GITHUB.md`
  - `.lovable/GUIA-DO-PIVETE.md`
- **O que mudou:**
  - `docs/ENTREGAS-LOVABLE.md` → criado como diário vivo com modelo padronizado e esta primeira entrada.
  - `docs/LEIA-EQUIPE-GITHUB.md` → criado como página curta pra equipe/automação do GitHub entender o que vem da Lovable e como tratar.
  - `.lovable/GUIA-DO-PIVETE.md` → acrescentada seção permanente de convenção de entrega (sem apagar nada do que já existia).
- **Supabase / backend:** —
- **Depende da VPS / equipe GitHub?:** não pra rodar. Sim pra o próximo passo (a equipe do GitHub passa a olhar `docs/ENTREGAS-LOVABLE.md` como fonte humana das entregas Lovable).
- **Como testar (leigo):** abrir os 3 arquivos acima e conferir se o modelo, as regras de label e a seção nova do guia estão como descrito.
- **Evidência:** os 3 arquivos existem e batem com este modelo.
- **Pendências deixadas:**
  - Os workflows `.github/workflows/pr-agent.yml` e `.github/workflows/pr-auto-review.yml` escutam PRs para `main`. PR de `pivete/dev` → `pivete/auditoria` **ainda não** dispara essas revisões automáticas. Ajustar isso exige mexer em workflow, o que precisa de ordem explícita do Pivete.
- **Próximo passo:** abrir/atualizar o PR de `pivete/dev` para `pivete/auditoria` e aplicar as labels corretas (`frontend`, `assign:lovable`, `revisao-humana`).
- **Commit:** `[LOVABLE][docs] Padronizar entregas e labels` — este commit (SHA informado no chat/PR).
- **Branch:** `pivete/dev`.
