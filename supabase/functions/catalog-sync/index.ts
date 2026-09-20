// supabase/functions/catalog-sync/index.ts
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'
import {
  buildObservation,
  checkpointFromRunMetadata,
  classifySourceDelta,
  conditionalHeaders,
  mergeCheckpoint,
  stableStringify,
} from '../_shared/source-delta.mjs'
import { operationalError } from '../_shared/operational-error.mjs'

interface ToolEntry {
  name: string
  description?: string
  input_schema?: Record<string, unknown>
  output_schema?: Record<string, unknown>
  category?: string
  tags?: string[]
  version?: string
}

interface ToolsResponse {
  tools: ToolEntry[]
  server?: {
    name: string
    description?: string
    version?: string
  }
}

interface SourceResult {
  source_id: string
  kind: 'mcp-tools' | 'github-release'
  status: 'NO_CHANGE' | 'DELTA_FOUND' | 'REJECTED' | 'ERROR'
  changed_fields: string[]
  absorbed: number
  dropped_duplicate: number
  rejected: number
  pending_refinery: number
  checkpoint: Record<string, unknown>
  detail?: Record<string, unknown>
  error?: Record<string, unknown>
}

const MCP_SOURCE_ID = 'mcp-tools:centraldark'
const MCP_TOOLS_URL = 'https://mcp.centralldark.com/tools.json'
const GITHUB_API_VERSION = '2026-03-10'
const GITHUB_REPO_RE = /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/

function json(status: number, body: object) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

function configuredGithubRepos(): string[] {
  return Array.from(new Set(
    String(Deno.env.get('SOURCE_GITHUB_REPOS') || '')
      .split(/[\n,;]+/)
      .map((item) => item.trim())
      .filter(Boolean)
      .filter((item) => GITHUB_REPO_RE.test(item)),
  )).sort()
}

async function loadCheckpoint(supabase: ReturnType<typeof createClient>, sourceId: string) {
  const { data, error } = await supabase
    .from('catalog.sync_runs')
    .select('metadata')
    .eq('status', 'completed')
    .order('started_at', { ascending: false })
    .limit(50)

  if (error) throw new Error(`CHECKPOINT_READ_FAILED:${error.message}`)
  for (const row of data || []) {
    const sources = row?.metadata?.source_delta?.sources
    if (Array.isArray(sources) && sources.some((item: Record<string, unknown>) => item?.source_id === sourceId)) {
      return checkpointFromRunMetadata(row.metadata, sourceId)
    }
  }
  return checkpointFromRunMetadata({}, sourceId)
}

function normalizeTool(tool: ToolEntry) {
  return {
    name: String(tool.name || '').trim(),
    description: tool.description || null,
    input_schema: tool.input_schema || {},
    output_schema: tool.output_schema || {},
    category: tool.category || null,
    tags: Array.isArray(tool.tags) ? [...tool.tags].sort() : [],
    version: tool.version || null,
  }
}

function toolChanged(existing: Record<string, unknown>, next: ReturnType<typeof normalizeTool>) {
  return stableStringify({
    version: existing.version ?? null,
    description: existing.description ?? null,
    input_schema: existing.input_schema ?? {},
    output_schema: existing.output_schema ?? {},
    category: existing.category ?? null,
    tags: Array.isArray(existing.tags) ? [...existing.tags].sort() : [],
  }) !== stableStringify({
    version: next.version,
    description: next.description,
    input_schema: next.input_schema,
    output_schema: next.output_schema,
    category: next.category,
    tags: next.tags,
  })
}

