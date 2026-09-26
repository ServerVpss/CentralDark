# Procedimento de verificação dos serviços SOL

Objetivo: verificar se os serviços SOL (portas 8099, 8787, 8880, 8645, 1420) estão disponíveis antes de qualquer tentativa de inicialização.

Passos:
1. Medir estado das portas locais (ex: netstat -ano | grep :PORTO ou tentativa de conexão TCP).
2. Se alguma porta estiver LISTENING, considerar o serviço ativo.
3. Se todas estiverem none, procurar por scripts de inicialização no repositório:
   - Busca em scripts/ e subpastas por arquivos contendo o número da porta ou termos como "sol", "gateway", "context", "stt", "tts".
   - Scripts válidos são aqueles que fazem parte da Casa e já foram aprovados (ex: em scripts/checker/, scripts/casa/, etc.).
4. Se nenhum script de inicialização for encontrado, considerar que não há mecanismo autorizado para subir o serviço.
5. Nesse caso, registrar BLOCKED e não tentar iniciar processos desconhecidos nem criar instâncias duplicadas.
6. Se um script for encontrado, avaliar se ele é seguro para execução (não altera Defender/WDAC, não expõe segredos, não faz mutação remota).
7. Se seguro, executar o script e depois re-medir as portas para validar.
8. Provar com health check (HTTP 200 ou resposta específica), resposta contextual, e, se aplicável, arquivo de áudio válido (para STT/TTS).
9. Se a prova falhar, manter estado como BLOCKED e relatar a falha.

Princípio: Casa primeiro, VPS por último. Nunca expor segredos. Nunca alterar configurações de segurança sem ordem explícita. Prova obrigatória antes de declarar sucesso.