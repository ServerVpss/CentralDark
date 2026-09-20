---
title: "22 METODO DEPLOY VPS"
date: 2026-06-29
tags: ["consciencia"]
updated: 2026-06-29
---

# 22 — Método CentralDark de deploy via VPS

> Playbook oficial para publicar mudanças no CentralDark usando a VPS como ambiente de deploy, diagnóstico e validação controlada.

## Frase-resumo

```txt
repo oficial → pull controlado na VPS → validar local → restart só do serviço afetado → logs → pm2 save
```

## Verdade atual

- Repositório oficial: `ServerVpss/CentralDark`.
- Branch padrão para mudança normal: `main`.
- A VPS não é fonte permanente de código; ela é ambiente de execução, deploy e diagnóstico.
- Código permanente deve voltar para o repo oficial.
- Secrets, sessões, QR Code, `.env` e tokens nunca entram no Git.

## Diferença entre diagnóstico e deploy

### Diagnóstico na VPS

Pode ser feito na VPS quando o serviço está quebrado, porque a VPS mostra o erro real de produção.

Permitido:

- ler logs sanitizados;
- rodar o serviço manualmente para capturar erro real;
- testar sintaxe;
- validar status PM2;
- confirmar porta, disco, memória e pull;
- criar patch mínimo quando necessário para recuperar produção.

### Deploy permanente

Depois que o patch é validado, a regra é registrar a solução no repo oficial.

O fluxo correto é:

```txt
corrigir/registrar no repo oficial → main → VPS puxa → valida → restart controlado
```

## Fluxo normal

1. Alterar ou criar arquivo no repo oficial.
2. Commit direto na `main`, quando não for mudança crítica.
3. A VPS recebe por `git pull` automático ou pull manual controlado.
4. Validar diff/status na VPS.
5. Testar o serviço manualmente quando aplicável.
6. Reiniciar somente o serviço afetado.
7. Validar logs.
8. Rodar `pm2 save` quando estável.
9. Registrar aprendizado ou relatório se a mudança resolveu incidente.

## Pull na VPS

Preferir ferramenta segura quando disponível:

```txt
vps_git_pull(branch=main)
```

Ou manualmente na VPS, sempre no repo correto:

```bash
cd <repo-vps>
git pull --ff-only origin main
```

Nunca fazer `git reset --hard`, `git clean -fd` ou comandos destrutivos sem plano e confirmação explícita.

## Restart PM2

Regra de ouro:

```bash
pm2 restart NOME_DO_SERVICO --update-env
```

Somente o serviço afetado. Evitar `pm2 restart all`.

Depois validar:

```bash
pm2 describe NOME_DO_SERVICO
pm2 logs NOME_DO_SERVICO --lines 80 --nostream
```

Se ficou estável:

```bash
pm2 save
```

Resetar contador histórico só depois de estabilidade confirmada:

```bash
pm2 reset NOME_DO_SERVICO
pm2 save
```

## Quando usar PR em vez de commit direto

Usar branch + PR quando mexer em área crítica:

- Caddy;
- Docker;
- banco real ou migração destrutiva;
- secrets;
- WuzAPI/WhatsApp sessão;
- DNS/domínio;
- gateway de produção;
- qualquer mudança que possa derrubar vários serviços.

## Checklist antes de dizer “deploy concluído”

- `git pull` aplicado no repo correto da VPS.
- Sintaxe/build/test relevante passou.
- Serviço afetado reiniciado individualmente.
- PM2 mostra `status online`.
- Logs não mostram erro novo repetido.
- `pm2 save` rodado após estabilidade.
- Mudança permanente está registrada no repo oficial.
- Aprendizado ou relatório criado quando houver incidente.

## Relação com o método de diagnóstico em funil

Este método de deploy usa o mesmo princípio do diagnóstico em funil:

```txt
erro atual → busca exata → fonte oficial → patch mínimo → validação manual → restart só do serviço → memória salva
```

A diferença é que, no deploy, o patch não pode ficar perdido só na VPS. Ele deve ser consolidado no repo oficial.

## Proibições permanentes

- Não usar a VPS como repositório paralelo.
- Não editar direto em espelho/backup.
- Não enviar secrets para Git.
- Não colar `pm2 env` bruto no chat.
- Não versionar QR Code, sessão WhatsApp, token ou `.env`.
- Não usar pasta legada como fonte oficial.
- Não reiniciar todos os serviços por impulso.

---

## Conexões Rápidas

- [[00-LEIA-PRIMEIRO]] — portão de entrada
- [[MAPA-DO-CEREBRO]] — visão geral
- [[CONSCIENCIA]] — documento mestre