async function scanMcpTools(supabase: ReturnType<typeof createClient>): Promise<SourceResult> {
  const previous = await loadCheckpoint(supabase, MCP_SOURCE_ID)
  const response = await fetch(MCP_TOOLS_URL, {
    headers: {
      Accept: 'application/json',
      ...conditionalHeaders(previous),
    },
  })
  const observedAt = new Date().toISOString()

  if (response.status === 304) {
    const checkpoint = mergeCheckpoint(previous, previous, { absorbed: false, observedAt })
    return {
      source_id: MCP_SOURCE_ID,
      kind: 'mcp-tools',
      status: 'NO_CHANGE',
      changed_fields: [],
      absorbed: 0,
      dropped_duplicate: 1,
      rejected: 0,
      pending_refinery: 0,
      checkpoint,
      detail: { reason: 'HTTP_304' },
    }
  }
  if (!response.ok) {
    throw Object.assign(new Error(`HTTP_${response.status}`), {
      stage: 'FETCH_MCP_TOOLS',
      causeClass: `HTTP_${response.status}`,
      retryable: response.status >= 500 || response.status === 429,
      evidenceRef: { source_id: MCP_SOURCE_ID, status: response.status },
    })
  }

  const payloadText = await response.text()
  let toolsData: ToolsResponse
  try {
    toolsData = JSON.parse(payloadText) as ToolsResponse
  } catch (error) {
    throw Object.assign(new Error(`SOURCE_PAYLOAD_INVALID:${String(error)}`), {
      stage: 'PARSE_MCP_TOOLS',
      causeClass: 'INVALID_JSON',
      retryable: false,
      evidenceRef: { source_id: MCP_SOURCE_ID, status: response.status },
    })
  }

  const tools = Array.isArray(toolsData.tools) ? toolsData.tools.map(normalizeTool).filter((tool) => tool.name) : []
  const projection = [...tools].sort((a, b) => a.name.localeCompare(b.name))
  const serverInfo = toolsData.server || { name: 'centralldark-mcp' }
  const observation = await buildObservation({
    sourceId: MCP_SOURCE_ID,
    responseHeaders: response.headers,
    payloadText,
    lastRelease: serverInfo.version || null,
    capabilities: projection,
    observedAt,
  })
  const delta = classifySourceDelta(previous, observation, { httpStatus: response.status })

  if (delta.status === 'NO_CHANGE') {
    const checkpoint = mergeCheckpoint(previous, observation, { absorbed: false, observedAt })
    return {
      source_id: MCP_SOURCE_ID,
      kind: 'mcp-tools',
      status: 'NO_CHANGE',
      changed_fields: [],
      absorbed: 0,
      dropped_duplicate: 1,
      rejected: 0,
      pending_refinery: 0,
      checkpoint,
      detail: { reason: delta.reason, tools_found: tools.length },
    }
  }

  const { data: server, error: serverError } = await supabase
    .from('catalog.servers')
    .upsert({
      name: serverInfo.name,
      description: serverInfo.description || 'MCP Server CentralDark',
      version: serverInfo.version || '1.0.0',
      base_url: 'https://mcp.centralldark.com',
    }, { onConflict: 'name' })
    .select()
    .single()
  if (serverError) throw new Error(`SERVER_UPSERT_FAILED:${serverError.message}`)

  let added = 0
  let updated = 0
  for (const tool of tools) {
    const { data: existing, error: existingError } = await supabase
      .from('catalog.tools')
      .select('id, version, description, input_schema, output_schema, category, tags')
      .eq('server_id', server.id)
      .eq('name', tool.name)
      .maybeSingle()
    if (existingError) throw new Error(`TOOL_READ_FAILED:${tool.name}:${existingError.message}`)

    if (!existing) {
      const { error: insertError } = await supabase.from('catalog.tools').insert({
        server_id: server.id,
        ...tool,
      })
      if (insertError) throw new Error(`TOOL_INSERT_FAILED:${tool.name}:${insertError.message}`)
      added++
      continue
    }

    if (!toolChanged(existing, tool)) continue

    if (existing.version !== tool.version) {
      const { error: archiveError } = await supabase.from('catalog.tool_versions').insert({
        tool_id: existing.id,
        version: existing.version || 'unknown',
        input_schema: existing.input_schema || {},
        output_schema: existing.output_schema || {},
        changelog: `SOURCE_DELTA ${existing.version || 'unknown'} -> ${tool.version || 'unknown'}`,
      })
      if (archiveError) throw new Error(`TOOL_ARCHIVE_FAILED:${tool.name}:${archiveError.message}`)
    }

    const { error: updateError } = await supabase.from('catalog.tools').update({
      description: tool.description,
      input_schema: tool.input_schema,
      output_schema: tool.output_schema,
      category: tool.category,
      tags: tool.tags,
      version: tool.version,
      updated_at: observedAt,
    }).eq('id', existing.id)
    if (updateError) throw new Error(`TOOL_UPDATE_FAILED:${tool.name}:${updateError.message}`)
    updated++
  }

  const absorbed = added + updated
  const checkpoint = mergeCheckpoint(previous, observation, { absorbed: absorbed > 0, observedAt })
  return {
    source_id: MCP_SOURCE_ID,
    kind: 'mcp-tools',
    status: 'DELTA_FOUND',
    changed_fields: delta.changed_fields,
    absorbed,
    dropped_duplicate: absorbed === 0 ? 1 : 0,
    rejected: 0,
    pending_refinery: 0,
    checkpoint,
    detail: {
      reason: delta.reason,
      tools_found: tools.length,
      tools_added: added,
      tools_updated: updated,
    },
  }
}

