#!/usr/bin/env node
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { checkTelegramOwner } from "../src/health-deep.js";

function fixture() {
  const root = mkdtempSync(path.join(os.tmpdir(), "centraldark-health-telegram-"));
  const repoRoot = path.join(root, "repo");
  const pm2Home = path.join(root, ".pm2");
  mkdirSync(path.join(repoRoot, "secrets"), { recursive: true });
  mkdirSync(path.join(pm2Home, "pids"), { recursive: true });
  writeFileSync(path.join(pm2Home, "pids", "CentralDark-HubBot-1.pid"), String(process.pid));
  return { root, repoRoot, pm2Home };
}

test("health Telegram observa o owner HubBot sem duplicar secret no MCP", () => {
  const fx = fixture();
  try {
    writeFileSync(
      path.join(fx.repoRoot, "secrets", "telegram-alerts.env"),
      "SRVER1_BOT_TOKEN=fixture-token-not-a-real-secret\n",
    );
    const observed = checkTelegramOwner({ repoRoot: fx.repoRoot, pm2Home: fx.pm2Home });
    assert.equal(observed.ok, true);
    assert.equal(observed.owner, "CentralDark-HubBot");
    assert.equal(observed.processAlive, true);
    assert.equal(observed.tokenConfigured, true);
    assert.equal("token" in observed, false);
    assert.equal("secret" in observed, false);
  } finally {
    rmSync(fx.root, { recursive: true, force: true });
  }
});

test("placeholder de token não produz verde", () => {
  const fx = fixture();
  try {
    writeFileSync(
      path.join(fx.repoRoot, "secrets", "telegram-alerts.env"),
      "TELEGRAM_BOT_TOKEN=__MISSING_TELEGRAM__\n",
    );
    const observed = checkTelegramOwner({ repoRoot: fx.repoRoot, pm2Home: fx.pm2Home });
    assert.equal(observed.ok, false);
    assert.equal(observed.processAlive, true);
    assert.equal(observed.tokenConfigured, false);
  } finally {
    rmSync(fx.root, { recursive: true, force: true });
  }
});

test("token configurado sem processo HubBot também não produz verde", () => {
  const fx = fixture();
  try {
    rmSync(path.join(fx.pm2Home, "pids"), { recursive: true, force: true });
    mkdirSync(path.join(fx.pm2Home, "pids"), { recursive: true });
    writeFileSync(
      path.join(fx.repoRoot, "secrets", "telegram-alerts.env"),
      "GUARDA_TELEGRAM_BOT_TOKEN=fixture-token-not-a-real-secret\n",
    );
    const observed = checkTelegramOwner({ repoRoot: fx.repoRoot, pm2Home: fx.pm2Home });
    assert.equal(observed.ok, false);
    assert.equal(observed.processAlive, false);
    assert.equal(observed.tokenConfigured, true);
  } finally {
    rmSync(fx.root, { recursive: true, force: true });
  }
});
