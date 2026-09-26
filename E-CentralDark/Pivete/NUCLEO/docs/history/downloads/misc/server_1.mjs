#!/usr/bin/env node
import { createServer } from "../src/http-server.mjs";

const host = process.env.UNIVERSAL_HOST || "127.0.0.1";
const port = Number(process.env.UNIVERSAL_PORT || 8787);
const token = process.env.UNIVERSAL_API_TOKEN || "";
const allowedRoot = process.env.UNIVERSAL_ALLOWED_ROOTS || "";
const loopback = new Set(["127.0.0.1", "::1", "localhost"]);
if (!loopback.has(host) && !token) {
  console.error("BLOCKED_EXTERNAL_BIND_WITHOUT_UNIVERSAL_API_TOKEN");
  process.exit(1);
}
if (!loopback.has(host) && !allowedRoot) {
  console.error("BLOCKED_EXTERNAL_BIND_WITHOUT_UNIVERSAL_ALLOWED_ROOTS");
  process.exit(1);
}
const server = createServer({ apiToken: token, allowedRoot, lockAllowedRoots: true });
server.listen(port, host, () => {
  console.log(`UNIVERSAL_API=http://${host}:${port}`);
  console.log(`EXECUTE=POST http://${host}:${port}/v1/universal/execute`);
  console.log(`ALLOWED_ROOTS=${allowedRoot || "DERIVED_PER_TARGET_ON_LOOPBACK"}`);
});
