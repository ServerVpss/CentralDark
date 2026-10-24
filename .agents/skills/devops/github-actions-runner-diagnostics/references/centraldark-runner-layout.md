<!--
Descrição: Layout conhecido dos runners auto-hospedados do CentralDark.
Não é genérico — é sobre a caverna desse repositório.
-->

# Layout de Runners do CentralDark

Ref: `github-actions-runner-diagnostics`.

## Runners conhecidos

| ID  | Nome                        | Status   | Observação                          |
|-----|-----------------------------|----------|-------------------------------------|
| 22  | vmi3256920                  | online   | Principal; pode estar busy.         |
| 2   | vmi3256920-centraldark     | offline  | Secundário; investir em deixar UP. |

## Padrão observado mais comum

- `vmi3256920` (id 22) online + busy → ocupado com outro job.
- `vmi3256920-centraldark` (id 2) offline → indisponível.
- Resultado: jobs `queued` sem dispatch até o runner livre ou o secundário
  subir.

## Flags do workflow que bloqueiam fallback

- `GITHUB_HOSTED_RUNNER_ALLOWED=0`
- `ROTA_FALLBACK=BLOCKED_NO_HOSTED`

Quando ambos estão como acima e o `runs-on` é `[self-hosted, ...]`, não há
saída automática para um runner hospedado. O fix é no VPS.

## Ação mínima recomendada

Subir o secundário (`pm2 start centraldark-runner-secondary` ou equivalente)
antes de depender apenas do principal ocupado.

## Como verificar

```bash
gh api repos/ServerVpss/CentralDark/actions/runners \
  --jq '.runners | [.[] | {id, name, status, busy}]'
```

Recarregar antes de decidir — estado muda.

## Quando este arquivo não se aplica

Em qualquer repositório fora do `ServerVpss/CentralDark`, consultar o
layout de runners dele via o mesmo `gh api .../actions/runners`.

## Rota automática atual — 2026-10-24

O wake owner existente `.github/workflows/vps-wake-hosted-ssh.yml` é acionado em PR/push e pode acordar somente a unit VPS canônica via SSH com fingerprint ED25519 pinado. A porta `porta-de-entrada.yml` continua self-hosted. A exceção hosted serve apenas para recovery, não para executar testes, handlers da PR ou deploy.

A causa documentada de billing continua relevante: se o runner hosted não iniciar, não há transporte SSH executado e o gate fica `queued`. Esse estado não é PASS.