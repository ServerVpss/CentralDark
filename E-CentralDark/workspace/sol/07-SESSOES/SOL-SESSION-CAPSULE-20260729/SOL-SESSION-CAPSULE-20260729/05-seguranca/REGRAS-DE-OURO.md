# Regras de ouro

1. Pivete é a autoridade final.
2. Confiança nunca substitui autorização.
3. Um escritor por alvo.
4. Mapear antes de mover.
5. Uma pasta por vez.
6. Começar read-only.
7. Limitar profundidade, quantidade, tempo e território.
8. Não seguir link ou reparse point sem contrato.
9. Não ler segredo para provar existência de segredo.
10. Não acessar credenciais para superar bloqueio de login.
11. Não usar `HOME` do Windows como atalho para migrar perfil.
12. Não atualizar, reiniciar ou publicar durante inventário.
13. Não apagar histórico para esconder uma rota ruim.
14. Depreciar o padrão antigo e preservar rollback.
15. Tratar TEMP como volátil.
16. Hash prova bytes, não significado nem funcionamento.
17. Teste verde precisa sobreviver a contraexemplo e mutação.
18. Erro do instrumento deve ser separado do erro auditado.
19. Resultado parcial permanece parcial.
20. Se o escopo divergir, parar e perguntar.

## Ações destrutivas

Sem autorização explícita e alvo resolvido, permanecem proibidos:

- exclusão;
- limpeza recursiva;
- sobrescrita;
- rename/move de runtime ativo;
- junction/symlink;
- mudança de perfil;
- update/restart;
- commit/push/merge;
- alteração de credencial.

## Recuperabilidade

Preferir:

```text
novo arquivo
→ revisão
→ teste
→ troca reversível
→ rollback provado
```

Evitar correção silenciosa do artefato que falhou. O erro anterior é parte da
prova.

