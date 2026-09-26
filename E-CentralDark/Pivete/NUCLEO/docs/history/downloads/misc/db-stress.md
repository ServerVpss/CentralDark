# OUTRO - db-stress.js
**Origem:** E:\CentralDark\_MAPA_CASA\Nova pasta\.extracted_screenpipe-main.zip\screenpipe-main\apps\screenpipe-app-tauri\e2e\tests\db-stress.js
**SHA:** d001d6babca980b1
**Timestamp:** 2026-08-23T14:15:54.950967
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const start = performance.now();

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * Database Stress & Concurrent Access Test
 *
 * Covers TESTING.md sections:
 * - Section 9: Concurrent DB access, store race condition, UTF-8
 * - Section 5: OCR pipeline under load
 * - Section 8: Port conflict detection
 */

describe('Database & Stability (S9)', () => {
    const API_BASE = 'http://localhost:3030';

    before(async () => {
        await browser.waitUntil(
            async () => (await browser.execute(() => document.readyState)) === 'complete',
            { timeout: 30000, timeoutMsg: 'app did not load' }
        );

        // Skip onboarding
        try {
            const skipBtn = await $('button*=skip');
            if (await skipBtn.isDisplayed()) {
                await skipBtn.click();
                await browser.pause(500);
            }
        } catch {}
        try {
            const closeBtn = await $('button svg.lucide-x');
            if (await closeBtn.isDisplayed()) {
                await closeBtn.closest('button').click();
                await browser.pause(500);
            }
        } catch {}
    });

    it('should handle 20 concurrent search requests (S9.2)', async () => {
        const results = await browser.execute(async (base) => {
            const promises = Array.from({ length: 20 }, (_, i) =>
                fetch(`${base}/search?limit=1&q=test${i}`)
                    .then(r => ({ ok: r.ok, status: r.status }))
                    .catch(e => ({ ok: false, status: 0, error: e.message }))
            );
            return Promise.all(promises);
        }, API_BASE);

        const failures = results.filter(r => !r.ok);
        // Allow up to 10% failure rate under load
        expect(failures.length).toBeLessThan(3);
    });

    it('should handle mixed concurrent requests (S9.2)', async () => {
        const results = await browser.execute(async (base) => {
            const endpoints = [
                `${base}/health`,
                `${base}/search?limit=1&content_type=ocr`,
                `${base}/search?limit=5&q=test`,
                `${base}/pipes/list`,
                `${base}/search?limit=1&content_type=audio`,
            ];
            const promises = [];
            for (let i = 0; i < 4; i++) {
                for (const url of endpoints) {
                    promises.push(
                        fetch(url)
                            .then(r => ({ ok: r.ok || r.status === 404 || r.status === 403, status: r.status }))
                            .catch(e => ({ ok: false, status: 0 }))
                    );
                }
            }
            return Promise.all(promises);
        }, API_BASE);

        const failures = results.filter(r => !r.ok);
        expect(failures.length).toBeLessThan(3);
    });

    it('should handle UTF-8 in various search queries (S9.5)', async () => {
        const queries = [
            '%E4%B8%AD%E6%96%87',      // Chinese
            '%C3%A9%C3%A0%C3%BC',      // French accented
            '%D0%BF%D1%80%D0%B8%D0%B2%D0%B5%D1%82', // Russian
            '%F0%9F%98%80',             // Emoji
            'caf%C3%A9',               // Mixed ASCII + Unicode
        ];

        for (const q of queries) {
            const result = await browser.execute(async (base, query) => {
                try {
                    const res = await fetch(`${base}/search?q=${query}&limit=1`);
                    return { ok: res.ok, status: res.status };
                } catch (e) {
                    return { ok: false, status: 0, error: e.message };
                }
            }, API_BASE, q);

            // Should not crash — 400 or empty results OK, 500 is bad
            expect(result.status).not.toBe(500);
        }
    });

    it('should not return 500 on rapid sequential queries (S9.3)', async () => {
        const results = await browser.execute(async (base) => {
            const outcomes = [];
            for (let i = 0; i < 10; i++) {
                try {
                    const res = await fetch(`${base}/search?limit=1&offset=${i}`);
                    outcomes.push({ ok: res.ok, status: res.status });
                } catch (e) {
                    outcomes.push({ ok: false, status: 0 });
                }
            }
            return outcomes;
        }, API_BASE);

        const serverErrors = results.filter(r => r.status >= 500);
        expect(serverErrors.length).toBe(0);
    });

    it('should handle large result set (S9.7)', async () => {
        const result = await browser.execute(async (base) => {
            const start = performance.now();
            const res = await fetch(`${base}/search?limit=100&content_type=ocr`);
            const elapsed = performance.now() - start;
            const data = await res.json();
            return {
                ok: res.ok,
                elapsed: Math.round(elapsed),
                count: data?.data?.length ?? 0,
                total: data?.pagination?.total ?? 0,
            };
        }, API_BASE);

        expect(
```

---

# OUTRO - db-stress.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.extracted_screenpipe-main.zip\screenpipe-main\apps\screenpipe-app-tauri\e2e\tests\db-stress.js
**SHA:** d001d6babca980b1c3750edb6dbceb2b7e960e80b700ea3232381ddd6afd1f83
**Timestamp:** 2026-08-23T23:43:37.839951
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const start = performance.now();

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * Database Stress & Concurrent Access Test
 *
 * Covers TESTING.md sections:
 * - Section 9: Concurrent DB access, store race condition, UTF-8
 * - Section 5: OCR pipeline under load
 * - Section 8: Port conflict detection
 */

describe('Database & Stability (S9)', () => {
    const API_BASE = 'http://localhost:3030';

    before(async () => {
        await browser.waitUntil(
            async () => (await browser.execute(() => document.readyState)) === 'complete',
            { timeout: 30000, timeoutMsg: 'app did not load' }
        );

        // Skip onboarding
        try {
            const skipBtn = await $('button*=skip');
            if (await skipBtn.isDisplayed()) {
                await skipBtn.click();
                await browser.pause(500);
            }
        } catch {}
        try {
            const closeBtn = await $('button svg.lucide-x');
            if (await closeBtn.isDisplayed()) {
                await closeBtn.closest('button').click();
                await browser.pause(500);
            }
        } catch {}
    });

    it('should handle 20 concurrent search requests (S9.2)', async () => {
        const results = await browser.execute(async (base) => {
            const promises = Array.from({ length: 20 }, (_, i) =>
                fetch(`${base}/search?limit=1&q=test${i}`)
                    .then(r => ({ ok: r.ok, status: r.status }))
                    .catch(e => ({ ok: false, status: 0, error: e.message }))
            );
            return Promise.all(promises);
        }, API_BASE);

        const failures = results.filter(r => !r.ok);
        // Allow up to 10% failure rate under load
        expect(failures.length).toBeLessThan(3);
    });

    it('should handle mixed concurrent requests (S9.2)', async () => {
        const results = await browser.execute(async (base) => {
            const endpoints = [
                `${base}/health`,
                `${base}/search?limit=1&content_type=ocr`,
                `${base}/search?limit=5&q=test`,
                `${base}/pipes/list`,
                `${base}/search?limit=1&content_type=audio`,
            ];
            const promises = [];
            for (let i = 0; i < 4; i++) {
                for (const url of endpoints) {
                    promises.push(
                        fetch(url)
                            .then(r => ({ ok: r.ok || r.status === 404 || r.status === 403, status: r.status }))
                            .catch(e => ({ ok: false, status: 0 }))
                    );
                }
            }
            return Promise.all(promises);
        }, API_BASE);

        const failures = results.filter(r => !r.ok);
        expect(failures.length).toBeLessThan(3);
    });

    it('should handle UTF-8 in various search queries (S9.5)', async () => {
        const queries = [
            '%E4%B8%AD%E6%96%87',      // Chinese
            '%C3%A9%C3%A0%C3%BC',      // French accented
            '%D0%BF%D1%80%D0%B8%D0%B2%D0%B5%D1%82', // Russian
            '%F0%9F%98%80',             // Emoji
            'caf%C3%A9',               // Mixed ASCII + Unicode
        ];

        for (const q of queries) {
            const result = await browser.execute(async (base, query) => {
                try {
                    const res = await fetch(`${base}/search?q=${query}&limit=1`);
                    return { ok: res.ok, status: res.status };
                } catch (e) {
                    return { ok: false, status: 0, error: e.message };
                }
            }, API_BASE, q);

            // Should not crash — 400 or empty results OK, 500 is bad
            expect(result.status).not.toBe(500);
        }
    });

    it('should not return 500 on rapid sequential queries (S9.3)', async () => {
        const results = await browser.execute(async (base) => {
            const outcomes = [];
            for (let i = 0; i < 10; i++) {
                try {
                    const res = await fetch(`${base}/search?limit=1&offset=${i}`);
                    outcomes.push({ ok: res.ok, status: res.status });
                } catch (e) {
                    outcomes.push({ ok: false, status: 0 });
                }
            }
            return outcomes;
        }, API_BASE);

        const serverErrors = results.filter(r => r.status >= 500);
        expect(serverErrors.length).toBe(0);
    });

    it('should handle large result set (S9.7)', async () => {
        const result = await browser.execute(async (base) => {
            const start = performance.now();
            const res = await fetch(`${base}/search?limit=100&content_type=ocr`);
            const elapsed = performance.now() - start;
            const data = await res.json();
            return {
                ok: res.ok,
                elapsed: Math.round(elapsed),
                count: data?.data?.length ?? 0,
                total: data?.pagination?.total ?? 0,
            };
        }, API_BASE);

        expect(
```