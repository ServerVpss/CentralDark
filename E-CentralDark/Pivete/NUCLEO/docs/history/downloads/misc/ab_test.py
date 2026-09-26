# A/B empírico: mede baseline vs "chunk Supabase bloqueado"
# Prova o ganho real em vez de projetar. 5 runs cada, CPU throttling 4x.
import asyncio, json, statistics
from pathlib import Path
from playwright.async_api import async_playwright

RUNS = 5
BLOCK_PATTERNS = ["17-r5~e9uf6xa.js", "0b_sd_9lfds66.js", "0ox50v55czn97.js"]  # supabase + 2 lucide

async def measure(page, cdp, label):
    metrics = await page.evaluate("""async () => {
      const nav = performance.getEntriesByType('navigation')[0];
      const paints = performance.getEntriesByType('paint');
      const lt = performance.getEntriesByType('longtask') || [];
      const res = performance.getEntriesByType('resource').filter(r=>r.name.endsWith('.js'));
      const jsBytes = res.reduce((a,r)=>a+(r.transferSize||r.encodedBodySize||0),0);
      return {
        ttfb: nav.responseStart - nav.requestStart,
        fcp: (paints.find(p=>p.name==='first-contentful-paint')||{}).startTime||0,
        domContentLoaded: nav.domContentLoadedEventEnd - nav.startTime,
        loadEvent: nav.loadEventEnd - nav.startTime,
        longTaskCount: lt.length,
        longTaskSum: lt.reduce((a,t)=>a+t.duration,0),
        longTaskMax: lt.reduce((a,t)=>Math.max(a,t.duration),0),
        jsBytes,
        jsCount: res.length,
      };
    }""")
    return metrics

async def run(block=False):
    async with async_playwright() as p:
        b = await p.chromium.launch(headless=True, args=["--disable-http-cache"])
        ctx = await b.new_context(viewport={"width":390,"height":844})
        page = await ctx.new_page()
        cdp = await ctx.new_cdp_session(page)
        # throttling 4x (mobile-mid)
        await cdp.send("Emulation.setCPUThrottlingRate", {"rate": 4})
        await cdp.send("Network.enable")
        await cdp.send("Network.setCacheDisabled", {"cacheDisabled": True})

        if block:
            async def route_handler(route):
                if any(pat in route.request.url for pat in BLOCK_PATTERNS):
                    await route.abort()
                else:
                    await route.continue_()
            await page.route("**/*.js", route_handler)

        await page.goto("https://overclock.sh/", wait_until="networkidle", timeout=60000)
        await page.wait_for_timeout(3000)  # deixa long tasks aparecerem
        m = await measure(page, cdp, "block" if block else "base")
        await b.close()
        return m

async def main():
    print(f"Rodando {RUNS} runs baseline + {RUNS} runs bloqueado...")
    baseline, blocked = [], []
    for i in range(RUNS):
        baseline.append(await run(block=False))
        print(f"  base #{i+1} ok — maxLT={baseline[-1]['longTaskMax']:.0f} sumLT={baseline[-1]['longTaskSum']:.0f} JS={baseline[-1]['jsBytes']//1024}KB")
    for i in range(RUNS):
        blocked.append(await run(block=True))
        print(f"  block #{i+1} ok — maxLT={blocked[-1]['longTaskMax']:.0f} sumLT={blocked[-1]['longTaskSum']:.0f} JS={blocked[-1]['jsBytes']//1024}KB")

    def stats(arr, key):
        v = [x[key] for x in arr]
        return {"median": statistics.median(v), "min": min(v), "max": max(v), "mean": statistics.mean(v)}
    keys = ["ttfb","fcp","domContentLoaded","loadEvent","longTaskCount","longTaskSum","longTaskMax","jsBytes"]
    result = {"baseline": {k: stats(baseline,k) for k in keys},
              "blocked":  {k: stats(blocked, k) for k in keys},
              "raw_baseline": baseline, "raw_blocked": blocked}
    Path("ab_result.json").write_text(json.dumps(result, indent=2))
    print("\n=== DELTA (mediana) ===")
    print(f"{'metric':<20}{'base':>12}{'block':>12}{'delta':>12}{'%':>8}")
    for k in keys:
        bs, bl = result["baseline"][k]["median"], result["blocked"][k]["median"]
        d = bl - bs
        pct = (d/bs*100) if bs else 0
        print(f"{k:<20}{bs:>12.0f}{bl:>12.0f}{d:>+12.0f}{pct:>+7.1f}%")

asyncio.run(main())
