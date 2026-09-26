# Estado atual e pendências — pós congelamento

## ESTADO

```text
Protótipo Fase 1 congelado e retirado do NÚCLEO ativo.
```

## BACKUP

```text
E:\CentralDark\backups\HERMES-PROTOTIPO-FASE1-CONGELADO-2026-07-18-010848.zip
```

## HASH

```text
SHA256=04B7E794722BDCF6F832E12E5D400BBE5D26E76F0B89DD546FEDDC611BE93E5A
size_bytes=385710
entries=101
sidecar=HERMES-PROTOTIPO-FASE1-CONGELADO-2026-07-18-010848.sha256.txt
```

## PROVA DE RESTAURAÇÃO

```text
PASS
restore_dir=%TEMP%\hermes-prototipo-fase1-restauracao\
status_exit=0
unittest_exit=0
tests=28 OK
```

## PRESERVADO

- visão (`00`, `01`, `02`, `README`, `SKILL`)
- estrutura `motor/01`–`10`
- Técnica da Lupa Premium
- Registro do Ouro
- Plano por fases
- Estado atual
- Revisão canônica
- VERSION / MANIFESTO (regenerado pós-limpeza)
- docs conceituais por pasta (identidade, memória, segurança, etc.)

## REMOVIDO DO ATIVO

- `motor/05-hermes/runtime/` (pacote hermes experimental)
- `motor/05-hermes/configuracao/` experimental (agentes/config)
- `motor/03-memoria/dados/hermes.db` (+ WAL/SHM se existirem)
- `motor/06-ferramentas/testes/` (suite protótipo)
- `motor/06-ferramentas/iniciar-local.bat` / `iniciar-com-voz.bat`
- `motor/04-voz/audio/inicializacao.wav` experimental
- `motor/10-observabilidade/logs/` gerados
- caches `__pycache__` / `*.pyc`

## PENDÊNCIA

Definir a **especificação** do Hermes definitivo antes de implementar código novo.

## PRÓXIMA AÇÃO

Desenhar o contrato da **Fase 2** com o Pivete (especificação, não código).

Não pular para VPS.
