# CentralDark — Instinto Superior

Corpo visual final da CentralDark. Este repositório reúne a landing trilíngue, autenticação Supabase, sala administrativa, cockpit de estado, comparação de repositório, Hermes, exportação e inventário do roteador.

## Autoridade e publicação

- Código visual canônico: `ServerVpss/CentralDark/public/central-dark-instinct-2`.
- Contratos, runtime, governança e código visual convergem no mesmo repositório: `ServerVpss/CentralDark`.
- `ServerVpss/centraldark-instinto-superior` + Lovable: projeção/editor compatível; não são segunda autoridade nem owner paralelo.
- URL conhecida: <https://centraldark-instinto-superior.lovable.app>.

Uma URL conhecida ou uma sincronização declarada não prova que o HEAD está publicado. O cockpit só promove deploy quando consegue medir e comparar os SHAs; ausência de fonte aparece como `UNKNOWN`.

## Desenvolvimento

Requer Node.js 22 e npm.

```sh
npm ci
npm run lint
npm run build
npm run dev
```

## Rotas materiais

- `/`: corpo visual e doutrina.
- `/auth` e `/auth/callback`: e-mail/senha e OAuth PKCE.
- `/reset-password`: recuperação e troca de senha.
- `/cockpit`: entrada e estado público sem fingir runtime.
- `/sala-controle`: superfície autenticada e autorização administrativa real.
- `/repositorio`: leitura e comparação estrutural determinística do GitHub.
- `/roteador`: capacidades declaradas do Omni Router e probes vivos separados.

Veja `docs/CONVERGENCIA-CAPACIDADES-2026-09-25.md` para a matriz de reaproveitamento.
