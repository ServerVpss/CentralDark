# CENTRALDARK — Codex MultiConta Hub

Hub local para alternar manualmente entre contas já autenticadas oficialmente pelo Codex CLI, mantendo o mesmo repositório, worktree, goal e checkpoint.

## Faz
- cria um `CODEX_HOME` separado por conta;
- inicia o login oficial do Codex;
- abre o Codex no mesmo workspace;
- oferece **Próxima conta + retomada**;
- copia um prompt de recuperação para a área de transferência;
- não captura tokens.

## Não faz
- não intercepta `http://localhost:1455/...`;
- não lê `id_token`, cookies, refresh token, `auth.json` ou chaves;
- não imita a página de consentimento da OpenAI;
- não troca automaticamente para contornar limites;
- não administra o login do GitHub.

O callback local e a página de consentimento pertencem ao fluxo oficial do Codex. O Hub apenas inicia `codex --login`.

## Uso
1. Extraia o ZIP.
2. Execute `Start-Hub.cmd`.
3. Adicione apelidos como `principal` e `reserva`.
4. Selecione uma conta e clique **Autenticar oficialmente**.
5. Conclua o login no navegador.
6. Use **Abrir + copiar retomada** ou **Próxima conta + retomada**.

## Caminhos padrão
- Workspace: `E:\CentralDark\Pivete\CentralDark`
- Worktree: `E:\CentralDark\Pivete\worktrees\bolt-lovable-bridge-20260726`
- Goal: `E:\CentralDark\GOALFORMULAA120CONSOLIDADA.zip`
- Perfis: `%LOCALAPPDATA%\CentralDark\CodexAccounts\<apelido>`
- Estado do Hub: `%LOCALAPPDATA%\CentralDark\CodexAccountHub\hub-state.json`

## Regra de segurança
Use apenas contas que pertencem a você. A troca é manual e visível. O estado da missão continua em Git, worktree, goal e checkpoint; credenciais nunca entram no repositório.
