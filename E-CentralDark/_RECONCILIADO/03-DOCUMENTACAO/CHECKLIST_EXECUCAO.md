# Checklist de Execução - MultiZap

## Fluxo automático

Fluxo oficial para tarefas comuns e seguras:

```txt
GitHub
-> Workflow / Webhook
-> VPS
-> run-once ou post-deploy
-> relatório em /root/Multizap/revisoes/
```

1. Receber tarefa atual.
2. Confirmar o repositório correto: `ServerVpss/clone-deck` como origem de edição.
3. Atualizar arquivos pelo GitHub quando for seguro.
4. Acompanhar Workflow e Webhook.
5. Confirmar reflexo em `segredounlock/clone-deck` quando a tarefa envolver sync entre repos.
6. Executar run-once seguro quando existir script para a tarefa.
7. Gerar relatório em `/root/Multizap/revisoes/`.
8. Validar `resumo.md` quando houver relatório.
9. Atualizar memória operacional.
10. Atualizar checklist.
11. Detectar próxima tarefa.
12. Prosseguir automaticamente se for segura.
13. Parar e registrar pendência se for ação sensível ou falhar.

## Ações sensíveis que exigem confirmação

Regra principal: Não mexer no CRM, banco real, Caddy, Docker/WuzAPI, WhatsApp, PM2 sensível, domínio público ou arquivos privados sem confirmação explícita.

- Apagar arquivos.
- Mover CRM.
- Alterar banco real.
- Alterar Caddy.
- Reiniciar PM2 fora da lista branca.
- Reiniciar Docker/WuzAPI.
- Reset/logout WhatsApp.
- Mexer em tokens, chaves, cookies, sessões ou secrets.
- Trocar domínio público.

## Prioridade atual

- 069 concluído: mapear apps/bot + QR.
- Próxima: 070 consolidar QR temporário em `/root/Multizap/api/whatsapp/qrcode/`.
- Depois: validar chat ao vivo.
- Depois: validar contatos, fotos e grupos.

## Sync entre repositórios

Status atual:

- Origem de edição: `ServerVpss/clone-deck`.
- Destino espelho: `segredounlock/clone-deck`.
- Workflow: `.github/workflows/sync-to-segredounlock.yml`.
- Critério de sucesso: push na `main` do `ServerVpss/clone-deck` gerar commit `sync-peer` no `segredounlock/clone-deck`.
- Segurança: não copiar `.env`, `*.env`, `secrets/`, `node_modules/` nem `.git/`.
- Anti-loop: commits com `[sync-peer]` não devem gerar sincronização infinita.

## Histórico rápido

- Tue Jun  2 07:36:11 -03 2026: [OK] 069-plano-apps-bot-qr concluída.
- Tue Jun  2 07:36:11 -03 2026: [PENDENTE] Criar script para 070-consolidar-qr-temporario.
- 2026-06-05: [OK] Sync ServerVpss -> segredounlock verificado com workflow `Sync to segredounlock` em sucesso.
