# OUTRO - redis.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\@sentry\server-utils@10.71.0@@@1\build\cjs\integrations\tracing-channel\redis.js
**SHA:** 39a01905415c8ef4
**Timestamp:** 2026-08-28T02:23:25.181792
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- asyncStart: noop,

### Ouro Bruto (primeiros 5000 chars)
```
Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

const diagnosticsChannel = require('node:diagnostics_channel');
const attributes = require('@sentry/conventions/attributes');
const core = require('@sentry/core');
const debugBuild = require('../../debug-build.js');
const channels = require('../../orchestrion/channels.js');
const redisStatementSerializer = require('../../redis/redis-statement-serializer.js');
const tracingChannel = require('../../tracing-channel.js');

const INTEGRATION_NAME = "RedisChannel";
const ORIGIN = "auto.db.orchestrion.redis";
const ATTR_DB_CONNECTION_STRING = "db.connection_string";
const DB_SYSTEM_VALUE_REDIS = "redis";
function endSpan(span, err) {
  if (err) {
    span.setStatus({ code: core.SPAN_STATUS_ERROR, message: err instanceof Error ? err.message : String(err) });
  }
  span.end();
}
function runResponseHook(hook, span, command, args, result) {
  if (!hook) {
    return;
  }
  try {
    hook(span, command, args, result);
  } catch {
  }
}
function stripCommandOptions(args) {
  const first = args[0];
  if (core.isObjectLike(first) && Object.getOwnPropertySymbols(first).length > 0) {
    return args.slice(1);
  }
  return args;
}
function removeCredentialsFromConnectionString(url) {
  if (typeof url !== "string" || !url) {
    return void 0;
  }
  try {
    const parsed = new URL(url);
    parsed.searchParams.delete("user_pwd");
    parsed.username = "";
    parsed.password = "";
    return parsed.href;
  } catch {
    return void 0;
  }
}
function nodeRedisAttributes(options) {
  return {
    [attributes.DB_SYSTEM]: DB_SYSTEM_VALUE_REDIS,
    [attributes.NET_PEER_NAME]: options?.socket?.host,
    [attributes.NET_PEER_PORT]: options?.socket?.port,
    [ATTR_DB_CONNECTION_STRING]: removeCredentialsFromConnectionString(options?.url),
    [core.SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: ORIGIN
  };
}
function startCommandSpan(commandName, commandArgs, attributes$1) {
  return core.startInactiveSpan({
    name: `redis-${commandName}`,
    kind: core.SPAN_KIND.CLIENT,
    attributes: {
      ...attributes$1,
      [core.SEMANTIC_ATTRIBUTE_SENTRY_OP]: "db",
      [attributes.DB_STATEMENT]: redisStatementSerializer.defaultDbStatementSerializer(commandName, commandArgs)
    }
  });
}
function subscribeLegacyRedisCommand(responseHook) {
  const channel = diagnosticsChannel.tracingChannel(channels.CHANNELS.REDIS_COMMAND);
  const noop = () => {
  };
  channel.subscribe({
    end: noop,
    asyncStart: noop,
    asyncEnd: noop,
    start(data) {
      const command = data.arguments?.[0];
      if (!command || typeof command !== "object") {
        return;
      }
      const originalCallback = command.callback;
      if (typeof originalCallback !== "function") {
        return;
      }
      const client = data.self;
      const attributes$1 = {
        [attributes.DB_SYSTEM]: DB_SYSTEM_VALUE_REDIS,
        [core.SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: ORIGIN
      };
      attributes$1[attributes.NET_PEER_NAME] = client?.connection_options?.host;
      attributes$1[attributes.NET_PEER_PORT] = client?.connection_options?.port;
      if (client?.address) {
        attributes$1[ATTR_DB_CONNECTION_STRING] = `redis://${client.address}`;
      }
      const span = startCommandSpan(command.command, command.args ?? [], attributes$1);
      data._sentrySpan = span;
      const parentSpan = core.getActiveSpan();
      command.callback = function(err, reply) {
        if (!err) {
          runResponseHook(responseHook, span, command.command, command.args ?? [], reply);
        }
        endSpan(span, err);
        const args = arguments;
        return core.withActiveSpan(parentSpan ?? null, () => originalCallback.apply(this, args));
      };
    },
    error(data) {
      const span = data._sentrySpan;
      if (span) {
        endSpan(span, data.error);
      }
    }
  });
}
function bindNodeRedisCommandChannel(channelName, getWireArgs, responseHook) {
  const channel = diagnosticsChannel.tracingChannel(channelName);
  tracingChannel.bindTracingChannelToSpan(
    channel,
    (data) => {
      const wireArgs = getWireArgs(data);
      if (!wireArgs?.length) {
        return void 0;
      }
      const commandName = String(wireArgs[0]);
      const options = data.self?.options;
      return startCommandSpan(commandName, wireArgs.slice(1), nodeRedisAttributes(options));
    },
    {
      beforeSpanEnd(span, data) {
        if ("error" in data || !responseHook) {
          return;
        }
        const wireArgs = getWireArgs(data);
        if (wireArgs?.length) {
          runResponseHook(responseHook, span, String(wireArgs[0]), wireArgs.slice(1), data.result);
        }
      }
    }
  );
}
function getSendCommandArgs(data) {
  const args = data.arguments?.[0];
  return Array.isArray(args) ? args : void 0;
}
function getExecutorArgs(data) {
  const command = data.arguments?.[0];
  const jsArgs = data.arguments?.[1];
  if (typeof command?.transformArguments !== "function" || !Array
```

---

# OUTRO - redis.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\@sentry\server-utils@10.71.0@@@1\build\esm\integrations\tracing-channel\redis.js
**SHA:** a8b43879a2a8ba23
**Timestamp:** 2026-08-28T02:23:34.113510
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- asyncStart: noop,

### Ouro Bruto (primeiros 5000 chars)
```
import * as diagnosticsChannel from 'node:diagnostics_channel';
import { SERVER_PORT, SERVER_ADDRESS, DB_OPERATION_BATCH_SIZE, DB_SYSTEM_NAME, DB_STATEMENT, NET_PEER_PORT, NET_PEER_NAME, DB_SYSTEM } from '@sentry/conventions/attributes';
import { defineIntegration, debug, waitForTracingChannelBinding, getActiveSpan, withActiveSpan, startInactiveSpan, SPAN_KIND, SEMANTIC_ATTRIBUTE_SENTRY_OP, SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN, SPAN_STATUS_ERROR, isObjectLike } from '@sentry/core';
import { DEBUG_BUILD } from '../../debug-build.js';
import { CHANNELS } from '../../orchestrion/channels.js';
import { defaultDbStatementSerializer } from '../../redis/redis-statement-serializer.js';
import { bindTracingChannelToSpan } from '../../tracing-channel.js';

const INTEGRATION_NAME = "RedisChannel";
const ORIGIN = "auto.db.orchestrion.redis";
const ATTR_DB_CONNECTION_STRING = "db.connection_string";
const DB_SYSTEM_VALUE_REDIS = "redis";
function endSpan(span, err) {
  if (err) {
    span.setStatus({ code: SPAN_STATUS_ERROR, message: err instanceof Error ? err.message : String(err) });
  }
  span.end();
}
function runResponseHook(hook, span, command, args, result) {
  if (!hook) {
    return;
  }
  try {
    hook(span, command, args, result);
  } catch {
  }
}
function stripCommandOptions(args) {
  const first = args[0];
  if (isObjectLike(first) && Object.getOwnPropertySymbols(first).length > 0) {
    return args.slice(1);
  }
  return args;
}
function removeCredentialsFromConnectionString(url) {
  if (typeof url !== "string" || !url) {
    return void 0;
  }
  try {
    const parsed = new URL(url);
    parsed.searchParams.delete("user_pwd");
    parsed.username = "";
    parsed.password = "";
    return parsed.href;
  } catch {
    return void 0;
  }
}
function nodeRedisAttributes(options) {
  return {
    [DB_SYSTEM]: DB_SYSTEM_VALUE_REDIS,
    [NET_PEER_NAME]: options?.socket?.host,
    [NET_PEER_PORT]: options?.socket?.port,
    [ATTR_DB_CONNECTION_STRING]: removeCredentialsFromConnectionString(options?.url),
    [SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: ORIGIN
  };
}
function startCommandSpan(commandName, commandArgs, attributes) {
  return startInactiveSpan({
    name: `redis-${commandName}`,
    kind: SPAN_KIND.CLIENT,
    attributes: {
      ...attributes,
      [SEMANTIC_ATTRIBUTE_SENTRY_OP]: "db",
      [DB_STATEMENT]: defaultDbStatementSerializer(commandName, commandArgs)
    }
  });
}
function subscribeLegacyRedisCommand(responseHook) {
  const channel = diagnosticsChannel.tracingChannel(CHANNELS.REDIS_COMMAND);
  const noop = () => {
  };
  channel.subscribe({
    end: noop,
    asyncStart: noop,
    asyncEnd: noop,
    start(data) {
      const command = data.arguments?.[0];
      if (!command || typeof command !== "object") {
        return;
      }
      const originalCallback = command.callback;
      if (typeof originalCallback !== "function") {
        return;
      }
      const client = data.self;
      const attributes = {
        [DB_SYSTEM]: DB_SYSTEM_VALUE_REDIS,
        [SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: ORIGIN
      };
      attributes[NET_PEER_NAME] = client?.connection_options?.host;
      attributes[NET_PEER_PORT] = client?.connection_options?.port;
      if (client?.address) {
        attributes[ATTR_DB_CONNECTION_STRING] = `redis://${client.address}`;
      }
      const span = startCommandSpan(command.command, command.args ?? [], attributes);
      data._sentrySpan = span;
      const parentSpan = getActiveSpan();
      command.callback = function(err, reply) {
        if (!err) {
          runResponseHook(responseHook, span, command.command, command.args ?? [], reply);
        }
        endSpan(span, err);
        const args = arguments;
        return withActiveSpan(parentSpan ?? null, () => originalCallback.apply(this, args));
      };
    },
    error(data) {
      const span = data._sentrySpan;
      if (span) {
        endSpan(span, data.error);
      }
    }
  });
}
function bindNodeRedisCommandChannel(channelName, getWireArgs, responseHook) {
  const channel = diagnosticsChannel.tracingChannel(channelName);
  bindTracingChannelToSpan(
    channel,
    (data) => {
      const wireArgs = getWireArgs(data);
      if (!wireArgs?.length) {
        return void 0;
      }
      const commandName = String(wireArgs[0]);
      const options = data.self?.options;
      return startCommandSpan(commandName, wireArgs.slice(1), nodeRedisAttributes(options));
    },
    {
      beforeSpanEnd(span, data) {
        if ("error" in data || !responseHook) {
          return;
        }
        const wireArgs = getWireArgs(data);
        if (wireArgs?.length) {
          runResponseHook(responseHook, span, String(wireArgs[0]), wireArgs.slice(1), data.result);
        }
      }
    }
  );
}
function getSendCommandArgs(data) {
  const args = data.arguments?.[0];
  return Array.isArray(args) ? args : void 0;
}
function getExecutorArgs(data) {
  const command = data.arguments?.[0];
  const jsArgs = data.arguments?
```