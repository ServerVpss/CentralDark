# Bugfix 2026-08-23 — Write Path Correction

## Problema
O `escrever_cristal` estava escrevendo na raiz do NUCLEO em vez do subdireitório correto (`commands/`, `contracts/`, etc).

## Causa
```python
# INCORRETO — usa os.path.dirname(destino_abs) que volta para a raiz do NUCLEO
filepath = os.path.join(os.path.dirname(destino_abs), base_name)
```

## Correção
```python
# CORRETO — usa o diretório destino absoluto diretamente
os.makedirs(destino_abs, exist_ok=True)
filepath = os.path.join(destino_abs, base_name)
```

## Arquivo Corrigido
`auto_destilador.py` — método `escrever_cristal` (linha ~300)

## Teste
Após correção, arquivo de teste `COMANDO_TESTE_AUTO_DESTILADOR.txt` deve ser escrito em:
- `E:/CentralDark/Pivete/NUCLEO/commands/COMANDO_TESTE_AUTO_DESTILADOR.md`
- NÃO em `E:/CentralDark/Pivete/NUCLEO/COMANDO_TESTE_AUTO_DESTILADOR.md`