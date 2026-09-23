import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { z } from "zod";

const execFileAsync = promisify(execFile);
const TRANSCRIPT_SCRIPT = "scripts/media/fetch_youtube_transcript.py";
const READ_ANNOT = {
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: true,
};

function textBlock(text) {
  return { content: [{ type: "text", text }] };
}

function safeUrl(value) {
  try {
    const url = new URL(value);
    if (!['youtube.com', 'www.youtube.com', 'youtu.be', 'www.youtu.be', 'm.youtube.com'].includes(url.hostname)) {
      throw new Error('HOST_NAO_YOUTUBE');
    }
    return url.toString();
  } catch {
    throw new Error('URL_YOUTUBE_INVALIDA');
  }
}

export const youtubeMediaTools = [
  {
    name: "youtube_transcript",
    description: "Extrai legendas públicas de um vídeo YouTube usando o adaptador local. Não baixa vídeo/áudio, não usa API key própria e retorna segmentos com timestamps para o fluxo de pesquisa e aprendizado. Se as legendas não existirem, devolve UNKNOWN; Whisper/áudio é fallback separado e explícito.",
    annotations: { ...READ_ANNOT, title: "Extrair legenda YouTube" },
    inputSchema: z.object({
      url: z.string().min(12).describe("URL youtube.com ou youtu.be"),
      language: z.string().max(80).optional().describe("Idiomas em ordem de preferência, separados por vírgula; padrão pt,en"),
    }),
    handler: async (input) => {
      const url = safeUrl(input.url);
      const args = ["run", "--quiet", "--with", "youtube-transcript-api", "python", TRANSCRIPT_SCRIPT, url, "--language", input.language || "pt,en"];
      try {
        const { stdout } = await execFileAsync("uv", args, {
          cwd: process.env.CENTRALDARK_ROOT || process.cwd(),
          timeout: 45_000,
          maxBuffer: 4 * 1024 * 1024,
          env: { ...process.env, PYTHONUNBUFFERED: "1" },
        });
        const result = JSON.parse(stdout.trim());
        return textBlock(JSON.stringify({
          ...result,
          source_url: url,
          learning_route: result.ok ? "CONSUMIR_TRANSCRIPT_E_ENVIAR_DELTA_PROVADO_A_REGISTRAR_APRENDIZADO" : "NAO_PROMOVER_UNKNOWN",
          audio_fallback: "EXPLICITO_SEM_DOWNLOAD_AUTOMATICO",
        }, null, 2));
      } catch (error) {
        let result = null;
        try { result = JSON.parse(error.stdout?.toString().trim() || ""); } catch {}
        return textBlock(JSON.stringify(result || {
          ok: false,
          status: "TRANSCRIPT_ADAPTER_ERROR",
          source_url: url,
          error_class: error.code === "ETIMEDOUT" ? "TIMEOUT" : "ADAPTER_FAILURE",
          error: String(error.message || error).slice(0, 300),
        }, null, 2));
      }
    },
  },
];
