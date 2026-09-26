import { handleSafeError, resolveRequestId } from '../middlewares';

export interface BotServerHealthRequest {
  headers?: Record<string, unknown>;
  requestId?: string;
}

export interface BotServerHealth {
  ok: true;
  service: 'bot-server';
  status: 'skeleton';
  pm2Enabled: false;
  security: {
    requestId: string;
    safeErrors: true;
    workspaceGuardReady: true;
    payloadGuardReady: true;
  };
  timestamp: string;
}

export interface BotServerHealthResponse {
  statusCode: number;
  body:
    | BotServerHealth
    | {
        ok: false;
        error: ReturnType<typeof handleSafeError>['body']['error'];
      };
}

export function getBotServerHealth(request: BotServerHealthRequest = {}): BotServerHealthResponse {
  const { requestId } = resolveRequestId(request);

  try {
    return {
      statusCode: 200,
      body: {
        ok: true,
        service: 'bot-server',
        status: 'skeleton',
        pm2Enabled: false,
        security: {
          requestId,
          safeErrors: true,
          workspaceGuardReady: true,
          payloadGuardReady: true,
        },
        timestamp: new Date().toISOString(),
      },
    };
  } catch (error) {
    const handled = handleSafeError(error, requestId);
    return {
      statusCode: handled.statusCode,
      body: handled.body,
    };
  }
}
