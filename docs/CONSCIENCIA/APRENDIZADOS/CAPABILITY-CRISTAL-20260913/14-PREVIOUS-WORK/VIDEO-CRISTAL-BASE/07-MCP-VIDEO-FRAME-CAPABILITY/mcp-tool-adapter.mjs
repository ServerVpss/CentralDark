import { extractFrames } from "./video-frame-tool.mjs";
import schema from "./tool-schema.json" with { type: "json" };

export const tool = schema;

export async function handleVideoFramesExtractLocal(args) {
  return await extractFrames(args);
}
