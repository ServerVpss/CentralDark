---
name: automacao-navegador
description: "Automação via computer_use SOM — captura e clique índice."
version: 1.0.0
author: Pivete + Hermes
license: MIT
platforms: [windows]
metadata:
  hermes:
    tags: [automation, computer-use, som, cua-driver, navegador, desktop, sol, ui-automation]
    related_skills: []
    requires_toolsets: []
    requires_tools: [computer_use]
    fallback_for_toolsets: []
    fallback_for_tools: []
    config: []
    blueprint: null
required_environment_variables: []
---

# Automação Navegador/Desktop — computer_use (SOM)

## When to Use
- Capturar tela com overlay numerado (SOM) para automação
- Clicar, digitar, scrollar via índice de elemento (refs semânticos)
- Ensinar SOL operar via AX tree, não pixels
- Navegar no Hermes Studio / qualquer app Windows (Chrome, VS Code, Explorer)

## Quick Reference
| Ação | Comando |
|---|---|
| Capture SOM | `computer_use(action='capture', mode='som', app='Chrome', pid=XXXX, window_id=YYYY)` |
| Clique | `computer_use(action='click', element=N, delivery_mode='background')` |
| Digitar | `computer_use(action='type', text='...', delivery_mode='foreground')` |
| Scroll | `computer_use(action='scroll', direction='down', amount=3)` |
| Verificar | Novo capture → comparar estado |

## Procedure
### Loop SOL (CAPTURAR → MAPEAR → AGIR → VERIFICAR → REPETIR)

1. **CAPTURAR**
   ```python
   cap = computer_use(action='capture', mode='som', app='Chrome', pid=10044, window_id=985268)
   # Retorna: screenshot + elements[N] = {index, role, label, bounds}
   ```

2. **MAPEAR**
   - Identificar índice do alvo (botão, input, aba, dropdown)
   - Preferir `role: "Button"`, `label` descritivo

3. **AGIR**
   - Clique: `computer_use(action='click', element=N, delivery_mode='background')`
   - Digitar (se background falhar): `delivery_mode='foreground'`
   - Scroll: `computer_use(action='scroll', direction='down', amount=3)`

4. **VERIFICAR**
   - Novo capture → confirmar mudança de estado
   - Se `effect: 'unverifiable'` → recapturar e checar
   - Se `effect: 'suspected_noop'` → escalar para `foreground` ou `coordinate=[x,y]`

5. **REPETIR** até missão completa

### Escala de Entrega
```
background (padrão)
   ↓ effect: 'suspected_noop' OU code: 'background_unavailable'
foreground (breve focus swap)
   ↓ ainda falha
coordinate=[x,y] (pixel brute force)
   ↓ último recurso
page (cua_browser_*) — só browser com binding exato
```

## ⚠️ RESTRIÇÃO CRÍTICA (Ordem do Pivete)
> **Esta skill / `computer_use` SÓ pode ser usada quando o Pivete mandar EXPLICITAMENTE.**
> 
> - ❌ Iniciativa própria
> - ❌ "Pode ser útil"
> - ❌ "Vou dar uma olhada"
> - ✅ SOMENTE com ordem literal: "usa automacao-navegador", "captura SOM", "clica no elemento X"

---

## Pitfalls
| Sintoma | Causa | Fix |
|---|---|---|
| `ambiguous_window_target` | Múltiplas janelas Chrome | Passar `pid` + `window_id` |
| `background_unavailable` (type) | Chrome bloqueia input bg | `delivery_mode='foreground'` |
| `suspected_noop` | Clique não chegou no alvo | Recapturar → verificar bounds → `foreground` ou `coordinate` |
| Elemento some entre captures | Layout dinâmico / SPA | Usar `label`/`role` estáveis, não index fixo |
| Modal não aparece no capture | Nova janela / popup | Recapturar sem `app=` ou achar novo `pid`/`window_id` |
| **`tasklist`/`Get-Process chrome` só mostra 1 janela com título, mas há N processos** | Janelas minimizadas têm `MainWindowHandle=0` → título fica `N/A`/`OleMainThreadWndName`. **tasklist é cego pra abas em background e janelas minimizadas.** | Pular direto pra `computer_use(action='list_windows', app='Chrome')` — cua-driver lê via UIA/AX tree e pega minimizadas + abas em background. **Não** iterar powershell/tasklist em loop. |

