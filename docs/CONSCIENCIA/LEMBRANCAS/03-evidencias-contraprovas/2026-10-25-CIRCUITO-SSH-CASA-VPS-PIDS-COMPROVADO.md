---
title: 'Memória comprovada: circuito SSH reverso Casa ↔ VPS e leitura de PIDs'
date: &id001 2026-10-25
tags:
- lembrancas
- casa
- vps
- ssh
- tailscale
- pids
- hermes
- one-shot
- cristal
status: PASS_ESCOPO_PID_SOMENTE_LEITURA
owner: scripts/casa/CentralDark-VPS-Casa-PID-OneShot.ps1
data_criacao: *id001
ultima_atualizacao: '2026-10-27T00:13:58.762720'
ultima_modificacao: '2026-10-27T00:13:58.762720'
ultima_verificacao: '2026-10-27T00:13:58.762720'
fuso_horario: America/Sao_Paulo
hash_conteudo: 6ba160225cd76d306d8d7f0f3684334588afd2d6c3f21280bd5bad64600c459c
rastro:
- acao: criacao_com_metadados_vivos
  timestamp: '2026-10-27T00:13:58.762720'
  autor: kimetsu_remix_autonomo
  detalhe: Adicionadas 10 propriedades obrigatorias da regra Atualizacao Viva
grupo_notas: 03-evidencias-contraprovas
relacionado_a: []
estado_evidencia: PENDING
---
# Casa ↔ VPS — circuito SSH reverso comprovado

## Lembrar antes de investigar de novo

O acesso **Casa → VPS** já existia pelo alias `segredo-vpss`. O acesso **VPS → Casa** foi comprovado pela identidade SSH **já existente** `/root/.ssh/segredo_vps_ed25519`. O teste na VPS alcançou `segredo\administrador` na Casa e leu processos Windows via `Get-Process`. O script permanente `K:\scripts\casa\CentralDark-VPS-Casa-PID-OneShot.ps1` repetiu o caminho com `VPS_TO_CASA_PID=PASS COUNT=545` e `EXIT=0`.

Acesso remoto real **não depende** do Desktop Commander para essa rota: `OpenSSH + Tailscale` bastam para a leitura comprovada. Não confundir isso com capacidade geral de automação Windows, permissões administrativas de mudança, controle de GUI ou sincronização Obsidian.

## O obstáculo exato

- Primeiro erro: `Host key verification failed`. Corrigido com fingerprint ED25519 da Casa validado antes de persistir `known_hosts`. Não usar `StrictHostKeyChecking=no`.
- Segundo erro: `Permission denied`. A VPS possuía a chave correta, mas não a selecionava sem `-i /root/.ssh/segredo_vps_ed25519 -o IdentitiesOnly=yes`.
- A Casa usa `Match Group administrators` e `administrators_authorized_keys` com a pública `segredo-vps-windows`; conta remota observada: `segredo\administrador`.
- Houve uma tentativa de pipeline PowerShell interpretada por Bash; não era defeito de rede. O comando simples `Get-Process` forneceu readback real.

## Receita recuperável

**Cristal aprovado na main:** [one-shot](../../../scripts/casa/CentralDark-VPS-Casa-PID-OneShot.ps1).
**Prova histórica:** [receipt](../../RECEIPTS/CENTRALDARK-SSH-VPS-CASA-PIDS-ONESHOT-20261025.md).
**Lição operacional:** [Aprendizados — SSH reverso](../APRENDIZADOS/2026-10-25-SSH-REVERSO-CASA-VPS-ONESHOT-REUSO.md).
**Método vivo:** [skill-mãe](../../../.agents/skills/centraldark-operational-method/SKILL.md).

No PowerShell da Casa:

```powershell
powershell.exe -NoProfile -File K:\scripts\casa\CentralDark-VPS-Casa-PID-OneShot.ps1
```

**Aguardar resultado material:** `VPS_TAILSCALE=PASS`, `REUSED_KEY=PASS`, `VPS_TO_CASA_SSH_AUTH=PASS`, `VPS_TO_CASA_PID=PASS` e saída 0. Contagem é transitória, não número fixo.

## O que NÃO se conclui

`PID_READBACK_PASS != PROCESS_CONTROL_AUTHORIZED`.
`CASA_VPS_SSH_PASS != GLOBAL_BIDIRECTIONAL_SYNC_PASS`.
`SOURCE_PRESENT != CURRENT_RUNNING`.

Não duplicar chaves, serviços, arquitetura, gateway ou outro Hermes. Não guardar senhas/chaves privadas no Obsidian/GitHub. Para qualquer mudança de escopo, aplicar Kimetsu, owner único, teste, receipt e novo aceite conforme a intenção.

**NEXT_CURSOR:** conservar e consultar a prova antes de novo diagnóstico SSH; usar o mesmo one-shot quando a intenção for verificar acesso da VPS aos PIDs da Casa.
