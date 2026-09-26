# Recarga de sessão e contexto — profile `pivete`

## Contrato confirmado

| Ação | O que recarrega | O que não recarrega |
|---|---|---|
| `/new` ou `/reset` | Nova sessão; novo snapshot de SOUL, `MEMORY.md`, `USER.md` e regras de projeto | Não prova leitura das 3 temperaturas externas |
| `/reload` | Variáveis de ambiente da sessão | SOUL, memória e skills |
| `/reload-skills` | Revarredura do catálogo de skills | Memória, SOUL e histórico |
| `!bot` | Nenhuma semântica nativa encontrada | Não tratar como comando de recarga |

## Prova local usada

- Registro e implementação dos comandos foram confirmados no código instalado em `hermes_cli/commands.py` e `cli.py`.
- A busca textual local não encontrou comando `!bot`; ocorrências encontradas eram identificadores de código sem relação com comandos.
- A documentação de memória define `MEMORY.md` e `USER.md` como snapshot congelado no início da sessão.

## Boot específico da Casa

Depois de `/new`:

1. confirmar `PROFILE=pivete`;
2. usar o SOUL injetado no boot;
3. ler `E:\CentralDark\Pivete\NUCLEO\motor\03-memoria\memoria\HOJE.md`;
4. ler `SEMANA.md` quando houver continuidade/passado recente;
5. ler `REGRAS.md` para regras frias;
6. declarar `RECUPERADO_DA_MEMÓRIA` ou a lacuna real.

## Pitfalls

- Não dizer “reli `SOUL.md` do disco” se nenhum arquivo físico foi localizado.
- Não confundir conteúdo injetado no contexto com leitura comprovada do canônico.
- Não sugerir restart quando uma nova sessão resolve; restart continua sujeito a autorização aplicável.
