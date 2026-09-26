# Diretrizes para exclusão de diretórios externos do lint

Quando o lint (ESLint) incide sobre diretórios que não são parte do código-fonte principal do projeto (ex: dados forenses, artefatos de terceiros, backups), ele gera ruido desnecessário e pode mascarar problemas reais.

## Técnica correta
Atualizar `eslint.config.js` para incluir o diretório na lista de `ignores`:

```js
export default tseslint.config(
  { ignores: ["dist", "_forense"] }, // ← adicione diretórios externos aqui
  {
    /* configuração existente */
  },
);
```

## Princípios
- **Reuse before create**: Se o padrão de ignores já existir, apenas estenda-o (nunca criar configuração paralela).
- **Menor movimento eficaz**: Altere apenas o necessário para resolver o ruido.
- **Prova**: Após a alteração, execute `npm run lint` e verifique que nenhum caminho contendo o diretório excluído aparece na saída.
- **Zero regressão**: A alteração não deve afetar o lint sobre o código-fonte principal.

## Quando aplicar
- Diretórios de dados externos (ex: `_forense`, `backup`, `temp`).
- Artefatos de ferramentas de terceiros que não fazem parte do build principal.
- Qualquer diretório que seja leitura-only para o projeto e não contribua para o artefato entregável.

## Quando NÃO aplicar
- Código-fonte do projeto (mesmo que seja legado ou temporário).
- Diretórios que são parte do processo de build ou teste.
- Qualquer coisa que possa afetar o artefato final ou a experiência do usuário.

> ℹ️ Este padrão já foi validado em ajustes anteriores (ex: `node_modules`, `dist`). Sempre prefere estender ignores existentes em vez de criar novas entradas duplicadas.