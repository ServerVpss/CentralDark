# COMANDO - voice.ts
**Origem:** E:\CentralDark\_MAPA_CASA\Nova pasta\.extracted_screenpipe-main.zip\screenpipe-main\packages\ai-gateway\src\handlers\voice.ts
**SHA:** 2a546a2f4dc8aadc
**Timestamp:** 2026-08-23T14:17:16.282258
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const systemPrompt = request.headers.get('system-prompt') || 'You are a helpful assistant.';
- const systemPrompt = request.headers.get('system-prompt') || 'You are a helpful assistant. Keep your responses concise.';

### Ouro Bruto (primeiros 5000 chars)
```
import { Env, TextToSpeechRequest, VoiceQueryResult, TranscriptionOptions, TTSOptions, TTSVoiceModelType, TranscriptionModelType } from '../types';
import { transcribeAudio, textToSpeech, validateAudioInput } from '../utils/voice-utils';
import { createProvider } from '../providers';
import { createSuccessResponse, createErrorResponse, addCorsHeaders } from '../utils/cors';

/**
 * Handles voice input transcription requests
 * @param request The HTTP request containing audio data
 * @param env Environment variables
 * @returns Response with transcription result
 */
export async function handleVoiceTranscription(request: Request, env: Env): Promise<Response> {
  const validation = await validateAudioInput(request);
  if (!validation.valid || !validation.audioBuffer) {
    return createErrorResponse(400, validation.error || 'Invalid audio input');
  }
  
  const languages = request.headers.get('detect_language')?.split(',') || ['en'];
  const sampleRate = request.headers.get('sample_rate') || '16000';
  const model: TranscriptionModelType = request.headers.get('transcription_model') as TranscriptionModelType || 'nova-3';
  const diarize = request.headers.get('diarize') === 'true';
  
  const transcriptionResult = await transcribeAudio(validation.audioBuffer, env, {
    languages,
    sampleRate,
    model,
    diarize,
    smartFormat: true
  });
  
  if (transcriptionResult.error || !transcriptionResult.text) {
    return createErrorResponse(
      400, 
      transcriptionResult.error || 'No speech detected in the audio'
    );
  }
  
  return createSuccessResponse({
    transcription: transcriptionResult.text,
    confidence: transcriptionResult.confidence,
    language: transcriptionResult.language,
    words: transcriptionResult.words
  });
}

/**
 * Handles voice query requests (audio in, AI text response out)
 * @param request HTTP request with audio data
 * @param env Environment variables
 * @returns HTTP response with transcription and AI response
 */
export async function handleVoiceQuery(request: Request, env: Env): Promise<Response> {
	try {
		const validation = await validateAudioInput(request);
		if (!validation.valid || !validation.audioBuffer) {
			return createErrorResponse(400, validation.error || 'Invalid audio input');
		}

		const transcriptionOptions: TranscriptionOptions = {
			model: (request.headers.get('transcription-model') as TranscriptionOptions['model']) || 'nova-3',
			languages: request.headers.get('detect_language')?.split(',') || ['en'],
			sampleRate: request.headers.get('sample_rate') || '16000',
			smartFormat: true,
			diarize: request.headers.get('diarize') === 'true',
			punctuate: request.headers.get('punctuate') !== 'false',
		};

		const aiModel = request.headers.get('ai-model') || 'gpt-5.4';
		const systemPrompt = request.headers.get('system-prompt') || 'You are a helpful assistant.';

		const transcriptionResult = await transcribeAudio(validation.audioBuffer, env, transcriptionOptions);

		if (transcriptionResult.error || !transcriptionResult.text) {
			return createErrorResponse(400, transcriptionResult.error || 'No speech detected in the audio');
		}

		const provider = createProvider(aiModel, env);

		const aiResponseData = await provider.createCompletion({
			model: aiModel,
			messages: [
				{ role: 'system', content: systemPrompt },
				{ role: 'user', content: transcriptionResult.text },
			],
			stream: false,
		});

		const aiResponse = await aiResponseData.json();

		const result: VoiceQueryResult = {
			transcription: transcriptionResult.text,
			transcription_details: {
				confidence: transcriptionResult.confidence,
				language: transcriptionResult.language,
				words: transcriptionResult.words,
			},
			ai_response: aiResponse,
		};

		return createSuccessResponse(result);
	} catch (error: any) {
		console.error('Error in voice query:', error);
		return createErrorResponse(500, `Error processing voice query: ${error.message}`);
	}
}

/**
 * Handles text-to-speech conversion (REST API)
 * @param request HTTP request with text to convert
 * @param env Environment variables
 * @returns HTTP response with audio data
 */
export async function handleTextToSpeech(request: Request, env: Env): Promise<Response> {
	try {
		const { text, voice = 'aura-asteria-en' } = (await request.json()) as TextToSpeechRequest;

		if (!text || typeof text !== 'string') {
			return createErrorResponse(400, 'Missing or invalid text parameter');
		}

		if (voice && !isValidVoiceModel(voice)) {
			return createErrorResponse(400, `Invalid voice model: ${voice}. See documentation for supported models.`);
		}

		const ttsOptions: TTSOptions = {
			voice: voice as TTSVoiceModelType,
			encoding: 'linear16',
		};

		const audioBuffer = await textToSpeech(text, env, ttsOptions);

		if (!audioBuffer) {
			return createErrorResponse(500, 'Failed to convert text to speech');
		}

		const response = new Response(audioBuffer, {
			headers: { 'Content-Type': 'audio/wav' },
		});

		return 
```

