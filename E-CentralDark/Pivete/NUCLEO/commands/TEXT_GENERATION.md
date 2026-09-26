# COMANDO - TEXT_GENERATION.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\hugging-face\skills\transformers.js\references\TEXT_GENERATION.md
**SHA:** 7407cb31a88eaa2c
**Timestamp:** 2026-08-26T18:31:12.710725
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- skip_prompt: true,
- const prompt = document.getElementById('prompt').value;
- skip_prompt: true,
- skip_prompt: true,

### Ouro Bruto (primeiros 5000 chars)
```
# Text Generation Guide

Guide to generating text with Transformers.js, including streaming and chat format.

## Table of Contents

1. [Basic Generation](#basic-generation)
2. [Streaming](#streaming)
3. [Chat Format](#chat-format)
4. [Generation Parameters](#generation-parameters)
5. [Model Selection](#model-selection)
6. [Best Practices](#best-practices)

## Basic Generation

```javascript
import { pipeline } from '@huggingface/transformers';

const generator = await pipeline(
  'text-generation',
  'onnx-community/Qwen2.5-0.5B-Instruct',
  { dtype: 'q4' }
);

const result = await generator('Once upon a time', {
  max_new_tokens: 100,
  temperature: 0.7,
});

console.log(result[0].generated_text);

// Clean up when done
await generator.dispose();
```

## Streaming

Stream tokens as they're generated for better UX. Once you understand streaming, you can combine it with other features like chat format.

### Node.js

```javascript
import { pipeline, TextStreamer } from '@huggingface/transformers';

const generator = await pipeline(
  'text-generation',
  'onnx-community/Qwen2.5-0.5B-Instruct',
  { dtype: 'q4' }
);

const streamer = new TextStreamer(generator.tokenizer, {
  skip_prompt: true,
  skip_special_tokens: true,
  callback_function: (token) => {
    process.stdout.write(token);
  },
});

await generator('Tell me a story', {
  max_new_tokens: 200,
  temperature: 0.7,
  streamer,
});
```

### Browser

```html
<!DOCTYPE html>
<html>
<body>
  <textarea id="prompt" placeholder="Enter prompt..."></textarea>
  <button onclick="generate()">Generate</button>
  <div id="output"></div>

  <script type="module">
    import { pipeline, TextStreamer } from 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1';
    
    const generator = await pipeline(
      'text-generation',
      'onnx-community/Qwen2.5-0.5B-Instruct',
      { dtype: 'q4' }
    );
    
    window.generate = async function() {
      const prompt = document.getElementById('prompt').value;
      const outputDiv = document.getElementById('output');
      outputDiv.textContent = '';
      
      const streamer = new TextStreamer(generator.tokenizer, {
        skip_prompt: true,
        skip_special_tokens: true,
        callback_function: (token) => {
          outputDiv.textContent += token;
        },
      });
      
      await generator(prompt, {
        max_new_tokens: 200,
        temperature: 0.7,
        streamer,
      });
    };
  </script>
</body>
</html>
```

### React

```jsx
import { useState, useRef, useEffect } from 'react';
import { pipeline, TextStreamer } from '@huggingface/transformers';

function StreamingGenerator() {
  const generatorRef = useRef(null);
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async (prompt) => {
    if (!prompt) return;
    
    setLoading(true);
    setOutput('');
    
    // Load model on first generate
    if (!generatorRef.current) {
      generatorRef.current = await pipeline(
        'text-generation',
        'onnx-community/Qwen2.5-0.5B-Instruct',
        { dtype: 'q4' }
      );
    }
    
    const streamer = new TextStreamer(generatorRef.current.tokenizer, {
      skip_prompt: true,
      skip_special_tokens: true,
      callback_function: (token) => {
        setOutput((prev) => prev + token);
      },
    });

    await generatorRef.current(prompt, {
      max_new_tokens: 200,
      temperature: 0.7,
      streamer,
    });
    
    setLoading(false);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (generatorRef.current) {
        generatorRef.current.dispose();
      }
    };
  }, []);

  return (
    <div>
      <button onClick={() => handleGenerate('Tell me a story')} disabled={loading}>
        {loading ? 'Generating...' : 'Generate'}
      </button>
      <div>{output}</div>
    </div>
  );
}
```

## Chat Format

Use structured messages for conversations. Works with both basic generation and streaming (just add `streamer` parameter).

### Single Turn

```javascript
import { pipeline } from '@huggingface/transformers';

const generator = await pipeline(
  'text-generation',
  'onnx-community/Qwen2.5-0.5B-Instruct',
  { dtype: 'q4' }
);

const messages = [
  { role: 'system', content: 'You are a helpful assistant.' },
  { role: 'user', content: 'How do I create an async function?' }
];

const result = await generator(messages, {
  max_new_tokens: 256,
  temperature: 0.7,
});

console.log(result[0].generated_text);
```

### Multi-turn Conversation

```javascript
const conversation = [
  { role: 'system', content: 'You are a helpful assistant.' },
  { role: 'user', content: 'What is JavaScript?' },
  { role: 'assistant', content: 'JavaScript is a programming language...' },
  { role: 'user', content: 'Can you show an example?' }
];

const result = await generator(conversation, {
  max_new_tokens: 200,
  temperature: 0.7,
});

// To add streaming, just pass a streamer:
// streamer:
```