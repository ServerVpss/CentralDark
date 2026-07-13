## Ajuste dos módulos no Portal

Na tela do Portal (`src/paginas/portal-publico/pages/Portal.tsx`), hoje só o **TelePainel** está realmente ativo. Os outros ainda não existem dentro do CentralDark, mas estão marcados como "ativo" e clicáveis — o que dá a impressão errada.

### O que muda
Só o campo `status` de cada módulo no array `modules`:

| Módulo | Antes | Depois |
|---|---|---|
| Bot WhatsApp | ativo | **em breve** |
| CRM | ativo | **em breve** |
| TelePainel | ativo | ativo (continua) |
| Financeiro | em breve | em breve (continua) |

Efeito visual (já está pronto no componente):
- Ganham o selo "em breve" no canto.
- Ficam levemente opacos.
- Deixam de ser clicáveis (sem `<Link>`).

### O que NÃO muda
- Nada de design, cores, layout, rotas ou lógica.
- Landing pages (`/whatsapp`, `/crm`, `/financeiro`) continuam existindo no código — só ficam inacessíveis pelo Portal por enquanto.
- TelePainel segue clicável e funcional.

### Lembrete registrado pra depois
Quando a gente começar a construir o **Painel de Comando (Admin CentralDark)**, esses módulos "em breve" (WhatsApp, CRM, Financeiro) passam a ser administrados por lá. Fica anotado como próximo passo, não faz parte dessa mudança.

**Agora:** só ajustar os rótulos de "em breve" → **Próximo:** você conferir no preview e a gente atacar o Painel de Comando da CentralDark.
