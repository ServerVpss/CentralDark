// Monitor de Realtime no navegador (CRM /app/chat).
// Cole este snippet no Console do navegador (F12) com a aba /app/chat aberta.
// Ele escuta o canal Supabase Realtime e loga toda mensagem nova,
// mudança de ticket e status da conexão. Não envia nada — só observa.
//
// Pra parar: __mzMonitor.stop()

(async () => {
  if (window.__mzMonitor?.stop) {
    console.log('%c[mz-monitor] já estava rodando, reiniciando…', 'color:#fb0');
    window.__mzMonitor.stop();
  }

  // Pega o client Supabase já carregado pela página.
  const mod = await import('/src/integrations/supabase/client.ts').catch(() => null);
  const supabase = mod?.supabase ?? window.supabase;
  if (!supabase) {
    console.error('[mz-monitor] não achei o client supabase. Abra /app/chat antes.');
    return;
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) { console.error('[mz-monitor] sem usuário logado.'); return; }
  console.log('%c[mz-monitor] usuário', 'color:#0f0', user.email);

  // Descobre workspaces do usuário.
  const { data: members } = await supabase
    .from('workspace_members')
    .select('workspace_id')
    .eq('user_id', user.id);
  const wsIds = (members ?? []).map(m => m.workspace_id);
  if (!wsIds.length) { console.warn('[mz-monitor] usuário sem workspace.'); return; }
  console.log('%c[mz-monitor] workspaces', 'color:#0f0', wsIds);

  const channels = [];
  for (const wsId of wsIds) {
    const ch = supabase
      .channel(`mz-monitor:${wsId}`)
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'ticket_messages' },
        (p) => console.log('%c[msg INSERT]', 'color:#0ff',
          { ticket: p.new.ticket_id, from: p.new.direction, body: (p.new.body||'').slice(0,80), at: p.new.created_at })
      )
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'tickets' },
        (p) => console.log('%c[ticket UPDATE]', 'color:#fb0',
          { id: p.new.id, status: p.new.status, last: p.new.last_message_at })
      )
      .subscribe((status) => console.log('%c[mz-monitor] canal', 'color:#888', wsId, status));
    channels.push(ch);
  }

  window.__mzMonitor = {
    stop() {
      for (const c of channels) supabase.removeChannel(c);
      delete window.__mzMonitor;
      console.log('%c[mz-monitor] parado.', 'color:#fb0');
    }
  };
  console.log('%c[mz-monitor] ativo. Mande uma mensagem pra ver chegar aqui.', 'color:#0f0');
})();
