import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'GET') {
    return new Response(JSON.stringify({ status: 'ok', message: 'MisticPay webhook ativo' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get('HUB_SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('HUB_SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json();
    console.log('[misticpay-webhook] recebido:', JSON.stringify(body).slice(0, 500));

    const remoteTxid = body?.transactionId != null ? String(body.transactionId) : null;
    const statusRaw = String(body?.status || '').toUpperCase();
    const value = body?.value != null ? Number(body.value) : null;
    const e2e = body?.e2e || null;
    const payerName = body?.clientName ? String(body.clientName) : null;
    const payerDocument = body?.clientDocument ? String(body.clientDocument).replace(/\D/g, '') : null;

    const webhookEvent = { received_at: new Date().toISOString(), event: body };

    // Registrar MED/infração/chargeback sem perder histórico do pagamento aprovado
    if (body?.event === 'INFRACTION' || statusRaw.includes('INFRA') || statusRaw.includes('MED') || statusRaw.includes('CHARGEBACK')) {
      console.log('[misticpay-webhook] evento de disputa recebido');
      if (remoteTxid) {
        const { data: existingDisputeTx } = await supabase
          .from('pix_transactions')
          .select('id, raw_webhook_events')
          .eq('external_id', remoteTxid)
          .eq('gateway', 'misticpay')
          .maybeSingle();

        await supabase
          .from('pix_transactions')
          .update({
            dispute_status: String(body?.event || statusRaw || 'INFRACTION'),
            dispute_details: body,
            raw_webhook: body,
            raw_webhook_events: [
              ...(Array.isArray(existingDisputeTx?.raw_webhook_events) ? existingDisputeTx.raw_webhook_events : []),
              webhookEvent,
            ],
            updated_at: new Date().toISOString(),
          })
          .eq('external_id', remoteTxid)
          .eq('gateway', 'misticpay');
      }
      return new Response(JSON.stringify({ success: true, recorded: 'dispute_event' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (!remoteTxid) {
      return new Response(JSON.stringify({ success: false, error: 'transactionId ausente' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Só processar depósitos COMPLETOS
    if (statusRaw !== 'COMPLETO') {
      console.log(`[misticpay-webhook] status ${statusRaw} — ignorado`);
      return new Response(JSON.stringify({ success: true, status: statusRaw, action: 'noop' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Localizar transação
    let { data: transaction } = await supabase
      .from('pix_transactions')
      .select('*')
      .eq('external_id', remoteTxid)
      .eq('gateway', 'misticpay')
      .maybeSingle();

    // Fallback: buscar por valor + gateway nas últimas 24h
    if (!transaction && value != null) {
      const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { data: byValue } = await supabase
        .from('pix_transactions')
        .select('*')
        .eq('gateway', 'misticpay')
        .in('status', ['pending', 'expired'])
        .eq('amount', value)
        .gt('created_at', last24h)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (byValue) transaction = byValue;
    }

    if (!transaction) {
      console.log(`[misticpay-webhook] transação ${remoteTxid} não encontrada`);
      return new Response(JSON.stringify({ success: true, status: 'not_found', txid: remoteTxid }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (transaction.status === 'paid') {
      return new Response(JSON.stringify({ success: true, status: 'already_paid' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Marcar como paga
    await supabase
      .from('pix_transactions')
      .update({
        status: 'paid',
        paid_at: new Date().toISOString(),
        e2e_id: e2e,
        payer_name: payerName,
        payer_document: payerDocument,
        payer_info: {
          nome_confirmado: payerName,
          documento_confirmado: payerDocument,
          metodo: body?.transactionMethod || null,
          tipo: body?.transactionType || null,
        },
        gateway_fee: body?.fee != null ? Number(body.fee) : null,
        raw_webhook: body,
        raw_webhook_events: [
          ...(Array.isArray(transaction.raw_webhook_events) ? transaction.raw_webhook_events : []),
          webhookEvent,
        ],
      })
      .eq('id', transaction.id);

    // pending_payments
    const { data: pending } = await supabase
      .from('pending_payments')
      .select('*')
      .eq('txid', remoteTxid)
      .maybeSingle();

    await supabase.from('pending_payments').update({ status: 'PAID' }).eq('txid', remoteTxid);

    // Criar/atualizar assinatura
    if (transaction.telegram_user_id && transaction.bot_id) {
      const planDays = Number((pending as any)?.plan_days ?? 30);
      const planName = (pending as any)?.plan_name || transaction.description || 'Assinatura PIX';
      const planCode = (pending as any)?.plan_code || 'custom';
      const planId = (pending as any)?.plan_id || null;
      const context = (pending as any)?.context || 'group';
      const now = new Date();

      const { data: existingSub } = await supabase
        .from('telegram_subscriptions')
        .select('id, expires_at, status')
        .eq('telegram_user_id', transaction.telegram_user_id)
        .eq('bot_id', transaction.bot_id)
        .eq('context', context)
        .maybeSingle();

      const baseDate = (existingSub && existingSub.status === 'active' && new Date(existingSub.expires_at) > now)
        ? new Date(existingSub.expires_at) : now;
      const expiresAt = new Date(baseDate);
      expiresAt.setDate(expiresAt.getDate() + planDays);

      const startedAt = (existingSub && existingSub.status === 'active' && new Date(existingSub.expires_at) > now)
        ? undefined : now.toISOString();

      const subPayload: any = {
        telegram_user_id: transaction.telegram_user_id,
        bot_id: transaction.bot_id,
        context,
        plan_id: planId,
        plan_code: planCode,
        plan_name: planName,
        plan_days: planDays,
        value: transaction.amount,
        txid: remoteTxid,
        status: 'active',
        expires_at: expiresAt.toISOString(),
      };
      if (startedAt) subPayload.started_at = startedAt;

      await supabase.from('telegram_subscriptions').upsert(subPayload, {
        onConflict: 'telegram_user_id,bot_id,context',
      });

      // Comissão de indicação 5% (mesma lógica do EFI)
      try {
        const { data: tgUser } = await supabase
          .from('telegram_users')
          .select('referred_by')
          .eq('telegram_user_id', transaction.telegram_user_id)
          .eq('bot_id', transaction.bot_id)
          .maybeSingle();

        const referrerId = tgUser?.referred_by ? Number(tgUser.referred_by) : null;
        if (referrerId && referrerId !== Number(transaction.telegram_user_id)) {
          const commission = Math.round(Number(transaction.amount) * 0.05 * 100) / 100;
          const { data: existingRef } = await supabase
            .from('telegram_referrals')
            .select('id')
            .eq('source_payment_id', transaction.id)
            .maybeSingle();

          if (!existingRef && commission > 0) {
            await supabase.from('telegram_referrals').insert({
              referrer_telegram_id: referrerId,
              referred_telegram_id: transaction.telegram_user_id,
              bot_id: transaction.bot_id,
              source_payment_id: transaction.id,
              commission_amount: commission,
              commission_rate: 5.00,
              paid_status: 'pending',
            });

            const { data: refUser } = await supabase
              .from('telegram_users')
              .select('referral_balance, referral_total_earned')
              .eq('telegram_user_id', referrerId)
              .eq('bot_id', transaction.bot_id)
              .maybeSingle();

            const newBalance = Number(refUser?.referral_balance || 0) + commission;
            const newTotal = Number(refUser?.referral_total_earned || 0) + commission;

            await supabase
              .from('telegram_users')
              .update({ referral_balance: newBalance, referral_total_earned: newTotal })
              .eq('telegram_user_id', referrerId)
              .eq('bot_id', transaction.bot_id);
          }
        }
      } catch (refErr) {
        console.error('[misticpay-webhook] erro indicação:', refErr);
      }

      // Notificação Telegram (mesma estrutura do EFI)
      try {
        const { data: bot } = await supabase
          .from('telegram_bots')
          .select('token')
          .eq('id', transaction.bot_id)
          .single();

        const { data: settings } = await supabase
          .from('bot_settings')
          .select('group_chat_id, group_url, announce_payments, message_effect')
          .eq('bot_id', transaction.bot_id)
          .single();

        if (bot?.token) {
          // Deletar mensagem PIX anterior
          if ((pending as any)?.telegram_message_id && (pending as any)?.telegram_chat_id) {
            try {
              await fetch(`https://api.telegram.org/bot${bot.token}/deleteMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  chat_id: (pending as any).telegram_chat_id,
                  message_id: (pending as any).telegram_message_id,
                }),
              });
            } catch {}
          }

          const isPrivate = context === 'private';
          const contextLabel = isPrivate ? '🔒 PRIVADO (chat com o bot)' : '👥 GRUPO VIP';
          const accessLine = isPrivate
            ? `🤖 <b>Acesso liberado AQUI no privado com o bot!</b>\n\n` +
              `📍 Você comprou o plano <b>PRIVADO</b> — faça suas consultas direto nesta conversa.\n` +
              `❌ <b>Este plano NÃO dá acesso ao grupo.</b>`
            : `🚪 <b>Acesso liberado no GRUPO VIP!</b>\n\n` +
              `📍 Você comprou o plano de <b>GRUPO</b> — entre no grupo pelo botão abaixo.`;

          const esc = (s: string) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
          const dataBlock =
            `VALOR  => R$ ${Number(transaction.amount).toFixed(2)}\n` +
            `PLANO  => ${esc(planName)}\n` +
            `TIPO   => ${isPrivate ? 'PRIVADO' : 'GRUPO VIP'}\n` +
            `DIAS   => ${planDays}\n` +
            `TXID   => ${esc(remoteTxid.slice(0, 12))}...`;

          const message =
            `🎉🎊 <b>PAGAMENTO CONFIRMADO!</b> 🎊🎉\n\n` +
            `✅ Seu pagamento foi aprovado com sucesso!\n\n` +
            `<pre>${dataBlock}</pre>\n` +
            `🎯 ${esc(contextLabel)}\n\n` +
            `${accessLine}`;

          const inlineKeyboard: any = { inline_keyboard: [] };
          if (isPrivate) {
            inlineKeyboard.inline_keyboard.push([{ text: '🔍 Fazer Consulta Aqui', callback_data: 'menu:query' }]);
            inlineKeyboard.inline_keyboard.push([{ text: '🏠 Menu Principal', callback_data: 'menu:main' }]);
          } else if (settings?.group_url) {
            inlineKeyboard.inline_keyboard.push([{ text: '🚪 Entrar no Grupo VIP', url: settings.group_url }]);
          } else if (settings?.group_chat_id) {
            inlineKeyboard.inline_keyboard.push([{ text: '🚪 Entrar no Grupo VIP', callback_data: 'go_to_group' }]);
          }

          const effectMap: Record<string, string> = {
            'fire': '5104841245755180586',
            'like': '5107584321108051014',
            'heart': '5159385139981059251',
            'party': '5046509860389126442',
            'thumbs_up': '5107584321108051014',
          };
          const effectKey = (settings?.message_effect && settings.message_effect !== 'none')
            ? settings.message_effect : 'party';
          const messageEffectId = effectMap[effectKey];

          const reactionMap: Record<string, string> = {
            'fire': '🔥', 'like': '👍', 'heart': '❤️', 'party': '🎉', 'thumbs_up': '👍', 'none': '👍',
          };
          const reactionEmoji = reactionMap[effectKey] || '👍';

          const messageBody: any = {
            chat_id: transaction.telegram_user_id,
            text: message,
            parse_mode: 'HTML',
            reply_markup: inlineKeyboard.inline_keyboard.length > 0 ? inlineKeyboard : undefined,
          };
          if (messageEffectId) messageBody.message_effect_id = messageEffectId;

          let sendRes = await fetch(`https://api.telegram.org/bot${bot.token}/sendMessage`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(messageBody),
          });
          let sendData = await sendRes.json();
          if (!sendData.ok && messageEffectId) {
            delete messageBody.message_effect_id;
            sendRes = await fetch(`https://api.telegram.org/bot${bot.token}/sendMessage`, {
              method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(messageBody),
            });
            sendData = await sendRes.json();
          }

          if (sendData.ok) {
            const confMsgId = sendData.result?.message_id;
            if (confMsgId) {
              try {
                await fetch(`https://api.telegram.org/bot${bot.token}/setMessageReaction`, {
                  method: 'POST', headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    chat_id: transaction.telegram_user_id,
                    message_id: confMsgId,
                    reaction: [{ type: 'emoji', emoji: reactionEmoji }],
                    is_big: true,
                  }),
                });
              } catch {}
            }
          }

          // Liberar no grupo (se for grupo)
          if (!isPrivate && settings?.group_chat_id) {
            await fetch(`https://api.telegram.org/bot${bot.token}/restrictChatMember`, {
              method: 'POST', headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                chat_id: settings.group_chat_id,
                user_id: transaction.telegram_user_id,
                permissions: {
                  can_send_messages: true, can_send_media_messages: true, can_send_polls: true,
                  can_send_other_messages: true, can_add_web_page_previews: true,
                  can_change_info: false, can_invite_users: true, can_pin_messages: false,
                },
              }),
            });
          }

          // Anúncio no grupo
          if (settings?.announce_payments && settings?.group_chat_id) {
            try {
              const userInfoRes = await fetch(`https://api.telegram.org/bot${bot.token}/getChat`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chat_id: transaction.telegram_user_id }),
              });
              const userInfo = await userInfoRes.json();
              const userName = userInfo.result?.first_name || `Usuário ${transaction.telegram_user_id}`;
              const groupMessage = `🎉 *NOVA ASSINATURA!*\n\n👤 *${userName}* acabou de assinar!\n📋 Plano: *${planName}*\n💰 Valor: *R$ ${Number(transaction.amount).toFixed(2)}*\n\n🚀 Bem-vindo(a)! 🎊`;

              let botUsername = null;
              try {
                const meRes = await fetch(`https://api.telegram.org/bot${bot.token}/getMe`);
                botUsername = (await meRes.json()).result?.username;
              } catch {}
              const acquireButton = botUsername ? {
                inline_keyboard: [[{ text: '💎 ADQUIRIR VIP', url: `https://t.me/${botUsername}?start=planos` }]],
              } : undefined;

              await fetch(`https://api.telegram.org/bot${bot.token}/sendMessage`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  chat_id: settings.group_chat_id,
                  text: groupMessage,
                  parse_mode: 'Markdown',
                  reply_markup: acquireButton,
                }),
              });
            } catch (e) {
              console.error('[misticpay-webhook] erro anúncio:', e);
            }
          }
        }
      } catch (notifyErr) {
        console.error('[misticpay-webhook] erro notificação:', notifyErr);
      }
    }

    return new Response(JSON.stringify({ success: true, status: 'paid', txid: remoteTxid, amount: value }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error('[misticpay-webhook] erro:', error);
    return new Response(JSON.stringify({ success: false, error: String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
