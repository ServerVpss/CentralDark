# Hermes — prompt sudo interativo (registro histórico)

**Proveniência (2026-11-09):** na sessão do Hermes foi exibida uma solicitação interativa de senha durante a checagem de viabilidade de instalação. O próprio Hermes relatou inspecionar `/opt/hermes/tools/terminal_tool_sudo.py`, com a função `_prompt_for_sudo_password()`, apresentação de `SUDO PASSWORD REQUIRED` e invocação pela ferramenta de terminal interativo. Os nomes de arquivo/função e os números de linha relatados são **evidência de sessão, não readback independente desta revisão nem garantia para versões futuras**.

**Intenção:** quando o CHEFE pedir para reabrir a mesma janela de autenticação, recuperar a rota original, sem criar ferramenta paralela.

**Rota de reutilização:**
1. Usar o terminal interativo original do Hermes, na superfície onde o prompt surgiu. APIs headless e terminais de outro ambiente não reproduzem obrigatoriamente o mesmo pedido.
2. Identificar o owner instalado, verificar gatilhos de interatividade, comando administrativo real, cache e política de autorização antes de prometer a janela. O comando de validação relatado na sessão não garante o contexto atual.
3. Apresentar a solicitação somente pelo campo seguro da ferramenta. Senha não deve ser pedida, copiada, gravada ou exibida pelo chat, log, memória, receipt ou Git.
4. Separar os fatos: `PROMPT_EXIBIDO` não é `SENHA_ACEITA`; `SENHA_ACEITA` não é `ROOT_ATIVO`. Comando ausente naquele executor não prova ausência universal de rota administrativa.
5. Se a rota interativa estiver indisponível, registrar `PROMPT=UNAVAILABLE_OR_UNKNOWN` e o motivo material, sem simular janela, contornar política de privilégios ou instalar serviços por inferência.

**Critério de prova:** caminho/versão da ferramenta, superfície interativa, evento real de exibição do prompt e efeito autorizado quando aplicável. `DOCUMENTADO != CONSUMIDO_PELO_RUNTIME`; `UNKNOWN != PASS`.
