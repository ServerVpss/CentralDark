import {
  handleSafeError,
  resolveRequestId,
  resolveWorkspaceContext,
  validateSafePayload,
} from '../src/api/middlewares';
import { forbidden } from '../src/shared/utils';

function assert(condition: unknown, message: string): void {
  if (!condition) {
    throw new Error(`Teste falhou: ${message}`);
  }
}

function assertThrows(fn: () => void, message: string): void {
  let thrown = false;
  try {
    fn();
  } catch {
    thrown = true;
  }
  assert(thrown, message);
}

export function runSecurityMiddlewaresSelfTest(): void {
  const resolvedHeader = resolveRequestId({ headers: { 'x-request-id': 'req_manual_123' } });
  assert(resolvedHeader.requestId === 'req_manual_123', 'requestId deve respeitar header válido');

  const generated = resolveRequestId({ headers: { 'x-request-id': '../invalido' } });
  assert(generated.requestId.startsWith('req_'), 'requestId inválido deve gerar id seguro');

  const context = resolveWorkspaceContext({
    workspaceId: 'workspace_123',
    contextWorkspaceId: 'workspace_123',
    userId: 'user_123',
    requestId: 'req_123456',
  });
  assert(context.workspaceId === 'workspace_123', 'workspace válido deve criar contexto');

  assertThrows(
    () => resolveWorkspaceContext({ workspaceId: 'workspace_a', contextWorkspaceId: 'workspace_b' }),
    'workspace diferente deve ser bloqueado',
  );

  const payload = validateSafePayload({
    recipient: '+55 (71) 99999-0000',
    text: 'mensagem segura',
    tags: ['vip', 'teste'],
    requestId: 'req_123456',
  });
  assert(payload.recipient === '+5571999990000' || payload.recipient === '5571999990000', 'destinatário deve ser sanitizado');
  assert(payload.text === 'mensagem segura', 'texto deve ser mantido sanitizado');
  assert(payload.tags.length === 2, 'tags válidas devem passar');

  assertThrows(
    () => validateSafePayload({ recipient: '', text: 'mensagem segura' }),
    'destinatário vazio deve falhar',
  );

  assertThrows(
    () => validateSafePayload({ recipient: '+5571999990000', text: '' }),
    'texto vazio deve falhar',
  );

  const handled = handleSafeError(forbidden('bloqueado', 'req_abc123'), 'req_abc123');
  assert(handled.statusCode === 403, 'erro forbidden deve retornar status 403');
  assert(handled.body.ok === false, 'erro seguro deve retornar ok false');
  assert(handled.body.error.requestId === 'req_abc123', 'erro seguro deve preservar requestId');
}

runSecurityMiddlewaresSelfTest();
