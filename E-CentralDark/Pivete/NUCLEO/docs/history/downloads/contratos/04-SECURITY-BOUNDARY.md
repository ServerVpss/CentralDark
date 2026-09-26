# SECURITY BOUNDARY

## Sempre quarentenar / nunca cristalizar bruto

- `.env`
- API keys
- passwords
- access/refresh tokens
- cookies
- auth/session blobs
- browser `Login Data`
- chaves SSH
- private keys
- credential databases
- dados de autenticação equivalentes

## Browser

O pipeline deste pacote **não abre** banco de credenciais e **não extrai** sessão autenticada do perfil do navegador.

Entradas aceitas:
- export explícito;
- HTML salvo;
- JSON Recorder;
- screenshot;
- texto/DOM fornecido pela superfície;
- telemetria sem segredo.

## Política

```text
SECRET_DETECTED -> SENSITIVE_QUARANTINE
RAW != CANONICAL
RAW_LOCALSTATE -> DO_NOT_COMMIT
DETECT != DELETE
EXTERNAL_SOURCE != AUTHORITY
```
