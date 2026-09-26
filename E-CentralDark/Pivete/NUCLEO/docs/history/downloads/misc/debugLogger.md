# OUTRO - debugLogger.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\apps\modulos\Bolt\source\app\utils\debugLogger.ts
**SHA:** d4aa6058db96ae38
**Timestamp:** 2026-08-28T02:56:20.220311
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- navigationStart: number;
- navigationStart: timing.navigationStart,

### Ouro Bruto (primeiros 5000 chars)
```
import { isMac, isWindows, isLinux } from './os';
import { isMobile } from './mobile';
import { PROVIDER_LIST, DEFAULT_MODEL } from './constants';
import { logger } from './logger';

// Lazy import to avoid circular dependencies
let logStore: any = null;
const getLogStore = () => {
  if (!logStore && typeof window !== 'undefined') {
    try {
      // Import and set the logStore on first access
      import('~/lib/stores/logs')
        .then(({ logStore: store }) => {
          logStore = store;
        })
        .catch(() => {
          // Ignore import errors
        });
    } catch {
      // Ignore errors
    }
  }

  return logStore;
};

// Configuration interface for debug logger
export interface DebugLoggerConfig {
  enabled: boolean;
  maxEntries: number;
  captureConsole: boolean;
  captureNetwork: boolean;
  captureErrors: boolean;
  debounceTerminal: number; // ms
}

// Circular buffer implementation for memory efficiency
class CircularBuffer<T> {
  private _buffer: (T | undefined)[];
  private _head = 0;
  private _tail = 0;
  private _size = 0;

  constructor(private _capacity: number) {
    this._buffer = new Array(_capacity);
  }

  push(item: T): void {
    this._buffer[this._tail] = item;
    this._tail = (this._tail + 1) % this._capacity;

    if (this._size < this._capacity) {
      this._size++;
    } else {
      this._head = (this._head + 1) % this._capacity;
    }
  }

  toArray(): T[] {
    const result: T[] = [];
    let current = this._head;

    for (let i = 0; i < this._size; i++) {
      const item = this._buffer[current];

      if (item !== undefined) {
        result.push(item);
      }

      current = (current + 1) % this._capacity;
    }

    return result;
  }

  clear(): void {
    this._buffer = new Array(this._capacity);
    this._head = 0;
    this._tail = 0;
    this._size = 0;
  }

  getSize(): number {
    return this._size;
  }
}

export interface DebugLogData {
  timestamp: string;
  sessionId: string;
  systemInfo: SystemInfo;
  appInfo: AppInfo;
  logs: LogEntry[];
  errors: ErrorEntry[];
  networkRequests: NetworkEntry[];
  performance: PerformanceEntry;
  state: StateEntry;
  userActions: UserActionEntry[];
  terminalLogs: TerminalEntry[];
}

export interface SystemInfo {
  platform: string;
  userAgent: string;
  screenResolution: string;
  viewportSize: string;
  isMobile: boolean;
  timezone: string;
  language: string;
  cookiesEnabled: boolean;
  localStorageEnabled: boolean;
  sessionStorageEnabled: boolean;
}

export interface AppInfo {
  version: string;
  buildTime: string;
  currentModel: string;
  currentProvider: string;
  projectType: string;
  workbenchView: string;
  hasActivePreview: boolean;
  unsavedFiles: number;
  workbenchState?: {
    currentView: string;
    showWorkbench: boolean;
    showTerminal: boolean;
    artifactsCount: number;
    filesCount: number;
    unsavedFiles: number;
    hasActivePreview: boolean;
  };
  gitInfo?: {
    branch: string;
    commit: string;
    isDirty: boolean;
    remoteUrl?: string;
    lastCommit?: {
      message: string;
      date: string;
      author: string;
    };
  };
}

export interface LogEntry {
  timestamp: string;
  level: 'trace' | 'debug' | 'info' | 'warn' | 'error';
  scope?: string;
  message: string;
  data?: any;
}

export interface ErrorEntry {
  timestamp: string;
  type: 'javascript' | 'react' | 'terminal' | 'network' | 'unknown';
  message: string;
  stack?: string;
  url?: string;
  line?: number;
  column?: number;
  userAgent?: string;
  context?: any;
}

export interface NetworkEntry {
  timestamp: string;
  method: string;
  url: string;
  status?: number;
  duration?: number;
  requestSize?: number;
  responseSize?: number;
  error?: string;
}

export interface PerformanceEntry {
  navigationStart: number;
  loadTime: number;
  domContentLoaded: number;
  firstPaint?: number;
  firstContentfulPaint?: number;
  memoryUsage?: {
    used: number;
    total: number;
    limit: number;
  };
  timing: any; // Using any instead of deprecated PerformanceTiming
}

export interface StateEntry {
  currentView: string;
  showWorkbench: boolean;
  showTerminal: boolean;
  artifactsCount: number;
  filesCount: number;
  alerts: Array<{
    type: string;
    title: string;
    source?: string;
  }>;
}

export interface UserActionEntry {
  timestamp: string;
  action: string;
  target?: string;
  data?: any;
}

export interface TerminalEntry {
  timestamp: string;
  type: 'input' | 'output' | 'error';
  content: string;
  command?: string;
}

class DebugLogger {
  private _logs: CircularBuffer<LogEntry>;
  private _errors: CircularBuffer<ErrorEntry>;
  private _networkRequests: CircularBuffer<NetworkEntry>;
  private _userActions: CircularBuffer<UserActionEntry>;
  private _terminalLogs: CircularBuffer<TerminalEntry>;
  private _config: DebugLoggerConfig;
  private _isCapturing = false;
  private _isInitialized = false;

  // Store original functions
  private _originalConsoleLog: typeo
```