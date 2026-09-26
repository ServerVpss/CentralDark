const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const SECRET_KEY = 'hermesRouter.apiKey';
const DEFAULT_BASE_URL = 'http://127.0.0.1:8099/v1';

function configuration() {
  return vscode.workspace.getConfiguration('hermesRouter');
}

function normalizeBaseUrl(value) {
  return String(value || DEFAULT_BASE_URL).replace(/\/+$/, '');
}

function cancelled(token) {
  if (token && token.isCancellationRequested) {
    throw new Error('Hermes Router request cancelled.');
  }
}

function modelRole(role) {
  const roles = vscode.LanguageModelChatMessageRole || {};
  if (role === roles.Assistant || String(role).toLowerCase() === 'assistant') {
    return 'assistant';
  }
  if (role === roles.System || String(role).toLowerCase() === 'system') {
    return 'system';
  }
  return 'user';
}

function isInstance(value, type) {
  return typeof type === 'function' && value instanceof type;
}

function textFromPart(part) {
  if (isInstance(part, vscode.LanguageModelTextPart)) {
    return part.value;
  }
  if (typeof part === 'string') {
    return part;
  }
  if (part && typeof part.value === 'string') {
    return part.value;
  }
  if (part && typeof part.text === 'string') {
    return part.text;
  }
  return '';
}

function textFromParts(parts) {
  return (Array.isArray(parts) ? parts : [parts])
    .map(textFromPart)
    .filter(Boolean)
    .join('');
}

function toolResultText(result) {
  if (!result) {
    return '';
  }
  if (Array.isArray(result.content)) {
    return result.content.map(textFromPart).filter(Boolean).join('');
  }
  return textFromPart(result);
}

function convertMessages(messages) {
  const output = [];
  for (const message of messages || []) {
    const role = modelRole(message.role);
    const parts = Array.isArray(message.content) ? message.content : [message.content];
    const toolResults = parts.filter((part) => isInstance(part, vscode.LanguageModelToolResultPart));
    const toolCalls = parts.filter((part) => isInstance(part, vscode.LanguageModelToolCallPart));
    const text = parts.map(textFromPart).filter(Boolean).join('');

    for (const result of toolResults) {
      output.push({
        role: 'tool',
        tool_call_id: result.callId,
        content: toolResultText(result)
      });
    }

    if (role === 'assistant' && toolCalls.length > 0) {
      output.push({
        role: 'assistant',
        content: text || null,
        tool_calls: toolCalls.map((call, index) => ({
          id: call.callId || `hermes-tool-${index}`,
          type: 'function',
          function: {
            name: call.name,
            arguments: JSON.stringify(call.input || {})
          }
        }))
      });
      continue;
    }

    if (toolResults.length > 0) {
      if (text) {
        output.push({ role, content: text });
      }
      continue;
    }

    output.push({ role, content: text });
  }
  return output;
}

function convertTools(tools) {
  return (tools || []).map((tool) => ({
    type: 'function',
    function: {
      name: tool.name,
      description: tool.description || '',
      parameters: tool.inputSchema || { type: 'object', properties: {} }
    }
  }));
}

function selectedRequestOptions(options, maxOutputTokens) {
  const source = options && options.modelOptions && typeof options.modelOptions === 'object'
    ? options.modelOptions
    : {};
  const allowed = [
    'temperature',
    'top_p',
    'frequency_penalty',
    'presence_penalty',
    'seed',
    'reasoning_effort'
  ];
  const result = { max_tokens: maxOutputTokens };
  for (const key of allowed) {
    if (source[key] !== undefined) {
      result[key] = source[key];
    }
  }
  if (source.max_tokens !== undefined) {
    result.max_tokens = source.max_tokens;
  }
  if (source.max_completion_tokens !== undefined) {
    result.max_completion_tokens = source.max_completion_tokens;
    delete result.max_tokens;
  }
  return result;
}

