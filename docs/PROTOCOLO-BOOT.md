# 🔑 PROTOCOLO DE MEMÓRIA E CONTINUIDADE — CentralDark

> Ritual complementar de memória, pendências, estado vivo e encerramento de sessão.
> Criado: 2026-07-07 · Dono: Pivete · Status: OFICIAL COMO COMPLEMENTO
>
> **Não é mais a porta universal nem substitui o BOOT operacional.**
> Antes de usar este protocolo, toda IA deve seguir:
>
> ```text
> 00-COMECE-AQUI-IA.md
> → AGENTS.md
> → docs/GOVERNANCA/HIERARQUIA-INSTRUCOES-IA.md
> → docs/GOVERNANCA/BOOT-IA.md
> ```
>
> Para branch, edição, commit, push, deploy, auditoria, risco e rollback, prevalece `docs/GOVERNANCA/BOOT-IA.md`.

---

## 1. Prompt Âncora de memória — executar depois do BOOT operacional

Use quando as ferramentas MCP correspondentes estiverem disponíveis:

```
🔑 CONTINUIDADE CENTRALDARK — execute depois do BOOT operacional:
1. kit_boas_vindas (MCP CentralDark)
2. Ler docs/PENDENCIAS.md
3. Ler docs/CONSCIENCIA/APRENDIZADOS.md
4. Ler docs/CONSCIENCIA/09-ESTADO-ATUAL.md
5. Devolver em 5 linhas: estado da VPS + pendência
   mais quente + o que herdou da última sessão

REGRAS: ciclo Ler→Perguntar→Agir→Registrar.
Zero enrolação. Modelo mais barato que resolve.
NO FIM da sessão: gravar o ouro com
registrar_aprendizado antes de encerrar.
```

Se uma ferramenta MCP estiver indisponível ou com credencial expirada, informe claramente. Não invente dados e não trate a falha do MCP como autorização para pular o BOOT operacional.

## 2. Ritual de saída (sem isso a próxima IA herda NADA)

- `registrar_aprendizado` — erro+correção, atalho, regra ou armadilha da sessão
- `consolidar_pensamento` — se aprendeu algo sobre como o Pivete pensa
- `fechar_pendencia` — se resolveu item do PENDENCIAS.md
- `atualizar_painel` — se concluiu tarefa (status.centralldark.com)

**Boot sem depósito = amnésia com cerimônia.**

O ritual de saída não autoriza commit automático inútil, exposição de segredo ou alteração em produção. Deve respeitar `AGENTS.md` e o fluxo DEV → Auditoria → Main.

## 3. Mapa do tesouro (onde cada coisa mora)

| O quê | Onde | Tool MCP |
|---|---|---|
| Porta universal das IAs | `00-COMECE-AQUI-IA.md` | leitura GitHub |
| Regra universal | `AGENTS.md` | leitura GitHub |
| BOOT operacional | `docs/GOVERNANCA/BOOT-IA.md` | leitura GitHub |
| Hierarquia das instruções | `docs/GOVERNANCA/HIERARQUIA-INSTRUCOES-IA.md` | leitura GitHub |
| Regras de conduta legadas/complementares | (injetadas) | `injetar_consciencia_centraldark` |
| Consciência mestra | docs/CONSCIENCIA/CONSCIENCIA.md | `ler_consciencia` |
| Pendências (fonte única) | docs/PENDENCIAS.md | `ler_pendencias` |
| Aprendizados (eterno) | docs/CONSCIENCIA/APRENDIZADOS.md | `puxar_aprendizados` |
| Lembranças (30 dias) | docs/CONSCIENCIA/LEMBRANCAS/ | `consultar_memoria_reserva` |
| Estado da VPS (auto 6h) | docs/CONSCIENCIA/09-ESTADO-ATUAL.md | `github_read` |
| Grafo vivo (bússola) | grafo.centralldark.com | pendência #34 |
| Comando Mobile | apps/modulos/comando-mobile/ | `vps_tree_safe` |

## 4. Ponteiro para memórias nativas (colar uma vez em cada ferramenta)

Cada ferramenta guarda somente este ponteiro — nunca conteúdo duplicado:

```
Fonte da verdade: repo ServerVpss/CentralDark.
Início: abrir pivete/dev e ler 00-COMECE-AQUI-IA.md + AGENTS.md.
Executar o BOOT operacional de docs/GOVERNANCA/BOOT-IA.md.
Depois, quando disponível, executar a continuidade de docs/PROTOCOLO-BOOT.md.
Fim: registrar aprendizado. Ciclo Ler→Perguntar→Agir→Registrar.
```

Onde colar:
- **Claude.ai** → memória/preferências do perfil
- **ChatGPT** → Custom Instructions + Memória
- **Lovable** → Workspace Knowledge (adicionar o ponteiro no topo)
- **WebUI / Bolt / Cline** → system prompt do perfil

## 5. Regra de ouro da sincronização

Nenhuma ferramenta é dona da história. **O repo é a história.**
Chat é volátil; repo é eterno. Se não está no repo, não aconteceu.

## 6. Precedência

Em qualquer divergência, seguir `docs/GOVERNANCA/HIERARQUIA-INSTRUCOES-IA.md`.

Resumo:

```text
BOOT-IA.md governa ação.
PROTOCOLO-BOOT.md governa memória e continuidade.
```
