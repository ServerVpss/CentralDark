

# Agrupar Comandos Relacionados em Menus de Botões

## O que já existe
4 comandos com menu: `/cpf` (7 opções), `/nome` (2), `/cnh` (5), `/score` (2)

## Novos agrupamentos a criar

Comandos que passariam a exibir botões ao invés de executar direto:

| Comando | Botões (módulos) | Descrição |
|---------|-----------------|-----------|
| `/placa` | placa, chassi, renavam, motor, veiculos | Consulta veicular completa |
| `/foto` | foto (nacional), fotocnh, fotodetran, fotonc + fotos por estado (AL, PB, PE, RN, MA Presos) | Fotos disponíveis |
| `/parentes` | parentes, mae, pai | Vínculos familiares |
| `/processos` | processos, mandado, processo | Justiça e processos |
| `/advogado` | advogadocpf, advogadooab, advogadooabuf | Consulta OAB |
| `/cat` | catcpf, catnumero | Acidente de trabalho |
| `/crlv` | crlvmt, crlvto, crlvmt-foto, crlvto-foto | Documentos de veículo |
| `/cep` | cep, endereco | Localização |

## O que muda

### Arquivo: `supabase/functions/telegram-webhook/index.ts`

1. **Expandir `MODULE_MENU`** com os 8 novos agrupamentos, cada um com `description`, `options[]` (key, label, emoji, desc)

2. **Limpar `commandMap`** — remover entradas individuais que agora são cobertas pelo menu (ex: `chassi`, `renavam`, `motor` ficam apenas dentro do menu `/placa`)

3. **Manter a lógica existente** — se só 1 módulo habilitado, executa direto; se múltiplos, mostra menu com botões

### Resultado
- Menos comandos para o usuário memorizar
- Interface consistente com o padrão já usado no `/cpf`
- Cada botão com descrição clara do que consulta
- Segurança mantida (ownership por userId)

