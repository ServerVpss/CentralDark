# Transição Casa → Bolt/Builder

Data: 2026-07-26  
Repositório: `ServerVpss/CentralDark`  
Branch/HEAD observado: `main` / `cb102b5aa82e1f6c821f75a7efa931b1792df47f`  
Perfil Hermes: `pivete`  
Modo META LUPA: `QUENTE` (inventário de produção somente leitura)

## Contrato desta etapa

Fechar o registro técnico da Casa e inventariar o Bolt/Builder existente sem instalar, iniciar, reiniciar, remover ou modificar produção. GitHub é a fonte da verdade; a VPS apenas informa o runtime atual. Status verde, listagem e relatório histórico não valem como prova ponta a ponta.

## Casa

| Item | Resultado atual | Evidência/limitação |
|---|---|---|
| META LUPA | `PARCIALMENTE PROVADA NO RUNTIME` | `meta-lupa` está habilitada e aparece no índice de contexto fresco do Hermes; o carregamento integral do `SKILL.md` em nova inferência não foi selado por causa do HTTP 404 do provider |
| Jobs | `4/4 ATIVOS; ÚLTIMO STATUS OK` | scheduler ativo e últimas execuções concluídas; efeitos ponta a ponta não foram relidos nesta trilha |
| Testes | `72/72 HISTÓRICO FIXADO` | resultado incorporado à main; não repetido nesta missão |
| Voz | `CONFIGURADA, RUNTIME NÃO PROVADO` | TTS/STT presentes; nenhuma síntese/transcrição nova |
| Imagem nativa | `CONFIGURADA, RUNTIME NÃO PROVADO` | ferramenta presente; nenhuma geração/análise nova |
| Browser | `LISTADO, RUNTIME NÃO PROVADO` | automação não selecionada |
| Computer Use | `NÃO FUNCIONAL` | `cua-driver` ausente |
| Recuperação de contexto | `ARMAZENAMENTO PROVADO; RETOMADA NÃO PROVADA` | sessões persistidas existem; nenhuma retomada nova foi executada |
| Rollback | `PRESENTE, NÃO ENSAIADO NESTA TRILHA` | `.artifacts/meta-lupa-mission/00-rollback.md` e backup físico da missão anterior |

## Fonte da verdade e contratos encontrados

### Contrato canônico

- Caminho: `apps/modulos/Bolt/`
- Mapa: área consolidada/protegida no mapa canônico.
- Fonte: gitlink/submódulo fixado em `c0c0f8c6bf06b34747cf5a4b4c27aa2e57c8fe36`.
- Compose: `apps/modulos/Bolt/docker-compose.yml`.
- Serviço declarado: `builder`.
- Container declarado: `CentralDark-Builder`.
- Preview declarado: `127.0.0.1:5174 → 5173`.
- HMR declarado: `127.0.0.1:5175 → 5175`.
- Domínio declarado: `https://builder.centralldark.com`.
- Estado local: checkout do gitlink vazio; Docker indisponível; nenhuma porta relevante escutando.
- Estado VPS: fonte presente, container `Exited (1)` há aproximadamente duas semanas; portas 5174/5175 ausentes.

### Contrato legado incompatível

- Scripts: `scripts/deploy/install-builder-bolt.sh`, `scripts/deploy/ativar-builder-bolt-caddy.sh` e `scripts/validate/builder-bolt-static-checks.sh`.
- Caminho esperado pelos scripts: `apps/builder-bolt/`.
- Serviço esperado: `builder-bolt`.
- Container esperado: `centraldark-builder-bolt`.
- Resultado do validador estático atual: `FALHA`, pois exige arquivos/caminhos removidos e um snippet Caddy ausente.

Esse contrato não deve ser executado no estado atual: ele pode criar uma segunda instalação em vez de reparar o Bolt canônico.

## Runtime VPS

