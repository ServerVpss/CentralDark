# Profile Switching — Hermes Studio Web UI

**URL:** `http://localhost:8648/`
**Profile:** `pivete`
**Browser:** Chrome (pid=10044, window_id=985268)

---

## Sidebar Profile Selector

| Perfil | SOM Index | Label | Status |
|---|---|---|---|
| **pivete (ativo)** | `#69` | "pivete" | ✅ Ativo (mostra "Atual" ao lado) |
| default | `#70` | "default" / "MODELOS" | Disponível |

---

## Como Trocar Perfil

1. **Clicar no perfil desejado** na sidebar (PERFIS section)
2. **Elemento SOM:** `#69` para pivete, `#70` para default
3. **Verificação visual:** Perfil ativo mostra "Atual" ao lado do nome
4. **Confirmação:** Web UI recarrega com novo perfil

---

## Perfis Disponíveis

| Perfil | Descrição | Uso |
|---|---|---|
| **pivete** | Perfil operacional principal — Casa, Kanban, Skills, TTS Francisca, MetaLupa | **Principal** |
| default | Perfil padrão Hermes — configurações base | Fallback / testes |

---

## Verificação Pós-Troca

Após click no perfil:
1. Aguardar recarregamento da página
2. Verificar `#69` ou `#70` mostra "Atual"
3. Verificar Kanban board reflete perfil correto
4. TTS muda para Francisca (pivete) ou Echo (default)

---

## Pitfalls

| Sintoma | Causa | Fix |
|---|---|---|
| Perfil não troca | Click não registrado | Usar `delivery_mode='foreground'` no click |
| Kanban não atualiza | Cache da UI | Recarregar página (`#4` "Recarregar") |
| TTS não muda | Config não recarregou | Reiniciar gateway ou aguardar hot-reload |

---

## Referências

- `references/kanban-mapping.md` — Kanban board SOM mapping
- Skill: `hermes-studio-web-ui` (esta skill)
- Doc oficial: https://hermes-agent.nousresearch.com/docs/developer-guide/creating-skills