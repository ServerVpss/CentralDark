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

## 6. Referências cruzadas

- [Sincronia 4-Point](./CONSCIENCIA.md) — `docs/CONSCIENCIA/` é um dos 4 pontos espelhados.
- [`CLAUDE.md`](../../CLAUDE.md) — porta de entrada do projeto para qualquer IA.
- [Regra Oficial — Gestão de Secrets](./REGRA-OFICIAL-GESTAO-SECRETS.md) (a criar/migrar — atualmente vive como espelho em `mem://preferences/gestao-secrets-autorizacao-previa`, **precisa ser oficializada aqui também** conforme esta nova regra).
- [Regra Oficial — Guardião Modo Propor](./REGRA-OFICIAL-GUARDIAO-MODO-PROPOR.md) — já segue este padrão.
- [APRENDIZADOS.md](./APRENDIZADOS.md) — registrar aprendizado #251 com referência a este arquivo.