| Componente | Classificação | Processo/container | Porta/rota | Estado |
|---|---|---|---|---|
| Bolt canônico | `EXISTE_E_QUEBRADO` | Docker `CentralDark-Builder` | 5174/5175 declaradas | container parado `Exited (1)`; sem listeners |
| Artifacts Builder | `EXISTE_E_FUNCIONA` | PM2 `CentralDark-ArtifactsBuilder` | `0.0.0.0:3090` | online; responsabilidade diferente do Bolt |
| Builder público | `EXISTE_E_NAO_LIGADO_AO_BOLT` | Caddy → Artifacts Builder | `builder.centralldark.com → localhost:3090` | requisição pública atual retornou 404; não aponta ao Bolt |
| Caddy | `EXISTE_E_FUNCIONA` | systemd/Caddy | 80/443 | ativo; nenhuma alteração realizada |
| HUB | `EXISTE_E_FUNCIONA_PARCIALMENTE` | estático + rota dinâmica | dist + 8098 | estrutura ativa; 8098 pertence ao OAuthBroker |
| WebUI | `EXISTE_E_DESLIGADO` | Docker `CentralDark-WebUI` | 3000 declarado | `Exited (137)` há aproximadamente duas semanas |
| Hermes Thinker | `EXISTE_E_FUNCIONA` | Docker | 127.0.0.1:7801 | ativo |
| HMR/WebSocket/terminal/workspace Bolt | `FALTA_PROVA_DE_RUNTIME` | nenhum específico confirmado | 5175 sem listener | apenas referências em código/configuração |

## Logs e rollback

- Metadados de log do HUB foram observados sem abrir conteúdo.
- Nenhum corpo de `.env`, token, chave ou secret foi lido.
- Os scripts legados preveem backup do Caddy e relatórios em `revisoes/`, mas não constituem rollback comprovado para o contrato canônico atual.
- Rollback mínimo futuro deve preservar a rota atual da porta 3090, capturar o estado do container Bolt e permitir retornar o Caddy ao upstream anterior sem afetar outros domínios.

## Segurança

Foram detectados valores de credencial literais versionados em composes protegidos. Os valores não são reproduzidos neste relatório. Isso exige rotação/revogação coordenada e migração para armazenamento seguro; apagar somente o texto não corrige uma credencial já exposta.

## META LUPA / falso verde

- Relatórios antigos de HTTP 200 não provam o runtime atual.
- `meta-lupa` listada/indexada não prova carregamento integral em nova inferência.
- Ferramentas de voz, imagem e browser listadas não provam execução.
- Caddy ativo não prova que o Bolt está servido.
- Domínio existente não prova que aponta para o componente correto.
- Artifacts Builder online não deve ser confundido com Builder Bolt.

## Veredito e próxima correção mínima

`VEREDITO=CORRIGIR`

`READY_FOR_BOLT_PREVIEW=NAO`

Sequência exata recomendada para a próxima missão:

1. Trabalhar em branch a partir do mesmo `origin/main`.
2. Fixar o gitlink/submódulo canônico e provar o SHA da fonte do Bolt.
3. Adaptar os três scripts existentes a `apps/modulos/Bolt`, mantendo um único serviço/container e removendo o contrato operacional concorrente.
4. Remover credenciais do compose somente junto com rotação/revogação e substituição por mecanismo seguro.
5. Fazer o validador estático passar contra o caminho canônico.
6. Na VPS, capturar logs sanitizados do `Exited (1)` e corrigir uma variável por vez.
7. Subir apenas o preview loopback 5174/5175, provar processo, HTTP, assets, WebSocket/HMR, workspace isolado e logs estáveis.
8. Só depois decidir se `builder.centralldark.com` deve continuar no Artifacts Builder ou mudar para o Bolt, com backup e rollback do Caddy.

Nenhuma instalação, inicialização, restart, reload, deploy ou alteração remota ocorreu nesta etapa.
