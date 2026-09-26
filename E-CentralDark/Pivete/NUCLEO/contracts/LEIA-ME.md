# CONTRATO - LEIA-ME.md
**Origem:** E:\\CentralDark\\_MAPA_CASA\\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.extracted_CentralDark_Fluxo_Bidirecional_Auditoria_RECUPERADO_2026-08-24\CentralDark_Fluxo_Bidirecional_Auditoria_RECUPERADO_2026-08-24\LEIA-ME.md
**SHA:** 322274ca2375ce11
**Timestamp:** 2026-08-26T19:43:49.540243
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- Regra:

### Ouro Bruto (primeiros 5000 chars)
```
# CentralDark — Fluxo Bidirecional / Auditoria Recuperada

**Data de recuperação:** 2026-08-24

Este pacote recupera a continuidade do pacotão de auditoria/reconciliação da Casa.

## Identidade histórica preservada

O pacote histórico identificado era:

- `CentralDark_Fluxo_Bidirecional_Auditoria_2026-07-28.zip`
- SHA-256 histórico registrado: `1583fad27aadc477827bb0d57746b0a962439add16a17ad221a512aa187c2bfc`
- 71 arquivos registrados historicamente.

Este ZIP recuperado **não afirma ser byte-a-byte igual ao histórico**. Ele preserva a intenção, os owners conhecidos, os gaps já identificados e incorpora a auditoria local read-only atual.

## Fluxo canônico

`RECUPERAR → ENTENDER → RECONCILIAR → LOCALIZAR O OWNER REAL → REUTILIZAR → COMPLETAR SOMENTE GAP PROVADO`

Contratos:

- `LOCAL_FIRST=true`
- `DEPLOY=false`
- `PUBLICATION=false`
- `ONE_SYSTEM_ONLY=true`
- `REUSE_BEFORE_CREATE=true`
- `SERIALIZE_MUTATION=true`
- `ONE_WRITER_PER_SCOPE=true`
- `UNKNOWN != PASS`
- auditoria inicial = **READ_ONLY**

## Casa

`E:\CentralDark` é o mapa/casa alvo da reconciliação, mas isso **não autoriza mover cegamente** tudo que estiver fora dela.

Devem ser medidos e classificados, entre outros:

- `C:\Users\danda`
- `E:\Users\danda`, se existir
- AppData / Local / LocalLow / Roaming
- `C:\CentralDark`, se existir
- perfis/runtime de ferramentas
- junctions, symlinks, Git roots e consumidores reais

Regra:

`PATH_FOUND != PATH_ACTIVE != DEVE_SER_MOVIDO`

Mover somente material portátil depois de contraprova. Estado de aplicativo não-portátil permanece onde o consumidor exige, com referência canônica quando necessário.

## GitHub ↔ Casa

A sincronização só começa depois da classificação local:

`medir → classificar → absorver delta útil → provar → reconciliar Casa ↔ GitHub`

Não executar pull/push/reset durante a fase de descoberta.

```