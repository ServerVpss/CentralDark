# Aprendizado: conferir painel, acesso e serviço separadamente

- **Origem:** operação autorizada EasyPanel / Cloudflare Access na Contabo, na missão do HUD #1977.
- **O que a operação mostrou:** salvar a Fonte do Compose não implanta o serviço. O EasyPanel pode gerar um domínio automaticamente. O login do Cloudflare Access não prova acesso autorizado; a sessão autorizada precisa chegar ao EasyPanel.
- **O que mudou no método:** reler o recurso após salvar, conferir os domínios efetivos e distinguir estado da interface, política de acesso e estado do serviço. Não retentar uma remoção negada por outra rota. Não iniciar duas instâncias que escrevam no mesmo estado.
- **Owner do método:** [receita de navegador administrativo](../../../.agents/skills/centraldark-operational-method/references/UI-MULTIJANELA-ROTAS-CACHE-20261030.md#navegador-administrativo). Este aprendizado aponta para a receita; não cria outra.
- **Limite:** este recibo não comprova implantação, autorização OAuth, emissão de token ou `initialize` e `tools/list` autenticados.
