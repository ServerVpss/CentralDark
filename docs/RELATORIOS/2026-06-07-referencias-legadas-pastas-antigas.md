# Referências legadas antes da limpeza das pastas antigas — 2026-06-07

## Situação

Após a migração dos apps para a pasta principal, foi executada uma auditoria para descobrir se ainda existem dependências vivas apontando para pastas antigas.

Resultado encontrado na VPS:

```txt
Referências antigas encontradas: 217
Relatório local: /root/CentralDark/revisoes/20260607-174023/auditoria-dependencias-pastas-antigas/RELATORIO-DEPENDENCIAS-PASTAS-ANTIGAS.md
```

## Decisão

Não apagar e não colocar em quarentena definitiva as pastas antigas enquanto houver referência ativa.

Pastas envolvidas:

```txt
/root/apps
/root/Multizap/apps
/root/CentralDark/apps
```

## Ponto mais perigoso

O Caddy atual ainda contém referência para o caminho legado do frontend/build:

```txt
/etc/caddy/Caddyfile
root * /root/Multizap/apps/clone-deck/apps/bot/dist
```

Isso significa que o site/front pode estar sendo servido a partir da pasta antiga. Apagar essa pasta antes de corrigir e validar Caddy pode derrubar o site.

## Tipos de referência encontrados

A auditoria encontrou referências em quatro grupos:

1. **Caddy atual e backups de Caddy**
   - Impacto alto quando estiver no `/etc/caddy/Caddyfile` ativo.
   - Alteração de Caddy exige confirmação explícita.

2. **Scripts dentro dos apps migrados**
   - Exemplo: scripts de deploy, bot, bridge e setup ainda apontando para caminho legado.
   - Devem ser classificados entre ativos e legado morto antes de editar.

3. **Documentação antiga**
   - Pode ser corrigida com segurança, desde que não mude lógica de produção.

4. **Arquivos gerados/build manifest**
   - Muitos apontamentos podem ser apenas build antigo ou referência histórica.
   - Não devem guiar decisão sem checar se o serviço usa de verdade.

## Ordem correta de trabalho

1. Separar as 217 referências por grupo:
   - Caddy ativo.
   - Código ativo.
   - Script legado.
   - Documentação.
   - Build/artefato gerado.

2. Corrigir primeiro documentação e scripts seguros.

3. Para código ativo, alterar caminho legado para a pasta principal somente com validação.

4. Para Caddy:
   - pedir confirmação explícita antes;
   - fazer backup do Caddyfile;
   - trocar o root para a pasta principal se o build existir;
   - validar `caddy validate`;
   - recarregar Caddy somente após confirmação;
   - validar HTTP/HTTPS do site.

5. Validar PM2 e HTTP.

6. Só depois mover pastas antigas para quarentena.

7. Apagar definitivamente apenas com confirmação literal.

## Pendências relacionadas

- `#38` — Corrigir referências legadas antes de apagar pastas antigas.
- `#36` — Arquivar e apagar pastas apps antigas após validação.
- `#35` — Migrar apps antigas para a pasta principal após comparação VPS + GitHub.

## Regra operacional

Enquanto `/etc/caddy/Caddyfile` ou qualquer serviço ativo apontar para pasta antiga, a pasta antiga deve ser tratada como dependência viva, não como lixo.
