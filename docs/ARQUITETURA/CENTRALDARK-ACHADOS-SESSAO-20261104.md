# Achados medidos — sessao 2026-11-04

Achados lidos direto do codigo nesta sessao. Nao passaram por VPS, deploy ou runtime.
Todos foram buscados no `docs/` e voltaram **0 resultados** — nao constam no caderno.

Numeracao provisoria: **#57 a #59**.

> **Ressalva declarada:** o `docs/PENDENCIAS.md` nao abre completo por estas ferramentas —
> trunca na leitura direta e nao e indexado para busca. O miolo **#6 a #56 nao foi lido**.
> Se algum dos tres ja existir la, o numero colide e o item deve ser fundido, nao duplicado.

---

## 🔴 #57 — `.ssh/` versionado com arquivos reais

**Status:** medido, nao corrigido
**Sintoma:** o diretorio `.ssh/` esta versionado no repositorio com **9 arquivos reais**, nao
placeholder. Conteudo medido na arvore da raiz:

```
.ssh/.codex_gpt55_autoraise_notice
.ssh/Ativar-SSH-Casa.cmd
.ssh/Ativar-SSH-Casa.ps1
.ssh/ativar-centraldark-ssh.ps1
.ssh/config
.ssh/config.centraldark-pre-vpn-20261018
.ssh/config_openkylin
.ssh/known_hosts
.ssh/known_hosts.old
```

**Por que importa:** `known_hosts` e `config` de SSH num repositorio privado com historico longo
significam que a topologia de acesso a Casa e a VPS esta registrada em git. Um `config` de SSH
costuma carregar `HostName`, `User`, `IdentityFile` e `ProxyJump` — ou seja, o caminho de entrada.
Alem disso, 4 dos arquivos sao **launchers** (`.ps1` / `.cmd`) que ativam a conexao.

**Achado secundario de nomenclatura (mesmo diretorio):** `Ativar-SSH-Casa.ps1`,
`Ativar-SSH-Casa.cmd` e `ativar-centraldark-ssh.ps1` violam as regras 1 a 3 do
`docs/PADRAO-NOMENCLATURA-CENTRALDARK.md` (maiuscula + espaco implicito no padrao PT).

**Como fechar:**
1. Rotacionar qualquer chave referenciada por esses arquivos (a decisao e do CHEFE — nao executar
   rotacao sem autorizacao explicita).
2. Mover os launchers para `scripts/windows/` (owner existente) ou `_archive/v2026-11-04/`.
3. Decidir se `config` e `known_hosts` saem do versionamento ou viram `.example` sanitizado.
4. Registrar a decisao no `docs/CONSCIENCIA/04-ESTRUTURA-VPS.md`.
5. Confirmar que o historico nao expoe mais nada.

**Precedencia:** este item **precede a estetica**. Nao entra em lote de renomeacao.

`ACTION != PROOF` — nada foi removido nem rotacionado.

---

## 🔴 #58 — Runner self-hosted sem fallback (`BLOCKED_NO_HOSTED`)

**Status:** diagnosticado, medido no PR #1977
**Sintoma:** todo workflow critico roda em runner self-hosted e **nao existe fallback**.
Lido em `.github/workflows/centraldark-validate.yml`:

```yaml
runs-on: [self-hosted, Linux]
```

E o receipt de cada um dos 4 jobs declara literalmente:

```
ROTA_PRIMARIA=self-hosted-linux
ROTA_FALLBACK=BLOCKED_NO_HOSTED
```

Quando o self-hosted nao pega o job, o resultado e **`RESULTADO=BLOCKED`**, nao "queued" nem
"pending". O pipeline esta desenhado para **bloquear**, nao para degradar.

**Medicao que sustenta:** no PR #1977, dos **39** check runs — **22 em `skipped`, 0 em `success`**.
No PR #1978, **90** check runs com **0 em `success`** na leitura parcial de 50.

**Agravante:** `concurrency: cancel-in-progress: true`. Cada push novo cancela o run anterior.
Com 5 commits no mesmo PR, o HEAD pode nunca ter tido run limpo — e os `cancelled` observados
nao sao falha do diff.

**Como fechar:**
1. Confirmar se existe runner self-hosted ativo e registrado no repositorio.
2. Se nao existir, declarar `ROTA_FALLBACK` para runner hospedado nos jobs que **nao** tocam a VPS.
3. Manter self-hosted **apenas** nos jobs que exigem acesso a VPS/Casa (decisao de seguranca).
4. Revalidar no mesmo HEAD.

**Nao confundir:** o jobs `fork_guard` bloqueia HEAD de fork de proposito. Isso e correto e nao
entra neste item.

`TOOL_LISTADO != TOOL_ATIVO`

---

## 🟡 #59 — `wabot.env` e o unico cofre fora de `secrets/`

**Status:** medido, nao movido
**Sintoma:** de 4 cofres que os emissores Telegram leem, um esta fora do diretorio canonico.
Lido em `scripts/guarda/guarda-telegram.sh`:

```bash
ENV_FILE="/root/Multizap/secrets/wabot.env"
```

| Emissor | Cofre | Fora de `secrets/`? |
|---|---|---|
| `notify-telegram.sh` | `secrets/.env`, `secrets/telegram-alerts.env`, `secrets/mcp.env` | nao |
| `guarda-telegram.sh` | `/root/Multizap/secrets/wabot.env` | **SIM** |
| `vps-healthcheck.mjs` | env do workflow (GitHub Secrets) | n/a |

**Por que importa:** o `docs/CONSCIENCIA/13-COFRE-SECRETS-CENTRALIZADO.md` e
`14-COFRE-SECRETS-CENTRALIZADO.md` tratam o cofre centralizado como regra. Um quarto cofre
fora da arvore canonica significa que a varredura de rotacao e de auditoria tem ponto cego.

**Como fechar:**
1. Decidir o owner do cofre (o `guarda` ou o `secrets/` central).
2. Migrar `wabot.env` para `/root/CentralDark/secrets/` mantendo o nome.
3. Manter `ENV_FILE` apontando para o caminho canonico **antes** de remover o antigo.
4. Provar com a leitura do novo caminho e um ciclo real do `guarda-telegram.sh`.

`UNKNOWN != PASS` — nao se sabe quantas chaves vivem nesse cofre.

---

## Referencia cruzada — ja documentado, NAO e pendencia nova

Dois achados desta sessao **ja tem owner no proprio repo** e nao devem virar item:

| Achado | Owner que ja documenta |
|---|---|
| `notify-telegram.sh` morre calado (`exit 0` sem `ADMIN_CHAT_ID`) | `docs/CONSCIENCIA/PADRAO-CARD-HERMES.md` — declara que a rota e o connector Telegram (`sendMessage`), e que o `notify-telegram` exige `NOTIFY_API_KEY` e falha |
| Notificacao automatica ao fim de cada resposta | `docs/CONSCIENCIA/PROTOCOLO-INICIALIZACAO.md` — hook `Stop` em `.claude/settings.json`, script `scripts/notify-claude/notify-telegram.sh`, cofre `secrets/telegram-alerts.env` |

O que falta nesses dois **nao e codigo** — e a chave `ADMIN_CHAT_ID` presente no cofre da VPS.

---

`REALIDADE = JUIZ` · `ACTION != PROOF` · `HISTORY != CURRENT_STATE`
