# Ignorando diretórios específicos no ESLint

Quando você precisa excluir diretórios do processo de lint (como dados extraídos, artefatos de build, dados forenses, etc.), adicione-os à lista de `ignores` no `eslint.config.js`.

## Por que ignorar?

- Evita que o lint processe arquivos desnecessários (melhorando desempenho)
- Remove falsos positivos de código que não faz parte do fonte principal
- Mantém o foco do lint no código-fonte real do projeto

## Como fazer

No seu `eslint.config.js`, localize a configuração do `tseslint.config` e adicione os diretórios à propriedade `ignores`:

```js
export default tseslint.config(
  { ignores: ["dist", "_forense"] }, // ← adicione aqui os diretórios a ignorar
  {
    // ... restante da configuração
  },
);
```

## Exemplo prático desta sessão

Durante a atualização do Dependabot para eslint@9.39.5, foi necessário excluir o diretório `_forense` (que contém dados extraídos de investigação forense) pois:
- Ele contém milhares de arquivos de código de terceiros
- Gerava erros de lint irrelevantes para o desenvolvimento do CentralDark
- Incluiria no lint atrasava significativamente o processo

Após adicionar `"_forense"` aos `ignores`, o lint passou a processar apenas o código-fonte relevante.

## Diretórios comuns para ignorar em CentralDark

- `dist/` - artefatos de build
- `_forense/` - dados extraídos de investigações forenses
- `node_modules/` - embora normalmente já seja ignorado por padrão, pode ser reiterado
- `coverage/` - relatórios de teste
- `tmp/` ou `temp/` - arquivos temporários

> **Nota**: Sempre verifique se o diretório realmente não deveria ser lintado antes de ignorá-lo. Nunca ignore código-fonte principal do projeto.