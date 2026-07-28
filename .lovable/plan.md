# Pacote "Fluxo Seguro CentralDark" — explicação leiga + 2 artefatos visuais + ZIP

## O que vou entregar

Um único pacote em `/mnt/documents/fluxo-seguro-centraldark.zip` contendo:

1. `01-EXPLICACAO-LEIGA-AUDITORIA.md` — versão humana da auditoria read-only anterior (o "raio-X" do fluxo GitHub ↔ Lovable ↔ produção que já rodei).
2. `02-EXPLICACAO-LEIGA-FLUXO-PROMOCAO.md` — versão humana do fluxo novo que você pediu agora (promoção travada + ambiente protegido + artefato imutável + rollback).
3. `diagrama-01-auditoria-atual.png` — infográfico do estado atual (o que existe, o que falha, onde vaza).
4. `diagrama-02-fluxo-alvo.png` — infográfico do fluxo alvo (dev → auditoria → main → produção com trava de SHA, artefato imutável e rollback).
5. `README.md` — índice do pacote, como ler e o que fazer depois.

Sem editar nada do código do projeto. Sem PR, sem commit, sem deploy. Só pacote de apresentação em `/mnt/documents/`.

## Como as explicações leigas serão escritas

Linguagem de conversa, sem jargão. Cada documento segue esta estrutura curta:

- **O que é isso, em uma frase.**
- **Por que existe (o problema real que resolve).**
- **Como funciona, passo a passo, contado como história.**
- **O que muda pra você no dia a dia.**
- **Onde pode dar ruim e o que o sistema faz sozinho.**

Doc 1 (auditoria) traduz os achados críticos: `main` desprotegida, 2953 commits de bots inflando histórico, workflows que só rodam em PR e não protegem push direto, ausência de rollback e de artefato imutável, Lupa sem veto real no CI.

Doc 2 (fluxo alvo) traduz os 3 pedidos técnicos:
- **Trava de SHA na promoção**: por que `expected_head_sha` impede "merge fantasma" quando alguém empurra commit no meio do caminho.
- **Ambiente `production` protegido**: reviewers obrigatórios + timer de espera + checks verdes no SHA candidato antes de qualquer deploy.
- **Artefato imutável**: build UMA vez, assina, guarda, e o deploy só reusa esse mesmo pacote — nunca reconstrói na VPS.
- **Rollback automático**: se `/health` ou smoke test falhar depois do deploy, a VPS volta sozinha pro último SHA saudável e registra o `run_id` + resultado.

## Como os 2 diagramas serão gerados

Vou usar `imagegen` no tier **premium** (texto legível é obrigatório em infográfico), 1536×1024, fundo escuro esmeralda (`#052e2b` / `#0a3d38`), destaques `#10b981` / `#34d399`, tipografia limpa estilo Linear/Vercel. Sem roxo, sem branco puro, sem preto puro — respeitando o padrão visual oficial do projeto.

**Diagrama 01 — Auditoria (estado atual):**
Três colunas conectadas — GitHub · Lovable · VPS Produção. Marcadores vermelhos onde há furo (main desprotegida, bots escrevendo direto, sem artefato imutável, sem rollback, workflows só em PR). Legenda 🟢 OK / 🟡 parcial / 🔴 furo. Números-chave da auditoria (2953 commits à frente, 22 workflows, X% ausentes).

**Diagrama 02 — Fluxo alvo (promoção segura):**
Trilho horizontal em 5 estações:
`pivete/dev` → `pivete/auditoria` → `main` → `Artefato Imutável (SHA+assinatura)` → `Environment: production (reviewers + timer)` → `Deploy VPS` → `Health/Smoke` → (✅ segue | ❌ rollback automático pro último SHA saudável).
Cada estação com ícone, 1 linha explicando e selo do check obrigatório. Caixa lateral "Trava expected_head_sha" mostrando como bloqueia merge se HEAD mudou.

## Como o ZIP é montado

```text
/mnt/documents/fluxo-seguro-centraldark/
  README.md
  01-EXPLICACAO-LEIGA-AUDITORIA.md
  02-EXPLICACAO-LEIGA-FLUXO-PROMOCAO.md
  diagrama-01-auditoria-atual.png
  diagrama-02-fluxo-alvo.png
```

Depois `zip -r fluxo-seguro-centraldark.zip fluxo-seguro-centraldark/` no mesmo diretório. Devolvo o caminho final do zip pronto pra baixar.

## Detalhes técnicos (pra quem quiser conferir)

- Nada toca o repositório do projeto — só escrita em `/mnt/documents/`.
- Imagens geradas com `imagegen--generate_image` model `premium` (texto legível), sem transparência, `.png`.
- Markdown 100% PT-BR, tom conversacional conforme `mem://~user`.
- Não incluo secrets, tokens, nomes reais, nem SHAs de commits privados sensíveis — só os públicos já citados na auditoria anterior.
- Se qualquer imagem sair com texto ilegível, refaço com prompt ajustado antes de fechar o zip.

## O que NÃO faço neste pacote

- Não implemento o workflow de promoção, não altero branch protection, não mexo em environment `production`, não escrevo o script de rollback. Isso fica pra uma missão de execução separada, com "PERMITO PIVETE" explícito, seguindo o Fluxo de Ouro. Este pacote é só a apresentação leiga + visual, pra você aprovar o desenho antes de mandar construir.
