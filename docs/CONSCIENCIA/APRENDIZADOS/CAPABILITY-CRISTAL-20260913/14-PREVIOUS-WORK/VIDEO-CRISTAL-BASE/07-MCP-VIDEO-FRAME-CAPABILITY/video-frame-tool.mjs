import { execFile } from "node:child_process";
import { promisify } from "node:util";
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

const execFileAsync = promisify(execFile);

const DEFAULT_WORKDIR =
  process.env.CENTRALDARK_VIDEO_WORKDIR || "/tmp/centraldark-video";

function sha256Buffer(buf) {
  return crypto.createHash("sha256").update(buf).digest("hex");
}

async function sha256File(file) {
  const buf = await fs.readFile(file);
  return sha256Buffer(buf);
}

function parseRate(rate) {
  if (!rate || rate === "0/0") return 0;
  const [a, b] = rate.split("/").map(Number);
  return b ? a / b : Number(a || 0);
}

async function assertLocalFile(inputPath) {
  if (/^https?:\/\//i.test(inputPath)) {
    throw new Error("REMOTE_URL_NOT_ALLOWED: materialize/download outside this tool first.");
  }
  const stat = await fs.stat(inputPath);
  if (!stat.isFile()) throw new Error("INPUT_NOT_FILE");
}

export async function probeVideo(inputPath) {
  await assertLocalFile(inputPath);
  const { stdout } = await execFileAsync("ffprobe", [
    "-v", "error",
    "-select_streams", "v:0",
    "-show_entries", "stream=avg_frame_rate,nb_frames,width,height:format=duration",
    "-of", "json",
    inputPath
  ], { maxBuffer: 10 * 1024 * 1024 });

  const data = JSON.parse(stdout);
  const stream = data.streams?.[0] || {};
  const duration = Number(data.format?.duration || 0);
  const fps = parseRate(stream.avg_frame_rate);
  const nbFrames = Number(stream.nb_frames || (duration && fps ? Math.round(duration * fps) : 0));

  return {
    duration_seconds: duration,
    fps,
    estimated_frames: nbFrames,
    width: Number(stream.width || 0),
    height: Number(stream.height || 0)
  };
}

export async function extractFrames({
  input_path,
  output_dir,
  mode = "fps",
  fps = 1,
  timestamps = [],
  image_format = "png",
  max_frames = 0
}) {
  await assertLocalFile(input_path);

  const info = await probeVideo(input_path);
  const sourceSha256 = await sha256File(input_path);

  const out = path.resolve(output_dir || path.join(DEFAULT_WORKDIR, "frames"));
  await fs.mkdir(out, { recursive: true });

  const ext = image_format === "jpg" ? "jpg" : "png";
  const pattern = path.join(out, `frame-%08d.${ext}`);

  if (mode === "all") {
    const args = ["-hide_banner", "-loglevel", "error", "-i", input_path, "-vsync", "0"];
    if (max_frames > 0) args.push("-frames:v", String(max_frames));
    args.push(pattern);
    await execFileAsync("ffmpeg", args, { maxBuffer: 50 * 1024 * 1024 });
  } else if (mode === "fps") {
    const args = ["-hide_banner", "-loglevel", "error", "-i", input_path, "-vf", `fps=${fps}`];
    if (max_frames > 0) args.push("-frames:v", String(max_frames));
    args.push(pattern);
    await execFileAsync("ffmpeg", args, { maxBuffer: 50 * 1024 * 1024 });
  } else if (mode === "timestamps") {
    let index = 1;
    for (const ts of timestamps) {
      if (max_frames > 0 && index > max_frames) break;
      const file = path.join(out, `frame-${String(index).padStart(8, "0")}.${ext}`);
      await execFileAsync("ffmpeg", [
        "-hide_banner", "-loglevel", "error",
        "-ss", String(ts),
        "-i", input_path,
        "-frames:v", "1",
        file
      ], { maxBuffer: 20 * 1024 * 1024 });
      index++;
    }
  } else {
    throw new Error(`UNSUPPORTED_MODE:${mode}`);
  }

  const names = (await fs.readdir(out))
    .filter(n => n.startsWith("frame-") && n.endsWith(`.${ext}`))
    .sort();

  const manifest = [];
  for (let i = 0; i < names.length; i++) {
    const file = path.join(out, names[i]);
    const hash = await sha256File(file);
    const timestampSeconds =
      mode === "timestamps"
        ? Number(timestamps[i] ?? 0)
        : mode === "fps"
          ? i / Number(fps || 1)
          : info.fps
            ? i / info.fps
            : null;

    manifest.push({
      frame_index: i + 1,
      file: names[i],
      timestamp_seconds: timestampSeconds,
      sha256: hash
    });
  }

  const receipt = {
    tool: "video_frames_extract_local",
    source: path.basename(input_path),
    source_sha256: sourceSha256,
    probe: info,
    mode,
    fps: mode === "fps" ? fps : null,
    frame_count: manifest.length,
    output_dir: out,
    frames: manifest
  };

  await fs.writeFile(
    path.join(out, "frame-manifest.json"),
    JSON.stringify(receipt, null, 2),
    "utf8"
  );

  return receipt;
}
