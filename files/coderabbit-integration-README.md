Resumo

Esta integração cria um "Coderabbit Bridge" que sincroniza dois sistemas tipo Rabbit (RABBIT_A, RABBIT_B) com a API da CentralDark e notifica o bot dependente (DEPENDA-BOT).

Comportamento principal
- Consulta endpoints RABBIT_A and RABBIT_B (config via env vars).
- Calcula saldo agregado; se não houver informação válida, usa fallback determinístico saldo=0 (zero-regression).
- Envia evento para CentralDark API (ENV CENTRALDARK_API_URL) e notifica DEPENDA-BOT via webhook (ENV DEPENDA_BOT_URL).
- Log local em ./logs/coderabbit-bridge.log

Segurança
- Não gravar chaves no repositório. Use variáveis de ambiente ou secrets manager.
- Timeouts curtos e retry limitado para evitar bloqueios.

Deploy rápido
1. Colocar scripts/coderabbit-bridge.mjs no servidor e garantir node 18+.
2. Definir variáveis de ambiente: RABBIT_A_URL, RABBIT_B_URL, CENTRALDARK_API_URL, DEPENDA_BOT_URL.
3. Testar localmente: node scripts/coderabbit-bridge.mjs --once
4. Agendar via crontab (*/5 * * * * node /path/to/scripts/coderabbit-bridge.mjs) ou como service.

Observabilidade
- Logs em ./logs
- Retornos HTTP da CentralDark e DEPENDA-BOT no log para auditoria

Notas
- Este é um scaffold: adapte validações de payloads conforme contrato real da CentralDark API.
- Fallback determinístico garante ZERO regressão em falta de dados.
