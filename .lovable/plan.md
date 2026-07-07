# Plano — Registrar o CentralDark-EliteHTTP como pendência

Não vamos mexer no processo agora. Só deixar bem documentado pra próxima IA (ou pro agente que a gente colocar depois) não se perder e saber exatamente o que é.

## O que vou fazer

1. **Adicionar pendência oficial** em `docs/PENDENCIAS.md` (prioridade média) com:
   - **Título:** Evoluir gateway público EliteHTTP (elite.centralldark.com)
   - **Descrição:** Processo PM2 `CentralDark-EliteHTTP` (id 14) está errored desde o incidente 05/07. Função esperada: gateway OpenAI-compatível público em `elite.centralldark.com`, usando ChatGPT Plus via Zendriver (contas-admin), pra plugar Cline/Bolt/Cursor/Continue/Aider sem pagar API. Documentação em `docs/GATEWAY/ELITE_ENDPOINT_PUBLICO.md`.
   - **Como fechar:** Colocar um agente dedicado pra levar o gateway até o fim — recriar venv, validar login noVNC do perfil ChatGPT, subir processo, testar `/v1/models` e `/v1/chat/completions` com Bearer, confirmar Caddy roteando `elite.centralldark.com → 127.0.0.1:8080`.
   - **Onde mexer:** `apps/modulos/elite-gateway/`, `infra/caddy/`, PM2 id 14.

2. **Atualizar o inventário PM2** em `mem/architecture/inventario-pm2-vps.md` marcando o id 14 como "⚠️ pendente — evolução agendada, ver PENDENCIAS.md" pra ninguém tentar ressuscitar no chute.

3. **Nota curta no cérebro vivo** em `docs/CONSCIENCIA/APRENDIZADOS/` explicando: EliteHTTP ≠ elite-anthropic-proxy. São gateways diferentes. Um é público (ChatGPT Plus/OpenAI-compat), o outro é interno (Anthropic/Claude). Pra próxima IA não confundir de novo.

## O que NÃO vou fazer agora

- Não recriar venv
- Não subir o processo
- Não mexer no Caddy
- Não deletar do dump.pm2

Fica dormindo até você mandar acordar.
