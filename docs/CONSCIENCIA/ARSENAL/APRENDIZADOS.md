# 📚 APRENDIZADOS DO HERMES
# Base de conhecimento empírica — fatos, não opiniões
# Formato: DATA | TIPO | CONTEXTO | CAUSA | ACAO_CORRETIVA | CONFIRMADO_POR

## Como usar
- cerebro.mjs lê os últimos 5 aprendizados do mesmo TIPO antes de cada missão
- cerebro.mjs escreve novo aprendizado quando um passo FALHA
- Só registra FATOS (exit code, HTTP status, diff) — nunca opiniões
- Campo CONFIRMADO_POR é obrigatório

## Registros
<!-- Novos registros serão adicionados aqui pelo cerebro.mjs -->
- 2026-07-03 | TIPO: erro | CONTEXTO: git em missão hub-v2 | CAUSA: git add -A varreu .env e arquivos de outros processos; pull --rebase conflitou em painel-data.json | ACAO_CORRETIVA: add só por path da missão; nunca painel-data.json/.env/backups; rebase conflitou = abort e relatar | CONFIRMADO_POR: fabler
- 2026-07-03 | TIPO: erro | CONTEXTO: darkai via execFile | CAUSA: stdin aberto pendura o $(cat) até o timeout — falha exata em 15/30/45s | ACAO_CORRETIVA: caller fecha stdin (p.child.stdin.end()); falha cravada no timeout = suspeitar de pipe, não de lentidão | CONFIRMADO_POR: fabler
- 2026-07-03 | TIPO: erro | CONTEXTO: correção de typecheck hub-v2 | CAUSA: releu o mesmo arquivo 6x alternando ler_arquivo e shell cat sem agir | ACAO_CORRETIVA: 2 leituras do mesmo arquivo bastam; a 3ª ação no arquivo DEVE ser escrever_arquivo com a correção | CONFIRMADO_POR: fabler
- 2026-07-03 | TIPO: tecnica | CONTEXTO: chamadas HTTP em missão (healthcheck, API) | CAUSA: curl sem timeout pendura o daemon; resposta crua sem parse gera decisão errada | ACAO_CORRETIVA: curl -sS --max-time 10 --retry 2; só status: -o /dev/null -w '%{http_code}'; JSON: | jq -r '.campo' | CONFIRMADO_POR: fabler
- 2026-07-03 | TIPO: tecnica | CONTEXTO: git estratégico em missão | CAUSA: push rejeitado por non-fast-forward é normal com automations pushando | ACAO_CORRETIVA: git push || (git pull --rebase --autostash && git push); se conflitar: git rebase --abort e relatar; conferir com git log --oneline -3 se o commit local existe antes de re-tentar | CONFIRMADO_POR: fabler
- 2026-07-03 | TIPO: tecnica | CONTEXTO: diagnóstico PM2 | CAUSA: pm2 logs sem --nostream trava o shell da etapa até o timeout | ACAO_CORRETIVA: pm2 logs NOME --lines 30 --nostream; pm2 describe NOME; após QUALQUER mudança de estado: pm2 save; nunca restart/delete em massa | CONFIRMADO_POR: fabler
- 2026-07-03 | TIPO: tecnica | CONTEXTO: escrever arquivo que já funciona | CAUSA: sobrescrever sem backup nem validação já quebrou GatewayCard (faltou }) | ACAO_CORRETIVA: cp arquivo arquivo.bak antes; depois validar: .mjs=node --check, .json=python3 json.load, .ts/.tsx=npx tsc --noEmit; falhou = restaurar o .bak | CONFIRMADO_POR: fabler
- 2026-07-03 | TIPO: tecnica | CONTEXTO: substituição em massa multi-arquivo | CAUSA: sed cego em massa quebra arquivos que não deviam mudar | ACAO_CORRETIVA: 1) grep -rln "padrao" src/ lista alvos; 2) xargs -r sed -i.bak 's/velho/novo/g'; 3) grep de novo pra conferir; 4) remover .bak só depois do typecheck passar | CONFIRMADO_POR: fabler
- 2026-07-03 | TIPO: tecnica | CONTEXTO: arquivo disputado por vários processos (painel-data.json) | CAUSA: escrita concorrente gera conflito/JSON quebrado | ACAO_CORRETIVA: exec 9>/tmp/lock-X; flock -n 9 || desistir; escrever; flock -u 9 — ou simplesmente não tocar em arquivo de automation | CONFIRMADO_POR: fabler
- 2026-07-03 | TIPO: licao | CONTEXTO: tutor-fable smoke-test | CAUSA: path do cerebro.mjs estava quebrado pos-move | ACAO_CORRETIVA: corrigido ../../ARSENAL e integrado no executor | CONFIRMADO_POR: fable-tutor
- 2026-07-03 | TIPO: correcao | CONTEXTO: aula-tutor-2 decisor.mjs | CAUSA: Hermes burlava anti-loop trocando echo-marcador (tsc 4x) | ACAO_CORRETIVA: detector v3 detectarEfeitoRepetido: normaliza comando e bloqueia 3x/6 etapas + escala 2.5-pro | CONFIRMADO_POR: fable-tutor
- 2026-07-03 | TIPO: correcao | CONTEXTO: aula-tutor-2 executor.mjs | CAUSA: ferramenta git interna usava add -A contra a licao da aula 1 | ACAO_CORRETIVA: commit_push com paths explicitos; fallback add -u excluindo painel/ambiente/.bak; rebase autostash com abort seguro | CONFIRMADO_POR: fable-tutor
- 2026-07-03 | TIPO: correcao | CONTEXTO: aula-tutor-2 integracao | CAUSA: cerebro.mjs nunca importado (gap aula 1) | ACAO_CORRETIVA: executor importa cerebro; aprender grava json vivo + ledger ARSENAL | CONFIRMADO_POR: fable-tutor
- 2026-09-20 | TIPO: licao | CONTEXTO: hermes-runtime cat=runtime | CAUSA: - | ACAO_CORRETIVA: FIXED_POINT verifica estado; delta material comprovado capacita Hermes imediatamente via Knowledge-Collector. | CONFIRMADO_POR: hermes

