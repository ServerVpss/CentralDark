// supabase/functions/catalog-sync/index.ts
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Iniciar sync_run
    const { data: syncRun, error: syncError } = await supabase
      .from('catalog.sync_runs')
      .insert({ status: 'running' })
      .select()
      .single()

    if (syncError) throw syncError

    // Pull tools.json do MCP público
    const toolsResponse = await fetch('https://mcp.centralldark.com/tools.json')
    if (!toolsResponse.ok) throw new Error(`HTTP ${toolsResponse.status}`)
    
    const toolsData: ToolsResponse = await toolsResponse.json()
    const tools = toolsData.tools || []
    const serverInfo = toolsData.server || { name: 'centralldark-mcp' }

    // Upsert server
    const { data: server, error: serverError } = await supabase
      .from('catalog.servers')
      .upsert({
        name: serverInfo.name,
        description: serverInfo.description || 'MCP Server CentralDark',
        version: serverInfo.version || '1.0.0',
        base_url: 'https://mcp.centralldark.com'
      }, { onConflict: 'name' })
      .select()
      .single()

    if (serverError) throw serverError

    let added = 0
    let updated = 0

    // Processar cada tool
    for (const tool of tools) {
      const existing = await supabase
        .from('catalog.tools')
        .select('id, version')
        .eq('server_id', server.id)
        .eq('name', tool.name)
        .single()

      if (existing.data) {
        if (existing.data.version !== tool.version) {
          // Versão mudou — arquivar versão anterior
          await supabase.from('catalog.tool_versions').insert({
            tool_id: existing.data.id,
            version: existing.data.version || 'unknown',
            input_schema: tool.input_schema || {},
            output_schema: tool.output_schema || {}
          })

          // Atualizar tool
          await supabase.from('catalog.tools').update({
            description: tool.description,
            input_schema: tool.input_schema || {},
            output_schema: tool.output_schema || {},
            category: tool.category,
            tags: tool.tags || [],
            version: tool.version,
            updated_at: new Date().toISOString()
          }).eq('id', existing.data.id)

          updated++
        }
      } else {
        // Nova tool
        await supabase.from('catalog.tools').insert({
          server_id: server.id,
          name: tool.name,
          description: tool.description,
          input_schema: tool.input_schema || {},
          output_schema: tool.output_schema || {},
          category: tool.category,
          tags: tool.tags || [],
          version: tool.version
        })
        added++
      }
    }

    // Finalizar sync_run
    await supabase
      .from('catalog.sync_runs')
      .update({
        status: 'completed',
        finished_at: new Date().toISOString(),
        tools_found: tools.length,
        tools_added: added,
        tools_updated: updated
      })
      .eq('id', syncRun.id)

    return new Response(JSON.stringify({
      success: true,
      tools_found: tools.length,
      tools_added: added,
      tools_updated: updated
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    })

  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    })
  }
})