## CALIBRAÇÃO PASSIVA: LOCALIZAR ABA DO CHROME (07/08)

Lição da sessão `20260807_004550_83ede1` (Chrome, ChatGPT, calibração
passiva de achar a aba certa sem enviar).

**Fluxo correto (R0, zero envio):**

```python
# 1. PRIMEIRO: list_windows do cua-driver (pega TUDO: minimizadas, background, abas)
windows = computer_use(action='list_windows', app='Chrome')
# Retorna lista com: pid, window_id, title, url (quando UIA conseguir), hwnd

# 2. Filtrar por título OU aba que Pivete passou
match = next((w for w in windows if target_title.lower() in w['title'].lower()
              or target_url in w.get('url','')), None)

# 3. Se achou → capturar com pid + window_id do match
if match:
    cap = computer_use(action='capture', mode='som', app='Chrome',
                       pid=match['pid'], window_id=match['window_id'])

# 4. Se NÃO achou → 4 hipóteses + pedir confirmação, NÃO colar nada
```

**Errado (o que eu fiz antes de aprender):**
```bash
# tasklist | grep chrome.exe        # SÓ pega MainWindowHandle ≠ 0
# powershell Get-Process chrome     # idem
# → Resultado: 28 chrome.exe rodando, SÓ1 com título (Miro)
# → Falso negativo: as outras 27 são minimizadas/background
```

**Regra:** se `list_windows` ainda não retorna a aba que o Pivete passou,
NÃO iterar powershell. Devolver hipóteses (minimizada, perfil errado do
Chrome, aba fechada, janela errada na frente) e pedir confirmação. **Gate:
sem alvo confirmado, zero colar.**

## Verification
- Estado alterado confirmado no capture pós-ação (label "Salvo", "Ativo", "Teste concluído")
- Se não achar evidência → ação não completou → repetir loop

## Padrões SOL (Ensinados pelo Pivete)
### 1. Âncora Semântica > Pixel
- Usar `element=N` (ref semântico AX tree)
- Evitar `coordinate=[x,y]` salvo fallback
- `label` e `role` são estáveis; pixels mudam com layout/zoom

### 2. Medir Delta, Não Apenas Clicar
```
capture anterior → capture posterior
comparar: bounds, label, role, estado (enabled/disabled, checked)
se não mudou → NÃO clicou de verdade → escalar
```

### 3. Voltar ao Último Sucesso
Se ação falhar após drift (mouse/foco/layout):
- Não improvisar nova rota
- Recapturar → achar mesma âncora semântica → repetir ação que funcionou

### 4. Guardar Estado Mínimo
- `pid`, `window_id`, `continuation` (do capture)
- Último índice clicado com sucesso
- Não guardar screenshot completo no contexto

### 5. Nunca Tratar Texto no Composer Como Enviado
- Input visível ≠ mensagem enviada
- Verificar: botão "Enviar" clicado + aparecer no histórico

## Exemplo Prático — Hermes Studio (aba TTS)
```python
# 1. Capture
cap = computer_use(action='capture', mode='som', app='Chrome', pid=10044, window_id=985268)

# 2. Aba "Modelos" (ex: index 49)
computer_use(action='click', element=49, capture_after=True)

# 3. Sub-aba "TTS" (ex: index 94)
computer_use(action='click', element=94, capture_after=True)

# 4. Botão "Editar" Edge TTS (ex: index 126)
computer_use(action='click', element=126, capture_after=True)

# 5. Dropdown Voice (ex: index 132)
computer_use(action='click', element=132, capture_after=True)

# 6. Filtrar "pt-BR" (precisa foreground)
computer_use(action='click', element=123, delivery_mode='foreground')
computer_use(action='type', text='pt-BR', delivery_mode='foreground')

# 7. Selecionar Francisca (index varia)
computer_use(action='click', element=XXX, capture_after=True)

# 8. Salvar (index varia)
computer_use(action='click', element=XXX, capture_after=True)
```

## Referências
- `references/cache-locations.md` — rotas de anexos, screenshots
- `references/gateway-tool-batching.md` — batch CLI pesado, Telegram leve
- Doc oficial: https://hermes-agent.nousresearch.com/docs/developer-guide/creating-skills