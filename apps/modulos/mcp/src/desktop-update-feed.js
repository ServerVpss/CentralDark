import { Readable } from 'node:stream';

const OWNER = 'ServerVpss';
const REPO = 'CentralDark';
const API = 'https://api.github.com';
const ASSET_NAME = /^[A-Za-z0-9._-]+$/;

function internalToken() {
  return process.env.GITHUB_TOKEN || process.env.GH_TOKEN || '';
}

async function githubJson(path) {
  const token = internalToken();
  if (!token) throw Object.assign(new Error('GITHUB_TOKEN_UNAVAILABLE'), { status: 503 });
  const response = await fetch(`${API}${path}`, {
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'CentralDark-Desktop-Updater',
    },
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) throw Object.assign(new Error(`GITHUB_RELEASE_LOOKUP_${response.status}`), { status: response.status });
  return response.json();
}

async function latestRelease() {
  return githubJson(`/repos/${OWNER}/${REPO}/releases/latest`);
}

function findAsset(release, name) {
  return Array.isArray(release?.assets) ? release.assets.find((asset) => asset?.name === name) : undefined;
}

async function proxyAsset(asset, res) {
  const token = internalToken();
  const response = await fetch(asset.url, {
    headers: {
      Accept: 'application/octet-stream',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'CentralDark-Desktop-Updater',
    },
    signal: AbortSignal.timeout(30000),
    redirect: 'follow',
  });
  if (!response.ok || !response.body) {
    res.status(response.status || 502).json({ ok: false, error: 'update_asset_fetch_failed' });
    return;
  }
  res.status(200);
  res.setHeader('Content-Type', response.headers.get('content-type') || 'application/octet-stream');
  if (response.headers.get('content-length')) res.setHeader('Content-Length', response.headers.get('content-length'));
  res.setHeader('Cache-Control', 'public, max-age=60');
  Readable.fromWeb(response.body).pipe(res);
}

export function desktopUpdateHealth(_req, res) {
  res.json({
    ok: true,
    channel: 'CentralDark@GitHub → CentralDark updater proxy',
    source: `${OWNER}/${REPO}`,
    client_secret_required: false,
  });
}

export async function desktopUpdateAsset(req, res) {
  try {
    const name = String(req.params.asset || '');
    if (!ASSET_NAME.test(name)) {
      res.status(400).json({ ok: false, error: 'invalid_update_asset_name' });
      return;
    }
    const release = await latestRelease();
    const asset = findAsset(release, name);
    if (!asset) {
      res.status(404).json({ ok: false, error: 'update_asset_not_found', release: release?.tag_name || null });
      return;
    }
    await proxyAsset(asset, res);
  } catch (error) {
    const status = Number(error?.status) || 502;
    res.status(status >= 400 && status < 600 ? status : 502).json({
      ok: false,
      error: error instanceof Error ? error.message : 'update_feed_error',
    });
  }
}

export const __test = { findAsset, assetNameIsValid: (name) => ASSET_NAME.test(name) };