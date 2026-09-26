# Desktop, dashboard, gateway e profiles — limites operacionais

Fonte primária: https://hermes-agent.nousresearch.com/docs/user-guide/features/web-dashboard

## Regra estrutural

Não confundir quatro processos/escopos diferentes:

1. **Hermes Desktop local** — normalmente inicia seu próprio backend headless em porta dinâmica.
2. **Web dashboard** — servidor HTTP separado, normalmente em `127.0.0.1:9119`.
3. **Gateway de mensagens** — processo separado para Telegram/Discord/etc.; sua porta e seu estado não provam que o dashboard está ativo.
4. **Profile selecionado** — define modelo, provider, skills, memória e sessões usados pelo backend/chat correspondente.

Consequência: `127.0.0.1:9119` recusando conexão não prova defeito do Desktop local. Só prova que o processo `hermes dashboard` não está escutando nessa porta. O Desktop local não depende do dashboard, salvo quando configurado em **Settings → Gateway → Remote gateway**.

## Dashboard multi-profile

O dashboard padrão é uma superfície única no nível da máquina. Um servidor gerencia todos os profiles; o seletor lateral e `?profile=<nome>` determinam qual profile as páginas de Config, Keys, Skills, MCP, Models e Chat administram.

Executar `hermes --profile <nome> dashboard` sem `--isolated` apenas abre/encaminha para o dashboard único com esse profile pré-selecionado. `--isolated` cria servidor dedicado por profile e deve ser intencional.

## Diagnóstico de divergência Desktop × CLI

Quando o modelo funciona no CLI mas não no Desktop:

1. Provar o profile da sessão funcional nos logs de `agent.log` (`conversation turn ... profile/session`, modelo e provider).
2. Provar o profile realmente iniciado pelo Desktop em `desktop.log`: procurar `Starting Hermes backend for profile "<nome>"`.
3. Comparar modelo/provider/autenticação dentro desses dois profiles; não confiar apenas no rótulo visual do modelo.
4. Verificar o erro da chamada real no mesmo intervalo: endpoint, status HTTP e mensagem sanitizada.
5. Se os profiles diferirem, corrigir primeiro o alvo/profile; só depois investigar provider ou modelo.

Um rótulo igual (`gpt-*` + `openai-codex`) em dois lugares não prova mesma sessão, mesma credencial ou mesmo estado carregado.

## Windows nativo

Segundo a documentação oficial, as páginas administrativas do dashboard funcionam no Windows nativo. Porém, a aba **Chat** do dashboard usa TUI sobre PTY/WebSocket e requer kernel POSIX (Linux, macOS ou WSL2). No Windows nativo, essa aba deve orientar o uso de WSL2.

Isso não impede o aplicativo Desktop nativo de conversar com o backend local próprio; são caminhos diferentes.

## Remote gateway

No modo remoto, o Desktop se conecta a um processo `hermes dashboard` já ativo no host remoto. O teste `GET /api/status` é apenas readiness parcial; o chat real usa WebSocket (`/api/ws` e/ou `/api/pty`) e também depende de autenticação, bind/Host header e guarda de peer.

Para falhas remotas, cruzar `desktop.log` e logs do dashboard no mesmo intervalo. Códigos úteis documentados: `4401` = ticket WebSocket não autenticado; `4403` = socket rejeitado pela guarda de request (por exemplo Host/peer incompatível).

## Prova mínima antes do veredito

- processo e linha de comando;
- porta realmente em `LISTENING`;
- profile iniciado pelo Desktop;
- profile selecionado no dashboard/CLI;
- modelo/provider da chamada real;
- resposta ou erro HTTP real no log;
- distinção explícita entre Desktop, dashboard e gateway.
