# 21 — Método CentralDark de diagnóstico em funil

> Método oficial para recuperar serviços quebrados sem bagunçar produção, sem expor segredos e sem depender de pastas legadas.

## Frase-resumo

```txt
erro atual → busca exata → fonte oficial → patch mínimo → validação manual → restart só do serviço → memória salva
```

## Quando usar

Use este método quando:

- um serviço PM2 estiver `errored`, em loop ou reiniciando muito;
- os logs do PM2 vierem vazios ou antigos;
- aparecer `MODULE_NOT_FOUND`, token ausente, env quebrado ou caminho legado;
- houver suspeita de pasta duplicada ou dependência fora do lugar;
- a correção precisar preservar produção e evitar mexer em tudo.

## Passo a passo oficial

1. **Não reiniciar tudo.** Nunca começar com `pm2 restart all`.
2. **Isolar o serviço afetado.** Trabalhar somente no app que caiu.
3. **Executar manualmente.** Rodar o entrypoint no diretório correto para ver o erro real.
4. **Seguir o erro atual.** Cada erro resolvido deve revelar o próximo, até chegar no problema real.
5. **Buscar por nome exato.** Para arquivo ausente, procurar pelo nome/paths exatos e comparar com a fonte oficial do repo.
6. **Consolidar em CentralDark.** Não usar `/root/Multizap` ou `/root/Multizap1` como fonte oficial quando o serviço pertence ao CentralDark.
7. **Validar antes de reiniciar.** Em Node.js, usar `node --check` nos arquivos tocados.
8. **Segredos só por presença/formato.** Nunca imprimir token, `.env`, sessão ou chave. Testar token por API segura sem mostrar valor.
9. **Cofre oficial.** Segredos do serviço devem ficar no cofre CentralDark com permissão restrita.
10. **Restart controlado.** Reiniciar somente o serviço afetado, com `--update-env` quando env mudou.
11. **Validar evidência.** Confirmar `status online`, log saudável e ausência de loop.
12. **Persistir e documentar.** Rodar `pm2 save` quando estável e registrar aprendizado/relatório.

## Exemplo validado — MultiZap-BOT

No caso do `MultiZap-BOT`, a sequência correta foi:

1. PM2 mostrava `errored`, mas log vinha vazio.
2. Execução manual revelou `MODULE_NOT_FOUND` para `skills/core/consciousness.cjs`.
3. Busca encontrou a fonte oficial em `CentralDark/apps/bot/skills/core/`.
4. O bot foi consolidado para usar `apps/bot-telegram/skills/core/`.
5. O erro mudou para `TELEGRAM_BOT_TOKEN` ausente.
6. O bot foi ajustado para priorizar o cofre CentralDark.
7. O token válido foi localizado e testado sem exibir o valor.
8. O serviço foi reiniciado individualmente com `--update-env`.
9. Evidência final: `Bot online` e PM2 `status online`.

## Bloqueios permanentes

- Não expor secrets.
- Não colar `pm2 env` bruto no chat.
- Não usar `git add .`.
- Não apagar pasta legada sem auditoria, plano e confirmação explícita.
- Não tocar Docker, WuzAPI, WhatsApp, Caddy, CRM, banco real ou domínio sem confirmação literal.

## Onde este método está registrado

- `docs/CONSCIENCIA/APRENDIZADOS.md` — aprendizados #203 a #207.
- `docs/CONSCIENCIA/CONSCIENCIA.md` — seção 14, ciclo de trabalho.
- Este arquivo — referência prática dedicada para qualquer IA nova.
