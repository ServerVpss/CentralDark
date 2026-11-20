# Receipt — VPS runner body identity PASS

Data BRT: 2026-10-03
Repo CURRENT antes do registro: `main@6f07136b9e24d55976125022ff878a24b2b7cb4a`
Owner reutilizado: `docs/CONSCIENCIA/RECEIPTS/`
PR-mãe ledger: `#1562`

## Claim

```text
VPS_RUNNER_BODY_IDENTITY=PASS
RUNNER_INSTALL_BODY=VPS_REAL
PRIOR_INFERENCE_NOT_VPS=RETRACTED
HOSTNAME_ALONE_IS_NOT_BODY_IDENTITY_PROOF=true
CURRENT_OVER_HISTORY=true
ACTION_IS_PROOF=false
UNKNOWN_IS_NOT_PASS=true
```

## Prova de corpo CURRENT

Medição executada no mesmo corpo em que os runners `centraldark-vps-1..4` foram instalados:

```text
HOST=CENTRALDARK-OS
VIRT=kvm
DMI_PRODUCT=Standard PC (i440FX + PIIX, 1996)
DMI_VENDOR=QEMU
MACHINE_ID_SHA256=c61bd228339394e6631c851e234260a0c5b66359c2b9ed417a5895875fb5b93b
ens18=UP 89.117.78.124/21
default_route=89.117.72.1 dev ens18
tailscale0=100.90.199.124/32
TAILSCALE_IPV4=100.90.199.124
```

A interface `ens18` carregando diretamente `89.117.78.124/21`, junto de KVM/QEMU e da rota default pública, prova que o corpo acessado é a VPS real. O hostname `CENTRALDARK-OS` não distingue, sozinho, VM local de VPS e não pode ser usado como contraprova de localização.

## Correção

A inferência anterior “os runners foram criados fora da VPS” foi produzida a partir de hostname/nome do conector e foi falsificada pela medição de rede/virtualização do próprio corpo.

Portanto:

```text
centraldark-vps-1 = instalado na VPS
centraldark-vps-2 = instalado na VPS
centraldark-vps-3 = instalado na VPS
centraldark-vps-4 = instalado na VPS
```

Este receipt prova **onde os runners foram instalados**. Ele não transforma, por si só, todo job futuro em PASS; assignment e conclusão continuam sendo medidos por run/job quando aplicável.

## Regra reaproveitada

Nenhum aprendizado novo é criado por este receipt. O resultado confirma a regra já existente de que hostname/label não substituem identidade corporal medida. A correção adiciona camada CURRENT sem apagar o histórico da inferência anterior.
