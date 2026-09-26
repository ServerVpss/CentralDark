# Checklist de Segurança

Antes de cada execução, verificar:

- [ ] Variáveis de ambiente sensíveis estão ocultadas nos logs (exibindo apenas o nome ou valor mascarado)?
- [ ] Nenhum token/chave (`service_role`, `JWT`, `SMTP`, API key) está sendo adicionado ou exposto no Git?
- [ ] Não estou usando comandos destrutivos (como `DROP TABLE`, `rm -rf` indiscriminado) sem backup prévio?
- [ ] Os endpoints afetados têm autenticação/autorização?
- [ ] Os webhooks envolvidos possuem e validam a chave secreta (`webhook secret`)?
- [ ] As políticas RLS e Publicações de Realtime do Supabase não estão super-expostas (abertas para todos indevidamente)?
- [ ] Os logs da execução não exibirão conexões com banco em texto claro?
- [ ] A execução segue as restrições para PM2 (ex: não usar `pm2 restart all`) e para `run-once-executor`?
