# Aprendizado — método Michelin 3 Estrelas em skill canônica (2026-10-24)

## Origem e preservação

**Fonte original aprovada pelo CHEFE:** `docs/LEMBRANCAS/metodo-chefe-conformidade-michelin-20261019.md`. **Permanece intacta**: registro de intenção/conformidade histórica, não certificado global de migração.

**Regra hierárquica:** `docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/SOUL-SOL.md` (item M). A skill Michelin está abaixo da skill canônica e não substitui SOUL/RULES/AGENTS.

**Nova skill operacional:** `.agents/skills/centraldark-operational-method/catalogo/skills-integradas/michelin-3-estrelas/SKILL.md`.
**Complemento de execução:** `.agents/skills/centraldark-operational-method/references/MICHELIN-3-ESTRELAS-PROTOCOLO.md`.
**Receita Hermes:** `.agents/skills/centraldark-operational-method/references/HERMES-KANBAN-RECEITA-UNIVERSAL.md`.

## Lição cristalizada — mesma ferramenta, intenção variável

1. O CHEFE expressa **intenção atual**; o agente resolve `ACAO`, `ALVO`, `WORKSPACE`, `AMBIENTE`, `ACEITE`, `LIMITES` na hora. Um diretório de teste não vira padrão universal.
2. Ativar `!michelin` acrescenta disciplina deliberada **construir → integrar → provar** e contraprova, **não troca o executor canônico**.
3. Reutilizar o Hermes Kanban já funcionando na Casa Windows via CLI local. Criar e excluir um arquivo são intenções diferentes encaminhadas por **um único** `hermes kanban create`.
4. Usar perfil conhecido do ambiente, `default` comprovado na Casa. Um modelo/provedor validado para aquela missão (NVIDIA Nemotron), não dogma global.
5. `CARD_CREATED != ASSIGNED != RUNNING != DONE != EFFECT_PROVED`. Consultar estado do cartão, runs e efeito real no destino.
6. Se falhar, ler logs e atacar a **causa**; não criar um novo gateway, agente ou segundo cartão concorrente à mesma intenção.
7. A autonomia de microcorreções não autoriza alteração de arquivos, hosts ou sistemas não mencionados.
8. Métricas de 3 estrelas são proporcionais ao objetivo: um TXT precisa efeito no disco e conteúdo; um deploy precisa CI/integração, runtime, mesma versão/sha, autenticação e observabilidade, conforme seu escopo.

## Caso real — prova observada na Casa, 24/10/2026

| Missão | Ação | Status Kanban | Prova no Windows Casa |
|---|---|---|---|
| `t_2805243c` | Criar TXT de teste | `DONE` | Arquivo existente e conteúdo `DELEGACAO_HERMES_KANBAN_OK` lido. |
| `t_26e02a16` | Excluir TXT de teste | `DONE` | Mesmo arquivo ausente após execução e conferência em disco. |

Rota provada: ChatGPT → Desktop Commander Casa → Hermes CLI local → Kanban → perfil `default` → NVIDIA `nvidia/nemotron-3-ultra-550b-a55b`. O modelo anterior `jann` ficou indisponível por `APIConnectionError` e **somente o modelo da missão** foi substituído; a infraestrutura de delegação foi preservada.

**Ponto fixo escopado:** `CREATE_FILE=PASS` e `DELETE_FILE=PASS` nos alvos/condições testados. **Não prova todos os formatos, todas as operações, nem Fixed Point global da CentralDark.** Outras intenções reutilizam o mecanismo, mas exigem medição e readback próprios.

## Receita de aplicação em outras missões

- Primeiro ler a skill Michelin + a receita da capacidade; escolher workspace por intenção.
- Reutilizar método e comando que passaram, preenchendo variáveis de ação, diretório, alvo, conteúdo e aceitação atual.
- Executar no host certo. Não modificar conteúdo da Lembrança nem editar o Hermes para aplicar o protocolo.
- Testar, registrar resultado e próximo cursor. Se a missão já estiver provada, encerrar sem inventar trabalho.

**Fonte de verdade operacional:** skill canônica; **fonte histórica:** Lembrança; **aprendizado retido:** este registro. Uma hierarquia, sem duplicação de executores.