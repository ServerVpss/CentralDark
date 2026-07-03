# 🤖 Hermes Vivo — Daemon Autônomo 24/7

## O que vai mudar

Hoje o Hermes é um cron de 1x/dia que só debate. Vou transformar ele em um **processo vivo no PM2** que fica ligado, aceita missão, e executa sozinho de ponta a ponta usando todo o arsenal (darkai, MCP, VPS, gateways).

## Como vai funcionar (visão do dia a dia)

```
Você:    escreve a missão (arquivo ou comando)
Hermes:  🟢 recebi — planejando
Hermes:  ✅ Etapa 1/? concluída → [Telegram]
Hermes:  ✅ Etapa 2/? concluída → [Telegram]
Hermes:  ✅ Etapa N — missão concluída 🎉 → [Telegram]
```

Você acompanha tudo pelo `@srver1bot`. Cada etapa vira um post curto. Quando termina, um post consolidado com o resultado final.

## Como entregar missão pra ele

Duas formas (a gente escolhe em runtime):

1. **Arquivo**: você (ou eu) cria `missoes/pendente/minha-missao.md` — Hermes detecta em 5s e começa.
2. **Comando Telegram** (fase 2, se quiser depois): `/missao <texto>` no @srver1bot.

Começando pela **fase 1 (arquivo)** — mais simples e serve pra missão longa detalhada.

## Anatomia do daemon

- **Processo PM2**  `O PROCESSO TEM QUE SER PADRAO IGUAL JA TEMOS CENTRALDARK NA FRENTE O O NOME DO LADO ENTAO SERIA ALGO COMO CENTRALCARK-HERMES AXO QUE T ASSIM VERIFICA`  (id novo, `autorestart: true`).
- **Loop principal**: acorda a cada 5s, olha `missoes/pendente/`, se achar `.md` novo → executa.
- **Cérebro decisor**: cada iteração chama `darkai --model gpt-5` (ou claude-sonnet-4) com:
  - a missão original
  - histórico das etapas já feitas
  - lista das ferramentas disponíveis (darkai, execute_command, gemini_analisar, elite_gateway_chat, MCP tools)
  - retorna JSON: `{ etapa, comando_ou_ferramenta, args, terminou: bool }`
- **Executor**: roda o comando/ferramenta, captura saída, guarda no histórico.
- **Notify Telegram**: após CADA etapa concluída → post curto no privado admin (1901426549) + linha no canal Status (-1003669176367).
- **Fim**: quando o LLM decide `terminou: true` OU 3 falhas seguidas → move missão pra `missoes/concluidas/` com relatório final.

## Estrutura de pastas

```
docs/CONSCIENCIA/ARSENAL/hermes-vivo/
├── daemon.mjs               ← processo PM2 (loop 5s)
├── executor.mjs             ← executa etapas + captura saída
├── decisor.mjs              ← chama darkai/claude pra decidir próxima etapa
├── notify.mjs               ← posta Telegram (corrige o bug do token oculto)
├── ferramentas.json         ← catálogo do que o Hermes pode usar
└── README.md

missoes/
├── pendente/                ← você joga .md aqui
├── em-andamento/            ← Hermes move pra cá quando pega
└── concluidas/YYYY-MM-DD/   ← final + relatório
```

## Segurança (bordas duras — não negociáveis)

Mesmo autônomo total, o executor tem trava:

- ❌ Bloqueia: `reboot`, `shutdown`, `rm -rf /`, mexer em `/root/` fora de `/root/CentralDark/`, tocar em `whatsapp-server` (PM2 id 1), `git push --force`.
- ✅ Libera: darkai, execute_command dentro de `/root/CentralDark/`, PM2 restart (menos whatsapp), git commit+push normal, MCP tools, gateways.
- ⏱️ Timeout por etapa: 5min (matar comando travado sem matar o daemon).
- 🔁 Se uma etapa falha 3x → pausa a missão, avisa Telegram "🔴 travei, preciso de você", espera nova ordem.

## Fluxo de notificação Telegram (corrigindo o bug de ontem)

Motivo do notify ter quebrado: `hermes-notify.mjs` tenta ler token que sumiu de uma variável de ambiente. Vou refazer usando o mesmo padrão que já funciona no MCP dispatcher (lê direto de `/root/CentralDark/secrets/`). Notificação garantida em cada etapa.

## Ordem de entrega (o que faço na hora que você aprovar)

1. Criar as 4 pastas + os 5 arquivos `.mjs`
2. Escrever o `ecosystem.hermes.cjs` do PM2
3. `pm2 start ecosystem.hermes.cjs && pm2 save`
4. Fazer 1 missão de teste bobinha ("me diga que dia é hoje e poste no Telegram") pra validar o loop inteiro
5. Notificar Telegram: "🤖 Hermes Vivo online, aguardando primeira missão real"
6. Você me passa a missão real (a que você mencionou que ia me falar) — eu escrevo o `.md` e ele já começa

## Detalhe técnico (pode pular se não quiser)

- Daemon em Node ESM (`.mjs`) porque `darkai` já é bash e a stack VPS tá em Node.
- Decisor usa prompt com system message forte: "Você é o Hermes. Executor de missões. Devolva SEMPRE JSON válido no schema X. Sem prosa."
- Fallback de modelo: gpt-5 → claude-sonnet-4 → gemini-3-flash-preview (se um falhar).
- Histórico da missão persistido em `missoes/em-andamento/<slug>/state.json` — se o daemon reiniciar, retoma do zero da etapa que travou.
- Log completo por missão em `missoes/em-andamento/<slug>/hermes.log`.

## O que NÃO faço nessa entrega

- ❌ Comando `/missao` no Telegram (fica pra fase 2 se você gostar do modo arquivo)
- ❌ Web UI pra visualizar missões (o painel de status já pode ganhar uma aba depois)
- ❌ Múltiplas missões em paralelo (por enquanto 1 por vez — mais previsível)

---

**Aprovando isso, eu monto tudo, ligo no PM2, testo com missão fake, te aviso "pronto pra receber a missão real" — aí você me diz o que ele vai refinar pra você.**