<!-- CENTRALDARK_DHCP_VMWARE_RESERVATION_20261111 -->
- 2026-11-11 | TIPO: tecnica | CONTEXTO: VM CentralDark (VPS da Casa), VMware VMnet8 | CAUSA: DHCP foi confundido com IP necessariamente variavel | ACAO_CORRETIVA: distinguir cliente DHCP de reserva por MAC; no VMware vmnetdhcp.conf foi verificado MAC 00:0c:29:94:7b:51 com fixed-address 192.168.35.130, gateway 192.168.35.2; conferir reserva, MAC, rota e lease antes de concluir estabilidade; nao confundir VPS da Casa com VPS externa | CONFIRMADO_POR: leitura Windows SEGREDO + SSH openkylin-vm + arquivo VMware; estado historico, nao monitoramento continuo
<!-- /CENTRALDARK_DHCP_VMWARE_RESERVATION_20261111 -->


### CENTRALDARK_IA_INTELIGENCIA_PROVA_SEM_DIVIDA_20261111 — Aprendizado operacional (2026-11-11)

**Princípio do CHEFE:** Uma IA não demonstra inteligência só porque encontra uma solução. Ela precisa reconhecer o que já existe, distinguir hipótese de prova, corrigir seus próprios desvios e continuar sem criar dívida.

**Receita reutilizável:** recuperar intenção e owner existente → observar estado atual → separar hipótese, evidência e prova → aplicar menor delta autorizado → corrigir desvios encontrados → contraprova e readback → registrar aprendizado e NEXT_CURSOR. Não declarar dívida resolvida, sincronização ou runtime validado sem evidência específica. Reutilizar o contrato operacional SOL e os owners existentes; não criar executor, cérebro ou documento paralelo.

**Escopo da evidência:** este registro comprova a incorporação documental do princípio; não comprova, por si só, reconciliação dos HEADs locais nem solução de MCP/OAuth em execução.

<!-- CENTRALDARK_VMWARE_SSH_ROUTE_CONTRAPROVA_20261111 -->
### 2026-11-11 — Rota SSH VMware comprovada; distinta do WSL2

- Intencao: reutilizar o owner SSH existente e evitar confundir rotas da VM VMware e do WSL2.
- Ambiente: alias openkylin = WSL2 via ProxyCommand; alias openkylin-vm ou CentralDark-OS-VM = VMware guest CentralDark-OS, porta 22. SSH Windows e SSH guest sao servicos diferentes.
- Fonte operacional: C:\Users\Administrador\.ssh\config_openkylin (ativo do usuario); espelho F:\CentralDark\.ssh\config_openkylin. Preservar config principal e credenciais.
- Teste read-only provado: ssh -F 'C:\Users\Administrador\.ssh\config_openkylin' -o BatchMode=yes -o ConnectTimeout=8 -o ConnectionAttempts=1 openkylin-vm 'hostname; id -un; systemctl is-active ssh'
- Contraprova 11/11/2026: CentralDark-OS / CentralDark-OS / active / SSH_EXIT=0. O IP 192.168.35.130 foi observado; preferir alias a IP codificado.
- Timeout no banner foi intermitente. TCP 22 aberto nao prova SSH autenticado. IPQoS=none funcionou em um teste, mas a causalidade nao foi demonstrada. Nao alterar sshd, firewall ou IPQoS por hipotese.
- Receita canônica existente: .agents/skills/centraldark-operational-method/Skills/centraldark-linux-vmware-rawdisk/SKILL.md e references/RECEITA-KINGSTON-20261103.md. Preservar a historia do WSL2 de 30/10; nao converter prova WSL2 em prova VMware.
- Limite de verdade: SSH_VMWARE=PASS; COCKPIT_HTTP_524=PENDING; OAUTH=UNTOUCHED; FIXED_POINT=PENDING.
<!-- /CENTRALDARK_VMWARE_SSH_ROUTE_CONTRAPROVA_20261111 -->
