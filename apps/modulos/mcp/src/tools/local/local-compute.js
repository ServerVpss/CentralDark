// Ferramentas read-only para capacidade local híbrida da Casa.
// A Casa/GPU/áudio/vídeo entram como sensor/capacidade autorizada, não como juiz.
import { z } from "zod";
import { execFile, execFileSync } from "node:child_process";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";
const execAsync = promisify(execFile);
const nativeAdapter = fileURLToPath(new URL("../../../../../../scripts/vps/kylin-native-media.py", import.meta.url));
async function nativeCall(action, input) {
  try {
    const { stdout } = await execAsync("python3", [nativeAdapter, JSON.stringify({ ...input, action })], { timeout: 180000, maxBuffer: 8 * 1024 * 1024 });
    const data = JSON.parse(stdout);
    const content = [{ type: "text", text: JSON.stringify(data) }];
    if (action === "tts" && data.ok && data.result?.artifact) {
      const artifact = data.result.artifact;
      if (!/^centraldark\/[a-f0-9-]+\.wav$/.test(artifact)) throw new Error("ARTIFACT_ID_INVALID");
      const bytes = await readFile(new URL(artifact, `file://${process.env.HOME || "/root"}/.hermes/audio_cache/`));
      content.push({ type: "audio", mimeType: "audio/wav", data: bytes.toString("base64") });
    }
    return { isError: !data.ok, content };
  } catch (error) {
    return { isError: true, content: [{ type: "text", text: String(error.stdout || error.message).slice(0, 2000) }] };
  }
}
const nativeSpecs = [
 ["kylin_native_status", "status", "Estado vivo do runtime Kylin/Triton existente.", z.object({})],
 ["kylin_text_embedding", "embedding", "Embedding nativo GTE de texto, mean pooling normalizado.", z.object({text:z.string().min(1).max(4000)})],
 ["kylin_audio_synthesize", "tts", "Sintetiza WAV no TTS nativo instalado (ZH/EN; PT-BR não comprovado).", z.object({text:z.string().min(1).max(4000)})],
 ["kylin_audio_transcribe", "asr", "Transcreve mídia autorizada com ASR nativo; até 120 segundos.", z.object({path:z.string().min(1)})],
 ["kylin_image_analyze", "image", "Metadados e OCR real com Tesseract instalado; não promete descrição visual generativa.", z.object({path:z.string().min(1)})],
 ["kylin_image_embedding", "image_embedding", "Embedding CLIP nativo da imagem; carrega somente o modelo instalado allowlisted.", z.object({path:z.string().min(1)})],
 ["kylin_video_analyze", "video", "Analisa vídeo por amostragem OCR e ASR; até 120 segundos, 1 a 6 frames. Não gera vídeo.", z.object({path:z.string().min(1),frames:z.number().int().min(1).max(6).default(3)})]
];

function ok(data) {
  return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
}

function run(command, args, timeout = 6000) {
  try {
    return execFileSync(command, args, { encoding: "utf8", timeout, stdio: ["ignore", "pipe", "pipe"] }).trim();
  } catch (error) {
    return String(error?.stderr || error?.message || error).slice(0, 4000);
  }
}

function maybeJson(text) {
  try { return JSON.parse(text); } catch { return text || null; }
}

