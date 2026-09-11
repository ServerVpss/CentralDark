# 🧿 BLOCO 1 · CONGELADO

Achei. A `grill-me` existe em `.agents/skills/grill-me/SKILL.md`. Ela é descrita como **uma entrevista insistente para afiar plano ou design**, não roda automaticamente (`disable-model-invocation: true`) e manda chamar a skill de `grilling`.

Na CentralDark ela já aparece combinada com `planning-guidelines`, `meta-lupa` e `delta-simplify`: primeiro afia o plano, depois valida suposições e corta desperdício.

### 10 usos que realmente melhorariam teu fluxo

1. 🧪 **Remote/Ping:** “O device está Online, mas por que o ChatGPT não consegue pingar? Separe identidade, sessão, registro, presença e ferramenta.”
2. 🔐 **OAuth multi-conta:** “O que quebra quando duas contas Google usam o mesmo device/session cache?”
3. 📡 **START LINK:** “Qual informação mínima precisa sobreviver entre chats para manter cursor sem virar memória paralela?”
4. 🧠 **Multi-modelo:** “Quais partes das respostas de 3 modelos são interseção, quais são apenas opinião e quais são delta útil?”
5. 🏠 **Casa ↔ Main:** “Dos arquivos divergentes, quais representam ouro local, quais são atraso e quais são lixo?”
6. ⚙️ **Gate travado:** “Esse gate detecta defeito real ou só está bloqueando por regra obsoleta?”
7. 🚀 **Deploy:** “Qual elo exato falta entre commit, runner, artifact, VPS e runtime?”
8. 🧬 **Reuse Before Create:** “Existe owner capaz de absorver isso ou estamos prestes a criar duplicação?”
9. 🔄 **Self-healing:** “O sistema sabe distinguir falha real, transient esperado e estado desconhecido antes de reparar?”
10. 🧾 **Fixed point:** “Que evidência ainda pode falsificar o verde atual?”

### Os 3 especiais para **agora**

**Remote MCP:**  
`LOGIN → SESSION → DEVICE_ID → PRESENCE → TOOL_CALL → PING`  
Grillar elo por elo até achar o primeiro que não fecha.

**OAuth duas contas:**  
`ACCOUNT_A ≠ ACCOUNT_B → SESSION_A ≠ SESSION_B → DEVICE_BINDING explícito`  
Grillar qualquer cache compartilhado que esteja misturando identidade.

**Multi-chat / contexto:**  
`RESPOSTAS → INTERSEÇÃO → DELTA SOBREVIVENTE → PROVA → NEXT_CURSOR`  
Grillar tudo que tenta virar cânone sem medição.

🧿 O melhor uso da `grill-me` pra ti não é “me faça 30 perguntas”. É **atacar uma cadeia causal até sobrar exatamente um ponto quebrado**.