---

# COMANDO - voice.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.extracted_screenpipe-main.zip\screenpipe-main\packages\ai-gateway\src\handlers\voice.ts
**SHA:** 2a546a2f4dc8aadc3d051a5b6a575525123d0f1017fce9f4b7fdc747273221d3
**Timestamp:** 2026-08-23T23:44:08.450366
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const systemPrompt = request.headers.get('system-prompt') || 'You are a helpful assistant.';
- const systemPrompt = request.headers.get('system-prompt') || 'You are a helpful assistant. Keep your responses concise.';

### Ouro Bruto (primeiros 5000 chars)
```
import { Env, TextToSpeechRequest, VoiceQueryResult, TranscriptionOptions, TTSOptions, TTSVoiceModelType, TranscriptionModelType } from '../types';
import { transcribeAudio, textToSpeech, validateAudioInput } from '../utils/voice-utils';
import { createProvider } from '../providers';
import { createSuccessResponse, createErrorResponse, addCorsHeaders } from '../utils/cors';

/**
 * Handles voice input transcription requests
 * @param request The HTTP request containing audio data
 * @param env Environment variables
 * @returns Response with transcription result
 */
export async function handleVoiceTranscription(request: Request, env: Env): Promise<Response> {
  const validation = await validateAudioInput(request);
  if (!validation.valid || !validation.audioBuffer) {
    return createErrorResponse(400, validation.error || 'Invalid audio input');
  }
  
  const languages = request.headers.get('detect_language')?.split(',') || ['en'];
  const sampleRate = request.headers.get('sample_rate') || '16000';
  const model: TranscriptionModelType = request.headers.get('transcription_model') as TranscriptionModelType || 'nova-3';
  const diarize = request.headers.get('diarize') === 'true';
  
  const transcriptionResult = await transcribeAudio(validation.audioBuffer, env, {
    languages,
    sampleRate,
    model,
    diarize,
    smartFormat: true
  });
  
  if (transcriptionResult.error || !transcriptionResult.text) {
    return createErrorResponse(
      400, 
      transcriptionResult.error || 'No speech detected in the audio'
    );
  }
  
  return createSuccessResponse({
    transcription: transcriptionResult.text,
    confidence: transcriptionResult.confidence,
    language: transcriptionResult.language,
    words: transcriptionResult.words
  });
}

/**
 * Handles voice query requests (audio in, AI text response out)
 * @param request HTTP request with audio data
 * @param env Environment variables
 * @returns HTTP response with transcription and AI response
 */
export async function handleVoiceQuery(request: Request, env: Env): Promise<Response> {
	try {
		const validation = await validateAudioInput(request);
		if (!validation.valid || !validation.audioBuffer) {
			return createErrorResponse(400, validation.error || 'Invalid audio input');
		}

		const transcriptionOptions: TranscriptionOptions = {
			model: (request.headers.get('transcription-model') as TranscriptionOptions['model']) || 'nova-3',
			languages: request.headers.get('detect_language')?.split(',') || ['en'],
			sampleRate: request.headers.get('sample_rate') || '16000',
			smartFormat: true,
			diarize: request.headers.get('diarize') === 'true',
			punctuate: request.headers.get('punctuate') !== 'false',
		};

		const aiModel = request.headers.get('ai-model') || 'gpt-5.4';
		const systemPrompt = request.headers.get('system-prompt') || 'You are a helpful assistant.';

		const transcriptionResult = await transcribeAudio(validation.audioBuffer, env, transcriptionOptions);

		if (transcriptionResult.error || !transcriptionResult.text) {
			return createErrorResponse(400, transcriptionResult.error || 'No speech detected in the audio');
		}

		const provider = createProvider(aiModel, env);

		const aiResponseData = await provider.createCompletion({
			model: aiModel,
			messages: [
				{ role: 'system', content: systemPrompt },
				{ role: 'user', content: transcriptionResult.text },
			],
			stream: false,
		});

		const aiResponse = await aiResponseData.json();

		const result: VoiceQueryResult = {
			transcription: transcriptionResult.text,
			transcription_details: {
				confidence: transcriptionResult.confidence,
				language: transcriptionResult.language,
				words: transcriptionResult.words,
			},
			ai_response: aiResponse,
		};

		return createSuccessResponse(result);
	} catch (error: any) {
		console.error('Error in voice query:', error);
		return createErrorResponse(500, `Error processing voice query: ${error.message}`);
	}
}

/**
 * Handles text-to-speech conversion (REST API)
 * @param request HTTP request with text to convert
 * @param env Environment variables
 * @returns HTTP response with audio data
 */
export async function handleTextToSpeech(request: Request, env: Env): Promise<Response> {
	try {
		const { text, voice = 'aura-asteria-en' } = (await request.json()) as TextToSpeechRequest;

		if (!text || typeof text !== 'string') {
			return createErrorResponse(400, 'Missing or invalid text parameter');
		}

		if (voice && !isValidVoiceModel(voice)) {
			return createErrorResponse(400, `Invalid voice model: ${voice}. See documentation for supported models.`);
		}

		const ttsOptions: TTSOptions = {
			voice: voice as TTSVoiceModelType,
			encoding: 'linear16',
		};

		const audioBuffer = await textToSpeech(text, env, ttsOptions);

		if (!audioBuffer) {
			return createErrorResponse(500, 'Failed to convert text to speech');
		}

		const response = new Response(audioBuffer, {
			headers: { 'Content-Type': 'audio/wav' },
		});

		return 
```