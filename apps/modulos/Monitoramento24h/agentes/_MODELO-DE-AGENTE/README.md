# 🧩 MODELO DE AGENTE (copie esta pasta pra criar um robô novo)

Pra adicionar um agente novo ao Monitoramento 24h:

1. **Copie** esta pasta e renomeie com um nome fácil (ex.: `Guardiao-VPS`, `Guardiao-Backup`).
2. Escreva o `README.md` dizendo, em português simples:
   - o que o robô faz;
   - onde o código roda (caminho + processo PM2);
   - permissões (ler / notificar / agir sozinho).
3. **Registre** o agente em `../../registro-agentes.json` (nome, papel, pm2, codigo_ativo,
   permissoes, escopo, provedor_ia).
4. Pluga no **MCP** (ponto único) — assim ele aparece no painel do Hub automaticamente.

## Regras pra todo agente
- **Provedor-agnóstico:** pode ser Claude, GPT, Grok, Mistral… quem falar MCP entra.
- **Sem agir sozinho:** por padrão `agir_sem_aprovacao: false`. Nada destrutivo sem o "ok"
  do administrador no painel.
- **Tudo logado** em `../../artefatos/<nome-do-agente>/`.
