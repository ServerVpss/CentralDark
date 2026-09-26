// ServerFn de envio de PIX no chat — gera BR Code + QR e despacha pelo WhatsApp.
// Respeita janela 24h da Meta: fora dela, retorna OUT_OF_WINDOW pro frontend
// orientar o atendente a usar template aprovado.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const Schema = z.object({
  ticketId: z.string().uuid(),
  source: z.enum(["static", "manual", "gateway"]),
  staticKeyId: z.string().uuid().optional(),
  manual: z
    .object({
      key: z.string().min(5).max(255),
      keyType: z.enum(["cpf", "cnpj", "email", "phone", "random"]),
      beneficiaryName: z.string().min(1).max(80),
      beneficiaryCity: z.string().min(1).max(40).default("SAO PAULO"),
    })
    .optional(),
  amount: z.number().min(0.01).max(1_000_000),
  description: z.string().max(140).optional(),
  // Quando true, o atendente confirmou que quer enviar mesmo fora da janela
  // via template Meta. Por enquanto retornamos NEEDS_TEMPLATE — Fase 2 implementa.
  acknowledgedOutOfWindow: z.boolean().default(false),
});

export const sendPixMessage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => Schema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    // 1. Resolve dados da chave PIX
    let key: string;
    let keyType: string;
    let beneficiaryName: string;
    let beneficiaryCity: string;

    if (data.source === "static") {
      if (!data.staticKeyId) {
        return { ok: false as const, code: "INVALID", message: "Selecione uma chave cadastrada." };
      }
      const { data: row, error } = await supabase
        .from("pix_static_keys")
        .select("*")
        .eq("id", data.staticKeyId)
        .single();
      if (error || !row) {
        return { ok: false as const, code: "NOT_FOUND", message: "Chave PIX não encontrada." };
      }
      if (!row.is_active) {
        return { ok: false as const, code: "INVALID", message: "Essa chave está desativada." };
      }
      key = row.key_value;
      keyType = row.key_type;
      beneficiaryName = row.beneficiary_name;
      beneficiaryCity = row.beneficiary_city;
    } else if (data.source === "manual") {
      if (!data.manual) {
        return { ok: false as const, code: "INVALID", message: "Preencha os dados da chave." };
      }
      key = data.manual.key;
      keyType = data.manual.keyType;
      beneficiaryName = data.manual.beneficiaryName;
      beneficiaryCity = data.manual.beneficiaryCity;
    } else {
      // Gateway externo — Fase 4
      return {
        ok: false as const,
        code: "NOT_IMPLEMENTED",
        message: "Integração com gateway externo será habilitada em breve.",
      };
    }

    // 2. Busca ticket + dados do contato e conexão (admin pra ler de qualquer lugar)
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: ticket } = await supabaseAdmin
      .from("tickets")
      .select("id, workspace_id, contact_id, connection_id, contact:contacts(phone)")
      .eq("id", data.ticketId)
      .maybeSingle();
    if (!ticket) {
      return { ok: false as const, code: "NOT_FOUND", message: "Ticket não encontrado." };
    }

    // 3. Cria registro em pix_transactions (ainda sem QR — atualiza depois)
    const txid = `TX${Date.now().toString(36).toUpperCase()}`.substring(0, 25);
    const { data: tx, error: txErr } = await supabaseAdmin
      .from("pix_transactions")
      .insert({
        workspace_id: ticket.workspace_id,
        provider: "static",
        transaction_type: "receivable",
        transaction_method: "pix_static",
        status: "PENDENTE",
        amount: data.amount,
        description: data.description ?? "Cobrança PIX",
        client_transaction_id: txid,
        contact_id: ticket.contact_id,
        connection_id: ticket.connection_id,
        created_by: userId,
        created_by_type: "agent",
        metadata: {
          source: data.source,
          static_key_id: data.staticKeyId ?? null,
          beneficiary_name: beneficiaryName,
          key_type: keyType,
        } as never,
      })
      .select("id")
      .single();
    if (txErr || !tx) {
      return { ok: false as const, code: "DB_ERROR", message: txErr?.message ?? "Erro ao criar transação." };
    }

    // 4. Gera BR Code (copia-e-cola) + QR PNG
    const { generateBrCode } = await import("@/lib/pix/brcode.server");
    const QRCode = await import("qrcode");
    const brcode = generateBrCode({
      key,
      beneficiaryName,
      beneficiaryCity,
      amount: data.amount,
      description: data.description,
      txid,
    });
    const qrBuffer = await QRCode.toBuffer(brcode, {
      type: "png",
      errorCorrectionLevel: "M",
      margin: 2,
      width: 512,
    });

    // 5. Upload do QR no storage
    const path = `${ticket.workspace_id}/${ticket.id}/pix-${tx.id}.png`;
    const { error: upErr } = await supabaseAdmin.storage
      .from("whatsapp-media")
      .upload(path, new Uint8Array(qrBuffer), { contentType: "image/png", upsert: true });
    if (upErr) {
      return { ok: false as const, code: "UPLOAD_ERROR", message: upErr.message };
    }
    const { data: pub } = supabaseAdmin.storage.from("whatsapp-media").getPublicUrl(path);
    const qrUrl = pub.publicUrl;

    // Atualiza pix_transactions com QR
    await supabaseAdmin
      .from("pix_transactions")
      .update({ qrcode_url: qrUrl, copy_paste: brcode })
      .eq("id", tx.id);

    // 6. Despacha mensagens via dispatchByTicket (já resolve janela + canal)
    const { dispatchByTicket } = await import("@/lib/whatsapp-send.server");

    const amountStr = data.amount.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

    // Primeiro: imagem do QR com legenda
    const imgResult = await dispatchByTicket(ticket.id, {
      to: (ticket.contact as { phone?: string } | null)?.phone ?? "",
      media: {
        type: "image",
        link: qrUrl,
        caption: `💸 *Cobrança PIX*\nValor: ${amountStr}\nBeneficiário: ${beneficiaryName}\n\nAponte a câmera do seu banco no QR Code ou use o código abaixo.`,
      },
    });

    if (!imgResult.ok) {
      // Marca transação como falha
      await supabaseAdmin
        .from("pix_transactions")
        .update({ status: "FALHOU", metadata: { error: imgResult.message } as never })
        .eq("id", tx.id);

      // Erro especial: fora da janela 24h → frontend mostra modal de aviso
      if (imgResult.code === "OUT_OF_WINDOW") {
        return {
          ok: false as const,
          code: "OUT_OF_WINDOW" as const,
          message: imgResult.message,
          transactionId: tx.id,
        };
      }
      return { ok: false as const, code: imgResult.code, message: imgResult.message };
    }

    // Segundo: texto copia-e-cola
    await dispatchByTicket(ticket.id, {
      to: (ticket.contact as { phone?: string } | null)?.phone ?? "",
      text: `🔑 *PIX copia e cola:*\n\n\`\`\`${brcode}\`\`\``,
    });

    return {
      ok: true as const,
      transactionId: tx.id,
      qrUrl,
      copyPaste: brcode,
      amount: data.amount,
    };
  });
