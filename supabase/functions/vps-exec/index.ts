import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface VPSExecRequest {
  commands: string[];
  timeout_minutes?: number;
  deploy_id?: string;
  mode?: 'exec' | 'check';
}

// ───── Auth helper: só admins podem disparar deploy ─────
async function requireAdmin(req: Request): Promise<{ ok: true; userId: string } | { ok: false; response: Response }> {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return {
      ok: false,
      response: new Response(JSON.stringify({ error: 'Não autenticado' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }),
    };
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: authHeader } } },
  );

  const token = authHeader.replace('Bearer ', '');
  const { data: claimsData, error: claimsErr } = await supabase.auth.getClaims(token);
  if (claimsErr || !claimsData?.claims?.sub) {
    return {
      ok: false,
      response: new Response(JSON.stringify({ error: 'Sessão inválida' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }),
    };
  }

  const userId = claimsData.claims.sub as string;
  const { data: isAdmin, error: roleErr } = await supabase.rpc('has_role', {
    _user_id: userId,
    _role: 'admin',
  });
  if (roleErr || !isAdmin) {
    return {
      ok: false,
      response: new Response(JSON.stringify({ error: 'Acesso restrito a administradores' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }),
    };
  }
  return { ok: true, userId };
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

  // 🛡️ Bloqueio: apenas admins
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.response;

  try {
    const body: VPSExecRequest = await req.json();
    const commands = body.commands || [];

    if (!commands.length) {
      return new Response(JSON.stringify({ error: 'Nenhum comando fornecido' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Padrão GH_APP_* (refatorado a partir de GITHUB_*)
    const githubToken = Deno.env.get('GH_APP_TOKEN');
    const githubOwner = Deno.env.get('GH_APP_OWNER');
    const githubRepo = Deno.env.get('GH_APP_REPO');

    if (!githubToken || !githubOwner || !githubRepo) {
      return new Response(JSON.stringify({ error: 'Configuração GitHub incompleta' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const commandsString = commands.join('|||');
    const dispatchUrl = `https://api.github.com/repos/${githubOwner}/${githubRepo}/actions/workflows/vps-ssh-exec.yml/dispatches`;

    console.log(`[vps-exec] admin=${auth.userId} comandos=${commands.length}`);

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
        inputs: { commands: commandsString },
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
