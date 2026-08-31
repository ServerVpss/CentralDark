# CentralDark Fixed Point Fabric

Pacote plug-and-play que faz Casa, VPS, GitHub e Screenpipe **baterem o mesmo ponto** antes de declarar
convergência. Ele implementa o fluxo:

`!CENTRALDARK → #ACORDAR → !CALIBRAR → RECONCILIAR → CONTRAPROVAR → FIXED_POINT`

## O que resolve

- elimina falso verde de uma única captura;
- exige duas amostras materialmente iguais e recentes;
- transforma Casa/VPS/GitHub/Screenpipe em um único snapshot verificável;
- mantém Screenpipe como sensor read-only;
- impede `UNKNOWN → PASS`;
- registra eventos em SQLite/WAL com cadeia SHA-256;
- usa lease para um único escritor por escopo;
- redige tokens, senhas e chaves antes de persistir;
- fornece dashboard local, CLI, serviço VPS, instaladores Windows/Linux e testes de contraprova.

## Plug rápido

### Windows / Casa

```powershell
Copy-Item config/centraldark.fixed-point.example.json config/centraldark.fixed-point.json
$env:CENTRALDARK_HOME = 'E:\CentralDark\Pivete\CentralDark'
$env:CENTRALDARK_VPS_HEARTBEAT_URL = 'http://127.0.0.1:9119/health'
$env:CENTRALDARK_HEARTBEAT_SECRET = '<secret-store>'
$env:GITHUB_TOKEN = '<secret-store>'
./deploy/windows/install.ps1
centraldark-fp --config config/centraldark.fixed-point.json watch
```

### Linux / VPS

```bash
sudo ./deploy/linux/install.sh
sudo systemctl enable --now centraldark-vps-heartbeat.service
```

### Dashboard

```bash
centraldark-fp --config config/centraldark.fixed-point.json dashboard --port 8788
```

Abra `http://127.0.0.1:8788`.

## Prova antes de main

```bash
python -m unittest discover -s tests -v
centraldark-fp --config config/centraldark.fixed-point.json verify-chain
```

O exit code de `watch` é `0` apenas com fixed point; `3` significa reconciliação necessária.
No repositório CentralDark, o workflow usa o runner canônico `[self-hosted, Linux]`; alterar o runner
reinicia a prova porque receipts de outro ambiente não valem para o novo HEAD.

## Tamanho

O pacote de código é pequeno de propósito. Inflar o ZIP para 50–100 MB não aumenta confiabilidade.
Quem cresce é o banco de evidências local e o armazenamento do Screenpipe, nunca o Git nem o ZIP.

## Integração no CentralDark

Copie a pasta para `apps/modulos/fixed-point-fabric/` e registre
`contracts/FIXED-POINT-FABRIC.yml` no Trigger Fabric. O contrato declara explicitamente que ele
**estende** o MEGAZORD/Screenpipe/fixed-point existentes; não cria um sistema paralelo.
