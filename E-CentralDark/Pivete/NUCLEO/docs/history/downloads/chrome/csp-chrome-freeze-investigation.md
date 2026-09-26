# Investigação de Freeze Chrome/ChatGPT — CSP Block + CSS @property

## Contexto
Sessão onde o navegador travava ao usar ChatGPT. Erro no console:
```
Content Security Policy ... blocks the use of 'eval' in JavaScript
Ignored @property rule: initial-value: .5lh
```

## Metodologia Validada (Esta Sessão)

### O que NÃO assumir
- **Vírus** — sem prova (DefenderTamperingRestore foi separado, remediado pelo Defender)
- **CSS causa freeze** — `@property` ignorado pode causar diferença visual, não travamento geral
- **Editar bundle do ChatGPT** — não é seu código

### O que FAZER (ordem cirúrgica)
1. **Reproduzir o freeze** → capturar timestamp exato
2. **Correlacionar** com evento CSP no Console/Issues (mesmo timestamp?)
3. **Identificar emissor** do eval bloqueado:
   - Bundle da página (`chatgpt.com/cdn/assets/*.js`)
   - Extensão injetada
   - DevTools
   - Script injetado por terceiros
4. **Provar pelo initiator/call stack/source map** quem tentou `eval`
5. **Se CSP == freeze**: isolar emissor, aplicar correção local reversível
6. **Reproduzir novamente** → só declarar FIXED se freeze desaparecer

### Proibições
- ❌ Adicionar `unsafe-eval` na CSP
- ❌ Relaxar CSP
- ❌ Desligar segurança
- ❌ Apagar perfil/browser
- ❌ Chamar de vírus sem prova

### Template de Saída
```
CAUSA=<1 linha>
EMISSOR=<1 linha>
PROVA=<1 linha>
CORREÇÃO=<1 linha>
RETESTE=<PASS|FAIL>
SE FAIL: LACUNA=<1 linha exata>
```

## Lição Principal
> CSP bloqueando eval **não é bug** — é a catraca funcionando. O trabalho é descobrir **quem** tentou passar por ela e **por que** isso correlaciona com o freeze. Não arranque a catraca; descubra o invasor.