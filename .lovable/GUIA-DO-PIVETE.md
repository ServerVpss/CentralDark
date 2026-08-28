# Guia do Pivete — Menos é mais

## Como ajudar o Pivete

- O Pivete às vezes se perde entre muitas etapas, ferramentas, branches e pendências.
- A IA deve sempre lembrar o ponto atual, o próximo passo e o que não precisa ser feito agora.
- Explicar de forma leiga, curta e prática.
- Preferir uma solução simples que resolva o problema de vez.
- Evitar excesso de opções, caminhos paralelos e termos técnicos sem tradução.
- Não esperar o Pivete pedir organização: antecipar lembretes úteis, riscos e o próximo passo.
- Quando houver várias tarefas, indicar uma ordem clara de prioridade.
- Sempre diferenciar: feito, pendente, bloqueado e próximo passo.

## Fluxo oficial

- Lovable + `pivete/dev` = oficina do design e frontend.
- `pivete/auditoria` = revisão e validação.
- `main` = produção aprovada.
- Não orientar o Pivete a editar `main` diretamente.

## Regra de resposta

Toda resposta de acompanhamento deve terminar com uma linha simples neste formato:

`Agora: [situação atual] → Próximo: [uma única ação]`

## Preferência do Pivete

- Menos é mais.
- O simples que resolve vem primeiro.
- A IA deve ajudar o Pivete a não se perder e manter alinhamento constante.

## Convenção permanente de entrega (Lovable ↔ GitHub)

Vale para toda resposta da Lovable que altera arquivos:

1. **Registrar no diário:** acrescentar uma nova entrada no topo de `docs/ENTREGAS-LOVABLE.md` seguindo o modelo padronizado do próprio arquivo.
2. **Título do commit:** começar sempre com `[LOVABLE][<área>] Verbo no infinitivo + objeto`. Áreas: `frontend`, `admin`, `portal`, `telepainel`, `docs`, `backend`, `infra`.
3. **Bloco final na resposta do chat:**

   ```txt
   📌 ENTREGA REGISTRADA
   - Área: ...
   - Arquivos: ...
   - Commit: [LOVABLE][área] ...
   - Testar: ...
   - Próximo passo: ...
   - Registrado em: docs/ENTREGAS-LOVABLE.md
   ```

4. **Labels nos PRs (não em commits):**
   - PR frontend `pivete/dev` → `pivete/auditoria`: mínimo `frontend` + `assign:lovable`.
   - Ao promover para auditoria, adicionar `revisao-humana`.
   - `needs-codex-review` **só é aplicada automaticamente** em PRs para `main` pelo workflow atual — não aplicar à mão.
   - Severidade (`p0`/`p1`/`p2`/`p3`) só se realmente fizer sentido.
   - **Nunca inventar labels novas ou duplicadas.** Usar o catálogo oficial já existente (semeado por `.github/workflows/bots-labels-seed.yml`).
5. **SHA da própria entrega:** não colocar o SHA do commit atual dentro do arquivo (isso geraria outro commit em cima). Usar `este commit (SHA informado no chat/PR)` e preencher normalmente o SHA em entregas seguintes.
6. **Escopo travado:** sem ordem explícita, não tocar em VPS, PM2, secrets, produção, `.github/workflows/`, áreas 🔒 nem em código fora do frontend.
