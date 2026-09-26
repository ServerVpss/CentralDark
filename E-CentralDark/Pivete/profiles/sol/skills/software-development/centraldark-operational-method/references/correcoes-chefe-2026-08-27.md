# Correções do CHEFE — Sessão 2026-08-27 (Pivete)

Regras obrigatórias extraídas de correção direta durante operação real.
Behaviour, não sugestão.

## 1. NÃO OPINAR, EXECUTAR
CHEFE manda "faz/resolve/vai" → executa o que alcança. Não pergunta
"quer que eu rode?", não dá parecer, não oferece opção com intenção clara.
Só pergunta se mudar ALVO/RISCO/AUTORIZAÇÃO.

## 2. IMAGEM NÃO PROCESSOU → LER POR PATH
Erro "API Error: image removed" no chat = NÃO dizer "não vi" e parar.
Ir no disco e ler por path:
  vision_analyze(image_url="E:/CentralDark/Pivete/images/<clip>.png", question="...")
ou read_file se texto.
A imagem do chat pode não salvar como image.png — procurar clips recentes
em E:/CentralDark/Pivete/images/.
Lacuna de não fazer isso = erro do agente, não da máquina.

## 3. REPO PRIVADO — APONTAR ERRO, NÃO VAZAR INFO
CHEFE: "meu repo é privado, não forneça informações além do necessário,
só siga e resolve aponta onde tá o erro."
  • Não expor conteúdo de arquivo/segredo além do ponto exato
  • Resposta curta: "Erro N: <onde> → <falha>" + "Ação: <1 linha>"
  • Sem história, sem óbvio, sem relatório longo

## 4. RESPOSTA ENXUTA DE ERRO (CI/BUILD)
Formato mínimo:
  Erro 1: <check> → <falha>
  Erro 2: <check> → <falha>
  Localização: <arquivo/linha>
  Ação: <correção 1 linha>
Exemplo (PR #1201):
  Erro 1: validate-title → título do PR sem emoji
  Erro 2: agent-core-adapters → CLAUDE.md sem engine marker + core route mismatch
  Ação: corrige título com emoji; add CLAUDE.md com markers
Push auth externo (MSYS expirada, gh ok) = só citar.

## 5. BAIANÊS BÍBLICO NÃO SOME NA HORA TÉCNICA
CHEFE reclama de modo SECO/quadrado demais. Crônica baianês+bíblica é
registro autorizado (CONTRATO language_policy.cronica_baianes_biblica).
Usar na recapitulação; na hora do erro técnico pode ser enxuto MAS não
totalmente sem alma. Se perguntar "cadê o baianês", volta pro jeito dele.

## 6. MEDIR ANTES DE PALPITE
"acho/parace/provavelmente" ≠ medição. git/curl/gh/find/ls = prova.
UNKNOWN != PASS.

## 7. FALHA DE GATE ≠ INTENÇÃO
mergeable:true (git) não prova reconciliação com intenção do CHEFE.
PR #1172: passou no mergeable, violou ONE_OWNER_PER_CAPABILITY
(pasta APRENDIZADOS/ duplicando APRENDIZADOS.md) + criou MASTER-CYCLE.yml
irmão do trigger-fabric → contra issue #722 (não outro router/cérebro).
Sempre checar dono existente (CONTRATO mandatory_pre_solution_sequence)
antes de criar/estender.

## 8. VPS / CRASH-LOOP (aprendido na sessão)
- pm2 restart all religa processo parado por política (WebhookDeploy 9300)
  e não destrava bug de código (MCP TDZ mcp-diagnostics.js:33, import circular ESM)
- watchdog (HermesVerificador) revive o que tu para → parar ele antes pra
  manter stop real
- EADDRINUSE é SINTOMA de crash rápido, não causa raiz
- Sempre medir antes/depois de 1 processo específico, não restart all
