---
name: centraldark-vps-ops
description: Diagnóstico e operação da VPS CentralDark (Segredo-VPS, 89.117.78.124) — verificação de conectividade SSH/HTTP, distinção falha transitória vs host down, inspeção de containers docker, e manutenção não-destrutiva do MANUAL.html#panorama. Use quando o Pivete reportar VPS down, SSH timeout, Builder 404, ou pedir status/evidência da VPS.
---

# centraldark-vps-ops

## Quando usar
- Pivete reporta VPS "caiu", SSH timeout, `builder.centralldark.com` 404/indisponível.
- Pedido de "status da VPS", "evidência de agora", "testa a VPS".
- Necessidade de atualizar `MANUAL.html#panorama` com fatos mecânicos.

## Princípios
1. **Evidência antes de afirmar** — nunca diga "VPS caiu" sem provar camada por camada.
2. **CASA_PRIMEIRO** — diagnóstico local (curl/DNS/TCP) antes de qualquer ação na VPS.
3. **Não assumir host down** — porta 22 fechada ≠ máquina morta.
4. **MANUAL é fonte de verdade** — atualize o bloco automático, nunca a narrativa canônica.

## Fluxo de diagnóstico (camadas)
```bash
# 1. DNS
nslookup builder.centralldark.com

# 2. TCP portas (VPS = 89.117.78.124)
for p in 22 80 443; do timeout 8 bash -lc "</dev/tcp/89.117.78.124/$p" >/dev/null 2>&1 && echo "$p OPEN" || echo "$p TIMEOUT"; done

# 3. HTTP rotas
for u in https://api.centralldark.com/v1/models https://builder.centralldark.com https://status.centralldark.com; do
  curl -k -sS -o /dev/null -w "$u -> HTTP=%{http_code}\n" --connect-timeout 8 --max-time 15 "$u"
done

# 4. SSH real (login, não só porta)
ssh -o ConnectTimeout=10 -o BatchMode=yes Segredo-VPS "uptime; docker ps -a --format 'table {{.Names}}\t{{.Status}}'; systemctl is-active ssh"
```

## Matriz de interpretação
| Sintoma | Causa provável | Ação |
|---|---|---|
| 22 TIMEOUT, 80/443 OPEN | Fail2ban block / transit network / sshd hang | Probe HTTP, re-check SSH após delay |
| SSH recovers c/ uptime preservado | **Transient block** (fail2ban expiry / flap), NÃO host failure | Confirme recovery, não reinicie SO |
| 22+80+443 TIMEOUT | Host down / provider issue | Console web do provedor (VNC/serial) |
| Builder 404, API 200 | Container parado OU rota Caddy não mapeada | `docker ps -a`; checar Caddy route |
| Tool call 404 no provider | Rota do modelo sem suporte a tools | Testar tool simples (`date`); trocar modelo se persistir |

## Distinção Transiente vs Hard Failure (APRENDIDO 27/07)
**Se o SSH volta sozinho enquanto `uptime` mostra dias sem reboot** → é bloqueio transitório (fail2ban expirou ou flap de rede), NÃO falha de host. Prova: `uptime` preservado + `systemctl is-active ssh` = active. Não force restart do SO.

## Manutenção do MANUAL.html#panorama
Arquivo: `E:\CentralDark\Pivete\NUCLEO\MANUAL-SESSAO-19-07-2026\MANUAL.html`
- Só editar fatos mecânicos entre `<!-- STATUS-AUTOMATICO:INICIO -->` e `<!-- STATUS-AUTOMATICO:FIM -->`.
- Nunca sobrescrever a narrativa canônica do Pivete acima do bloco.
- Regenerar com: SSH (porta/TCP/login), uptime VPS, estado `docker ps`, HTTP routes, tool call sanity (`date` → exit 0).
- Usar `patch` mode=replace com o trecho exato do bloco.

## Comandos úteis VPS
```bash
# Containers
docker ps -a --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'
# Subir parado (Exited 137 = OOM kill)
docker start CentralDark-WebUI
# sshd
systemctl restart ssh; systemctl enable ssh
# Firewall (se 22 bloqueado)
ufw allow 22/tcp; ufw reload
```

## Pitfalls
- `curl -k -sS` em MSYS pode dar "client returned ERROR on write" mas `HTTP=%{http_code}` ainda é válido → o code é a prova, ignorar o erro de write.
- Não confundir "porta 22 aberta" com "SSH autentica" → sempre validar com login real (`uptime` via ssh).
- Container `Exited (137)` = OOM kill, não erro de app → verificar RAM antes de subir.
- Tool call 404 do provider NÃO é falha da Lupa → testar `date` para isolar.

## Verificação de conclusão
- [ ] TCP 22/80/443 medido
- [ ] HTTP routes medidas
- [ ] SSH login real (uptime + docker ps) provado OU console do provedor identificado
- [ ] MANUAL.html#panorama atualizado se status mudou
- [ ] Próximo passo declarado (console web / docker start / etc.)
