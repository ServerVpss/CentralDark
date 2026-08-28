# Política de Deploy do CentralDark

## Princípios

1. **Segurança antes de mutação** — todo deploy passa por preflight (chattr, dirty state, validação de ambiente).
2. **Prova exige rastreabilidade** — HEAD da VPS == origin/main, dist compilado do source correto, runtime executando bytes verificados.
3. **Forensics antes de diagnóstico** — vincular evento → worker/PID → código executado antes de atribuir causa.
4. **Health é corpo, não apenas HTTP** — health check deve validar identidade do serviço, não apenas resposta HTTP 200.
5. **Estabilidade é janela, não instantâneo** — processo vivo em um instante não prova estabilidade; exige múltiplas amostras durante janela mínima (20s, 5 amostras).

## Preflight de segurança

- Verificar `chattr +i` em paths protegidos
- Registrar estado dirty do worktree
- Validar ambiente de deploy (variáveis, permissões)

## Preflight de build

- Build isolado em worktree ou ambiente scratch
- `npm ci` (não `npm install`)
- Typecheck passando
- Testes passando
- Build gerando dist válido

## Validação de dist

- Dist gerado existe
- Hash do dist registrado
- Dist promovido atomicamente

## Runtime validation

### Health check
- HTTP 200 com corpo `.ok == true`
- `.service == "mcp-centraldark"`
- PM2 com PID válido
- Janela de estabilidade mínima de 20 segundos (5 amostras, 4s de intervalo)
- Verificação de processo efêmero (contraprova)

### Proveniência
- SSH para VPS e verificar `git rev-parse HEAD`
- Comparar com SHA da main
- Registrar hash do dist no VPS

## Forensics protocol

Quando algo falha:
1. Não restartar imediatamente
2. Capturar estado atual: PID, timestamp, Git HEAD no VPS, hash do dist, estado da porta (9100), logs recentes
3. Vincular ao evento: workerId, PID, código executado
4. Diagnosticar causa: após atribuição completa

## Registros obrigatórios
- T0: timestamp do evento
- T1: estado do sistema no momento
- Attribution: PID, worker, código
- Root Cause: análise fundamentada

## Rollback protocol

Quando rollback é necessário:
- Health check falhou após deploy
- Prova de proveniência falhou
- Incidente de segurança

Procedimento:
1. Identificar versão anterior (backup do dist)
2. Restaurar dist do backup
3. Restart com validação
4. Verificar health e estabilidade
5. Documentar causa do rollback

## Registro de deploy
Todo deploy deve gerar registro com:
- SHA do commit
- Hash do dist
- PID do processo
- Timestamp
- Resultado (sucesso/falha)
- Logs de saída

## Revisão de segurança
- PR de deploy deve incluir diff de segurança
- Revisão humana para mudanças críticas
- Registro de approvação

## Aprendizado
- Incidentes geram documento de aprendizado
- Regras de segurança atualizadas com base em falhas reais
- Padrões de forense refinados com experiência
