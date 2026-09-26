# COMANDO - url-detection-benchmark.test.ts
**Origem:** E:\CentralDark\_MAPA_CASA\Nova pasta\.extracted_screenpipe-main.zip\screenpipe-main\apps\screenpipe-app-tauri\components\__tests__\url-detection-benchmark.test.ts
**SHA:** 9559612fbef3699d
**Timestamp:** 2026-08-23T14:15:50.377115
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- * Run: bun test components/__tests__/url-detection-benchmark.test.ts

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * URL Detection Benchmark
 *
 * Measures accuracy of URL detection from real screenpipe OCR data.
 * Uses 200 random frames from the local database with ground-truth labels.
 *
 * Metrics:
 *   - Precision: of URLs we detect, how many are real URLs?
 *   - Recall:    of real URLs in the text, how many do we find?
 *   - F1 Score:  harmonic mean of precision and recall
 *   - Browser URL coverage: % of frames where we detect the browser_url
 *   - False positive rate:  % of non-URL blocks where we incorrectly detect a URL
 *   - Email rejection rate: % of email addresses correctly NOT detected as URLs
 *
 * Run: bun test components/__tests__/url-detection-benchmark.test.ts
 */

import { describe, it, expect } from "bun:test";
import { isUrl, extractUrlsFromText, normalizeUrl } from "../text-overlay";
import benchmarkData from "./url-detection-benchmark-data.json";

// Types for the benchmark data
interface LabeledBlock {
	frame_id: number;
	browser_url: string | null;
	app_name: string;
	text: string;
	confidence: number;
	bounds: { left: number; top: number; width: number; height: number };
	ground_truth_urls: string[];
}

interface BenchmarkData {
	metadata: {
		total_frames: number;
		total_ocr_blocks: number;
		blocks_with_urls: number;
		total_ground_truth_urls: number;
		frames_with_browser_url: number;
	};
	browser_urls: Record<string, string>;
	labeled_blocks: LabeledBlock[];
}

const data = benchmarkData as BenchmarkData;

/**
 * Run our detection pipeline on a single text block.
 * Returns all detected URLs (normalized).
 */
function detectUrls(text: string): string[] {
	const detected: string[] = [];

	// Path 1: whole block is a URL
	if (!text.includes(" ") && isUrl(text)) {
		detected.push(normalizeUrl(text));
		return detected;
	}

	// Path 2: extract embedded URLs
	const extracted = extractUrlsFromText(text);
	for (const ext of extracted) {
		detected.push(ext.normalizedUrl);
	}

	return detected;
}

/**
 * Normalize a URL for comparison: lowercase, strip trailing slash, strip protocol
 */
