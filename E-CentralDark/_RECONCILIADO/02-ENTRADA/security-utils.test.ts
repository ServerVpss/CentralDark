import {
  assertSameWorkspace,
  badRequest,
  forbidden,
  sanitizePhone,
  sanitizeTags,
  sanitizeText,
  toSafeErrorPayload,
  toSafeLogPayload,
  validateMessageText,
  validatePhone,
  validateTags,
  validateWorkspaceId,
} from '../src/shared/utils';

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

export function runSecurityUtilsSelfTest(): void {
  assert(sanitizeText('  ola  ') === 'ola', 'sanitizeText deve trimar texto');
  assert(sanitizeText('token=abc123') === '[REDACTED]', 'sanitizeText deve mascarar token');
  assert(sanitizeText('Authorization: Bearer abc.def') === '[REDACTED]', 'sanitizeText deve mascarar bearer');

  assert(sanitizePhone('(55) 71 99999-0000') === '5571999990000', 'sanitizePhone deve manter apenas telefone seguro');

  const tags = sanitizeTags([' vip ', 'token=abc', 123, 'ok']);
  assert(tags.length === 3, 'sanitizeTags deve filtrar itens inválidos');
  assert(tags[1] === '[REDACTED]', 'sanitizeTags deve sanitizar segredo em tag');

  const safeLog = toSafeLogPayload({ token: 'abc', nested: { password: '123', ok: 'sim' } }) as Record<string, unknown>;
  assert(safeLog.token === '[REDACTED]', 'toSafeLogPayload deve mascarar token');
  assert((safeLog.nested as Record<string, unknown>).password === '[REDACTED]', 'toSafeLogPayload deve mascarar password aninhado');

  assert(validateWorkspaceId('workspace_123').ok, 'workspace válido deve passar');
  assert(!validateWorkspaceId('').ok, 'workspace vazio deve falhar');
  assert(!validateWorkspaceId('../x').ok, 'workspace com path inválido deve falhar');

  assert(validateMessageText('mensagem segura').ok, 'mensagem válida deve passar');
  assert(!validateMessageText('').ok, 'mensagem vazia deve falhar');

  assert(validatePhone('+5571999990000').ok, 'telefone válido deve passar');
  assert(!validatePhone('').ok, 'telefone vazio deve falhar');

  assert(validateTags(['a', 'b']).ok, 'tags válidas devem passar');

  assertThrows(
    () => assertSameWorkspace({ workspaceId: 'workspace_a' }, 'workspace_b'),
    'assertSameWorkspace deve bloquear workspace diferente',
  );

  const err = badRequest('Erro seguro.');
  assert(err.toPayload().statusCode === 400, 'badRequest deve retornar 400');
  assert(forbidden().toPayload().statusCode === 403, 'forbidden deve retornar 403');
  assert(toSafeErrorPayload(new Error('stack privada')).message === 'Erro interno seguro.', 'erro desconhecido deve ser sanitizado');
}

runSecurityUtilsSelfTest();
