# SUG-002 — Próximas aulas propostas (backlog)

**Data:** 2026-07-03
**Nasceu em:** conversa com admin sobre padrão de commits
**Categoria:** novo-processo (várias aulas de uma vez)
**Status:** proposta

## Backlog de aulas sugeridas

Cada uma cobre um buraco real do fluxo Hermes ↔ Fabler ↔ admin. Ordem = prioridade.

| # | Título | Por quê | Custo |
|---|---|---|---|
| **AULA-013** | Checagem anti-colisão com Fabler (find -mmin + PM2 + últimos posts canal) | Hoje é "olho no olho" — precisa virar comando único. | baixo |
| **AULA-014** | Como consultar graph-panel (curl + queries prontas + quando escalar) | Prometido na AULA-011 §3, ainda sem rota-fixa concreta. | baixo |
| **AULA-015** | Escrita de APRENDIZADO com rastro cognitivo obrigatório (nasceu de X → liga Y → usa Z → subiu skill W) | Rastro é o que faz um puxar o outro. Falta template rígido. | médio |
| **AULA-016** | Como pedir ajuda pro Fabler (formato de missão + o que Fabler precisa receber) | Toda vez o admin monta na mão. Padroniza. | baixo |
| **AULA-017** | Como debater com outras IAs (Gemini/GPT/Elite) + registrar em DEBATES/ | Debate hoje é solto. Precisa formato + regra de refino. | médio |
| **AULA-018** | Pendências: quando abrir, quando fechar, formato mínimo | `pendencias_add` é usado torto. Precisa gatilho claro. | baixo |
| **AULA-019** | Restart de serviço (matriz: docker × PM2 × systemd + health-check padrão) | Bloco 6 mostrou que cada serviço tem timing diferente. | médio |
| **AULA-020** | Ordem de leitura da consciência ao entrar numa sessão nova (checklist de warm-up) | IA nova entra e não sabe por onde começar. | baixo |
| **AULA-021** | Como marcar área como PROTEGIDA (🔒) + atualizar CLAUDE.md §9 | Regra existe mas ninguém sabe o processo. | baixo |
| **AULA-022** | Segredos: onde buscam, quando pedem ao admin, quando NÃO tocar | Fluxo VPS `/root/CentralDark/secrets/` vs Lovable `add_secret`. | médio |
| **AULA-023** | Rollback: se um bloco quebrou, como voltar sem perder aprendizado | Falta plano B formalizado. | médio |
| **AULA-024** | Fim de sessão: o que salvar em LEMBRANCAS/ antes de sumir | Memória curta some se não gravar. | baixo |
| **AULA-025** | Comunicação com admin: quando avisar, quando ficar quieto, tom | Admin leigo — precisa filtro "LEIGO/TÉCNICO" oficial. | baixo |

## Recomendação de ordem de execução

**Onda 1 (rápida, alto valor):**
- AULA-014 (graph — economia imediata de token)
- AULA-013 (anti-colisão — segurança do fluxo)
- AULA-020 (warm-up — toda IA nova ganha)

**Onda 2 (formatos):**
- AULA-015 (rastro APR)
- AULA-016 (missão Fabler)
- AULA-018 (pendências)

**Onda 3 (situações específicas):**
- AULA-017, 019, 022, 023

**Onda 4 (comunicação/hygiene):**
- AULA-021, 024, 025

## Próximo passo (se admin aprovar)
Confirmar a onda 1 → disparo as 3 aulas em paralelo agora, mesmo padrão de STATUS+rastro+commit `🧠 Hermes/AULAS: NNN …`.
