# COLETORES E INSTRUMENTOS

## Coletor Seguro

Um coletor deve ser:

- limitado por profundidade;
- limitado por quantidade;
- limitado por tempo;
- leitura única quando possível;
- sem `rglob` irrestrito;
- sem seguir reparse points;
- sem conteúdo quando metadado basta;
- início registrado antes da primeira leitura;
- cronômetro monotônico;
- saída parcial preservada;
- códigos de saída por estágio;
- relatório sanitizado;
- SHA-256 externo após conclusão.

---

## Técnica de Transporte Promovida

```
Windows simples
→ wrapper Bash/MSYS inevitável
→ um powershell.exe -NoProfile -NonInteractive
→ sem segundo shell
→ sem heredoc
→ sem Python interno
→ comando pequeno e nativo
```

---

## Técnica para Lógica Complexa

```
preparar .ps1 visível
→ revisão de código
→ parser-only
→ teste sintético positivo
→ teste negativo
→ autorização de execução
→ execução isolada
→ validação do relatório
```

---

## Instrumentos da Sessão

| Instrumento | Tipo | Status | Evidência |
|-------------|------|--------|-----------|
| PROFILE_SHOW_NATIVE_DIAGNOSTIC | Coletor | VALID | SHA256: `bb03aa8abe3799437c69128eb0cb47fc9524960bdac4d1817cde1158de1aac6e` |
| RESERVED_ENTRY_NUL_DIAGNOSTIC | Instrumento | INVALID | Relatório malformado |
| stage-05b | Script PS1 | REJECTED | 337 linhas, múltiplas falhas |
| stage-05c | Script PS1 | REJECTED_LINE_LIMIT | 190 linhas vs 180 limite |
| stage-05d | Script PS1 | PREPARED | 180 linhas, descarte determinístico |

---

## Não Incluir

Scripts temporários 05b/05c não entram na cápsula — apenas hashes, estados, falhas e aprendizados.
