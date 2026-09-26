# UIA — NAVEGADOR E TELAS

## Regras de Isolamento

- **Aba localizada não significa aba autorizada.**
- **Mensagem renderizada não significa ACK válido.**
- **Print não significa conversa comprovada.**
- **Navegador isolado não significa aba pessoal.**
- **Não abrir outras conversas.**
- **Não acessar credenciais.**
- **Preservar rascunho do Pivete.**

---

## Verificação Obrigatória

Antes de qualquer ação:

```
confirmar processo
→ confirmar janela
→ confirmar URL
→ confirmar marcador
```

---

## Resposta Completa

**Resposta só termina quando a barra de ações estiver visível.**

Quando necessário, rolar em sobreposição controlada até o fim.

---

## Texto Truncado

**Texto truncado deve ser recuperado antes da execução.**

Método:

1. Usar TextPattern via UIAutomationClient.
2. Buscar `SOL_TO=HERMES` como marcador.
3. Decodificar base64.
4. Verificar se contém `TURN=` e `RETURN_FORMAT=`.

---

## Técnica Usada

```python
Add-Type -AssemblyName UIAutomationClient
$r = [Windows.Automation.AutomationElement]::FromHandle([IntPtr]$handle)
$tp = $r.GetCurrentPattern([Windows.Automation.TextPattern]::Pattern)
$full = $tp.DocumentRange.GetText(-1)
```

---

## Mantenha como Candidato

Esta técnica ainda é **CANDIDATE**, não padrão aprovado.
