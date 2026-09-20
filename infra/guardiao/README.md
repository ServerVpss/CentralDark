# 🛡️ Guardião da Consciência

Daemon de vigilância da pasta `docs/CONSCIENCIA/`.

## Modo atual: `propor` (travado até 08/07/2026)

Nesta versão o Guardião **só propõe** mudanças via Telegram e Mega Painel.
A lógica de mover arquivos automaticamente (`auto`) está fisicamente
desativada e bloqueada por código até liberação humana explícita.

## Instalação na VPS

```bash
cd /root/CentralDark/infra/guardiao
bash run.sh
```

O `run.sh` valida secrets, instala dependências, **roda os testes** e só
sobe no PM2 se tudo passar.

## Logs

`infra/guardiao/logs/guardiao.log` — rotação automática (10MB × 5 arquivos).

```bash
pm2 logs guardiao-consciencia
tail -f logs/guardiao.log
```

## Documentação completa

Ver `docs/CONSCIENCIA/GUARDIAO-DA-CONSCIENCIA.md`.