function canonicalize(url: string): string {
	return url
		.toLowerCase()
		.replace(/^https?:\/\//, "")
		.replace(/\/+$/, "")
		.replace(/^www\./, "");
}

/**
 * Check if detected URL matches a ground truth URL (fuzzy: ignore protocol, trailing slash)
 */
function urlsMatch(detected: string, groundTruth: string): boolean {
	return canonicalize(detected) === canonicalize(groundTruth);
}

/**
 * Check if detected URL is a substring match of ground truth (for OCR partial matches)
 */
function urlsPartialMatch(detected: string, groundTruth: string): boolean {
	const d = canonicalize(detected);
	const g = canonicalize(groundTruth);
	return d === g || g.startsWith(d) || d.startsWith(g);
}

describe("URL Detection Benchmark", () => {
	it("should report dataset statistics", () => {
		console.log("\n=== BENCHMARK DATASET ===");
		console.log(`Frames:              ${data.metadata.total_frames}`);
		console.log(`OCR blocks:          ${data.metadata.total_ocr_blocks}`);
		console.log(`Blocks with URLs:    ${data.metadata.blocks_with_urls}`);
		console.log(`Ground truth URLs:   ${data.metadata.total_ground_truth_urls}`);
		console.log(`Frames w/ browser_url: ${data.metadata.frames_with_browser_url}`);
		expect(data.labeled_blocks.length).toBeGreaterThan(0);
	});

	it("should measure block-level precision and recall", () => {
		let truePositives = 0; // we detected a URL that exists in ground truth
		let falsePositives = 0; // we detected a URL that doesn't exist in ground truth
		let falseNegatives = 0; // ground truth URL that we missed
		let trueNegatives = 0; // no URL in ground truth, and we detected none

		const missedExamples: { text: string; missed: string[] }[] = [];
		const falsePositiveExamples: { text: string; detected: string[] }[] = [];

		for (const block of data.labeled_blocks) {
			const detected = detectUrls(block.text);
			const groundTruth = block.ground_truth_urls;

			if (groundTruth.length === 0 && detected.length === 0) {
				trueNegatives++;
				continue;
			}

			// Check each ground truth URL
			for (const gt of groundTruth) {
				const found = detected.some(
					(d) => urlsMatch(d, gt) || urlsPartialMatch(d, gt)
				);
				if (found) {
					truePositives++;
				} else {
					falseNegatives++;
					if (missedExamples.length < 20) {
						missedExamples.push({ text: block.text.slice(0, 120), missed: [gt] });
					}
				}
			}

			// Check each detected URL for false positives
			for (const d of detected) {
				const matchesAny = groundTruth.some(
					(gt) => urlsMatch(d, gt) || urlsPartialMatch(d, gt)
				);
				if (!matchesAny) {
					falsePositives++;
					if (falsePositiveExamples.length < 20) {
						falsePositiveExamples.push({
							text: block.text.slice(0, 120),
							detected: [d],
						});
					}
				}
			}
		}

		const precision =
			truePositives + falsePositives > 0
				? truePositives / (truePositives + falsePositives)
				: 0;
		const recall =
			truePositives + falseN
```

---

# COMANDO - url-detection-benchmark.test.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.extracted_screenpipe-main.zip\screenpipe-main\apps\screenpipe-app-tauri\components\__tests__\url-detection-benchmark.test.ts
**SHA:** 9559612fbef3699d48d541d4b65c5064e53d88bfd27a70dc64971e12132a349c
**Timestamp:** 2026-08-23T23:43:06.001269
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- * Run: bun test components/__tests__/url-detection-benchmark.test.ts

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * URL Detection Benchmark
 *
 * Measures accuracy of URL detection from real screenpipe OCR data.
 * Uses 200 random frames from the local database with ground-truth labels.
 *
 * Metrics:
 *   - Precision: of URLs we detect, how many are real URLs?
 *   - Recall:    of real URLs in the text, how many do we find?
 *   - F1 Score:  harmonic mean of precision and recall
 *   - Browser URL coverage: % of frames where we detect the browser_url
 *   - False positive rate:  % of non-URL blocks where we incorrectly detect a URL
 *   - Email rejection rate: % of email addresses correctly NOT detected as URLs
 *
 * Run: bun test components/__tests__/url-detection-benchmark.test.ts
 */

import { describe, it, expect } from "bun:test";
import { isUrl, extractUrlsFromText, normalizeUrl } from "../text-overlay";
import benchmarkData from "./url-detection-benchmark-data.json";

// Types for the benchmark data
interface LabeledBlock {
	frame_id: number;
	browser_url: string | null;
	app_name: string;
	text: string;
	confidence: number;
	bounds: { left: number; top: number; width: number; height: number };
	ground_truth_urls: string[];
}

interface BenchmarkData {
	metadata: {
		total_frames: number;
		total_ocr_blocks: number;
		blocks_with_urls: number;
		total_ground_truth_urls: number;
		frames_with_browser_url: number;
	};
	browser_urls: Record<string, string>;
	labeled_blocks: LabeledBlock[];
}

const data = benchmarkData as BenchmarkData;

/**
 * Run our detection pipeline on a single text block.
 * Returns all detected URLs (normalized).
 */
function detectUrls(text: string): string[] {
	const detected: string[] = [];

	// Path 1: whole block is a URL
	if (!text.includes(" ") && isUrl(text)) {
		detected.push(normalizeUrl(text));
		return detected;
	}

	// Path 2: extract embedded URLs
	const extracted = extractUrlsFromText(text);
	for (const ext of extracted) {
		detected.push(ext.normalizedUrl);
	}

	return detected;
}

/**
 * Normalize a URL for comparison: lowercase, strip trailing slash, strip protocol
 */
function canonicalize(url: string): string {
	return url
		.toLowerCase()
		.replace(/^https?:\/\//, "")
		.replace(/\/+$/, "")
		.replace(/^www\./, "");
}

/**
 * Check if detected URL matches a ground truth URL (fuzzy: ignore protocol, trailing slash)
 */
function urlsMatch(detected: string, groundTruth: string): boolean {
	return canonicalize(detected) === canonicalize(groundTruth);
}

/**
 * Check if detected URL is a substring match of ground truth (for OCR partial matches)
 */
function urlsPartialMatch(detected: string, groundTruth: string): boolean {
	const d = canonicalize(detected);
	const g = canonicalize(groundTruth);
	return d === g || g.startsWith(d) || d.startsWith(g);
}

describe("URL Detection Benchmark", () => {
	it("should report dataset statistics", () => {
		console.log("\n=== BENCHMARK DATASET ===");
		console.log(`Frames:              ${data.metadata.total_frames}`);
		console.log(`OCR blocks:          ${data.metadata.total_ocr_blocks}`);
		console.log(`Blocks with URLs:    ${data.metadata.blocks_with_urls}`);
		console.log(`Ground truth URLs:   ${data.metadata.total_ground_truth_urls}`);
		console.log(`Frames w/ browser_url: ${data.metadata.frames_with_browser_url}`);
		expect(data.labeled_blocks.length).toBeGreaterThan(0);
	});

	it("should measure block-level precision and recall", () => {
		let truePositives = 0; // we detected a URL that exists in ground truth
		let falsePositives = 0; // we detected a URL that doesn't exist in ground truth
		let falseNegatives = 0; // ground truth URL that we missed
		let trueNegatives = 0; // no URL in ground truth, and we detected none

		const missedExamples: { text: string; missed: string[] }[] = [];
		const falsePositiveExamples: { text: string; detected: string[] }[] = [];

		for (const block of data.labeled_blocks) {
			const detected = detectUrls(block.text);
			const groundTruth = block.ground_truth_urls;

			if (groundTruth.length === 0 && detected.length === 0) {
				trueNegatives++;
				continue;
			}

			// Check each ground truth URL
			for (const gt of groundTruth) {
				const found = detected.some(
					(d) => urlsMatch(d, gt) || urlsPartialMatch(d, gt)
				);
				if (found) {
					truePositives++;
				} else {
					falseNegatives++;
					if (missedExamples.length < 20) {
						missedExamples.push({ text: block.text.slice(0, 120), missed: [gt] });
					}
				}
			}

			// Check each detected URL for false positives
			for (const d of detected) {
				const matchesAny = groundTruth.some(
					(gt) => urlsMatch(d, gt) || urlsPartialMatch(d, gt)
				);
				if (!matchesAny) {
					falsePositives++;
					if (falsePositiveExamples.length < 20) {
						falsePositiveExamples.push({
							text: block.text.slice(0, 120),
							detected: [d],
						});
					}
				}
			}
		}

		const precision =
			truePositives + falsePositives > 0
				? truePositives / (truePositives + falsePositives)
				: 0;
		const recall =
			truePositives + falseN
```