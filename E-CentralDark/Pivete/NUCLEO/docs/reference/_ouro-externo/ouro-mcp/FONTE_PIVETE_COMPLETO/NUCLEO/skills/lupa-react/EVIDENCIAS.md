# EVIDÊNCIAS — no formato da Técnica da Lupa

RISCO: R1 (código novo, isolado, reversível — nada tocado em produção)

EVIDÊNCIA:
- Suíte executada agora, neste código exato:
```
----------------------------------------------------------------------
Ran 11 tests in 0.001s

OK
```
- 11 testes cobrindo: loop ReAct completo, bloqueio de resposta final não-ancorada
  em observação, bloqueio de ação R4 sem autorização, liberação com autorização,
  tolerância a ferramenta desconhecida, max_steps, relatório de 4 campos da Lupa.
- Integridade (sha256 dos arquivos entregues):
```
158b24085e84706a5e410393a921837b5a8d8704a8e98e07c9d26462edcca030 lupa_gate.py
99ee32863f85db682460a9487c38eb8145704420923375a6256ccfee207d7c02 react_loop.py
c76c5adc6e5ef570f073e3e86454768f785c0d0e19132d39c5944597947d59a6 test_lupa_react.py
e72acf2705a1a092aea57d3922569ce3a489d414a703d99771a1050d368558f7 README.md
ab214504da89dbf1eb4b3606bc69b3d421c64ac06793d206c00bb0b187f12eaf TECNICA-DA-LUPA-PREMIUM.md
```
- TECNICA-DA-LUPA-PREMIUM.md incluída INTOCADA (princípio de preservação — nenhuma
  versão paralela criada).

INFERÊNCIA:
- Se a mecânica passa nos 11 cenários, o loop se comporta igual com um LLM real
  plugado no lugar do roteiro de teste (mesma interface callable).

SUPOSIÇÃO:
- Nenhuma apresentada como fato. Os percentuais de eficácia (+34% ALFWorld,
  +10% WebShop) pertencem ao paper react-lm.github.io — fonte, não reprodução.

COMO CONFIRMAR (você disse que vai verificar — o caminho):
1. Descompacte o zip.
2. `sha256sum *.py *.md` — compare com a tabela acima.
3. `python3 -m unittest test_lupa_react -v` — deve dar 11 OK, sem instalar nada.
4. Plugue um modelo real: troque `llm_roteirizado` por qualquer função que
   receba prompt e devolva texto. Rode uma tarefa sua.
5. `diff TECNICA-DA-LUPA-PREMIUM.md <seu-original>` — deve dar vazio.

---

## Evolução 19/07/2026 — registro adicionado (histórico preservado)

EVIDÊNCIA:
```
Ran 22 tests in 0.001s

OK
```
- 22 testes (11 originais + 11 novos: redação de segredos, injeção, exfiltração
  markdown, allowlist de egresso, trilha hash adulterada detectada, entrega
  profissional × teatral, peso da evidência, comparação direta A×B).
- Hashes atuais:
```
158b24085e84706a5e410393a921837b5a8d8704a8e98e07c9d26462edcca030 lupa_gate.py
99ee32863f85db682460a9487c38eb8145704420923375a6256ccfee207d7c02 react_loop.py
c6f6169babfebdcc29a67d116b638f616614f7e5325992ad7094aa032435606a seguranca_privada.py
c76c5adc6e5ef570f073e3e86454768f785c0d0e19132d39c5944597947d59a6 test_lupa_react.py
4f26b3618e61dc41dd2d60987bbdb32aff33126bb1032670efb17a28b04ad89a test_valor_seguranca.py
95e42f6ec69f20f40074db8e1932503488f0e8926f9b24a0de2dfd0c4c5abb11 valor_gate.py
d0e2be7073004d5da7f07ba322e6864621929a2d46fda2aefb5d43aac4083f13 CONHECIMENTO-GDPVAL.md
f2a85091fd8d5a9df317cf3fff47a2fb2fa0f8a22cb48881cefd325b5691c99c EVIDENCIAS.md
25a9b9b1882ba5889a8847b70844d89c92521d724e4ea914ffd07f6774a94754 README.md
ab214504da89dbf1eb4b3606bc69b3d421c64ac06793d206c00bb0b187f12eaf TECNICA-DA-LUPA-PREMIUM.md
```

INFERÊNCIA: os portões funcionam plugados em qualquer callable-LLM (mesma interface testada).
SUPOSIÇÃO: nenhuma vendida como fato; heurísticas de segurança REDUZEM risco, não imunizam (limite declarado no módulo).
COMO CONFIRMAR: descompacte e rode `python3 -m unittest discover -p "test_*.py"` → 22 OK, zero instalação.