export const localHybridTools = [
  ...nativeSpecs.map(([name, action, description, inputSchema]) => ({ name, description, inputSchema, annotations: { readOnlyHint: action !== "tts", destructiveHint: false, openWorldHint: false }, handler: input => nativeCall(action, input) })),
  {
    name: "local_compute_status",
    description: "Inventaria, de forma read-only, CPU/GPU/RAM local disponível para ponte Casa↔VPS. Não agenda job, não executa GPU e não declara prova global.",
    annotations: { readOnlyHint: true, title: "Casa Local — CPU/GPU/RAM" },
    inputSchema: z.object({
      includeProcesses: z.boolean().default(false).optional(),
    }),
    handler: async (input) => {
      const isWindows = process.platform === "win32";
      const cpu = isWindows
        ? run("powershell.exe", ["-NoProfile", "-Command", "Get-CimInstance Win32_Processor | Select-Object Name,NumberOfCores,NumberOfLogicalProcessors,MaxClockSpeed | ConvertTo-Json -Compress"], 8000)
        : run("bash", ["-lc", "lscpu 2>/dev/null | sed -n '1,35p' || true"], 5000);
      const memory = isWindows
        ? run("powershell.exe", ["-NoProfile", "-Command", "Get-CimInstance Win32_ComputerSystem | Select-Object TotalPhysicalMemory | ConvertTo-Json -Compress"], 8000)
        : run("bash", ["-lc", "free -b 2>/dev/null || true"], 5000);
      const gpu = isWindows
        ? run("powershell.exe", ["-NoProfile", "-Command", "Get-CimInstance Win32_VideoController | Select-Object Name,AdapterRAM,DriverVersion | ConvertTo-Json -Compress"], 8000)
        : run("bash", ["-lc", "(nvidia-smi --query-gpu=name,memory.total,driver_version --format=csv,noheader 2>/dev/null || true); (rocm-smi --showproductname --showmeminfo vram 2>/dev/null || true)"], 8000);
      const processes = input.includeProcesses
        ? run("bash", ["-lc", "ps -eo pid,pcpu,pmem,comm,args | grep -Ei 'screenpipe|desktop-commander|ffmpeg|python|uvicorn|node|ollama|rocm|nvidia' | grep -v grep | head -80"], 8000)
        : null;
      return ok({
        schema: "centraldark.local-compute-status.v1",
        runtime_platform: process.platform,
        cpu: maybeJson(cpu),
        memory: maybeJson(memory),
        gpu: maybeJson(gpu),
        processes,
        local_resource_is_capacity: true,
        local_resource_is_proof: false,
        gpu_job_requires_queue_and_thermal_guard: true,
        audio_video_requires_user_scope: true,
        authority: false,
        proof: false,
      });
    },
  },
  {
    name: "local_bridge_media_policy",
    description: "Expõe a política canônica para áudio/vídeo/voz/desktop local no app bridge: escopo explícito, envelopes, logs e recibos sem vazar dados pessoais.",
    annotations: { readOnlyHint: true, title: "Casa Local — Política mídia/bridge" },
    inputSchema: z.object({}),
    handler: async () => ok({
      schema: "centraldark.local-bridge-media-policy.v1",
      flow: [
        "CHEFE_INTENT",
        "DESKTOP_APP_BRIDGE",
        "AUDIO_VIDEO_OR_GPU_TASK_ENVELOPE",
        "LOCAL_SAFE_EXECUTION_OR_VPS_OFFLOAD",
        "SANITIZED_LOG_EVENT",
        "GRAFO_VIVO_UPSERT",
        "PR_OR_RECEIPT_WHEN_MATERIAL"
      ],
      rules: {
        raw_personal_media_public_log: false,
        secret_or_token_to_graph: false,
        explicit_user_scope_required: true,
        local_resource_is_capacity_not_authority: true,
        no_blind_background_capture: true,
        no_auto_deploy_from_media_event: true,
      },
      authority: false,
      proof: false,
    }),
  },
  {
    name: "centraldark_data_ingest_policy",
    description: "Mostra como JSONs/Markdown/PRs/issues/logs/agentics entram no Grafo Vivo sem virar arquitetura paralela e sem remover stream bruto.",
    annotations: { readOnlyHint: true, title: "CentralDark — Política de ingestão" },
    inputSchema: z.object({}),
    handler: async () => ok({
      schema: "centraldark.data-ingest-policy.v1",
      accepts: ["JSON", "Markdown", "MCP_LOG", "VPS_LOG", "PR", "COMMIT", "ISSUE", "CI_RUN", "AGENT_EVENT", "OBSIDIAN_EVENT"],
      pipeline: ["VALIDATE_SCHEMA", "SANITIZE", "DEDUPE", "OWNER_EXISTS", "GRAPH_UPSERT", "HUD_DELTA", "RECEIPT_IF_MATERIAL"],
      administraveis_json: "docs/CONSCIENCIA/ADMINISTRAVEIS.json",
      raw_stream_permanent: true,
      same_mcp_admin_panel: true,
      new_system: false,
      authority: false,
      proof: false,
    }),
  },
];
