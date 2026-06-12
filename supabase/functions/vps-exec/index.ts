const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface VPSExecRequest {
  commands: string[];
  timeout_minutes?: number;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Método não permitido' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const body: VPSExecRequest = await req.json();
    const commands = body.commands || [];
    const timeout = body.timeout_minutes || 5;

    if (!commands.length) {
      return new Response(JSON.stringify({ error: 'Nenhum comando fornecido' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const githubToken = Deno.env.get('GITHUB_TOKEN');
    const githubOwner = Deno.env.get('GITHUB_OWNER');
    const githubRepo = Deno.env.get('GITHUB_REPO');

    if (!githubToken || !githubOwner || !githubRepo) {
      return new Response(JSON.stringify({ error: 'Configuração GitHub incompleta' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Junta comandos com separador |||
    const commandsString = commands.join('|||');

    const dispatchUrl = `https://api.github.com/repos/${githubOwner}/${githubRepo}/actions/workflows/vps-ssh-exec.yml/dispatches`;
    
    console.log('Disparando workflow:', dispatchUrl);
    console.log('Comandos:', commandsString);

    const response = await fetch(dispatchUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${githubToken}`,
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ref: 'main',
        inputs: {
          commands: commandsString,
        },
      }),
    });

    if (response.status === 204) {
      return new Response(JSON.stringify({
        success: true,
        message: 'Workflow disparado com sucesso',
        workflow: 'vps-ssh-exec.yml',
        commands: commands,
        check_status: `https://api.github.com/repos/${githubOwner}/${githubRepo}/actions/runs`,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const errorBody = await response.text();
    console.error('Erro GitHub API:', response.status, errorBody);

    return new Response(JSON.stringify({
      success: false,
      error: `GitHub API retornou ${response.status}`,
      details: errorBody,
    }), {
      status: response.status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erro:', error);
    return new Response(JSON.stringify({
      success: false,
      error: String(error),
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