async function scanGithubRelease(supabase: ReturnType<typeof createClient>, repo: string): Promise<SourceResult> {
  const sourceId = `github-release:${repo}`
  const previous = await loadCheckpoint(supabase, sourceId)
  const token = Deno.env.get('SOURCE_GITHUB_TOKEN') || Deno.env.get('GITHUB_TOKEN') || ''
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': GITHUB_API_VERSION,
    'User-Agent': 'CentralDark-SourceDelta',
    ...conditionalHeaders(previous),
  }
  if (token) headers.Authorization = `Bearer ${token}`

  const response = await fetch(`https://api.github.com/repos/${repo}/releases/latest`, { headers })
  const observedAt = new Date().toISOString()

  if (response.status === 304) {
    const checkpoint = mergeCheckpoint(previous, previous, { absorbed: false, observedAt })
    return {
      source_id: sourceId,
      kind: 'github-release',
      status: 'NO_CHANGE',
      changed_fields: [],
      absorbed: 0,
      dropped_duplicate: 1,
      rejected: 0,
      pending_refinery: 0,
      checkpoint,
      detail: { repo, reason: 'HTTP_304' },
    }
  }
  if (response.status === 404) {
    const checkpoint = mergeCheckpoint(previous, previous, { absorbed: false, observedAt })
    return {
      source_id: sourceId,
      kind: 'github-release',
      status: 'REJECTED',
      changed_fields: [],
      absorbed: 0,
      dropped_duplicate: 0,
      rejected: 1,
      pending_refinery: 0,
      checkpoint,
      detail: { repo, reason: 'NO_PUBLISHED_RELEASE_OR_NOT_ACCESSIBLE' },
    }
  }
  if (!response.ok) {
    throw Object.assign(new Error(`HTTP_${response.status}`), {
      stage: 'FETCH_GITHUB_RELEASE',
      causeClass: `HTTP_${response.status}`,
      retryable: response.status >= 500 || response.status === 429,
      evidenceRef: { source_id: sourceId, repo, status: response.status },
      humanBlocker: [401, 403].includes(response.status)
        ? {
            FERIDA: `fonte GitHub ${repo} sem acesso efetivo com a autorização atual`,
            ONDE: `instalação/permissão do conector ou token usado para ${repo}`,
            ACAO_HUMANA_MINIMA: 'liberar somente leitura do repositório necessário e remedir',
          }
        : null,
    })
  }

  const release = await response.json()
  const projection = {
    repo,
    id: release.id ?? null,
    tag_name: release.tag_name ?? null,
    target_commitish: release.target_commitish ?? null,
    name: release.name ?? null,
    published_at: release.published_at ?? null,
    draft: Boolean(release.draft),
    prerelease: Boolean(release.prerelease),
    html_url: release.html_url ?? null,
  }
  const payloadText = stableStringify(projection)
  const observation = await buildObservation({
    sourceId,
    responseHeaders: response.headers,
    payloadText,
    lastRelease: release.tag_name || null,
    capabilities: projection,
    observedAt,
  })
  const delta = classifySourceDelta(previous, observation, { httpStatus: response.status })
  const checkpoint = mergeCheckpoint(previous, observation, { absorbed: false, observedAt })

  if (delta.status === 'NO_CHANGE') {
    return {
      source_id: sourceId,
      kind: 'github-release',
      status: 'NO_CHANGE',
      changed_fields: [],
      absorbed: 0,
      dropped_duplicate: 1,
      rejected: 0,
      pending_refinery: 0,
      checkpoint,
      detail: { ...projection, reason: delta.reason },
    }
  }

  return {
    source_id: sourceId,
    kind: 'github-release',
    status: 'DELTA_FOUND',
    changed_fields: delta.changed_fields,
    absorbed: 0,
    dropped_duplicate: 0,
    rejected: 0,
    pending_refinery: 1,
    checkpoint,
    detail: {
      ...projection,
      reason: delta.reason,
      next_machine_action: 'REFINERY_COMPARE_OWNER_CONSUMER_COUNTERPROOF',
      source_is_authority: false,
    },
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json(405, { ok: false, error: 'method_not_allowed' })

  const URL_ = Deno.env.get('SUPABASE_URL')!
  const SRK = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const ANON = Deno.env.get('SUPABASE_ANON_KEY')!
  const authHeader = req.headers.get('Authorization') || ''
  if (!authHeader.startsWith('Bearer ')) {
    return json(401, { ok: false, error: operationalError({
      component: 'catalog-sync', owner: 'HUB/Catalogo', operation: 'source_delta_run', stage: 'AUTH_HEADER',
      causeClass: 'AUTH_REQUIRED', error: 'Authorization Bearer ausente', retryable: false,
      nextMachineAction: 'REQUEST_AUTHENTICATED_ADMIN_SESSION',
    }) })
  }

  const asUser = createClient(URL_, ANON, { global: { headers: { Authorization: authHeader } } })
  const { data: userData, error: userError } = await asUser.auth.getUser()
  const uid = userData?.user?.id
  if (userError || !uid) {
    return json(401, { ok: false, error: operationalError({
      component: 'catalog-sync', owner: 'HUB/Catalogo', operation: 'source_delta_run', stage: 'AUTH_USER',
      causeClass: 'AUTH_INVALID', error: userError || 'sessão inválida', retryable: false,
      nextMachineAction: 'REAUTHENTICATE_AND_RETRY',
    }) })
  }
  const { data: isAdmin, error: roleError } = await asUser.rpc('has_role', { _user_id: uid, _role: 'admin' })
  if (roleError || !isAdmin) {
    return json(403, { ok: false, error: operationalError({
      component: 'catalog-sync', owner: 'HUB/Catalogo', operation: 'source_delta_run', stage: 'AUTH_ROLE',
      causeClass: 'ADMIN_REQUIRED', error: roleError || 'admin obrigatório', retryable: false,
      nextMachineAction: 'STOP_NO_PRIVILEGE_ESCALATION',
    }) })
  }

  const supabase = createClient(URL_, SRK)
  let syncRunId: string | null = null
  const results: SourceResult[] = []
  const sourceErrors: Record<string, unknown>[] = []

  try {
    const { data: syncRun, error: syncError } = await supabase
      .from('catalog.sync_runs')
      .insert({ status: 'running', metadata: { trigger: 'hub-admin-source-delta', actor: uid } })
      .select()
      .single()
    if (syncError) throw new Error(`SYNC_RUN_CREATE_FAILED:${syncError.message}`)
    syncRunId = syncRun.id

    const runners: Array<() => Promise<SourceResult>> = [
      () => scanMcpTools(supabase),
      ...configuredGithubRepos().map((repo) => () => scanGithubRelease(supabase, repo)),
    ]

    // Serial por desenho: evita burst/rate-limit e preserva causalidade por fonte.
    for (const runSource of runners) {
      try {
        results.push(await runSource())
      } catch (error) {
        const dynamic = error as Error & {
          stage?: string
          causeClass?: string
          retryable?: boolean
          evidenceRef?: Record<string, unknown>
          humanBlocker?: Record<string, unknown> | null
        }
        const receipt = operationalError({
          component: 'catalog-sync',
          owner: 'HUB/Catalogo + Memory-Linker refinery',
          operation: 'source_delta_adapter',
          stage: dynamic.stage || 'SOURCE_ADAPTER',
          causeClass: dynamic.causeClass || 'SOURCE_ADAPTER_FAILED',
          evidenceRef: dynamic.evidenceRef || null,
          error: dynamic,
          retryable: Boolean(dynamic.retryable),
          autoRecoveryAttempted: false,
          nextMachineAction: dynamic.retryable ? 'RETRY_WITH_BACKOFF' : 'SURFACE_EXACT_SOURCE_WOUND',
          humanBlocker: dynamic.humanBlocker || null,
        })
        console.error(JSON.stringify(receipt))
        sourceErrors.push(receipt)
      }
    }

    const summary = {
      sources_scanned: results.length + sourceErrors.length,
      delta_found: results.filter((item) => item.status === 'DELTA_FOUND').length,
      absorbed: results.reduce((sum, item) => sum + item.absorbed, 0),
      dropped_duplicate: results.reduce((sum, item) => sum + item.dropped_duplicate, 0),
      rejected: results.reduce((sum, item) => sum + item.rejected, 0),
      pending_refinery: results.reduce((sum, item) => sum + item.pending_refinery, 0),
      errors: sourceErrors.length,
    }
    const mcpDetail = results.find((item) => item.source_id === MCP_SOURCE_ID)?.detail || {}
    const metadata = {
      source_delta: {
        source_is_provenance_not_authority: true,
        no_change_means_heavy_work_zero: true,
        sources: results.map((item) => item.checkpoint),
        results: results.map(({ checkpoint: _checkpoint, ...item }) => item),
        errors: sourceErrors,
        summary,
      },
    }
    const finalStatus = sourceErrors.length > 0 ? 'failed' : 'completed'
    const { error: finishError } = await supabase
      .from('catalog.sync_runs')
      .update({
        status: finalStatus,
        finished_at: new Date().toISOString(),
        tools_found: Number((mcpDetail as Record<string, unknown>).tools_found || 0),
        tools_added: Number((mcpDetail as Record<string, unknown>).tools_added || 0),
        tools_updated: Number((mcpDetail as Record<string, unknown>).tools_updated || 0),
        error_message: sourceErrors.length > 0 ? `${sourceErrors.length} SOURCE_DELTA adapter(s) falharam` : null,
        metadata,
      })
      .eq('id', syncRunId)
    if (finishError) throw new Error(`SYNC_RUN_FINALIZE_FAILED:${finishError.message}`)

    const body = {
      success: sourceErrors.length === 0,
      status: finalStatus,
      ...summary,
      tools_found: Number((mcpDetail as Record<string, unknown>).tools_found || 0),
      tools_added: Number((mcpDetail as Record<string, unknown>).tools_added || 0),
      tools_updated: Number((mcpDetail as Record<string, unknown>).tools_updated || 0),
      no_change: summary.delta_found === 0 && sourceErrors.length === 0,
      sources: results.map(({ checkpoint: _checkpoint, ...item }) => item),
      errors: sourceErrors,
    }
    return json(sourceErrors.length > 0 ? 500 : 200, body)
  } catch (error) {
    const receipt = operationalError({
      component: 'catalog-sync',
      owner: 'HUB/Catalogo + Memory-Linker refinery',
      operation: 'source_delta_run',
      stage: 'RUN_FINALIZATION',
      causeClass: 'SOURCE_DELTA_RUN_FAILED',
      evidenceRef: syncRunId ? { sync_run_id: syncRunId } : null,
      error,
      retryable: true,
      autoRecoveryAttempted: false,
      nextMachineAction: 'FIX_CAUSE_AND_RETRY_SAME_SOURCE_DELTA_RUN',
    })
    console.error(JSON.stringify(receipt))

    if (syncRunId) {
      const { error: persistError } = await supabase
        .from('catalog.sync_runs')
        .update({
          status: 'failed',
          finished_at: new Date().toISOString(),
          error_message: receipt.SAFE_ERROR,
          metadata: { source_delta: { results, errors: [...sourceErrors, receipt] } },
        })
        .eq('id', syncRunId)
      if (persistError) {
        console.error(JSON.stringify(operationalError({
          component: 'catalog-sync', owner: 'HUB/Catalogo', operation: 'persist_failure_receipt',
          stage: 'FAILURE_RECEIPT_WRITE', causeClass: 'AUDIT_WRITE_FAILED', evidenceRef: { sync_run_id: syncRunId },
          error: persistError, retryable: true, autoRecoveryAttempted: false,
          nextMachineAction: 'SURFACE_PRIMARY_AND_PERSISTENCE_ERROR',
        })))
      }
    }
    return json(500, { success: false, status: 'failed', error: receipt, errors: [...sourceErrors, receipt] })
  }
})