function configuredModelsFromYaml(content, providerName) {
  const lines = String(content || '').split(/\r?\n/);
  const providerPattern = new RegExp(`^\\s{2}${String(providerName).replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&')}:\\s*$`);
  let inProvider = false;
  let inModels = false;
  const models = [];

  for (const line of lines) {
    if (providerPattern.test(line)) {
      inProvider = true;
      inModels = false;
      continue;
    }
    if (!inProvider) {
      continue;
    }
    if (/^\s{2}\S/.test(line) && !/^\s{4}/.test(line)) {
      break;
    }
    if (/^\s{4}models:\s*$/.test(line)) {
      inModels = true;
      continue;
    }
    if (inModels) {
      const match = line.match(/^\s{6}-\s+(.+?)\s*$/);
      if (match) {
        const value = match[1].replace(/^['"]|['"]$/g, '').trim();
        if (value) {
          models.push(value);
        }
        continue;
      }
      if (line.trim() && !/^\s{6}/.test(line)) {
        break;
      }
    }
  }
  return models;
}

function hermesExecutableCandidates() {
  const home = process.env.HERMES_HOME || '';
  const localAppData = process.env.LOCALAPPDATA || '';
  return [
    process.env.HERMES_EXECUTABLE,
    path.join(home, 'hermes-agent', 'venv', 'Scripts', 'hermes.exe'),
    path.join(localAppData, 'hermes', 'hermes-agent', 'venv', 'Scripts', 'hermes.exe'),
    'hermes.exe',
    'hermes'
  ].filter(Boolean);
}

function discoverHermesConfigPath() {
  const configured = configuration().get('configPath', '');
  if (configured && fs.existsSync(configured)) {
    return configured;
  }
  for (const executable of hermesExecutableCandidates()) {
    try {
      const result = execFileSync(executable, ['config', 'path'], {
        encoding: 'utf8',
        timeout: 5000,
        windowsHide: true,
        env: process.env
      }).trim();
      if (result && fs.existsSync(result)) {
        return result;
      }
    } catch (_) {
      // Try the next known Hermes executable.
    }
  }
  return '';
}

async function readConfiguredModels() {
  if (!configuration().get('includeConfiguredModels', true)) {
    return [];
  }
  const configPath = discoverHermesConfigPath();
  if (!configPath) {
    return [];
  }
  try {
    const content = fs.readFileSync(configPath, 'utf8');
    return configuredModelsFromYaml(
      content,
      configuration().get('providerName', 'centraldark-router')
    );
  } catch (_) {
    return [];
  }
}

class HermesRouterProvider {
  constructor(context) {
    this.context = context;
    this.changeEmitter = new vscode.EventEmitter();
    this.onDidChangeLanguageModelChatInformation = this.changeEmitter.event;
    this.models = [];
    this.refreshing = null;
  }

  dispose() {
    this.changeEmitter.dispose();
  }

  async apiKey() {
    const envName = configuration().get('apiKeyEnv', 'CENTRALDARK_ROUTER_KEY');
    if (envName && process.env[envName]) {
      return process.env[envName];
    }
    return (await this.context.secrets.get(SECRET_KEY)) || '';
  }

  async requestJson(endpoint, init, token) {
    cancelled(token);
    const controller = new AbortController();
    const cancellation = token && token.onCancellationRequested(() => controller.abort());
    try {
      const headers = Object.assign({ Accept: 'application/json' }, init && init.headers);
      const key = await this.apiKey();
      if (key) {
        headers.Authorization = `Bearer ${key}`;
      }
      const response = await fetch(endpoint, Object.assign({}, init, {
        headers,
        signal: controller.signal
      }));
      const text = await response.text();
      if (!response.ok) {
        throw new Error(`Hermes Router returned HTTP ${response.status}: ${text.slice(0, 500)}`);
      }
      return text ? JSON.parse(text) : {};
    } finally {
      if (cancellation) {
        cancellation.dispose();
      }
    }
  }

  async provideLanguageModelChatInformation(_options, token) {
    if (!this.refreshing) {
      this.refreshing = this.refreshModels(token).finally(() => {
        this.refreshing = null;
      });
    }
    return this.refreshing;
  }

  async refreshModels(token) {
    const baseUrl = normalizeBaseUrl(configuration().get('baseUrl', DEFAULT_BASE_URL));
    let remoteModels = [];
    try {
      const result = await this.requestJson(`${baseUrl}/models`, { method: 'GET' }, token);
      remoteModels = Array.isArray(result.data) ? result.data : [];
    } catch (error) {
      if (this.models.length === 0) {
        const configuredOnly = await readConfiguredModels();
        if (configuredOnly.length === 0) {
          throw error;
        }
        remoteModels = configuredOnly.map((id) => ({ id, owned_by: 'hermes-config' }));
      }
    }

    const configured = await readConfiguredModels();
    const ids = new Set();
    const records = [];
    for (const item of remoteModels) {
      if (item && item.id && !ids.has(item.id)) {
        ids.add(item.id);
        records.push({ id: item.id, owner: item.owned_by || 'hermes-router' });
      }
    }
    for (const id of configured) {
      if (!ids.has(id)) {
        ids.add(id);
        records.push({ id, owner: 'hermes-config' });
      }
    }

    const previous = this.models.map((model) => model.id).join('\n');
    this.models = records.map((record) => this.modelInformation(record));
    const current = this.models.map((model) => model.id).join('\n');
    if (previous !== current) {
      this.changeEmitter.fire();
    }
    return this.models;
  }

  modelInformation(record) {
    const maxInputTokens = configuration().get('maxInputTokens', 114688);
    const maxOutputTokens = configuration().get('maxOutputTokens', 8192);
    return {
      id: record.id,
      name: record.id,
      family: 'hermes-router',
      version: 'router',
      maxInputTokens,
      maxOutputTokens,
      capabilities: {
        imageInput: false,
        toolCalling: true
      }
    };
  }

  async provideTokenCount(_model, text, token) {
    cancelled(token);
    const value = typeof text === 'string' ? text : JSON.stringify(text || '');
    return Math.max(1, Math.ceil(value.length / 4));
  }

  async provideLanguageModelChatResponse(model, messages, options, progress, token) {
    cancelled(token);
    const maxOutputTokens = configuration().get('maxOutputTokens', 8192);
    const tools = convertTools(options && options.tools);
    const body = Object.assign({
      model: model.id,
      messages: convertMessages(messages),
      stream: true
    }, selectedRequestOptions(options, maxOutputTokens));
    if (tools.length > 0) {
      body.tools = tools;
      const required = vscode.LanguageModelChatToolMode &&
        options && options.toolMode === vscode.LanguageModelChatToolMode.Required;
      body.tool_choice = required ? 'required' : 'auto';
    }

    const baseUrl = normalizeBaseUrl(configuration().get('baseUrl', DEFAULT_BASE_URL));
    const controller = new AbortController();
    const cancellation = token && token.onCancellationRequested(() => controller.abort());
    try {
      const headers = {
        Accept: 'text/event-stream, application/json',
        'Content-Type': 'application/json'
      };
      const key = await this.apiKey();
      if (key) {
        headers.Authorization = `Bearer ${key}`;
      }
      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
        signal: controller.signal
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Hermes Router returned HTTP ${response.status}: ${errorText.slice(0, 700)}`);
      }
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('text/event-stream') && response.body) {
        await this.consumeStream(response.body, progress, token);
      } else {
        const result = await response.json();
        this.reportMessage(result && result.choices && result.choices[0] && result.choices[0].message, progress);
      }
    } finally {
      if (cancellation) {
        cancellation.dispose();
      }
    }
  }

  reportMessage(message, progress) {
    if (!message) {
      return;
    }
    const content = typeof message.content === 'string'
      ? message.content
      : textFromParts(message.content || []);
    if (content) {
      progress.report(new vscode.LanguageModelTextPart(content));
    }
    const calls = Array.isArray(message.tool_calls) ? message.tool_calls : [];
    for (const call of calls) {
      const fn = call.function || {};
      let input = {};
      try {
        input = fn.arguments ? JSON.parse(fn.arguments) : {};
      } catch (_) {
        input = { raw_arguments: fn.arguments || '' };
      }
      progress.report(new vscode.LanguageModelToolCallPart(
        call.id || `hermes-tool-${Date.now()}`,
        fn.name || 'unknown',
        input
      ));
    }
  }

  async consumeStream(stream, progress, token) {
    const reader = stream.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    const toolCalls = new Map();

    const reportToolCalls = () => {
      for (const call of toolCalls.values()) {
        let input = {};
        try {
          input = call.arguments ? JSON.parse(call.arguments) : {};
        } catch (_) {
          input = { raw_arguments: call.arguments || '' };
        }
        progress.report(new vscode.LanguageModelToolCallPart(
          call.id || `hermes-tool-${call.index}`,
          call.name || 'unknown',
          input
        ));
      }
      toolCalls.clear();
    };

    const processEvent = (event) => {
      const data = event.split(/\r?\n/)
        .filter((line) => line.startsWith('data:'))
        .map((line) => line.slice(5).trim())
        .join('');
      if (!data || data === '[DONE]') {
        return data === '[DONE]';
      }
      let payload;
      try {
        payload = JSON.parse(data);
      } catch (_) {
        return false;
      }
      const choice = payload.choices && payload.choices[0];
      const delta = choice && choice.delta;
      if (delta && delta.content) {
        progress.report(new vscode.LanguageModelTextPart(delta.content));
      }
      if (delta && Array.isArray(delta.tool_calls)) {
        for (const part of delta.tool_calls) {
          const index = part.index || 0;
          const current = toolCalls.get(index) || { index, id: '', name: '', arguments: '' };
          if (part.id) current.id = part.id;
          if (part.function && part.function.name) current.name += part.function.name;
          if (part.function && part.function.arguments) current.arguments += part.function.arguments;
          toolCalls.set(index, current);
        }
      }
      if (choice && choice.finish_reason) {
        reportToolCalls();
      }
      return false;
    };

    while (true) {
      cancelled(token);
      const { value, done } = await reader.read();
      buffer += decoder.decode(value || new Uint8Array(), { stream: !done });
      let separator;
      while ((separator = buffer.search(/\r?\n\r?\n/)) >= 0) {
        const event = buffer.slice(0, separator);
        buffer = buffer.slice(separator).replace(/^\r?\n\r?\n/, '');
        if (processEvent(event)) {
          await reader.cancel();
          reportToolCalls();
          return;
        }
      }
      if (done) {
        if (buffer.trim()) {
          processEvent(buffer);
        }
        reportToolCalls();
        return;
      }
    }
  }
}

async function activate(context) {
  const provider = new HermesRouterProvider(context);
  context.subscriptions.push(provider);
  context.subscriptions.push(
    vscode.lm.registerLanguageModelChatProvider('hermes-router', provider)
  );

  context.subscriptions.push(vscode.commands.registerCommand('hermes-router.refreshModels', async () => {
    try {
      const models = await provider.refreshModels();
      vscode.window.showInformationMessage(`Hermes Router: ${models.length} modelos disponíveis.`);
    } catch (error) {
      vscode.window.showErrorMessage(`Hermes Router: ${error.message}`);
    }
  }));

  context.subscriptions.push(vscode.commands.registerCommand('hermes-router.setApiKey', async () => {
    const value = await vscode.window.showInputBox({
      prompt: 'Chave da API do Hermes Router (deixe vazio para remover)',
      password: true,
      ignoreFocusOut: true
    });
    if (value === undefined) {
      return;
    }
    if (value) {
      await context.secrets.store(SECRET_KEY, value);
    } else {
      await context.secrets.delete(SECRET_KEY);
    }
    await provider.refreshModels();
    vscode.window.showInformationMessage('Hermes Router: credencial atualizada no Secret Storage do VS Code.');
  }));

  const intervalSeconds = configuration().get('refreshIntervalSeconds', 30);
  if (intervalSeconds > 0) {
    const timer = setInterval(() => {
      provider.refreshModels().catch(() => undefined);
    }, intervalSeconds * 1000);
    context.subscriptions.push({ dispose: () => clearInterval(timer) });
  }
}

function deactivate() {}

module.exports = { activate, deactivate };