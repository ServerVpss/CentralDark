# lupa-react — ReAct (Yao et al., 2022) + Técnica da Lupa (Segredo) em código

Loop **Pensamento → Ação → Observação** do artigo react-lm.github.io, com a
**Técnica da Lupa Premium** como portão de aprovação: a resposta final só sai
**ancorada em observação citada** (`Final[obs=N]`), ação **R3/R4 é bloqueada sem
autorização explícita**, e suposição **nunca** é apresentada como fato.

## Universal de verdade
- Python 3.8+, **zero dependências**, 2 arquivos de código.
- `llm` é qualquer `callable(prompt)->str`: Anthropic, OpenAI, Ollama local, o que for.

```python
from react_loop import ReActAgent, Tool
agente = ReActAgent(llm=meu_modelo, tools=[Tool("search", minha_busca)],
                    autorizados=())           # nada destrutivo sem ordem
print(agente.run("sua tarefa"))
```

Exemplo de adaptador (qualquer provedor):
```python
def meu_modelo(prompt):
    return cliente.chat(prompt)   # troque pela sua API; nada mais muda
```

## Verificar (rode você mesmo)
```
python3 -m unittest test_lupa_react -v
```
11 testes: fluxo completo, bloqueio de resposta não-ancorada, bloqueio R4 sem
autorização, liberação com autorização, tolerância a erro, max_steps, relatório
EVIDÊNCIA/INFERÊNCIA/SUPOSIÇÃO/COMO CONFIRMAR.

## Limite de garantia (formato da própria Lupa)
Este pacote **prova a mecânica** (testes executados neste código). Os números de
eficácia do ReAct (+34% ALFWorld, +10% WebShop) **pertencem ao paper** — fonte
citada, não reproduzidos aqui. O `llm_roteirizado` é mock **declarado como mock**,
usado só em teste. Nenhuma estrutura paralela criada: a Lupa incluída aqui é o
arquivo original do autor, intocado.

---

## Evolução 19/07/2026 — valor real + segurança privada (mesmo pacote, sem paralelo)

Novos módulos plugáveis em qualquer agente pessoal:
- `valor_gate.py` — avaliador GDPval-inspired: pontua a entrega em 5 dimensões e
  faz comparação direta A×B (`comparar`). Uso: `avaliar(tarefa, entrega, evidencias, contexto)`.
- `seguranca_privada.py` — 4 defesas: `redigir` (segredos/CPF/email fora),
  `detectar_injecao` (saída de ferramenta suspeita), `GuardaEgresso` (allowlist
  de domínios), `LogAuditoria` (trilha hash-encadeada, adulteração detectável).
- `CONHECIMENTO-GDPVAL.md` — o conceito e as 3 alavancas práticas do paper.

### Composição num agente (exemplo universal)
```python
from react_loop import ReActAgent, Tool
from seguranca_privada import redigir, detectar_injecao, GuardaEgresso, LogAuditoria
from valor_gate import avaliar

log = LogAuditoria(); guarda = GuardaEgresso(["seu-dominio.com"])

def busca_segura(consulta):
    if not guarda.permitido(consulta): return "BLOQUEADO: fora da allowlist"
    bruto = sua_busca(consulta)
    s, motivos = detectar_injecao(bruto)
    if s: return f"DESCARTADO: suspeita de injecao {motivos}"
    limpo, _ = redigir(bruto); log.registrar(f"busca:{consulta}")
    return limpo

agente = ReActAgent(llm=seu_modelo, tools=[Tool("search", busca_segura)])
res = agente.run("sua tarefa")
parecer = avaliar("sua tarefa", res.get("resposta") or "", res["observacoes"])
```
Verificar tudo: `python3 -m unittest discover -p "test_*.py"` → 22 testes.
