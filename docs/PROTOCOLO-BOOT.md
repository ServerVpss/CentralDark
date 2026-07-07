# 🔑 PROTOCOLO DE BOOT — CentralDark

> Fonte única do ritual de entrada e saída de QUALQUER IA no sistema.
> Criado: 2026-07-07 · Dono: Pivete · Status: OFICIAL

---

## 1. O Prompt Âncora (colar no início de TODA conversa)

```
🔑 BOOT CENTRALDARK — execute ANTES de responder:
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

## 2. Ritual de saída (sem isso a próxima IA herda NADA)

- `registrar_aprendizado` — erro+correção, atalho, regra ou armadilha da sessão
- `consolidar_pensamento` — se aprendeu algo sobre como o Pivete pensa
- `fechar_pendencia` — se resolveu item do PENDENCIAS.md
- `atualizar_painel` — se concluiu tarefa (status.centralldark.com)

**Boot sem depósito = amnésia com cerimônia.**

## 3. Mapa do tesouro (onde cada coisa mora)

| O quê | Onde | Tool MCP |
|---|---|---|
| Regras de conduta | (injetadas) | `injetar_consciencia_centraldark` |
| Consciência mestra | docs/CONSCIENCIA/CONSCIENCIA.md | `ler_consciencia` |
| Pendências (fonte única) | docs/PENDENCIAS.md | `ler_pendencias` |
| Aprendizados (eterno) | docs/CONSCIENCIA/APRENDIZADOS.md | `puxar_aprendizados` |
| Lembranças (30 dias) | docs/CONSCIENCIA/LEMBRANCAS/ | `consultar_memoria_reserva` |
| Estado da VPS (auto 6h) | docs/CONSCIENCIA/09-ESTADO-ATUAL.md | `github_read` |
| Grafo vivo (bússola) | grafo.centralldark.com | pendência #34 |
| Comando Mobile | apps/modulos/comando-mobile/ | `vps_tree_safe` |

## 4. Ponteiro pras memórias nativas (colar 1x em cada ferramenta)

Cada ferramenta guarda SÓ este ponteiro — nunca conteúdo duplicado:

```
Fonte da verdade: repo ServerVpss/CentralDark via MCP
mcp.centralldark.com. Início de conversa: executar o BOOT
de docs/PROTOCOLO-BOOT.md. Fim de conversa: registrar
aprendizado. Ciclo Ler→Perguntar→Agir→Registrar.
```

Onde colar:
- **Claude.ai** → memória/preferências do perfil
- **ChatGPT** → Custom Instructions + Memória
- **Lovable** → Workspace Knowledge (adicionar o ponteiro no topo)
- **WebUI / Bolt / Cline** → system prompt do perfil

## 5. Regra de ouro da sincronização

Nenhuma ferramenta é dona da história. **O repo é a história.**
Chat é volátil; repo é eterno. Se não está no repo, não aconteceu.
