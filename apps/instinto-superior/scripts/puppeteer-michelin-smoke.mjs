// Michelin visual smoke — one-off read-only test, not a new runtime or star certifier.
// Run with a clean Puppeteer profile on an approved, non-authenticated preview.
// BUILD_PASS, INSTALL_PASS and 3 stars require separate material receipts.
import { existsSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import { basename, isAbsolute, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

export const MICHELIN_SCOPE = "PUBLIC_UNAUTHENTICATED_VISUAL_SMOKE";

export function validateVisualTarget(value) {
  let target;
  try { target = new URL(value); } catch { return null; }
  const local = ["127.0.0.1", "localhost"].includes(target.hostname);
  if ((local && target.protocol !== "http:") ||
      (!local && (target.protocol !== "https:" ||
        target.hostname !== "admin.centralldark.com")) ||
      target.username || target.password || target.search || target.hash) return null;
  return target;
}

export function classifyVisualEvidence(probe) {
  const block = (reason) => ({ state: "BLOCKED", reason, certifiesStars: 0, scope: MICHELIN_SCOPE });
  const fail = (reason) => ({ state: "FAIL", reason, certifiesStars: 0, scope: MICHELIN_SCOPE });
  if (!/^[0-9a-f]{40}$/.test(probe?.sourceSha || "")) return block("SOURCE_SHA_UNPROVEN");
  if (!probe?.executableFound) return block("PUPPETEER_CHROME_NOT_FOUND");
  if (!probe?.libraryLoaded) return block("PUPPETEER_LIBRARY_NOT_AVAILABLE");
  if (!Array.isArray(probe?.viewports) || probe.viewports.length !== 2)
    return block("TWO_VIEWPORT_RECEIPTS_REQUIRED");
  if (probe.viewports.some((item) => item?.httpStatus == null))
    return block("HTTP_STATUS_UNPROVEN");
  if (probe.viewports.some((item) => item.httpStatus < 200 || item.httpStatus >= 400))
    return fail("HTTP_NON_SUCCESS");
  if (probe.viewports.some((item) => item?.originMatched !== true))
    return fail("REDIRECTED_OUTSIDE_APPROVED_ORIGIN");
  if (probe.viewports.some((item) => item?.ready !== true || item?.hasContent !== true))
    return fail("DOM_CONTENT_MISSING");
  if (probe.viewports.some((item) => item?.horizontalOverflow === true))
    return fail("RESPONSIVE_OVERFLOW");
  if (probe.viewports.some((item) => item?.pageErrors > 0))
    return fail("BROWSER_PAGE_ERROR");
  return { state: "PASS", reason: "PUBLIC_VISUAL_SMOKE_ONLY", certifiesStars: 0,
    scope: MICHELIN_SCOPE };
}

export function findExistingChrome(cacheRoot, platform = process.platform) {
  const channel = join(cacheRoot, "chrome");
  if (!existsSync(channel)) return null;
  let versions;
  try { versions = readdirSync(channel, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((name) => /^[a-z0-9-]+-[0-9]+(?:\.[0-9]+){1,4}$/i.test(name))
    .sort((left, right) => {
      const a = left.match(/\d+(?:\.\d+)+$/)?.[0].split(".").map(Number) || [];
      const b = right.match(/\d+(?:\.\d+)+$/)?.[0].split(".").map(Number) || [];
      for (let n = 0; n < Math.max(a.length, b.length); n++) {
        if ((a[n] || 0) !== (b[n] || 0)) return (b[n] || 0) - (a[n] || 0);
      }
      return 0;
    }); } catch { return null; }
  for (const dir of versions) {
    const candidate = platform === "win32"
      ? join(channel, dir, "chrome-win64", "chrome.exe")
      : platform === "linux"
        ? join(channel, dir, "chrome-linux64", "chrome")
        : null;
    if (candidate && existsSync(candidate)) return candidate;
  }
  return null;
}

async function runVisualSmoke() {
  const sourceSha = process.env.GITHUB_SHA || process.env.CENTRALDARK_SOURCE_SHA || "";
  const target = validateVisualTarget(process.env.CENTRALDARK_VISUAL_URL || "http://127.0.0.1:4179/");
  const outDir = resolve(process.env.CENTRALDARK_VISUAL_ARTIFACTS || join(tmpdir(), "centraldark-visual-smoke"));
  mkdirSync(outDir, { recursive: true, mode: 0o700 });
  const receiptPath = join(outDir, "puppeteer-michelin-receipt.json");
  const evidence = { schema: "centraldark.michelin.puppeteer.v1",
    observedAt: new Date().toISOString(), sourceSha, targetOrigin: target?.origin || "INVALID",
    executableFound: false, libraryLoaded: false, viewports: [],
    certification: "NOT_AUTHORIZED_BY_VISUAL_SMOKE" };
  let browser = null;
  try {
    if (!target) throw new Error("TARGET_ORIGIN_NOT_ALLOWED");
    const fromEnv = process.env.PUPPETEER_EXECUTABLE_PATH;
    const executablePath = fromEnv
      ? (isAbsolute(fromEnv) && existsSync(fromEnv) ? fromEnv : null)
      : findExistingChrome(process.env.PUPPETEER_CACHE_DIR || join(homedir(), ".cache", "puppeteer"));
    if (!executablePath) throw new Error("PUPPETEER_CHROME_NOT_FOUND");
    evidence.executableFound = true;
    let puppeteer;
    try { puppeteer = (await import("puppeteer-core")).default; }
    catch { throw new Error("PUPPETEER_LIBRARY_NOT_AVAILABLE"); }
    evidence.libraryLoaded = true;
    browser = await puppeteer.launch({ executablePath, headless: true,
      args: ["--disable-dev-shm-usage"] });
    for (const viewport of [{ name: "desktop", width: 1365, height: 768 },
      { name: "mobile", width: 390, height: 844 }]) {
      const page = await browser.newPage();
      const pageErrors = [];
      page.on("pageerror", () => pageErrors.push("PAGE_ERROR"));
      await page.setViewport({ width: viewport.width, height: viewport.height,
        deviceScaleFactor: 1 });
      const response = await page.goto(target.href, { waitUntil: "domcontentloaded",
        timeout: 20000 });
      const metrics = await page.evaluate(() => ({
        ready: document.readyState !== "loading",
        hasContent: Boolean(document.body?.innerText?.trim()) &&
          Boolean(document.querySelector("main, #root, #app, body")),
        horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth + 4,
      }));
      const finalUrl = new URL(page.url());
      evidence.viewports.push({
        name: viewport.name, width: viewport.width, httpStatus: response?.status() ?? null,
        originMatched: finalUrl.origin === target.origin,
        ...metrics, pageErrors: pageErrors.length,
      });
      // New browser context has no user's cookies or saved profile.
      await page.screenshot({ path: join(outDir, "puppeteer-public-" + viewport.name + ".png"),
        fullPage: false });
      await page.close();
    }
  } catch (error) {
    evidence.runtimeError = String(error?.message || "BROWSER_UNKNOWN")
      .replaceAll(/[A-Za-z]:\\[^\s]*/g, "<LOCAL_PATH>")
      .slice(0, 160);
  } finally {
    await browser?.close().catch(() => {});
  }
  const result = classifyVisualEvidence(evidence);
  const receipt = { ...evidence, ...result,
    nextCursor: result.state === "PASS"
      ? "ADMIN_AUTH_VISUAL_AND_CASA_VPS_LOG_RECEIPTS_REQUIRED_FOR_3_STARS"
      : "FIX_BROWSER_PRECONDITION_AND_RERUN_SAME_SHA" };
  writeFileSync(receiptPath, JSON.stringify(receipt, null, 2) + "\n", { mode: 0o600 });
  process.stdout.write(JSON.stringify({ state: receipt.state, reason: receipt.reason,
    scope: MICHELIN_SCOPE, certifiesStars: 0, sourceSha, artifact: basename(receiptPath) }) + "\n");
  if (result.state !== "PASS") process.exitCode = 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  await runVisualSmoke();
}
