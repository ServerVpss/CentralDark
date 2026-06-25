# 23 — Missão de Reparo PM2 sem Reestruturação Global de Apps

## Decisão operacional

Em reparos emergenciais de PM2, deploy, runner, webhook ou MCP, **não executar reestruturação global da árvore de apps**.

O objetivo imediato é estabilizar produção. A reorganização completa da árvore CentralDark fica para fase futura autorizada pelo usuário.

## Estrutura oficial preservada

A raiz oficial é:

```txt
/root/CentralDark
```

Apps oficiais vivem em:

```txt
/root/CentralDark/apps/
```

Pontos já definidos:

```txt
/root/CentralDark/apps/Bolt         -> Builder Bolt
/root/CentralDark/apps/WebUI        -> Open WebUI
/root/CentralDark/apps/bot-telegram -> Bot Telegram
```

O que já está dentro de `/root/CentralDark/apps` **não deve ser movido** durante uma missão emergencial, salvo correção mínima e explícita do próprio app quebrado.

## Legados

Pastas como:

```txt
/root/Multizap
/root/Multizap1
/root/whatsapp-server
```

são consideradas legadas/fonte temporária de auditoria.

Regras:

- podem ser lidas para diagnóstico;
- podem servir para comparação;
- não devem ser apagadas nesta fase;
- não devem ser fonte oficial permanente;
- não devem ser migradas em massa durante reparo emergencial.

## Separação de fases

### Agora — reparo emergencial

Permitido:

- corrigir PM2 por nome do serviço;
- corrigir cwd/script path quebrado;
- corrigir env/path mínimo;
- validar logs;
- reiniciar somente serviço afetado;
- salvar PM2 após estabilidade.

### Depois — boot de reestruturação

Fica pendente para fase futura:

- mapear árvore inteira;
- mostrar estrutura atual e estrutura alvo;
- classificar legados;
- propor migração controlada;
- consolidar apps com backup/relatório;
- só mover/apagar depois de aprovação explícita.

## Regra curta

```txt
reparo agora ≠ reestruturação global
```

## Método em reparo emergencial

```txt
erro atual → diagnóstico read-only → patch mínimo → restart só do serviço → logs → pm2 save
```

## Proibições nesta fase

- Não mover apps que já estão em `/root/CentralDark/apps`.
- Não apagar `/root/Multizap*`.
- Não apagar `/root/whatsapp-server*`.
- Não usar `pm2 restart all`.
- Não operar PM2 por ID como fonte de verdade.
- Não mexer em Docker/WuzAPI/sessão WhatsApp.
- Não reestruturar WebUI ou Bolt enquanto o objetivo for apenas reparar PM2.
