import { json } from '@tanstack/react-start'
import { execSync } from 'child_process'
import path from 'path'
import fs from 'fs'

interface SyncRequest {
  target?: 'windows' | 'main' | 'vps' | 'all'
}

interface SyncStatus {
  timestamp: string | null
  status: 'idle' | 'syncing' | 'success' | 'failed' | 'conflict'
  human_readable: string
  target?: string
}

const CENTRALDARK_ROOT = (() => {
  let dir = process.cwd()
  for (;;) {
    const candidate = path.join(dir, 'scripts', 'auto-sync', 'AUTO-SYNC-MASTER.py')
    if (fs.existsSync(candidate)) return dir
    const parent = path.dirname(dir)
    if (parent === dir) return process.cwd()
    dir = parent
  }
})()
const SCRIPT_PATH = path.join(CENTRALDARK_ROOT, 'scripts', 'auto-sync', 'AUTO-SYNC-MASTER.py')
const STATUS_FILE = path.join(CENTRALDARK_ROOT, '.auto-sync', 'status.json')

function ensureStatusDir() {
  const dir = path.dirname(STATUS_FILE)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

function formatTimestamp(iso: string): string {
  if (!iso) return 'Nunca sincronizado'
  const dt = new Date(iso)
  const time = dt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  const date = dt.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
  return `${time} · ${date}`
}

export async function GET() {
  try {
    ensureStatusDir()

    if (!fs.existsSync(STATUS_FILE)) {
      return json({
        timestamp: null,
        status: 'idle',
        human_readable: 'Nunca sincronizado'
      } as SyncStatus)
    }

    const statusJson = JSON.parse(fs.readFileSync(STATUS_FILE, 'utf-8'))
    return json({
      timestamp: statusJson.last_sync,
      status: statusJson.status,
      human_readable: formatTimestamp(statusJson.last_sync)
    } as SyncStatus)
  } catch (error) {
    console.error('[AUTO-SYNC] Erro ao ler status:', error)
    return json({
      timestamp: null,
      status: 'failed',
      human_readable: 'Erro ao ler status'
    } as SyncStatus, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    ensureStatusDir()

    const body = (await req.json()) as SyncRequest
    const target = body.target || 'all'

    if (!['all', 'windows', 'main', 'vps'].includes(target)) {
      return json({ error: 'Target inválido' }, { status: 400 })
    }

    console.log(`[AUTO-SYNC] Executando para target: ${target}`)

    const cmd = `python "${SCRIPT_PATH}" --target ${target}`
    const result = execSync(cmd, { cwd: process.cwd(), encoding: 'utf-8' })
    console.log('[AUTO-SYNC] Saída:', result.substring(0, 100))

    const statusJson = JSON.parse(fs.readFileSync(STATUS_FILE, 'utf-8'))

    return json({
      timestamp: statusJson.last_sync,
      status: statusJson.status,
      human_readable: formatTimestamp(statusJson.last_sync),
      target
    } as SyncStatus)
  } catch (error) {
    console.error('[AUTO-SYNC] Erro:', error)

    ensureStatusDir()
    const errorStatus = {
      last_sync: new Date().toISOString(),
      status: 'failed'
    }
    fs.writeFileSync(STATUS_FILE, JSON.stringify(errorStatus, null, 2))

    return json({
      timestamp: errorStatus.last_sync,
      status: 'failed',
      human_readable: 'Erro ao executar sync'
    } as SyncStatus, { status: 500 })
  }
}

// Alias: /api/auto-sync/status → GET
// Alias: /api/auto-sync/run → POST
export { GET as status, POST as run }
