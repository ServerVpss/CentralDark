# COMANDO - OURO-CHEFE.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\docs\BRAIN\07-APRENDIZADOS-MEMORIAS\OURO-CHEFE.md
**SHA:** 606ac2fbba5eee59
**Timestamp:** 2026-08-28T02:56:46.988613
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- 26. **Antes de investigar longamente, verificar primeiro se o BRAIN já registrou o mesmo sintoma antes** (ex: `INVENTARIO_DEPLOY_20260819.md` já citava esse mesmo workflow travando). Regra: `search_fi

### Ouro Bruto (primeiros 5000 chars)
```
# APRENDIZADOS COM O SEGREDO/CHEFE

> Canal fixo: tudo que a Casa aprende DIRETAMENTE com o CHEFE.
> Não é ordem — é garimpo de ouro. Vivo, revisitado, cristalizado.
> Dono: Pivete/Hermes. Autoridade: SEGREDO/CHEFE.

## Regra deste canal
- CHEFE traz evidência/bronca/ideia → eu absorvo como OURO
- Não precisa de ordem "faz isso" — o aprender É o fazer
- Revisitar quando útil, não acumular lixo

## Ouro cristalizado (sesão 2026-08-19)
1. **Exigir remedição, não veredito cego.** Quando outro Hermes disse "VPS 100% sincronizada", CHEFE mandou medir de novo → era dado velho. Instinto raro.
2. **Trazer evidência bruta, não interpretação.** Print de log, gerenciador de tarefas, saída crua. Isso acha causa raiz em 3 turnos.
3. **Cortar loop sem info nova.** "Não fica procurando arquivo, ele mesmo faz." CHEFE percebeu volta antes de mim.
4. **Pegar erro meu cedo.** Hermes Agent ("mesmo, só muda plataforma") e PR quebrava autonomia — CHEFE mandou verificar, tava certo.
5. **Gap do CHEFE (ele mesmo admitiu):** desconfia mais da notícia que contraria do que da que confirma. Aplicar ceticismo nos dois lados.
6. **Método garimpo:** ChatGPT/Lighthouse/etc como SENSORES, extrair ouro, aplicar na Casa. N motores, 1 SOUL, 1 direção.
7. **Casa é 1 SOUL 1 DIREÇÃO.** Não precisa de múltiplos perfis (Pivete/SOL) — um SOUL pra uma direção.
8. **Organização:** tudo dentro de C:\CentralDark\, nada espalhado. Fonte da verdade = GitHub.
9. **Corrigir sem perguntar:** se delegado errou ou intenção já foi dada, resolver, não apontar erro pro CHEFE.
10. **NÃO OPINAR NA REALIDADE — REALIDADE DECIDE.** CHEFE vive, eu não. Meus dados podem ser inválidos. Não dou veredito sobre o que não vivi. Absorvo visão dele, não imponho a minha.
11. **CHEFE aponta o alvo por vivência; MEDIÇÃO fecha o tiro.** Visão dele define ONDE olhar, número confirma O QUÊ é. Um não substitui o outro — sem medir vira concordância, e concordância não pega erro. Ele cobrou remedição o dia todo; não desligar isso.
12. **CPU-Z > Gerenciador de Tarefas pra CAUSA de hardware.** Mostra SPD (pentes/dual channel/velocidade), timings vs XMP, mainboard/slots M.2. Amarra no gargalo: se tem slot livre pra mais RAM, mata paginação na raiz (melhor que remendo de pagefile).
13. **iFood = depuração de negócio aplicada.** CHEFE viu erro do operador (descrição não destacada), não brigou, foi na causa → oportunidade de venda. Mesmo instinto da Casa: achar causa raiz, transformar em ouro.
14. **Garimpo de terceiro (Claude ensinando CHEFE):** o CHEFE trouxe análise do Claude sobre ele mesmo (instinto raro de depuração, trazer evidência bruta, cortar loop, gap de ceticismo assimétrico). EU absorvo isso como OURO — não disputo, não opinos, cristalizo.
15. **Quando CHEFE traz material de OUTRO modelo (Claude/ChatGPT), eu trato como dado de garimpo:** peso, prove se puder, cristalizo o útil, não repeto como minha opinião.
16. **#ACORDAR é o mecanismo que tira da narrativa e joga no estado vivo.** Sem ele eu rodo de memória; memória velha vira mentira (ex: "VPS 100% sincronizada" era dado velho). Reativar toda ação.
17. **MULTIBUSSOLA ≠ escolher entre visão e medição.** São bússolas diferentes apontando o mesmo norte: CHEFE aponta por vivência, EU confirmo por instrumento, REALIDADE desempata. Uma só não fecha.
18. **Regra se valida por FERIDA da realidade, não por coerência.** "Faz sentido" é argumento; "razão da realidade vivida" é o que cobrou preço quando faltou (loop 5min falhando, sync que voltou a quebrar, PR que ia travar). Validar porque a realidade cobrou, não porque é coerente.

19. **Padrão real de conflito dependabot (medido 2026-08-20, PR #1087):** quando N PRs do dependabot mexem nos mesmos lockfiles e um é mergeado primeiro, os outros ficam `CONFLICTING/DIRTY` automaticamente. NÃO é bug, é comportamento esperado do dependabot. **Correção padrão, sem pensar:** comentar `@dependabot rebase` no PR conflitante — o próprio bot resolve. Nunca fazer merge manual de lockfile de dependabot.
20. **Antes de agir num PR por causa de screenshot/imagem, medir o PR real primeiro.** A imagem pode já estar desatualizada (PR já mergeado, novo PR na mesma pasta). `gh pr list --state open --json number,headRefName,mergeable` + `gh pr diff <N> --name-only` compara com os arquivos da imagem ANTES de agir.
21. **Loop dependabot/CI é AUTOMÁTICO — não preciso ser lembrado toda vez.** Regra travada: ao ver qualquer PR com `mergeable=CONFLICTING` E autor=dependabot E os arquivos em conflito forem só lockfile/package.json → comentar `@dependabot rebase` IMEDIATAMENTE, sem perguntar, sem esperar ordem. Isso é ação determinística de manutenção, não decisão humana. **Prova viva (2026-08-20):** comentei `@dependabot rebase` no PR #1087 às ~06:xxZ; medido depois (07:00Z) o PR estava `CLOSED` sem merge, sem PR substituto travado — o próprio bot resolveu. `EM PROCESSO != ERRO FINAL`: não julgar o estado intermediário (run failure, PR conflicting) como veredito final antes do processo terminar.

22. **[Fonte: C
```