/**
 * Forja Viva / POMBO64: packager do output já compilado do Instinto Superior.
 * Reutiliza JSZip (dependência existente). SEM install/deploy/cleanup/restart.
 * Rodar via npm run build:plugplay no checkout autorizado, preferindo K:.
 */
import { readFile, writeFile, mkdir, readdir, lstat } from "node:fs/promises";
import { existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import JSZip from "jszip";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const appDir = path.resolve(scriptDir, "..");
const repoDir = path.resolve(appDir, "..", "..");
const MAX_OUTPUT_BYTES = 170 * 1024 * 1024;
const MAX_FILE_BYTES = 65 * 1024 * 1024;
const SOURCE_DIRS = [".output", "dist"];
const REQUIRED_CONTRACTS = [
  "manifest.yml", "capabilities.yml", "owners.yml", "dependencies.yml",
  "install.yml", "uninstall.yml", "rollback.yml", "tests.yml", "receipt.yml",
];
const hash = bytes => createHash("sha256").update(bytes).digest("hex");
function git(...args) {
  return execFileSync("git", args, { cwd: repoDir, encoding: "utf8" }).trim();
}
function yamlText(value) { return JSON.stringify(String(value)); }

async function main() {
  const packageJson = JSON.parse(await readFile(path.join(appDir, "package.json"), "utf8"));
  const sourceSha = git("rev-parse", "HEAD");
  if (!/^[a-f0-9]{40}$/.test(sourceSha)) throw Error("SOURCE_SHA_INVALID");
  const revision = Number(git("rev-list", "--count", "HEAD"));
  if (!Number.isInteger(revision) || revision < 1) throw Error("REVISION_INVALID");

  const tracked = git("status", "--porcelain", "--untracked-files=no", "--",
    "apps/instinto-superior/src", "apps/instinto-superior/package.json",
    "apps/instinto-superior/scripts", "docs/CONSCIENCIA/PADRAO-EMOJIS.md");
  if (tracked.length) throw Error("SOURCE_FILES_DIRTY_STOP_AND_RECONCILE");

  const outputName = SOURCE_DIRS.find(name => existsSync(path.join(appDir, name)));
  if (!outputName) throw Error("BUILD_OUTPUT_MISSING: execute npm run build antes do pacote");
  const outputRoot = path.join(appDir, outputName);
  const files = [];
  async function visit(current) {
    for (const entry of (await readdir(current, { withFileTypes: true })).sort((a,b)=>a.name.localeCompare(b.name))) {
      const actual = path.join(current, entry.name);
      const stat = await lstat(actual);
      if (stat.isSymbolicLink()) throw Error("SYMLINK_REJECTED");
      if (stat.isDirectory()) { await visit(actual); continue; }
      if (!stat.isFile()) throw Error("NONFILE_REJECTED");
      const relative = path.relative(outputRoot, actual).replaceAll(path.sep, "/");
      const parts = relative.split("/");
      if (relative.startsWith("../") || path.isAbsolute(relative)
        || parts.some(p => p === ".." || p.startsWith(".env") || /^(secret|secrets|credentials|private-keys)$/i.test(p))
        || /\.(pem|key|pfx|p12|jks|keystore)$/i.test(relative)) {
        throw Error("UNSAFE_PACKAGE_PATH");
      }
      if (stat.size > MAX_FILE_BYTES) throw Error("FILE_TOO_LARGE");
      files.push({ relative, actual, bytes: stat.size });
    }
  }
  await visit(outputRoot);
  const total = files.reduce((sum,item)=>sum+item.bytes,0);
  if (!files.length || total > MAX_OUTPUT_BYTES) throw Error("OUTPUT_EMPTY_OR_OVER_BUDGET");

  const packageId = "CENTRALDARK-INSTINTO-SUPERIOR";
  const zip = new JSZip();
  const evidence = [];
  for (const file of files.sort((a,b)=>a.relative.localeCompare(b.relative))) {
    const data = await readFile(file.actual);
    const fileName = "payload/" + file.relative;
    zip.file(fileName, data, { date: new Date("1980-01-01T00:00:00Z"), createFolders: false });
    evidence.push({ path: fileName, bytes: data.length, sha256: hash(data) });
  }
  const parent = process.env.CENTRALDARK_PARENT_PACKAGE_SHA256 || null;
  if (parent && !/^[a-f0-9]{64}$/.test(parent)) throw Error("PARENT_PACKAGE_SHA_INVALID");
  const manifest = {
    schema: "centraldark.plug-play.package.v1",
    package_id: packageId,
    component_id: "INSTINTO-SUPERIOR",
    pombo_id: "POMBO-CENTRALDARK",
    source_sha: sourceSha,
    revision,
    version: packageJson.version ?? "UNVERSIONED_REPO_APP",
    owner: "apps/instinto-superior",
    payload_directory: outputName,
    parent_package_sha256: parent,
    lineage_state: parent ? "PARENT_SHA_REFERENCED_NOT_FETCH_VERIFIED" : "GENESIS_OR_PARENT_NOT_SUPPLIED",
    deployment: "REQUIRES_AUTHORIZED_INSTALL_AND_RUNTIME_READBACK",
    build_compliance: "SOURCE_BUILT_PACKAGE_CREATED_NOT_INSTALLED",
    files: evidence,
    contracts: REQUIRED_CONTRACTS,
  };
  const immutable = (filename,body) => zip.file(filename, body, {
    date: new Date("1980-01-01T00:00:00Z"), createFolders: false,
  });
  immutable("MANIFEST.json", JSON.stringify(manifest,null,2)+"\n");
  immutable("SHA256SUMS.txt", evidence.map(x=>x.sha256+"  "+x.path).join("\n")+"\n");
  immutable("manifest.yml", "schema: centraldark.plug-play.package.v1\npackage_id: "+packageId+"\nsource_sha: "+sourceSha+"\nrevision: "+revision+"\n");
  immutable("capabilities.yml", "capabilities:\n  - cockpit\n  - hud_genesis\n  - seals_historical\n  - forge_emoji_aliases\n");
  immutable("owners.yml", "owner: apps/instinto-superior\nruntime_owner: existing_centraldark_runtime\n");
  immutable("dependencies.yml", "node_version: 20_or_newer\npackage_manager: npm\nbuild_source: apps/instinto-superior\n");
  immutable("install.yml", "install_strategy: authorized_existing_deployment_only\nno_automatic_install: true\n");
  immutable("uninstall.yml", "no_automatic_uninstall: true\npreserve_user_data: true\n");
  immutable("rollback.yml", "policy: preserve_previous_artifact\nmanual_owner_approval: true\n");
  immutable("tests.yml", "prepackage: npm run verify:hud\ncompile: npm run build\nruntime_e2e: not_proven\n");
  immutable("receipt.yml", "status: built_not_installed\nsource_sha: "+sourceSha+"\nnext_cursor: runtime_UI_readback\n");

  const bytes = await zip.generateAsync({
    type: "nodebuffer", compression: "DEFLATE", compressionOptions: { level: 6 },
    platform: "UNIX",
  });
  const defaultDestination = path.join(repoDir, ".artifacts", "instinto-superior");
  const destination = process.env.CENTRALDARK_FORGE_ARTIFACTS
    ? path.resolve(process.env.CENTRALDARK_FORGE_ARTIFACTS) : defaultDestination;
  await mkdir(destination, { recursive: true });
  const outputFile = path.join(destination, "POMBO64-"+packageId+"-"+sourceSha.slice(0,12)+".zip");
  if (existsSync(outputFile)) {
    const original = await readFile(outputFile);
    if (hash(original) !== hash(bytes)) throw Error("ARTIFACT_EXISTS_DIFFERENT_BYTES");
    console.log("PACKAGE_REUSED_SAME_SHA256="+hash(bytes));
  } else {
    await writeFile(outputFile, bytes, { flag: "wx" });
  }
  console.log(JSON.stringify({
    status: "BUILT_NOT_INSTALLED",
    package_id: packageId,
    source_sha: sourceSha,
    revision,
    payload_files: evidence.length,
    payload_bytes: total,
    artifact: outputFile,
    artifact_bytes: bytes.length,
    package_sha256: hash(bytes),
    parent_sha256: parent,
    runtime_ui: "NOT_PROVEN",
  }, null, 2));
}
main().catch(error => {
  console.error("FORJA_PLUGPLAY_FAIL="+(error?.message ?? String(error)));
  process.exitCode = 1;
});
