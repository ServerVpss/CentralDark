# Hermes Typed Core — menu Telegram nativo (PR #1804)

**CHEFE:** Unigram permanece sua frente de build. Este adapter pertence ao
Hermes-CORE já existente e não instancia bot, Telegram polling, MTProto,
gateway, MCP, modelo ou escritor novos.

No Telegram, menu do bot Hermes nativo:

- \`/hton\` — **Ativar preferência Hermes Typed Core**.
- \`/htoff\` — **Voltar ao Hermes atual (fallback)**.

A Bot API só aceita letras minúsculas em nomes de menu. As legendas estão em PT-BR.
Comandos ficam isolados por conversa+usuário+perfil. Modo padrão é OFF, então
não muda o modelo, os cronjobs ou as sessões existentes. O estado guarda apenas
chaves opacas (hash) no diretório de estado do perfil, sem token nem chat ID legível.

## Instalação pelo owner existente

O Hermes nativo já implementa plugins com \`ctx.register_command\`; comandos sem
parâmetros entram na lista do Telegram via \`telegram_menu_commands\` e
\`setMyCommands\`, quando o plugin estiver carregado no gateway. Deve-se usar o
gerenciador/caminho de plugins **do perfil que já controla este bot**: não iniciar
outro bot e não associar novamente o mesmo token a outro polling. Na VPS, medir
perfil, versão, plugin loader e ACL do gateway antes de instalar. Recarregar o
plugin/menu por rota suportada, sem reiniciar ou tocar o bot funcional às cegas.
Caso o menu seja truncado, inserir \`hton\` e \`htoff\` na prioridade já existente
\`platforms.telegram.extra.command_menu.priority\`, preservando os demais itens.

O plugin registra preferências e um **contexto pre_llm_call não executor**. Ele
não faz short-circuit de chamadas a modelos. Para \`HERMES_TYPED_CORE_NO_AI=PASS\`
é indispensável integrar o dispatcher tipado já existente ao ingresso do Hermes
nativo e demonstrar receita comprovada → execução → readback sem chamada de IA.
Enquanto isso, ON significa **priorizar o uso de receita** com fallback atual,
não alegar execução determinística completa.

## Testes e prova

Executar:
\`python3 -m unittest discover -s apps/modulos/HERMES-CORE/plugins -p 'test_*telegram.py'\`.

E2E depois de instalar no gateway certo: confirmar nomes e descrições no menu
Telegram; \`/hton\` muda estado na conversa do CHEFE; \`/htoff\` desfaz; outra
conversa não herda; comandos não interrompem cron; em ON, receita provada
é consumida pelo Typed Core sem modelo **apenas depois que consumidor estiver
implementado**; qualquer ambiguidade preserva Hermes atual e permissionamento.

CURRENT: contrato/plugin + testes locais; **sem deploy, sem menu real provado**.
Nenhuma credencial foi copiada ou renovada.
