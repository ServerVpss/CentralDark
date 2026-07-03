# MAPEAMENTO-ENV — CentralDark / MultiZap

> Documento de controle para mapear arquivos de configuração privada encontrados na VPS.
>
> Este documento nunca deve conter valores, tokens, chaves, senhas, cookies, connection strings ou conteúdo de arquivos privados. Registrar somente caminhos relativos sanitizados, finalidade provável, risco e ação recomendada.

## 1. Objetivo

Criar um mapa organizado dos arquivos de ambiente/configuração privada existentes na VPS para preparar uma migração futura e controlada para o cofre oficial do CentralDark.

A migração não será feita automaticamente agora. Primeiro vamos mapear, classificar e validar serviço por serviço.

## 2. Decisão operacional atual

- Repo principal oficial: `ServerVpss/CentralDark`.
- Pasta de produção do MCP na VPS: `/root/CentralDark/apps/mcp`.
- Repo espelho/backup: `segredounlock/clone-deck`.
- O espelho não deve usar a VPS como fonte.
- O espelho deve receber o GitHub principal por mirror Git, não arquivos locais da VPS.
- Motivo: a VPS pode conter builds locais, backups, arquivos privados, sessões, logs e alterações não versionadas.

## 3. Cofre oficial planejado

Destino futuro para valores privados importantes:

```txt
/root/CentralDark/secrets/
```

Status atual: **planejado, ainda não migrado**.

## 4. Achados da varredura atual da VPS

A varredura manual feita na VPS listou 188 arquivos candidatos ao sync e confirmou que há pelo menos um backup de ambiente local dentro de `apps/install-callback/` que não deve entrar em espelho nem em sync por arquivos.

Também apareceu um arquivo de exemplo dentro de `apps/mcp/`, que pode permanecer no repositório desde que contenha apenas placeholders.

| Item | Local sanitizado | Tipo | Risco | Serviço provável | Ação recomendada |
|---|---|---:|---:|---|---|
| 1 | `apps/install-callback/<backup-de-ambiente>` | backup local de ambiente | Crítico | Install-Callback / OAuth / Cloudflare | Manter fora do Git e fora do espelho. Avaliar somente na VPS sem imprimir valores. Migrar variáveis úteis para o cofre oficial depois. |
| 2 | `apps/mcp/<arquivo-exemplo-de-ambiente>` | exemplo | Baixo | MCP-CentralDark | Pode ficar no repo se tiver somente placeholders. Confirmar que não contém valor real. |
| 3 | `apps/mcp/dist/**` | build gerado | Médio | MCP-CentralDark | Decidir depois se build deve ser versionado ou gerado no deploy. Não é secret, mas pode gerar divergência. |
| 4 | `scripts/deploy/**` | scripts de integração GitHub | Importante | Deploy / fallback | Validar que usa variáveis externas e não contém valor privado fixo. |
| 5 | `scripts/installer/**` | scripts de instalação e Cloudflare | Importante | Instalador | Validar sanitização de logs e leitura segura de variáveis. |
| 6 | `scripts/monitor/**` | scripts de monitoramento | Importante | Watchdog / alertas | Confirmar que credenciais de alerta ficam fora do repo. |

## 5. Problemas confirmados pela varredura

### 5.1 Arquivo de exclusão não estava na árvore oficial local

Foi procurado o arquivo de exclusão de sync na VPS e ele apareceu em árvores antigas/alternativas, mas não apareceu na raiz oficial local `/root/CentralDark`.

Isso reforça a decisão de não usar a VPS como fonte do espelho.

### 5.2 Árvore local da VPS não está limpa

A árvore local da VPS mostrou alterações modificadas e arquivos não rastreados. Isso é normal em produção, mas perigoso para mirror por arquivo.

Conclusão: o mirror oficial deve partir do GitHub principal, não da VPS.

## 6. Política para arquivos privados

Nunca versionar nem espelhar:

```txt
arquivos reais de ambiente
backups de ambiente
pastas de valores privados
pastas de tokens
pastas de sessão
chaves privadas
certificados privados
logs com possível dado privado
arquivos locais de shell/cache da VPS
```

Arquivos de exemplo são permitidos somente com placeholders claros, sem valor real.

## 7. Fases de migração controlada

### Fase 1 — Mapear

- Listar caminhos e tamanhos de arquivos privados.
- Não abrir conteúdo.
- Não colar valores no chat.
- Atualizar esta tabela com caminhos sanitizados.

### Fase 2 — Classificar

Classificar cada item como:

- Crítico: contém valor privado real ou backup de ambiente.
- Importante: script que consome valor privado ou pode vazar log.
- Baixo: exemplo sem valor real.

### Fase 3 — Migrar para o cofre oficial

- Migrar só o que for necessário.
- Serviço por serviço.
- Validar antes e depois.
- Não mexer em CRM, banco real, Docker/WuzAPI, WhatsApp, Caddy ou domínio sem confirmação explícita.

### Fase 4 — Limpeza

- Só remover arquivos antigos após validação.
- Toda remoção precisa de confirmação explícita.
- Salvar logs completos em revisão da VPS e mostrar no chat apenas resumo limpo.

## 8. Comando seguro para próxima varredura na VPS

Este comando lista somente caminhos e tamanhos. Não mostra conteúdo:

```bash
bash -lc 'set -euo pipefail; OUT="/tmp/centraldark-env-map.txt"; find /root/CentralDark /root/Multizap/apps/clone-deck -xdev \( -path "*/node_modules/*" -o -path "*/.git/*" \) -prune -o -type f \( -name ".env" -o -name ".env.*" -o -name "*.env" -o -name "*.env.*" -o -name "*.bak" -o -name "*.bak.*" -o -name "*.pem" -o -name "*.key" \) -printf "%s %p\n" 2>/dev/null | sort -n > "$OUT"; echo "Mapa salvo em $OUT"; sed "s#/root/CentralDark/#/root/CentralDark/#; s#/root/Multizap/apps/clone-deck/#/root/Multizap/apps/clone-deck/#" "$OUT" | tail -200'
```

Depois, atualizar este documento manualmente com caminhos sanitizados e classificação.

## 9. Próximas ações

- Rodar varredura completa de caminhos/tamanhos.
- Confirmar se o backup local de ambiente em `apps/install-callback/` existe só na VPS e não está no GitHub principal.
- Conferir se arquivos de exemplo têm apenas placeholders.
- Definir quais serviços devem ler do cofre oficial primeiro.
- Só depois migrar valores privados para `/root/CentralDark/secrets/`.

## 10. Status

Status atual: **mapeamento inicial criado com base na varredura atual da VPS**.

Nada foi removido, migrado ou exposto.
