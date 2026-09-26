# REFERENCIA - PIPELINE_OPTIONS.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\hugging-face\skills\transformers.js\references\PIPELINE_OPTIONS.md
**SHA:** b39c232774dc8cf1
**Timestamp:** 2026-08-26T18:31:14.623210
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- enableMemPattern: true,

### Ouro Bruto (primeiros 5000 chars)
```
# Pipeline Options Reference

Guide to configuring model loading and inference using the `PretrainedModelOptions` parameter in the `pipeline()` function.

## Table of Contents

1. [Overview](#overview)
2. [Basic Options](#basic-options)
3. [Model Loading Options](#model-loading-options)
4. [Device and Performance Options](#device-and-performance-options)
5. [Common Configuration Patterns](#common-configuration-patterns)

## Overview

The `pipeline()` function accepts three parameters:

```javascript
import { pipeline } from '@huggingface/transformers';

const pipe = await pipeline(
  'task-name',           // 1. Task type (e.g., 'sentiment-analysis')
  'model-id',            // 2. Model identifier (optional, uses default if null)
  options                // 3. PretrainedModelOptions (optional)
);
```

The third parameter, `options`, allows you to configure how the model is loaded and executed.

### Available Options

```typescript
interface PretrainedModelOptions {
  // Progress tracking
  progress_callback?: (info: ProgressInfo) => void;
  
  // Model configuration
  config?: PretrainedConfig;
  
  // Cache and loading
  cache_dir?: string;
  local_files_only?: boolean;
  revision?: string;
  
  // Model-specific settings
  subfolder?: string;
  model_file_name?: string;
  
  // Device and performance
  device?: DeviceType | Record<string, DeviceType>;
  dtype?: DataType | Record<string, DataType>;
  
  // External data format (large models)
  use_external_data_format?: boolean | number | Record<string, boolean | number>;
  
  // ONNX Runtime settings
  session_options?: InferenceSession.SessionOptions;
}
```

## Basic Options

### Progress Callback

Track model download and loading progress. **Note:** Models consist of multiple files (model weights, config, tokenizer, etc.), and each file reports its own progress:

```javascript
const fileProgress = {};

const pipe = await pipeline('sentiment-analysis', null, {
  progress_callback: (info) => {
    if (info.status === 'progress') {
      fileProgress[info.file] = info.progress;
      console.log(`${info.file}: ${info.progress.toFixed(1)}%`);
    }
    
    if (info.status === 'done') {
      console.log(`✓ ${info.file} complete`);
    }
  }
});
```

**Progress Info Types:**

```typescript
type ProgressInfo = {
  status: 'initiate' | 'download' | 'progress' | 'done' | 'ready';
  name: string;       // Model id or path
  file: string;       // File being processed
  progress?: number;  // Percentage (0-100, only for 'progress' status)
  loaded?: number;    // Bytes downloaded (only for 'progress' status)
  total?: number;     // Total bytes (only for 'progress' status)
};
```

**Example: Browser Loading UI with Multiple Files**

```javascript
const statusDiv = document.getElementById('status');
const progressContainer = document.getElementById('progress-container');
const fileProgressBars = {};

const pipe = await pipeline('image-classification', null, {
  progress_callback: (info) => {
    if (info.status === 'progress') {
      // Create progress bar for each file if not exists
      if (!fileProgressBars[info.file]) {
        const fileDiv = document.createElement('div');
        fileDiv.innerHTML = `
          <div class="file-name">${info.file}</div>
          <div class="progress-bar">
            <div class="progress-fill" style="width: 0%"></div>
          </div>
        `;
        progressContainer.appendChild(fileDiv);
        fileProgressBars[info.file] = fileDiv.querySelector('.progress-fill');
      }
      
      // Update progress bar
      fileProgressBars[info.file].style.width = `${info.progress}%`;
      
      const mb = (info.loaded / 1024 / 1024).toFixed(2);
      const totalMb = (info.total / 1024 / 1024).toFixed(2);
      statusDiv.textContent = `${info.file}: ${mb}/${totalMb} MB`;
    }
    
    if (info.status === 'ready') {
      statusDiv.textContent = 'Model ready!';
    }
  }
});
```

For more progress tracking examples, see the examples in this section above.

### Custom Configuration

Override the model's default configuration:

```javascript
import { pipeline } from '@huggingface/transformers';

const pipe = await pipeline('text-generation', 'model-id', {
  config: {
    max_length: 512,
    temperature: 0.8,
    // ... other config options
  }
});
```

**Use cases:**
- Override default generation parameters
- Adjust model-specific settings
- Test different configurations without modifying model files

## Model Loading Options

### Cache Directory

Specify where to cache downloaded models:

```javascript
// Node.js: Custom cache location
const pipe = await pipeline('sentiment-analysis', 'model-id', {
  cache_dir: './my-custom-cache'
});
```

**Default behavior:**
- If not specified, uses `env.cacheDir` (default: `./.cache`)
- Only applies when `env.useFSCache = true` (Node.js)
- Browser cache uses Cache API (configured via `env.cacheKey`)



### Local Files Only

Prevent any network requests:

```javascript
const pipe = await
```