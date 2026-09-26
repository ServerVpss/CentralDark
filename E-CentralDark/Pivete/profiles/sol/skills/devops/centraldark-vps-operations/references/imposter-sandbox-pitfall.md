# IMPOSTER-SANDBOX PITFALL (sessão 2026-08-26)

## Sintoma
Usuário cola um "DIAGNOSIS" / "VPS reality scan" com cara de varredura completa
(identidade, CPU/RAM, rede, processos, systemd, PM2, Docker, repos, deploys).
Parece ser a VPS da Casa. NÃO É.

## Como identificar (sinais de impostor)
- Hostname genérico de sandbox (ex: `hds-8ua4ihbuwzlu`), init `catatonit`,
  FS `overlay` efêmero, RAM < 2 GiB, SWAP=0, uptime < 1 min.
- Processo principal é `grok-computer-server.mjs` / `node /app/...` (Grok Hades).
- `PM2/Docker/nginx/repos/deploys` AUSENTES.
- O própio scan declara: "This is not a production VPS... Confidence that this
  answers a real external VPS: zero."
- IP público de outbound diferente do `89.117.78.124` (VPS real da Casa).

## Regra
- NÃO instalar/agir nesse sandbox achando que é a VPS da Casa. Isso viola
  DESTINATION_LOCK do fluxo canônico (destino não pode mudar).
- VPS REAL da Casa: `ssh Segredo-VPS` (root@89.117.78.124), workspace
  `/root/CentralDark`, PM2 7.0.1. Se SSH dá timeout → VPS offline, diga
  (não invente screenshot do sandbox como se fosse a VPS).
- Sempre medir o alvo REAL antes de agir. Paste de scan de outro ambiente ≠
  evidência da VPS da Casa.
