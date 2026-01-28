
# Plano: Registrar Rota da Página de Segurança

## Problema Identificado
A página de segurança (`src/pages/Security.tsx`) já existe e está completa, mas a rota `/security` não foi registrada no arquivo de rotas (`App.tsx`), causando o erro 404.

## Solução

### Passo 1: Adicionar Rota no App.tsx
Adicionar a rota `/security` protegida no arquivo `src/App.tsx`:

```tsx
import Security from "./pages/Security";

// Dentro do Routes:
<Route path="/security" element={<ProtectedRoute><Security /></ProtectedRoute>} />
```

---

## Resumo da Página de Segurança (já implementada)

A página já contém:

| Funcionalidade | Descrição |
|----------------|-----------|
| **Anti-Link** | Bloqueia automaticamente links externos |
| **Anti-Spam** | Detecta e remove mensagens de spam |
| **Anti-Flood** | Limita mensagens repetidas em curto período |
| **Anti-Bot** | Bloqueia entrada de bots não autorizados |
| **Captcha** | Verificação para novos membros |
| **Proteção de Boas-vindas** | Remove mensagens de boas-vindas após tempo |

### Estatísticas em Tempo Real
- Links bloqueados hoje
- Spam removido hoje
- Taxa de proteção geral

### Configurações Avançadas
- Slider para limite de mensagens/minuto
- Slider para mensagens idênticas permitidas
- Lista de domínios permitidos (whitelist)

---

## Arquivo a Modificar
- `src/App.tsx` - Adicionar import e rota protegida

## Tempo Estimado
~1 minuto
