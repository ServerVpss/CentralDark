# Material Externo — Padrão de Absorção (Sessão 06/08/2026)

Quando o Pivete manda "salva isso", "observa", "verifica relevância" de material
externo (PDF, gist, vídeo, artigo, GitHub repo), aplicar este fluxo:

## Fontes processadas nesta sessão
| Material | Tipo | Conexão com a Casa |
|---|---|---|
| Fable 5 Workflows (YouMind) | artigo | arquitetura agente-líder = SOL líder + workers |
| Opus 4.5 Soul Document (Gist) | doc | princípios de identidade de modelo |
| fable-soul (GitHub) | skill | PRIMO GÊMEO do MetaLupa + Mandato Celestial |
| Dream Memory (Karpathy/Anthropic) | guia PDF | base do job cron noturno "Dream" |
| Red Teaming GPT (PDF) | paper | base acadêmica das 5 classes de ameaça |

## Fluxo
1. `browser_navigate` ou `execute_code`(pymupdf) para extrair texto
2. Resumir em tópicos (NÃO copiar tudo)
3. Salvar em `memories/CONHECIMENTOS-UTEIS.md` com seção numerada
4. Conectar à Casa: "isso é igual a X que já temos" ou "isso melhora Y"
5. Se houver melhoria acionável → propor, não aplicar sem PERMITO SEGREDO

## Nota de segurança (Dream Memory)
Memória automática = superfície de ataque. Fonte externa lida pelo agente =
vetor de contaminação. Revisão humana OBRIGATÓRIA para mudança de fonte não
confiável. Isso É o Fable Loop como ameaça canônica.

## yt-dlp para vídeo
`pip install yt-dlp` funciona. Listar legendas: `yt-dlp --list-subs <url>`.
Baixar legenda: `yt-dlp --write-subs --sub-lang pt-BR --skip-download <url>`.
Sem JS runtime warning é aceitável para legendas (não para formatos de vídeo).
