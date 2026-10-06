# PADRÃO — Gargalo Chrome / Processos Windows (Menos é Mais)

> Fonte: medição viva 2026-08-19 + conhecimento operacional da Casa.
> Dono: HERMES (executor). Autoridade: SEGREDO/CHEFE.

## Contexto
O CHEFE roda Chrome com múltiplas abas no Windows. Gargalos de RAM/CPU
aparecem porque o Chrome spawna ~20+ processos (renderer, gpu, utility,
zygote, crashpad) por instância. Nem sempre é órfão — pode ser o próprio
Chrome ativo pesando.

## Padrão medido (estado vivo 2026-08-19)
- Chrome ativo do CHEFE = 1 instância, PID pai `21516` (MUDA a cada
  restart do Chrome — não é fixo!).
- `21516` → pai `23980` → ~22 filhos (todos legítimos, são as abas/extensões).
- msedge.exe (8) = webview do Windows, normal, não mexer.
- python.exe (2) = workers do Hermes, normal.
- node.exe = 0 (não há node travado).

## Regra de ouro (Menos é Mais)
1. **NUNCA matar o PID pai do Chrome ativo do CHEFE** (o que tem as abas).
2. **Filhos dentro do PID do CHEFE NÃO são anomalia** — são abas sendo abertas.
3. Só matar processo Chrome se:
   - for de OUTRA instância (parent PID diferente do Chrome ativo), OU
   - o CHEFE mandar matar tudo (incluindo o ativo).
4. O ID do Chrome ativo **muda** — sempre remedir antes de agir:
   `wmic process where "name='chrome.exe' and CommandLine like '%--type=%'" ...`
   O browser process NÃO tem `--type=` na command line.

## Comando de medição (sem matar)
```bat
:: Lista Chrome com arvore pai/filho
wmic process where "name='chrome.exe'" get ProcessId,ParentProcessId,CommandLine
```
- Browser process = command line é só `"...\chrome.exe"` (sem `--type=`).
- Renderer/GPU/etc = tem `--type=renderer` / `--type=gpu` etc.

## Comando de limpeza cirúrgica (só se houver órfão)
```bat
:: Mata só processos que NÃO descendem do Chrome ativo do CHEFE
:: (substituir PAI_ATIVO pelo PID pai medido agora)
taskkill /F /IM chrome.exe /FI "PID ne PAI_ATIVO"
```
⚠️ Se todos os Chrome forem do mesmo pai, NÃO há órfão — não matar nada.

## Calculo Menos é Mais (heurística)
- Gargalo = RAM > 2GB só de Chrome + BitDefender ~500MB?
  → matar só se houver instância órfã separada.
- Se é 1 instância só (todas abas do CHEFE) → não matar, avisar CHEFE.
- Sempre: medir → classificar (ativo vs órfão) → agir mínimo → re-medir.

## Guardrail
- Não fechar navegador do CHEFE sem ordem explícita.
- Nonce/ID do Chrome é volátil — remedir todo evento.
- Vault = segundo cérebro: este padrão vive aqui, não só na memória volátil.
