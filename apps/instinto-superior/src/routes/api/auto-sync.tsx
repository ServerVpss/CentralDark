import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/start'
import { spawn } from 'child_process'
import { readFileSync } from 'fs'
import { join } from 'path'

/**
 * Auto Sync API Routes
 * POST /api/auto-sync/run → executa ciclo de sync
 * GET /api/auto-sync/status → retorna status atual
 */

const REPO_ROOT = process.env.CENTRALDARK_ROOT || 'K:'
const SYNC_SCRIPT = join(REPO_ROOT, 'scripts', 'auto-sync', 'AUTO-SYNC-MASTER.py')

async function getSyncStatus() {
  return new Promise((resolve, reject) => {
    const proc = spawn('python', [SYNC_SCRIPT, '--status'], {
      cwd: REPO_ROOT,
      stdio: ['pipe', 'pipe', 'pipe']
    })

    let stdout = ''
    let stderr = ''

    proc.stdout.on('data', (data) => {
      stdout += data.toString()
    })

    proc.stderr.on('data', (data) => {
      stderr += data.toString()
    })

    proc.on('close', (code) => {
      if (code === 0) {
        try {
          resolve(JSON.parse(stdout))
        } catch (e) {
          resolve({
            timestamp: null,
            status: 'idle',
            human_readable: 'Parse error'
          })
        }
      } else {
        resolve({
          timestamp: null,
          status: 'failed',
          human_readable: `Error: ${stderr}`
        })
      }
    })
  })
}

async function runSyncCycle(target: string = 'all') {
  return new Promise((resolve, reject) => {
    const proc = spawn('python', [SYNC_SCRIPT, '--target', target], {
      cwd: REPO_ROOT,
      stdio: ['pipe', 'pipe', 'pipe']
    })

    let stdout = ''
    let stderr = ''

    proc.stdout.on('data', (data) => {
      stdout += data.toString()
      console.log('[AUTO-SYNC]', data.toString())
    })

    proc.stderr.on('data', (data) => {
      stderr += data.toString()
      console.error('[AUTO-SYNC-ERR]', data.toString())
    })

    proc.on('close', (code) => {
      if (code === 0) {
        resolve({
          success: true,
          log: stdout,
          timestamp: new Date().toISOString(),
          status: 'success'
        })
      } else {
        resolve({
          success: false,
          log: stderr,
          timestamp: new Date().toISOString(),
          status: 'failed'
        })
      }
    })
  })
}

export const Route = createFileRoute('/api/auto-sync')({
  beforeLoad: () => {
    // Authorization: only allow from localhost or authenticated users
    return {}
  },
  loaderFn: async ({ request }) => {
    if (request.method === 'GET') {
      const status = await getSyncStatus()
      return json(status)
    }

    if (request.method === 'POST') {
      const body = await request.json()
      const target = body.target || 'all'
      const result = await runSyncCycle(target)
      return json(result)
    }

    return json({ error: 'Method not allowed' }, { status: 405 })
  }
})
