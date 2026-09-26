# Destino do Ouro + Jaula Claude — condensado operacional

## Onde gravar o ouro (CHEFE definiu)
Canônico NÚCLEO Hermes:
`E:\CentralDark\_RECONCILIATION\OURO\FONTE_PIVETE_COMPLETO\NUCLEO\motor\10-observabilidade\`
- `VEREDITO-<topic>-YYYY-MM-DD.md` — provas materiais
- `<asset>.png` — decodificado, SHA confirmado
- `REGISTRO-DO-OURO.md` — append da entrada (nunca sobrescrever o arquivo)

Alternativo (quando alvo fora do NÚCLEO): `E:\CentralDark\workspace\sol\<pasta>\`

## Jaula Claude (papagaio na gaiola)
Arquivos de permissão conhecidos:
- `C:\Users\danda\.claude\settings.json` (global)
- `E:\CentralDark\Pivete\CentralDark\.claude\settings.json` (projeto)
- `E:\CentralDark\Pivete\relquia-worktree\.claude\settings.json`
- `.claude.json` (70KB global — projects[] geralmente clean, olhar se tem `Bash(*)`)

Padrão de tranca:
```json
"permissions": {
  "allow": [ "Bash(gh pr view:*)", "Bash(gh api repos/*/pulls/*)" ],
  "deny": [
    "Bash(node -e*)", "Bash(curl *|sh)", "Bash(wget *|sh)",
    "Bash(rm -rf*)", "Bash(*--no-verify*)", "Bash(gh api '*--delete*')"
  ]
}
```
Sempre validar JSON após patch (node -e "JSON.parse(require('fs').readFileSync(...))").

## Matar processo (quando autorizado PERMITO SEGREDO ! N)
```bash
taskkill /F /IM claude.exe
taskkill /F /T /PID <pid>          # tree kill
wmic process where "name='claude.exe'" delete
wmic process where "processid=<pid>" delete   # força pai que trava filho
```
Se "Acesso negado": o processo é filho de `code.exe`/`codex.exe`/`explorer`
com token diferente — matar o PAI via wmic quebra a árvore.
Hermes NUNCA tocar (processos hermes.exe ficam vivos).

## Regra de ouro do CHEFE sobre execução
Ordem clara e não destrutiva → EXECUTA, não pergunta.
Destrutivo / V4 / Produção / VPS / Segredo → autorização específica ainda exige.
