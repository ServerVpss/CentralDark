# Regra Oficial — Hierarquia de Memória (Fonte da Verdade)

- **Título:** Hierarquia de Memória — `docs/CONSCIENCIA/` é a única fonte da verdade
- **Data:** 25/06/2026
- **Responsável pela decisão:** Pivete (dono do projeto)
- **Onde foi registrado:** este arquivo (`docs/CONSCIENCIA/REGRA-OFICIAL-HIERARQUIA-MEMORIA.md`) + espelho em `mem://preferences/hierarquia-memoria-consciencia-primeiro`
- **Prioridade:** MÁXIMA — sobrescreve qualquer instrução anterior sobre memória.

---

## 1. Hierarquia

1. **Fonte da Verdade Principal (única e oficial):** `docs/CONSCIENCIA/`
   - Pastas críticas: `00-ENTRADA/`, `01-IDENTIDADE/`, `04-MCP-E-CONECTORES/`
   - Arquivo crítico: `APRENDIZADOS.md`
2. **Memória Secundária (suporte / cache de sessão):** `mem://`
3. **Proibido:** usar `mem://` como fonte principal de regras, decisões ou aprendizados importantes.

## 2. Ordem obrigatória de registro

Toda regra, decisão, aprendizado ou mudança importante deve seguir:

1. Registrar **primeiro** em `docs/CONSCIENCIA/` (no arquivo mais adequado, ou criar um novo).
2. Depois, opcionalmente, espelhar em `mem://`.
3. **Nunca** registrar algo importante **somente** em `mem://`.

## 3. Formato mínimo de registro

Todo registro importante em `docs/CONSCIENCIA/` deve conter:

- Título claro
- Data
- Responsável pela decisão
- Onde foi registrado (caminho do arquivo)
- Por que foi registrado
- Referências cruzadas (quando existirem)

## 4. Consequência da violação

Informação importante registrada **apenas** em `mem://` (sem espelho em `docs/CONSCIENCIA/`) é considerada **não-oficial** e pode ser ignorada pelo Pivete e por qualquer outro agente.

## 5. Por que essa regra existe

- `mem://` é volátil entre workspaces e tem limite de tamanho — não serve como arquivo histórico.
- `docs/CONSCIENCIA/` é versionado no Git, espelhado na VPS (`/root/CentralDark/docs/CONSCIENCIA/`) e legível por qualquer IA/humano que abra o repo.
- Garante que decisões sobrevivam à troca de IA, reset de sessão e migração de workspace.

## 5.1. Por que `mem://` NÃO funciona fora do Lovable

`mem://` é um namespace **interno e proprietário do Lovable**. Ele existe apenas dentro do runtime do agente Lovable e funciona como cache de sessão / memória curta entre turnos de conversa no editor Lovable.

Limitações duras que tornam `mem://` impróprio como fonte oficial:

1. **Invisível para outras IAs/Hubs.** Claude (Claude Code, Claude Desktop), ChatGPT, Custom GPT, Grok, Codex, Copilot, Cursor, Windsurf e qualquer outro agente conectado ao repo **não enxergam** `mem://`. Para essas IAs, `mem://` simplesmente não existe.
2. **Volátil entre workspaces.** Trocar de workspace Lovable, recriar o projeto, ou abrir o repo em outro Hub apaga/ignora o conteúdo de `mem://`.
3. **Não versionado.** `mem://` não vive no Git, não tem histórico, não tem diff, não tem PR, não tem revisão.
4. **Não espelhado na VPS.** A VPS (`/root/CentralDark/`) só vê o que está no Git. `mem://` nunca chega lá.
5. **Limite de tamanho.** Cresce, é truncado, e não serve como arquivo histórico de aprendizados.

### Onde registrar de forma permanente

Toda regra, decisão ou aprendizado importante vai para o repositório, dentro de `docs/CONSCIENCIA/`:

| Tipo de conteúdo | Local oficial no repo |
|---|---|
| Regra/decisão oficial | `docs/CONSCIENCIA/REGRA-OFICIAL-*.md` (criar novo arquivo se for tema novo) |
| Aprendizado/lição/erro+correção/atalho validado | `docs/CONSCIENCIA/APRENDIZADOS.md` (via tool `registrar_aprendizado` do MCP, que sanitiza secrets) |
| Pendência aberta | `docs/PENDENCIAS.md` (via tool `pendencias_add`) |
| Relatório de tarefa concluída | `docs/RELATORIOS/YYYY-MM-DD-nome.md` |
| Identidade/permissões/estrutura | arquivos numerados em `docs/CONSCIENCIA/` (`01-IDENTIDADE.md`, `02-PERMISSOES.md`, etc.) |

### Uso permitido de `mem://`

Apenas como **espelho/cache opcional**, depois que o conteúdo já existir em `docs/CONSCIENCIA/`. Nunca como origem. O espelho em `mem://` deve apontar para o caminho do arquivo oficial no repo.

### Regra prática para qualquer IA

Antes de salvar algo em `mem://`, pergunte: *"Isso precisa sobreviver à troca de IA, ao reset de sessão ou à leitura por Claude/ChatGPT/Grok?"* Se sim → vai para `docs/CONSCIENCIA/` primeiro. `mem://` depois, se quiser.

## 6. Referências cruzadas

- [Sincronia 4-Point](./CONSCIENCIA.md) — `docs/CONSCIENCIA/` é um dos 4 pontos espelhados.
- [`CLAUDE.md`](../../CLAUDE.md) — porta de entrada do projeto para qualquer IA.
- [Regra Oficial — Gestão de Secrets](./REGRA-OFICIAL-GESTAO-SECRETS.md) (a criar/migrar — atualmente vive como espelho em `mem://preferences/gestao-secrets-autorizacao-previa`, **precisa ser oficializada aqui também** conforme esta nova regra).
- [Regra Oficial — Guardião Modo Propor](./REGRA-OFICIAL-GUARDIAO-MODO-PROPOR.md) — já segue este padrão.
- [APRENDIZADOS.md](./APRENDIZADOS.md) — registrar aprendizado #251 com referência a este arquivo.
