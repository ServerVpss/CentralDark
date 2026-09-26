# OUTRO - wds.cjs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\wix\skills\wix-design-system\scripts\wds.cjs
**SHA:** c63ce47e775f88d0
**Timestamp:** 2026-08-26T18:45:19.268465
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- `Component "${componentName}" not found. Run: wds.cjs search <keyword>`
- `Component "${name}" not found. Run: wds.cjs search <keyword>`
- `Testkit docs for "${componentName}" not found. Run: wds.cjs search <keyword>`,

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env node

/**
 * WDS Documentation Helper
 *
 * Auto-discovers @wix/design-system in node_modules and provides
 * fast, focused lookups for components, props, examples, and icons.
 *
 * Usage:
 *   node <path-to>/wds.cjs search <keyword>
 *   node <path-to>/wds.cjs component <Name>
 *   node <path-to>/wds.cjs components <Name1> <Name2>...
 *   node <path-to>/wds.cjs example <Name> <ExampleName>
 *   node <path-to>/wds.cjs testkit <Name> [method]
 *   node <path-to>/wds.cjs icons <query>
 */

const fs = require("fs");
const path = require("path");

// ---------------------------------------------------------------------------
// Path discovery
// ---------------------------------------------------------------------------

function tryEnablePnp() {
  // Yarn Berry PnP projects have no node_modules. Walk up from cwd looking for
  // .pnp.cjs and activate it so require.resolve can see PnP-managed packages.
  let dir = process.cwd();
  while (true) {
    const pnp = path.join(dir, ".pnp.cjs");
    if (fs.existsSync(pnp)) {
      try {
        require(pnp).setup();
      } catch {
        // ignore — fall through to other discovery paths
      }
      return;
    }
    const parent = path.dirname(dir);
    if (parent === dir) return;
    dir = parent;
  }
}

function findDocsDir() {
  tryEnablePnp();

  // Primary: use Node's module resolver (handles symlinks, pnpm, yarn PnP, etc.)
  try {
    const pkgPath = require.resolve("@wix/design-system/package.json", {
      paths: [process.cwd()],
    });
    const docsDir = path.join(path.dirname(pkgPath), "dist", "docs");
    if (fs.existsSync(docsDir)) return docsDir;
  } catch {
    // resolve failed — fall through to filesystem scan
  }

  // Fallback: walk up from cwd looking for node_modules
  let dir = process.cwd();
  while (true) {
    const candidate = path.join(
      dir,
      "node_modules",
      "@wix",
      "design-system",
      "dist",
      "docs"
    );
    if (fs.existsSync(candidate)) return candidate;

    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }

  return null;
}

function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildTermsPattern(args) {
  // Tolerate both `search foo bar` (separate args) and `search "foo bar"`
  // (single quoted arg). Without the split, a single quoted string becomes a
  // literal-phrase match instead of OR-of-words and silently returns nothing.
  return args
    .flatMap((a) => a.split(/\s+/))
    .filter(Boolean)
    .map(escapeRegex)
    .join("|");
}

function validateComponentName(name) {
  if (!/^[A-Za-z0-9]+$/.test(name)) {
    console.error(
      `Invalid component name "${name}". Names may only contain letters and digits.`
    );
    process.exit(1);
  }
}

// ---------------------------------------------------------------------------
// Commands
// ---------------------------------------------------------------------------

function cmdSearch(docsDir, terms) {
  if (terms.length === 0) {
    console.error("Usage: wds.cjs search <keyword> [keyword...]");
    console.error('Example: wds.cjs search form input validation');
    process.exit(1);
  }

  const content = readFile(path.join(docsDir, "components.md"));
  if (!content) {
    console.error("Error: components.md not found");
    process.exit(1);
  }

  const regex = new RegExp(buildTermsPattern(terms), "i");
  const sections = content.split(/^\s*### /m).slice(1);
  const matches = [];

  for (const section of sections) {
    if (regex.test(section)) {
      const lines = section.split("\n");
      const name = lines[0].trim();
      const descLine = lines.find((l) => l.trimStart().startsWith("- description:"));
      const desc = descLine ? descLine.replace(/.*- description:/, "").trim() : "";
      const doLine = lines.find((l) => l.trimStart().startsWith("- do:"));
      const doText = doLine ? doLine.replace(/.*- do:/, "").trim() : "";
      const dontLine = lines.find((l) => l.trimStart().startsWith("- donts:"));
      const dontText = dontLine ? dontLine.replace(/.*- donts:/, "").trim() : "";
      matches.push({ name, description: desc, do: doText, donts: dontText });
    }
  }

  if (matches.length === 0) {
    console.log(`No components found matching "${terms.join(" ")}".`);
    return;
  }

  console.log(`Found ${matches.length} component(s):\n`);
  for (const r of matches) {
    console.log(`### ${r.name}`);
    if (r.description) console.log(`  ${r.description}`);
    if (r.do) console.log(`  Do: ${r.do}`);
    if (r.donts) console.log(`  Don't: ${r.donts}`);
    console.log();
  }
}

// Renders one component's props + examples list. Returns true on success,
// fa
```