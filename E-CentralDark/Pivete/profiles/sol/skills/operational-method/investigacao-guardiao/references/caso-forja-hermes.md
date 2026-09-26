# CASO — Origem da figura feminina na forja-de-cartas.html (CONSOLIDADO)

Investigação FORENSE/SILENCIOSA aplicada (2026-08-25, Hermes-CASA pivete).
Artefato de ouro: E:\CentralDark\workspace\sol\investigacao-forja\VEREDITO.md

## Alvo
Mulher de fundo numa card MTG "HERMES, O NEUROFILÓLOGO ANCIÃO" gerada por
`E:\CentralDark\workspace\sol\forja-de-cartas.html`. CHEFE suspeitava que ela
vinha do asset embutido, não de upload.

## Técnica que funcionou (reprodutível)
1. **Ler código como texto (SILENCIOSA).** grep nas linhas-chave:
   - `ARTES` object (linha ~511): `const ARTES = { hermes, sol };` → 2 chaves JPEG base64
   - lógica (695-697): `if(c.arteUrl) return c.arteUrl; if(c.arte && ARTES[c.arte]) return ARTES[c.arte]; return gerarSigilo(...)`
   - card def (591): `id:'hermes', nome:'Hermes, o Neurofilólogo Ancião'`
2. **Decodificar asset embutido p/ hash (sem executar binário):**
   ```python
   import re, base64, hashlib
   html = open(r"E:\CentralDark\workspace\sol\forja-de-cartas.html", encoding='utf-8').read()
   m = re.search(r'hermes:\s*"([^"]+)"', html)
   data = m.group(1); b64 = data.split(',',1)[1]
   img = base64.b64decode(b64)
   open(r"E:\CentralDark\Pivete\cache\artes_hermes.png",'wb').write(img)
   print(len(img), hashlib.sha256(img).hexdigest())
   ```
   -> 54255 bytes, SHA256 `81e2efdd4482448ca8ec9f33460a862a345bcf606d488015ff5101ed545f5bb5`
   (JPEG 726x432.)
3. **Disco:** find maxdepth 4 por png/jpg/jpeg/webp em Pivete/workspace/Pictures/Documents,
   hashear 145 imagens, comparar -> **0 match** ao SHA. Logo não é arquivo solto do user.
4. **Git:** `git remote -v` -> ServerVpss/CentralDark. `git ls-remote origin` + `git log origin/main -- <file>`
   -> asset é BYTE-IDENTICO ao commit `2f20f34ea` (SegredoiDev + Claude Code, PR #1121)
   em `ServerVpss/CentralDark@main`. Prova que a imagem já vivia no repo.
5. **Atribuição:** grep por credito/source/unsplash/midjourney/dalle/EXIF -> nada.
   Vision: "ilustração digital, provável IA-generated (rosto plástico, ASCII gibberish)".
   -> ASSET_EMBUTIDO, sem dono, IDENTIDADE_REAL = INDEFINIDO.

## Veredito final
```
A_MULHER_E = ASSET_EMBUTIDO (IA-generated, sem atribuição)
IDENTIDADE_REAL = INDEFINIDO
```
Ela "apareceu" porque o card cai no branch `arte=='hermes'` -> `ARTES.hermes`.
Não upload, não pessoa real.

## 3o VERTICE — MetaLupa sobre si mesmo (o que o CHEFE exigiu)
Triângulo epistemológico: DESCONHECIDO não ganha execução / PESSOA não perde
privacidade / DECLARAÇÃO não ganha status de prova. Claims do agente verificados
COM prova material:
- "REGRA DE OURO gravada" -> `E:\CentralDark\Pivete\memories\USER.md` linha 5 (lido) OK
- "sub-agente rodando" -> `cache/delegation/live/deleg_2aadf4e4/task-0.log` (15.4KB, vivo) OK
- "SHA e 81e2efdd" -> arquivo 54255B + sha256sum recalculado OK
Nenhuma afirmação ficou só na boca. DECLARACAO != PROVA virou regra operacional.

## Erros desta sessão (não repetir)
- Conclui "veio de upload" antes de testar o caminho discriminante (arteUrl vs embutida).
  Corrigido com MetaLupa: devolver PROVADO/NOT_PROVEN + evidência, não inferir.
- Chamei "ninguém do sistema" sem prova -> viro NOT_DEMONSTRATED.
- Não carimbar declaração de interface como fato técnico.
