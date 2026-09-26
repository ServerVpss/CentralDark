# Caso Real: CSP Eval Block + CSS @property Ignorado — Chrome/ChatGPT Freeze (2026-08-22)

## Resumo do Incidente
Navegador travando ao usar ChatGPT. Console mostrou:
```
Content Security Policy ... blocks the use of 'eval' in JavaScript
  resource: chatgpt.com/cdn/assets/8a8b2d66-1fadd19980ec1a8a.js
Ignored @property rule: initial-value: .5lh
  resource: 1a02f13d62908488.css
```

## Análise (Meta Lupa FRIA → MÉDIA)

### O que NÃO é
- **Vírus** — CSP bloqueando eval é a catraca FUNCIONANDO
- **CSS causa freeze** — `@property` ignorado = diferença visual, não travamento
- **Bundle editável** — não é seu código

### O que É
- **CSP violation** = bundle do ChatGPT tentou `eval`/execução dinâmica
- **Catraca ativa** = política de segurança impedindo comportamento perigoso
- **Emissor desconhecido** = precisa identificar: bundle nativo, extensão, DevTools, injeção

## Metodologia de Investigação (Zero Trust Aplicado ao Browser)

### 1. Reproduzir + Timestamp Exato
- Abrir DevTools Console + Issues
- Reproduzir freeze
- Capturar `Date.now()` exato do freeze
- Correlacionar com timestamp do CSP violation

### 2. Identificar Emissor (Initiator Chain)
```
Console → CSP violation → clique no resource → aba "Initiator"
```
Possíveis origens:
- **Bundle nativo** (`chatgpt.com/cdn/assets/*.js`) — feature legítima bloqueada por CSP restritiva
- **Extensão** — injetando script que tenta eval
- **DevTools** — se estiver aberto, pode disparar
- **Script injetado** — terceiros, malware, proxy corporativo

### 3. Provar Correlação Freeze = CSP
| Cenário | Ação |
|---------|------|
| CSP timestamp == freeze timestamp | Isolar emissor → correção local |
| CSP ≠ freeze | CSP é ruído; caçar outra causa (GPU, memória, extensão, rede) |

### 4. Correção Local Reversível (SEM relaxar segurança)
| Emissor | Correção |
|---------|----------|
| Extensão | Desabilitar extensão suspeita |
| DevTools | Fechar DevTools |
| Proxy corporativo | Isolar em perfil limpo / incógnito |
| Bundle nativo | **Não editar** — reportar à OpenAI / aguardar update |
| Script injetado | Limpar perfil / resetar browser / scan memória |

## Template de Saída Determinístico
```
CAUSA=<1 linha: ex: "Extensão X injetou eval no contexto ChatGPT">
EMISSOR=<1 linha: ex: "Extensão 'Y' v1.2.3 — content script injectado">
PROVA=<1 linha: ex: "Initiator chain mostra extension://<id>/content.js linha 42 chamando eval()">
CORREÇÃO=<1 linha: ex: "Desabilitar extensão 'Y' — reversível via chrome://extensions">
RETESTE=<PASS|FAIL>
SE FAIL: LACUNA=<1 linha exata>
```

## Lição Principal para Zero Trust

> **CSP violation não é bug — é evidência de tentativa de execução não-autorizada.**
> 
> O trabalho NÃO é "fazer o aviso sumir" (adicionar `unsafe-eval`). O trabalho é **identificar quem tentou passar pela catraca e por que isso congelou a UI**.
> 
> Zero Trust no browser = nunca confiar que o bundle é inofensivo; sempre verificar o initiator.

## Integração com EDR Zero Trust Hunter

| Fase EDR | Equivalente Browser |
|----------|---------------------|
| `Get-MpThreatDetection` | DevTools Console/Issues + CSP violations |
| EventID 4688 (process create) | Initiator chain / call stack |
| ProcessName=Unknown | Extension ID desconhecido / script injetado sem source map |
| Memory dump (Volatility) | Chrome DevTools Memory snapshot / Performance profile |
| MITRE T1562.001 | CSP bypass attempt / eval injection |
| IOC file hash | Extension ID / script URL / CSP report-uri |

## Anti-Padrão Evitado

❌ "Adicionar `unsafe-eval` para resolver" — **ARRANCA A CATRACA**
❌ "É vírus porque travou" — **SEM PROVA**
❌ "CSS @property causou freeze" — **CORRELAÇÃO ≠ CAUSALIDADE**

✅ "CSP bloqueou eval → initiator chain aponta extensão X → desabilitar X → freeze some → FIXED"