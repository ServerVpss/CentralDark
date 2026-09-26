# Web UI — Models/Providers Pages Navigation (computer_use SOM)

## Página: `localhost:8648/#/hermes/models` (aba "Provedores TTS")

### Estrutura de navegação (tabs no topo)
| Tab | Label | Estado |
|-----|-------|--------|
| 1 | Modelos gerais | — |
| 2 | Modelos auxiliares | — |
| 3 | Conjuntos de modelos | — |
| 4 | Provedores STT | — |
| 5 | **Provedores TTS** | **SELECIONADO** |

### Elementos mapeados (SOM indices do capture 02/08)

#### Configuração do Hermes Agent (seção superior)
| Ação | Elemento SOM | Tipo | Label |
|------|--------------|------|-------|
| Dropdown provedor ativo | `#96` | Group (select) | "edge" / "Hermes Studio" |
| Botão trocar para Hermes Studio | `#105` | Button | "Usar provedor Hermes Studio" |

#### Tabela Provedores TTS
| Coluna | Valor atual (02/08) |
|--------|---------------------|
| Provedor | Edge TTS |
| Origem | Integrado |
| Voz | **ar-SA-HamedNeural** ⚠️ (não é Francisca!) |
| Modelo | — |
| API Key | Integrado |
| Status | Ativo (tag verde) |

#### Ações na linha da tabela
| Ação | Elemento SOM | Tipo |
|------|--------------|------|
| Toggle Ativo/Inativo | `#124` | Text (clicável) |
| Testar voz | `#126` | Button "Testar" |
| Editar provider | `#127` | Button "Editar" |

#### Lado direito (API TTS ativa)
| Ação | Elemento SOM | Tipo |
|------|--------------|------|
| Dropdown API TTS ativa | `#108` | Group (select) |
| Botão adicionar provider | `#111` | Button "Adicionar API TTS" |

---

## Página: `localhost:8648/#/hermes/models` (aba "Modelos auxiliares")

### Elementos-chave (do capture anterior)
| Ação | Elemento SOM | Tipo |
|------|--------------|------|
| Tab "Modelos auxiliares" | `#87` | Group/Text "Modelos auxiliares" |
| Vision provider dropdown | (precisa capture fresco) | — |
| Vision model dropdown | (precisa capture fresco) | — |

---

## Padrão de navegação SOM (reproduzível)

```python
# 1. Abrir Chrome no Hermes Studio
computer_use(action="capture", app="Chrome", mode="som")

# 2. Clicar em "Configurações" na sidebar (elemento varia)
#    No capture 02/08: #54 (Hyperlink "Configurações" no final da sidebar)

# 3. Clicar na tab "Modelos" na navegação superior do content
#    No capture 02/08: #102 (Text "Modelos")

# 4. Clicar na sub-tab desejada (ex: "Provedores TTS")
#    No capture 02/08: #93 (Text "Provedores TTS")

# 5. Após cada clique: capture fresco para mapear novos elementos
computer_use(action="capture", app="Chrome", mode="som")
```

---

## Descoberta crítica: Voice TTS no Web UI ≠ config.yaml

| Fonte | Voice configurada |
|-------|-------------------|
| `config.yaml` L401 | `pt-BR-FranciscaNeural` ✅ |
| Web UI (capture 02/08) | `ar-SA-HamedNeural` ❌ |

**Causa:** O Web UI mantém estado próprio para a voice do Edge TTS (carregado via `speechSynthesis.getVoices()` no browser). Não sincroniza automaticamente com `config.yaml`.

**Fix manual no Web UI:**
1. Clicar **Editar** (`#127`) na linha Edge TTS
2. No modal, trocar voice para `pt-BR-FranciscaNeural`
3. Salvar

**Fix via API (se existir endpoint):** Não mapeado ainda. Endpoint provável: `PUT /api/hermes/config/tts/providers/{id}`.

---

## Pitfalls conhecidos

- **SOM indices mudam a cada capture** — nunca hardcode. Sempre capture fresco após navegação.
- **Effect "unverifiable" é normal** em background mode — sempre fazer capture fresco para confirmar estado.
- **Tabs e sub-tabs** são elementos distintos. Click na tab principal ("Modelos") abre sub-tabs; click na sub-tab ("Provedores TTS") carrega o conteúdo.
- **Sidebar recolhida** oculta labels — usar `Recolher menu` (`#83`) se precisar de mais espaço.
- **Voice list** é populada pelo browser (`speechSynthesis.getVoices()`) — só vozes instaladas no Windows aparecem. `pt-BR-FranciscaNeural` precisa estar instalada no OS.

---

## Próximos mapeamentos pendentes

- [ ] Página "Modelos auxiliares" — vision provider/model dropdowns exatos
- [ ] Página "Provedores STT" — estrutura similar
- [ ] Modal "Editar provider TTS" — campos exatos
- [ ] Endpoint API para sync voice TTS Web UI ↔ config.yaml