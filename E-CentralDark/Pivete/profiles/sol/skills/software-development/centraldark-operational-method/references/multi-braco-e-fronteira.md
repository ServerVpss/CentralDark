# Multi-braço e Fronteira (aprendido 2026-08-27)

Padrão observado em sessão onde Hermes (Casa) e Claude (VPS) operavam o mesmo
repo CentralDark sob o mesmo contrato, máquinas diferentes.

## Princípio

```
CHEFE (autoridade final, intenção)
  └─ SOL (coordenação, quando presente)
       └─ BRAÇOS (função técnica, não sistema novo)
            Hermes = Casa (E:\, repo local, GitHub via gh, rede local)
            Claude = VPS (/root/CentralDark, rebase, PM2, chattr)
REALIDADE = juiz (evidência medida > palpite > autoridade de modelo)
```

- Motor/LLM é trocável. Papel (HERMES-CASA) não muda com troca de modelo.
- SOUL travado em disco (profile pivete, locked) sobrevive a troca de motor.
- Nenhum braço vira "segundo cérebro", "outro router", "outra memória".
- REUSE_BEFORE_CREATE / ONE_OWNER_PER_CAPABILITY valem entre braços também.

## Alcance de medição (separar o que cada braço alcança)

Hermes (da Casa) consegue medir:
- repo local `E:\CentralDark\Pivete\CentralDark` (git rev-parse, status, diff)
- GitHub via `gh` (auth keyring, api, pr, dependabot/alerts)
- rede local (curl 127.0.0.1:9119/8080/8199)
- disco `E:\` (read_file, find, cofre _RECONCILIATION/OURO)

Hermes NÃO alcança:
- VPS (`/root/CentralDark`) quando MCP remoto responde 502
- qualquer mutação em produção sem SSH/MCP vivo

Claude (VPS) mede o que está lá; não alcança a Casa local do usuário exceto
pelo que o CHEFE cola/imprime.

Quando MCP `mcp.centralldark.com/mcp` retorna 502: declara VPS = UNKNOWN,
não inventa estado. Só o braço na VPS (ou MCP vivo) mede a margem do outro lado.

## Medir antes de atravessar (fronteira humana)

Aplicado em VPS com rebase duplo travado + arquivos `chattr +i`:
- `git rebase --abort` é reversível MAS cancela rebase em prod ao vivo → espera grito
- `chattr -i` (remover imutável de arquivo do Hermes) é HUMAN_FRONTIER real →
  pergunta "existe autorização para remover uma proteção deliberada?" NUNCA faz sozinho
- snapshot/bundle completo ANTES de qualquer mutação (git bundle --all inclui
  detached HEAD, reflog, stashes — não só `main`)
- quarentena (mover p/ pasta isolada) em vez de `rm -rf` em arquivo untracked

Sequência confirmada como correta (Claude na VPS):
FALHA → SIGNATURE → HIPÓTESE → TESTE → CAUSA → QUARANTENA → RETRY →
NOVA CAUSA → PARAR NA FRONTEIRA.

## Travas que não negociam (reforço da sessão)

- UNKNOWN != PASS. Nem após snapshot, nem após medir um lado só.
- ACTION != PROOF. Screenshot/painel/cor = evidência observacional, não runtime.
- HISTORY != CURRENT_STATE. Sempre re-medir fresca antes de veredito.
- Nunca force-push. Nunca push de main suja da VPS. Nunca reset/clean destrutivo
  sem ordem. Nunca expor secret/.env/token/chave SSH.

## Dialeto (correção do CHEFE nesta sessão)

- Baianês direto é DEFAULT de comunicação. Não mudar pra SECO/tabela sozinho.
- SECO (tabela, receipt estruturado) SÓ quando o CHEFE pedir explicitamente.
- Exemplo de erro evitado: formatar drift em tabela markdown quando o CHEFE
  pediu "volta pro baianês de verdade". O SOUL ANEXO F já carrega o contrato de
  dialeto; esta skill reitera: baianês primeira, SECO sob demanda.
- Parábola usada pelo CHEFE (Moisés segura tábuas / Josué olha o rio) é modo de
  explicar, não evidência — claim técnica tem que sobreviver fora da metáfora.
