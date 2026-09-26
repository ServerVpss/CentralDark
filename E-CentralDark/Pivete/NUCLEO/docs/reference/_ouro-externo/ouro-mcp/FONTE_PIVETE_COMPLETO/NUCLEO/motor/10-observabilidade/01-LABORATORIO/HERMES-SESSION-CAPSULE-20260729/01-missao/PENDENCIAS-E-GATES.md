# PENDÊNCIAS E GATES

## Pendências Reais

| ID | Descrição | Gate |
|----|------------|------|
| P1 | Executar ou revisar instrumento 05d | SOL_REVIEW |
| P2 | Completar mapeamento do perfil (inv-3) | SOL_AUTORIZACAO |
| P3 | Mapear skills, Telegram, caches, mídia (inv-4) | A DEFINIR |
| P4 | Gerar relatórios sanitizados (inv-5) | A DEFINIR |
| P5 | Validar conteúdo e criar ZIP (inv-6) | A DEFINIR |

---

## Instrumentos Inválidos

| ID | Motivo | Status |
|----|--------|--------|
| 05b | TSV separator incorreto, getters inseguros, finalização falha | REJECTED |
| 05c | Excedeu limite de 180 linhas (190 linhas) | REJECTED_LINE_LIMIT |

---

## Decisões Ainda Não Autorizadas

- Executar script 05d (última versão preparada).
- Criar ZIP da cápsula.
- Modificar perfil ou mover arquivos.

---

## Fatos que Precisam de Contraprova

- Se a entrada `NUL` realmente existe ou é artefato do namespace Win32.
- Se o perfil tem mais de 100 entradas no nível raiz.
- Se há junction ou symlink no perfil.

---

## Próximo Gate Humano

```
PROXIMO_GATE = PIVETE_OR_SOL_REVIEW
AÇÃO = Revisar instrumento 05d ou decidir próximo passo
```

---

## Estado do Inventário

| Fase | Status |
|------|--------|
| inv-1 (Diagnóstico) | CONCLUÍDO |
| inv-2 (Árvore perfil) | CONCLUÍDO |
| inv-3 (Mapeamento) | EM ANDAMENTO |
| inv-4 (Skills/Telegram) | PENDENTE |
| inv-5 (Relatórios) | PENDENTE |
| inv-6 (Manifesto/ZIP) | PENDENTE |
